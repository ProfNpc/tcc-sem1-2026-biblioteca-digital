package br.com.belval.bibliotecadigital;

import br.com.belval.bibliotecadigital.model.Aluno;
import br.com.belval.bibliotecadigital.model.Livro;
import br.com.belval.bibliotecadigital.repository.AlunoRepository;
import br.com.belval.bibliotecadigital.repository.LivroRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class BibliotecadigitalApplication {

	public static void main(String[] args) {
		SpringApplication.run(BibliotecadigitalApplication.class, args);
	}

	@Bean
	public CommandLineRunner seedDados(AlunoRepository alunoRepo, LivroRepository livroRepo) {
		return args -> {
			// 1. Cria um admin padrão
			if (alunoRepo.findByRa("admin") == null) {
				Aluno admin = new Aluno();
				admin.setNome("Administrador Master");
				admin.setRa("admin");
				admin.setSenha("admin123");
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
				aluno.setSenha("123456");
				aluno.setPerfil("ALUNO");
				aluno.setEmail("gui@email.com");
				alunoRepo.save(aluno);
				System.out.println(">>> [SEED] Aluno de teste criado: RA 'aluno1' / Senha '123456'");
			}

			// 3. Cria alguns Livros se o banco estiver vazio
			if (livroRepo.count() == 0) {
				String[][] livrosIniciais = {
					{"Dom Casmurro", "Machado de Assis", "1899", "978-85"},
					{"O Pequeno Príncipe", "Antoine de Saint-Exupéry", "1943", "978-10"},
					{"1984", "George Orwell", "1949", "978-20"},
					{"O Cortiço", "Aluísio Azevedo", "1890", "978-30"},
					{"Harry Potter e a Pedra Filosofal", "J.K. Rowling", "1997", "978-40"}
				};

				for (String[] l : livrosIniciais) {
					Livro novo = new Livro();
					novo.setTitulo(l[0]);
					novo.setAutor(l[1]);
					novo.setAnoPublicacao(Integer.parseInt(l[2]));
					novo.setIsbn(l[3]);
					novo.setDisponivel(true);
					livroRepo.save(novo);
				}
				System.out.println(">>> [SEED] 5 Livros iniciais cadastrados com sucesso!");
			}
		};
	}
}
