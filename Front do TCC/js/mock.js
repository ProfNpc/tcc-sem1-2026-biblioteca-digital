/**
 * Mock local (sem backend): dados + "API" em memória.
 * Persiste pequenas alterações em localStorage para parecer real.
 */
(function () {
  var LS_KEY = "bib_digital_mock_state_v1";

  function todayIso() {
    return new Date().toISOString().slice(0, 10);
  }

  function addDaysIso(baseIso, days) {
    var d = baseIso ? new Date(baseIso + "T00:00:00") : new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  }

  function b64urlEncode(str) {
    return btoa(unescape(encodeURIComponent(str)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/g, "");
  }

  function makeFakeJwt(opts) {
    opts = opts || {};
    var now = Math.floor(Date.now() / 1000);
    var exp = opts.exp || now + 60 * 60 * 24 * 30; // 30 dias
    var payload = {
      iss: "front-only",
      iat: now,
      exp: exp,
    };
    var header = { alg: "none", typ: "JWT" };
    return b64urlEncode(JSON.stringify(header)) + "." + b64urlEncode(JSON.stringify(payload)) + ".";
  }

  var seed = {
    users: [
      { username: "aluno", password: "Biblioteca2026", role: "aluno", displayName: "Aluno Demo" },
      { username: "joaolima", password: "Biblioteca2026", role: "aluno", displayName: "João Lima" },
      { username: "docente", password: "Biblioteca2026", role: "docente", displayName: "Docente Demo" },
      { username: "admin", password: "Biblioteca2026", role: "admin", displayName: "Admin Demo" },
    ],
    obras: [
      {
        id: 1,
        titulo: "Cálculo I",
        autores: "Stewart",
        capaImagem: "img/capas/calculo-i.svg",
        exemplaresDisponiveis: 2,
      },
      {
        id: 2,
        titulo: "Redes de Computadores",
        autores: "Tanenbaum",
        capaImagem: "img/capas/redes-computadores.svg",
        exemplaresDisponiveis: 0,
      },
      {
        id: 3,
        titulo: "Organização e Arquitetura de Computadores",
        autores: "Patterson & Hennessy",
        capaImagem: "img/capas/organizacao-computadores.svg",
        exemplaresDisponiveis: 1,
      },
      {
        id: 4,
        titulo: "Metodologia da Pesquisa",
        autores: "Lakatos & Marconi",
        capaImagem: "img/capas/metodologia-pesquisa.svg",
        exemplaresDisponiveis: 3,
      },
      {
        id: 5,
        titulo: "Design de Interfaces",
        autores: "Cooper",
        capaImagem: "img/capas/design-interfaces.svg",
        exemplaresDisponiveis: 1,
      },
      {
        id: 6,
        titulo: "Direito Constitucional",
        autores: "Silva",
        capaImagem: "img/capas/direito-constitucional.svg",
        exemplaresDisponiveis: 2,
      },
      {
        id: 7,
        titulo: "Economia",
        autores: "Mankiw",
        capaImagem: "img/capas/economia.svg",
        exemplaresDisponiveis: 1,
      },
      {
        id: 8,
        titulo: "Psicologia Educacional",
        autores: "Bock",
        capaImagem: "img/capas/psicologia-educacional.svg",
        exemplaresDisponiveis: 0,
      },
      {
        id: 9,
        titulo: "Ciência da Computação",
        autores: "Sedgewick",
        capaImagem: "img/capas/ciencia-computacao.svg",
        exemplaresDisponiveis: 2,
      },
    ],
    emprestimos: [
      // aluno: aluno
      {
        id: 100,
        username: "aluno",
        alunoNome: "Aluno Demo",
        livroTitulo: "Cálculo I",
        dataRetirada: addDaysIso(todayIso(), -12),
        devolverAte: addDaysIso(todayIso(), 2),
      },
      {
        id: 101,
        username: "aluno",
        alunoNome: "Aluno Demo",
        livroTitulo: "Metodologia da Pesquisa",
        dataRetirada: addDaysIso(todayIso(), -25),
        devolverAte: addDaysIso(todayIso(), -3),
      },
      // aluno: joaolima
      {
        id: 102,
        username: "joaolima",
        alunoNome: "João Lima",
        livroTitulo: "Design de Interfaces",
        dataRetirada: addDaysIso(todayIso(), -5),
        devolverAte: addDaysIso(todayIso(), 9),
      },
    ],
    reservas: [],
  };

  function loadState() {
    try {
      var raw = localStorage.getItem(LS_KEY);
      if (!raw) return JSON.parse(JSON.stringify(seed));
      var parsed = JSON.parse(raw);
      if (!parsed || !parsed.users || !parsed.obras) return JSON.parse(JSON.stringify(seed));
      return parsed;
    } catch (e) {
      return JSON.parse(JSON.stringify(seed));
    }
  }

  function saveState(state) {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(state));
    } catch (e) {
      // ignore (storage cheio / modo privado)
    }
  }

  function clone(x) {
    return JSON.parse(JSON.stringify(x));
  }

  function displayNameForUser(state, username) {
    var u = state.users.find(function (x) {
      return x.username === username;
    });
    return (u && u.displayName) || username;
  }

  function situacaoEmprestimo(e) {
    var hoje = todayIso();
    if (e.devolverAte < hoje) return "ATRASADO";
    // prazo próximo: até 3 dias
    var d = new Date(e.devolverAte + "T00:00:00");
    var diff = Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (diff <= 3) return "PRAZO_PROXIMO";
    return "EM_DIA";
  }

  function requireSession() {
    if (!window.BibAuth) return null;
    var s = window.BibAuth.getSession();
    if (!s || !s.role) return null;
    return s;
  }

  function ok(body, status) {
    return Promise.resolve({
      ok: true,
      status: status || 200,
      json: function () {
        return Promise.resolve(body);
      },
    });
  }

  function fail(message, status) {
    return Promise.resolve({
      ok: false,
      status: status || 400,
      json: function () {
        return Promise.resolve({ message: message || "Falha." });
      },
    });
  }

  function handle(path, opts) {
    opts = opts || {};
    var method = String(opts.method || "GET").toUpperCase();
    var state = loadState();

    // auth
    if (path === "/api/auth/login" && method === "POST") {
      var body = {};
      try {
        body = opts.body ? JSON.parse(opts.body) : {};
      } catch (e) {}
      var username = String(body.username || "").trim();
      var password = String(body.password || "");
      var u = state.users.find(function (x) {
        return x.username === username && x.password === password;
      });
      if (!u) return fail("Usuário ou senha incorretos.", 401);
      return ok({
        token: makeFakeJwt(),
        user: u.username,
        role: u.role,
        displayName: u.displayName,
      });
    }

    // Demais rotas exigem sessão
    var session = requireSession();
    if (!session) return fail("Não autenticado.", 401);

    if (path === "/api/obras" && method === "GET") {
      return ok(clone(state.obras));
    }

    if (path === "/api/reservas" && method === "POST") {
      var payload = {};
      try {
        payload = opts.body ? JSON.parse(opts.body) : {};
      } catch (e) {}
      var obraId = Number(payload.obraId);
      var obra = state.obras.find(function (o) {
        return o.id === obraId;
      });
      if (!obra) return fail("Obra não encontrada.", 404);
      if (obra.exemplaresDisponiveis <= 0) return fail("Sem exemplares disponíveis.", 409);

      if (session.role !== "aluno") return fail("Apenas alunos podem reservar.", 403);

      obra.exemplaresDisponiveis -= 1;
      state.reservas.push({
        id: Date.now(),
        username: session.user,
        obraId: obraId,
        data: todayIso(),
      });

      // Reserva -> empréstimo imediato (fluxo de demonstração)
      state.emprestimos.unshift({
        id: Date.now() + 1,
        username: session.user,
        alunoNome: displayNameForUser(state, session.user),
        livroTitulo: obra.titulo,
        dataRetirada: todayIso(),
        devolverAte: addDaysIso(todayIso(), 14),
      });

      saveState(state);
      return ok({ ok: true }, 201);
    }

    if (path === "/api/minha-conta/emprestimos" && method === "GET") {
      if (session.role !== "aluno") return fail("Acesso negado.", 403);
      var lista = state.emprestimos
        .filter(function (e) {
          return e.username === session.user;
        })
        .map(function (e) {
          return Object.assign({}, e, { situacao: situacaoEmprestimo(e) });
        });
      return ok(clone(lista));
    }

    if (/^\/api\/minha-conta\/emprestimos\/\d+$/.test(path) && method === "DELETE") {
      if (session.role !== "aluno") return fail("Acesso negado.", 403);
      var emprestimoId = Number(path.split("/").pop());
      var idx = state.emprestimos.findIndex(function (e) {
        return e.id === emprestimoId && e.username === session.user;
      });
      if (idx === -1) return fail("Empréstimo não encontrado.", 404);

      var emprestimo = state.emprestimos[idx];
      var obra = state.obras.find(function (o) {
        return o.titulo === emprestimo.livroTitulo;
      });
      if (obra) {
        obra.exemplaresDisponiveis += 1;
      }

      state.emprestimos.splice(idx, 1);
      saveState(state);
      return ok({ ok: true });
    }

    if (path === "/api/emprestimos/consolidado" && method === "GET") {
      if (session.role !== "docente" && session.role !== "admin") return fail("Acesso negado.", 403);
      var cons = state.emprestimos.map(function (e) {
        return {
          alunoNome: e.alunoNome,
          livroTitulo: e.livroTitulo,
          devolverAte: e.devolverAte,
          situacao: situacaoEmprestimo(e),
        };
      });
      return ok(clone(cons));
    }

    if (path === "/api/admin/estatisticas" && method === "GET") {
      if (session.role !== "admin") return fail("Acesso negado.", 403);
      var itensEmAtraso = state.emprestimos.filter(function (e) {
        return situacaoEmprestimo(e) === "ATRASADO";
      }).length;
      return ok({
        titulosNoCatalogo: state.obras.length,
        emprestimosAtivos: state.emprestimos.length,
        itensEmAtraso: itensEmAtraso,
      });
    }

    return fail("Rota não implementada no mock: " + method + " " + path, 404);
  }

  window.BibMock = {
    handle: handle,
  };
})();

