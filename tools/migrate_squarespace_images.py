#!/usr/bin/env python3
"""
tools/migrate_squarespace_images.py

Automatisierte Migration von externen Squarespace-Bilder-URLs zu lokalen Assets
in `assets/images/<kategorie>/<land>/<dateiname>.<ext>`.

Features:
- Erkennt Squarespace CDN URLs in Frontmatter und Markdown-Text.
- Ermittelt dynamisch Kategorie und Land anhand Frontmatter (Tags, Categories, Country),
  Beitragstitel und Dateinamen.
- Lädt Bilder in maximaler Auflösung (?format=2500w) herunter.
- Erzeugt saubere, URL-konforme Dateinamen (nutzt ggf. Alt-Text für generische 'image-asset'-Namen).
- Idempotent: Bereits existierende lokale Bilder werden nicht erneut heruntergeladen.
- Ersetzt externe URLs in Markdown durch '/images/<kategorie>/<land>/<dateiname>.<ext>'.
- Standardmäßig im --dry-run Modus (Vorschau). Mit --write werden Downloads und Ersetzungen ausgeführt.

Verwendung:
    python3 tools/migrate_squarespace_images.py content/blog/3-photo-spots-at-the-green-lake-in-styria-austria.md --dry-run
    python3 tools/migrate_squarespace_images.py content/blog/ --dry-run
    python3 tools/migrate_squarespace_images.py content/blog/ --write
"""

from __future__ import annotations

import argparse
import difflib
import os
import re
import sys
import unicodedata
import urllib.request
import urllib.error
from pathlib import Path
from urllib.parse import urlparse, unquote, parse_qs, urlencode, urlunparse

# Unterstützte Bild-Dateiendungen
IMAGE_EXTENSIONS = {'.jpeg', '.jpg', '.png', '.webp', '.gif', '.svg', '.avif'}

# Regex zum Finden von Squarespace-Bild-URLs (CDN / Image Assets)
# Schließt Dokumentations-/Support-Links wie support.squarespace.com explizit aus
SQUARESPACE_URL_PATTERN = re.compile(
    r'https?://(?:[a-zA-Z0-9\.\-_]*squarespace(?:-cdn)?\.com)/(?:content/v1/|[^\s"\'\)>]+\.(?:jpeg|jpg|png|webp|gif|svg|avif))[^\s"\'\)>]*'
)

# Ähnlichkeits-Schwellenwerte für bestehende lokale Bilder
MATCH_THRESHOLD = 0.75
WARNING_THRESHOLD = 0.85

