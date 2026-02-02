/**
 * FIORI OSCURI - Admin Dashboard JavaScript
 * Shared utilities for all admin pages
 */

// Supabase Configuration
const SUPABASE_URL = 'https://mfkvkqflomqqngogdfrn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ma3ZrcWZsb21xcW5nb2dkZnJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzOTYyNzgsImV4cCI6MjA4NDk3MjI3OH0.QgaU5Objhr0LD6ulGKhVZWEAw9P2_vOYST5DspOdIZk';

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Flower Images by Strike Level
const FLOWER_IMAGES = {
    0: '../branding/Use For Website/Fiore - 0 strike.png',
    1: '../branding/Use For Website/Fiore - 1 strike.png',
    2: '../branding/Use For Website/fiore - 2 strike.png',
    3: '../branding/Use For Website/Fiore morto - 3 strike.png'
};

/**
 * Format date for display
 */
function formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('it-IT', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Format short date
 */
function formatShortDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('it-IT', {
        day: 'numeric',
        month: 'short'
    });
}

/**
 * Show toast notification
 */
function showToast(message, type = 'success') {
    // Remove existing toast
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/**
 * Get URL parameter
 */
function getParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

/**
 * Navigate to page
 */
function navigate(page, params = {}) {
    const url = new URL(page, window.location.href);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    window.location.href = url.toString();
}

/**
 * Load dashboard stats
 */
async function loadDashboardStats() {
    const { data: profiles } = await sb.from('profiles').select('flower_count, wilted_flowers, is_frozen');
    const { data: events } = await sb.from('events').select('id');
    const { data: invites } = await sb.from('invites').select('id, used');

    const totalFlowers = profiles?.reduce((sum, p) => sum + (p.flower_count || 0), 0) || 0;
    const wiltedFlowers = profiles?.reduce((sum, p) => sum + (p.wilted_flowers || 0), 0) || 0;
    const activeUsers = profiles?.filter(p => !p.is_frozen).length || 0;

    return {
        totalUsers: profiles?.length || 0,
        activeUsers,
        frozenUsers: (profiles?.length || 0) - activeUsers,
        totalEvents: events?.length || 0,
        totalFlowers,
        wiltedFlowers,
        totalInvites: invites?.length || 0,
        usedInvites: invites?.filter(i => i.used).length || 0
    };
}

/**
 * Load all users
 */
async function loadUsers(search = '') {
    let query = sb.from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

    if (search) {
        query = query.or(`display_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
}

/**
 * Load single user by ID
 */
async function loadUser(userId) {
    const { data, error } = await sb
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) throw error;
    return data;
}

/**
 * Update user profile
 */
async function updateUser(userId, updates) {
    const { error } = await sb
        .from('profiles')
        .update(updates)
        .eq('id', userId);

    if (error) throw error;
    return true;
}

/**
 * Load user's flowers (from flower_transactions or generate from count)
 */
async function loadUserFlowers(userId) {
    // Try to load from a flowers table first
    const { data: flowers, error } = await sb
        .from('flowers')
        .select('*')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false });

    // If no flowers table or error, return empty
    if (error || !flowers || flowers.length === 0) {
        // Generate placeholder flowers based on profile count
        const { data: profile } = await sb
            .from('profiles')
            .select('flower_count, wilted_flowers')
            .eq('id', userId)
            .single();

        if (!profile) return [];

        const flowers = [];
        for (let i = 0; i < (profile.flower_count || 0); i++) {
            flowers.push({
                id: `active-${i}`,
                strikes: 0,
                is_wilted: false,
                owner_id: userId
            });
        }
        for (let i = 0; i < (profile.wilted_flowers || 0); i++) {
            flowers.push({
                id: `wilted-${i}`,
                strikes: 3,
                is_wilted: true,
                owner_id: userId
            });
        }
        return flowers;
    }

    return flowers;
}

/**
 * Add flower to user
 */
async function addFlower(userId) {
    // Try to insert into flowers table
    try {
        await sb.from('flowers').insert({
            owner_id: userId,
            strikes: 0,
            is_wilted: false
        });
    } catch (e) {
        // Fallback: just increment count
    }

    // Update profile count
    const { data: profile } = await sb.from('profiles')
        .select('flower_count')
        .eq('id', userId)
        .single();

    await sb.from('profiles').update({
        flower_count: (profile?.flower_count || 0) + 1,
        is_frozen: false
    }).eq('id', userId);

    // Log transaction
    await sb.from('flower_transactions').insert({
        to_user_id: userId,
        amount: 1,
        transaction_type: 'admin_grant',
        notes: 'Aggiunto da admin'
    });

    showToast('Fiore aggiunto');
}

/**
 * Remove flower from user
 */
async function removeFlower(userId, flowerId = null) {
    const { data: profile } = await sb.from('profiles')
        .select('flower_count')
        .eq('id', userId)
        .single();

    const newCount = Math.max(0, (profile?.flower_count || 0) - 1);

    // Try to delete from flowers table
    if (flowerId) {
        await sb.from('flowers').delete().eq('id', flowerId);
    }

    // Update profile
    await sb.from('profiles').update({
        flower_count: newCount,
        is_frozen: newCount === 0
    }).eq('id', userId);

    // Log transaction
    await sb.from('flower_transactions').insert({
        from_user_id: userId,
        amount: -1,
        transaction_type: 'admin_remove',
        notes: 'Rimosso da admin'
    });

    showToast('Fiore rimosso');
}

/**
 * Add strike to flower
 * RULE: Only ONE flower per user can be in transitional state (1 or 2 strikes)
 */
async function addStrike(flowerId) {
    const { data: flower } = await sb
        .from('flowers')
        .select('strikes, owner_id')
        .eq('id', flowerId)
        .single();

    if (!flower) return;

    const currentStrikes = flower.strikes || 0;
    const newStrikes = Math.min(3, currentStrikes + 1);

    // If this flower is healthy (0 strikes) and we're adding a strike,
    // check if there's already a transitional flower (1-2 strikes)
    if (currentStrikes === 0) {
        const { data: transitionalFlowers } = await sb
            .from('flowers')
            .select('id')
            .eq('owner_id', flower.owner_id)
            .gte('strikes', 1)
            .lte('strikes', 2);

        if (transitionalFlowers && transitionalFlowers.length > 0) {
            showToast('C\'è già un fiore in stato transitorio. Finisci quello prima!', 'error');
            return;
        }
    }

    const isWilted = newStrikes >= 3;

    await sb.from('flowers').update({
        strikes: newStrikes,
        is_wilted: isWilted
    }).eq('id', flowerId);

    // If flower is now wilted, update profile wilted_flowers count
    if (isWilted && !flower.is_wilted) {
        const { data: profile } = await sb.from('profiles')
            .select('flower_count, wilted_flowers')
            .eq('id', flower.owner_id)
            .single();

        await sb.from('profiles').update({
            flower_count: Math.max(0, (profile?.flower_count || 0) - 1),
            wilted_flowers: (profile?.wilted_flowers || 0) + 1
        }).eq('id', flower.owner_id);
    }

    showToast(`Strike aggiunto (${newStrikes}/3)${isWilted ? ' - Fiore morto!' : ''}`);
}

/**
 * Remove strike from flower
 */
async function removeStrike(flowerId) {
    const { data: flower } = await sb
        .from('flowers')
        .select('strikes, is_wilted, owner_id')
        .eq('id', flowerId)
        .single();

    if (!flower) return;

    const currentStrikes = flower.strikes || 0;
    if (currentStrikes === 0) {
        showToast('Questo fiore non ha strike da rimuovere', 'error');
        return;
    }

    const newStrikes = currentStrikes - 1;
    const wasWilted = flower.is_wilted;

    // If removing from wilted (3) to transitional (2), check rule
    if (currentStrikes === 3) {
        const { data: transitionalFlowers } = await sb
            .from('flowers')
            .select('id')
            .eq('owner_id', flower.owner_id)
            .gte('strikes', 1)
            .lte('strikes', 2)
            .neq('id', flowerId);

        if (transitionalFlowers && transitionalFlowers.length > 0) {
            showToast('C\'è già un fiore in stato transitorio!', 'error');
            return;
        }
    }

    await sb.from('flowers').update({
        strikes: newStrikes,
        is_wilted: false
    }).eq('id', flowerId);

    // If flower was wilted and now isn't, update counts
    if (wasWilted) {
        const { data: profile } = await sb.from('profiles')
            .select('flower_count, wilted_flowers')
            .eq('id', flower.owner_id)
            .single();

        await sb.from('profiles').update({
            flower_count: (profile?.flower_count || 0) + 1,
            wilted_flowers: Math.max(0, (profile?.wilted_flowers || 0) - 1)
        }).eq('id', flower.owner_id);
    }

    showToast(`Strike rimosso (${newStrikes}/3)`);
}

/**
 * Toggle user freeze status
 */
async function toggleFreeze(userId, currentStatus) {
    await sb.from('profiles').update({
        is_frozen: !currentStatus
    }).eq('id', userId);

    showToast(currentStatus ? 'Utente sbloccato' : 'Utente congelato');
}

/**
 * Load all events
 */
async function loadEvents() {
    const { data, error } = await sb
        .from('events')
        .select('*')
        .order('event_date', { ascending: false });

    if (error) throw error;
    return data || [];
}

/**
 * Load single event
 */
async function loadEvent(eventId) {
    const { data, error } = await sb
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

    if (error) throw error;
    return data;
}

/**
 * Create/update event
 */
async function saveEvent(eventData, eventId = null) {
    if (eventId) {
        const { error } = await sb.from('events').update(eventData).eq('id', eventId);
        if (error) throw error;
        showToast('Evento aggiornato');
    } else {
        const { error } = await sb.from('events').insert(eventData);
        if (error) throw error;
        showToast('Evento creato');
    }
}

/**
 * Delete event
 */
async function deleteEvent(eventId) {
    if (!confirm('Eliminare questo evento?')) return false;

    const { error } = await sb.from('events').delete().eq('id', eventId);
    if (error) throw error;
    showToast('Evento eliminato');
    return true;
}

/**
 * Load event participations
 */
async function loadParticipations(eventId) {
    const { data, error } = await sb
        .from('participations')
        .select('*, profiles(display_name, email)')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
}

/**
 * Load user transactions
 */
async function loadUserTransactions(userId) {
    const { data, error } = await sb
        .from('flower_transactions')
        .select('*')
        .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
        .order('created_at', { ascending: false })
        .limit(20);

    if (error) throw error;
    return data || [];
}

/**
 * Load user participations
 */
async function loadUserParticipations(userId) {
    const { data, error } = await sb
        .from('participations')
        .select('*, events(title, event_date)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
}

/**
 * Get flower image path by strike count
 */
function getFlowerImage(strikes) {
    const level = Math.min(3, Math.max(0, strikes || 0));
    return FLOWER_IMAGES[level];
}

/**
 * Render sidebar active state
 */
function initSidebar() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.sidebar-link').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
        }
    });
}

// Initialize sidebar on DOM ready
document.addEventListener('DOMContentLoaded', initSidebar);

/**
 * Create new user (manual creation from CMS)
 */
async function createUser(userData) {
    // Check if phone already exists
    if (userData.phone) {
        const { data: existing } = await sb
            .from('profiles')
            .select('id')
            .eq('phone', userData.phone)
            .maybeSingle();

        if (existing) {
            throw new Error('Questo numero è già registrato!');
        }
    }

    // Generate a unique ID for the profile
    const { data, error } = await sb
        .from('profiles')
        .insert({
            display_name: userData.display_name,
            phone: userData.phone || null,
            city: userData.city || null,
            instagram_username: userData.instagram_username || null,
            flower_count: 1,  // Start with 1 flower
            wilted_flowers: 0,
            is_frozen: false
        })
        .select()
        .single();

    if (error) throw error;

    // Add initial flower
    await sb.from('flowers').insert({
        owner_id: data.id,
        strikes: 0,
        is_wilted: false
    });

    // Log transaction
    await sb.from('flower_transactions').insert({
        to_user_id: data.id,
        amount: 1,
        transaction_type: 'welcome_bonus',
        notes: 'Fiore di benvenuto'
    });

    showToast('Utente creato con successo!');
    return data;
}

/**
 * Delete user
 */
async function deleteUser(userId) {
    const { error } = await sb
        .from('profiles')
        .delete()
        .eq('id', userId);

    if (error) throw error;
    showToast('Utente eliminato');
    return true;
}

// Export for use in HTML
window.admin = {
    sb,
    loadDashboardStats,
    loadUsers,
    loadUser,
    updateUser,
    createUser,
    deleteUser,
    loadUserFlowers,
    addFlower,
    removeFlower,
    addStrike,
    removeStrike,
    toggleFreeze,
    loadEvents,
    loadEvent,
    saveEvent,
    deleteEvent,
    loadParticipations,
    loadUserTransactions,
    loadUserParticipations,
    getFlowerImage,
    showToast,
    formatDate,
    formatShortDate,
    getParam,
    navigate
};
