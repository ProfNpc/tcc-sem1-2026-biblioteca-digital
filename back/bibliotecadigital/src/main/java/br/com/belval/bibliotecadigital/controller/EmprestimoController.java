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
        return emprestimoRepository.findByNomeAluno(nome);
    }

    @PostMapping
    public ResponseEntity<?> registrarReserva(@RequestBody Emprestimo emprestimo) {
        // Regra de Negócio: Limite de 3 livros por aluno
        List<Emprestimo> reservasAtuais = emprestimoRepository.findByNomeAluno(emprestimo.getNomeAluno());
        if (reservasAtuais.size() >= 3) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Limite de 3 reservas atingido. Devolva um livro para liberar espaço.");
        }

        // NOVO: Regra de Negócio - Limite de 5 alunos por Polo para o mesmo livro
        long countPolo = emprestimoRepository.countByTituloLivroAndPoloRetirada(emprestimo.getTituloLivro(), emprestimo.getPoloRetirada());
        if (countPolo >= 5) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Este Polo (" + emprestimo.getPoloRetirada() + ") já atingiu o limite de 5 reservas para este livro.");
        }

        emprestimo.setDataReserva(LocalDate.now());
        emprestimo.setDataDevolucao(LocalDate.now().plusDays(7));
        emprestimo.setStatus("EM_DIA");

        Emprestimo emprestimoSalvo = emprestimoRepository.save(emprestimo);
        return ResponseEntity.status(HttpStatus.CREATED).body(emprestimoSalvo);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> cancelarReserva(@PathVariable Long id) {
        return emprestimoRepository.findById(id).map(emp -> {
            // Volta o livro para disponível
            livroRepository.findByTitulo(emp.getTituloLivro()).ifPresent(livro -> {
                livro.setDisponivel(true);
                livroRepository.save(livro);
            });
            emprestimoRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/todos")
    public List<Emprestimo> listarTodos() {
        return emprestimoRepository.findAll();
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
            // Em vez de deletar, poderíamos marcar como DEVOLVIDO 
            // Mas para o controle de polo de 5 vagas ser dinâmico, DELETAR funciona bem (libera vaga)
            emprestimoRepository.deleteById(id); 
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
