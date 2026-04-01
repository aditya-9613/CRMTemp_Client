import React, { useEffect, useState } from 'react'
import Sidebar from '../Sidebar/Sidebar'
import axios from 'axios'
import { baseURL } from '../../Utils/baseURL.js'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Badge from 'react-bootstrap/Badge'
import ProgressBar from 'react-bootstrap/ProgressBar'
import Spinner from 'react-bootstrap/Spinner'

// ── helpers ───────────────────────────────────────────────────────────────────
const formatDate = (isoStr) => {
    if (!isoStr) return '—'
    return new Date(isoStr).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'long', year: 'numeric',
    })
}

const getDaysRemaining = (expiryDate) => {
    if (!expiryDate) return 0
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const expiry = new Date(expiryDate); expiry.setHours(0, 0, 0, 0)
    return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24))
}

const getTotalDays = (startDate, expiryDate) => {
    if (!startDate || !expiryDate) return 1
    const start  = new Date(startDate);  start.setHours(0, 0, 0, 0)
    const expiry = new Date(expiryDate); expiry.setHours(0, 0, 0, 0)
    return Math.max(1, Math.ceil((expiry - start) / (1000 * 60 * 60 * 24)))
}

const planColorMap = {
    monthly:   { color: '#7da4f5', dark: '#3b5bdb', glow: 'rgba(59,91,219,0.2)',   bg: 'rgba(59,91,219,0.08)',  border: 'rgba(59,91,219,0.25)'  },
    quarterly: { color: '#c084fc', dark: '#7c3aed', glow: 'rgba(124,58,237,0.2)',  bg: 'rgba(124,58,237,0.08)', border: 'rgba(124,58,237,0.25)' },
    yearly:    { color: '#4ade80', dark: '#16a34a', glow: 'rgba(34,197,94,0.2)',   bg: 'rgba(34,197,94,0.08)',  border: 'rgba(34,197,94,0.25)'  },
}
const defaultPalette = planColorMap.monthly

const statusStyle = {
    active:   { bg: 'rgba(34,197,94,0.10)',  border: 'rgba(34,197,94,0.25)',  color: '#4ade80',  label: 'Active'   },
    expired:  { bg: 'rgba(239,68,68,0.10)',  border: 'rgba(239,68,68,0.25)',  color: '#f87171',  label: 'Expired'  },
    pending:  { bg: 'rgba(251,191,36,0.10)', border: 'rgba(251,191,36,0.25)', color: '#fbbf24',  label: 'Pending'  },
    inactive: { bg: 'rgba(100,100,100,0.10)',border: 'rgba(100,100,100,0.25)',color: '#666',     label: 'Inactive' },
}

const FEATURES = [
    { icon: '⚡', label: 'All Premium Features' },
    { icon: '📥', label: 'Bulk Import via Excel / CSV' },
    { icon: '🗑️', label: 'Deleted Contacts Recovery' },
    { icon: '📊', label: 'Finalized Reports by Tenure' },
    { icon: '🎯', label: 'Priority Support' },
    { icon: '∞',  label: 'Unlimited Contacts' },
]

