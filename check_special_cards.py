import json

TARGET_KEYWORDS = ["禁断", "零龍", "儀", "星雲", "ドルマゲドン"]

try:
    with open('public/data/cards.json', 'r', encoding='utf-8') as f:
        cards = json.load(f)
    
    hits = []
    for card in cards:
        name = card.get('name', '')
        type_ = card.get('type', '')
        race = card.get('race', '')
        #open
        # Check if any keyword matches
        if any(k in name for k in TARGET_KEYWORDS) or \
           any(k in type_ for k in TARGET_KEYWORDS) or \
           any(k in race for k in TARGET_KEYWORDS):
           
           hits.append({
               'name': name,
               'type': type_,
               'race': race
           })

    with open('special_cards_check.txt', 'w', encoding='utf-8') as out:
        for h in hits:
            out.write(f"Name: {h['name']} | Type: {h['type']} | Race: {h['race']}\n")
            
    print(f"Found {len(hits)} matches. Check special_cards_check.txt")

except Exception as e:
    print(f"Error: {e}")
