import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import Cookies from 'js-cookie'

// ── Icons ────────────────────────────────────────────────────
const Icons = {
    Dashboard: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
        </svg>
    ),
    Contacts: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
        </svg>
    ),
    Imports: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
    ),
    Billing: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
            <line x1="1" y1="10" x2="23" y2="10" />
        </svg>
    ),
    Invoices: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
        </svg>
    ),
    Subscriptions: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
        </svg>
    ),
    Payments: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
    ),
    Notifications: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
    ),
    Settings: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
    ),
    Reports: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
    ),
    SignOut: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
    ),
    Documents: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
    ),
};

const ChevronIcon = ({ open }) => (
    <svg
        width="13" height="13" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5"
        style={{ transition: "transform 0.22s ease", transform: open ? "rotate(180deg)" : "rotate(0deg)", flexShrink: 0 }}
    >
        <polyline points="6 9 12 15 18 9" />
    </svg>
);

// ── Nav config ───────────────────────────────────────────────
const NAV_ITEMS = [
    { label: "Dashboard", icon: Icons.Dashboard, path: "/dashboard" },
    { label: "Contacts", icon: Icons.Contacts, path: "/contacts" },
    { label: "Imports", icon: Icons.Imports, path: "/imports" },
    { label: "Reports", icon: Icons.Reports, path: "/reports" },
    { label: ' Billing', icon: Icons.Billing, path: "/billing" },
    {
        label: "Documents",
        icon: Icons.Documents,
        path: null,
        children: [
            { label: "Invoices", icon: Icons.Invoices, path: "/invoices" },
            { label: "Subscriptions", icon: Icons.Subscriptions, path: "/subscriptions" }
        ],
    },
];

const BOTTOM_ITEMS = [
    { label: "Notifications", icon: Icons.Notifications, path: "#" },
    { label: "Settings", icon: Icons.Settings, path: "#" },
    { label: "Sign Out", icon: Icons.SignOut, path: "/signout" },
];

/* ─────────────────────────────────────────
   SIGN-OUT LOADER OVERLAY
───────────────────────────────────────── */
const SignOutLoader = () => (
    <>
        <style>{`
            @keyframes sout-spin {
                0%   { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            @keyframes sout-fade-in {
                from { opacity: 0; }
                to   { opacity: 1; }
            }
            .sout-overlay {
                position: fixed;
                inset: 0;
                z-index: 9999;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 16px;
                background: rgba(10, 10, 15, 0.78);
                backdrop-filter: blur(6px);
                -webkit-backdrop-filter: blur(6px);
                animation: sout-fade-in 0.18s ease forwards;
                cursor: not-allowed;
                user-select: none;
            }
            .sout-spinner {
                width: 48px;
                height: 48px;
                border-radius: 50%;
                border: 3.5px solid rgba(255,255,255,0.12);
                border-top-color: #ff6b6b;
                animation: sout-spin 0.7s linear infinite;
            }
            .sout-text {
                color: #ccc;
                font-size: 14px;
                font-weight: 500;
                letter-spacing: 0.2px;
                font-family: 'DM Sans', 'Segoe UI', sans-serif;
            }
        `}</style>
        <div className="sout-overlay">
            <div className="sout-spinner" />
            <span className="sout-text">Signing you out…</span>
        </div>
    </>
);

