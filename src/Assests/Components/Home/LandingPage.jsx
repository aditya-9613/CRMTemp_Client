import { useState } from "react";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import InputGroup from "react-bootstrap/InputGroup";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import "bootstrap/dist/css/bootstrap.min.css";
import '../../Styles/global.css'
import axios from "axios";
import { baseURL } from "../../Utils/baseURL";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────────── */
const getStrength = (pw) => {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
};

const STRENGTH_META = [
  { label: "", color: "transparent", pct: "0%" },
  { label: "Weak", color: "#ff4444", pct: "33%" },
  { label: "Fair", color: "#ff9900", pct: "66%" },
  { label: "Strong", color: "#44dd88", pct: "100%" },
  { label: "Strong", color: "#44dd88", pct: "100%" },
];

/* ─────────────────────────────────────────
   ICONS
───────────────────────────────────────── */
const EyeIcon = ({ open }) => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {open ? (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    )}
  </svg>
);

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

/* ─────────────────────────────────────────
   FULL-PAGE LOADER OVERLAY
───────────────────────────────────────── */
const LoaderOverlay = ({ message }) => (
  <>
    <style>{`
      @keyframes crm-spin {
        0%   { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes crm-fade-in {
        from { opacity: 0; }
        to   { opacity: 1; }
      }
      .crm-loader-overlay {
        position: fixed;
        inset: 0;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 18px;
        background: rgba(10, 10, 20, 0.72);
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
        animation: crm-fade-in 0.2s ease forwards;
        cursor: not-allowed;
        user-select: none;
      }
      .crm-loader-spinner {
        width: 52px;
        height: 52px;
        border-radius: 50%;
        border: 4px solid rgba(255,255,255,0.15);
        border-top-color: #44dd88;
        animation: crm-spin 0.75s linear infinite;
      }
      .crm-loader-text {
        color: #fff;
        font-size: 15px;
        font-weight: 500;
        letter-spacing: 0.3px;
        opacity: 0.88;
      }
    `}</style>
    <div className="crm-loader-overlay">
      <div className="crm-loader-spinner" />
      <span className="crm-loader-text">{message}</span>
    </div>
  </>
);

