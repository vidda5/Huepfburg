const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// API Routes

// Alle Buchungen abrufen
app.get('/api/bookings', (req, res) => {
  db.all('SELECT * FROM bookings ORDER BY start_date ASC', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Buchungen für einen bestimmten Zeitraum abrufen
app.get('/api/bookings/range', (req, res) => {
  const { start, end } = req.query;

  const query = `
    SELECT * FROM bookings
    WHERE (start_date BETWEEN ? AND ?)
       OR (end_date BETWEEN ? AND ?)
       OR (start_date <= ? AND end_date >= ?)
    ORDER BY start_date ASC
  `;

  db.all(query, [start, end, start, end, start, end], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Neue Buchung erstellen
app.post('/api/bookings', (req, res) => {
  const { verein_name, contact_person, email, phone, start_date, end_date, event_description } = req.body;

  // Validierung
  if (!verein_name || !contact_person || !email || !phone || !start_date || !end_date) {
    res.status(400).json({ error: 'Alle Pflichtfelder müssen ausgefüllt werden' });
    return;
  }

  // Prüfen ob der Zeitraum bereits gebucht ist
  const checkQuery = `
    SELECT * FROM bookings
    WHERE (start_date BETWEEN ? AND ?)
       OR (end_date BETWEEN ? AND ?)
       OR (start_date <= ? AND end_date >= ?)
  `;

  db.all(checkQuery, [start_date, end_date, start_date, end_date, start_date, end_date], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    if (rows.length > 0) {
      res.status(409).json({
        error: 'Die Hüpfburg ist in diesem Zeitraum bereits gebucht',
        conflicting_bookings: rows
      });
      return;
    }

    // Buchung erstellen
    const insertQuery = `
      INSERT INTO bookings (verein_name, contact_person, email, phone, start_date, end_date, event_description)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(insertQuery, [verein_name, contact_person, email, phone, start_date, end_date, event_description], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      res.status(201).json({
        id: this.lastID,
        message: 'Buchung erfolgreich erstellt'
      });
    });
  });
});

// Buchung löschen (nur für Admin)
app.delete('/api/bookings/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM bookings WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    if (this.changes === 0) {
      res.status(404).json({ error: 'Buchung nicht gefunden' });
      return;
    }

    res.json({ message: 'Buchung erfolgreich gelöscht' });
  });
});

// Einzelne Buchung abrufen
app.get('/api/bookings/:id', (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM bookings WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    if (!row) {
      res.status(404).json({ error: 'Buchung nicht gefunden' });
      return;
    }

    res.json(row);
  });
});

// Server starten
app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});
