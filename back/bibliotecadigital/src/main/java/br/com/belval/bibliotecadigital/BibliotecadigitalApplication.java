package br.com.belval.bibliotecadigital;

import br.com.belval.bibliotecadigital.model.Aluno;
import br.com.belval.bibliotecadigital.model.Livro;
import br.com.belval.bibliotecadigital.repository.AlunoRepository;
import br.com.belval.bibliotecadigital.repository.LivroRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

@SpringBootApplication
public class BibliotecadigitalApplication {

	public static void main(String[] args) {
		SpringApplication.run(BibliotecadigitalApplication.class, args);
	}

	// Popula o banco automaticamente quando o servidor inicia (funciona com H2)
	@Bean
	public CommandLineRunner seedDados(AlunoRepository alunoRepo, LivroRepository livroRepo, PasswordEncoder passwordEncoder) {
		return args -> {
			// 1. Cria um admin padrão
			if (alunoRepo.findByRa("admin") == null) {
				Aluno admin = new Aluno();
				admin.setNome("Administrador Master");
				admin.setRa("admin");
				admin.setSenha(passwordEncoder.encode("admin123"));
				admin.setPerfil("ADMIN");
				admin.setEmail("admin@bibliotech.com");
				alunoRepo.save(admin);
				System.out.println(">>> [SEED] Usuário ADMIN criado: RA 'admin' / Senha 'admin123'");
			}

			// 2. Cria um Aluno de teste
			if (alunoRepo.findByRa("aluno1") == null) {
				Aluno aluno = new Aluno();
				aluno.setNome("Guilherme Souza");
				aluno.setRa("aluno1");
				aluno.setSenha(passwordEncoder.encode("123456"));
				aluno.setPerfil("ALUNO");
				aluno.setEmail("gui@email.com");
				aluno.setUnidade("ITB Brasílio Flores de Azevedo");
				alunoRepo.save(aluno);
				System.out.println(">>> [SEED] Aluno de teste criado: RA 'aluno1' / Senha '123456' (unidade: ITB Brasílio Flores de Azevedo)");
			}

			// 3. Cria alguns Livros se o banco estiver vazio
			if (livroRepo.count() == 0) {
				// título, autor, ano, isbn, unidade, quantidade de exemplares
				String[][] livrosIniciais = {
						{ "Dom Casmurro", "Machado de Assis", "1899", "978-85-00-01", "ITB Brasílio Flores de Azevedo", "2" },
						{ "O Pequeno Príncipe", "Antoine de Saint-Exupéry", "1943", "978-85-00-02", "ITB Prof. Munir José", "1" },
						{ "1984", "George Orwell", "1949", "978-85-00-03", "ITB Profª Maria Sylvia Chaluppe Mello", "1" },
						{ "O Cortiço", "Aluísio Azevedo", "1890", "978-85-00-04", "ITB Profº Hércules Alves de Oliveira", "1" },
						{ "Harry Potter e a Pedra Filosofal", "J.K. Rowling", "1997", "978-85-00-05", "ITB Profº Moacyr Domingos Sávio Veronezi", "3" },
						{ "A Moreninha", "Joaquim Manuel de Macedo", "1844", "978-85-00-06", "ITB Profª Maria Theodora Pedreira de Freitas", "1" },
						{ "Capitães da Areia", "Jorge Amado", "1937", "978-85-00-07", "ITB Brasílio Flores de Azevedo", "2" },
						{ "O Alquimista", "Paulo Coelho", "1988", "978-85-00-08", "ITB Prof. Munir José", "1" }
				};

				for (String[] l : livrosIniciais) {
					Livro novo = new Livro();
					novo.setTitulo(l[0]);
					novo.setAutor(l[1]);
					novo.setAnoPublicacao(Integer.parseInt(l[2]));
					novo.setIsbn(l[3]);
					novo.setUnidade(l[4]);
					int qtd = Integer.parseInt(l[5]);
					novo.setQuantidadeTotal(qtd);
					novo.setQuantidadeDisponivel(qtd);
					livroRepo.save(novo);
				}
				System.out.println(">>> [SEED] 8 Livros iniciais cadastrados, distribuídos entre as unidades!");
			}

			// 4. MIGRAÇÃO: se o banco já existia antes dos campos "unidade" e
			// "quantidadeTotal/quantidadeDisponivel", os livros antigos ficariam com
			// esses campos nulos e sumiriam do catálogo de todo mundo (o filtro por
			// unidade não bate com nada e o cálculo de disponibilidade vira "0").
			// Aqui a gente evita esse sumiço dando um valor padrão - o admin pode
			// depois corrigir a unidade de cada um no painel.
			List<Livro> semUnidade = livroRepo.findAll().stream()
					.filter(l -> l.getUnidade() == null || l.getUnidade().isBlank())
					.toList();
			if (!semUnidade.isEmpty()) {
				for (Livro l : semUnidade) {
					l.setUnidade("ITB Brasílio Flores de Azevedo");
					if (l.getQuantidadeTotal() == null || l.getQuantidadeTotal() <= 0) l.setQuantidadeTotal(1);
					if (l.getQuantidadeDisponivel() == null) l.setQuantidadeDisponivel(l.getQuantidadeTotal());
				}
				livroRepo.saveAll(semUnidade);
				System.out.println(">>> [MIGRAÇÃO] " + semUnidade.size()
						+ " livro(s) antigo(s) sem unidade definida foram ajustados para 'ITB Brasílio Flores de Azevedo'. Corrija a unidade certa de cada um no painel admin.");
			}

			// 5. MIGRAÇÃO DE SEGURANÇA: contas que ainda têm a senha salva em texto
			// puro (de antes desta atualização) são criptografadas automaticamente.
			// A senha que a pessoa já usa continua a mesma - só deixa de ficar exposta.
			List<Aluno> senhaEmTextoPuro = alunoRepo.findAll().stream()
					.filter(a -> a.getSenha() != null && !a.getSenha().startsWith("$2"))
					.toList();
			if (!senhaEmTextoPuro.isEmpty()) {
				for (Aluno a : senhaEmTextoPuro) {
					a.setSenha(passwordEncoder.encode(a.getSenha()));
				}
				alunoRepo.saveAll(senhaEmTextoPuro);
				System.out.println(">>> [MIGRAÇÃO DE SEGURANÇA] " + senhaEmTextoPuro.size()
						+ " senha(s) que estavam em texto puro foram criptografadas.");
			}
		};
	}
}
