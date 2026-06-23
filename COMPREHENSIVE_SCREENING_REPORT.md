# PPNS Lab Inspection Project - Comprehensive Screening Report

**Date:** June 19, 2026  
**Project:** PPNS Lab Inspection System  
**Frontend:** Next.js 15 with TypeScript  
**Backend:** Node.js Express  
**Database:** MySQL

---

## EXECUTIVE SUMMARY

This is a comprehensive inspection and maintenance tracking system for laboratory equipment. The application manages:
- Laboratory and equipment (alat) inventory
- Monthly inspection records (6-month cycles) with approval workflows
- Role-based access (Admin vs Kalab/Lab Head)
- Export functionality for individual inspection reports to Excel

### Key Finding
The codebase is **well-structured** but has some **performance and UX concerns** that should be addressed alongside the new export feature.

---

## 1. FRONTEND SCREENS OVERVIEW

### Page Files (tsx/jsx - Screen Components)

| Screen | File Path | Purpose | Role |
|--------|-----------|---------|------|
| **Home/Berita** | `D:\ELMECH2026\src\app\(public)\page.tsx` | Landing page | Public |
| **Berita List** | `D:\ELMECH2026\src\app\(public)\berita\page.tsx` | News/Berita listing | Public |
| **Berita Detail** | `D:\ELMECH2026\src\app\(public)\berita\[slug]\page.tsx` | Individual news article | Public |
| **Galeri** | `D:\ELMECH2026\src\app\(public)\galeri\page.tsx` | Gallery view | Public |
| **Kontak** | `D:\ELMECH2026\src\app\(public)\kontak\page.tsx` | Contact page | Public |
| **Laporan** | `D:\ELMECH2026\src\app\(public)\laporan\page.tsx` | Reports page | Public |
| **Program** | `D:\ELMECH2026\src\app\(public)\program\page.tsx` | Programs page | Public |
| **Tentang** | `D:\ELMECH2026\src\app\(public)\tentang\page.tsx` | About page | Public |
| **Admin Dashboard** | `D:\ELMECH2026\src\app\admin\dashboard\page.tsx` | Admin dashboard | Admin |
| **Admin Items Management** | `D:\ELMECH2026\src\app\admin\items\page.tsx` | Equipment/Peralatan management | Admin |
| **Admin Labs** | `D:\ELMECH2026\src\app\admin\labs\page.tsx` | Laboratory list | Admin |
| **Admin Lab Detail** | `D:\ELMECH2026\src\app\admin\labs\[id]\page.tsx` | Lab detail + items list | Admin |
| **Admin Lab Item Inspection** | `D:\ELMECH2026\src\app\admin\labs\[id]\inspeksi\[itemId]\page.tsx` | Inspection form & history | Admin |
| **Admin Inspections** | `D:\ELMECH2026\src\app\admin\inspections\page.tsx` | Create & approve inspections | Admin |
| **Admin Inspection Detail** | `D:\ELMECH2026\src\app\admin\inspections\detail\[id]\page.tsx` | Full inspection detail + approval | Admin |
| **Admin Criteria** | `D:\ELMECH2026\src\app\admin\criteria\page.tsx` | Inspection criteria setup | Admin |
| **Admin Schedules** | `D:\ELMECH2026\src\app\admin\schedules\page.tsx` | Schedule management | Admin |
| **Admin Users** | `D:\ELMECH2026\src\app\admin\users\page.tsx` | User management | Admin |
| **Admin Profile** | `D:\ELMECH2026\src\app\admin\profile\page.tsx` | Admin profile | Admin |
| **Kalab Dashboard** | `D:\ELMECH2026\src\app\kalab\dashboard\page.tsx` | Lab head dashboard | Kalab |
| **Kalab Labs** | `D:\ELMECH2026\src\app\kalab\labs\page.tsx` | Lab head's labs | Kalab |
| **Kalab Lab Detail** | `D:\ELMECH2026\src\app\kalab\labs\[id]\page.tsx` | Lab detail + items | Kalab |
| **Kalab Lab Item Inspection** | `D:\ELMECH2026\src\app\kalab\labs\[id]\inspeksi\[itemId]\page.tsx` | Inspection form | Kalab |
| **Kalab Profile** | `D:\ELMECH2026\src\app\kalab\profile\page.tsx` | Kalab profile | Kalab |

