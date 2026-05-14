package br.com.belval.bibliotecadigital.repository;

import java.util.Optional;
import br.com.belval.bibliotecadigital.model.Livro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LivroRepository extends JpaRepository<Livro, Long> {
    Optional<Livro> findByTitulo(String titulo);
}
