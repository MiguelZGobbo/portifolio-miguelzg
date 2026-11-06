# Otimização de assets — 6 de novembro de 2026

Registro de medição do ajuste de assets, anterior à refatoração de organização do código. Os tamanhos abaixo são históricos; consulte o build atual para valores novos.

## Alterações

- Foto inicial: fallback WebP de 480 × 640 px, reutilizando a variante de 480 px. As variantes de 120, 180, 240, 360 e 480 px, prioridade, proporção e enquadramento permanecem iguais.
- Projetos: bitmaps continuam com miniaturas responsivas e ampliações WebP de qualidade 90, solicitadas ao abrir o visualizador. O esquema SVG agora usa um único arquivo na miniatura e na ampliação, com dimensões explícitas.
- Fontes: uma declaração local de IBM Plex Sans Variable, pesos 100–700, `font-display: swap` e o mesmo WOFF2 latino utilizado anteriormente. O subconjunto inclui os acentos e a pontuação de todo o texto e dos rótulos acessíveis atuais em PT/EN.
- CSS: extração automática pelo Astro, compartilhando o arquivo entre idiomas. Removido o `will-change` permanente dos elementos de reveal; animações e ondas preservadas.
- JPEG público das prévias sociais, ícones, currículos, conteúdo, APIs e entrega de e-mail preservados.

## Arquivos publicados

Comparação de builds locais da mesma revisão, antes e depois dos ajustes. Valores em bytes, sem compressão HTTP; o tamanho total de `dist/` inclui arquivos que não são baixados na primeira visita.

| Recurso | Antes | Depois |
| --- | ---: | ---: |
| HTML PT | 88.320 | 38.198 |
| HTML EN | 87.716 | 37.594 |
| CSS | 49.845 incorporados em cada HTML | 48.195 em um arquivo compartilhado |
| Fontes WOFF2 publicadas | 162.416 | 45.712 |
| Fallback da foto | 82.132 | 32.290 |
| Esquema SVG, somando as cópias | 16.494 em 6 arquivos | 2.749 em 1 arquivo |
| Imagens, incluindo originais e ícones | 3.728.879 | 3.633.002 |
| Total publicado | 4.247.901 | 3.983.271 |

Economia total publicada: **264.630 bytes, aproximadamente 6,2%**. Todas as imagens otimizadas mantidas, incluindo a foto de 480 px, os diagramas ampliados e o SVG, são idênticas byte a byte às versões anteriores. O WOFF2 latino também é idêntico. Não houve uma nova compressão com perda de qualidade nos arquivos mantidos.

## Recursos realmente solicitados pelo navegador

Dois servidores locais com a mesma implementação e cabeçalhos serviram o build original e o otimizado em origens novas. Foram registrados os caminhos, status e comprimentos dos corpos das respostas concluídas. As medições abaixo excluem cabeçalhos e não usam Brotli/Gzip; não representam tempos de carregamento nem tráfego medido no GitHub Pages.

| Navegação, Chromium 1280 × 720, DPR 1 | Antes | Depois |
| --- | ---: | ---: |
| Primeira visita em PT, sem rolagem | 190.019 bytes, 8 respostas | 188.092 bytes, 9 respostas |
| Troca seguinte para EN com cache local | 87.716 bytes | 37.594 bytes |

Na primeira visita, a economia foi de **1.927 bytes, aproximadamente 1%**. O arquivo CSS externo acrescenta uma requisição; a redução de 56,8% no HTML PT não representa essa mesma redução na primeira visita completa. A foto responsiva escolhida pelo navegador e a fonte baixada já eram pequenas antes da alteração.

Na troca para EN, somente o novo HTML foi solicitado nos dois builds. O CSS, as imagens e a fonte foram reutilizados no build otimizado; o original repetia todo o CSS dentro do HTML. O cache desse ensaio usou `Cache-Control: public, max-age=600`; os cabeçalhos do site publicado continuam sob controle do GitHub Pages.

