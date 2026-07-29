import sqlite3
import os
import shutil

DB_PATH = os.environ.get("DB_PATH", os.path.join(os.path.dirname(__file__), "billed.db"))

# Ensure parent directory of database exists (especially for cloud persistent volumes like Render)
try:
    _db_dir = os.path.dirname(DB_PATH)
    if _db_dir and not os.path.exists(_db_dir):
        os.makedirs(_db_dir, exist_ok=True)
    
    # If the database file does not exist in the configured path (e.g., persistent disk),
    # but exists locally in the repository next to this file, copy it as initial seed.
    if not os.path.exists(DB_PATH):
        _local_default_db = os.path.join(os.path.dirname(__file__), "billed.db")
        if os.path.exists(_local_default_db) and os.path.abspath(DB_PATH) != os.path.abspath(_local_default_db):
            print(f"Seeding persistent database: copying {_local_default_db} to {DB_PATH}")
            shutil.copy2(_local_default_db, DB_PATH)
except Exception as e:
    fallback_path = os.path.join(os.path.dirname(__file__), "billed.db")
    print(f"Warning: Failed to setup database directory for '{DB_PATH}' ({e}). Falling back to: {fallback_path}")
    DB_PATH = fallback_path



SCHEMA = """
CREATE TABLE IF NOT EXISTS catalog_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS products (

    dta TEXT PRIMARY KEY,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    price REAL NOT NULL DEFAULT 0,
    image_url TEXT DEFAULT '',
    photos TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS display_pieces (
    dta TEXT NOT NULL,
    date TEXT NOT NULL,
    brand TEXT DEFAULT '',
    model TEXT DEFAULT '',
    quantity INTEGER DEFAULT 1,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (dta, date)
);

CREATE TABLE IF NOT EXISTS bills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    customer_name TEXT DEFAULT '',
    brand TEXT DEFAULT '',
    model TEXT DEFAULT '',
    dta TEXT DEFAULT '',
    price REAL DEFAULT 0,
    payment_mode TEXT DEFAULT 'Cash',
    mixed_cash REAL DEFAULT 0,
    mixed_card REAL DEFAULT 0,
    mixed_tabby REAL DEFAULT 0,
    mixed_tamara REAL DEFAULT 0,
    mixed_bank REAL DEFAULT 0,
    note TEXT DEFAULT '',
    transaction_type TEXT DEFAULT 'Sale',
    platform TEXT DEFAULT 'Regular Customer',
    delivery INTEGER DEFAULT 0,
    exch_new_brand TEXT DEFAULT '',
    exch_new_model TEXT DEFAULT '',
    exch_new_dta TEXT DEFAULT '',
    exch_new_price REAL DEFAULT 0,
    exch_old_brand TEXT DEFAULT '',
    exch_old_model TEXT DEFAULT '',
    exch_old_dta TEXT DEFAULT '',
    exch_old_price REAL DEFAULT 0,
    exch_balance REAL DEFAULT 0,
    products_json TEXT DEFAULT '[]',
    source TEXT DEFAULT 'Inventory',
    exch_old_source TEXT DEFAULT 'Inventory',
    jenny INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inventory_units (
    dta TEXT NOT NULL,
    status TEXT NOT NULL,
    brand TEXT DEFAULT '',
    model TEXT DEFAULT '',
    price REAL DEFAULT 0,
    status_date TEXT NOT NULL,
    notes TEXT DEFAULT '',
    quantity INTEGER DEFAULT 1,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (dta, status)
);

CREATE TABLE IF NOT EXISTS inventory_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dta TEXT NOT NULL,
    brand TEXT DEFAULT '',
    model TEXT DEFAULT '',
    from_status TEXT NOT NULL,
    to_status TEXT NOT NULL,
    date TEXT NOT NULL,
    notes TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bills_date ON bills (date);
CREATE INDEX IF NOT EXISTS idx_bills_date_type ON bills (date, transaction_type);
CREATE INDEX IF NOT EXISTS idx_inventory_status ON inventory_units (status);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_date ON inventory_logs (date);

CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    serial_no TEXT DEFAULT '',
    customer_name TEXT NOT NULL,
    mobile_number TEXT NOT NULL,
    email TEXT DEFAULT '',
    place TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS deliveries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    place TEXT NOT NULL,
    address TEXT,
    phone TEXT NOT NULL,
    dta_list TEXT NOT NULL,
    products_json TEXT NOT NULL,
    price REAL NOT NULL,
    delivery_by TEXT NOT NULL,
    payment_mode TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Billed Pending',
    delivery_type TEXT NOT NULL DEFAULT 'Product Delivery',
    exch_old_dta TEXT,
    exch_old_desc TEXT,
    exch_old_value REAL DEFAULT 0.0,
    warranty_action TEXT,
    bill_id INTEGER,
    jenny INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'staff',
    permissions TEXT NOT NULL DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
"""

import re

POSTGRES_SCHEMA = """
CREATE TABLE IF NOT EXISTS products (
    dta TEXT PRIMARY KEY,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    price DOUBLE PRECISION NOT NULL DEFAULT 0,
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
    bill_id INTEGER,
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

CREATE INDEX IF NOT EXISTS idx_bills_date ON bills (date);
CREATE INDEX IF NOT EXISTS idx_bills_date_type ON bills (date, transaction_type);
CREATE INDEX IF NOT EXISTS idx_inventory_status ON inventory_units (status);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_date ON inventory_logs (date);
"""

class PgRowWrapper(dict):
    def __init__(self, real_dict_row, description=None):
        super().__init__(real_dict_row)
        if description:
            self._keys = [col[0] for col in description]
        else:
            self._keys = list(real_dict_row.keys())
        self._values = [real_dict_row.get(k) for k in self._keys]

    def __getitem__(self, item):
        if isinstance(item, int):
            return self._values[item]
        return super().__getitem__(item)

    def keys(self):
        return self._keys


class PgWrapperCursor:
    def __init__(self, cursor):
        self.cursor = cursor
        self.description = cursor.description

    def _fix_sql(self, sql):
        fixed = sql.replace("?", "%s")
        fixed = re.sub(r'INSERT\s+OR\s+REPLACE\s+INTO', 'INSERT INTO', fixed, flags=re.IGNORECASE)
        fixed = re.sub(r'INSERT\s+OR\s+IGNORE\s+INTO', 'INSERT INTO', fixed, flags=re.IGNORECASE)
        return fixed

    def execute(self, sql, params=None):
        sql = self._fix_sql(sql)
        if params is None:
            self.cursor.execute(sql)
        else:
            self.cursor.execute(sql, params)
        self.description = self.cursor.description
        return self

    def _wrap_row(self, row):
        if row is None:
            return None
        if isinstance(row, dict):
            return PgRowWrapper(row, self.description)
        return row

    def fetchone(self):
        row = self.cursor.fetchone()
        return self._wrap_row(row)

    def fetchall(self):
        rows = self.cursor.fetchall()
        return [self._wrap_row(r) for r in rows] if rows else []

    def __iter__(self):
        return iter(self.fetchall())


class PgWrapperConnection:
    def __init__(self, pg_conn):
        self.pg_conn = pg_conn
        self.row_factory = None

    def cursor(self):
        import psycopg2.extras
        cur = self.pg_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        return PgWrapperCursor(cur)

    def execute(self, sql, params=None):
        cur = self.cursor()
        cur.execute(sql, params)
        return cur

    def executescript(self, script):
        with self.pg_conn.cursor() as cur:
            cur.execute(script)
        self.pg_conn.commit()

    def commit(self):
        self.pg_conn.commit()

    def rollback(self):
        self.pg_conn.rollback()

    def close(self):
        self.pg_conn.close()


def get_connection():
    db_url = os.environ.get("DATABASE_URL")
    if db_url:
        if db_url.startswith("postgres://"):
            db_url = db_url.replace("postgres://", "postgresql://", 1)
        try:
            import psycopg2
            pg_conn = psycopg2.connect(db_url)
            return PgWrapperConnection(pg_conn)
        except Exception as e:
            print(f"Warning: PostgreSQL connection failed ({e}). Falling back to SQLite.")

    global DB_PATH
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        return conn
    except sqlite3.OperationalError as e:
        fallback_path = os.path.join(os.path.dirname(__file__), "billed.db")
        if DB_PATH != fallback_path:
            print(f"Warning: Failed to connect to database at '{DB_PATH}' ({e}). Falling back to: {fallback_path}")
            DB_PATH = fallback_path
            conn = sqlite3.connect(DB_PATH)
            conn.row_factory = sqlite3.Row
            return conn
        raise e


