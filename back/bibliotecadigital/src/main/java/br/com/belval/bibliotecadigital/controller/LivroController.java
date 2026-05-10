package br.com.belval.bibliotecadigital.controller;

import br.com.belval.bibliotecadigital.model.Livro;
import br.com.belval.bibliotecadigital.repository.LivroRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "http://localhost:5500", "http://127.0.0.1:5500", "null"})
@RestController
@RequestMapping("/api/livros")
public class LivroController {

    private final LivroRepository livroRepository;

    public LivroController(LivroRepository livroRepository) {
        this.livroRepository = livroRepository;
    }

    // Retorna todos os livros cadastrados
    @GetMapping
    public List<Livro> listarTodos() {
        return livroRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Livro> buscarPorId(@PathVariable Long id) {
        return livroRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Salva um novo livro no banco de dados
    @PostMapping
    public ResponseEntity<Livro> adicionar(@RequestBody Livro livro) {
        Livro livroSalvo = livroRepository.save(livro);
        return ResponseEntity.status(HttpStatus.CREATED).body(livroSalvo);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Livro> atualizar(@PathVariable Long id, @RequestBody Livro livro) {
        return livroRepository.findById(id).map(existente -> {
            existente.setTitulo(livro.getTitulo());
            existente.setAutor(livro.getAutor());
            existente.setAnoPublicacao(livro.getAnoPublicacao());
            existente.setIsbn(livro.getIsbn());
            // Mantém a disponibilidade atual ou atualiza se vier no corpo
            if (livro.getDisponivel() != null) existente.setDisponivel(livro.getDisponivel());
            
            Livro salvo = livroRepository.save(existente);
            return ResponseEntity.ok(salvo);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> excluir(@PathVariable Long id) {
        if (livroRepository.existsById(id)) {
            livroRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
