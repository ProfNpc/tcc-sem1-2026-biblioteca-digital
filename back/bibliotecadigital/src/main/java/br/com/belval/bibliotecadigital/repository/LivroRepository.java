package br.com.belval.bibliotecadigital.repository;

import br.com.belval.bibliotecadigital.model.Livro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LivroRepository extends JpaRepository<Livro, Long> {

    // Retorna só os livros não excluídos (exclusão lógica)
    List<Livro> findByAtivoTrue();

    // Retorna só os livros ativos de uma determinada unidade (catálogo filtrado por polo)
    List<Livro> findByAtivoTrueAndUnidade(String unidade);

    // Usado pelo EmprestimoController para buscar livro pelo título
    Optional<Livro> findByTitulo(String titulo);

    // Usado para checar duplicidade de título ao cadastrar (ignora maiúsc/minúsc, só entre os ativos)
    Optional<Livro> findByTituloIgnoreCaseAndAtivoTrue(String titulo);

    Optional<Livro> findByTituloIgnoreCase(String titulo);

    // SQL Server: quando a tabela fica vazia, o próximo livro volta a receber ID 1.
    @Modifying
    @Query(value = "DBCC CHECKIDENT ('livro', RESEED, 0)", nativeQuery = true)
    void resetarIdentidade();

    // Limpa registros da antiga exclusão lógica, para não sobrarem "fantasmas"
    // no banco depois da migração para exclusão física.
    @Modifying
    @Query("delete from Livro l where l.ativo = false")
    void excluirLivrosInativos();
}
