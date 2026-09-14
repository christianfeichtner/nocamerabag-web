# AGENT.md – Projekt-Richtlinien für nocamerabag.com

## 1. Tech-Stack & Architektur
- **Framework:** Hugo v0.165+ (Static Site Generator im Docker-Container)
- **Repo / Versionskontrolle:** Git & GitHub (`main` Branch)
- **Hosting / Deployments:** Cloudflare Pages / Static Hosting

---

## 2. Ordnerstruktur & Inhaltsbereiche
- **Blog-Artikel:** `content/blog/`
- **Portfolio-Seiten:** `content/portfolio/`
- **Statische Seiten:** `content/contact.md`, `layouts/404.html`
- **Redirects:** `static/_redirects`

---

## 3. Hugo Layout-Konventionen & Standards
- **Verzeichnisstruktur (Zwang zu führendem Unterstrich):** Es werden **ausschließlich** Ordner mit führendem Unterstrich verwendet:
  - `layouts/_partials/` (niemals `layouts/partials/`)
  - `layouts/_shortcodes/` (niemals `layouts/shortcodes/`)
  - `layouts/_default/`
  - `layouts/_markup/`
- **Keine Legacy-Ordner:** Es dürfen weder im Root (`layouts/`) noch im Theme (`themes/papermod/layouts/`) Ordner ohne Unterstrich (`partials/`, `shortcodes/`) angelegt oder wiederhergestellt werden.
- **Header & Footer Overrides:** Custom Header und Footer liegen immer in `layouts/_partials/header.html` und `layouts/_partials/footer.html`.
- **Template-Prüfungen (Page Builder):** Bei dynamischen Partials (z. B. in `theme-page.html`, `builder.html`, `index.html`) muss die Existenzprüfung immer `_partials/` berücksichtigen:
  ```go
  {{- if or (templates.Exists (printf "_partials/%s" $partialPath)) (templates.Exists (printf "partials/%s" $partialPath)) }}
  ```

---

## 4. Bild-Management & Pfade
- **Strukturierung nach Themen/Kategorien:**
  - Reise- / Cityscape-Bilder: unter Länder-Ordnern (z. B. `images/cityscapes/...`)
  - Tutorial-Bilder: flach in `images/tutorials/`
  - Review-Bilder: flach in `images/reviews/`
- **Leere Ordner:** Verwaiste Unterordner nach Bildverschiebungen bereinigen, aber bestehende Pfade aktiver Posts nicht beschädigen.

---

## 5. Markdown- & Bildtitel-Konventionen (Captions)
- **Syntax:** `![Alt-Text](pfad/zum/bild.jpg "Bildtitel.")`
- **Keine spitzen Klammern:** Niemals `< >` um Bildpfade im Markdown setzen.
- **Satz-Stil für Bildtitel:**
  - Jeder Bildtitel muss ein vollständiger, grammatikalisch korrekter Satz mit Punkt am Ende sein.
  - Formulierungslogik: Gedankliche Fortführung von *"Auf diesem Bild siehst du ..."*.
  - Keine Trennzeichen wie Bindestriche (`-`), Doppelpunkte (`:`) oder Aufzählungszeichen im Title-Attribut.
- **Bestehende Titel:** Manuell gesetzte Bildtitel nicht überschreiben.

---

## 6. Template- & Render-Regeln
- **HTML in Captions:** Bildunterschriften in Lightboxen und Galerie-Grids müssen mit `| safeHTML` gerendert werden, um Link-Tags (`<a href="...">`) klickbar darzustellen.
- **Teaser vs. Single Posts:**
  - Blog-Listen & Übersichten (`list.html`, Cards/Teaser) zeigen das Cover-/Teaser-Bild.
  - Detailansichten (`single.html`) rendern oben kein automatisches Hero-Bild, sondern beginnen direkt mit dem Content.
- **Design-Konsistenz:** Eigene Styles und Abstände immer über bestehende CSS-Variablen einbinden.

