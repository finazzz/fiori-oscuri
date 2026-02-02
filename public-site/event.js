// Event Detail Page - Fiori Oscuri
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { SUPABASE_CONFIG } from '../config.js';

const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

// Get event slug from URL parameter
const urlParams = new URLSearchParams(window.location.search);
const eventSlug = urlParams.get('slug') || urlParams.get('id');

async function loadEvent() {
    const container = document.getElementById('event-content');

    if (!eventSlug) {
        container.innerHTML = `
      <section>
        <div class="container-narrow">
          <h2>Evento Non Trovato</h2>
          <p>L'evento che cerchi non esiste o il link non è valido.</p>
          <a href="index.html" class="btn mt-md">Torna alla Home</a>
        </div>
      </section>
    `;
        return;
    }

    try {
        // Fetch event by shareable slug
        const { data: event, error } = await supabase
            .from('events')
            .select('*')
            .eq('shareable_slug', eventSlug)
            .single();

        if (error || !event) {
            throw new Error('Evento non trovato');
        }

        // Format date
        const eventDate = new Date(event.event_date);
        const formattedDate = eventDate.toLocaleDateString('it-IT', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        // Render event
        container.innerHTML = `
      <section class="fade-in">
        <div class="container">
          <div class="event-card" style="max-width: 900px; margin: 0 auto;">
            ${event.image_url ? `<img src="${event.image_url}" alt="${event.title}" class="event-image">` : ''}
            
            <h1 class="event-title">${event.title}</h1>
            
            <div class="event-meta">
              <span>📅 ${formattedDate}</span>
              <span>📍 ${event.location}</span>
            </div>
            
            <div class="event-description">
              ${event.description ? event.description.split('\n').map(p => `<p>${p}</p>`).join('') : '<p>Dettagli in arrivo...</p>'}
            </div>

            <div style="margin-top: var(--spacing-lg); padding-top: var(--spacing-lg); border-top: 1px solid rgba(139, 115, 85, 0.3); text-align: center;">
              <p style="font-size: 0.95rem; color: var(--color-text-light); font-style: italic;">
                Questo è un evento privato riservato ai membri di Fiori Oscuri.<br>
                La partecipazione è solo su invito personale.
              </p>
            </div>
          </div>
        </div>
      </section>
    `;

    } catch (error) {
        console.error('Error loading event:', error);
        container.innerHTML = `
      <section>
        <div class="container-narrow">
          <h2>Evento Non Disponibile</h2>
          <p>Non è stato possibile caricare i dettagli dell'evento.</p>
          <a href="index.html" class="btn mt-md">Torna alla Home</a>
        </div>
      </section>
    `;
    }
}

// Load event on page load
loadEvent();
