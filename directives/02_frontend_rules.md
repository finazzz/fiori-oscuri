# Directive 02: Frontend Rules

## Purpose
Define the technical stack and design requirements for all client websites.

## Tech Stack - MANDATORY

> [!CAUTION]
> **NEVER USE:** React, Next.js, Node.js, npm, Vite, Vue, Angular, or ANY JavaScript framework.
> These are SLOW to set up and cause deployment friction.

**ALWAYS USE:**
- Pure HTML5
- Vanilla CSS (no Tailwind, no SASS)
- Vanilla JavaScript (minimal - only for interactions)

**Deployment:** Static files only - can be hosted anywhere (Netlify, Vercel, cPanel, FTP, etc.)

## File Structure
```
website/
├── index.html
├── [page-name].html     (one file per page)
├── css/
│   └── style.css        (single CSS file)
├── js/
│   └── main.js          (minimal JS)
├── images/
│   └── (optimized images)
└── README.txt           (hosting instructions)
```

## Design Requirements

### General Principles
- **SUPER AESTHETIC:** Premium, modern, visually stunning
- **Mobile-First:** Always design for mobile first, then enhance for desktop
- **Performance:** No frameworks = instant loading

### Required Visual Effects
1. **Hover Effects:** Every button, card, link must have smooth hover transition
2. **Scroll Animations:** Elements fade/slide in on scroll (IntersectionObserver)
3. **Smooth Transitions:** All interactions use `transition: 0.3s ease`

### Mobile Optimization
- **Burger Menu:** Hamburger icon that opens navigation
- **Touch-Friendly:** Minimum 44px tap targets
- **No Horizontal Scroll:** Ever

### Desktop Enhancements
- **Hover States:** Rich hover effects on cards and buttons
- **Sticky Header:** Header that changes on scroll

## CSS Patterns
```css
/* Variables */
:root {
    --primary: #1a1a2e;
    --accent: #e94560;
    --transition: all 0.3s ease;
}

/* Smooth hover */
.btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

/* Scroll reveal */
.reveal {
    opacity: 0;
    transform: translateY(30px);
    transition: all 0.6s ease;
}
.reveal.active {
    opacity: 1;
    transform: translateY(0);
}
```

## Multi-Page Structure
Every website MUST be multi-page. Replicate the client's original site structure:
- Separate HTML files for each page
- Consistent header/footer across pages
- Working navigation links

## Output Format
- Deliver as **ZIP file** ready to upload
- Include README.txt with hosting instructions
- Site and CMS in **SEPARATE ZIP files**
