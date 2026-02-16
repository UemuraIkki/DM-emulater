import requests

url = "https://dm.takaratomy.co.jp/card/detail/?id=dm25ex4-TR05"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
}

try:
    resp = requests.get(url, headers=headers)
    resp.raise_for_status()
    with open("debug_detail.html", "w", encoding="utf-8") as f:
        f.write(resp.text)
    print("Saved debug_detail.html")
except Exception as e:
    print(f"Error: {e}")