O navegador solicitou apenas o WOFF2 latino antes e depois. A redução nos demais alfabetos economiza publicação e definições CSS, sem atribuir ao carregamento uma economia de fontes que já não eram solicitadas. Os PNGs originais continuam no build por causa das importações de assets; as páginas referenciam as versões otimizadas. As ampliações WebP e o SDK EmailJS não apareceram nas requisições iniciais; a ampliação passou a ser solicitada ao clicar.

## Verificação

- Linha de base: 114 testes aprovados.
- Após os ajustes: 117 testes aprovados; `npm run check` sem erros, avisos ou sugestões.
- Testes de build verificam CSS externo compartilhado, a fonte latina, prioridade e variantes da foto, e reutilização do SVG pelo visualizador. A verificação do desfoque continua inspecionando o CSS de produção, incluindo arquivos externos.
- Inspeção no navegador em PT/EN, temas claro/escuro e tamanhos desktop e mobile de 390 × 844. As posições e dimensões dos elementos comparados em desktop e mobile permaneceram iguais, sem rolagem horizontal.
- Visualizador conferido com bitmap e SVG: imagem completa, proporção correta e ajuste à tela mobile; fechamento pelo botão e por Esc, restauração do foco e abertura/fechamento consecutivos. Nenhum erro de console observado nessas sessões.
- Alta densidade: as variantes de imagem existentes foram preservadas byte a byte, incluindo os 480 px para a foto exibida com até 240 px a DPR 2. A inspeção visual automatizada utilizou DPR 1; não foi feita emulação de DPR 2 nem medição de CLS/LCP em campo.
- Revisão independente do diff e da cobertura Unicode: nenhum problema acionável encontrado.

Os ensaios não enviaram mensagens, não publicaram o site e não modificaram o workflow de deploy. Não se atribui ganho numérico de CPU ou memória à remoção de `will-change`, pois esses custos não foram medidos.

## Manutenção

Mantenha os bitmaps em `src/assets/` para o processamento do Astro. Use `public/` quando a URL estável e a entrega sem transformação forem intencionais. Ao adicionar idiomas ou caracteres, revise o `unicode-range` em `src/styles/fonts.css`. Preserve a nitidez dos diagramas ampliados e compare o peso efetivamente baixado antes de adotar outro formato.

## Validação mobile — 6 de novembro de 2026

Esta rodada avalia o build local de produção, antes e depois das mudanças de navegação e miniaturas. O site publicado ainda contém outra revisão e não serve de comparação direta. Nenhum deploy foi realizado.

### Ambiente e repetição

- Windows, Chromium headless 158.0.8127.18, Playwright 1.65.0 e Lighthouse 13.5.0.
- WebKit 26.6 com a biblioteca correspondente Playwright Core 1.63.0. É uma verificação do motor no Windows, não Safari executando em iOS.
- Três execuções sequenciais por idioma antes e depois, totalizando 12 relatórios Lighthouse, sem outros benchmarks em paralelo. Armazenamento/cache reiniciados pelo Lighthouse entre execuções.
- Perfil mobile padrão: RTT 150 ms, throughput de simulação 1.638,4 Kbit/s e CPU desacelerada em 4×. As medições usam o servidor `astro preview` local; latência real do GitHub Pages e condições de operadoras não estão representadas.
- Para investigar interações, perfil separado de 360 × 800, DPR 3 e CPU 6×: rolagem pela página inteira, navegação para Projetos, abertura/fechamento de imagem e troca de tema.

Para repetir o carregamento, execute o build e o preview, abra uma instância do Chromium com depuração remota na porta 9226 e rode o comando abaixo três vezes para cada URL. Use diretório de relatórios fora de `public/` e `dist/`; mantenha a mesma versão do navegador e as condições entre comparações.

