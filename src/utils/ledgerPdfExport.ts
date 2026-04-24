import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { UserOptions } from 'jspdf-autotable';
import type { LedgerTransactionDto, LedgerSummaryDto } from '@/types';
import { formatDate } from '@/utils/formatters';

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatType(type: string): string {
    if (type === 'OPENING_BALANCE') return 'Opening Balance';
    if (type === 'BILL') return 'Bill';
    if (type === 'PAYMENT') return 'Payment';
    return type;
}

/**
 * Format a number as Indian-grouped integer (no currency symbol, no decimals).
 * e.g. 94147 → "94,147"   |   1234567 → "12,34,567"
 */
function formatAmount(amount: number): string {
    return Math.round(amount).toLocaleString('en-IN');
}

// ── Colours ──────────────────────────────────────────────────────────────────

const BRAND_BLUE: [number, number, number] = [41, 98, 162];
const HEADER_TEXT: [number, number, number] = [255, 255, 255];
const ALT_ROW: [number, number, number] = [245, 249, 255];
const FOOTER_BG: [number, number, number] = [230, 240, 255];
const BODY_TEXT: [number, number, number] = [30, 30, 30];
const AMOUNT_BOX_BG: [number, number, number] = [235, 245, 255];
const AMOUNT_BOX_BORDER: [number, number, number] = [41, 98, 162];

// ── Amount-box cell renderer ─────────────────────────────────────────────────

/**
 * Returns a didDrawCell hook that draws a rounded blue-tinted box around every
 * cell in the given column indices (body + foot rows only).
 */
function boxAmountCells(amountColIndices: number[]): NonNullable<UserOptions['didDrawCell']> {
    return (data) => {
        if (data.section !== 'body' && data.section !== 'foot') return;
        if (!amountColIndices.includes(data.column.index)) return;

        const { x, y, width, height } = data.cell;
        const pad = 2;

        // Draw box
        data.doc.setFillColor(...AMOUNT_BOX_BG);
        data.doc.setDrawColor(...AMOUNT_BOX_BORDER);
        data.doc.setLineWidth(0.4);
        data.doc.roundedRect(x + pad, y + pad, width - pad * 2, height - pad * 2, 2, 2, 'FD');

        // Re-draw text on top of box (right-aligned)
        const isFoot = data.section === 'foot';
        data.doc.setFont('helvetica', isFoot ? 'bold' : 'normal');
        data.doc.setFontSize(isFoot ? 10 : 9);
        data.doc.setTextColor(...BODY_TEXT);
        const text = String(data.cell.text?.[0] ?? '');
        if (text && text !== '–' && text !== '—') {
            data.doc.text(text, x + width - pad - 3, y + height / 2 + 3.2, { align: 'right' });
        }
    };
}

// ── Page chrome ───────────────────────────────────────────────────────────────

function addHeader(
    doc: jsPDF,
    title: string,
    subtitle: string,
    pageWidth: number,
    margin: number,
): number {
    doc.setFillColor(...BRAND_BLUE);
    doc.rect(0, 0, pageWidth, 14, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(17);
    doc.setTextColor(...BODY_TEXT);
    doc.text(title, margin, 27);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(subtitle, margin, 37);

    doc.setDrawColor(...BRAND_BLUE);
    doc.setLineWidth(0.5);
    doc.line(margin, 42, pageWidth - margin, 42);

    return 49;
}

function addPageNumbers(doc: jsPDF) {
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(150, 150, 150);
        doc.text(
            `Page ${i} of ${totalPages}`,
            doc.internal.pageSize.getWidth() / 2,
            doc.internal.pageSize.getHeight() - 8,
            { align: 'center' },
        );
    }
}

// ── Public exports ────────────────────────────────────────────────────────────

