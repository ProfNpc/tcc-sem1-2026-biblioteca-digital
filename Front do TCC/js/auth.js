/**
 * Sessão no navegador (sessionStorage) + JWT emitido pelo backend.
 */
(function () {
  var STORAGE_KEY = "bib_digital_session";

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

  function isTokenExpired(token) {
    if (!token) return true;
    try {
      var payload = token.split(".")[1];
      if (!payload) return true;
      var json = JSON.parse(
        atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
      );
      if (!json.exp) return false;
      return json.exp * 1000 <= Date.now();
    } catch (e) {
      return true;
    }
  }

  function sessionValid() {
    var s = getSession();
    if (!s || !s.role || !s.token) return false;
    return !isTokenExpired(s.token);
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
    if (!session || !session.role || !sessionValid()) {
      clearSession();
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
    sessionValid: sessionValid,
    DEFAULT_HOME: DEFAULT_HOME,
  };

  document.addEventListener("DOMContentLoaded", function () {
    guard();
    bindLogout();
  });
})();
