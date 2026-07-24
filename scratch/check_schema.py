import sqlite3

conn = sqlite3.connect("C:/Users/dell/Documents/billed/billed.db")
cursor = conn.cursor()

# Get list of tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = cursor.fetchall()
print("Tables in database:", [t[0] for t in tables])

for table_name in ["bills", "deliveries", "warranty_claims"]:
    print(f"\n--- Schema for table: {table_name} ---")
    cursor.execute(f"PRAGMA table_info({table_name});")
    info = cursor.fetchall()
    for col in info:
        print(f"Col {col[0]}: {col[1]} ({col[2]})")

conn.close()
