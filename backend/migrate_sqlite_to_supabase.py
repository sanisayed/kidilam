"""
migrate_sqlite_to_supabase.py — Migration Tool for Kidilam POS
Migrates all tables and rows from local SQLite (billed.db) to Supabase PostgreSQL.

Usage:
  python backend/migrate_sqlite_to_supabase.py [DATABASE_URL]

If DATABASE_URL is not provided as an argument, it reads from the environment variable `DATABASE_URL`
or prompts for input.
"""

import os
import sys
import sqlite3
import re

try:
    import psycopg2
    import psycopg2.extras
except ImportError:
    print("Error: psycopg2 is required. Install it using: pip install psycopg2-binary")
    sys.exit(1)

# Default local SQLite path
LOCAL_DB_PATH = os.path.join(os.path.dirname(__file__), "billed.db")

POSTGRES_SCHEMA = """
CREATE TABLE IF NOT EXISTS products (
    dta TEXT PRIMARY KEY,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    price DOUBLE PRECISION NOT NULL DEFAULT 0,
    image_url TEXT DEFAULT '',
    photos TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS display_pieces (
    dta TEXT NOT NULL,
    date TEXT NOT NULL,
    brand TEXT DEFAULT '',
    model TEXT DEFAULT '',
    quantity INTEGER DEFAULT 1,
    added_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (dta, date)
);

CREATE TABLE IF NOT EXISTS bills (
    id SERIAL PRIMARY KEY,
    date TEXT NOT NULL,
    customer_name TEXT DEFAULT '',
    brand TEXT DEFAULT '',
    model TEXT DEFAULT '',
    dta TEXT DEFAULT '',
    price DOUBLE PRECISION DEFAULT 0,
    payment_mode TEXT DEFAULT 'Cash',
    mixed_cash DOUBLE PRECISION DEFAULT 0,
    mixed_card DOUBLE PRECISION DEFAULT 0,
    mixed_tabby DOUBLE PRECISION DEFAULT 0,
    mixed_tamara DOUBLE PRECISION DEFAULT 0,
    mixed_bank DOUBLE PRECISION DEFAULT 0,
    note TEXT DEFAULT '',
    transaction_type TEXT DEFAULT 'Sale',
    platform TEXT DEFAULT 'Regular Customer',
    delivery INTEGER DEFAULT 0,
    exch_new_brand TEXT DEFAULT '',
    exch_new_model TEXT DEFAULT '',
    exch_new_dta TEXT DEFAULT '',
    exch_new_price DOUBLE PRECISION DEFAULT 0,
    exch_old_brand TEXT DEFAULT '',
    exch_old_model TEXT DEFAULT '',
    exch_old_dta TEXT DEFAULT '',
    exch_old_price DOUBLE PRECISION DEFAULT 0,
    exch_balance DOUBLE PRECISION DEFAULT 0,
    products_json TEXT DEFAULT '[]',
    source TEXT DEFAULT 'Inventory',
    exch_old_source TEXT DEFAULT 'Inventory',
    jenny INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inventory_units (
    dta TEXT NOT NULL,
    status TEXT NOT NULL,
    brand TEXT DEFAULT '',
    model TEXT DEFAULT '',
    price DOUBLE PRECISION DEFAULT 0,
    status_date TEXT NOT NULL,
    notes TEXT DEFAULT '',
    quantity INTEGER DEFAULT 1,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (dta, status)
);

CREATE TABLE IF NOT EXISTS inventory_logs (
    id SERIAL PRIMARY KEY,
    dta TEXT NOT NULL,
    brand TEXT DEFAULT '',
    model TEXT DEFAULT '',
    from_status TEXT NOT NULL,
    to_status TEXT NOT NULL,
    date TEXT NOT NULL,
    notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    serial_no TEXT DEFAULT '',
    customer_name TEXT NOT NULL,
    mobile_number TEXT NOT NULL,
    email TEXT DEFAULT '',
    place TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS deliveries (
    id SERIAL PRIMARY KEY,
    date TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    place TEXT NOT NULL,
    address TEXT,
    phone TEXT NOT NULL,
    dta_list TEXT NOT NULL,
    products_json TEXT NOT NULL,
    price DOUBLE PRECISION NOT NULL,
    delivery_by TEXT NOT NULL,
    payment_mode TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Billed Pending',
    delivery_type TEXT NOT NULL DEFAULT 'Product Delivery',
    exch_old_dta TEXT,
    exch_old_desc TEXT,
    exch_old_value DOUBLE PRECISION DEFAULT 0.0,
    warranty_action TEXT,
    jenny INTEGER DEFAULT 0,
    platform TEXT DEFAULT 'Regular Customer',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'staff',
    permissions TEXT NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS warranty_claims (
    id SERIAL PRIMARY KEY,
    claim_date TEXT NOT NULL,
    customer_name TEXT DEFAULT '',
    phone_number TEXT DEFAULT '',
    location TEXT DEFAULT '',
    dta TEXT DEFAULT '',
    brand TEXT DEFAULT '',
    model TEXT DEFAULT '',
    fulfillment_type TEXT DEFAULT 'Repair',
    issue_note TEXT DEFAULT '',
    status TEXT DEFAULT 'Open',
    repair_cost DOUBLE PRECISION DEFAULT 0.0,
    repair_note TEXT DEFAULT '',
    exch_new_dta TEXT DEFAULT '',
    exch_new_brand TEXT DEFAULT '',
    exch_new_model TEXT DEFAULT '',
    exch_balance DOUBLE PRECISION DEFAULT 0.0,
    refund_amount DOUBLE PRECISION DEFAULT 0.0,
    warranty_status TEXT DEFAULT '',
    is_outside INTEGER DEFAULT 0,
    action_date TEXT DEFAULT '',
    products_json TEXT DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS platform TEXT DEFAULT 'Regular Customer';
ALTER TABLE warranty_claims ADD COLUMN IF NOT EXISTS customer_name TEXT DEFAULT '';
ALTER TABLE warranty_claims ADD COLUMN IF NOT EXISTS phone_number TEXT DEFAULT '';
ALTER TABLE warranty_claims ADD COLUMN IF NOT EXISTS issue_note TEXT DEFAULT '';
ALTER TABLE warranty_claims ADD COLUMN IF NOT EXISTS warranty_status TEXT DEFAULT '';
ALTER TABLE warranty_claims ADD COLUMN IF NOT EXISTS action_date TEXT DEFAULT '';
ALTER TABLE warranty_claims ADD COLUMN IF NOT EXISTS products_json TEXT DEFAULT '[]';

CREATE INDEX IF NOT EXISTS idx_bills_date ON bills (date);
CREATE INDEX IF NOT EXISTS idx_bills_date_type ON bills (date, transaction_type);
CREATE INDEX IF NOT EXISTS idx_inventory_status ON inventory_units (status);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_date ON inventory_logs (date);
"""

