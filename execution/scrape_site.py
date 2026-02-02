"""
Web Scraper for Client Website Analysis
Extracts text content and image URLs from a given website URL.

Usage:
    python scrape_site.py <url>
    
Example:
    python scrape_site.py https://example.com
"""

import sys
import json
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse


def scrape_website(url: str) -> dict:
    """
    Scrape a website and extract text content and image URLs.
    
    Args:
        url: The URL of the website to scrape
        
    Returns:
        Dictionary containing extracted data
    """
    result = {
        "url": url,
        "title": "",
        "meta_description": "",
        "headings": [],
        "paragraphs": [],
        "images": [],
        "links": [],
        "raw_text": ""
    }
    
    try:
        # Set headers to mimic a browser request
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
        
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, "html.parser")
        
        # Extract title
        title_tag = soup.find("title")
        if title_tag:
            result["title"] = title_tag.get_text(strip=True)
        
        # Extract meta description
        meta_desc = soup.find("meta", attrs={"name": "description"})
        if meta_desc:
            result["meta_description"] = meta_desc.get("content", "")
        
        # Extract headings (h1-h6)
        for level in range(1, 7):
            for heading in soup.find_all(f"h{level}"):
                text = heading.get_text(strip=True)
                if text:
                    result["headings"].append({
                        "level": level,
                        "text": text
                    })
        
        # Extract paragraphs
        for p in soup.find_all("p"):
            text = p.get_text(strip=True)
            if text and len(text) > 20:  # Filter out very short paragraphs
                result["paragraphs"].append(text)
        
        # Extract images
        for img in soup.find_all("img"):
            src = img.get("src", "")
            alt = img.get("alt", "")
            if src:
                # Convert relative URLs to absolute
                absolute_url = urljoin(url, src)
                result["images"].append({
                    "url": absolute_url,
                    "alt": alt
                })
        
        # Extract internal links
        base_domain = urlparse(url).netloc
        for a in soup.find_all("a", href=True):
            href = a.get("href", "")
            link_text = a.get_text(strip=True)
            if href and not href.startswith("#"):
                absolute_url = urljoin(url, href)
                parsed = urlparse(absolute_url)
                if parsed.netloc == base_domain:
                    result["links"].append({
                        "url": absolute_url,
                        "text": link_text
                    })
        
        # Extract raw text content
        # Remove script and style elements
        for element in soup(["script", "style", "nav", "footer", "header"]):
            element.decompose()
        
        result["raw_text"] = soup.get_text(separator=" ", strip=True)
        
    except requests.RequestException as e:
        result["error"] = f"Request failed: {str(e)}"
    except Exception as e:
        result["error"] = f"Parsing failed: {str(e)}"
    
    return result


def main():
    if len(sys.argv) < 2:
        print("Usage: python scrape_site.py <url>")
        print("Example: python scrape_site.py https://example.com")
        sys.exit(1)
    
    url = sys.argv[1]
    
    # Ensure URL has a scheme
    if not url.startswith(("http://", "https://")):
        url = "https://" + url
    
    print(f"Scraping: {url}")
    print("-" * 50)
    
    result = scrape_website(url)
    
    # Output as formatted JSON
    print(json.dumps(result, indent=2, ensure_ascii=False))
    
    # Save to file
    output_file = "scraped_data.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2, ensure_ascii=False)
    
    print(f"\nData saved to: {output_file}")


if __name__ == "__main__":
    main()
