FotoJoe GETIN V26.1 – BILDER-HOTFIX – DEPLOY

Dieses ZIP ist als kompletter Upload-Stand für das Repository fotoabzuege-com gedacht.
Alle Dateien und Ordner mit gleicher Struktur ins Repository übernehmen und Cloudflare Pages deployen lassen.

V26.1 baut auf FotoJoe GETIN V26 auf. Ursache des Hotfixes:
Die Live-Seite lieferte das neue Verzeichnis /assets/ nicht aus. Dadurch fehlten alle ausgelagerten Bilder.

Deshalb liegen die optimierten Bilddateien in V26.1 direkt im Hauptverzeichnis des Webprojekts.
Es gibt absichtlich KEINEN assets-Ordner mehr.

V26-Funktionen bleiben enthalten:
- schlanker Upload-Text ohne Mengenbeispiele
- Zwei-Finger-Zoom im Ausschnitt; Zoom-Regler bleibt erhalten
- roter Return-Button zur letzten Auswahl
- neues Bildbestellungs-App-Icon
- Performance-, SEO- und KI-Dateien: robots.txt, sitemap.xml, llms.txt, strukturierte Daten

Unverändert:
Upload, Preise, Bestellung, Backend, Ausschnitt-/Formatlogik und Farboptimierung.

WICHTIG: Nach Deployment Smartphone/PWA vollständig testen und erst danach als SAFE freigeben.
