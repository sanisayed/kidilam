with open(r"C:\Users\dell\Documents\billed\billed.db", "rb") as f:
    data = f.read()

search_str = b"MOHAMMED"
idx = 0
while True:
    idx = data.find(search_str, idx)
    if idx == -1:
        break
    print(f"Match found at offset {idx}:")
    start = max(0, idx - 100)
    end = min(len(data), idx + 200)
    snippet = data[start:end]
    # Replace non-printable characters with dots
    printable = "".join(chr(b) if 32 <= b < 127 else "." for b in snippet)
    print(printable)
    print("-" * 50)
    idx += len(search_str)
