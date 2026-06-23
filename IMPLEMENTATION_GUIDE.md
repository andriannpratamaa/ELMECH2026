# IMPLEMENTATION GUIDE - Lab-Level Export Feature

## OVERVIEW
This guide provides step-by-step implementation details for adding lab-level export functionality to the PPNS Lab Inspection system.

**Goal:** Allow admins to export a summary of all items in a laboratory that have completed 6-month inspection cycles.

**Current State:** Only individual inspection export exists  
**New Feature:** Lab-level summary export

---

## PHASE 1: BACKEND IMPLEMENTATION

### Step 1.1: Update Export Controller

**File:** `D:\ELMECH2026\Backend\src\controllers\exportController.js`

**Add this function after `exportAllCompleted()` (after line 481):**

```javascript
const exportByLaboratory = async (req, res, next) => {
  try {
    const { laboratoryId } = req.params;
    
    // Validate lab exists
    const [labCheck] = await pool.query(
      'SELECT id, nama_lab, lokasi FROM laboratories WHERE id = ?',
      [laboratoryId]
    );
    
    if (labCheck.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Laboratorium tidak ditemukan' 
      });
    }
    
    const lab = labCheck[0];
    
    // Query all inspections for this lab with 6 complete approved months
    const [inspections] = await pool.query(
      `SELECT 
        i.id,
        i.tanggal_inspeksi,
        u.name as inspector_name,
        it.id as item_id,
        it.nama_barang,
        it.kode_barang,
        it.pembuat_alat,
        COUNT(DISTINCT ir.bulan_ke) as completed_months,
        SUM(CASE WHEN ir.status = 'B' THEN 1 ELSE 0 END) as total_baik,
        SUM(CASE WHEN ir.status = 'K' THEN 1 ELSE 0 END) as total_kurang
       FROM inspections i
       LEFT JOIN users u ON i.inspector_id = u.id
       LEFT JOIN items it ON i.item_id = it.id
       LEFT JOIN inspection_results ir ON i.id = ir.inspection_id 
         AND ir.approval_status = 'APPROVED'
       WHERE i.laboratory_id = ?
       GROUP BY i.id, it.id
       HAVING completed_months = 6
       ORDER BY it.nama_barang ASC, i.tanggal_inspeksi ASC`,
      [laboratoryId]
    );
    
    if (inspections.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Tidak ada inspeksi yang sudah lengkap 6 bulan untuk laboratorium ini' 
      });
    }
    
    // Create workbook
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet(`Inspeksi ${lab.nama_lab}`);
    
    // Set column widths
    ws.columns = [
      { header: 'No', key: 'no', width: 5 },
      { header: 'Nama Alat', key: 'alat', width: 35 },
      { header: 'Kode', key: 'kode', width: 15 },
      { header: 'Pembuat', key: 'pembuat', width: 20 },
      { header: 'Inspector', key: 'inspector', width: 25 },
      { header: 'Tgl Inspeksi', key: 'tanggal', width: 18 },
      { header: 'Baik', key: 'baik', width: 8 },
      { header: 'Kurang', key: 'kurang', width: 8 },
    ];
    
    // Style header row
    const headerRow = ws.getRow(1);
    headerRow.eachCell((cell) => {
      cell.fill = { 
        type: 'pattern', 
        pattern: 'solid', 
        fgColor: { argb: 'FF4472C4' } 
      };
      cell.font = { 
        bold: true, 
        size: 12, 
        name: 'Calibri', 
        color: { argb: 'FFFFFFFF' } 
      };
      cell.alignment = { horizontal: 'center', vertical: 'center' };
      cell.border = {
        left: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } },
        top: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } }
      };
    });
    
    // Add data rows
    let no = 1;
    for (const insp of inspections) {
      const row = ws.addRow({
        no: no++,
        alat: insp.nama_barang,
        kode: insp.kode_barang || '-',
        pembuat: insp.pembuat_alat || '-',
        inspector: insp.inspector_name || '-',
        tanggal: formatDate(insp.tanggal_inspeksi),
        baik: insp.total_baik || 0,
        kurang: insp.total_kurang || 0,
      });
      
      // Style data rows
      row.eachCell((cell) => {
        cell.border = {
          left: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } },
          top: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } }
        };
        cell.alignment = { horizontal: 'center', vertical: 'center' };
      });
    }
    
    // Add summary section
    const summaryRow = inspections.length + 3;
    ws.getCell(`A${summaryRow}`).value = 'Laboratorium:';
    ws.getCell(`B${summaryRow}`).value = lab.nama_lab;
    ws.getCell(`A${summaryRow + 1}`).value = 'Lokasi:';
    ws.getCell(`B${summaryRow + 1}`).value = lab.lokasi || '-';
    ws.getCell(`A${summaryRow + 2}`).value = 'Tanggal Export:';
    ws.getCell(`B${summaryRow + 2}`).value = new Date().toLocaleDateString('id-ID');
    ws.getCell(`A${summaryRow + 3}`).value = 'Total Item (Lengkap 6 Bulan):';
    ws.getCell(`B${summaryRow + 3}`).value = inspections.length;
    
    // Bold summary labels
    for (let i = 0; i < 4; i++) {
      ws.getCell(`A${summaryRow + i}`).font = { bold: true };
    }
    
    // Set response headers
    res.setHeader(
      'Content-Type', 
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition', 
      `attachment; filename="Inspeksi_${lab.nama_lab.replace(/\s+/g, '_')}.xlsx"`
    );
    
    // Write and send
    await wb.xlsx.write(res);
    res.end();
    
  } catch (err) {
    next(err);
  }
};

module.exports = { exportInspection, exportAllCompleted, exportByLaboratory };
```

