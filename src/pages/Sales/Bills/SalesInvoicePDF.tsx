import { useRef, useState, useEffect } from 'react';
import { Button, Modal, Space } from 'antd';
import { CloseOutlined, PrinterOutlined } from '@ant-design/icons';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { SalesBillResponse } from '@/types';
import { formatDate } from '@/utils/formatters';
import { PAYMENT_DUE_LABELS } from '@/utils/constants';
import numberToWords from '@/utils/numberToWords';

// ── Constants ─────────────────────────────────────────────────────────────────
const SELLER = {
    name: 'SURAJ ENTERPRISES',
    a1: 'E-12 PANCHAL NAGAR CO-OP HSG. SOC.',
    a2: 'ANAND NAGAR, OPP. K.T. VISION CINEMA,',
    a3: 'VASAI ROAD (W) DIST. PALGHAR',
    gstin: '27AQHPB0072E1ZE',
    mobile: '9022180909',
    email: 'hbagaria2007@gmail.com',
};
const BANK = {
    name: 'PUNJAB NATIONAL BANK',
    ac: '12311011001807',
    branch: 'BANGUR NAGAR GOREGAON (W)',
    ifsc: 'PUNB0123110',
};
const DECL = [
    'SUBJECTED TO MUMBAI JURISDICTION',
    'FOR INDUSTRIAL USE ONLY NOT FOR MEDICAL OR EDIBLE USE',
    'LATE PAYMENT WILL BE CHARGED @24% PER MONTH',
    'GOODS ONCE SOLD WILL NOT BE TAKEN BACK',
];
const COPIES = ['ORIGINAL', 'DUPLICATE'] as const;

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n: number, d = 2) =>
    n.toLocaleString('en-IN', { minimumFractionDigits: d, maximumFractionDigits: d });

const addrLines = (a: {
    unitNumber?: string | null; buildingName?: string | null;
    streetOrLandmark?: string | null; destination?: string | null;
    city: string; state: string; pincode: string;
} | null): string[] => !a ? [] : [
    [a.unitNumber, a.buildingName].filter(Boolean).join(', '),
    a.streetOrLandmark ?? '',
    a.destination ?? '',
    [a.city, a.state, a.pincode].filter(Boolean).join(', '),
].filter(Boolean);

const panFromGst = (gst: string) =>
    gst && gst.length >= 12 ? gst.substring(2, 12).toUpperCase() : '';

type Item = SalesBillResponse['items'][0] & { hsn?: string; unit?: string };

