# Bericht: Analyse von fehlenden und externen Bildern (Broken Images)

**Datum:** 7. September 2026  
**Projekt:** nocamerabag.com  
**Status:** Problem 2 (Blog-Bilder & Hero-Layout) behoben | Restliche Befunde dokumentiert  

---

## 1. Übersicht & Zusammenfassung

Im Rahmen der Projektprüfung wurden alle Markdown-Dateien (`content/`), Datenquellen (`data/`), Layout-Templates (`layouts/`) sowie Asset-Verzeichnisse (`assets/` und `static/`) auf defekte (404), fehlende und noch extern verlinkte Bilder untersucht.

### Status der Befunde:
1. **15 fehlende Bilder (404 Broken Images)** in `data/iphones.yaml` unter `/images/timeline/...` (Verzeichnis existiert nicht lokal) -> **Offen**.
2. **8 verbliebene externe Squarespace-CDN-Bilder** in 7 Blog-Artikeln (`content/blog/`) -> **✅ Behoben & auf lokale Assets migriert**.
3. **1 hardcodierte Squarespace-CDN-URL** im Startseiten-Hero-Layout (`layouts/_partials/home/hero.html`) -> **✅ Behoben & auf lokales Asset umgestellt**.
4. **0 fehlerhafte Bildpfade** in den Frontmatter-Parametern der regulären Seiten.

---

## 2. Detaillierte Befunde & Behebungsstatus

### A. Nicht existierende Bilddateien (404 Broken Images in `data/iphones.yaml`) – [OFFEN]

In der Datenquelle `data/iphones.yaml` sind für die iPhone-Historie Bildpfade unter `/images/timeline/...` deklariert. Weder der Ordner `timeline` noch die entsprechenden Bilddateien existieren in `assets/images/` oder `static/images/`.

| iPhone-Modell | Referenzierter Pfad | Status / Problem |
| :--- | :--- | :--- |
| **iPhone 4s** | `/images/timeline/iphone-4s-1.webp`<br>`/images/timeline/iphone-4s-2.webp`<br>`/images/timeline/iphone-4s-3.webp` | Datei existiert nicht auf Datenträger |
| **iPhone 8 Plus** | `/images/timeline/iphone-8-plus-1.webp`<br>`/images/timeline/iphone-8-plus-2.webp`<br>`/images/timeline/iphone-8-plus-3.webp` | Datei existiert nicht auf Datenträger |
| **iPhone 13 Pro** | `/images/timeline/iphone-13-pro-1.webp`<br>`/images/timeline/iphone-13-pro-2.webp`<br>`/images/timeline/iphone-13-pro-3.webp` | Datei existiert nicht auf Datenträger |
| **iPhone 15 Pro** | `/images/timeline/iphone-15-pro-3.webp` | Datei existiert nicht auf Datenträger |
| **iPhone 16 Pro** | `/images/timeline/iphone-16-pro-2.webp`<br>`/images/timeline/iphone-16-pro-3.webp` | Datei existiert nicht auf Datenträger |
| **iPhone 17 Pro** | `/images/timeline/iphone-17-pro-1.webp`<br>`/images/timeline/iphone-17-pro-2.webp`<br>`/images/timeline/iphone-17-pro-3.webp` | Datei existiert nicht auf Datenträger |

---

### B. Squarespace-CDN-Bilder in Blog-Artikeln (`content/blog/`) – [✅ BEHOBEN]

Alle 8 ehemals extern über das Squarespace-CDN verlinkten Bilder wurden durch passende, hochauflösende lokale Assets aus dem Projektbestand ersetzt:

1. **`content/blog/abandoned-freudenberg-bunker.md`** (Zeile 49)
   - *Alt-Text & Caption:* `![Long tunnel to the bunker](/images/lost-places/germany/teaser-freudenberg-bunker.webp "Long illuminated tunnel leading into the Freudenberg bunker.")`
   - *Neues lokales Asset:* `/images/lost-places/germany/teaser-freudenberg-bunker.webp`

2. **`content/blog/how-to-photograph-fireworks-with-iphone.md`** (Zeile 36)
   - *Alt-Text & Caption:* `![Fireworks shot on iPhone (2)](/images/cityscapes/austria/linz-austria-fireworks-1.jpeg "Fireworks over Linz shot on iPhone.")`
   - *Neues lokales Asset:* `/images/cityscapes/austria/linz-austria-fireworks-1.jpeg`

