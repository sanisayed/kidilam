import sqlite3
import json
import os

db_path = r"C:\Users\dell\Documents\billed\billed.db"
out_path = r"c:\Users\dell\Documents\kidilam\src\services\bills_seed.json"

if not os.path.exists(db_path):
    print(f"Error: Could not locate database at {db_path}")
    exit(1)

# Ensure parent directories exist
os.makedirs(os.path.dirname(out_path), exist_ok=True)

conn = sqlite3.connect(db_path)
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

try:
    cursor.execute("SELECT * FROM bills ORDER BY id DESC")
    rows = cursor.fetchall()
    
    bills = []
    for r in rows:
        bills.append(dict(r))
        
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(bills, f, indent=2, ensure_ascii=False)
        
    print(f"Success: Extracted {len(bills)} bills and saved to {out_path}")

except Exception as e:
    print(f"Database error during extraction: {e}")
finally:
    conn.close()
