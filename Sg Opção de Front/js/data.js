// ============================================================
//  BiblioTech — Dados Mockados (sem backend)
//  Substitui todas as chamadas ao Java/Spring Boot
// ============================================================

const DB = {
    livros: [
        { id: 1,  titulo: "Clean Code",                        autor: "Robert C. Martin",  anoPublicacao: 2008, genero: "Tecnologia",   disponivel: true  },
        { id: 2,  titulo: "Engenharia de Software",            autor: "Ian Sommerville",   anoPublicacao: 2011, genero: "Tecnologia",   disponivel: true  },
        { id: 3,  titulo: "O Senhor dos Anéis",                autor: "J.R.R. Tolkien",    anoPublicacao: 1954, genero: "Fantasia",     disponivel: false },
        { id: 4,  titulo: "1984",                              autor: "George Orwell",     anoPublicacao: 1949, genero: "Ficção",       disponivel: true  },
        { id: 5,  titulo: "Harry Potter e a Pedra Filosofal", autor: "J.K. Rowling",      anoPublicacao: 1997, genero: "Fantasia",     disponivel: true  },
        { id: 6,  titulo: "Dom Casmurro",                      autor: "Machado de Assis",  anoPublicacao: 1899, genero: "Literatura",   disponivel: false },
        { id: 7,  titulo: "Design de Interfaces",              autor: "Steve Krug",        anoPublicacao: 2014, genero: "Design",       disponivel: true  },
        { id: 8,  titulo: "Algoritmos: Teoria e Prática",      autor: "Thomas H. Cormen",  anoPublicacao: 2009, genero: "Tecnologia",   disponivel: true  },
        { id: 9,  titulo: "As Crônicas de Nárnia",            autor: "C.S. Lewis",        anoPublicacao: 1950, genero: "Fantasia",     disponivel: false },
        { id: 10, titulo: "O Pequeno Príncipe",                autor: "Antoine de Saint",  anoPublicacao: 1943, genero: "Literatura",   disponivel: true  },
        { id: 11, titulo: "Arquitetura de Software",           autor: "Mark Richards",     anoPublicacao: 2020, genero: "Tecnologia",   disponivel: true  },
        { id: 12, titulo: "Sapiens",                           autor: "Yuval Noah Harari", anoPublicacao: 2011, genero: "História",     disponivel: true  },
    ],

    // Tabela de usuários mockada
    usuarios: [
        { id: 1, nome: "João da Silva",    ra: "aluno",  senha: "1234",  perfil: "ALUNO" },
        { id: 2, nome: "Admin Sistema",    ra: "admin",  senha: "admin", perfil: "ADMIN" },
        { id: 3, nome: "Maria Oliveira",   ra: "maria",  senha: "1234",  perfil: "ALUNO" },
    ],

    // Reservas persistidas no localStorage
    getReservas() {
        return JSON.parse(localStorage.getItem('bt_reservas') || '[]');
    },
    salvarReservas(lista) {
        localStorage.setItem('bt_reservas', JSON.stringify(lista));
    },

    // Operações de reserva
    criarReserva(nomeAluno, tituloLivro, poloRetirada) {
        const reservas = this.getReservas();
        const ativas = reservas.filter(r => r.nomeAluno === nomeAluno && r.status !== 'CANCELADO');
        if (ativas.length >= 5) return { erro: 'LIMITE_ATINGIDO' };

        const hoje = new Date();
        const devolucao = new Date();
        devolucao.setDate(hoje.getDate() + 14);

        const nova = {
            id: Date.now(),
            nomeAluno,
            tituloLivro,
            poloRetirada,
            dataReserva:    hoje.toISOString().split('T')[0],
            dataDevolucao:  devolucao.toISOString().split('T')[0],
            status: 'RESERVADO'
        };
        reservas.push(nova);
        this.salvarReservas(reservas);
        return { ok: true, reserva: nova };
    },

    cancelarReserva(id) {
        const reservas = this.getReservas();
        const idx = reservas.findIndex(r => r.id === id);
        if (idx === -1) return false;
        reservas.splice(idx, 1);
        this.salvarReservas(reservas);
        return true;
    },

    confirmarEntrega(id) {
        const reservas = this.getReservas();
        const item = reservas.find(r => r.id === id);
        if (!item) return false;
        item.status = 'RETIRADO';
        this.salvarReservas(reservas);
        return true;
    },

    getReservasPorAluno(nome) {
        return this.getReservas().filter(r => r.nomeAluno === nome && r.status !== 'CANCELADO');
    },

    getTodasReservas() {
        return this.getReservas().filter(r => r.status !== 'CANCELADO');
    },

    // Login
    autenticar(ra, senha) {
        return this.usuarios.find(u => u.ra === ra && u.senha === senha) || null;
    },

    cadastrar(nome, ra, senha) {
        if (this.usuarios.find(u => u.ra === ra)) return null;
        const novo = { id: Date.now(), nome, ra, senha, perfil: 'ALUNO' };
        this.usuarios.push(novo);
        return novo;
    },

    // Helpers de capa por título
    getCapaUrl(titulo) {
        const t = titulo.toLowerCase();
        if (t.includes('design') || t.includes('interface'))
            return 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=400&q=80';
        if (t.includes('clean code') || t.includes('engenharia') || t.includes('algoritmo') || t.includes('arquitetura'))
            return 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=400&q=80';
        if (t.includes('1984') || t.includes('anéis') || t.includes('casmurro') || t.includes('nárnia'))
            return 'https://images.unsplash.com/photo-1608178398319-48f814d0750c?auto=format&fit=crop&w=400&q=80';
        if (t.includes('harry'))
            return 'https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?auto=format&fit=crop&w=400&q=80';
        if (t.includes('sapiens') || t.includes('história'))
            return 'https://images.unsplash.com/photo-1535905557558-afc4877a26fc?auto=format&fit=crop&w=400&q=80';
        return 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=400&q=80';
    }
};

// Metadados dos Polos
const POLOS_META = {
    "ITB Brasílio Flores de Azevedo": {
        img: "../img/ITB Brasílio Flores de Azevedo.png",
        end: "R. Interna Grupo Bandeirante, 138 - Jardim Belval, Barueri - SP"
    },
    "ITB Prof. Munir José": {
        img: "../img/ITB Prof. Munir José.png",
        end: "Estr. Velha de Itapevi, 2679 - Jardim Paulista, Barueri - SP"
    },
    "ITB Profª Maria Sylvia Chaluppe Mello": {
        img: "../img/ITB Profª Maria Sylvia Chaluppe Mello (Engenho Novo).png",
        end: "Rua do ITB, 238 - Vila Engenho Novo, Barueri - SP"
    },
    "ITB Profº Hércules Alves de Oliveira": {
        img: "../img/ITB Profº Hércules Alves de Oliveira (Jardim Mutinga).png",
        end: "R. Abelardo Luz, 86 - Jardim Mutinga, Barueri - SP"
    },
    "ITB Profº Moacyr Domingos Sávio Veronezi": {
        img: "../img/ITB Profº Moacyr Domingos Sávio Veronezi.png",
        end: "R. Tomé de Souza, 259 - Parque Imperial, Barueri - SP"
    }
};
