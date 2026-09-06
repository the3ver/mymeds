# MyMeds – Google Play Store Veröffentlichungs-Leitfaden (TWA)

Dieser Leitfaden beschreibt Schritt für Schritt, wie die Progressive Web App (PWA) **MyMeds** über eine **Trusted Web Activity (TWA)** im **Google Play Store** veröffentlicht wird.

---

## 1. Voraussetzungen & Eckdaten

- **Google Play Entwicklerkonto:** Einmalige Registrierung auf [play.google.com/console](https://play.google.com/console) (25 $ Registrierungsgebühr bei Google).
- **Paket-ID (Application ID):** `org.mymeds.app`
- **App-Name:** `MyMeds`
- **Start-URL:** `https://the3ver.github.io/mymeds/?utm_source=twa`
- **App-Kategorie:** Medizin / Gesundheit & Fitness
- **Preis:** Kostenlos, werbefrei

---

## 2. Signaturschlüssel (Release Keystore)

Für die Signierung des Android App Bundles (`.aab`) wurde ein dedizierter Release-Keystore generiert:

- **Datei:** `mymeds-release-key.keystore`
- **Alias:** `mymeds`
- **Passwort (Keystore & Key):** `mymeds-playstore-key`
- **SHA-256 Fingerprint (Upload-Zertifikat):**
  ```
  7D:F1:FE:2C:D8:5E:68:9D:8F:50:8E:CC:E2:51:C1:CB:D3:E8:7C:FC:A4:5D:AA:DA:AF:45:19:73:14:4B:CE:66
  ```

> [!TIP]
> **Sicherung des Schlüssels:**
> Bewahre die Datei `mymeds-release-key.keystore` sicher auf. Für automatische GitHub Actions Builds kann der Schlüssel als Base64-String in den GitHub Secrets hinterlegt werden (`ANDROID_KEYSTORE_BASE64`).

---

## 3. Digital Asset Links (`assetlinks.json`)

Damit Android die TWA als vertrauenswürdig einstuft und die Chrome-Adressleiste **vollständig ausblendet**, benötigt Android eine Verknüpfung zwischen der Web-Domain und der App-Signatur.

Die Datei [`public/.well-known/assetlinks.json`](file:///c:/Users/frank/github/mymeds/public/.well-known/assetlinks.json) ist im Projekt hinterlegt:

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "org.mymeds.app",
      "sha256_cert_fingerprints": [
        "7D:F1:FE:2C:D8:5E:68:9D:8F:50:8E:CC:E2:51:C1:CB:D3:E8:7C:FC:A4:5D:AA:DA:AF:45:19:73:14:4B:CE:66"
      ]
    }
  }
]
```

### Wichtiger Hinweis zu GitHub Pages:
Android prüft `assetlinks.json` immer auf der Root-Domain: `https://the3ver.github.io/.well-known/assetlinks.json`.
- **Option A (GitHub Root-Repo):** Erstelle auf GitHub ein neues Repository namens `the3ver.github.io` und lade die Datei `.well-known/assetlinks.json` dort hoch. GitHub Pages stellt sie dann automatisch unter `https://the3ver.github.io/.well-known/assetlinks.json` bereit.
- **Option B (Eigene Domain):** Falls MyMeds über eine eigene Domain (z. B. `mymeds.app`) läuft, wird `assetlinks.json` direkt auf dieser Domain ausgeliefert.

---

## 4. Android App Bundle (`.aab`) in GitHub Actions bauen

Ein automatisierter Workflow ist unter [`.github/workflows/build-twa.yml`](file:///c:/Users/frank/github/mymeds/.github/workflows/build-twa.yml) eingerichtet:

1. Gehe in GitHub auf den Reiter **Actions**.
2. Wähle den Workflow **Build Android TWA (AAB & APK)** aus.
3. Klicke auf **Run workflow**.
4. Sobald der Lauf abgeschlossen ist, lade unter **Artifacts** das ZIP-Archiv `mymeds-android-release` herunter. Darin befindet sich das fertige **`app-release-bundle.aab`**!

---

## 5. Schritte in der Google Play Console

### 1. App anlegen
- Öffne [Google Play Console](https://play.google.com/console).
- Klicke auf **App erstellen**.
- **App-Name:** `MyMeds`
- **Standardsprache:** Deutsch (oder Englisch)
- **App oder Spiel:** App
- **Kostenlos oder kostenpflichtig:** Kostenlos

### 2. Datensicherheit (Data Safety) – Zero-Knowledge Vorteil
Google verlangt Angaben zur Datenerfassung. Bei MyMeds ist dies extrem unkompliziert:
- **Werden Nutzerdaten erfasst?** Nein.
- **Werden Daten an Dritte weitergegeben?** Nein.
- **Erläuterung:** Alle Medikamenten- und Gesundheitsdaten werden ausschließlich lokal auf dem Endgerät gespeichert und mit AES-GCM (PBKDF2) verschlüsselt. Es existiert kein Backend-Server.

### 3. Store-Eintrag (Listing)
- **Kurzbeschreibung (bis 80 Zeichen):**  
  *Verschlüsselte Medikamentenverwaltung, Einnahmepläne & Erinnerungen.*
- **Vollständige Beschreibung:**  
  *MyMeds ist Ihre sichere, werbefreie und private Medikamenten-App. Verwalten Sie Vorräte, Tagesdosen (z. B. 1-0-1) und Einnahme-Erinnerungen – vollständig lokal und durch modernste Kryptografie geschützt.*
- **App-Symbol:** `public/pwa-512x512.png` (512x512 PNG).
- **Screenshots:** Erstelle 2–4 Screenshots der App auf Android oder im Browser-Entwicklermodus.

### 4. Release hochladen & Google Play App Signing
- Navigiere zu **Testen und veröffentlichen > Produktion** (oder **Geschlossener Test**).
- Klicke auf **Neuen Release erstellen**.
- Lade die Datei **`app-release-bundle.aab`** hoch.
- **Google Play App Signing:** Google generiert einen eigenen Verteilungsschlüssel.  
  👉 Kopiere unter **Einrichten > App-Integrität > App-Signaturschlüssel-Zertifikat** den dortigen **SHA-256-Fingerprint** und ergänze ihn in `public/.well-known/assetlinks.json` (als zweiten Eintrag im Array).
- Klicke auf **Release prüfen** und **Einführung starten**.

Nach der Google-Prüfung (in der Regel 1–3 Werktage) ist MyMeds offiziell im Google Play Store verfügbar!