# Mapping bekannter Länder (Synonyme, Bezeichnungen, Slugs)
COUNTRY_MAP: dict[str, str] = {
    # Österreich
    'austria': 'austria',
    'österreich': 'austria',
    'oesterreich': 'austria',
    'vienna': 'austria',
    'wien': 'austria',
    'linz': 'austria',
    'graz': 'austria',
    'salzburg': 'austria',
    'styria': 'austria',
    'steiermark': 'austria',
    'tirol': 'austria',
    'tyrol': 'austria',
    'carinthia': 'austria',
    'kärnten': 'austria',
    'kaernten': 'austria',
    'wachau': 'austria',
    'altaussee': 'austria',
    'burgenland': 'austria',
    'döllersheim': 'austria',
    'doellersheim': 'austria',

    # Deutschland
    'germany': 'germany',
    'deutschland': 'germany',
    'berlin': 'germany',
    'cologne': 'germany',
    'köln': 'germany',
    'koeln': 'germany',
    'leipzig': 'germany',
    'munich': 'germany',
    'münchen': 'germany',
    'muenchen': 'germany',
    'hamburg': 'germany',
    'frankfurt': 'germany',
    'potsdam': 'germany',
    'brandenburg': 'germany',
    'dresden': 'germany',
    'teufelsberg': 'germany',
    'beelitz': 'germany',
    'schoenwalde': 'germany',
    'schönwalde': 'germany',
    'rangsdorf': 'germany',
    'rügen': 'germany',
    'ruegen': 'germany',

    # Schottland / UK
    'scotland': 'scotland',
    'schottland': 'scotland',
    'edinburgh': 'scotland',
    'highlands': 'scotland',
    'skye': 'scotland',
    'england': 'england',
    'uk': 'england',
    'united kingdom': 'england',
    'london': 'england',

    # Slowakei
    'slovakia': 'slovakia',
    'slowakei': 'slovakia',
    'bratislava': 'slovakia',

    # Irland
    'ireland': 'ireland',
    'irland': 'ireland',
    'dublin': 'ireland',
    'kerry': 'ireland',

    # Ukraine
    'ukraine': 'ukraine',
    'chernobyl': 'ukraine',
    'pripyat': 'ukraine',
    'kyiv': 'ukraine',
    'kiev': 'ukraine',

    # USA
    'usa': 'usa',
    'united states': 'usa',
    'united-states': 'usa',
    'us': 'usa',
    'california': 'usa',
    'nevada': 'usa',
    'new york': 'usa',
    'ellis island': 'usa',
    'chicago': 'usa',
    'san francisco': 'usa',
    'bodie': 'usa',
    'rhyolite': 'usa',

    # Weitere Länder
    'estonia': 'estonia',
    'estland': 'estonia',
    'tallinn': 'estonia',
    'poland': 'poland',
    'polen': 'poland',
    'krakow': 'poland',
    'warsaw': 'poland',
    'portugal': 'portugal',
    'lisbon': 'portugal',
    'lissabon': 'portugal',
    'porto': 'portugal',
    'almada': 'portugal',
    'romania': 'romania',
    'rumänien': 'romania',
    'rumaenien': 'romania',
    'bucharest': 'romania',
    'albania': 'albania',
    'albanien': 'albania',
    'belarus': 'belarus',
    'czech republic': 'czech-republic',
    'czech': 'czech-republic',
    'tschechien': 'czech-republic',
    'prague': 'czech-republic',
    'finland': 'finland',
    'finnland': 'finland',
    'helsinki': 'finland',
    'hungary': 'hungary',
    'ungarn': 'hungary',
    'budapest': 'hungary',
    'iceland': 'iceland',
    'island': 'iceland',
    'italy': 'italy',
    'italien': 'italy',
    'rome': 'italy',
    'venice': 'italy',
    'france': 'france',
    'frankreich': 'france',
    'paris': 'france',
    'spain': 'spain',
    'spanien': 'spain',
    'croatia': 'croatia',
    'kroatien': 'croatia',
    'switzerland': 'switzerland',
    'schweiz': 'switzerland',
    'netherlands': 'netherlands',
    'niederlande': 'netherlands',
    'amsterdam': 'netherlands',
    'belgium': 'belgium',
    'belgien': 'belgium',
    'norway': 'norway',
    'norwegen': 'norway',
    'sweden': 'sweden',
    'schweden': 'sweden',
    'greece': 'greece',
    'griechenland': 'greece',
    'maldives': 'maldives',
    'malediven': 'maldives',
    'egypt': 'egypt',
    'israel': 'israel',
}


def slugify(text: str) -> str:
    """
    Erzeugt einen sauberen, URL- und Dateisystem-konformen Slug aus einem Text.
    """
    text = unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode('ascii')
    text = text.lower()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    text = re.sub(r'-+', '-', text).strip('-')
    return text


def clean_image_extension(ext: str) -> str:
    """
    Normalisiert die Bild-Dateiendung.
    """
    ext = ext.lower()
    if ext == '.jpg':
        return '.jpeg'
    if ext in IMAGE_EXTENSIONS:
        return ext
    return '.jpeg'


