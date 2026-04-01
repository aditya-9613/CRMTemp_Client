import { useEffect, useState } from "react";
import { Row, Col } from "react-bootstrap";
import Sidebar from "../Sidebar/Sidebar";
import ContactTable from "../Table/ContactTable";
import ContactModal from "../Modal/AddContactModal";
import axios from "axios";
import { baseURL } from "../../Utils/baseURL";

const STAT_ICONS = {
    total: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    ),
    new: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <polyline points="20 12 20 22 4 22 4 12" />
            <rect x="2" y="7" width="20" height="5" />
            <line x1="12" y1="22" x2="12" y2="7" />
            <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
            <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
        </svg>
    ),
    active: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
    ),
    completed: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
    ),
};

const STATUS_STYLES = {
    New: { bg: "rgba(34,197,94,0.15)", color: "#4ade80", border: "rgba(34,197,94,0.3)" },
    Connected: { bg: "rgba(59,130,246,0.15)", color: "#60a5fa", border: "rgba(59,130,246,0.3)" },
    Pending: { bg: "rgba(234,179,8,0.15)", color: "#facc15", border: "rgba(234,179,8,0.3)" },
    "In Progress": { bg: "rgba(134,239,172,0.1)", color: "#86efac", border: "rgba(134,239,172,0.25)" },
    Completed: { bg: "rgba(186,230,253,0.1)", color: "#7dd3fc", border: "rgba(186,230,253,0.2)" },
    Rejected: { bg: "rgba(239,68,68,0.15)", color: "#f87171", border: "rgba(239,68,68,0.3)" },
    Archived: { bg: "rgba(156,163,175,0.15)", color: "#9ca3af", border: "rgba(156,163,175,0.3)" },
};

const AVATAR_COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6", "#f59e0b", "#6366f1", "#10b981"];

