package br.com.belval.bibliotecadigital.controller;

import br.com.belval.bibliotecadigital.model.Aluno;
import br.com.belval.bibliotecadigital.repository.AlunoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "http://localhost:5500", "http://127.0.0.1:5500", "null"})
@RestController
@RequestMapping("/api/alunos")
public class AlunoController {

    private final AlunoRepository alunoRepository;

    public AlunoController(AlunoRepository alunoRepository) {
        this.alunoRepository = alunoRepository;
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
    public ResponseEntity<Aluno> adicionar(@RequestBody Aluno aluno) {
        if (aluno.getRa() != null) aluno.setRa(aluno.getRa().trim());
        if (aluno.getSenha() != null) aluno.setSenha(aluno.getSenha().trim());
        aluno.setPerfil("ALUNO");
        Aluno alunoSalvo = alunoRepository.save(aluno);
        return ResponseEntity.status(HttpStatus.CREATED).body(alunoSalvo);
    }

    // C R U D - Atualiza aluno existente (UPDATE)
    @PutMapping("/{id}")
    public ResponseEntity<Aluno> atualizar(@PathVariable Long id, @RequestBody Aluno aluno) {
        return alunoRepository.findById(id).map(existente -> {
            if (aluno.getNome() != null) existente.setNome(aluno.getNome().trim());
            if (aluno.getEmail() != null) existente.setEmail(aluno.getEmail().trim());
            if (aluno.getRa() != null) existente.setRa(aluno.getRa().trim());
            if (aluno.getSenha() != null) existente.setSenha(aluno.getSenha().trim());
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

    // LOGIN - Valida RA e Senha
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Aluno dadosLogin) {
        String raInput = (dadosLogin.getRa() != null) ? dadosLogin.getRa().trim() : "";
        String senhaInput = (dadosLogin.getSenha() != null) ? dadosLogin.getSenha().trim() : "";

        System.out.println("DEBUG LOGIN: Tentativa de acesso para RA [" + raInput + "]");

        // Busca direta por RA e Senha (H2 não precisa do TRIM do banco)
        Aluno alunoEncontrado = alunoRepository.findByRaAndSenha(raInput, senhaInput);

        if (alunoEncontrado != null) {
            System.out.println("DEBUG LOGIN: Sucesso para o Aluno [" + alunoEncontrado.getNome() + "]");
            return ResponseEntity.ok(alunoEncontrado);
        } else {
            System.out.println("DEBUG LOGIN: Falha - RA ou Senha não conferem.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("RA ou Senha inválidos.");
        }
    }
}
