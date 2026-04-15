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

  function mostrarVazio(tbody) {
    tbody.textContent = "";
    var tr = document.createElement("tr");
    var td = document.createElement("td");
    td.colSpan = 5;
    td.className = "emprestimos-vazio";
    td.textContent = "Nenhum empréstimo ativo no momento. Reserve um título no catálogo para começar.";
    tr.appendChild(td);
    tbody.appendChild(tr);
  }

  function carregar() {
    var tbody = document.getElementById("emprestimos-tbody");
    var erro = document.getElementById("emprestimos-erro");
    var apoio = document.querySelector(".pagina-emprestimos-aluno .secao-descricao");
    if (!tbody) return;
    if (apoio) apoio.textContent = "Acompanhe prazos, organize sua rotina e remova títulos que não deseja mais manter na sua lista.";

    window.BibMock.handle("/api/minha-conta/emprestimos")
      .then(function (res) {
        if (!res.ok) throw new Error("Erro ao carregar empréstimos.");
        return res.json();
      })
      .then(function (lista) {
        tbody.textContent = "";
        if (!lista.length) {
          mostrarVazio(tbody);
          if (erro) erro.hidden = true;
          return;
        }
        lista.forEach(function (e) {
          var tr = document.createElement("tr");
          var tdLivro = document.createElement("td");
          tdLivro.textContent = e.livroTitulo;
          var tdRet = document.createElement("td");
          tdRet.textContent = fmtDataBr(e.dataRetirada);
          var tdDev = document.createElement("td");
          tdDev.textContent = fmtDataBr(e.devolverAte);
          var tdSit = document.createElement("td");
          var span = document.createElement("span");
          span.className = "status-etiqueta " + classeSituacao(e.situacao);
          span.textContent = textoSituacao(e.situacao);
          tdSit.appendChild(span);
          var tdAcoes = document.createElement("td");
          var btn = document.createElement("button");
          btn.type = "button";
          btn.className = "botao botao--secundario emprestimos-acao";
          btn.textContent = "Remover";
          btn.addEventListener("click", function () {
            btn.disabled = true;
            window.BibMock.handle("/api/minha-conta/emprestimos/" + e.id, {
              method: "DELETE",
            })
              .then(function (res) {
                if (!res.ok) throw new Error("Não foi possível remover este empréstimo.");
                return res.json();
              })
              .then(function () {
                carregar();
              })
              .catch(function (err) {
                if (erro) {
                  erro.hidden = false;
                  erro.textContent = err && err.message ? err.message : "Não foi possível atualizar sua lista.";
                }
                btn.disabled = false;
              });
          });
          tdAcoes.appendChild(btn);
          tr.appendChild(tdLivro);
          tr.appendChild(tdRet);
          tr.appendChild(tdDev);
          tr.appendChild(tdSit);
          tr.appendChild(tdAcoes);
          tbody.appendChild(tr);
        });
        if (erro) erro.hidden = true;
      })
      .catch(function () {
        if (erro) {
          erro.hidden = false;
          erro.textContent = "Não foi possível carregar seus empréstimos.";
        }
      });
  }

  document.addEventListener("DOMContentLoaded", carregar);
})();