function getInitials(name = "") {
    return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function formatDate(isoStr) {
    if (!isoStr) return "—";
    return new Date(isoStr).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function DetailAvatar({ name, index, size = 48 }) {
    return (
        <div style={{
            width: size, height: size, borderRadius: "50%",
            background: AVATAR_COLORS[index % AVATAR_COLORS.length],
            color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, fontSize: size * 0.36, flexShrink: 0,
        }}>
            {getInitials(name)}
        </div>
    );
}

function DetailStatusBadge({ status }) {
    const s = STATUS_STYLES[status] || { bg: "#1e1e1e", color: "#888", border: "#333" };
    return (
        <span style={{
            background: s.bg, color: s.color,
            border: `1px solid ${s.border}`,
            padding: "3px 11px", borderRadius: 20,
            fontSize: 12, fontWeight: 600,
        }}>
            {status}
        </span>
    );
}

// ─── Dashboard Component ──────────────────────────────────────
const Dashboard = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [activeItem, setActiveItem] = useState("Dashboard");
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const [selectedContact, setSelectedContact] = useState(null);
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    const [contacts, setContacts] = useState([]);
    const [name, setName] = useState('')
    const [activities, setActivities] = useState([])
    const [stats, setStats] = useState([])

    function formatTimeAgo(isoStr) {
        if (!isoStr) return "—";
        const diff = Math.floor((Date.now() - new Date(isoStr)) / 1000);
        if (diff < 60) return `${diff} seconds ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
        return `${Math.floor(diff / 86400)} days ago`;
    }

    async function getStats() {
        axios({
            url: `${baseURL}/api/v1/contact/getStats`,
            method: 'GET',
            withCredentials: true,
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('user')}`
            }
        }).then((res) => {
            setStats(res.data.data.data)
        }).catch((err) => {
            console.log(err)
        })
    }

    async function getActivities() {
        axios({
            url: `${baseURL}/api/v1/contact/getActivity`,
            method: 'GET',
            withCredentials: true,
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('user')}`
            }
        }).then((res) => {
            setActivities(res.data.data.data)
        }).catch((err) => {
            console.log(err)
        })
    }

    async function getUser() {
        axios({
            url: `${baseURL}/api/v1/user/getUserDetails`,
            method: 'GET',
            withCredentials: true,
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('user')}`
            }
        }).then((res) => {
            if (res.status === 200) {
                setName(res.data?.data?.data?.fullName)
            } else {
                setName('')
            }
        }).catch((err) => {
            console.log(err)
        })
    }

    async function getContacts() {
        axios({
            url: `${baseURL}/api/v1/contact/getContact`,
            method: 'GET',
            withCredentials: true,
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("user")}`,
            }
        }).then((res) => {
            setContacts(res.data.data.data || []);
        }).catch((err) => {
            console.error("Error fetching contacts:", err);
        });
    }

    useEffect(() => {
        getContacts();
        getUser()
        getActivities()
        getStats()
    }, [])

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { height: 100%; background: #0e0e0e; }

        .gcrm-app {
          min-height: 100vh;
          background: #0e0e0e;
          font-family: 'DM Sans', 'Segoe UI', sans-serif;
          color: #e8e8e8;
        }

        .gcrm-main {
          margin-left: ${collapsed ? "64px" : "236px"};
          transition: margin-left 0.28s cubic-bezier(0.4, 0, 0.2, 1);
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        /* ── Topbar ── */
        .gcrm-topbar {
          position: sticky; top: 0; z-index: 99;
          height: 64px; background: #141414;
          border-bottom: 1px solid #2a2a2a;
          display: flex; align-items: center;
          justify-content: space-between;
          padding: 0 24px; gap: 16px; flex-shrink: 0;
        }
        .topbar-title { font-size: 17px; font-weight: 700; color: #f5f5f5; letter-spacing: -0.3px; white-space: nowrap; }
        .user-avatar {
          width: 32px; height: 32px; border-radius: 50%;
          background: linear-gradient(135deg, #3b5bdb 0%, #6741d9 100%);
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 700; color: #fff; flex-shrink: 0;
        }
        .user-name { font-size: 13px; font-weight: 600; color: #ccc; }

        /* ── Add Contact Btn ── */
        .btn-add-contact {
          display: flex; align-items: center; gap: 7px;
          background: #3b5bdb; color: #fff; border: none;
          border-radius: 8px; padding: 8px 16px;
          font-size: 13px; font-weight: 600; cursor: pointer;
          white-space: nowrap; font-family: 'DM Sans', sans-serif;
          transition: background 0.15s, transform 0.1s; flex-shrink: 0;
        }
        .btn-add-contact:hover { background: #3451c7; transform: translateY(-1px); }
        .btn-add-contact:active { transform: translateY(0); }

        /* ── User Dropdown ── */
        .user-dropdown-wrap { position: relative; }
        .user-chip {
          display: flex; align-items: center; gap: 10px;
          padding: 6px 10px; border-radius: 8px;
          cursor: pointer; transition: background 0.15s; user-select: none;
        }
        .user-chip:hover, .user-chip.open { background: #1e1e1e; }
        .user-dropdown-menu {
          position: absolute; top: calc(100% + 8px); right: 0;
          background: #1a1a1a; border: 1px solid #2e2e2e;
          border-radius: 10px; min-width: 170px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.5);
          z-index: 999; overflow: hidden;
          animation: dropIn 0.18s cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes dropIn { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
        .user-dropdown-menu button {
          display: block; width: 100%; background: none; border: none;
          color: #aaa; font-size: 13.5px; font-weight: 500;
          padding: 10px 16px; text-align: left; cursor: pointer;
          font-family: 'DM Sans', sans-serif; transition: background 0.12s, color 0.12s;
        }
        .user-dropdown-menu button:hover { background: #242424; color: #f0f0f0; }
        .user-dropdown-menu .dropdown-divider { border-color: #2a2a2a; margin: 3px 0; }
        .user-dropdown-menu .logout-btn { color: #f87171 !important; }
        .user-dropdown-menu .logout-btn:hover { background: #2a1515 !important; color: #fca5a5 !important; }

        /* ── Content ── */
        .gcrm-content { flex: 1; padding: 28px; scrollbar-width: thin; scrollbar-color: #333 transparent; }
        .page-title { font-size: 22px; font-weight: 700; color: #f0f0f0; letter-spacing: -0.4px; margin-bottom: 24px; }

        /* ── Stat Cards ── */
        .stat-card {
          background: #161616; border: 1px solid #252525;
          border-radius: 12px; padding: 20px; height: 100%;
          transition: border-color 0.2s, transform 0.2s;
          position: relative; overflow: hidden;
        }
        .stat-card::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.02) 0%, transparent 60%);
          pointer-events: none;
        }
        .stat-card:hover { border-color: #333; transform: translateY(-1px); }
        .stat-label {
          font-size: 12px; font-weight: 600; color: #666;
          text-transform: uppercase; letter-spacing: 0.6px;
          margin-bottom: 10px; display: flex;
          align-items: center; justify-content: space-between;
        }
        .stat-label .icon-wrap {
          width: 32px; height: 32px; border-radius: 8px;
          background: #1e1e1e; display: flex; align-items: center;
          justify-content: center; color: #666;
        }
        .stat-value { font-size: 28px; font-weight: 700; color: #f5f5f5; font-family: 'DM Mono', monospace; letter-spacing: -0.5px; line-height: 1.1; }
        .stat-sub { font-size: 12px; margin-top: 8px; color: #555; }
        .stat-sub.positive { color: #4ade80; }

        /* ── Panel ── */
        .panel { background: #161616; border: 1px solid #252525; border-radius: 12px; overflow: hidden; }
        .panel-header { padding: 16px 20px; border-bottom: 1px solid #212121; font-size: 14px; font-weight: 700; color: #ddd; letter-spacing: -0.2px; }

        /* ── Activity Feed ── */
        .activity-item { display: flex; align-items: flex-start; gap: 12px; padding: 14px 20px; border-bottom: 1px solid #1c1c1c; transition: background 0.15s; }
        .activity-item:last-child { border-bottom: none; }
        .activity-item:hover { background: #191919; }
        .activity-dot { width: 8px; height: 8px; border-radius: 50%; background: #3b5bdb; margin-top: 5px; flex-shrink: 0; }
        .activity-dot.deal { background: #6741d9; }
        .activity-text { font-size: 13.5px; color: #ccc; line-height: 1.4; }
        .activity-time { font-size: 11px; color: #555; margin-top: 2px; }

        /* ── Top Customers Table ── */
        .customers-table { margin: 0; width: 100%; border-collapse: collapse; }
        .customers-table thead th { background: #1a1a1a; color: #555; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; padding: 12px 20px; border-bottom: 1px solid #212121; text-align: left; }
        .customers-table tbody td { padding: 13px 20px; border-bottom: 1px solid #1c1c1c; font-size: 13.5px; color: #ccc; vertical-align: middle; }
        .customers-table tbody tr:last-child td { border-bottom: none; }
        .customers-table tbody tr { transition: background 0.15s; }
        .customers-table tbody tr:hover td { background: #191919; }
        .customer-name { font-weight: 600; color: #e0e0e0; }
        .deal-value { font-family: 'DM Mono', monospace; font-size: 13px; color: #a0a0a0; }
        .status-dot { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 600; }
        .status-dot::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

        /* ── Contact Details Panel ── */
        .detail-field { display: flex; align-items: flex-start; gap: 10px; padding: 9px 0; border-bottom: 1px solid #1e1e1e; font-size: 13.5px; }
        .detail-field:last-child { border-bottom: none; }
        .detail-label { color: #555; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; min-width: 80px; padding-top: 2px; }
        .detail-val { color: #ccc; flex: 1; }
        .detail-val.link { color: #7da4f5; }
      `}</style>

            <div className="gcrm-app">
                {/* Sidebar */}
                <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} activeItem={activeItem} setActiveItem={setActiveItem} />

                {/* Main */}
                <div className="gcrm-main">

                    {/* Topbar */}
                    <header className="gcrm-topbar">
                        <span className="topbar-title">CRM</span>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginLeft: "auto" }}>
                            <button className="btn-add-contact" onClick={() => setIsContactModalOpen(true)}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                                </svg>
                                Add Contact
                            </button>
                            <div className="user-dropdown-wrap">
                                <div className={`user-chip ${userDropdownOpen ? "open" : ""}`} onClick={() => setUserDropdownOpen((p) => !p)}>
                                    <div className="user-avatar">{name[0]}</div>
                                    <span className="user-name">{name}</span>
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Page Content */}
                    <main className="gcrm-content">
                        <div className="page-title">Customer Overview</div>

                        {/* ── Stat Cards ── */}
                        <Row className="g-3 mb-4">
                            {stats.map((s, i) => (
                                <Col key={i} xs={12} sm={6} xl={3}>
                                    <div className="stat-card">
                                        <div className="stat-label">
                                            {s.label}
                                            <span className="icon-wrap">{STAT_ICONS[s.key]}</span>
                                        </div>
                                        <div className="stat-value">{s.value}</div>
                                    </div>
                                </Col>
                            ))}
                        </Row>

                        {/* ── Contact List Table (component) ── */}
                        <div className="panel mb-4" style={{ padding: "20px 20px 0" }}>
                            <ContactTable
                                contacts={contacts}
                                selectedContact={selectedContact}
                                onSelectContact={setSelectedContact}
                            />
                        </div>

                        {/* ── Bottom Row: Contact Details + Activities + Import ── */}
                        <Row className="g-3">

                            {/* Contact Details */}
                            <Col xs={12} lg={5}>
                                <div className="panel" style={{ height: "100%" }}>
                                    <div className="panel-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                        <span>Contact Details</span>
                                        {selectedContact && (
                                            <button onClick={() => setSelectedContact(null)}
                                                style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 16, lineHeight: 1, padding: 2 }}>✕</button>
                                        )}
                                    </div>

                                    {!selectedContact ? (
                                        <div style={{ padding: "48px 20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#444", gap: 8 }}>
                                            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.4 }}>
                                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                                            </svg>
                                            <div style={{ fontWeight: 600, fontSize: 14 }}>No Contact Selected</div>
                                            <div style={{ fontSize: 12 }}>Click a row in the table to view details</div>
                                        </div>
                                    ) : (
                                        <div style={{ padding: "18px 20px" }}>
                                            {/* Header */}
                                            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
                                                <DetailAvatar name={selectedContact.name} index={contacts.indexOf(selectedContact)} size={50} />
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: 700, fontSize: 16, color: "#f0f0f0" }}>{selectedContact.name}</div>
                                                    <div style={{ fontSize: 13, color: "#666", marginTop: 2 }}>{selectedContact.company}</div>
                                                </div>
                                                <DetailStatusBadge status={selectedContact.status} />
                                            </div>

                                            {/* Fields */}
                                            <div>
                                                {[
                                                    { label: "Phone", val: selectedContact.phone, link: false },
                                                    { label: "Email", val: selectedContact.email, link: true },
                                                    { label: "Company", val: selectedContact.company, link: false },
                                                    { label: "Value", val: selectedContact.value, link: false },
                                                    { label: "Created", val: formatDate(selectedContact.createdAt), link: false },
                                                ].map(({ label, val, link }) => (
                                                    <div key={label} className="detail-field">
                                                        <span className="detail-label">{label}</span>
                                                        <span className={`detail-val ${link ? "link" : ""}`}>{val || "—"}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Col>

                            {/* Right Column: Activities + Import */}
                            <Col xs={12} lg={7}>
                                <Row className="g-3">

                                    {/* Recent Activities */}
                                    {/* Recent Activities */}
                                    <Col xs={12}>
                                        <div className="panel">
                                            <div className="panel-header">Recent Activities</div>
                                            {activities.length === 0 ? (
                                                <div style={{ padding: "32px 20px", textAlign: "center", color: "#444", fontSize: 13 }}>
                                                    No recent activities
                                                </div>
                                            ) : (
                                                activities.map((a, i) => (
                                                    <div key={i} className="activity-item">
                                                        <div className={`activity-dot ${a.activity?.toLowerCase().includes("deal") ? "deal" : ""}`} />
                                                        <div>
                                                            <div className="activity-text">
                                                                <span style={{ color: "#e0e0e0", fontWeight: 600 }}>{a.name}</span>
                                                                {" — "}{a.message}
                                                            </div>
                                                            <div style={{ display: "flex", gap: 10, marginTop: 3, alignItems: "center" }}>
                                                                <span style={{
                                                                    fontSize: 11, fontWeight: 600, color: "#4ade80",
                                                                    background: "rgba(34,197,94,0.12)", borderRadius: 4,
                                                                    padding: "1px 7px", border: "1px solid rgba(34,197,94,0.25)"
                                                                }}>{a.activity}</span>
                                                                <span className="activity-time">{formatTimeAgo(a.date)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </Col>

                                    {/* Import Summary */}
                                    <Col xs={12}>
                                        <div className="panel">
                                            <div className="panel-header">Import Summary</div>
                                            <div style={{ padding: "16px 20px" }}>
                                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 20px", fontSize: 13.5, marginBottom: 16 }}>
                                                    {[
                                                        ["File Name", "contacts.csv"],
                                                        ["Imported By", "Admin User"],
                                                        ["Total Records", "150"],
                                                        ["Successful", "140"],
                                                        ["Failed", "10"],
                                                        ["Import Date", "Mar 10, 2024"],
                                                    ].map(([l, v]) => (
                                                        <div key={l} style={{ display: "flex", gap: 8 }}>
                                                            <span style={{ color: "#555", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.4px", paddingTop: 2, minWidth: 80 }}>{l}</span>
                                                            <span style={{ color: "#ccc", fontWeight: 500 }}>{v}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: 12, fontWeight: 600, color: "#555", textTransform: "uppercase", letterSpacing: "0.4px", display: "block", marginBottom: 8 }}>Import Excel File</label>
                                                    <input type="file" accept=".xls,.xlsx,.csv"
                                                        style={{ background: "#1e1e1e", border: "1px solid #2a2a2a", borderRadius: 8, padding: "8px 12px", color: "#888", fontSize: 13, width: "100%", cursor: "pointer" }} />
                                                </div>
                                            </div>
                                        </div>
                                    </Col>

                                </Row>
                            </Col>
                        </Row>
                    </main>
                </div>
                <ContactModal
                    show={isContactModalOpen}
                    onClose={() => setIsContactModalOpen(false)}
                    onContactAdded={(newContact) => {
                        console.log("Contact added:", newContact);
                        // optional: update your contacts list state here
                    }}
                />
            </div>
        </>
    );
}

export default Dashboard