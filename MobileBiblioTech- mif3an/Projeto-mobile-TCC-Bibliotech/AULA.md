# 📖 Aula: BiblioTech Mobile, linha por linha

Esta é uma aula sobre o app mobile que construímos. Vou falar como um professor: primeiro a ideia geral, depois as ferramentas, e só então o código, **linha por linha**, na ordem em que faz sentido aprender.

> ⚠️ **Sobre testes:** eu validei a sintaxe de todos os arquivos e a resolução dos `import` entre eles. **Não consegui rodar o app num celular nem no emulador**, nem o SQL Server, neste ambiente. Então, ao rodar pela primeira vez, se aparecer algum erro, copie a mensagem completa e me mande: é normal ajustar detalhes na primeira execução.

## Como usar esta aula
1. Abra o projeto no VS Code numa janela e esta aula em outra.
2. Cada trecho de código aparece com o número da linha, no mesmo número que você vê no editor.
3. Depois de cada trecho, os itens **Linha N** explicam o que aquela linha faz e **por quê**.
4. Todos os arquivos do app usam a extensão **`.jsx`** (JavaScript com JSX, o formato do React Native). Só o `index.js`, ponto de entrada padrão do Expo, mantém `.js`: ele não tem JSX e é o arquivo que o `package.json` aponta em `"main"`.

---

## Aula 0: O que foi construído

O BiblioTech mobile é um **terceiro cliente** do mesmo sistema. Você já tinha o back-end (Java/Spring Boot). O app novo só **conversa com a API**, exatamente como o `front_react_v2`.

```text
   ┌──────────────┐   HTTP + JSON    ┌───────────────────┐    JDBC     ┌─────────────┐
   │  App mobile  │ ───────────────▶ │  API Spring Boot  │ ──────────▶ │ SQL Server  │
   │ (este projeto)│ ◀─────────────── │  (porta 8080)     │ ◀────────── │ bibliotecadigital
   └──────────────┘                  └───────────────────┘             └─────────────┘
   ┌──────────────┐        ▲
   │ front_react_v2│ ───────┘  (o front web usa a MESMA API)
   └──────────────┘
```

**Regra de ouro:** o app **nunca** fala com o banco. Quem fala com o banco é a API. O app só faz pedidos HTTP (`GET`, `POST`, `PUT`, `DELETE`) para endereços como `/api/livros`.

### Mapa dos arquivos

| Arquivo | Papel | Equivalente no React web |
|---|---|---|
| `App.jsx` | Tela raiz: cabeçalho, abas, qual página mostrar | `App.jsx` |
| `src/config.jsx` | Endereço do servidor | (era fixo `localhost` no `api.js`) |
| `src/services/api.jsx` | Todas as chamadas HTTP | `services/api.js` |
| `src/constants/unidades.jsx` | Lista dos polos ITB | `constants/unidades.js` |
| `src/theme.jsx` | Cores claro/escuro | `index.css` + classe `dark-mode` |
| `src/utils.jsx` | Funções pequenas (data, busca, situação) | funções repetidas dentro das páginas |
| `src/components/Toast.jsx` | Mensagens que aparecem e somem | `components/Toast.jsx` |
| `src/components/CapaLivro.jsx` | Capa do livro (foto ou capa genérica) | `components/CapaLivro.jsx` + `capas.js` |
| `src/components/ui.jsx` | Botão, campo, seletor, selo, janela | classes CSS (`btn-primario`, `modal-box`...) |
| `src/components/CartaoLivro.jsx` | Cartão de um livro | `card-livro` repetido nas páginas |
| `src/pages/LoginPage.jsx` | Escolha do portal, login, cadastro | `LoginPage.jsx` |
| `src/pages/CatalogoPage.jsx` | Home pública + polos | `CatalogoPage.jsx` |
| `src/pages/AcervoPage.jsx` | Catálogo do aluno + reservar | `AcervoPage.jsx` |
| `src/pages/ReservasPage.jsx` | Minhas reservas e histórico | `ReservasPage.jsx` |
| `src/pages/AdminReservasPage.jsx` | Painel + entregar/devolver | `AdminReservasPage.jsx` |
| `src/pages/AdminLivrosPage.jsx` | CRUD de livros | `AdminLivrosPage.jsx` |
| `src/pages/AdminAlunosPage.jsx` | CRUD de alunos | `AdminAlunosPage.jsx` |

---

## Aula 1: Web vs Mobile (o que muda e o que NÃO muda)

**O que não muda:** React é React. Componentes, `props`, `useState`, `useEffect`, `async/await`, `fetch`, `.map()`, `.filter()`, a lógica de negócio e todas as chamadas à API são os mesmos.

**O que muda:** não existe HTML nem CSS. Existem "componentes nativos" e estilos escritos em JavaScript.

| Web (HTML/CSS) | Mobile (React Native) | Observação |
|---|---|---|
| `<div>` | `<View>` | Caixa genérica |
| `<p>`, `<h1>`, `<span>` | `<Text>` | **Todo texto** precisa estar dentro de `<Text>` |
| `<input>` | `<TextInput>` | Usa `onChangeText` (recebe o texto direto), não `onChange` |
| `<button>` | `<Pressable>` | Usa `onPress`, não `onClick` |
| `<img>` | `<Image>` | Usa `source={{ uri: '...' }}` |
| `<select>` | componente `Seletor` (nosso) | Não existe `<select>` no mobile |
| `<table>` | cartões numa `FlatList` | Tabelas não cabem na tela do celular |
| `<form>` + `required` | validação manual antes de enviar | Não há formulário HTML |
| modal com CSS | `<Modal>` | Componente nativo |
| `confirm()` | `Alert.alert()` | Alerta nativo com botões |
| `localStorage` | variável em memória (`let token`) | Não existe `localStorage` no celular |
| `<iframe>` do Google Maps | `Linking.openURL(...)` | Abre o app de mapas |
| arquivo `.css` | `StyleSheet.create({...})` | Estilos são objetos JS |
| `display: flex` opcional | **todo `View` já é flexbox** | Por padrão a direção é **coluna** |

---

## Aula 2: Os conceitos que você precisa dominar

### 2.1 Componente
É uma **função que devolve um pedaço de tela** (JSX). Ex.: `function Botao() { return <Pressable>...</Pressable>; }`. Você monta telas grandes juntando componentes pequenos, como peças de Lego.

### 2.2 Props
São os **parâmetros** de um componente: `<Botao titulo="Salvar" onPress={salvar} />`. Dentro do componente, `titulo` e `onPress` chegam como variáveis. Os `props` fluem **de cima para baixo** (pai → filho).

### 2.3 `useState`: a memória do componente
`const [busca, setBusca] = useState('')` cria uma variável `busca` (valor atual, começa `''`) e uma função `setBusca` para trocá-la. **Quando você chama `setBusca`, o React redesenha o componente.** Nunca faça `busca = 'x'` direto: a tela não atualizaria.

### 2.4 `useEffect`: "faça isto depois de desenhar"
`useEffect(() => { carregar(); }, [unidade])` executa `carregar()` depois que a tela aparece **e** sempre que `unidade` mudar. Com `[]` (lista vazia) executa **uma vez só**, ao abrir a tela.

### 2.5 Promise, `async` e `await`
Pedir dados ao servidor demora. Uma **Promise** é a "promessa de resposta". Você pode encadear `.then(...)` (quando chegar) e `.catch(...)` (se der erro), ou usar `await` dentro de uma função `async`, que "espera" a resposta sem travar a tela. `try { ... } catch { ... }` captura erros de rede.

### 2.6 `fetch` e JSON
`fetch(url, { method, headers, body })` faz o pedido HTTP. A resposta (`resp`) tem `resp.ok` (true se status 200–299), `resp.status` (200, 401, 409...), `resp.json()` (converte o corpo em objeto) e `resp.text()` (corpo como texto).

### 2.7 Token e `Authorization: Bearer`
No login o servidor devolve um **token** (um código único, UUID). Nos pedidos seguintes o app manda `Authorization: Bearer <token>`. O `AuthFilter` do Spring lê esse header e decide: sem token → **401**; token de aluno tentando rota de admin → **403**.

### 2.8 `FlatList`: listas eficientes
Em vez de `.map()` numa lista enorme, a `FlatList` só desenha o que aparece na tela. Recebe `data` (a lista), `renderItem` (como desenhar cada item) e `keyExtractor` (id único de cada item). Ganha de brinde o "puxar para atualizar" (`refreshing` + `onRefresh`).

### 2.9 `StyleSheet` e flexbox
Estilos são objetos: `{ padding: 16, borderRadius: 14 }` (números, sem "px"; `backgroundColor` em vez de `background-color`). Dois eixos: `flexDirection: 'column'` (padrão, empilha) e `'row'` (lado a lado). `flex: 1` significa "ocupe o espaço que sobrar". `gap` é o espaço entre filhos.

### 2.10 Context
Um "canal" para passar um valor (aqui, as **cores do tema**) a **qualquer** componente descendente, sem repassar por props em todos os níveis.

---

## Aula 3: Como o app se liga ao banco (uma reserva de ponta a ponta)

Quando o aluno toca em **Reservar**:

1. `AcervoPage.confirmarReserva()` chama `api.criarEmprestimo({ nomeAluno, tituloLivro })`.
2. `api.jsx` faz `POST http://SEU-IP:8080/api/emprestimos` com o header `Authorization: Bearer <token>`.
3. O `AuthFilter` valida o token na memória do servidor.
4. O `EmprestimoController.registrarReserva` confere: máximo de 3 ativas, livro já reservado por ele, livro existente e **estoque > 0**.
5. No **banco**: `UPDATE livro SET quantidade_disponivel = quantidade_disponivel - 1` e `INSERT INTO emprestimo (nome_aluno, titulo_livro, data_reserva, data_limite_reserva, status, polo_retirada)` com `status = 'RESERVADO'`.
6. A API responde **201**. O app mostra o toast e recarrega `GET /api/livros?unidade=...`, que já traz o estoque diminuído.

Por isso o script SQL que criamos tem exatamente as colunas `nome_aluno`, `titulo_livro`, `quantidade_disponivel` etc.: são os nomes que o Spring gera a partir das classes Java.

---

# Parte prática: o código, arquivo por arquivo


---

## Aula 4: `config.jsx` (onde está o servidor)

📁 **Arquivo:** `src/config.jsx`

**Para que serve:** Guarda **um único** endereço: o do servidor Java. Todo o app usa esse valor.

**Analogia:** É o número de telefone do servidor. Se estiver errado, ninguém atende.

**No React web era:** o `const BASE = 'http://localhost:8080/api'` escrito direto no `api.js` do React.


**📍 `config.jsx` — linhas 1 a 11**

```jsx
  1 │ // Onde está o servidor Java (Spring Boot)?
  2 │ //
  3 │ // O celular NÃO enxerga o "localhost" do seu PC: para o celular, "localhost"
  4 │ // é o próprio celular. Escolha UMA das opções abaixo:
  5 │ //
  6 │ //   1) Celular real com Expo Go, no MESMO Wi-Fi do PC:
  7 │ //      use o IP do PC (no Windows: abra o CMD, rode "ipconfig" e copie o
  8 │ //      "Endereço IPv4"). Ex.: 'http://192.168.0.10:8080'
  9 │ //   2) Emulador Android: 'http://10.0.2.2:8080'  (10.0.2.2 = "o PC" visto de dentro do emulador)
 10 │ //   3) Simulador iOS (só em Mac): 'http://localhost:8080'
 11 │ export const SERVIDOR = 'http://192.168.0.10:8080';
```

No navegador do PC, `localhost` é o próprio PC. **No celular, `localhost` é o próprio celular.** Como o servidor Java roda no PC, o app precisa do IP do PC.
- **Linhas 1–5** — Comentários (`//`) não executam: só explicam. Aqui avisam do erro mais comum de quem começa em mobile.
- **Linhas 6–8** — Com o Expo Go no celular, ele e o PC precisam estar no **mesmo Wi-Fi**. O IP se descobre com `ipconfig` no CMD do Windows (procure "Endereço IPv4").
- **Linha 9** — O emulador Android chama o PC de `10.0.2.2`.
- **Linha 10** — O simulador do iPhone (só existe em Mac) compartilha a rede do Mac, então `localhost` funciona.
- **Linha 11** — `export` deixa outros arquivos importarem o valor; `const` é uma constante. **Este é o único lugar que você edita** para trocar de rede. Não há `/api` no fim porque o `api.jsx` acrescenta.


---

## Aula 5: `unidades.jsx` (os polos ITB)

📁 **Arquivo:** `src/constants/unidades.jsx`

**Para que serve:** Lista dos 6 polos com nome, bairro, endereço e foto. Alimenta o cadastro, o cadastro de livro e a seção "Nossos Polos".

**Analogia:** É a lista telefônica das escolas: todas as telas consultam a mesma fonte.

**No React web era:** o mesmo arquivo, mas com `import poloBrasilio from '../img/polo-brasilio.png'`.


**📍 `unidades.jsx` — linhas 1 a 9**

```jsx
  1 │ // Lista única das unidades (polos ITB) - a mesma do front React.
  2 │ // Usada no cadastro de aluno, no cadastro de livro e na seção "Nossos Polos".
  3 │ export const POLOS = [
  4 │   {
  5 │     nome: 'ITB Brasílio Flores de Azevedo',
  6 │     bairro: 'Jardim Belval',
  7 │     endereco: 'R. Interna Grupo Bandeirante, 138 - Jardim Belval, Barueri - SP, 06420-150',
  8 │     img: require('../../assets/polos/polo-brasilio.png'),
  9 │   },
```

- **Linhas 1–2** — Comentário: a lista é **única** para evitar cópias diferentes espalhadas pelo código.
- **Linha 3** — `export const POLOS = [` cria um **array** (lista) de objetos, um por polo.
- **Linha 4** — `{` abre o objeto do primeiro polo.
- **Linha 5** — `nome` é o nome **exato**. Ele é gravado na coluna `unidade` do banco, então precisa ser idêntico ao dos livros e alunos.
- **Linha 6** — `bairro` aparece no cartão da tela.
- **Linha 7** — `endereco` é o texto usado para abrir o mapa.
- **Linha 8** — No mobile, imagem local se carrega com `require('caminho')`. `../../` sobe duas pastas (de `constants` e de `src`) até a raiz, e entra em `assets/polos`.
- **Linha 9** — `},` fecha o objeto (a vírgula separa do próximo).


**📍 `unidades.jsx` — linhas 10 a 40**

```jsx
 10 │   {
 11 │     nome: 'ITB Prof. Munir José',
 12 │     bairro: 'Jardim Paulista',
 13 │     endereco: 'Estr. Velha de Itapevi, 2679 - Jardim Paulista, Barueri - SP, 06444-000',
 14 │     img: require('../../assets/polos/polo-munir.png'),
 15 │   },
 16 │   {
 17 │     nome: 'ITB Profª Maria Sylvia Chaluppe Mello',
 18 │     bairro: 'Engenho Novo',
 19 │     endereco: 'Rua do ITB, 238 - Vila Engenho Novo, Barueri - SP, 06415-080',
 20 │     img: require('../../assets/polos/polo-sylvia.png'),
 21 │   },
 22 │   {
 23 │     nome: 'ITB Profº Hércules Alves de Oliveira',
 24 │     bairro: 'Jardim Mutinga',
 25 │     endereco: 'R. Abelardo Luz, 86 - Jardim Mutinga, Barueri - SP, 06463-260',
 26 │     img: require('../../assets/polos/polo-hercules.png'),
 27 │   },
 28 │   {
 29 │     nome: 'ITB Profº Moacyr Domingos Sávio Veronezi',
 30 │     bairro: 'Parque Imperial',
 31 │     endereco: 'R. Tomé de Souza, 259 - Parque Imperial, Barueri - SP, 06462-040',
 32 │     img: require('../../assets/polos/polo-moacyr.png'),
 33 │   },
 34 │   {
 35 │     nome: 'ITB Profª Maria Theodora Pedreira de Freitas',
 36 │     bairro: 'Alphaville',
 37 │     endereco: 'Av. Andrômeda, 500 - Alphaville Empresarial, Barueri - SP, 06473-005',
 38 │     img: require('../../assets/polos/polo-alphaville.jpg'),
 39 │   },
 40 │ ];
```

Os outros cinco polos seguem **exatamente a mesma estrutura** (nome, bairro, endereço, imagem).
- **Linhas 10–15** — Polo **Munir José** (Jardim Paulista).
- **Linhas 16–21** — Polo **Maria Sylvia Chaluppe Mello** (Engenho Novo).
- **Linhas 22–27** — Polo **Hércules Alves de Oliveira** (Jardim Mutinga).
- **Linhas 28–33** — Polo **Moacyr Domingos Sávio Veronezi** (Parque Imperial).
- **Linhas 34–39** — Polo **Maria Theodora Pedreira de Freitas** (Alphaville). A foto deste é `.jpg`, as outras são `.png`.
- **Linha 40** — `];` fecha o array.


**📍 `unidades.jsx` — linhas 42 a 43**

```jsx
 42 │ // Só os nomes, para os seletores de cadastro/filtro
 43 │ export const NOMES_UNIDADES = POLOS.map(p => p.nome);
```

- **Linha 42** — Comentário: para os seletores só interessam os nomes.
- **Linha 43** — `.map(p => p.nome)` percorre a lista e devolve um array **novo** só com os nomes. É isso que os componentes `Seletor` recebem.


---

## Aula 6: `theme.jsx` (cores e modo escuro)

📁 **Arquivo:** `src/theme.jsx`

**Para que serve:** Define as duas paletas (clara e escura) e o "canal" (Context) para qualquer tela ler as cores atuais.

**Analogia:** É o interruptor de luz do prédio: uma chave central e todas as salas acompanham.

**No React web era:** o `index.css` com a classe `dark-mode` ligada no `<body>`.


**📍 `theme.jsx` — linhas 1 a 5**

```jsx
  1 │ import { createContext, useContext } from 'react';
  2 │ import { Platform, StatusBar } from 'react-native';
  3 │ 
  4 │ // Paletas de cor. No React web isso era feito com CSS (classe "dark-mode");
  5 │ // no mobile não existe CSS, então guardamos as cores em objetos JavaScript.
```

- **Linha 1** — `createContext` cria o canal de comunicação; `useContext` lê o canal.
- **Linha 2** — `Platform.OS` diz se é `'ios'` ou `'android'`. `StatusBar.currentHeight` é a altura da barra de status do Android.
- **Linhas 4–5** — No React web o modo escuro era CSS. No mobile não há CSS, então as cores viram objetos JavaScript.


**📍 `theme.jsx` — linhas 6 a 17**

```jsx
  6 │ export const CLARO = {
  7 │   fundo: '#f1f5f9', cartao: '#ffffff', texto: '#1e293b', suave: '#64748b',
  8 │   primaria: '#2563eb', titulo: '#1e3a8a', borda: '#e2e8f0', input: '#ffffff',
  9 │   cabecalho: '#1e3a8a', perigo: '#ef4444', sucesso: '#16a34a',
 10 │   selo: {
 11 │     verde: { fundo: '#dcfce7', texto: '#166534' },
 12 │     vermelho: { fundo: '#fee2e2', texto: '#991b1b' },
 13 │     azul: { fundo: '#dbeafe', texto: '#1e40af' },
 14 │     laranja: { fundo: '#ffedd5', texto: '#9a3412' },
 15 │     cinza: { fundo: '#e2e8f0', texto: '#334155' },
 16 │   },
 17 │ };
```

- **Linha 6** — Objeto da paleta clara. Cada chave é um **papel** da cor (não a cor em si).
- **Linha 7** — `fundo` = fundo da tela; `cartao` = fundo dos cartões; `texto` = texto principal; `suave` = texto secundário.
- **Linha 8** — `primaria` = azul dos botões; `titulo` = cor dos títulos; `borda` = linhas; `input` = fundo dos campos.
- **Linha 9** — `cabecalho` = barra azul do topo; `perigo` = vermelho (excluir); `sucesso` = verde (entregar).
- **Linhas 10–16** — `selo` é um objeto **dentro** do objeto: cada "tom" de etiqueta tem `fundo` e `texto`, para manter o contraste legível. São os 5 tons usados em "Disponível", "Reservado", "Em atraso" etc.
- **Linha 17** — Fecha a paleta clara.


**📍 `theme.jsx` — linhas 19 a 30**

```jsx
 19 │ export const ESCURO = {
 20 │   fundo: '#0f172a', cartao: '#1e293b', texto: '#e2e8f0', suave: '#94a3b8',
 21 │   primaria: '#3b82f6', titulo: '#93c5fd', borda: '#334155', input: '#0f172a',
 22 │   cabecalho: '#172554', perigo: '#ef4444', sucesso: '#22c55e',
 23 │   selo: {
 24 │     verde: { fundo: '#14532d', texto: '#bbf7d0' },
 25 │     vermelho: { fundo: '#7f1d1d', texto: '#fecaca' },
 26 │     azul: { fundo: '#1e3a8a', texto: '#bfdbfe' },
 27 │     laranja: { fundo: '#7c2d12', texto: '#fed7aa' },
 28 │     cinza: { fundo: '#334155', texto: '#e2e8f0' },
 29 │   },
 30 │ };
```

- **Linhas 19–30** — Paleta escura com a **mesma estrutura** (mesmas chaves). Isso é essencial: as telas escrevem `cores.fundo` sem saber qual paleta está ativa.


**📍 `theme.jsx` — linhas 32 a 34**

```jsx
 32 │ // Contexto: um "canal" para qualquer tela ler o tema atual sem receber por props.
 33 │ export const TemaContext = createContext({ cores: CLARO, escuro: false, alternar: () => {} });
 34 │ export function useTema() { return useContext(TemaContext); }
```

- **Linha 32** — Explica o que é Context.
- **Linha 33** — Cria o canal. O objeto entre parênteses é o **valor padrão**: paleta clara, sem modo escuro, função vazia.
- **Linha 34** — Atalho: em vez de escrever `useContext(TemaContext)` em cada tela, chamamos `useTema()` e recebemos `{ cores, escuro, alternar }`.


**📍 `theme.jsx` — linhas 36 a 38**

