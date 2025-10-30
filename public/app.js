// API Base URL
const API_URL = '/api';

// Globale Variablen
let currentDate = new Date();
let allBookings = [];

// DOM Elements
const bookingForm = document.getElementById('bookingForm');
const calendar = document.getElementById('calendar');
const currentMonthElement = document.getElementById('currentMonth');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const bookingsList = document.getElementById('bookingsList');
const modal = document.getElementById('bookingModal');
const closeModal = document.querySelector('.close');

// Initialisierung
document.addEventListener('DOMContentLoaded', () => {
    loadBookings();
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    bookingForm.addEventListener('submit', handleBookingSubmit);
    prevMonthBtn.addEventListener('click', () => changeMonth(-1));
    nextMonthBtn.addEventListener('click', () => changeMonth(1));
    closeModal.addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Heute als Minimum-Datum setzen
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('start_date').setAttribute('min', today);
    document.getElementById('end_date').setAttribute('min', today);

    // End-Datum aktualisieren wenn Start-Datum geändert wird
    document.getElementById('start_date').addEventListener('change', (e) => {
        document.getElementById('end_date').setAttribute('min', e.target.value);
    });
}

// Buchungen laden
async function loadBookings() {
    try {
        const response = await fetch(`${API_URL}/bookings`);
        if (!response.ok) throw new Error('Fehler beim Laden der Buchungen');

        allBookings = await response.json();
        renderCalendar();
        renderBookingsList();
    } catch (error) {
        console.error('Fehler:', error);
        showMessage('Fehler beim Laden der Buchungen', 'error');
    }
}

// Kalender rendern
function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Monat anzeigen
    const monthNames = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
                        'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
    currentMonthElement.textContent = `${monthNames[month]} ${year}`;

    // Kalender leeren
    calendar.innerHTML = '';

    // Wochentage Header
    const dayNames = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
    dayNames.forEach(day => {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day header';
        dayElement.textContent = day;
        calendar.appendChild(dayElement);
    });

    // Erster Tag des Monats
    const firstDay = new Date(year, month, 1);
    let firstDayOfWeek = firstDay.getDay();
    // Sonntag von 0 auf 7 ändern (für Montag als ersten Tag)
    firstDayOfWeek = firstDayOfWeek === 0 ? 7 : firstDayOfWeek;

    // Tage des vorherigen Monats
    const prevMonthDays = firstDayOfWeek - 1;
    const prevMonth = new Date(year, month, 0);
    const prevMonthLastDay = prevMonth.getDate();

    for (let i = prevMonthDays; i > 0; i--) {
        const day = prevMonthLastDay - i + 1;
        const dayElement = createDayElement(day, true, new Date(year, month - 1, day));
        calendar.appendChild(dayElement);
    }

    // Tage des aktuellen Monats
    const lastDay = new Date(year, month + 1, 0).getDate();
    for (let day = 1; day <= lastDay; day++) {
        const date = new Date(year, month, day);
        const dayElement = createDayElement(day, false, date);
        calendar.appendChild(dayElement);
    }

    // Restliche Tage auffüllen
    const totalCells = calendar.children.length - 7; // minus Header
    const remainingCells = 42 - totalCells - 7; // 6 Wochen * 7 Tage - bereits vorhandene - Header

    for (let day = 1; day <= remainingCells; day++) {
        const dayElement = createDayElement(day, true, new Date(year, month + 1, day));
        calendar.appendChild(dayElement);
    }
}

// Tag-Element erstellen
function createDayElement(day, isOtherMonth, date) {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';

    if (isOtherMonth) {
        dayElement.classList.add('other-month');
    }

    // Heute markieren
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
        dayElement.classList.add('today');
    }

    // Prüfen ob gebucht
    const dateString = date.toISOString().split('T')[0];
    const bookingsOnDate = allBookings.filter(booking => {
        const start = new Date(booking.start_date);
        const end = new Date(booking.end_date);
        return date >= start && date <= end;
    });

    if (bookingsOnDate.length > 0) {
        dayElement.classList.add('booked');
        dayElement.onclick = () => showBookingDetails(bookingsOnDate);
    }

    const dayNumber = document.createElement('div');
    dayNumber.className = 'day-number';
    dayNumber.textContent = day;
    dayElement.appendChild(dayNumber);

    if (bookingsOnDate.length > 0) {
        const indicator = document.createElement('div');
        indicator.className = 'booking-indicator';
        indicator.textContent = 'Gebucht';
        dayElement.appendChild(indicator);
    }

    return dayElement;
}

