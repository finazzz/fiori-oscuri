# Directive 00: Environment Setup

## Purpose
Document the environment setup and troubleshooting procedures learned during project initialization.

## Windows Environment Setup

### Python Installation
If Python is not found, install via winget:
```powershell
winget install Python.Python.3.12 --accept-package-agreements --accept-source-agreements
```

After installation, refresh PATH:
```powershell
$env:PATH = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
```

Use `py -3` instead of `python` on Windows for reliability:
```powershell
py -3 -m pip install <package>
py -3 script.py
```

### Node.js Installation
```powershell
winget install OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
```

### Required Python Packages
```powershell
py -3 -m pip install requests beautifulsoup4 lxml
```

## Browser Tool Limitations
The browser subagent may fail with Playwright environment errors (`$HOME not set`). 
When this happens, fall back to Python-based scraping with requests + BeautifulSoup.

## Scraping Strategy
1. **First attempt:** Use `read_url_content` tool for simple pages
2. **If JS-rendered:** Use browser subagent
3. **If browser fails:** Use Python scraper (`execution/scrape_site.py` or custom)

## Self-Learning Notes
- Windows PATH refresh required after package installation
- Use `py -3` instead of `python` on Windows
- Some sites use anchor-based navigation (e.g., `page.htm#SECTION`) - scrape the main page URL only
