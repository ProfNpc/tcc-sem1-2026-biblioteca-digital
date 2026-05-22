package br.com.belval.bibliotecadigital.repository;

import br.com.belval.bibliotecadigital.model.Aluno;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AlunoRepository extends JpaRepository<Aluno, Long> {

    // Busca por RA e Senha (método padrão Spring Data - funciona com H2)
    Aluno findByRaAndSenha(String ra, String senha);

    // Busca só por RA (para verificar duplicidade no seed)
    Aluno findByRa(String ra);
}
