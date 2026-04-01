import axios from "axios";
import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { baseURL } from "../../Utils/baseURL";

const STATUS_OPTIONS = ["New", "Connected", "Pending", "In Progress", "Completed", "Rejected", "Archived"];

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

// website replaced with profileURL
const FIELDS = [
    { key: "name", label: "Full Name", placeholder: "e.g. Jane Smith", col: 6, required: true },
    { key: "designation", label: "Designation", placeholder: "e.g. Product Manager", col: 6 },
    { key: "email", label: "Email Address", placeholder: "jane@company.com", col: 6, type: "email" },
    { key: "phone", label: "Phone", placeholder: "+1 555 000 0000", col: 6 },
    { key: "company", label: "Company", placeholder: "Acme Corp", col: 6 },
    { key: "profileURL", label: "Profile URL", placeholder: "https://linkedin.com/in/…", col: 6 },
];

/**
 * EditContactModal
 *
 * Props:
 *  show         {boolean}   — whether modal is visible
 *  contact      {object}    — contact object (must include `id`)
 *  contactIndex {number}    — used for avatar color
 *  onHide       {function}  — called to close modal
 *  onSave       {function}  — called with updated contact object
 */
const EditContactModal = ({ show, contact, contactIndex = 0, onHide, onSave }) => {
    const [form, setForm] = useState({});
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (contact) {
            setForm({ ...contact });
            setErrors({});
        }
    }, [contact, show]);

    const handleChange = (key, value) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        if (errors[key]) setErrors((prev) => ({ ...prev, [key]: null }));
    };

    const validate = () => {
        const e = {};
        if (!form.name?.trim()) e.name = "Name is required";
        if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
            e.email = "Invalid email address";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;
        setSaving(true);

        const payload = {
            ...form,
            message: form.message ?? "",
            updatedAt: new Date().toISOString(),
        };

        axios({
            url: `${baseURL}/api/v1/contact/updateContact`,
            method: 'PUT',
            data: payload,
            withCredentials: true,
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('user')}`
            }
        }).then((res) => {
            if (res.status === 200) {
                setSaving(false);
                onSave?.(payload);
                alert('Contact Updated Successfully')
                window.location.reload()
            }
        }).catch((err) => {
            setSaving(false);
            const message = err.response?.data?.message
            const code = err?.response?.status
            alert(`${code}:${message}`)
        })
    };

    const statusStyle = STATUS_STYLES[form.status] || {};

    return (
        <>
            <style>{`
        .ect-modal .modal-content {
          background: #111 !important;
          border: 1px solid #222 !important;
          border-radius: 14px !important;
          box-shadow: 0 32px 80px rgba(0,0,0,0.7) !important;
          overflow: hidden;
        }
        .ect-modal .modal-header { border-bottom: 1px solid #1c1c1c !important; }
        .ect-modal .modal-footer { border-top: 1px solid #1c1c1c !important; background: #0e0e0e; }
        .ect-field {
          background: #1a1a1a !important;
          border: 1px solid #2a2a2a !important;
          color: #d0d0d0 !important;
          border-radius: 8px !important;
          font-size: 13.5px !important;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .ect-field:focus {
          border-color: #5b6ef5 !important;
          box-shadow: 0 0 0 2.5px rgba(91,110,245,0.18) !important;
          color: #eee !important;
          background: #1e1e1e !important;
        }
        .ect-field::placeholder { color: #3a3a3a !important; }
        .ect-field.is-invalid   { border-color: #f87171 !important; }
        .ect-field option        { background: #1a1a1a; }
        .ect-label {
          font-size: 11.5px; font-weight: 600; color: #555;
          text-transform: uppercase; letter-spacing: 0.55px; margin-bottom: 5px;
        }
        .ect-save-btn {
          background: #5b6ef5 !important; border: none !important;
          font-size: 13.5px !important; font-weight: 600 !important;
          border-radius: 8px !important; padding: 8px 22px !important;
          transition: opacity 0.15s;
        }
        .ect-save-btn:hover:not(:disabled) { opacity: 0.88 !important; }
        .ect-save-btn:disabled             { opacity: 0.5 !important; }
        .ect-cancel-btn {
          background: #1a1a1a !important; border: 1px solid #2a2a2a !important;
          color: #777 !important; font-size: 13.5px !important;
          font-weight: 500 !important; border-radius: 8px !important;
          padding: 8px 18px !important;
        }
        .ect-cancel-btn:hover { background: #222 !important; color: #aaa !important; }
        .ect-section-divider {
          font-size: 11px; font-weight: 700; color: #333;
          text-transform: uppercase; letter-spacing: 0.7px;
          display: flex; align-items: center; gap: 8px;
        }
        .ect-section-divider::after { content: ''; flex: 1; height: 1px; background: #1e1e1e; }
        @keyframes ectIn {
          from { opacity: 0; transform: scale(0.97) translateY(8px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);   }
        }
        .ect-modal .modal-dialog { animation: ectIn 0.22s cubic-bezier(0.16,1,0.3,1) both; }
      `}</style>

            <Modal show={show} onHide={onHide} centered size="lg" className="ect-modal" backdrop="static">

                {/* ── Header ── */}
                <Modal.Header closeButton className="px-4 py-3" style={{ background: "#0e0e0e" }}>
                    <div className="d-flex align-items-center gap-3">
                        <Avatar name={form.name || "?"} index={contactIndex} size={42} />
                        <div>
                            <div className="fw-bold" style={{ fontSize: 15.5, color: "#e0e0e0" }}>
                                {form.name || "Edit Contact"}
                            </div>
                            <div style={{ fontSize: 12, color: "#444", marginTop: 1 }}>
                                {form.designation || "—"}{form.company ? ` · ${form.company}` : ""}
                            </div>
                        </div>
                    </div>
                </Modal.Header>

                {/* ── Body ── */}
                <Modal.Body className="px-4 py-4" style={{ background: "#111", maxHeight: "68vh", overflowY: "auto" }}>

                    {/* Contact Details */}
                    <div className="ect-section-divider mb-3">Contact Details</div>
                    <Row className="g-3 mb-4">
                        {FIELDS.map(({ key, label, placeholder, col, type, required }) => (
                            <Col md={col} key={key}>
                                <div className="ect-label">
                                    {label}{required && <span style={{ color: "#f87171" }}> *</span>}
                                </div>
                                <Form.Control
                                    type={type || "text"}
                                    className={`ect-field ${errors[key] ? "is-invalid" : ""}`}
                                    placeholder={placeholder}
                                    value={form[key] || ""}
                                    onChange={(e) => handleChange(key, e.target.value)}
                                />
                                {errors[key] && (
                                    <div style={{ fontSize: 11.5, color: "#f87171", marginTop: 4 }}>
                                        {errors[key]}
                                    </div>
                                )}
                            </Col>
                        ))}
                    </Row>

                    {/* Classification */}
                    <div className="ect-section-divider mb-3">Classification</div>
                    <Row className="g-3 mb-4">
                        {/* Status — dropdown */}
                        <Col md={6}>
                            <div className="ect-label">Status</div>
                            <Form.Select
                                className="ect-field"
                                value={form.status || ""}
                                onChange={(e) => handleChange("status", e.target.value)}
                                style={form.status ? { color: statusStyle.color } : {}}
                            >
                                <option value="">Select status…</option>
                                {STATUS_OPTIONS.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </Form.Select>
                        </Col>

                        {/* Source — free-text input (no dropdown) */}
                        <Col md={6}>
                            <div className="ect-label">Source</div>
                            <Form.Control
                                type="text"
                                className="ect-field"
                                placeholder="e.g. LinkedIn, Referral, Cold Email…"
                                value={form.source || ""}
                                onChange={(e) => handleChange("source", e.target.value)}
                            />
                        </Col>
                    </Row>

                    {/* Message */}
                    <div className="ect-section-divider mb-3">Message</div>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        className="ect-field"
                        placeholder="Add any notes about this contact…"
                        value={form.message ?? ""}
                        onChange={(e) => handleChange("message", e.target.value)}
                        style={{ resize: "none" }}
                    />
                </Modal.Body>

                {/* ── Footer (no id display) ── */}
                <Modal.Footer className="px-4 py-3 d-flex justify-content-end gap-2">
                    <Button className="ect-cancel-btn" onClick={onHide} disabled={saving}>
                        Cancel
                    </Button>
                    <Button className="ect-save-btn" onClick={handleSave} disabled={saving}>
                        {saving ? (
                            <span className="d-flex align-items-center gap-2">
                                <span className="spinner-border spinner-border-sm" />
                                Saving…
                            </span>
                        ) : "Save Changes"}
                    </Button>
                </Modal.Footer>

            </Modal>
        </>
    );
};

export default EditContactModal;