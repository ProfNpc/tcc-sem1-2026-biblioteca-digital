// Lista única das unidades (polos ITB) - a mesma do front React.
// Usada no cadastro de aluno, no cadastro de livro e na seção "Nossos Polos".
export const POLOS = [
  {
    nome: 'ITB Brasílio Flores de Azevedo',
    bairro: 'Jardim Belval',
    endereco: 'R. Interna Grupo Bandeirante, 138 - Jardim Belval, Barueri - SP, 06420-150',
    img: require('../../assets/polos/polo-brasilio.png'),
  },
  {
    nome: 'ITB Prof. Munir José',
    bairro: 'Jardim Paulista',
    endereco: 'Estr. Velha de Itapevi, 2679 - Jardim Paulista, Barueri - SP, 06444-000',
    img: require('../../assets/polos/polo-munir.png'),
  },
  {
    nome: 'ITB Profª Maria Sylvia Chaluppe Mello',
    bairro: 'Engenho Novo',
    endereco: 'Rua do ITB, 238 - Vila Engenho Novo, Barueri - SP, 06415-080',
    img: require('../../assets/polos/polo-sylvia.png'),
  },
  {
    nome: 'ITB Profº Hércules Alves de Oliveira',
    bairro: 'Jardim Mutinga',
    endereco: 'R. Abelardo Luz, 86 - Jardim Mutinga, Barueri - SP, 06463-260',
    img: require('../../assets/polos/polo-hercules.png'),
  },
  {
    nome: 'ITB Profº Moacyr Domingos Sávio Veronezi',
    bairro: 'Parque Imperial',
    endereco: 'R. Tomé de Souza, 259 - Parque Imperial, Barueri - SP, 06462-040',
    img: require('../../assets/polos/polo-moacyr.png'),
  },
  {
    nome: 'ITB Profª Maria Theodora Pedreira de Freitas',
    bairro: 'Alphaville',
    endereco: 'Av. Andrômeda, 500 - Alphaville Empresarial, Barueri - SP, 06473-005',
    img: require('../../assets/polos/polo-alphaville.jpg'),
  },
];

// Só os nomes, para os seletores de cadastro/filtro
export const NOMES_UNIDADES = POLOS.map(p => p.nome);