```jsx
 36 │ // Espaço para não ficar embaixo da barra de status (relógio/bateria) e da barra inferior.
 37 │ export const TOPO_SEGURO = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 50;
 38 │ export const BASE_SEGURA = Platform.OS === 'ios' ? 20 : 0;
```

- **Linha 36** — O celular tem "entalhe" e barras do sistema (relógio, gestos). Sem folga, o conteúdo ficaria por baixo delas.
- **Linha 37** — No Android usa a altura real da barra de status (ou 24 se não souber); no iPhone usa 50, um valor médio. `? :` é o operador ternário (`condição ? seTrue : seFalse`).
- **Linha 38** — Folga embaixo no iPhone (barra de gestos); no Android, 0.
- 💡 **Melhoria futura:** a biblioteca `react-native-safe-area-context` calcula isso exatamente por aparelho. Usei valores fixos para o projeto rodar sem instalar nada além do template.


---

## Aula 7: `utils.jsx` (funções pequenas reutilizadas)

📁 **Arquivo:** `src/utils.jsx`

**Para que serve:** Formatar data, filtrar por texto e decidir a "situação" (cor e texto) de uma reserva.

**Analogia:** É a caixa de ferramentas: martelo e chave de fenda que várias telas usam.

**No React web era:** as mesmas contas **copiadas** dentro de `ReservasPage` e `AdminReservasPage`. Aqui ficaram num só lugar.


**📍 `utils.jsx` — linhas 1 a 7**

```jsx
  1 │ // Funções pequenas usadas em mais de uma tela.
  2 │ 
  3 │ // "2026-09-28" ou "2026-09-28T10:00:00" -> "28/09/2026"
  4 │ export function formatarData(dateStr) {
  5 │   if (!dateStr) return '-';
  6 │   return dateStr.split('T')[0].split('-').reverse().join('/');
  7 │ }
```

- **Linha 1** — Comentário do arquivo.
- **Linha 3** — Exemplo do que a função faz.
- **Linha 4** — Recebe uma data em texto e devolve `dd/mm/aaaa`.
- **Linha 5** — Se veio vazio ou nulo, devolve `'-'`. O `!` significa "não": `!dateStr` é verdadeiro quando não há valor.
- **Linha 6** — Passo a passo com `"2026-09-28T10:00:00"`: `.split('T')[0]` → `"2026-09-28"`; `.split('-')` → `["2026","09","28"]`; `.reverse()` → `["28","09","2026"]`; `.join('/')` → `"28/09/2026"`.


**📍 `utils.jsx` — linhas 9 a 12**

```jsx
  9 │ // true se o texto contém a busca, ignorando maiúsculas e valores nulos
 10 │ export function contem(texto, busca) {
 11 │   return (texto || '').toLowerCase().includes(busca.toLowerCase());
 12 │ }
```

- **Linha 9** — Comentário.
- **Linha 10** — Devolve `true` se `texto` contém `busca`.
- **Linha 11** — `(texto || '')` troca `null` por texto vazio (evita erro em `null.toLowerCase()`). Converter os dois lados para minúsculas faz a busca ignorar maiúsculas. `.includes` responde se um texto contém o outro.


**📍 `utils.jsx` — linhas 14 a 18**

```jsx
 14 │ // Situação de uma reserva/empréstimo ATIVO (mesma regra das telas do React)
 15 │ export function situacaoAtiva(r) {
 16 │   const hoje = new Date();
 17 │   const limiteReserva = r.dataLimiteReserva ? new Date(`${r.dataLimiteReserva}T23:59:59`) : null;
 18 │   const limiteDevolucao = r.dataDevolucao ? new Date(`${r.dataDevolucao}T23:59:59`) : null;
```

- **Linha 14** — A mesma regra das telas do React, agora centralizada.
- **Linha 15** — Recebe um registro `r` (empréstimo) e devolve `{ texto, tom }`: o texto do selo e sua cor.
- **Linha 16** — `new Date()` = agora.
- **Linha 17** — Se existe `dataLimiteReserva`, cria uma data com esse dia às **23:59:59** (a reserva vale até o fim do dia limite). Senão, `null`. O `T` separa dia e hora no formato ISO.
- **Linha 18** — Idem para o prazo de devolução.


**📍 `utils.jsx` — linhas 20 a 24**

```jsx
 20 │   if (r.status === 'RESERVADO') {
 21 │     return limiteReserva && hoje > limiteReserva
 22 │       ? { texto: '🔴 Reserva vencida', tom: 'vermelho' }
 23 │       : { texto: '🟢 Reservado', tom: 'verde' };
 24 │   }
```

- **Linha 20** — `===` compara valor **e** tipo. Só entra se o status for `RESERVADO`.
- **Linha 21** — `limiteReserva && hoje > limiteReserva`: existe limite **e** hoje passou dele?
- **Linha 22** — Se sim (`?`): vermelho, "Reserva vencida".
- **Linha 23** — Se não (`:`): verde, "Reservado".


**📍 `utils.jsx` — linhas 25 a 31**

```jsx
 25 │   if (r.status === 'RETIRADO') {
 26 │     return limiteDevolucao && hoje > limiteDevolucao
 27 │       ? { texto: '🔴 Em atraso', tom: 'vermelho' }
 28 │       : { texto: '🔵 Retirado', tom: 'azul' };
 29 │   }
 30 │   return { texto: r.status, tom: 'cinza' };
 31 │ }
```

- **Linha 25** — Livro já está com o aluno (`RETIRADO`).
- **Linha 26** — Passou do prazo de devolução?
- **Linha 27** — Sim: vermelho, "Em atraso".
- **Linha 28** — Não: azul, "Retirado".
- **Linha 30** — Qualquer outro status: mostra o texto cru em cinza (rede de segurança).
- **Linha 31** — Fecha a função.


**📍 `utils.jsx` — linhas 33 a 38**

```jsx
 33 │ // Situação de um registro do HISTÓRICO
 34 │ export function situacaoHistorico(r) {
 35 │   if (r.status === 'DEVOLVIDO') return { texto: `🟢 Devolvido em ${formatarData(r.dataDevolucaoReal)}`, tom: 'verde' };
 36 │   if (r.status === 'EXPIRADO') return { texto: '🟠 Reserva expirada', tom: 'laranja' };
 37 │   return { texto: '🔴 Cancelado', tom: 'vermelho' };
 38 │ }
```

- **Linhas 33–34** — Situação de registros **encerrados** (histórico).
- **Linha 35** — `DEVOLVIDO`: verde, com a data real de devolução (`dataDevolucaoReal`) formatada.
- **Linha 36** — `EXPIRADO`: laranja. O aluno não retirou no prazo e o servidor expirou a reserva.
- **Linha 37** — Sobrou `CANCELADO`: vermelho.


---

## Aula 8: `api.jsx` (a ponte com o servidor)

📁 **Arquivo:** `src/services/api.jsx`

**Para que serve:** Todas as chamadas HTTP do app em um lugar só. As telas **nunca** escrevem `fetch` direto: chamam `api.getLivros()`, `api.login(...)` etc.

**Analogia:** É o garçom: as telas fazem o pedido, ele leva à cozinha (API) e traz o prato.

**No React web era:** o mesmo arquivo. Mudanças: token em memória (sem `localStorage`), endereço vindo do `config.jsx` e tratamento de sessão expirada.


**📍 `api.jsx` — linhas 1 a 12**

```jsx
  1 │ import { SERVIDOR } from '../config';
  2 │ 
  3 │ const BASE = `${SERVIDOR}/api`;
  4 │ export const IMG_BASE = `${SERVIDOR}/capas`;
  5 │ 
  6 │ // No React o token ficava no localStorage. No celular não existe localStorage,
  7 │ // então guardamos na memória do app (igual ao React, ao fechar o app o login some).
  8 │ let token = null;
  9 │ 
 10 │ // A tela principal registra aqui o que fazer quando o servidor disser "sessão inválida" (401).
 11 │ let aoSessaoExpirar = () => {};
 12 │ export function definirAoSessaoExpirar(fn) { aoSessaoExpirar = fn; }
```