def init_db():
    db_url = os.environ.get("DATABASE_URL")
    if db_url:
        try:
            conn = get_connection()
            if isinstance(conn, PgWrapperConnection):
                conn.executescript(POSTGRES_SCHEMA)
                print("Supabase PostgreSQL DB schema initialized!")
                seed_admin_user()
                return
        except Exception as ex:
            print(f"PostgreSQL schema init warning: {ex}")

    conn = get_connection()
    try:
        seed_admin_user()
    except Exception:
        pass

    
    # Check display_pieces columns to see if it needs date column migration
    try:
        # Check if table exists first
        tbl_exists = conn.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='display_pieces'").fetchone()
        if tbl_exists:
            cols = [r["name"] for r in conn.execute("PRAGMA table_info(display_pieces)").fetchall()]
            if "date" not in cols:
                print("Migrating display_pieces table: adding date support...")
                # 1. Fetch all existing display pieces
                existing_pieces = conn.execute("SELECT * FROM display_pieces").fetchall()
                
                # 2. Drop the old table
                conn.execute("DROP TABLE display_pieces")
                conn.commit()
                
                # 3. Create the new table
                conn.execute("""
                CREATE TABLE display_pieces (
                    dta TEXT NOT NULL,
                    date TEXT NOT NULL,
                    brand TEXT DEFAULT '',
                    model TEXT DEFAULT '',
                    quantity INTEGER DEFAULT 1,
                    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    PRIMARY KEY (dta, date)
                )
                """)
                conn.commit()
                
                # 4. Insert existing pieces under today's date
                from datetime import date as _date
                today = _date.today().strftime("%d-%m-%Y")
                for p in existing_pieces:
                    # check for quantity in old columns
                    qty = 1
                    try:
                        qty = p["quantity"] or 1
                    except Exception:
                        pass
                    conn.execute(
                        """INSERT OR IGNORE INTO display_pieces (dta, date, brand, model, quantity, added_at)
                           VALUES (?, ?, ?, ?, ?, ?)""",
                        (p["dta"], today, p["brand"], p["model"], qty, p["added_at"])
                    )
                conn.commit()
                print("Successfully migrated display_pieces table to date-specific composite PK!")
    except Exception as ex:
        print(f"Error migrating display_pieces: {ex}")

    # Check inventory_logs columns to see if it needs standardization migration
    try:
        tbl_exists = conn.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='inventory_logs'").fetchone()
        if tbl_exists:
            cols = [r["name"] for r in conn.execute("PRAGMA table_info(inventory_logs)").fetchall()]
            if "action" in cols:
                print("Migrating inventory_logs table: standardizing schema...")
                # 1. Rename the old table
                conn.execute("ALTER TABLE inventory_logs RENAME TO _inventory_logs_old")
                conn.commit()
                
                # 2. Create the new table
                conn.execute("""
                CREATE TABLE inventory_logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    dta TEXT NOT NULL,
                    brand TEXT DEFAULT '',
                    model TEXT DEFAULT '',
                    from_status TEXT NOT NULL,
                    to_status TEXT NOT NULL,
                    date TEXT NOT NULL,
                    notes TEXT DEFAULT '',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
                """)
                conn.commit()
                
                # 3. Copy data, mapping timestamp to created_at
                conn.execute("""
                INSERT INTO inventory_logs (id, dta, brand, model, from_status, to_status, date, notes, created_at)
                SELECT id, dta, COALESCE(brand, ''), COALESCE(model, ''), from_status, to_status, date, notes, COALESCE(timestamp, CURRENT_TIMESTAMP)
                FROM _inventory_logs_old
                """)
                conn.commit()
                
                # 4. Drop the old table
                conn.execute("DROP TABLE _inventory_logs_old")
                conn.commit()
                print("Successfully migrated inventory_logs table!")
    except Exception as ex:
        print(f"Error migrating inventory_logs: {ex}")

    conn.executescript(SCHEMA)
    # Safely alter table to add products_json if it doesn't exist
    try:
        conn.execute("ALTER TABLE bills ADD COLUMN products_json TEXT DEFAULT '[]'")
        conn.commit()
    except sqlite3.OperationalError:
        pass
    # Safely alter table to add source if it doesn't exist
    try:
        conn.execute("ALTER TABLE bills ADD COLUMN source TEXT DEFAULT 'Inventory'")
        conn.commit()
    except sqlite3.OperationalError:
        pass
    # Safely alter table to add exch_old_source if it doesn't exist
    try:
        conn.execute("ALTER TABLE bills ADD COLUMN exch_old_source TEXT DEFAULT 'Inventory'")
        conn.commit()
    except sqlite3.OperationalError:
        pass
    # Safely alter table to add mixed_bank if it doesn't exist
    try:
        conn.execute("ALTER TABLE bills ADD COLUMN mixed_bank REAL DEFAULT 0")
        conn.commit()
    except sqlite3.OperationalError:
        pass
    # Safely alter table to add jenny if it doesn't exist
    try:
        conn.execute("ALTER TABLE bills ADD COLUMN jenny INTEGER DEFAULT 0")
        conn.commit()
    except sqlite3.OperationalError:
        pass
    # Safely alter products to add image_url and photos if they don't exist
    try:
        conn.execute("ALTER TABLE products ADD COLUMN image_url TEXT DEFAULT ''")
        conn.commit()
    except sqlite3.OperationalError:
        pass
    try:
        conn.execute("ALTER TABLE products ADD COLUMN photos TEXT DEFAULT ''")
        conn.commit()
    except sqlite3.OperationalError:
        pass
    # Safely alter display_pieces to add quantity if it doesn't exist
    try:
        conn.execute("ALTER TABLE display_pieces ADD COLUMN quantity INTEGER DEFAULT 1")
        conn.commit()
    except sqlite3.OperationalError:
        pass

    # Safely alter inventory_logs to add brand, model, and created_at if they don't exist
    for col, col_def in [("brand", "TEXT DEFAULT ''"), ("model", "TEXT DEFAULT ''"), ("created_at", "TIMESTAMP")]:
        try:
            conn.execute(f"ALTER TABLE inventory_logs ADD COLUMN {col} {col_def}")
            conn.commit()
        except sqlite3.OperationalError:
            pass

    # Populate created_at with timestamp if it is NULL (for older schema migration)
    try:
        conn.execute("UPDATE inventory_logs SET created_at = timestamp WHERE created_at IS NULL")
        conn.commit()
    except sqlite3.OperationalError:
        pass

    # Migrate inventory_units to composite PK and quantity column if needed
    try:
        tbl_exists = conn.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='inventory_units'").fetchone()
        if tbl_exists:
            cols = [r["name"] for r in conn.execute("PRAGMA table_info(inventory_units)").fetchall()]
            pk_count = sum(1 for r in conn.execute("PRAGMA table_info(inventory_units)").fetchall() if r["pk"] > 0)
            if "quantity" not in cols or pk_count < 2:
                print("Migrating inventory_units table: adding quantity support and composite PK...")
                existing_units = conn.execute("SELECT * FROM inventory_units").fetchall()
                conn.execute("DROP TABLE inventory_units")
                conn.commit()
                conn.execute("""
                CREATE TABLE inventory_units (
                    dta TEXT NOT NULL,
                    status TEXT NOT NULL,
                    brand TEXT DEFAULT '',
                    model TEXT DEFAULT '',
                    price REAL DEFAULT 0,
                    status_date TEXT NOT NULL,
                    notes TEXT DEFAULT '',
                    quantity INTEGER DEFAULT 1,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    PRIMARY KEY (dta, status)
                )
                """)
                conn.commit()
                for u in existing_units:
                    qty = 1
                    try:
                        qty = u["quantity"] or 1
                    except Exception:
                        pass
                    conn.execute(
                        """INSERT OR IGNORE INTO inventory_units (dta, status, brand, model, price, status_date, notes, quantity, updated_at)
                           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                        (u["dta"], u["status"], u["brand"], u["model"], u["price"], u["status_date"], u["notes"], qty, u["updated_at"])
                    )
                conn.commit()
                print("Successfully migrated inventory_units table to composite PK!")
    except Exception as ex:
        print(f"Error migrating inventory_units: {ex}")

    # Safely alter deliveries table to add type, exchange, and warranty columns
    for col, col_def in [
        ("delivery_type", "TEXT DEFAULT 'Product Delivery'"),
        ("exch_old_dta", "TEXT"),
        ("exch_old_desc", "TEXT"),
        ("exch_old_value", "REAL DEFAULT 0.0"),
        ("warranty_action", "TEXT"),
        ("bill_id", "INTEGER"),
        ("jenny", "INTEGER DEFAULT 0")
    ]:
        try:
            conn.execute(f"ALTER TABLE deliveries ADD COLUMN {col} {col_def}")
            conn.commit()
        except sqlite3.OperationalError:
            pass

    try:
        create_default_admin()
    except Exception as ex:
        print(f"Error calling create_default_admin: {ex}")

    conn.close()


# ── Products ──────────────────────────────────────────────────────────────────

def get_all_products():
    conn = get_connection()
    rows = conn.execute(
        "SELECT * FROM products ORDER BY updated_at DESC"
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_product(dta: str, conn=None):
    dta = dta.strip().upper()
    close_conn = False
    if conn is None:
        conn = get_connection()
        close_conn = True
    row = conn.execute(
        "SELECT * FROM products WHERE dta = ?", (dta,)
    ).fetchone()
    if close_conn:
        conn.close()
    return dict(row) if row else None


def upsert_product(dta: str, brand: str, model: str, price: float, image_url: str = "", conn=None):
    dta = dta.strip().upper()
    close_conn = False
    if conn is None:
        conn = get_connection()
        close_conn = True
    conn.execute(
        """INSERT INTO products (dta, brand, model, price, image_url, updated_at)
           VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
           ON CONFLICT(dta) DO UPDATE SET
               brand = excluded.brand,
               model = excluded.model,
               price = excluded.price,
               image_url = CASE WHEN excluded.image_url != '' THEN excluded.image_url ELSE products.image_url END,
               updated_at = CURRENT_TIMESTAMP""",
        (dta, brand.strip(), model.strip(), float(price), (image_url or "").strip()),
    )
    if close_conn:
        conn.commit()
        conn.close()


def delete_product(dta: str):
    conn = get_connection()
    conn.execute("DELETE FROM products WHERE dta = ?", (dta.strip().upper(),))
    conn.commit()
    conn.close()


# ── Bills ─────────────────────────────────────────────────────────────────────

def get_bills_for_date(date: str):
    conn = get_connection()
    rows = conn.execute(
        """
        SELECT b.*, 
               d.phone AS delivery_phone, 
               d.place AS delivery_place, 
               d.address AS delivery_address,
               d.status AS delivery_status,
               d.id AS delivery_id
        FROM bills b
        LEFT JOIN deliveries d ON b.id = d.bill_id
        WHERE b.date = ?
        ORDER BY b.id ASC
        """, (date,)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_bill(bill_id: int):
    conn = get_connection()
    row = conn.execute("SELECT * FROM bills WHERE id = ?", (int(bill_id),)).fetchone()
    conn.close()
    return dict(row) if row else None


def get_all_bill_dates():
    conn = get_connection()
    rows = conn.execute(
        "SELECT DISTINCT date FROM bills ORDER BY date DESC"
    ).fetchall()
    conn.close()
    return [r["date"] for r in rows]


def create_bill(data: dict):
    conn = get_connection()
    cur = conn.execute(
        """INSERT INTO bills (
            date, customer_name, brand, model, dta, price,
            payment_mode, mixed_cash, mixed_card, mixed_tabby, mixed_tamara, mixed_bank,
            note, transaction_type, platform, delivery,
            exch_new_brand, exch_new_model, exch_new_dta, exch_new_price,
            exch_old_brand, exch_old_model, exch_old_dta, exch_old_price,
            exch_balance, products_json, source, exch_old_source, jenny
        ) VALUES (
            :date, :customer_name, :brand, :model, :dta, :price,
            :payment_mode, :mixed_cash, :mixed_card, :mixed_tabby, :mixed_tamara, :mixed_bank,
            :note, :transaction_type, :platform, :delivery,
            :exch_new_brand, :exch_new_model, :exch_new_dta, :exch_new_price,
            :exch_old_brand, :exch_old_model, :exch_old_dta, :exch_old_price,
            :exch_balance, :products_json, :source, :exch_old_source, :jenny
        )""",
        {
            "date": data.get("date", ""),
            "customer_name": data.get("customer_name", ""),
            "brand": data.get("brand", ""),
            "model": data.get("model", ""),
            "dta": (data.get("dta") or "").upper(),
            "price": float(data.get("price") or 0),
            "payment_mode": data.get("payment_mode", "Cash"),
            "mixed_cash": float(data.get("mixed_cash") or 0),
            "mixed_card": float(data.get("mixed_card") or 0),
            "mixed_tabby": float(data.get("mixed_tabby") or 0),
            "mixed_tamara": float(data.get("mixed_tamara") or 0),
            "mixed_bank": float(data.get("mixed_bank") or 0),
            "note": data.get("note", ""),
            "transaction_type": data.get("transaction_type", "Sale"),
            "platform": data.get("platform", "Regular Customer"),
            "delivery": 1 if data.get("delivery") else 0,
            "exch_new_brand": data.get("exch_new_brand", ""),
            "exch_new_model": data.get("exch_new_model", ""),
            "exch_new_dta": (data.get("exch_new_dta") or "").upper(),
            "exch_new_price": float(data.get("exch_new_price") or 0),
            "exch_old_brand": data.get("exch_old_brand", ""),
            "exch_old_model": data.get("exch_old_model", ""),
            "exch_old_dta": (data.get("exch_old_dta") or "").upper(),
            "exch_old_price": float(data.get("exch_old_price") or 0),
            "exch_balance": float(data.get("exch_balance") or 0),
            "products_json": data.get("products_json", "[]"),
            "source": data.get("source", "Inventory"),
            "exch_old_source": data.get("exch_old_source", "Inventory"),
            "jenny": 1 if data.get("jenny") else 0,
        },
    )
    conn.commit()
    new_id = cur.lastrowid
    conn.close()
    
    # Auto-deduct display pieces
    _deduct_display_pieces_from_bill(data)
    
    return new_id


def _revert_bill_inventory_impact(bill_id: int, conn):
    bill = conn.execute("SELECT * FROM bills WHERE id = ?", (bill_id,)).fetchone()
    if not bill:
        return
        
    tx_type = bill["transaction_type"]
    bill_date = bill["date"]
    
    import json
    products = []
    
    if tx_type == "Return":
        p_dta = bill["dta"]
        if p_dta:
            p_dta = p_dta.strip().upper()
            existing_qc = conn.execute("SELECT quantity FROM inventory_units WHERE dta = ? AND status = 'QC'", (p_dta,)).fetchone()
            if existing_qc:
                if existing_qc["quantity"] > 1:
                    conn.execute("UPDATE inventory_units SET quantity = quantity - 1 WHERE dta = ? AND status = 'QC'", (p_dta,))
                else:
                    conn.execute("DELETE FROM inventory_units WHERE dta = ? AND status = 'QC'", (p_dta,))
                    
            existing_sold = conn.execute("SELECT quantity FROM inventory_units WHERE dta = ? AND status = 'SOLD'", (p_dta,)).fetchone()
            if existing_sold:
                conn.execute("UPDATE inventory_units SET quantity = quantity + 1 WHERE dta = ? AND status = 'SOLD'", (p_dta,))
            else:
                conn.execute("INSERT INTO inventory_units (dta, status, brand, model, status_date, quantity) VALUES (?, 'SOLD', ?, ?, ?, 1)",
                             (p_dta, bill["brand"], bill["model"], bill_date))
                             
            conn.execute(
                "INSERT INTO inventory_logs (dta, brand, model, from_status, to_status, date, notes, created_at) VALUES (?, ?, ?, 'QC', 'SOLD', ?, 'Reverted return on bill deletion/edit', CURRENT_TIMESTAMP)",
                (p_dta, bill["brand"], bill["model"], bill_date)
            )
            
    elif tx_type == "Exchange":
        new_dta = bill["exch_new_dta"]
        new_source = bill["source"] or "Inventory"
        old_dta = bill["exch_old_dta"]
        
        status_map = {
            "Noon Piece": "NOON",
            "Region - Saudi": "REGION_SAUDI",
            "Region - Qatar": "REGION_QATAR",
            "Region - Oman": "REGION_OMAN",
            "QC Piece": "QC",
            "Cleaned & Ready Piece": "CLEANED_READY",
            "Display Piece": "DISPLAY",
            "Inventory": "STOCK"
        }
        
        if new_dta:
            new_dta = new_dta.strip().upper()
            inv_source_status = status_map.get(new_source, "STOCK")
            existing_src = conn.execute("SELECT quantity FROM inventory_units WHERE dta = ? AND status = ?", (new_dta, inv_source_status)).fetchone()
            if existing_src:
                conn.execute("UPDATE inventory_units SET quantity = quantity + 1 WHERE dta = ? AND status = ?", (new_dta, inv_source_status))
            else:
                conn.execute("INSERT INTO inventory_units (dta, status, brand, model, price, status_date, notes, quantity) VALUES (?, ?, ?, ?, ?, ?, 'Restored on bill deletion/edit', 1)",
                             (new_dta, inv_source_status, bill["exch_new_brand"], bill["exch_new_model"], bill["exch_new_price"], bill_date))
                             
            existing_sold = conn.execute("SELECT quantity FROM inventory_units WHERE dta = ? AND status = 'SOLD'", (new_dta,)).fetchone()
            if existing_sold:
                if existing_sold["quantity"] > 1:
                    conn.execute("UPDATE inventory_units SET quantity = quantity - 1 WHERE dta = ? AND status = 'SOLD'", (new_dta,))
                else:
                    conn.execute("DELETE FROM inventory_units WHERE dta = ? AND status = 'SOLD'", (new_dta,))
            if inv_source_status == "DISPLAY":
                decrement_display_piece(new_dta, bill_date, conn=conn, qty=1)
                
            conn.execute(
                "INSERT INTO inventory_logs (dta, brand, model, from_status, to_status, date, notes, created_at) VALUES (?, ?, ?, 'SOLD', ?, ?, 'Reverted sale on exchange deletion/edit', CURRENT_TIMESTAMP)",
                (new_dta, bill["exch_new_brand"], bill["exch_new_model"], inv_source_status, bill_date)
            )
            
        if old_dta:
            old_dta = old_dta.strip().upper()
            existing_qc = conn.execute("SELECT quantity FROM inventory_units WHERE dta = ? AND status = 'QC'", (old_dta,)).fetchone()
            if existing_qc:
                if existing_qc["quantity"] > 1:
                    conn.execute("UPDATE inventory_units SET quantity = quantity - 1 WHERE dta = ? AND status = 'QC'", (old_dta,))
                else:
                    conn.execute("DELETE FROM inventory_units WHERE dta = ? AND status = 'QC'", (old_dta,))
                    
            existing_sold = conn.execute("SELECT quantity FROM inventory_units WHERE dta = ? AND status = 'SOLD'", (old_dta,)).fetchone()
            if existing_sold:
                conn.execute("UPDATE inventory_units SET quantity = quantity + 1 WHERE dta = ? AND status = 'SOLD'", (old_dta,))
            else:
                conn.execute("INSERT INTO inventory_units (dta, status, brand, model, status_date, quantity) VALUES (?, 'SOLD', ?, ?, ?, 1)",
                             (old_dta, bill["exch_old_brand"], bill["exch_old_model"], bill_date))
            conn.execute(
                "INSERT INTO inventory_logs (dta, brand, model, from_status, to_status, date, notes, created_at) VALUES (?, ?, ?, 'QC', 'SOLD', ?, 'Reverted intake on exchange deletion/edit', CURRENT_TIMESTAMP)",
                (old_dta, bill["exch_old_brand"], bill["exch_old_model"], bill_date)
            )
            
    else:
        try:
            if bill["products_json"]:
                products = json.loads(bill["products_json"])
        except Exception:
            pass
            
        if not products and bill["dta"]:
            products = [{
                "dta": bill["dta"],
                "brand": bill["brand"],
                "model": bill["model"],
                "source": bill["source"] or "Inventory",
                "price": bill["price"]
            }]
            
        status_map = {
            "Noon Piece": "NOON",
            "Region - Saudi": "REGION_SAUDI",
            "Region - Qatar": "REGION_QATAR",
            "Region - Oman": "REGION_OMAN",
            "QC Piece": "QC",
            "Cleaned & Ready Piece": "CLEANED_READY",
            "Display Piece": "DISPLAY",
            "Inventory": "STOCK"
        }
        
        for p in products:
            p_dta = p.get("dta")
            p_source = p.get("source") or "Inventory"
            if not p_dta:
                continue
            p_dta = p_dta.strip().upper()
            inv_source_status = status_map.get(p_source, "STOCK")
            
            existing_src = conn.execute("SELECT quantity FROM inventory_units WHERE dta = ? AND status = ?", (p_dta, inv_source_status)).fetchone()
            if existing_src:
                conn.execute("UPDATE inventory_units SET quantity = quantity + 1 WHERE dta = ? AND status = ?", (p_dta, inv_source_status))
            else:
                conn.execute("INSERT INTO inventory_units (dta, status, brand, model, price, status_date, notes, quantity) VALUES (?, ?, ?, ?, ?, ?, 'Restored on bill deletion/edit', 1)",
                             (p_dta, inv_source_status, p.get("brand", ""), p.get("model", ""), float(p.get("price") or 0.0), bill_date))
                             
            existing_sold = conn.execute("SELECT quantity FROM inventory_units WHERE dta = ? AND status = 'SOLD'", (p_dta,)).fetchone()
            if existing_sold:
                if existing_sold["quantity"] > 1:
                    conn.execute("UPDATE inventory_units SET quantity = quantity - 1 WHERE dta = ? AND status = 'SOLD'", (p_dta,))
                else:
                    conn.execute("DELETE FROM inventory_units WHERE dta = ? AND status = 'SOLD'", (p_dta,))
            
            conn.execute(
                "INSERT INTO inventory_logs (dta, brand, model, from_status, to_status, date, notes, created_at) VALUES (?, ?, ?, 'SOLD', ?, ?, 'Reverted sale on bill deletion/edit', CURRENT_TIMESTAMP)",
                (p_dta, p.get("brand", ""), p.get("model", ""), inv_source_status, bill_date)
            )
            
            if inv_source_status == "DISPLAY":
                decrement_display_piece(p_dta, bill_date, conn=conn, qty=1)


def update_bill(bill_id: int, data: dict):
    conn = get_connection()
    try:
        # Revert the old bill's inventory impact
        _revert_bill_inventory_impact(bill_id, conn)
        
        conn.execute(
            """UPDATE bills SET
                date = :date,
                customer_name = :customer_name,
                brand = :brand,
                model = :model,
                dta = :dta,
                price = :price,
                payment_mode = :payment_mode,
                mixed_cash = :mixed_cash,
                mixed_card = :mixed_card,
                mixed_tabby = :mixed_tabby,
                mixed_tamara = :mixed_tamara,
                mixed_bank = :mixed_bank,
                note = :note,
                transaction_type = :transaction_type,
                platform = :platform,
                delivery = :delivery,
                exch_new_brand = :exch_new_brand,
                exch_new_model = :exch_new_model,
                exch_new_dta = :exch_new_dta,
                exch_new_price = :exch_new_price,
                exch_old_brand = :exch_old_brand,
                exch_old_model = :exch_old_model,
                exch_old_dta = :exch_old_dta,
                exch_old_price = :exch_old_price,
                exch_balance = :exch_balance,
                products_json = :products_json,
                source = :source,
                exch_old_source = :exch_old_source,
                jenny = :jenny
               WHERE id = :id""",
            {
                "id": bill_id,
                "date": data.get("date", ""),
                "customer_name": data.get("customer_name", ""),
                "brand": data.get("brand", ""),
                "model": data.get("model", ""),
                "dta": (data.get("dta") or "").upper(),
                "price": float(data.get("price") or 0),
                "payment_mode": data.get("payment_mode", "Cash"),
                "mixed_cash": float(data.get("mixed_cash") or 0),
                "mixed_card": float(data.get("mixed_card") or 0),
                "mixed_tabby": float(data.get("mixed_tabby") or 0),
                "mixed_tamara": float(data.get("mixed_tamara") or 0),
                "mixed_bank": float(data.get("mixed_bank") or 0),
                "note": data.get("note", ""),
                "transaction_type": data.get("transaction_type", "Sale"),
                "platform": data.get("platform", "Regular Customer"),
                "delivery": 1 if data.get("delivery") else 0,
                "exch_new_brand": data.get("exch_new_brand", ""),
                "exch_new_model": data.get("exch_new_model", ""),
                "exch_new_dta": (data.get("exch_new_dta") or "").upper(),
                "exch_new_price": float(data.get("exch_new_price") or 0),
                "exch_old_brand": data.get("exch_old_brand", ""),
                "exch_old_model": data.get("exch_old_model", ""),
                "exch_old_dta": (data.get("exch_old_dta") or "").upper(),
                "exch_old_price": float(data.get("exch_old_price") or 0),
                "exch_balance": float(data.get("exch_balance") or 0),
                "products_json": data.get("products_json", "[]"),
                "source": data.get("source", "Inventory"),
                "exch_old_source": data.get("exch_old_source", "Inventory"),
                "jenny": 1 if data.get("jenny") else 0,
            },
        )
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()
        
    # Apply deductions for the new bill state
    _deduct_display_pieces_from_bill(data)


def delete_bill(bill_id: int):
    conn = get_connection()
    try:
        # Revert the bill's inventory impact before deleting it
        _revert_bill_inventory_impact(bill_id, conn)
        conn.execute("DELETE FROM bills WHERE id = ?", (bill_id,))
        # Cascade delete any associated deliveries
        conn.execute("DELETE FROM deliveries WHERE bill_id = ?", (bill_id,))
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()


def get_stats(target_date=None):
    conn = get_connection()
    if not target_date:
        from datetime import date as _date
        target_date = _date.today().strftime("%d-%m-%Y")

    # Fetch platform statistics for today
    platform_stats = conn.execute(
        """SELECT platform, COUNT(*) as cnt FROM bills
           WHERE date = ? GROUP BY platform ORDER BY cnt DESC""",
        (target_date,)
    ).fetchall()

    # Calculate 30-day monthly revenue trend based on Sale price + positive Exchange balance (refunds/Jenny separate)
    monthly_revenue = conn.execute(
        """SELECT date, SUM(
               CASE 
                   WHEN jenny = 1 THEN 0
                   WHEN transaction_type = 'Sale' THEN COALESCE(price, 0)
                   WHEN transaction_type = 'Exchange' AND COALESCE(exch_balance, 0) > 0 THEN COALESCE(exch_balance, 0)
                   WHEN transaction_type = 'Return' THEN -COALESCE(price, 0)
                   ELSE 0 
               END
           ) as rev FROM bills
           GROUP BY date ORDER BY date DESC LIMIT 30"""
    ).fetchall()

    # Calculate Revenue, counts, and MOP breakdown for today in a single pass
    today_bills = conn.execute(
        "SELECT * FROM bills WHERE date = ?", (target_date,)
    ).fetchall()
    
    sales_count = 0
    revenue = 0.0
    returns_count = 0
    exchanges_count = 0
    
    mop_breakdown = {"Cash": 0.0, "Card": 0.0, "Tabby": 0.0, "Tamara": 0.0, "Bank Transfer": 0.0}
    source_counts = {"Inventory": 0, "Display Piece": 0, "QC Piece": 0}
    
    for b in today_bills:
        if b["jenny"] == 1:
            continue
        tx_type = b["transaction_type"]
        mop = b["payment_mode"]
        
        if tx_type == "Sale":
            sales_count += 1
            amount = b["price"] or 0.0
            revenue += amount
        elif tx_type == "Exchange":
            exchanges_count += 1
            sales_count += 1  # Include exchange as sale count
            bal = b["exch_balance"] or 0.0
            amount = bal if bal > 0 else 0.0
            revenue += amount
        elif tx_type == "Return":
            returns_count += 1
            amount = b["price"] or 0.0
            revenue -= amount
            
        # Payment MOP Breakdown
        sign = -1 if tx_type == "Return" else 1
        if mop == "Mixed":
            mop_breakdown["Cash"]   += sign * (b["mixed_cash"] or 0.0)
            mop_breakdown["Card"]   += sign * (b["mixed_card"] or 0.0)
            mop_breakdown["Tabby"]  += sign * (b["mixed_tabby"] or 0.0)
            mop_breakdown["Tamara"] += sign * (b["mixed_tamara"] or 0.0)
            mop_breakdown["Bank Transfer"] += sign * (b["mixed_bank"] or 0.0)
        elif mop in mop_breakdown:
            if tx_type == "Return":
                mop_breakdown[mop] -= amount
            else:
                mop_breakdown[mop] += amount

    # Aggregate Top 5 most sold product models and source statistics
    from collections import Counter
    import json
    today_models = []
    for b in today_bills:
        if b["jenny"] == 1:
            continue
        tx_type = b["transaction_type"]
        if tx_type == "Sale":
            p_list = []
            try:
                p_list = json.loads(b["products_json"] or "[]")
            except Exception:
                pass
            if p_list:
                for p in p_list:
                    model = p.get("model")
                    if model:
                        today_models.append(model)
                    src = p.get("source") or "Inventory"
                    if src in source_counts:
                        source_counts[src] += 1
            else:
                model = b["model"]
                if model:
                    today_models.append(model)
                src = b["source"] or "Inventory"
                if src in source_counts:
                    source_counts[src] += 1
        elif tx_type == "Exchange":
            new_model = b["exch_new_model"]
            if new_model:
                today_models.append(new_model)
            src = b["source"] or "Inventory"
            if src in source_counts:
                source_counts[src] += 1
                
    model_counts = Counter(today_models)
    top_products_list = [{"model": k, "cnt": v} for k, v in model_counts.most_common(5)]

    conn.close()
    return {
        "today": {
            "sales_count": sales_count,
            "revenue": revenue,
            "returns": returns_count,
            "exchanges": exchanges_count,
        },
        "platforms": [dict(r) for r in platform_stats],
        "monthly": [dict(r) for r in monthly_revenue],
        "mop": mop_breakdown,
        "top_products": top_products_list,
        "sources": source_counts,
    }


def get_monthly_stats(month_str: str):
    conn = get_connection()
    # Query all bills for the selected month, sorted by date ASC
    bills = conn.execute(
        "SELECT * FROM bills WHERE date LIKE ? ORDER BY date ASC, id ASC",
        (f"%-{month_str}",)
    ).fetchall()
    
    sales_count = 0
    revenue = 0.0
    returns_count = 0
    exchanges_count = 0
    
    mop_breakdown = {"Cash": 0.0, "Card": 0.0, "Tabby": 0.0, "Tamara": 0.0, "Bank Transfer": 0.0}
    platform_breakdown = {}
    product_counts = {}
    source_counts = {"Inventory": 0, "Display Piece": 0, "QC Piece": 0}
    
    # Track day-by-day revenue for the selected month to show on the line chart
    daily_revenue = {}
    
    for b in bills:
        if b["jenny"] == 1:
            continue
        tx_type = b["transaction_type"]
        date = b["date"] # format DD-MM-YYYY
        
        # Track counts and revenue
        if tx_type == "Sale":
            sales_count += 1
            amount = b["price"] or 0.0
            revenue += amount
            
            # Daily revenue
            daily_revenue[date] = daily_revenue.get(date, 0.0) + amount
            
            # Platform counts
            plat = b["platform"] or "Regular Customer"
            platform_breakdown[plat] = platform_breakdown.get(plat, 0) + 1
            
            # Product counts & sources
            import json
            p_list = []
            try:
                p_list = json.loads(b["products_json"] or "[]")
            except Exception:
                pass
            if p_list:
                for p in p_list:
                    model = p.get("model")
                    if model:
                        product_counts[model] = product_counts.get(model, 0) + 1
                    src = p.get("source") or "Inventory"
                    if src in source_counts:
                        source_counts[src] += 1
            else:
                model = b["model"]
                if model:
                    product_counts[model] = product_counts.get(model, 0) + 1
                src = b["source"] or "Inventory"
                if src in source_counts:
                    source_counts[src] += 1
                
        elif tx_type == "Exchange":
            exchanges_count += 1
            sales_count += 1 # Exchange counts as sale count
            bal = b["exch_balance"] or 0.0
            amount = bal if bal > 0 else 0.0
            revenue += amount
            
            # Daily revenue
            daily_revenue[date] = daily_revenue.get(date, 0.0) + amount
            
            # Platform counts
            plat = b["platform"] or "Regular Customer"
            platform_breakdown[plat] = platform_breakdown.get(plat, 0) + 1
            
            # Product counts & sources
            new_model = b["exch_new_model"]
            if new_model:
                product_counts[new_model] = product_counts.get(new_model, 0) + 1
            src = b["source"] or "Inventory"
            if src in source_counts:
                source_counts[src] += 1
                
        elif tx_type == "Return":
            returns_count += 1
            amount = b["price"] or 0.0
            revenue -= amount
            daily_revenue[date] = daily_revenue.get(date, 0.0) - amount
            
        # Payment MOP Breakdown
        mop = b["payment_mode"]
        sign = -1 if tx_type == "Return" else 1
        if mop == "Mixed":
            mop_breakdown["Cash"]   += sign * (b["mixed_cash"] or 0.0)
            mop_breakdown["Card"]   += sign * (b["mixed_card"] or 0.0)
            mop_breakdown["Tabby"]  += sign * (b["mixed_tabby"] or 0.0)
            mop_breakdown["Tamara"] += sign * (b["mixed_tamara"] or 0.0)
            mop_breakdown["Bank Transfer"] += sign * (b["mixed_bank"] or 0.0)
        elif mop in mop_breakdown:
            if tx_type == "Return":
                mop_breakdown[mop] -= amount
            else:
                mop_breakdown[mop] += amount
                
    # Format platforms list
    platforms_list = [{"platform": k, "cnt": v} for k, v in platform_breakdown.items()]
    platforms_list.sort(key=lambda x: x["cnt"], reverse=True)
    
    # Format top products list
    top_products_list = [{"model": k, "cnt": v} for k, v in product_counts.items()]
    top_products_list.sort(key=lambda x: x["cnt"], reverse=True)
    top_products_list = top_products_list[:5]
    
    # Format daily revenue list (sorted chronologically by date)
    daily_revenue_list = []
    sorted_dates = sorted(list(daily_revenue.keys()))
    for d in sorted_dates:
        daily_revenue_list.append({"date": d, "rev": daily_revenue[d]})
        
    conn.close()
    
    return {
        "month_summary": {
            "sales_count": sales_count,
            "revenue": revenue,
            "returns": returns_count,
            "exchanges": exchanges_count,
        },
        "platforms": platforms_list,
        "mop": mop_breakdown,
        "top_products": top_products_list,
        "daily_trend": daily_revenue_list,
        "sources": source_counts
    }


# ── Display Pieces ────────────────────────────────────────────────────────────

def add_display_piece(dta: str, brand: str = "", model: str = "", force_increment: bool = False, date: str = None, conn=None, qty: int = 1):
    dta = dta.strip().upper()
    if not date:
        from datetime import date as _date
        date = _date.today().strftime("%d-%m-%Y")
    close_conn = False
    if conn is None:
        conn = get_connection()
        close_conn = True
        
    # Lookup brand and model from products table if they are empty
    if not brand or not model:
        p = get_product(dta, conn=conn)
        if p:
            brand = brand or p.get("brand", "")
            model = model or p.get("model", "")
        else:
            if close_conn:
                conn.close()
            raise ValueError(f"Product {dta} not in catalogue. Please scan sticker first.")
            
    # Check if duplicate exists for this date
    existing = conn.execute("SELECT brand, model, quantity FROM display_pieces WHERE dta = ? AND date = ?", (dta, date)).fetchone()
    if existing and not force_increment:
        if close_conn:
            conn.close()
        return {
            "duplicate": True,
            "brand": existing["brand"] or brand,
            "model": existing["model"] or model,
            "quantity": existing["quantity"] or 1
        }
        
    if existing and force_increment:
        conn.execute("UPDATE display_pieces SET quantity = COALESCE(quantity, 1) + ?, added_at = CURRENT_TIMESTAMP WHERE dta = ? AND date = ?", (qty, dta, date))
        
        # Sync with inventory_units
        existing_inv = conn.execute("SELECT quantity FROM inventory_units WHERE dta = ? AND status = 'DISPLAY'", (dta,)).fetchone()
        if existing_inv:
            conn.execute("UPDATE inventory_units SET quantity = quantity + ?, status_date = ?, updated_at = CURRENT_TIMESTAMP WHERE dta = ? AND status = 'DISPLAY'", (qty, date, dta))
        else:
            conn.execute("INSERT INTO inventory_units (dta, status, brand, model, price, status_date, notes, quantity) VALUES (?, 'DISPLAY', ?, ?, 0.0, ?, 'Added to Display', ?)", (dta, brand, model, date, qty))
            
        if close_conn:
            conn.commit()
            conn.close()
        return {"ok": True, "incremented": True}
        
    conn.execute(
        """INSERT INTO display_pieces (dta, date, brand, model, quantity)
           VALUES (?, ?, ?, ?, ?)
           ON CONFLICT(dta, date) DO UPDATE SET
               brand = excluded.brand,
               model = excluded.model,
               quantity = COALESCE(quantity, 1) + ?,
               added_at = CURRENT_TIMESTAMP""",
        (dta, date, brand.strip(), model.strip(), qty, qty)
    )
    
    # Sync with inventory_units
    existing_inv = conn.execute("SELECT quantity FROM inventory_units WHERE dta = ? AND status = 'DISPLAY'", (dta,)).fetchone()
    if existing_inv:
        conn.execute(
            "UPDATE inventory_units SET quantity = quantity + ?, status_date = ?, updated_at = CURRENT_TIMESTAMP WHERE dta = ? AND status = 'DISPLAY'",
            (qty, date, dta)
        )
    else:
        conn.execute(
            "INSERT INTO inventory_units (dta, status, brand, model, price, status_date, notes, quantity) VALUES (?, 'DISPLAY', ?, ?, 0.0, ?, 'Added to Display', ?)",
            (dta, brand, model, date, qty)
        )
        
    if close_conn:
        conn.commit()
        conn.close()
    return {"ok": True, "added": True}


def get_all_display_pieces(date: str = None):
    conn = get_connection()
    if date:
        rows = conn.execute(
            """
            SELECT 
                dp.dta,
                dp.date,
                COALESCE(p.brand, dp.brand) as brand,
                COALESCE(p.model, dp.model) as model,
                dp.quantity,
                dp.added_at
            FROM display_pieces dp
            LEFT JOIN products p ON dp.dta = p.dta
            WHERE dp.date = ?
            ORDER BY dp.added_at DESC
            """, (date,)
        ).fetchall()
    else:
        rows = conn.execute(
            """
            SELECT 
                dp.dta,
                dp.date,
                COALESCE(p.brand, dp.brand) as brand,
                COALESCE(p.model, dp.model) as model,
                dp.quantity,
                dp.added_at
            FROM display_pieces dp
            LEFT JOIN products p ON dp.dta = p.dta
            ORDER BY dp.date DESC, dp.added_at DESC
            """
        ).fetchall()
    conn.close()
    return [dict(r) for r in rows]



def remove_display_piece(dta: str, date: str = None):
    dta = dta.strip().upper()
    conn = get_connection()
    try:
        if date:
            row = conn.execute("SELECT quantity FROM display_pieces WHERE dta = ? AND date = ?", (dta, date)).fetchone()
            qty = row["quantity"] if row else 1
            conn.execute("DELETE FROM display_pieces WHERE dta = ? AND date = ?", (dta, date))
            
            existing_inv = conn.execute("SELECT quantity FROM inventory_units WHERE dta = ? AND status = 'DISPLAY'", (dta,)).fetchone()
            if existing_inv:
                inv_qty = existing_inv["quantity"] or 1
                if inv_qty > qty:
                    conn.execute("UPDATE inventory_units SET quantity = quantity - ? WHERE dta = ? AND status = 'DISPLAY'", (qty, dta))
                else:
                    conn.execute("DELETE FROM inventory_units WHERE dta = ? AND status = 'DISPLAY'", (dta,))
        else:
            conn.execute("DELETE FROM display_pieces WHERE dta = ?", (dta,))
            conn.execute("DELETE FROM inventory_units WHERE dta = ? AND status = 'DISPLAY'", (dta,))
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()


def decrement_display_piece(dta: str, date: str = None, conn=None, qty: int = 1):
    dta = dta.strip().upper()
    if not date:
        from datetime import date as _date
        date = _date.today().strftime("%d-%m-%Y")
    close_conn = False
    if conn is None:
        conn = get_connection()
        close_conn = True
    try:
        row = conn.execute("SELECT quantity FROM display_pieces WHERE dta = ? AND date = ?", (dta, date)).fetchone()
        if row:
            current_qty = row["quantity"] or 1
            if current_qty > qty:
                conn.execute("UPDATE display_pieces SET quantity = quantity - ? WHERE dta = ? AND date = ?", (qty, dta, date))
            else:
                conn.execute("DELETE FROM display_pieces WHERE dta = ? AND date = ?", (dta, date))
                
            existing_inv = conn.execute("SELECT quantity FROM inventory_units WHERE dta = ? AND status = 'DISPLAY'", (dta,)).fetchone()
            if existing_inv:
                inv_qty = existing_inv["quantity"] or 1
                if inv_qty > qty:
                    conn.execute("UPDATE inventory_units SET quantity = quantity - ? WHERE dta = ? AND status = 'DISPLAY'", (qty, dta))
                else:
                    conn.execute("DELETE FROM inventory_units WHERE dta = ? AND status = 'DISPLAY'", (dta,))
        if close_conn:
            conn.commit()
    except Exception as e:
        if close_conn:
            conn.rollback()
        raise e
    finally:
        if close_conn:
            conn.close()


def check_display_piece(dta: str, date: str = None) -> bool:
    dta = dta.strip().upper()
    conn = get_connection()
    if date:
        row = conn.execute(
            "SELECT 1 FROM display_pieces WHERE dta = ? AND date = ?", (dta, date)
        ).fetchone()
    else:
        row = conn.execute(
            "SELECT 1 FROM display_pieces WHERE dta = ?", (dta,)
        ).fetchone()
    conn.close()
    return row is not None


def rollover_display_pieces(source_date: str, target_date: str):
    conn = get_connection()
    
    # 1. Fetch display pieces from the source_date
    source_items = conn.execute("SELECT * FROM display_pieces WHERE date = ? AND quantity > 0", (source_date,)).fetchall()
    
    if not source_items:
        conn.close()
        return {"ok": True, "copied": 0, "message": f"No display items found on {source_date} to rollover."}
        
    copied_count = 0
    for item in source_items:
        # Check if it already exists on target_date
        existing = conn.execute("SELECT quantity FROM display_pieces WHERE dta = ? AND date = ?", (item["dta"], target_date)).fetchone()
        if existing:
            # Update target quantity (rollover merges the quantity)
            conn.execute(
                "UPDATE display_pieces SET quantity = quantity + ? WHERE dta = ? AND date = ?",
                (item["quantity"], item["dta"], target_date)
            )
        else:
            # Insert fresh
            conn.execute(
                """INSERT INTO display_pieces (dta, date, brand, model, quantity)
                   VALUES (?, ?, ?, ?, ?)""",
                (item["dta"], target_date, item["brand"], item["model"], item["quantity"])
            )
        copied_count += 1
        
    conn.commit()
    conn.close()
    return {"ok": True, "copied": copied_count}


def _deduct_display_pieces_from_bill(data: dict, conn=None):
    # Auto-deduct any sold display pieces from display inventory
    tx_type = data.get("transaction_type", "Sale")
    bill_date = data.get("date")
    customer_name = data.get("customer_name", "")
    
    import json
    products = []
    
    close_conn = False
    if conn is None:
        conn = get_connection()
        close_conn = True
    try:
        if tx_type == "Return":
            p_dta = data.get("dta")
            p_brand = data.get("brand", "")
            p_model = data.get("model", "")
            if p_dta:
                p_dta = p_dta.strip().upper()
                existing = conn.execute("SELECT quantity, notes FROM inventory_units WHERE dta = ? AND status = 'QC'", (p_dta,)).fetchone()
                if existing:
                    conn.execute(
                        "UPDATE inventory_units SET quantity = quantity + 1, notes = ?, status_date = ?, updated_at = CURRENT_TIMESTAMP WHERE dta = ? AND status = 'QC'",
                        (f"{existing['notes'] or ''}; Returned in Bill (Customer: {customer_name})".strip("; "), bill_date, p_dta)
                    )
                else:
                    conn.execute(
                        "INSERT INTO inventory_units (dta, status, brand, model, status_date, notes, quantity) VALUES (?, 'QC', ?, ?, ?, ?, 1)",
                        (p_dta, p_brand, p_model, bill_date, f"Returned in Bill (Customer: {customer_name})")
                    )
                
                existing_sold = conn.execute("SELECT quantity FROM inventory_units WHERE dta = ? AND status = 'SOLD'", (p_dta,)).fetchone()
                if existing_sold:
                    if existing_sold["quantity"] > 1:
                        conn.execute("UPDATE inventory_units SET quantity = quantity - 1 WHERE dta = ? AND status = 'SOLD'", (p_dta,))
                    else:
                        conn.execute("DELETE FROM inventory_units WHERE dta = ? AND status = 'SOLD'", (p_dta,))
                        
                conn.execute(
                    "INSERT INTO inventory_logs (dta, brand, model, from_status, to_status, date, notes, created_at) VALUES (?, ?, ?, 'SOLD', 'QC', ?, ?, CURRENT_TIMESTAMP)",
                    (p_dta, p_brand, p_model, bill_date, f"Returned by customer {customer_name}")
                )
                
        elif tx_type == "Exchange":
            new_dta = data.get("exch_new_dta")
            new_brand = data.get("exch_new_brand", "")
            new_model = data.get("exch_new_model", "")
            new_source = data.get("source") or "Inventory"
            
            old_dta = data.get("exch_old_dta")
            old_brand = data.get("exch_old_brand", "")
            old_model = data.get("exch_old_model", "")
            
            status_map = {
                "Noon Piece": "NOON",
                "Region - Saudi": "REGION_SAUDI",
                "Region - Qatar": "REGION_QATAR",
                "Region - Oman": "REGION_OMAN",
                "QC Piece": "QC",
                "Cleaned & Ready Piece": "CLEANED_READY",
                "Display Piece": "DISPLAY",
                "Inventory": "STOCK"
            }
            
            if new_dta:
                new_dta = new_dta.strip().upper()
                inv_from_status = status_map.get(new_source, "STOCK")
                unit = conn.execute("SELECT quantity FROM inventory_units WHERE dta = ? AND status = ?", (new_dta, inv_from_status)).fetchone()
                if unit:
                    if unit["quantity"] > 1:
                        conn.execute("UPDATE inventory_units SET quantity = quantity - 1 WHERE dta = ? AND status = ?", (new_dta, inv_from_status))
                    else:
                        conn.execute("DELETE FROM inventory_units WHERE dta = ? AND status = ?", (new_dta, inv_from_status))
                
                existing_sold = conn.execute("SELECT quantity FROM inventory_units WHERE dta = ? AND status = 'SOLD'", (new_dta,)).fetchone()
                if existing_sold:
                    conn.execute("UPDATE inventory_units SET quantity = quantity + 1, status_date = ?, updated_at = CURRENT_TIMESTAMP WHERE dta = ? AND status = 'SOLD'", (bill_date, new_dta))
                else:
                    conn.execute("INSERT INTO inventory_units (dta, status, brand, model, status_date, quantity) VALUES (?, 'SOLD', ?, ?, ?, 1)", (new_dta, new_brand, new_model, bill_date))
                
                conn.execute(
                    "INSERT INTO inventory_logs (dta, brand, model, from_status, to_status, date, notes, created_at) VALUES (?, ?, ?, ?, 'SOLD', ?, ?, CURRENT_TIMESTAMP)",
                    (new_dta, new_brand, new_model, inv_from_status, bill_date, f"Sold in Exchange (Customer: {customer_name})")
                )
                if inv_from_status == "DISPLAY":
                    decrement_display_piece(new_dta, bill_date, conn=conn, qty=1)
                    
            if old_dta:
                old_dta = old_dta.strip().upper()
                existing = conn.execute("SELECT quantity, notes FROM inventory_units WHERE dta = ? AND status = 'QC'", (old_dta,)).fetchone()
                if existing:
                    conn.execute(
                        "UPDATE inventory_units SET quantity = quantity + 1, notes = ?, status_date = ?, updated_at = CURRENT_TIMESTAMP WHERE dta = ? AND status = 'QC'",
                        (f"{existing['notes'] or ''}; Returned in Exchange (Customer: {customer_name})".strip("; "), bill_date, old_dta)
                    )
                else:
                    conn.execute(
                        "INSERT INTO inventory_units (dta, status, brand, model, status_date, notes, quantity) VALUES (?, 'QC', ?, ?, ?, ?, 1)",
                        (old_dta, old_brand, old_model, bill_date, f"Returned in Exchange (Customer: {customer_name})")
                    )
                
                existing_sold = conn.execute("SELECT quantity FROM inventory_units WHERE dta = ? AND status = 'SOLD'", (old_dta,)).fetchone()
                if existing_sold:
                    if existing_sold["quantity"] > 1:
                        conn.execute("UPDATE inventory_units SET quantity = quantity - 1 WHERE dta = ? AND status = 'SOLD'", (old_dta,))
                    else:
                        conn.execute("DELETE FROM inventory_units WHERE dta = ? AND status = 'SOLD'", (old_dta,))
                        
                conn.execute(
                    "INSERT INTO inventory_logs (dta, brand, model, from_status, to_status, date, notes, created_at) VALUES (?, ?, ?, 'SOLD', 'QC', ?, ?, CURRENT_TIMESTAMP)",
                    (old_dta, old_brand, old_model, bill_date, f"Exchanged from customer {customer_name}")
                )
                
        else:
            try:
                if data.get("products_json"):
                    products = json.loads(data["products_json"])
            except Exception:
                pass
            
            if not products and isinstance(data.get("products"), list):
                products = data["products"]
                
            deducted_any = False
            if products:
                for p in products:
                    p_dta = p.get("dta")
                    p_source = p.get("source") or "Inventory"
                    if p_dta:
                        p_dta = p_dta.strip().upper()
                        status_map = {
                            "Noon Piece": "NOON",
                            "Region - Saudi": "REGION_SAUDI",
                            "Region - Qatar": "REGION_QATAR",
                            "Region - Oman": "REGION_OMAN",
                            "QC Piece": "QC",
                            "Cleaned & Ready Piece": "CLEANED_READY",
                            "Display Piece": "DISPLAY",
                            "Inventory": "STOCK"
                        }
                        inv_from_status = status_map.get(p_source, "STOCK")
                        
                        unit = conn.execute("SELECT quantity, brand, model FROM inventory_units WHERE dta = ? AND status = ?", (p_dta, inv_from_status)).fetchone()
                        brand = p.get("brand", "") or (unit["brand"] if unit else "")
                        model = p.get("model", "") or (unit["model"] if unit else "")
                        
                        if unit:
                            qty = unit["quantity"] or 1
                            if qty > 1:
                                conn.execute(
                                    "UPDATE inventory_units SET quantity = quantity - 1 WHERE dta = ? AND status = ?",
                                    (p_dta, inv_from_status)
                                )
                            else:
                                conn.execute(
                                    "DELETE FROM inventory_units WHERE dta = ? AND status = ?",
                                    (p_dta, inv_from_status)
                                )
                        
                        existing_sold = conn.execute("SELECT quantity FROM inventory_units WHERE dta = ? AND status = 'SOLD'", (p_dta,)).fetchone()
                        if existing_sold:
                            conn.execute(
                                "UPDATE inventory_units SET quantity = quantity + 1, status_date = ?, updated_at = CURRENT_TIMESTAMP WHERE dta = ? AND status = 'SOLD'",
                                (bill_date, p_dta)
                            )
                        else:
                            conn.execute(
                                "INSERT INTO inventory_units (dta, status, brand, model, status_date, quantity) VALUES (?, 'SOLD', ?, ?, ?, 1)",
                                (p_dta, brand, model, bill_date)
                            )
                            
                        conn.execute(
                            "INSERT INTO inventory_logs (dta, brand, model, from_status, to_status, date, notes, created_at) VALUES (?, ?, ?, ?, 'SOLD', ?, ?, CURRENT_TIMESTAMP)",
                            (p_dta, brand, model, inv_from_status, bill_date, f"Sold in Bill (Customer: {customer_name})")
                        )
    
                    if p.get("source") == "Display Piece" and p.get("dta"):
                        decrement_display_piece(p.get("dta"), bill_date, conn=conn, qty=1)
                        deducted_any = True
                        
            if not deducted_any:
                p_dta = data.get("dta")
                p_source = data.get("source") or "Inventory"
                if p_dta:
                    p_dta = p_dta.strip().upper()
                    status_map = {
                        "Noon Piece": "NOON",
                        "Region - Saudi": "REGION_SAUDI",
                        "Region - Qatar": "REGION_QATAR",
                        "Region - Oman": "REGION_OMAN",
                        "QC Piece": "QC",
                        "Cleaned & Ready Piece": "CLEANED_READY",
                        "Display Piece": "DISPLAY",
                        "Inventory": "STOCK"
                    }
                    inv_from_status = status_map.get(p_source, "STOCK")
                    unit = conn.execute("SELECT quantity, brand, model FROM inventory_units WHERE dta = ? AND status = ?", (p_dta, inv_from_status)).fetchone()
                    brand = data.get("brand", "") or (unit["brand"] if unit else "")
                    model = data.get("model", "") or (unit["model"] if unit else "")
                    
                    if unit:
                        qty = unit["quantity"] or 1
                        if qty > 1:
                            conn.execute(
                                "UPDATE inventory_units SET quantity = quantity - 1 WHERE dta = ? AND status = ?",
                                (p_dta, inv_from_status)
                            )
                        else:
                            conn.execute(
                                "DELETE FROM inventory_units WHERE dta = ? AND status = ?",
                                (p_dta, inv_from_status)
                            )
                    
                    existing_sold = conn.execute("SELECT quantity FROM inventory_units WHERE dta = ? AND status = 'SOLD'", (p_dta,)).fetchone()
                    if existing_sold:
                        conn.execute(
                            "UPDATE inventory_units SET quantity = quantity + 1, status_date = ?, updated_at = CURRENT_TIMESTAMP WHERE dta = ? AND status = 'SOLD'",
                            (bill_date, p_dta)
                        )
                    else:
                        conn.execute(
                            "INSERT INTO inventory_units (dta, status, brand, model, status_date, quantity) VALUES (?, 'SOLD', ?, ?, ?, 1)",
                            (p_dta, brand, model, bill_date)
                        )
                        
                    conn.execute(
                        "INSERT INTO inventory_logs (dta, brand, model, from_status, to_status, date, notes, created_at) VALUES (?, ?, ?, ?, 'SOLD', ?, ?, CURRENT_TIMESTAMP)",
                        (p_dta, brand, model, inv_from_status, bill_date, f"Sold in Bill (Customer: {customer_name})")
                    )
    
                    if data.get("source") == "Display Piece" and data.get("dta"):
                        decrement_display_piece(data.get("dta"), bill_date, conn=conn, qty=1)
        if close_conn:
            conn.commit()
    except Exception as ex:
        if close_conn:
            conn.rollback()
        print(f"Error updating inventory on sale: {ex}")
    finally:
        if close_conn:
            conn.close()



def get_inventory_unit(dta: str, status: str = None):
    dta = dta.strip().upper()
    conn = get_connection()
    if status:
        row = conn.execute("SELECT * FROM inventory_units WHERE dta = ? AND status = ?", (dta, status)).fetchone()
    else:
        row = conn.execute("SELECT * FROM inventory_units WHERE dta = ? AND status != 'SOLD'", (dta,)).fetchone()
    conn.close()
    return dict(row) if row else None


def add_inventory_unit(dta: str, status: str, brand: str = "", model: str = "", price: float = 0.0, date: str = None, notes: str = "", quantity: int = 1):
    dta = dta.strip().upper()
    status = status.strip()
    brand = brand.strip()
    model = model.strip()
    
    if not date:
        from datetime import date as _date
        date = _date.today().strftime("%d-%m-%Y")
    else:
        date = date.strip()

    conn = get_connection()
    try:
        if not brand or not model:
            p = get_product(dta, conn=conn)
            if p:
                brand = brand or p.get("brand", "")
                model = model or p.get("model", "")
                price = price or p.get("price", 0.0)

        if brand and model:
            upsert_product(dta, brand, model, price, conn=conn)

        existing = conn.execute("SELECT quantity, notes FROM inventory_units WHERE dta = ? AND status = ?", (dta, status)).fetchone()
        from_status = "NONE"
        if existing:
            new_qty = (existing["quantity"] or 0) + quantity
            new_notes = existing["notes"] or ""
            if notes and notes not in new_notes:
                new_notes = f"{new_notes}; {notes}".strip("; ")
            conn.execute(
                """UPDATE inventory_units SET
                   brand = ?,
                   model = ?,
                   price = ?,
                   status_date = ?,
                   notes = ?,
                   quantity = ?,
                   updated_at = CURRENT_TIMESTAMP
                   WHERE dta = ? AND status = ?""",
                (brand, model, float(price), date, new_notes, new_qty, dta, status)
            )
        else:
            conn.execute(
                """INSERT INTO inventory_units (dta, status, brand, model, price, status_date, notes, quantity)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                (dta, status, brand, model, float(price), date, notes, quantity)
            )
        
        conn.execute(
            """INSERT INTO inventory_logs (dta, brand, model, from_status, to_status, date, notes, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)""",
            (dta, brand, model, from_status, status, date, f"Intake to {status} (Qty: {quantity})")
        )
        
        if status == "DISPLAY":
            add_display_piece(dta, brand, model, force_increment=True, date=date, conn=conn, qty=quantity)
                 
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()
    return {"ok": True}


