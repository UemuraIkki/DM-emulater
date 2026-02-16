import requests

url = "https://dm.takaratomy.co.jp/card/?pagenum=1&sort=release_new"
try:
    resp = requests.get(url, timeout=10)
    resp.raise_for_status()
    with open("debug_page.html", "w", encoding="utf-8") as f:
        f.write(resp.text)
    print("Fetched page 1 successfully.")
except Exception as e:
    print(f"Error: {e}")
