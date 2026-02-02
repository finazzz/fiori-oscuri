# Directive 04: Website Scraping Workflow

## Purpose
Define the standard process for scraping client websites to extract branding and content.

## When to Scrape
- Client provides an existing website URL in `inputs/client_info.md`
- Need to extract: content, structure, branding, images, products/services

## Scraping Tools

### Tool Priority
1. **`read_url_content`** - Fast, works for static HTML pages
2. **Browser Subagent** - For JS-rendered SPAs, dynamic content
3. **Python Scraper** - Fallback when browser fails, or for batch scraping

### Available Scripts
- `execution/scrape_site.py` - Generic scraper for any URL
- `execution/scrape_mediteck.py` - Example client-specific scraper

## Scraping Procedure

### Step 1: Initial Analysis
```
read_url_content <homepage_url>
```
Identify:
- Site structure (multi-page or SPA)
- Navigation links
- Main sections

### Step 2: Find All Pages
Look for:
- Navigation menu links
- Footer links
- Anchor-based navigation (e.g., `page.htm#SECTION`)
- Common paths: `/chi-siamo`, `/contatti`, `/servizi`, `/prodotti`

### Step 3: Extract Content
For each page, extract:
- Page title
- All headings (H1-H6)
- Paragraph content
- Image URLs and alt text
- Internal/external links
- Contact information

### Step 4: Create Client Profile
Save extracted data to `inputs/client_info.md` with:
```markdown
## Branding Estratto
```json
{
  "primary_colors": ["#hex1", "#hex2"],
  "fonts": ["Font1", "Font2"],
  "logo_url": "...",
  "tone_of_voice": "...",
  "language": "..."
}
```

## Sezioni/Prodotti
[List all sections with descriptions]

## Note per Redesign
[Technical observations about current site]
```

## Output Formats

### JSON Summary
Save to `execution/<client>_scraped_data.json`:
```json
{
  "base_url": "...",
  "scraped_at": "...",
  "pages": [
    {
      "url": "...",
      "title": "...",
      "headings": [...],
      "paragraphs": [...],
      "images": [...],
      "links": [...]
    }
  ]
}
```

## Error Handling
- 404 errors: Page doesn't exist, skip it
- Encoding issues: Use UTF-8, handle special chars
- Large sites: Limit to main sections only
- Rate limiting: Add 0.5-1s delay between requests

## Self-Learning
When scraping fails or produces unexpected results:
1. Analyze the error
2. Fix the scraper script
3. Update this directive if it's a repeatable issue