def move_inventory_unit(dta: str, from_status: str, to_status: str, qty_to_move: int = 1, date: str = None, notes: str = ""):
    dta = dta.strip().upper()
    from_status = from_status.strip()
    to_status = to_status.strip()
    
    if not date:
        from datetime import date as _date
        date = _date.today().strftime("%d-%m-%Y")
    else:
        date = date.strip()

    conn = get_connection()
    try:
        unit = conn.execute("SELECT * FROM inventory_units WHERE dta = ? AND status = ?", (dta, from_status)).fetchone()
        if not unit:
            raise ValueError(f"DTA unit {dta} not found in inventory under status {from_status}.")

        current_qty = unit["quantity"] or 1
        qty_to_move = min(qty_to_move, current_qty)
        brand = unit["brand"]
        model = unit["model"]
        price = unit["price"]

        # 1. Decrement or remove from source
        rem_qty = current_qty - qty_to_move
        if rem_qty <= 0:
            conn.execute("DELETE FROM inventory_units WHERE dta = ? AND status = ?", (dta, from_status))
        else:
            conn.execute("UPDATE inventory_units SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE dta = ? AND status = ?", (rem_qty, dta, from_status))

        # 2. Increment or insert into target
        target = conn.execute("SELECT quantity, notes FROM inventory_units WHERE dta = ? AND status = ?", (dta, to_status)).fetchone()
        if target:
            new_target_qty = (target["quantity"] or 0) + qty_to_move
            new_notes = target["notes"] or ""
            if notes and notes not in new_notes:
                new_notes = f"{new_notes}; {notes}".strip("; ")
            conn.execute(
                """UPDATE inventory_units SET
                   quantity = ?,
                   notes = ?,
                   status_date = ?,
                   updated_at = CURRENT_TIMESTAMP
                   WHERE dta = ? AND status = ?""",
                (new_target_qty, new_notes, date, dta, to_status)
            )
        else:
            conn.execute(
                """INSERT INTO inventory_units (dta, status, brand, model, price, status_date, notes, quantity)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                (dta, to_status, brand, model, price, date, notes, qty_to_move)
            )

        # 3. Log the move
        conn.execute(
            """INSERT INTO inventory_logs (dta, brand, model, from_status, to_status, date, notes, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)""",
            (dta, brand, model, from_status, to_status, date, f"Moved {qty_to_move} unit(s). Notes: {notes}")
        )

        if to_status == "DISPLAY":
            add_display_piece(dta, brand, model, force_increment=True, date=date, conn=conn, qty=qty_to_move)
        
        if from_status == "DISPLAY":
            decrement_display_piece(dta, date, conn=conn, qty=qty_to_move)

        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()
    return {"ok": True}


def adjust_inventory_qty(dta: str, status: str, delta: int):
    dta = dta.strip().upper()
    status = status.strip()
    conn = get_connection()
    try:
        unit = conn.execute("SELECT * FROM inventory_units WHERE dta = ? AND status = ?", (dta, status)).fetchone()
        if not unit:
            raise ValueError(f"DTA unit {dta} not found in status {status}.")
        
        current_qty = unit["quantity"] or 1
        new_qty = current_qty + delta
        brand = unit["brand"]
        model = unit["model"]
        
        if new_qty <= 0:
            conn.execute("DELETE FROM inventory_units WHERE dta = ? AND status = ?", (dta, status))
            conn.execute(
                """INSERT INTO inventory_logs (dta, brand, model, from_status, to_status, date, notes, created_at)
                   VALUES (?, ?, ?, ?, 'REMOVED', ?, 'Removed via quantity adjustment (0 qty)', CURRENT_TIMESTAMP)""",
                (dta, brand, model, status, unit["status_date"])
            )
        else:
            conn.execute("UPDATE inventory_units SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE dta = ? AND status = ?", (new_qty, dta, status))
            conn.execute(
                """INSERT INTO inventory_logs (dta, brand, model, from_status, to_status, date, notes, created_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)""",
                (dta, brand, model, status, status, unit["status_date"], f"Quantity adjusted by {delta} (from {current_qty} to {new_qty})")
            )
        
        # If display status is adjusted, keep display_pieces in sync!
        if status == "DISPLAY":
            if delta > 0:
                add_display_piece(dta, brand, model, force_increment=True, date=unit["status_date"], conn=conn, qty=delta)
            else:
                decrement_display_piece(dta, date=unit["status_date"], conn=conn, qty=-delta)
                
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()
    return {"ok": True}


def upgrade_inventory_unit(dta: str, brand: str, model: str, price: float, date: str = None, notes: str = ""):
    dta = dta.strip().upper()
    brand = brand.strip()
    model = model.strip()
    
    if not date:
        from datetime import date as _date
        date = _date.today().strftime("%d-%m-%Y")
    else:
        date = date.strip()

    conn = get_connection()
    try:
        upsert_product(dta, brand, model, price, conn=conn)

        units = conn.execute("SELECT status, brand, model, price FROM inventory_units WHERE dta = ?", (dta,)).fetchall()
        
        old_brand = ""
        old_model = ""
        old_price = 0.0
        
        if units:
            old_brand = units[0]["brand"]
            old_model = units[0]["model"]
            old_price = units[0]["price"]
            
            conn.execute(
                """UPDATE inventory_units SET
                   brand = ?,
                   model = ?,
                   price = ?,
                   updated_at = CURRENT_TIMESTAMP
                   WHERE dta = ?""",
                (brand, model, float(price), dta)
            )
            
            for u in units:
                status = u["status"]
                upgrade_note = f"UPGRADE specs: '{old_brand} {old_model} (AED {old_price})' -> '{brand} {model} (AED {price})'."
                if notes:
                    upgrade_note += f" Notes: {notes}"
                conn.execute(
                    """INSERT INTO inventory_logs (dta, brand, model, from_status, to_status, date, notes, created_at)
                       VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)""",
                    (dta, brand, model, status, status, date, upgrade_note)
                )
                
                if status == "DISPLAY":
                    conn.execute(
                        """UPDATE display_pieces SET brand = ?, model = ? WHERE dta = ?""",
                        (brand, model, dta)
                    )
        else:
            status = "STOCK"
            conn.execute(
                """INSERT INTO inventory_units (dta, status, brand, model, price, status_date, notes, quantity)
                   VALUES (?, ?, ?, ?, ?, ?, ?, 1)""",
                (dta, status, brand, model, float(price), date, notes)
            )
            upgrade_note = f"Initial register via upgrade."
            if notes:
                upgrade_note += f" Notes: {notes}"
            conn.execute(
                """INSERT INTO inventory_logs (dta, brand, model, from_status, to_status, date, notes, created_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)""",
                (dta, brand, model, status, status, date, upgrade_note)
            )

        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()
    return {"ok": True}


def get_inventory_units(status: str = None, date: str = None, month: str = None, search: str = None):
    conn = get_connection()
    query = "SELECT * FROM inventory_units WHERE 1=1"
    params = []

    if status:
        query += " AND status = ?"
        params.append(status.strip())
        
    if date:
        query += " AND status_date = ?"
        params.append(date.strip())
    elif month:
        query += " AND status_date LIKE ?"
        params.append(f"%-{month.strip()}")

    if search:
        query += " AND (dta LIKE ? OR brand LIKE ? OR model LIKE ?)"
        s_val = f"%{search.strip()}%"
        params.extend([s_val, s_val, s_val])

    query += " ORDER BY updated_at DESC"
    rows = conn.execute(query, params).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_inventory_logs(dta: str = None, date: str = None, month: str = None):
    conn = get_connection()
    query = "SELECT * FROM inventory_logs WHERE 1=1"
    params = []

    if dta:
        query += " AND (dta LIKE ? OR brand LIKE ? OR model LIKE ?)"
        s_val = f"%{dta.strip()}%"
        params.extend([s_val, s_val, s_val])
        
    if date:
        query += " AND date = ?"
        params.append(date.strip())
    elif month:
        query += " AND date LIKE ?"
        params.append(f"%-{month.strip()}")

    query += " ORDER BY created_at DESC"
    rows = conn.execute(query, params).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def add_delivery(date: str, customer_name: str, place: str, address: str, phone: str, dta_list: str, products_json: str, price: float, delivery_by: str, payment_mode: str, status: str = "Billed Pending", delivery_type: str = "Product Delivery", exch_old_dta: str = None, exch_old_desc: str = None, exch_old_value: float = 0.0, warranty_action: str = None, bill_id: int = None, jenny: int = 0):
    conn = get_connection()
    try:
        conn.execute(
            """
            INSERT INTO deliveries (date, customer_name, place, address, phone, dta_list, products_json, price, delivery_by, payment_mode, status, delivery_type, exch_old_dta, exch_old_desc, exch_old_value, warranty_action, bill_id, jenny)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                (date or "").strip(),
                (customer_name or "").strip(),
                (place or "").strip(),
                (address or "").strip(),
                (phone or "").strip(),
                (dta_list or "").strip(),
                (products_json or "[]").strip(),
                float(price or 0.0),
                (delivery_by or "Delivery Guy").strip(),
                (payment_mode or "Cash").strip(),
                (status or "Billed Pending").strip(),
                (delivery_type or "Product Delivery").strip(),
                (exch_old_dta or "").strip().upper(),
                (exch_old_desc or "").strip(),
                float(exch_old_value or 0.0),
                (warranty_action or "").strip(),
                bill_id,
                jenny
            )
        )
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()
    return {"ok": True}


