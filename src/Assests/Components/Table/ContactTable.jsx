import { useState, useRef, useEffect } from "react";
import { Form, Button, Badge, Table } from "react-bootstrap";
import EditContactModal from "../Modal/EditContactModal";
import DeleteContactModal from "../Modal/DeleteContactModal";

// ── Constants ─────────────────────────────────────────────────
const TABS = ["All Contacts", "New", "Connected", "Pending", "In Progress", "Completed", "Rejected", "Archived"];

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

const QUICK_PRESETS = [
    { label: "Today", days: 0 },
    { label: "Last 7d", days: 7 },
    { label: "Last 30d", days: 30 },
    { label: "Last 90d", days: 90 },
];

function getInitials(name = "") {
    return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function formatDate(isoStr) {
    if (!isoStr) return "—";
    return new Date(isoStr).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function Avatar({ name, index, size = 32 }) {
    return (
        <div
            className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 fw-bold text-white"
            style={{
                width: size, height: size,
                background: AVATAR_COLORS[index % AVATAR_COLORS.length],
                fontSize: size * 0.36,
            }}
        >
            {getInitials(name)}
        </div>
    );
}

function StatusBadge({ status }) {
    const s = STATUS_STYLES[status] || { bg: "#1e1e1e", color: "#888", border: "#333" };
    return (
        <span
            className="fw-semibold text-nowrap"
            style={{
                background: s.bg, color: s.color,
                border: `1px solid ${s.border}`,
                padding: "3px 10px", borderRadius: 20, fontSize: 11.5,
            }}
        >
            {status}
        </span>
    );
}

// ── Main Component ─────────────────────────────────────────────
const ContactTable = ({ contacts: initialContacts, onSelectContact, selectedContact }) => {
    // ── Local contacts state so we can update/delete without re-fetching
    const [contacts, setContacts] = useState(initialContacts || []);

    useEffect(() => {
        setContacts(initialContacts || []);
    }, [initialContacts]);

    // ── Modal state
    const [editModal, setEditModal] = useState({ show: false, contact: null, index: 0 });
    const [deleteModal, setDeleteModal] = useState({ show: false, contact: null, index: 0 });

    // ── Table state
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState("All Contacts");
    const [sortKey, setSortKey] = useState("name");
    const [sortDir, setSortDir] = useState("asc");
    const [filterOpen, setFilterOpen] = useState(false);
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [appliedFrom, setAppliedFrom] = useState("");
    const [appliedTo, setAppliedTo] = useState("");
    const filterRef = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (filterRef.current && !filterRef.current.contains(e.target)) setFilterOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // ── Handlers
    const openEdit = (e, contact, index) => {
        e.stopPropagation();
        setEditModal({ show: true, contact, index });
    };

    const openDelete = (e, contact, index) => {
        e.stopPropagation();
        setDeleteModal({ show: true, contact, index });
    };

    const handleSaveEdit = (updatedContact) => {
        setContacts((prev) =>
            prev.map((c) => (c.id === updatedContact.id ? updatedContact : c))
        );
        setEditModal({ show: false, contact: null, index: 0 });
    };

    const handleConfirmDelete = (id) => {
        setContacts((prev) => prev.filter((c) => c.id !== id));
        setDeleteModal({ show: false, contact: null, index: 0 });
    };

    // ── Filter & sort
    const isDateInRange = (isoStr) => {
        if (!appliedFrom && !appliedTo) return true;
        if (!isoStr) return false;
        const d = new Date(isoStr); d.setHours(0, 0, 0, 0);
        if (appliedFrom) { const f = new Date(appliedFrom); f.setHours(0, 0, 0, 0); if (d < f) return false; }
        if (appliedTo) { const t = new Date(appliedTo); t.setHours(23, 59, 59, 999); if (d > t) return false; }
        return true;
    };

    const filtered = contacts.filter((c) => {
        const q = search.toLowerCase();
        const matchSearch =
            (c.name || "").toLowerCase().includes(q) ||
            (c.phone || "").includes(q) ||
            (c.email || "").toLowerCase().includes(q) ||
            (c.company || "").toLowerCase().includes(q);
        const matchTab = activeTab === "All Contacts" || c.status === activeTab;
        const matchDate = isDateInRange(c.createdAt);
        return matchSearch && matchTab && matchDate;
    });

    const sorted = [...filtered].sort((a, b) => {
        if (sortKey === "name") {
            const av = (a.name || "").toLowerCase(), bv = (b.name || "").toLowerCase();
            return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
        }
        if (sortKey === "updatedAt") {
            const av = new Date(a.updatedAt || a.createdAt || 0).getTime();
            const bv = new Date(b.updatedAt || b.createdAt || 0).getTime();
            return sortDir === "asc" ? av - bv : bv - av;
        }
        return 0;
    });

    const handleSort = (key) => {
        if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        else { setSortKey(key); setSortDir("asc"); }
    };

    const handleApply = () => { setAppliedFrom(dateFrom); setAppliedTo(dateTo); setFilterOpen(false); };
    const handleClear = () => { setDateFrom(""); setDateTo(""); setAppliedFrom(""); setAppliedTo(""); setFilterOpen(false); };
    const isFilterActive = appliedFrom || appliedTo;

    const SortIcon = ({ col }) =>
        sortKey !== col
            ? <span className="ms-1 opacity-25">↕</span>
            : <span className="ms-1" style={{ color: "#5b6ef5" }}>{sortDir === "asc" ? "↑" : "↓"}</span>;

    const COLS = [
        { key: null, label: "S No", sortable: false, width: 44 },
        { key: "name", label: "Name", sortable: true },
        { key: "designation", label: "Designation", sortable: false },
        { key: "email", label: "Email", sortable: false },
        { key: "company", label: "Company", sortable: false },
        { key: "source", label: "Source", sortable: false },
        { key: "status", label: "Status", sortable: false },
        { key: "updatedAt", label: "Last Updated", sortable: true },
        { key: null, label: "Actions", sortable: false, width: 90 },
    ];

    return (
        <>
            <style>{`
        @keyframes ctDropIn { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
        .ct-filter-dropdown { animation: ctDropIn 0.18s ease both; }
        .ct-tab-btn { border-bottom: 2px solid transparent !important; margin-bottom: -1px; }
        .ct-tab-btn.active { color: #5b6ef5 !important; border-bottom-color: #5b6ef5 !important; }
        .ct-tab-btn:hover:not(.active) { color: #ccc !important; }
        .ct-th-sort { cursor: pointer; user-select: none; }
        .ct-th-sort:hover { color: #ccc !important; }
        .ct-row { background: #0e0e0e; }
        .ct-row:hover td { background: #1f1f1f !important; }
        .ct-row td { background: #111111; }
        .ct-row.selected td { background: #1a1c2e !important; }
        .ct-search { background: #1e1e1e !important; border: 1px solid #2a2a2a !important; color: #ccc !important; border-radius: 7px !important; }
        .ct-search:focus { border-color: #5b6ef5 !important; box-shadow: 0 0 0 2px rgba(91,110,245,0.18) !important; color: #eee !important; }
        .ct-search::placeholder { color: #444 !important; }
        .fi-date { background: #1a1a1a !important; border: 1px solid #2a2a2a !important; color: #ccc !important; border-radius: 7px !important; font-size: 13px !important; }
        .fi-date:focus { border-color: #5b6ef5 !important; box-shadow: 0 0 0 2px rgba(91,110,245,0.15) !important; }
        .preset-chip { font-size: 12px; }
        .preset-chip.active { border-color: #5b6ef5 !important; background: rgba(91,110,245,0.12) !important; color: #8fa4ff !important; }
        .ct-act-edit:hover { background: rgba(91,110,245,0.15) !important; border-color: rgba(91,110,245,0.3) !important; color: #8fa4ff !important; }
        .ct-act-delete:hover { background: rgba(239,68,68,0.15) !important; border-color: rgba(239,68,68,0.3) !important; color: #f87171 !important; }
      `}</style>

            {/* ── Header ── */}
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                <h2 className="mb-0 fw-bold" style={{ fontSize: 16, color: "#ddd", letterSpacing: "-0.2px" }}>
                    Contact List
                    <span className="ms-2 fw-normal" style={{ fontSize: 12, color: "#444" }}>{sorted.length} records</span>
                </h2>

                <div className="d-flex align-items-center gap-2 flex-wrap">
                    {/* Search */}
                    <Form.Control
                        className="ct-search"
                        style={{ width: 210 }}
                        placeholder="🔍 Search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    {/* Refresh */}
                    <Button
                        variant="outline-secondary"
                        size="sm"
                        className="border-0 px-2 py-2"
                        style={{ background: "#1e1e1e", border: "1px solid #2a2a2a !important", color: "#666", borderRadius: 7 }}
                        onClick={() => window.location.reload()}
                        title="Refresh"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
                            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                        </svg>
                    </Button>

                    {/* Filter */}
                    <div ref={filterRef} className="position-relative">
                        <Button
                            size="sm"
                            className="d-flex align-items-center gap-2 fw-semibold px-3"
                            style={{
                                background: isFilterActive ? "rgba(91,110,245,0.12)" : "#1e1e1e",
                                border: isFilterActive ? "1.5px solid #5b6ef5" : "1px solid #2a2a2a",
                                color: isFilterActive ? "#8fa4ff" : "#777",
                                borderRadius: 7, fontSize: 13,
                            }}
                            onClick={() => setFilterOpen((v) => !v)}
                        >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                            </svg>
                            Filters
                            {isFilterActive && (
                                <Badge bg="primary" pill style={{ fontSize: 10, background: "#5b6ef5" }}>1</Badge>
                            )}
                        </Button>

                        {filterOpen && (
                            <div
                                className="ct-filter-dropdown position-absolute end-0 p-3 rounded-3"
                                style={{
                                    top: "calc(100% + 8px)", width: 290, zIndex: 9999,
                                    background: "#161616", border: "1px solid #252525",
                                    boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
                                }}
                            >
                                <div className="d-flex align-items-center justify-content-between mb-3">
                                    <span className="fw-bold" style={{ fontSize: 13.5, color: "#ddd" }}>Filter by Date</span>
                                    <button className="btn-close btn-close-white btn-sm" onClick={() => setFilterOpen(false)} style={{ fontSize: 10 }} />
                                </div>

                                <div className="d-flex flex-column gap-3">
                                    <div>
                                        <Form.Label className="text-uppercase fw-bold mb-1" style={{ fontSize: 11, color: "#555", letterSpacing: "0.6px" }}>From</Form.Label>
                                        <Form.Control type="date" className="fi-date" value={dateFrom} max={dateTo || undefined} onChange={(e) => setDateFrom(e.target.value)} />
                                    </div>
                                    <div>
                                        <Form.Label className="text-uppercase fw-bold mb-1" style={{ fontSize: 11, color: "#555", letterSpacing: "0.6px" }}>To</Form.Label>
                                        <Form.Control type="date" className="fi-date" value={dateTo} min={dateFrom || undefined} onChange={(e) => setDateTo(e.target.value)} />
                                    </div>
                                    <div>
                                        <Form.Label className="text-uppercase fw-bold mb-2" style={{ fontSize: 11, color: "#555", letterSpacing: "0.6px" }}>Quick Select</Form.Label>
                                        <div className="d-flex flex-wrap gap-2">
                                            {QUICK_PRESETS.map(({ label, days }) => {
                                                const today = new Date();
                                                const toStr = today.toISOString().split("T")[0];
                                                const fd = new Date(); fd.setDate(today.getDate() - days);
                                                const fromStr = fd.toISOString().split("T")[0];
                                                const isA = dateFrom === fromStr && dateTo === toStr;
                                                return (
                                                    <Button key={label} size="sm" variant="outline-secondary"
                                                        className={`preset-chip rounded-2 ${isA ? "active" : ""}`}
                                                        style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", color: "#777" }}
                                                        onClick={() => { setDateFrom(fromStr); setDateTo(toStr); }}>
                                                        {label}
                                                    </Button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <hr className="my-0" style={{ borderColor: "#222" }} />
                                    <div className="d-flex gap-2">
                                        <Button variant="outline-secondary" size="sm" className="flex-fill fw-semibold rounded-2"
                                            style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", color: "#777" }}
                                            onClick={handleClear}>
                                            Clear
                                        </Button>
                                        <Button size="sm" className="fw-semibold rounded-2" style={{ flex: 2, background: "#5b6ef5", border: "none" }}
                                            onClick={handleApply}>
                                            Apply Filter
                                        </Button>
                                    </div>
                                    {(appliedFrom || appliedTo) && (
                                        <div className="rounded-2 p-2" style={{ background: "rgba(91,110,245,0.1)", border: "1px solid rgba(91,110,245,0.2)", fontSize: 12, color: "#8fa4ff" }}>
                                            Active: {appliedFrom ? formatDate(appliedFrom) : "Any"} → {appliedTo ? formatDate(appliedTo) : "Any"}
                                            {" · "}<strong>{sorted.length}</strong> result{sorted.length !== 1 ? "s" : ""}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Tabs ── */}
            <div className="d-flex border-bottom mb-0" style={{ borderColor: "#222 !important", overflowX: "auto" }}>
                {TABS.map((tab) => (
                    <button
                        key={tab}
                        className={`ct-tab-btn btn btn-link text-decoration-none px-3 py-2 fw-medium ${activeTab === tab ? "active" : ""}`}
                        style={{ fontSize: 13, color: activeTab === tab ? "#5b6ef5" : "#555", whiteSpace: "nowrap" }}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* ── Table ── */}
            <div className="table-responsive">
                <Table className="mb-0" style={{ borderCollapse: "collapse", fontSize: 13.5 }}>
                    <thead>
                        <tr>
                            {COLS.map(({ key, label, sortable, width }, i) => (
                                <th
                                    key={i}
                                    className={`text-uppercase fw-bold${sortable ? " ct-th-sort" : ""}`}
                                    onClick={sortable ? () => handleSort(key) : undefined}
                                    style={{
                                        background: "#181818", color: "#444",
                                        fontSize: 11, letterSpacing: "0.6px",
                                        padding: "11px 16px", borderBottom: "1px solid #1e1e1e",
                                        whiteSpace: "nowrap", textAlign: "left",
                                        width: width || undefined,
                                        cursor: sortable ? "pointer" : "default",
                                    }}
                                >
                                    {label}{sortable && <SortIcon col={key} />}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {sorted.length === 0 && (
                            <tr>
                                <td colSpan={9} className="text-center py-5" style={{ color: "#444", fontSize: 14 }}>
                                    No contacts found
                                </td>
                            </tr>
                        )}
                        {sorted.map((c, i) => {
                            const isSelected = selectedContact?.id
                                ? selectedContact.id === c.id
                                : selectedContact?.name === c.name;

                            return (
                                <tr
                                    key={c.id ?? i}
                                    className={`ct-row${isSelected ? " selected" : ""}`}
                                    onClick={() => onSelectContact && onSelectContact(isSelected ? null : c)}
                                    style={{ cursor: "pointer", borderBottom: "1px solid #1a1a1a" }}
                                >
                                    <td className="fw-normal" style={{ padding: "11px 16px", color: "#333", fontSize: 12, fontFamily: "DM Mono, monospace" }}>{i + 1}</td>

                                    <td style={{ padding: "11px 16px" }}>
                                        <div className="d-flex align-items-center gap-2">
                                            <Avatar name={c.name} index={i} />
                                            <span className="fw-semibold" style={{ color: "#e0e0e0" }}>{c.name}</span>
                                        </div>
                                    </td>

                                    <td style={{ padding: "11px 16px", color: "#888" }}>{c.designation || "—"}</td>
                                    <td style={{ padding: "11px 16px", color: "#7da4f5", fontSize: 12.5 }}>{c.email || "—"}</td>
                                    <td style={{ padding: "11px 16px", color: "#aaa" }}>{c.company || "—"}</td>
                                    <td style={{ padding: "11px 16px", color: "#888" }}>{c.source || "—"}</td>
                                    <td style={{ padding: "11px 16px" }}><StatusBadge status={c.status} /></td>
                                    <td style={{ padding: "11px 16px", color: "#555", fontSize: 12 }}>{formatDate(c.lastActivity)}</td>

                                    {/* ── Actions ── */}
                                    <td style={{ padding: "11px 16px" }} onClick={(e) => e.stopPropagation()}>
                                        <div className="d-flex gap-1">
                                            {/* Edit */}
                                            <Button
                                                size="sm"
                                                className="ct-act-edit border-0 p-1"
                                                title={`Edit ${c.name}${c.id ? ` (ID: ${c.id})` : ""}`}
                                                style={{ background: "#1e1e1e", border: "1px solid #2a2a2a", color: "#666", borderRadius: 6, transition: "all 0.15s" }}
                                                onClick={(e) => openEdit(e, c, i)}
                                            >
                                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                            </Button>

                                            {/* Delete */}
                                            <Button
                                                size="sm"
                                                className="ct-act-delete border-0 p-1"
                                                title={`Delete ${c.name}${c.id ? ` (ID: ${c.id})` : ""}`}
                                                style={{ background: "#1e1e1e", border: "1px solid #2a2a2a", color: "#666", borderRadius: 6, transition: "all 0.15s" }}
                                                onClick={(e) => openDelete(e, c, i)}
                                            >
                                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </Table>
            </div>

            {/* ── Modals ── */}
            <EditContactModal
                show={editModal.show}
                contact={editModal.contact}
                contactIndex={editModal.index}
                onHide={() => setEditModal({ show: false, contact: null, index: 0 })}
                onSave={handleSaveEdit}
            />

            <DeleteContactModal
                show={deleteModal.show}
                contact={deleteModal.contact}
                contactIndex={deleteModal.index}
                onHide={() => setDeleteModal({ show: false, contact: null, index: 0 })}
                onConfirm={handleConfirmDelete}
            />
        </>
    );
};

export default ContactTable;