---

## 7. Weiterleitungen (Redirects)
- **Format:** In `static/_redirects` gilt strikt die Syntax:
  ```text
  /alte-url /neue-url 301
  ```
- Keine Squarespace-Pfeile (`->`) oder YAML-Konstrukte in `static/_redirects` verwenden.

---

## 8. CSS- & Styling-Regeln

### Farben (Color Tokens)
- **Farbvariablen-Zwang:** In allen Stylesheets (z. B. `assets/css/custom.css`) dürfen **niemals feste Hex-, RGB- oder HSL-Farbcodes** direkt verwendet werden. Alle Farben müssen über definierte Variablen deklariert werden (z. B. `color: var(--color-black);`).
- **Primäre Farbvariablen (Global):**
  ```css
  --color-white: #ffffff;
  --color-black: #011c3d;
  --color-dark-accent: #034873;
  --color-accent: #0077b6;
  --color-light-accent: #eef5f9;
  ```
- **Ausnahme – Callout-Farbvariablen (nur für Callout-Komponenten/Shortcodes):**
  ```css
  /* Warning Callouts */
  --color-warning-bg: #fffbeb;
  --color-warning-border: #fef3c7;
  --color-warning-accent: #d97706;
  --color-warning-title: #b45309;
  --color-warning-text: #78350f;

  /* Info Callouts */
  --color-info-bg: var(--color-light-accent);
  --color-info-border: #cde5f4;
  --color-info-accent: var(--color-accent);
  --color-info-title: var(--color-dark-accent);
  --color-info-text: var(--color-black);
  ```

### Typografie (Font Size Tokens)
- **Schriftgrößen-Zwang:** Schriftgrößen dürfen **niemals mit festen Werten** (wie `px`, `em`, `rem`) direkt im CSS deklariert werden. Es müssen zwingend die folgenden Variablen genutzt werden (z. B. `font-size: var(--font-size-md);`):
  ```css
  /* Typography Scale */
  --font-size-base: 1rem;
  --font-size-xs: calc(var(--font-size-base) * 0.8);
  --font-size-sm: calc(var(--font-size-base) * 0.9);
  --font-size-md: var(--font-size-base);
  --font-size-lg: calc(var(--font-size-base) * 1.25);
  --font-size-h3: calc(var(--font-size-base) * 1.5);
  --font-size-h2: calc(var(--font-size-base) * 2);
  --font-size-h1: calc(var(--font-size-base) * 2.5);
  ```

---

## 9. Language & Content Rules
- **Communication vs. Output:**
  - Respond to instructions and conversation in the language used by the user (German).
  - **All generated website content, UI labels, button texts, dummy text, image captions, alt texts, and code examples MUST be strictly in English.**
  - Never generate German placeholders or German UI copy (e.g., use "Open Map View", "Read more", "Published in", "Photo Spots" instead of German equivalents), unless explicitly requested by the user.

---

## 10. Data Files & Data Sources (`data/`)
- **Ablageort:** Strukturierte Metadaten, Lookups und UI-Zuordnungen liegen ausschließlich als YAML-Dateien im Verzeichnis `data/`.
- **Datenzugriff in Templates:**
  - Zugriff in Shortcodes (`layouts/_shortcodes/`) und Partials (`layouts/_partials/`) erfolgt immer über `hugo.Data.<dateiname>`:
    ```go
    {{ $data := index hugo.Data "dateiname" }}
    ```
- **Definierte Datenquellen:**
  - `data/flags.yaml`: Zuordnung von Ländercodes/Namen zu Flaggen-Icons bzw. Emojis für Badges und Pills.
  - `data/affiliates.yaml`: Zentrale Datenbank aller Partner-Links, URLs und Standard-Labels.
- **Content-Konvention:** In Markdown oder Templates werden ausschließlich die Keys/IDs aus diesen Dateien referenziert, niemals Rohdaten (wie Inline-SVGs oder Ziel-URLs) direkt im Content.