**Total Screens: 25**

---

## 2. "TAMBAH PERALATAN" BUTTON LOCATIONS

### Location 1: Admin - Global Items Management
**File:** `D:\ELMECH2026\src\app\admin\items\page.tsx`  
**Lines:** 149-151

```typescript
// Line 148-152
<AdminPageHeader title="Peralatan" description="Manajemen peralatan">
  <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FBBF24] text-[#0F172A] text-sm font-semibold hover:bg-[#FCD34D] transition-all hover:scale-[1.02] shadow-lg shadow-[#FBBF24]/20">
    + Tambah Peralatan
  </button>
</AdminPageHeader>
```

**Context:**
- Global items management page accessible via `/admin/items`
- Allows adding items that are not associated with any lab
- Opens a modal form at line 176 with title handling
- Form fields: `nama_barang`, `kode_barang`, `pembuat_alat`, `tanggal_pembelian`

---

### Location 2: Admin - Lab-Specific Items Management
**File:** `D:\ELMECH2026\src\app\admin\labs\[id]\page.tsx`  
**Lines:** 471 (button) + 488 (modal title)

```typescript
// Line 470-472
{!readOnly && (
  <button onClick={openCreate} className="...">
    + Tambah Peralatan
  </button>
)}

// Line 487-489
<h2 className="text-lg font-semibold text-white mb-4">
  {editItem ? "Edit Peralatan" : "Tambah Peralatan"}
</h2>
```

**Context:**
- Nested within lab detail page at `/admin/labs/[id]`
- **CRITICAL DIFFERENCE:** This button is **only shown when `!readOnly`** (line 232)
- Read-only state is triggered when the semester is past (line 46)
- Disabled edit/delete buttons visible in read-only (lines 232-237)
- Automatically adds `laboratory_id` to payload (line 159)
- Same form fields as Location 1

---

### Additional Peralatan References (Not buttons)
- **Kalab Lab Detail:** `D:\ELMECH2026\src\app\kalab\labs\[id]\page.tsx` (Lines 490, 495, 513)
  - Also has "Tambah Peralatan" buttons BUT they appear to be duplicates (lines 490, 495 both in render)
  - Shows both buttons in a grid layout (potential UX issue)

---

## 3. CURRENT EXPORT FUNCTIONALITY DESCRIPTION

### Frontend Export Implementation

#### 3.1 Individual Inspection Export
**Endpoints:** 3 pages with export functionality

| Page | File | Export Function | Line |
|------|------|-----------------|------|
| Admin Inspection Detail | `D:\ELMECH2026\src\app\admin\inspections\detail\[id]\page.tsx` | `handleExport()` | 206-222 |
| Admin Lab Item Inspection | `D:\ELMECH2026\src\app\admin\labs\[id]\inspeksi\[itemId]\page.tsx` | `handleExport()` | 401-417 |
| Kalab Lab Item Inspection | `D:\ELMECH2026\src\app\kalab\labs\[id]\inspeksi\[itemId]\page.tsx` | `handleExport()` | 323-341 |

