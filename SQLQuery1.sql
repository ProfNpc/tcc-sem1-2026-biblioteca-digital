CREATE DATABASE bibliotecadigital;

SELECT * FROM aluno;

SELECT * FROM emprestimo;

SELECT e.id, a.nome, l.titulo, e.data_reserva, e.status 
FROM emprestimo e
JOIN aluno a ON e.nome_aluno = a.nome
JOIN livro l ON e.titulo_livro = l.titulo;

SELECT COUNT(*) AS total_alunos FROM aluno;

DELETE FROM aluno WHERE id = 10002;

SELECT * FROM emprestimo WHERE status = 'RESERVADO';

SELECT * FROM livro;