// ── Sidebar Component ────────────────────────────────────────
const Sidebar = ({ collapsed, setCollapsed }) => {
    const [openDropdowns, setOpenDropdowns] = useState({});
    const [signingOut, setSigningOut] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const toggleDropdown = (label) =>
        setOpenDropdowns((prev) => ({ ...prev, [label]: !prev[label] }));

    const isActive = (path) => path && location.pathname === path;
    const isChildActive = (children) => children?.some((c) => isActive(c.path));

    const handleNavigate = (path) => {
        if (path !== '/signout') {
            navigate(path);
        } else {
            setSigningOut(true);
            // Small delay so the loader is visible before clearing & redirecting
            setTimeout(() => {
                localStorage.clear();
                Cookies.remove('accessToken');
                Cookies.remove('refreshToken');
                navigate('/');
            }, 1200);
        }
    };

    const renderItem = (item, idx) => {
        const active = isActive(item.path);
        const hasChildren = item.children?.length > 0;
        const isOpen = !!openDropdowns[item.label];
        const childActive = isChildActive(item.children);

        if (hasChildren) {
            if (collapsed) {
                return (
                    <OverlayTrigger key={idx} placement="right" overlay={<Tooltip id={`tip-${item.label}`}>{item.label}</Tooltip>}>
                        <button
                            onClick={() => handleNavigate(item.path)}
                            className={`snav-btn d-flex align-items-center justify-content-center px-0 py-2 rounded-2 mb-1 w-100 ${active || childActive ? "active" : ""}`}
                        >
                            <span className="snav-icon">{item.icon}</span>
                        </button>
                    </OverlayTrigger>
                );
            }

            return (
                <div key={idx}>
                    <button
                        onClick={() => toggleDropdown(item.label)}
                        className={`snav-btn d-flex align-items-center gap-3 px-3 py-2 rounded-2 mb-1 w-100 ${active || childActive ? "active" : ""}`}
                    >
                        <span className="snav-icon flex-shrink-0">{item.icon}</span>
                        <span className="snav-label d-flex align-items-center justify-content-between w-100">
                            {item.label}
                            <ChevronIcon open={isOpen} />
                        </span>
                    </button>

                    <div
                        style={{
                            maxHeight: isOpen ? `${item.children.length * 42}px` : "0px",
                            overflow: "hidden",
                            transition: "max-height 0.25s cubic-bezier(0.4,0,0.2,1)",
                        }}
                    >
                        {item.children.map((child, cidx) => {
                            const cActive = isActive(child.path);
                            return (
                                <button
                                    key={cidx}
                                    onClick={() => handleNavigate(child.path)}
                                    className={`snav-child d-flex align-items-center gap-2 w-100 ${cActive ? "active" : ""}`}
                                >
                                    <span className="child-track">
                                        <span className="child-bullet" />
                                    </span>
                                    <span className="child-icon">{child.icon}</span>
                                    <span className="child-label">{child.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            );
        }

        // Plain item
        const btn = (
            <button
                onClick={() => handleNavigate(item.path)}
                className={`snav-btn d-flex align-items-center gap-3 px-3 py-2 rounded-2 mb-1 w-100 ${active ? "active" : ""}`}
            >
                <span className="snav-icon flex-shrink-0">{item.icon}</span>
                {!collapsed && <span className="snav-label">{item.label}</span>}
            </button>
        );

        if (collapsed) {
            return (
                <OverlayTrigger key={idx} placement="right" overlay={<Tooltip id={`tip-${item.label}`}>{item.label}</Tooltip>}>
                    {btn}
                </OverlayTrigger>
            );
        }
        return <div key={idx}>{btn}</div>;
    };

    return (
        <>
            {/* ── Sign-out blocking loader ── */}
            {signingOut && <SignOutLoader />}

            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

        .gcrm-sidebar {
          position: fixed;
          top: 0; left: 0;
          height: 100vh;
          width: ${collapsed ? "64px" : "236px"};
          background: #141414;
          border-right: 1px solid #222;
          display: flex;
          flex-direction: column;
          transition: width 0.28s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
          flex-shrink: 0;
          font-family: 'DM Sans', 'Segoe UI', sans-serif;
          z-index: 100;
        }

        .sidebar-header {
          display: flex;
          align-items: center;
          justify-content: ${collapsed ? "center" : "space-between"};
          padding: ${collapsed ? "17px 0" : "17px 14px"};
          border-bottom: 1px solid #222;
          min-height: 64px;
        }
        .sidebar-logo {
          font-size: 14.5px; font-weight: 700; color: #f0f0f0;
          letter-spacing: -0.3px; white-space: nowrap;
          opacity: ${collapsed ? 0 : 1};
          max-width: ${collapsed ? "0" : "180px"};
          transition: opacity 0.2s, max-width 0.28s;
          overflow: hidden;
        }
        .sidebar-toggle {
          background: none; border: none; color: #555;
          cursor: pointer; padding: 6px; border-radius: 6px;
          display: flex; align-items: center;
          transition: color 0.15s, background 0.15s; flex-shrink: 0;
        }
        .sidebar-toggle:hover { color: #eee; background: #222; }

        .sidebar-nav-area {
          padding: 10px 8px; flex: 1;
          overflow-y: auto; overflow-x: hidden;
          scrollbar-width: thin; scrollbar-color: #2a2a2a transparent;
        }

        .snav-btn {
          border: none !important; background: none !important;
          color: #7a7a7a; font-size: 13.5px; font-weight: 500;
          white-space: nowrap; text-align: left; cursor: pointer;
          transition: color 0.15s, background 0.15s;
          justify-content: ${collapsed ? "center" : ""};
        }
        .snav-btn:hover { color: #eee; background: #1d1d1d !important; }
        .snav-btn.active { color: #f0f0f0; background: #232323 !important; }
        .snav-icon { color: inherit; display: flex; align-items: center; }
        .snav-label { color: inherit; }

        .snav-child {
          border: none !important; background: none !important;
          color: #5e5e5e; font-size: 13px; font-weight: 500;
          padding: 8px 10px 8px 4px; border-radius: 7px;
          margin-bottom: 1px; cursor: pointer; text-align: left;
          white-space: nowrap; transition: color 0.15s, background 0.15s; width: 100%;
        }
        .snav-child:hover { color: #d0d0d0; background: #1c1c1c !important; }
        .snav-child.active { color: #e8e8e8; background: #1f1f1f !important; }

        .child-track { width: 32px; flex-shrink: 0; display: flex; justify-content: center; align-items: center; }
        .child-bullet { width: 5px; height: 5px; border-radius: 50%; background: #333; transition: background 0.15s; }
        .snav-child.active .child-bullet { background: #5b6ef5; }
        .snav-child:hover .child-bullet { background: #555; }
        .child-icon { color: inherit; opacity: 0.7; display: flex; align-items: center; }
        .child-label { font-size: 13px; }

        .sidebar-bottom { padding: 6px 8px 16px; }
        .sidebar-divider { border-color: #222; margin: 4px 2px; }
      `}</style>

            <aside className="gcrm-sidebar">
                {/* Header */}
                <div className="sidebar-header">
                    {!collapsed && <span className="sidebar-logo">CRM</span>}
                    <button
                        className="sidebar-toggle"
                        onClick={() => {
                            if (!collapsed) setOpenDropdowns({});
                            setCollapsed(!collapsed);
                        }}
                        aria-label="Toggle sidebar"
                    >
                        {collapsed ? (
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
                            </svg>
                        ) : (
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="15 18 9 12 15 6" />
                            </svg>
                        )}
                    </button>
                </div>

                {/* Main Nav */}
                <div className="sidebar-nav-area">
                    {NAV_ITEMS.map((item, idx) => renderItem(item, idx))}
                </div>

                {/* Bottom Nav */}
                <div className="sidebar-bottom">
                    <hr className="sidebar-divider" />
                    {BOTTOM_ITEMS.map((item, idx) => {
                        const active = isActive(item.path);
                        const btn = (
                            <button
                                onClick={() => handleNavigate(item.path)}
                                className={`snav-btn d-flex align-items-center gap-3 px-3 py-2 rounded-2 mb-1 w-100 ${active ? "active" : ""}`}
                            >
                                <span className="snav-icon flex-shrink-0">{item.icon}</span>
                                {!collapsed && <span className="snav-label">{item.label}</span>}
                            </button>
                        );
                        if (collapsed) {
                            return (
                                <OverlayTrigger key={idx} placement="right" overlay={<Tooltip id={`tip-bot-${idx}`}>{item.label}</Tooltip>}>
                                    {btn}
                                </OverlayTrigger>
                            );
                        }
                        return <div key={idx}>{btn}</div>;
                    })}
                </div>
            </aside>
        </>
    );
}

export default Sidebar