(() => {
  "use strict";

  const API_BASE = "/customers";

  const viewAuth = document.getElementById("view-auth");
  const viewDashboard = document.getElementById("view-dashboard");
  const viewLoading = document.getElementById("view-loading");

  const tabLogin = document.getElementById("tab-login");
  const tabRegister = document.getElementById("tab-register");
  const formLogin = document.getElementById("form-login");
  const formRegister = document.getElementById("form-register");
  const banner = document.getElementById("banner");

  const formChangePassword = document.getElementById("form-change-password");
  const btnLogout = document.getElementById("btn-logout");

  function showOnly(view) {
    [viewAuth, viewDashboard, viewLoading].forEach((v) => {
      v.hidden = v !== view;
    });
  }

  function setAuthTab(which) {
    const loginActive = which === "login";
    tabLogin.classList.toggle("is-active", loginActive);
    tabRegister.classList.toggle("is-active", !loginActive);
    tabLogin.setAttribute("aria-selected", String(loginActive));
    tabRegister.setAttribute("aria-selected", String(!loginActive));
    formLogin.hidden = !loginActive;
    formRegister.hidden = loginActive;
    hideBanner();
  }

  function showBanner(message, type) {
    banner.textContent = message;
    banner.className = "banner banner--" + type;
    banner.hidden = false;
  }

  function hideBanner() {
    banner.hidden = true;
    banner.textContent = "";
  }

  function setBusy(form, busy) {
    const btn = form.querySelector("button[type='submit']");
    if (!btn) return;
    btn.disabled = busy;
    btn.dataset.originalLabel = btn.dataset.originalLabel || btn.querySelector(".btn__label").textContent;
    btn.querySelector(".btn__label").textContent = busy ? "Please wait…" : btn.dataset.originalLabel;
  }

  async function api(path, options = {}) {
    const res = await fetch(API_BASE + path, {
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      ...options,
    });

    let data = null;
    try {
      data = await res.json();
    } catch (_) {}

    if (!res.ok) {
      const message = (data && data.message) || "Something went wrong. Please try again.";
      throw new Error(message);
    }

    return data;
  }

  function formToJSON(form) {
    const fd = new FormData(form);
    return Object.fromEntries(fd.entries());
  }

  function firstName(fullName) {
    return (fullName || "").trim().split(/\s+/)[0] || "there";
  }

  function formatDate(iso) {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (_) {
      return "—";
    }
  }

  function renderDashboard(customer) {
    document.getElementById("dash-name").textContent = "Hey, " + firstName(customer.fullName);
    document.getElementById("dash-fullname").textContent = customer.fullName || "—";
    document.getElementById("dash-email").textContent = customer.email || "—";
    document.getElementById("dash-phone").textContent = customer.phone || "—";
    document.getElementById("dash-created").textContent = formatDate(customer.createdAt);
    showOnly(viewDashboard);
  }

  async function checkSession() {
    try {
      const customer = await api("/me", { method: "GET" });
      renderDashboard(customer);
    } catch (_) {
      setAuthTab("login");
      showOnly(viewAuth);
    }
  }

  tabLogin.addEventListener("click", () => setAuthTab("login"));
  tabRegister.addEventListener("click", () => setAuthTab("register"));

  document.querySelectorAll("[data-switch]").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      setAuthTab(link.dataset.switch);
    });
  });

  document.querySelectorAll(".pw-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const input = btn.previousElementSibling;
      const isPw = input.type === "password";
      input.type = isPw ? "text" : "password";
      btn.textContent = isPw ? "Hide" : "Show";
    });
  });

  formLogin.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideBanner();
    setBusy(formLogin, true);
    try {
      const payload = formToJSON(formLogin);
      await api("/login", { method: "POST", body: JSON.stringify(payload) });
      const customer = await api("/me", { method: "GET" });
      renderDashboard(customer);
      formLogin.reset();
    } catch (err) {
      showBanner(err.message, "error");
    } finally {
      setBusy(formLogin, false);
    }
  });

  formRegister.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideBanner();
    setBusy(formRegister, true);
    try {
      const payload = formToJSON(formRegister);
      await api("/register", { method: "POST", body: JSON.stringify(payload) });
      await api("/login", {
        method: "POST",
        body: JSON.stringify({ email: payload.email, password: payload.password }),
      });
      const customer = await api("/me", { method: "GET" });
      formRegister.reset();
      renderDashboard(customer);
    } catch (err) {
      showBanner(err.message, "error");
    } finally {
      setBusy(formRegister, false);
    }
  });

  formChangePassword.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideBanner();
    setBusy(formChangePassword, true);
    try {
      const payload = formToJSON(formChangePassword);
      await api("/change-password", { method: "PATCH", body: JSON.stringify(payload) });
      formChangePassword.reset();
      alertInline("Password updated. Use it next time you log in.");
    } catch (err) {
      alertInline(err.message, true);
    } finally {
      setBusy(formChangePassword, false);
    }
  });

  function alertInline(message, isError) {
    const existing = document.getElementById("dash-flash");
    if (existing) existing.remove();
    const el = document.createElement("div");
    el.id = "dash-flash";
    el.className = "banner " + (isError ? "banner--error" : "banner--success");
    el.style.marginBottom = "18px";
    el.textContent = message;
    viewDashboard.insertBefore(el, viewDashboard.firstChild);
    setTimeout(() => el.remove(), 4000);
  }

  btnLogout.addEventListener("click", async () => {
    btnLogout.disabled = true;
    try {
      await api("/logout", { method: "POST" });
    } catch (_) {
    } finally {
      btnLogout.disabled = false;
      setAuthTab("login");
      showOnly(viewAuth);
    }
  });

  showOnly(viewLoading);
  checkSession();
})();
