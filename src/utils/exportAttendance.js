import * as XLSX from 'xlsx';

export function recordsToCsvRows(records) {
  const header = ['Student ID', 'Name', 'Date', 'Time (ISO)'];
  const rows = records.map((r) => [
    r.studentId,
    r.studentName,
    r.date,
    r.timestamp,
  ]);
  return [header, ...rows];
}

export function downloadCsv(records, filenameBase = 'attendance') {
  const rows = recordsToCsvRows(records);
  const escape = (cell) => `"${String(cell).replace(/"/g, '""')}"`;
  const csv = rows.map((row) => row.map(escape).join(',')).join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filenameBase}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadExcel(records, filenameBase = 'attendance') {
  const rows = recordsToCsvRows(records);
  const ws = XLSX.utils.aoa_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Attendance');
  XLSX.writeFile(wb, `${filenameBase}.xlsx`);
}
