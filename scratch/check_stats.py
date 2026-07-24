import requests
from datetime import datetime, timedelta

def get_stats():
    res = requests.get('http://localhost:8000/api/bills')
    bills = res.json()
    
    print(f"Total bills in DB: {len(bills)}")
    
    # Let's check types
    types = {}
    for b in bills:
        t = b.get('transaction_type', 'Sale')
        types[t] = types.get(t, 0) + 1
    print("All time types:", types)
    
    # Let's define the date parser
    def parse_date(d_str):
        if not d_str: return None
        try:
            return datetime.strptime(d_str, "%d-%m-%Y")
        except:
            return None

    # Filter for Month (last 30 days)
    today = datetime.now()
    # Let's assume the data's "today" might be the max date in the DB or actual today.
    # In the JS code:
    # const today = new Date(); // which is 10-07-2026
    # Let's parse all dates in the database to find the max date
    parsed_bills = []
    for b in bills:
        dt = parse_date(b.get('date'))
        if dt:
            parsed_bills.append((dt, b))
            
    if not parsed_bills:
        print("No valid dates found")
        return
        
    max_date = max(d for d, b in parsed_bills)
    print(f"Max date in DB: {max_date}")
    
    # We will compute stats for different "today" assumptions:
    # 1. Actual today (2026-07-10)
    # 2. Max date in DB (2026-07-09)
    for today_assumed, label in [(datetime(2026, 7, 10), "Actual Today (July 10, 2026)"), (max_date, "Max Date in DB")]:
        print(f"\n--- Analysis for {label} ---")
        limit_date = today_assumed - timedelta(days=30)
        
        # Filter bills
        filtered = []
        for dt, b in parsed_bills:
            # JS: bDate.getTime() >= lastMonth.getTime() && bDate.getTime() <= today.getTime() + 86400000;
            if dt >= limit_date and dt <= today_assumed + timedelta(days=1):
                filtered.append(b)
                
        print(f"Filtered count (last 30 days): {len(filtered)}")
        f_types = {}
        for b in filtered:
            t = b.get('transaction_type', 'Sale')
            f_types[t] = f_types.get(t, 0) + 1
        print("Filtered types:", f_types)
        
        sales = f_types.get('Sale', 0)
        returns = f_types.get('Return', 0)
        exchanges = f_types.get('Exchange', 0)
        voids = f_types.get('Void', 0)
        
        # Test different formulas for totalTransactions:
        formulas = {
            "sales + returns + exchanges (Old logic)": sales + returns + exchanges,
            "sales - returns (Our new logic, exchanges ignored)": sales - returns,
            "sales - returns - exchanges": sales - returns - exchanges,
            "sales + exchanges - returns": sales + exchanges - returns,
            "sales - returns + exchanges": sales - returns + exchanges,
            "total_count - returns - exchanges": len(filtered) - returns - exchanges,
            "total_count - returns": len(filtered) - returns,
            "total_count - exchanges": len(filtered) - exchanges,
            "sales (only sales)": sales,
        }
        
        for name, val in formulas.items():
            print(f"  {name}: {val}")

if __name__ == '__main__':
    get_stats()
