package br.com.belval.bibliotecadigital.repository;

import br.com.belval.bibliotecadigital.model.Livro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LivroRepository extends JpaRepository<Livro, Long> {

    // Retorna só os livros não excluídos (exclusão lógica)
    List<Livro> findByAtivoTrue();

    // Usado pelo EmprestimoController para buscar livro pelo título
    Optional<Livro> findByTitulo(String titulo);
}
