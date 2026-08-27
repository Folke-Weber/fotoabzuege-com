FotoJoe GETIN V25.3 – PERFORMANCE / SEO / KI – CANDIDATE
=========================================================
Stand: 2026-08-27
Basis: funktionierendes FotoJoe GETIN V25.2 RESPONSIVE + geprüfte Performance-Auslagerung

SICHERE ÄNDERUNGEN
==================
- Startseite und /app/: eingebettete Base64-Bilder ausgelagert; beide verwenden dieselben /assets/.
- 5 große JPEG-Bilder als WebP.
- Alle Asset-Dateinamen tragen jetzt einen echten SHA-256-Content-Hash (10 Zeichen).
  Dadurch ist Cache-Control: immutable für /assets/* sicher.
- Hero-Bild wird NICHT lazy geladen; Bilder unterhalb des sichtbaren Bereichs werden lazy geladen.
- QR-Code-Alttext von altem FotoWorks-Namen auf FotoJoe korrigiert.
- Geo-Koordinaten auf den öffentlich ausgewiesenen Standort von Foto Weber korrigiert.
- robots.txt ergänzt; OAI-SearchBot ausdrücklich erlaubt.
- /app/ bleibt in app/index.html mit noindex,follow markiert.
  robots.txt blockiert /app/ bewusst NICHT, damit Google/OpenAI das noindex lesen können.
- sitemap.xml enthält ausschließlich die öffentliche Startseite.
- Falsche IDN/Punycode-Schreibweise korrigiert:
  fotoabzüge.com = xn--fotoabzge-w9a.com
- llms.txt als zusätzliche maschinenlesbare Zusammenfassung ergänzt.
- JSON-LD der öffentlichen Startseite: WebSite, LocalBusiness/Store/PhotographyBusiness,
  Product, FAQPage, BreadcrumbList. Keine erfundenen Bewertungen/Öffnungszeiten.

NICHT GEÄNDERT
==============
- Upload- und Wiederaufnahme-Logik
- Bestell- und Preislogik
- Backend/API
- Zoom/Ausschnitt/Verschieben
- Farb- und Bildoptimierung
- Versand- und Zahlungslogik
- Service Worker
- Manifest / Offline-Seite / App-Icons

WICHTIG
=======
- FAQPage-Markup ist korrekt, erzeugt bei normalen kommerziellen Seiten aber üblicherweise
  kein sichtbares Google-FAQ-Rich-Result. Es bleibt als semantische Zusatzinformation enthalten.
- GPTBot ist aktuell erlaubt. GPTBot betrifft potenzielles Training, NICHT die ChatGPT-Suche.
  Für ChatGPT-Sichtbarkeit ist OAI-SearchBot entscheidend. GPTBot kann später unabhängig gesperrt werden.
- Vor Live-Freigabe: Smartphone-End-to-End-Test und Desktop-Test durchführen.

DEPLOY
======
Kompletten Inhalt dieses ZIPs in das Repo fotoabzuege-com übernehmen, Struktur beibehalten.

PRÜFEN NACH DEPLOY
==================
1. Startseite und /app/ öffnen
2. Mehrere Bilder auswählen
3. Format / Menge / Zoom / Ausschnitt / Farboptimierung testen
4. Testbestellung bis READY
5. robots.txt und sitemap.xml direkt im Browser öffnen
6. Google Search Console: Sitemap einreichen und Startseite zur Indexierung anstoßen
