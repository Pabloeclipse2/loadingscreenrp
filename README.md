# Fullscreen Loading Screen (Slideshow + Fade)

**Inhalt**
- `index.html` – Hauptseite
- `style.css` – Fullscreen Stylesj
- `script.js` – Slideshow + Fade
- `assets/images/` – Deine Bilder (aus `bilder.zip` übernommen)

## Lokal testen
Öffne `index.html` im Browser oder starte einen kleinen Server:

```bash
# Python 3
python -m http.server 8080
```

Dann im Browser: `http://localhost:8080`

## Anpassen
In `script.js`:
- `durationMs` = wie lange ein Bild angezeigt wird
- `fadeMs` = Fade-Dauer
- `shuffle` = Zufallsreihenfolge (true/false)

Wenn du **kein Overlay** willst:
- In `style.css` bei `#overlay` einfach `display: none;` setzen oder den HTML-Block entfernen.