def get_delivery(delivery_id: int):
    conn = get_connection()
    row = conn.execute("SELECT * FROM deliveries WHERE id = ?", (int(delivery_id),)).fetchone()
    conn.close()
    return dict(row) if row else None


def get_all_deliveries(date: str = None, status: str = None, month: str = None):
    """
    Fetch deliveries.
    - date: DD-MM-YYYY  → exact day filter
    - month: MM-YYYY    → whole-month filter (matches any DD-MM-YYYY for that month)
    - status: exact status string filter
    """
    conn = get_connection()
    query = "SELECT * FROM deliveries WHERE 1=1"
    params = []
    
    if date:
        query += " AND date = ?"
        params.append(date.strip())
    elif month:
        # date column stores DD-MM-YYYY; month param is MM-YYYY
        # LIKE '%-MM-YYYY' matches any day in that month
        query += " AND date LIKE ?"
        params.append("%-" + month.strip())
        
    if status:
        query += " AND status = ?"
        params.append(status.strip())
        
    query += " ORDER BY id DESC"
    rows = conn.execute(query, params).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def _reconcile_delivery_and_bill_status(conn, delivery_id: int, bill_id: int, old_status: str, new_status: str, delivery_type: str):
    if not bill_id:
        return
        
    old_status = (old_status or "").strip()
    new_status = (new_status or "").strip()
    
    # Transitioning to Cancelled
    if new_status == "Cancelled" and old_status != "Cancelled":
        bill = conn.execute("SELECT transaction_type, note FROM bills WHERE id = ?", (bill_id,)).fetchone()
        if bill and bill["transaction_type"] != "Void":
            # Revert inventory impact
            _revert_bill_inventory_impact(bill_id, conn)
            note_val = bill["note"] or ""
            cancel_str = "Delivery Cancelled - Voided"
            new_note = f"{cancel_str}; {note_val}".strip("; ") if cancel_str not in note_val else note_val
            conn.execute(
                "UPDATE bills SET transaction_type = 'Void', note = ? WHERE id = ?",
                (new_note, bill_id)
            )
            
    # Transitioning FROM Cancelled back to active
    elif new_status != "Cancelled" and old_status == "Cancelled":
        bill = conn.execute("SELECT * FROM bills WHERE id = ?", (bill_id,)).fetchone()
        if bill and bill["transaction_type"] == "Void":
            orig_type = "Exchange" if (delivery_type or "").strip() == "Exchange" else "Sale"
            note_val = bill["note"] or ""
            new_note = note_val.replace("Delivery Cancelled - Voided;", "").replace("Delivery Cancelled - Voided", "").strip().strip("; ")
            
            conn.execute(
                "UPDATE bills SET transaction_type = ?, note = ? WHERE id = ?",
                (orig_type, new_note, bill_id)
            )
            
            # Re-apply inventory impact
            bill_data = dict(bill)
            bill_data["transaction_type"] = orig_type
            _deduct_display_pieces_from_bill(bill_data, conn=conn)


