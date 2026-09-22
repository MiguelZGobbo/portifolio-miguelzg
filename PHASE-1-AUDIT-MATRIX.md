# Portfolio V2 — Phase 1 Audit Matrix

**Data da execução:** 16 de setembro de 2026  
**Branch:** `refactor/portfolio-v2`  
**HEAD inicial e final:** `9ddae6e`  
**Escopo:** repositório principal, site publicado, currículos PT/EN, perfil GitHub e os quatro projetos efetivamente apresentados no portfólio. A execução complementar incluiu checkouts locais editáveis de `API-de-Gerenciamento-de-Tarefas` (`64b2280`) e `game_project` (`0311bda`).

## Matriz

| ID | Origem | Achado | Evidência | Classe | Decisão | Ação | Validação | Destino |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CLEAN-001 | `README.md:140` | O autor aparecia como `Miguel Zago Gobbo`, grafia incompatível com a forma completa comprovada no currículo e nas demais fontes factuais. | Currículo PT, JSON-LD, manifest, PT/EN e título do README usam `Miguel Zager Gobbo`; busca inicial encontrou a única ocorrência local de `Miguel Zago Gobbo`. | FIX NOW | APPROVE | Alterado somente `Zago` para `Zager`. | Busca final: zero ocorrências da grafia errada nos arquivos do produto, excluídos os próprios registros de auditoria; `astro check` e build aprovados. | Corrigido localmente. |
| CLEAN-002 | `src/layouts/BaseLayout.astro:41` | O JSON-LD era tratado implicitamente como inline, gerando hint do Astro. | Baseline `npm run check`: 0 erros, 0 warnings e 1 hint `astro(4000)`. | FIX NOW | APPROVE | Adicionado `is:inline` explicitamente ao `<script type="application/ld+json">`. | `npm run check`: 0 erros, 0 warnings e 0 hints; HTML produzido permaneceu byte a byte igual ao publicado. | Corrigido localmente. |
| CLEAN-003 | `package-lock.json` | O lockfile instalava Astro 7.2.0 e dependências com 6 alertas: 1 crítico e 5 altos. | `npm audit --json`; o advisory GHSA-26w7-cxv4-gfx2 marca Astro `<7.2.8` como afetado e 7.2.8 como corrigido. | FIX NOW | APPROVE | Executado `npm audit fix`, mantendo o range declarado em `package.json`; lock passou a resolver Astro 7.3.2, Sharp 0.35.4 e demais transitivas corrigidas. | `npm ci`, `npm run check`, `npm run build` aprovados; `npm audit`: 0 vulnerabilidades. | Corrigido localmente. |
| CLEAN-004 | Repositório, Pages, Astro, CV e GitHub | A grafia `portifolio` está no nome/URL atuais, mas a rota corrigida `portfolio-miguelzg` já pertence a outro repositório público e publica um portfólio antigo. | `origin`, `astro.config.mjs`, canonical, sitemap, workflow, currículos e links usam `portifolio-miguelzg`; `https://github.com/MiguelZGobbo/portfolio-miguelzg` e a Pages correspondente existem. | DEFER | DEFER | Nenhum rename local ou remoto; decisão administrativa registrada. | URLs atuais respondem 200; colisão de nome e Pages confirmada. | Fase 7: eventual migração coordenada de repositório, Pages, `base`, canonical, sitemap, workflow, CV e referências externas. |
| CLEAN-005 | Perfil e metadata GitHub | O perfil não possui nome, bio, blog ou localização nos campos da conta; três dos quatro repositórios promovidos não têm description e todos não têm topics/homepage. | GitHub REST API em 16/09/2026; a descrição existe apenas em `API-de-Gerenciamento-de-Tarefas`. | DEFER | DEFER | Nenhuma escrita remota. | Dados públicos conferidos por API e páginas GitHub. | Fase 2: decidir posicionamento/copy; depois executar alterações remotas somente com autorização. |
| CLEAN-006 | READMEs de `API-de-Gerenciamento-de-Tarefas` e `game_project` | Ambos apresentavam o autor como `Miguel Zago Gobbo`. | `README.md` nos commits públicos atuais; currículo PT e histórico do próprio `game_project` comprovam `Miguel Zager Gobbo`. | FIX NOW | APPROVE | Corrigido somente `Zago` → `Zager` nos dois checkouts locais editáveis. | Busca global final: zero ocorrências atuais de `Miguel Zago Gobbo` em ambos os repositórios; `git diff --check` aprovado. | Corrigido localmente; commit/push dependem de auditoria humana. |
| CLEAN-007 | README de `API-de-Gerenciamento-de-Tarefas` | Clone e `cd` usavam o nome antigo `trabalho-api-spring`. | `README.md`; `git ls-remote --symref` reconfirmou o remoto atual `API-de-Gerenciamento-de-Tarefas`, branch `main`, commit `64b2280`. | FIX NOW | APPROVE | URL de clone e diretório atualizados para o nome vigente. | Busca final: zero referências atuais a `trabalho-api-spring`; remoto atual resolvido com sucesso. | Corrigido localmente. |
| CLEAN-008 | `API-de-Gerenciamento-de-Tarefas` | `target/` continha 17 arquivos gerados rastreados, apesar de `.gitignore` já conter `target/`. | `git ls-files target`; classes, metadata Maven, dumps e relatórios Surefire eram saídas de build/test. | FIX NOW | APPROVE | Removidos do índice e da working tree somente os 17 arquivos sob `target/`; fontes preservadas. | `git ls-files target`: 0; `git check-ignore --no-index target/probe.txt` aponta `.gitignore:1`; exclusões aparecem staged para revisão. | Corrigido localmente. |
| CLEAN-009A | `API-de-Gerenciamento-de-Tarefas` — Maven Wrapper | Os scripts `mvnw`/`mvnw.cmd` eram resíduos não funcionais: dependiam de `.mvn/wrapper/maven-wrapper.properties`, arquivo ausente em todo o histórico acessível. | Falha reproduzida com exit 1; histórico completo mostra os scripts adicionados no primeiro commit, mas nenhum arquivo `.mvn/` em commits, branches ou tags acessíveis; README já usa Maven 3 de sistema. | FIX NOW | APPROVE | Removidos `mvnw` e `mvnw.cmd`; nenhuma distribuição nova foi inventada e a nota transitória sobre o Wrapper foi retirada do README. | Busca atual: zero referências a `mvnw` ou Maven Wrapper na documentação/produto; ambos os scripts aparecem removidos; `git diff --check` aprovado. | Corrigido localmente. Um Wrapper corretamente gerado pode ser decidido futuramente em etapa técnica apropriada. |
| CLEAN-009B | `API-de-Gerenciamento-de-Tarefas` — testes/MySQL | O único teste carrega o contexto contra MySQL externo e o relatório historicamente rastreado registrava erro de conexão. | Relatório Surefire removido em CLEAN-008: 1 teste, 1 erro; ausência de profile/banco de teste autocontido. | DEFER | DEFER | Nenhuma estratégia de testes, banco ou profile foi criada. | Testes não executados: Wrapper incompleto, Maven/Java indisponíveis e MySQL externo não configurado. | Fase 5 / etapa técnica apropriada do projeto. |
| CLEAN-010A | `API-de-Gerenciamento-de-Tarefas` — configuração atual | A senha MySQL `8676` estava hardcoded na configuração atual e duplicada no artefato gerado. | `src/main/resources/application.properties:3` no HEAD inicial; duplicata em `target/classes` removida por CLEAN-008. | FIX NOW | APPROVE | Substituída por `${DB_PASSWORD}`; README documenta `DB_PASSWORD` em Bash e PowerShell sem fornecer credencial real. | Busca atual: zero ocorrências de `spring.datasource.password=8676`; configuração e documentação usam a mesma variável. | Corrigido localmente; qualquer senha real/reutilizada deve ser rotacionada. |
| CLEAN-010B | `API-de-Gerenciamento-de-Tarefas` — histórico | A configuração atual foi corrigida e nenhuma credencial literal permanece no HEAD/working tree, mas o valor antigo continua recuperável no commit inicial `5947be3`. | Busca atual sem a credencial literal; `git log -S'8676'` ainda localiza o commit; nenhuma reescrita foi feita. | DEFER | DEFER | Histórico preservado. Qualquer credencial real/reutilizada deve ser considerada comprometida e rotacionada. | HEAD permaneceu `64b2280`; busca histórica conserva a evidência e busca atual permanece limpa. | Etapa técnica apropriada: decidir eventual history rewrite somente com coordenação explícita. |
| CLEAN-011A | README de `game_project` | O README dizia Python 3.14 e, ao mesmo tempo, pré-requisito genérico Python 3+, embora o código use `match/case`. | `EntityFactory.py` exige sintaxe 3.10+; Pygame 2.6.1 requer CPython 3.6+; `compileall` passou com Python 3.12.14. | FIX NOW | APPROVE | Badge, tecnologia e pré-requisito alinhados para Python 3.10+; README registra que a validação desta auditoria ocorreu em 3.12.14. | `compileall` exit 0; resolução dry-run de `pygame==2.6.1` exit 0 para CPython 3.12; busca final removeu as declarações conflitantes. | Corrigido localmente. |
| CLEAN-011B | `game_project` — matriz de compatibilidade | Não há evidência de execução em todas as versões Python 3.10+ nem suíte automatizada para sustentá-la. | Auditoria executou somente Python 3.12.14; o próprio README explicita esse limite. | DEFER | DEFER | Nenhuma matriz abrangente foi alegada ou criada. | Testes/lint continuam NOT AVAILABLE. | Fase 5 / etapa técnica apropriada do projeto. |
| CLEAN-012 | Currículo EN e alternância PT/EN | A UI inglesa promete “Complete resume in PDF”, mas o PDF EN é um placeholder. O gerador contém uma segunda instrução que fica fora da página renderizada. | PDF EN de 674 bytes renderizado: apenas “Resume not available in English yet.”; `generate-cv-placeholder.mjs` usa um segundo `Td` que desloca o texto para fora da página. | DEFER | DEFER | Nenhum PDF ou texto estratégico reescrito. | Extração e renderização visual do PDF; link responde 200 local e publicado. | Fase 2: decidir currículo EN real e copy; depois corrigir/remover o placeholder. |
| CLEAN-013 | Skills, partículas, parallax, tilt e PWA | Os cinco elementos classificados como REMOVE na Fase 0 continuam presentes. | `skills.ts`, `Particles.astro`, `main.js`, manifest/ícones e README. | DEFER | DEFER | Preservados conforme handoff. | Presença confirmada; nenhuma remoção antecipada. | Fases 2, 5, 6 e 8, conforme decisão de implementação. |
| CLEAN-014 | Navegação e `main.js` | Contêiner interno de scroll, interceptação de roda/teclado e concentração de comportamento continuam presentes, como já registrado na Fase 0. | `main.js` e `global.css`; leitura integral. | DEFER | DEFER | Nenhuma refatoração ou substituição. | Build/check aprovados no comportamento atual. | Fases 3, 5 e 6. |
| CLEAN-015 | PT/EN e SEO | Os idiomas continuam compartilhando uma única URL e metadata client-side, decisão já classificada como REPLACE. | `BaseLayout.astro`, `main.js`, `i18n.ts`, sitemap com uma única página. | DEFER | DEFER | Nenhuma rota, canonical, sitemap ou JSON-LD final criada. | Estado atual confirmado localmente e no deploy. | Fase 7. |
| CLEAN-016 | Identidade no site | Formas `Miguel`, `Miguel ZG` e `Miguel Zager Gobbo` representam níveis de apresentação, não erros factuais comprovados. | Hero/footer, projeto do portfólio, manifest, JSON-LD e currículo. | NO ACTION | REJECT | Nenhuma normalização estratégica. | Erro inequívoco `Zago` corrigido; variantes intencionais preservadas. | Forma canônica final permanece adiada. |
| CLEAN-017 | Site, CV e projetos | Formação, instituição, previsão de conclusão, contatos, projetos e tecnologias são compatíveis; diferenças de seleção entre fontes não constituem contradição. | CV PT: UNINTER, Engenharia de Software, conclusão 2027; site: formação em andamento; implementações confirmam stacks dos quatro projetos. | NO ACTION | REJECT | Nenhuma reescrita factual. | Comparação cruzada PT/EN, PDF, manifests e código dos projetos. | Sem ação. |
| CLEAN-018 | Deploy e links principais | O site publicado carrega, corresponde ao build local e os links principais/CVs/projetos respondem. | Site, GitHub, quatro projetos, currículos, sitemap, robots e CDN EmailJS retornaram 200; hash do `dist/index.html` igual ao HTML publicado. | NO ACTION | REJECT | Nenhuma alteração remota. | Checks HTTP e comparação SHA-256. | Sem ação; LinkedIn ficou limitado por HTTP 999 automatizado. |
| CLEAN-019 | Arquivos gerados do portfólio | `dist/`, `.astro/` e `node_modules/` estão ignorados e não rastreados; ícones têm dimensões esperadas; as duas fotos idênticas atendem usos distintos (Astro e OG). | `.gitignore`, `git ls-files`, `git status --ignored`, dimensões e hashes SHA-256. | NO ACTION | REJECT | Nenhuma remoção. | Build regenerou `dist/` sem alterar arquivos rastreados. | Sem ação. |
| CLEAN-020 | `purchase-orders-api` | Clone, requisitos, tecnologias, README, `.gitignore` e CI são coerentes; nenhum artefato de build está rastreado. | Cópia no commit `9733c4c`; workflow CI do mesmo commit concluiu com sucesso; 17 testes declarados no README e encontrados. | NO ACTION | REJECT | Nenhuma alteração. | GitHub Actions e inspeção local da cópia de auditoria. | Sem ação; metadata ausente está em CLEAN-005. |
| CLEAN-021 | Seleção profissional | Os quatro projetos exibidos no site são os mesmos quatro repositórios fixados no GitHub e todos são acessíveis. | `projects.ts`, perfil GitHub e endpoints públicos. | NO ACTION | REJECT | Auditoria limitada a esses quatro; conta inteira não foi expandida. | Pinned: Purchase Orders, API de Tarefas, game e portfólio. | Sem ação. |

