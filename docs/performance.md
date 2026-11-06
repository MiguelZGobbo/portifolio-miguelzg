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
