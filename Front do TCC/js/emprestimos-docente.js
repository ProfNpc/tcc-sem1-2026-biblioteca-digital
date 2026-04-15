(function () {
  function fmtDataBr(iso) {
    if (!iso) return "—";
    var p = String(iso).split("-");
    if (p.length !== 3) return iso;
    return p[2] + "/" + p[1] + "/" + p[0];
  }

  function classeSituacao(s) {
    if (s === "ATRASADO") return "status-etiqueta--atraso";
    if (s === "PRAZO_PROXIMO") return "status-etiqueta--aviso";
    return "status-etiqueta--ok";
  }

  function textoSituacao(s) {
    if (s === "ATRASADO") return "Atrasado";
    if (s === "PRAZO_PROXIMO") return "Prazo próximo";
    return "Em dia";
  }

  function carregar() {
    var tbody = document.getElementById("emprestimos-consolidado-tbody");
    var erro = document.getElementById("emprestimos-erro");
    var apoio = document.querySelector(".pagina-emprestimos-docente .secao-descricao");
    if (!tbody) return;
    if (apoio) apoio.textContent = "Acompanhe os emprestimos ativos por estudante e identifique rapidamente os prazos que exigem atencao.";

    window.BibMock.handle("/api/emprestimos/consolidado")
      .then(function (res) {
        if (!res.ok) throw new Error("Erro ao carregar dados.");
        return res.json();
      })
      .then(function (lista) {
        tbody.textContent = "";
        lista.forEach(function (e) {
          var tr = document.createElement("tr");
          var tdAluno = document.createElement("td");
          tdAluno.textContent = e.alunoNome;
          var tdLivro = document.createElement("td");
          tdLivro.textContent = e.livroTitulo;
          var tdDev = document.createElement("td");
          tdDev.textContent = fmtDataBr(e.devolverAte);
          var tdSit = document.createElement("td");
          var span = document.createElement("span");
          span.className = "status-etiqueta " + classeSituacao(e.situacao);
          span.textContent = textoSituacao(e.situacao);
          tdSit.appendChild(span);
          tr.appendChild(tdAluno);
          tr.appendChild(tdLivro);
          tr.appendChild(tdDev);
          tr.appendChild(tdSit);
          tbody.appendChild(tr);
        });
        if (erro) erro.hidden = true;
      })
      .catch(function () {
        if (erro) {
          erro.hidden = false;
          erro.textContent = "Nao foi possivel carregar a visao consolidada no momento.";
        }
      });
  }

  document.addEventListener("DOMContentLoaded", carregar);
})();
