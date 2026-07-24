import sqlite3
import subprocess
import os
import sys

db_path = r"C:\Users\dell\Documents\billed\billed.db"
conn = sqlite3.connect(db_path)
conn.row_factory = sqlite3.Row

# Find the bill with ID 1046 or matching 799 AED on 30-06-2026
target_id = 1046
r = conn.execute("SELECT * FROM bills WHERE id = ?", (target_id,)).fetchone()

if r:
    print(f"[*] Found target bill to delete:")
    print(f"    ID: {r['id']} | Name: {r['customer_name']} | Date: {r['date']} | Price: {r['price']}")
    
    # Delete the bill
    conn.execute("DELETE FROM bills WHERE id = ?", (target_id,))
    conn.commit()
    print("[+] Successfully deleted bill from SQLite database.")
else:
    print(f"[!] Warning: Bill with ID {target_id} not found in database.")

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
