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

    // Lista só os livros ATIVOS (exclusão lógica).
    // Se "unidade" for informado, retorna só os livros daquela unidade
    // (usado no catálogo do aluno, pra evitar reservar livro que não existe no seu polo).
    @GetMapping
    public List<Livro> listarTodos(@RequestParam(required = false) String unidade) {
        if (unidade != null && !unidade.isBlank()) {
            return livroRepository.findByAtivoTrueAndUnidade(unidade);
        }
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
    public ResponseEntity<?> adicionar(@RequestBody Livro livro) {
        if (livro.getTitulo() == null || livro.getTitulo().trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Informe o título do livro.");
        }
        livro.setTitulo(livro.getTitulo().trim());

        // Regra de Negócio: não pode cadastrar dois livros com o mesmo título
        if (livroRepository.findByTituloIgnoreCaseAndAtivoTrue(livro.getTitulo()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Já existe um livro cadastrado com este título.");
        }

        livro.setAtivo(true);

        // Quantidade de exemplares: se não vier informada, assume 1
        int total = (livro.getQuantidadeTotal() != null && livro.getQuantidadeTotal() > 0) ? livro.getQuantidadeTotal() : 1;
        livro.setQuantidadeTotal(total);
        livro.setQuantidadeDisponivel(total); // livro novo começa com todos os exemplares disponíveis

        return ResponseEntity.status(HttpStatus.CREATED).body(livroRepository.save(livro));
    }

    // Atualiza livro (sem imagem)
    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(@PathVariable Long id, @RequestBody Livro livro) {
        return livroRepository.findById(id).<ResponseEntity<?>>map(existente -> {
            if (livro.getTitulo() != null) {
                String novoTitulo = livro.getTitulo().trim();
                // Se o título está mudando, garante que não colide com outro livro ativo
                if (!novoTitulo.equalsIgnoreCase(existente.getTitulo())) {
                    boolean colide = livroRepository.findByTituloIgnoreCaseAndAtivoTrue(novoTitulo)
                            .filter(l -> !l.getId().equals(id))
                            .isPresent();
                    if (colide) {
                        return ResponseEntity.status(HttpStatus.CONFLICT)
                                .body("Já existe um livro cadastrado com este título.");
                    }
                }
                existente.setTitulo(novoTitulo);
            }
            existente.setAutor(livro.getAutor());
            existente.setAnoPublicacao(livro.getAnoPublicacao());
            existente.setIsbn(livro.getIsbn());
            if (livro.getUnidade() != null) existente.setUnidade(livro.getUnidade());

            // Ajuste de estoque: se o total mudar, aplica a mesma diferença no disponível
            // (ex: tinha 3 no total e 1 disponível/2 emprestados; se o total sobe pra 5, disponível vira 3)
            if (livro.getQuantidadeTotal() != null && !livro.getQuantidadeTotal().equals(existente.getQuantidadeTotal())) {
                int totalAntigo = existente.getQuantidadeTotal() != null ? existente.getQuantidadeTotal() : 0;
                int disponivelAntigo = existente.getQuantidadeDisponivel() != null ? existente.getQuantidadeDisponivel() : 0;
                int novoTotal = Math.max(0, livro.getQuantidadeTotal());
                int diferenca = novoTotal - totalAntigo;
                int novoDisponivel = Math.max(0, Math.min(novoTotal, disponivelAntigo + diferenca));
                existente.setQuantidadeTotal(novoTotal);
                existente.setQuantidadeDisponivel(novoDisponivel);
            }

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
