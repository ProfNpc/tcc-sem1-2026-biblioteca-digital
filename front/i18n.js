const traducoes = {
    pt: {
        "nav-catalogo": "Home",
        "nav-sobre": "Sobre",
        "nav-login": "Login",
        "hero-titulo": "Educação e Leitura acessível para todos",
        "hero-desc": "Explore uma variedade de livros gratuitos que sua escola oferece e aprenda sem limites!",
        "hero-btn": "Explorar Livros",
        "cat-titulo": "Livros em Destaques",
        "cat-loading": "Buscando livros no acervo da escola...",
        "cat-empty": "Não há livros no banco ainda.",
        "cat-erro": "Erro: O servidor Java está ligado? Não consegui buscar os livros.",
        "btn-reservar": "Fazer Reserva",
        "sobre-titulo": "Sobre Nós",
        "sobre-desc": "A Biblioteca Digital foi criada para simplificar o acesso ao vasto catálogo de livros da nossa instituição educacional. Nós impulsionamos o conhecimento distribuindo acesso a toda nossa grade acadêmica.",
        "footer-texto": "© 2026 Biblioteca Digital TCC. Todos os direitos reservados.",
        "login-titulo": "Entrar no Sistema",
        "login-label-ra": "RA do Aluno",
        "login-label-senha": "Senha",
        "login-btn": "Acessar",
        "login-erro-api": "RA ou Senha incorretos!",
        // Textos de Cadastro
        "cad-header": "Não tem conta?",
        "cad-link": "Cadastre-se",
        "log-link": "Já tem conta? Entrar",
        "cad-titulo": "Criar Nova Conta",
        "cad-label-nome": "Nome Completo",

        "cad-btn": "Registrar e Acessar",
        "cad-erro-api": "Erro ao tentar salvar conta no banco.",
        // Tela de Bifurcação (Pré-Login)
        "escolha-titulo": "Onde você deseja entrar?",
        "btn-sou-aluno": "📚 Portal do Aluno",
        "btn-sou-admin": "⚙️ Painel Administrativo",
        "btn-voltar": "← Trocar Portal",
        "btn-voltar-simples": "Voltar",
        "login-titulo-aluno": "Acesso Restrito - Aluno",
        "login-titulo-admin": "Acesso Restrito - Master",
        "login-erro-perfil": "Acesso Negado. Você não é um Administrador.",
        // Header logado & home
        "nav-ola": "Olá, ",
        "nav-sair": "Sair",
        "msg-reserva": "Boas notícias, {0}!\nVocê acaba de pré-reservar o exemplar: '{1}'.\nPor favor retire-o na secretaria em até 48h.",
        // Tabela
        "nav-reservas": "Minhas Reservas",
        "res-titulo": "Livros Reservados",
        "tab-livro": "Livro",
        "tab-data": "Data da Reserva",
        "tab-limite": "Entrega Limite",
        "tab-status": "Situação",
        "status-apto": "🟢 Em Dia",
        "status-vencido": "🔴 Vencido",
        "res-vazio": "Nenhum livro alugado ainda.",
        // Rodapé
        "foot-quem": "Quem somos",
        "foot-fale": "Fale conosco",
        "foot-faq": "FAQ",
        "foot-creditos": "Créditos",
        "foot-politica": "Política de privacidade",
        "res-limite-erro": "⚠️ Limite Máximo Atingido! Você já possui 5 reservas. Devolva um livro para liberar espaço.",
        "btn-localizar": "📍 Como Chegar",
        "conf-titulo": "Confirmar Cancelamento",
        "conf-msg": "Você tem certeza que deseja cancelar a reserva de {0}? Essa ação não pode ser desfeita.",
        // Efeitos Wow
        "stat-alunos": "Alunos Ativos",
        "stat-livros": "Acervo Digital",
        "stat-bib": "Institutos",
        // Como funciona
        "func-titulo": "Como a Biblioteca Funciona?",
        "func-passo1": "🔍 1. Explore e Escolha",
        "func-desc1": "Navegue pelo nosso acervo inteligente e escolha o livro ideal para sua pesquisa.",
        "func-passo2": "🔐 2. Autentique-se",
        "func-desc2": "Para segurança do acervo, as reservas exigem um Cadastro ou Login obrigatório.",
        "func-passo3": "📅 3. Reserve e Retire",
        "func-desc3": "Com 1 clique o livro é seu! Dirija-se até a portaria do seu polo em até 24h para retirar.",
        // Depoimentos
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
        // Polos Parceiros
        "polos-titulo": "Nossos Institutos Tecnológicos",
        "polo-1": "ITB Brasílio Flores",
        "polo-1-desc": "Jardim Belval",
        "polo-2": "ITB Prof. Munir José",
        "polo-2-desc": "Jardim Paulista",
        "polo-3": "ITB Profª Maria Sylvia",
        "polo-3-desc": "Engenho Novo",
        "polo-4": "ITB Profº Hércules Alves",
        "polo-4-desc": "Jardim Mutinga",
        "polo-5": "ITB Profº Moacyr Domingos",
        "polo-5-desc": "Parque Imperial",
        // Placeholder strings
        "place-nome": "Ex: João da Silva",
        "place-ra": "Digite seu RA ou Matrícula",
        "place-senha": "Sua senha secreta",
        "place-busca": "Pesquise por títulos, autores ou assunto...",
        // Admin
        "admin-res-titulo": "Gestão Global de Reservas",
        "btn-entregar": "Confirmar Entrega",
        "col-aluno": "Estudante",
        "col-livro": "Livro",
        "col-polo": "Polo de Retirada",
        "status-retirado": "🔵 Retirado"
    },
    en: {
        "nav-catalogo": "Home",
        "nav-sobre": "About Us",
        "nav-login": "Login",
        "hero-titulo": "Accessible Education and Reading for all",
        "hero-desc": "Explore a variety of free books offered by your school and learn without limits!",
        "hero-btn": "Explore Books",
        "cat-titulo": "Featured Books",
        "cat-loading": "Fetching books from the school collection...",
        "cat-empty": "There are no books in the database yet.",
        "cat-erro": "Error: Is the Java server running? Couldn't fetch books.",
        "btn-reservar": "Book Now",
        "sobre-titulo": "About Us",
        "sobre-desc": "The Digital Library was created to simplify access to the vast book catalog of our educational institution. We boost knowledge by distributing access to our entire academic curriculum.",
        "footer-texto": "© 2026 Digital Library Thesis. All rights reserved.",
        "login-titulo": "System Login",
        "login-label-ra": "Student ID (RA)",
        "login-label-senha": "Password",
        "login-btn": "Access",
        "login-erro-api": "Incorrect Student ID or Password!",
        // Textos de Cadastro
        "cad-header": "Don't have an account?",
        "cad-link": "Register yours",
        "log-link": "Already have an account? Login",
        "cad-titulo": "Create New Account",
        "cad-label-nome": "Full Name",

        "cad-btn": "Register & Access",
        "cad-erro-api": "Error saving account to the database.",
        // Tela de Bifurcação (Pré-Login)
        "escolha-titulo": "Where do you want to enter?",
        "btn-sou-aluno": "📚 Student Portal",
        "btn-sou-admin": "⚙️ Admin Dashboard",
        "btn-voltar": "← Switch Portal",
        "btn-voltar-simples": "Go Back",
        "login-titulo-aluno": "Restricted Access - Student",
        "login-titulo-admin": "Restricted Access - Master",
        "login-erro-perfil": "Access Denied. You are not an Administrator.",
        // Header logado & home
        "nav-ola": "Hello, ",
        "nav-sair": "Logout",
        "msg-reserva": "Great news, {0}!\nYou just pre-booked the copy of: '{1}'.\nPlease pick it up at the front desk within 48h.",
        // Tabela
        "nav-reservas": "My Loans",
        "res-titulo": "Reserved Books",
        "tab-livro": "Book",
        "tab-data": "Borrow Date",
        "tab-limite": "Due Date",
        "tab-status": "Status",
        "status-apto": "🟢 On Time",
        "status-vencido": "🔴 Overdue",
        "res-vazio": "No books borrowed yet.",
        // Rodapé
        "foot-quem": "About us",
        "foot-fale": "Contact us",
        "foot-faq": "FAQ",
        "foot-creditos": "Credits",
        "foot-politica": "Privacy Policy",
        "res-limite-erro": "⚠️ Max Limit Reached! You already have 5 reservations. Please return a book to free up space.",
        "btn-localizar": "📍 Get Directions",
        "conf-titulo": "Confirm Cancellation",
        "conf-msg": "Are you sure you want to cancel the reservation for {0}? This action cannot be undone.",
        // Efeitos Wow
        "stat-alunos": "Active Students",
        "stat-livros": "Digital Collection",
        "stat-bib": "Institutes",
        // Como Funciona
        "func-titulo": "How the Library Works?",
        "func-passo1": "🔍 1. Explore & Choose",
        "func-desc1": "Browse our smart collection and pick the perfect book for your research.",
        "func-passo2": "🔐 2. Authenticate",
        "func-desc2": "For collection security, all reservations require an official Login or Registration.",
        "func-passo3": "📅 3. Reserve & Pick Up",
        "func-desc3": "With 1 click the book is yours! Go to front desk within 24h to pick it up.",
        // Depoimentos
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
        // Polos Parceiros
        "polos-titulo": "Our Technological Institutes",
        "polo-1": "ITB Brasílio Flores",
        "polo-1-desc": "Jardim Belval",
        "polo-2": "ITB Prof. Munir José",
        "polo-2-desc": "Jardim Paulista",
        "polo-3": "ITB Profª Maria Sylvia",
        "polo-3-desc": "Engenho Novo",
        "polo-4": "ITB Profº Hércules Alves",
        "polo-4-desc": "Jardim Mutinga",
        "polo-5": "ITB Profº Moacyr Domingos",
        "polo-5-desc": "Parque Imperial",
        // Placeholder strings
        "place-nome": "e.g. John Doe",
        "place-ra": "Enter your ID",
        "place-senha": "Your secret password",
        "place-busca": "Search for titles, authors or subjects...",
        // Admin
        "admin-res-titulo": "Global Reservation Management",
        "btn-entregar": "Confirm Delivery",
        "col-aluno": "Student",
        "col-livro": "Book",
        "col-polo": "Pickup Point",
        "status-retirado": "🔵 Collected"
    }
};

