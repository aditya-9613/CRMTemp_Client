import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";
import axios from "axios";
import * as XLSX from "xlsx";
import { baseURL } from "../../Utils/baseURL";
import checkSubscription from "../../Utils/CheckSubscription";

// ─── Constants ────────────────────────────────────────────────
const STATUS_CONFIG = {
    NEW: { label: "New", bg: "rgba(34,197,94,0.15)", color: "#4ade80", border: "rgba(34,197,94,0.3)" },
    CONNECTED: { label: "Connected", bg: "rgba(59,130,246,0.15)", color: "#60a5fa", border: "rgba(59,130,246,0.3)" },
    PENDING: { label: "Pending", bg: "rgba(234,179,8,0.15)", color: "#facc15", border: "rgba(234,179,8,0.3)" },
    IN_PROGRESS: { label: "In Progress", bg: "rgba(134,239,172,0.1)", color: "#86efac", border: "rgba(134,239,172,0.25)" },
    COMPLETED: { label: "Completed", bg: "rgba(186,230,253,0.1)", color: "#7dd3fc", border: "rgba(186,230,253,0.2)" },
    REJECTED: { label: "Rejected", bg: "rgba(239,68,68,0.15)", color: "#f87171", border: "rgba(239,68,68,0.3)" },
    ARCHIVED: { label: "Archived", bg: "rgba(156,163,175,0.15)", color: "#9ca3af", border: "rgba(156,163,175,0.3)" },
};

const AVATAR_COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6", "#f59e0b", "#6366f1", "#10b981"];

// ─── Helpers ──────────────────────────────────────────────────
function getInitials(name = "") {
    return name.split(" ").filter(Boolean).map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function formatDate(iso) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function getProfileHref(url) {
    if (!url) return "#";
    return url.startsWith("http") ? url : `https://${url}`;
}

// ─── Sub-components ───────────────────────────────────────────
function Avatar({ name, index, size = 34 }) {
    return (
        <div style={{
            width: size, height: size, borderRadius: "50%",
            background: AVATAR_COLORS[index % AVATAR_COLORS.length],
            color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, fontSize: size * 0.35, flexShrink: 0,
        }}>
            {getInitials(name)}
        </div>
    );
}

function StatusBadge({ status }) {
    const s = STATUS_CONFIG[status] || { label: status || "—", bg: "#1e1e1e", color: "#888", border: "#333" };
    return (
        <span style={{
            background: s.bg, color: s.color,
            border: `1px solid ${s.border}`,
            padding: "2px 10px", borderRadius: 20,
            fontSize: 11, fontWeight: 600, whiteSpace: "nowrap",
        }}>
            {s.label}
        </span>
    );
}

function SourceBadge({ source }) {
    return (
        <span style={{
            background: "rgba(99,102,241,0.15)", color: "#818cf8",
            border: "1px solid rgba(99,102,241,0.3)",
            padding: "2px 10px", borderRadius: 20,
            fontSize: 11, fontWeight: 600,
        }}>
            {source || "—"}
        </span>
    );
}

// ─── Full-page loader overlay ─────────────────────────────────
function PageLoader() {
    return (
        <div style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(14,14,14,0.92)",
            backdropFilter: "blur(6px)",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 16,
        }}>
            <div style={{
                width: 48, height: 48,
                border: "3px solid #252525",
                borderTop: "3px solid #3b5bdb",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
            }} />
            <p style={{ color: "#3b5bdb", fontWeight: 600, fontSize: 14, letterSpacing: 0.3 }}>
                Loading...
            </p>
        </div>
    );
}

// ─── Inline spinner (for table loading) ──────────────────────
function InlineSpinner({ text = "Fetching contacts..." }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 0", gap: 14 }}>
            <div style={{
                width: 36, height: 36, border: "3px solid #252525",
                borderTop: "3px solid #3b5bdb", borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
            }} />
            <span style={{ color: "#555", fontSize: 13 }}>{text}</span>
        </div>
    );
}