### Step 1.2: Update Export Routes

**File:** `D:\ELMECH2026\Backend\src\routes\inspectionDetailRoutes.js`

**Update line 7 (imports):**
```javascript
const { exportInspection, exportAllCompleted, exportByLaboratory } = require('../controllers/exportController');
```

**Add new route after line 157:**
```javascript
// Export inspections by laboratory
router.get(
  '/export-lab/:laboratoryId',
  verifyToken,
  authorizeRole('admin'),
  exportByLaboratory
);
```

**New full module.exports at end (line 160):**
```javascript
module.exports = router;
```

---

## PHASE 2: FRONTEND SERVICE LAYER

### Step 2.1: Add Export Service Function

**File:** `D:\ELMECH2026\src\services\inspections.ts`

**Add after line 197 (after `exportAllInspections()`):**

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

## PHASE 3: FRONTEND UI - LAB LIST PAGE

### Step 3.1: Import Export Function

**File:** `D:\ELMECH2026\src\app\admin\labs\page.tsx`

**Update imports (line 5):**
```typescript
import { Download } from "lucide-react";
import { exportByLaboratory } from "@/services/inspections";
```

### Step 3.2: Add State and Handler

**Add after line 19 (with other useState declarations):**

```typescript
  const [exporting, setExporting] = useState<number | null>(null);

  const handleExportLab = async (labId: number) => {
    setExporting(labId);
    try {
      const blob = await exportByLaboratory(labId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const labName = labs.find(l => l.id === labId)?.nama_lab || `lab-${labId}`;
      a.download = `inspeksi-${labName.replace(/\s+/g, '_')}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("File berhasil diexport");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal mengekspor file");
    } finally {
      setExporting(null);
    }
  };
```

### Step 3.3: Add Export Button to Table

**Find the columns definition (around line 50-80) and update the actions column:**

```typescript
  const columns = [
    // ... existing columns ...
    {
      key: "actions",
      header: "Aksi",
      render: (lab: Lab) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push(`/admin/labs/${lab.id}`)}
            className="p-1.5 rounded-lg hover:bg-white/5 text-white/50 hover:text-white transition-colors"
            title="Lihat detail"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleExportLab(lab.id)}
            disabled={exporting === lab.id}
            className="p-1.5 rounded-lg hover:bg-white/5 text-white/50 hover:text-[#FBBF24] transition-colors disabled:opacity-50"
            title="Export inspeksi lab"
          >
            {exporting === lab.id ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
          </button>
          {/* ... other action buttons ... */}
        </div>
      ),
    },
  ];
```

**Add the necessary imports at the top:**
```typescript
import { Eye, Download, Loader2 } from "lucide-react";
```

---

## PHASE 4: FRONTEND UI - LAB DETAIL PAGE (Optional Enhancement)

### Step 4.1: Add Lab-Level Export Button

**File:** `D:\ELMECH2026\src\app\admin\labs\[id]\page.tsx`

**Add import:**
```typescript
import { exportByLaboratory } from "@/services/inspections";
```

**Add state (around line 30):**
```typescript
  const [exportingLab, setExportingLab] = useState(false);
