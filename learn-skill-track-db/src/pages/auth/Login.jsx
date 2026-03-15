import { useState } from "react";
import { useNavigate } from "react-router-dom";
import InputField from "../../components/form/InputField";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import { useAuth } from "../../context/AuthContext";
import "../../style/login.css";

/* ─── Eye Icon SVGs ─── */
const EyeOpen = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const EyeClosed = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

/* ════════════════════════════════════════
   LOGIN COMPONENT
════════════════════════════════════════ */
const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});

  /* ─── Validation ─── */
  const validateEmail = (val) =>
    /^[^\s@]+@[^\s@]+\.(com|in|net|org|edu|co\.in|ac\.in)$/i.test(val)
      ? ""
      : "Enter a valid email (e.g. user@example.com).";

  const validatePassword = (val) => (!val ? "Password is required." : "");

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (touched.email)
      setFieldErrors((prev) => ({
        ...prev,
        email: validateEmail(e.target.value),
      }));
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (touched.password)
      setFieldErrors((prev) => ({
        ...prev,
        password: validatePassword(e.target.value),
      }));
  };

  const handleBlur = (field, value) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (field === "email")
      setFieldErrors((prev) => ({ ...prev, email: validateEmail(value) }));
    if (field === "password")
      setFieldErrors((prev) => ({
        ...prev,
        password: validatePassword(value),
      }));
  };

  /* ─── Submit ─── */
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    // Validate before submit
    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);

    setTouched({ email: true, password: true });
    setFieldErrors({ email: emailErr, password: passErr });

    if (emailErr || passErr) return;

    setLoading(true);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setLoading(false);
      if (
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password" ||
        err.code === "auth/invalid-credential"
      ) {
        setError("Invalid email or password. Please try again.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many failed attempts. Please wait and try again.");
      } else {
        setError(err.message || "Login failed. Please try again.");
      }
    }
  };

  return (
    <div className="login-container">
      {loading && <Loader text="Logging in..." />}

      <form className="login-card" onSubmit={handleLogin} noValidate>
        {/* Logo */}
        <div className="login-logo">
          <span className="login-logo-text">LST</span>
          <span className="login-logo-sub">Learn · Skill · Track</span>
        </div>

        <h2 className="title">Welcome Back</h2>
        <p className="login-subtitle">Sign in to your account</p>

        {error && <div className="error-banner">⚠ {error}</div>}

        {/* Email Field */}
        <div className="form-group">
          <label>Email Address</label>
          <InputField
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={handleEmailChange}
            onBlur={() => handleBlur("email", email)}
            className={
              touched.email
                ? fieldErrors.email
                  ? "input-error"
                  : "input-ok"
                : ""
            }
            autoComplete="email"
          />
          {touched.email && fieldErrors.email && (
            <p className="field-error">{fieldErrors.email}</p>
          )}
        </div>

        {/* Password Field with Eye */}
        <div className="form-group">
          <label>Password</label>
          <div className="password-field">
            <InputField
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={handlePasswordChange}
              onBlur={() => handleBlur("password", password)}
              className={`pwd-input ${
                touched.password
                  ? fieldErrors.password
                    ? "input-error"
                    : "input-ok"
                  : ""
              }`}
              autoComplete="current-password"
            />
            <Button
              type="button"
              className="eye-btn"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOpen /> : <EyeClosed />}
            </Button>
          </div>
          {touched.password && fieldErrors.password && (
            <p className="field-error">{fieldErrors.password}</p>
          )}
        </div>

        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </Button>

        <p className="register-link">
          Don't have an account?{" "}
          <span onClick={() => navigate("/register")}>Register</span>
        </p>
      </form>
    </div>
  );
};

export default Login;
