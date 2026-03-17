/**
 * Generate and download a CSV template file.
 * Excel can open CSV files directly.
 */
export function downloadCsvTemplate(filename: string, headers: string[], exampleRows: string[][] = []): void {
  const rows = [headers, ...exampleRows];
  const csv = rows
    .map((row) =>
      row.map((cell) => {
        // Wrap in quotes if cell contains comma, newline, or quote
        if (cell.includes(',') || cell.includes('\n') || cell.includes('"')) {
          return `"${cell.replace(/"/g, '""')}"`;
        }
        return cell;
      }).join(',')
    )
    .join('\r\n');

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