def parse_frontmatter(content: str) -> dict:
    """
    Parst YAML-Frontmatter einer Markdown-Datei ohne externe Abhängigkeiten.
    """
    res: dict = {}
    m = re.match(r'^---\s*\n(.*?)\n---', content, re.DOTALL)
    if not m:
        return res
    fm = m.group(1)
    current_key = None
    for line in fm.split('\n'):
        line_stripped = line.strip()
        if not line_stripped or line_stripped.startswith('#'):
            continue
        key_m = re.match(r'^([a-zA-Z0-9_-]+):\s*(.*)$', line)
        if key_m:
            k, v = key_m.group(1), key_m.group(2).strip()
            current_key = k
            if v == '':
                res[k] = []
            elif v.startswith('[') and v.endswith(']'):
                res[k] = [x.strip(' "\'') for x in v[1:-1].split(',') if x.strip()]
            else:
                res[k] = v.strip(' "\'')
        elif current_key and line_stripped.startswith('- '):
            val = line_stripped[2:].strip(' "\'')
            if isinstance(res.get(current_key), list):
                res[current_key].append(val)
            else:
                res[current_key] = [val]
    return res


def determine_category_and_country(file_path: Path, content: str) -> tuple[str, str]:
    """
    Ermittelt die Kategorie und das Land für einen Beitrag.
    """
    fm = parse_frontmatter(content)
    tags_raw = fm.get('tags', [])
    tags = [t.lower() for t in (tags_raw if isinstance(tags_raw, list) else [tags_raw])]
    cats_raw = fm.get('categories', [])
    cats = [c.lower() for c in (cats_raw if isinstance(cats_raw, list) else [cats_raw])]
    country_field = str(fm.get('country', '')).lower().strip()
    title = str(fm.get('title', '')).lower()
    slug = str(fm.get('slug', '')).lower() or file_path.stem.lower()
    all_terms = set(tags + cats)
    path_str = file_path.as_posix().lower()

    # 1. Kategorie bestimmen
    category = 'misc'
    if any(t in all_terms for t in ['lost places', 'lost-places', 'urban exploration', 'urbex tour', 'ghost town', 'abandoned', 'lost places tour']) or 'lost-places' in path_str:
        category = 'lost-places'
    elif any(t in all_terms for t in ['cityscapes', 'cityscape']) or 'cityscapes' in path_str:
        category = 'cityscapes'
    elif any(t in all_terms for t in ['landscapes', 'landscape', 'waterfalls', 'nature']) or 'landscapes' in path_str:
        category = 'landscapes'
    elif any(t in all_terms for t in ['concert', 'concerts']) or 'concert' in path_str:
        category = 'concert'
    elif any(t in all_terms for t in ['shot on film', 'film photography']) or 'shot-on-film' in path_str:
        category = 'shot-on-film'
    elif any(t in all_terms for t in ['review', 'reviews']):
        category = 'reviews'
    elif any(t in all_terms for t in ['tutorials', 'tutorial', 'workflow', 'composition techniques', 'photography techniques']):
        category = 'tutorials'
    elif 'traveling light' in cats or 'travel accessories' in tags or 'packing and carrying' in tags or 'traveling-light' in path_str:
        category = 'traveling-light'
    elif 'iphone photography' in cats or 'camera apps' in tags or 'photo editing apps' in tags or 'ios' in tags or 'iphone-photography' in path_str:
        category = 'iphone-photography'
    elif 'portfolio' in path_str:
        category = 'portfolio'

    # 2. Land bestimmen
    detected_country = None
    if country_field and country_field in COUNTRY_MAP:
        detected_country = COUNTRY_MAP[country_field]

    if not detected_country:
        for t in tags + cats:
            if t in COUNTRY_MAP:
                detected_country = COUNTRY_MAP[t]
                break

    if not detected_country:
        for city, country in COUNTRY_MAP.items():
            if city in tags or city in slug or city in title:
                detected_country = country
                break

    if not detected_country:
        detected_country = 'general'

    return category, detected_country


def get_image_stem(filename_or_path: str) -> str:
    """
    Extrahiert den bereinigten Bild-Namen (ohne Erweiterung) für den Vergleich.
    """
    path = Path(filename_or_path)
    stem = path.stem.lower()
    while Path(stem).suffix.lower() in IMAGE_EXTENSIONS:
        stem = Path(stem).stem
    return stem


