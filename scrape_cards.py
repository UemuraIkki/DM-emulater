import requests
from bs4 import BeautifulSoup
import json
import os
import time
import concurrent.futures
from urllib.parse import urljoin

# Configuration
BASE_URL = "https://dm.takaratomy.co.jp/card/"
OUTPUT_DIR = "public/data"
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "cards.json")
MAX_PAGES = 500  # Set to a higher number (e.g., 500) to scrape all cards
MAX_WORKERS = 10 # Number of concurrent threads

def fetch_search_page(page_num):
    """Fetches a single search result page."""
    url = "https://dm.takaratomy.co.jp/card/"
    headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
    # Payload to mimic the search form submission
    payload = {
        "site": "HLQCWXGN",
        "mode": "search",
        "pagenum": str(page_num),
        "sort": "release_new",
        "samename": "show",
        "suggest": "on",
    }
    
    try:
        response = requests.post(url, data=payload, headers=headers, timeout=20)
        response.raise_for_status()
        return response.text
    except Exception as e:
        print(f"Error fetching search page {page_num}: {e}")
        return None

def get_card_detail_urls(max_pages):
    """Iterates through search pages and yields card detail URLs."""
    urls = []
    for page in range(1, max_pages + 1):
        print(f"Scanning page {page}...")
        html = fetch_search_page(page)
        if not html:
            break
        
        soup = BeautifulSoup(html, 'html.parser')
        card_list = soup.find('div', id='cardlist')
        if not card_list:
            print("No card list found.")
            break
        
        # The list items are <li><a><img .../></a></li>
        # The anchor tag has the href or data-href
        links = card_list.find_all('a')
        page_urls = []
        for link in links:
            href = link.get('data-href') or link.get('href')
            if href and 'detail' in href:
                full_url = urljoin(BASE_URL, href)
                # Avoid duplicates in the same list if any (though unlikely using list of a tags)
                if full_url not in page_urls:
                    page_urls.append(full_url)
        
        if not page_urls:
            print(f"No cards found on page {page}. Stopping.")
            break
            
        urls.extend(page_urls)
        # Check if it's the last page (simple check: if we got fewer than expected, or just relying on loop)
        # The site has pagination, but looping valid range is safer.
        time.sleep(0.5) # Politeness delay
        
    return urls

def parse_card_detail(url):
    """Fetches and parses a single card detail page."""
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
    try:
        resp = requests.get(url, headers=headers, timeout=20)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, 'html.parser')
        
        cards = []
        # Support for multi-faced cards (e.g. Psychic/Dragheart) which appear as multiple .card-itself divs
        card_divs = soup.find_all('div', class_='card-itself')
        
        for div in card_divs:
            # Helper to safely get text
            def get_text(cls_name):
                el = div.find(class_=cls_name)
                return el.get_text(strip=True) if el else ""
            
            # Helper to get inner HTML (for skills which are <li>)
            def get_skills(cls_name):
                el = div.find(class_=cls_name)
                if not el: return []
                return [li.get_text(strip=True) for li in el.find_all('li')]

            # Extract Image URL
            img_div = div.find(class_='card-img')
            img_src = ""
            if img_div and img_div.find('img'):
                img_src = urljoin(BASE_URL, img_div.find('img')['src'])

            # Helper for Name (remove pack name span)
            name_el = div.find(class_='card-name')
            name = ""
            if name_el:
                # Remove span if exists
                for span in name_el.find_all('span'):
                    span.decompose()
                name = name_el.get_text(strip=True)

            card_data = {
                "id": "", # Will be generated or extracted if possible
                "url": url,
                "name": name,
                "type": get_text('type'),
                "civilization": get_text('civil'),
                "rarity": get_text('rarelity'),
                "power": get_text('power'),
                "cost": get_text('cost'),
                "mana": get_text('mana'),
                "race": get_text('race'),
                "illustrator": get_text('illusttxt'),
                "text": get_skills('skills'),
                "flavor": get_text('flavor'),
                "imageUrl": img_src
            }
            # Generate a pseudo-ID from URL and name hash or index?
            # URL is like ...?id=dm25ex4-TR05
            # We can use the ID param + index if multiple
            import urllib.parse
            query = urllib.parse.urlparse(url).query
            qs = urllib.parse.parse_qs(query)
            card_id_base = qs.get('id', ['unknown'])[0]
            
            # If multiple cards in one page, append suffix
            if len(card_divs) > 1:
                idx = card_divs.index(div)
                suffix = ['a', 'b', 'c'][idx] if idx < 3 else str(idx)
                card_data['id'] = f"{card_id_base}_{suffix}"
            else:
                card_data['id'] = card_id_base

            cards.append(card_data)
            
        return cards

    except Exception as e:
        print(f"Error parsing detail {url}: {e}")
        return []

def scrape():
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)

    print(f"Collecting card URLs from first {MAX_PAGES} pages...")
    detail_urls = get_card_detail_urls(MAX_PAGES)
    print(f"Found {len(detail_urls)} unique card URLs.")
    
    all_cards = []
    
    print(f"Fetching details with {MAX_WORKERS} workers...")
    with concurrent.futures.ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        # Submit all tasks
        future_to_url = {executor.submit(parse_card_detail, url): url for url in detail_urls}
        
        completed = 0
        total = len(detail_urls)
        
        for future in concurrent.futures.as_completed(future_to_url):
            url = future_to_url[future]
            try:
                data = future.result()
                if data:
                    all_cards.extend(data)
            except Exception as e:
                print(f"Exception for {url}: {e}")
            
            completed += 1
            if completed % 10 == 0 or completed == total:
                print(f"Progress: {completed}/{total}")

    # Save to JSON
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(all_cards, f, indent=2, ensure_ascii=False)
    
    print(f"Successfully scraped {len(all_cards)} cards to {OUTPUT_FILE}")

if __name__ == "__main__":
    scrape()
