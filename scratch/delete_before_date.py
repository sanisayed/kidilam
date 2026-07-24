import sqlite3
import datetime
import os
import sys
import subprocess

db_path = r"C:\Users\dell\Documents\billed\billed.db"
conn = sqlite3.connect(db_path)
conn.row_factory = sqlite3.Row

cutoff_date = datetime.date(2026, 5, 29)

cursor = conn.cursor()
cursor.execute("SELECT * FROM bills")
rows = cursor.fetchall()

to_delete_ids = []
parse_errors = []

for r in rows:
    date_str = r["date"]
    if not date_str:
        # If no date, we don't delete it or maybe we skip it
        continue
    try:
        date_str_clean = date_str.replace("/", "-").strip()
        parts = date_str_clean.split("-")
        if len(parts) == 3:
            if len(parts[0]) == 4: # YYYY-MM-DD
                d = datetime.date(int(parts[0]), int(parts[1]), int(parts[2]))
            else: # DD-MM-YYYY
                d = datetime.date(int(parts[2]), int(parts[1]), int(parts[0]))
            
            if d < cutoff_date:
                to_delete_ids.append(r["id"])
        else:
            parse_errors.append((r["id"], date_str))
    except Exception as e:
        parse_errors.append((r["id"], f"{date_str} (error: {e})"))

if parse_errors:
    print("Warning: Could not parse dates for the following bills:")
    for bid, err in parse_errors:
        print(f"  Bill ID {bid}: {err}")

print(f"\n[*] Found {len(to_delete_ids)} bills dated before {cutoff_date.strftime('%d-%m-%Y')}.")

if to_delete_ids:
    # Perform deletion
    id_placeholders = ",".join("?" for _ in to_delete_ids)
    cursor.execute(f"DELETE FROM bills WHERE id IN ({id_placeholders})", to_delete_ids)
    conn.commit()
    print(f"[+] Successfully deleted {len(to_delete_ids)} bills from SQLite database.")
else:
    print("[*] No bills found to delete.")

conn.close()

# Re-run extraction scripts to sync seed data
script_dir = os.path.dirname(os.path.abspath(__file__))
python_exe = sys.executable
try:
    subprocess.run([python_exe, os.path.join(script_dir, "extract_bills.py")], check=True)
    subprocess.run([python_exe, os.path.join(script_dir, "extract_products.py")], check=True)
    print("[+] Successfully re-extracted database seeds.")
except Exception as e:
    print(f"[-] Sync failed: {e}")
