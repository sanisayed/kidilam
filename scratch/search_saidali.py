import sqlite3

db_path = r"C:\Users\dell\Documents\billed\billed.db"
conn = sqlite3.connect(db_path)
conn.row_factory = sqlite3.Row

print("=== LATEST 15 BILLS IN DATABASE ===")
rows = conn.execute("SELECT id, customer_name, date, price, created_at, note FROM bills ORDER BY id DESC LIMIT 15").fetchall()
for r in rows:
    print(f"ID: {r['id']} | Date: {r['date']} | Name: {r['customer_name']} | Price: {r['price']} | Created At: {r['created_at']} | Note: {r['note']}")

conn.close()
