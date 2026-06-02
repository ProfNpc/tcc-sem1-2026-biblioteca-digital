package br.com.belval.bibliotecadigital.controller;

import br.com.belval.bibliotecadigital.model.Livro;
import br.com.belval.bibliotecadigital.repository.LivroRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;

@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "http://localhost:5500", "http://127.0.0.1:5500", "null"})
@RestController
@RequestMapping("/api/livros")
public class LivroController {

    private final LivroRepository livroRepository;

    // Pasta onde as imagens ficam salvas (dentro do projeto, pasta uploads)
    private static final String UPLOAD_DIR = "uploads/capas/";

    public LivroController(LivroRepository livroRepository) {
        this.livroRepository = livroRepository;
        // Cria a pasta se não existir
        new File(UPLOAD_DIR).mkdirs();
    }

    // Lista só os livros ATIVOS (exclusão lógica)
    @GetMapping
    public List<Livro> listarTodos() {
        return livroRepository.findByAtivoTrue();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Livro> buscarPorId(@PathVariable Long id) {
        return livroRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Cadastra novo livro (sem imagem - JSON normal)
    @PostMapping
    public ResponseEntity<Livro> adicionar(@RequestBody Livro livro) {
        livro.setAtivo(true);
        return ResponseEntity.status(HttpStatus.CREATED).body(livroRepository.save(livro));
    }

    // Atualiza livro (sem imagem)
    @PutMapping("/{id}")
    public ResponseEntity<Livro> atualizar(@PathVariable Long id, @RequestBody Livro livro) {
        return livroRepository.findById(id).map(existente -> {
            existente.setTitulo(livro.getTitulo());
            existente.setAutor(livro.getAutor());
            existente.setAnoPublicacao(livro.getAnoPublicacao());
            existente.setIsbn(livro.getIsbn());
            if (livro.getDisponivel() != null) existente.setDisponivel(livro.getDisponivel());
            return ResponseEntity.ok(livroRepository.save(existente));
        }).orElse(ResponseEntity.notFound().build());
    }

    // EXCLUSÃO LÓGICA: só marca ativo = false, não apaga do banco
    @DeleteMapping("/{id}")
    public ResponseEntity<?> excluir(@PathVariable Long id) {
        return livroRepository.findById(id).map(livro -> {
            livro.setAtivo(false);
            livroRepository.save(livro);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }

    // UPLOAD DE IMAGEM: recebe o arquivo e salva no servidor
    @PostMapping("/{id}/imagem")
    public ResponseEntity<?> uploadImagem(@PathVariable Long id,
                                          @RequestParam("arquivo") MultipartFile arquivo) {
        return livroRepository.findById(id).map(livro -> {
            try {
                // Gera nome único para o arquivo
                String ext = arquivo.getOriginalFilename() != null
                        ? arquivo.getOriginalFilename().substring(arquivo.getOriginalFilename().lastIndexOf('.'))
                        : ".jpg";
                String nomeArquivo = UUID.randomUUID().toString() + ext;

                Path destino = Paths.get(UPLOAD_DIR + nomeArquivo);
                Files.copy(arquivo.getInputStream(), destino, StandardCopyOption.REPLACE_EXISTING);

                // Apaga imagem antiga se existir
                if (livro.getImagemCapa() != null) {
                    try { Files.deleteIfExists(Paths.get(UPLOAD_DIR + livro.getImagemCapa())); } catch (Exception ignored) {}
                }

                livro.setImagemCapa(nomeArquivo);
                livroRepository.save(livro);

                return ResponseEntity.ok().body("{\"imagem\":\"" + nomeArquivo + "\"}");
            } catch (IOException e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("{\"erro\":\"Falha ao salvar imagem\"}");
            }
        }).orElse(ResponseEntity.notFound().build());
    }
}
