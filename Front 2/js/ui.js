// ============================================================
//  BiblioTech — Utilitários Globais de UI
// ============================================================

// ---- Toasts ----
function mostrarToast(mensagem) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = mensagem;
    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 50);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 500);
    }, 4000);
}

// ---- Mapa Google ----
function abrirMapa(enderecoReal) {
    const iframe = document.getElementById('google-map-iframe');
    if (!iframe) return;
    iframe.src = `https://www.google.com/maps?q=${encodeURIComponent(enderecoReal)}&output=embed`;
    document.getElementById('map-modal').classList.add('active');
}

function fecharMapa(evento) {
    if (evento.target.id === 'map-modal' || evento.target.classList.contains('close-map-btn')) {
        document.getElementById('map-modal').classList.remove('active');
        document.getElementById('google-map-iframe').src = '';
    }
}

// ---- Carrossel ----
function rolarCarrossel(distancia) {
    document.getElementById('container-livros')?.scrollBy({ left: distancia, behavior: 'smooth' });
}
function rolarCarrosselDepoimentos(distancia) {
    document.getElementById('container-depoimentos')?.scrollBy({ left: distancia, behavior: 'smooth' });
}
function iniciarAutoScroll(idContainer, intervaloMS) {
    const track = document.getElementById(idContainer);
    if (!track) return;
    let pausado = false;
    track.addEventListener('mouseenter', () => pausado = true);
    track.addEventListener('mouseleave', () => pausado = false);
    setInterval(() => {
        if (pausado) return;
        if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 10) {
            track.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
            track.scrollBy({ left: 340, behavior: 'smooth' });
        }
    }, intervaloMS);
}

// ---- Contadores animados ----
function animarContadores() {
    document.querySelectorAll('.stat-num').forEach(contador => {
        const target = +contador.getAttribute('data-target');
        const update = () => {
            const count = +contador.innerText;
            const inc = target / 100;
            if (count < target) {
                contador.innerText = Math.ceil(count + inc);
                setTimeout(update, 20);
            } else {
                contador.innerText = target + '+';
            }
        };
        update();
    });
}

// ---- Render do Header dinâmico ----
function renderizarHeader() {
    const usuarioLogado = sessionStorage.getItem('userLogado');
    const userPerfil    = sessionStorage.getItem('userPerfil');
    const navLogin = document.getElementById('nav-login-area');
    if (!navLogin) return;

    const linkAcervo      = document.getElementById('link-acervo');
    const linkReservas    = document.getElementById('link-reservas');
    const linkAdminRes    = document.getElementById('link-admin-reservas');
    const linkHome        = document.getElementById('link-home');

    if (usuarioLogado) {
        if (linkAcervo) linkAcervo.style.display = 'inline';
        if (userPerfil === 'ADMIN') {
            if (linkAdminRes) linkAdminRes.style.display = 'inline';
        } else {
            if (linkReservas) linkReservas.style.display = 'inline';
        }
        if (linkHome) linkHome.style.display = 'none';

        navLogin.innerHTML = `
            <span style="color:white; font-weight:bold; margin-right:15px; margin-left:20px;">
                <span data-i18n="nav-ola">${getTexto('nav-ola')}</span>${usuarioLogado.split(' ')[0]}
            </span>
            <a href="#" onclick="fazerLogout()" data-i18n="nav-sair" style="background:rgba(255,255,255,0.2); padding:5px 12px; border-radius:15px; color:white;">Sair</a>
        `;
    }
}

function fazerLogout() {
    sessionStorage.removeItem('userLogado');
    sessionStorage.removeItem('userPerfil');
    window.location.href = '../index.html';
}

// ---- Construção de card de livro ----
function buildCard(livro, isGrid = false) {
    const urlCapa = DB.getCapaUrl(livro.titulo);
    const disponivel = livro.disponivel !== false;
    const badgeHtml = isGrid
        ? (disponivel
            ? `<span class="badge-disp disp-ok">Disponível</span>`
            : `<span class="badge-disp disp-no">Alugado</span>`)
        : '';
    const tituloEsc = livro.titulo.replace(/'/g, "\\'");
    const btnReserva = disponivel
        ? `<button class="btn-dinamico-reserva" onclick="abrirModalPolo('${tituloEsc}')">${getTexto('btn-reservar')}</button>`
        : `<button class="btn-dinamico-reserva btn-indisponivel" disabled>Indisponível</button>`;

    return `
        <div class="card${isGrid ? ' acervo-item' : ''}">
            ${badgeHtml}
            <div class="card-cover-image" style="background-image: url('${urlCapa}');"></div>
            <div class="card-content">
                <h3>${livro.titulo}</h3>
                <p>Autor: ${livro.autor}<br>Ano: ${livro.anoPublicacao}</p>
                ${btnReserva}
            </div>
        </div>`;
}
