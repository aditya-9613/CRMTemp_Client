import { useEffect, useState } from 'react'
import Sidebar from '../Sidebar/Sidebar'
import axios from 'axios'
import { baseURL } from '../../Utils/baseURL.js'

// ── helpers ───────────────────────────────────────────────────────────────────
const formatDate = (isoStr) => {
    if (!isoStr) return '—'
    return new Date(isoStr).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'long', year: 'numeric',
    })
}

const formatTime = (isoStr) => {
    if (!isoStr) return ''
    return new Date(isoStr).toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit', hour12: true,
    })
}

const statusMeta = {
    issued:  { label: 'Issued',  bg: 'rgba(59,91,219,0.12)',  border: 'rgba(59,91,219,0.3)',  color: '#7da4f5' },
    paid:    { label: 'Paid',    bg: 'rgba(34,197,94,0.10)',  border: 'rgba(34,197,94,0.25)', color: '#4ade80' },
    overdue: { label: 'Overdue', bg: 'rgba(239,68,68,0.10)',  border: 'rgba(239,68,68,0.25)', color: '#f87171' },
    pending: { label: 'Pending', bg: 'rgba(251,191,36,0.10)', border: 'rgba(251,191,36,0.25)', color: '#fbbf24' },
}

const paymentMeta = {
    success: { label: 'Success', color: '#4ade80' },
    failed:  { label: 'Failed',  color: '#f87171' },
    pending: { label: 'Pending', color: '#fbbf24' },
}

// ── PDF generator (pure-browser, no external lib) ────────────────────────────
const downloadInvoice = (entry) => {
    const { invoice, billing, payment } = entry
    const win = window.open('', '_blank')
    win.document.write(`<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<title>Invoice ${invoice.invoice_number}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'DM Sans',sans-serif;background:#fff;color:#111;padding:48px 56px;font-size:14px}
  .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:48px}
  .brand{font-size:24px;font-weight:800;letter-spacing:-0.5px;color:#111}
  .brand span{color:#3b5bdb}
  .inv-meta{text-align:right}
  .inv-number{font-family:'DM Mono',monospace;font-size:13px;color:#3b5bdb;font-weight:500;margin-bottom:4px}
  .inv-date{font-size:12px;color:#888}
  .divider{border:none;border-top:1px solid #e8e8e8;margin:24px 0}
  .section-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:#aaa;margin-bottom:10px}
  .two-col{display:grid;grid-template-columns:1fr 1fr;gap:32px;margin-bottom:32px}
  .info-val{font-size:14px;color:#111;font-weight:600;margin-bottom:4px}
  .info-sub{font-size:12px;color:#888}
  .table{width:100%;border-collapse:collapse;margin-bottom:32px}
  .table th{text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#aaa;padding:10px 12px;border-bottom:2px solid #eee}
  .table td{padding:14px 12px;border-bottom:1px solid #f2f2f2;font-size:13px;color:#333}
  .table td.mono{font-family:'DM Mono',monospace;font-size:12px;color:#555}
  .total-row{display:flex;justify-content:flex-end;margin-bottom:8px}
  .total-box{background:#f8f8f8;border:1px solid #eee;border-radius:10px;padding:20px 28px;min-width:280px}
  .total-line{display:flex;justify-content:space-between;font-size:13px;color:#888;margin-bottom:8px}
  .total-final{display:flex;justify-content:space-between;font-size:18px;font-weight:800;color:#111;padding-top:12px;border-top:1px solid #ddd;margin-top:4px}
  .badge{display:inline-block;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;background:#e8f0ff;color:#3b5bdb;border:1px solid #c5d5ff}
  .txn-box{background:#f8f8f8;border:1px solid #eee;border-radius:8px;padding:14px 16px;margin-top:8px;font-family:'DM Mono',monospace;font-size:11.5px;color:#555}
  .footer{margin-top:48px;text-align:center;font-size:11px;color:#bbb}
</style>
</head>
<body>
<div class="header">
  <div>
    <div class="brand">G<span>CRM</span></div>
    <div style="font-size:12px;color:#888;margin-top:4px">Customer Relationship Management</div>
  </div>
  <div class="inv-meta">
    <div class="inv-number">${invoice.invoice_number}</div>
    <div class="inv-date">Issued: ${formatDate(invoice.issued_at)}</div>
    <div style="margin-top:8px"><span class="badge">${invoice.status.toUpperCase()}</span></div>
  </div>
</div>

<hr class="divider"/>

<div class="two-col">
  <div>
    <div class="section-label">Plan Details</div>
    <div class="info-val">${billing.plan_label} Plan</div>
    <div class="info-sub">$${billing.rate}/month · ${billing.duration} month${billing.duration > 1 ? 's' : ''}</div>
    <div class="info-sub" style="margin-top:6px">Start: ${formatDate(billing.start_date)}</div>
    <div class="info-sub">Expiry: ${formatDate(billing.expiry_date)}</div>
  </div>
  <div>
    <div class="section-label">Payment Info</div>
    <div class="info-val">${payment.payment_method.charAt(0).toUpperCase() + payment.payment_method.slice(1)} · ${payment.currency}</div>
    <div class="info-sub">Paid: ${formatDate(payment.paid_at)} at ${formatTime(payment.paid_at)}</div>
    <div class="info-sub" style="margin-top:6px;color:${payment.status === 'success' ? '#16a34a' : '#dc2626'};font-weight:600">
      ${payment.status === 'success' ? '✓ Payment Successful' : '✗ Payment Failed'}
    </div>
  </div>
</div>

<table class="table">
  <thead>
    <tr>
      <th>Description</th>
      <th>Period</th>
      <th>Rate</th>
      <th style="text-align:right">Amount</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>${billing.plan_label} Subscription</strong><br/><span style="font-size:12px;color:#888">GCRM Premium Access</span></td>
      <td class="mono">${formatDate(billing.start_date)} – ${formatDate(billing.expiry_date)}</td>
      <td class="mono">$${billing.rate}/mo × ${billing.duration}</td>
      <td style="text-align:right;font-weight:700;font-size:15px">$${invoice.amount.toFixed(2)}</td>
    </tr>
  </tbody>
</table>

<div class="total-row">
  <div class="total-box">
    <div class="total-line"><span>Subtotal</span><span>$${invoice.amount.toFixed(2)}</span></div>
    <div class="total-line"><span>Tax</span><span>$0.00</span></div>
    <div class="total-final"><span>Total</span><span>$${invoice.amount.toFixed(2)} ${invoice.currency}</span></div>
  </div>
</div>

<div>
  <div class="section-label">Transaction Reference</div>
  <div class="txn-box">TXN ID: ${payment.transaction_id}</div>
</div>

<div class="footer">
  <hr class="divider"/>
  This is a system-generated invoice. For support, contact support@gcrm.io<br/>
  © ${new Date().getFullYear()} GCRM · All rights reserved
</div>
<script>window.onload=()=>{window.print();}</script>
</body>
</html>`)
    win.document.close()
}

