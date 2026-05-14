// ============================================================
//  BiblioTech — Internacionalização (PT / EN)
// ============================================================

const traducoes = {
    pt: {
        "nav-catalogo": "Home",
        "nav-acervo": "Catálogo de Livros",
        "nav-reservas": "Minhas Reservas",
        "nav-login": "Login",
        "nav-ola": "Olá, ",
        "nav-sair": "Sair",
        "admin-res-titulo": "Gestão de Reservas",

        "hero-titulo": "Educação e Leitura acessível para todos",
        "hero-desc": "Explore uma variedade de livros gratuitos que sua escola oferece e aprenda sem limites!",
        "hero-btn": "Explorar Livros",

        "cat-titulo": "Livros em Destaque",
        "cat-loading": "Buscando livros no acervo da escola...",
        "cat-empty": "Não há livros no acervo ainda.",
        "cat-erro": "Erro ao carregar os livros.",
        "btn-reservar": "Fazer Reserva",

        "acervo-titulo": "Catálogo de Livros",

        "func-titulo": "Como a Biblioteca Funciona?",
        "func-passo1": "🔍 1. Explore e Escolha",
        "func-desc1": "Navegue pelo nosso acervo inteligente e escolha o livro ideal para sua pesquisa.",
        "func-passo2": "🔐 2. Autentique-se",
        "func-desc2": "Para segurança do acervo, as reservas exigem um Cadastro ou Login obrigatório.",
        "func-passo3": "📅 3. Reserve e Retire",
        "func-desc3": "Com 1 clique o livro é seu! Dirija-se até a portaria do seu polo em até 24h para retirar.",

        "stat-livros": "Acervo Digital",
        "stat-alunos": "Alunos Ativos",
        "stat-bib": "Institutos",

        "depo-titulo": "O que dizem sobre nós",
        "depo-1-texto": "\"Recomendo fortemente aos alunos a plataforma para retirar clássicos de literatura necessários na minha disciplina de Artes.\"",
        "depo-1-autor": "- Prof. Márcia C.",
        "depo-2-texto": "\"O sistema de reservas agilizou toda a minha pesquisa que precisava fazer de madrugada para as matérias da grade de engenharia!\"",
        "depo-2-autor": "- Lucas T., Aluno Eng.",
        "depo-3-texto": "\"Muito fácil de navegar. Consigo encontrar livros de medicina com dois cliques, sensacional o projeto da biblioteca.\"",
        "depo-3-autor": "- Ana S., Aluna Med.",
        "depo-4-texto": "\"A integração com o catálogo da biblioteca central é perfeita. Consigo ver exatamente o que está disponível na FIEB.\"",
        "depo-4-autor": "- Carlos R., Aluno TI.",
        "depo-5-texto": "\"Material excelente e interface absurdamente rápida. O layout do site me surpreendeu positivamente.\"",
        "depo-5-autor": "- Mariana L., Profª História.",
        "depo-6-texto": "\"Revolucionou a forma de estudar para o TCC. Sem burocracia, apenas o conhecimento a um clique de distância.\"",
        "depo-6-autor": "- Felipe M., Aluno Adm.",

        "polos-titulo": "Nossos Institutos Tecnológicos",
        "polo-1": "ITB Brasílio Flores de Azevedo",
        "polo-1-desc": "Jardim Belval",
        "polo-2": "ITB Prof. Munir José",
        "polo-2-desc": "Jardim Paulista",
        "polo-3": "ITB Profª Maria Sylvia",
        "polo-3-desc": "Engenho Novo",
        "polo-4": "ITB Profº Hércules Alves",
        "polo-4-desc": "Jardim Mutinga",
        "polo-5": "ITB Profº Moacyr Domingos",
        "polo-5-desc": "Parque Imperial",

        "footer-texto": "© 2026 BiblioTech — Biblioteca Digital TCC. Todos os direitos reservados.",
        "foot-quem": "Quem somos",
        "foot-fale": "Fale conosco",
        "foot-faq": "FAQ",
        "foot-creditos": "Créditos",
        "foot-politica": "Política de privacidade",

        "login-titulo": "Entrar no Sistema",
        "login-label-ra": "RA do Aluno",
        "login-label-senha": "Senha",
        "login-btn": "Acessar",
        "login-erro-api": "RA ou Senha incorretos!",
        "login-titulo-aluno": "Acesso Restrito - Aluno",
        "login-titulo-admin": "Acesso Restrito - Master",
        "login-erro-perfil": "Acesso Negado. Você não é um Administrador.",

        "escolha-titulo": "Onde você deseja entrar?",
        "btn-sou-aluno": "📚 Portal do Aluno",
        "btn-sou-admin": "⚙️ Painel Administrativo",
        "btn-voltar": "← Trocar Portal",
        "btn-voltar-simples": "Voltar",

        "split-titulo": "Bem-vindo à BiblioTech",
        "split-desc": "O conhecimento do mundo na palma da sua mão. Acesse o nosso acervo e evolua com a gente.",

        "cad-header": "Não tem conta?",
        "cad-link": "Cadastre-se",
        "log-link": "Já tem conta? Entrar",
        "cad-titulo": "Criar Nova Conta",
        "cad-label-nome": "Nome Completo",
        "cad-btn": "Registrar e Acessar",
        "cad-erro-api": "Erro ao tentar criar a conta.",

        "res-titulo": "Livros Reservados",
        "tab-livro": "Livro",
        "tab-data": "Data da Reserva",
        "tab-limite": "Entrega Limite",
        "tab-local": "Retirada",
        "tab-status": "Situação",
        "tab-acao": "Ações",
        "status-apto": "🟢 Em Dia",
        "status-vencido": "🔴 Vencido",
        "res-vazio": "Nenhum livro alugado ainda.",
        "res-limite-erro": "⚠️ Limite Máximo Atingido! Você já possui 5 reservas. Devolva um livro para liberar espaço.",
        "btn-localizar": "📍 Como Chegar",

        "conf-titulo": "Confirmar Cancelamento",
        "conf-msg": "Você tem certeza que deseja cancelar a reserva de {0}? Essa ação não pode ser desfeita.",
        "msg-reserva": "Boas notícias, {0}! Você acaba de pré-reservar: '{1}'. Retire no {2} em até 48h.",

        "col-aluno": "Estudante",
        "col-livro": "Livro",
        "col-polo": "Polo de Retirada",
        "btn-entregar": "Confirmar Entrega",
        "status-retirado": "🔵 Retirado",

        "place-nome": "Ex: João da Silva",
        "place-ra": "Digite seu RA ou Matrícula",
        "place-senha": "Sua senha secreta",
        "place-busca": "Pesquise por títulos, autores ou gênero...",

        // Sobre Nós
        "sobre-titulo": "Sobre a BiblioTech",
        "sobre-subtitulo": "Levando o conhecimento a todos os alunos do ITB",
        "sobre-missao-titulo": "Nossa Missão",
        "sobre-missao-desc": "A BiblioTech foi desenvolvida como projeto de TCC para modernizar o acesso ao acervo bibliográfico dos Institutos Tecnológicos de Barueri (ITB). Nossa plataforma conecta alunos ao vasto catálogo de livros das cinco unidades, com reservas online 100% integradas.",
        "sobre-visao-titulo": "Nossa Visão",
        "sobre-visao-desc": "Ser a principal ferramenta digital de gestão de biblioteca das escolas técnicas municipais, garantindo acesso democrático ao conhecimento para todos os estudantes da rede ITB.",
        "sobre-valores-titulo": "Nossos Valores",
        "sobre-tech-titulo": "Tecnologias Utilizadas",

        // FAQ
        "faq-titulo": "Perguntas Frequentes",
        "faq-subtitulo": "Tire suas dúvidas sobre o sistema BiblioTech",

        // Contato
        "contato-titulo": "Fale Conosco",
        "contato-subtitulo": "Tem alguma dúvida ou sugestão? Entre em contato!",
    },
    en: {
        "nav-catalogo": "Home",
        "nav-acervo": "Book Catalog",
        "nav-reservas": "My Loans",
        "nav-login": "Login",
        "nav-ola": "Hello, ",
        "nav-sair": "Logout",
        "admin-res-titulo": "Reservation Management",

        "hero-titulo": "Accessible Education and Reading for All",
        "hero-desc": "Explore a variety of free books offered by your school and learn without limits!",
        "hero-btn": "Explore Books",

        "cat-titulo": "Featured Books",
        "cat-loading": "Fetching books from the school collection...",
        "cat-empty": "There are no books in the collection yet.",
        "cat-erro": "Error loading books.",
        "btn-reservar": "Book Now",

        "acervo-titulo": "Book Catalog",

        "func-titulo": "How the Library Works?",
        "func-passo1": "🔍 1. Explore & Choose",
        "func-desc1": "Browse our smart collection and pick the perfect book for your research.",
        "func-passo2": "🔐 2. Authenticate",
        "func-desc2": "For collection security, all reservations require an official Login or Registration.",
        "func-passo3": "📅 3. Reserve & Pick Up",
        "func-desc3": "With 1 click the book is yours! Go to front desk within 24h to pick it up.",

        "stat-livros": "Digital Collection",
        "stat-alunos": "Active Students",
        "stat-bib": "Institutes",

        "depo-titulo": "What they say about us",
        "depo-1-texto": "\"I highly recommend the platform to students to borrow classic literature necessary for my Arts discipline.\"",
        "depo-1-autor": "- Prof. Marcia C.",
        "depo-2-texto": "\"The reservation system streamlined all the research I needed to do at dawn for the engineering curriculum subjects!\"",
        "depo-2-autor": "- Lucas T., Eng. Student",
        "depo-3-texto": "\"Very easy to navigate. I can find medicine books with two clicks, sensational library project.\"",
        "depo-3-autor": "- Ana S., Med Student",
        "depo-4-texto": "\"The integration with the central library catalog is perfect. I can see exactly what is available.\"",
        "depo-4-autor": "- Carlos R., IT Student",
        "depo-5-texto": "\"Excellent material and insanely fast interface. The website layout pleasantly surprised me.\"",
        "depo-5-autor": "- Mariana L., History Teacher",
        "depo-6-texto": "\"Revolutionized the way I study for my Thesis. No bureaucracy, just knowledge a click away.\"",
        "depo-6-autor": "- Felipe M., Business Student",

        "polos-titulo": "Our Technological Institutes",
        "polo-1": "ITB Brasílio Flores de Azevedo",
        "polo-1-desc": "Jardim Belval",
        "polo-2": "ITB Prof. Munir José",
        "polo-2-desc": "Jardim Paulista",
        "polo-3": "ITB Profª Maria Sylvia",
        "polo-3-desc": "Engenho Novo",
        "polo-4": "ITB Profº Hércules Alves",
        "polo-4-desc": "Jardim Mutinga",
        "polo-5": "ITB Profº Moacyr Domingos",
        "polo-5-desc": "Parque Imperial",

        "footer-texto": "© 2026 BiblioTech — Digital Library Thesis. All rights reserved.",
        "foot-quem": "About us",
        "foot-fale": "Contact us",
        "foot-faq": "FAQ",
        "foot-creditos": "Credits",
        "foot-politica": "Privacy Policy",

        "login-titulo": "System Login",
        "login-label-ra": "Student ID (RA)",
        "login-label-senha": "Password",
        "login-btn": "Access",
        "login-erro-api": "Incorrect Student ID or Password!",
        "login-titulo-aluno": "Restricted Access - Student",
        "login-titulo-admin": "Restricted Access - Master",
        "login-erro-perfil": "Access Denied. You are not an Administrator.",

        "escolha-titulo": "Where do you want to enter?",
        "btn-sou-aluno": "📚 Student Portal",
        "btn-sou-admin": "⚙️ Admin Dashboard",
        "btn-voltar": "← Switch Portal",
        "btn-voltar-simples": "Go Back",

        "split-titulo": "Welcome to BiblioTech",
        "split-desc": "The world's knowledge in the palm of your hand. Access our collection and grow with us.",

        "cad-header": "Don't have an account?",
        "cad-link": "Register yours",
        "log-link": "Already have an account? Login",
        "cad-titulo": "Create New Account",
        "cad-label-nome": "Full Name",
        "cad-btn": "Register & Access",
        "cad-erro-api": "Error saving account.",

        "res-titulo": "Reserved Books",
        "tab-livro": "Book",
        "tab-data": "Borrow Date",
        "tab-limite": "Due Date",
        "tab-local": "Pickup",
        "tab-status": "Status",
        "tab-acao": "Actions",
        "status-apto": "🟢 On Time",
        "status-vencido": "🔴 Overdue",
        "res-vazio": "No books borrowed yet.",
        "res-limite-erro": "⚠️ Max Limit Reached! You already have 5 reservations. Please return a book to free up space.",
        "btn-localizar": "📍 Get Directions",

        "conf-titulo": "Confirm Cancellation",
        "conf-msg": "Are you sure you want to cancel the reservation for {0}? This action cannot be undone.",
        "msg-reserva": "Great news, {0}! You just pre-booked: '{1}'. Pick it up at {2} within 48h.",

        "col-aluno": "Student",
        "col-livro": "Book",
        "col-polo": "Pickup Point",
        "btn-entregar": "Confirm Delivery",
        "status-retirado": "🔵 Collected",

        "place-nome": "e.g. John Doe",
        "place-ra": "Enter your Student ID",
        "place-senha": "Your secret password",
        "place-busca": "Search for titles, authors or genre...",

        "sobre-titulo": "About BiblioTech",
        "sobre-subtitulo": "Bringing knowledge to all ITB students",
        "sobre-missao-titulo": "Our Mission",
        "sobre-missao-desc": "BiblioTech was developed as a thesis project to modernize access to the bibliographic collection of the Technological Institutes of Barueri (ITB). Our platform connects students to the vast catalog of books from five units, with 100% integrated online reservations.",
        "sobre-visao-titulo": "Our Vision",
        "sobre-visao-desc": "To be the main digital library management tool for municipal technical schools, ensuring democratic access to knowledge for all ITB students.",
        "sobre-valores-titulo": "Our Values",
        "sobre-tech-titulo": "Technologies Used",

        "faq-titulo": "Frequently Asked Questions",
        "faq-subtitulo": "Find answers about the BiblioTech system",

        "contato-titulo": "Contact Us",
        "contato-subtitulo": "Have a question or suggestion? Get in touch!",
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const idiomaSalvo = localStorage.getItem('idiomaSelecionado') || 'pt';
    aplicarIdioma(idiomaSalvo);
});

function mudarIdioma(idioma) {
    localStorage.setItem('idiomaSelecionado', idioma);
    aplicarIdioma(idioma);
}

function aplicarIdioma(idioma) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const chave = el.getAttribute('data-i18n');
        const trad = traducoes[idioma]?.[chave];
        if (trad) {
            if (el.tagName === 'INPUT') el.placeholder = trad;
            else el.textContent = trad;
        }
    });

    document.querySelectorAll('.btn-dinamico-reserva').forEach(btn => {
        if (!btn.disabled) btn.textContent = traducoes[idioma]['btn-reservar'];
    });

    const btnPT = document.getElementById('btn-lang-pt');
    const btnEN = document.getElementById('btn-lang-en');
    if (btnPT && btnEN) {
        btnPT.classList.toggle('lang-ativo', idioma === 'pt');
        btnEN.classList.toggle('lang-ativo', idioma === 'en');
    }
}

function getTexto(chave) {
    const idioma = localStorage.getItem('idiomaSelecionado') || 'pt';
    return traducoes[idioma]?.[chave] || chave;
}
