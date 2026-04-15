package br.com.belval.bibliotecadigital.repository;

import br.com.belval.bibliotecadigital.model.Emprestimo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmprestimoRepository extends JpaRepository<Emprestimo, Long> {
    List<Emprestimo> findByNomeAluno(String nomeAluno);
}
