/*
 * FIORI OSCURI - Shared JavaScript
 * Supabase client + auth + utilities
 */

// Supabase config
const SUPABASE_URL = 'https://mfkvkqflomqqngogdfrn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ma3ZrcWZsb21xcW5nb2dkZnJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzOTYyNzgsImV4cCI6MjA4NDk3MjI3OH0.QgaU5Objhr0LD6ulGKhVZWEAw9P2_vOYST5DspOdIZk';

// Initialize Supabase
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ============================================
// AUTH STATE
// ============================================
let currentUser = null;
let currentProfile = null;

async function initAuth() {
    const { data: { session } } = await sb.auth.getSession();
    if (session?.user) {
        currentUser = session.user;
        await fetchProfile(session.user.id);
    }
    updateNavbar();

    // Listen for auth changes
    sb.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
            currentUser = session.user;
            await fetchProfile(session.user.id);
        } else {
            currentUser = null;
            currentProfile = null;
        }
        updateNavbar();
    });
}

async function fetchProfile(userId) {
    const { data, error } = await sb
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (!error && data) {
        currentProfile = data;
    }
}

// ============================================
// AUTH FUNCTIONS
// ============================================
async function signIn(email, password) {
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
}

async function signUp(email, password, displayName) {
    const { data, error } = await sb.auth.signUp({
        email,
        password,
        options: { data: { display_name: displayName } }
    });
    if (error) throw error;

    // Create profile
    if (data.user) {
        await sb.from('profiles').insert({
            id: data.user.id,
            display_name: displayName,
            email: email,
            flower_count: 0,
            is_frozen: true
        });
    }

    return data;
}

async function signOut() {
    await sb.auth.signOut();
    currentUser = null;
    currentProfile = null;
    window.location.href = '/';
}

// ============================================
// INVITE CODE
// ============================================
async function processInviteCode(inviteCode, userId) {
    try {
        // Find pending invite
        const { data: invite, error } = await sb
            .from('invites')
            .select('*')
            .eq('invite_code', inviteCode)
            .eq('status', 'pending')
            .single();

        if (error || !invite) return false;

        // Update invite status
        await sb.from('invites').update({
            status: 'accepted',
            invited_user_id: userId
        }).eq('id', invite.id);

        // Give flower to new user
        await sb.from('profiles').update({
            flower_count: 1,
            is_frozen: false
        }).eq('id', userId);

        // Log transaction
        await sb.from('flower_transactions').insert({
            to_user_id: userId,
            from_user_id: invite.inviter_id,
            amount: 1,
            transaction_type: 'invite_accepted'
        });

        return true;
    } catch (e) {
        console.error('Invite error:', e);
        return false;
    }
}

// ============================================
// NAVBAR
// ============================================
function updateNavbar() {
    const flowerEl = document.querySelector('.navbar-flowers');
    const loginLink = document.querySelector('.nav-login');
    const accountLink = document.querySelector('.nav-account');

    if (currentUser && currentProfile) {
        if (flowerEl) {
            flowerEl.classList.remove('hidden');
            flowerEl.querySelector('span').textContent = currentProfile.flower_count || 0;
        }
        if (loginLink) loginLink.classList.add('hidden');
        if (accountLink) accountLink.classList.remove('hidden');
    } else {
        if (flowerEl) flowerEl.classList.add('hidden');
        if (loginLink) loginLink.classList.remove('hidden');
        if (accountLink) accountLink.classList.add('hidden');
    }
}

// ============================================
// BURGER MENU
// ============================================
function initBurgerMenu() {
    const burger = document.querySelector('.burger');
    const mobileMenu = document.querySelector('.mobile-menu');

    if (burger && mobileMenu) {
        burger.addEventListener('click', () => {
            burger.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
        });

        // Close on link click
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                burger.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }
}

// ============================================
// SCROLL REVEAL
// ============================================
function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    reveals.forEach(el => observer.observe(el));
}

// ============================================
// UTILITIES
// ============================================
function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('it-IT', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

function formatTime(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('it-IT', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

function showMessage(message, isError = false) {
    // Create or get message element
    let msg = document.getElementById('app-message');
    if (!msg) {
        msg = document.createElement('div');
        msg.id = 'app-message';
        msg.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            padding: 1rem 1.5rem;
            border: 1px solid var(--gold);
            background: var(--bg);
            color: var(--gold);
            z-index: 9999;
            opacity: 0;
            transition: opacity 0.3s;
        `;
        document.body.appendChild(msg);
    }

    msg.textContent = message;
    msg.style.borderColor = isError ? '#8b3a3a' : 'var(--gold)';
    msg.style.color = isError ? '#d88' : 'var(--gold)';
    msg.style.opacity = '1';

    setTimeout(() => { msg.style.opacity = '0'; }, 3000);
}

// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', async () => {
    await initAuth();
    initBurgerMenu();
    initScrollReveal();
});