- **Linha 1** — Importa o endereço do servidor.
- **Linha 3** — Template string (crase `` ` ``): `${SERVIDOR}` é substituído pelo valor. Resultado: `http://192.168.0.10:8080/api`.
- **Linha 4** — Endereço das capas: o back-end publica as capas nesse caminho (`/capas`), o mesmo que o front React já usa.
- **Linhas 6–7** — No React o token ficava no `localStorage`. No celular esse recurso não existe, então o token vive numa variável. Ao fechar o app ele se perde (igual ao React, que também não restaurava o login).
- **Linha 8** — `let` (e não `const`) porque o valor **muda**: nulo antes do login, um código depois.
- **Linha 10** — Quando o servidor disser "sessão inválida", o `api.jsx` não sabe mexer na tela. Por isso guarda uma função entregue pelo `App.jsx`.
- **Linha 11** — Começa como função que não faz nada (`() => {}`).
- **Linha 12** — O `App.jsx` chama esta função no início para registrar o que fazer.


**📍 `api.jsx` — linhas 14 a 17**

```jsx
 14 │ // Todo pedido protegido precisa desse header - sem ele o AuthFilter do Spring devolve 401.
 15 │ function authHeaders(extra = {}) {
 16 │   return token ? { ...extra, Authorization: `Bearer ${token}` } : extra;
 17 │ }
```

- **Linha 14** — Sem esse header, o `AuthFilter` do Spring responde 401.
- **Linha 15** — `extra = {}` é um valor padrão: se não passarem nada, vira objeto vazio.
- **Linha 16** — Se há token, devolve os headers extras **mais** `Authorization: Bearer <token>` (os `...extra` "espalham" os headers existentes). Se não há, devolve só os extras.


**📍 `api.jsx` — linhas 19 a 25**

```jsx
 19 │ // fetch normal + 1 detalhe: se o servidor responder 401 estando logado (ex.: o back
 20 │ // foi reiniciado e apagou os tokens da memória), avisa o app para voltar ao login.
 21 │ async function pedir(url, opcoes = {}) {
 22 │   const resp = await fetch(url, opcoes);
 23 │   if (resp.status === 401 && token) aoSessaoExpirar();
 24 │   return resp;
 25 │ }
```

- **Linhas 19–20** — Melhoria em relação ao React: se o servidor responder 401 **estando logado** (ex.: o back reiniciou e apagou os tokens da memória), avisa o app para voltar ao login.
- **Linha 21** — `async` permite usar `await` dentro da função.
- **Linha 22** — Faz o pedido HTTP e **espera** a resposta.
- **Linha 23** — Se o status foi 401 **e** havia token, a sessão caiu: avisa o `App.jsx`. A checagem `&& token` evita disparar isso num login com senha errada.
- **Linha 24** — Devolve a resposta normalmente para quem chamou.


**📍 `api.jsx` — linhas 27 a 44**

```jsx
 27 │ // POST/PUT com JSON; se a resposta não for OK, joga um erro com a mensagem do back
 28 │ // (ex.: 409 "Já existe um livro cadastrado com este título.").
 29 │ async function postOuPut(url, method, data) {
 30 │   const resp = await pedir(url, {
 31 │     method,
 32 │     headers: authHeaders({ 'Content-Type': 'application/json' }),
 33 │     body: JSON.stringify(data),
 34 │   });
 35 │   const texto = await resp.text();
 36 │   let corpo;
 37 │   try { corpo = texto ? JSON.parse(texto) : null; } catch { corpo = texto; }
 38 │   if (!resp.ok) {
 39 │     const erro = new Error(typeof corpo === 'string' ? corpo : (corpo?.message || 'Erro ao salvar.'));
 40 │     erro.status = resp.status;
 41 │     throw erro;
 42 │   }
 43 │   return corpo;
 44 │ }
```

- **Linhas 27–28** — Objetivo: transformar respostas de erro em exceções com a mensagem do back.
- **Linha 29** — Serve para criar (POST) e editar (PUT).
- **Linha 30** — Faz o pedido usando o nosso `pedir`.
- **Linha 31** — Atalho do JS: `method,` significa `method: method`.
- **Linha 32** — Manda o token **e** avisa que o corpo é JSON.
- **Linha 33** — `JSON.stringify` transforma o objeto em texto JSON, que é o que trafega na rede.
- **Linha 35** — Lê o corpo como **texto** primeiro (o back às vezes devolve JSON, às vezes só uma frase).
- **Linha 36** — Variável que guardará o resultado convertido.
- **Linha 37** — Tenta converter o texto em objeto; se não for JSON válido (`catch`), usa o próprio texto.
- **Linha 38** — `resp.ok` é falso para status de erro (400, 403, 409...).
- **Linha 39** — Cria um erro com a mensagem do back (ex.: "Já existe um livro cadastrado com este título.").
- **Linha 40** — Guarda também o número do status.
- **Linha 41** — `throw` **lança** o erro: quem chamou captura no `catch`.
- **Linha 43** — Deu certo: devolve o objeto (ex.: o livro salvo, já com `id`).


**📍 `api.jsx` — linhas 46 a 47**

```jsx
 46 │ // GET que devolve a lista já convertida de JSON, com o token
 47 │ const lerLista = (url) => pedir(url, { headers: authHeaders() }).then(r => r.json());
```

- **Linha 46** — Atalho para os pedidos de leitura.
- **Linha 47** — Função de uma linha (arrow function): faz o pedido com token e converte a resposta em objetos (`r.json()`). Devolve uma Promise.


**📍 `api.jsx` — linhas 49 a 56**

```jsx
 49 │ export const api = {
 50 │   // SESSÃO
 51 │   salvarSessao: (aluno) => { if (aluno?.token) token = aluno.token; },
 52 │   limparSessao: () => { token = null; },
 53 │   encerrarSessao: () => {
 54 │     fetch(`${BASE}/alunos/logout`, { method: 'POST', headers: authHeaders() }).catch(() => {});
 55 │     token = null;
 56 │   },
```

- **Linha 49** — `api` é um objeto com todas as operações. As telas usam `api.nomeDaFuncao(...)`.
- **Linha 51** — Guarda o token do aluno recém-logado (o back devolve o campo `token` junto com os dados).
- **Linha 52** — Esquece o token (usado quando a sessão expira).
- **Linhas 53–56** — Logout: avisa o servidor para apagar o token **e** apaga o local. O `.catch(() => {})` ignora falha: se o servidor estiver fora, o logout local acontece do mesmo jeito. Usa `fetch` puro (não `pedir`) de propósito: um 401 aqui não deve disparar o aviso de sessão expirada.


**📍 `api.jsx` — linhas 58 a 65**

```jsx
 58 │   // LIVROS (a listagem é pública, por isso sem token)
 59 │   getLivros: (unidade) => {
 60 │     const query = unidade ? `?unidade=${encodeURIComponent(unidade)}` : '';
 61 │     return fetch(`${BASE}/livros${query}`).then(r => r.json());
 62 │   },
 63 │   criarLivro: (data) => postOuPut(`${BASE}/livros`, 'POST', data),
 64 │   editarLivro: (id, data) => postOuPut(`${BASE}/livros/${id}`, 'PUT', data),
 65 │   deletarLivro: (id) => pedir(`${BASE}/livros/${id}`, { method: 'DELETE', headers: authHeaders() }),
```

- **Linha 58** — A listagem é pública: o `AuthFilter` libera `GET /api/livros`.
- **Linhas 59–62** — `unidade` é opcional: se veio, monta `?unidade=...`. `encodeURIComponent` converte espaços e acentos em formato seguro para URL.
- **Linha 63** — `POST /api/livros` (só admin).
- **Linha 64** — `PUT /api/livros/{id}`.
- **Linha 65** — `DELETE`. Devolve a resposta crua; a tela olha `resp.ok`.


**📍 `api.jsx` — linhas 67 a 76**

```jsx
 67 │   // ALUNOS
 68 │   getAlunos: () => lerLista(`${BASE}/alunos`),
 69 │   criarAluno: (data) => postOuPut(`${BASE}/alunos`, 'POST', data),
 70 │   editarAluno: (id, data) => postOuPut(`${BASE}/alunos/${id}`, 'PUT', data),
 71 │   deletarAluno: (id) => pedir(`${BASE}/alunos/${id}`, { method: 'DELETE', headers: authHeaders() }),
 72 │   login: (ra, senha) => fetch(`${BASE}/alunos/login`, {
 73 │     method: 'POST',
 74 │     headers: { 'Content-Type': 'application/json' },
 75 │     body: JSON.stringify({ ra, senha }),
 76 │   }),
```

- **Linha 68** — Lista todos os alunos (admin).
- **Linha 69** — `POST /api/alunos`. O back fixa `perfil = ALUNO` e devolve o aluno **já com token**: cadastrar já deixa logado.
- **Linha 70** — `PUT`: o aluno edita a **própria** conta; o admin edita qualquer uma.
- **Linha 71** — `DELETE` (admin).
- **Linhas 72–76** — Login usa `fetch` puro porque ainda não existe token. Manda `{ ra, senha }` e devolve a resposta crua: a tela precisa olhar `resp.ok` (200 = senha certa, 401 = errada).


**📍 `api.jsx` — linhas 78 a 90**

```jsx
 78 │   // EMPRÉSTIMOS / RESERVAS
 79 │   getEmprestimos: () => lerLista(`${BASE}/emprestimos/todos`),
 80 │   getHistoricoEmprestimos: () => lerLista(`${BASE}/emprestimos/historico`),
 81 │   getEmprestimosPorAluno: (nome) => lerLista(`${BASE}/emprestimos/aluno/${encodeURIComponent(nome)}`),
 82 │   getHistoricoPorAluno: (nome) => lerLista(`${BASE}/emprestimos/aluno/${encodeURIComponent(nome)}/historico`),
 83 │   criarEmprestimo: (data) => pedir(`${BASE}/emprestimos`, {
 84 │     method: 'POST',
 85 │     headers: authHeaders({ 'Content-Type': 'application/json' }),
 86 │     body: JSON.stringify(data),
 87 │   }),
 88 │   cancelarEmprestimo: (id) => pedir(`${BASE}/emprestimos/${id}`, { method: 'DELETE', headers: authHeaders() }),
 89 │   confirmarEntrega: (id) => pedir(`${BASE}/emprestimos/${id}/entregar`, { method: 'POST', headers: authHeaders() }),
 90 │   confirmarDevolucao: (id) => pedir(`${BASE}/emprestimos/${id}/devolver`, { method: 'POST', headers: authHeaders() }),
```

- **Linha 79** — `/emprestimos/todos`: só admin.
- **Linha 80** — Encerrados (devolvido, cancelado, expirado).
- **Linha 81** — Ativos de um aluno. O **nome** vai na URL, por isso `encodeURIComponent`.
- **Linha 82** — Histórico de um aluno.
- **Linhas 83–87** — `POST /api/emprestimos` com `{ nomeAluno, tituloLivro }`: é a **reserva**. Devolve a resposta crua porque o status diz o que houve (201 ok, 403 limite, 409 conflito).
- **Linha 88** — Cancela a reserva (só enquanto `RESERVADO`).
- **Linha 89** — Admin marca que o livro foi **retirado** (vira `RETIRADO`, prazo de 7 dias).
- **Linha 90** — Admin marca que foi **devolvido** (o estoque volta).


**📍 `api.jsx` — linhas 92 a 94**

```jsx
 92 │   // ESTATÍSTICAS DO PAINEL
 93 │   getStats: () => lerLista(`${BASE}/admin/stats`),
 94 │ };
```

- **Linhas 92–93** — Números do painel do admin: totais de livros, disponíveis, alunos e reservas ativas.
- **Linha 94** — Fecha o objeto `api`.

---

# Parte prática, continuação: os componentes reutilizáveis

Um **componente reutilizável** é uma peça que várias telas usam (botão, campo, mensagem). Em vez de copiar 40 linhas de estilo em toda tela, escrevemos uma vez e chamamos `<Botao ... />`.


---

## Aula 9: `Toast.jsx` (mensagens que aparecem e somem)

📁 **Arquivo:** `src/components/Toast.jsx`

**Para que serve:** Mostra avisos rápidos ("✅ Reserva confirmada!") por 4 segundos. Qualquer tela dispara um aviso chamando `toast("texto")`.

**Analogia:** É o post-it que aparece na tela e se descola sozinho depois de alguns segundos.

**No React web era:** o mesmo arquivo, com `<div className="toast-container">` e CSS.


**📍 `Toast.jsx` — linhas 1 a 7**

```jsx
  1 │ import { useState, useEffect, useCallback } from 'react';
  2 │ import { View, Text, StyleSheet } from 'react-native';
  3 │ import { BASE_SEGURA } from '../theme';
  4 │ 
  5 │ // Função "global" que o ToastContainer registra ao aparecer na tela.
  6 │ // Qualquer tela chama toast('mensagem') sem precisar receber nada por props.
  7 │ let addToastFn = null;
```

- **Linha 1** — `useState` (memória), `useEffect` (executa depois de desenhar) e `useCallback` (guarda uma função para não recriá-la à toa).
- **Linha 2** — Peças nativas: `View` (caixa), `Text` (texto), `StyleSheet` (estilos).
- **Linha 3** — Folga inferior para o iPhone.
- **Linhas 5–6** — Explica o truque: uma variável **fora** de qualquer componente, que qualquer tela pode chamar sem receber props.
- **Linha 7** — `addToastFn` começa vazia (`null`). Quem a preenche é o `ToastContainer`, quando aparece na tela.


**📍 `Toast.jsx` — linhas 9 a 13**

```jsx
  9 │ export function useToast() {
 10 │   return useCallback((msg) => {
 11 │     if (addToastFn) addToastFn(msg);
 12 │   }, []);
 13 │ }
```

- **Linha 9** — `useToast` é um **hook** (função que começa com `use`). As telas fazem `const toast = useToast();`.
- **Linha 10** — Devolve uma função `(msg) => ...` guardada pelo `useCallback`.
- **Linha 11** — Se `addToastFn` já existe, chama com a mensagem. O `if` evita erro caso ainda não exista.
- **Linha 12** — `[]` = "nunca recrie esta função".


**📍 `Toast.jsx` — linhas 15 a 25**

```jsx
 15 │ export function ToastContainer() {
 16 │   const [toasts, setToasts] = useState([]);
 17 │ 
 18 │   useEffect(() => {
 19 │     addToastFn = (msg) => {
 20 │       const id = Date.now() + Math.random();
 21 │       setToasts(t => [...t, { id, msg }]);
 22 │       setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
 23 │     };
 24 │     return () => { addToastFn = null; };
 25 │   }, []);
```

- **Linha 15** — `ToastContainer` é o componente que **desenha** os avisos. Fica uma vez só, no `App.jsx`.
- **Linha 16** — `toasts` é a lista de avisos visíveis agora (começa vazia).
- **Linha 18** — `useEffect` com `[]` executa **uma vez**, quando o componente aparece.
- **Linha 19** — Aqui preenchemos a função global: agora `toast('...')` de qualquer tela funciona.
- **Linha 20** — Cria um `id` único (hora atual + número aleatório) para identificar este aviso.
- **Linha 21** — `setToasts(t => [...t, { id, msg }])` adiciona um aviso **sem apagar os anteriores**: `[...t, novo]` copia a lista e põe o novo no fim. Usar `t =>` garante que estamos partindo do valor mais recente.
- **Linha 22** — `setTimeout` espera 4000 ms (4 s) e então remove o aviso com `.filter(x => x.id !== id)` (mantém todos, exceto este).
- **Linha 24** — Função de **limpeza**: ao sair da tela, esquece `addToastFn`.


**📍 `Toast.jsx` — linhas 27 a 36**

```jsx
 27 │   return (
 28 │     <View pointerEvents="none" style={estilos.container}>
 29 │       {toasts.map(t => (
 30 │         <View key={t.id} style={estilos.toast}>
 31 │           <Text style={estilos.texto}>{t.msg}</Text>
 32 │         </View>
 33 │       ))}
 34 │     </View>
 35 │   );
 36 │ }
```

- **Linha 28** — `pointerEvents="none"` faz o aviso **não bloquear os toques** nos botões que estão por baixo.
- **Linha 29** — `.map` transforma cada aviso em uma caixa. `key={t.id}` é obrigatória: o React precisa identificar cada item da lista.
- **Linha 31** — Mostra o texto da mensagem.


**📍 `Toast.jsx` — linhas 38 a 42**

```jsx
 38 │ const estilos = StyleSheet.create({
 39 │   container: { position: 'absolute', left: 16, right: 16, bottom: 90 + BASE_SEGURA, gap: 8 },
 40 │   toast: { backgroundColor: '#0f172a', padding: 14, borderRadius: 12, opacity: 0.95 },
 41 │   texto: { color: '#fff', fontSize: 14 },
 42 │ });
```

- **Linha 38** — `StyleSheet.create` reúne os estilos com nomes.
- **Linha 39** — `position: 'absolute'` tira o aviso do fluxo normal e o coloca por cima; `left/right: 16` deixa 16 de margem; `bottom: 90 + BASE_SEGURA` fica logo acima da barra de abas; `gap: 8` separa os avisos.
- **Linha 40** — Fundo escuro, espaçamento interno (`padding`) e cantos arredondados.
- **Linha 41** — Texto branco.
- ⚠️ **Importante:** avisos ficam **atrás** de um `Modal` aberto (o Modal cobre tudo). Por isso, dentro das janelas de formulário, os erros aparecem como texto **dentro** da janela.


---

## Aula 10: `CapaLivro.jsx` (capa do livro)

📁 **Arquivo:** `src/components/CapaLivro.jsx`

**Para que serve:** Mostra a foto da capa enviada ao servidor; se não houver (ou falhar), desenha uma capa colorida com a inicial do título.

**Analogia:** É a vitrine: usa a foto do fornecedor e, se faltar, um cartaz genérico.

**No React web era:** `CapaLivro.jsx` + `capas.js` com 6 arquivos `.svg`.


**📍 `CapaLivro.jsx` — linhas 1 a 14**

```jsx
  1 │ import { useState } from 'react';
  2 │ import { View, Text, Image, StyleSheet } from 'react-native';
  3 │ import { IMG_BASE } from '../services/api';
  4 │ 
  5 │ // No React as capas genéricas eram 6 arquivos SVG. O React Native não desenha SVG
  6 │ // sem biblioteca extra, então aqui cada "capa genérica" é uma combinação de 2 cores.
  7 │ const CAPAS_GENERICAS = [
  8 │   { fundo: '#172554', destaque: '#c4b5fd' },
  9 │   { fundo: '#0f172a', destaque: '#22d3ee' },
 10 │   { fundo: '#4c0519', destaque: '#fbcfe8' },
 11 │   { fundo: '#422006', destaque: '#fffbeb' },
 12 │   { fundo: '#052e16', destaque: '#86efac' },
 13 │   { fundo: '#1e1b4b', destaque: '#fef3c7' },
 14 │ ];
```

- **Linhas 1–3** — Imports. `Image` mostra imagens; `IMG_BASE` é o endereço das capas no servidor.
- **Linhas 5–6** — O React Native não desenha `.svg` sem biblioteca extra; então cada capa genérica é um par de cores.
- **Linha 7** — Array com 6 opções.
- **Linhas 8–13** — Cada uma tem `fundo` (cor escura) e `destaque` (cor clara), tiradas dos SVGs do React.


**📍 `CapaLivro.jsx` — linhas 16 a 23**

```jsx
 16 │ // Mesma conta do React: título+autor viram um número, e o número escolhe a capa.
 17 │ // Assim o mesmo livro sempre recebe a mesma cor.
 18 │ export function getCapaGenerica(livro = {}) {
 19 │   const texto = `${livro.titulo || ''}${livro.autor || ''}`;
 20 │   let hash = 0;
 21 │   for (let i = 0; i < texto.length; i++) hash = (hash * 31 + texto.charCodeAt(i)) >>> 0;
 22 │   return CAPAS_GENERICAS[hash % CAPAS_GENERICAS.length];
 23 │ }
```

- **Linhas 16–17** — A capa é **determinística**: o mesmo livro sempre recebe a mesma cor.
- **Linha 18** — `livro = {}` é valor padrão para não quebrar se vier `undefined`.
- **Linha 19** — Junta título e autor num texto só (`|| ''` troca `null` por vazio).
- **Linha 20** — `hash` começa em 0.
- **Linha 21** — Percorre cada letra: `charCodeAt(i)` dá o número da letra; `hash * 31 + número` mistura tudo num número grande; `>>> 0` mantém o resultado positivo.
- **Linha 22** — `hash % 6` (resto da divisão) dá um número de 0 a 5 e escolhe a capa. **É a mesma conta do React**, então a cor bate entre web e mobile.


**📍 `CapaLivro.jsx` — linhas 25 a 38**

```jsx
 25 │ export default function CapaLivro({ livro, style }) {
 26 │   const [falhou, setFalhou] = useState(false);
 27 │ 
 28 │   // Tem imagem enviada pelo admin e ela carregou? Mostra a foto do servidor.
 29 │   if (livro?.imagemCapa && !falhou) {
 30 │     return (
 31 │       <Image
 32 │         source={{ uri: `${IMG_BASE}/${livro.imagemCapa}` }}
 33 │         style={[estilos.capa, style]}
 34 │         resizeMode="cover"
 35 │         onError={() => setFalhou(true)}
 36 │       />
 37 │     );
 38 │   }
```

- **Linha 25** — `export default` = componente principal do arquivo. `{ livro, style }` são as props; `style` permite que a tela mude o tamanho.
- **Linha 26** — `falhou` lembra se a imagem do servidor deu erro.
- **Linha 29** — `livro?.imagemCapa` o `?.` evita erro se `livro` for nulo. Se há imagem **e** não falhou, mostra a foto.
- **Linha 32** — `source={{ uri: ... }}` é como se aponta uma imagem da internet. As chaves duplas: a de fora é do JSX, a de dentro é o objeto.
- **Linha 33** — `style={[estilos.capa, style]}` **lista de estilos**: aplica o padrão e depois o que a tela mandou (o último vence).
- **Linha 34** — `resizeMode="cover"` preenche a área cortando o excesso.
- **Linha 35** — Se a imagem der erro (arquivo apagado, servidor fora), `setFalhou(true)` faz o componente redesenhar com a capa genérica.


**📍 `CapaLivro.jsx` — linhas 40 a 54**

```jsx
 40 │   // Senão, desenha a capa genérica com a inicial do título.
 41 │   const capa = getCapaGenerica(livro);
 42 │   return (
 43 │     <View style={[estilos.capa, style, { backgroundColor: capa.fundo }]}>
 44 │       <Text style={{ color: capa.destaque, fontSize: 34, fontWeight: '800' }}>
 45 │         {(livro?.titulo || '?').charAt(0).toUpperCase()}
 46 │       </Text>
 47 │       <Text style={{ color: capa.destaque, fontSize: 8, letterSpacing: 1, marginTop: 4 }}>BIBLIOTECH</Text>
 48 │     </View>
 49 │   );
 50 │ }
 51 │ 
 52 │ const estilos = StyleSheet.create({
 53 │   capa: { width: 90, height: 130, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
 54 │ });
```

- **Linha 41** — Pega a cor da capa genérica deste livro.
- **Linha 43** — Uma caixa com o tamanho padrão, o estilo da tela e o `backgroundColor` da capa (o último da lista vence).
- **Linhas 44–46** — A inicial do título: `charAt(0)` pega a primeira letra e `toUpperCase()` a deixa maiúscula.
- **Linha 47** — A marca "BIBLIOTECH" pequena, com `letterSpacing` (espaço entre letras).
- **Linhas 52–54** — Estilo padrão: 90×130, cantos arredondados, conteúdo centralizado (`alignItems` centraliza no eixo horizontal e `justifyContent` no vertical).


---

## Aula 11: `ui.jsx` (as peças de interface)

📁 **Arquivo:** `src/components/ui.jsx`

**Para que serve:** Botão, campo de texto, seletor (dropdown), selo, linha, indicador de carregamento, aviso de lista vazia e janela (modal).

**Analogia:** É a caixa de Lego do app: todas as telas montam suas interfaces com estas peças.

**No React web era:** as classes CSS `btn-primario`, `campo`, `polo-select`, `status`, `modal-box`...


**📍 `ui.jsx` — linhas 1 a 6**

```jsx
  1 │ import { useState } from 'react';
  2 │ import {
  3 │   View, Text, TextInput, Pressable, Modal, ScrollView,
  4 │   ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet,
  5 │ } from 'react-native';
  6 │ import { useTema } from '../theme';
```

- **Linha 1** — `useState` para o `Seletor` lembrar se está aberto.
- **Linhas 2–5** — Peças nativas: `TextInput` (campo), `Pressable` (toque), `Modal` (janela), `ScrollView` (rolagem), `ActivityIndicator` (a rodinha de carregando), `KeyboardAvoidingView` (empurra o conteúdo quando o teclado abre).
- **Linha 6** — `useTema` para pegar as cores atuais.


**📍 `ui.jsx` — linhas 8 a 21**

```jsx
  8 │ // BOTÃO. tipo: 'primario' | 'secundario' | 'perigo' | 'sucesso'
  9 │ export function Botao({ titulo, onPress, tipo = 'primario', desabilitado = false, style }) {
 10 │   const { cores } = useTema();
 11 │   const fundo = { primario: cores.primaria, perigo: cores.perigo, sucesso: cores.sucesso, secundario: 'transparent' }[tipo];
 12 │   return (
 13 │     <Pressable
 14 │       onPress={onPress}
 15 │       disabled={desabilitado}
 16 │       style={[estilos.botao, { backgroundColor: fundo, borderColor: tipo === 'secundario' ? cores.borda : fundo, opacity: desabilitado ? 0.5 : 1 }, style]}
 17 │     >
 18 │       <Text style={[estilos.botaoTexto, { color: tipo === 'secundario' ? cores.texto : '#fff' }]}>{titulo}</Text>
 19 │     </Pressable>
 20 │   );
 21 │ }
```

- **Linha 8** — `tipo` pode ser `primario`, `secundario`, `perigo` ou `sucesso`.
- **Linha 9** — Props com **valores padrão**: se a tela não passar `tipo`, vale `'primario'`.
- **Linha 10** — Lê as cores do tema atual (claro ou escuro).
- **Linha 11** — Um objeto que funciona como "tabela": `{...}[tipo]` escolhe a cor pelo nome do tipo. `secundario` é `transparent` (só borda).
- **Linhas 13–15** — `Pressable` é a área tocável. `disabled` bloqueia o toque.
- **Linha 16** — Estilo em lista: base + cores calculadas. A borda do secundário usa a cor da borda; os demais usam a própria cor. `opacity: 0.5` quando desabilitado deixa o botão "apagado".
- **Linha 18** — O texto do botão: preto/branco conforme o tipo.


**📍 `ui.jsx` — linhas 23 a 36**

```jsx
 23 │ // CAMPO DE TEXTO com rótulo em cima (o <label> + <input> do HTML)
 24 │ export function Campo({ rotulo, style, ...props }) {
 25 │   const { cores } = useTema();
 26 │   return (
 27 │     <View style={estilos.campo}>
 28 │       {rotulo ? <Text style={[estilos.rotulo, { color: cores.suave }]}>{rotulo}</Text> : null}
 29 │       <TextInput
 30 │         placeholderTextColor={cores.suave}
 31 │         {...props}
 32 │         style={[estilos.input, { backgroundColor: cores.input, color: cores.texto, borderColor: cores.borda }, style]}
 33 │       />
 34 │     </View>
 35 │   );
 36 │ }
```

- **Linha 23** — Comentário: no HTML seriam `<label>` + `<input>`.
- **Linha 24** — `{ rotulo, style, ...props }`: pega `rotulo` e `style` separados, e **todo o resto** vai para `props` (ex.: `value`, `onChangeText`, `secureTextEntry`).
- **Linha 28** — Se há rótulo, mostra o texto pequeno em cima; senão, `null` (nada).
- **Linhas 29–33** — `TextInput` recebe `{...props}`, ou seja, repassa **tudo** que a tela mandou. Assim `<Campo value={x} onChangeText={setX} keyboardType="numeric" />` funciona sem eu listar cada propriedade.
- **Linha 30** — Cor do texto de exemplo (placeholder).
- **Linha 32** — Aparência: fundo, cor do texto e borda vêm do tema.


**📍 `ui.jsx` — linhas 38 a 72**

```jsx
 38 │ // SELETOR (o <select> do HTML). opcoes: lista de textos OU de { valor, rotulo }.
 39 │ export function Seletor({ rotulo, valor, opcoes, onChange }) {
 40 │   const { cores } = useTema();
 41 │   const [aberto, setAberto] = useState(false);
 42 │   const lista = opcoes.map(o => (typeof o === 'string' ? { valor: o, rotulo: o } : o));
 43 │   const atual = lista.find(o => o.valor === valor);
 44 │ 
 45 │   return (
 46 │     <View style={estilos.campo}>
 47 │       {rotulo ? <Text style={[estilos.rotulo, { color: cores.suave }]}>{rotulo}</Text> : null}
 48 │       <Pressable
 49 │         onPress={() => setAberto(a => !a)}
 50 │         style={[estilos.input, estilos.seletor, { backgroundColor: cores.input, borderColor: cores.borda }]}
 51 │       >
 52 │         <Text style={{ color: cores.texto, flex: 1 }}>{atual ? atual.rotulo : 'Selecione...'}</Text>
 53 │         <Text style={{ color: cores.suave }}>{aberto ? '▲' : '▼'}</Text>
 54 │       </Pressable>
 55 │       {aberto && (
 56 │         <View style={[estilos.opcoes, { borderColor: cores.borda, backgroundColor: cores.cartao }]}>
 57 │           {lista.map(o => (
 58 │             <Pressable
 59 │               key={o.valor}
 60 │               onPress={() => { onChange(o.valor); setAberto(false); }}
 61 │               style={[estilos.opcao, { borderBottomColor: cores.borda }]}
 62 │             >
 63 │               <Text style={{ color: o.valor === valor ? cores.primaria : cores.texto, fontWeight: o.valor === valor ? '700' : '400' }}>
 64 │                 {o.rotulo}
 65 │               </Text>
 66 │             </Pressable>
 67 │           ))}
 68 │         </View>
 69 │       )}
 70 │     </View>
 71 │   );
 72 │ }
```

- **Linha 38** — Dropdown feito à mão, porque o mobile não tem `<select>`.
- **Linha 39** — `opcoes` pode ser lista de textos **ou** de objetos `{ valor, rotulo }`.
- **Linha 41** — `aberto` = a lista de opções está visível?
- **Linha 42** — **Normaliza** as opções: se for texto, vira `{ valor: texto, rotulo: texto }`. Assim o resto do código trata tudo igual.
- **Linha 43** — `find` procura a opção cujo `valor` é o selecionado.
- **Linha 49** — Tocar no campo **alterna** aberto/fechado (`a => !a` inverte o valor).
- **Linha 52** — Mostra o rótulo da opção atual ou "Selecione...". `flex: 1` empurra a seta para a direita.
- **Linha 53** — Seta ▲ ou ▼ conforme aberto.
- **Linha 55** — `aberto && (...)` só desenha a lista se estiver aberto.
- **Linhas 57–67** — Uma linha para cada opção. `key` identifica cada uma.
- **Linha 60** — Ao tocar: avisa a tela (`onChange`) do novo valor **e** fecha a lista.
- **Linha 63** — A opção selecionada aparece azul e em negrito.


**📍 `ui.jsx` — linhas 74 a 83**

```jsx
 74 │ // SELO colorido (as etiquetas "Disponível", "Reservado"...). tom: verde | vermelho | azul | laranja | cinza
 75 │ export function Selo({ texto, tom = 'cinza' }) {
 76 │   const { cores } = useTema();
 77 │   const c = cores.selo[tom] || cores.selo.cinza;
 78 │   return (
 79 │     <View style={[estilos.selo, { backgroundColor: c.fundo }]}>
 80 │       <Text style={{ color: c.texto, fontSize: 12, fontWeight: '700' }}>{texto}</Text>
 81 │     </View>
 82 │   );
 83 │ }
```

- **Linha 74** — As etiquetas coloridas ("Disponível", "Reservado").
- **Linha 75** — `tom` padrão é cinza.
- **Linha 77** — Busca as cores do tom; `|| cores.selo.cinza` é a rede de segurança se o tom não existir.
- **Linhas 79–80** — Caixinha arredondada com o texto dentro.


**📍 `ui.jsx` — linhas 85 a 93**

```jsx
 85 │ // Linha "Rótulo: valor" dos cartões de reserva
 86 │ export function Linha({ rotulo, valor }) {
 87 │   const { cores } = useTema();
 88 │   return (
 89 │     <Text style={{ color: cores.suave, fontSize: 13, marginTop: 2 }}>
 90 │       {rotulo}: <Text style={{ color: cores.texto }}>{valor}</Text>
 91 │     </Text>
 92 │   );
 93 │ }
```

- **Linha 85** — Linha "Rótulo: valor" dos cartões.
- **Linhas 89–91** — Um `Text` **dentro** de outro `Text`: o de dentro herda o tamanho e só muda a cor. É como o `<span>` dentro do `<p>` no HTML.


**📍 `ui.jsx` — linhas 95 a 108**

```jsx
 95 │ export function Carregando({ texto = 'Carregando...' }) {
 96 │   const { cores } = useTema();
 97 │   return (
 98 │     <View style={{ padding: 30, alignItems: 'center', gap: 10 }}>
 99 │       <ActivityIndicator color={cores.primaria} />
100 │       <Text style={{ color: cores.suave }}>{texto}</Text>
101 │     </View>
102 │   );
103 │ }
104 │ 
105 │ export function Vazio({ texto }) {
106 │   const { cores } = useTema();
107 │   return <Text style={{ color: cores.suave, textAlign: 'center', padding: 30 }}>{texto}</Text>;
108 │ }
```

- **Linha 95** — `texto = 'Carregando...'` é valor padrão.
- **Linha 99** — A rodinha girando, na cor primária.
- **Linhas 105–108** — `Vazio` mostra uma mensagem centralizada (ex.: "Nenhum livro encontrado.").


**📍 `ui.jsx` — linhas 110 a 124**

```jsx
110 │ // JANELA (o "modal" do React): caixa central sobre um fundo escuro.
111 │ export function Janela({ visivel, aoFechar, titulo, children }) {
112 │   const { cores } = useTema();
113 │   return (
114 │     <Modal visible={visivel} transparent animationType="fade" onRequestClose={aoFechar}>
115 │       <KeyboardAvoidingView style={estilos.sombra} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
116 │         <Pressable style={StyleSheet.absoluteFill} onPress={aoFechar} />
117 │         <View style={[estilos.janela, { backgroundColor: cores.cartao }]}>
118 │           <Text style={[estilos.janelaTitulo, { color: cores.titulo }]}>{titulo}</Text>
119 │           <ScrollView keyboardShouldPersistTaps="handled">{children}</ScrollView>
120 │         </View>
121 │       </KeyboardAvoidingView>
122 │     </Modal>
123 │   );
124 │ }
```

- **Linha 110** — A "janela" é o modal do React: caixa central sobre um fundo escurecido.
- **Linha 111** — `children` é tudo que a tela colocar **entre** `<Janela>` e `</Janela>`.
- **Linha 114** — `Modal` cobre a tela toda. `visible` liga/desliga; `transparent` deixa ver o que está atrás; `animationType="fade"` aparece suavemente; `onRequestClose` trata o botão "voltar" do Android.
- **Linha 115** — `KeyboardAvoidingView` sobe a janela quando o teclado abre. No iPhone usa `padding`, no Android `height`.
- **Linha 116** — Um botão **invisível** do tamanho da tela (`absoluteFill`) que fecha a janela quando você toca **fora** dela.
- **Linha 117** — A caixa da janela, com fundo do tema.
- **Linha 118** — O título.
- **Linha 119** — `ScrollView` permite rolar se o formulário for grande. `keyboardShouldPersistTaps="handled"` faz o primeiro toque num botão funcionar mesmo com o teclado aberto.


**📍 `ui.jsx` — linhas 126 a 139**

```jsx
126 │ const estilos = StyleSheet.create({
127 │   botao: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10, borderWidth: 1, alignItems: 'center' },
128 │   botaoTexto: { fontWeight: '700', fontSize: 15 },
129 │   campo: { marginBottom: 14 },
130 │   rotulo: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
131 │   input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15 },
132 │   seletor: { flexDirection: 'row', alignItems: 'center' },
133 │   opcoes: { borderWidth: 1, borderRadius: 10, marginTop: 6, overflow: 'hidden' },
134 │   opcao: { padding: 12, borderBottomWidth: StyleSheet.hairlineWidth },
135 │   selo: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
136 │   sombra: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', padding: 20 },
137 │   janela: { borderRadius: 16, padding: 20, maxHeight: '88%' },
138 │   janelaTitulo: { fontSize: 20, fontWeight: '800', marginBottom: 16 },
139 │ });
```

- **Linhas 126–139** — Estilos fixos (medidas). As cores ficam nas linhas de cima porque dependem do tema. Destaques: `borderWidth: StyleSheet.hairlineWidth` = a linha mais fina que a tela consegue desenhar; `alignSelf: 'flex-start'` faz o selo ter só o tamanho do texto; `maxHeight: '88%'` impede a janela de passar da tela; `rgba(0,0,0,0.55)` é preto com 55% de opacidade (o fundo escurecido).


---

## Aula 12: `CartaoLivro.jsx` (cartão de um livro)

📁 **Arquivo:** `src/components/CartaoLivro.jsx`

**Para que serve:** Capa à esquerda e dados à direita. É usado no catálogo público e no acervo do aluno.

**Analogia:** É a ficha do livro na estante.

**No React web era:** o `<div className="card-livro">` repetido dentro de `CatalogoPage` e `AcervoPage`.


**📍 `CartaoLivro.jsx` — linhas 1 a 9**

```jsx
  1 │ import { View, Text, StyleSheet } from 'react-native';
  2 │ import { useTema } from '../theme';
  3 │ import CapaLivro from './CapaLivro';
  4 │ import { Selo } from './ui';
  5 │ 
  6 │ // Cartão de um livro: capa à esquerda, dados à direita.
  7 │ // O que vier entre <CartaoLivro> ... </CartaoLivro> (children) aparece no fim do cartão:
  8 │ // no catálogo público é o botão "Entrar para Reservar", no acervo é "Reservar".
  9 │ export default function CartaoLivro({ livro, children }) {
```

- **Linha 3** — Importa o componente da capa; 4: importa o `Selo`.
- **Linhas 6–8** — Explica o `children`: o que a tela colocar dentro do cartão aparece no fim. No catálogo público é o botão de login; no acervo, "Reservar".
- **Linha 9** — Props: `livro` (dados) e `children`.


**📍 `CartaoLivro.jsx` — linhas 10 a 30**

```jsx
 10 │   const { cores } = useTema();
 11 │   return (
 12 │     <View style={[estilos.cartao, { backgroundColor: cores.cartao, borderColor: cores.borda }]}>
 13 │       <CapaLivro livro={livro} />
 14 │       <View style={estilos.info}>
 15 │         <Selo texto={livro.disponivel ? 'Disponível' : 'Emprestado'} tom={livro.disponivel ? 'verde' : 'vermelho'} />
 16 │         <Text style={[estilos.titulo, { color: cores.texto }]}>{livro.titulo}</Text>
 17 │         <Text style={{ color: cores.suave }}>Autor: {livro.autor}</Text>
 18 │         <Text style={{ color: cores.suave }}>Ano: {livro.anoPublicacao}</Text>
 19 │         {livro.unidade ? <Text style={{ color: cores.suave, fontSize: 12 }}>📍 {livro.unidade}</Text> : null}
 20 │         {children}
 21 │       </View>
 22 │     </View>
 23 │   );
 24 │ }
 25 │ 
 26 │ const estilos = StyleSheet.create({
 27 │   cartao: { flexDirection: 'row', gap: 12, padding: 12, borderRadius: 14, borderWidth: 1 },
 28 │   info: { flex: 1, gap: 3 },
 29 │   titulo: { fontSize: 16, fontWeight: '800', marginTop: 4 },
 30 │ });
```

- **Linha 12** — O cartão é uma caixa em **linha** (`flexDirection: 'row'`, definido no estilo): capa e dados lado a lado.
- **Linha 13** — A capa.
- **Linha 14** — Coluna de informações; `flex: 1` ocupa o espaço restante.
- **Linha 15** — O selo verde "Disponível" ou vermelho "Emprestado". O campo `disponivel` é calculado pelo back-end (`quantidadeDisponivel > 0`).
- **Linhas 16–18** — Título, autor e ano.
- **Linha 19** — Só mostra a unidade se ela existir (`condição ? elemento : null`).
- **Linha 20** — `{children}` é o "buraco" onde entra o botão que a tela mandou.
- **Linhas 26–30** — Estilos: `gap: 12` separa capa e informações; `info` tem `gap: 3` entre as linhas.

---

# Parte prática, continuação: as telas (pages)

Uma **tela** é um componente grande que junta peças menores. Todas seguem o mesmo roteiro:

1. **Estados** (`useState`): a memória da tela (lista de livros, texto da busca, janela aberta?).
2. **Carregar dados** (`useEffect` + `api.xxx()`): buscar no servidor ao abrir.
3. **Ações** (`async function`): o que acontece ao tocar em um botão.
4. **Desenho** (`return (...)`): o JSX.

Se você entender **uma** tela, entende todas. Por isso a primeira (Login) é explicada mais devagar.


---

## Aula 13: `LoginPage.jsx` (entrar e cadastrar)

📁 **Arquivo:** `src/pages/LoginPage.jsx`

**Para que serve:** Quatro "telinhas" numa só: escolher portal, login, cadastro e (para contas antigas) escolher a unidade.

**Analogia:** É a portaria do prédio: primeiro pergunta para onde você vai, depois confere seu crachá.

**No React web era:** `LoginPage.jsx` (com `<form>` e `required`). Aqui a validação é manual e há um botão para voltar ao catálogo.


**📍 `LoginPage.jsx` — linhas 1 a 8**

```jsx
  1 │ import { useState } from 'react';
  2 │ import { View, Text, ScrollView, KeyboardAvoidingView, Pressable, Platform, StyleSheet } from 'react-native';
  3 │ import { api } from '../services/api';
  4 │ import { NOMES_UNIDADES } from '../constants/unidades';
  5 │ import { useTema, TOPO_SEGURO } from '../theme';
  6 │ import { Botao, Campo, Seletor } from '../components/ui';
  7 │ 
  8 │ export default function LoginPage({ onLogin, onVoltar }) {
```

- **Linha 1** — `useState` para as memórias da tela.
- **Linha 2** — Peças nativas. `ScrollView` permite rolar quando o teclado ocupa espaço.
- **Linha 3** — `api` fala com o servidor.
- **Linha 4** — Lista de nomes das unidades para o seletor.
- **Linha 5** — `useTema` (cores) e `TOPO_SEGURO` (espaço da barra de status).
- **Linha 6** — Nossos botões e campos.
- **Linha 8** — Props: `onLogin` (função que o `App.jsx` entrega para ser chamada ao logar) e `onVoltar` (fechar o login e voltar ao catálogo). É assim que o **filho avisa o pai**.


**📍 `LoginPage.jsx` — linhas 9 a 23**

```jsx
  9 │   const { cores } = useTema();
 10 │   const [tela, setTela] = useState('escolha'); // 'escolha' | 'login' | 'cadastro' | 'escolher-unidade'
 11 │   const [intencao, setIntencao] = useState('ALUNO');
 12 │   const [ra, setRa] = useState('');
 13 │   const [senha, setSenha] = useState('');
 14 │   const [nome, setNome] = useState('');
 15 │   const [cadRa, setCadRa] = useState('');
 16 │   const [cadSenha, setCadSenha] = useState('');
 17 │   const [cadUnidade, setCadUnidade] = useState(NOMES_UNIDADES[0]);
 18 │   const [erro, setErro] = useState('');
 19 │   const [loading, setLoading] = useState(false);
 20 │ 
 21 │   // Aluno autenticado que ainda precisa escolher a unidade (conta antiga)
 22 │   const [alunoPendente, setAlunoPendente] = useState(null);
 23 │   const [unidadePendente, setUnidadePendente] = useState(NOMES_UNIDADES[0]);
```

- **Linha 9** — Cores do tema atual.
- **Linha 10** — `tela` diz qual das 4 telinhas aparece. Começa em `'escolha'`.
- **Linha 11** — `intencao` = o portal escolhido (`ALUNO` ou `ADMIN`).
- **Linhas 12–13** — O que o usuário digita no login: usuário (`ra`) e `senha`.
- **Linhas 14–16** — O que digita no cadastro: nome, usuário e senha (nomes com `cad` para não misturar com os do login).
- **Linha 17** — Unidade do cadastro. Começa com a primeira da lista (`NOMES_UNIDADES[0]`), assim nunca fica vazia.
- **Linha 18** — Mensagem de erro para exibir.
- **Linha 19** — `loading` = "estou esperando o servidor" (desabilita o botão).
- **Linhas 21–23** — Guardam a conta que fez login mas **ainda não tem unidade** (contas antigas), e a unidade que ela vai escolher.


**📍 `LoginPage.jsx` — linhas 25 a 30**

```jsx
 25 │   function escolherPortal(perfil) {
 26 │     setIntencao(perfil);
 27 │     setErro('');
 28 │     setRa(''); setSenha('');
 29 │     setTela('login');
 30 │   }
```

- **Linha 25** — Chamada quando toca em "Portal do Aluno" ou "Painel Administrativo".
- **Linha 26** — Guarda a intenção.
- **Linha 27** — Limpa erro antigo.
- **Linha 28** — Limpa os campos (`;` permite dois comandos na mesma linha).
- **Linha 29** — Troca para a telinha de login.


**📍 `LoginPage.jsx` — linhas 32 a 43**

```jsx
 32 │   async function fazerLogin() {
 33 │     if (!ra.trim() || !senha.trim()) { setErro('Preencha usuário e senha.'); return; }
 34 │     setErro(''); setLoading(true);
 35 │     try {
 36 │       const resp = await api.login(ra.trim(), senha.trim());
 37 │       if (!resp.ok) { setErro('RA ou Senha inválidos.'); setLoading(false); return; }
 38 │       const aluno = await resp.json();
 39 │       const perfil = (aluno.perfil || '').trim();
 40 │       if (intencao === 'ADMIN' && perfil !== 'ADMIN') {
 41 │         setErro('Acesso negado: você não é administrador.');
 42 │         setLoading(false); return;
 43 │       }
```

- **Linha 32** — `async` porque vamos esperar o servidor.
- **Linha 33** — `.trim()` tira espaços das pontas. `||` significa "ou": se usuário **ou** senha estiverem vazios, mostra o erro e `return` **sai da função**. No HTML o `required` fazia isso; no mobile fazemos à mão.
- **Linha 34** — Limpa o erro e liga o modo "carregando".
- **Linha 35** — `try` = "tente"; se algo der erro de rede, pula para o `catch` (linha 56).
- **Linha 36** — `await api.login(...)` **espera** o servidor responder.
- **Linha 37** — `!resp.ok` = status de erro (401): usuário ou senha errados. Desliga o loading e sai.
- **Linha 38** — `resp.json()` converte a resposta em objeto: `{ id, nome, ra, perfil, unidade, token }`.
- **Linha 39** — `perfil` limpo (`|| ''` evita erro se vier nulo).
- **Linhas 40–43** — Se a pessoa escolheu o portal **ADMIN** mas o perfil dela **não** é ADMIN, nega o acesso. (Um aluno não entra no painel.)


**📍 `LoginPage.jsx` — linhas 45 a 60**

```jsx
 45 │       // Aluno sem unidade definida: pede a unidade antes de liberar o acervo.
 46 │       if (perfil === 'ALUNO' && !aluno.unidade) {
 47 │         api.salvarSessao(aluno); // o token já é necessário para salvar a unidade em seguida
 48 │         setAlunoPendente(aluno);
 49 │         setTela('escolher-unidade');
 50 │         setLoading(false);
 51 │         return;
 52 │       }
 53 │ 
 54 │       api.salvarSessao(aluno);
 55 │       onLogin(aluno);
 56 │     } catch {
 57 │       setErro('Erro de conexão. O servidor Java está ligado? O IP em src/config.jsx está certo?');
 58 │     }
 59 │     setLoading(false);
 60 │   }
```

- **Linhas 45–46** — Conta de aluno **sem unidade**: precisa escolher uma antes de ver o acervo (o catálogo é filtrado por unidade).
- **Linha 47** — `salvarSessao` guarda o token **já**, porque para salvar a unidade (`PUT`) o servidor exige token.
- **Linhas 48–49** — Guarda o aluno pendente e troca para a telinha de escolher unidade.
- **Linhas 50–51** — Desliga o loading e sai.
- **Linha 54** — Caso normal: guarda o token.
- **Linha 55** — Avisa o `App.jsx`, que troca para a tela certa (admin ou aluno).
- **Linhas 56–58** — `catch` roda se o `fetch` falhar (servidor desligado, IP errado, sem Wi-Fi). A mensagem lembra as duas causas mais comuns.
- **Linha 59** — Desliga o loading (roda em todos os caminhos que não deram `return` antes).


**📍 `LoginPage.jsx` — linhas 62 a 71**

```jsx
 62 │   async function confirmarUnidadePendente() {
 63 │     setLoading(true);
 64 │     try {
 65 │       await api.editarAluno(alunoPendente.id, { unidade: unidadePendente });
 66 │       onLogin({ ...alunoPendente, unidade: unidadePendente });
 67 │     } catch {
 68 │       setErro('Não foi possível salvar sua unidade. Tente novamente.');
 69 │     }
 70 │     setLoading(false);
 71 │   }
```

- **Linhas 62–63** — Chamada ao confirmar a unidade.
- **Linha 65** — `PUT /api/alunos/{id}` só com `{ unidade }`. O back só altera o que vier (`if (aluno.getUnidade() != null)`). O `AuthFilter` permite porque é a **própria** conta.
- **Linha 66** — `{ ...alunoPendente, unidade: unidadePendente }` copia o aluno e **sobrescreve** a unidade. Avisa o `App.jsx`.
- **Linhas 67–69** — Erro: mensagem na tela.


**📍 `LoginPage.jsx` — linhas 73 a 91**

```jsx
 73 │   async function fazerCadastro() {
 74 │     if (!nome.trim() || !cadRa.trim() || !cadSenha.trim()) { setErro('Preencha todos os campos.'); return; }
 75 │     setErro(''); setLoading(true);
 76 │     try {
 77 │       const aluno = await api.criarAluno({
 78 │         nome: nome.trim(),
 79 │         ra: cadRa.trim(),
 80 │         senha: cadSenha.trim(),
 81 │         email: 'novo@bibliotech.com',
 82 │         perfil: 'ALUNO',
 83 │         unidade: cadUnidade,
 84 │       });
 85 │       api.salvarSessao(aluno);
 86 │       onLogin(aluno);
 87 │     } catch (e) {
 88 │       setErro(e.message || 'Erro ao cadastrar. Tente novamente.');
 89 │     }
 90 │     setLoading(false);
 91 │   }
```

- **Linha 74** — Valida se os 3 campos foram preenchidos.
- **Linhas 77–84** — `POST /api/alunos` com os dados. `email: 'novo@bibliotech.com'` é um valor fixo (igual ao React). O back sempre grava `perfil = ALUNO` (segurança: ninguém se cadastra como admin).
- **Linha 85** — `criarAluno` já devolve o aluno **com token**, então guardamos e entramos direto.
- **Linhas 87–89** — Se o back recusou (ex.: 409 "Este usuário já está em uso"), `postOuPut` lançou um erro com essa mensagem; `e.message` a mostra.


**📍 `LoginPage.jsx` — linhas 93 a 93**

```jsx
 93 │   function trocarTela(nova) { setErro(''); setTela(nova); }
```

- **Linha 93** — Atalho: limpa o erro e troca de telinha. Evita repetir duas linhas em cada `Link`.


**📍 `LoginPage.jsx` — linhas 95 a 101**

```jsx
 95 │   return (
 96 │     <KeyboardAvoidingView style={{ flex: 1, backgroundColor: cores.fundo }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
 97 │       <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1 }}>
 98 │         <View style={[estilos.topo, { backgroundColor: cores.cabecalho }]}>
 99 │           <Text style={estilos.marca}>BiblioTech</Text>
100 │           <Text style={estilos.slogan}>O conhecimento do mundo na palma da sua mão. Acesse o nosso acervo e evolua com a gente.</Text>
101 │         </View>
```

- **Linha 96** — `KeyboardAvoidingView` faz a tela subir quando o teclado abre (só no iPhone precisa; no Android o sistema já cuida).
- **Linha 97** — `ScrollView` com `flexGrow: 1`: ocupa a tela toda, mas rola se precisar. `keyboardShouldPersistTaps="handled"` deixa o botão funcionar com o teclado aberto.
- **Linhas 98–101** — Faixa azul do topo com o nome e o slogan.


**📍 `LoginPage.jsx` — linhas 103 a 112**

```jsx
103 │         <View style={estilos.caixa}>
104 │           {tela === 'escolha' && (
105 │             <>
106 │               <Text style={[estilos.titulo, { color: cores.titulo }]}>Onde você deseja entrar?</Text>
107 │               <Botao titulo="📚 Portal do Aluno" onPress={() => escolherPortal('ALUNO')} style={{ marginBottom: 10 }} />
108 │               <Botao titulo="⚙️ Painel Administrativo" onPress={() => escolherPortal('ADMIN')} tipo="secundario" />
109 │               <Link cores={cores} texto="Não tem conta? Cadastre-se" onPress={() => trocarTela('cadastro')} />
110 │               <Link cores={cores} texto="← Voltar ao catálogo" onPress={onVoltar} />
111 │             </>
112 │           )}
```

- **Linha 104** — **Renderização condicional:** `tela === 'escolha' && (...)` só desenha o bloco se a condição for verdadeira. Como só **uma** condição é verdadeira por vez, aparece uma telinha de cada vez.
- 105 e 111: `<>` e `</>` (Fragment) agrupam elementos sem criar uma caixa extra.
- **Linha 107** — `() => escolherPortal('ALUNO')` é necessário porque queremos passar um argumento. Se escrevesse `onPress={escolherPortal('ALUNO')}`, a função rodaria ao desenhar, não ao tocar.
- **Linha 108** — O portal de admin usa `tipo="secundario"` (só borda).
- **Linhas 109–110** — Dois links: ir ao cadastro e voltar ao catálogo.


**📍 `LoginPage.jsx` — linhas 114 a 126**

```jsx
114 │           {tela === 'login' && (
115 │             <>
116 │               <Text style={[estilos.titulo, { color: cores.titulo }]}>
117 │                 {intencao === 'ADMIN' ? '⚙️ Acesso Administrativo' : '📚 Portal do Aluno'}
118 │               </Text>
119 │               <Campo rotulo={intencao === 'ADMIN' ? 'Usuário Admin' : 'Usuário'} placeholder="Digite seu Usuário"
120 │                 value={ra} onChangeText={setRa} autoCapitalize="none" autoCorrect={false} />
121 │               <Campo rotulo="Senha" placeholder="Sua senha" value={senha} onChangeText={setSenha} secureTextEntry />
122 │               {erro ? <Text style={estilos.erro}>⚠️ {erro}</Text> : null}
123 │               <Botao titulo={loading ? 'Entrando...' : 'Acessar'} onPress={fazerLogin} desabilitado={loading} />
124 │               <Link cores={cores} texto="← Trocar Portal" onPress={() => trocarTela('escolha')} />
125 │             </>
126 │           )}
```

- **Linha 117** — Título muda conforme o portal escolhido (ternário).
- **Linhas 119–120** — Campo de usuário. `autoCapitalize="none"` impede o teclado de pôr a primeira letra maiúscula; `autoCorrect={false}` desliga o corretor (não corrigir nome de usuário).
- **Linha 121** — `secureTextEntry` esconde a senha com bolinhas.
- **Linha 122** — Mostra o erro **só se existir** (`erro ? <Text> : null`).
- **Linha 123** — O botão muda o texto enquanto carrega e fica desabilitado.
- **Linha 124** — Link para voltar à escolha de portal.


**📍 `LoginPage.jsx` — linhas 128 a 140**

```jsx
128 │           {tela === 'cadastro' && (
129 │             <>
130 │               <Text style={[estilos.titulo, { color: cores.titulo }]}>Criar Nova Conta</Text>
131 │               <Campo rotulo="Nome Completo" placeholder="Ex: João da Silva" value={nome} onChangeText={setNome} />
132 │               <Campo rotulo="Usuário" placeholder="Digite seu nome de usuário" value={cadRa}
133 │                 onChangeText={setCadRa} autoCapitalize="none" autoCorrect={false} />
134 │               <Campo rotulo="Senha" placeholder="Crie uma senha" value={cadSenha} onChangeText={setCadSenha} secureTextEntry />
135 │               <Seletor rotulo="Unidade em que estuda" valor={cadUnidade} opcoes={NOMES_UNIDADES} onChange={setCadUnidade} />
136 │               {erro ? <Text style={estilos.erro}>⚠️ {erro}</Text> : null}
137 │               <Botao titulo={loading ? 'Cadastrando...' : 'Registrar e Acessar'} onPress={fazerCadastro} desabilitado={loading} />
138 │               <Link cores={cores} texto="Já tem conta? Entrar" onPress={() => trocarTela('escolha')} />
139 │             </>
140 │           )}
```

- **Linhas 128–140** — Telinha de **cadastro**, mesma ideia: campos ligados aos estados `nome`, `cadRa`, `cadSenha` e `cadUnidade`. `value` mostra o estado e `onChangeText={setNome}` atualiza o estado a cada letra (isso se chama **componente controlado**).
- **Linha 135** — `Seletor` com a lista das 6 unidades.


**📍 `LoginPage.jsx` — linhas 142 a 157**

```jsx
142 │           {tela === 'escolher-unidade' && (
143 │             <>
144 │               <Text style={[estilos.titulo, { color: cores.titulo }]}>📍 Qual unidade você estuda?</Text>
145 │               <Text style={{ color: cores.suave, marginBottom: 16 }}>
146 │                 Sua conta ainda não tem uma unidade definida. Isso garante que você só veja livros disponíveis no seu polo.
147 │               </Text>
148 │               <Seletor valor={unidadePendente} opcoes={NOMES_UNIDADES} onChange={setUnidadePendente} />
149 │               {erro ? <Text style={estilos.erro}>⚠️ {erro}</Text> : null}
150 │               <Botao titulo={loading ? 'Salvando...' : 'Confirmar e Entrar'} onPress={confirmarUnidadePendente} desabilitado={loading} />
151 │             </>
152 │           )}
153 │         </View>
154 │       </ScrollView>
155 │     </KeyboardAvoidingView>
156 │   );
157 │ }
```

- **Linhas 142–152** — Telinha de escolher a unidade (contas antigas). Explica **por que** pedimos: para só mostrar livros do polo do aluno.
- **Linha 148** — Seletor ligado a `unidadePendente`.
- **Linhas 153–157** — Fecham as caixas e o componente.


**📍 `LoginPage.jsx` — linhas 159 a 175**

```jsx
159 │ // Texto clicável simples (o "link-alternativo" do React)
160 │ function Link({ cores, texto, onPress }) {
161 │   return (
162 │     <Pressable onPress={onPress} style={{ paddingVertical: 12, alignItems: 'center' }}>
163 │       <Text style={{ color: cores.primaria, fontWeight: '600' }}>{texto}</Text>
164 │     </Pressable>
165 │   );
166 │ }
167 │ 
168 │ const estilos = StyleSheet.create({
169 │   topo: { paddingTop: TOPO_SEGURO + 24, paddingBottom: 32, paddingHorizontal: 24 },
170 │   marca: { color: '#fff', fontSize: 34, fontWeight: '800' },
171 │   slogan: { color: '#bfdbfe', marginTop: 8, fontSize: 15, lineHeight: 21 },
172 │   caixa: { padding: 24 },
173 │   titulo: { fontSize: 22, fontWeight: '800', marginBottom: 20 },
174 │   erro: { color: '#dc2626', marginBottom: 12 },
175 │ });
```

- **Linhas 159–166** — `Link` é um **componente pequeno** definido no mesmo arquivo (só o Login usa). Recebe `cores`, `texto` e `onPress`. Um texto tocável.
- **Linhas 168–175** — Estilos fixos: `topo` usa `TOPO_SEGURO + 24` para não ficar sob o relógio; `lineHeight` é a altura da linha do texto.


---

## Aula 14: `CatalogoPage.jsx` (a vitrine pública)

📁 **Arquivo:** `src/pages/CatalogoPage.jsx`

**Para que serve:** Primeira tela do app, **sem login**. Lista os livros, convida a entrar para reservar e mostra os polos com link para o mapa.

**Analogia:** É a vitrine da loja: qualquer um vê, mas para levar precisa se identificar.

**No React web era:** `CatalogoPage.jsx`, com `grid-livros` e um modal com `<iframe>` do Google Maps.


**📍 `CatalogoPage.jsx` — linhas 1 a 14**

```jsx
  1 │ import { useEffect, useState } from 'react';
  2 │ import { View, Text, Image, FlatList, Pressable, Linking, StyleSheet } from 'react-native';
  3 │ import { api } from '../services/api';
  4 │ import { POLOS } from '../constants/unidades';
  5 │ import { useTema } from '../theme';
  6 │ import { Botao, Carregando, Vazio } from '../components/ui';
  7 │ import CartaoLivro from '../components/CartaoLivro';
  8 │ 
  9 │ export default function CatalogoPage({ onIrParaLogin }) {
 10 │   const { cores } = useTema();
 11 │   const [livros, setLivros] = useState([]);
 12 │   const [loading, setLoading] = useState(true);
 13 │   const [atualizando, setAtualizando] = useState(false);
 14 │   const [semConexao, setSemConexao] = useState(false);
```

- **Linha 2** — `FlatList` (lista eficiente), `Linking` (abre links/apps do celular), `Image`.
- **Linha 4** — `POLOS` (lista das unidades).
- **Linha 9** — Recebe `onIrParaLogin`: função do `App.jsx` que abre o login.
- **Linha 11** — `livros` (a lista), começa vazia.
- **Linha 12** — `loading` começa `true`: ao abrir, ainda estamos buscando.
- **Linha 13** — `atualizando` controla o "puxar para atualizar".
- **Linha 14** — `semConexao` mostra a mensagem de ajuda se o servidor não responder. **Muito útil no mobile**, onde o erro mais comum é o IP errado.


**📍 `CatalogoPage.jsx` — linhas 16 a 24**

```jsx
 16 │   function carregar() {
 17 │     setSemConexao(false);
 18 │     api.getLivros()
 19 │       .then(setLivros)
 20 │       .catch(() => { setLivros([]); setSemConexao(true); })
 21 │       .finally(() => { setLoading(false); setAtualizando(false); });
 22 │   }
 23 │ 
 24 │   useEffect(() => { carregar(); }, []);
```

- **Linha 17** — Esconde o aviso de erro antigo.
- **Linha 18** — `api.getLivros()` devolve uma **Promise**. Aqui usamos `.then/.catch/.finally` em cadeia (o outro estilo, alternativo ao `async/await`).
- **Linha 19** — `.then(setLivros)`: quando chegar a lista, guarda no estado. Equivale a `.then(lista => setLivros(lista))`.
- **Linha 20** — `.catch`: se falhar, zera a lista e liga o aviso.
- **Linha 21** — `.finally`: **sempre** roda, com sucesso ou erro. Desliga os indicadores de carregamento.
- **Linha 24** — `useEffect` com `[]` = carrega **uma vez** ao abrir a tela.


**📍 `CatalogoPage.jsx` — linhas 26 a 29**

```jsx
 26 │   // No React abria um iframe do Google Maps. No celular, abrimos o app de mapas.
 27 │   function abrirMapa(endereco) {
 28 │     Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endereco)}`);
 29 │   }
