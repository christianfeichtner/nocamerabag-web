# Dokumentation: Bild-Overlay-Pillen (Frosted Glass Overlay Bar)

Diese Dokumentation beschreibt die einheitliche CSS-Klassenstruktur und das adaptive Layout-System für alle Bild-Overlay-Pillen (Badges, Bildunterschriften und Aktions-Buttons) auf der Website.

---

## 1. Übersicht & Design-Prinzipien

Alle Bild-Overlays nutzen ein einheitliches **Frosted-Glass-Pill-Design**:
- **Hintergrund:** Halbtransparentes Schwarz (`rgba(0, 0, 0, 0.72)`) mit `backdrop-filter: blur(10px)`
- **Rand & Schatten:** Subtiler weißer Rand (`border: 1px solid rgba(255, 255, 255, 0.20)`) und weicher Schatten
- **Einheitliche Höhe:** Schlanke, kompakte Höhe von ca. **26px** (passend zu den Teaser-Cards)
- **Typografie:** `font-size: var(--font-size-xs)` (~0.75rem / 12px), `font-weight: 500`, Textfarbe Weiß
- **Sub-Badges / Icons:** Keine verschachtelten Rahmen oder Hintergründe ("Pille-in-Pille"-Vermeidung)

---

## 2. Adaptives 3-Zustände-Layout

Der Hauptcontainer `.image-overlay-bar` passt seine Breite und Ausrichtung automatisch über moderne CSS `:has()`-Selektoren an:

| Zustand | Enthaltene Elemente | Verhalten / Ausrichtung |
| :--- | :--- | :--- |
| **Zustand 1: Vollbreite** | `.overlay-caption` **UND** `.overlay-actions` | Geht über die gesamte Bildbreite (`left: 12px; right: 12px; justify-content: space-between`) |
| **Zustand 2: Nur Text** | Nur `.overlay-caption` | Kompakte Pille, linksbündig (`width: fit-content; right: auto`) |
| **Zustand 3: Nur Badges/Aktionen** | Nur `.overlay-actions` | Kompakte Pille, rechtsbündig (`width: fit-content; left: auto; margin-left: auto`) |

---

## 3. CSS-Klassenreferenz

### 3.1 Hauptcontainer
| CSS-Klasse | Beschreibung |
| :--- | :--- |
| `.image-overlay-bar` | Der äußere absolute Container am unteren Bildrand (`bottom: 12px`). Trägt die Glas-Optik und steuert das Layout. |

### 3.2 Linker Bereich (Bildunterschrift)
| CSS-Klasse | Beschreibung |
| :--- | :--- |
| `.overlay-caption` | Flex-Container für Info-Icon und Text. Enthält automatischen Textumbruch-Schutz (`overflow: hidden; text-overflow: ellipsis; white-space: nowrap`). |
| `figcaption.overlay-caption` | Semantische Variante für `<figure>`-Elemente (z. B. Markdown-Bilder). |

### 3.3 Rechter Bereich (Aktionen & Badges)
| CSS-Klasse | Beschreibung |
| :--- | :--- |
| `.overlay-actions` | Flex-Container (`inline-flex; gap: 4px;`) am rechten Rand der Bar für alle Badges und Buttons. |
| `.overlay-badge` | Transparenter Sub-Badge für Text/Status (z. B. *"Map available"*, *"Public Urbex Tour"*, *"iPhone 15 Pro"*). |
| `.badge-flag` | Container für Länderflaggen-Emoji. Unterstützt Hover-Tooltip via `data-tooltip="Ländername"`. |
| `.action-btn` | Standardisierter quadratischer Button (22×22px) mit zentriertem SVG-Icon (z. B. Lightbox-Zoom, Pinterest, Map-Link). |

---

## 4. HTML-Struktur-Beispiele

### Beispiel A: Vollständige Pille (Text + Aktionen)
```html
<div class="image-overlay-bar">
  <!-- Linker Bereich: Bildunterschrift -->
  <figcaption class="overlay-caption">
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="16" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
    <span>Foto-Titel oder Beschreibung</span>
  </figcaption>

  <!-- Rechter Bereich: Flagge, Badges & Aktions-Buttons -->
  <div class="overlay-actions">
    <span class="badge-flag" data-tooltip="Austria" aria-label="Austria">🇦🇹</span>
    <button class="action-btn badge-lightbox lightbox-trigger" type="button" data-tooltip="View Large" aria-label="View Large">
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2">
        <polyline points="15 3 21 3 21 9"></polyline>
        <polyline points="9 21 3 21 3 15"></polyline>
        <line x1="21" y1="3" x2="14" y2="10"></line>
        <line x1="3" y1="21" x2="10" y2="14"></line>
      </svg>
    </button>
  </div>
</div>
```

### Beispiel B: Nur Bildunterschrift (Linksbündig)
```html
<div class="image-overlay-bar">
  <figcaption class="overlay-caption">
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="16" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
    <span>Alleinstehende Bildunterschrift</span>
  </figcaption>
</div>
```

### Beispiel C: Nur Badges & Aktions-Buttons (Rechtsbündig)
```html
<div class="image-overlay-bar">
  <div class="overlay-actions">
    <span class="badge-flag" data-tooltip="Germany" aria-label="Germany">🇩🇪</span>
    <span class="overlay-badge">
      <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2.2" fill="none">
        <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
      </svg>
      <span>Map available</span>
    </span>
  </div>
</div>
```

---

## 5. Hugo-Template-Verortung

Die einheitliche Pille wird in folgenden Layout-Templates verwendet:

| Template-Datei | Bereich / Verwendung |
| :--- | :--- |
| `layouts/_partials/post-card.html` | Blog-Übersichts-Cards / Teaser (Flaggen, Map Available, Urbex Tour) |
| `layouts/_partials/cover.html` | Cover-Bilder von Artikeln und Posts |
| `layouts/_partials/sections/lightbox-gallery.html` | Portfolio- / Lightbox-Galerie (Flaggen, Kamera/Modell, View Large Button) |
| `layouts/_default/iphones.html` | iPhone-/Kamera-Archiv (Bildunterschrift + Lightbox Button) |
| `layouts/_markup/render-image.html` | Markdown-Bilder in Posts (Bildunterschrift + Pinterest / Map / Lightbox) |
| `layouts/_partials/sections/image-text.html` | Image-Text Split-Sektionen (Bildunterschrift) |
| `layouts/_partials/sections/quote.html` | Zitat-Sektionen mit Hintergrundbild (Bildunterschrift) |

---

## 6. CSS-Quellcode

Die gesamte CSS-Logik ist zentral gebündelt in:
- **Datei:** `assets/css/extended/custom.css`
- **Abschnitt:** `23. Unified Image Overlay Bar & Frosted Glass Pills` (ca. Zeile 3120–3510)
