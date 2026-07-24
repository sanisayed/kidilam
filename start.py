"""
start.py — Buyology Dashboard Launcher
Starts Flask backend (from local backend/ folder), Vite frontend, and zrok tunnel.
Features animated loaders and opens the zrok public share directly.
"""

import os
import sys
import subprocess
import socket
import time
import re
import urllib.request
import urllib.error

# ─── Paths ──────────────────────────────────────────────────────────────────

if hasattr(sys, 'frozen'):
    BASE_DIR = os.path.dirname(sys.executable)
else:
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))

BACKEND_DIR   = os.path.join(BASE_DIR, "backend")
PYTHON_EXE    = r"C:\Users\Saidali\AppData\Local\Programs\Python\Python314\python.exe"
NODE_DIR      = r"C:\Program Files\nodejs"
ZROK_EXE      = os.path.join(BASE_DIR, "zrok_bin", "zrok.exe")
ZROK_NAME     = "buyologysale"
ZROK_URL      = f"https://{ZROK_NAME}.shares.zrok.io"

# ─── Helpers ────────────────────────────────────────────────────────────────

def is_port_listening(port, timeout=0.5):
    try:
        with socket.create_connection(("127.0.0.1", port), timeout=timeout):
            return True
    except OSError:
        return False


def wait_for_port_with_loader(port, label, timeout=45):
    start_time = time.time()
    spinner = ["|", "/", "-", "\\"]
    idx = 0
    while time.time() - start_time < timeout:
        if is_port_listening(port):
            elapsed = time.time() - start_time
            sys.stdout.write(f"\r  [ OK ] {label} loaded successfully in {elapsed:.2f}s!\n")
            sys.stdout.flush()
            return True
        elapsed = time.time() - start_time
        char = spinner[idx % len(spinner)]
        sys.stdout.write(f"\r  [{char}] Loading {label}... ({elapsed:.1f}s)")
        sys.stdout.flush()
        idx += 1
        time.sleep(0.1)
    
    sys.stdout.write(f"\r  [ FAIL ] Loading {label} timed out after {timeout}s!\n")
    sys.stdout.flush()
    return False


def is_zrok_url_ready(url, timeout=1.5):
    try:
        # Pings the endpoint to see if zrok is successfully proxying the React frontend (200 OK)
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=timeout) as response:
            return response.status == 200
    except Exception:
        return False


def wait_for_zrok_with_loader(url, label, timeout=45):
    start_time = time.time()
    spinner = ["|", "/", "-", "\\"]
    idx = 0
    while time.time() - start_time < timeout:
        if is_zrok_url_ready(url):
            elapsed = time.time() - start_time
            sys.stdout.write(f"\r  [ OK ] {label} loaded successfully in {elapsed:.2f}s!\n")
            sys.stdout.flush()
            return True
        elapsed = time.time() - start_time
        char = spinner[idx % len(spinner)]
        sys.stdout.write(f"\r  [{char}] Establishing {label}... ({elapsed:.1f}s)")
        sys.stdout.flush()
        idx += 1
        time.sleep(0.2)
    
    sys.stdout.write(f"\r  [ FAIL ] Establishing {label} timed out after {timeout}s!\n")
    sys.stdout.flush()
    return False


def cleanup_zrok_share(name):
    """Delete any existing zrok named share to avoid 'already in use' errors."""
    try:
        result = subprocess.run(
            [ZROK_EXE, "overview"],
            capture_output=True, timeout=15
        )
        output = result.stdout.decode("utf-8", errors="ignore")
        match = re.search(
            rf"{re.escape(name)}\.shares\.zrok\.io\s*[│|]\s*public\s*[│|]\s*([a-zA-Z0-9]+)",
            output
        )
        if match:
            token = match.group(1)
            subprocess.run([ZROK_EXE, "delete", "share", token], capture_output=True, timeout=15)
    except Exception:
        pass

# ─── Main ────────────────────────────────────────────────────────────────────

def main():
    print("=" * 60)
    print("                BUYOLOGY SERVICE GATEWAY")
    print("=" * 60)

    # 1. Normalize environment PATH keys to support both Path and PATH
    env = os.environ.copy()
    path_key = "PATH"
    for k in list(env.keys()):
        if k.upper() == "PATH":
            path_key = k
            break
    paths = env.get(path_key, "").split(os.pathsep)
    if NODE_DIR not in paths:
        env[path_key] = NODE_DIR + os.pathsep + env.get(path_key, "")

    # 2. Start Flask backend silently from local backend/ folder
    if not is_port_listening(5000):
        print("\n[1/3] Starting Flask Backend Service...")
        subprocess.Popen(
            [PYTHON_EXE, "app.py"],
            cwd=BACKEND_DIR,
            env=env,
            creationflags=subprocess.CREATE_NO_WINDOW if sys.platform == "win32" else 0
        )
        wait_for_port_with_loader(5000, "Flask backend")
    else:
        print("\n[1/3] Flask Backend is already active on port 5000.")

    # 3. Start Vite frontend
    if not is_port_listening(5173):
        print("\n[2/3] Starting Vite Frontend Server...")
        subprocess.Popen(
            ["cmd.exe", "/c", "npm run dev"],
            cwd=BASE_DIR,
            env=env,
            creationflags=subprocess.CREATE_NO_WINDOW if sys.platform == "win32" else 0
        )
        wait_for_port_with_loader(5173, "Vite frontend")
    else:
        print("\n[2/3] Vite Frontend is already active on port 5173.")

    # 4. Start zrok tunnel
    print(f"\n[3/3] Establishing zrok Public Gateway ({ZROK_NAME})...")
    cleanup_zrok_share(ZROK_NAME)
    subprocess.Popen(
        [ZROK_EXE, "share", "public", "http://127.0.0.1:5173",
         "-n", f"public:{ZROK_NAME}", "--headless"],
        cwd=BASE_DIR,
        env=env,
        creationflags=subprocess.CREATE_NO_WINDOW if sys.platform == "win32" else 0
    )
    
    # Wait for the public URL to register and get online
    wait_for_zrok_with_loader(ZROK_URL, "zrok public tunnel")

    # 5. Open browser directly to the zrok public URL after a short delay
    print("\n  Delaying browser launch by 6 seconds for zrok stabilization...")
    time.sleep(6)
    print(f"  Opening Browser directly to public URL: {ZROK_URL}")
    os.startfile(ZROK_URL)

    print("\n" + "=" * 60)
    print("  ALL SERVICES RUNNING SUCCESSFULLY.")
    print("  Press Ctrl+C inside this window to terminate.")
    print("=" * 60 + "\n")
    
    try:
        while True:
            time.sleep(30)
    except KeyboardInterrupt:
        print("\n  Terminating services...")


if __name__ == "__main__":
    main()
