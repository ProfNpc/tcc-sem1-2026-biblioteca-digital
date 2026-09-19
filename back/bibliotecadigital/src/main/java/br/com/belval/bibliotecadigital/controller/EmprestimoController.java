package br.com.belval.bibliotecadigital.controller;

import br.com.belval.bibliotecadigital.model.Emprestimo;
import br.com.belval.bibliotecadigital.repository.EmprestimoRepository;
import br.com.belval.bibliotecadigital.repository.LivroRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:3000", "http://localhost:5500", "http://127.0.0.1:5500", "null" })
@RestController
@RequestMapping("/api/emprestimos")
public class EmprestimoController {

    private final EmprestimoRepository emprestimoRepository;
    private final LivroRepository livroRepository;

    public EmprestimoController(EmprestimoRepository emprestimoRepository, LivroRepository livroRepository) {
        this.emprestimoRepository = emprestimoRepository;
        this.livroRepository = livroRepository;
    }

    @GetMapping("/aluno/{nome}")
    public List<Emprestimo> listarPorAluno(@PathVariable String nome) {
        return emprestimoRepository.findByNomeAluno(nome).stream()
                .filter(e -> !"DEVOLVIDO".equals(e.getStatus()) && !"CANCELADO".equals(e.getStatus()))
                .collect(Collectors.toList());
    }

    @GetMapping("/aluno/{nome}/historico")
    public List<Emprestimo> historicoPorAluno(@PathVariable String nome) {
        return emprestimoRepository.findByNomeAluno(nome).stream()
                .filter(e -> "DEVOLVIDO".equals(e.getStatus()) || "CANCELADO".equals(e.getStatus()))
                .collect(Collectors.toList());
    }

    @PostMapping
    public ResponseEntity<?> registrarReserva(@RequestBody Emprestimo emprestimo) {
        // Regra de Negócio: Limite de 3 livros por aluno
        List<Emprestimo> reservasAtuais = emprestimoRepository.findByNomeAluno(emprestimo.getNomeAluno());
        if (reservasAtuais.size() >= 3) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Limite de 3 reservas atingido. Devolva um livro para liberar espaço.");
        }

        // Regra de Negócio: não pode reservar o mesmo livro duas vezes
        boolean jaReservou = reservasAtuais.stream()
                .anyMatch(r -> r.getTituloLivro() != null && r.getTituloLivro().equalsIgnoreCase(emprestimo.getTituloLivro()));
        if (jaReservou) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Você já possui uma reserva ativa deste livro.");
        }

        // Regra de Negócio: só reserva se existir exemplar disponível no estoque
        var livroOpt = livroRepository.findByTitulo(emprestimo.getTituloLivro());
        if (livroOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Livro não encontrado.");
        }
        var livro = livroOpt.get();
        if (livro.getQuantidadeDisponivel() == null || livro.getQuantidadeDisponivel() <= 0) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Não há exemplares disponíveis deste livro no momento.");
        }

        // Baixa 1 exemplar do estoque
        livro.setQuantidadeDisponivel(livro.getQuantidadeDisponivel() - 1);
        livroRepository.save(livro);

        // A retirada é sempre na unidade onde o exemplar está fisicamente (não é mais escolha livre do aluno)
        emprestimo.setPoloRetirada(livro.getUnidade());
        emprestimo.setDataReserva(LocalDate.now());
        emprestimo.setDataDevolucao(LocalDate.now().plusDays(7));
        emprestimo.setStatus("EM_DIA");

        Emprestimo emprestimoSalvo = emprestimoRepository.save(emprestimo);
        return ResponseEntity.status(HttpStatus.CREATED).body(emprestimoSalvo);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> cancelarReserva(@PathVariable Long id) {
        return emprestimoRepository.findById(id).map(emp -> {
            // Devolve o exemplar ao estoque
            livroRepository.findByTitulo(emp.getTituloLivro()).ifPresent(livro -> {
                int total = livro.getQuantidadeTotal() != null ? livro.getQuantidadeTotal() : 1;
                int disponivelAtual = livro.getQuantidadeDisponivel() != null ? livro.getQuantidadeDisponivel() : 0;
                livro.setQuantidadeDisponivel(Math.min(total, disponivelAtual + 1));
                livroRepository.save(livro);
            });
            emp.setStatus("CANCELADO");
            emp.setDataDevolucaoReal(LocalDate.now());
            emprestimoRepository.save(emp);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/todos")
    public List<Emprestimo> listarTodos() {
        return emprestimoRepository.findByStatusNot("DEVOLVIDO").stream()
                .filter(e -> !"CANCELADO".equals(e.getStatus()))
                .collect(Collectors.toList());
    }

    // Histórico: mantém devolvidos e cancelados para consulta administrativa.
    @GetMapping("/historico")
    public List<Emprestimo> listarHistorico() {
        return emprestimoRepository.findAll().stream()
                .filter(e -> "DEVOLVIDO".equals(e.getStatus()) || "CANCELADO".equals(e.getStatus()))
                .collect(Collectors.toList());
    }

    @PostMapping("/{id}/entregar")
    public ResponseEntity<?> confirmarEntrega(@PathVariable Long id) {
        return emprestimoRepository.findById(id).map(emp -> {
            emp.setStatus("RETIRADO");
            emprestimoRepository.save(emp);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/devolver")
    public ResponseEntity<?> confirmarDevolucao(@PathVariable Long id) {
        return emprestimoRepository.findById(id).map(emp -> {
            // Devolve o exemplar ao estoque (antes isso nunca acontecia: o livro "sumia" do sistema)
            livroRepository.findByTitulo(emp.getTituloLivro()).ifPresent(livro -> {
                int total = livro.getQuantidadeTotal() != null ? livro.getQuantidadeTotal() : 1;
                int disponivelAtual = livro.getQuantidadeDisponivel() != null ? livro.getQuantidadeDisponivel() : 0;
                livro.setQuantidadeDisponivel(Math.min(total, disponivelAtual + 1));
                livroRepository.save(livro);
            });
            // Mantém o registro no banco para formar o histórico de empréstimos.
            emp.setStatus("DEVOLVIDO");
            emp.setDataDevolucaoReal(LocalDate.now());
            emprestimoRepository.save(emp);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }

    // --- NOVOS ENDPOINTS DE GESTÃO DE ESTOQUE POR POLO ---

    @GetMapping("/stats/estoque-polos")
    public Map<String, Map<String, Long>> getEstoquePorPolos() {
        List<Emprestimo> todos = emprestimoRepository.findAll();
        
        // Estrutura: { "Dom Casmurro": { "ITB X": 3, "ITB Y": 5 } }
        Map<String, Map<String, Long>> stats = new HashMap<>();

        for (Emprestimo e : todos) {
            stats.computeIfAbsent(e.getTituloLivro(), k -> new HashMap<>())
                 .merge(e.getPoloRetirada(), 1L, Long::sum);
        }
        return stats;
    }

    @GetMapping("/disponibilidade/{titulo}")
    public Map<String, Long> getDisponibilidadeLivro(@PathVariable String titulo) {
        List<Emprestimo> reservas = emprestimoRepository.findAll().stream()
                .filter(e -> e.getTituloLivro().equalsIgnoreCase(titulo))
                .collect(Collectors.toList());

        Map<String, Long> poloCounts = new HashMap<>();
        for (Emprestimo e : reservas) {
            poloCounts.merge(e.getPoloRetirada(), 1L, Long::sum);
        }
        return poloCounts;
    }
}
