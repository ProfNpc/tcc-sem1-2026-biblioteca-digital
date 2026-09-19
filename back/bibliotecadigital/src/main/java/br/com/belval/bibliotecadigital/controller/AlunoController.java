package br.com.belval.bibliotecadigital.controller;

import br.com.belval.bibliotecadigital.model.Aluno;
import br.com.belval.bibliotecadigital.repository.AlunoRepository;
import br.com.belval.bibliotecadigital.security.AuthTokenService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "http://localhost:5500", "http://127.0.0.1:5500", "null"})
@RestController
@RequestMapping("/api/alunos")
public class AlunoController {

    private final AlunoRepository alunoRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthTokenService authTokenService;

    public AlunoController(AlunoRepository alunoRepository, PasswordEncoder passwordEncoder, AuthTokenService authTokenService) {
        this.alunoRepository = alunoRepository;
        this.passwordEncoder = passwordEncoder;
        this.authTokenService = authTokenService;
    }

    // C R U D - Retorna todos os alunos (READ - listar)
    @GetMapping
    public List<Aluno> listarTodos() {
        return alunoRepository.findAll();
    }

    // C R U D - Busca aluno por ID (READ - individual)
    @GetMapping("/{id}")
    public ResponseEntity<Aluno> buscarPorId(@PathVariable Long id) {
        return alunoRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // C R U D - Cadastra novo aluno (CREATE)
    @PostMapping
    public ResponseEntity<?> adicionar(@RequestBody Aluno aluno) {
        if (aluno.getRa() != null) aluno.setRa(aluno.getRa().trim());
        if (aluno.getSenha() != null) aluno.setSenha(aluno.getSenha().trim());

        // Regra de Negócio: não pode cadastrar um usuário (RA) já existente
        if (aluno.getRa() == null || aluno.getRa().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Informe um usuário (RA).");
        }
        if (alunoRepository.findByRa(aluno.getRa()) != null) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Este usuário já está em uso. Escolha outro RA/usuário.");
        }

        aluno.setPerfil("ALUNO");
        aluno.setSenha(passwordEncoder.encode(aluno.getSenha())); // nunca salva senha em texto puro
        Aluno alunoSalvo = alunoRepository.save(aluno);
        alunoSalvo.setToken(authTokenService.gerarToken(alunoSalvo)); // já cadastra logado
        return ResponseEntity.status(HttpStatus.CREATED).body(alunoSalvo);
    }

    // C R U D - Atualiza aluno existente (UPDATE)
    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(@PathVariable Long id, @RequestBody Aluno aluno) {
        return alunoRepository.findById(id).<ResponseEntity<?>>map(existente -> {
            if (aluno.getNome() != null) existente.setNome(aluno.getNome().trim());
            if (aluno.getEmail() != null) existente.setEmail(aluno.getEmail().trim());

            // Se o RA está mudando, garante que o novo RA não pertence a outro aluno
            if (aluno.getRa() != null) {
                String novoRa = aluno.getRa().trim();
                Aluno donoDoRa = alunoRepository.findByRa(novoRa);
                if (donoDoRa != null && !donoDoRa.getId().equals(id)) {
                    return ResponseEntity.status(HttpStatus.CONFLICT)
                            .body("Este usuário já está em uso. Escolha outro RA/usuário.");
                }
                existente.setRa(novoRa);
            }

            if (aluno.getSenha() != null && !aluno.getSenha().isEmpty()) {
                existente.setSenha(passwordEncoder.encode(aluno.getSenha().trim())); // hash também na troca de senha
            }
            if (aluno.getUnidade() != null) existente.setUnidade(aluno.getUnidade().trim());
            // Preserva o perfil atual; só muda se vier explicitamente
            if (aluno.getPerfil() != null) existente.setPerfil(aluno.getPerfil());
            return ResponseEntity.ok(alunoRepository.save(existente));
        }).orElse(ResponseEntity.notFound().build());
    }

    // C R U D - Remove aluno (DELETE)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> excluir(@PathVariable Long id) {
        if (alunoRepository.existsById(id)) {
            alunoRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    // LOGIN - Valida RA e Senha (comparando o hash, nunca a senha crua)
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Aluno dadosLogin) {
        String raInput = (dadosLogin.getRa() != null) ? dadosLogin.getRa().trim() : "";
        String senhaInput = (dadosLogin.getSenha() != null) ? dadosLogin.getSenha().trim() : "";

        Aluno alunoEncontrado = alunoRepository.findByRa(raInput);

        if (alunoEncontrado != null && passwordEncoder.matches(senhaInput, alunoEncontrado.getSenha())) {
            alunoEncontrado.setToken(authTokenService.gerarToken(alunoEncontrado));
            return ResponseEntity.ok(alunoEncontrado);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("RA ou Senha inválidos.");
        }
    }

    // LOGOUT - Derruba o token atual (o header já foi validado pelo AuthFilter pra chegar até aqui)
    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader(value = "Authorization", required = false) String header) {
        String token = (header != null && header.startsWith("Bearer ")) ? header.substring(7) : null;
        authTokenService.invalidar(token);
        return ResponseEntity.ok().build();
    }
}
