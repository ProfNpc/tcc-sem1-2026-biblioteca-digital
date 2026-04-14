/**
 * Catálogo (front-only): lista obras do mock e registra reservas.
 */
(function () {
  function mostrarFeedback(live, mensagem) {
    live.hidden = false;
    live.textContent = mensagem;
    live.classList.remove("catalogo-live--pulse");
    void live.offsetWidth;
    live.classList.add("catalogo-live--pulse");
    live.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function textoDisponibilidade(n) {
    if (n <= 0) return "Indisponivel";
    if (n === 1) return "1 exemplar disponivel";
    return n + " exemplares disponiveis";
  }

  function classeDisponibilidade(n) {
    return n > 0 ? "status-etiqueta--ok" : "status-etiqueta--atraso";
  }

  function norm(s) {
    return String(s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function criarCard(obra, live, onReserved) {
    var art = document.createElement("article");
    art.className = "catalogo-livro";
    art.dataset.obraId = String(obra.id);

    var capa = document.createElement("div");
    capa.className = "catalogo-livro-capa";
    var img = document.createElement("img");
    img.className = "catalogo-livro-capa-img";
    img.src = obra.capaImagem;
    img.alt = "Capa: " + obra.titulo;
    img.width = 300;
    img.height = 400;
    img.loading = "lazy";
    img.decoding = "async";
    capa.appendChild(img);

    var corpo = document.createElement("div");
    corpo.className = "catalogo-livro-corpo";
    var h3 = document.createElement("h3");
    h3.className = "catalogo-livro-titulo";
    h3.textContent = obra.titulo;
    var autores = document.createElement("p");
    autores.className = "catalogo-livro-autores";
    autores.textContent = obra.autores;

    var rodape = document.createElement("div");
    rodape.className = "catalogo-livro-rodape";
    var lbl = document.createElement("span");
    lbl.className = "catalogo-livro-disponibilidade";
    lbl.textContent = "Status";
    var st = document.createElement("span");
    st.className = "status-etiqueta " + classeDisponibilidade(obra.exemplaresDisponiveis);
    st.textContent = textoDisponibilidade(obra.exemplaresDisponiveis);
    rodape.appendChild(lbl);
    rodape.appendChild(st);

    var acoes = document.createElement("div");
    acoes.className = "catalogo-livro-acoes";
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "botao botao--primario catalogo-botao-reservar";
    btn.textContent = "Reservar";
    var pode = obra.exemplaresDisponiveis > 0;
    if (!pode) {
      btn.disabled = true;
      btn.setAttribute("aria-disabled", "true");
      btn.title = "No momento este titulo esta indisponivel";
    }
    btn.addEventListener("click", function () {
      if (btn.disabled) return;
      btn.disabled = true;
      window.BibMock
        .handle("/api/reservas", {
          method: "POST",
          body: JSON.stringify({ obraId: obra.id }),
        })
        .then(function (res) {
          if (!res.ok) {
            return res.json().then(function (b) {
              throw new Error(b.message || "Erro ao reservar.");
            });
          }
          return res.json();
        })
        .then(function () {
          mostrarFeedback(
            live,
            "Emprestimo confirmado: \"" +
              obra.titulo +
              "\" ja esta disponivel em Minha Biblioteca."
          );
          if (typeof onReserved === "function") onReserved();
        })
        .catch(function (e) {
          mostrarFeedback(live, e.message || "Nao foi possivel concluir a solicitacao.");
        })
        .finally(function () {
          btn.disabled = !pode;
        });
    });
    acoes.appendChild(btn);

    corpo.appendChild(h3);
    corpo.appendChild(autores);
    corpo.appendChild(rodape);
    corpo.appendChild(acoes);
    art.appendChild(capa);
    art.appendChild(corpo);
    return art;
  }

  function carregar() {
    var grade = document.getElementById("catalogo-grade");
    var contagem = document.getElementById("catalogo-contagem");
    var erro = document.getElementById("catalogo-erro");
    var live = document.getElementById("catalogo-live");
    var busca = document.getElementById("catalogo-busca");
    if (!grade || !live) return;

    var obrasCache = [];

    function render(obras, termo) {
      var q = norm(termo);
      var filtradas = !q
        ? obras
        : obras.filter(function (o) {
            return norm(o.titulo).indexOf(q) !== -1 || norm(o.autores).indexOf(q) !== -1;
          });

      grade.textContent = "";
      filtradas.forEach(function (o) {
        grade.appendChild(criarCard(o, live, refresh));
      });
      if (contagem) {
        contagem.textContent =
          filtradas.length +
          " título" +
          (filtradas.length === 1 ? "" : "s") +
          (q ? " (filtrado)" : "") +
          " encontrados";
      }
    }

    function refresh() {
      window.BibMock
        .handle("/api/obras")
        .then(function (res) {
          if (!res.ok) throw new Error("Erro ao carregar catalogo.");
          return res.json();
        })
        .then(function (obras) {
          obrasCache = obras || [];
          if (erro) erro.hidden = true;
          render(obrasCache, busca ? busca.value : "");
        })
        .catch(function () {
          if (contagem) contagem.textContent = "—";
          if (erro) {
            erro.hidden = false;
            erro.textContent = "Nao foi possivel carregar o catalogo agora. Tente novamente em instantes.";
          }
        });
    }

    if (busca) {
      busca.addEventListener("input", function () {
        render(obrasCache, busca.value);
      });
    }

    refresh();
  }

  document.addEventListener("DOMContentLoaded", carregar);
})();
