# Portfolio V2 — Phase 1 Return Package

## 1. Escopo efetivamente auditado

Foram auditados:

- o repositório principal `portifolio-miguelzg`, seus 38 arquivos rastreados, configuração Astro, workflow, documentação, dependências, metadata e deploy;
- a versão publicada em `https://miguelzgobbo.github.io/portifolio-miguelzg/`;
- os currículos PT e EN, por extração e renderização visual;
- o perfil público `MiguelZGobbo`, seus repositórios fixados e metadata pública;
- somente os quatro projetos usados como evidência direta no portfólio: `purchase-orders-api`, `API-de-Gerenciamento-de-Tarefas`, `game_project` e o próprio portfólio;
- nesta execução complementar, checkouts locais editáveis dos repositórios `API-de-Gerenciamento-de-Tarefas` e `game_project`.

A conta GitHub inteira não foi auditada. O repositório antigo `portfolio-miguelzg` foi consultado somente porque ocupa o nome e a rota Pages que colidiriam com uma eventual correção de `portifolio`.

## 2. Materiais disponíveis

- Consolidação Canônica e Fechamento da Fase 0, lida integralmente e preservada sem alteração.
- Handoff Operacional da Fase 1 e instruções da auditoria humana complementar.
- Repositório principal e histórico Git local.
- Site publicado, GitHub público, GitHub REST API e resultados públicos de Actions.
- Currículos PT e EN versionados.
- Checkout editável `D:\dev\Projetos\API-de-Gerenciamento-de-Tarefas`, branch `main`, HEAD `64b2280`.
- Checkout editável `D:\dev\Projetos\game_project`, branch `main`, HEAD `0311bda`.

## 3. Materiais indisponíveis / limitações

- LinkedIn bloqueou a inspeção automatizada com HTTP 999. O URL é consistente entre site, JSON-LD e currículo PT, mas não foi validado independentemente.
- Java e Maven de sistema não estão disponíveis neste host; portanto compile e testes Java não puderam ser executados após a remoção dos scripts residuais do Wrapper.
- Os testes Java dependem de MySQL externo; nenhuma estratégia de teste ou banco foi inventada nesta fase.
- A Purchase Orders API não foi reexecutada localmente com PostgreSQL; o CI público do commit auditado estava verde.
- `game_project` não possui testes ou lint declarados. A validação executada cobriu sintaxe e resolução da dependência no Python 3.12.14, não uma matriz completa de versões.
- O portfólio não define scripts de `test` ou `lint`; ambos permanecem `NOT AVAILABLE`.
- Nenhuma escrita remota foi realizada.

## 4. Resumo executivo

- **FIX NOW encontrados:** 9
- **FIX NOW corrigidos:** 9
- **REVIEW:** 0
- **DEFER:** 9
- **NO ACTION relevantes:** 6

A primeira passagem produziu três correções no repositório principal, preservadas nesta execução: grafia factual no README, `is:inline` explícito no JSON-LD e atualização do lockfile para eliminar seis vulnerabilidades.

A execução complementar resolveu seis achados objetivos nos dois projetos externos: grafias do autor, instrução de clone Java, remoção de 17 artefatos `target/`, remoção dos scripts não funcionais do Maven Wrapper, externalização da senha atual e requisito Python factual. CLEAN-004 e CLEAN-005 foram administrativamente encaminhados para as Fases 7 e 2. A credencial histórica foi encaminhada para DEFER sem reescrita do histórico.

Não houve redesign, refatoração ampla, rename remoto, commit, push ou alteração de metadata remota.

## 5. Alterações realizadas

### Repositório principal — correções preservadas

#### CLEAN-001 — grafia no README

- `README.md`: `Miguel Zago Gobbo` → `Miguel Zager Gobbo`.
- Validado por busca global, Astro check e build.

#### CLEAN-002 — JSON-LD inline explícito

- `src/layouts/BaseLayout.astro`: inclusão de `is:inline` no script JSON-LD.
- Validado por `astro check` sem hints e build.

#### CLEAN-003 — lockfile vulnerável

- `package-lock.json`: atualização dentro dos ranges existentes; Astro 7.2.0 → 7.3.2 e transitivas corrigidas.
- Validado por instalação limpa, build, check e audit com zero vulnerabilidades.

### `API-de-Gerenciamento-de-Tarefas`

#### CLEAN-006 — grafia do autor

- **Problema:** README usava `Miguel Zago Gobbo`.
- **Mudança:** correção pontual para `Miguel Zager Gobbo`.
- **Validação:** busca global sem a ocorrência errada.

#### CLEAN-007 — clone e diretório antigos

- **Problema:** README instruía clonar/entrar em `trabalho-api-spring`.
- **Mudança:** URL e `cd` atualizados para `API-de-Gerenciamento-de-Tarefas`.
- **Validação:** remoto atual reconfirmado por `git ls-remote`; busca final sem o nome antigo.

#### CLEAN-008 — artefatos Maven rastreados

