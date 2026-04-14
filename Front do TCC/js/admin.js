(function () {
  document.addEventListener("DOMContentLoaded", function () {
    var erro = document.getElementById("admin-erro");
    var nTitulos = document.getElementById("admin-num-titulos");
    var nAtivos = document.getElementById("admin-num-ativos");
    var nAtraso = document.getElementById("admin-num-atraso");
    var textoPassos = document.getElementById("admin-texto-passos");
    var apoio = document.querySelector('[data-guard="admin"] .secao-descricao');

    if (apoio) {
      apoio.textContent =
        "Visualize os principais indicadores da operacao e acompanhe o desempenho do acervo em um unico painel.";
    }

    window.BibMock.handle("/api/admin/estatisticas")
      .then(function (res) {
        if (!res.ok) throw new Error("Erro.");
        return res.json();
      })
      .then(function (s) {
        if (nTitulos) nTitulos.textContent = String(s.titulosNoCatalogo);
        if (nAtivos) nAtivos.textContent = String(s.emprestimosAtivos);
        if (nAtraso) nAtraso.textContent = String(s.itensEmAtraso);
        if (textoPassos) {
          textoPassos.textContent =
            "A operacao segue estavel, com acompanhamento centralizado do catalogo, dos emprestimos ativos e dos itens que pedem acao imediata.";
        }
        if (erro) erro.hidden = true;
      })
      .catch(function () {
        if (erro) {
          erro.hidden = false;
          erro.textContent = "Nao foi possivel carregar os indicadores neste momento.";
        }
      });
  });
})();
