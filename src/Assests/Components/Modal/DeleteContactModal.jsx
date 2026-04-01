import axios from "axios";
import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { baseURL } from "../../Utils/baseURL";

const AVATAR_COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6", "#f59e0b", "#6366f1", "#10b981"];

function getInitials(name = "") {
    return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function Avatar({ name, index, size = 44 }) {
    return (
        <div
            className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white flex-shrink-0"
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

/**
 * DeleteContactModal
 *
 * Props:
 *  show         {boolean}   — whether modal is visible
 *  contact      {object}    — contact object (must include `id`)
 *  contactIndex {number}    — used for avatar color
 *  onHide       {function}  — called to close modal
 *  onConfirm    {function}  — called with { id, message } when deletion is confirmed
 */
const DeleteContactModal = ({ show, contact, contactIndex = 0, onHide, onConfirm }) => {
    const [deleting, setDeleting] = useState(false);
    const [message, setMessage] = useState("");

    // Reset message every time the modal opens for a new contact
    useEffect(() => {
        if (show) setMessage("");
    }, [show, contact]);

    const handleConfirm = async () => {
        setDeleting(true);

        const payload = {
            id: contact?.id,
            message: message.trim() || "",
        };

        // ── Console log on delete ────────────────────────────────
        console.log("🗑️ Delete Contact — payload:", payload);
        console.log("📝 Deletion message:", payload.message ?? "(none)");
        axios({
            url: `${baseURL}/api/v1/contact/deleteContact`,
            method: 'PUT',
            data: payload,
            withCredentials: true,
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('user')}`
            }
        }).then((res) => {
            if (res.status === 200) {
                setDeleting(false);
                onConfirm?.(payload);
                alert('Contact Deleted Successfully')
                window.location.reload()
            }
        }).catch((err) => {
            setDeleting(false);
            const message = err.response?.data?.message
            const code = err?.response?.status
            alert(`${code}:${message}`)
        })
    };

    return (
        <>
            <style>{`
        .dct-modal .modal-content {
          background: #111 !important;
          border: 1px solid #222 !important;
          border-radius: 14px !important;
          box-shadow: 0 32px 80px rgba(0,0,0,0.75) !important;
          overflow: hidden;
        }
        .dct-modal .modal-header { border-bottom: 1px solid #1c1c1c !important; }
        .dct-modal .modal-footer { border-top: 1px solid #1c1c1c !important; background: #0e0e0e; }
        .dct-delete-btn {
          background: #ef4444 !important; border: none !important;
          font-size: 13.5px !important; font-weight: 600 !important;
          border-radius: 8px !important; padding: 8px 22px !important;
          transition: opacity 0.15s;
        }
        .dct-delete-btn:hover:not(:disabled) { opacity: 0.85 !important; }
        .dct-delete-btn:disabled             { opacity: 0.5 !important; }
        .dct-cancel-btn {
          background: #1a1a1a !important; border: 1px solid #2a2a2a !important;
          color: #777 !important; font-size: 13.5px !important;
          font-weight: 500 !important; border-radius: 8px !important;
          padding: 8px 18px !important;
        }
        .dct-cancel-btn:hover { background: #222 !important; color: #aaa !important; }
        .dct-warning-box {
          background: rgba(239,68,68,0.06);
          border: 1px solid rgba(239,68,68,0.18);
          border-radius: 10px; padding: 14px 16px;
        }
        .dct-detail-row {
          display: flex; align-items: center; gap: 8px;
          font-size: 13px; color: #666; margin-bottom: 4px;
        }
        .dct-detail-row:last-child { margin-bottom: 0; }
        .dct-detail-value { color: #aaa; font-weight: 500; }
        .dct-message-field {
          background: #1a1a1a !important;
          border: 1px solid #2a2a2a !important;
          color: #d0d0d0 !important;
          border-radius: 8px !important;
          font-size: 13.5px !important;
          resize: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .dct-message-field:focus {
          border-color: #ef4444 !important;
          box-shadow: 0 0 0 2.5px rgba(239,68,68,0.14) !important;
          color: #eee !important;
          background: #1e1e1e !important;
        }
        .dct-message-field::placeholder { color: #3a3a3a !important; }
        .dct-section-label {
          font-size: 11px; font-weight: 700; color: #333;
          text-transform: uppercase; letter-spacing: 0.7px;
          display: flex; align-items: center; gap: 8px;
        }
        .dct-section-label::after { content: ''; flex: 1; height: 1px; background: #1e1e1e; }
        .dct-trash-icon {
          display: flex; align-items: center; justify-content: center;
          width: 50px; height: 50px; border-radius: 13px;
          background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2);
          flex-shrink: 0;
        }
        @keyframes dctIn {
          from { opacity: 0; transform: scale(0.96) translateY(10px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
        .dct-modal .modal-dialog { animation: dctIn 0.2s cubic-bezier(0.16,1,0.3,1) both; }
      `}</style>

            <Modal show={show} onHide={onHide} centered size="md" className="dct-modal" backdrop="static">

                {/* ── Header ── */}
                <Modal.Header closeButton className="px-4 py-3" style={{ background: "#0e0e0e" }}>
                    <div className="d-flex align-items-center gap-3">
                        <div className="dct-trash-icon">
                            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                <path d="M10 11v6" /><path d="M14 11v6" />
                                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                            </svg>
                        </div>
                        <div>
                            <div className="fw-bold" style={{ fontSize: 15, color: "#e0e0e0" }}>Delete Contact</div>
                            <div style={{ fontSize: 11.5, color: "#444" }}>This action cannot be undone</div>
                        </div>
                    </div>
                </Modal.Header>

                {/* ── Body ── */}
                <Modal.Body className="px-4 py-4" style={{ background: "#111" }}>

                    {/* Contact summary */}
                    <div className="d-flex align-items-center gap-3 mb-4">
                        <Avatar name={contact?.name || "?"} index={contactIndex} size={48} />
                        <div>
                            <div className="fw-semibold mb-1" style={{ fontSize: 15, color: "#ddd" }}>
                                {contact?.name || "—"}
                            </div>
                            <div style={{ fontSize: 12, color: "#555" }}>
                                {contact?.designation || ""}
                                {contact?.designation && contact?.company ? " · " : ""}
                                {contact?.company || ""}
                            </div>
                        </div>
                    </div>

                    {/* Contact meta */}
                    <div className="mb-4" style={{ padding: "12px 14px", background: "#161616", borderRadius: 10, border: "1px solid #1e1e1e" }}>
                        {contact?.email && (
                            <div className="dct-detail-row">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2">
                                    <rect x="2" y="4" width="20" height="16" rx="2" />
                                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                </svg>
                                <span className="dct-detail-value">{contact.email}</span>
                            </div>
                        )}
                        {contact?.phone && (
                            <div className="dct-detail-row">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2">
                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.06 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21 16z" />
                                </svg>
                                <span className="dct-detail-value">{contact.phone}</span>
                            </div>
                        )}
                        {contact?.source && (
                            <div className="dct-detail-row">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M12 2a14.5 14.5 0 0 0 0 20A14.5 14.5 0 0 0 12 2" />
                                    <path d="M2 12h20" />
                                </svg>
                                <span style={{ color: "#555" }}>Source:</span>
                                <span className="dct-detail-value">{contact.source}</span>
                            </div>
                        )}
                    </div>

                    {/* Warning */}
                    <div className="dct-warning-box mb-4">
                        <div className="d-flex align-items-start gap-2">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
                                <path d="M12 9v4" /><path d="M12 17h.01" />
                            </svg>
                            <p className="mb-0" style={{ fontSize: 12.5, color: "#c0534f", lineHeight: 1.6 }}>
                                You're about to permanently delete{" "}
                                <strong style={{ color: "#ef9999" }}>{contact?.name}</strong>.
                                All associated data and activity history will be removed and{" "}
                                <strong style={{ color: "#ef9999" }}>cannot be recovered</strong>.
                            </p>
                        </div>
                    </div>

                    {/* message */}
                    <div className="dct-section-label mb-3">Reason / message</div>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        className="dct-message-field"
                        placeholder="Add a reason for deletion or any final notes…"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                </Modal.Body>

                {/* ── Footer ── */}
                <Modal.Footer className="px-4 py-3 d-flex justify-content-end gap-2">
                    <Button className="dct-cancel-btn" onClick={onHide} disabled={deleting}>
                        Cancel
                    </Button>
                    <Button className="dct-delete-btn" onClick={handleConfirm} disabled={deleting}>
                        {deleting ? (
                            <span className="d-flex align-items-center gap-2">
                                <span className="spinner-border spinner-border-sm" />
                                Deleting…
                            </span>
                        ) : (
                            <span className="d-flex align-items-center gap-2">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="3 6 5 6 21 6" />
                                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                    <path d="M10 11v6" /><path d="M14 11v6" />
                                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                                </svg>
                                Delete Contact
                            </span>
                        )}
                    </Button>
                </Modal.Footer>

            </Modal>
        </>
    );
};

export default DeleteContactModal;