// ── CSS – shared base + screen/print variants ─────────────────────────────────
const CSS = `
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:Arial,sans-serif;font-size:11px;color:#000;background:#fff;}

/* ── Page: fixed A4 size, flex column so items-wrap can fill remaining height ── */
.inv-page{
  width:794px;
  height:1123px;
  padding:18px 20px;
  background:#fff;
  display:flex;
  flex-direction:column;
  overflow:hidden;
}

/* Title bar */
.inv-bar{
  display:flex;align-items:center;flex-shrink:0;
  border:1px solid #000;border-bottom:none;
  padding:4px 8px;font-weight:bold;
}
.inv-bar-mid{flex:2;text-align:center;font-size:14px;letter-spacing:1px;}
.inv-bar-side{flex:1;}
.inv-bar-copy{flex:1;text-align:right;font-size:12px;}

/* ── Header: flex row ── */
.inv-hdr{display:flex;border:1px solid #000;flex-shrink:0;}
.inv-hdr-left{
  width:57%;border-right:1px solid #000;
  padding:5px 7px;font-size:10.5px;
}
.inv-sname{font-weight:bold;font-size:14px;margin-bottom:3px;}
.inv-buyer{margin-top:6px;border-top:1px dashed #aaa;padding-top:4px;}
.inv-alab{font-weight:bold;font-size:9px;color:#333;margin-top:3px;}
/* Meta rows (right side) — 2-column stacked layout */
.inv-hdr-right{flex:1;display:flex;flex-direction:column;}
.inv-mrow{display:flex;border-bottom:1px solid #000;}
.inv-mrow-last{display:flex;border-bottom:none;}
.inv-m-col{flex:1;display:flex;flex-direction:column;border-right:1px solid #000;}
.inv-m-col:last-child{border-right:none;}
.inv-mk{
  font-weight:bold;font-size:9.5px;
  padding:2px 5px;background:#f7f7f7;
  line-height:1.3;
}
.inv-mv{
  font-size:12px;padding:2px 5px;
  line-height:1.35;font-weight:500;
}
/* ── Items section: flex:1 so it fills all remaining space ── */
.inv-it-wrap{flex:1;min-height:0;display:flex;flex-direction:column;}
.inv-it{
  width:100%;border-collapse:collapse;
  border:1px solid #000;border-top:none;
  height:100%;
  table-layout:fixed;
}
.inv-it th,.inv-it td{border:1px solid #000;padding:3px 5px;font-size:10.5px;}
.inv-it th{background:#ececec;text-align:center;font-weight:bold;font-size:10px;}
.c-sr {width:28px;text-align:center;}
.c-desc{text-align:left;}
.c-hsn {width:58px;text-align:center;}
.c-qty {width:62px;text-align:right;}
.c-rate{width:68px;text-align:right;}
.c-per {width:34px;text-align:center;}
.c-amt {width:82px;text-align:right;}

/* Spacer: hidden on top suppresses item-row bottom border; none on bottom lets first total row's border-top show */
.inv-sp td{
  height:100%;
  border-top:hidden!important;
  border-bottom:none!important;
  padding:0;
}
/* Total qty shown in spacer qty cell, bottom-aligned */
.inv-sp-qty{
  vertical-align:bottom!important;
  text-align:right;
  padding-bottom:3px!important;
  font-weight:bold;
}

/* All total rows: no top/bottom borders by default (lines only come from inv-tr-first and inv-gr) */
.inv-tr td{padding:1px 5px;border-top:none!important;border-bottom:none!important;height:19px;vertical-align:middle;font-size:10.5px;}
/* First total row (TOTAL TAXABLE AMOUNT) gets a solid line above, separating from items */
.inv-tr-first td{border-top:1px solid #000!important;}
.inv-tlbl{text-align:right;padding-right:6px!important;}
.inv-blue{color:#00c;}
/* Empty cells in total rows: no H-borders, but keep L/R for column separators */
.inv-te{border-top:none!important;border-bottom:none!important;}

/* Grand total */
.inv-gr td{border-top:2px solid #000;font-weight:bold;padding:2px 5px;height:21px;vertical-align:middle;font-size:10.5px;}

/* Amount in words */
.inv-wr td{border-top:2px solid #000;padding:3px 5px;font-size:10px;vertical-align:middle;}
.inv-oe{text-align:right;white-space:nowrap;}

/* HSN summary */
.inv-hn{width:100%;border-collapse:collapse;border:1px solid #000;border-top:none;flex-shrink:0;}
.inv-hn th,.inv-hn td{border:1px solid #000;padding:3px 5px;text-align:center;font-size:10px;}
.inv-hn th{background:#ececec;font-weight:bold;}
.inv-ch{background:#dce8ff;}
.td-r{text-align:right;}.td-c{text-align:center;}

/* Footer */
.inv-ft{width:100%;border-collapse:collapse;border:1px solid #000;border-top:none;flex-shrink:0;}
.inv-ft td{border:1px solid #000;padding:4px 6px;vertical-align:top;font-size:10px;}
.inv-bk{display:inline-block;min-width:72px;font-weight:bold;}
/* BANK DETAILS heading: top border acts as visual separator from tax-words text */
.inv-bh{
  font-weight:bold;text-align:center;text-decoration:underline;
  margin-bottom:3px;font-size:11px;
  border-top:1px solid #000;padding-top:4px;margin-top:4px;
}
.inv-qr{
  width:58px;height:58px;border:1px solid #bbb;
  display:flex;align-items:center;justify-content:center;
  font-size:8px;color:#aaa;background:#f9f9f9;margin:4px auto 0;
}
.inv-dh{font-weight:bold;color:#c00;margin-bottom:2px;}
.inv-dl{color:#c00;font-size:9.5px;}
.inv-sh{font-weight:bold;text-align:center;font-size:10px;}
.inv-ss{height:34px;}
.inv-sm{font-size:8.5px;text-align:center;}
.inv-cgi{text-align:center;font-style:italic;color:#c00;font-size:10px;}
`;

