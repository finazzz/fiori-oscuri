# Directive 03: CMS Boomer-Proof

## Purpose
Define the CMS design principles for maximum simplicity.

## Core Principle

> [!IMPORTANT]
> The CMS must be usable by someone who has never used a computer before.
> If it looks like Wix or WordPress, you've made it too complex.

## Tech Stack
- **Pure HTML + CSS + Vanilla JS**
- **LocalStorage** for saving (no backend needed initially)
- **Static files** - can be hosted on any domain

## CMS Layout

```
┌─────────────────────────────────────────────────────────┐
│  LOGO CMS                                    [SALVA]    │
├──────────────┬──────────────────────────────────────────┤
│              │                                          │
│  PAGINE      │   SEZIONE: [Nome Sezione]               │
│              │   ─────────────────────────              │
│  ► Homepage  │   Campo 1:                               │
│    Prodotti  │   ┌─────────────────────────────────┐   │
│    Contatti  │   │ [valore attuale]                │   │
│              │   └─────────────────────────────────┘   │
│  ─────────── │                                          │
│              │   Campo 2:                               │
│  CATEGORIE   │   ┌─────────────────────────────────┐   │
│              │   │ [valore attuale]                │   │
│  ► RECON     │   └─────────────────────────────────┘   │
│    SPORTMED  │                                          │
│    etc...    │   [+ AGGIUNGI PRODOTTO]                  │
│              │                                          │
└──────────────┴──────────────────────────────────────────┘
```

## UI Rules

### Sidebar (Left)
- Fixed width (280px)
- Dark background
- Big buttons (15px padding minimum)
- Clear section labels
- Active state highlighted

### Editor Area (Right)
- White background
- Sections in cards
- HUGE input fields (18px font, 18px padding)
- Clear labels above each field

### Save Button
- ALWAYS visible (top-right, sticky)
- BIG (minimum 15px padding, 1.1rem font)
- RED/HIGHLIGHT color
- Shows confirmation when clicked

## What NOT to Include
- ❌ Drag-and-drop
- ❌ WYSIWYG editors
- ❌ Color pickers
- ❌ Font selectors
- ❌ Layout builders
- ❌ Image uploaders (use URL input instead)
- ❌ Any styling options

## What TO Include
- ✅ Text inputs
- ✅ Textareas
- ✅ Simple select dropdowns
- ✅ Add/Delete product buttons
- ✅ Big save button
- ✅ Toast notification on save

## Separate Hosting
CMS and Website are in SEPARATE ZIP files:
- `website.zip` → Host on main domain
- `cms.zip` → Host on subdomain (admin.domain.com)

The CMS exports content.json that can be used to update the site.
