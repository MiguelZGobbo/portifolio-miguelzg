# Arquitetura e contratos de manutenção

## Limites

O projeto gera duas páginas estáticas com Astro. Não há estado de idioma controlado pelo navegador, backend próprio ou rotas de estudo de caso. As [ADRs](adr/README.md) registram essas decisões.

- `src/data/` contém conteúdo e contratos compartilhados, sem acesso ao DOM.
- `src/lib/` reúne traduções, URLs e metadados; não depende de componentes ou APIs do navegador.
- `HomePage.astro` compõe as seções; `BaseLayout.astro` produz o documento e o head. `lib/seo.ts` prepara os metadados localizados.
- `ProjectList.astro` apresenta o conteúdo; `ProjectMedia.astro` resolve e otimiza imagens; `ProjectViewer.astro` declara o único diálogo de cada página.
- `src/scripts/main.js` inicializa módulos separados para tema, navegação, reveals, clipboard, formulário e visualizador. `browser-i18n.js` consulta o idioma estático do documento e reutiliza o dicionário comum.
- `data/contact-fields.ts` define IDs, nomes e mensagens dos campos consumidos pelo HTML e pelo navegador.

Imports executados diretamente pelo Node usam extensões explícitas. Os testes de navegador importam os módulos reais, sem reescrever seu código em strings.

## Cascata CSS

`src/styles/global.css` é o ponto de entrada. Os imports mantêm a ordem original das regras para preservar especificidade e precedência:

1. `foundation.css`: tokens claros, reset, estrutura e componentes básicos.
2. `ambient.css`: iluminação decorativa, estados de seção e animações.
3. `responsive.css`: ajustes de viewport e dispositivos de toque.
4. `theme.css`: tokens e ajustes escuros.
5. `navigation.css`: controles de tema/idioma e ajustes da navegação.
6. `accessibility.css`: foco, skip link, honeypot e seleção de texto.
7. `profile.css`: hierarquia de conteúdo, formação e currículo.
8. `motion.css`: preferência por movimento reduzido.
9. `editorial.css`: composição final fluida, projetos, diálogo e ajustes por contêiner.

Alguns componentes recebem refinamentos no último arquivo. Reordenar imports ou fundir regras exige comparar a cascata resultante em ambos os temas e nos breakpoints. Os testes de estilos seguem os imports reais, na mesma ordem do build; a divisão em arquivos não pode diminuir sua cobertura.

## Contrato visual e funcional

- Preserve textos, ordem dos projetos, hierarquia H1/H2/H3, estados, URLs e âncoras localizadas.
- Preserve a escala fluida, proporções naturais das miniaturas, foto inicial em 4:5, os dois temas e navegação sem rolagem horizontal.
- Mantenha o cabeçalho no fluxo sem JavaScript. Com a melhoria ativa, sua altura medida deve proteger o destino das âncoras.
- O diálogo carrega a ampliação somente ao abrir, ajusta a imagem ao título/legenda e à tela, mantém o foco e restaura a rolagem ao fechar.
- Botão de fechar, Esc e clique externo respeitam o fade de saída de 180 ms, com limite de segurança de 250 ms. Movimento reduzido torna abertura e fechamento imediatos.
- Preserve o fallback de imagem em nova aba, validação acessível, feedback do clipboard e bloqueio do envio de contato local. Testes não devem enviar mensagens reais.
- As luzes decorativas e os reveals devem respeitar movimento reduzido; os demais controles continuam utilizáveis por teclado.
- O acabamento polido do fundo usa pseudoelementos fixos do `body`, com brilho distribuído e um feixe concentrado. O reflexo é estático: não acompanha mouse, tempo ou seção e não intercepta cliques. Apenas as três manchas existentes se movem; com movimento reduzido, elas ficam ocultas e o polimento permanece visível.
- No tema claro, a base permanece `#F9F9FB`; transições cinza-azuladas (`100, 125, 138`, até 4% nos reflexos amplos e 5,5% no feixe) destacam o branco iluminado. O pico branco do feixe tem 50% de opacidade, mantendo o ângulo de 119°, as máscaras e as intensidades reduzidas para celular.

## Verificação

Execute `npm run check` e `npm test`. A suíte verifica páginas construídas, rotas, SEO, currículos, imagens, contraste e comportamentos assíncronos. Para mudanças estruturais em CSS ou marcação, compare capturas antes/depois em PT/EN, claro/escuro, desktop/tablet/mobile; confira também teclado, hover, movimento e ausência de JavaScript. Capturas e relatórios temporários devem ficar fora dos arquivos publicados.
