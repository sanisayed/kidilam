import sqlite3
import os
import sys
import subprocess

db_path = r"C:\Users\dell\Documents\billed\billed.db"
conn = sqlite3.connect(db_path)

# Parameters of deleted bill ID 1046
data = {
    "id": 1046,
    "date": "30-06-2026",
    "customer_name": "MOHAMMED",
    "brand": "DELL",
    "model": "Dell 5410 | Intel Core i5 | 10th Gen | 8GB RAM | 256GB SSD | Touch | Windows 11 Pro",
    "dta": "DTAX0355",
    "price": 799.0,
    "payment_mode": "Nil",
    "mixed_cash": 0.0,
    "mixed_card": 0.0,
    "mixed_tabby": 0.0,
    "mixed_tamara": 0.0,
    "mixed_bank": 0.0,
    "note": "",
    "transaction_type": "Sale",
    "platform": "Regular Customer",
    "delivery": 0,
    "exch_new_brand": "",
    "exch_new_model": "",
    "exch_new_dta": "",
    "exch_new_price": 0.0,
    "exch_old_brand": "",
    "exch_old_model": "",
    "exch_old_dta": "",
    "exch_old_price": 0.0,
    "exch_balance": 0.0,
    "products_json": '[{"dta": "DTAX0355", "brand": "DELL", "model": "Dell 5410 | Intel Core i5 | 10th Gen | 8GB RAM | 256GB SSD | Touch | Windows 11 Pro", "price": 799, "quantity": 1, "source": "Inventory"}]',
    "source": "Inventory",
    "exch_old_source": "Inventory",
    "jenny": 0,
    "created_at": "2026-06-30 11:27:11"
}

query = """
    INSERT INTO bills (
        id, date, customer_name, brand, model, dta, price,
        payment_mode, mixed_cash, mixed_card, mixed_tabby, mixed_tamara, mixed_bank,
        note, transaction_type, platform, delivery,
        exch_new_brand, exch_new_model, exch_new_dta, exch_new_price,
        exch_old_brand, exch_old_model, exch_old_dta, exch_old_price,
        exch_balance, products_json, source, exch_old_source, jenny, created_at
    ) VALUES (
        :id, :date, :customer_name, :brand, :model, :dta, :price,
        :payment_mode, :mixed_cash, :mixed_card, :mixed_tabby, :mixed_tamara, :mixed_bank,
        :note, :transaction_type, :platform, :delivery,
        :exch_new_brand, :exch_new_model, :exch_new_dta, :exch_new_price,
        :exch_old_brand, :exch_old_model, :exch_old_dta, :exch_old_price,
        :exch_balance, :products_json, :source, :exch_old_source, :jenny, :created_at
    )
"""

try:
    conn.execute(query, data)
    conn.commit()
    print("[+] Successfully restored transaction ID 1046.")
except Exception as e:
    print(f"[-] Insertion failed: {e}")
finally:
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
