import urllib.request
import json

try:
    # Test GET deliveries
    req = urllib.request.urlopen("http://localhost:8000/api/deliveries")
    res = req.read().decode('utf-8')
    data = json.loads(res)
    print(f"Loaded {len(data)} deliveries successfully!")
    if len(data) > 0:
        print("Sample delivery:", data[0])
except Exception as e:
    print("API Error:", e)
