package br.com.belval.bibliotecadigital.model;

import java.util.Objects;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Transient;

@Entity
public class Aluno {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;
    
    private String ra;
    
    private String email;

    // Senha do aluno para login no sistema
    private String senha;

    // Perfil do usuário: ALUNO ou ADMIN
    private String perfil;

    // Unidade (polo/ITB) em que o aluno estuda - define quais livros ele pode ver/reservar
    private String unidade;

    // Token de sessão (não fica salvo no banco): só existe pra viajar na resposta do login
    @Transient
    private String token;

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    // Construtor vazio essencial para o banco de dados funcionar
    public Aluno() {
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getRa() {
        return ra;
    }

    public void setRa(String ra) {
        this.ra = ra;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    // WRITE_ONLY: a senha pode vir no corpo da requisição (cadastro/login),
    // mas NUNCA é incluída de volta no JSON de resposta - antes disso, o
    // hash da senha de todo mundo aparecia em qualquer chamada que devolvesse um Aluno.
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    public String getSenha() {
        return senha;
    }

    public void setSenha(String senha) {
        this.senha = senha;
    }

    public String getPerfil() {
        return perfil;
    }

    public void setPerfil(String perfil) {
        this.perfil = perfil;
        
    }

    public String getUnidade() {
        return unidade;
    }

    public void setUnidade(String unidade) {
        this.unidade = unidade;
    }

	@Override
	public int hashCode() {
		return Objects.hash(id);
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		Aluno other = (Aluno) obj;
		return Objects.equals(id, other.id);
	}

	@Override
	public String toString() {
		return "Aluno [id=" + id + ", nome=" + nome + ", ra=" + ra + ", email=" + email
				+ ", perfil=" + perfil + ", unidade=" + unidade + "]";
	}
}

