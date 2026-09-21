package br.com.belval.bibliotecadigital.controller;

import br.com.belval.bibliotecadigital.model.Emprestimo;
import br.com.belval.bibliotecadigital.repository.EmprestimoRepository;
import br.com.belval.bibliotecadigital.repository.LivroRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
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

    private static final int DIAS_RESERVA = 1;
    private static final int DIAS_EMPRESTIMO = 7;

    private final EmprestimoRepository emprestimoRepository;
    private final LivroRepository livroRepository;

    public EmprestimoController(EmprestimoRepository emprestimoRepository, LivroRepository livroRepository) {
        this.emprestimoRepository = emprestimoRepository;
        this.livroRepository = livroRepository;
    }

    private boolean ativo(Emprestimo e) {
        return "RESERVADO".equals(e.getStatus())
                || "RETIRADO".equals(e.getStatus())
                || "EM_DIA".equals(e.getStatus()); // compatibilidade com registros antigos
    }

    /**
     * Migra registros criados pela versão anterior e expira reservas que passaram
     * do prazo de retirada. A reserva continua ocupando 1 exemplar até ser retirada
     * ou cancelada/expirada.
     */
    private void atualizarReservasVencidas() {
        LocalDate hoje = LocalDate.now();

        for (Emprestimo e : emprestimoRepository.findAll()) {
            // Versão antiga usava EM_DIA para representar uma reserva.
            if ("EM_DIA".equals(e.getStatus())) {
                e.setStatus("RESERVADO");
                if (e.getDataReserva() != null && e.getDataLimiteReserva() == null) {
                    e.setDataLimiteReserva(e.getDataReserva().plusDays(DIAS_RESERVA));
                }
                // Antes dataDevolucao era preenchida na reserva. Agora ela só existe
                // depois da retirada, quando vira prazo real do empréstimo.
                if (e.getDataRetirada() == null && e.getDataDevolucaoReal() == null) {
                    e.setDataDevolucao(null);
                }
                emprestimoRepository.save(e);
            }

            if ("RESERVADO".equals(e.getStatus())
                    && e.getDataLimiteReserva() != null
                    && hoje.isAfter(e.getDataLimiteReserva())) {
                devolverExemplarAoEstoque(e.getTituloLivro());
                e.setStatus("EXPIRADO");
                e.setDataDevolucaoReal(hoje);
                emprestimoRepository.save(e);
            }
        }
    }

    private void devolverExemplarAoEstoque(String tituloLivro) {
        if (tituloLivro == null) return;
        livroRepository.findByTitulo(tituloLivro).ifPresent(livro -> {
            int total = livro.getQuantidadeTotal() != null ? livro.getQuantidadeTotal() : 1;
            int disponivel = livro.getQuantidadeDisponivel() != null ? livro.getQuantidadeDisponivel() : 0;
            livro.setQuantidadeDisponivel(Math.min(total, disponivel + 1));
            livroRepository.save(livro);
        });
    }

    @GetMapping("/aluno/{nome}")
    @Transactional
    public List<Emprestimo> listarPorAluno(@PathVariable String nome) {
        atualizarReservasVencidas();
        return emprestimoRepository.findByNomeAluno(nome).stream()
                .filter(this::ativo)
                .collect(Collectors.toList());
    }

    @GetMapping("/aluno/{nome}/historico")
    @Transactional
    public List<Emprestimo> historicoPorAluno(@PathVariable String nome) {
        atualizarReservasVencidas();
        return emprestimoRepository.findByNomeAluno(nome).stream()
                .filter(e -> "DEVOLVIDO".equals(e.getStatus())
                        || "CANCELADO".equals(e.getStatus())
                        || "EXPIRADO".equals(e.getStatus()))
                .collect(Collectors.toList());
    }

    @PostMapping
    @Transactional
    public ResponseEntity<?> registrarReserva(@RequestBody Emprestimo emprestimo) {
        atualizarReservasVencidas();

        if (emprestimo.getNomeAluno() == null || emprestimo.getNomeAluno().isBlank()) {
            return ResponseEntity.badRequest().body("Aluno não informado.");
        }
        if (emprestimo.getTituloLivro() == null || emprestimo.getTituloLivro().isBlank()) {
            return ResponseEntity.badRequest().body("Livro não informado.");
        }

        // Limite considera somente reservas e empréstimos que ainda estão ativos.
        List<Emprestimo> reservasAtuais = emprestimoRepository.findByNomeAluno(emprestimo.getNomeAluno()).stream()
                .filter(this::ativo)
                .collect(Collectors.toList());
        if (reservasAtuais.size() >= 3) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Limite de 3 reservas/empréstimos ativos atingido. Faça uma devolução ou aguarde o encerramento de uma reserva.");
        }

        boolean jaReservou = reservasAtuais.stream()
                .anyMatch(r -> r.getTituloLivro() != null
                        && r.getTituloLivro().equalsIgnoreCase(emprestimo.getTituloLivro()));
        if (jaReservou) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Você já possui uma reserva ou empréstimo ativo deste livro.");
        }

        var livroOpt = livroRepository.findByTitulo(emprestimo.getTituloLivro());
        if (livroOpt.isEmpty() || Boolean.FALSE.equals(livroOpt.get().getAtivo())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Livro não encontrado.");
        }

        var livro = livroOpt.get();
        if (livro.getQuantidadeDisponivel() == null || livro.getQuantidadeDisponivel() <= 0) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Não há exemplares disponíveis deste livro no momento.");
        }

        // A reserva segura o exemplar para este aluno. Se ele não retirar até o prazo,
        // a rotina de expiração libera o exemplar novamente.
        livro.setQuantidadeDisponivel(livro.getQuantidadeDisponivel() - 1);
        livroRepository.save(livro);

        LocalDate hoje = LocalDate.now();
        emprestimo.setPoloRetirada(livro.getUnidade());
        emprestimo.setDataReserva(hoje);
        emprestimo.setDataLimiteReserva(hoje.plusDays(DIAS_RESERVA));
        emprestimo.setDataRetirada(null);
        emprestimo.setDataDevolucao(null);
        emprestimo.setDataDevolucaoReal(null);
        emprestimo.setStatus("RESERVADO");

        return ResponseEntity.status(HttpStatus.CREATED).body(emprestimoRepository.save(emprestimo));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> cancelarReserva(@PathVariable Long id) {
        atualizarReservasVencidas();
        return emprestimoRepository.findById(id).map(emp -> {
            if ("RESERVADO".equals(emp.getStatus())) {
                devolverExemplarAoEstoque(emp.getTituloLivro());
                emp.setStatus("CANCELADO");
                emp.setDataDevolucaoReal(null);
                emprestimoRepository.save(emp);
                return ResponseEntity.ok().build();
            }
            if ("RETIRADO".equals(emp.getStatus())) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body("Este livro já foi retirado. O empréstimo deve ser encerrado pela devolução.");
            }
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Esta reserva não está mais ativa.");
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/todos")
    @Transactional
    public List<Emprestimo> listarTodos() {
        atualizarReservasVencidas();
        return emprestimoRepository.findAll().stream()
                .filter(this::ativo)
                .collect(Collectors.toList());
    }

    @GetMapping("/historico")
    @Transactional
    public List<Emprestimo> listarHistorico() {
        atualizarReservasVencidas();
        return emprestimoRepository.findAll().stream()
                .filter(e -> "DEVOLVIDO".equals(e.getStatus())
                        || "CANCELADO".equals(e.getStatus())
                        || "EXPIRADO".equals(e.getStatus()))
                .collect(Collectors.toList());
    }

    @PostMapping("/{id}/entregar")
    @Transactional
    public ResponseEntity<?> confirmarEntrega(@PathVariable Long id) {
        atualizarReservasVencidas();
        return emprestimoRepository.findById(id).map(emp -> {
            if (!"RESERVADO".equals(emp.getStatus())) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body("Somente uma reserva ativa pode ser efetivada como empréstimo.");
            }

            LocalDate hoje = LocalDate.now();
            emp.setStatus("RETIRADO");
            emp.setDataRetirada(hoje);
            emp.setDataDevolucao(hoje.plusDays(DIAS_EMPRESTIMO));
            emp.setDataDevolucaoReal(null);
            emprestimoRepository.save(emp);
            return ResponseEntity.ok(emp);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/devolver")
    @Transactional
    public ResponseEntity<?> confirmarDevolucao(@PathVariable Long id) {
        atualizarReservasVencidas();
        return emprestimoRepository.findById(id).map(emp -> {
            if (!"RETIRADO".equals(emp.getStatus())) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body("Somente um empréstimo retirado pode ser devolvido.");
            }

            devolverExemplarAoEstoque(emp.getTituloLivro());
            emp.setStatus("DEVOLVIDO");
            emp.setDataDevolucaoReal(LocalDate.now());
            emprestimoRepository.save(emp);
            return ResponseEntity.ok(emp);
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/stats/estoque-polos")
    public Map<String, Map<String, Long>> getEstoquePorPolos() {
        List<Emprestimo> todos = emprestimoRepository.findAll();
        Map<String, Map<String, Long>> stats = new HashMap<>();

        for (Emprestimo e : todos) {
            if (e.getTituloLivro() == null || e.getPoloRetirada() == null) continue;
            stats.computeIfAbsent(e.getTituloLivro(), k -> new HashMap<>())
                    .merge(e.getPoloRetirada(), 1L, Long::sum);
        }
        return stats;
    }

    @GetMapping("/disponibilidade/{titulo}")
    public Map<String, Long> getDisponibilidadeLivro(@PathVariable String titulo) {
        List<Emprestimo> ativos = emprestimoRepository.findAll().stream()
                .filter(this::ativo)
                .filter(e -> e.getTituloLivro() != null && e.getTituloLivro().equalsIgnoreCase(titulo))
                .collect(Collectors.toList());

        Map<String, Long> poloCounts = new HashMap<>();
        for (Emprestimo e : ativos) {
            if (e.getPoloRetirada() != null) {
                poloCounts.merge(e.getPoloRetirada(), 1L, Long::sum);
            }
        }
        return poloCounts;
    }
}
