/**
 * Página de login: valida credenciais e redireciona.
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
    if (session && session.role) {
      window.location.replace(DEFAULT_HOME[session.role] || "index.html");
      return;
    }

    var form = document.getElementById("form-login");
    var err = document.getElementById("login-error");
    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var user = document.getElementById("usuario");
      var pass = document.getElementById("senha");
      var result = window.BibAuth.login(user.value, pass.value);

      if (!result.ok) {
        if (err) {
          err.hidden = false;
          err.textContent = "Usuário ou senha incorretos. Verifique as credenciais de demonstração abaixo.";
        }
        pass.value = "";
        pass.focus();
        return;
      }

      window.BibAuth.setSession({
        user: result.user,
        role: result.role,
        displayName: result.displayName,
      });

      var next = getQueryParam("next");
      var dest = safeNext(next, result.role) || DEFAULT_HOME[result.role] || "index.html";
      window.location.href = dest;
    });
  });
})();
