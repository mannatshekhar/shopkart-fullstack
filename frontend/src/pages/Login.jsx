import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { loginCustomer } from "../services/api";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const justRegistered = Boolean(location.state?.registered);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Email and password are required.");
      return;
    }

    setSubmitting(true);
    try {
      await loginCustomer(form);
      navigate("/home", { replace: true });
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Invalid Credentials");
      } else {
        setError(err.response?.data?.message || "Something went wrong. Please try again.");
      }
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
          <h1 className="brand__headline">One account.<br />Every order,<br />sorted.</h1>
          <p className="brand__sub">Log back in to pick up right where you left off.</p>
        </div>
        <div className="brand__foot">
          <span>ShopKart Engineering &mdash; Frontend Authentication Lab</span>
        </div>
      </aside>

      <main className="stage">
        <section className="panel">
          <h2 className="form__title">Welcome back</h2>
          <p className="form__hint">Log in with the email you registered with.</p>

          {justRegistered && (
            <div className="banner banner--success">Account created. You can log in now.</div>
          )}
          {error && <div className="banner banner--error">{error}</div>}

          <form className="form" onSubmit={handleSubmit} noValidate>
            <label className="field">
              <span className="field__label">Email</span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
              />
            </label>

            <label className="field">
              <span className="field__label">Password</span>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
              />
            </label>

            <button type="submit" className="btn btn--primary btn--block" disabled={submitting}>
              {submitting ? "Logging in…" : "Log in"}
            </button>
          </form>

          <p className="form__switch">
            New to ShopKart? <Link to="/register">Create an account</Link>
          </p>
        </section>
      </main>
    </div>
  );
}

export default Login;
