import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js"
import axios from 'axios'
import Sidebar from '../../Sidebar/Sidebar'
import { baseURL } from '../../../Utils/baseURL'

const Payment = () => {
    const { state } = useLocation()
    const navigate = useNavigate()
    const [{ isPending }] = usePayPalScriptReducer()

    const [isApproving, setIsApproving] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [errorMsg, setErrorMsg] = useState(null)
    const [cancelMsg, setCancelMsg] = useState(null)
    const [countdown, setCountdown] = useState(3)
    const [collapsed, setCollapsed] = useState(false)
    const [activeItem, setActiveItem] = useState("Billing")
    const timerRef = useRef(null)

    const { planLabel, planId, rate, duration, totalAmount } = state

    const authHeader = {
        withCredentials: true,
        headers: {
            Authorization: `Bearer ${localStorage.getItem("user")}`
        }
    }

    // Auto-redirect timer — fires when modal opens
    useEffect(() => {
        if (!showModal) return
        setCountdown(3)
        timerRef.current = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current)
                    navigate("/Dashboard")
                    return 0
                }
                return prev - 1
            })
        }, 1000)
        return () => clearInterval(timerRef.current)
    }, [showModal, navigate])

    const createOrder = async () => {
        const res = await axios.post(
            `${baseURL}/api/v1/payment/createOrder`,
            { planId, planLabel, rate, duration, totalAmount: totalAmount.toFixed(2).toString() },
            authHeader
        )
        return res.data.data.orderId
    }

    const onApprove = async (data) => {
        setIsApproving(true)
        setErrorMsg(null)
        try {
            const res = await axios.post(
                `${baseURL}/api/v1/payment/captureOrder`,
                { orderId: data.orderID, planId, planLabel, rate, duration, totalAmount },
                authHeader
            )
            if (res.status === 200) setShowModal(true)
        } catch (err) {
            const message = err.response?.data?.message || err.message || "Payment capture failed"
            const code = err.response?.status ?? ""
            setErrorMsg(code ? `${message} (${code})` : message)
        } finally {
            setIsApproving(false)
        }
    }

    const handleGoToDashboard = () => {
        clearInterval(timerRef.current)
        setShowModal(false)
        navigate("/Dashboard")
    }

    const css = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&family=DM+Mono:wght@400;500&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body, #root { height: 100%; background: #0e0e0e; }

    @keyframes fadeUp  { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
    @keyframes spin    { to { transform: rotate(360deg); } }
    @keyframes bgPulse { 0%,100%{opacity:0.04} 50%{opacity:0.08} }
    @keyframes barShrink { from { width: 100%; } to { width: 0%; } }

    .pay-app {
      min-height: 100vh; background: #0e0e0e;
      font-family: 'DM Sans', sans-serif; color: #e0e0e0;
      display: flex;
    }

    .pay-main {
      margin-left: ${collapsed ? "64px" : "236px"};
      transition: margin-left 0.28s cubic-bezier(0.4,0,0.2,1);
      min-height: 100vh; display: flex; flex-direction: column; flex: 1;
    }

    .pay-topbar {
      position: sticky; top: 0; z-index: 99;
      height: 64px; background: #141414;
      border-bottom: 1px solid #222;
      display: flex; align-items: center;
      padding: 0 24px; gap: 12px; flex-shrink: 0;
    }
    .topbar-back {
      display: flex; align-items: center; gap: 8px;
      background: none; border: none; cursor: pointer;
      color: #555; font-size: 13px; font-weight: 600;
      font-family: 'DM Sans', sans-serif;
      padding: 6px 10px; border-radius: 7px;
      transition: background 0.15s, color 0.15s;
    }
    .topbar-back:hover { background: #1a1a1a; color: #ccc; }
    .topbar-divider { width: 1px; height: 20px; background: #252525; }
    .topbar-title { font-size: 16px; font-weight: 700; color: #f0f0f0; letter-spacing: -0.3px; }

    .pay-body {
      flex: 1; display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      padding: 32px 24px;
      animation: fadeUp 0.3s ease both;
    }

    .pay-inner { width: 100%; max-width: 480px; display: flex; flex-direction: column; gap: 14px; }

    /* Page title */
    .pay-heading { text-align: center; margin-bottom: 4px; }
    .pay-heading h2 { font-size: 22px; font-weight: 800; color: #f0f0f0; letter-spacing: -0.4px; }
    .pay-heading p  { font-size: 13.5px; color: #555; margin-top: 5px; }

    /* Alert banners */
    .alert {
      border-radius: 10px; padding: 12px 16px;
      display: flex; align-items: center; gap: 10px;
      animation: fadeUp 0.2s ease;
    }
    .alert-error  { background: rgba(239,68,68,0.08);  border: 1px solid rgba(239,68,68,0.25); }
    .alert-cancel { background: rgba(245,158,11,0.08); border: 1px solid rgba(245,158,11,0.25); }
    .alert-body { flex: 1; }
    .alert-title  { font-size: 13px; font-weight: 700; }
    .alert-msg    { font-size: 12px; margin-top: 2px; }
    .alert-error  .alert-title { color: #f87171; }
    .alert-error  .alert-msg   { color: #fca5a5; }
    .alert-cancel .alert-title { color: #fbbf24; }
    .alert-cancel .alert-msg   { color: #fcd34d; }
    .alert-close {
      background: none; border: none; cursor: pointer;
      font-size: 15px; padding: 0; line-height: 1;
      transition: opacity 0.15s;
    }
    .alert-close:hover { opacity: 0.6; }

    /* Cards */
    .card {
      background: #141414; border: 1px solid #222;
      border-radius: 14px; overflow: hidden;
      animation: fadeUp 0.3s ease both;
    }
    .card-hdr {
      padding: 16px 20px 0;
      font-size: 14px; font-weight: 700; color: #ddd;
    }
    .card-body { padding: 16px 20px 20px; }

    /* Order summary rows */
    .order-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; }
    .order-row + .order-row { border-top: 1px solid #1c1c1c; }
    .order-key   { font-size: 13.5px; color: #555; }
    .order-val   { font-size: 13.5px; font-weight: 600; color: #ccc; }
    .order-total { border-top: 1px solid #252525 !important; margin-top: 4px; }
    .order-total .order-key { font-size: 15px; font-weight: 700; color: #ddd; }
    .order-total .order-val { font-size: 28px; font-weight: 800; color: #3b82f6; font-family: 'DM Mono', monospace; }

    .plan-chip {
      background: rgba(59,91,219,0.15); color: #7da4f5;
      border: 1px solid rgba(59,91,219,0.3);
      padding: 2px 12px; border-radius: 20px;
      font-size: 12px; font-weight: 700; letter-spacing: 0.3px;
    }

    /* PayPal card sub-text */
    .paypal-desc { font-size: 13px; color: #555; margin-bottom: 18px; line-height: 1.6; }
    .paypal-loading { text-align: center; padding: 20px; color: #3a3a3a; font-size: 13px; }

    /* Security notice */
    .security-note {
      text-align: center; font-size: 12px; color: #333;
      display: flex; align-items: center; justify-content: center; gap: 6px;
    }

    /* Back button */
    .btn-back {
      background: none; border: 1px solid #222;
      border-radius: 10px; padding: 11px;
      font-size: 13.5px; font-weight: 600; color: #555;
      cursor: pointer; transition: all 0.15s;
      font-family: 'DM Sans', sans-serif; width: 100%;
    }
    .btn-back:hover { background: #1a1a1a; border-color: #2e2e2e; color: #ccc; }

    /* ── Loading overlay ── */
    .loading-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.7);
      display: flex; flex-direction: column;
      align-items: center; justify-content: center; z-index: 999;
      gap: 16px; animation: fadeUp 0.2s ease;
    }
    .spinner {
      width: 44px; height: 44px; border-radius: 50%;
      border: 3px solid #252525; border-top-color: #3b5bdb;
      animation: spin 0.7s linear infinite;
    }
    .loading-text { color: #ddd; font-size: 14px; font-weight: 600; }

    /* ── Success Modal ── */
    .modal-backdrop {
      position: fixed; inset: 0; background: rgba(0,0,0,0.75);
      display: flex; align-items: center; justify-content: center;
      z-index: 1000; padding: 20px;
      animation: fadeUp 0.2s ease;
    }
    .modal-box {
      background: #141414; border: 1px solid #252525;
      border-radius: 18px; padding: 40px 32px 32px;
      max-width: 400px; width: 100%; text-align: center;
      position: relative; overflow: hidden;
    }
    .modal-box::before {
      content: '';
      position: absolute; inset: 0;
      background: radial-gradient(ellipse at 50% 0%, rgba(59,91,219,0.12) 0%, transparent 70%);
      pointer-events: none;
    }
    .modal-crown {
      width: 72px; height: 72px; border-radius: 50%;
      background: rgba(59,91,219,0.12); border: 1px solid rgba(59,91,219,0.25);
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 20px; font-size: 32px;
    }
    .modal-tag {
      font-size: 10px; font-weight: 700; letter-spacing: 0.1em;
      color: #7da4f5; text-transform: uppercase; margin-bottom: 8px;
    }
    .modal-title {
      font-size: 21px; font-weight: 800; color: #f0f0f0;
      letter-spacing: -0.3px; margin-bottom: 10px;
    }
    .modal-plan  { font-size: 14px; color: #555; margin-bottom: 6px; line-height: 1.6; }
    .modal-redir { font-size: 13px; color: #3a3a3a; margin-bottom: 18px; }
    .modal-redir strong { color: #7da4f5; }

    /* Progress bar */
    .progress-track {
      height: 4px; background: #1e1e1e; border-radius: 99px;
      margin-bottom: 24px; overflow: hidden;
    }
    .progress-fill {
      height: 100%; background: #3b5bdb; border-radius: 99px;
      transition: width 0.9s linear;
    }

    /* Dashboard button */
    .btn-dashboard {
      width: 100%; padding: 13px; background: #3b5bdb;
      border: none; border-radius: 10px; cursor: pointer;
      font-size: 14px; font-weight: 700; color: #fff;
      font-family: 'DM Sans', sans-serif;
      transition: background 0.15s, transform 0.1s;
    }
    .btn-dashboard:hover { background: #3451c7; transform: translateY(-1px); }
    .modal-thanks { font-size: 12px; color: #333; margin-top: 12px; }
    `

    return (
        <>
            <style>{css}</style>
            <div className="pay-app">
                <Sidebar
                    collapsed={collapsed}
                    setCollapsed={setCollapsed}
                    activeItem={activeItem}
                    setActiveItem={setActiveItem}
                />

                <div className="pay-main">
                    {/* Top bar */}
                    <header className="pay-topbar">
                        <button className="topbar-back" onClick={() => navigate("/billing")}>
                            ← Back
                        </button>
                        <div className="topbar-divider" />
                        <span className="topbar-title">Complete Payment</span>
                    </header>

                    {/* Loading overlay */}
                    {isApproving && (
                        <div className="loading-overlay">
                            <div className="spinner" />
                            <p className="loading-text">Confirming your payment…</p>
                        </div>
                    )}

                    {/* Success Modal */}
                    {showModal && (
                        <div className="modal-backdrop">
                            <div className="modal-box">
                                <div className="modal-crown">👑</div>
                                <div className="modal-tag">Payment Successful</div>
                                <div className="modal-title">You're now a Premium Member!</div>
                                <div className="modal-plan">
                                    Your <strong style={{ color: "#ddd" }}>{planLabel}</strong> plan is now active.
                                </div>
                                <div className="modal-redir">
                                    Redirecting to dashboard in <strong>{countdown}s</strong>…
                                </div>
                                <div className="progress-track">
                                    <div className="progress-fill" style={{ width: `${(countdown / 3) * 100}%` }} />
                                </div>
                                <button className="btn-dashboard" onClick={handleGoToDashboard}>
                                    Go to Dashboard →
                                </button>
                                <div className="modal-thanks">Thank you for your purchase!</div>
                            </div>
                        </div>
                    )}

                    {/* Body */}
                    <div className="pay-body">
                        <div className="pay-inner">

                            {/* Heading */}
                            <div className="pay-heading">
                                <h2>Complete Your Payment</h2>
                                <p>Review your order and pay securely below</p>
                            </div>

                            {/* Error banner */}
                            {errorMsg && (
                                <div className="alert alert-error">
                                    <span style={{ fontSize: 16 }}>⚠️</span>
                                    <div className="alert-body">
                                        <div className="alert-title">Payment failed</div>
                                        <div className="alert-msg">{errorMsg}</div>
                                    </div>
                                    <button className="alert-close" style={{ color: "#f87171" }} onClick={() => setErrorMsg(null)}>✕</button>
                                </div>
                            )}

                            {/* Cancel banner */}
                            {cancelMsg && (
                                <div className="alert alert-cancel">
                                    <span style={{ fontSize: 16 }}>ℹ️</span>
                                    <div className="alert-body">
                                        <div className="alert-msg" style={{ color: "#fcd34d" }}>{cancelMsg}</div>
                                    </div>
                                    <button className="alert-close" style={{ color: "#fbbf24" }} onClick={() => setCancelMsg(null)}>✕</button>
                                </div>
                            )}

                            {/* Order Summary */}
                            <div className="card">
                                <div className="card-hdr">🧾 Order Summary</div>
                                <div className="card-body">
                                    <div className="order-row">
                                        <span className="order-key">Plan</span>
                                        <span className="plan-chip">{planLabel}</span>
                                    </div>
                                    <div className="order-row">
                                        <span className="order-key">Rate</span>
                                        <span className="order-val">${rate} / month</span>
                                    </div>
                                    <div className="order-row">
                                        <span className="order-key">Duration</span>
                                        <span className="order-val">{duration === 1 ? "1 month" : `${duration} months`}</span>
                                    </div>
                                    <div className="order-row">
                                        <span className="order-key">Calculation</span>
                                        <span className="order-val" style={{ fontFamily: "'DM Mono', monospace", fontSize: 12.5 }}>
                                            ${rate} × {duration} = ${totalAmount.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="order-row order-total">
                                        <span className="order-key">Total Amount</span>
                                        <span className="order-val">${totalAmount.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* PayPal Card */}
                            <div className="card">
                                <div className="card-hdr">💳 Pay with PayPal</div>
                                <div className="card-body">
                                    <div className="paypal-desc">
                                        You will be charged{" "}
                                        <strong style={{ color: "#ddd" }}>${totalAmount.toFixed(2)}</strong>
                                        {" "}for the{" "}
                                        <strong style={{ color: "#ddd" }}>{planLabel}</strong> plan.
                                    </div>

                                    {isPending && (
                                        <div className="paypal-loading">Loading PayPal…</div>
                                    )}

                                    <PayPalButtons
                                        style={{ layout: "vertical", color: "blue", shape: "rect", label: "pay", height: 45 }}
                                        createOrder={createOrder}
                                        onApprove={onApprove}
                                        onError={(err) => setErrorMsg(err.message || "An unexpected PayPal error occurred. Please try again.")}
                                        onCancel={() => setCancelMsg("Payment was cancelled. You can try again anytime.")}
                                    />
                                </div>
                            </div>

                            {/* Security notice */}
                            <div className="security-note">
                                🔒 Payments are securely processed via PayPal. We do not store your card details.
                            </div>

                            {/* Back button */}
                            <button className="btn-back" onClick={() => navigate("/billing")}>
                                ← Back to Billing
                            </button>

                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Payment