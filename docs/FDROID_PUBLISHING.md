# MyMeds – Veröffentlichung auf F-Droid & IzzyOnDroid

Dieser Leitfaden beschreibt, wie **MyMeds** im Open-Source-Ökosystem von **F-Droid** und **IzzyOnDroid** veröffentlicht wird.

---

## 1. Schneller & empfohlener Weg: IzzyOnDroid

**IzzyOnDroid** ist das größte und am weitesten verbreitete Partner-Repository für F-Droid. Nahezu alle F-Droid-Nutzer haben dieses Repository als Standard-Paketquelle aktiviert.

### Der Vorteil von IzzyOnDroid:
- IzzyOnDroid lädt das signierte **APK direkt aus Ihren GitHub Releases** herunter.
- Sobald MyMeds aufgenommen ist, werden neue Versionen bei jedem GitHub Release **vollautomatisch** in F-Droid aktualisiert!

### Schritt-für-Schritt Aufnahmeantrag (Dauer: ca. 3 Minuten):

1. Öffne den Aufnahme-Antrag auf GitLab:  
   👉 **[IzzyOnDroid Inclusion Request auf GitLab](https://gitlab.com/IzzyOnDroid/repo/-/issues/new?issue[template]=inclusion-request)**
2. Fülle die folgenden Felder aus:

| Feld | Wert |
| :--- | :--- |
| **App Name** | MyMeds |
| **Package Name** | `org.mymeds.app` |
| **Source Code Repository** | `https://github.com/the3ver/mymeds` |
| **License** | Apache-2.0 |
| **Release Asset Name** | `MyMeds-release.apk` |
| **Short Description** | Client-only PWA zur verschlüsselten Erfassung von Medikamentenvorräten und Einnahmeplänen. |
| **Trackers / Ads** | Keine (100 % werbefrei, Zero-Knowledge, keine externen APIs) |

3. Klicke auf **Submit Issue**.
4. Der Betreiber (Izzy) prüft die App in der Regel innerhalb von 24–48 Stunden. Sobald das Ticket geschlossen wird, ist MyMeds in F-Droid für alle IzzyOnDroid-Nutzer such- und installierbar!

---

## 2. Offizielles F-Droid Haupt-Repository (`fdroiddata`)

Das offizielle F-Droid Haupt-Repository kompiliert Anwendungen grundsätzlich selbst aus dem Quellcode auf eigenen Servern.

### Ablauf:
1. Erstelle einen Fork von [`https://gitlab.com/fdroid/fdroiddata`](https://gitlab.com/fdroid/fdroiddata).
2. Lege eine Datei `metadata/org.mymeds.app.yml` an:
   ```yaml
   Categories:
     - Health
   License: Apache-2.0
   WebSite: https://the3ver.github.io/mymeds/
   SourceCode: https://github.com/the3ver/mymeds
   IssueTracker: https://github.com/the3ver/mymeds/issues

   AutoName: MyMeds
   Summary: Verschlüsselte Medikamentenverwaltung & Einnahmepläne
   Description: |-
     MyMeds ist eine datenschutzfreundliche, offline-fähige Progressive Web App (PWA)
     zur verschlüsselten Verwaltung von Medikamenten und Einnahme-Erinnerungen.
     Alle Daten bleiben lokal auf dem Endgerät verschlüsselt.

   RepoType: git
   Repo: https://github.com/the3ver/mymeds.git

   Builds:
     - versionName: '1.6.0'
       versionCode: 1
       commit: v1.6.0
       subdir: android
       gradle:
         - yes
   ```
3. Reiche eine Merge Request (MR) ein.
4. Nach dem Review durch das F-Droid Team wird die App in den Haupt-Katalog aufgenommen.

---

## 3. Direkter APK-Download (Sideloading)

Zusätzlich zu den Stores steht das signierte **`MyMeds-release.apk`** auf GitHub unter:  
👉 `https://github.com/the3ver/mymeds/releases`  
jedem Android-Nutzer zum direkten Download und Sideloading zur Verfügung.
