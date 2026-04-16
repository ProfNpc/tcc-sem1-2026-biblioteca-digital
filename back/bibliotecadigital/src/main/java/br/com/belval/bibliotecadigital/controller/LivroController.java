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

    // Salva um novo livro no banco de dados
    @PostMapping
    public ResponseEntity<Livro> adicionar(@RequestBody Livro livro) {
        // Salva o livro e recebe a versão dele "com ID" que acabou de ser gerado pelo
        // MySQL
        Livro livroSalvo = livroRepository.save(livro);

        // Retorna o livro com o código 201 (Created)
        return ResponseEntity.status(HttpStatus.CREATED).body(livroSalvo);
    }
}
