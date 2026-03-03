import { useState } from "react";
import { useNavigate } from "react-router-dom";
import InputField from "../../components/form/InputField";
import RadioGroup from "../../components/form/RadioGroup";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase";
import { doc, setDoc } from "firebase/firestore";
import { schoolSubjects, collegeSubjects } from "../../data/defaultSubjects";
import "../../style/register.css";

/* ─── Validation Helpers ─── */
const validateEmail = (email) => {
  // must contain @ and end with .com / .in / .net / .org etc (at least 2 chars after last dot)
  return (
    /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(email) &&
    /\.(com|in|net|org|edu|co\.in|ac\.in)$/i.test(email)
  );
};

const validatePassword = (password) => {
  const errors = [];
  if (password.length < 8) errors.push("At least 8 characters");
  if (password.length > 14) errors.push("At most 14 characters");
  if (!/[A-Z]/.test(password)) errors.push("One uppercase letter (A-Z)");
  if (!/[a-z]/.test(password)) errors.push("One lowercase letter (a-z)");
  if (!/[0-9]/.test(password)) errors.push("One number (0-9)");
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password))
    errors.push("One special character (!@#$ ...)");
  return errors;
};

const validateMobile = (mobile) => /^\d{10}$/.test(mobile);

/* ─── Password Strength Bar ─── */
const PasswordStrength = ({ password }) => {
  if (!password) return null;
  const errors = validatePassword(password);
  const score = 6 - errors.length; // 0-6
  const percent = Math.round((score / 6) * 100);
  const label =
    score <= 2
      ? "Weak"
      : score <= 4
        ? "Fair"
        : score === 5
          ? "Strong"
          : "Very Strong";
  const color =
    score <= 2
      ? "#ef4444"
      : score <= 4
        ? "#f59e0b"
        : score === 5
          ? "#22c55e"
          : "#16a34a";

  return (
    <div className="pwd-strength">
      <div className="pwd-strength-bar">
        <div
          className="pwd-strength-fill"
          style={{ width: `${percent}%`, background: color }}
        />
      </div>
      <span className="pwd-strength-label" style={{ color }}>
        {label}
      </span>
    </div>
  );
};

/* ─── Password Requirements Checklist ─── */
const PwdChecklist = ({ password }) => {
  if (!password) return null;
  const items = [
    {
      label: "8–14 characters",
      ok: password.length >= 8 && password.length <= 14,
    },
    { label: "Uppercase letter (A-Z)", ok: /[A-Z]/.test(password) },
    { label: "Lowercase letter (a-z)", ok: /[a-z]/.test(password) },
    { label: "Number (0-9)", ok: /[0-9]/.test(password) },
    {
      label: "Special character (!@#$)",
      ok: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password),
    },
  ];
  return (
    <ul className="pwd-checklist">
      {items.map((item) => (
        <li key={item.label} className={item.ok ? "check-ok" : "check-fail"}>
          {item.ok ? "✓" : "✗"} {item.label}
        </li>
      ))}
    </ul>
  );
};

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
   REGISTER COMPONENT