/* ─────────────────────────────────────────
   LANDING PAGE
───────────────────────────────────────── */
const LandingPage = () => {
  const [mode, setMode] = useState("signup");
  const [fading, setFading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showPass2, setShowPass2] = useState(false);
  const [agreed, setAgreed] = useState(true);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  // ── Signup state ──
  const [signupFullName, setSignupFullName] = useState("");
  const [signupUsername, setSignupUsername] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");

  // ── Login state ──
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const navigate = useNavigate();

  const sm = STRENGTH_META[getStrength(signupPassword)];

  const switchMode = (next) => {
    if (next === mode) return;
    setFading(true);
    setTimeout(() => {
      setMode(next);
      setShowPass(false);
      setShowPass2(false);
      setFading(false);
    }, 280);
  };

  /* ── Submit handler ── */
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    if (mode === "signup") {
      const Data = {
        fullName: signupFullName,
        username: signupUsername,
        email: signupEmail,
        password: signupPassword,
        confirmPassword: signupConfirmPassword,
      };

      axios({
        url: `${baseURL}/api/v1/user/userRegister`,
        method: 'POST',
        data: Data,
      })
        .then((res) => {
          if (res.status === 201) {
            alert('User Created Successfully');
            setMode('login');
          }
        })
        .catch((err) => {
          const message = err.response?.data?.message;
          const code = err?.response?.status;
          alert(`${message}: ${code}`);
        })
        .finally(() => {
          setLoading(false);
        });

    } else {
      const Data = {
        username: loginUsername,
        password: loginPassword,
      };

      axios({
        url: `${baseURL}/api/v1/user/loginUser`,
        method: 'POST',
        data: Data,
      })
        .then((res) => {
          if (res.status === 200) {
            localStorage.setItem('user', res.data.data.accessToken);
            Cookies.set("accessToken", res.data.data.accessToken);
            Cookies.set("refreshToken", res.data.data.refreshToken);
            navigate('/Dashboard');
          }
        })
        .catch((err) => {
          const message = err.response?.data?.message;
          const code = err?.response?.status;
          alert(`${message}: ${code}`);
          console.log(err.response);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  return (
    <>
      {/* ── Full-page blocking loader ── */}
      {loading && (
        <LoaderOverlay
          message={mode === "signup" ? "Creating your account…" : "Logging you in…"}
        />
      )}

      <div className="crm-root">
        {/* ── Toggle Pill ── */}
        <Button
          className="crm-toggle"
          onClick={() => switchMode(mode === "signup" ? "login" : "signup")}
        >
          <span className={`crm-toggle-thumb ${mode === "login" ? "to-login" : ""}`}>
            {mode === "signup" ? "Sign Up" : "Log In"}
          </span>
          <span className="crm-toggle-lbl left" style={{ opacity: mode === "login" ? 1 : 0.32 }}>Sign Up</span>
          <span className="crm-toggle-lbl right" style={{ opacity: mode === "signup" ? 1 : 0.32 }}>Log In</span>
        </Button>

        {/* ── Card ── */}
        <Card className={`crm-card ${fading ? "fading" : ""}`}>

          <Card.Header>
            <h1 className="crm-brand">CRM</h1>
            <p className="crm-brand-sub">Manage your customers efficiently</p>
          </Card.Header>

          <Card.Body>
            <h2 className="crm-form-title">
              {mode === "signup" ? "Create Your Account" : "Welcome Back"}
            </h2>

            <Form noValidate onSubmit={handleSubmit}>

              {/* ── Google button ── */}
              <Button className="crm-google mb-3" type="button">
                <GoogleIcon />
                {mode === "signup" ? "Sign up with Google" : "Continue with Google"}
              </Button>

              {/* ── Divider ── */}
              <div className="crm-divider mb-3">
                <span>or</span>
              </div>

              {/* ────── SIGN UP fields ────── */}
              {mode === "signup" && (
                <>
                  <Form.Group className="mb-3">
                    <Form.Control
                      className="crm-input"
                      type="text"
                      placeholder="Full Name"
                      value={signupFullName}
                      onChange={e => setSignupFullName(e.target.value)}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Control
                      className="crm-input"
                      type="text"
                      placeholder="Username"
                      value={signupUsername}
                      onChange={e => setSignupUsername(e.target.value)}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Control
                      className="crm-input"
                      type="email"
                      placeholder="Email"
                      value={signupEmail}
                      onChange={e => setSignupEmail(e.target.value)}
                    />
                  </Form.Group>

                  {/* Password */}
                  <Form.Group className="mb-2">
                    <InputGroup>
                      <Form.Control
                        className="crm-input"
                        type={showPass ? "text" : "password"}
                        placeholder="Password"
                        value={signupPassword}
                        onChange={e => setSignupPassword(e.target.value)}
                      />
                      <Button className="crm-eye-btn" type="button" onClick={() => setShowPass(v => !v)}>
                        <EyeIcon open={showPass} />
                      </Button>
                    </InputGroup>
                  </Form.Group>

                  {/* Confirm Password */}
                  <Form.Group className="mb-2">
                    <InputGroup>
                      <Form.Control
                        className="crm-input"
                        type={showPass2 ? "text" : "password"}
                        placeholder="Confirm Password"
                        value={signupConfirmPassword}
                        onChange={e => setSignupConfirmPassword(e.target.value)}
                      />
                      <Button className="crm-eye-btn" type="button" onClick={() => setShowPass2(v => !v)}>
                        <EyeIcon open={showPass2} />
                      </Button>
                    </InputGroup>
                  </Form.Group>

                  {/* Strength bar */}
                  <div className="mb-3">
                    <div className="strength-track">
                      <div className="strength-fill" style={{ width: sm.pct, background: sm.color }} />
                    </div>
                    <Row className="strength-labels g-0">
                      <Col><span>Weak</span></Col>
                      <Col className="text-center"><span>Fair</span></Col>
                      <Col className="text-end"><span>Strong</span></Col>
                    </Row>
                    {signupPassword && (
                      <small style={{ color: sm.color, fontWeight: 600 }}>{sm.label}</small>
                    )}
                  </div>

                  {/* Terms */}
                  <Form.Group className="mb-3 crm-check">
                    <Form.Check
                      type="checkbox"
                      id="chk-terms"
                      label="I agree to Terms & Privacy"
                      checked={agreed}
                      onChange={e => setAgreed(e.target.checked)}
                    />
                  </Form.Group>
                </>
              )}

              {/* ────── LOGIN fields ────── */}
              {mode === "login" && (
                <>
                  <Form.Group className="mb-3">
                    <Form.Control
                      className="crm-input"
                      type="text"
                      placeholder="Username"
                      value={loginUsername}
                      onChange={e => setLoginUsername(e.target.value)}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <InputGroup>
                      <Form.Control
                        className="crm-input"
                        type={showPass ? "text" : "password"}
                        placeholder="Password"
                        value={loginPassword}
                        onChange={e => setLoginPassword(e.target.value)}
                      />
                      <Button className="crm-eye-btn" type="button" onClick={() => setShowPass(v => !v)}>
                        <EyeIcon open={showPass} />
                      </Button>
                    </InputGroup>
                  </Form.Group>

                  <div className="d-flex justify-content-between align-items-center mb-3 crm-check">
                    <Form.Check
                      type="checkbox"
                      id="chk-remember"
                      label="Remember Me"
                      checked={remember}
                      onChange={e => setRemember(e.target.checked)}
                    />
                    <button className="crm-link" type="button">Forgot Password?</button>
                  </div>
                </>
              )}

              {/* ── CTA ── */}
              <Button className="crm-cta mb-3" type="submit" disabled={loading}>
                {mode === "signup" ? "Create Account" : "Login"}
              </Button>

              {/* ── Switch link ── */}
              <p className="text-center crm-muted mb-0">
                {mode === "signup" ? "Already have an account?" : "Don't have an account?"}{" "}
                <button
                  className="crm-link"
                  type="button"
                  onClick={() => switchMode(mode === "signup" ? "login" : "signup")}
                >
                  {mode === "signup" ? "Log In" : "Sign Up"}
                </button>
              </p>

            </Form>
          </Card.Body>
        </Card>
      </div>
    </>
  );
};

export default LandingPage;