def scan_local_images(assets_dir: Path) -> list[tuple[str, str, str]]:
    """
    Scanned das assets-Verzeichnis rekursiv nach bereits existierenden Bilddateien.
    Gibt eine Liste von Tupeln zurück:
    (relativer_pfad_ab_root, dateiname, clean_stem)
    Beispiel: ('/images/cityscapes/germany/foto.jpeg', 'foto.jpeg', 'foto')
    """
    local_images = []
    if not assets_dir.exists():
        return local_images

    for file_path in sorted(assets_dir.rglob('*')):
        if file_path.is_file() and file_path.suffix.lower() in IMAGE_EXTENSIONS:
            try:
                rel_from_assets = file_path.relative_to(assets_dir).as_posix()
            except ValueError:
                rel_from_assets = file_path.name

            # Normalisierter Pfad mit führendem Slash: /images/...
            if not rel_from_assets.startswith("images/"):
                web_path = f"/images/{rel_from_assets}"
            else:
                web_path = f"/{rel_from_assets}"

            stem = get_image_stem(file_path.name)
            local_images.append((web_path, file_path.name, stem))

    return local_images


def find_existing_local_match(url: str, local_images: list[tuple[str, str, str]]) -> tuple[str | None, float]:
    """
    Prüft, ob für eine URL bereits ein hochgradig passendes Bild in assets/ vorhanden ist.
    """
    parsed = urlparse(url)
    clean_path = unquote(parsed.path)
    filename = os.path.basename(clean_path)
    url_stem = get_image_stem(filename)

    # Bei generischem 'image-asset' können wir nicht rein über den URL-Stem matchen
    if url_stem in {'image-asset', 'image', 'asset', 'img'}:
        return None, 0.0

    best_match = None
    best_score = 0.0

    for web_path, _, local_stem in local_images:
        score = difflib.SequenceMatcher(None, url_stem, local_stem).ratio()
        if score > best_score:
            best_score = score
            best_match = web_path

    if best_score >= MATCH_THRESHOLD:
        return best_match, best_score
    return None, best_score