def update_delivery(delivery_id: int, data: dict):
    conn = get_connection()
    try:
        # Fetch current delivery details for bill_id and old status
        old_del = conn.execute("SELECT bill_id, status, delivery_type FROM deliveries WHERE id = ?", (int(delivery_id),)).fetchone()
        bill_id = data.get("bill_id") if "bill_id" in data else (old_del["bill_id"] if old_del else None)
        old_status = old_del["status"] if old_del else "Billed Pending"
        
        conn.execute(
            """
            UPDATE deliveries 
            SET date = ?, 
                customer_name = ?, 
                place = ?, 
                address = ?, 
                phone = ?, 
                dta_list = ?, 
                products_json = ?, 
                price = ?, 
                delivery_by = ?, 
                payment_mode = ?, 
                status = ?, 
                delivery_type = ?, 
                exch_old_dta = ?, 
                exch_old_desc = ?, 
                exch_old_value = ?, 
                warranty_action = ?, 
                jenny = ?,
                bill_id = ?
            WHERE id = ?
            """,
            (
                data["date"].strip(),
                data["customer_name"].strip(),
                data["place"].strip(),
                (data.get("address") or "").strip(),
                data["phone"].strip(),
                data["dta_list"].strip(),
                data["products_json"].strip(),
                float(data["price"]),
                data["delivery_by"].strip(),
                data["payment_mode"].strip(),
                data["status"].strip(),
                data["delivery_type"].strip(),
                (data.get("exch_old_dta") or "").strip().upper(),
                (data.get("exch_old_desc") or "").strip(),
                float(data.get("exch_old_value") or 0.0),
                (data.get("warranty_action") or "").strip(),
                int(data.get("jenny") or 0),
                int(bill_id) if bill_id is not None else None,
                int(delivery_id)
            )
        )
        
        new_status = (data.get("status") or "Billed Pending").strip()
        delivery_type = (data.get("delivery_type") or "Product Delivery").strip()
        
        # 1. Bidirectional edit sync: if linked to a bill, update fields in bills table
        if bill_id:
            target_type = "Void" if new_status == "Cancelled" else ("Exchange" if delivery_type == "Exchange" else "Sale")
            import json
            first_brand = ""
            first_model = ""
            first_dta = ""
            first_price = 0.0
            try:
                p_list = json.loads(data.get("products_json") or "[]")
                if p_list and isinstance(p_list, list) and len(p_list) > 0:
                    first_brand = p_list[0].get("brand") or ""
                    first_model = p_list[0].get("model") or ""
                    first_dta = p_list[0].get("dta") or ""
                    first_price = float(p_list[0].get("price") or 0.0)
            except Exception:
                pass

            if delivery_type == "Exchange":
                old_desc = (data.get("exch_old_desc") or "").strip()
                old_brand = ""
                old_model = ""
                if old_desc:
                    parts = old_desc.split(" ", 1)
                    old_brand = parts[0]
                    old_model = parts[1] if len(parts) > 1 else ""

                conn.execute(
                    """
                    UPDATE bills 
                    SET customer_name = ?, 
                        price = ?, 
                        payment_mode = ?, 
                        products_json = ?, 
                        jenny = ?, 
                        date = ?,
                        transaction_type = ?,
                        brand = ?,
                        model = ?,
                        dta = ?,
                        exch_new_brand = ?,
                        exch_new_model = ?,
                        exch_new_dta = ?,
                        exch_new_price = ?,
                        exch_old_brand = ?,
                        exch_old_model = ?,
                        exch_old_dta = ?,
                        exch_old_price = ?,
                        exch_balance = ?
                    WHERE id = ?
                    """,
                    (
                        (data.get("customer_name") or "").strip(),
                        float(data.get("price") or 0.0),
                        (data.get("payment_mode") or "Cash").strip(),
                        (data.get("products_json") or "[]").strip(),
                        int(data.get("jenny") or 0),
                        (data.get("date") or "").strip(),
                        target_type,
                        first_brand,
                        first_model,
                        first_dta,
                        first_brand,
                        first_model,
                        first_dta,
                        first_price,
                        old_brand,
                        old_model,
                        (data.get("exch_old_dta") or "").strip().upper(),
                        float(data.get("exch_old_value") or 0.0),
                        float(data.get("price") or 0.0) - float(data.get("exch_old_value") or 0.0),
                        int(bill_id)
                    )
                )
            else:
                conn.execute(
                    """
                    UPDATE bills 
                    SET customer_name = ?, 
                        price = ?, 
                        payment_mode = ?, 
                        products_json = ?, 
                        jenny = ?, 
                        date = ?,
                        transaction_type = ?,
                        brand = ?,
                        model = ?,
                        dta = ?
                    WHERE id = ?
                    """,
                    (
                        (data.get("customer_name") or "").strip(),
                        float(data.get("price") or 0.0),
                        (data.get("payment_mode") or "Cash").strip(),
                        (data.get("products_json") or "[]").strip(),
                        int(data.get("jenny") or 0),
                        (data.get("date") or "").strip(),
                        target_type,
                        first_brand,
                        first_model,
                        first_dta,
                        int(bill_id)
                    )
                )
            
        # 2. Trigger reconciliation of inventory and voiding
        _reconcile_delivery_and_bill_status(conn, delivery_id, bill_id, old_status, new_status, delivery_type)
        
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()
    return {"ok": True}


