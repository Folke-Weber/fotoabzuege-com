FotoWorks APP V1 · GETIN V23
================================

Ziel:
- kostenlose installierbare App-Version von fotoabzüge.com
- exakt auf der stabilen GETIN-V23-Basis
- vorhandenes FotoWorks-Backend wird unverändert genutzt
- bestehende Website im Root bleibt unangetastet

UPLOAD:
1. Im bestehenden GitHub-Repository von fotoabzüge.com im Root einen Ordner `app` anlegen.
2. Den kompletten Inhalt des Ordners `app` aus diesem Paket dort hochladen.
3. Committen und Cloudflare Pages deployen lassen.
4. Danach im Browser öffnen:
   https://fotoabzüge.com/app/

TEST:
- Android/Chrome: Installationshinweis sollte angeboten werden, sofern der Browser PWA-Installation zulässt.
- iPhone/Safari: Hinweis „Teilen → Zum Home-Bildschirm“ erscheint.
- Nach Installation startet die App ohne normale Browserleisten im Standalone-Modus.
- Bestellung, Preise, Aktionen und Upload laufen weiterhin über das vorhandene Backend.

WICHTIG:
- Die bestehende root-index.html von GETIN V23 wird NICHT ersetzt.
- Backend V1.4/ADMIN/GETOUT werden NICHT verändert.
- Der Service Worker cached keine Bestellungen, Uploads oder Backend-Aufrufe.
- Die App-Seite ist `noindex`, damit sie die normale Website in Suchmaschinen nicht dupliziert.

Version:
FotoWorks APP V1 · GETIN V23 · 19.08.2026
