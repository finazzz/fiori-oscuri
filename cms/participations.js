// Participations Management - Fiori Oscuri CMS
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
const modal = document.getElementById('participation-modal');
const modalTitle = document.getElementById('modal-title');
const participationForm = document.getElementById('participation-form');
const newParticipationBtn = document.getElementById('new-participation-btn');
const closeModalBtn = document.getElementById('close-modal');
const cancelBtn = document.getElementById('cancel-btn');

// Filters
const filterEvent = document.getElementById('filter-event');
const filterProfile = document.getElementById('filter-profile');
const filterStatus = document.getElementById('filter-status');

// Open modal for new participation
newParticipationBtn.addEventListener('click', () => {
    openModal();
});

// Close modal handlers
closeModalBtn.addEventListener('click', closeModal);
cancelBtn.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

// Form submission
participationForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    await saveParticipation();
});

// Filter change handlers
filterEvent.addEventListener('change', loadParticipations);
filterProfile.addEventListener('change', loadParticipations);
filterStatus.addEventListener('change', loadParticipations);

async function loadFilterOptions() {
    // Load events
    const { data: events } = await supabase
        .from('events')
        .select('id, title, event_date')
        .order('event_date', { ascending: false });

    if (events) {
        filterEvent.innerHTML = '<option value="">Tutti gli eventi</option>' +
            events.map(e => `<option value="${e.id}">${e.title}</option>`).join('');

        document.getElementById('participation-event').innerHTML =
            '<option value="">Seleziona evento...</option>' +
            events.map(e => `<option value="${e.id}">${e.title}</option>`).join('');
    }

    // Load profiles
    const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name')
        .order('name', { ascending: true });

    if (profiles) {
        filterProfile.innerHTML = '<option value="">Tutti i profili</option>' +
            profiles.map(p => `<option value="${p.id}">${p.name}</option>`).join('');

        document.getElementById('participation-profile').innerHTML =
            '<option value="">Seleziona profilo...</option>' +
            profiles.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
    }
}

function openModal(participation = null) {
    if (participation) {
        modalTitle.textContent = 'Modifica Partecipazione';
        document.getElementById('participation-id').value = participation.id;
        document.getElementById('participation-event').value = participation.event_id;
        document.getElementById('participation-profile').value = participation.profile_id;
        document.getElementById('participation-status').value = participation.status;
    } else {
        modalTitle.textContent = 'Nuova Partecipazione';
        participationForm.reset();
        document.getElementById('participation-id').value = '';
    }
    modal.classList.add('active');
}

function closeModal() {
    modal.classList.remove('active');
    participationForm.reset();
}

async function saveParticipation() {
    const id = document.getElementById('participation-id').value;
    const participationData = {
        event_id: document.getElementById('participation-event').value,
        profile_id: document.getElementById('participation-profile').value,
        status: document.getElementById('participation-status').value
    };

    try {
        if (id) {
            // Update existing participation
            const { error } = await supabase
                .from('participations')
                .update(participationData)
                .eq('id', id);

            if (error) throw error;
            showAlert('Partecipazione aggiornata. Fiori ricalcolati automaticamente!', 'success');
        } else {
            // Create new participation
            const { error } = await supabase
                .from('participations')
                .insert([participationData]);

            if (error) throw error;
            showAlert('Partecipazione creata. Fiori aggiornati automaticamente!', 'success');
        }

        closeModal();
        loadParticipations();
    } catch (error) {
        console.error('Error saving participation:', error);
        showAlert('Errore: ' + error.message, 'error');
    }
}

async function loadParticipations() {
    const tbody = document.querySelector('#participations-table tbody');

    try {
        let query = supabase
            .from('participations')
            .select(`
        *,
        profiles:profile_id (name, id),
        events:event_id (title, event_date)
      `)
            .order('created_at', { ascending: false });

        // Apply filters
        if (filterEvent.value) {
            query = query.eq('event_id', filterEvent.value);
        }
        if (filterProfile.value) {
            query = query.eq('profile_id', filterProfile.value);
        }
        if (filterStatus.value) {
            query = query.eq('status', filterStatus.value);
        }

        const { data: participations, error } = await query;

        if (error) throw error;

        if (!participations || participations.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Nessuna partecipazione trovata</td></tr>';
            return;
        }

        // Get current flower counts for all profiles
        const profileIds = [...new Set(participations.map(p => p.profile_id))];
        const { data: flowersData } = await supabase
            .from('profile_stats')
            .select('id, net_flowers')
            .in('id', profileIds);

        const flowersMap = {};
        flowersData?.forEach(f => {
            flowersMap[f.id] = f.net_flowers;
        });

        tbody.innerHTML = participations.map(p => {
            let statusBadge = '';
            if (p.status === 'confirmed') {
                statusBadge = '<span class="cms-badge cms-badge-warning">Confermato</span>';
            } else if (p.status === 'attended') {
                statusBadge = '<span class="cms-badge cms-badge-success">Partecipato</span>';
            } else if (p.status === 'bailed') {
                statusBadge = '<span class="cms-badge cms-badge-danger">Saltato</span>';
            }

            const netFlowers = flowersMap[p.profile_id] || 0;

            return `
        <tr>
          <td><strong>${p.events?.title || 'N/A'}</strong></td>
          <td>${p.profiles?.name || 'N/A'}</td>
          <td>${statusBadge}</td>
          <td><span class="cms-flower-count">🥀 ${netFlowers}</span></td>
          <td>
            <button class="cms-btn cms-btn-sm cms-btn-secondary edit-btn" data-id="${p.id}">Modifica</button>
            <button class="cms-btn cms-btn-sm cms-btn-danger delete-btn" data-id="${p.id}">Elimina</button>
          </td>
        </tr>
      `;
        }).join('');

        // Add event listeners to buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.id;
                const participation = participations.find(p => p.id === id);
                if (participation) openModal(participation);
            });
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => deleteParticipation(btn.dataset.id));
        });

    } catch (error) {
        console.error('Error loading participations:', error);
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Errore nel caricamento</td></tr>';
    }
}

async function deleteParticipation(id) {
    if (!confirm('Eliminare questa partecipazione? I fiori verranno ricalcolati.')) {
        return;
    }

    try {
        const { error } = await supabase
            .from('participations')
            .delete()
            .eq('id', id);

        if (error) throw error;

        showAlert('Partecipazione eliminata. Fiori aggiornati!', 'success');
        loadParticipations();
    } catch (error) {
        console.error('Error deleting participation:', error);
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

// Load data on page load
loadFilterOptions();
loadParticipations();