/** Export the summary table (all parties) */
export function exportSummaryToPdf(
    ledgerType: 'Sales' | 'Purchase',
    rows: LedgerSummaryDto[],
    dateLabel?: string,
) {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 24;

    const subtitle = dateLabel
        ? `Generated on ${new Date().toLocaleDateString('en-IN')} · ${dateLabel}`
        : `Generated on ${new Date().toLocaleDateString('en-IN')}`;

    const startY = addHeader(doc, `${ledgerType} Ledger – Summary`, subtitle, pageWidth, margin);

    const totalDebit = rows.reduce((s, r) => s + r.totalDebit, 0);
    const totalCredit = rows.reduce((s, r) => s + r.totalCredit, 0);
    const totalBalance = rows.reduce((s, r) => s + r.balance, 0);

    // Amount columns: indices 1 (Debit), 2 (Credit), 3 (Balance)
    const amountCols = [1, 2, 3];

    autoTable(doc, {
        startY,
        margin: { left: margin, right: margin },
        head: [['Party Name', 'Total Debit', 'Total Credit', 'Balance']],
        body: rows.map((r) => [
            r.partyName,
            formatAmount(r.totalDebit),
            formatAmount(r.totalCredit),
            formatAmount(r.balance),
        ]),
        foot: [['TOTAL', formatAmount(totalDebit), formatAmount(totalCredit), formatAmount(totalBalance)]],
        showFoot: 'lastPage',

        columnStyles: {
            0: { cellWidth: 'auto', halign: 'left' },
            1: { cellWidth: 120, halign: 'right' },
            2: { cellWidth: 120, halign: 'right' },
            3: { cellWidth: 120, halign: 'right' },
        },

        headStyles: {
            fillColor: BRAND_BLUE,
            textColor: HEADER_TEXT,
            fontStyle: 'bold',
            fontSize: 10,
            halign: 'left',
        },
        footStyles: {
            fillColor: FOOTER_BG,
            textColor: BODY_TEXT,
            fontStyle: 'bold',
            fontSize: 10,
        },
        bodyStyles: {
            fontSize: 10,
            textColor: BODY_TEXT,
        },
        alternateRowStyles: { fillColor: ALT_ROW },
        tableLineColor: [220, 220, 220],
        tableLineWidth: 0.3,

        didDrawCell: boxAmountCells(amountCols),

        didDrawPage: (data) => {
            if (data.pageNumber > 1) {
                addHeader(doc, `${ledgerType} Ledger – Summary`, subtitle, pageWidth, margin);
            }
        },
    });

    addPageNumbers(doc);
    doc.save(`${ledgerType.toLowerCase()}_ledger_summary.pdf`);
}

/** Export the monthly register (all-transactions view) */
export function exportMonthlyToPdf(
    ledgerType: 'Sales' | 'Purchase',
    rows: LedgerTransactionDto[],
    dateLabel?: string,
) {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 24;

    const subtitle = dateLabel
        ? `Generated on ${new Date().toLocaleDateString('en-IN')} · ${dateLabel}`
        : `Generated on ${new Date().toLocaleDateString('en-IN')}`;

    const startY = addHeader(doc, `${ledgerType} Ledger – Monthly Register`, subtitle, pageWidth, margin);

    const totalDebit = rows.reduce((s, r) => s + r.debit, 0);
    const totalCredit = rows.reduce((s, r) => s + r.credit, 0);

    // Amount columns: 4 (Debit), 5 (Credit), 6 (Month Turnover)
    const amountCols = [4, 5, 6];

    autoTable(doc, {
        startY,
        margin: { left: margin, right: margin },
        head: [['Date', 'Party', 'Type', 'Reference', 'Debit', 'Credit', 'Month Turnover']],
        body: rows.map((r) => [
            r.date ? formatDate(r.date) : '—',
            r.partyName ?? '—',
            formatType(r.type),
            r.reference ?? '—',
            r.debit > 0 ? formatAmount(r.debit) : '–',
            r.credit > 0 ? formatAmount(r.credit) : '–',
            r.type === 'BILL' && r.monthTurnover != null ? formatAmount(r.monthTurnover) : '—',
        ]),
        foot: [['', '', '', 'TOTAL', formatAmount(totalDebit), formatAmount(totalCredit), '']],
        showFoot: 'lastPage',

        columnStyles: {
            0: { cellWidth: 62, halign: 'left' },
            1: { cellWidth: 'auto', halign: 'left' },
            2: { cellWidth: 72, halign: 'left' },
            3: { cellWidth: 'auto', halign: 'left' },
            4: { cellWidth: 88, halign: 'right' },
            5: { cellWidth: 88, halign: 'right' },
            6: { cellWidth: 98, halign: 'right' },
        },

        headStyles: {
            fillColor: BRAND_BLUE,
            textColor: HEADER_TEXT,
            fontStyle: 'bold',
            fontSize: 9,
            halign: 'left',
        },
        footStyles: {
            fillColor: FOOTER_BG,
            textColor: BODY_TEXT,
            fontStyle: 'bold',
            fontSize: 9,
        },
        bodyStyles: {
            fontSize: 9,
            textColor: BODY_TEXT,
        },
        alternateRowStyles: { fillColor: ALT_ROW },
        tableLineColor: [220, 220, 220],
        tableLineWidth: 0.3,

        didDrawCell: boxAmountCells(amountCols),

        didDrawPage: (data) => {
            if (data.pageNumber > 1) {
                addHeader(doc, `${ledgerType} Ledger – Monthly Register`, subtitle, pageWidth, margin);
            }
        },
    });

    addPageNumbers(doc);
    doc.save(`${ledgerType.toLowerCase()}_ledger_monthly_register.pdf`);
}

