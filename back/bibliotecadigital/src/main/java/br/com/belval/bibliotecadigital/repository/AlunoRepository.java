package br.com.belval.bibliotecadigital.repository;

import br.com.belval.bibliotecadigital.model.Aluno;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface AlunoRepository extends JpaRepository<Aluno, Long> {
    
    // Método original (sensível a espaços em branco no banco)
    Aluno findByRaAndSenha(String ra, String senha);
    
    // NOVO MÉTODO: Robusto contra padding do SQL Server (NCHAR/CHAR)
    @Query("SELECT a FROM Aluno a WHERE TRIM(a.ra) = :ra AND TRIM(a.senha) = :senha")
    Aluno findByRaAndSenhaComTrim(@Param("ra") String ra, @Param("senha") String senha);
    
    // Busca por RA para verificações de existência
    Aluno findByRa(String ra);
}