// ── component ─────────────────────────────────────────────────────────────────
const Subscriptions = () => {
    const [collapsed,   setCollapsed]   = useState(false)
    const [activeItem,  setActiveItem]  = useState('Subscriptions')
    const [data,        setData]        = useState(null)   // null = loading
    const [error,       setError]       = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios({
                    url: `${baseURL}/api/v1/payment/getInvoices`,
                    method: 'GET',
                    withCredentials: true,
                    headers: { Authorization: `Bearer ${localStorage.getItem('user')}` },
                })
                if (res.status === 200) {
                    const raw = res.data.data?.data
                    // take latest entry (first in array, or the object itself)
                    const latest = Array.isArray(raw) ? raw[0] : raw
                    setData(latest || null)
                }
            } catch (err) {
                console.error(err)
                setError(true)
                setData(undefined)
            }
        }
        fetchData()
    }, [])

    // ── derived values ────────────────────────────────────────────────────────
    const billing = data?.billing
    const payment = data?.payment
    const invoice = data?.invoice

    const palette    = planColorMap[billing?.plan_id] || defaultPalette
    const ss         = statusStyle[billing?.status]   || statusStyle.inactive
    const daysLeft   = getDaysRemaining(billing?.expiry_date)
    const totalDays  = getTotalDays(billing?.start_date, billing?.expiry_date)
    const daysUsed   = totalDays - Math.max(0, daysLeft)
    const progress   = Math.min(100, Math.round((daysUsed / totalDays) * 100))
    const isExpiring = daysLeft <= 7 && daysLeft > 0
    const isExpired  = daysLeft <= 0

    // ── CSS ───────────────────────────────────────────────────────────────────
    const css = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    @keyframes spin    { to { transform: rotate(360deg); } }
    @keyframes fadeIn  { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
    @keyframes fadeUp  { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
    @keyframes glow    { 0%,100%{opacity:0.7} 50%{opacity:1} }
    @keyframes pulse   { 0%,100%{opacity:1}   50%{opacity:0.45} }
    @keyframes shimmer {
      0%   { background-position: -600px 0; }
      100% { background-position:  600px 0; }
    }

    .sub-app  { min-height:100vh; background:#0e0e0e; font-family:'DM Sans',sans-serif; color:#e8e8e8; }
    .sub-main {
      margin-left: ${collapsed ? '64px' : '236px'};
      transition: margin-left 0.28s cubic-bezier(0.4,0,0.2,1);
      min-height:100vh; display:flex; flex-direction:column;
    }
    .sub-topbar {
      position:sticky; top:0; z-index:99;
      height:64px; background:#141414;
      border-bottom:1px solid #2a2a2a;
      display:flex; align-items:center;
      padding:0 24px; flex-shrink:0;
    }
    .topbar-title { font-size:17px; font-weight:700; color:#f5f5f5; letter-spacing:-0.3px; }
    .sub-content  { flex:1; padding:28px; display:flex; flex-direction:column; gap:20px; }
    .page-title   { font-size:22px; font-weight:700; color:#f0f0f0; letter-spacing:-0.4px; }
    .page-sub     { font-size:13.5px; color:#555; margin-top:4px; }

    /* cards */
    .s-card {
      background:#161616; border:1px solid #252525;
      border-radius:14px; overflow:hidden;
      animation:fadeUp 0.28s ease both;
    }
    .s-card-header {
      padding:16px 22px; border-bottom:1px solid #1e1e1e;
      font-size:13px; font-weight:700; color:#aaa;
      display:flex; align-items:center; gap:8px;
    }
    .s-card-body { padding:22px; }

    /* hero */
    .hero-card {
      border-radius:16px; padding:32px 28px;
      position:relative; overflow:hidden;
      animation:fadeIn 0.3s ease;
    }
    .hero-glow {
      position:absolute; width:260px; height:260px;
      border-radius:50%; filter:blur(80px);
      top:-60px; right:-60px; pointer-events:none;
      opacity:0.18;
    }
    .hero-plan-badge {
      display:inline-flex; align-items:center; gap:6px;
      border-radius:20px; padding:4px 14px;
      font-size:10px; font-weight:800;
      letter-spacing:1.2px; text-transform:uppercase;
      margin-bottom:16px;
    }
    .hero-plan-name  { font-size:30px; font-weight:800; color:#f0f0f0; letter-spacing:-0.5px; line-height:1.1; }
    .hero-plan-rate  { font-size:14px; color:#555; margin-top:4px; }
    .hero-amount     { font-size:42px; font-weight:800; line-height:1; font-family:'DM Mono',monospace; }
    .hero-amount-sub { font-size:12px; color:#444; margin-top:6px; }

    /* stat row */
    .stat-item { display:flex; flex-direction:column; gap:4px; }
    .stat-label { font-size:10.5px; font-weight:700; text-transform:uppercase; letter-spacing:0.8px; color:#333; }
    .stat-val   { font-size:14px; font-weight:700; color:#ccc; font-family:'DM Mono',monospace; }

    /* info rows */
    .info-row {
      display:flex; justify-content:space-between; align-items:center;
      padding:11px 0; border-bottom:1px solid #1a1a1a; font-size:13px;
    }
    .info-row:last-child { border-bottom:none; }
    .info-key { color:#444; }
    .info-val { font-weight:600; color:#bbb; font-family:'DM Mono',monospace; font-size:12.5px; }

    /* progress bar override */
    .progress { background:#1a1a1a !important; border-radius:99px !important; height:7px !important; }
    .progress-bar { border-radius:99px !important; transition:width 1s ease !important; }

    /* feature item */
    .feat-item {
      display:flex; align-items:center; gap:10px;
      background:#111; border:1px solid #1e1e1e;
      border-radius:9px; padding:11px 14px;
      font-size:13px; color:#999;
      transition:border-color 0.15s, color 0.15s;
    }
    .feat-item:hover { border-color:#2a2a2a; color:#ccc; }
    .feat-icon { font-size:15px; flex-shrink:0; }

    /* expiry pill */
    .expiry-pill {
      display:inline-flex; align-items:center; gap:6px;
      border-radius:20px; padding:5px 15px;
      font-size:12px; font-weight:700;
    }

    /* shimmer skeleton */
    .skeleton {
      border-radius:12px; height:180px;
      background:linear-gradient(90deg,#1a1a1a 25%,#222 50%,#1a1a1a 75%);
      background-size:600px 100%;
      animation:shimmer 1.4s infinite linear;
    }

    /* empty/error */
    .center-wrap {
      flex:1; display:flex; flex-direction:column;
      align-items:center; justify-content:center;
      gap:14px; padding:60px 24px; animation:fadeIn 0.3s ease;
    }
    .center-icon {
      width:72px; height:72px; border-radius:18px;
      background:#161616; border:1px solid #252525;
      display:flex; align-items:center; justify-content:center; font-size:32px;
    }
    .center-title { font-size:17px; font-weight:700; color:#ccc; }
    .center-sub   { font-size:13px; color:#444; text-align:center; max-width:300px; line-height:1.6; }

    /* txn box */
    .txn-box {
      background:#0e0e0e; border:1px solid #1e1e1e; border-radius:9px;
      padding:13px 16px; font-family:'DM Mono',monospace;
      font-size:11.5px; color:#555;
      display:flex; align-items:center; justify-content:space-between; gap:12px;
      word-break:break-all;
    }
    .txn-label { font-size:10px; font-weight:700; letter-spacing:0.8px; text-transform:uppercase; color:#2a2a2a; flex-shrink:0; }
    `

    // ── loading ───────────────────────────────────────────────────────────────
    if (data === null && !error) {
        return (
            <>
                <style>{css}</style>
                <div className="sub-app">
                    <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} activeItem={activeItem} setActiveItem={setActiveItem} />
                    <div className="sub-main">
                        <header className="sub-topbar"><span className="topbar-title">CRM</span></header>
                        <div className="sub-content">
                            <div><div className="page-title">Subscription</div><div className="page-sub">Your active plan and billing details</div></div>
                            <div className="skeleton" />
                            <Row className="g-3">
                                <Col md={6}><div className="skeleton" style={{ height: 160 }} /></Col>
                                <Col md={6}><div className="skeleton" style={{ height: 160 }} /></Col>
                            </Row>
                        </div>
                    </div>
                </div>
            </>
        )
    }

    // ── no data / error ───────────────────────────────────────────────────────
    if (!data || error) {
        return (
            <>
                <style>{css}</style>
                <div className="sub-app">
                    <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} activeItem={activeItem} setActiveItem={setActiveItem} />
                    <div className="sub-main">
                        <header className="sub-topbar"><span className="topbar-title">CRM</span></header>
                        <div className="sub-content">
                            <div><div className="page-title">Subscription</div><div className="page-sub">Your active plan and billing details</div></div>
                            <div className="center-wrap">
                                <div className="center-icon">{error ? '⚠️' : '📭'}</div>
                                <div className="center-title">{error ? 'Failed to Load' : 'No Active Subscription'}</div>
                                <div className="center-sub">
                                    {error
                                        ? 'We could not fetch your subscription details. Please try again later.'
                                        : 'You do not have an active plan yet. Head over to Billing to get started.'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )
    }

    // ── main render ───────────────────────────────────────────────────────────
    return (
        <>
            <style>{css}</style>
            <div className="sub-app">
                <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} activeItem={activeItem} setActiveItem={setActiveItem} />

                <div className="sub-main">
                    <header className="sub-topbar"><span className="topbar-title">CRM</span></header>

                    <main className="sub-content">
                        <div>
                            <div className="page-title">Subscription</div>
                            <div className="page-sub">Your active plan and billing details</div>
                        </div>

                        {/* ── Hero Card ── */}
                        <div
                            className="hero-card"
                            style={{
                                background: `linear-gradient(135deg, #101010 0%, #141414 100%)`,
                                border: `1px solid ${palette.border}`,
                                boxShadow: `0 0 0 1px ${palette.border}, 0 12px 40px ${palette.glow}`,
                            }}
                        >
                            <div className="hero-glow" style={{ background: palette.color }} />

                            <Row className="align-items-center g-4">
                                <Col md={7}>
                                    <div
                                        className="hero-plan-badge"
                                        style={{ background: palette.bg, border: `1px solid ${palette.border}`, color: palette.color }}
                                    >
                                        <span>●</span> {billing.plan_label} Plan
                                    </div>
                                    <div className="hero-plan-name">{billing.plan_label} Subscription</div>
                                    <div className="hero-plan-rate">
                                        ${billing.rate}/month · {billing.duration} month{billing.duration > 1 ? 's' : ''} billing cycle
                                    </div>

                                    <div style={{ marginTop: 20, display: 'flex', gap: 32, flexWrap: 'wrap' }}>
                                        <div className="stat-item">
                                            <div className="stat-label">Start Date</div>
                                            <div className="stat-val">{formatDate(billing.start_date)}</div>
                                        </div>
                                        <div className="stat-item">
                                            <div className="stat-label">Expiry Date</div>
                                            <div className="stat-val" style={{ color: isExpired ? '#f87171' : isExpiring ? '#fbbf24' : palette.color }}>
                                                {formatDate(billing.expiry_date)}
                                            </div>
                                        </div>
                                        <div className="stat-item">
                                            <div className="stat-label">Plan ID</div>
                                            <div className="stat-val" style={{ color: '#555' }}>
                                                {billing.id?.slice(0, 8)}…
                                            </div>
                                        </div>
                                    </div>
                                </Col>

                                <Col md={5} style={{ textAlign: 'right' }}>
                                    <div className="hero-amount" style={{ color: palette.color }}>
                                        ${billing.total_amount?.toFixed(2)}
                                    </div>
                                    <div className="hero-amount-sub">Total amount paid · {invoice?.currency || 'USD'}</div>

                                    <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
                                        <div
                                            className="expiry-pill"
                                            style={{
                                                background: ss.bg, border: `1px solid ${ss.border}`, color: ss.color,
                                                animation: isExpiring ? 'glow 1.5s ease infinite' : 'none',
                                            }}
                                        >
                                            {isExpired   ? '⛔ Plan Expired'
                                            : isExpiring ? `⚠️ Expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`
                                            :              `✅ ${daysLeft} days remaining`}
                                        </div>
                                    </div>
                                </Col>
                            </Row>

                            {/* Progress bar */}
                            <div style={{ marginTop: 28 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#333', marginBottom: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.7px' }}>
                                    <span>Plan Usage</span>
                                    <span style={{ color: palette.color }}>{progress}% used · {Math.max(0, daysLeft)} days left</span>
                                </div>
                                <ProgressBar
                                    now={progress}
                                    style={{ height: 7 }}
                                    className="progress"
                                >
                                    <div
                                        className="progress-bar"
                                        style={{
                                            width: `${progress}%`,
                                            background: `linear-gradient(90deg, ${palette.dark}, ${palette.color})`,
                                            boxShadow: `0 0 10px ${palette.glow}`,
                                        }}
                                    />
                                </ProgressBar>
                            </div>
                        </div>

                        {/* ── Details Row ── */}
                        <Row className="g-3">

                            {/* Billing Info */}
                            <Col md={6}>
                                <div className="s-card" style={{ animationDelay: '0.05s' }}>
                                    <div className="s-card-header">📋 Billing Info</div>
                                    <div className="s-card-body">
                                        {[
                                            ['Plan',      billing.plan_label],
                                            ['Rate',      `$${billing.rate} / month`],
                                            ['Duration',  `${billing.duration} month${billing.duration > 1 ? 's' : ''}`],
                                            ['Total Paid',`$${billing.total_amount?.toFixed(2)}`],
                                            ['Status',    billing.status],
                                        ].map(([k, v]) => (
                                            <div key={k} className="info-row">
                                                <span className="info-key">{k}</span>
                                                <span
                                                    className="info-val"
                                                    style={k === 'Status' ? {
                                                        color: ss.color,
                                                        background: ss.bg,
                                                        border: `1px solid ${ss.border}`,
                                                        borderRadius: 6,
                                                        padding: '2px 10px',
                                                        fontSize: 11,
                                                        fontWeight: 700,
                                                        textTransform: 'capitalize',
                                                    } : k === 'Total Paid' ? { color: palette.color } : {}}
                                                >
                                                    {v}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Col>

                            {/* Payment Info */}
                            <Col md={6}>
                                <div className="s-card" style={{ animationDelay: '0.1s' }}>
                                    <div className="s-card-header">💳 Payment Info</div>
                                    <div className="s-card-body">
                                        {[
                                            ['Method',   payment.payment_method?.charAt(0).toUpperCase() + payment.payment_method?.slice(1)],
                                            ['Currency', payment.currency],
                                            ['Amount',   `$${payment.amount?.toFixed(2)}`],
                                            ['Paid At',  formatDate(payment.paid_at)],
                                            ['Status',   payment.status],
                                        ].map(([k, v]) => (
                                            <div key={k} className="info-row">
                                                <span className="info-key">{k}</span>
                                                <span
                                                    className="info-val"
                                                    style={k === 'Status' ? {
                                                        color: payment.status === 'success' ? '#4ade80' : payment.status === 'failed' ? '#f87171' : '#fbbf24',
                                                        background: payment.status === 'success' ? 'rgba(34,197,94,0.1)' : payment.status === 'failed' ? 'rgba(239,68,68,0.1)' : 'rgba(251,191,36,0.1)',
                                                        border: `1px solid ${payment.status === 'success' ? 'rgba(34,197,94,0.25)' : payment.status === 'failed' ? 'rgba(239,68,68,0.25)' : 'rgba(251,191,36,0.25)'}`,
                                                        borderRadius: 6, padding: '2px 10px',
                                                        fontSize: 11, fontWeight: 700, textTransform: 'capitalize',
                                                    } : {}}
                                                >
                                                    {v}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Col>

                            {/* Invoice Summary */}
                            <Col md={6}>
                                <div className="s-card" style={{ animationDelay: '0.15s' }}>
                                    <div className="s-card-header">🧾 Invoice Summary</div>
                                    <div className="s-card-body">
                                        {[
                                            ['Invoice #', invoice.invoice_number],
                                            ['Issued',    formatDate(invoice.issued_at)],
                                            ['Plan',      invoice.plan_label],
                                            ['Amount',    `$${invoice.amount?.toFixed(2)}`],
                                            ['Status',    invoice.status],
                                        ].map(([k, v]) => (
                                            <div key={k} className="info-row">
                                                <span className="info-key">{k}</span>
                                                <span
                                                    className="info-val"
                                                    style={k === 'Invoice #' ? { color: '#7da4f5' }
                                                        : k === 'Amount' ? { color: palette.color }
                                                        : k === 'Status' ? {
                                                            color: '#7da4f5',
                                                            background: 'rgba(59,91,219,0.12)',
                                                            border: '1px solid rgba(59,91,219,0.25)',
                                                            borderRadius: 6, padding: '2px 10px',
                                                            fontSize: 11, fontWeight: 700, textTransform: 'capitalize',
                                                        } : {}}
                                                >
                                                    {v}
                                                </span>
                                            </div>
                                        ))}

                                        {/* Transaction ID */}
                                        <div style={{ marginTop: 14 }}>
                                            <div className="txn-box">
                                                <span className="txn-label">TXN ID</span>
                                                <span>{payment.transaction_id}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Col>

                            {/* Features */}
                            <Col md={6}>
                                <div className="s-card" style={{ animationDelay: '0.2s' }}>
                                    <div className="s-card-header">🎁 Plan Includes</div>
                                    <div className="s-card-body">
                                        <Row className="g-2">
                                            {FEATURES.map((f, i) => (
                                                <Col key={i} xs={12}>
                                                    <div className="feat-item">
                                                        <span className="feat-icon">{f.icon}</span>
                                                        <span>{f.label}</span>
                                                    </div>
                                                </Col>
                                            ))}
                                        </Row>
                                    </div>
                                </div>
                            </Col>
                        </Row>

                    </main>
                </div>
            </div>
        </>
    )
}

export default Subscriptions