~~~powershell
npm run build
npm run preview
# Chromium iniciado com --remote-debugging-port=9226.
# Ferramenta temporária, sem adicioná-la às dependências do site:
npx --yes lighthouse@13.5.0 http://127.0.0.1:4323/portifolio-miguelzg/ --port=9226 --only-categories=performance --form-factor=mobile --output=json --output-path=../mobile-pt-1.json --quiet
# Repetir para /portifolio-miguelzg/en/ e usar arquivos distintos em cada rodada.
~~~

O preview desta sessão já estava na porta 4323; ajuste a URL ao endereço informado pelo seu servidor. Os relatórios JSON, scripts de diagnóstico, cópia do build original e capturas desta rodada ficam fora do repositório, na pasta de artefatos `mobile-performance` da sessão.

### Carregamento

| Versão / idioma | Score, 3 execuções | LCP mediano | Intervalo LCP | TBT | CLS |
| --- | ---: | ---: | ---: | ---: | ---: |
| Antes PT | 100 / 100 / 100 | 1.656 ms | 1.655–1.659 ms | 0 ms | 0,000318 |
| Antes EN | 100 / 100 / 100 | 1.658 ms | 1.656–1.661 ms | 0 ms | 0,000183 |
| Depois PT | 100 / 100 / 100 | 1.582 ms | 1.581–1.583 ms | 0 ms | 0,000318 |
| Depois EN | 100 / 100 / 100 | 1.584 ms | 1.583–1.585 ms | 0 ms | 0,000183 |

Os dois idiomas atendem aos limites adotados: mediana ≥ 95, LCP ≤ 2,5 s, CLS ≤ 0,1 e TBT ≤ 200 ms. O LCP mediano caiu aproximadamente 4,5% neste ensaio. TBT é uma medida de laboratório; não substitui INP de visitantes reais. A auditoria de layout forçado sinalizou uma das seis execuções de referência (duas entradas, de 59,3 e 4,0 ms), e nenhuma das seis execuções finais; não se trata de promessa de ausência de todo layout síncrono em qualquer uso.

### Navegação e imagens

A navegação mede cabeçalho, seções e indicador antes das escritas. Só altera atributos e estilos quando seus valores mudam. Resize continua invalidando a altura do cabeçalho, e `document.fonts.ready` dispara uma nova medição para não conservar posições obtidas com a fonte de fallback. A geometria das seções não fica em cache entre atualizações de rolagem.

Em cinco rolagens de 25 px dentro da mesma seção, o observador registrou antes cinco mutações de `data-section` e dez no cabeçalho; depois, zero em ambos. Isso comprova a remoção de trabalho redundante nesse cenário, sem atribuir um ganho universal de FPS.

As miniaturas raster ganharam variantes de 480 e 768 px, mantendo as anteriores, a configuração de qualidade e as ampliações sob demanda.

| Viewport / densidade | Bytes das quatro miniaturas antes | Depois | Economia |
| --- | ---: | ---: | ---: |
| 390 px / DPR 2 | 92.388 | 70.210 | 22.178 bytes (24,0%) |
| 412 px / DPR 1,75 | 92.388 | 70.210 | 22.178 bytes (24,0%) |
| 390 px / DPR 3 | 128.840 | 128.840 | Sem alteração |

São corpos de recursos observados pelo navegador após visitar todos os projetos, incluindo o SVG; não correspondem ao peso total da página. Na troca PT → EN com cache, as entradas Resource Timing de imagens, fonte, CSS e JavaScript registraram zero bytes de corpo e 300 bytes de transferência por recurso, compatíveis com revalidação sem retransmissão dos corpos. Os cabeçalhos de cache do GitHub Pages precisam ser considerados separadamente.

### Efeitos e limites da conclusão

Cada hipótese foi testada isoladamente em memória, sem editar o CSS publicado: congelar a flutuação, retirar a transição entre seções, retirar os reflexos estáticos e retirar o desfoque do diálogo. Foram três repetições por hipótese em CPU 6×. Retirar a transição entre seções reduziu o custo de estilo/CPU desse diagnóstico; congelar a flutuação, retirar reflexos ou retirar o desfoque não demonstrou ganho consistente.