// ── InvoiceSheet ──────────────────────────────────────────────────────────────
const InvoiceSheet = ({ bill, copy, items: rawItems }: { bill: SalesBillResponse; copy: typeof COPIES[number]; items: Item[] }) => {
    // Always render items in serial number order
    const items = [...rawItems].sort((a, b) => (a.serialNumber ?? 0) - (b.serialNumber ?? 0));

    const hsnMap = new Map<string, number>();
    for (const it of items) hsnMap.set(it.hsn ?? 'N/A', (hsnMap.get(it.hsn ?? 'N/A') ?? 0) + it.amount);
    const hsnGroups = Array.from(hsnMap.entries()).map(([hsn, tv]) => ({
        hsn, tv, cgst: +(tv * 9 / 100).toFixed(2), sgst: +(tv * 9 / 100).toFixed(2),
        tot: +(tv * 18 / 100).toFixed(2),
    }));

    const bLines = addrLines(bill.billingAddress);
    const sLines = addrLines(bill.shippingAddress);
    const pan = panFromGst(bill.salesParty.gst ?? '');
    const actualPaymentDue = bill.paymentDue || (bill.modeOfPayment as any);
    const modeLabel = PAYMENT_DUE_LABELS[actualPaymentDue] ?? actualPaymentDue;
    const dest = bill.shippingAddress?.destination ?? bill.billingAddress?.destination ?? '—';
    const totalQty = items.reduce((s, i) => s + i.quantity, 0);
    const dated = formatDate(bill.billDate);


    return (
        <div
            className="inv-page"
            style={{
                width: 794,
                height: 1123,
                padding: '18px 20px',
                background: '#fff',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                boxSizing: 'border-box',
                fontFamily: 'Arial, sans-serif',
                fontSize: 11,
                color: '#000',
            }}
        >
            {/* Title bar */}
            <div className="inv-bar">
                <span className="inv-bar-side" />
                <span className="inv-bar-mid">TAX INVOICE</span>
                <span className="inv-bar-copy">{copy}</span>
            </div>

            {/* Header */}
            <div className="inv-hdr">
                {/* Left: seller + buyer */}
                <div className="inv-hdr-left">
                    <div className="inv-sname">{SELLER.name}</div>
                    <div>{SELLER.a1}</div>
                    <div>{SELLER.a2}</div>
                    <div>{SELLER.a3}</div>
                    <div><b>GSTIN/UIN:</b> {SELLER.gstin}</div>
                    <div><b>MOBILE NO.</b> {SELLER.mobile}</div>
                    <div className="inv-buyer">
                        <div><b>Buyer: M/s. {bill.salesParty.name}</b></div>
                        {bLines.length > 0 && (() => {
                            const MAX = 4;
                            const shown = bLines.slice(0, MAX);
                            const extra = bLines.length - MAX;
                            return (<>
                                <div className="inv-alab">Billing Address:</div>
                                {shown.map((l, i) => <div key={i}>{l}</div>)}
                                {extra > 0 && <div style={{ color: '#888', fontSize: 8 }}>+{extra} more</div>}
                            </>);
                        })()}
                        {bill.salesParty.gst && <div><b>GSTIN/UIN:</b>&nbsp;{bill.salesParty.gst}</div>}
                        {pan && <div><b>PAN/IT:</b>&nbsp;{pan}</div>}
                        {bill.salesParty.phoneNumber && <div><b>Contact:</b>&nbsp;{bill.salesParty.phoneNumber}</div>}
                        {sLines.length > 0 && (() => {
                            const MAX = 4;
                            const shown = sLines.slice(0, MAX);
                            const extra = sLines.length - MAX;
                            return (<>
                                <div className="inv-alab">Shipping Address:</div>
                                {shown.map((l, i) => <div key={i}>{l}</div>)}
                                {extra > 0 && <div style={{ color: '#888', fontSize: 8 }}>+{extra} more</div>}
                            </>);
                        })()}
                    </div>
                </div>

                {/* Right: 6 meta rows, 2-column stacked (label on top, value below) */}
                <div className="inv-hdr-right">
                    <div className="inv-mrow">
                        <div className="inv-m-col">
                            <div className="inv-mk">Invoice No:</div>
                            <div className="inv-mv">{bill.billNumber}</div>
                        </div>
                        <div className="inv-m-col">
                            <div className="inv-mk">Dated:</div>
                            <div className="inv-mv">{dated}</div>
                        </div>
                    </div>
                    <div className="inv-mrow">
                        <div className="inv-m-col">
                            <div className="inv-mk">Delivery Note:</div>
                            <div className="inv-mv">{bill.billNumber}</div>
                        </div>
                        <div className="inv-m-col">
                            <div className="inv-mk">Dated:</div>
                            <div className="inv-mv">{dated}</div>
                        </div>
                    </div>
                    <div className="inv-mrow">
                        <div className="inv-m-col">
                            <div className="inv-mk">Payment Due:</div>
                            <div className="inv-mv">{modeLabel}</div>
                        </div>
                        <div className="inv-m-col">
                            <div className="inv-mk">Vehicle Details:</div>
                            <div className="inv-mv">{bill.vehicleDetails ?? '—'}</div>
                        </div>
                    </div>
                    <div className="inv-mrow">
                        <div className="inv-m-col">
                            <div className="inv-mk">Buyer's Order No:</div>
                            <div className="inv-mv">{bill.buyerOrderNo}</div>
                        </div>
                        <div className="inv-m-col">
                            <div className="inv-mk">Dated:</div>
                            <div className="inv-mv">{dated}</div>
                        </div>
                    </div>
                    <div className="inv-mrow">
                        <div className="inv-m-col">
                            <div className="inv-mk">Dispatch Doc. No:</div>
                            <div className="inv-mv">{bill.billNumber}</div>
                        </div>
                        <div className="inv-m-col">
                            <div className="inv-mk">Destination:</div>
                            <div className="inv-mv">{dest}</div>
                        </div>
                    </div>
                    <div className="inv-mrow-last">
                        <div className="inv-m-col" style={{ flex: 2 }}>
                            <div className="inv-mk">Terms of Delivery:</div>
                            <div className="inv-mv">{bill.termsOfDelivery ?? '—'}</div>
                        </div>
                    </div>
                    {/* filler to match seller column height */}
                    <div style={{ flex: 1 }} />
                </div>
            </div>

            {/* Items wrap — inline flex:1 guarantees it fills remaining page height */}
            <div className="inv-it-wrap" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                <table
                    className="inv-it"
                    style={{ height: '100%', width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}
                >
                    <thead>
                        <tr>
                            <th className="c-sr">SR<br />NO</th>
                            <th className="c-desc">DESCRIPTION OF GOODS</th>
                            <th className="c-hsn">HSN/SAC</th>
                            <th className="c-qty">QUANTITY</th>
                            <th className="c-rate">RATE</th>
                            <th className="c-per">PER</th>
                            <th className="c-amt">AMOUNT</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((it, idx) => (
                            <tr key={it.id}>
                                <td className="c-sr">{it.serialNumber ?? idx + 1}</td>
                                <td className="c-desc">{it.itemDescription}</td>
                                <td className="c-hsn">{it.hsn ?? ''}</td>
                                <td className="c-qty">{fmt(it.quantity, 1)}</td>
                                <td className="c-rate">{fmt(it.rate)}</td>
                                <td className="c-per">{it.unit?.toLowerCase() ?? ''}</td>
                                <td className="c-amt">{fmt(it.amount)}</td>
                            </tr>
                        ))}
                        {/* Spacer: fills unused table height */}
                        <tr className="inv-sp">
                            <td className="c-sr" /><td className="c-desc" /><td className="c-hsn" />
                            <td className="c-qty" /><td className="c-rate" /><td className="c-per" /><td className="c-amt" />
                        </tr>
                        {/* Totals: label in desc cell (right-aligned), HSN/Qty/Rate/Per empty (no h-borders), amount in last col */}
                        <tr className="inv-tr inv-tr-first">
                            <td className="c-sr inv-te" />
                            <td className="c-desc inv-tlbl">TOTAL TAXABLE AMOUNT</td>
                            <td className="c-hsn inv-te" /><td className="c-qty inv-te" /><td className="c-rate inv-te" /><td className="c-per inv-te" />
                            <td className="c-amt">{fmt(bill.totalTaxableAmount)}</td>
                        </tr>
                        <tr className="inv-tr">
                            <td className="c-sr inv-te" />
                            <td className="c-desc inv-tlbl inv-blue">CGST@9%</td>
                            <td className="c-hsn inv-te" /><td className="c-qty inv-te" /><td className="c-rate inv-te" /><td className="c-per inv-te" />
                            <td className="c-amt">{fmt(bill.gst / 2)}</td>
                        </tr>
                        <tr className="inv-tr">
                            <td className="c-sr inv-te" />
                            <td className="c-desc inv-tlbl inv-blue">SGST@9%</td>
                            <td className="c-hsn inv-te" /><td className="c-qty inv-te" /><td className="c-rate inv-te" /><td className="c-per inv-te" />
                            <td className="c-amt">{fmt(bill.gst / 2)}</td>
                        </tr>
                        <tr className="inv-tr">
                            <td className="c-sr inv-te" />
                            <td className="c-desc inv-tlbl inv-blue">transportation</td>
                            <td className="c-hsn inv-te" /><td className="c-qty inv-te" /><td className="c-rate inv-te" /><td className="c-per inv-te" />
                            <td className="c-amt">{fmt(bill.transportation)}</td>
                        </tr>
                        <tr className="inv-tr">
                            <td className="c-sr inv-te" />
                            <td className="c-desc inv-tlbl inv-blue">Roundoff</td>
                            <td className="c-hsn inv-te" /><td className="c-qty inv-te" /><td className="c-rate inv-te" /><td className="c-per inv-te" />
                            <td className="c-amt">{fmt(bill.roundOff, 1)}</td>
                        </tr>
                        <tr className="inv-gr">
                            <td className="c-sr" />
                            <td className="c-desc inv-tlbl" style={{ fontWeight: 'bold' }}>TOTAL</td>
                            <td className="c-hsn" />
                            <td className="c-qty" style={{ fontWeight: 'bold', textAlign: 'right' }}>{fmt(totalQty, 1)}</td>
                            <td className="c-rate" /><td className="c-per" />
                            <td className="c-amt">{fmt(bill.grandTotal)}</td>
                        </tr>

                        <tr className="inv-wr">
                            <td colSpan={6}><b>AMOUNT CHARGEABLE (IN WORDS) :</b>&nbsp;{numberToWords(bill.grandTotal)}</td>
                            <td className="inv-oe">E. &amp;O.E</td>
                        </tr>

                    </tbody>
                </table>
            </div>

            {/* HSN Summary */}
            <table className="inv-hn">
                <thead>
                    <tr>
                        <th rowSpan={2}>HSN/SAC</th>
                        <th rowSpan={2}>TAXABLE VALUE</th>
                        <th colSpan={2} className="inv-ch">CGST</th>
                        <th colSpan={2} className="inv-ch">SGST</th>
                        <th rowSpan={2}>TOTAL TAX AMOUNT</th>
                    </tr>
                    <tr><th>RATE</th><th>AMOUNT</th><th>RATE</th><th>AMOUNT</th></tr>
                </thead>
                <tbody>
                    {hsnGroups.map((g, i) => (
                        <tr key={i}>
                            <td className="td-r">{g.hsn}</td>
                            <td className="td-r">{fmt(g.tv)}</td>
                            <td className="td-c">9%</td><td className="td-r">{fmt(g.cgst)}</td>
                            <td className="td-c">9%</td><td className="td-r">{fmt(g.sgst)}</td>
                            <td className="td-r">{fmt(g.tot)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Footer */}
            <table className="inv-ft">
                <tbody>
                    {/* Footer row 1: 3 cols (colSpan=2 for bank+tax, 3rd for QR/email) — matches row 2's 3 cells */}
                    <tr>
                        <td colSpan={2}>
                            <div><b>TAX AMOUNT (IN WORDS) :</b></div>
                            <div style={{ marginBottom: 2 }}>{numberToWords(bill.gst)}</div>
                            <div className="inv-bh">BANK DETAILS</div>
                            <div><span className="inv-bk">BANK NAME</span> : {BANK.name}</div>
                            <div><span className="inv-bk">A/C No.</span>   : {BANK.ac}</div>
                            <div><span className="inv-bk">BRANCH</span>    : {BANK.branch}</div>
                            <div><span className="inv-bk">IFSC CODE</span> : {BANK.ifsc}</div>
                        </td>
                        <td style={{ textAlign: 'center', verticalAlign: 'top' }}>
                            <div style={{ fontWeight: 'bold', fontSize: 9 }}>EMAIL: {SELLER.email}</div>
                            <div className="inv-qr">QR</div>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <div className="inv-dh">DECLARATION:</div>
                            {DECL.map((l, i) => <div key={i} className="inv-dl">{l}</div>)}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                            <div className="inv-sh">RECEIVER'S SIGN</div>
                            <div className="inv-ss" />
                        </td>
                        <td style={{ textAlign: 'center' }}>
                            <div className="inv-sh">FOR SURAJ ENTERPRISES</div>
                            <div className="inv-ss" />
                            <div className="inv-sm">Proprietor/Authorised Sign</div>
                        </td>
                    </tr>
                    <tr>
                        <td colSpan={3} className="inv-cgi">THIS IS A COMPUTER GENERATED INVOICE</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

// ── Modal wrapper ─────────────────────────────────────────────────────────────
interface Props { bill: SalesBillResponse; open: boolean; onClose: () => void; enrichedItems?: Item[]; }

const SalesInvoicePDF = ({ bill, open, onClose, enrichedItems }: Props) => {
    const hiddenRef = useRef<HTMLDivElement>(null);
    const items: Item[] = enrichedItems ?? bill.items.map(i => ({ ...i, hsn: 'N/A', unit: '' }));

    const [downloading, setDownloading] = useState(false);
    const [iframeSrc, setIframeSrc] = useState('');
    // Raw innerHTML of all invoice pages — shared between preview and print
    const pagesHtmlRef = useRef('');

    // ── Build iframe srcdoc from hidden div when modal opens ──────────────────
    // The iframe is completely isolated from Ant Design CSS — height:1123px
    // on .inv-page works perfectly inside it.
    useEffect(() => {
        if (!open) return;
        const timer = setTimeout(() => {
            const el = hiddenRef.current;
            if (!el) return;
            el.style.visibility = 'visible';
            const pagesHtml = el.innerHTML;
            el.style.visibility = 'hidden';

            // ── Cache raw HTML so the print path reuses the exact same source ──
            pagesHtmlRef.current = pagesHtml;

            const PREVIEW_CSS = `
html,body{margin:0;padding:0;background:#888;}
body{padding:24px;display:flex;flex-direction:column;align-items:center;gap:24px;}
.inv-page{box-shadow:0 4px 24px rgba(0,0,0,.45);}
`;
            const srcdoc = `<!DOCTYPE html><html><head><meta charset="utf-8">
<style>${CSS}${PREVIEW_CSS}</style>
</head><body>${pagesHtml}</body></html>`;
            setIframeSrc(srcdoc);
        }, 120);
        return () => clearTimeout(timer);
    }, [open, bill, items]);

    // ── Download PDF ───────────────────────────────────────────────────
    // Renders into a hidden iframe (srcdoc = our CSS only, no Ant Design leakage),
    // then captures each .inv-page with html2canvas and saves via jsPDF —
    // no print dialog, correct filename, pixel-identical to the preview.
    const handleDownloadPDF = async () => {
        const pagesHtml = pagesHtmlRef.current;
        if (!pagesHtml) return;
        setDownloading(true);

        // Clean white-background CSS for the capture iframe (no print-specific rules needed)
        const CAPTURE_CSS = `
html,body{margin:0;padding:0;background:#fff;}
body{display:flex;flex-direction:column;align-items:center;}
`;
        const captureDoc = `<!DOCTYPE html><html><head><meta charset="utf-8">
<style>${CSS}${CAPTURE_CSS}</style>
</head><body>${pagesHtml}</body></html>`;

        // Hidden iframe — isolated from the React/Ant Design DOM entirely
        const iframe = document.createElement('iframe');
        iframe.style.cssText = 'position:fixed;left:-9999px;top:0;width:794px;height:2400px;border:none;visibility:hidden;pointer-events:none;';
        document.body.appendChild(iframe);

        iframe.onload = async () => {
            try {
                const iframeDoc = iframe.contentDocument!;
                const pages = Array.from(iframeDoc.querySelectorAll<HTMLElement>('.inv-page'));
                if (!pages.length) throw new Error('No pages found');

                const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
                for (let i = 0; i < pages.length; i++) {
                    const canvas = await html2canvas(pages[i], {
                        scale: 3,
                        useCORS: true,
                        logging: false,
                        backgroundColor: '#ffffff',
                        // Use the iframe's own window so only our CSS is applied
                        windowWidth: 794,
                        windowHeight: 1123,
                    });
                    if (i > 0) pdf.addPage();
                    pdf.addImage(canvas.toDataURL('image/jpeg', 0.97), 'JPEG', 0, 0, 210, 297);
                }
                pdf.save(`${bill.billNumber} ${bill.salesParty.name}.pdf`);
            } catch (err) {
                console.error('PDF generation failed:', err);
                alert('PDF generation failed. Please try again.');
            } finally {
                document.body.removeChild(iframe);
                setDownloading(false);
            }
        };

        iframe.srcdoc = captureDoc;
    };

    return (
        <>
            {/* Invoice CSS keeps the hidden div styled so the iframe srcdoc builder can read innerHTML */}
            <style dangerouslySetInnerHTML={{ __html: CSS }} />

            {/* ── Off-screen hidden render container ── */}
            <div
                ref={hiddenRef}
                style={{
                    position: 'fixed', left: -9999, top: 0,
                    visibility: 'hidden', opacity: 0,
                    zIndex: -1, pointerEvents: 'none',
                    display: 'flex', flexDirection: 'column',
                }}
            >
                {COPIES.map(copy => (
                    <InvoiceSheet key={copy} bill={bill} copy={copy} items={items} />
                ))}
            </div>

            <Modal
                title={`${bill.billNumber} ${bill.salesParty.name}`}
                open={open}
                onCancel={onClose}
                width={874}
                style={{ top: 12 }}
                styles={{ body: { padding: 0, overflow: 'hidden' } }}
                footer={
                    <Space>
                        <Button icon={<CloseOutlined />} onClick={onClose}>Close</Button>
                        <Button
                            type="primary"
                            icon={<PrinterOutlined />}
                            onClick={handleDownloadPDF}
                            loading={downloading}
                        >
                            {downloading ? 'Generating PDF…' : 'Download PDF'}
                        </Button>
                    </Space>
                }
            >
                {/* ── iframe preview: isolated DOM, no Ant Design CSS leakage ── */}
                <iframe
                    srcDoc={iframeSrc || '<html><body style="display:flex;align-items:center;justify-content:center;height:200px;font-family:Arial;color:#666;background:#888"><span>Loading preview\u2026</span></body></html>'}
                    style={{ width: '100%', height: 'calc(100vh - 180px)', border: 'none', display: 'block' }}
                    title="Invoice Preview"
                    sandbox="allow-same-origin"
                />
            </Modal>
        </>
    );
};

export default SalesInvoicePDF;

