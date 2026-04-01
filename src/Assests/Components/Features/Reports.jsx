import { useEffect, useState } from "react"
import Sidebar from "../Sidebar/Sidebar"
import checkSubscription from "../../Utils/CheckSubscription"

const Reports = () => {
    const [collapsed, setCollapsed] = useState(false)
    const [activeItem, setActiveItem] = useState("Reports")
    const [paymentDone, setPaymentDone] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const getData = async () => {
            const value = await checkSubscription()
            setPaymentDone(value.isPremium)
            setLoading(false)
        }
        getData()
    }, [])

    const css = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body, #root { height: 100%; background: #0e0e0e; }

    @keyframes spin    { to { transform: rotate(360deg); } }
    @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:0.4} }
    @keyframes fadeIn  { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
    @keyframes float   {
        0%,100% { transform: translateY(0px); }
        50%     { transform: translateY(-10px); }
    }

    .gcrm-app  { min-height: 100vh; background: #0e0e0e; font-family: 'DM Sans', sans-serif; color: #e8e8e8; }

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
        padding: 0 24px; flex-shrink: 0;
    }
    .topbar-title { font-size: 17px; font-weight: 700; color: #f5f5f5; letter-spacing: -0.3px; }

    .gcrm-content { flex: 1; padding: 28px; display: flex; flex-direction: column; gap: 20px; }

    .page-title { font-size: 22px; font-weight: 700; color: #f0f0f0; letter-spacing: -0.4px; }
    .page-sub   { font-size: 13.5px; color: #555; margin-top: 4px; }

    /* Premium gate */
    .premium-gate  { display: flex; align-items: center; justify-content: center; flex: 1; padding: 40px 20px; }
    .premium-card  { background: #161616; border: 1px solid #252525; border-radius: 16px; padding: 48px 40px; max-width: 420px; width: 100%; text-align: center; }
    .premium-icon  { font-size: 52px; margin-bottom: 20px; }
    .premium-title { font-size: 20px; font-weight: 700; color: #f0f0f0; margin-bottom: 10px; }
    .premium-desc  { font-size: 14px; color: #555; line-height: 1.65; margin-bottom: 28px; }

    .btn-primary {
        display: inline-flex; align-items: center; gap: 7px;
        background: #3b5bdb; color: #fff; border: none;
        border-radius: 8px; padding: 10px 28px;
        font-size: 14px; font-weight: 600; cursor: pointer;
        font-family: 'DM Sans', sans-serif;
        transition: background 0.15s, transform 0.1s;
    }
    .btn-primary:hover { background: #3451c7; transform: translateY(-1px); }
    .btn-primary:active { transform: translateY(0); }

    /* Coming soon card */
    .coming-card {
        background: #161616; border: 1px solid #252525; border-radius: 14px;
        flex: 1; display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        text-align: center; gap: 18px; padding: 80px 40px;
        animation: fadeIn 0.35s ease both;
        position: relative; overflow: hidden;
    }
    .coming-card::before {
        content: '';
        position: absolute; inset: 0;
        background: radial-gradient(ellipse at 50% 0%, rgba(59,91,219,0.06) 0%, transparent 65%);
        pointer-events: none;
    }
    .coming-icon {
        font-size: 64px; line-height: 1;
        animation: float 3.5s ease-in-out infinite;
        filter: drop-shadow(0 8px 24px rgba(59,91,219,0.25));
    }
    .coming-title {
        font-size: 22px; font-weight: 700; color: #f0f0f0;
        letter-spacing: -0.4px; max-width: 480px; line-height: 1.3;
    }
    .coming-desc {
        font-size: 14px; color: #555; max-width: 460px; line-height: 1.75;
    }
    .coming-badge {
        background: rgba(59,91,219,0.12); border: 1px solid rgba(59,91,219,0.25);
        border-radius: 10px; padding: 11px 22px;
        font-size: 13px; color: #7da4f5; font-weight: 600;
        display: flex; align-items: center; gap: 8px; margin-top: 4px;
    }
    .coming-dots {
        display: flex; gap: 10px; margin-top: 4px;
    }
    .coming-dot {
        width: 8px; height: 8px; border-radius: 50%;
        background: #252525;
    }
    .coming-dot.active { background: #3b5bdb; }
    `

    // ── Loading ────────────────────────────────────────────────
    if (loading) {
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

    // ── Premium gate ───────────────────────────────────────────
    if (!paymentDone) {
        return (
            <>
                <style>{css}</style>
                <div className="gcrm-app">
                    <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} activeItem={activeItem} setActiveItem={setActiveItem} />
                    <div className="gcrm-main">
                        <header className="gcrm-topbar"><span className="topbar-title">CRM</span></header>
                        <div className="premium-gate">
                            <div className="premium-card">
                                <div className="premium-icon">🔒</div>
                                <div className="premium-title">Premium Feature</div>
                                <div className="premium-desc">
                                    You are not a premium user, so you cannot use this feature.
                                    Upgrade your plan to access detailed reports.
                                </div>
                                <button className="btn-primary" onClick={() => window.location.href = "/billing"}>
                                    ⚡ Upgrade to Premium
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )
    }

    // ── Main ───────────────────────────────────────────────────
    return (
        <>
            <style>{css}</style>
            <div className="gcrm-app">
                <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} activeItem={activeItem} setActiveItem={setActiveItem} />

                <div className="gcrm-main">
                    <header className="gcrm-topbar">
                        <span className="topbar-title">CRM</span>
                    </header>

                    <main className="gcrm-content">
                        {/* Heading */}
                        <div>
                            <div className="page-title">Reports</div>
                            <div className="page-sub">Generate and export finalized reports for your selected tenure</div>
                        </div>

                        {/* Coming Soon */}
                        <div className="coming-card">
                            <div className="coming-icon">📊</div>

                            <div className="coming-title">
                                Finalize Report from the Selected Tenure
                            </div>

                            <div className="coming-desc">
                                You will be able to select a tenure period and generate a finalized
                                report with all contact activity, status summaries, and performance
                                insights — all in one place.
                            </div>

                            <div className="coming-badge">
                                🚧 &nbsp; This feature is coming soon. Stay tuned!
                            </div>

                            <div className="coming-dots">
                                <div className="coming-dot active" />
                                <div className="coming-dot" />
                                <div className="coming-dot" />
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </>
    )
}

export default Reports