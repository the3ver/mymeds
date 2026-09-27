# MyMeds

Client-only Progressive Web App zur Ende-zu-Ende verschlüsselten Verwaltung von Medikamentenbeständen, Einnahmeschemata und Gesundheitsterminen.

## Language

### Tresor & Sicherheit

**Tresor**:
Ein passwort- oder passkey-geschützter lokaler Datencontainer in IndexedDB, der alle sensiblen Medikamenten- und Kalenderdaten AES-GCM-verschlüsselt kapselt.
_Avoid_: Datenbank, Account, Profil, Datenspeicher

**Master-Passwort**:
Die vom Nutzer festgelegte Passphrase, aus der über PBKDF2 (100.000 Iterationen) der symmetrische Schlüssel für die AES-GCM-Verschlüsselung des Tresors abgeleitet wird.
_Avoid_: Passwort, Login, Zugangsdaten, Masterkey

**Sync-Code**:
Ein temporärer kryptografischer Schlüssel für die Ende-zu-Ende-verschlüsselte Übertragung eines Tresors zwischen Geräten über einen zustandslosen Relay-Server.
_Avoid_: PIN, QR-Token, Kopplungsschlüssel

### Medikamente & Einnahme

**Medikament**:
Ein im Tresor erfasstes Arzneimittel mit aktuellem Einheitenbestand, Dosierungsschema, Packungsgröße und Schwellenwerten für Warnstufen.
_Avoid_: Artikel, Produkt, Präparat, Tablette

**Bestand**:
Die exakte Anzahl aktuell verfügbarer Einnahmeeinheiten (z. B. Tabletten, Tropfen, Hübe) eines Medikaments im Tresor.
_Avoid_: Vorrat, Menge, Restbestand

**Dosierungsschema**:
Die strukturierte tägliche Einnahmevorgabe nach dem Vier-Zeiten-Muster (Morgen-Mittag-Abend-Nacht, z. B. `1-0-1`, `1/2-0-1/2`) oder als Bedarfs- bzw. Intervallmedikation.
_Avoid_: Einnahmeplan, Rhythmus, Dosisplan

**Täglicher Abzug**:
Die automatische Subtraktion aufgelaufener Tagesdosen vom Bestand beim ersten Entsperren eines Tresors an einem neuen Datum, basierend auf der Differenz zu `lastDoseUpdate`.
_Avoid_: Auto-Abzug, Verrechnung, Tages-Update

### Bestandsüberwachung & Warnungen

**Reichweite**:
Die aus aktuellem Bestand und täglicher Gesamtdosis mathematisch berechnete Anzahl an verbleibenden Kalendertagen bis zum Aufbrauchen des Medikaments.
_Avoid_: Restlaufzeit, Haltbarkeit, Frist, Tage

**Warnstufe**:
Die farbliche Dringlichkeitsstufe eines Medikaments (Grün für gedeckt, Gelb für Nachbestellung empfohlen, Rot für kritisch niedrig) basierend auf benutzerdefinierten Reichweiten-Schwellenwerten.
_Avoid_: Ampel, Alarmstufe, Status

### Termine & Kalender

**Kalendereintrag**:
Ein im Tresor verschlüsselter Gesundheitstermin (z. B. Arzttermin, Rezeptabholung oder Kontrolluntersuchung) mit Startzeit, Notizen und ICS-Exportfähigkeit.
_Avoid_: Event, Termin, Reminder, Aufgabe

**Überweisung**:
Ein ärztliches Dokument zur Weiterbehandlung bei einem Facharzt oder in einer spezialisierten Praxis innerhalb eines Quartals mit den Statusstufen `Zu besorgen` (`needed`), `Liegt vor` (`present`) und `Abgegeben` (`submitted`).
_Avoid_: Überweisungsschein, Facharztüberweisung, Einweisung, Verordnung, Rezept

### Konfiguration

**Einstellungen**:
Globale, unverschlüsselte Konfigurationsparameter (Theme, Sprache, Farblimits, UI-Skalierung), die im separaten `settings`-Store abgelegt werden.
_Avoid_: Optionen, Preferences, Config