- **Problema:** 17 arquivos gerados em `target/` estavam rastreados apesar de `.gitignore` conter `target/`.
- **Mudança:** remoção restrita aos 17 artefatos do índice e da working tree; nenhuma fonte foi removida.
- **Validação:** `git ls-files target` retorna zero; `git check-ignore --no-index target/probe.txt` aponta a regra `target/`.

#### CLEAN-009A — scripts residuais do Maven Wrapper

- **Problema:** `mvnw` e `mvnw.cmd` eram inoperantes porque `.mvn/wrapper/maven-wrapper.properties` nunca existiu no histórico acessível.
- **Mudança:** os dois scripts foram removidos; o README permanece usando Maven 3 de sistema e a nota transitória sobre o Wrapper foi retirada.
- **Validação:** busca atual sem `mvnw` ou instruções de Maven Wrapper; nenhum Wrapper novo foi criado; `git diff --check` aprovado.

#### CLEAN-010A — senha na configuração atual

- **Problema:** `spring.datasource.password=8676` estava no arquivo-fonte e no artefato gerado.
- **Mudança:** configuração atual usa `${DB_PASSWORD}`; README documenta como definir a variável em Bash e PowerShell. A duplicata gerada desapareceu com CLEAN-008.
- **Validação:** busca atual sem a senha literal e documentação alinhada à propriedade.

### `game_project`

#### CLEAN-006 — grafia do autor

- **Problema:** README usava `Miguel Zago Gobbo`.
- **Mudança:** correção pontual para `Miguel Zager Gobbo`.
- **Validação:** busca global sem a ocorrência errada.

#### CLEAN-011A — requisito Python

- **Problema:** README combinava Python 3.14 com o requisito genérico Python 3+, enquanto o código usa `match/case`.
- **Evidência:** a sintaxe exige Python 3.10+; Pygame 2.6.1 aceita CPython 3.6+; a auditoria compilou o código com Python 3.12.14.
- **Mudança:** badge, tecnologia e pré-requisito alinhados para Python 3.10+; a versão efetivamente validada e a ausência de matriz completa foram registradas.
- **Validação:** `compileall` e resolução dry-run de `pygame==2.6.1` aprovados no Python 3.12.14.

## 6. Validação

| Repositório / check | Resultado | Observação |
| --- | --- | --- |
| Portfólio — `npm ci` | PASS | Instalação limpa; 0 vulnerabilidades. |
| Portfólio — `npm run check` | PASS | 21 arquivos; 0 erros, 0 warnings, 0 hints. |
| Portfólio — `npm run build` | PASS | Build estático concluído. |
| Portfólio — `npm audit --json` | PASS | 0 vulnerabilidades. |
| Portfólio — testes/lint | NOT AVAILABLE | Scripts inexistentes. |
| Java — remoto atual | PASS | `main` e HEAD remoto `64b2280` reconfirmados antes do clone. |
| Java — busca de grafia/nome/senha atuais | PASS | Nenhuma ocorrência atual de `Miguel Zago Gobbo`, `trabalho-api-spring` ou da senha literal. |
| Java — higiene de `target/` | PASS | 0 arquivos rastreados; regra de ignore confirmada. |
| Java — `git diff --check` | PASS | Nenhum erro de whitespace. |
| Java — resíduos do Wrapper | PASS | `mvnw` e `mvnw.cmd` removidos; zero referências atuais na documentação/produto; nenhum Wrapper novo criado. |
| Java — compile/test | NOT EXECUTED | Java/Maven de sistema indisponíveis; testes dependem de MySQL. |
| Jogo — `compileall` | PASS | Python 3.12.14, exit 0. |
| Jogo — resolução de `requirements.txt` | PASS | Dry-run resolveria `pygame-2.6.1-cp312` para o runtime auditado. |
| Jogo — testes/lint | NOT AVAILABLE | Não há comandos/suítes declarados. |
| Jogo — `git diff --check` | PASS | Nenhum erro de whitespace. |
| Commits/push | PASS | Nenhum commit criado e nenhum push executado em qualquer repositório. |

## 7. REVIEW pendentes

Nenhum item permanece em `REVIEW` após as decisões da auditoria humana.

## 8. DEFER para fases futuras

- **CLEAN-004 — `portifolio`: Fase 7.** Nenhum rename. Uma futura mudança deve migrar coordenadamente repositório, Pages, `base`, canonical, sitemap, workflow, currículo e referências externas, considerando a colisão com `portfolio-miguelzg`.
- **CLEAN-005 — metadata GitHub: Fase 2.** Nenhuma alteração remota; nome, bio, descriptions, topics e homepages dependem de posicionamento/copy aprovado.
- **CLEAN-009B — testes/MySQL Java: Fase 5 / etapa técnica apropriada.** Não foi criada estratégia de banco/testes nesta limpeza.
- **CLEAN-010B — credencial histórica: etapa técnica apropriada.** A configuração atual está corrigida e nenhuma credencial literal permanece no HEAD/working tree. O valor antigo continua recuperável historicamente; qualquer credencial real/reutilizada deve ser considerada comprometida e rotacionada. Eventual history rewrite exige decisão e coordenação separadas.
- **CLEAN-011B — matriz Python: Fase 5 / etapa técnica apropriada.** Somente Python 3.12.14 foi validado; compatibilidade abrangente requer matriz automatizada.
- **CLEAN-012 — currículo EN: Fase 2.** Decidir conteúdo real e copy antes de corrigir/remover o placeholder.
- **CLEAN-013 — itens REMOVE herdados: Fases 2/5/6/8.** Soft skills, partículas, parallax, tilt e PWA foram preservados.
- **CLEAN-014 — navegação e `main.js`: Fases 3/5/6.** Nenhuma refatoração ou mudança estrutural foi antecipada.
- **CLEAN-015 — i18n e SEO: Fase 7.** Rotas PT/EN, canonical, sitemap e JSON-LD finais permanecem adiados.

