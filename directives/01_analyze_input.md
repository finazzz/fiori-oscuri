# Directive 01: Analyze Input

## Purpose
Analyze raw client data and extract branding information for website generation.

## Instructions

1. **Read Client Data**
   - Analyze raw data found in `inputs/client_info.md`.

2. **Website Scraping (if applicable)**
   - If a current website URL is provided, execute `execution/scrape_site.py` to extract text and design cues.

3. **Output Requirements**
   - Generate a JSON summary containing:
     - **Primary Colors:** Hex codes for brand colors
     - **Fonts:** Typography used on existing site or suggested fonts
     - **Logo URL:** Path or URL to the client's logo
     - **Tone of Voice:** Professional, casual, playful, etc.
     - **Core Services:** List of main services/offerings

## Example Output
```json
{
  "primary_colors": ["#1a1a2e", "#16213e", "#0f3460"],
  "fonts": ["Inter", "Roboto"],
  "logo_url": "https://example.com/logo.png",
  "tone_of_voice": "Professional and approachable",
  "core_services": ["Web Design", "SEO", "Digital Marketing"]
}
```