TABLES = [
    "products",
    "display_pieces",
    "bills",
    "inventory_units",
    "inventory_logs",
    "customers",
    "deliveries",
    "users",
    "warranty_claims"
]

def migrate(db_url=None):
    if not db_url:
        db_url = os.environ.get("DATABASE_URL")
    
    if not db_url:
        print("DATABASE_URL is not set.")
        db_url = input("Please enter your Supabase PostgreSQL connection URI: ").strip()

    if not db_url:
        print("Migration cancelled. Connection URL is required.")
        return

    # Fix postgres:// to postgresql:// if needed
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)

    if not os.path.exists(LOCAL_DB_PATH):
        print(f"Error: Local SQLite database file not found at {LOCAL_DB_PATH}")
        return

    print(f"Connecting to local SQLite DB: {LOCAL_DB_PATH} ...", flush=True)
    sqlite_conn = sqlite3.connect(LOCAL_DB_PATH)
    sqlite_conn.row_factory = sqlite3.Row

    print("Connecting to Supabase PostgreSQL ...", flush=True)
    try:
        pg_conn = psycopg2.connect(db_url)
        pg_conn.autocommit = False
    except Exception as err:
        print(f"Failed to connect to PostgreSQL: {err}", flush=True)
        return

    pg_cur = pg_conn.cursor()

    print("Initializing PostgreSQL tables schema ...", flush=True)
    pg_cur.execute(POSTGRES_SCHEMA)
    pg_conn.commit()
    print("Schema initialized successfully!", flush=True)

    total_migrated = 0

    for table in TABLES:
        try:
            rows = sqlite_conn.execute(f"SELECT * FROM {table}").fetchall()
            if not rows:
                print(f"  [-] Table '{table}': 0 rows found.")
                continue

            col_names = [description[0] for description in sqlite_conn.execute(f"SELECT * FROM {table} LIMIT 1").description]
            cols_str = ", ".join(col_names)

            # Build fast bulk insert query
            insert_query = f"INSERT INTO {table} ({cols_str}) VALUES %s ON CONFLICT DO NOTHING"
            all_values = [[row[col] for col in col_names] for row in rows]

            psycopg2.extras.execute_values(pg_cur, insert_query, all_values, page_size=500)
            pg_conn.commit()
            print(f"  [OK] Table '{table}': Migrated {len(all_values)} rows.", flush=True)
            total_migrated += len(all_values)

            # Reset auto-increment sequence for serial tables
            if "id" in col_names and table in ["bills", "inventory_logs", "customers", "deliveries", "users"]:
                seq_query = f"SELECT setval(pg_get_serial_sequence('{table}', 'id'), COALESCE(MAX(id), 1)) FROM {table};"
                pg_cur.execute(seq_query)
                pg_conn.commit()

        except Exception as e:
            pg_conn.rollback()
            print(f"  [ERROR] Failed to migrate table '{table}': {e}", flush=True)

    print(f"\nMigration completed! Total {total_migrated} rows processed.", flush=True)

    sqlite_conn.close()
    pg_conn.close()

if __name__ == "__main__":
    url_arg = sys.argv[1] if len(sys.argv) > 1 else None
    migrate(url_arg)
