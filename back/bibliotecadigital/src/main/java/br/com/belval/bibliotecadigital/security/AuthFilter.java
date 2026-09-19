package br.com.belval.bibliotecadigital.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

// Filtro que roda ANTES de todo controller. Antes dessa proteção, qualquer
// pessoa conseguia chamar direto a API (ex: DELETE /api/alunos/3) sem estar
// logada - o "login" só controlava o que aparecia na tela do React, nunca
// protegeu de verdade o backend.
@Component
public class AuthFilter extends OncePerRequestFilter {

    private final AuthTokenService tokenService;
    private final AntPathMatcher matcher = new AntPathMatcher();

    public AuthFilter(AuthTokenService tokenService) {
        this.tokenService = tokenService;
    }

    // Rotas que não exigem nenhum login (catálogo público, cadastro, login)
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        String method = request.getMethod();

        if (!path.startsWith("/api/")) return true;           // imagens de capa, etc
        if ("OPTIONS".equals(method)) return true;             // preflight de CORS

        if (path.equals("/api/alunos/login") && method.equals("POST")) return true;
        if (path.equals("/api/alunos") && method.equals("POST")) return true; // autocadastro
        if (path.equals("/api/livros") && method.equals("GET")) return true; // catálogo público (antes de logar)

        return false;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        String header = request.getHeader("Authorization");
        String token = (header != null && header.startsWith("Bearer ")) ? header.substring(7) : null;
        TokenInfo info = tokenService.validar(token);

        if (info == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("text/plain;charset=UTF-8");
            response.getWriter().write("Sessão inválida ou expirada. Faça login novamente.");
            return;
        }

        String path = request.getRequestURI();
        String method = request.getMethod();
        boolean admin = "ADMIN".equals(info.perfil());

        if (exigeAdmin(path, method) && !admin) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("text/plain;charset=UTF-8");
            response.getWriter().write("Acesso restrito ao administrador.");
            return;
        }

        // Editar aluno: liberado pro próprio dono da conta (ex: escolher unidade) ou admin
        if (matcher.match("/api/alunos/{id}", path) && method.equals("PUT") && !admin) {
            Long id = Long.valueOf(path.substring(path.lastIndexOf('/') + 1));
            if (!id.equals(info.alunoId())) {
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                response.setContentType("text/plain;charset=UTF-8");
                response.getWriter().write("Você só pode editar sua própria conta.");
                return;
            }
        }

        request.setAttribute("usuarioLogado", info);
        chain.doFilter(request, response);
    }

    private boolean exigeAdmin(String path, String method) {
        // Livros: qualquer alteração é admin (leitura via GET continua liberada pra quem já logou)
        if (path.startsWith("/api/livros") && !method.equals("GET")) return true;

        // Alunos: listar todos, ou deletar -> admin. Editar tem regra própria acima.
        if (path.equals("/api/alunos") && method.equals("GET")) return true;
        if (matcher.match("/api/alunos/{id}", path) && method.equals("DELETE")) return true;

        // Empréstimos: ações administrativas
        if (path.equals("/api/emprestimos/todos")) return true;
        if (matcher.match("/api/emprestimos/{id}/entregar", path)) return true;
        if (matcher.match("/api/emprestimos/{id}/devolver", path)) return true;

        // Estatísticas do painel
        if (path.startsWith("/api/admin")) return true;

        return false;
    }
}
