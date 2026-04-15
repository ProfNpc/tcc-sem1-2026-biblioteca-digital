package br.com.belval.bibliotecadigital.repository;

import br.com.belval.bibliotecadigital.model.Livro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LivroRepository extends JpaRepository<Livro, Long> {
    
}