// Monat wechseln
function changeMonth(direction) {
    currentDate.setMonth(currentDate.getMonth() + direction);
    renderCalendar();
}

// Buchungsliste rendern
function renderBookingsList() {
    if (allBookings.length === 0) {
        bookingsList.innerHTML = '<div class="no-bookings">Keine Buchungen vorhanden</div>';
        return;
    }

    // Nach Startdatum sortieren
    const sortedBookings = [...allBookings].sort((a, b) =>
        new Date(a.start_date) - new Date(b.start_date)
    );

    bookingsList.innerHTML = sortedBookings.map(booking => `
        <div class="booking-item" onclick="showBookingDetails([${JSON.stringify(booking).replace(/"/g, '&quot;')}])">
            <div class="booking-header">
                <div class="booking-verein">${escapeHtml(booking.verein_name)}</div>
                <div class="booking-date">${formatDate(booking.start_date)} - ${formatDate(booking.end_date)}</div>
            </div>
            <div class="booking-contact">
                Ansprechpartner: ${escapeHtml(booking.contact_person)} |
                ${escapeHtml(booking.email)} |
                ${escapeHtml(booking.phone)}
            </div>
            ${booking.event_description ? `<div style="margin-top: 10px; color: #666;">${escapeHtml(booking.event_description)}</div>` : ''}
        </div>
    `).join('');
}

// Buchungsdetails anzeigen
function showBookingDetails(bookings) {
    const detailsHtml = bookings.map(booking => `
        <div style="margin-bottom: 20px; padding: 20px; border: 2px solid #e0e0e0; border-radius: 8px;">
            <h4 style="color: var(--primary-color); margin-bottom: 10px;">${escapeHtml(booking.verein_name)}</h4>
            <p><strong>Zeitraum:</strong> ${formatDate(booking.start_date)} - ${formatDate(booking.end_date)}</p>
            <p><strong>Ansprechpartner:</strong> ${escapeHtml(booking.contact_person)}</p>
            <p><strong>E-Mail:</strong> ${escapeHtml(booking.email)}</p>
            <p><strong>Telefon:</strong> ${escapeHtml(booking.phone)}</p>
            ${booking.event_description ? `<p><strong>Beschreibung:</strong> ${escapeHtml(booking.event_description)}</p>` : ''}
            <p style="color: #666; font-size: 0.9rem; margin-top: 10px;">Gebucht am: ${formatDateTime(booking.created_at)}</p>
        </div>
    `).join('');

    document.getElementById('bookingDetails').innerHTML = detailsHtml;
    modal.style.display = 'block';
}

// Buchung erstellen
async function handleBookingSubmit(e) {
    e.preventDefault();

    const formData = new FormData(bookingForm);
    const bookingData = Object.fromEntries(formData.entries());

    // Validierung: End-Datum muss nach Start-Datum sein
    if (new Date(bookingData.end_date) < new Date(bookingData.start_date)) {
        showMessage('Das End-Datum muss nach dem Start-Datum liegen', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bookingData)
        });

        const result = await response.json();

        if (!response.ok) {
            if (response.status === 409) {
                showMessage('Die Hüpfburg ist in diesem Zeitraum bereits gebucht. Bitte wählen Sie einen anderen Zeitraum.', 'error');
            } else {
                showMessage(result.error || 'Fehler beim Erstellen der Buchung', 'error');
            }
            return;
        }

        showMessage('Buchung erfolgreich erstellt!', 'success');
        bookingForm.reset();
        loadBookings();

        // Scroll zur Buchungsliste
        document.querySelector('.bookings-section').scrollIntoView({ behavior: 'smooth' });

    } catch (error) {
        console.error('Fehler:', error);
        showMessage('Fehler beim Erstellen der Buchung', 'error');
    }
}

// Nachricht anzeigen
function showMessage(message, type) {
    const existingMessage = document.querySelector('.success-message, .error-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = type === 'success' ? 'success-message' : 'error-message';
    messageDiv.textContent = message;

    const form = document.querySelector('.booking-form-section');
    form.insertBefore(messageDiv, bookingForm);

    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

// Hilfsfunktionen
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text ? text.replace(/[&<>"']/g, m => map[m]) : '';
}
