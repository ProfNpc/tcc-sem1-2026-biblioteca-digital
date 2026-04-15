package br.com.belval.bibliotecadigital.controller;

import br.com.belval.bibliotecadigital.model.Aluno;
import br.com.belval.bibliotecadigital.repository.AlunoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/alunos")
public class AlunoController {

    @Autowired
    private AlunoRepository alunoRepository;

    // Retorna todos os alunos cadastrados
    @GetMapping
    public List<Aluno> listarTodos() {
        return alunoRepository.findAll();
    }

    // Funcionalidade para cadastrar um novo aluno
    @PostMapping
    public ResponseEntity<Aluno> adicionar(@RequestBody Aluno aluno) {
        // Por segurança, força que todo cadastro novo seja 'ALUNO'
        aluno.setPerfil("ALUNO");
        Aluno alunoSalvo = alunoRepository.save(aluno);
        return ResponseEntity.status(HttpStatus.CREATED).body(alunoSalvo);
    }

    // Funcionalidade Mágica de LOGIN (Valida RA e Senha)
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Aluno dadosLogin) {
        // Envia o RA e a Senha recebidos pro banco pesquisar se existe alguém assim
        Aluno alunoEncontrado = alunoRepository.findByRaAndSenha(dadosLogin.getRa(), dadosLogin.getSenha());
        
        if (alunoEncontrado != null) {
            // Se encontrou, devolve o aluno aprovado (status 200 OK)
            return ResponseEntity.ok(alunoEncontrado);
        } else {
            // Se não, devolve um Erro 401 (Não autorizado)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("RA ou Senha inválidos.");
        }
    }
}
