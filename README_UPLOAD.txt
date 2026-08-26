FotoJoe GETIN V25.2 – RESPONSIVE OPTIMIERUNG
==============================================
Stand: 26.08.2026

Basis:
- funktionierender FotoJoe GETIN V25.1 Referenzstand
- Backend/API/Preise/Upload/Bestellung unverändert

UPLOAD IN GITHUB (fotoabzuege-com):
1. Dieses ZIP lokal entpacken.
2. Im bestehenden Repository die Dateien mit gleicher Ordnerstruktur hochladen/ersetzen:
   - index.html
   - _headers
   - app/index.html
   - app/manifest.webmanifest
   - app/offline.html
   - app/sw.js
   - app/icons/...
3. Commit z. B.: "FotoJoe V25.2 Responsive"
4. Cloudflare Pages automatisch deployen lassen.
5. Danach zuerst Smartphone, dann Desktop testen.

WICHTIG:
- Keine Änderungen am Backend oder an Cloudflare Worker/DB nötig.
- Der PWA-Service-Worker cached keine Bestellungen, Uploads oder Backend-Aufrufe.
- V25.1 bleibt als Rückfallstand im SAFE erhalten.

TEST NACH DEPLOYMENT:
- Smartphone: Navigation, Bildauswahl, mehrere Bilder, Format, Stückzahl, Qualität, Löschen
- Ausschnitt/Zoom/Farboptimierung mit Finger
- roter Pfeil "Zur letzten Auswahl"
- Bestellung prüfen und Testauftrag bis READY
- Desktop: Layout und Bestellablauf gegenprüfen
