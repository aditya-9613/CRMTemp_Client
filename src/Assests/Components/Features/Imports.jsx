import { useState, useRef, useEffect } from 'react'
import Sidebar from '../Sidebar/Sidebar'
import * as XLSX from 'xlsx'
import checkSubscription from '../../Utils/CheckSubscription'
// import axios from 'axios'
// import { baseURL } from '../../Utils/baseURL.js'
// import { triggerLogout } from '../../Utils/logoutEvent.js'

const REQUIRED_HEADERS = ['Name', 'Email', 'Designation', 'Phone', 'ProfileURL', 'Company', 'Source']

// const AVATAR_COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6", "#f59e0b", "#6366f1", "#10b981"]

// function getInitials(name = "") {
//     return name.split(" ").filter(Boolean).map((n) => n[0]).join("").slice(0, 2).toUpperCase()
// }

const Imports = () => {
    const [collapsed, setCollapsed] = useState(false)
    const [activeItem, setActiveItem] = useState("Imports")

    const [dragging, setDragging] = useState(false)
    const [tableData, setTableData] = useState([])
    const [headers, setHeaders] = useState([])
    const [fileName, setFileName] = useState("")
    const [error, setError] = useState("")
    const [uploaded, setUploaded] = useState(false)
    const [paymentDone, setPaymentDone] = useState(false)
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)

    const fileInputRef = useRef(null)

    useEffect(() => {
        const getData = async () => {
            const value = await checkSubscription()
            setPaymentDone(value.isPremium)
            setLoading(false)
        }
        getData()
    }, [])

    const resetState = () => {
        setTableData([])
        setHeaders([])
        setFileName("")
        setError("")
        setUploaded(false)
    }

    const processFile = (file) => {
        setError("")
        setUploaded(false)
        const validTypes = [
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-excel",
            "text/csv",
        ]
        if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
            setError("Invalid file type. Please upload a .xlsx, .xls, or .csv file.")
            return
        }
        setFileName(file.name)
        const reader = new FileReader()
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result)
            const workbook = XLSX.read(data, { type: "array" })
            const sheet = workbook.Sheets[workbook.SheetNames[0]]
            const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 })
            if (!rows || rows.length === 0) { setError("The file is empty."); return }

            // ✅ FIX: lowercase both sides for comparison
            const fileHeaders = rows[0].map((h) => String(h).trim().toLowerCase())
            const missing = REQUIRED_HEADERS.filter((h) => !fileHeaders.includes(h.toLowerCase()))

            if (missing.length > 0) {
                setError(`Wrong format! Missing column(s): ${missing.join(", ")}.\n\nRequired headings:\n${REQUIRED_HEADERS.join(", ")}\n\nNote: Do NOT include a "status" column — status is automatically set to "New".`)
                setTableData([]); setHeaders([]); return
            }
            const originalHeaders = rows[0].map((h) => String(h).trim())
            const dataRows = rows.slice(1).filter((row) => row.some((cell) => cell !== undefined && cell !== ""))
            const parsed = dataRows.map((row) => {
                const obj = {}
                originalHeaders.forEach((h, i) => {
                    if (h.toLowerCase() === 'status') return
                    obj[h] = row[i] !== undefined ? String(row[i]) : ""
                })
                return obj
            })
            setHeaders(originalHeaders.filter(h => h.toLowerCase() !== 'status'))
            setTableData(parsed)
        }
        reader.readAsArrayBuffer(file)
    }

    const handleFileChange = (e) => { const file = e.target.files[0]; if (file) processFile(file); e.target.value = "" }
    const handleDrop = (e) => { e.preventDefault(); setDragging(false); const file = e.dataTransfer.files[0]; if (file) processFile(file) }

    const handleUpload = () => {
        setUploading(true)
        // const json = tableData.map((row) => ({
        //     name: row["name"] || row["Name"] || "",
        //     email: row["email"] || row["Email"] || "",
        //     designation: row["designation"] || row["Designation"] || "",
        //     phone: row["phone"] || row["Phone"] || "",
        //     profileURL: row["profileURL"] || row["ProfileURL"] || "",
        //     company: row["company"] || row["Company"] || "",
        //     source: row["source"] || row["Source"] || "",
        //     status: "New",
        // }))
        setUploaded(true)
        // axios({
        //     url: `${baseURL}/api/v1/contact/importExcel`,
        //     method: 'POST',
        //     data: { json },
        //     withCredentials: true,
        //     headers: { 'Authorization': `Bearer ${localStorage.getItem('user')}` }
        // }).then((res) => {
        //     setUploading(false)
        //     if (res.status === 200) { alert('Excel File Imported Successfully'); window.location.reload() }
        // }).catch((err) => {
        //     setUploading(false)
        //     const message = err.response?.data?.message
        //     const code = err?.response?.status
        //     if (code === 401) triggerLogout()
        //     else if (code === 403) setPaymentDone(false)
        //     else alert(`${message}: ${code}`)
        // })
    }

    // ── CSS ───────────────────────────────────────────────────────
    const css = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body, #root { height: 100%; background: #0e0e0e; }

    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

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

    /* Panel */
    .panel { background: #161616; border: 1px solid #252525; border-radius: 12px; overflow: hidden; animation: fadeIn 0.25s ease; }
    .panel-header { padding: 16px 20px; border-bottom: 1px solid #212121; font-size: 14px; font-weight: 700; color: #ddd; display: flex; align-items: center; justify-content: space-between; }
    .panel-body { padding: 20px; }

    /* Format info */
    .format-box { background: rgba(59,91,219,0.08); border: 1px solid rgba(59,91,219,0.2); border-radius: 12px; padding: 18px 20px; animation: fadeIn 0.25s ease; }
    .format-title { font-size: 13px; font-weight: 700; color: #7da4f5; margin-bottom: 10px; }
    .format-chip {
      display: inline-flex; align-items: center;
      background: rgba(59,91,219,0.15); color: #7da4f5;
      border: 1px solid rgba(59,91,219,0.3);
      padding: 3px 12px; border-radius: 20px;
      font-size: 11px; font-weight: 700; font-family: 'DM Mono', monospace;
    }
    .format-note { background: rgba(34,197,94,0.08); border: 1px solid rgba(34,197,94,0.2); border-radius: 8px; padding: 9px 14px; font-size: 13px; color: #4ade80; margin-top: 12px; }
    .format-demo { font-size: 12px; color: #555; margin-top: 10px; font-family: 'DM Mono', monospace; }

    /* Drop zone */
    .drop-zone {
      border: 2px dashed #2a2a2a; border-radius: 12px;
      padding: 48px 24px; display: flex; flex-direction: column;
      align-items: center; justify-content: center; gap: 10px;
      cursor: pointer; transition: border-color 0.18s, background 0.18s;
      background: #161616;
    }
    .drop-zone:hover { border-color: #3b5bdb; background: rgba(59,91,219,0.04); }
    .drop-zone.dragging { border-color: #3b5bdb; background: rgba(59,91,219,0.08); }
    .drop-icon { font-size: 44px; line-height: 1; }
    .drop-title { font-size: 16px; font-weight: 700; color: #ddd; }
    .drop-sub   { font-size: 13px; color: #555; }
    .drop-sub span { color: #7da4f5; font-weight: 600; }
    .drop-formats { font-size: 12px; color: #3a3a3a; margin-top: 4px; }
    .drop-file-pill {
      margin-top: 10px; background: rgba(34,197,94,0.1);
      border: 1px solid rgba(34,197,94,0.3); border-radius: 8px;
      padding: 6px 16px; font-size: 13px; color: #4ade80; font-weight: 600;
    }

    /* Error box */
    .error-box { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.25); border-radius: 12px; padding: 18px 20px; animation: fadeIn 0.25s ease; }
    .error-title { font-size: 13px; font-weight: 700; color: #f87171; margin-bottom: 8px; }
    .error-pre { margin: 0; font-size: 13px; color: #fca5a5; white-space: pre-wrap; font-family: inherit; line-height: 1.6; }

    /* Buttons */
    .btn-gcrm {
      display: inline-flex; align-items: center; gap: 7px;
      border: none; border-radius: 8px; padding: 8px 16px;
      font-size: 13px; font-weight: 600; cursor: pointer;
      font-family: 'DM Sans', sans-serif;
      transition: background 0.15s, transform 0.1s, opacity 0.15s;
      white-space: nowrap;
    }
    .btn-gcrm:hover:not(:disabled) { transform: translateY(-1px); }
    .btn-gcrm:active:not(:disabled) { transform: translateY(0); }
    .btn-gcrm:disabled { opacity: 0.4; cursor: not-allowed; }
    .btn-primary  { background: #3b5bdb; color: #fff; }
    .btn-primary:hover:not(:disabled)  { background: #3451c7; }
    .btn-ghost    { background: #1e1e1e; color: #aaa; border: 1px solid #2a2a2a; }
    .btn-ghost:hover:not(:disabled)    { background: #242424; color: #ddd; }
    .btn-danger   { background: rgba(239,68,68,0.12); color: #f87171; border: 1px solid rgba(239,68,68,0.25); }
    .btn-danger:hover:not(:disabled)   { background: rgba(239,68,68,0.2); }

    /* Preview table */
    .preview-table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .preview-table thead th {
      background: #1a1a1a; color: #555; font-size: 11px; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.6px;
      padding: 11px 14px; border-bottom: 1px solid #212121; text-align: left; white-space: nowrap;
    }
    .preview-table tbody td { padding: 11px 14px; border-bottom: 1px solid #1c1c1c; color: #ccc; vertical-align: middle; white-space: nowrap; }
    .preview-table tbody tr:last-child td { border-bottom: none; }
    .preview-table tbody tr { transition: background 0.12s; }
    .preview-table tbody tr:hover td { background: #191919; }

    /* Status badge */
    .badge-new { background: rgba(34,197,94,0.15); color: #4ade80; border: 1px solid rgba(34,197,94,0.3); padding: 2px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; }

    /* Spinner */
    .spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.2); border-top: 2px solid #fff; border-radius: 50%; animation: spin 0.7s linear infinite; flex-shrink: 0; }

    /* Premium gate */
    .premium-gate { display: flex; align-items: center; justify-content: center; flex: 1; padding: 40px 20px; }
    .premium-card { background: #161616; border: 1px solid #252525; border-radius: 16px; padding: 48px 40px; max-width: 420px; width: 100%; text-align: center; }
    .premium-icon  { font-size: 52px; margin-bottom: 20px; }
    .premium-title { font-size: 20px; font-weight: 700; color: #f0f0f0; margin-bottom: 10px; }
    .premium-desc  { font-size: 14px; color: #555; line-height: 1.65; margin-bottom: 28px; }

    /* Success pill */
    .success-pill { background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.25); border-radius: 8px; padding: 8px 16px; font-size: 13px; color: #4ade80; font-weight: 600; animation: fadeIn 0.2s ease; }
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
                                    Upgrade your plan to access bulk import.
                                </div>
                                <button className="btn-gcrm btn-primary" style={{ padding: "10px 28px", fontSize: 14 }} onClick={() => window.location.href = "/billing"}>
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
                            <div className="page-title">Import Contacts</div>
                            <div className="page-sub">Upload an Excel or CSV file to bulk import contacts into the system</div>
                        </div>

                        {/* Format Info */}
                        <div className="format-box">
                            <div className="format-title">📋 Required File Format</div>
                            <div style={{ fontSize: 13, color: "#666", marginBottom: 10 }}>
                                Your file's first row <strong style={{ color: "#aaa" }}>must</strong> contain exactly these column headings:
                            </div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                                {REQUIRED_HEADERS.map((h) => (
                                    <span key={h} className="format-chip">{h}</span>
                                ))}
                            </div>
                            <div className="format-note">
                                ✅ <strong>Status</strong> column is <strong>not required</strong> — every imported contact will automatically be set to <strong>"New"</strong>.
                            </div>
                            <div className="format-demo">
                                💡 Demo: John Doe | john@example.com | Manager | 9876543210 | https://linkedin.com/in/johndoe | Apple | LinkedIn
                            </div>
                        </div>

                        {/* Drop Zone */}
                        <div
                            className={`drop-zone${dragging ? " dragging" : ""}`}
                            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                            onDragLeave={() => setDragging(false)}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current.click()}
                        >
                            <div className="drop-icon">📂</div>
                            <div className="drop-title">{dragging ? "Drop your file here" : "Drag & drop your file here"}</div>
                            <div className="drop-sub">or <span>click to browse</span></div>
                            <div className="drop-formats">Supported: .xlsx, .xls, .csv</div>
                            {fileName && <div className="drop-file-pill">✅ {fileName}</div>}
                            <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} style={{ display: "none" }} />
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="error-box">
                                <div className="error-title">⚠️ Format Error</div>
                                <pre className="error-pre">{error}</pre>
                                <button className="btn-gcrm btn-danger" style={{ marginTop: 12, padding: "6px 14px", fontSize: 12 }} onClick={resetState}>
                                    🔄 Try Again
                                </button>
                            </div>
                        )}

                        {/* Preview Table */}
                        {tableData.length > 0 && (
                            <div className="panel">
                                <div className="panel-header">
                                    <div>
                                        <span>Preview — </span>
                                        <span style={{ color: "#7da4f5", fontFamily: "'DM Mono', monospace" }}>{tableData.length}</span>
                                        <span style={{ fontWeight: 500, color: "#555" }}> record{tableData.length !== 1 ? "s" : ""} found</span>
                                    </div>
                                    <button className="btn-gcrm btn-ghost" style={{ padding: "5px 12px", fontSize: 12 }} onClick={resetState}>
                                        ✕ Clear
                                    </button>
                                </div>

                                <div style={{ padding: "10px 20px 6px", fontSize: 12.5, color: "#555" }}>
                                    Status will be set to <span className="badge-new" style={{ marginLeft: 4 }}>New</span> for all records automatically.
                                </div>

                                <div style={{ overflowX: "auto" }}>
                                    <table className="preview-table">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                {headers.map((h) => <th key={h}>{h}</th>)}
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tableData.map((row, i) => (
                                                <tr key={i}>
                                                    <td style={{ color: "#444", fontSize: 12 }}>{i + 1}</td>
                                                    {headers.map((h) => (
                                                        <td key={h}>
                                                            {row[h]
                                                                ? <span style={h.toLowerCase().includes("url") ? { color: "#7da4f5" } : {}}>{row[h]}</span>
                                                                : <span style={{ color: "#3a3a3a" }}>—</span>}
                                                        </td>
                                                    ))}
                                                    <td><span className="badge-new">New</span></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Upload row */}
                                <div style={{ padding: "16px 20px", borderTop: "1px solid #1e1e1e", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12 }}>
                                    {uploaded && !uploading && (
                                        <div className="success-pill">✅ Converted to JSON successfully!</div>
                                    )}
                                    <button
                                        className="btn-gcrm btn-primary"
                                        style={{ padding: "10px 24px", fontSize: 14 }}
                                        onClick={handleUpload}
                                        disabled={uploading}
                                    >
                                        {uploading ? (
                                            <><div className="spinner" /> Uploading...</>
                                        ) : "⬆️ Upload to Database"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </>
    )
}

export default Imports