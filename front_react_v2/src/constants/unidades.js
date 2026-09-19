// Lista única das unidades (polos ITB), usada em cadastro de aluno, cadastro de
// livro e filtro do catálogo. Antes essa lista estava duplicada em mais de um
// arquivo (e uma das cópias tinha um nome truncado) - centralizar evita isso.

import poloBrasilio  from '../img/polo-brasilio.png';
import poloMunir     from '../img/polo-munir.png';
import poloSylvia    from '../img/polo-sylvia.png';
import poloHercules  from '../img/polo-hercules.png';
import poloMoacyr    from '../img/polo-moacyr.png';
import poloAlphaville from '../img/polo-alphaville.jpg';

export const POLOS = [
  {
    nome: 'ITB Brasílio Flores de Azevedo',
    bairro: 'Jardim Belval',
    endereco: 'R. Interna Grupo Bandeirante, 138 - Jardim Belval, Barueri - SP, 06420-150',
    img: poloBrasilio,
  },
  {
    nome: 'ITB Prof. Munir José',
    bairro: 'Jardim Paulista',
    endereco: 'Estr. Velha de Itapevi, 2679 - Jardim Paulista, Barueri - SP, 06444-000',
    img: poloMunir,
  },
  {
    nome: 'ITB Profª Maria Sylvia Chaluppe Mello',
    bairro: 'Engenho Novo',
    endereco: 'Rua do ITB, 238 - Vila Engenho Novo, Barueri - SP, 06415-080',
    img: poloSylvia,
  },
  {
    nome: 'ITB Profº Hércules Alves de Oliveira',
    bairro: 'Jardim Mutinga',
    endereco: 'R. Abelardo Luz, 86 - Jardim Mutinga, Barueri - SP, 06463-260',
    img: poloHercules,
  },
  {
    nome: 'ITB Profº Moacyr Domingos Sávio Veronezi',
    bairro: 'Parque Imperial',
    endereco: 'R. Tomé de Souza, 259 - Parque Imperial, Barueri - SP, 06462-040',
    img: poloMoacyr,
  },
  {
    nome: 'ITB Profª Maria Theodora Pedreira de Freitas',
    bairro: 'Alphaville',
    endereco: 'Av. Andrômeda, 500 - Alphaville Empresarial, Barueri - SP, 06473-005',
    img: poloAlphaville,
  },
];

// Só os nomes, pra usar em <select> de cadastro/filtro
export const NOMES_UNIDADES = POLOS.map(p => p.nome);