## 9. Estado Git

### `D:\dev\Projetos\portifolio-miguelzg`

- Branch `refactor/portfolio-v2`; HEAD `9ddae6e` inalterado.
- Modificados: `README.md`, `package-lock.json`, `src/layouts/BaseLayout.astro`.
- Não rastreados: `PHASE-1-AUDIT-MATRIX.md`, `PHASE-1-RETURN-PACKAGE.md`.
- Removidos: nenhum.
- Diff rastreado: 3 arquivos, 580 inserções, 443 remoções.

### `D:\dev\Projetos\API-de-Gerenciamento-de-Tarefas`

- Branch `main`; HEAD `64b2280` inalterado e alinhado a `origin/main` antes das mudanças locais.
- Modificados não staged: `README.md`, `src/main/resources/application.properties`.
- Removidos não staged: `mvnw`, `mvnw.cmd`.
- Removidos staged: 17 arquivos gerados sob `target/`.
- Não rastreados: nenhum.
- Diff total contra HEAD: 21 arquivos, 19 inserções, 1652 remoções.

### `D:\dev\Projetos\game_project`

- Branch `main`; HEAD `0311bda` inalterado e alinhado a `origin/main` antes das mudanças locais.
- Modificado: `README.md`.
- Removidos/não rastreados: nenhum.
- Diff: 1 arquivo, 6 inserções, 4 remoções.

### Estado remoto

- Commits criados: nenhum.
- Push realizado: nenhum.
- Rename, Pages, metadata, topics, pins, releases, hosting ou DNS alterados: nenhum.

Comandos para auditoria humana:

```powershell
git -C D:\dev\Projetos\portifolio-miguelzg status --short --branch
git -C D:\dev\Projetos\portifolio-miguelzg diff --stat
git -C D:\dev\Projetos\API-de-Gerenciamento-de-Tarefas status --short --branch
git -C D:\dev\Projetos\API-de-Gerenciamento-de-Tarefas diff HEAD --stat
git -C D:\dev\Projetos\API-de-Gerenciamento-de-Tarefas diff
git -C D:\dev\Projetos\API-de-Gerenciamento-de-Tarefas diff --cached
git -C D:\dev\Projetos\game_project status --short --branch
git -C D:\dev\Projetos\game_project diff
```

## 10. Riscos / observações

- O valor `8676` deve ser considerado comprometido se alguma vez representou uma senha real ou reutilizada. Externalizar o HEAD não substitui rotação.
- Os scripts não funcionais do Wrapper foram removidos. Um eventual Wrapper corretamente gerado pode ser decidido futuramente em etapa técnica apropriada.
- Compile e testes Java permanecem sem validação executável neste host; CLEAN-009B registra o risco sem maquiar resultado.
- `Python 3.10+` expressa o piso sintático observado, não uma promessa de compatibilidade testada em todas as versões futuras. O README deixa essa limitação explícita.
- O diff grande do lockfile do portfólio permanece mecânico e já foi validado; `package.json` não mudou.
- O LinkedIn não pôde ser validado automaticamente.

## 11. Resultado da reinspeção final

- Zero ocorrências atuais de `Miguel Zago Gobbo` nos arquivos dos produtos dos três repositórios editados, excluídos os próprios registros de auditoria que preservam a evidência textual.
- Zero referências atuais a `trabalho-api-spring` no repositório Java.
- Zero arquivos de `target/` rastreados; novos artefatos continuam ignorados.
- Zero scripts ou referências atuais ao Maven Wrapper no produto/documentação Java; nenhum Wrapper novo foi criado.
- Zero ocorrências atuais da senha literal na configuração/working tree Java; a ocorrência histórica permanece conscientemente registrada.
- Zero vulnerabilidades no portfólio e Astro check sem erros, warnings ou hints.
- Projeto Python compila sintaticamente no runtime testado e sua dependência resolve para esse runtime.
- Nenhum novo `FIX NOW` foi encontrado na reinspeção complementar.
- Itens restantes estão classificados como DEFER ou NO ACTION; não restam REVIEW.

## 12. Prontidão para fechamento canônico

**EXECUÇÃO TÉCNICA DA FASE 1 PRONTA PARA FECHAMENTO CANÔNICO**

Esta declaração não fecha canonicamente a Fase 1. A supervisão pode revisar os nove FIX NOW aprovados, confirmar os nove DEFER e autorizar separadamente qualquer commit ou push.
