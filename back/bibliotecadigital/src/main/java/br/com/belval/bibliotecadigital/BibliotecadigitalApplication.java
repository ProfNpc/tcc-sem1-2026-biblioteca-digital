package br.com.belval.bibliotecadigital;

import br.com.belval.bibliotecadigital.model.Aluno;
import br.com.belval.bibliotecadigital.repository.AlunoRepository;
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
	public CommandLineRunner seedAdmin(AlunoRepository repository) {
		return args -> {
			// Cria um admin padrão se não houver nenhum com esse RA no banco
			if (repository.findByRa("admin") == null) {
				Aluno admin = new Aluno();
				admin.setNome("Administrador Master");
				admin.setRa("admin");
				admin.setSenha("admin123");
				admin.setPerfil("ADMIN");
				admin.setEmail("admin@bibliotech.com");
				
				repository.save(admin);
				System.out.println(">>> [SEED] Usuário ADMIN criado: RA 'admin' / Senha 'admin123'");
			}
		};
	}
}
