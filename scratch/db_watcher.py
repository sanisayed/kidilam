import os
import time
import subprocess
import sys

db_path = r"C:\Users\dell\Documents\billed\billed.db"
script_dir = os.path.dirname(os.path.abspath(__file__))
python_exe = sys.executable

print(f"[*] Starting Buyology SQLite Database Monitor...")
print(f"[*] Watching database at: {db_path}")
print(f"[*] Python environment: {python_exe}")

last_mtime = None
if os.path.exists(db_path):
    last_mtime = os.path.getmtime(db_path)
    print(f"[*] Initial database timestamp: {last_mtime}")
else:
    print(f"[!] Warning: Could not locate database at {db_path}. Monitoring path anyway...")

try:
    while True:
        time.sleep(1.5)
        if not os.path.exists(db_path):
            continue
            
        current_mtime = os.path.getmtime(db_path)
        if last_mtime is None:
            last_mtime = current_mtime
            print(f"[*] Database file created! Timestamp: {last_mtime}")
            continue
            
        if current_mtime != last_mtime:
            print(f"\n[!] Database change detected! (mtime: {current_mtime})")
            print("[*] Running data extraction scripts...")
            
            # Wait 0.5s to allow SQLite to release lock and finish writing
            time.sleep(0.5)
            
            # Run extraction scripts in order
            try:
                # 1. Sync sales bills seed
                res_bills = subprocess.run(
                    [python_exe, os.path.join(script_dir, "extract_bills.py")],
                    capture_output=True,
                    text=True
                )
                if res_bills.returncode == 0:
                    print(f"    -> {res_bills.stdout.strip()}")
                else:
                    print(f"    -> Error syncing bills: {res_bills.stderr.strip()}")
                
                # 2. Sync product DB seed
                res_products = subprocess.run(
                    [python_exe, os.path.join(script_dir, "extract_products.py")],
                    capture_output=True,
                    text=True
                )
                if res_products.returncode == 0:
                    print(f"    -> {res_products.stdout.strip()}")
                else:
                    print(f"    -> Error syncing products: {res_products.stderr.strip()}")
                    
                print("[+] Sync complete! JSON seeds updated.")
            except Exception as e:
                print(f"[-] Subprocess execution failed: {e}")
                
            last_mtime = current_mtime
except KeyboardInterrupt:
    print("\n[*] Database monitor stopped.")
