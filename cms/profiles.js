// Profiles Management - Fiori Oscuri CMS
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
const modal = document.getElementById('profile-modal');
const modalTitle = document.getElementById('modal-title');
const profileForm = document.getElementById('profile-form');
const newProfileBtn = document.getElementById('new-profile-btn');
const closeModalBtn = document.getElementById('close-modal');
const cancelBtn = document.getElementById('cancel-btn');

// Open modal for new profile
newProfileBtn.addEventListener('click', () => {
    openModal();
});

// Close modal handlers
closeModalBtn.addEventListener('click', closeModal);
cancelBtn.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

// Form submission
profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    await saveProfile();
});

function openModal(profile = null) {
    if (profile) {
        modalTitle.textContent = 'Modifica Profilo';
        document.getElementById('profile-id').value = profile.id;
        document.getElementById('profile-name').value = profile.name;
        document.getElementById('profile-email').value = profile.email;
        document.getElementById('profile-bio').value = profile.bio || '';
        document.getElementById('profile-avatar').value = profile.avatar_url || '';
    } else {
        modalTitle.textContent = 'Nuovo Profilo';
        profileForm.reset();
        document.getElementById('profile-id').value = '';
    }
    modal.classList.add('active');
}

function closeModal() {
    modal.classList.remove('active');
    profileForm.reset();
}

async function saveProfile() {
    const id = document.getElementById('profile-id').value;
    const profileData = {
        name: document.getElementById('profile-name').value,
        email: document.getElementById('profile-email').value,
        bio: document.getElementById('profile-bio').value || null,
        avatar_url: document.getElementById('profile-avatar').value || null
    };

    try {
        if (id) {
            // Update existing profile
            const { error } = await supabase
                .from('profiles')
                .update(profileData)
                .eq('id', id);

            if (error) throw error;
            showAlert('Profilo aggiornato con successo', 'success');
        } else {
            // Create new profile
            const { error } = await supabase
                .from('profiles')
                .insert([profileData]);

            if (error) throw error;
            showAlert('Profilo creato con successo', 'success');
        }

        closeModal();
        loadProfiles();
    } catch (error) {
        console.error('Error saving profile:', error);
        showAlert('Errore nel salvataggio: ' + error.message, 'error');
    }
}

async function loadProfiles() {
    const tbody = document.querySelector('#profiles-table tbody');

    try {
        const { data: profiles, error } = await supabase
            .from('profile_stats')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw error;

        if (!profiles || profiles.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Nessun profilo creato</td></tr>';
            return;
        }

        tbody.innerHTML = profiles.map(p => `
      <tr>
        <td>
          ${p.avatar_url ? `<img src="${p.avatar_url}" alt="${p.name}" style="width: 30px; height: 30px; border-radius: 50%; object-fit: cover; vertical-align: middle; margin-right: 8px;">` : ''}
          <strong>${p.name}</strong>
        </td>
        <td>${p.email}</td>
        <td><span class="cms-flower-count">🥀 ${p.net_flowers || 0}</span></td>
        <td>${p.total_flowers || 0}</td>
        <td>${p.total_bails || 0}</td>
        <td>
          <button class="cms-btn cms-btn-sm cms-btn-secondary edit-btn" data-id="${p.id}">Modifica</button>
          <button class="cms-btn cms-btn-sm cms-btn-danger delete-btn" data-id="${p.id}">Elimina</button>
        </td>
      </tr>
    `).join('');

        // Add event listeners to buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.id;
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (profile) openModal(profile);
            });
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => deleteProfile(btn.dataset.id));
        });

    } catch (error) {
        console.error('Error loading profiles:', error);
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Errore nel caricamento</td></tr>';
    }
}

async function deleteProfile(id) {
    if (!confirm('Sei sicuro di voler eliminare questo profilo? Questa azione è irreversibile.')) {
        return;
    }

    try {
        const { error } = await supabase
            .from('profiles')
            .delete()
            .eq('id', id);

        if (error) throw error;

        showAlert('Profilo eliminato con successo', 'success');
        loadProfiles();
    } catch (error) {
        console.error('Error deleting profile:', error);
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

// Load profiles on page load
loadProfiles();