**Implementation Pattern (All Three):**
```typescript
const handleExport = async () => {
  setExporting(true);
  try {
    const blob = await exportInspection(id);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const fileName = `inspeksi-${(detail?.item_name || `inspection-${id}`)
      .replace(/[\\/:*?"<>|]/g, "").trim()}.xlsx`;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  } catch {
    toast.error("Gagal mengekspor file");
  } finally {
    setExporting(false);
  }
};
```

**Service Layer:**
- `D:\ELMECH2026\src\services\inspections.ts` (Lines 180-183)

```typescript
export async function exportInspection(id: number): Promise<Blob> {
  const res = await api.get(`/inspections/export/${id}`, { responseType: 'blob' });
  return res.data;
}
```

#### 3.2 Export Functionality Details
- **Format:** Excel (.xlsx)
- **Trigger:** Download button with `Download` icon
- **Loading State:** "Mengekspor..." text
- **File Naming:** `inspeksi-{item_name}_{year}.xlsx`
- **Blob Handling:** Client-side blob creation and download

---

### Backend Export Implementation

#### 4.1 Export Endpoints

**Single Inspection Export:**
- **Route:** `GET /api/inspections/export/:id`
- **Controller:** `D:\ELMECH2026\Backend\src\controllers\exportController.js::exportInspection()`
- **Authorization:** `verifyToken, authorizeRole('admin', 'kalab')`
- **File:** Lines 47-403

**All Completed Inspections Export:**
- **Route:** `GET /api/inspections/export-all`
- **Controller:** `D:\ELMECH2026\Backend\src\controllers\exportController.js::exportAllCompleted()`
- **Authorization:** `verifyToken, authorizeRole('admin', 'kalab')`
- **File:** Lines 405-481

#### 4.2 Export Logic Detail

**Single Inspection Export:**

1. **Data Retrieval:**
   - Fetches inspection with related data (inspector, lab, kalab, items)
   - Fetches inspection results grouped by categories
   - Builds category tree structure (line 23-44)

2. **Template Processing:**
   - Loads template Excel file: `TEMPLATE INSPEKSI ALAT LAB_BENGKEL PPNS_Z.xlsx`
   - Removes unnecessary worksheets 2 and 3 (lines 86-87)
   - Dynamically adjusts rows based on data (lines 143-160)

3. **Data Population:**
   - Lab name, location, equipment info (lines 95-110)
   - Month headers (B/K columns for 6 months) (lines 113-141)
   - Category and sub-item data (lines 162-243)
   - Footer with inspection date, inspector, kalab name/NIP (lines 245-303)
   - Photo embedding if available (lines 379-395)

4. **Styling:**
   - Category rows: Gray background (#D9D9D9)
   - Sub-item rows: White background with borders
   - Green checkmark (✓) for "B" (Baik)
   - Red X mark (✗) for "K" (Kurang)

**All Completed Inspections Export:**
- Creates summary worksheet with columns:
  - No, Laboratorium, Nama Alat, Kode Barang, Inspektur, Tanggal Inspeksi
- Filters: Only inspections with 6 completed months
- Sorted by: Lab name, Equipment name, Inspection date

---

## 4. DATABASE SCHEMA UNDERSTANDING - INSPECTION STATUS TRACKING

### Key Tables

#### inspections
- **Unique Constraint:** `(item_id, tahun, semester)` - One inspection per item per year/semester
- **Columns:** id, laboratory_id, item_id, inspector_id, tahun, semester, tanggal_inspeksi, catatan, foto

#### inspection_results
- **Unique Constraint:** `(inspection_id, subitem_id, bulan_ke)` - One result per sub-item per month
- **Columns:** id, inspection_id, subitem_id, bulan_ke (1-6), status (B/K/N/A), keterangan
- **Critical:** `approval_status` (PENDING/APPROVED/REJECTED) - Individual result approval
- **Notes:** `alasan_penolakan` for rejections

#### inspection_monthly_reviews
- **Unique Constraint:** `(inspection_id, bulan_ke)` - One review per month per inspection
- **Columns:** id, inspection_id, bulan_ke, review_status (PENDING/APPROVED/REJECTED), reviewed_by, alasan_penolakan, reviewed_at
- **Purpose:** Admin approval of entire month

### Status Tracking Flow

```
1. Kalab creates inspection with month 1 results (PENDING approval)
   → inspection_monthly_reviews created with review_status='PENDING'
   
2. Admin reviews and approves:
   → inspection_results.approval_status='APPROVED'
   → inspection_monthly_reviews.review_status='APPROVED'
   
3. If rejected:
   → inspection_results.approval_status='REJECTED'
   → inspection_monthly_reviews.review_status='REJECTED'
   → kalab re-enters data for same month
   
4. Next month (month 2) can only be entered after:
   → inspection_monthly_reviews for month 1 has review_status='APPROVED'
   
5. Export allowed only for inspections with:
   → inspection_monthly_reviews for all 6 months with review_status='APPROVED'
```

### Key Relationships

```
users (admin/kalab)
  ├── inspections (created_by inspector_id)
  └── laboratories (kalab manages)
      ├── items (equipment)
      │   ├── inspection_categories (criteria for inspection)
      │   │   └── inspection_subitems (checklist items)
      │   │       └── inspection_results (monthly B/K/N/A status)
      │   └── inspections (monthly inspection records)
      │       ├── inspection_results (linked above)
      │       └── inspection_monthly_reviews (admin approval)
```

---

## 5. POTENTIAL ISSUES AND RECOMMENDATIONS

### 🔴 CRITICAL ISSUES

#### 5.1 Duplicate "Tambah Peralatan" Buttons in Kalab Lab Detail
**Location:** `D:\ELMECH2026\src\app\kalab\labs\[id]\page.tsx` (Lines 490, 495, 513)  
**Issue:** Renders two identical buttons side-by-side in grid layout
```typescript
// Line 490-495 - BOTH show "+ Tambah Peralatan"
{!readOnly && (
  <button onClick={openCreate} className="...">
    + Tambah Peralatan
  </button>
)}

// Then again in same grid cell:
{!readOnly && (
  <button onClick={openCreate} className="...">
    + Tambah Peralatan
  </button>
)}
```
**Impact:** Confusing UX, wasted space
**Fix:** Remove duplicate button (line 490-494)

---

#### 5.2 Missing Laboratory_id on Global Items Create
**Location:** `D:\ELMECH2026\src\app\admin\items\page.tsx` (Line 9 & 85-90)  
**Issue:** Global items page doesn't associate items with laboratories
```typescript
// No laboratory_id set when creating items globally
const payload = {
  nama_barang: form.nama_barang.trim(),
  kode_barang: form.kode_barang.trim(),
  pembuat_alat: form.pembuat_alat.trim(),
  tanggal_pembelian: form.tanggal_pembelian,
  // laboratory_id missing!
};
```
**Impact:** Items created globally cannot be associated with labs in UI  
**Fix:** Add optional `laboratory_id` field, or prevent global item creation

---

#### 5.3 Period Lock Logic Inconsistency (Kalab vs Admin)
**Locations:**
- Admin: `D:\ELMECH2026\src\app\admin\labs\[id]\page.tsx:46` (Line 46)
- Kalab: `D:\ELMECH2026\src\app\kalab\labs\[id]\page.tsx:42-44`

**Issue:** Different lock conditions
```typescript
// Admin: Simple period past check
const readOnly = selectedSemester !== null && 
  isPeriodPast(selectedSemester.tahun, selectedSemester.semester);

// Kalab: Also locks on PENDING reviews
const categoriesLocked = existingInspection !== null && 
  (isApproved || existingInspection.review_status === "PENDING" || existingInspection.has_approved_month);
```
**Impact:** Inconsistent behavior, UX confusion  
**Fix:** Align both using same logic

---

### ⚠️ MAJOR CONCERNS

#### 5.4 Performance - N+1 Query Pattern
**Location:** `D:\ELMECH2026\src\app\admin\labs\[id]\page.tsx` (Lines 106-120)

```typescript
// Fetches inspection status for EACH item individually
useEffect(() => {
  if (!selectedSemester || labItems.length === 0) return;
  const fetchStatuses = async () => {
    const results = await Promise.all(
      labItems.map((item) =>
        getInspectionByItemId(item.id, selectedSemester.tahun, selectedSemester.semester)
      ),
    );
  };
}, [selectedSemester, labItems]);
```
**Impact:** 
- If lab has 50 items, makes 50+ API calls
- Slows down page load significantly
- Backend endpoint: `GET /inspections/by-item/:item_id`

**Fix:** Create bulk endpoint `GET /inspections/by-items?ids=1,2,3...`

---

#### 5.5 Missing React Hooks Dependencies
**Location:** Multiple files
- `D:\ELMECH2026\src\app\admin\labs\[id]\page.tsx:104`
- `D:\ELMECH2026\src\app\kalab\labs\[id]\inspeksi\[itemId]\page.tsx:83`

```typescript
// eslint-disable-next-line react-hooks/set-state-in-effect
useEffect(() => { fetchData(); }, [fetchData]);
```
**Impact:** ESLint warnings disabled, potential stale closures  
**Fix:** Properly structure dependencies or remove ESLint-disable

---

#### 5.6 Type Safety - Loose Typing
**Location:** `D:\ELMECH2026\src\services\inspections.ts` (Lines 4-17)

```typescript
function mapMonthlyItem(r: any): InspectionItem {
  const rawCondition = r.status || r.hasil_status || r.condition || ...;
  return {
    id: r.id,
    result_id: r.result_id ?? r.id,
    // Multiple fallbacks indicate API response inconsistency
  };
}
```
**Impact:** 
- API response structure unclear
- Type checking bypassed with `any`
- Hard to debug data mismatches

**Fix:** Create strict interfaces for API responses

---

#### 5.7 Export Functionality Only Works for APPROVED Inspections
**Location:** Backend doesn't validate before export
- `D:\ELMECH2026\Backend\src\controllers\exportController.js:47-67`

```javascript
const [inspections] = await pool.query(
  `SELECT i.* FROM inspections i ... WHERE i.id = ?`, [id]
);
// No check for review_status or approval_status
```
**Recommendation:** Restrict export to:
- Single inspection: Must have at least 1 approved month
- Bulk export: Only 6/6 approved months

---

### 📋 MODERATE ISSUES

#### 5.8 Missing Accessibility Features
- Modal dialogs: No proper ARIA labels
- Buttons: No keyboard focus indicators clearly visible
- Color-only differentiation: B=Green, K=Red (colorblind users)

**Fix:** Add ARIA labels, improve contrast, use icons+text

---

#### 5.9 Form Validation Inconsistency
- Global items form: All fields required (line 74-78)
- Lab items form: Same validation duplicated
- Inspection form: Different error handling

**Fix:** Create reusable validation hook

---

#### 5.10 No Optimistic Updates
- Item deletion/creation waits for full refetch
- Multi-second delay visible to user

**Fix:** Optimistically update local state first

---

### 🔶 UI/UX ISSUES

#### 5.11 Unclear Read-Only States
- Period-locked items show disabled buttons but still render them
- No clear banner explaining why form is read-only

**Recommendation:** 
- Show prominent yellow banner like in kalab inspection page
- Hide form entirely when read-only

---

#### 5.12 Excel Export Button Placement
**Locations:**
- Admin detail: Top-right corner ✓ (good)
- Kalab inspection: Bottom of form (less discoverable)
- Lab inspection detail: Mixed placement

**Recommendation:** Standardize to top-right with consistent styling

---

#### 5.13 Loading States Missing
- `DataTable` component doesn't show skeleton loaders
- Empty states sometimes show generic message

**Fix:** Add proper loading indicators

---

## 6. SPECIFIC CODE LOCATIONS FOR NEW EXPORT FEATURE

### Recommended Changes for New "Export by Lab" Feature

#### 6.1 Backend New Endpoint
**File:** `D:\ELMECH2026\Backend\src\routes\inspectionDetailRoutes.js`  
**Insert after line 156:**

```javascript
// Export inspections by laboratory (6 completed months)
router.get(
  '/export-lab/:laboratoryId',
  verifyToken,
  authorizeRole('admin'),
  exportController.exportByLaboratory
);
```

---

#### 6.2 Backend New Controller
**File:** `D:\ELMECH2026\Backend\src\controllers\exportController.js`  
**Add after exportAllCompleted() at line 481:**

```javascript
const exportByLaboratory = async (req, res, next) => {
  try {
    const { laboratoryId } = req.params;
    
    // Query: GET all inspections for lab with 6 complete months
    const [inspections] = await pool.query(
      `SELECT i.id, i.tanggal_inspeksi,
              u.name as inspector_name, l.nama_lab, l.lokasi,
              it.nama_barang, it.kode_barang,
              COUNT(DISTINCT ir.bulan_ke) as completed_months
       FROM inspections i
       LEFT JOIN users u ON i.inspector_id = u.id
       LEFT JOIN laboratories l ON i.laboratory_id = l.id
       LEFT JOIN items it ON i.item_id = it.id
       LEFT JOIN inspection_results ir ON i.id = ir.inspection_id 
         AND ir.approval_status = 'APPROVED'
       WHERE l.id = ? 
       GROUP BY i.id
       HAVING completed_months = 6
       ORDER BY it.nama_barang ASC, i.tanggal_inspeksi ASC`,
      [laboratoryId]
    );
    
    // Create summary workbook (similar to exportAllCompleted)
    // ... implementation
  } catch (err) {
    next(err);
  }
};

module.exports = { exportInspection, exportAllCompleted, exportByLaboratory };
```

---

#### 6.3 Frontend Service Update
**File:** `D:\ELMECH2026\src\services\inspections.ts`  
**Add after line 197:**

```typescript
export async function exportByLaboratory(laboratoryId: number): Promise<Blob> {
  const res = await api.get(
    `/inspections/export-lab/${laboratoryId}`, 
    { responseType: 'blob' }
  );
  return res.data;
}
```

---

#### 6.4 Frontend UI - Add Button to Lab Detail
**File:** `D:\ELMECH2026\src\app\admin\labs\page.tsx`  
**Add to each lab row in table (around line 218-225):**

```typescript
// Add to actions column
<button 
  onClick={() => handleExportLab(lab.id)}
  disabled={exporting}
  className="p-1.5 rounded-lg hover:bg-white/5 text-white/50 hover:text-[#FBBF24]"
  title="Export semua inspeksi lab"
>
  <Download className="w-4 h-4" />
</button>
```

---

#### 6.5 Frontend Handler
**File:** `D:\ELMECH2026\src\app\admin\labs\page.tsx`  
**Add state and handler:**

```typescript
const [exporting, setExporting] = useState<number | null>(null);

const handleExportLab = async (labId: number) => {
  setExporting(labId);
  try {
    const blob = await exportByLaboratory(labId);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lab-inspeksi-${labId}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("File berhasil diexport");
  } catch {
    toast.error("Gagal mengekspor file");
  } finally {
    setExporting(null);
  }
};
```

---

## 7. IMPLEMENTATION CHECKLIST FOR NEW EXPORT FEATURE

### Phase 1: Backend
- [ ] Add `exportByLaboratory` function to `exportController.js`
- [ ] Add route to `inspectionDetailRoutes.js`
- [ ] Create test: Export lab with 0 items
- [ ] Create test: Export lab with partial approvals
- [ ] Create test: Export lab with 6/6 completed months
- [ ] Verify authorization checks work

### Phase 2: Frontend Service
- [ ] Add `exportByLaboratory` to `inspections.ts`
- [ ] Update imports in components
- [ ] Test blob download locally

### Phase 3: Frontend UI
- [ ] Add export button to lab list table
- [ ] Add loading state indicator
- [ ] Add success/error toast messages
- [ ] Test on all browsers

### Phase 4: Admin Inspections Page Enhancement
- [ ] Add export-all button (already working, verify it)
- [ ] Add filter by lab for export
- [ ] Add progress indicator for large exports

### Phase 5: Testing & Documentation
- [ ] Test export with large datasets
- [ ] Test filename sanitization
- [ ] Performance test (time < 5 seconds)
- [ ] Update user documentation

---

## 8. SUMMARY TABLE - KEY FILES & MODIFICATIONS

| Component | File | Current State | Modification Needed |
|-----------|------|----------------|-------------------|
| **Items Management** | `admin/items/page.tsx` | ✓ Works | Add lab association |
| **Lab Detail** | `admin/labs/[id]/page.tsx` | ✓ Works | Fix kalab duplicate button |
| **Inspection Detail** | `admin/inspections/detail/[id]/page.tsx` | ✓ Export works | Add lab-level export |
| **Export Service** | `services/inspections.ts` | ✓ Single export | Add `exportByLaboratory` |
| **Export Controller** | `Backend/controllers/exportController.js` | ✓ Single + all | Add `exportByLaboratory` |
| **Export Routes** | `Backend/routes/inspectionDetailRoutes.js` | ✓ Has 2 routes | Add `/export-lab/:id` |
| **Lab List Page** | `admin/labs/page.tsx` | ✗ No export | Add export button |

---

## 9. RECOMMENDATIONS PRIORITY

### 🚨 Must Fix (Before Release)
1. Fix duplicate button in kalab lab detail
2. Add laboratory_id handling to global items
3. Create bulk inspection status endpoint

### 🔴 Should Fix (Next Sprint)
1. Align period lock logic between admin/kalab
2. Add accessibility improvements
3. Implement optimistic updates

### 🟡 Could Fix (Future)
1. Refactor response typing (remove `any`)
2. Consolidate form validation
3. Add keyboard shortcuts

### 🟢 Nice to Have
1. Export to CSV alternative
2. Batch inspection processing
3. Email export results

---

## 10. EXPORT FLOW DIAGRAM

```
User triggers export
    ↓
Frontend: handleExport() sets loading state
    ↓
GET /api/inspections/export/:id (or /export-lab/:id)
    ↓
Backend: Query inspection + related data
    ↓
Load Excel template
    ↓
Populate data into template
    ↓
Apply styling (colors, borders, formatting)
    ↓
Embed photo if exists
    ↓
Stream Excel file as blob
    ↓
Frontend: Create download link & trigger
    ↓
Browser downloads file
    ↓
User notification: "File berhasil diexport"
```

---

## APPENDIX A - FILE STRUCTURE

```
Frontend:
src/
├── app/
│   ├── (public)/          # Public pages
│   ├── admin/
│   │   ├── dashboard/page.tsx
│   │   ├── items/page.tsx          [BUTTON 1: Tambah Peralatan]
│   │   ├── labs/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/page.tsx       [BUTTON 2: Tambah Peralatan]
│   │   │   └── [id]/inspeksi/[itemId]/page.tsx  [EXPORT]
│   │   ├── inspections/
│   │   │   ├── page.tsx
│   │   │   └── detail/[id]/page.tsx [EXPORT]
│   │   └── ...
│   └── kalab/
│       ├── labs/[id]/page.tsx      [DUPLICATE BUTTON]
│       └── labs/[id]/inspeksi/[itemId]/page.tsx [EXPORT]
├── services/
│   ├── inspections.ts     [exportInspection()]
│   ├── items.ts
│   └── labs.ts
├── lib/
│   └── api.ts
└── types/
    └── admin.ts

Backend:
src/
├── controllers/
│   ├── exportController.js   [exportInspection(), exportAllCompleted()]
│   ├── inspectionDetailController.js
│   ├── itemController.js
│   └── ...
├── routes/
│   ├── inspectionDetailRoutes.js  [GET /inspections/export/:id, /export-all]
│   └── ...
└── config/
    └── database.js
```

---

**End of Report**

*Last Updated: June 19, 2026*  
*Prepared by: Code Analysis Agent*
