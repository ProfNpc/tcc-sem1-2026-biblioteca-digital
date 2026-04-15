package br.com.belval.bibliotecadigital.repository;

import br.com.belval.bibliotecadigital.model.Aluno;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AlunoRepository extends JpaRepository<Aluno, Long> {
    
    // Método mágico do Spring que faz "SELECT * FROM aluno WHERE ra = ? AND senha = ?"
    Aluno findByRaAndSenha(String ra, String senha);
    
    // Busca por RA para verificações de existência
    Aluno findByRa(String ra);
}