// Quando qualquer página abrir, ela lê a preferência do usuário e aplica
document.addEventListener('DOMContentLoaded', () => {
    const idiomaSalvo = localStorage.getItem('idiomaSelecionado') || 'pt';
    aplicarIdioma(idiomaSalvo);
});

// A função mágica que é chamada ao clicar nos botões PT ou EN
function mudarIdioma(idioma) {
    localStorage.setItem('idiomaSelecionado', idioma);
    aplicarIdioma(idioma);
}

// O motor que percorre as etiquetas HTML e troca os textos sem carregar a tela
function aplicarIdioma(idioma) {
    const elementos = document.querySelectorAll('[data-i18n]');
    
    elementos.forEach(elemento => {
        const chave = elemento.getAttribute('data-i18n');
        const traducao = traducoes[idioma][chave];
        
        if (traducao) {
            // Se for input, troca o placeholder
            if (elemento.tagName === 'INPUT') {
                elemento.placeholder = traducao;
            } else {
                // Se for normal, troca o texto dentro dele
                // Caso especial se dentro dele tiver tags (<br> no ano que vem lá no JS da api de Livros) e formos substituir. Mas aqui mantemos textContent seguro.
                // Na verdade, pros botões que geramos na mão lá na classe, não usamos o data-i18n no JS, lá vai ter que gerar o botão chamando a função de tradução.
                elemento.textContent = traducao;
            }
        }
    });

    // Como o javascript que puxa os livros cria novos botões "Fazer Reserva" AFTER the page loads, 
    // precisamos de um jeito de traduzir eles se o idioma mudar com os livros já na tela
    const botoesReserva = document.querySelectorAll('.btn-dinamico-reserva');
    botoesReserva.forEach(btn => {
        btn.textContent = traducoes[idioma]["btn-reservar"];
    });

    // Mudar cor do botão ativo
    const btnPT = document.getElementById('btn-lang-pt');
    const btnEN = document.getElementById('btn-lang-en');
    
    if(btnPT && btnEN) {
        if(idioma === 'pt') {
            btnPT.classList.add('lang-ativo');
            btnEN.classList.remove('lang-ativo');
        } else {
            btnEN.classList.add('lang-ativo');
            btnPT.classList.remove('lang-ativo');
        }
    }
}

// Uma função pequena usada exclusivamente pro Javascript de puxar livros poder saber como chamar o botão de "Fazer Reserva" 
function getTexto(chave) {
    const idiomaAtual = localStorage.getItem('idiomaSelecionado') || 'pt';
    return traducoes[idiomaAtual][chave];
}
