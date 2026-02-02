// Dashboard - Fiori Oscuri CMS
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

// Load dashboard data
async function loadDashboard() {
    try {
        // Get total profiles
        const { count: profileCount } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true });

        document.getElementById('stat-profiles').textContent = profileCount || 0;

        // Get total events
        const { count: eventCount } = await supabase
            .from('events')
            .select('*', { count: 'exact', head: true });

        document.getElementById('stat-events').textContent = eventCount || 0;

        // Get upcoming events count
        const { count: upcomingCount } = await supabase
            .from('events')
            .select('*', { count: 'exact', head: true })
            .gte('event_date', new Date().toISOString());

        document.getElementById('stat-upcoming').textContent = upcomingCount || 0;

        // Get total flowers
        const { data: flowersData } = await supabase
            .from('flowers')
            .select('total_flowers');

        const totalFlowers = flowersData?.reduce((sum, f) => sum + (f.total_flowers || 0), 0) || 0;
        document.getElementById('stat-flowers').textContent = totalFlowers;

        // Load recent profiles
        await loadRecentProfiles();

        // Load upcoming events
        await loadUpcomingEvents();

    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

async function loadRecentProfiles() {
    const { data: profiles, error } = await supabase
        .from('profile_stats')
        .select('*')
        .order('id', { ascending: false })
        .limit(5);

    const tbody = document.querySelector('#recent-profiles tbody');

    if (error || !profiles || profiles.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Nessun profilo</td></tr>';
        return;
    }

    tbody.innerHTML = profiles.map(p => `
    <tr>
      <td>${p.name}</td>
      <td>${p.email}</td>
      <td><span class="cms-flower-count">🥀 ${p.net_flowers || 0}</span></td>
      <td>${p.total_bails || 0}</td>
      <td>${new Date().toLocaleDateString('it-IT')}</td>
    </tr>
  `).join('');
}

async function loadUpcomingEvents() {
    const { data: events, error } = await supabase
        .from('events')
        .select('*')
        .gte('event_date', new Date().toISOString())
        .order('event_date', { ascending: true })
        .limit(5);

    const tbody = document.querySelector('#upcoming-events tbody');

    if (error || !events || events.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Nessun evento futuro</td></tr>';
        return;
    }

    tbody.innerHTML = events.map(e => {
        const date = new Date(e.event_date).toLocaleDateString('it-IT', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });

        return `
      <tr>
        <td>${e.title}</td>
        <td>${date}</td>
        <td>${e.location}</td>
        <td><a href="../public-site/event.html?slug=${e.shareable_slug}" target="_blank" class="cms-btn cms-btn-sm cms-btn-secondary">Visualizza</a></td>
      </tr>
    `;
    }).join('');
}

// Load dashboard on page load
loadDashboard();
