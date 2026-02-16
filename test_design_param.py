import requests

url = "https://dm.takaratomy.co.jp/card/"
headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
}

# Test design=0
print("Testing design=0...")
payload = {
    "pagenum": 1,
    "design": 0,
    "sort": "release_new"
}
try:
    resp = requests.post(url, data=payload, headers=headers)
    resp.raise_for_status()
    with open("debug_design_0.html", "w", encoding="utf-8") as f:
        f.write(resp.text)
    print("Saved debug_design_0.html")
except Exception as e:
    print(f"Error design=0: {e}")

# Test design=2
print("Testing design=2...")
payload["design"] = 2
try:
    resp = requests.post(url, data=payload, headers=headers)
    resp.raise_for_status()
    with open("debug_design_2.html", "w", encoding="utf-8") as f:
        f.write(resp.text)
    print("Saved debug_design_2.html")
except Exception as e:
    print(f"Error design=2: {e}")
