import sqlite3

db_path = r"C:\Users\dell\Documents\billed\billed.db"
conn = sqlite3.connect(db_path)
conn.row_factory = sqlite3.Row

print("=== SEARCHING ALL COLUMNS IN ALL BILLS ===")
rows = conn.execute("SELECT * FROM bills").fetchall()
count = 0
for r in rows:
    row_dict = dict(r)
    # Search all string columns
    found = False
    for col, val in row_dict.items():
        if val is not None and isinstance(val, str):
            norm_val = val.lower().replace(" ", "")
            if "saidali" in norm_val:
                print(f"Match found in column '{col}':")
                print(f"  Row ID: {row_dict['id']}")
                print(f"  Date: {row_dict['date']}")
                print(f"  Customer: {row_dict['customer_name']}")
                print(f"  Details: {row_dict['brand']} {row_dict['model']}")
                print(f"  Price: {row_dict['price']}")
                print(f"  Note: {row_dict['note']}")
                print("-" * 50)
                found = True
                count += 1
                break
                
print(f"Found {count} matches for 'saidali' in all columns.")
conn.close()