```

- **Linha 26** — No React abria um `<iframe>` do Google Maps dentro de um modal.
- **Linhas 27–28** — No celular abrimos o **app de mapas**. `Linking.openURL` abre a URL fora do app. O endereço vai codificado com `encodeURIComponent` (espaços viram `%20`).


**📍 `CatalogoPage.jsx` — linhas 31 a 39**

```jsx
 31 │   const topo = (
 32 │     <View>
 33 │       <View style={[estilos.hero, { backgroundColor: cores.cabecalho }]}>
 34 │         <Text style={estilos.heroTitulo}>Bem-vindo à BiblioTech</Text>
 35 │         <Text style={estilos.heroTexto}>O acervo digital dos Institutos Técnicos de Barueri. Faça login para reservar.</Text>
 36 │       </View>
 37 │       <Text style={[estilos.secao, { color: cores.titulo }]}>📚 Destaques do Acervo</Text>
 38 │     </View>
 39 │   );
```

- **Linha 31** — `topo` é um **elemento JSX guardado numa variável**. Depois será o cabeçalho da lista.
- **Linhas 33–36** — Faixa azul de boas-vindas.
- **Linha 37** — Título "Destaques do Acervo".


**📍 `CatalogoPage.jsx` — linhas 41 a 59**

```jsx
 41 │   const rodape = (
 42 │     <View style={{ marginTop: 12 }}>
 43 │       <Text style={[estilos.secao, { color: cores.titulo }]}>Nossos Polos Parceiros</Text>
 44 │       {POLOS.map(polo => (
 45 │         <Pressable key={polo.nome} onPress={() => abrirMapa(polo.endereco)}
 46 │           style={[estilos.polo, { backgroundColor: cores.cartao, borderColor: cores.borda }]}>
 47 │           <Image source={polo.img} style={estilos.poloImg} resizeMode="cover" />
 48 │           <View style={{ flex: 1 }}>
 49 │             <Text style={{ color: cores.texto, fontWeight: '800' }}>{polo.nome}</Text>
 50 │             <Text style={{ color: cores.suave, marginTop: 2 }}>📍 {polo.bairro}</Text>
 51 │             <Text style={{ color: cores.primaria, fontWeight: '600', marginTop: 2 }}>Ver como chegar →</Text>
 52 │           </View>
 53 │         </Pressable>
 54 │       ))}
 55 │       <Text style={{ color: cores.suave, textAlign: 'center', marginTop: 16, fontSize: 12 }}>
 56 │         © 2026 BiblioTech — Instituto Técnico de Barueri
 57 │       </Text>
 58 │     </View>
 59 │   );
