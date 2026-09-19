package br.com.belval.bibliotecadigital.security;

import br.com.belval.bibliotecadigital.model.Aluno;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

// Controla os tokens de sessão (gerados no login, exigidos pelo AuthFilter).
//
// OBS: guardado em memória (some se o backend reiniciar, e não funciona se um
// dia o sistema rodar em mais de uma instância ao mesmo tempo). Para um TCC
// isso é suficiente; em produção o ideal seria JWT assinado ou sessão no banco/Redis.
@Service
public class AuthTokenService {

    private final Map<String, TokenInfo> tokens = new ConcurrentHashMap<>();

    public String gerarToken(Aluno aluno) {
        String token = UUID.randomUUID().toString();
        tokens.put(token, new TokenInfo(aluno.getId(), aluno.getNome(), aluno.getPerfil()));
        return token;
    }

    public TokenInfo validar(String token) {
        if (token == null) return null;
        return tokens.get(token);
    }

    public void invalidar(String token) {
        if (token != null) tokens.remove(token);
    }
}
