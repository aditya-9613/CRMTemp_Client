import { useState } from "react";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Spinner from "react-bootstrap/Spinner";
import { baseURL } from "../../Utils/baseURL";
import axios from "axios";


const ContactModal = ({ show, onClose, onContactAdded }) => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        profileURL: "",
        company: "",
        source: "",
        designation: "",
        status: "New",
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setFormData({
            name: "",
            email: "",
            phone: "",
            profileURL: "",
            company: "",
            source: "",
            designation: "",
            status: "New",
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        
        axios({
            url: `${baseURL}/api/v1/contact/createContact`,
            method: "POST",
            data: formData,
            withCredentials: true,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("user")}`,
            },
        })
            .then((res) => {
                if (res.status === 200) {
                    setLoading(false);
                    resetForm();
                    window.location.reload()
                    if (onContactAdded) onContactAdded(res.data);
                    onClose();
                }
            })
            .catch((err) => {
                const message = err.response?.data?.message || "Something went wrong";
                const code = err?.response?.status || "";
                setLoading(false);
                alert(`${message}${code ? ": " + code : ""}`);
            });
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    return (
        <>
            <style>{`
                .cm-modal .modal-content { background: #161616; border: 1px solid #2a2a2a; border-radius: 14px; color: #ccc; }
                .cm-modal .modal-header { border-bottom: 1px solid #222; }
                .cm-modal .modal-footer { border-top: 1px solid #222; }
                .cm-modal .modal-title { font-size: 15px; font-weight: 700; color: #f0f0f0; letter-spacing: -0.2px; }
                .cm-modal .btn-close { filter: invert(1) brightness(0.5); }
                .cm-modal .btn-close:hover { filter: invert(1) brightness(0.9); }
                .cm-modal .form-label { font-size: 11px; font-weight: 700; color: #555; text-transform: uppercase; letter-spacing: 0.6px; }
                .cm-modal .form-control,
                .cm-modal .form-select { background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 8px; color: #ccc; font-size: 13.5px; }
                .cm-modal .form-control::placeholder { color: #3a3a3a; }
                .cm-modal .form-control:focus,
                .cm-modal .form-select:focus { background: #1e1e1e; border-color: #3b5bdb; color: #ccc; box-shadow: 0 0 0 3px rgba(59,91,219,0.15); }
                .cm-modal .form-select {
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
                    background-size: 16px 16px;
                    background-repeat: no-repeat;
                    background-position: right 10px center;
                    padding-right: 36px;
                }
                .cm-modal .form-select option { background: #1a1a1a; color: #ccc; }
                .cm-title-icon { width: 30px; height: 30px; background: #1e2a4a; border-radius: 8px; }
                .cm-btn-cancel { background: #1e1e1e; border: 1px solid #2a2a2a; color: #888; font-size: 13px; font-weight: 600; }
                .cm-btn-cancel:hover { background: #252525; color: #aaa; border-color: #2a2a2a; }
                .cm-btn-save { background: #3b5bdb; border: none; font-size: 13px; font-weight: 600; }
                .cm-btn-save:hover { background: #3451c7; }
                .cm-btn-save:disabled, .cm-btn-cancel:disabled { opacity: 0.6; }
            `}</style>

            <Modal show={show} onHide={handleClose} centered size="lg" dialogClassName="cm-modal">

                <Modal.Header closeButton className="px-4 py-3">
                    <Modal.Title className="d-flex align-items-center gap-2">
                        <div className="cm-title-icon d-flex align-items-center justify-content-center flex-shrink-0">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6b9ef5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <line x1="19" y1="8" x2="19" y2="14" />
                                <line x1="22" y1="11" x2="16" y2="11" />
                            </svg>
                        </div>
                        Add New Contact
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body className="px-4 py-4">
                    <Form onSubmit={handleSubmit} id="contact-form">

                        {/* Row 1: Name | Phone */}
                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Full Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="name"
                                        placeholder="John Doe"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Phone</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="phone"
                                        placeholder="+91 9876543210"
                                        value={formData.phone}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        {/* Row 2: Email | Designation */}
                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        placeholder="john@email.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Designation</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="designation"
                                        placeholder="Owner / Founder"
                                        value={formData.designation}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        {/* Row 3: Company | Profile URL */}
                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Company</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="company"
                                        placeholder="Company Name"
                                        value={formData.company}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Profile URL</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="profileURL"
                                        placeholder="LinkedIn / Website"
                                        value={formData.profileURL}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        {/* Row 4: Source (input) */}
                        <Row>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Source</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="source"
                                        placeholder="LinkedIn / Website / Referral"
                                        value={formData.source}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                    </Form>
                </Modal.Body>

                <Modal.Footer className="px-4 py-3 d-flex justify-content-end gap-2">
                    <Button
                        className="cm-btn-cancel"
                        onClick={handleClose}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        form="contact-form"
                        className="cm-btn-save d-flex align-items-center gap-2"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                                    <polyline points="17 21 17 13 7 13 7 21" />
                                    <polyline points="7 3 7 8 15 8" />
                                </svg>
                                Save Contact
                            </>
                        )}
                    </Button>
                </Modal.Footer>

            </Modal>
        </>
    );
};

export default ContactModal;