```

- **Linha 41** — `rodape`: aparece no fim da lista, com os polos.
- **Linha 44** — `POLOS.map(...)` cria um cartão por polo. `key={polo.nome}` identifica cada um.
- **Linha 45** — Cada polo é **tocável** e abre o mapa com o endereço dele.
- **Linha 47** — `<Image source={polo.img}>`: repare que aqui **não** há `{ uri: ... }`. Imagem local (feita com `require`) é passada direto.
- **Linhas 49–51** — Nome, bairro e a chamada "Ver como chegar →".
- **Linhas 55–57** — Rodapé de direitos.


**📍 `CatalogoPage.jsx` — linhas 61 a 82**

```jsx
 61 │   return (
 62 │     <FlatList
 63 │       data={livros}
 64 │       keyExtractor={l => String(l.id)}
 65 │       contentContainerStyle={{ padding: 16, gap: 12 }}
 66 │       refreshing={atualizando}
 67 │       onRefresh={() => { setAtualizando(true); carregar(); }}
 68 │       ListHeaderComponent={topo}
 69 │       ListFooterComponent={rodape}
 70 │       ListEmptyComponent={
 71 │         loading ? <Carregando texto="Carregando livros..." />
 72 │           : semConexao ? <Vazio texto="⚠️ Não foi possível falar com o servidor. Confira se o back está ligado e o IP em src/config.jsx." />
 73 │           : <Vazio texto="Nenhum livro no acervo." />
 74 │       }
 75 │       renderItem={({ item }) => (
 76 │         <CartaoLivro livro={item}>
 77 │           <Botao titulo="🔐 Entrar para Reservar" onPress={onIrParaLogin} style={{ marginTop: 8 }} />
 78 │         </CartaoLivro>
 79 │       )}
 80 │     />
 81 │   );
 82 │ }
```

- **Linha 62** — `FlatList` recebe os dados e **um molde** para desenhar cada item.
- **Linha 63** — `data` = a lista de livros.
- **Linha 64** — `keyExtractor` diz como achar o id único (o React exige texto, por isso `String(...)`).
- **Linha 65** — Margem interna da lista e `gap` entre os cartões.
- **Linhas 66–67** — **Puxar para atualizar** (pull-to-refresh): `refreshing` mostra a rodinha; `onRefresh` roda ao puxar.
- **Linhas 68–69** — `ListHeaderComponent` e `ListFooterComponent` põem o topo e o rodapé **dentro** da rolagem, junto da lista.
- **Linhas 70–74** — `ListEmptyComponent` aparece quando a lista está vazia. Ternário encadeado: carregando → rodinha; sem conexão → aviso; senão → "Nenhum livro".
- **Linha 75** — `renderItem` é o molde: para cada `item` desenha um `CartaoLivro`.
- **Linha 77** — O botão dentro do cartão (é o `children`) leva ao login.


**📍 `CatalogoPage.jsx` — linhas 84 a 91**

```jsx
 84 │ const estilos = StyleSheet.create({
 85 │   hero: { borderRadius: 16, padding: 20, marginBottom: 16 },
 86 │   heroTitulo: { color: '#fff', fontSize: 24, fontWeight: '800' },
 87 │   heroTexto: { color: '#bfdbfe', marginTop: 6, lineHeight: 20 },
 88 │   secao: { fontSize: 20, fontWeight: '800', marginBottom: 12 },
 89 │   polo: { flexDirection: 'row', gap: 12, padding: 10, borderRadius: 14, borderWidth: 1, marginBottom: 10, alignItems: 'center' },
 90 │   poloImg: { width: 76, height: 76, borderRadius: 10 },
 91 │ });
```

- **Linhas 84–91** — Estilos. `polo` usa `flexDirection: 'row'` (imagem ao lado do texto) e `alignItems: 'center'` (centraliza na vertical).


---

## Aula 15: `AcervoPage.jsx` (o catálogo do aluno e a reserva)

📁 **Arquivo:** `src/pages/AcervoPage.jsx`

**Para que serve:** O aluno logado vê **só os livros da unidade dele**, busca por título/autor e reserva.

**Analogia:** É a estante do seu polo: você só enxerga o que existe na sua unidade.

**No React web era:** `AcervoPage.jsx`. Diferença: usa `FlatList`, e a janela fecha também quando a reserva falha.


**📍 `AcervoPage.jsx` — linhas 1 a 18**

```jsx
  1 │ import { useEffect, useState } from 'react';
  2 │ import { View, Text, FlatList, StyleSheet } from 'react-native';
  3 │ import { api } from '../services/api';
  4 │ import { useTema } from '../theme';
  5 │ import { useToast } from '../components/Toast';
  6 │ import { Botao, Campo, Carregando, Vazio, Janela } from '../components/ui';
  7 │ import CartaoLivro from '../components/CartaoLivro';
  8 │ import { contem } from '../utils';
  9 │ 
 10 │ export default function AcervoPage({ usuario, unidade }) {
 11 │   const { cores } = useTema();
 12 │   const [livros, setLivros] = useState([]);
 13 │   const [busca, setBusca] = useState('');
 14 │   const [loading, setLoading] = useState(true);
 15 │   const [atualizando, setAtualizando] = useState(false);
 16 │   const [modalLivro, setModalLivro] = useState(null);
 17 │   const [reservando, setReservando] = useState(false);
 18 │   const toast = useToast();
```

- **Linha 5** — `useToast` para os avisos.
- **Linha 6** — Aqui usamos também `Campo` (busca) e `Janela` (confirmação).
- **Linha 8** — `contem` (busca sem maiúsculas).
- **Linha 10** — Props: `usuario` (nome do aluno logado) e `unidade` (o polo dele). Ambos vêm do `App.jsx`.
- **Linhas 12–15** — Lista, texto da busca, `loading` e `atualizando`.
- **Linha 16** — `modalLivro`: `null` = janela fechada; se tiver um livro, a janela abre para **aquele** livro. Um estado só serve de "aberto/fechado" e de "qual livro".
- **Linha 17** — `reservando` = pedido em andamento (evita dois toques).
- **Linha 18** — Traz a função `toast`.


**📍 `AcervoPage.jsx` — linhas 20 a 30**

```jsx
 20 │   function carregar() {
 21 │     // Filtra na API pela unidade do aluno logado: nunca mostra livro de outro polo.
 22 │     api.getLivros(unidade)
 23 │       .then(setLivros)
 24 │       .catch(() => toast('⚠️ Erro de conexão com o servidor.'))
 25 │       .finally(() => { setLoading(false); setAtualizando(false); });
 26 │   }
 27 │ 
 28 │   useEffect(() => { setLoading(true); carregar(); }, [unidade]);
 29 │ 
 30 │   const livrosFiltrados = livros.filter(l => contem(l.titulo, busca) || contem(l.autor, busca));
```

- **Linha 21** — **Regra de negócio:** o filtro por unidade é feito **no servidor**, pela URL (`?unidade=...`). Assim nunca chega livro de outro polo.
- **Linhas 22–25** — Mesma cadeia `then/catch/finally`; no erro mostra um toast.
- **Linha 28** — `useEffect` com `[unidade]`: recarrega quando a unidade mudar. `setLoading(true)` antes de buscar mostra a rodinha.
- **Linha 30** — Filtro de busca **no aparelho**: `.filter` mantém os livros cujo título **ou** autor contém o texto.


**📍 `AcervoPage.jsx` — linhas 32 a 49**

```jsx
 32 │   async function confirmarReserva() {
 33 │     setReservando(true);
 34 │     try {
 35 │       const resp = await api.criarEmprestimo({ nomeAluno: usuario, tituloLivro: modalLivro.titulo });
 36 │       if (resp.ok) {
 37 │         toast(`✅ Reserva confirmada! Retire no polo ${modalLivro.unidade} dentro do prazo informado.`);
 38 │       } else {
 39 │         const msg = await resp.text().catch(() => '');
 40 │         toast(`⚠️ ${msg || 'Não foi possível reservar. Tente novamente.'}`);
 41 │       }
 42 │       setModalLivro(null);
 43 │       carregar();
 44 │     } catch {
 45 │       setModalLivro(null);
 46 │       toast('⚠️ Erro de conexão com o servidor.');
 47 │     }
 48 │     setReservando(false);
 49 │   }
```

- **Linha 33** — Trava o botão.
- **Linha 35** — Faz a reserva: `POST /api/emprestimos` com **nome do aluno** e **título do livro**. É essa ligação por texto que o script SQL respeita (sem chave estrangeira).
- **Linhas 36–37** — Se `resp.ok`: toast de sucesso com o polo de retirada.
- **Linhas 38–41** — Senão: lê a mensagem do back (`resp.text()`) e mostra. As mensagens vêm das regras: limite de 3, já reservou, sem estoque.
- **Linhas 42–43** — Fecha a janela e **recarrega a lista**, para mostrar o estoque atualizado.
- **Linhas 44–47** — Falha de rede: fecha e avisa. (Um toast ficaria escondido atrás da janela; por isso fechamos antes.)
- **Linha 48** — Destrava o botão.


**📍 `AcervoPage.jsx` — linhas 51 a 56**

```jsx
 51 │   const topo = (
 52 │     <View>
 53 │       <Text style={[estilos.titulo, { color: cores.titulo }]}>Catálogo de Livros</Text>
 54 │       <Campo placeholder="🔍 Buscar por título ou autor..." value={busca} onChangeText={setBusca} />
 55 │     </View>
 56 │   );
```

- **Linhas 51–56** — O cabeçalho da lista: título e o campo de busca. O `Campo` está ligado ao estado `busca` (`value` + `onChangeText`): a cada letra digitada, `busca` muda, a tela redesenha e `livrosFiltrados` é recalculado.


**📍 `AcervoPage.jsx` — linhas 58 a 82**

```jsx
 58 │   return (
 59 │     <View style={{ flex: 1 }}>
 60 │       <FlatList
 61 │         data={livrosFiltrados}
 62 │         keyExtractor={l => String(l.id)}
 63 │         contentContainerStyle={{ padding: 16, gap: 12 }}
 64 │         keyboardShouldPersistTaps="handled"
 65 │         refreshing={atualizando}
 66 │         onRefresh={() => { setAtualizando(true); carregar(); }}
 67 │         ListHeaderComponent={topo}
 68 │         ListEmptyComponent={loading ? <Carregando texto="Carregando acervo..." /> : <Vazio texto="Nenhum livro encontrado." />}
 69 │         renderItem={({ item }) => (
 70 │           <CartaoLivro livro={item}>
 71 │             <Text style={{ color: cores.suave, fontSize: 12 }}>
 72 │               {item.quantidadeDisponivel ?? 0} de {item.quantidadeTotal ?? 1} exemplares disponíveis
 73 │             </Text>
 74 │             <Botao
 75 │               titulo={item.disponivel ? '📌 Reservar' : 'Indisponível'}
 76 │               desabilitado={!item.disponivel}
 77 │               onPress={() => setModalLivro(item)}
 78 │               style={{ marginTop: 8 }}
 79 │             />
 80 │           </CartaoLivro>
 81 │         )}
 82 │       />
```

- **Linha 59** — `View` com `flex: 1` como raiz, para a `FlatList` e a `Janela` conviverem.
- **Linha 61** — A lista usa os livros **já filtrados**.
- **Linha 64** — `keyboardShouldPersistTaps="handled"`: tocar num cartão com o teclado aberto funciona no primeiro toque.
- **Linhas 71–73** — `??` (coalescência nula) usa o valor da direita se o da esquerda for `null`. Mostra "2 de 3 exemplares disponíveis".
- **Linhas 74–79** — Botão "Reservar". Se `disponivel` for falso, fica desabilitado e diz "Indisponível". `setModalLivro(item)` abre a janela para aquele livro.


**📍 `AcervoPage.jsx` — linhas 84 a 100**

```jsx
 84 │       <Janela visivel={!!modalLivro} aoFechar={() => setModalLivro(null)} titulo="📌 Confirmar Reserva">
 85 │         <Text style={{ color: cores.texto, marginBottom: 16 }}>
 86 │           Você está reservando: <Text style={{ fontWeight: '800' }}>{modalLivro?.titulo}</Text>
 87 │         </Text>
 88 │         <Text style={{ color: cores.suave, fontSize: 13, fontWeight: '600' }}>Polo de Retirada</Text>
 89 │         <Text style={{ color: cores.texto, fontWeight: '700', marginTop: 4 }}>📍 {modalLivro?.unidade}</Text>
 90 │         <Text style={{ color: cores.suave, fontSize: 12, marginTop: 4, marginBottom: 20 }}>
 91 │           A reserva ficará segurada por 1 dia. Depois da retirada, o empréstimo terá prazo próprio de devolução.
 92 │         </Text>
 93 │         <View style={{ flexDirection: 'row', gap: 10 }}>
 94 │           <Botao titulo="Cancelar" tipo="secundario" onPress={() => setModalLivro(null)} style={{ flex: 1 }} />
 95 │           <Botao titulo={reservando ? 'Reservando...' : 'Confirmar'} onPress={confirmarReserva} desabilitado={reservando} style={{ flex: 1 }} />
 96 │         </View>
 97 │       </Janela>
 98 │     </View>
 99 │   );
100 │ }
```

- **Linha 84** — `visivel={!!modalLivro}`: o `!!` converte "tem livro / não tem" em `true/false`.
- **Linha 86** — `modalLivro?.titulo`: o `?.` evita erro quando a janela está fechada (`modalLivro` é `null`).
- **Linhas 88–92** — Mostra o polo de retirada e a regra: reserva segurada por **1 dia**.
- **Linhas 93–96** — Dois botões lado a lado (`flexDirection: 'row'`), cada um com `flex: 1` (metade da largura).


**📍 `AcervoPage.jsx` — linhas 102 a 104**

```jsx
102 │ const estilos = StyleSheet.create({
103 │   titulo: { fontSize: 24, fontWeight: '800', marginBottom: 12 },
104 │ });
```

- **Linhas 102–104** — Estilo do título.


---

## Aula 16: `ReservasPage.jsx` (minhas reservas e histórico)

📁 **Arquivo:** `src/pages/ReservasPage.jsx`

**Para que serve:** Mostra as reservas/empréstimos ativos do aluno e, alternando um botão, o histórico. Permite cancelar reservas.

**Analogia:** É a sua ficha de retiradas na biblioteca.

**No React web era:** `ReservasPage.jsx`, com `<table>` e um modal de confirmação. Aqui: cartões e `Alert` nativo.


**📍 `ReservasPage.jsx` — linhas 1 a 15**

```jsx
  1 │ import { useEffect, useState } from 'react';
  2 │ import { View, Text, FlatList, Alert, StyleSheet } from 'react-native';
  3 │ import { api } from '../services/api';
  4 │ import { useTema } from '../theme';
  5 │ import { useToast } from '../components/Toast';
  6 │ import { Botao, Selo, Linha, Carregando, Vazio } from '../components/ui';
  7 │ import { formatarData, situacaoAtiva, situacaoHistorico } from '../utils';
  8 │ 
  9 │ export default function ReservasPage({ usuario }) {
 10 │   const { cores } = useTema();
 11 │   const [reservas, setReservas] = useState([]);
 12 │   const [loading, setLoading] = useState(true);
 13 │   const [atualizando, setAtualizando] = useState(false);
 14 │   const [historico, setHistorico] = useState(false);
 15 │   const toast = useToast();
```

- **Linha 2** — `Alert` é o alerta nativo do celular.
- **Linha 7** — Importa as funções de `utils.jsx`: data, situação ativa e situação do histórico.
- **Linha 9** — Recebe só `usuario` (o nome do aluno).
- **Linha 14** — `historico`: `false` = ativos; `true` = histórico.


**📍 `ReservasPage.jsx` — linhas 17 a 25**

```jsx
 17 │   function carregar() {
 18 │     const chamada = historico ? api.getHistoricoPorAluno(usuario) : api.getEmprestimosPorAluno(usuario);
 19 │     chamada
 20 │       .then(setReservas)
 21 │       .catch(() => { setReservas([]); toast('⚠️ Erro de conexão com o servidor.'); })
 22 │       .finally(() => { setLoading(false); setAtualizando(false); });
 23 │   }
 24 │ 
 25 │   useEffect(() => { setLoading(true); carregar(); }, [usuario, historico]);
```

- **Linha 18** — **Escolhe a chamada** conforme o modo: histórico ou ativos. Ambas devolvem uma Promise; guardamos em `chamada`.
- **Linhas 19–22** — A mesma cadeia `then/catch/finally`.
- **Linha 25** — `[usuario, historico]`: recarrega ao abrir **e** sempre que o botão alternar entre reservas/histórico.


**📍 `ReservasPage.jsx` — linhas 27 a 33**

```jsx
 27 │   // No React era um modal de confirmação; no celular usamos o alerta nativo.
 28 │   function pedirCancelamento(r) {
 29 │     Alert.alert('Confirmar Cancelamento', `Deseja cancelar a reserva de ${r.tituloLivro}?`, [
 30 │       { text: 'Voltar', style: 'cancel' },
 31 │       { text: 'Sim, Cancelar', style: 'destructive', onPress: () => cancelar(r.id) },
 32 │     ]);
 33 │   }
```

- **Linha 27** — No React era um modal criado à mão; no celular usamos o alerta do sistema.
- **Linha 29** — `Alert.alert(título, mensagem, [botões])`.
- **Linha 30** — Botão "Voltar" com `style: 'cancel'` (aparência de cancelar).
- **Linha 31** — `style: 'destructive'` (vermelho no iPhone). `onPress` só executa `cancelar` se o aluno confirmar.


**📍 `ReservasPage.jsx` — linhas 35 a 48**

```jsx
 35 │   async function cancelar(id) {
 36 │     try {
 37 │       const resp = await api.cancelarEmprestimo(id);
 38 │       const texto = await resp.text().catch(() => '');
 39 │       if (resp.ok) {
 40 │         toast('✅ Reserva cancelada com sucesso!');
 41 │         carregar();
 42 │       } else {
 43 │         toast(`⚠️ ${texto || 'Não foi possível cancelar esta reserva.'}`);
 44 │       }
 45 │     } catch {
 46 │       toast('⚠️ Erro de conexão com o servidor.');
 47 │     }
 48 │   }
```

- **Linha 37** — `DELETE /api/emprestimos/{id}`. O back devolve o exemplar ao estoque.
- **Linha 38** — Lê o texto da resposta (mensagem de erro, se houver). `.catch(() => '')` evita quebrar se não houver corpo.
- **Linhas 39–41** — Sucesso: toast e recarrega.
- **Linhas 42–44** — Recusado (ex.: 409 "já foi retirado"): mostra a mensagem do servidor.
- **Linhas 45–47** — Falha de rede.


**📍 `ReservasPage.jsx` — linhas 50 a 57**

```jsx
 50 │   const topo = (
 51 │     <View style={{ marginBottom: 4 }}>
 52 │       <Text style={[estilos.titulo, { color: cores.titulo }]}>
 53 │         {historico ? '📚 Histórico de Empréstimos' : '📋 Minhas Reservas e Empréstimos'}
 54 │       </Text>
 55 │       <Botao titulo={historico ? '← Voltar às Reservas' : '📚 Ver Histórico'} tipo="secundario" onPress={() => setHistorico(h => !h)} />
 56 │     </View>
 57 │   );
```

- **Linhas 52–54** — Título muda conforme o modo.
- **Linha 55** — O botão inverte `historico` (`h => !h`), o que dispara o `useEffect` da linha 25.


**📍 `ReservasPage.jsx` — linhas 59 a 91**

```jsx
 59 │   return (
 60 │     <FlatList
 61 │       data={reservas}
 62 │       keyExtractor={r => String(r.id)}
 63 │       contentContainerStyle={{ padding: 16, gap: 12 }}
 64 │       refreshing={atualizando}
 65 │       onRefresh={() => { setAtualizando(true); carregar(); }}
 66 │       ListHeaderComponent={topo}
 67 │       ListEmptyComponent={loading ? <Carregando /> : <Vazio texto="Nenhum registro encontrado." />}
 68 │       renderItem={({ item: r }) => {
 69 │         const situacao = historico ? situacaoHistorico(r) : situacaoAtiva(r);
 70 │         return (
 71 │           <View style={[estilos.cartao, { backgroundColor: cores.cartao, borderColor: cores.borda }]}>
 72 │             <Text style={{ color: cores.texto, fontSize: 16, fontWeight: '800', marginBottom: 6 }}>{r.tituloLivro}</Text>
 73 │             <Selo texto={situacao.texto} tom={situacao.tom} />
 74 │             <View style={{ marginTop: 8 }}>
 75 │               <Linha rotulo="Reserva" valor={`${formatarData(r.dataReserva)}${r.status === 'RESERVADO' && r.dataLimiteReserva ? ` (até ${formatarData(r.dataLimiteReserva)})` : ''}`} />
 76 │               <Linha rotulo="Retirada" valor={formatarData(r.dataRetirada)} />
 77 │               <Linha rotulo="Devolução prevista" valor={formatarData(r.dataDevolucao)} />
 78 │               <Linha rotulo="Polo" valor={r.poloRetirada || 'Não informado'} />
 79 │             </View>
 80 │             {!historico && r.status === 'RESERVADO' && (
 81 │               <Botao titulo="✕ Cancelar reserva" tipo="perigo" onPress={() => pedirCancelamento(r)} style={{ marginTop: 10 }} />
 82 │             )}
 83 │             {!historico && r.status === 'RETIRADO' && (
 84 │               <Text style={{ color: cores.suave, fontSize: 12, marginTop: 10 }}>Aguardando devolução</Text>
 85 │             )}
 86 │           </View>
 87 │         );
 88 │       }}
 89 │     />
 90 │   );
 91 │ }