## Gates dos FIX NOW

### CLEAN-001

- **G-01:** erro factual de grafia.
- **G-02:** recrutadores e mantenedor.
- **G-03:** currículo e múltiplas fontes concordantes.
- **G-04:** respeita a regra especial do nome porque corrige erro inequívoco, sem escolher uma forma profissional nova.
- **G-05/G-06:** troca de uma palavra; risco mínimo.
- **G-07:** busca global, check e build.
- **Resultado:** APPROVE.

### CLEAN-002

- **Problema/evidência:** hint reproduzido pelo check oficial do projeto.
- **Solução mínima:** tornar explícito o comportamento que o Astro já aplicava implicitamente.
- **Validação:** `astro check` sem hints e HTML final idêntico ao publicado.
- **Resultado:** APPROVE.

### CLEAN-003

- **Problema/evidência:** lockfile instalava seis dependências vulneráveis; uma vulnerabilidade crítica possuía versão corrigida compatível.
- **Solução mínima:** atualizar somente o lock dentro dos ranges já autorizados pelo `package.json`.
- **Custo/risco:** diff mecânico amplo no lockfile, sem troca de biblioteca nem mudança de API do projeto.
- **Validação:** instalação limpa, check, build e audit.
- **Resultado:** APPROVE.

### CLEAN-006 / CLEAN-007 / CLEAN-008