O cenário original ficou dentro de 200 ms nos eventos observados, tanto antes quanto depois da otimização. Os efeitos foram preservados. Os contadores agregados de CPU variaram entre rodadas e não fundamentam uma afirmação de melhora da fluidez por si só. Os intervalos de `requestAnimationFrame` e Event Timing em Chromium headless são sinais de laboratório, não medições do painel/GPU de um celular nem INP em campo.

Uma rodada adicional alternou três pares do build original preservado e do build final, entregues por interceptação local de arquivos no navegador, sem servidor adicional. O tempo agregado de tarefas se sobrepôs entre versões (antes 1,955–2,124 s; depois 1,929–2,012 s), sem fundamentar uma porcentagem estável de ganho de CPU. Nos pares finais, o maior evento observado foi 176 ms. No perfil final diretamente pelo preview, foi 192 ms; o p95 dos intervalos de rAF ficou entre 33,3 e 33,4 ms em CPU 6×. Esses valores não significam 60 FPS garantidos em hardware real.

Um trace adicional dos controles identificou uma tarefa de 63 ms em CPU 6× na abertura do visualizador; aproximadamente 51 ms pertenciam ao despacho do clique e 50 ms à função de preparação/abertura do diálogo. Isso localiza a tarefa acima de 50 ms investigada nesta rodada, sem exigir remover um efeito quando a resposta observada permaneceu dentro do limite adotado. Não se infere a duração sem throttling por simples divisão.

### Regressões de interface

As 32 combinações de motor (Chromium/WebKit), largura (320/360/390/430 px), DPR (2/3) e tema (claro/escuro) passaram. A matriz distribuiu PT nas larguras 320/390 e EN em 360/430, exercitando também o idioma oposto por navegação. Movimento reduzido foi exercitado nas combinações de 320 px.

Foram conferidos ausência de overflow horizontal, destinos de âncoras abaixo do cabeçalho, ciclo de tema, troca de idioma e recarga, validação de e-mail inválido, imagem ampliada carregada só ao abrir, ajuste do diálogo ao girar a viewport e restauração de foco ao fechar. Os testes não contactaram o EmailJS e não abriram o teclado nativo de um aparelho. As capturas mobile foram inspecionadas em ambos os motores; os assets antigos, CSS e fonte foram comparados byte a byte para preservar a referência visual. As miniaturas intermediárias também foram inspecionadas quanto à leitura do diagrama.

`npm run check`: nenhum erro, aviso ou sugestão. `npm test`: build concluído e 120 testes aprovados. A revisão independente não encontrou defeitos de código; observou a ausência de uma asserção específica de build para as novas larguras das miniaturas, coberta nesta rodada pela seleção e transferência efetivas no navegador.

### Conferência em aparelhos reais

A amostra informada é um iPhone 13, com iOS descrito pelo proprietário como a versão mais recente, sem número confirmado. A conferência física permanece pendente; Android físico também não foi testado. A prévia adicional na rede local foi bloqueada pela política automática da ferramenta, antes de iniciar o servidor.

Quando o build final estiver acessível no aparelho, registrar modelo, versão exata do sistema/navegador e tipo de conexão. Em uma visita sem cache e depois com cache, conferir: entrada e rolagem completa; links para seções; temas e idioma; ampliação de bitmap e SVG; retrato/paisagem; teclado do formulário e foco; movimento reduzido ativado nos ajustes do sistema. Não enviar mensagens de teste. Repetir em um Android de entrada quando houver acesso, além das simulações já descritas.

Uma nota alta em laboratório e a amostra de iPhone não garantem desempenho em todos os aparelhos, navegadores antigos, estados de bateria ou redes. A cobertura automatizada e suas limitações devem acompanhar os resultados.