// ─── Premium Gate ─────────────────────────────────────────────
function PremiumGate({ onUpgrade }) {
    return (
        <div style={{
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            minHeight: "calc(100vh - 64px)", padding: "40px 20px",
        }}>
            {/* Ambient glow */}
            <div style={{
                position: "absolute", width: 420, height: 420,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(59,91,219,0.08) 0%, transparent 70%)",
                pointerEvents: "none",
            }} />

            <div style={{
                background: "#161616",
                border: "1px solid #252525",
                borderRadius: 20,
                padding: "48px 40px",
                maxWidth: 440, width: "100%",
                textAlign: "center",
                position: "relative",
                zIndex: 1,
                boxShadow: "0 0 0 1px #1e1e1e, 0 32px 64px rgba(0,0,0,0.5)",
                animation: "fadeIn 0.35s ease",
            }}>
                {/* Top accent bar */}
                <div style={{
                    position: "absolute", top: 0, left: "50%",
                    transform: "translateX(-50%)",
                    width: 80, height: 3,
                    background: "linear-gradient(90deg, transparent, #3b5bdb, transparent)",
                    borderRadius: "0 0 4px 4px",
                }} />

                {/* Lock icon with ring */}
                <div style={{
                    width: 72, height: 72, borderRadius: "50%",
                    background: "rgba(59,91,219,0.1)",
                    border: "1px solid rgba(59,91,219,0.25)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 24px",
                    fontSize: 30,
                }}>
                    🔒
                </div>

                <div style={{ fontSize: 20, fontWeight: 700, color: "#f0f0f0", marginBottom: 10, letterSpacing: -0.4 }}>
                    Premium Feature
                </div>
                <div style={{ fontSize: 14, color: "#555", lineHeight: 1.7, marginBottom: 32 }}>
                    The <strong style={{ color: "#888" }}>Contacts</strong> page is available for premium users only.
                    Upgrade your plan to manage, export, and recover your full contact list.
                </div>

                {/* Feature list */}
                <div style={{
                    background: "#121212", border: "1px solid #1e1e1e",
                    borderRadius: 10, padding: "16px 20px", marginBottom: 28, textAlign: "left",
                }}>
                    {[
                        ["📋", "View all your contacts in one place"],
                        ["📥", "Export contacts to Excel"],
                        ["♻️", "Recover deleted contacts"],
                        ["🔍", "Filter by status, source & more"],
                    ].map(([icon, text]) => (
                        <div key={text} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: "1px solid #1a1a1a" }}>
                            <span style={{ fontSize: 15 }}>{icon}</span>
                            <span style={{ fontSize: 13, color: "#666" }}>{text}</span>
                        </div>
                    ))}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0" }}>
                        <span style={{ fontSize: 15 }}>🏷️</span>
                        <span style={{ fontSize: 13, color: "#666" }}>Status & source tagging</span>
                    </div>
                </div>

                <button
                    onClick={onUpgrade}
                    style={{
                        width: "100%", padding: "12px 24px",
                        background: "linear-gradient(135deg, #3b5bdb, #4f46e5)",
                        color: "#fff", border: "none", borderRadius: 10,
                        fontSize: 14, fontWeight: 700, cursor: "pointer",
                        letterSpacing: 0.2,
                        boxShadow: "0 4px 20px rgba(59,91,219,0.35)",
                        transition: "transform 0.15s, box-shadow 0.15s",
                    }}
                    onMouseEnter={e => { e.target.style.transform = "translateY(-1px)"; e.target.style.boxShadow = "0 6px 24px rgba(59,91,219,0.5)"; }}
                    onMouseLeave={e => { e.target.style.transform = ""; e.target.style.boxShadow = "0 4px 20px rgba(59,91,219,0.35)"; }}
                >
                    ⚡ Upgrade to Premium
                </button>

                <p style={{ marginTop: 16, fontSize: 12, color: "#3a3a3a" }}>
                    Unlock all features with a single upgrade
                </p>
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────
const Contacts = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [activeItem, setActiveItem] = useState("Contacts");

    const [paymentDone, setPaymentDone] = useState(false);
    const [loading, setLoading] = useState(true);

    const [showDeleted, setShowDeleted] = useState(false);
    const [deletedContacts, setDeletedContacts] = useState([]);
    const [deletedLoading, setDeletedLoading] = useState(false);

    const [showAllContacts, setShowAllContacts] = useState(false);
    const [allContacts, setAllContacts] = useState([]);
    const [allContactsLoading, setAllContactsLoading] = useState(false);

    // ── Fetch deleted contacts ─────────────────────────────────
    const getDeletedValues = async () => {
        setDeletedLoading(true);
        try {
            const res = await axios({
                url: `${baseURL}/api/v1/contact/getDeletedContact`,
                method: "GET",
                withCredentials: true,
                headers: { Authorization: `Bearer ${localStorage.getItem("user")}` },
            });
            setDeletedContacts(res.data.data.findContacts || []);
        } catch (err) {
            const code = err?.response?.status;
            if (code === 404) setDeletedContacts([]);
            else if (code === 403) setPaymentDone(false);
        } finally {
            setDeletedLoading(false);
        }
    };

    // ── Fetch all contacts ─────────────────────────────────────
    const handleGetAllContacts = async () => {
        setAllContactsLoading(true);
        setShowAllContacts(true);
        try {
            const res = await axios({
                url: `${baseURL}/api/v1/contact/getContact`,
                method: "GET",
                withCredentials: true,
                headers: { Authorization: `Bearer ${localStorage.getItem("user")}` },
            });
            setAllContacts(res.data.data.data || []);
        } catch (err) {
            const code = err?.response?.status;
            if (code === 403) setPaymentDone(false);
        } finally {
            setAllContactsLoading(false);
        }
    };

    // ── Export Excel ───────────────────────────────────────────
    const handleExportExcel = () => {
        if (!allContacts.length) return alert("No contacts to export. Load contacts first.");
        const exportData = allContacts.map((c) => ({
            Name: c.name || "—",
            Email: c.email || "—",
            Phone: c.phone || "—",
            Company: c.company || "—",
            Designation: c.designation || "—",
            Source: c.source || "—",
            Status: STATUS_CONFIG[c.status]?.label || c.status || "—",
            LinkedIn: c.profileURL || "—",
            Date: formatDate(c.updatedAt),
        }));
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        worksheet["!cols"] = Object.keys(exportData[0]).map((key) => ({
            wch: Math.max(key.length, ...exportData.map((r) => String(r[key]).length)) + 2,
        }));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "All Details");
        XLSX.writeFile(workbook, "All Details.xlsx");
    };

    // ── Retrieve deleted contact ───────────────────────────────
    const handleRetrieve = async (contact) => {
        const message = prompt(`Enter a message before retrieving "${contact.name}"`);
        if (message === null) return;
        try {
            const res = await axios({
                url: `${baseURL}/api/v1/contact/reteriveContact`,
                method: "PUT",
                data: { uid: contact.uid, message },
                withCredentials: true,
                headers: { Authorization: `Bearer ${localStorage.getItem("user")}` },
            });
            if (res.status === 200) {
                alert("Contact Retrieved Successfully");
                window.location.reload();
            }
        } catch (err) {
            alert("Failed to retrieve contact");
        }
    };

    useEffect(() => {
        const init = async () => {
            const value = await checkSubscription();
            setPaymentDone(value.isPremium);
            setLoading(false);
        };
        init();
        getDeletedValues();
    }, []);

    // ─── CSS ──────────────────────────────────────────────────
    const css = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Mono:wght@400;500&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body, #root { height: 100%; background: #0e0e0e; }

    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideDown { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
    @keyframes shimmer {
        0% { background-position: -400px 0; }
        100% { background-position: 400px 0; }
    }

    .contacts-app { min-height: 100vh; background: #0e0e0e; font-family: 'DM Sans', sans-serif; color: #e8e8e8; }

    .contacts-main {
        margin-left: var(--sidebar-w, 236px);
        transition: margin-left 0.28s cubic-bezier(0.4,0,0.2,1);
        min-height: 100vh; display: flex; flex-direction: column;
    }

    /* ── Topbar ── */
    .contacts-topbar {
        position: sticky; top: 0; z-index: 99;
        height: 64px; background: rgba(20,20,20,0.95);
        backdrop-filter: blur(12px);
        border-bottom: 1px solid #1e1e1e;
        display: flex; align-items: center;
        justify-content: space-between;
        padding: 0 28px; gap: 16px; flex-shrink: 0;
    }
    .topbar-left { display: flex; flex-direction: column; gap: 1px; }
    .topbar-title { font-size: 16px; font-weight: 700; color: #f0f0f0; letter-spacing: -0.3px; }
    .topbar-breadcrumb { font-size: 11px; color: #3a3a3a; letter-spacing: 0.3px; }

    /* ── Content ── */
    .contacts-content { flex: 1; padding: 32px 28px; }

    /* ── Page heading ── */
    .page-heading { margin-bottom: 28px; }
    .page-title { font-size: 24px; font-weight: 700; color: #f0f0f0; letter-spacing: -0.5px; line-height: 1.2; }
    .page-sub { font-size: 13.5px; color: #444; margin-top: 5px; }

    /* ── Premium badge on heading ── */
    .premium-pill {
        display: inline-flex; align-items: center; gap: 5px;
        background: linear-gradient(135deg, rgba(59,91,219,0.2), rgba(79,70,229,0.15));
        border: 1px solid rgba(59,91,219,0.3);
        color: #7da4f5; font-size: 10px; font-weight: 700;
        padding: 3px 9px; border-radius: 20px; letter-spacing: 0.5px;
        text-transform: uppercase; vertical-align: middle; margin-left: 10px;
    }

    /* ── Panel ── */
    .panel {
        background: #141414;
        border: 1px solid #1e1e1e;
        border-radius: 14px;
        overflow: hidden;
        animation: fadeIn 0.3s ease;
        margin-bottom: 20px;
    }
    .panel-header {
        padding: 16px 22px;
        border-bottom: 1px solid #1a1a1a;
        display: flex; align-items: center; justify-content: space-between;
        gap: 12px;
        background: #161616;
    }
    .panel-title { font-size: 13px; font-weight: 700; color: #ccc; letter-spacing: -0.1px; }
    .panel-count {
        font-size: 11px; color: #3a3a3a; font-weight: 500;
        background: #1a1a1a; border: 1px solid #252525;
        padding: 2px 8px; border-radius: 20px;
    }

    /* ── Buttons ── */
    .btn {
        display: inline-flex; align-items: center; gap: 7px;
        border: none; border-radius: 8px; padding: 9px 16px;
        font-size: 13px; font-weight: 600; cursor: pointer;
        font-family: 'DM Sans', sans-serif;
        transition: all 0.15s ease;
        white-space: nowrap; letter-spacing: -0.1px;
    }
    .btn:hover { transform: translateY(-1px); }
    .btn:active { transform: translateY(0); }
    .btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none !important; }

    .btn-primary {
        background: linear-gradient(135deg, #3b5bdb, #4f46e5);
        color: #fff;
        box-shadow: 0 2px 12px rgba(59,91,219,0.3);
    }
    .btn-primary:hover { box-shadow: 0 4px 18px rgba(59,91,219,0.45); }

    .btn-success {
        background: rgba(34,197,94,0.12); color: #4ade80;
        border: 1px solid rgba(34,197,94,0.25);
    }
    .btn-success:hover { background: rgba(34,197,94,0.2); }

    .btn-danger {
        background: rgba(239,68,68,0.1); color: #f87171;
        border: 1px solid rgba(239,68,68,0.2);
    }
    .btn-danger:hover { background: rgba(239,68,68,0.18); }

    .btn-ghost {
        background: #1c1c1c; color: #888;
        border: 1px solid #282828;
    }
    .btn-ghost:hover { background: #222; color: #ccc; border-color: #333; }

    .btn-retrieve {
        background: transparent; color: #4ade80;
        border: 1px solid rgba(34,197,94,0.3);
        padding: 5px 12px; font-size: 12px; border-radius: 7px;
    }
    .btn-retrieve:hover { background: rgba(34,197,94,0.1); }

    /* ── Table ── */
    .table-wrap { overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
    .data-table thead th {
        background: #111; color: #3a3a3a; font-size: 10.5px; font-weight: 700;
        text-transform: uppercase; letter-spacing: 0.8px;
        padding: 11px 16px; border-bottom: 1px solid #1a1a1a; text-align: left;
        white-space: nowrap;
    }
    .data-table tbody td {
        padding: 13px 16px; border-bottom: 1px solid #171717;
        color: #aaa; vertical-align: middle;
    }
    .data-table tbody tr:last-child td { border-bottom: none; }
    .data-table tbody tr { transition: background 0.12s; }
    .data-table tbody tr:hover td { background: #161616; }

    .td-mono { font-family: 'DM Mono', monospace; font-size: 12px; color: #666; }
    .td-num { color: #333; font-size: 12px; font-family: 'DM Mono', monospace; }
    .td-name { font-weight: 600; color: #e0e0e0; }
    .td-muted { color: #444; }
    .td-link { color: #7da4f5; font-size: 13px; font-weight: 600; text-decoration: none; }
    .td-link:hover { color: #93b4f8; text-decoration: underline; }

    /* ── Empty state ── */
    .empty-state {
        display: flex; flex-direction: column; align-items: center;
        justify-content: center; padding: 56px 20px; gap: 8px;
        animation: fadeIn 0.3s ease;
    }
    .empty-icon { font-size: 36px; line-height: 1; opacity: 0.6; }
    .empty-title { font-size: 14px; font-weight: 600; color: #3a3a3a; }
    .empty-sub { font-size: 12.5px; color: #2e2e2e; text-align: center; }
    .empty-sub strong { color: #555; }

    /* ── Skeleton shimmer rows ── */
    .skeleton-row td { padding: 14px 16px; border-bottom: 1px solid #171717; }
    .skeleton-bar {
        height: 12px; border-radius: 6px;
        background: linear-gradient(90deg, #1a1a1a 25%, #222 50%, #1a1a1a 75%);
        background-size: 400px 100%;
        animation: shimmer 1.4s infinite;
    }
    `;

    // ─── Loading overlay ──────────────────────────────────────
    if (loading) {
        return (
            <>
                <style>{css}</style>
                <div className="contacts-app">
                    <Sidebar
                        collapsed={collapsed} setCollapsed={setCollapsed}
                        activeItem={activeItem} setActiveItem={setActiveItem}
                    />
                    <div className="contacts-main" style={{ "--sidebar-w": collapsed ? "64px" : "236px" }}>
                        <header className="contacts-topbar">
                            <div className="topbar-left">
                                <span className="topbar-title">CRM</span>
                                <span className="topbar-breadcrumb">Contacts</span>
                            </div>
                        </header>
                        <PageLoader />
                    </div>
                </div>
            </>
        );
    }

    // ─── Premium gate ─────────────────────────────────────────
    if (!paymentDone) {
        return (
            <>
                <style>{css}</style>
                <div className="contacts-app">
                    <Sidebar
                        collapsed={collapsed} setCollapsed={setCollapsed}
                        activeItem={activeItem} setActiveItem={setActiveItem}
                    />
                    <div className="contacts-main" style={{ "--sidebar-w": collapsed ? "64px" : "236px" }}>
                        <header className="contacts-topbar">
                            <div className="topbar-left">
                                <span className="topbar-title">CRM</span>
                                <span className="topbar-breadcrumb">Contacts</span>
                            </div>
                        </header>
                        <PremiumGate onUpgrade={() => window.location.href = "/billing"} />
                    </div>
                </div>
            </>
        );
    }

    // ─── Main (premium) render ────────────────────────────────
    return (
        <>
            <style>{css}</style>
            <div className="contacts-app">
                <Sidebar
                    collapsed={collapsed} setCollapsed={setCollapsed}
                    activeItem={activeItem} setActiveItem={setActiveItem}
                />

                <div className="contacts-main" style={{ "--sidebar-w": collapsed ? "64px" : "236px" }}>
                    {/* Topbar */}
                    <header className="contacts-topbar">
                        <div className="topbar-left">
                            <span className="topbar-title">CRM</span>
                            <span className="topbar-breadcrumb">Contacts</span>
                        </div>
                        <button
                            className={`btn ${showDeleted ? "btn-danger" : "btn-ghost"}`}
                            onClick={() => setShowDeleted((v) => !v)}
                        >
                            🗑️ {showDeleted ? "Hide Deleted" : "View Deleted Contacts"}
                        </button>
                    </header>

                    {/* Content */}
                    <main className="contacts-content">

                        {/* Page heading */}
                        <div className="page-heading">
                            <div className="page-title">
                                Contacts
                                <span className="premium-pill">⚡ Premium</span>
                            </div>
                            <div className="page-sub">Manage your contacts and recover deleted ones</div>
                        </div>

                        {/* ── Deleted Contacts Panel ── */}
                        {showDeleted && (
                            <div className="panel" style={{ borderColor: "rgba(239,68,68,0.15)" }}>
                                <div className="panel-header">
                                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                        <span className="panel-title" style={{ color: "#f87171" }}>🗑️ Deleted Contacts</span>
                                        {!deletedLoading && (
                                            <span className="panel-count">{deletedContacts.length} record{deletedContacts.length !== 1 ? "s" : ""}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="table-wrap">
                                    {deletedLoading ? (
                                        <InlineSpinner text="Loading deleted contacts..." />
                                    ) : (
                                        <table className="data-table">
                                            <thead>
                                                <tr>
                                                    <th>Contact</th>
                                                    <th>Email</th>
                                                    <th>Phone</th>
                                                    <th>Company</th>
                                                    <th>Designation</th>
                                                    <th>Source</th>
                                                    <th>LinkedIn</th>
                                                    <th>Deleted On</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {deletedContacts.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={9}>
                                                            <div className="empty-state">
                                                                <div className="empty-icon">🗂️</div>
                                                                <div className="empty-title">No deleted contacts</div>
                                                                <div className="empty-sub">Deleted contacts will appear here</div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    deletedContacts.map((contact, i) => (
                                                        <tr key={contact.uid}>
                                                            <td>
                                                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                                    <Avatar name={contact.name} index={i} />
                                                                    <span className="td-name">{contact.name}</span>
                                                                </div>
                                                            </td>
                                                            <td className="td-mono">{contact.email || "—"}</td>
                                                            <td className="td-mono">{contact.phone || "—"}</td>
                                                            <td>{contact.company || "—"}</td>
                                                            <td className="td-muted">{contact.designation || "—"}</td>
                                                            <td><SourceBadge source={contact.source} /></td>
                                                            <td>
                                                                {contact.profileURL
                                                                    ? <a href={getProfileHref(contact.profileURL)} target="_blank" rel="noreferrer" className="td-link">🔗 View</a>
                                                                    : <span className="td-muted">—</span>}
                                                            </td>
                                                            <td className="td-muted">{formatDate(contact.updatedAt)}</td>
                                                            <td>
                                                                <button className="btn btn-retrieve" onClick={() => handleRetrieve(contact)}>
                                                                    ♻️ Retrieve
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ── All Contacts Panel ── */}
                        <div className="panel">
                            <div className="panel-header">
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <span className="panel-title">📋 All Contacts</span>
                                    {allContacts.length > 0 && (
                                        <span className="panel-count">{allContacts.length} total</span>
                                    )}
                                </div>
                                <div style={{ display: "flex", gap: 10 }}>
                                    <button
                                        className="btn btn-ghost"
                                        onClick={handleGetAllContacts}
                                        disabled={allContactsLoading}
                                    >
                                        {allContactsLoading ? (
                                            <>
                                                <div style={{
                                                    width: 12, height: 12,
                                                    border: "2px solid #333",
                                                    borderTop: "2px solid #3b5bdb",
                                                    borderRadius: "50%",
                                                    animation: "spin 0.8s linear infinite",
                                                    flexShrink: 0,
                                                }} />
                                                Loading...
                                            </>
                                        ) : "📂 Get All Contacts"}
                                    </button>
                                    <button
                                        className="btn btn-success"
                                        onClick={handleExportExcel}
                                        disabled={!allContacts.length}
                                    >
                                        📥 Export Excel
                                    </button>
                                </div>
                            </div>

                            {/* Table area */}
                            {showAllContacts ? (
                                <div className="table-wrap">
                                    {allContactsLoading ? (
                                        // Skeleton shimmer rows
                                        <table className="data-table">
                                            <thead>
                                                <tr>
                                                    {["#", "Contact", "Email", "Phone", "Company", "Designation", "Source", "Status", "LinkedIn", "Date"].map(h => (
                                                        <th key={h}>{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {[...Array(6)].map((_, i) => (
                                                    <tr key={i} className="skeleton-row">
                                                        <td><div className="skeleton-bar" style={{ width: 20 }} /></td>
                                                        <td>
                                                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                                <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#1a1a1a", flexShrink: 0 }} />
                                                                <div className="skeleton-bar" style={{ width: 100 }} />
                                                            </div>
                                                        </td>
                                                        {[140, 100, 110, 90, 70, 60, 50, 70].map((w, j) => (
                                                            <td key={j}><div className="skeleton-bar" style={{ width: w }} /></td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : allContacts.length === 0 ? (
                                        <div className="empty-state">
                                            <div className="empty-icon">👥</div>
                                            <div className="empty-title">No contacts found</div>
                                            <div className="empty-sub">Your contact list is currently empty</div>
                                        </div>
                                    ) : (
                                        <table className="data-table">
                                            <thead>
                                                <tr>
                                                    <th>#</th>
                                                    <th>Contact</th>
                                                    <th>Email</th>
                                                    <th>Phone</th>
                                                    <th>Company</th>
                                                    <th>Designation</th>
                                                    <th>Source</th>
                                                    <th>Status</th>
                                                    <th>LinkedIn</th>
                                                    <th>Date</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {allContacts.map((contact, i) => (
                                                    <tr key={contact.uid}>
                                                        <td className="td-num">{i + 1}</td>
                                                        <td>
                                                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                                <Avatar name={contact.name} index={i} />
                                                                <span className="td-name">{contact.name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="td-mono">{contact.email || "—"}</td>
                                                        <td className="td-mono">{contact.phone || "—"}</td>
                                                        <td>{contact.company || "—"}</td>
                                                        <td className="td-muted">{contact.designation || "—"}</td>
                                                        <td><SourceBadge source={contact.source} /></td>
                                                        <td><StatusBadge status={contact.status} /></td>
                                                        <td>
                                                            {contact.profileURL
                                                                ? <a href={getProfileHref(contact.profileURL)} target="_blank" rel="noreferrer" className="td-link">🔗 View</a>
                                                                : <span className="td-muted">—</span>}
                                                        </td>
                                                        <td className="td-muted">{formatDate(contact.updatedAt)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <div className="empty-icon">👥</div>
                                    <div className="empty-title">Your contacts will appear here</div>
                                    <div className="empty-sub">
                                        Click <strong>"Get All Contacts"</strong> to load, then <strong>"Export Excel"</strong> to download
                                    </div>
                                </div>
                            )}
                        </div>

                    </main>
                </div>
            </div>
        </>
    );
};

export default Contacts;