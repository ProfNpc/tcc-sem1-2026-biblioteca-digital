package br.com.belval.bibliotecadigital.model;

import jakarta.persistence.*;

@Entity
public class Livro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String titulo;
    private String autor;
    private Integer anoPublicacao;
    private String isbn;

    // Unidade (polo/ITB) onde o exemplar físico fica - define quem pode ver/reservar o livro
    private String unidade;

    // CONTROLE DE ESTOQUE: quantos exemplares existem no total e quantos estão livres agora
    private Integer quantidadeTotal = 1;
    private Integer quantidadeDisponivel = 1;

    // EXCLUSÃO LÓGICA: false = excluído, true = ativo
    private Boolean ativo = true;

    // UPLOAD DE IMAGEM: armazena o nome do arquivo salvo no servidor
    private String imagemCapa;

    public Livro() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public String getAutor() { return autor; }
    public void setAutor(String autor) { this.autor = autor; }
    public Integer getAnoPublicacao() { return anoPublicacao; }
    public void setAnoPublicacao(Integer anoPublicacao) { this.anoPublicacao = anoPublicacao; }
    public String getIsbn() { return isbn; }
    public void setIsbn(String isbn) { this.isbn = isbn; }

    public String getUnidade() { return unidade; }
    public void setUnidade(String unidade) { this.unidade = unidade; }

    public Integer getQuantidadeTotal() { return quantidadeTotal; }
    public void setQuantidadeTotal(Integer quantidadeTotal) { this.quantidadeTotal = quantidadeTotal; }

    public Integer getQuantidadeDisponivel() { return quantidadeDisponivel; }
    public void setQuantidadeDisponivel(Integer quantidadeDisponivel) { this.quantidadeDisponivel = quantidadeDisponivel; }

    // Campo calculado (não persiste no banco): mantém compatibilidade com o front,
    // que usa "disponivel" como booleano. Agora ele reflete o estoque de verdade,
    // em vez de ser um valor manual desconectado das reservas.
    @Transient
    public Boolean getDisponivel() {
        return quantidadeDisponivel != null && quantidadeDisponivel > 0;
    }

    public Boolean getAtivo() { return ativo; }
    public void setAtivo(Boolean ativo) { this.ativo = ativo; }
    public String getImagemCapa() { return imagemCapa; }
    public void setImagemCapa(String imagemCapa) { this.imagemCapa = imagemCapa; }
}
