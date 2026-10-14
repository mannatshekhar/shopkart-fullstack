import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerCustomer } from "../services/api";

const initialForm = {
  fullName: "",
  email: "",
  password: "",
  phone: "",
};

function validate(form) {
  const errors = {};

  if (!form.fullName.trim()) {
    errors.fullName = "Full name is required.";
  }

  if (!form.email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!form.password) {
    errors.password = "Password is required.";
  } else if (form.password.length < 6) {
    errors.password = "Password must be at least 6 characters.";
  }

  if (!form.phone.trim()) {
    errors.phone = "Phone number is required.";
  }

  return errors;
}

function Register() {
  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");

    const errors = validate(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    try {
      await registerCustomer(form);
      navigate("/login", { state: { registered: true } });
    } catch (err) {
      const message =
        err.response?.data?.message || "Something went wrong. Please try again.";
      setApiError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="shell">
      <aside className="brand">
        <div className="brand__top">
          <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M5 8H8.5L11.2 21.5C11.5 22.9 12.7 24 14.2 24H25.5C26.9 24 28.1 23 28.4 21.6L30.5 12.5H9.7" stroke="#F2A93B" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="15" cy="28.5" r="1.8" fill="#F2A93B"/>
            <circle cx="24.5" cy="28.5" r="1.8" fill="#F2A93B"/>
          </svg>
          <span className="brand__name">ShopKart</span>
        </div>
        <div className="brand__mid">
          <h1 className="brand__headline">Join ShopKart<br />in under a minute.</h1>
          <p className="brand__sub">Create an account to track orders, save addresses, and check out faster every time.</p>
        </div>
        <div className="brand__foot">
          <span>ShopKart Engineering &mdash; Frontend Authentication Lab</span>
        </div>
      </aside>

      <main className="stage">
        <section className="panel">
          <h2 className="form__title">Create your account</h2>
          <p className="form__hint">Takes less than a minute — no card required.</p>

          {apiError && <div className="banner banner--error">{apiError}</div>}

          <form className="form" onSubmit={handleSubmit} noValidate>
            <label className="field">
              <span className="field__label">Full name</span>
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Jordan Rivera"
              />
              {fieldErrors.fullName && <span className="field__error">{fieldErrors.fullName}</span>}
            </label>

            <label className="field">
              <span className="field__label">Email</span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
              />
              {fieldErrors.email && <span className="field__error">{fieldErrors.email}</span>}
            </label>

            <label className="field">
              <span className="field__label">Phone number</span>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="9876543210"
              />
              {fieldErrors.phone && <span className="field__error">{fieldErrors.phone}</span>}
            </label>

            <label className="field">
              <span className="field__label">Password</span>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
              />
              {fieldErrors.password && <span className="field__error">{fieldErrors.password}</span>}
            </label>

            <button type="submit" className="btn btn--primary btn--block" disabled={submitting}>
              {submitting ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className="form__switch">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </section>
      </main>
    </div>
  );
}

export default Register;