- **Problema/evidência:** grafias factualmente erradas, instruções de clone desatualizadas e 17 saídas Maven rastreadas apesar da regra de ignore.
- **Solução mínima:** duas trocas de grafia, duas linhas de clone/diretório e remoção restrita a `target/`.
- **Autoridade/simplicidade:** correções objetivas autorizadas pela auditoria humana; nenhuma escolha de posicionamento, arquitetura ou comportamento.
- **Validação:** buscas globais, remoto reconfirmado, zero arquivos de `target/` rastreados e regra de ignore comprovada.
- **Resultado:** APPROVE.

### CLEAN-010A

- **Problema/evidência:** senha literal presente na configuração pública atual.
- **Solução mínima:** variável de ambiente nativa do Spring e documentação correspondente; nenhuma credencial alternativa inventada.
- **Custo/risco:** usuários precisam definir `DB_PASSWORD`; o README agora informa isso. Rotação e histórico permanecem separados em CLEAN-010B.
- **Validação:** busca atual sem a senha literal e consistência entre configuração e documentação.
- **Resultado:** APPROVE.

### CLEAN-009A

- **Problema/evidência:** dois scripts de Wrapper comprovadamente quebrados, sem arquivo de propriedades em qualquer commit, branch ou tag acessível.
- **Solução mínima:** remover apenas `mvnw` e `mvnw.cmd`; manter Maven 3 de sistema como fluxo já documentado.
- **Autoridade/simplicidade:** decisão aprovada pela auditoria humana; nenhuma distribuição, dependência ou estratégia de testes foi criada.
- **Validação:** busca atual sem instruções/referências ao Wrapper, scripts ausentes e `git diff --check` aprovado.
- **Resultado:** APPROVE.