/** Export a party's detail ledger */
export function exportPartyDetailToPdf(
    ledgerType: 'Sales' | 'Purchase',
    partyName: string,
    rows: LedgerTransactionDto[],
    totals: { totalDebit: number; totalCredit: number; closingBalance: number },
    dateLabel?: string,
) {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 24;

    const subtitle = dateLabel
        ? `Generated on ${new Date().toLocaleDateString('en-IN')} · ${dateLabel}`
        : `Generated on ${new Date().toLocaleDateString('en-IN')}`;

    const startY = addHeader(doc, `${ledgerType} Ledger – ${partyName}`, subtitle, pageWidth, margin);

    // Amount columns: 3 (Debit), 4 (Credit), 5 (Month Turnover), 6 (Balance)
    const amountCols = [3, 4, 5, 6];

    autoTable(doc, {
        startY,
        margin: { left: margin, right: margin },
        head: [['Date', 'Type', 'Reference', 'Debit', 'Credit', 'Month Turnover', 'Balance']],
        body: rows.map((r) => [
            r.date ? formatDate(r.date) : '—',
            formatType(r.type),
            r.reference ?? '—',
            r.debit > 0 ? formatAmount(r.debit) : '–',
            r.credit > 0 ? formatAmount(r.credit) : '–',
            r.type === 'BILL' && r.monthTurnover != null ? formatAmount(r.monthTurnover) : '—',
            formatAmount(r.balance),
        ]),
        showFoot: 'never',

        columnStyles: {
            0: { cellWidth: 65, halign: 'left' },
            1: { cellWidth: 85, halign: 'left' },
            2: { cellWidth: 'auto', halign: 'left' },
            3: { cellWidth: 88, halign: 'right' },
            4: { cellWidth: 88, halign: 'right' },
            5: { cellWidth: 98, halign: 'right' },
            6: { cellWidth: 82, halign: 'right' },
        },

        headStyles: {
            fillColor: BRAND_BLUE,
            textColor: HEADER_TEXT,
            fontStyle: 'bold',
            fontSize: 9,
            halign: 'left',
        },
        bodyStyles: {
            fontSize: 9,
            textColor: BODY_TEXT,
        },
        alternateRowStyles: { fillColor: ALT_ROW },
        tableLineColor: [220, 220, 220],
        tableLineWidth: 0.3,

        didDrawCell: boxAmountCells(amountCols),

        didDrawPage: (data) => {
            if (data.pageNumber > 1) {
                addHeader(doc, `${ledgerType} Ledger – ${partyName}`, subtitle, pageWidth, margin);
            }
        },
    });

    // ── Summary footer box ────────────────────────────────────────────────────
    const finalY: number = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;

    const boxW = 220;
    const boxH = 54;
    const boxX = pageWidth - margin - boxW;
    const boxY = finalY + 12;

    doc.setFillColor(240, 246, 255);
    doc.setDrawColor(...BRAND_BLUE);
    doc.setLineWidth(0.5);
    doc.roundedRect(boxX, boxY, boxW, boxH, 4, 4, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text('Total Debit:', boxX + 8, boxY + 14);
    doc.text(formatAmount(totals.totalDebit), boxX + boxW - 8, boxY + 14, { align: 'right' });

    doc.text('Total Credit:', boxX + 8, boxY + 28);
    doc.text(formatAmount(totals.totalCredit), boxX + boxW - 8, boxY + 28, { align: 'right' });

    const balanceColor: [number, number, number] =
        totals.closingBalance > 0 ? [180, 30, 30] : [30, 130, 30];
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...balanceColor);
    doc.text('Closing Balance:', boxX + 8, boxY + 44);
    doc.text(formatAmount(totals.closingBalance), boxX + boxW - 8, boxY + 44, { align: 'right' });

    addPageNumbers(doc);
    doc.save(`${ledgerType.toLowerCase()}_ledger_${partyName.replace(/\s+/g, '_')}.pdf`);
}