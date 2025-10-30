# Hüpfburg Buchungssystem

Ein webbasiertes Buchungssystem für die Gemeinde-Hüpfburg der Jugendfeuerwehren. Vereine können damit sehen, wann die Hüpfburg verfügbar ist und direkt online buchen.

## Features

- **Kalenderansicht**: Übersichtliche Darstellung aller Buchungen im Monatskalender
- **Buchungsverwaltung**: Einfaches Formular zum Erstellen neuer Buchungen
- **Konfliktprüfung**: Automatische Überprüfung auf Terminüberschneidungen
- **Responsive Design**: Funktioniert auf Desktop, Tablet und Smartphone
- **Buchungsliste**: Chronologische Übersicht aller kommenden Buchungen
- **Detailansicht**: Klick auf einen Termin zeigt alle Details der Buchung

## Technologie

- **Backend**: Node.js mit Express.js
- **Datenbank**: SQLite (einfach zu deployen, keine externe Datenbank nötig)
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Keine Frameworks**: Leichtgewichtig und schnell

## Installation

### Voraussetzungen

- Node.js (Version 14 oder höher)
- npm (kommt mit Node.js)

### Schritt-für-Schritt Anleitung

1. **Repository klonen oder herunterladen**

2. **Abhängigkeiten installieren**
   ```bash
   npm install
   ```

3. **Server starten**
   ```bash
   npm start
   ```

4. **Browser öffnen**
   - Öffnen Sie Ihren Browser und navigieren Sie zu: `http://localhost:3000`

### Entwicklungsmodus

Für die Entwicklung mit automatischem Neustart bei Dateiänderungen:

```bash
npm run dev
```

## Nutzung

### Buchung erstellen

1. Füllen Sie das Buchungsformular aus:
   - Vereinsname
   - Ansprechpartner
   - E-Mail-Adresse
   - Telefonnummer
   - Start- und End-Datum
   - Optional: Beschreibung der Veranstaltung

2. Klicken Sie auf "Buchung anfragen"

3. Das System prüft automatisch, ob der Zeitraum verfügbar ist

### Buchungen ansehen

- **Kalenderansicht**: Gebuchte Tage sind rot markiert
- **Buchungsliste**: Scrollen Sie nach unten für eine chronologische Liste
- **Details**: Klicken Sie auf einen gebuchten Tag oder einen Eintrag in der Liste

### Navigation

- Verwenden Sie die Pfeiltasten im Kalender, um zwischen Monaten zu wechseln
- Heute ist mit einem grünen Rahmen markiert

## API-Endpunkte

Falls Sie die API direkt nutzen möchten:

### Alle Buchungen abrufen
```
GET /api/bookings
```

### Buchungen für Zeitraum abrufen
```
GET /api/bookings/range?start=2025-01-01&end=2025-01-31
```

### Neue Buchung erstellen
```
POST /api/bookings
Content-Type: application/json

{
  "verein_name": "Sportverein",
  "contact_person": "Max Mustermann",
  "email": "max@example.com",
  "phone": "0123456789",
  "start_date": "2025-06-01",
  "end_date": "2025-06-03",
  "event_description": "Sommerfest"
}
```

### Einzelne Buchung abrufen
```
GET /api/bookings/:id
```

### Buchung löschen
```
DELETE /api/bookings/:id
```

## Konfiguration

### Port ändern

Standardmäßig läuft der Server auf Port 3000. Um einen anderen Port zu verwenden:

```bash
PORT=8080 npm start
```

## Datenbank

Die Datenbank wird automatisch beim ersten Start erstellt (`bookings.db`). Sie enthält folgende Felder:

- `id`: Eindeutige Buchungs-ID
- `verein_name`: Name des Vereins
- `contact_person`: Ansprechpartner
- `email`: E-Mail-Adresse
- `phone`: Telefonnummer
- `start_date`: Startdatum (YYYY-MM-DD)
- `end_date`: Enddatum (YYYY-MM-DD)
- `event_description`: Beschreibung der Veranstaltung
- `created_at`: Erstellungszeitpunkt

## Deployment

### Auf einem Server deployen

1. Laden Sie das Projekt auf Ihren Server
2. Installieren Sie die Abhängigkeiten: `npm install --production`
3. Starten Sie den Server: `npm start`
4. Optional: Verwenden Sie PM2 für Prozessverwaltung:
   ```bash
   npm install -g pm2
   pm2 start server.js --name huepfburg
   pm2 save
   pm2 startup
   ```

### Mit Docker (optional)

Erstellen Sie eine `Dockerfile`:

```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

Build und Run:
```bash
docker build -t huepfburg .
docker run -p 3000:3000 -v $(pwd)/bookings.db:/app/bookings.db huepfburg
```

## Erweiterungsmöglichkeiten

Das System kann erweitert werden mit:

- **Authentifizierung**: Login-System für Vereine
- **Admin-Panel**: Verwaltung und Genehmigung von Buchungen
- **E-Mail-Benachrichtigungen**: Automatische Bestätigungen
- **Export-Funktion**: PDF oder Excel Export der Buchungen
- **Mehrsprachigkeit**: Unterstützung weiterer Sprachen
- **Bilder**: Upload von Veranstaltungsbildern

## Support

Bei Fragen oder Problemen wenden Sie sich an die Gemeinde Jugendfeuerwehr.

## Lizenz

MIT