def update_delivery_status(delivery_id: int, status: str):
    conn = get_connection()
    try:
        old_del = conn.execute("SELECT bill_id, status, delivery_type FROM deliveries WHERE id = ?", (int(delivery_id),)).fetchone()
        if not old_del:
            raise ValueError("Delivery not found")
            
        bill_id = old_del["bill_id"]
        old_status = old_del["status"]
        delivery_type = old_del["delivery_type"]
        new_status = status.strip()
        
        conn.execute(
            "UPDATE deliveries SET status = ? WHERE id = ?",
            (new_status, int(delivery_id))
        )
        
        # Trigger reconciliation
        _reconcile_delivery_and_bill_status(conn, delivery_id, bill_id, old_status, new_status, delivery_type)
        
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()
    return {"ok": True}


def delete_delivery(delivery_id: int):
    conn = get_connection()
    try:
        conn.execute("DELETE FROM deliveries WHERE id = ?", (int(delivery_id),))
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()
    return {"ok": True}




def get_all_delivery_dates():
    "Return all distinct delivery months (MM-YYYY) from deliveries."
    conn = get_connection()
    rows = conn.execute('SELECT DISTINCT date FROM deliveries ORDER BY id DESC').fetchall()
    conn.close()
    return [r['date'] for r in rows]


