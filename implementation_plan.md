# Implementation Plan: Full-Stack Warranty Claims Module & Workspace

We will build a professional, fully functional Warranty Claims module to manage client warranties, repairs, exchanges, and refunds. This includes building backend SQLite CRUD endpoints, fixing the ReportLab PDF export columns crash, and implementing a premium React workspace in the frontend.

---

## User Review Required

### 1. Database & REST Endpoints
- We will register new routes in `urls.py` and implement raw SQLite CRUD methods in `views.py`:
  - `GET /api/warranty`: Fetch all claims with live status and search keyword filters.
  - `POST /api/warranty`: Save a new warranty claim log.
  - `PUT /api/warranty/<id>`: Update status, repair costs, notes, or exchanges.
  - `DELETE /api/warranty/<id>`: Delete claim logs.

### 2. ReportLab PDF Columns Crash Fix
- The existing `api_warranty_export_pdf` endpoint has a mismatch where it defines 6 column headers/widths but only appends 5 cells per row, causing layout alignment issues. We will fix this by restructuring the table rows to match all 6 columns, outputting rich concatenated details (Customer Phone/Location, DTA Brand/Model, Claim Date, Status, and Problem Notes).

### 3. Frontend React Warranty Workspace
- We will redesign the currently static dummy `WarrantyPanel` in [Dashboard.jsx](file:///C:/Users/dell/Documents/kidilam/src/components/Dashboard.jsx):
  - **Metrics Bar**: Total Claims, Open claims (yellow), Resolved claims (green), and Total Repair Cost (emerald green).
  - **Action Filters Card**: Inline search, status dropdown, "Register Claim", and "Export PDF".
  - **Claims Table**: Highly visible data rows with fulfillment details, repair notes, and status selectors.
  - **Fulfillment Conditions**: Dynamically display Exchange inputs (New DTA, brand, balance) or Refund inputs based on the selected Fulfillment Type.
  - **Autocomplete DTA Lookup**: Support inline suggestions matching seed products for rapid data input.

---

## Proposed Changes

### Django Backend (Python)

#### [MODIFY] [views.py](file:///c:/Users/dell/Documents/buyology/billed/views.py)
- Create `api_warranty` endpoint to handle GET (fetching filtered claims) and POST (creating claims).
- Create `api_warranty_detail` endpoint to handle PUT (edit claims) and DELETE (delete claims).
- Fix `api_warranty_export_pdf` to output 6 column elements: `#`, `Customer Info`, `Product Details`, `Status`, `Claim Date`, and `Problem Description`.

#### [MODIFY] [urls.py](file:///c:/Users/dell/Documents/buyology/buyology/urls.py)
- Register `path('api/warranty', views.api_warranty, name='api_warranty')`
- Register `path('api/warranty/<int:claim_id>', views.api_warranty_detail, name='api_warranty_detail')`

### POS Frontend (Vite React)

#### [MODIFY] [Dashboard.jsx](file:///C:/Users/dell/Documents/kidilam/src/components/Dashboard.jsx)
- Redesign `WarrantyPanel` component to connect to `/api/warranty` with live polling every 3 seconds.
- Create form states matching the database schema (`location`, `fulfillment_type`, `repair_cost`, `repair_note`, `exch_new_dta`, `refund_amount`, `is_outside`).
- Implement the Register/Edit Claim Modal overlay with dynamic input layouts.
- Add DTA autocomplete lookup in the warranty form.

---

## Verification Plan

### Automated Tests
- Run `npm run build` to verify React compiling.
- Restart and verify Django server logs for URL routing.

### Manual Verification
- Register a warranty claim of type "Repair", update its repair cost, verify that the metrics bar updates, and check that exporting the PDF creates a beautiful 6-column A4 sheet.
