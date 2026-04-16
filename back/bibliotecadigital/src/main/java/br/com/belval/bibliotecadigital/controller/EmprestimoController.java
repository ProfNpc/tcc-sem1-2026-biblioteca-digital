package br.com.belval.bibliotecadigital.controller;

import br.com.belval.bibliotecadigital.model.Emprestimo;
import br.com.belval.bibliotecadigital.repository.EmprestimoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:3000", "http://localhost:5500", "http://127.0.0.1:5500", "null" })
@RestController
@RequestMapping("/api/emprestimos")
public class EmprestimoController {

    private final EmprestimoRepository emprestimoRepository;

    public EmprestimoController(EmprestimoRepository emprestimoRepository) {
        this.emprestimoRepository = emprestimoRepository;
    }

    @GetMapping("/aluno/{nome}")
    public List<Emprestimo> listarPorAluno(@PathVariable String nome) {
        // Encontra tudo o que o front-end pedir usando o Nome que está na sessão local
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

        // Data atual do servidor na hora exata do clique
        emprestimo.setDataReserva(LocalDate.now());

        // Data Limite Oficial: 7 dias adiante!
        emprestimo.setDataDevolucao(LocalDate.now().plusDays(7));

        emprestimo.setStatus("EM_DIA");

        Emprestimo emprestimoSalvo = emprestimoRepository.save(emprestimo);
        return ResponseEntity.status(HttpStatus.CREATED).body(emprestimoSalvo);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> cancelarReserva(@PathVariable Long id) {
        if (emprestimoRepository.existsById(id)) {
            emprestimoRepository.deleteById(id);
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
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
}