def create_default_admin():
    """Create default admin user if no users exist in the database."""
    conn = get_connection()
    try:
        count = conn.execute("SELECT COUNT(*) FROM users").fetchone()[0]
        if count == 0:
            from werkzeug.security import generate_password_hash
            password_hash = generate_password_hash("admin123")
            conn.execute(
                "INSERT INTO users (username, password_hash, role, permissions) VALUES (?, ?, ?, ?)",
                ("admin", password_hash, "admin", "[]")
            )
            conn.commit()
            print("Default admin user created successfully (username: admin, password: admin123).")
    except Exception as e:
        print(f"Error creating default admin: {e}")
        conn.rollback()
    finally:
        conn.close()


def get_user(username: str):
    """Retrieve user details by username."""
    conn = get_connection()
    row = conn.execute(
        "SELECT id, username, password_hash, role, permissions FROM users WHERE username = ?",
        (username.strip(),)
    ).fetchone()
    conn.close()
    return dict(row) if row else None


def get_all_users():
    """Retrieve all users without password hashes."""
    conn = get_connection()
    rows = conn.execute(
        "SELECT id, username, role, permissions, created_at FROM users ORDER BY created_at DESC"
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def create_user(username, password, role, permissions):
    """Create a new user with hashed password."""
    from werkzeug.security import generate_password_hash
    conn = get_connection()
    try:
        password_hash = generate_password_hash(password)
        conn.execute(
            "INSERT INTO users (username, password_hash, role, permissions) VALUES (?, ?, ?, ?)",
            (username.strip(), password_hash, role.strip(), permissions)
        )
        conn.commit()
        return {"ok": True}
    except sqlite3.IntegrityError:
        conn.rollback()
        return {"ok": False, "error": "Username already exists"}
    except Exception as e:
        conn.rollback()
        return {"ok": False, "error": str(e)}
    finally:
        conn.close()


def update_user(user_id, username, password=None, role=None, permissions=None):
    """Update a user's details, optionally including the password."""
    conn = get_connection()
    try:
        # Check if username already exists for another user
        if username:
            existing = conn.execute("SELECT id FROM users WHERE username = ? AND id != ?", (username.strip(), int(user_id))).fetchone()
            if existing:
                return {"ok": False, "error": "Username already exists"}
        
        # Build update query
        fields = []
        params = []
        if username:
            fields.append("username = ?")
            params.append(username.strip())
        if password:
            from werkzeug.security import generate_password_hash
            fields.append("password_hash = ?")
            params.append(generate_password_hash(password))
        if role:
            fields.append("role = ?")
            params.append(role.strip())
        if permissions is not None:
            fields.append("permissions = ?")
            params.append(permissions)
            
        if not fields:
            return {"ok": True}
            
        params.append(int(user_id))
        query = f"UPDATE users SET {', '.join(fields)} WHERE id = ?"
        conn.execute(query, params)
        conn.commit()
        return {"ok": True}
    except Exception as e:
        conn.rollback()
        return {"ok": False, "error": str(e)}
    finally:
        conn.close()


def delete_user(user_id):
    """Delete a user by ID."""
    conn = get_connection()
    try:
        # Prevent deleting the last admin
        user_row = conn.execute("SELECT username, role FROM users WHERE id = ?", (int(user_id),)).fetchone()
        if user_row and user_row["role"] == "admin":
            admin_count = conn.execute("SELECT COUNT(*) FROM users WHERE role = 'admin'").fetchone()[0]
            if admin_count <= 1:
                return {"ok": False, "error": "Cannot delete the last admin user"}
                
        conn.execute("DELETE FROM users WHERE id = ?", (int(user_id),))
        conn.commit()
        return {"ok": True}
    except Exception as e:
        conn.rollback()
        return {"ok": False, "error": str(e)}
    finally:
        conn.close()






# ==========================================================
# WARRANTY CLAIMS
# ==========================================================

def get_all_warranty_claims():
    conn = get_connection()
    claims = conn.execute("SELECT * FROM warranty_claims ORDER BY created_at DESC").fetchall()
    conn.close()
    return [dict(r) for r in claims]

def create_warranty_claim(data):
    import json
    conn = get_connection()
    cur = conn.execute(
        '''INSERT INTO warranty_claims 
           (claim_date, customer_name, location, phone_number, fulfillment_type, is_outside, warranty_status, dta, brand, model, issue_note, status, products_json)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?)''',
        (
            data.get('claim_date', ''),
            data.get('customer_name', ''),
            data.get('location', ''),
            data.get('phone_number', ''),
            data.get('fulfillment_type', 'In-Store'),
            data.get('is_outside', 0),
            data.get('warranty_status', 'Warranty'),
            data.get('dta', ''),
            data.get('brand', ''),
            data.get('model', ''),
            data.get('issue_note', ''),
            json.dumps(data.get('products', []))
        )
    )
    claim_id = cur.lastrowid
    conn.commit()
    conn.close()
    return claim_id

def edit_warranty_claim(claim_id, data):
    import json
    conn = get_connection()
    conn.execute(
        '''UPDATE warranty_claims
           SET claim_date = ?, 
               customer_name = ?, 
               location = ?, 
               phone_number = ?, 
               fulfillment_type = ?, 
               is_outside = ?, 
               warranty_status = ?, 
               dta = ?, 
               brand = ?, 
               model = ?, 
               issue_note = ?,
               products_json = ?
           WHERE id = ?''',
        (
            data.get('claim_date', ''),
            data.get('customer_name', ''),
            data.get('location', ''),
            data.get('phone_number', ''),
            data.get('fulfillment_type', 'In-Store'),
            data.get('is_outside', 0),
            data.get('warranty_status', 'Warranty'),
            data.get('dta', ''),
            data.get('brand', ''),
            data.get('model', ''),
            data.get('issue_note', ''),
            json.dumps(data.get('products', [])),
            claim_id
        )
    )
    conn.commit()
    conn.close()

def resolve_warranty_claim(claim_id, data):
    conn = get_connection()
    conn.execute(
        '''UPDATE warranty_claims
           SET status = ?, 
               repair_note = ?, 
               repair_cost = ?, 
               action_date = ?,
               exch_new_dta = ?,
               exch_new_brand = ?,
               exch_new_model = ?,
               exch_balance = ?,
               refund_amount = ?
           WHERE id = ?''',
        (
            data.get('status', 'Resolved'),
            data.get('repair_note', ''),
            float(data.get('repair_cost') or 0.0),
            data.get('action_date', ''),
            data.get('exch_new_dta', ''),
            data.get('exch_new_brand', ''),
            data.get('exch_new_model', ''),
            float(data.get('exch_balance') or 0.0),
            float(data.get('refund_amount') or 0.0),
            claim_id
        )
    )
    conn.commit()
    conn.close()

def delete_warranty_claim(claim_id):
    conn = get_connection()
    conn.execute("DELETE FROM warranty_claims WHERE id = ?", (claim_id,))
    conn.commit()
    conn.close()


# ── CUSTOMER CRM FUNCTIONS ──────────────────────────────────────────────────

def get_all_customers(search=None):
    conn = get_connection()
    if search:
        q = f"%{search.strip().lower()}%"
        cursor = conn.execute(
            """SELECT id, serial_no, customer_name, mobile_number, email, place, notes, created_at, updated_at 
               FROM customers 
               WHERE LOWER(customer_name) LIKE ? OR LOWER(mobile_number) LIKE ? OR LOWER(email) LIKE ? OR LOWER(place) LIKE ?
               ORDER BY id DESC""",
            (q, q, q, q)
        )
    else:
        cursor = conn.execute(
            """SELECT id, serial_no, customer_name, mobile_number, email, place, notes, created_at, updated_at 
               FROM customers 
               ORDER BY id DESC"""
        )
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def add_customer(data):
    conn = get_connection()
    name = (data.get("customer_name") or "").strip()
    mobile = (data.get("mobile_number") or "").strip()
    email = (data.get("email") or "").strip()
    place = (data.get("place") or "").strip()
    notes = (data.get("notes") or "").strip()
    
    # Auto-generate serial_no if empty (e.g. 001, 002, 003)
    cursor = conn.execute("SELECT MAX(id) FROM customers")
    max_id = cursor.fetchone()[0] or 0
    serial_no = (data.get("serial_no") or "").strip() or f"{max_id + 1:03d}"

    cursor = conn.execute(
        """INSERT INTO customers (serial_no, customer_name, mobile_number, email, place, notes)
           VALUES (?, ?, ?, ?, ?, ?)""",
        (serial_no, name, mobile, email, place, notes)
    )
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()
    return {"id": new_id, "serial_no": serial_no, "customer_name": name, "mobile_number": mobile, "email": email, "place": place, "notes": notes}

def update_customer(customer_id, data):
    conn = get_connection()
    serial_no = (data.get("serial_no") or "").strip()
    name = (data.get("customer_name") or "").strip()
    mobile = (data.get("mobile_number") or "").strip()
    email = (data.get("email") or "").strip()
    place = (data.get("place") or "").strip()
    notes = (data.get("notes") or "").strip()

    conn.execute(
        """UPDATE customers 
           SET serial_no = ?, customer_name = ?, mobile_number = ?, email = ?, place = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
           WHERE id = ?""",
        (serial_no, name, mobile, email, place, notes, customer_id)
    )
    conn.commit()
    conn.close()
    return {"id": customer_id, "serial_no": serial_no, "customer_name": name, "mobile_number": mobile, "email": email, "place": place, "notes": notes}

def delete_customer(customer_id):
    conn = get_connection()
    conn.execute("DELETE FROM customers WHERE id = ?", (customer_id,))
    conn.commit()
    conn.close()
    return {"status": "deleted", "id": customer_id}

def import_customers_from_sales_and_deliveries():
    conn = get_connection()
    # Pull unique contacts from deliveries
    cursor = conn.execute("SELECT customer_name, phone, place FROM deliveries WHERE phone IS NOT NULL AND phone != ''")
    del_rows = cursor.fetchall()

    existing_mobiles = set(r[0] for r in conn.execute("SELECT mobile_number FROM customers WHERE mobile_number != ''").fetchall())
    
    imported_count = 0
    for r in del_rows:
        c_name = (r["customer_name"] or "").strip()
        c_phone = (r["phone"] or "").strip()
        c_place = (r["place"] or "").strip()
        
        if c_name and c_phone and c_phone not in existing_mobiles:
            cursor = conn.execute("SELECT MAX(id) FROM customers")
            max_id = cursor.fetchone()[0] or 0
            serial_no = f"CRM-{max_id + 1:04d}"
            
            conn.execute(
                "INSERT INTO customers (serial_no, customer_name, mobile_number, place, notes) VALUES (?, ?, ?, ?, ?)",
                (serial_no, c_name, c_phone, c_place, "Auto-imported from Delivery Logs")
            )
            existing_mobiles.add(c_phone)
            imported_count += 1
            
    conn.commit()
    conn.close()
    return {"status": "success", "imported_count": imported_count}


# ==========================================================
# USERS & AUTH MANAGEMENT
# ==========================================================

from werkzeug.security import generate_password_hash, check_password_hash

def get_user(username):
    if not username:
        return None
    conn = get_connection()
    user = conn.execute("SELECT * FROM users WHERE LOWER(username) = LOWER(?)", (username.strip(),)).fetchone()
    conn.close()
    return dict(user) if user else None

def get_all_users():
    conn = get_connection()
    users = conn.execute("SELECT id, username, role, permissions, created_at FROM users ORDER BY id ASC").fetchall()
    conn.close()
    return [dict(u) for u in users]

def create_user(username, password, role="staff", permissions="[]"):
    import json
    conn = get_connection()
    existing = conn.execute("SELECT id FROM users WHERE username = ?", (username,)).fetchone()
    if existing:
        conn.close()
        return {"ok": False, "error": "Username already exists"}
    
    password_hash = generate_password_hash(password)
    perm_str = permissions if isinstance(permissions, str) else json.dumps(permissions)
    conn.execute(
        "INSERT INTO users (username, password_hash, role, permissions) VALUES (?, ?, ?, ?)",
        (username, password_hash, role, perm_str)
    )
    conn.commit()
    conn.close()
    return {"ok": True}

def seed_admin_user():
    conn = get_connection()
    try:
        admin = conn.execute("SELECT id FROM users WHERE username = 'admin'").fetchone()
        admin_hash = generate_password_hash("admin123")
        if not admin:
            conn.execute(
                "INSERT INTO users (username, password_hash, role, permissions) VALUES (?, ?, ?, ?)",
                ("admin", admin_hash, "admin", '["all"]')
            )
            conn.commit()
            print("Default admin user created: admin / admin123")
        else:
            conn.execute(
                "UPDATE users SET password_hash = ?, role = 'admin' WHERE username = 'admin'",
                (admin_hash,)
            )
            conn.commit()
            print("Default admin user password updated to admin123")
    except Exception as e:
        print(f"Seed admin note: {e}")
    finally:
        conn.close()


def get_catalog_setting(key, default=None):
    try:
        conn = get_connection()
        row = conn.execute("SELECT value FROM catalog_settings WHERE key = ?", (key,)).fetchone()
        conn.close()
        if row:
            return row[0] if isinstance(row, (tuple, list)) else row["value"]
    except Exception as e:
        print(f"get_catalog_setting error: {e}")
    return default


def set_catalog_setting(key, value):
    try:
        conn = get_connection()
        conn.execute(
            "INSERT INTO catalog_settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP) "
            "ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=CURRENT_TIMESTAMP",
            (key, value)
        )
        conn.commit()
        conn.close()
        return True
    except Exception as e:
        print(f"set_catalog_setting error: {e}")
        return False


def get_admin_requests():
    import json
    approved_raw = get_catalog_setting("approved_admin_emails", "[]")
    pending_raw = get_catalog_setting("pending_admin_requests", "[]")
    master_email = get_catalog_setting("master_admin_email", "")
    try:
        approved = json.loads(approved_raw) if isinstance(approved_raw, str) else approved_raw
    except Exception:
        approved = []
    try:
        pending = json.loads(pending_raw) if isinstance(pending_raw, str) else pending_raw
    except Exception:
        pending = []
    return {"master": master_email, "approved": approved, "pending": pending}


def save_admin_request(action, email):
    import json
    if not email or not isinstance(email, str):
        return False
    clean_email = email.lower().strip()
    data = get_admin_requests()
    master = data.get("master", "")
    approved = set(data.get("approved", []))
    pending_list = data.get("pending", [])
    pending = [p for p in pending_list if isinstance(p, dict) and p.get("email") != clean_email]

    if action == "set_master":
        if not master:
            set_catalog_setting("master_admin_email", clean_email)
            approved.add(clean_email)
    elif action == "request":
        if clean_email not in approved and not any(p.get("email") == clean_email for p in pending):
            pending.append({"email": clean_email, "requestedAt": _date.today().strftime("%Y-%m-%d %H:%M:%S")})
    elif action == "approve":
        approved.add(clean_email)
    elif action == "reject":
        approved.discard(clean_email)
    elif action == "revoke":
        approved.discard(clean_email)

    set_catalog_setting("approved_admin_emails", json.dumps(list(approved)))
    set_catalog_setting("pending_admin_requests", json.dumps(pending))
    return True