```

- **Linha 68** — `renderItem={({ item: r }) => {...}}`: aqui usamos **chaves** com `return` porque precisamos declarar uma variável antes. `item: r` renomeia `item` para `r`.
- **Linha 69** — **Uma única linha** decide o selo, chamando a função certa de `utils.jsx` conforme o modo.
- **Linha 72** — Título do livro em negrito.
- **Linha 73** — O selo com o texto e a cor já prontos (`situacao.texto`, `situacao.tom`).
- **Linha 75** — A linha da reserva. Usa **template string** com `${...}`. Se está `RESERVADO` e há limite, acrescenta " (até dd/mm/aaaa)". As crases aninhadas funcionam porque cada `${}` abre uma nova expressão.
- **Linhas 76–78** — Retirada, devolução prevista e polo (`||` mostra "Não informado" se vazio).
- **Linhas 80–82** — Botão de cancelar **só** se não é histórico **e** o status é `RESERVADO` (o `&&` desenha o botão apenas quando as duas condições são verdadeiras).
- **Linhas 83–85** — Se já foi retirado, só informa "Aguardando devolução" (o cancelamento é impedido pelo back).


**📍 `ReservasPage.jsx` — linhas 93 a 96**

```jsx
 93 │ const estilos = StyleSheet.create({
 94 │   titulo: { fontSize: 22, fontWeight: '800', marginBottom: 12 },
 95 │   cartao: { padding: 14, borderRadius: 14, borderWidth: 1 },
 96 │ });
```

- **Linhas 93–96** — Estilos do título e do cartão.

---

# Parte prática, continuação: o painel do administrador

As três telas de admin usam **os mesmos padrões** que você já viu. Por isso, nas partes repetidas eu só aponto "igual à Aula X" e me detenho no que é **novo**.


---

## Aula 17: `AdminReservasPage.jsx` (painel + entregar/devolver)

📁 **Arquivo:** `src/pages/AdminReservasPage.jsx`

**Para que serve:** Mostra 4 números (estatísticas) e a lista de todas as reservas e empréstimos. O admin marca **entregue** (o aluno retirou o livro) e **devolvido**.

**Analogia:** É o balcão da biblioteca: o bibliotecário confere a fila e dá baixa nos livros.

**No React web era:** `AdminReservasPage.jsx`, com `dashboard-grid` e `<table>`.


**📍 `AdminReservasPage.jsx` — linhas 1 a 17**

```jsx
  1 │ import { useEffect, useState } from 'react';
  2 │ import { View, Text, FlatList, StyleSheet } from 'react-native';
  3 │ import { api } from '../services/api';
  4 │ import { useTema } from '../theme';
  5 │ import { useToast } from '../components/Toast';
  6 │ import { Botao, Campo, Selo, Linha, Carregando, Vazio } from '../components/ui';
  7 │ import { contem, formatarData, situacaoAtiva, situacaoHistorico } from '../utils';
  8 │ 
  9 │ export default function AdminReservasPage() {
 10 │   const { cores } = useTema();
 11 │   const [stats, setStats] = useState({});
 12 │   const [reservas, setReservas] = useState([]);
 13 │   const [busca, setBusca] = useState('');
 14 │   const [historico, setHistorico] = useState(false);
 15 │   const [loading, setLoading] = useState(true);
 16 │   const [atualizando, setAtualizando] = useState(false);
 17 │   const toast = useToast();
```

- **Linhas 1–7** — Imports (mesmos da Aula 16, mais `Campo` e `contem` para a busca).
- **Linha 9** — Sem props: o admin vê **tudo**.
- **Linha 11** — `stats` começa como objeto vazio `{}`; será preenchido com `{ totalLivros, totalDisponiveis, totalAlunos, totalEmprestimos }`.
- **Linhas 12–16** — Lista, busca, modo histórico, `loading` e `atualizando` (padrão já conhecido).


**📍 `AdminReservasPage.jsx` — linhas 19 a 30**

```jsx
 19 │   function carregar() {
 20 │     // Primeiro as reservas: essa consulta também expira, no servidor, as reservas
 21 │     // vencidas. Só depois pedimos as estatísticas, já refletindo o estado atualizado.
 22 │     const chamada = historico ? api.getHistoricoEmprestimos() : api.getEmprestimos();
 23 │     chamada
 24 │       .then(lista => setReservas([...lista].sort((a, b) => (a.nomeAluno || '').localeCompare(b.nomeAluno || ''))))
 25 │       .catch(() => toast('⚠️ Erro ao carregar as reservas.'))
 26 │       .finally(() => { setLoading(false); setAtualizando(false); });
 27 │     chamada.then(() => api.getStats()).then(setStats).catch(() => {});
 28 │   }
 29 │ 
 30 │   useEffect(() => { setLoading(true); carregar(); }, [historico]);
```

- **Linhas 20–21** — **Ordem importa:** a consulta de reservas, no servidor, também **expira** as reservas vencidas (devolve o exemplar ao estoque). Só depois pedimos as estatísticas, para que os números já reflitam isso.
- **Linha 22** — Escolhe a chamada conforme o modo (ativos × histórico).
- **Linha 24** — `[...lista]` **copia** a lista (não mexemos no original) e `.sort` ordena por nome. `localeCompare` compara textos respeitando acentos. `(a.nomeAluno || '')` evita erro em nomes nulos.
- **Linhas 25–26** — Erro e `finally`, como sempre.
- **Linha 27** — **A mesma promise** (`chamada`) é usada de novo: quando terminar, pede as estatísticas (`.then(() => api.getStats())`) e guarda (`.then(setStats)`). `.catch(() => {})` ignora falha aqui: se as estatísticas não vierem, os cartões mostram "...".
- **Linha 30** — Recarrega ao abrir e quando o modo mudar.


**📍 `AdminReservasPage.jsx` — linhas 32 a 56**

```jsx
 32 │   async function confirmarEntrega(r) {
 33 │     try {
 34 │       const resp = await api.confirmarEntrega(r.id);
 35 │       const texto = await resp.text().catch(() => '');
 36 │       if (resp.ok) {
 37 │         toast(`✅ Livro '${r.tituloLivro}' entregue para ${r.nomeAluno}! Prazo de devolução iniciado.`);
 38 │         carregar();
 39 │       } else {
 40 │         toast(`⚠️ ${texto || 'Erro ao confirmar retirada.'}`);
 41 │       }
 42 │     } catch { toast('⚠️ Erro de conexão com o servidor.'); }
 43 │   }
 44 │ 
 45 │   async function confirmarDevolucao(r) {
 46 │     try {
 47 │       const resp = await api.confirmarDevolucao(r.id);
 48 │       const texto = await resp.text().catch(() => '');
 49 │       if (resp.ok) {
 50 │         toast(`✅ '${r.tituloLivro}' devolvido e disponível novamente!`);
 51 │         carregar();
 52 │       } else {
 53 │         toast(`⚠️ ${texto || 'Erro ao confirmar devolução.'}`);
 54 │       }
 55 │     } catch { toast('⚠️ Erro de conexão com o servidor.'); }
 56 │   }
```

- **Linha 32** — Recebe o **registro inteiro** (`r`), não só o `id`, para usar título e nome na mensagem.
- **Linha 34** — `POST /api/emprestimos/{id}/entregar`. O back muda para `RETIRADO`, grava a data de retirada e o prazo de **7 dias**.
- **Linhas 35–41** — Sucesso: toast com nome e livro, recarrega.
- **Linha 42** — `catch { ... }` numa linha só: falha de rede.
- **Linhas 45–56** — `confirmarDevolucao` é **igual**, chamando `/devolver`: o back muda para `DEVOLVIDO` e **devolve 1 exemplar ao estoque**.


**📍 `AdminReservasPage.jsx` — linhas 58 a 67**

```jsx
 58 │   const filtradas = reservas.filter(r =>
 59 │     contem(r.nomeAluno, busca) || contem(r.tituloLivro, busca) || contem(r.poloRetirada, busca)
 60 │   );
 61 │ 
 62 │   const cartoesStats = [
 63 │     { icone: '📚', valor: stats.totalLivros, rotulo: 'Total no Acervo' },
 64 │     { icone: '✅', valor: stats.totalDisponiveis, rotulo: 'Disponíveis Agora' },
 65 │     { icone: '👥', valor: stats.totalAlunos, rotulo: 'Alunos na Base' },
 66 │     { icone: '📌', valor: stats.totalEmprestimos, rotulo: 'Reservas e Empréstimos Ativos' },
 67 │   ];
```

- **Linhas 58–60** — Busca por aluno, livro **ou** polo (três `contem` ligados por `||`).
- **Linhas 62–67** — Os 4 cartões de estatística descritos como **dados** (uma lista de objetos). Depois um `.map` os desenha. É melhor do que escrever 4 blocos de JSX quase iguais.


**📍 `AdminReservasPage.jsx` — linhas 69 a 87**

```jsx
 69 │   const topo = (
 70 │     <View>
 71 │       <View style={estilos.grade}>
 72 │         {cartoesStats.map(c => (
 73 │           <View key={c.rotulo} style={[estilos.dash, { backgroundColor: cores.cartao, borderColor: cores.borda }]}>
 74 │             <Text style={{ fontSize: 22 }}>{c.icone}</Text>
 75 │             <Text style={{ color: cores.titulo, fontSize: 24, fontWeight: '800' }}>{c.valor ?? '...'}</Text>
 76 │             <Text style={{ color: cores.suave, fontSize: 12 }}>{c.rotulo}</Text>
 77 │           </View>
 78 │         ))}
 79 │       </View>
 80 │       <Text style={[estilos.titulo, { color: cores.titulo }]}>
 81 │         {historico ? 'Histórico de Empréstimos' : 'Gestão de Reservas e Empréstimos'}
 82 │       </Text>
 83 │       <Botao titulo={historico ? '← Voltar às Reservas' : '📚 Ver Histórico'} tipo="secundario"
 84 │         onPress={() => setHistorico(h => !h)} style={{ marginBottom: 12 }} />
 85 │       <Campo placeholder="🔍 Filtrar por aluno, livro ou polo..." value={busca} onChangeText={setBusca} />
 86 │     </View>
 87 │   );
```

- **Linha 71** — `grade`: contêiner que quebra linha (`flexWrap`).
- **Linhas 72–78** — Um cartão por estatística. `key={c.rotulo}`: o rótulo é único.
- **Linha 75** — `c.valor ?? '...'`: enquanto o número não chegou (`undefined`), mostra "...".
- **Linhas 80–85** — Título, botão de histórico e busca (igual à Aula 16).


**📍 `AdminReservasPage.jsx` — linhas 89 a 123**

```jsx
 89 │   return (
 90 │     <FlatList
 91 │       data={filtradas}
 92 │       keyExtractor={r => String(r.id)}
 93 │       contentContainerStyle={{ padding: 16, gap: 12 }}
 94 │       keyboardShouldPersistTaps="handled"
 95 │       refreshing={atualizando}
 96 │       onRefresh={() => { setAtualizando(true); carregar(); }}
 97 │       ListHeaderComponent={topo}
 98 │       ListEmptyComponent={loading ? <Carregando /> : <Vazio texto="Nenhum registro encontrado." />}
 99 │       renderItem={({ item: r }) => {
100 │         const situacao = historico ? situacaoHistorico(r) : situacaoAtiva(r);
101 │         return (
102 │           <View style={[estilos.cartao, { backgroundColor: cores.cartao, borderColor: cores.borda }]}>
103 │             <Text style={{ color: cores.texto, fontSize: 16, fontWeight: '800' }}>{r.nomeAluno}</Text>
104 │             <Text style={{ color: cores.texto, marginBottom: 6 }}>{r.tituloLivro}</Text>
105 │             <Selo texto={situacao.texto} tom={situacao.tom} />
106 │             <View style={{ marginTop: 8 }}>
107 │               <Linha rotulo="Polo" valor={r.poloRetirada || 'Não informado'} />
108 │               <Linha rotulo="Reserva" valor={`${formatarData(r.dataReserva)}${r.status === 'RESERVADO' ? ` (até ${formatarData(r.dataLimiteReserva)})` : ''}`} />
109 │               <Linha rotulo="Retirada" valor={formatarData(r.dataRetirada)} />
110 │               <Linha rotulo="Devolução prevista" valor={formatarData(r.dataDevolucao)} />
111 │             </View>
112 │             {!historico && r.status === 'RESERVADO' && (
113 │               <Botao titulo="✅ Entregar" tipo="sucesso" onPress={() => confirmarEntrega(r)} style={{ marginTop: 10 }} />
114 │             )}
115 │             {!historico && r.status === 'RETIRADO' && (
116 │               <Botao titulo="↩️ Devolvido" onPress={() => confirmarDevolucao(r)} style={{ marginTop: 10 }} />
117 │             )}
118 │           </View>
119 │         );
120 │       }}
121 │     />
122 │   );
123 │ }
```

- **Linhas 89–98** — A `FlatList` (padrão conhecido).
- **Linha 100** — Situação pelo modo, com as funções de `utils.jsx`.
- **Linhas 103–105** — Nome do aluno, livro e selo de situação.
- **Linhas 107–110** — Polo, reserva (com "até" quando `RESERVADO`), retirada e devolução prevista.
- **Linhas 112–114** — Se está `RESERVADO` → botão **verde "Entregar"**.
- **Linhas 115–117** — Se está `RETIRADO` → botão **"Devolvido"**. Um registro nunca mostra os dois botões: o status decide.
- **Linhas 118–123** — Fecham o cartão e o componente.


**📍 `AdminReservasPage.jsx` — linhas 125 a 130**

```jsx
125 │ const estilos = StyleSheet.create({
126 │   grade: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
127 │   dash: { width: '48%', padding: 12, borderRadius: 14, borderWidth: 1 },
128 │   titulo: { fontSize: 20, fontWeight: '800', marginBottom: 10 },
129 │   cartao: { padding: 14, borderRadius: 14, borderWidth: 1 },
130 │ });
```

- **Linhas 125–130** — Estilos. `dash` com `width: '48%'` + `gap` faz **2 cartões por linha**.


---

## Aula 18: `AdminLivrosPage.jsx` (CRUD de livros)

📁 **Arquivo:** `src/pages/AdminLivrosPage.jsx`

**Para que serve:** Listar, buscar, **criar**, **editar** e **excluir** livros. É o CRUD completo (Create, Read, Update, Delete).

**Analogia:** É o livro-caixa do acervo: o admin cadastra, corrige e dá baixa nos livros.

**No React web era:** `AdminLivrosPage.jsx`, com `<form>`, `required` e upload de capa. **O upload de capa não foi portado.**


**📍 `AdminLivrosPage.jsx` — linhas 1 a 11**

```jsx
  1 │ import { useEffect, useState } from 'react';
  2 │ import { View, Text, FlatList, Alert, StyleSheet } from 'react-native';
  3 │ import { api } from '../services/api';
  4 │ import { useTema } from '../theme';
  5 │ import { useToast } from '../components/Toast';
  6 │ import { NOMES_UNIDADES } from '../constants/unidades';
  7 │ import { Botao, Campo, Seletor, Selo, Carregando, Vazio, Janela } from '../components/ui';
  8 │ import CapaLivro from '../components/CapaLivro';
  9 │ import { contem } from '../utils';
 10 │ 
 11 │ const VAZIO = { titulo: '', autor: '', anoPublicacao: '', isbn: '', unidade: NOMES_UNIDADES[0], quantidadeTotal: '1' };
