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

    // Retorna todos os alunos cadastrados
    @GetMapping
    public List<Aluno> listarTodos() {
        return alunoRepository.findAll();
    }

    // Funcionalidade para cadastrar um novo aluno
    @PostMapping
    public ResponseEntity<Aluno> adicionar(@RequestBody Aluno aluno) {
        // Sanitização preventiva de espaços
        if (aluno.getRa() != null) aluno.setRa(aluno.getRa().trim());
        if (aluno.getSenha() != null) aluno.setSenha(aluno.getSenha().trim());
        
        // Por segurança, força que todo cadastro novo seja 'ALUNO'
        aluno.setPerfil("ALUNO");
        Aluno alunoSalvo = alunoRepository.save(aluno);
        return ResponseEntity.status(HttpStatus.CREATED).body(alunoSalvo);
    }

    // Funcionalidade  de LOGIN (Valida RA e Senha)
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Aluno dadosLogin) {
        String raInput = (dadosLogin.getRa() != null) ? dadosLogin.getRa().trim() : "";
        String senhaInput = (dadosLogin.getSenha() != null) ? dadosLogin.getSenha().trim() : "";

        System.out.println("DEBUG LOGIN: Tentativa de acesso para RA [" + raInput + "]");
        
        // Busca usando a função TRIM() do banco de dados para ignorar padding
        Aluno alunoEncontrado = alunoRepository.findByRaAndSenhaComTrim(raInput, senhaInput);
        
        if (alunoEncontrado != null) {
            // "Limpa" os dados vindos do banco (caso sejam NCHAR/CHAR)
            if (alunoEncontrado.getNome() != null) alunoEncontrado.setNome(alunoEncontrado.getNome().trim());
            if (alunoEncontrado.getRa() != null) alunoEncontrado.setRa(alunoEncontrado.getRa().trim());
            if (alunoEncontrado.getPerfil() != null) alunoEncontrado.setPerfil(alunoEncontrado.getPerfil().trim());
            if (alunoEncontrado.getEmail() != null) alunoEncontrado.setEmail(alunoEncontrado.getEmail().trim());

            System.out.println("DEBUG LOGIN: Sucesso para o Aluno [" + alunoEncontrado.getNome() + "]");
            return ResponseEntity.ok(alunoEncontrado);
        } else {
            System.out.println("DEBUG LOGIN: Falha - RA ou Senha não conferem.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("RA ou Senha inválidos.");
        }
    }
}
