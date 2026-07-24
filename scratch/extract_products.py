import sqlite3
import json
import os

def extract():
    db_path = r"C:\Users\dell\Documents\billed\billed.db"
    out_dir = r"c:\Users\dell\Documents\kidilam\src\services"
    out_path = os.path.join(out_dir, "products_seed.json")
    
    if not os.path.exists(out_dir):
        os.makedirs(out_dir, exist_ok=True)
        
    print(f"Connecting to database at {db_path}...")
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    
    c.execute("SELECT dta, brand, model, price FROM products ORDER BY dta ASC")
    rows = [dict(r) for r in c.fetchall()]
    conn.close()
    
    print(f"Extracted {len(rows)} products. Writing to {out_path}...")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(rows, f, indent=2)
    print("Done!")

if __name__ == "__main__":
    extract()