```

**Add handler (around line 200):**
```typescript
  const handleExportLabDetail = async () => {
    setExportingLab(true);
    try {
      const blob = await exportByLaboratory(id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `inspeksi-${(lab?.nama_lab || `lab-${id}`).replace(/\s+/g, '_')}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("File berhasil diexport");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal mengekspor file");
    } finally {
      setExportingLab(false);
    }
  };
```

**Add button to header (around line 265):**
```typescript
  <button
    onClick={handleExportLabDetail}
    disabled={exportingLab}
    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 text-white/50 text-sm font-medium hover:text-white hover:bg-white/10 border border-white/10 transition-all disabled:opacity-50"
  >
    <Download className="w-4 h-4" />
    {exportingLab ? "Mengekspor..." : "Export Lab"}
  </button>
```

---

## PHASE 5: TESTING INSTRUCTIONS

### Test Case 1: Basic Export
1. Go to `/admin/labs`
2. Find a lab with completed inspections
3. Click export button
4. Verify:
   - Download starts
   - Filename is correct: `inspeksi-{lab_name}.xlsx`
   - File opens in Excel
   - Data is correct

### Test Case 2: Empty Lab
1. Go to `/admin/labs`
2. Try to export a lab with no completed inspections
3. Verify: Error message appears: "Tidak ada inspeksi yang sudah lengkap..."

### Test Case 3: Export Button States
1. Click export button
2. Verify: Button shows "Mengekspor..." with spinner
3. After download: Button returns to normal state
4. Multiple exports: Can export multiple labs in sequence

### Test Case 4: Permission Check
1. Login as Kalab user
2. Navigate to `/admin/labs` (should redirect)
3. Verify: Kalab cannot see export button

### Test Case 5: Large Dataset
1. Export a lab with 100+ items
2. Verify: Export completes in < 5 seconds
3. Verify: Excel file opens without corruption

### Test Case 6: Special Characters
1. Lab name: "Lab Fisika & Teknologi"
2. Item names with special chars: "Multi-Gas/Detector"
3. Verify: Filename sanitized correctly
4. Verify: Data in Excel shows original text

---

## PHASE 6: ERROR HANDLING

### Backend Validation Checks

**In `exportByLaboratory()` before export:**

```javascript
// Already implemented:
✓ Lab exists check
✓ No completed inspections check
✓ Authorization check (admin only)

// Consider adding:
- [ ] Check if user has access to this lab (if role-based)
- [ ] Log export for audit trail
- [ ] Set timeout for large exports
```

### Frontend Error Handling

**Already implemented:**
```typescript
✓ Try-catch block
✓ Toast notifications
✓ Loading state management
✓ Blob download fallback
```

---

## PHASE 7: PERFORMANCE OPTIMIZATION

### Query Optimization
The implemented query includes `HAVING completed_months = 6` which filters at the database level (more efficient than client-side).

### Potential Improvements (Future)
```javascript
// Add index if needed:
CREATE INDEX idx_lab_inspection_item ON inspections(laboratory_id, item_id);
CREATE INDEX idx_inspection_results_approval ON inspection_results(approval_status);

// Consider caching for large labs:
// Cache export results for 1 hour per lab
```

---

## PHASE 8: DOCUMENTATION

### User-Facing Documentation

**What the Export Does:**
- Creates an Excel file with all items in the lab that have completed 6-month inspection cycles
- Includes: Item name, code, manufacturer, inspector, inspection date, B/K counts
- Adds summary section with lab info and export date

**How to Use:**
1. Go to Laboratories page (`/admin/labs`)
2. Find the lab you want to export
3. Click the download icon button
4. Wait for download to complete
5. Open Excel file

### Developer Documentation

**Files Modified:**
- `Backend/src/controllers/exportController.js` - Added `exportByLaboratory()`
- `Backend/src/routes/inspectionDetailRoutes.js` - Added `/export-lab/:id` route
- `src/services/inspections.ts` - Added `exportByLaboratory()`
- `src/app/admin/labs/page.tsx` - Added export button and handler

**API Endpoint:**
```
GET /api/inspections/export-lab/:laboratoryId
Authorization: Bearer {token}
Role Required: admin

Response: Excel file (XLSX format)
Success: 200 + blob
Error: 404 {message: "Laboratorium tidak ditemukan"}
Error: 404 {message: "Tidak ada inspeksi yang sudah lengkap..."}
```

---

## PHASE 9: ROLLBACK PLAN

If issues occur, rollback in this order:
1. Remove export button from labs page (comment out Step 3.3)
2. Remove service function (comment out Step 2.1)
3. Remove backend route (comment out Step 1.2)
4. Remove backend controller (comment out Step 1.1)

---

## CHECKLIST

### Backend
- [ ] Add `exportByLaboratory()` to `exportController.js`
- [ ] Add import to `inspectionDetailRoutes.js`
- [ ] Add new route to `inspectionDetailRoutes.js`
- [ ] Test endpoint with Postman/curl
- [ ] Verify auth check works
- [ ] Test with empty lab
- [ ] Test with 100+ items

### Frontend Service
- [ ] Add `exportByLaboratory()` to `inspections.ts`
- [ ] Compile TypeScript (no errors)

### Frontend UI
- [ ] Add imports to `admin/labs/page.tsx`
- [ ] Add state variables
- [ ] Add handler function
- [ ] Update columns to include export button
- [ ] Test button click
- [ ] Test download
- [ ] Verify filename
- [ ] Test error states

### Testing
- [ ] Test as Admin role
- [ ] Test as Kalab role (should fail)
- [ ] Test empty lab
- [ ] Test lab with items
- [ ] Test multiple exports
- [ ] Test special characters in names
- [ ] Test on mobile browser
- [ ] Test on different browsers (Chrome, Firefox, Safari)

### Documentation
- [ ] Update user guide
- [ ] Update API documentation
- [ ] Add code comments
- [ ] Create changelog entry

---

## ESTIMATED TIME

- Backend Implementation: 30 minutes
- Frontend Service: 10 minutes
- Frontend UI: 20 minutes
- Testing: 45 minutes
- Documentation: 15 minutes
- **Total: ~2 hours**

---

**End of Implementation Guide**

For questions or issues, refer to the Comprehensive Screening Report.
