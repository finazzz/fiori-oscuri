// Fiori Oscuri - Internationalization (i18n)
const translations = {
    it: {
        // General
        fiori_oscuri: "Fiori Oscuri",
        enter: "Entra",

        // Navigation
        manifesto: "Manifesto",
        next_event: "Next Event",
        account: "Account",
        faq: "FAQ",

        // Login
        login_title: "Accedi",
        phone_label: "Telefono",
        password_label: "Password",
        login_button: "Accedi",
        logging_in: "Accesso in corso...",
        whatsapp_note: "Riceverai un codice di verifica su WhatsApp",
        no_account: "Non hai un account?",
        register_link: "Registrati",

        // Register
        register_title: "Registrati",
        name_label: "Nome",
        name_placeholder: "Come vuoi essere chiamato",
        phone_placeholder: "333 123 4567",
        city_label: "Città",
        city_placeholder: "Seleziona la tua città",
        password_placeholder: "Minimo 6 caratteri",
        confirm_password: "Conferma Password",
        repeat_password: "Ripeti la password",
        register_button: "Registrati",
        registering: "Registrazione...",
        have_account: "Hai già un account?",
        login_link: "Accedi",
        invite_alert: "Hai un invito! Completa la registrazione per ricevere il tuo primo fiore.",
        welcome: "Benvenuto",
        check_whatsapp: "Controlla WhatsApp per confermare il tuo account.",
        go_to_login: "Vai al Login",
        passwords_mismatch: "Le password non corrispondono",

        // Account
        profile_title: "Il Tuo Profilo",
        flowers: "Fiori",
        events: "Eventi",
        invites: "Inviti",
        invite_friend: "Invita un Amico",
        refresh: "Aggiorna",
        logout: "Esci",

        // FAQ
        faq_title: "Domande Frequenti",
        faq_subtitle: "Tutto quello che devi sapere sul cerchio.",

        // Cities
        milano: "Milano",
        roma: "Roma",
        madrid: "Madrid",
        londra: "Londra"
    },
    en: {
        // General
        fiori_oscuri: "Fiori Oscuri",
        enter: "Enter",

        // Navigation
        manifesto: "Manifesto",
        next_event: "Next Event",
        account: "Account",
        faq: "FAQ",

        // Login
        login_title: "Login",
        phone_label: "Phone",
        password_label: "Password",
        login_button: "Login",
        logging_in: "Logging in...",
        whatsapp_note: "You will receive a verification code on WhatsApp",
        no_account: "Don't have an account?",
        register_link: "Register",

        // Register
        register_title: "Register",
        name_label: "Name",
        name_placeholder: "How would you like to be called",
        phone_placeholder: "333 123 4567",
        city_label: "City",
        city_placeholder: "Select your city",
        password_placeholder: "Minimum 6 characters",
        confirm_password: "Confirm Password",
        repeat_password: "Repeat password",
        register_button: "Register",
        registering: "Registering...",
        have_account: "Already have an account?",
        login_link: "Login",
        invite_alert: "You have an invite! Complete registration to receive your first flower.",
        welcome: "Welcome",
        check_whatsapp: "Check WhatsApp to confirm your account.",
        go_to_login: "Go to Login",
        passwords_mismatch: "Passwords do not match",

        // Account
        profile_title: "Your Profile",
        flowers: "Flowers",
        events: "Events",
        invites: "Invites",
        invite_friend: "Invite a Friend",
        refresh: "Refresh",
        logout: "Logout",

        // FAQ
        faq_title: "Frequently Asked Questions",
        faq_subtitle: "Everything you need to know about the circle.",

        // Cities
        milano: "Milan",
        roma: "Rome",
        madrid: "Madrid",
        londra: "London"
    },
    es: {
        // General
        fiori_oscuri: "Fiori Oscuri",
        enter: "Entrar",

        // Navigation
        manifesto: "Manifesto",
        next_event: "Próximo Evento",
        account: "Cuenta",
        faq: "FAQ",

        // Login
        login_title: "Iniciar Sesión",
        phone_label: "Teléfono",
        password_label: "Contraseña",
        login_button: "Entrar",
        logging_in: "Iniciando sesión...",
        whatsapp_note: "Recibirás un código de verificación en WhatsApp",
        no_account: "¿No tienes cuenta?",
        register_link: "Regístrate",

        // Register
        register_title: "Registrarse",
        name_label: "Nombre",
        name_placeholder: "¿Cómo quieres que te llamen?",
        phone_placeholder: "333 123 4567",
        city_label: "Ciudad",
        city_placeholder: "Selecciona tu ciudad",
        password_placeholder: "Mínimo 6 caracteres",
        confirm_password: "Confirmar Contraseña",
        repeat_password: "Repetir contraseña",
        register_button: "Registrarse",
        registering: "Registrando...",
        have_account: "¿Ya tienes cuenta?",
        login_link: "Inicia sesión",
        invite_alert: "¡Tienes una invitación! Completa el registro para recibir tu primera flor.",
        welcome: "Bienvenido",
        check_whatsapp: "Revisa WhatsApp para confirmar tu cuenta.",
        go_to_login: "Ir al Login",
        passwords_mismatch: "Las contraseñas no coinciden",

        // Account
        profile_title: "Tu Perfil",
        flowers: "Flores",
        events: "Eventos",
        invites: "Invitaciones",
        invite_friend: "Invitar a un Amigo",
        refresh: "Actualizar",
        logout: "Salir",

        // FAQ
        faq_title: "Preguntas Frecuentes",
        faq_subtitle: "Todo lo que necesitas saber sobre el círculo.",

        // Cities
        milano: "Milán",
        roma: "Roma",
        madrid: "Madrid",
        londra: "Londres"
    }
};

// i18n helper
const i18n = {
    currentLang: localStorage.getItem('lang') || 'it',

    t(key) {
        return translations[this.currentLang]?.[key] || translations.it[key] || key;
    },

    setLang(lang) {
        this.currentLang = lang;
        localStorage.setItem('lang', lang);
        this.updatePage();
    },

    updatePage() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            el.textContent = this.t(key);
        });

        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            el.placeholder = this.t(key);
        });

        // Update lang buttons
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.textContent.toLowerCase() === this.currentLang);
        });
    }
};

// Global function for buttons
function setLang(lang) {
    i18n.setLang(lang);
}

// On page load
document.addEventListener('DOMContentLoaded', () => {
    i18n.updatePage();
});
