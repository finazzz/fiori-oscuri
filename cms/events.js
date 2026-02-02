// Events Management - Fiori Oscuri CMS
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { SUPABASE_CONFIG } from '../config.js';

const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

// Check authentication
const session = localStorage.getItem('cms_session');
if (!session) {
    window.location.href = 'index.html';
}

// Logout handler
document.getElementById('logout-btn').addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('cms_session');
    window.location.href = 'index.html';
});

// Modal elements
const modal = document.getElementById('event-modal');
const modalTitle = document.getElementById('modal-title');
const eventForm = document.getElementById('event-form');
const newEventBtn = document.getElementById('new-event-btn');
const closeModalBtn = document.getElementById('close-modal');
const cancelBtn = document.getElementById('cancel-btn');
const eventTitle = document.getElementById('event-title');
const eventSlug = document.getElementById('event-slug');
const copyLinkBtn = document.getElementById('copy-link-btn');

// Auto-generate slug from title
eventTitle.addEventListener('input', () => {
    if (!document.getElementById('event-id').value) {
        const slug = generateSlug(eventTitle.value);
        eventSlug.value = slug;
    }
});

// Copy link button
copyLinkBtn.addEventListener('click', () => {
    const link = document.getElementById('shareable-link');
    link.select();
    navigator.clipboard.writeText(link.value);
    showAlert('Link copiato!', 'success');
});

// Open modal for new event
newEventBtn.addEventListener('click', () => {
    openModal();
});

// Close modal handlers
closeModalBtn.addEventListener('click', closeModal);
cancelBtn.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

// Form submission
eventForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    await saveEvent();
});

function generateSlug(text) {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function openModal(event = null) {
    if (event) {
        modalTitle.textContent = 'Modifica Evento';
        document.getElementById('event-id').value = event.id;
        document.getElementById('event-title').value = event.title;
        document.getElementById('event-description').value = event.description || '';
        document.getElementById('event-location').value = event.location;

        // Format date for datetime-local input
        const date = new Date(event.event_date);
        const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
        document.getElementById('event-date').value = localDate.toISOString().slice(0, 16);

        document.getElementById('event-image').value = event.image_url || '';
        document.getElementById('event-slug').value = event.shareable_slug;

        // Show shareable link
        const link = `${window.location.origin}/../public-site/event.html?slug=${event.shareable_slug}`;
        document.getElementById('shareable-link').value = link;
        document.getElementById('shareable-link-container').classList.remove('hidden');
    } else {
        modalTitle.textContent = 'Nuovo Evento';
        eventForm.reset();
        document.getElementById('event-id').value = '';
        document.getElementById('shareable-link-container').classList.add('hidden');
    }
    modal.classList.add('active');
}

function closeModal() {
    modal.classList.remove('active');
    eventForm.reset();
}

async function saveEvent() {
    const id = document.getElementById('event-id').value;
    const eventData = {
        title: document.getElementById('event-title').value,
        description: document.getElementById('event-description').value || null,
        location: document.getElementById('event-location').value,
        event_date: document.getElementById('event-date').value,
        image_url: document.getElementById('event-image').value || null,
        shareable_slug: document.getElementById('event-slug').value
    };

    try {
        if (id) {
            // Update existing event
            const { error } = await supabase
                .from('events')
                .update(eventData)
                .eq('id', id);

            if (error) throw error;
            showAlert('Evento aggiornato con successo', 'success');
        } else {
            // Create new event
            const { error } = await supabase
                .from('events')
                .insert([eventData]);

            if (error) throw error;
            showAlert('Evento creato con successo', 'success');
        }

        closeModal();
        loadEvents();
    } catch (error) {
        console.error('Error saving event:', error);
        showAlert('Errore nel salvataggio: ' + error.message, 'error');
    }
}

async function loadEvents() {
    const tbody = document.querySelector('#events-table tbody');

    try {
        const { data: events, error } = await supabase
            .from('events')
            .select('*')
            .order('event_date', { ascending: false });

        if (error) throw error;

        if (!events || events.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Nessun evento creato</td></tr>';
            return;
        }

        tbody.innerHTML = events.map(e => {
            const date = new Date(e.event_date);
            const formattedDate = date.toLocaleDateString('it-IT', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            const isPast = date < new Date();
            const link = `../public-site/event.html?slug=${e.shareable_slug}`;

            return `
        <tr>
          <td>
            <strong>${e.title}</strong>
            ${isPast ? '<span class="cms-badge cms-badge-info" style="margin-left: 8px;">Passato</span>' : ''}
          </td>
          <td>${formattedDate}</td>
          <td>${e.location}</td>
          <td>
            <a href="${link}" target="_blank" class="cms-btn cms-btn-sm cms-btn-secondary">Apri</a>
          </td>
          <td>
            <button class="cms-btn cms-btn-sm cms-btn-secondary edit-btn" data-id="${e.id}">Modifica</button>
            <button class="cms-btn cms-btn-sm cms-btn-danger delete-btn" data-id="${e.id}">Elimina</button>
          </td>
        </tr>
      `;
        }).join('');

        // Add event listeners to buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.id;
                const { data: event } = await supabase
                    .from('events')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (event) openModal(event);
            });
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => deleteEvent(btn.dataset.id));
        });

    } catch (error) {
        console.error('Error loading events:', error);
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Errore nel caricamento</td></tr>';
    }
}

async function deleteEvent(id) {
    if (!confirm('Sei sicuro di voler eliminare questo evento? Questa azione è irreversibile.')) {
        return;
    }

    try {
        const { error } = await supabase
            .from('events')
            .delete()
            .eq('id', id);

        if (error) throw error;

        showAlert('Evento eliminato con successo', 'success');
        loadEvents();
    } catch (error) {
        console.error('Error deleting event:', error);
        showAlert('Errore nell\'eliminazione: ' + error.message, 'error');
    }
}

function showAlert(message, type) {
    const container = document.getElementById('alert-container');
    const alert = document.createElement('div');
    alert.className = `cms-alert cms-alert-${type}`;
    alert.textContent = message;
    container.appendChild(alert);

    setTimeout(() => {
        alert.remove();
    }, 5000);
}

// Load events on page load
loadEvents();
