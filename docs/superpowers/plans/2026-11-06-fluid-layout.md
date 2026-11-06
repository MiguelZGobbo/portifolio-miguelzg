# Escala fluida do portfólio

## Objetivo aprovado

Reutilizar a lógica do Conscientiza Queimadas em todas as seções do portfólio, nas páginas PT/EN e nos dois temas. Após a calibração visual solicitada pelo usuário, texto-base, intervalos e espaços entre blocos usam, respectivamente:

- `clamp(1rem, min(0.95vw, 1.9svh), 1.0625rem)`
- `clamp(0.875rem, min(1.5vw, 2.4svh), 1.5rem)`
- `clamp(1.5rem, min(3.6vw, 5.4svh), 3rem)`

O conteúdo se reorganiza conforme o espaço disponível, com rolagem vertical natural, sem escala global da página. Conteúdo, identidade, rotas e arquitetura Astro permanecem; nenhuma dependência de produção ou publicação faz parte da mudança.

## Implementação

- [x] Compartilhar escala entre tipografia, imagens, ícones, campos e espaçamentos; retirar regimes antigos de compactação por altura.
- [x] Usar grades intrínsecas e consultas de container para projetos, competências, perfil e contato, incluindo texto ampliado.
- [x] Atualizar imagens responsivas e medir a altura real da navegação para os deslocamentos das âncoras.
- [x] Reservar a altura real de título e legenda no visualizador, mantendo as imagens proporcionais e os controles acessíveis.
- [x] Verificar o build, os diagnósticos, as regressões e a apresentação no navegador.

## Decisões de implementação

- A fonte raiz mantém a preferência do navegador; os tokens são aplicados ao conteúdo. Os limites em `rem` permitem ampliar o texto.
- A altura medida da navegação não controla a altura da própria barra, evitando dependência circular no observador. Sem JavaScript, a barra fica no fluxo da página para não cobrir conteúdo quando os links quebram.
- Miniaturas lazy usam `sizes="auto, 100vw"`: navegadores compatíveis selecionam a fonte pela dimensão renderizada; o fallback é conservador. A revisão independente identificou que a estimativa anterior de `33vw` subdimensionava a fonte quando o texto ampliado fazia a grade empilhar.
- O visualizador mantém a largura do texto independente da altura ajustada da imagem, evitando realimentação entre quebra de legendas e dimensionamento. Observadores e redimensionamento da janela atualizam as medidas.
- Trabalho feito no checkout existente, inicialmente limpo, na branch `fix/portfolio-v2-visual-stabilization`; sem commit ou publicação automática.

## Verificação da implantação inicial em 06/11/2026

- Base anterior: 111 testes aprovados. Novas regressões de altura da navegação e espaço do visualizador foram observadas falhando antes das implementações e passando depois.
- `npm test`: 114 testes aprovados, incluindo build das duas páginas. `npm run check`: 48 arquivos, sem erros, avisos ou hints.
- Chromium, build de produção: 56 combinações de PT/EN, claro/escuro, texto 100%/200% e telas 320×568, 390×844, 768×1024, 1366×768, 1440×900, 1920×1080 e 844×390, sem transbordamento horizontal ou textos cortados medidos.
- 224 ciclos do visualizador: quatro imagens, mesmos idiomas/temas/telas/tamanhos de texto; dimensões, proporção, separação de título/legenda, fechamento por botão/Esc/fundo, foco e rolagem verificados.
- 140 navegações por âncoras: títulos visíveis abaixo da barra. Campos, foco por Tab, validação, proteção de envio local, clipboard, troca de idioma e histórico conferidos.
- Redimensionamento com o visualizador aberto, movimento normal/reduzido e interação móvel por toque também conferidos. Capturas de abertura, projetos, competências, perfil, contato, rodapé e imagem ampliada foram inspecionadas visualmente.
- A escala de leitura mede 16 px em 390×844, 16,56 px em 1440×900, 20 px em 1920×1080 e 16 px em 1920×500. O redimensionamento não exige recarregar.
- A miniatura de aproximadamente 907 px a 200% passou de uma fonte de 640 px para a variante de 960 px após a correção de `sizes`.
- Sem JavaScript: abertura com texto a 200%, âncoras e link nativo da imagem conferidos. Ampliação de texto por CSS não equivale a uma verificação de zoom nativo ou de dispositivos físicos.

O navegador de teste reutilizou o Playwright instalado no projeto vizinho, sem adicionar dependências ao portfólio. A revisão independente foi somente leitura; o problema de seleção da fonte das miniaturas foi corrigido e conferido no navegador.

## Calibração compacta em 06/11/2026

Após o usuário informar que o resultado estava grande, a escala foi reduzida mantendo o mesmo mecanismo. Na janela de 1920×936 que reproduz a captura fornecida, o corpo passou de 20 para 17 px, o título principal do projeto de 32 para 28 px, o espaçamento vertical das seções de 96 para 72 px e a miniatura de aproximadamente 409 para 343 px. O primeiro projeto passou de aproximadamente 435 para 366 px de altura. Títulos de seção, apresentação e foto também foram reduzidos; as variantes e o atributo `sizes` da foto acompanham a nova geometria.

O texto principal mantém o mínimo de 16 px e os controles preservam seus alvos de interação. Os 114 testes e o Astro check passaram novamente. A matriz de 56 combinações de idioma, tema, tela e texto a 100%/200% passou sem transbordamento ou cortes medidos, usando 1920×936 como referência desktop desta rodada.
