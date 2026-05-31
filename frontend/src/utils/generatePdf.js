import { jsPDF } from 'jspdf'

/**
 * Generate a salary slip PDF for a given salary record.
 * Returns the jsPDF doc object (call .save() or .output() on it).
 */
export function buildSalarySlipPdf(record) {
  const emp = record.employees || record.employee || {}
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })

  const W = doc.internal.pageSize.getWidth()

  // ── Header gradient (drawn as rect, colours approximate) ─────────────────
  doc.setFillColor(40, 20, 80)
  doc.rect(0, 0, W, 52, 'F')

  // Accent stripe
  doc.setFillColor(124, 58, 237)
  doc.rect(0, 0, 6, 52, 'F')

  // Company / title
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text('SALARY SLIP', 14, 18)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(200, 180, 255)
  doc.text('SalaryFlow — Payroll Automation System', 14, 25)

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(9)
  doc.text(`Period: ${record.month} ${record.year}`, 14, 34)
  doc.text(`Generated: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`, 14, 40)

  // ── Employee Details ───────────────────────────────────────────────────────
  let y = 62

  doc.setFillColor(245, 243, 255)
  doc.roundedRect(10, y - 6, W - 20, 36, 3, 3, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(40, 20, 80)
  doc.text(emp.name || '—', 16, y + 3)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(100, 80, 150)
  doc.text(`${emp.designation || ''}  •  ${emp.department || ''}`, 16, y + 10)
  doc.text(`Employee ID: ${emp.emp_id || record.emp_id || '—'}`, 16, y + 17)
  doc.text(`Email: ${emp.email || '—'}`, 16, y + 24)

  y += 48

  // ── Earnings Table ────────────────────────────────────────────────────────
  const tableLeft  = 10
  const colW       = [100, W - 30 - 100]
  const rowH       = 9

  const drawRow = (label, value, isHeader = false, rowY = 0, color = [255, 255, 255]) => {
    doc.setFillColor(...color)
    doc.rect(tableLeft, rowY, W - 20, rowH, 'F')

    if (isHeader) {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      doc.setTextColor(124, 58, 237)
    } else {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(40, 40, 60)
    }

    doc.text(label, tableLeft + 4, rowY + 6)

    doc.setFont('helvetica', isHeader ? 'bold' : 'normal')
    doc.text(value, tableLeft + colW[0], rowY + 6, { align: 'right' })

    // border bottom
    doc.setDrawColor(225, 215, 250)
    doc.line(tableLeft, rowY + rowH, tableLeft + W - 20, rowY + rowH)
  }

  const fmt = (n) => `INR ${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`

  // Earnings section header
  drawRow('EARNINGS', 'AMOUNT', true, y, [235, 225, 255])
  y += rowH

  const earningsRows = [
    ['Basic Salary', fmt(record.base_salary)],
    ['House Rent Allowance (HRA)', fmt(record.hra)],
    ['Allowances', fmt(record.allowances)],
  ]
  earningsRows.forEach((r, i) => {
    drawRow(r[0], r[1], false, y, i % 2 === 0 ? [255, 255, 255] : [249, 246, 255])
    y += rowH
  })

  y += 4

  // Deductions section header
  drawRow('DEDUCTIONS', 'AMOUNT', true, y, [255, 235, 235])
  y += rowH

  drawRow('Total Deductions', fmt(record.deductions), false, y, [255, 255, 255])
  y += rowH

  y += 6

  // ── Net Salary Box ────────────────────────────────────────────────────────
  doc.setFillColor(40, 20, 80)
  doc.roundedRect(tableLeft, y, W - 20, 14, 3, 3, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(255, 255, 255)
  doc.text('NET SALARY', tableLeft + 4, y + 9)
  doc.text(fmt(record.net_salary), tableLeft + W - 22, y + 9, { align: 'right' })

  y += 22

  // ── Net Salary in words ───────────────────────────────────────────────────
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(8)
  doc.setTextColor(120, 100, 180)
  doc.text(`Amount in words: ${numberToWords(Math.round(Number(record.net_salary || 0)))} Rupees Only`, tableLeft, y)

  y += 14

  // ── Footer ────────────────────────────────────────────────────────────────
  doc.setDrawColor(200, 180, 250)
  doc.line(tableLeft, y, W - tableLeft, y)
  y += 6

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(140, 120, 180)
  doc.text('This is a computer-generated salary slip and does not require a physical signature.', tableLeft, y)
  y += 5
  doc.text('For queries, contact: hr@company.com  |  Powered by SalaryFlow', tableLeft, y)

  return doc
}

/**
 * Download a salary slip PDF directly (no password).
 */
export function downloadPdf(record) {
  const doc  = buildSalarySlipPdf(record)
  const name = (record.employees?.name || record.emp_id || 'employee').replace(/\s+/g, '_')
  doc.save(`SalarySlip_${name}_${record.month}_${record.year}.pdf`)
}

/**
 * Return PDF as base64 string (for email attachment etc.)
 */
export function getPdfBase64(record) {
  const doc = buildSalarySlipPdf(record)
  return doc.output('datauristring')   // data:application/pdf;base64,...
}

/**
 * Password-gated download.
 * Password = employee first name (capitalised) + birth year.
 * e.g. "Arjun1990"
 *
 * Returns: { ok: boolean, expected: string }
 */
export function downloadPdfWithPassword(record, enteredPassword) {
  const emp       = record.employees || {}
  const firstName = (emp.name || '').split(' ')[0]
  const birthYear = emp.dob ? new Date(emp.dob).getFullYear() : ''
  const expected  = `${firstName}${birthYear}`

  if (enteredPassword !== expected) {
    return { ok: false, expected }
  }

  downloadPdf(record)
  return { ok: true, expected }
}

// ── Number to words (simple Indian system) ────────────────────────────────
const ones = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine',
  'Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen']
const tens = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety']

function numToWords(n) {
  if (n === 0) return ''
  if (n < 20)  return ones[n]
  if (n < 100) return tens[Math.floor(n/10)] + (n%10 ? ' ' + ones[n%10] : '')
  if (n < 1000) return ones[Math.floor(n/100)] + ' Hundred' + (n%100 ? ' ' + numToWords(n%100) : '')
  if (n < 100000) return numToWords(Math.floor(n/1000)) + ' Thousand' + (n%1000 ? ' ' + numToWords(n%1000) : '')
  if (n < 10000000) return numToWords(Math.floor(n/100000)) + ' Lakh' + (n%100000 ? ' ' + numToWords(n%100000) : '')
  return numToWords(Math.floor(n/10000000)) + ' Crore' + (n%10000000 ? ' ' + numToWords(n%10000000) : '')
}

function numberToWords(n) {
  if (!n) return 'Zero'
  return numToWords(n).trim()
}