════════════════════════════════════════ */
const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    gender: "",
    educationType: "",
    dob: "",
    mobile: "",
  });

  /* ─── Live field validation ─── */
  const validateField = (name, value) => {
    switch (name) {
      case "firstName":
      case "lastName":
        return value.trim().length < 2 ? "Must be at least 2 characters." : "";
      case "email":
        return !validateEmail(value)
          ? "Enter a valid email (e.g. user@example.com / user@example.in)."
          : "";
      case "password": {
        const errs = validatePassword(value);
        return errs.length > 0 ? errs[0] : "";
      }
      case "mobile":
        return !validateMobile(value)
          ? "Mobile number must be exactly 10 digits."
          : "";
      case "dob":
        return !value ? "Date of birth is required." : "";
      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // For mobile, allow only digits and max 10 chars
    if (name === "mobile" && !/^\d*$/.test(value)) return;
    if (name === "mobile" && value.length > 10) return;

    setFormData((prev) => ({ ...prev, [name]: value }));

    if (touched[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: validateField(name, value),
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setFieldErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  /* ─── Submit ─── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Mark all as touched
    const allTouched = Object.keys(formData).reduce(
      (acc, k) => ({ ...acc, [k]: true }),
      {},
    );
    setTouched(allTouched);

    // Validate all text fields
    const errors = {};
    Object.entries(formData).forEach(([name, value]) => {
      const err = validateField(name, value);
      if (err) errors[name] = err;
    });

    // Radio button check
    if (!formData.gender) errors.gender = "Please select your gender.";
    if (!formData.educationType)
      errors.educationType = "Please select your education type.";

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setError("Please fix the errors below before submitting.");
      return;
    }

    // Full password check
    const pwdErrors = validatePassword(formData.password);
    if (pwdErrors.length > 0) {
      setError("Password does not meet requirements.");
      return;
    }

    setLoading(true);

    try {
      const userCredential = await register(formData.email, formData.password);
      const uid = userCredential.user.uid;

      const profileData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        gender: formData.gender,
        educationType: formData.educationType,
        dob: formData.dob,
        mobile: formData.mobile,
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, "users", uid, "data", "profile"), profileData);

      const subjects =
        formData.educationType === "school" ? schoolSubjects : collegeSubjects;

      await Promise.all(
        subjects.map((sub) =>
          setDoc(doc(db, "users", uid, "subjects", sub.id), sub),
        ),
      );

      setLoading(false);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 1800);
    } catch (err) {
      setLoading(false);
      if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered. Please login.");
      } else if (err.code === "auth/weak-password") {
        setError("Password must be at least 6 characters.");
      } else {
        setError(err.message || "Registration failed. Please try again.");
      }
    }
  };

  /* ─── Helper: field error display ─── */
  const FieldError = ({ name }) =>
    touched[name] && fieldErrors[name] ? (
      <p className="field-error">{fieldErrors[name]}</p>
    ) : null;

  const inputClass = (name) =>
    touched[name] && fieldErrors[name]
      ? "input-error"
      : touched[name]
        ? "input-ok"
        : "";

  return (
    <div className="reg-container">
      {loading && <Loader text="Registering Student..." />}

      {success && !loading && (
        <div className="success-banner">
          ✅ Registration Successful! Redirecting to login...
        </div>
      )}

      <form onSubmit={handleSubmit} className="reg-card" noValidate>
        <h2 className="title">Student Registration</h2>

        {error && <div className="error-banner">⚠ {error}</div>}

        {/* Name Row */}
        <div className="grid">
          <div>
            <InputField
              label="First Name"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              onBlur={handleBlur}
              className={inputClass("firstName")}
            />
            <FieldError name="firstName" />
          </div>
          <div>
            <InputField
              label="Last Name"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              onBlur={handleBlur}
              className={inputClass("lastName")}
            />
            <FieldError name="lastName" />
          </div>
        </div>

        {/* Email */}
        <InputField
          type="email"
          label="Email Address"
          name="email"
          placeholder="e.g. user@example.com"
          value={formData.email}
          onChange={handleChange}
          onBlur={handleBlur}
          className={inputClass("email")}
        />
        <FieldError name="email" />

        {/* Password with eye toggle */}
        <div className="password-wrap">
          <label className="pwd-label">Password</label>
          <div className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="8-14 chars, A-Z, a-z, 0-9, !@#$"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`pwd-input ${inputClass("password")}`}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="eye-btn"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOpen /> : <EyeClosed />}
            </button>
          </div>
          <PasswordStrength password={formData.password} />
          <PwdChecklist password={formData.password} />
          <FieldError name="password" />
        </div>

        {/* Gender */}
        <RadioGroup
          lable="Gender *"
          name="gender"
          value={formData.gender}
          options={[
            { label: "Male", value: "Male" },
            { label: "Female", value: "Female" },
          ]}
          onChange={handleChange}
        />
        {touched.gender && fieldErrors.gender && (
          <p className="field-error">{fieldErrors.gender}</p>
        )}

        {/* Education Type */}
        <RadioGroup
          lable="Education Type *"
          name="educationType"
          value={formData.educationType}
          options={[
            { label: "School", value: "school" },
            { label: "College", value: "college" },
          ]}
          onChange={handleChange}
        />
        {touched.educationType && fieldErrors.educationType && (
          <p className="field-error">{fieldErrors.educationType}</p>
        )}

        {/* DOB */}
        <InputField
          type="date"
          label="Date of Birth"
          name="dob"
          value={formData.dob}
          onChange={handleChange}
          onBlur={handleBlur}
          className={inputClass("dob")}
        />
        <FieldError name="dob" />

        {/* Mobile */}
        <InputField
          type="tel"
          label="Mobile Number (10 digits)"
          name="mobile"
          placeholder="10-digit mobile number"
          value={formData.mobile}
          onChange={handleChange}
          onBlur={handleBlur}
          className={inputClass("mobile")}
        />
        {formData.mobile && (
          <p className="mobile-counter">{formData.mobile.length}/10 digits</p>
        )}
        <FieldError name="mobile" />

        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </Button>

        <p className="login-link">
          Already registered?{" "}
          <span onClick={() => navigate("/login")}>Login</span>
        </p>
      </form>
    </div>
  );
};

export default Register;
