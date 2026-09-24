import * as XLSX from "xlsx"

export interface ExcelSheet {
  name: string
  /** Первая строка — заголовки колонок. */
  rows: (string | number)[][]
}

/** Экспорт в .xlsx — только запись собственных данных, XLSX.read (парсинг чужих файлов) нигде
 * не используется, поэтому известные CVE пакета (prototype pollution/ReDoS при парсинге) здесь
 * не актуальны. */
export function exportToExcel(filename: string, sheets: ExcelSheet[]) {
  const workbook = XLSX.utils.book_new()
  for (const sheet of sheets) {
    const worksheet = XLSX.utils.aoa_to_sheet(sheet.rows)
    // Имя листа Excel ограничено 31 символом и не терпит [ ] : * ? / \
    const safeName = sheet.name.replace(/[[\]:*?/\\]/g, " ").slice(0, 31)
    XLSX.utils.book_append_sheet(workbook, worksheet, safeName)
  }
  XLSX.writeFile(workbook, filename)
}
