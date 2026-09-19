package br.com.belval.bibliotecadigital.repository;

import br.com.belval.bibliotecadigital.model.Aluno;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AlunoRepository extends JpaRepository<Aluno, Long> {

    // Busca só por RA (usada no login - a senha agora é comparada via hash - e nas checagens de duplicidade)
    Aluno findByRa(String ra);
}
