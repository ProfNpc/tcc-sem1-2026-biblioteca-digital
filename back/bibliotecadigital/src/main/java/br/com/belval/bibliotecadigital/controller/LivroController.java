package br.com.belval.bibliotecadigital.controller;

import br.com.belval.bibliotecadigital.model.Livro;
import br.com.belval.bibliotecadigital.repository.LivroRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/livros")
public class LivroController {

    @Autowired
    private LivroRepository livroRepository;

    // Retorna todos os livros cadastrados
    @GetMapping
    public List<Livro> listarTodos() {
        return livroRepository.findAll();
    }

    // Salva um novo livro no banco de dados
    @PostMapping
    public ResponseEntity<Livro> adicionar(@RequestBody Livro livro) {
        // Salva o livro e recebe a versão dele "com ID" que acabou de ser gerado pelo MySQL
        Livro livroSalvo = livroRepository.save(livro);
        
        // Retorna o livro com o código 201 (Created)
        return ResponseEntity.status(HttpStatus.CREATED).body(livroSalvo);
    }
}