### CLEAN-011A

- **Problema/evidência:** requisito “Python 3+” incompatível com `match/case`; dependência não eleva o piso além de 3.10.
- **Solução mínima:** declarar o piso sintático 3.10+ e a versão efetivamente testada, sem alegar matriz completa.
- **Validação:** `compileall` com Python 3.12.14 e resolução de `pygame==2.6.1` para esse runtime.
- **Resultado:** APPROVE.

## Cobertura e reinspeção

- Repositório principal: 38 arquivos rastreados inventariados; todos os arquivos textuais foram lidos ou inspecionados por busca dirigida; PDFs foram extraídos e renderizados; imagens foram verificadas por formato, dimensão e hash.
- Projetos externos: somente os quatro promovidos entraram no escopo. Na execução complementar, `API-de-Gerenciamento-de-Tarefas` e `game_project` foram clonados como checkouts locais editáveis em `D:\dev\Projetos`; `purchase-orders-api` não exigiu nova alteração.
- Primeira passagem: 3 `FIX NOW` no repositório principal, todos preservados e novamente validados.
- Execuções complementares: 6 novos `FIX NOW` (CLEAN-006, CLEAN-007, CLEAN-008, CLEAN-009A, CLEAN-010A e CLEAN-011A), todos tratados localmente.
- Varredura pós-correção: 0 novos `FIX NOW` nos três repositórios editados.
- CLEAN-010B foi encaminhado para `DEFER`; não restam itens `REVIEW`.
