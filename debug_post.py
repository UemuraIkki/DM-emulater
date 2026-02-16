import requests

url = "https://dm.takaratomy.co.jp/card/"
headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
}
payload = [
    ('site', 'HLQCWXGN'),
    ('charset', 'UTF-8'),
    ('design', '1'),
    ('pagenum', '1'),
    ('sort', 'release_new'),
    ('samename', 'show'),
    ('suggest', 'on'),
    ('keyword_type[]', 'card_name'),
    ('keyword_type[]', 'card_ruby'),
    ('keyword_type[]', 'card_text'),
    ('culture_cond[]', '単色'),
    ('culture_cond[]', '多色'),
]

try:
    print("Fetching page 1...")
    response = requests.post(url, data=payload, headers=headers, timeout=10)
    response.raise_for_status()
    with open("debug_cards.html", "w", encoding="utf-8") as f:
        f.write(response.text)
    print("Saved debug_cards.html")
except Exception as e:
    print(f"Error: {e}")