// ── component ─────────────────────────────────────────────────────────────────
const Invoices = () => {
    const [collapsed, setCollapsed]   = useState(false)
    const [activeItem, setActiveItem] = useState('Invoices')
    const [invoices, setInvoices]     = useState(null)   // null = loading
    const [expanded, setExpanded]     = useState(null)   // expanded invoice id

    async function getInvoice() {
        try {
            const res = await axios({
                url: `${baseURL}/api/v1/payment/getInvoices`,
                method: 'GET',
                withCredentials: true,
                headers: { Authorization: `Bearer ${localStorage.getItem('user')}` },
            })
            if (res.status === 200) {
                const raw = res.data.data?.data
                // normalise: could be array or single object
                setInvoices(Array.isArray(raw) ? raw : raw ? [raw] : [])
            }
        } catch (err) {
            console.error(err)
            setInvoices([])
        }
    }

    useEffect(() => { getInvoice() }, [])

    // ── CSS ───────────────────────────────────────────────────────────────────
    const css = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body, #root { height: 100%; background: #0e0e0e; }

    @keyframes spin    { to { transform: rotate(360deg); } }
    @keyframes fadeIn  { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
    @keyframes fadeUp  { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
    @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:0.4} }
    @keyframes shimmer {
      0%   { background-position: -600px 0; }
      100% { background-position:  600px 0; }
    }

    .inv-app  { min-height:100vh; background:#0e0e0e; font-family:'DM Sans',sans-serif; color:#e8e8e8; }
    .inv-main {
      margin-left: ${collapsed ? '64px' : '236px'};
      transition: margin-left 0.28s cubic-bezier(0.4,0,0.2,1);
      min-height:100vh; display:flex; flex-direction:column;
    }

    .inv-topbar {
      position:sticky; top:0; z-index:99;
      height:64px; background:#141414;
      border-bottom:1px solid #2a2a2a;
      display:flex; align-items:center;
      padding:0 24px; gap:12px; flex-shrink:0;
    }
    .topbar-title { font-size:17px; font-weight:700; color:#f5f5f5; letter-spacing:-0.3px; }

    .inv-content  { flex:1; padding:28px; display:flex; flex-direction:column; gap:20px; }
    .page-title   { font-size:22px; font-weight:700; color:#f0f0f0; letter-spacing:-0.4px; }
    .page-sub     { font-size:13.5px; color:#555; margin-top:4px; }

    /* ── skeleton ── */
    .skeleton-row {
      height:72px; border-radius:10px;
      background: linear-gradient(90deg, #1a1a1a 25%, #222 50%, #1a1a1a 75%);
      background-size: 600px 100%;
      animation: shimmer 1.4s infinite linear;
      margin-bottom:10px;
    }

    /* ── empty state ── */
    .empty-wrap {
      flex:1; display:flex; flex-direction:column;
      align-items:center; justify-content:center;
      gap:14px; padding:60px 24px; animation:fadeIn 0.3s ease;
    }
    .empty-icon {
      width:72px; height:72px; border-radius:18px;
      background:#161616; border:1px solid #252525;
      display:flex; align-items:center; justify-content:center;
      font-size:32px;
    }
    .empty-title { font-size:17px; font-weight:700; color:#ccc; }
    .empty-sub   { font-size:13px; color:#444; text-align:center; max-width:280px; line-height:1.6; }

    /* ── table header ── */
    .inv-table-header {
      display:grid;
      grid-template-columns: 160px 1fr 110px 100px 90px 90px;
      gap:0 12px;
      padding:10px 20px;
      font-size:10.5px; font-weight:700; text-transform:uppercase;
      letter-spacing:0.9px; color:#3a3a3a;
      border-bottom:1px solid #1e1e1e;
    }

    /* ── invoice row ── */
    .inv-row-wrap {
      background:#161616; border:1px solid #252525;
      border-radius:12px; overflow:hidden;
      transition:border-color 0.18s;
    }
    .inv-row-wrap:hover { border-color:#303030; }
    .inv-row-wrap.open  { border-color:#2a2a2a; }

    .inv-row {
      display:grid;
      grid-template-columns: 160px 1fr 110px 100px 90px 90px;
      gap:0 12px;
      padding:0 20px;
      align-items:center; height:68px;
      cursor:pointer;
    }

    .inv-number-text {
      font-family:'DM Mono',monospace; font-size:12px;
      font-weight:500; color:#7da4f5; letter-spacing:0.2px;
    }
    .inv-plan-text  { font-size:13.5px; font-weight:600; color:#ddd; }
    .inv-plan-sub   { font-size:11px; color:#444; margin-top:2px; }
    .inv-date-text  { font-size:12px; color:#666; font-family:'DM Mono',monospace; }
    .inv-amount     { font-size:15px; font-weight:800; color:#f0f0f0; font-family:'DM Mono',monospace; }

    .status-pill {
      display:inline-flex; align-items:center; gap:5px;
      border-radius:20px; padding:3px 11px;
      font-size:11px; font-weight:700;
    }
    .status-dot { width:5px; height:5px; border-radius:50%; }

    .btn-dl {
      display:inline-flex; align-items:center; gap:6px;
      background:#1c1c1c; border:1px solid #2a2a2a;
      color:#aaa; border-radius:7px;
      padding:7px 13px; font-size:12px; font-weight:600;
      cursor:pointer; font-family:'DM Sans',sans-serif;
      transition:background 0.15s, border-color 0.15s, color 0.15s, transform 0.1s;
      white-space:nowrap;
    }
    .btn-dl:hover {
      background:#222; border-color:#3b5bdb;
      color:#7da4f5; transform:translateY(-1px);
    }

    /* ── expand panel ── */
    .inv-expand {
      border-top:1px solid #1e1e1e;
      background:#111;
      padding:20px;
      animation:fadeUp 0.2s ease;
      display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px;
    }
    .exp-block { display:flex; flex-direction:column; gap:6px; }
    .exp-label { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:1px; color:#333; }
    .exp-title { font-size:13px; font-weight:700; color:#ccc; }
    .exp-row   { display:flex; justify-content:space-between; font-size:12px; color:#555; padding:4px 0; border-bottom:1px solid #1a1a1a; }
    .exp-row:last-child { border-bottom:none; }
    .exp-row span:last-child { color:#999; font-weight:600; font-family:'DM Mono',monospace; font-size:11.5px; }
    .exp-txn {
      grid-column:1/-1;
      background:#0e0e0e; border:1px solid #1e1e1e; border-radius:8px;
      padding:12px 16px; font-family:'DM Mono',monospace;
      font-size:11.5px; color:#3a3a3a;
      display:flex; align-items:center; justify-content:space-between;
    }
    .exp-txn span { color:#555; }

    .chevron {
      width:16px; height:16px; color:#333;
      transition:transform 0.2s; flex-shrink:0;
    }
    .chevron.open { transform:rotate(180deg); color:#555; }

    /* ── summary bar ── */
    .summary-bar {
      display:grid; grid-template-columns:repeat(3,1fr); gap:14px;
      animation:fadeIn 0.3s ease;
    }
    .summary-card {
      background:#161616; border:1px solid #252525; border-radius:12px;
      padding:18px 20px;
    }
    .summary-card-label { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.8px; color:#333; margin-bottom:8px; }
    .summary-card-val   { font-size:24px; font-weight:800; color:#f0f0f0; font-family:'DM Mono',monospace; }
    .summary-card-sub   { font-size:12px; color:#444; margin-top:4px; }
    `

    // ── render loading ────────────────────────────────────────────────────────
    if (invoices === null) {
        return (
            <>
                <style>{css}</style>
                <div className="inv-app">
                    <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} activeItem={activeItem} setActiveItem={setActiveItem} />
                    <div className="inv-main">
                        <header className="inv-topbar"><span className="topbar-title">CRM</span></header>
                        <div className="inv-content">
                            <div>
                                <div className="page-title">Invoices</div>
                                <div className="page-sub">Your billing history and receipts</div>
                            </div>
                            {[1,2,3].map(i => <div key={i} className="skeleton-row" />)}
                        </div>
                    </div>
                </div>
            </>
        )
    }

    // ── render empty ──────────────────────────────────────────────────────────
    if (invoices.length === 0) {
        return (
            <>
                <style>{css}</style>
                <div className="inv-app">
                    <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} activeItem={activeItem} setActiveItem={setActiveItem} />
                    <div className="inv-main">
                        <header className="inv-topbar"><span className="topbar-title">CRM</span></header>
                        <div className="inv-content">
                            <div>
                                <div className="page-title">Invoices</div>
                                <div className="page-sub">Your billing history and receipts</div>
                            </div>
                            <div className="empty-wrap">
                                <div className="empty-icon">🧾</div>
                                <div className="empty-title">No Invoices Found</div>
                                <div className="empty-sub">
                                    Once you subscribe to a plan, your invoices will appear here for download and reference.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )
    }

    // ── summary values ────────────────────────────────────────────────────────
    const totalSpent   = invoices.reduce((s, e) => s + (e.invoice?.amount || 0), 0)
    const latestInv    = invoices[0]?.invoice
    const activeBilling = invoices.filter(e => e.billing?.status === 'active').length

    // ── render invoices ───────────────────────────────────────────────────────
    return (
        <>
            <style>{css}</style>
            <div className="inv-app">
                <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} activeItem={activeItem} setActiveItem={setActiveItem} />
                <div className="inv-main">
                    <header className="inv-topbar"><span className="topbar-title">CRM</span></header>

                    <main className="inv-content">
                        <div>
                            <div className="page-title">Invoices</div>
                            <div className="page-sub">Your billing history and payment receipts</div>
                        </div>

                        {/* Summary Bar */}
                        <div className="summary-bar">
                            <div className="summary-card">
                                <div className="summary-card-label">Total Invoices</div>
                                <div className="summary-card-val">{invoices.length}</div>
                                <div className="summary-card-sub">across all plans</div>
                            </div>
                            <div className="summary-card">
                                <div className="summary-card-label">Total Spent</div>
                                <div className="summary-card-val" style={{ color: '#4ade80' }}>
                                    ${totalSpent.toFixed(2)}
                                </div>
                                <div className="summary-card-sub">USD · all time</div>
                            </div>
                            <div className="summary-card">
                                <div className="summary-card-label">Active Plans</div>
                                <div className="summary-card-val" style={{ color: '#7da4f5' }}>{activeBilling}</div>
                                <div className="summary-card-sub">
                                    {latestInv ? `Last: ${latestInv.invoice_number}` : 'No recent invoice'}
                                </div>
                            </div>
                        </div>

                        {/* Table */}
                        <div style={{ background: '#161616', border: '1px solid #252525', borderRadius: 12, overflow: 'hidden', animation: 'fadeIn 0.3s ease' }}>

                            {/* Table head */}
                            <div className="inv-table-header">
                                <span>Invoice #</span>
                                <span>Plan</span>
                                <span>Date</span>
                                <span>Amount</span>
                                <span>Status</span>
                                <span></span>
                            </div>

                            {/* Rows */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '12px' }}>
                                {invoices.map((entry, idx) => {
                                    const { invoice, billing, payment } = entry
                                    const isOpen = expanded === invoice.id
                                    const sm = statusMeta[invoice.status] || statusMeta.issued
                                    const pm = paymentMeta[payment.status] || paymentMeta.pending

                                    return (
                                        <div
                                            key={invoice.id}
                                            className={`inv-row-wrap${isOpen ? ' open' : ''}`}
                                            style={{ animationDelay: `${idx * 0.04}s`, animation: 'fadeUp 0.25s ease both' }}
                                        >
                                            {/* Main row */}
                                            <div
                                                className="inv-row"
                                                onClick={() => setExpanded(isOpen ? null : invoice.id)}
                                            >
                                                {/* Invoice number */}
                                                <div className="inv-number-text">{invoice.invoice_number}</div>

                                                {/* Plan */}
                                                <div>
                                                    <div className="inv-plan-text">{billing.plan_label} Plan</div>
                                                    <div className="inv-plan-sub">
                                                        ${billing.rate}/mo · {billing.duration} month{billing.duration > 1 ? 's' : ''}
                                                    </div>
                                                </div>

                                                {/* Date */}
                                                <div className="inv-date-text">{formatDate(invoice.issued_at)}</div>

                                                {/* Amount */}
                                                <div className="inv-amount">${invoice.amount.toFixed(2)}</div>

                                                {/* Status */}
                                                <div>
                                                    <span className="status-pill" style={{ background: sm.bg, border: `1px solid ${sm.border}`, color: sm.color }}>
                                                        <span className="status-dot" style={{ background: sm.color }} />
                                                        {sm.label}
                                                    </span>
                                                </div>

                                                {/* Chevron */}
                                                <svg className={`chevron${isOpen ? ' open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="6 9 12 15 18 9" />
                                                </svg>
                                            </div>

                                            {/* Expanded detail */}
                                            {isOpen && (
                                                <div className="inv-expand">
                                                    {/* Billing */}
                                                    <div className="exp-block">
                                                        <div className="exp-label">Billing Details</div>
                                                        {[
                                                            ['Plan',     billing.plan_label],
                                                            ['Rate',     `$${billing.rate}/month`],
                                                            ['Duration', `${billing.duration} month${billing.duration > 1 ? 's' : ''}`],
                                                            ['Start',    formatDate(billing.start_date)],
                                                            ['Expires',  formatDate(billing.expiry_date)],
                                                            ['Status',   billing.status],
                                                        ].map(([k, v]) => (
                                                            <div key={k} className="exp-row">
                                                                <span>{k}</span>
                                                                <span style={k === 'Status' ? { color: billing.status === 'active' ? '#4ade80' : '#f87171', textTransform: 'capitalize' } : {}}>{v}</span>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Payment */}
                                                    <div className="exp-block">
                                                        <div className="exp-label">Payment Details</div>
                                                        {[
                                                            ['Method',   payment.payment_method],
                                                            ['Currency', payment.currency],
                                                            ['Amount',   `$${payment.amount.toFixed(2)}`],
                                                            ['Paid At',  `${formatDate(payment.paid_at)} ${formatTime(payment.paid_at)}`],
                                                            ['Status',   payment.status],
                                                        ].map(([k, v]) => (
                                                            <div key={k} className="exp-row">
                                                                <span>{k}</span>
                                                                <span style={k === 'Status' ? { color: pm.color, textTransform: 'capitalize' } : {}}>{v}</span>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Invoice meta + download */}
                                                    <div className="exp-block">
                                                        <div className="exp-label">Invoice Info</div>
                                                        {[
                                                            ['Number',   invoice.invoice_number],
                                                            ['Issued',   formatDate(invoice.issued_at)],
                                                            ['Currency', invoice.currency],
                                                            ['Total',    `$${invoice.amount.toFixed(2)}`],
                                                            ['Status',   invoice.status],
                                                        ].map(([k, v]) => (
                                                            <div key={k} className="exp-row">
                                                                <span>{k}</span>
                                                                <span style={k === 'Status' ? { color: sm.color, textTransform: 'capitalize' } : {}}>{v}</span>
                                                            </div>
                                                        ))}
                                                        <button
                                                            className="btn-dl"
                                                            style={{ marginTop: 12, width: '100%', justifyContent: 'center' }}
                                                            onClick={(e) => { e.stopPropagation(); downloadInvoice(entry) }}
                                                        >
                                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                                                            </svg>
                                                            Download Invoice
                                                        </button>
                                                    </div>

                                                    {/* Transaction ID */}
                                                    <div className="exp-txn">
                                                        <span style={{ color: '#2a2a2a', fontSize: '10px', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase' }}>TXN ID</span>
                                                        <span>{payment.transaction_id}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </>
    )
}

export default Invoices