/**
 * Login local (front-only) via mock.
 */
(function () {
  var DEFAULT_HOME = window.BibAuth.DEFAULT_HOME;

  function getQueryParam(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name);
  }

  function safeNext(next, role) {
    if (!next || !/\.html$/.test(next)) return null;
    var allowed = [
      "aluno-catalogo.html",
      "aluno-emprestimos.html",
      "docente-emprestimos.html",
      "admin.html",
    ];
    if (allowed.indexOf(next) === -1) return null;
    if (next.indexOf("aluno") === 0 && role !== "aluno") return null;
    if (next.indexOf("docente") === 0 && role !== "docente" && role !== "admin") return null;
    if (next === "admin.html" && role !== "admin") return null;
    return next;
  }

  document.addEventListener("DOMContentLoaded", function () {
    var session = window.BibAuth.getSession();
    if (session && session.role && window.BibAuth.sessionValid()) {
      window.location.replace(DEFAULT_HOME[session.role] || "index.html");
      return;
    }

    var form = document.getElementById("form-login");
    var err = document.getElementById("login-error");
    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (err) err.hidden = true;

      var userEl = document.getElementById("usuario");
      var passEl = document.getElementById("senha");
      var user = userEl.value.trim();
      var pass = passEl.value;

      var btn = form.querySelector('button[type="submit"]');
      if (btn) btn.disabled = true;

      window.BibMock
        .handle("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: user, password: pass }),
        })
        .then(function (res) {
          if (!res.ok) {
            return res.json().then(
              function (body) {
                throw new Error(
                  body.message ||
                    (res.status === 401
                      ? "Usuário ou senha incorretos."
                      : "Falha no login.")
                );
              },
              function () {
                throw new Error("Resposta inválida do servidor.");
              }
            );
          }
          return res.json();
        })
        .then(function (data) {
          window.BibAuth.setSession({
            token: data.token,
            user: data.user,
            role: data.role,
            displayName: data.displayName,
          });
          var next = getQueryParam("next");
          var dest =
            safeNext(next, data.role) || DEFAULT_HOME[data.role] || "index.html";
          window.location.href = dest;
        })
        .catch(function (e) {
          if (err) {
            err.hidden = false;
            var msg =
              e && e.message
                ? e.message
                : "Não foi possível concluir o login.";
            err.textContent = msg;
          }
          passEl.value = "";
          passEl.focus();
        })
        .finally(function () {
          if (btn) btn.disabled = false;
        });
    });
  });
})();
