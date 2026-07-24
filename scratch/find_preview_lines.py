with open("c:/Users/dell/Documents/kidilam/src/components/Dashboard.jsx", "r", encoding="utf-8") as f:
    for i, line in enumerate(f, 1):
        if "showPreview" in line:
            print(f"Line {i}: {line.strip()}")
