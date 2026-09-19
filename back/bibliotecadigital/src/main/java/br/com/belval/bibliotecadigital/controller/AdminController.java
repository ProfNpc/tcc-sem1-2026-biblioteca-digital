package br.com.belval.bibliotecadigital.controller;

import br.com.belval.bibliotecadigital.repository.AlunoRepository;
import br.com.belval.bibliotecadigital.repository.EmprestimoRepository;
import br.com.belval.bibliotecadigital.repository.LivroRepository;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:3000", "http://localhost:5500", "http://127.0.0.1:5500", "null" })
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final LivroRepository livroRepository;
    private final AlunoRepository alunoRepository;
    private final EmprestimoRepository emprestimoRepository;

    public AdminController(LivroRepository livroRepository, AlunoRepository alunoRepository, EmprestimoRepository emprestimoRepository) {
        this.livroRepository = livroRepository;
        this.alunoRepository = alunoRepository;
        this.emprestimoRepository = emprestimoRepository;
    }

    @GetMapping("/stats")
    public Map<String, Long> getStats() {
        Map<String, Long> stats = new HashMap<>();
        
        stats.put("totalLivros", (long) livroRepository.findAll().stream().filter(l -> !Boolean.FALSE.equals(l.getAtivo())).count());
        stats.put("totalAlunos", alunoRepository.count());
        stats.put("totalEmprestimos", emprestimoRepository.findByStatusNot("DEVOLVIDO").stream().filter(e -> !"CANCELADO".equals(e.getStatus())).count());
        
        // Contagem de livros disponíveis
        long disponiveis = livroRepository.findAll().stream()
                .filter(l -> !Boolean.FALSE.equals(l.getAtivo()))
                .mapToLong(l -> l.getQuantidadeDisponivel() != null ? l.getQuantidadeDisponivel() : 0)
                .sum();
        stats.put("totalDisponiveis", disponiveis);

        return stats;
    }
}
