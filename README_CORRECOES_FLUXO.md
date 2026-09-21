# Correções do fluxo de reserva e empréstimo

Estas alterações foram feitas com base no feedback do professor sobre o processo operacional da Biblioteca Digital.

## Fluxo implementado

1. O aluno consulta os livros da unidade/polo dele.
2. Ao reservar, o exemplar fica separado para aquele aluno e não aparece mais como disponível para outra pessoa.
3. A reserva tem prazo de **1 dia para retirada**.
4. O administrador confirma a retirada com **Entregar**.
5. Nesse momento é registrada a **data da retirada** e começa o prazo de **7 dias para devolução**.
6. Quando o livro volta, o administrador usa **Devolvido**.
7. A **data real da devolução** é gravada e o exemplar volta ao estoque/disponibilidade.
8. Se a reserva passar do prazo sem retirada, ela é marcada como **EXPIRADO** e o exemplar volta para o acervo.
9. Depois que o livro foi retirado, o aluno não pode mais cancelar a reserva. O encerramento passa a ser feito pela devolução.

## Novos campos em `Emprestimo`

- `dataLimiteReserva`: até quando a reserva pode ser retirada.
- `dataRetirada`: data em que o empréstimo foi efetivamente retirado.
- `dataDevolucao`: prazo previsto de devolução, criado somente na retirada.
- `dataDevolucaoReal`: data em que o livro foi realmente devolvido.

O campo `status` usa agora principalmente:

- `RESERVADO`
- `RETIRADO`
- `DEVOLVIDO`
- `CANCELADO`
- `EXPIRADO`

`EM_DIA` continua sendo reconhecido apenas para compatibilidade com registros antigos e é convertido para `RESERVADO` na primeira consulta.

## Banco de dados

O projeto usa `spring.jpa.hibernate.ddl-auto=update`, então os novos campos da entidade `Emprestimo` serão criados/atualizados automaticamente quando o backend iniciar.

## Endpoints principais para o futuro mobile

- `GET /api/livros?unidade=...` → consultar livros da unidade.
- `POST /api/emprestimos` → criar reserva.
- `GET /api/emprestimos/aluno/{nome}` → reservas e empréstimos ativos do aluno.
- `GET /api/emprestimos/aluno/{nome}/historico` → histórico do aluno.
- `POST /api/emprestimos/{id}/entregar` → confirmar retirada/efetivar empréstimo.
- `POST /api/emprestimos/{id}/devolver` → registrar devolução.
- `DELETE /api/emprestimos/{id}` → cancelar uma reserva que ainda não foi retirada.
