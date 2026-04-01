import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../Sidebar/Sidebar'
import checkSubscription from '../../Utils/CheckSubscription'

const PLANS = [
    {
        id: "monthly",
        label: "Monthly",
        rate: 3,
        per: "month",
        duration: 1,
        badge: null,
        description: "Billed every month. Cancel anytime.",
        color: "#7da4f5",
        darkColor: "#3b5bdb",
        glowColor: "rgba(59,91,219,0.25)",
        border: "rgba(59,91,219,0.35)",
        activeBg: "rgba(59,91,219,0.08)",
    },
    {
        id: "quarterly",
        label: "Quarterly",
        rate: 2.5,
        per: "month",
        duration: 3,
        badge: "Save 17%",
        description: "Billed every 3 months. Great value.",
        color: "#c084fc",
        darkColor: "#7c3aed",
        glowColor: "rgba(124,58,237,0.25)",
        border: "rgba(124,58,237,0.35)",
        activeBg: "rgba(124,58,237,0.08)",
    },
    {
        id: "yearly",
        label: "Yearly",
        rate: 2,
        per: "month",
        duration: 12,
        badge: "Best Value",
        description: "Billed annually. Maximum savings.",
        color: "#4ade80",
        darkColor: "#16a34a",
        glowColor: "rgba(34,197,94,0.25)",
        border: "rgba(34,197,94,0.35)",
        activeBg: "rgba(34,197,94,0.08)",
    },
]

const FEATURES = [
    "Access to all Premium Features",
    "Bulk Import via Excel / CSV",
    "Deleted Contacts Recovery",
    "Finalized Reports by Tenure",
    "Priority Support",
    "Unlimited Contacts",
]

const formatDate = (isoStr) => {
    if (!isoStr) return "—"
    return new Date(isoStr).toLocaleDateString("en-GB", {
        day: "2-digit", month: "long", year: "numeric"
    })
}

const getDaysRemaining = (expiryDate) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const expiry = new Date(expiryDate)
    expiry.setHours(0, 0, 0, 0)
    return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24))
}

