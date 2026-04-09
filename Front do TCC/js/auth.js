/**
 * Autenticação de demonstração (sessionStorage).
 * Em produção, substitua por login no servidor (sessão/JWT).
 */
(function () {
  var STORAGE_KEY = "bib_digital_session";

  var ACCOUNTS = {
    aluno: { password: "Biblioteca2026", role: "aluno", name: "Maria Santos" },
    docente: { password: "Biblioteca2026", role: "docente", name: "Prof. Silva" },
    admin: { password: "Biblioteca2026", role: "admin", name: "Equipe administrativa" },
  };

  var DEFAULT_HOME = {
    aluno: "aluno-catalogo.html",
    docente: "docente-emprestimos.html",
    admin: "admin.html",
  };

  function getSession() {
    try {
      var raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function setSession(data) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function clearSession() {
    sessionStorage.removeItem(STORAGE_KEY);
  }

  function login(username, password) {
    var key = String(username || "")
      .trim()
      .toLowerCase();
    var acc = ACCOUNTS[key];
    if (!acc || acc.password !== password) {
      return { ok: false };
    }
    return {
      ok: true,
      user: key,
      role: acc.role,
      displayName: acc.name,
    };
  }

  function redirectToLogin() {
    var name = window.location.pathname.split("/").pop() || "index.html";
    window.location.href = "login.html?next=" + encodeURIComponent(name);
  }

  function guard() {
    var guardAttr = document.body.getAttribute("data-guard");
    if (!guardAttr) return;

    var allowed = guardAttr.split(",").map(function (s) {
      return s.trim();
    });
    var session = getSession();
    if (!session || !session.role) {
      redirectToLogin();
      return;
    }
    if (allowed.indexOf(session.role) === -1) {
      window.location.href = "acesso-negado.html";
      return;
    }

    document.querySelectorAll(".topo-usuario-nome").forEach(function (el) {
      el.textContent = session.displayName || session.user;
    });

    if (session.role === "docente") {
      document.querySelectorAll("[data-restrito-admin]").forEach(function (el) {
        el.hidden = true;
      });
    }
  }

  function bindLogout() {
    document.querySelectorAll("[data-acao-sair]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        clearSession();
        window.location.href = "login.html";
      });
    });
  }

  window.BibAuth = {
    getSession: getSession,
    setSession: setSession,
    clearSession: clearSession,
    login: login,
    DEFAULT_HOME: DEFAULT_HOME,
  };

  document.addEventListener("DOMContentLoaded", function () {
    guard();
    bindLogout();
  });
})();