3. **`content/blog/how-to-photograph-fireworks-with-iphone.md`** (Zeile 101)
   - *Alt-Text & Caption:* `![Multiple exposures in a single frame taken with Slow Shutter Cam App](/images/tutorials/slow-shutter-cam-app-fireworks.webp "Multiple exposures of fireworks in a single frame taken with Slow Shutter Cam App.")`
   - *Neues lokales Asset:* `/images/tutorials/slow-shutter-cam-app-fireworks.webp`

4. **`content/blog/how-to-photograph-fairground-rides-at-night-with-iphone.md`** (Zeile 52)
   - *Alt-Text & Caption:* `![A 40 second long exposure of the London Eye at night](/images/reviews/a-long-exposure-of-the-london-eye-shot-on-iphone-6-using-slo.webp "A 40-second long exposure of the London Eye at night.")`
   - *Neues lokales Asset:* `/images/reviews/a-long-exposure-of-the-london-eye-shot-on-iphone-6-using-slo.webp`

5. **`content/blog/how-to-create-a-faux-moving-clouds-effect-on-ipad.md`** (Zeile 48)
   - *Alt-Text & Caption:* `![Final black and white photo with faux moving clouds effect](/images/tutorials/how-to-create-a-faux-moving-clouds-effect-on-ipad.webp "Final black and white photo with faux moving clouds effect.")`
   - *Neues lokales Asset:* `/images/tutorials/how-to-create-a-faux-moving-clouds-effect-on-ipad.webp`

6. **`content/blog/how-to-shoot-raw-iphone.md`** (Zeile 34)
   - *Alt-Text & Caption:* `![Kaiserwasser in Vienna shot as a 12 megapixel RAW on iPhone using ProCamera App](/images/cityscapes/austria/kaiserwasser-vienna.webp "Kaiserwasser in Vienna shot as a 12 megapixel RAW on iPhone using ProCamera App.")`
   - *Neues lokales Asset:* `/images/cityscapes/austria/kaiserwasser-vienna.webp`

7. **`content/blog/recommended-camera-apps.md`** (Zeile 116)
   - *Alt-Text & Caption:* `![Firework shot on iPhone using Slow Shutter Cam App](/images/reviews/long-exposure-of-a-fireworks-shot-on-iphone-xs-using-slow-sh.webp "Firework shot on iPhone using Slow Shutter Cam App.")`
   - *Neues lokales Asset:* `/images/reviews/long-exposure-of-a-fireworks-shot-on-iphone-xs-using-slow-sh.webp`

8. **`content/blog/review-amazon-basics-travel-tripod.md`** (Zeile 30)
   - *Alt-Text & Caption:* `![40 Second long exposure of the London Eye at night](/images/reviews/a-long-exposure-of-the-london-eye-shot-on-iphone-6-using-slo.webp "40-second long exposure of the London Eye at night.")`
   - *Neues lokales Asset:* `/images/reviews/a-long-exposure-of-the-london-eye-shot-on-iphone-6-using-slo.webp`

---

### C. Squarespace-URL im Layout (`layouts/_partials/home/hero.html`) – [✅ BEHOBEN]

#### `layouts/_partials/home/hero.html` (Zeile 6)
- **Umgestellt auf:**
  ```html
  {{- $heroImg := resources.Get "images/cityscapes/germany/cologne-cathedral-sunset.jpeg" -}}
  <img src="{{ with $heroImg }}{{ .RelPermalink }}{{ else }}{{ "images/cityscapes/germany/cologne-cathedral-sunset.jpeg" | relURL }}{{ end }}" 
       alt="Cologne Cathedral at Sunset" 
       {{ with $heroImg }}width="{{ .Width }}" height="{{ .Height }}"{{ end }}
       class="home-img home-img--square" 
       loading="eager">
  ```
- **Lokales Asset:** `assets/images/cityscapes/germany/cologne-cathedral-sunset.jpeg` wird nun nativ über die Hugo-Asset-Pipeline eingebunden.

---

## 3. Nächste Schritte

1. **iPhone Timeline-Daten bereinigen (`data/iphones.yaml`):**
   - Fehlende Timeline-Bilder bereitstellen und in `assets/images/timeline/` ablegen
   - oder in `data/iphones.yaml` durch bestehende Beispielfotos aus `assets/images/portfolio/` bzw. `assets/images/cityscapes/` ersetzen.
