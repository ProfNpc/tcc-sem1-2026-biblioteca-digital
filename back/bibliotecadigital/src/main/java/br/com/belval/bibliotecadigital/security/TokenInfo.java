package br.com.belval.bibliotecadigital.security;

// Guarda quem é o dono de um token de sessão e qual o perfil dele
// (usado pelo AuthFilter para decidir se a rota é liberada ou não)
public record TokenInfo(Long alunoId, String nome, String perfil) {
}
