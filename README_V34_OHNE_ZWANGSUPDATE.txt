FotoJoes GETIN V34 – OHNE ZWANGSUPDATE
Stand: 11.09.2026

ENTSCHEIDUNG:
- Kein automatisches Zwangsupdate mehr.
- Keine Sperrmaske.
- Kein erzwungener Reload.
- Kein 5-Versionen-Zwang.

Warum fotojoe-update.js trotzdem bleibt:
Die Datei ist nur noch ein leerer Kompatibilitäts-Stub.
Ältere HTML-/App-Stände können sie weiterhin laden, ohne Fehler zu bekommen.
Sie führt keinerlei Aktion mehr aus.

Warum fotojoe-version.json auf latestBuild 0 steht:
Falls irgendwo kurzfristig noch eine ältere Version von fotojoe-update.js aktiv
sein sollte, kann auch diese dadurch keine Zwangssperre auslösen.

Weiterhin sinnvoll und aktiv:
- HTML/App werden über die bestehenden no-store-/network-first-Regeln frisch geladen.
- Der korrigierte Service Worker räumt beide alten Cache-Präfixe auf:
  fotojoe-app- und fotojoes-app-

Einspielen:
1. index.html im Hauptverzeichnis ersetzen.
2. fotojoe-update.js im Hauptverzeichnis ersetzen.
3. fotojoe-version.json im Hauptverzeichnis ersetzen.
4. app/sw.js ersetzen.
5. Commit changes.

V33 TEST-2 bleibt der Rückfallstand.
V34 bleibt bis zum Weißrand-Testdruck ein Test-/RC-Stand.