const Billing = () => {
    const [collapsed, setCollapsed] = useState(false)
    const [activeItem, setActiveItem] = useState("Billing")
    const [selectedPlan, setSelectedPlan] = useState(null)
    const [paymentDone, setPaymentDone] = useState(false)
    const [subscription, setSubscription] = useState(null)  // starts null (same as file 1)
    const navigate = useNavigate()

    useEffect(() => {
        const getData = async () => {
            const value = await checkSubscription()
            setPaymentDone(value.isPremium)
            setSubscription(value)
        }
        getData()
    }, [])

    const getTotal = (plan) => (plan.rate * plan.duration).toFixed(2)

    const handleProceed = () => {
        if (!selectedPlan) return
        const plan = PLANS.find(p => p.id === selectedPlan)
        navigate("/payment", {
            state: {
                planId: plan.id,
                planLabel: plan.label,
                rate: plan.rate,
                duration: plan.duration,
                totalAmount: parseFloat(getTotal(plan)),
            }
        })
    }

    const selected = PLANS.find(p => p.id === selectedPlan)

    const css = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body, #root { height: 100%; background: #0e0e0e; }

    @keyframes spin   { to { transform: rotate(360deg); } }
    @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
    @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.4} }
    @keyframes glow   { 0%,100%{opacity:0.6} 50%{opacity:1} }

    .gcrm-app { min-height: 100vh; background: #0e0e0e; font-family: 'DM Sans', sans-serif; color: #e8e8e8; }

    .gcrm-main {
      margin-left: ${collapsed ? "64px" : "236px"};
      transition: margin-left 0.28s cubic-bezier(0.4,0,0.2,1);
      min-height: 100vh; display: flex; flex-direction: column;
    }

    .gcrm-topbar {
      position: sticky; top: 0; z-index: 99;
      height: 64px; background: #141414;
      border-bottom: 1px solid #2a2a2a;
      display: flex; align-items: center;
      padding: 0 24px; gap: 12px; flex-shrink: 0;
    }
    .topbar-title { font-size: 17px; font-weight: 700; color: #f5f5f5; letter-spacing: -0.3px; }

    .gcrm-content { flex: 1; padding: 28px; display: flex; flex-direction: column; gap: 20px; }

    .page-title { font-size: 22px; font-weight: 700; color: #f0f0f0; letter-spacing: -0.4px; }
    .page-sub   { font-size: 13.5px; color: #555; margin-top: 4px; }

    .panel { background: #161616; border: 1px solid #252525; border-radius: 12px; overflow: hidden; animation: fadeIn 0.25s ease; }
    .panel-header { padding: 16px 20px; border-bottom: 1px solid #212121; font-size: 14px; font-weight: 700; color: #ddd; display: flex; align-items: center; justify-content: space-between; }
    .panel-body { padding: 20px; }

    .plan-cards-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; animation: fadeIn 0.3s ease; }
    .plan-card {
      background: #161616; border: 1px solid #252525; border-radius: 12px;
      padding: 24px 20px; cursor: pointer; position: relative;
      transition: border-color 0.18s, background 0.18s, transform 0.18s, box-shadow 0.18s;
    }
    .plan-card:hover { transform: translateY(-2px); border-color: #333; }
    .plan-card.selected { transform: translateY(-2px); }

    .plan-badge {
      position: absolute; top: -10px; right: 14px;
      border-radius: 20px; padding: 2px 11px;
      font-size: 10px; font-weight: 700; letter-spacing: 0.4px;
    }
    .plan-radio {
      position: absolute; top: 14px; right: 14px;
      width: 18px; height: 18px; border-radius: 50%;
      border: 2px solid #333; background: #0e0e0e;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.15s;
    }
    .plan-radio-dot { width: 7px; height: 7px; border-radius: 50%; background: #0e0e0e; }
    .plan-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 10px; }
    .plan-price { display: flex; align-items: flex-end; gap: 4px; margin-bottom: 4px; }
    .plan-price-num { font-size: 34px; font-weight: 800; color: #f0f0f0; line-height: 1; }
    .plan-price-per { font-size: 12px; color: #555; margin-bottom: 4px; }
    .plan-desc { font-size: 12.5px; color: #555; margin-bottom: 16px; line-height: 1.5; }
    .plan-divider { border: none; border-top: 1px solid #212121; margin-bottom: 14px; }
    .plan-total-box { border-radius: 8px; padding: 10px 13px; border: 1px solid #1c1c1c; background: #111; }
    .plan-total-label { font-size: 11px; color: #444; margin-bottom: 2px; font-family: 'DM Mono', monospace; }
    .plan-total-val { font-size: 17px; font-weight: 800; }
    .plan-total-period { font-size: 11px; font-weight: 500; color: #555; }

    .features-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 24px; }
    .feature-item { display: flex; align-items: center; gap: 9px; font-size: 13px; color: #aaa; }
    .feature-dot { width: 6px; height: 6px; border-radius: 50%; background: #3b5bdb; flex-shrink: 0; }

    .order-row { display: flex; justify-content: space-between; align-items: center; font-size: 13.5px; padding: 9px 0; border-bottom: 1px solid #1c1c1c; }
    .order-row:last-of-type { border-bottom: none; }
    .order-key { color: #555; }
    .order-val { font-weight: 600; color: #ccc; }

    .btn-gcrm {
      display: inline-flex; align-items: center; gap: 7px;
      border: none; border-radius: 8px; padding: 8px 16px;
      font-size: 13px; font-weight: 600; cursor: pointer;
      font-family: 'DM Sans', sans-serif;
      transition: background 0.15s, transform 0.1s, opacity 0.15s;
    }
    .btn-gcrm:hover:not(:disabled) { transform: translateY(-1px); }
    .btn-gcrm:disabled { opacity: 0.4; cursor: not-allowed; }
    .btn-primary { background: #3b5bdb; color: #fff; }
    .btn-primary:hover:not(:disabled) { background: #3451c7; }

    .expiry-pill { display: inline-flex; align-items: center; gap: 6px; border-radius: 20px; padding: 4px 14px; font-size: 11.5px; font-weight: 700; }
    .select-hint { text-align: center; font-size: 13px; color: #333; padding: 8px 0; animation: fadeIn 0.3s ease; }
    `

    // ── Loading — subscription === null (mirrors file 1 pattern) ──
    if (subscription === null) {
        return (
            <>
                <style>{css}</style>
                <div className="gcrm-app">
                    <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} activeItem={activeItem} setActiveItem={setActiveItem} />
                    <div className="gcrm-main">
                        <header className="gcrm-topbar"><span className="topbar-title">CRM</span></header>
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
                            <div style={{ width: 40, height: 40, border: "3px solid #252525", borderTop: "3px solid #3b5bdb", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                            <span style={{ color: "#555", fontSize: 13, animation: "pulse 1.5s ease infinite" }}>Loading...</span>
                        </div>
                    </div>
                </div>
            </>
        )
    }

    // ── Already Premium ────────────────────────────────────────
    if (paymentDone && subscription) {
        const existingPlan = {
            planLabel: subscription.planLabel,
            totalAmount: parseFloat(subscription.totalAmount) || 0,
            startDate: subscription.startDate,
            expiryDate: subscription.expiryDate,
        }

        const daysLeft = getDaysRemaining(existingPlan.expiryDate)
        const isExpiringSoon = daysLeft <= 7 && daysLeft > 0
        const isExpired = daysLeft <= 0
        const expiryColor  = isExpired ? "#f87171"  : isExpiringSoon ? "#fbbf24"  : "#4ade80"
        const expiryBg     = isExpired ? "rgba(239,68,68,0.1)"  : isExpiringSoon ? "rgba(251,191,36,0.1)"  : "rgba(34,197,94,0.1)"
        const expiryBorder = isExpired ? "rgba(239,68,68,0.25)" : isExpiringSoon ? "rgba(251,191,36,0.25)" : "rgba(34,197,94,0.25)"

        return (
            <>
                <style>{css}</style>
                <div className="gcrm-app">
                    <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} activeItem={activeItem} setActiveItem={setActiveItem} />
                    <div className="gcrm-main">
                        <header className="gcrm-topbar"><span className="topbar-title">CRM</span></header>
                        <main className="gcrm-content">
                            <div>
                                <div className="page-title">Billing</div>
                                <div className="page-sub">Manage your subscription and plan details</div>
                            </div>

                            {/* Premium Hero */}
                            <div style={{
                                background: "linear-gradient(135deg, #0f1629 0%, #130e24 100%)",
                                border: "1px solid rgba(59,91,219,0.2)",
                                borderRadius: 14, padding: "36px 32px",
                                textAlign: "center", animation: "fadeIn 0.3s ease",
                                boxShadow: "0 0 40px rgba(59,91,219,0.06) inset",
                            }}>
                                <div style={{ fontSize: 52, marginBottom: 14 }}>👑</div>
                                <div style={{
                                    display: "inline-block",
                                    background: "rgba(59,91,219,0.15)", border: "1px solid rgba(59,91,219,0.3)",
                                    borderRadius: 20, padding: "3px 16px",
                                    fontSize: 10, fontWeight: 700, letterSpacing: "1.2px",
                                    color: "#7da4f5", marginBottom: 14,
                                }}>
                                    PREMIUM MEMBER
                                </div>
                                <div style={{ fontSize: 22, fontWeight: 800, color: "#f0f0f0", marginBottom: 6 }}>
                                    You are a Premium User!
                                </div>
                                <div style={{ fontSize: 13.5, color: "#555", lineHeight: 1.6 }}>
                                    Enjoy unlimited access to all premium features
                                </div>
                            </div>

                            {/* Plan Details */}
                            <div className="panel">
                                <div className="panel-header">📋 Your Current Plan</div>
                                <div className="panel-body" style={{ display: "flex", flexDirection: "column" }}>
                                    {[
                                        { label: "Plan", value: (
                                            <span style={{
                                                background: "rgba(59,91,219,0.12)", border: "1px solid rgba(59,91,219,0.25)",
                                                color: "#7da4f5", borderRadius: 6, padding: "2px 12px",
                                                fontSize: 12, fontWeight: 700, fontFamily: "'DM Mono', monospace",
                                            }}>{existingPlan.planLabel}</span>
                                        )},
                                        { label: "Amount Paid", value: <span style={{ color: "#f0f0f0", fontWeight: 700, fontSize: 15 }}>${existingPlan.totalAmount.toFixed(2)}</span> },
                                        { label: "Start Date",  value: <span style={{ color: "#ccc", fontWeight: 600 }}>{formatDate(existingPlan.startDate)}</span> },
                                        { label: "Expires On",  value: <span style={{ color: expiryColor, fontWeight: 700, fontSize: 14 }}>{formatDate(existingPlan.expiryDate)}</span> },
                                    ].map(({ label, value }, i) => (
                                        <div key={i} className="order-row">
                                            <span className="order-key">{label}</span>
                                            {value}
                                        </div>
                                    ))}

                                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
                                        <div className="expiry-pill" style={{
                                            background: expiryBg, border: `1px solid ${expiryBorder}`, color: expiryColor,
                                            animation: isExpiringSoon ? "glow 1.5s ease infinite" : "none",
                                        }}>
                                            {isExpired
                                                ? "⛔ Plan Expired"
                                                : isExpiringSoon
                                                    ? `⚠️ Expires in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}`
                                                    : `✅ ${daysLeft} days remaining`}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Features */}
                            <div className="panel">
                                <div className="panel-header">🎁 Your Premium Includes</div>
                                <div className="panel-body">
                                    <div className="features-grid">
                                        {FEATURES.map((f, i) => (
                                            <div key={i} className="feature-item">
                                                <div className="feature-dot" />
                                                {f}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
            </>
        )
    }

    // ── Plan Selection ─────────────────────────────────────────
    return (
        <>
            <style>{css}</style>
            <div className="gcrm-app">
                <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} activeItem={activeItem} setActiveItem={setActiveItem} />

                <div className="gcrm-main">
                    <header className="gcrm-topbar"><span className="topbar-title">CRM</span></header>

                    <main className="gcrm-content">
                        <div>
                            <div className="page-title">Choose Your Plan</div>
                            <div className="page-sub">Unlock premium features with a plan that suits you best</div>
                        </div>

                        {/* Plan Cards */}
                        <div className="plan-cards-grid">
                            {PLANS.map((plan) => {
                                const isSelected = selectedPlan === plan.id
                                return (
                                    <div
                                        key={plan.id}
                                        className={`plan-card${isSelected ? " selected" : ""}`}
                                        onClick={() => setSelectedPlan(plan.id)}
                                        style={{
                                            borderColor: isSelected ? plan.border : "#252525",
                                            background: isSelected ? plan.activeBg : "#161616",
                                            boxShadow: isSelected ? `0 0 0 1px ${plan.border}, 0 8px 24px ${plan.glowColor}` : "none",
                                        }}
                                    >
                                        {plan.badge && (
                                            <div className="plan-badge" style={{ background: plan.darkColor, color: "#fff" }}>
                                                {plan.badge}
                                            </div>
                                        )}

                                        <div className="plan-radio" style={{
                                            borderColor: isSelected ? plan.color : "#2a2a2a",
                                            background: isSelected ? plan.darkColor : "#111",
                                        }}>
                                            {isSelected && <div className="plan-radio-dot" />}
                                        </div>

                                        <div className="plan-label" style={{ color: plan.color }}>{plan.label}</div>

                                        <div className="plan-price">
                                            <span className="plan-price-num">${plan.rate}</span>
                                            <span className="plan-price-per">/ {plan.per}</span>
                                        </div>

                                        <div className="plan-desc">{plan.description}</div>

                                        <hr className="plan-divider" />

                                        <div className="plan-total-box" style={{
                                            borderColor: isSelected ? plan.border : "#1c1c1c",
                                            background: isSelected ? "rgba(0,0,0,0.3)" : "#111",
                                        }}>
                                            <div className="plan-total-label">Total billed</div>
                                            <div className="plan-total-val" style={{ color: plan.color }}>
                                                ${getTotal(plan)}
                                                <span className="plan-total-period">
                                                    {" "}/ {plan.duration === 1 ? "month" : `${plan.duration} months`}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Features */}
                        <div className="panel">
                            <div className="panel-header">🎁 Everything included in all plans</div>
                            <div className="panel-body">
                                <div className="features-grid">
                                    {FEATURES.map((f, i) => (
                                        <div key={i} className="feature-item">
                                            <div className="feature-dot" />
                                            {f}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Order Summary */}
                        {selected ? (
                            <div className="panel" style={{
                                borderColor: selected.border,
                                boxShadow: `0 0 0 1px ${selected.border}`,
                                animation: "fadeIn 0.2s ease",
                            }}>
                                <div className="panel-header">🧾 Order Summary</div>
                                <div className="panel-body">
                                    <div style={{ display: "flex", flexDirection: "column" }}>
                                        {[
                                            { k: "Plan",        v: selected.label },
                                            { k: "Rate",        v: `$${selected.rate} / month` },
                                            { k: "Duration",    v: selected.duration === 1 ? "1 month" : `${selected.duration} months` },
                                            { k: "Calculation", v: `$${selected.rate} × ${selected.duration} = $${getTotal(selected)}` },
                                        ].map(({ k, v }) => (
                                            <div key={k} className="order-row">
                                                <span className="order-key">{k}</span>
                                                <span className="order-val">{v}</span>
                                            </div>
                                        ))}

                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 14, marginTop: 4 }}>
                                            <span style={{ fontWeight: 700, fontSize: 15, color: "#ddd" }}>Total Amount</span>
                                            <span style={{ fontWeight: 800, fontSize: 26, color: selected.color }}>
                                                ${getTotal(selected)}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        className="btn-gcrm btn-primary"
                                        onClick={handleProceed}
                                        style={{
                                            marginTop: 20, width: "100%",
                                            background: selected.darkColor,
                                            padding: "13px", fontSize: 15,
                                            justifyContent: "center",
                                            borderRadius: 10,
                                            boxShadow: `0 4px 20px ${selected.glowColor}`,
                                        }}
                                    >
                                        Proceed to Payment →
                                    </button>

                                    <div style={{ textAlign: "center", marginTop: 10, fontSize: 12, color: "#333" }}>
                                        🔒 Secure payment · You will be redirected to the payment page
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="select-hint">
                                👆 Select a plan above to see your order summary
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </>
    )
}

export default Billing