def generate_clean_filename(url: str, alt_text: str | None, post_slug: str, existing_names: set[str]) -> str:
    """
    Generiert einen sauberen, lesbaren und eindeutigen Dateinamen.
    """
    parsed = urlparse(url)
    raw_filename = unquote(os.path.basename(parsed.path))
    ext = clean_image_extension(Path(raw_filename).suffix)
    raw_stem = get_image_stem(raw_filename)

    # Falls der URL-Dateiname generisch ist (z.B. image-asset), nutzen wir den Alt-Text oder Beitrags-Slug
    if not raw_stem or raw_stem in {'image-asset', 'image', 'asset', 'img'}:
        if alt_text and len(alt_text.strip()) > 3:
            base_name = slugify(alt_text[:60])
        else:
            base_name = slugify(post_slug[:50])
    else:
        # Säubere bestehenden Dateinamen (entferne Squarespace-Präfixe wie 1645391606263-...)
        clean_stem = re.sub(r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-?', '', raw_stem)
        clean_stem = re.sub(r'^\d{10,14}-[a-z0-9]+-?', '', clean_stem)
        base_name = slugify(clean_stem if clean_stem else raw_stem)

    if not base_name:
        base_name = "image"

    # Eindeutigkeit sicherstellen
    candidate = f"{base_name}{ext}"
    counter = 2
    while candidate in existing_names:
        candidate = f"{base_name}-{counter}{ext}"
        counter += 1

    existing_names.add(candidate)
    return candidate


def build_max_quality_url(url: str) -> str:
    """
    Erstellt die URL für den Download in maximaler Auflösung (?format=2500w).
    """
    parsed = urlparse(url)
    # Baue URL mit ?format=2500w
    qs = parse_qs(parsed.query)
    qs['format'] = ['2500w']
    new_query = urlencode(qs, doseq=True)
    return urlunparse((parsed.scheme or 'https', parsed.netloc, parsed.path, parsed.params, new_query, ''))


def detect_real_extension(data: bytes, fallback_ext: str) -> str:
    """
    Erkennt das reale Bildformat anhand der Magic Bytes.
    """
    if len(data) >= 8:
        if data.startswith(b'\xff\xd8\xff'):
            return '.jpeg'
        elif data.startswith(b'\x89PNG\r\n\x1a\n'):
            return '.png'
        elif data.startswith(b'GIF87a') or data.startswith(b'GIF89a'):
            return '.gif'
        elif data.startswith(b'RIFF') and data[8:12] == b'WEBP':
            return '.webp'
        elif data.startswith(b'<svg') or b'<svg' in data[:64]:
            return '.svg'
        elif b'ftypavif' in data[:32] or b'ftypmif1' in data[:32]:
            return '.avif'
    return fallback_ext


def download_image(url: str, dest_path: Path) -> tuple[bool, Path]:
    """
    Lädt das Bild von der URL herunter und speichert es in dest_path.
    Passt bei Bedarf die Dateiendung an das tatsächliche Bildformat an.
    Gibt (success, actual_dest_path) zurück.
    """
    dest_path.parent.mkdir(parents=True, exist_ok=True)
    high_res_url = build_max_quality_url(url)

    req = urllib.request.Request(
        high_res_url,
        headers={
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': '*/*',
        }
    )

    try:
        with urllib.request.urlopen(req, timeout=20) as response:
            if response.status == 200:
                data = response.read()
                real_ext = detect_real_extension(data, dest_path.suffix)
                if real_ext != dest_path.suffix:
                    dest_path = dest_path.with_suffix(real_ext)
                dest_path.write_bytes(data)
                return True, dest_path
            else:
                print(f"⚠️ HTTP {response.status} beim Download von {high_res_url}", file=sys.stderr)
                return False, dest_path
    except Exception as e:
        # Fallback auf Original-URL ohne Query-Params
        try:
            fallback_url = url.split('?')[0]
            req_fb = urllib.request.Request(
                fallback_url,
                headers={
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
                    'Accept': '*/*',
                }
            )
            with urllib.request.urlopen(req_fb, timeout=20) as response:
                if response.status == 200:
                    data = response.read()
                    real_ext = detect_real_extension(data, dest_path.suffix)
                    if real_ext != dest_path.suffix:
                        dest_path = dest_path.with_suffix(real_ext)
                    dest_path.write_bytes(data)
                    return True, dest_path
        except Exception as fb_err:
            print(f"❌ Download fehlgeschlagen für {url}: {e} (Fallback: {fb_err})", file=sys.stderr)
            return False, dest_path
    return False, dest_path


def process_markdown_file(
    file_path: Path,
    assets_dir: Path,
    local_images: list[tuple[str, str, str]],
    write: bool = False
) -> dict:
    """
    Verarbeitet eine einzelne Markdown-Datei:
    1. Findet alle Squarespace-URLs und deren Kontext (Alt-Text / Frontmatter).
    2. Prüft lokale Existenz oder generiert Zielpfad in assets/images/<kategorie>/<land>/.
    3. Lädt fehlende Bilder herunter (bei write=True).
    4. Ersetzt URLs im Markdown durch den Pfad '/images/<kategorie>/<land>/<dateiname>.<ext>'.
    """
    try:
        content = file_path.read_text(encoding='utf-8')
    except Exception as e:
        print(f"❌ Fehler beim Lesen von {file_path}: {e}", file=sys.stderr)
        return {'file': file_path, 'results': [], 'replaced': 0, 'errors': 1}

    category, country = determine_category_and_country(file_path, content)
    post_slug = file_path.stem

    # Finde alle Markdown-Bilder mit Alt-Text: ![alt](url)
    md_img_matches = re.findall(r'!\[(.*?)\]\((https?://(?:[a-zA-Z0-9\.\-_]*squarespace(?:-cdn)?\.com)/[^\s"\'\)>]+)\)', content)
    url_to_alt = {u: alt for alt, u in md_img_matches}

    # Finde alle einzigartigen Squarespace-URLs in der gesamten Datei
    all_sq_urls = list(dict.fromkeys(SQUARESPACE_URL_PATTERN.findall(content)))

    file_results = []
    replacements: dict[str, str] = {}
    used_filenames_in_target: set[str] = set()

    target_dir = assets_dir / "images" / category / country

    for url in all_sq_urls:
        alt_text = url_to_alt.get(url, '')

        # 1. Prüfe, ob es bereits ein passendes Bild in assets/ gibt
        match_path, score = find_existing_local_match(url, local_images)

        if match_path:
            target_web_path = match_path
            status = f"✅ Bereits lokal vorhanden ({score*100:.0f}%)"
            action = "SKIP_DOWNLOAD"
        else:
            # 2. Generiere sauberen Dateinamen
            filename = generate_clean_filename(url, alt_text, post_slug, used_filenames_in_target)
            target_web_path = f"/images/{category}/{country}/{filename}"
            local_target_file = assets_dir / "images" / category / country / filename

            if local_target_file.exists():
                status = "✅ Datei existiert bereits auf Disk"
                action = "SKIP_DOWNLOAD"
            else:
                if write:
                    success, actual_dest_file = download_image(url, local_target_file)
                    if success:
                        target_web_path = f"/images/{category}/{country}/{actual_dest_file.name}"
                        status = "⬇️ Neu heruntergeladen"
                        action = "DOWNLOADED"
                    else:
                        status = "❌ Download fehlgeschlagen"
                        action = "ERROR"
                else:
                    status = "📥 Wird heruntergeladen"
                    action = "WILL_DOWNLOAD"

        file_results.append({
            'url': url,
            'category': category,
            'country': country,
            'target': target_web_path,
            'status': status,
            'action': action
        })

        if action in {"SKIP_DOWNLOAD", "DOWNLOADED", "WILL_DOWNLOAD"}:
            replacements[url] = target_web_path

    replaced_count = 0
    if write and replacements:
        new_content = content
        for url, local_path in replacements.items():
            new_content = new_content.replace(url, local_path)
            replaced_count += 1
        file_path.write_text(new_content, encoding='utf-8')

    return {
        'file': file_path,
        'category': category,
        'country': country,
        'results': file_results,
        'replaced': replaced_count if write else len(replacements),
        'errors': sum(1 for r in file_results if r['action'] == 'ERROR')
    }


def print_report(all_results: list[dict], write_mode: bool):
    """
    Gibt einen übersichtlichen tabellarischen Migrationsbericht im Terminal aus.
    """
    total_files = len(all_results)
    files_with_urls = [r for r in all_results if r['results']]
    total_urls = sum(len(r['results']) for r in files_with_urls)
    total_downloaded = sum(sum(1 for x in r['results'] if x['action'] == 'DOWNLOADED') for r in files_with_urls)
    total_skipped = sum(sum(1 for x in r['results'] if x['action'] == 'SKIP_DOWNLOAD') for r in files_with_urls)
    total_will_download = sum(sum(1 for x in r['results'] if x['action'] == 'WILL_DOWNLOAD') for r in files_with_urls)
    total_errors = sum(r['errors'] for r in all_results)

    mode_title = "WRITE MODE (Dateien aktualisiert & Bilder heruntergeladen)" if write_mode else "DRY RUN (Vorschau - Keine Änderungen)"
    print("\n" + "=" * 140)
    print(f" MIGRATION REPORT: {mode_title}")
    print("=" * 140)

    for item in files_with_urls:
        fpath = item['file']
        cat = item['category']
        country = item['country']
        results = item['results']

        print(f"\n📄 {fpath}  [{cat} / {country}]")
        print("-" * 140)
        print(f"{'Externe Squarespace URL':<65} -> {'Neuer lokaler Pfad':<52} {'Status'}")
        print("-" * 140)

        for res in results:
            url_disp = res['url'] if len(res['url']) <= 63 else res['url'][:60] + "..."
            target_disp = res['target'] if len(res['target']) <= 50 else "..." + res['target'][-47:]
            print(f"{url_disp:<65} -> {target_disp:<52} {res['status']}")

    print("\n" + "=" * 140)
    print("ZUSAMMENFASSUNG:")
    print(f"  Verarbeitete Markdown-Dateien: {total_files}")
    print(f"  Dateien mit Squarespace-URLs:   {len(files_with_urls)}")
    print(f"  Gefundene Bild-URLs gesamt:    {total_urls}")
    if write_mode:
        print(f"  Erfolgreich heruntergeladen:   {total_downloaded}")
        print(f"  Bereits vorhanden (überspr.): {total_skipped}")
        print(f"  Fehler beim Download:          {total_errors}")
        print(f"  Markdown-Links aktualisiert:   {sum(r['replaced'] for r in files_with_urls)}")
    else:
        print(f"  Bereits lokal vorhanden:       {total_skipped}")
        print(f"  Würden heruntergeladen werden: {total_will_download}")
        print(f"  Modus: DRY RUN (Nutze --write zum Ausführen)")
    print("=" * 140 + "\n")


def main():
    parser = argparse.ArgumentParser(
        description="Migriert Squarespace-Bilder automatisiert in lokale Assets (assets/images/<kat>/<land>/)."
    )
    parser.add_argument(
        "target",
        nargs="?",
        default="content/blog/",
        help="Pfad zu einer Markdown-Datei oder einem Ordner (Standard: 'content/blog/')."
    )
    mode_group = parser.add_mutually_exclusive_group()
    mode_group.add_argument(
        "--dry-run",
        action="store_true",
        default=True,
        help="Standard: Zeigt Vorschau der Pfade und Aktionen, verändert nichts."
    )
    mode_group.add_argument(
        "--write",
        action="store_true",
        help="Lädt Bilder herunter und ersetzt Pfade in den Markdown-Dateien."
    )
    parser.add_argument(
        "--assets-dir",
        default="assets",
        help="Pfad zum Assets-Ordner (Standard: 'assets')."
    )

    args = parser.parse_args()
    write_mode = bool(args.write)

    target_path = Path(args.target)
    assets_path = Path(args.assets_dir)

    if not target_path.exists():
        print(f"❌ Fehler: Ziel '{target_path}' existiert nicht.", file=sys.stderr)
        sys.exit(1)

    if not assets_path.exists():
        script_dir = Path(__file__).resolve().parent.parent
        if (script_dir / "assets").exists():
            assets_path = script_dir / "assets"
        else:
            print(f"❌ Fehler: Assets-Ordner '{assets_path}' nicht gefunden.", file=sys.stderr)
            sys.exit(1)

    print(f"🔍 Scanne bereits vorhandene Bilder in {assets_path} ...")
    local_images = scan_local_images(assets_path)
    print(f"   {len(local_images)} bestehende lokale Bilder geladen.")

    markdown_files = []
    if target_path.is_file():
        if target_path.suffix.lower() == '.md':
            markdown_files.append(target_path)
        else:
            print(f"❌ Fehler: '{target_path}' ist keine .md Datei.", file=sys.stderr)
            sys.exit(1)
    elif target_path.is_dir():
        markdown_files = sorted(target_path.rglob('*.md'))

    if not markdown_files:
        print(f"⚠️ Keine Markdown-Dateien in '{target_path}' gefunden.")
        sys.exit(0)

    print(f"📝 Verarbeite {len(markdown_files)} Markdown-Datei(en) im {'WRITE' if write_mode else 'DRY-RUN'} Modus...")

    all_results = []
    for md_file in markdown_files:
        res = process_markdown_file(md_file, assets_path, local_images, write=write_mode)
        all_results.append(res)

    print_report(all_results, write_mode=write_mode)


if __name__ == "__main__":
    main()