```

- **Linha 2** — `Alert` para confirmar exclusão.
- **Linha 8** — `CapaLivro` para a miniatura.
- **Linha 11** — `VAZIO` é o formulário "em branco". Repare que `anoPublicacao` e `quantidadeTotal` são **textos** (`''` e `'1'`): um `TextInput` só trabalha com texto. Convertemos para número só na hora de salvar.


**📍 `AdminLivrosPage.jsx` — linhas 13 a 24**

```jsx
 13 │ export default function AdminLivrosPage() {
 14 │   const { cores } = useTema();
 15 │   const [livros, setLivros] = useState([]);
 16 │   const [busca, setBusca] = useState('');
 17 │   const [loading, setLoading] = useState(true);
 18 │   const [atualizando, setAtualizando] = useState(false);
 19 │   const [modal, setModal] = useState(false);
 20 │   const [form, setForm] = useState(VAZIO);
 21 │   const [editId, setEditId] = useState(null);
 22 │   const [salvando, setSalvando] = useState(false);
 23 │   const [erroForm, setErroForm] = useState('');
 24 │   const toast = useToast();
```

- **Linhas 15–18** — Lista, busca, `loading`, `atualizando` (padrões conhecidos).
- **Linha 19** — `modal`: a janela do formulário está aberta?
- **Linha 20** — `form`: os valores atuais dos campos, num **único objeto**.
- **Linha 21** — `editId`: `null` = criando um livro novo; um número = editando aquele livro. Um estado só distingue os dois modos.
- **Linha 22** — `salvando` trava o botão.
- **Linha 23** — `erroForm`: mensagem de erro **dentro** da janela.


**📍 `AdminLivrosPage.jsx` — linhas 26 a 34**

```jsx
 26 │   function carregar() {
 27 │     api.getLivros()
 28 │       .then(setLivros)
 29 │       .catch(() => toast('⚠️ Erro ao carregar o acervo.'))
 30 │       .finally(() => { setLoading(false); setAtualizando(false); });
 31 │   }
 32 │   useEffect(() => { carregar(); }, []);
 33 │ 
 34 │   const campo = (nome) => (valor) => setForm(f => ({ ...f, [nome]: valor }));
```

- **Linhas 26–32** — Carrega o acervo ao abrir. Aqui usa `api.getLivros()` **sem unidade**: o admin vê todos os polos.
- **Linha 34** — **Truque importante:** `campo('titulo')` devolve uma função que atualiza **só** o campo `titulo`. Três camadas: `(nome) => (valor) => setForm(f => ({ ...f, [nome]: valor }))`. O `[nome]` entre colchetes usa o **conteúdo** da variável como chave; `...f` copia os outros campos. Assim escrevemos `onChangeText={campo('autor')}` em vez de uma função diferente por campo.


**📍 `AdminLivrosPage.jsx` — linhas 36 a 50**

```jsx
 36 │   function abrirNovo() {
 37 │     setForm(VAZIO); setEditId(null); setErroForm(''); setModal(true);
 38 │   }
 39 │ 
 40 │   function abrirEditar(livro) {
 41 │     setForm({
 42 │       titulo: livro.titulo || '',
 43 │       autor: livro.autor || '',
 44 │       anoPublicacao: String(livro.anoPublicacao ?? ''),
 45 │       isbn: livro.isbn || '',
 46 │       unidade: livro.unidade || NOMES_UNIDADES[0],
 47 │       quantidadeTotal: String(livro.quantidadeTotal ?? 1),
 48 │     });
 49 │     setEditId(livro.id); setErroForm(''); setModal(true);
 50 │   }
```

- **Linha 37** — Abrir "Novo": zera o formulário, marca `editId = null`, limpa erros e abre a janela.
- **Linhas 40–50** — Abrir "Editar": copia os dados do livro para o formulário. `|| ''` troca nulos por vazio; `String(x ?? '')` converte número em texto; `livro.unidade || NOMES_UNIDADES[0]` dá uma unidade padrão. `setEditId(livro.id)` marca que estamos editando.


**📍 `AdminLivrosPage.jsx` — linhas 52 a 78**

```jsx
 52 │   async function salvar() {
 53 │     if (!form.titulo.trim() || !form.autor.trim() || !form.anoPublicacao.trim()) {
 54 │       setErroForm('Preencha título, autor e ano de publicação.');
 55 │       return;
 56 │     }
 57 │     setSalvando(true); setErroForm('');
 58 │     try {
 59 │       const dados = {
 60 │         ...form,
 61 │         anoPublicacao: Number(form.anoPublicacao),
 62 │         quantidadeTotal: Number(form.quantidadeTotal) || 1,
 63 │       };
 64 │       if (editId) {
 65 │         await api.editarLivro(editId, dados);
 66 │         toast('✅ Livro atualizado com sucesso!');
 67 │       } else {
 68 │         await api.criarLivro(dados);
 69 │         toast('✅ Livro cadastrado com sucesso!');
 70 │       }
 71 │       setModal(false);
 72 │       carregar();
 73 │     } catch (erro) {
 74 │       // O erro aparece DENTRO da janela: um toast ficaria escondido atrás dela.
 75 │       setErroForm(erro.message || 'Erro ao salvar livro.');
 76 │     }
 77 │     setSalvando(false);
 78 │   }
```

- **Linhas 53–56** — **Validação manual** (o `required` do HTML não existe): se algum obrigatório estiver vazio, mostra o erro e sai.
- **Linhas 59–63** — Monta o que será enviado. `...form` copia tudo; `Number(...)` converte texto em número; `Number(x) || 1` usa 1 se a conversão der `NaN` ou 0.
- **Linhas 64–66** — Se `editId` existe → `PUT` (editar).
- **Linhas 67–70** — Senão → `POST` (criar). O back define o estoque inicial igual ao total.
- **Linhas 71–72** — Fecha a janela e recarrega a lista.
- **Linhas 73–76** — Se o back recusou (ex.: 409 "Já existe um livro com este título"), o `postOuPut` lançou erro; mostramos `erro.message` **dentro da janela** (um toast ficaria escondido atrás do `Modal`).
- **Linha 77** — Destrava o botão.


**📍 `AdminLivrosPage.jsx` — linhas 80 a 93**

```jsx
 80 │   function pedirExclusao(l) {
 81 │     Alert.alert('Confirmar Exclusão', `Deseja excluir o livro ${l.titulo}?`, [
 82 │       { text: 'Voltar', style: 'cancel' },
 83 │       { text: 'Sim, Excluir', style: 'destructive', onPress: () => excluir(l.id) },
 84 │     ]);
 85 │   }
 86 │ 
 87 │   async function excluir(id) {
 88 │     try {
 89 │       const resp = await api.deletarLivro(id);
 90 │       if (resp.ok) { toast('🗑️ Livro excluído.'); carregar(); }
 91 │       else toast('⚠️ Erro ao excluir.');
 92 │     } catch { toast('⚠️ Erro de conexão com o servidor.'); }
 93 │   }
```

- **Linhas 80–85** — Alerta de confirmação (mesmo padrão do cancelamento na Aula 16).
- **Linhas 87–93** — `DELETE /api/livros/{id}`. O back também **cancela reservas** desse livro e **apaga a imagem**. `if/else` sem chaves na linha 91 é permitido quando há um único comando.


**📍 `AdminLivrosPage.jsx` — linhas 95 a 103**

```jsx
 95 │   const filtrados = livros.filter(l => contem(l.titulo, busca) || contem(l.autor, busca) || contem(l.isbn, busca));
 96 │ 
 97 │   const topo = (
 98 │     <View>
 99 │       <Text style={[estilos.titulo, { color: cores.titulo }]}>Controle de Acervo</Text>
100 │       <Botao titulo="+ Novo Livro" onPress={abrirNovo} style={{ marginBottom: 12 }} />
101 │       <Campo placeholder="🔍 Filtrar por título, autor ou ISBN..." value={busca} onChangeText={setBusca} />
102 │     </View>
103 │   );
```

- **Linha 95** — Busca por título, autor **ou ISBN**.
- **Linhas 97–103** — Cabeçalho da lista: título, botão "+ Novo Livro" e busca.


**📍 `AdminLivrosPage.jsx` — linhas 105 a 132**

```jsx
105 │   return (
106 │     <View style={{ flex: 1 }}>
107 │       <FlatList
108 │         data={filtrados}
109 │         keyExtractor={l => String(l.id)}
110 │         contentContainerStyle={{ padding: 16, gap: 12 }}
111 │         keyboardShouldPersistTaps="handled"
112 │         refreshing={atualizando}
113 │         onRefresh={() => { setAtualizando(true); carregar(); }}
114 │         ListHeaderComponent={topo}
115 │         ListEmptyComponent={loading ? <Carregando /> : <Vazio texto="Nenhum livro encontrado." />}
116 │         renderItem={({ item: l }) => (
117 │           <View style={[estilos.cartao, { backgroundColor: cores.cartao, borderColor: cores.borda }]}>
118 │             <CapaLivro livro={l} style={{ width: 54, height: 76 }} />
119 │             <View style={{ flex: 1, gap: 2 }}>
120 │               <Text style={{ color: cores.suave, fontSize: 12 }}>#{l.id}</Text>
121 │               <Text style={{ color: cores.texto, fontWeight: '800', fontSize: 15 }}>{l.titulo}</Text>
122 │               <Text style={{ color: cores.suave }}>{l.autor} • {l.anoPublicacao}</Text>
123 │               <Text style={{ color: cores.suave, fontSize: 12 }}>📍 {l.unidade || 'Não definida'}</Text>
124 │               <Selo texto={`Estoque: ${l.quantidadeDisponivel ?? 0} / ${l.quantidadeTotal ?? 1}`} tom={l.disponivel ? 'verde' : 'vermelho'} />
125 │               <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
126 │                 <Botao titulo="✏️ Editar" tipo="secundario" onPress={() => abrirEditar(l)} style={{ flex: 1, paddingVertical: 8 }} />
127 │                 <Botao titulo="🗑️ Excluir" tipo="perigo" onPress={() => pedirExclusao(l)} style={{ flex: 1, paddingVertical: 8 }} />
128 │               </View>
129 │             </View>
130 │           </View>
131 │         )}
132 │       />
```

- **Linhas 105–115** — `FlatList` (padrão conhecido).
- **Linha 118** — Miniatura da capa: passamos `style={{ width: 54, height: 76 }}` para **substituir** o tamanho padrão (90×130).
- **Linha 120** — `#` + id do livro.
- **Linhas 122–123** — Autor, ano e unidade.
- **Linha 124** — Selo de estoque "Estoque: 2 / 3": verde se há exemplar, vermelho se não.
- **Linhas 125–128** — Botões lado a lado: **Editar** chama `abrirEditar(l)`; **Excluir** chama `pedirExclusao(l)`.


**📍 `AdminLivrosPage.jsx` — linhas 134 a 149**

```jsx
134 │       <Janela visivel={modal} aoFechar={() => setModal(false)} titulo={editId ? '✏️ Editar Livro' : '➕ Novo Livro'}>
135 │         <Campo rotulo="Título" value={form.titulo} onChangeText={campo('titulo')} />
136 │         <Campo rotulo="Autor" value={form.autor} onChangeText={campo('autor')} />
137 │         <Campo rotulo="Ano de Publicação" value={form.anoPublicacao} onChangeText={campo('anoPublicacao')} keyboardType="numeric" />
138 │         <Campo rotulo="ISBN" value={form.isbn} onChangeText={campo('isbn')} />
139 │         <Seletor rotulo="Unidade" valor={form.unidade} opcoes={NOMES_UNIDADES} onChange={campo('unidade')} />
140 │         <Campo rotulo="Qtd. de Exemplares" value={form.quantidadeTotal} onChangeText={campo('quantidadeTotal')} keyboardType="numeric" />
141 │         {erroForm ? <Text style={{ color: '#dc2626', marginBottom: 12 }}>⚠️ {erroForm}</Text> : null}
142 │         <View style={{ flexDirection: 'row', gap: 10 }}>
143 │           <Botao titulo="Cancelar" tipo="secundario" onPress={() => setModal(false)} style={{ flex: 1 }} />
144 │           <Botao titulo={salvando ? 'Salvando...' : 'Salvar Livro'} onPress={salvar} desabilitado={salvando} style={{ flex: 1 }} />
145 │         </View>
146 │       </Janela>
147 │     </View>
148 │   );
149 │ }
```

- **Linha 134** — `titulo` da janela muda entre "Editar" e "Novo" conforme `editId`.
- **Linhas 135–138** — Campos ligados a `form`: `value={form.titulo}` mostra o valor, `onChangeText={campo('titulo')}` atualiza.
- **Linha 137** — `keyboardType="numeric"` abre o teclado numérico.
- **Linha 139** — `Seletor` de unidade. `onChange={campo('unidade')}` reaproveita o mesmo truque.
- **Linha 140** — Quantidade de exemplares (teclado numérico).
- **Linha 141** — Erro do formulário (só se existir).
- **Linhas 142–145** — **Cancelar** e **Salvar** lado a lado.


**📍 `AdminLivrosPage.jsx` — linhas 151 a 154**

```jsx
151 │ const estilos = StyleSheet.create({
152 │   titulo: { fontSize: 24, fontWeight: '800', marginBottom: 12 },
153 │   cartao: { flexDirection: 'row', gap: 12, padding: 12, borderRadius: 14, borderWidth: 1 },
154 │ });
```

- **Linhas 151–154** — Estilos.
- 📌 **Ficou de fora de propósito:** o envio da **foto da capa**. Ele depende de `expo-image-picker`, cuja API muda entre versões do Expo SDK, e eu não podia testar aqui. O servidor já está pronto (`POST /api/livros/{id}/imagem`), e o `CapaLivro.jsx` já mostra a imagem se existir. É um ótimo próximo exercício (veja o fim da aula).


---

## Aula 19: `AdminAlunosPage.jsx` (CRUD de alunos)

📁 **Arquivo:** `src/pages/AdminAlunosPage.jsx`

**Para que serve:** Listar, buscar, criar, editar e excluir alunos e administradores.

**Analogia:** É o livro de matrículas.

**No React web era:** `AdminAlunosPage.jsx` (que usava `confirm()` do navegador para excluir).


**📍 `AdminAlunosPage.jsx` — linhas 1 a 24**

```jsx
  1 │ import { useEffect, useState } from 'react';
  2 │ import { View, Text, FlatList, Alert, StyleSheet } from 'react-native';
  3 │ import { api } from '../services/api';
  4 │ import { useTema } from '../theme';
  5 │ import { useToast } from '../components/Toast';
  6 │ import { NOMES_UNIDADES } from '../constants/unidades';
  7 │ import { Botao, Campo, Seletor, Selo, Carregando, Vazio, Janela } from '../components/ui';
  8 │ import { contem } from '../utils';
  9 │ 
 10 │ const VAZIO = { nome: '', ra: '', senha: '', email: '', perfil: 'ALUNO', unidade: NOMES_UNIDADES[0] };
 11 │ const PERFIS = [{ valor: 'ALUNO', rotulo: 'Aluno' }, { valor: 'ADMIN', rotulo: 'Administrador' }];
 12 │ 
 13 │ export default function AdminAlunosPage() {
 14 │   const { cores } = useTema();
 15 │   const [alunos, setAlunos] = useState([]);
 16 │   const [busca, setBusca] = useState('');
 17 │   const [loading, setLoading] = useState(true);
 18 │   const [atualizando, setAtualizando] = useState(false);
 19 │   const [modal, setModal] = useState(false);
 20 │   const [form, setForm] = useState(VAZIO);
 21 │   const [editId, setEditId] = useState(null);
 22 │   const [salvando, setSalvando] = useState(false);
 23 │   const [erroForm, setErroForm] = useState('');
 24 │   const toast = useToast();
```

- **Linhas 1–8** — Imports (como na Aula 18, sem `CapaLivro`).
- **Linha 10** — `VAZIO` do aluno.
- **Linha 11** — `PERFIS` no formato `{ valor, rotulo }`: o **valor** (`ADMIN`) vai para o banco; o **rótulo** ("Administrador") aparece na tela. O `Seletor` aceita os dois formatos (Aula 11, linha 42).
- **Linhas 13–24** — Estados idênticos à Aula 18.


**📍 `AdminAlunosPage.jsx` — linhas 26 a 46**

```jsx
 26 │   function carregar() {
 27 │     api.getAlunos()
 28 │       .then(setAlunos)
 29 │       .catch(() => toast('⚠️ Erro ao carregar os alunos.'))
 30 │       .finally(() => { setLoading(false); setAtualizando(false); });
 31 │   }
 32 │   useEffect(() => { carregar(); }, []);
 33 │ 
 34 │   const campo = (nome) => (valor) => setForm(f => ({ ...f, [nome]: valor }));
 35 │ 
 36 │   function abrirNovo() {
 37 │     setForm(VAZIO); setEditId(null); setErroForm(''); setModal(true);
 38 │   }
 39 │ 
 40 │   function abrirEditar(a) {
 41 │     setForm({
 42 │       nome: a.nome || '', ra: a.ra || '', senha: '', email: a.email || '',
 43 │       perfil: a.perfil || 'ALUNO', unidade: a.unidade || NOMES_UNIDADES[0],
 44 │     });
 45 │     setEditId(a.id); setErroForm(''); setModal(true);
 46 │   }
```

- **Linha 27** — `api.getAlunos()`: exige token de admin (o `AuthFilter` bloqueia aluno comum com 403).
- **Linhas 32–34** — `useEffect` e o truque `campo(...)` (Aula 18, linha 34).
- **Linhas 36–38** — Abrir "Novo".
- **Linhas 40–46** — Abrir "Editar". Repare em `senha: ''`: **nunca** preenchemos a senha, porque o banco só guarda o hash BCrypt e não dá para recuperar a original.


**📍 `AdminAlunosPage.jsx` — linhas 48 a 68**

```jsx
 48 │   async function salvar() {
 49 │     if (!form.nome.trim() || !form.ra.trim() || (!editId && !form.senha.trim())) {
 50 │       setErroForm('Preencha nome, usuário e senha (a senha só é opcional ao editar).');
 51 │       return;
 52 │     }
 53 │     setSalvando(true); setErroForm('');
 54 │     try {
 55 │       if (editId) {
 56 │         await api.editarAluno(editId, form);
 57 │         toast('✅ Aluno atualizado com sucesso!');
 58 │       } else {
 59 │         await api.criarAluno(form);
 60 │         toast('✅ Aluno cadastrado com sucesso!');
 61 │       }
 62 │       setModal(false);
 63 │       carregar();
 64 │     } catch (erro) {
 65 │       setErroForm(erro.message || 'Erro ao salvar aluno.');
 66 │     }
 67 │     setSalvando(false);
 68 │   }
```

- **Linhas 49–52** — Validação: nome e usuário sempre; a **senha só é obrigatória ao criar** (`!editId && !form.senha.trim()`). Ao editar, vazia significa "não alterar" (o back ignora senha vazia).
- **Linhas 55–57** — `editId` → `PUT`.
- **Linhas 58–61** — Senão → `POST`. O back **força `perfil = ALUNO`** ao criar. Para promover alguém a administrador, crie e depois **edite** o perfil.
- **Linhas 64–66** — Erro dentro da janela (ex.: 409 "Este usuário já está em uso").


**📍 `AdminAlunosPage.jsx` — linhas 70 a 93**

```jsx
 70 │   function pedirExclusao(a) {
 71 │     Alert.alert('Excluir aluno', `Excluir o aluno "${a.nome}"?`, [
 72 │       { text: 'Voltar', style: 'cancel' },
 73 │       { text: 'Excluir', style: 'destructive', onPress: () => excluir(a.id) },
 74 │     ]);
 75 │   }
 76 │ 
 77 │   async function excluir(id) {
 78 │     try {
 79 │       const resp = await api.deletarAluno(id);
 80 │       if (resp.ok) { toast('🗑️ Aluno excluído.'); carregar(); }
 81 │       else toast('⚠️ Erro ao excluir.');
 82 │     } catch { toast('⚠️ Erro de conexão com o servidor.'); }
 83 │   }
 84 │ 
 85 │   const filtrados = alunos.filter(a => contem(a.nome, busca) || contem(a.ra, busca) || contem(a.email, busca));
 86 │ 
 87 │   const topo = (
 88 │     <View>
 89 │       <Text style={[estilos.titulo, { color: cores.titulo }]}>Gestão de Alunos</Text>
 90 │       <Botao titulo="+ Novo Aluno" onPress={abrirNovo} style={{ marginBottom: 12 }} />
 91 │       <Campo placeholder="🔍 Filtrar por nome, RA ou email..." value={busca} onChangeText={setBusca} />
 92 │     </View>
 93 │   );
```

- **Linhas 70–75** — Alerta de confirmação para excluir.
- **Linhas 77–83** — `DELETE /api/alunos/{id}`.
- **Linha 85** — Busca por nome, usuário ou e-mail.
- **Linhas 87–93** — Cabeçalho da lista.


**📍 `AdminAlunosPage.jsx` — linhas 95 a 120**

```jsx
 95 │   return (
 96 │     <View style={{ flex: 1 }}>
 97 │       <FlatList
 98 │         data={filtrados}
 99 │         keyExtractor={a => String(a.id)}
100 │         contentContainerStyle={{ padding: 16, gap: 12 }}
101 │         keyboardShouldPersistTaps="handled"
102 │         refreshing={atualizando}
103 │         onRefresh={() => { setAtualizando(true); carregar(); }}
104 │         ListHeaderComponent={topo}
105 │         ListEmptyComponent={loading ? <Carregando /> : <Vazio texto="Nenhum aluno encontrado." />}
106 │         renderItem={({ item: a }) => (
107 │           <View style={[estilos.cartao, { backgroundColor: cores.cartao, borderColor: cores.borda }]}>
108 │             <Text style={{ color: cores.suave, fontSize: 12 }}>#{a.id}</Text>
109 │             <Text style={{ color: cores.texto, fontWeight: '800', fontSize: 16 }}>{a.nome}</Text>
110 │             <Text style={{ color: cores.suave }}>Usuário: {a.ra}</Text>
111 │             <Text style={{ color: cores.suave }}>E-mail: {a.email || '-'}</Text>
112 │             <Text style={{ color: cores.suave, fontSize: 12, marginBottom: 6 }}>📍 {a.unidade || '-'}</Text>
113 │             <Selo texto={a.perfil === 'ADMIN' ? '⚙️ Admin' : '📚 Aluno'} tom={a.perfil === 'ADMIN' ? 'azul' : 'verde'} />
114 │             <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
115 │               <Botao titulo="✏️ Editar" tipo="secundario" onPress={() => abrirEditar(a)} style={{ flex: 1, paddingVertical: 8 }} />
116 │               <Botao titulo="🗑️ Excluir" tipo="perigo" onPress={() => pedirExclusao(a)} style={{ flex: 1, paddingVertical: 8 }} />
117 │             </View>
118 │           </View>
119 │         )}
120 │       />
```

- **Linhas 95–105** — `FlatList` (padrão conhecido).
- **Linhas 108–112** — Dados do aluno em linhas. Repare que o JSON do back traz o campo `senha` (o hash), mas **nunca o mostramos**.
- **Linha 113** — Selo azul "Admin" ou verde "Aluno".
- **Linhas 114–117** — Botões Editar/Excluir.


**📍 `AdminAlunosPage.jsx` — linhas 122 a 143**

```jsx
122 │       <Janela visivel={modal} aoFechar={() => setModal(false)} titulo={editId ? '✏️ Editar Aluno' : '➕ Novo Aluno'}>
123 │         <Campo rotulo="Nome Completo" value={form.nome} onChangeText={campo('nome')} />
124 │         <Campo rotulo="Usuário" value={form.ra} onChangeText={campo('ra')} autoCapitalize="none" autoCorrect={false} />
125 │         <Campo rotulo={editId ? 'Senha (deixe vazio para não alterar)' : 'Senha'} value={form.senha}
126 │           onChangeText={campo('senha')} secureTextEntry />
127 │         <Campo rotulo="Email" value={form.email} onChangeText={campo('email')} keyboardType="email-address" autoCapitalize="none" />
128 │         <Seletor rotulo="Unidade" valor={form.unidade} opcoes={NOMES_UNIDADES} onChange={campo('unidade')} />
129 │         <Seletor rotulo="Perfil" valor={form.perfil} opcoes={PERFIS} onChange={campo('perfil')} />
130 │         {erroForm ? <Text style={{ color: '#dc2626', marginBottom: 12 }}>⚠️ {erroForm}</Text> : null}
131 │         <View style={{ flexDirection: 'row', gap: 10 }}>
132 │           <Botao titulo="Cancelar" tipo="secundario" onPress={() => setModal(false)} style={{ flex: 1 }} />
133 │           <Botao titulo={salvando ? 'Salvando...' : 'Salvar Aluno'} onPress={salvar} desabilitado={salvando} style={{ flex: 1 }} />
134 │         </View>
135 │       </Janela>
136 │     </View>
137 │   );
138 │ }
139 │ 
140 │ const estilos = StyleSheet.create({
141 │   titulo: { fontSize: 24, fontWeight: '800', marginBottom: 12 },
142 │   cartao: { padding: 14, borderRadius: 14, borderWidth: 1 },
143 │ });
```

- **Linhas 122–129** — Formulário. `secureTextEntry` esconde a senha; `keyboardType="email-address"` mostra o teclado com `@`. O rótulo da senha muda ao editar (linha 125).
- **Linhas 128–129** — Dois `Seletor`: unidade e perfil.
- **Linhas 130–135** — Erro e botões.
- **Linhas 140–143** — Estilos.


---

## Aula 20: `App.jsx` (o maestro)

📁 **Arquivo:** `App.jsx`

**Para que serve:** Decide **o que aparece**: login ou app, qual página, quais abas, quem está logado, tema claro/escuro. É o único arquivo que o Expo carrega diretamente.

**Analogia:** É o maestro da orquestra: não toca nenhum instrumento, mas diz quem entra e quando.

**No React web era:** `App.jsx`. Mudanças: barra de abas embaixo (em vez de menu no topo), sem `localStorage`, e o aviso de sessão expirada.


**📍 `App.jsx` — linhas 1 a 13**

```jsx
  1 │ import { useState, useEffect, useMemo } from 'react';
  2 │ import { View, Text, Pressable, StyleSheet } from 'react-native';
  3 │ import { StatusBar } from 'expo-status-bar';
  4 │ import { CLARO, ESCURO, TemaContext, TOPO_SEGURO, BASE_SEGURA } from './src/theme';
  5 │ import { api, definirAoSessaoExpirar } from './src/services/api';
  6 │ import { ToastContainer, useToast } from './src/components/Toast';
  7 │ import LoginPage from './src/pages/LoginPage';
  8 │ import CatalogoPage from './src/pages/CatalogoPage';
  9 │ import AcervoPage from './src/pages/AcervoPage';
 10 │ import ReservasPage from './src/pages/ReservasPage';
 11 │ import AdminReservasPage from './src/pages/AdminReservasPage';
 12 │ import AdminLivrosPage from './src/pages/AdminLivrosPage';
 13 │ import AdminAlunosPage from './src/pages/AdminAlunosPage';
```

- **Linha 1** — Além de `useState` e `useEffect`, usa `useMemo` (guarda um resultado calculado).
- **Linha 3** — `StatusBar` (barra do relógio/bateria), vem no template do Expo. `style="light"` deixa os ícones **brancos**, porque o topo do app é azul-escuro.
- **Linhas 4–6** — Tema, api e toasts.
- **Linhas 7–13** — Importa **todas as 7 páginas**.


**📍 `App.jsx` — linhas 15 a 25**

```jsx
 15 │ export default function App() {
 16 │   const [aluno, setAluno] = useState(null); // objeto completo: {id, nome, ra, perfil, unidade}
 17 │   const [pagina, setPagina] = useState('catalogo');
 18 │   const [showLogin, setShowLogin] = useState(false);
 19 │   const [escuro, setEscuro] = useState(false);
 20 │   const toast = useToast();
 21 │ 
 22 │   const usuario = aluno?.nome ?? null;
 23 │   const perfil = aluno?.perfil ?? null;
 24 │   const cores = escuro ? ESCURO : CLARO;
 25 │   const tema = useMemo(() => ({ cores, escuro, alternar: () => setEscuro(e => !e) }), [escuro]);
```

- **Linha 15** — `export default function App()`: o Expo procura este componente (via `index.js` → `registerRootComponent`).
- **Linha 16** — `aluno` guarda o **objeto completo** do usuário logado (`null` = ninguém). É a **fonte da verdade** de quem está logado.
- **Linha 17** — `pagina` diz qual página aparece. Começa em `'catalogo'`.
- **Linha 18** — `showLogin`: mostrar a tela de login por cima de tudo?
- **Linha 19** — `escuro`: modo escuro (só na memória; igual ao React, só que sem `localStorage`).
- **Linha 20** — Função de aviso.
- **Linhas 22–23** — **Valores derivados:** calculados a partir de `aluno`. Não criamos mais estados para eles. `aluno?.nome ?? null`: se `aluno` é nulo, dá `null` sem erro.
- **Linha 24** — Escolhe a paleta.
- **Linha 25** — Monta o objeto de tema `{ cores, escuro, alternar }` que vai para o Context. `useMemo(..., [escuro])` só o recria quando `escuro` muda. `setEscuro(e => !e)` inverte o valor.


**📍 `App.jsx` — linhas 27 a 36**

```jsx
 27 │   // Se o servidor disser que a sessão é inválida (ex.: o back reiniciou), volta ao login.
 28 │   useEffect(() => {
 29 │     definirAoSessaoExpirar(() => {
 30 │       api.limparSessao();
 31 │       setAluno(null);
 32 │       setPagina('catalogo');
 33 │       setShowLogin(true);
 34 │       toast('⚠️ Sua sessão expirou. Entre novamente.');
 35 │     });
 36 │   }, []);
```

- **Linha 27** — Registra o que fazer se o servidor devolver 401.
- **Linha 28** — `useEffect` com `[]`: registra **uma vez**, ao abrir o app.
- **Linha 29** — Entrega ao `api.jsx` a função de reação.
- **Linhas 30–33** — Apaga o token, "desloga" (`aluno = null`), volta ao catálogo e abre o login.
- **Linha 34** — Avisa o usuário.


**📍 `App.jsx` — linhas 38 a 49**

```jsx
 38 │   function handleLogin(alunoLogado) {
 39 │     setAluno(alunoLogado);
 40 │     setShowLogin(false);
 41 │     setPagina(alunoLogado.perfil === 'ADMIN' ? 'admin-reservas' : 'acervo');
 42 │   }
 43 │ 
 44 │   function handleLogout() {
 45 │     api.encerrarSessao();
 46 │     setAluno(null);
 47 │     setPagina('catalogo');
 48 │     setShowLogin(false);
 49 │   }
```

- **Linha 38** — Chamada pelo `LoginPage` quando o login dá certo.
- **Linhas 39–40** — Guarda o aluno e fecha o login.
- **Linha 41** — **Roteamento por perfil:** admin vai para `admin-reservas`; aluno, para `acervo`.
- **Linhas 44–49** — Logout: avisa o servidor e apaga tudo (`aluno`, página, login).


**📍 `App.jsx` — linhas 51 a 65**

```jsx
 51 │   // Abas da barra inferior, conforme quem está logado
 52 │   const abas = !usuario
 53 │     ? [{ id: 'catalogo', icone: '🏠', rotulo: 'Início' }, { id: 'login', icone: '🔐', rotulo: 'Login' }]
 54 │     : perfil === 'ADMIN'
 55 │       ? [
 56 │           { id: 'admin-reservas', icone: '📋', rotulo: 'Reservas' },
 57 │           { id: 'admin-livros', icone: '📚', rotulo: 'Acervo' },
 58 │           { id: 'admin-alunos', icone: '👥', rotulo: 'Alunos' },
 59 │         ]
 60 │       : [{ id: 'acervo', icone: '📚', rotulo: 'Catálogo' }, { id: 'reservas', icone: '📌', rotulo: 'Minhas Reservas' }];
 61 │ 
 62 │   function aoTocarAba(id) {
 63 │     if (id === 'login') setShowLogin(true);
 64 │     else setPagina(id);
 65 │   }
```

- **Linhas 52–60** — **Abas conforme quem está logado.** Ternário aninhado: sem usuário → Início + Login; admin → Reservas, Acervo, Alunos; aluno → Catálogo, Minhas Reservas. Cada aba é um objeto `{ id, icone, rotulo }`, o `id` é o mesmo nome usado em `pagina`.
- **Linhas 62–65** — Tocar numa aba: `login` abre a tela de login; as outras trocam `pagina`.


**📍 `App.jsx` — linhas 67 a 75**

```jsx
 67 │   return (
 68 │     <TemaContext.Provider value={tema}>
 69 │       <View style={{ flex: 1, backgroundColor: cores.fundo }}>
 70 │         <StatusBar style="light" />
 71 │ 
 72 │         {showLogin ? (
 73 │           <LoginPage onLogin={handleLogin} onVoltar={() => setShowLogin(false)} />
 74 │         ) : (
 75 │           <>
```

- **Linha 68** — `TemaContext.Provider` "liga o canal": tudo que estiver **dentro** dele consegue chamar `useTema()`.
- **Linha 69** — Contêiner raiz com o fundo do tema. `flex: 1` ocupa a tela toda.
- **Linha 70** — A barra de status.
- **Linhas 72–74** — **Login ou app?** `showLogin ? <LoginPage/> : (...)`.
- **Linha 73** — Passa `onLogin` e `onVoltar` para o `LoginPage`. **Funções descem como props; o filho as chama para avisar o pai.**
- **Linha 75** — `<>` agrupa cabeçalho, páginas e abas sem caixa extra.


**📍 `App.jsx` — linhas 76 a 90**

```jsx
 76 │             {/* CABEÇALHO */}
 77 │             <View style={[estilos.cabecalho, { backgroundColor: cores.cabecalho }]}>
 78 │               <Text style={estilos.marca}>BiblioTech</Text>
 79 │               <View style={estilos.acoes}>
 80 │                 {usuario && <Text style={estilos.ola}>Olá, {usuario.split(' ')[0]}!</Text>}
 81 │                 <Pressable onPress={tema.alternar} style={estilos.botaoCab}>
 82 │                   <Text>{escuro ? '☀️' : '🌙'}</Text>
 83 │                 </Pressable>
 84 │                 {usuario && (
 85 │                   <Pressable onPress={handleLogout} style={estilos.botaoCab}>
 86 │                     <Text style={{ color: '#fff', fontWeight: '700' }}>Sair</Text>
 87 │                   </Pressable>
 88 │                 )}
 89 │               </View>
 90 │             </View>
```

- **Linha 77** — Cabeçalho azul.
- **Linha 80** — Saudação com o **primeiro nome**: `usuario.split(' ')[0]` divide o nome nos espaços e pega o primeiro pedaço. `usuario && ...` só aparece se logado.
- **Linhas 81–83** — Botão do modo escuro: `tema.alternar` inverte `escuro`; o emoji muda (☀️/🌙).
- **Linhas 84–88** — Botão "Sair", só se logado.


**📍 `App.jsx` — linhas 92 a 100**

```jsx
 92 │             {/* PÁGINAS */}
 93 │             <View style={{ flex: 1 }}>
 94 │               {pagina === 'catalogo' && <CatalogoPage onIrParaLogin={() => setShowLogin(true)} />}
 95 │               {pagina === 'acervo' && <AcervoPage usuario={usuario} unidade={aluno?.unidade} />}
 96 │               {pagina === 'reservas' && <ReservasPage usuario={usuario} />}
 97 │               {pagina === 'admin-reservas' && <AdminReservasPage />}
 98 │               {pagina === 'admin-livros' && <AdminLivrosPage />}
 99 │               {pagina === 'admin-alunos' && <AdminAlunosPage />}
100 │             </View>
```

- **Linha 93** — Área das páginas: `flex: 1` ocupa o espaço entre cabeçalho e abas.
- **Linhas 94–99** — **Navegação por estado** (a mesma ideia do React): só a página cujo `id` é igual a `pagina` é desenhada. O que cada página precisa vem por props: `usuario` e `unidade` para o Acervo, `usuario` para Minhas Reservas.
- 📌 Cada vez que você troca de página, a anterior é **desmontada**; ao voltar, ela recarrega os dados do servidor. É simples e sempre atual.


**📍 `App.jsx` — linhas 102 a 123**

```jsx
102 │             {/* BARRA DE ABAS */}
103 │             <View style={[estilos.abas, { backgroundColor: cores.cartao, borderTopColor: cores.borda, paddingBottom: 8 + BASE_SEGURA }]}>
104 │               {abas.map(a => {
105 │                 const ativa = a.id === pagina;
106 │                 return (
107 │                   <Pressable key={a.id} onPress={() => aoTocarAba(a.id)} style={estilos.aba}>
108 │                     <Text style={{ fontSize: 20 }}>{a.icone}</Text>
109 │                     <Text style={{ fontSize: 11, color: ativa ? cores.primaria : cores.suave, fontWeight: ativa ? '800' : '500' }}>
110 │                       {a.rotulo}
111 │                     </Text>
112 │                   </Pressable>
113 │                 );
114 │               })}
115 │             </View>
116 │           </>
117 │         )}
118 │ 
119 │         <ToastContainer />
120 │       </View>
121 │     </TemaContext.Provider>
122 │   );
123 │ }
```

- **Linha 103** — Barra de abas: `flexDirection: 'row'` põe as abas lado a lado; `paddingBottom` inclui a folga do iPhone.
- **Linha 104** — `.map` cria um botão por aba.
- **Linha 105** — `ativa` é verdadeiro se esta aba é a página atual.
- **Linha 107** — Toque chama `aoTocarAba(a.id)`.
- **Linhas 108–111** — Ícone e rótulo; a aba ativa fica azul e em negrito.
- **Linhas 116–117** — Fecham o `<>` e o condicional.
- **Linha 119** — `ToastContainer` fica **fora** do condicional: os avisos aparecem no login e no app.
- **Linhas 120–123** — Fecham o contêiner, o Provider e a função.


**📍 `App.jsx` — linhas 125 a 133**

```jsx
125 │ const estilos = StyleSheet.create({
126 │   cabecalho: { paddingTop: TOPO_SEGURO + 8, paddingBottom: 12, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
127 │   marca: { color: '#fff', fontSize: 22, fontWeight: '800' },
128 │   acoes: { flexDirection: 'row', alignItems: 'center', gap: 8 },
129 │   ola: { color: '#bfdbfe', fontSize: 13 },
130 │   botaoCab: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.15)' },
131 │   abas: { flexDirection: 'row', borderTopWidth: 1, paddingTop: 8 },
132 │   aba: { flex: 1, alignItems: 'center', gap: 2 },
133 │ });
```

- **Linhas 125–133** — Estilos. `justifyContent: 'space-between'` empurra a marca para a esquerda e as ações para a direita; `rgba(255,255,255,0.15)` é branco a 15% (o botão "translúcido" do cabeçalho).

---

# Encerramento

## Como rodar (passo a passo)

1. **Banco:** abra `bibliotecadigital_sqlserver.sql` no SSMS e execute.
2. **Back-end:** coloque o `application.properties` (com a senha do seu SQL Server) em `back/bibliotecadigital/src/main/resources/` e suba o Spring Boot. Teste no navegador do PC: `http://localhost:8080/api/livros` deve mostrar os 8 livros em JSON.
3. **Descobrir o IP do PC:** CMD → `ipconfig` → "Endereço IPv4" (algo como `192.168.0.10`).
4. **Configurar o app:** em `src/config.jsx`, troque o IP.
5. **Firewall:** se o celular não conectar, libere a porta **8080** (Firewall do Windows → regra de entrada para a porta TCP 8080, rede privada). Teste no navegador **do celular**: `http://SEU-IP:8080/api/livros`. Se esse endereço não abre no celular, o app também não vai abrir.
6. **Rodar:** na pasta do app: `npm install` e depois `npx expo start`. Abra o **Expo Go** e leia o QR Code.
7. **Testar:** entre como `aluno1` / `123456` (reserve um livro) e depois como `admin` / `admin123` (entregue e devolva).

## Erros comuns e o que significam

| Sintoma | Causa provável |
|---|---|
| "Não foi possível falar com o servidor" no catálogo | IP errado em `config.jsx`, back desligado, firewall, ou celular em outro Wi-Fi |
| "Network request failed" | O mesmo (o app não alcançou o servidor) |
| Login diz "RA ou Senha inválidos" | Usuário/senha errados, ou o banco não recebeu o script |
| "Acesso restrito ao administrador" (403) | Tentou uma rota de admin com conta de aluno |
| Volta ao login sozinho com "sessão expirou" | O back foi reiniciado (os tokens ficam só na memória do servidor) |
| Telas em branco após instalar algo | Pare o Expo e rode `npx expo start -c` (limpa o cache) |

## O que este projeto NÃO faz (para você evoluir)

1. **Upload da capa do livro** (exige `expo-image-picker`; o back já tem o endpoint).
2. **Guardar o login** ao fechar o app (`@react-native-async-storage/async-storage`).
3. **Guardar o modo escuro** (mesma biblioteca).
4. **Área segura exata** por aparelho (`react-native-safe-area-context`).
5. **Navegação com biblioteca** (`react-navigation`): trocaria o `pagina` por pilhas e abas reais, com botão "voltar" do Android.
6. **Publicar o app** (APK/IPA): exige HTTPS no servidor ou liberar tráfego `http` no Android.

## Cinco exercícios para fixar

1. **Fácil:** mude a cor primária (`primaria`) em `theme.jsx` e veja o app inteiro mudar.
2. **Fácil:** em `AcervoPage.jsx`, mostre também o ISBN no cartão (precisa mexer em `CartaoLivro.jsx`).
3. **Médio:** no `ReservasPage.jsx`, mostre quantos dias faltam para a devolução.
4. **Médio:** faça a busca do `AdminReservasPage` filtrar também pelo **status**.
5. **Difícil:** salve o token e o modo escuro com AsyncStorage para o app lembrar o login ao reabrir.

## Um aviso de segurança do back-end (para o seu TCC)

Ao ler os controllers, notei que a resposta de `GET /api/alunos` e do login devolve o campo `senha` (o **hash** BCrypt) junto com os dados. O app mobile ignora esse campo, mas o ideal é o back **não enviar** (por exemplo, com `@JsonIgnore` no getter da senha, ou com um DTO). Vale mencionar no TCC como ponto de melhoria.

---

**Fim da aula.** Dúvidas, cole aqui o erro completo que aparecer no terminal ou no Expo Go, e vamos resolver juntos. 🎓
