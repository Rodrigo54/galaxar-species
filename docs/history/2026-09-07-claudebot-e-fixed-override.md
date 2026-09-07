# `ssm_claudebot`: uma quinta espécie `MACHINE`, e o override de `fixed` por espécie

Relato de como uma tentativa de retrabalhar a variação do `ssm_timbot` (25 variantes `genderless` já publicadas)
virou, em vez disso, uma espécie nova — e de uma feature real que nasceu no meio do caminho: a possibilidade de
uma espécie sobrescrever, só para ela, um dos textos fixos e globais de `scripts/generate-art/base.json`.

## O caminho que não deu certo: reescrever o timbot no lugar

A sessão começou corrigindo bugs pontuais de prompt no `ssm_timbot` (uma frase ambígua de olhos gerando 4 luzes
em vez de 2 — "two stacked LED dots per eye" lido como "dois LEDs *por* olho"). Daí evoluiu para um redesenho
inteiro do eixo de variação das 25 variantes: em vez de diferenciar cada indivíduo pela cor (o que dominava a
leitura visual do conjunto), passar a diferenciar por **formato do visor + símbolo do olho**, com a cor travada
em uma paleta fixa para toda a espécie. Isso foi todo desenhado, testado com `bun run art ssm_timbot genderless
-e` (sem GPU) e validado — inclusive ajustes de cabeça (esférica → elíptica, explicitamente "not a helmet"),
torso (mais detalhamento mecânico/industrial) e remoção da boca.

O problema: o timbot **já está publicado**, com as 25 variantes atuais já geradas e promovidas para `mod/`.
Reescrever o design dele por baixo não é uma correção — é substituir o conteúdo de uma espécie que já existe no
Workshop. Percebido isso, o Rodrigo pediu para reverter o `portrait.json` do timbot (`git checkout --`) e, em vez
disso, criar uma espécie nova reaproveitando todo o design já validado. `ssm_claudebot` nasceu assim: mesmo
conceito visual, paleta nova (coral + branco, referência ao Claude — quem ajudou a desenhar o conceito na sessão
—, em vez do branco + cyan original), sem imagem de referência (decisão consciente, para não ancorar a geração
num formato de visor só, o oposto do objetivo de 25 formatos distintos).

## Decisões de design (`ssm_claudebot`)

- **`species_classes: ["MACHINE"]`**, **`categories: ["machines", "synthetics", "cybernetics"]`**, **`rig:
  "ssm_shared"`** — idêntico às outras 4 espécies `MACHINE` do mod (`ssm_cyborg`, `ssm_green_order`,
  `ssm_new_order`, `ssm_timbot`); entra no mesmo `portrait_set` compartilhado por elas, sem criar set novo.
- **25 variantes `genderless`**, sem referência de imagem.
- **Paleta travada**: casco `Coral`, LED/luzes `White` — cor deixou de variar por indivíduo; quem diferencia
  cada um agora é só o par (formato de visor, símbolo do olho), único entre as 25.
- **Cabeça elíptica** (não esférica, não capacete separado) e **torso com detalhamento mecânico visível**
  (juntas, parafusos sextavados) em vez do acabamento "brinquedo liso" genérico do arquétipo `Robot` padrão.
- **Sem boca**: nem no rosto (`eyes.template`) nem na expressão (ver seção seguinte).

## A feature nova: `geracaoArt.base.fixed`

Ao tirar a boca do timbot, apareceu uma contradição que não dava para resolver só no `portrait.json` da espécie:
`fixed.expression` (`base.json`, compartilhado por **todas** as espécies do mod) presume lábios —
`"lips fully closed, flat closed lips, closed-mouth expression, neutral straight mouth..."`. Um robô sem boca
carregando ao mesmo tempo "sem boca" e "lábios fechados" no mesmo prompt positivo é uma contradição textual, e
`fixed.*` nunca teve mecanismo de override por espécie — sempre veio de `base.json`, ponto.

Em vez de reescrever o `fixed.expression` global (afetaria toda espécie humana do mod) ou aceitar a contradição,
o motor ganhou um override real, simétrico ao que já existia para `species` (só existe em `geracaoArt.base`,
mesma sintaxe de interpolação de um `template` de seção, "nível mais específico vence" — substitui o texto
inteiro, não concatena como `extra`):

```json
"fixed": {
  "expression": "calm neutral expression, relaxed face, soft friendly gaze, approachable, looking directly at the camera"
}
```

Implementação: `CHAVES_FIXAS` (as 5 chaves de `fixed`) migrou de `generate-art/base.ts` para
`portrait-schema/vocabulario.ts`, único lugar de onde tanto o schema do `portrait.json` quanto o schema do
próprio `base.json` conseguem importar sem ciclo. `schema.ts` ganhou `zFixo` (as 5 chaves, cada uma opcional,
mesma validação de sintaxe de um `template`). `merge.ts` passou a mesclar `fixed` pela mesma regra de `species`
(só a `base` declara). `prompt-builder.ts` resolve o override antes do texto de `base.json`, passando pelo mesmo
motor de interpolação (`interpolar`), então um override também pode citar `<secao.campo>` se precisar.
`validacao.ts` passou a ignorar `fixed` na checagem de cobertura de campo — os campos dela são texto (como
`template`/`extra`), não dado a ser referenciado.

`ssm_claudebot` é a primeira (e, até agora, única) espécie a usar esse override; `ssm_timbot`, revertido, voltou
a usar o `fixed.expression` global.

## Evolução do design depois da primeira versão

O resto da sessão foi iteração de conteúdo em cima da base acima, com três mudanças que valem registrar:

- **25 → 15 variantes.** O conjunto inicial de 25 pares (formato de visor × símbolo do olho) foi cortado pra 15,
  descartando os símbolos mais redundantes entre si (`v`/`n` perto demais de `^`/`u`, por exemplo) em favor dos
  mais legíveis/icônicos.
- **Paleta Coral → Terracotta.** `Terracotta` não existia no vocabulário (`CORES`, `portrait-schema/vocabulario.ts`)
  até essa sessão — foi adicionada (sem mapa de descrições nem entrada obrigatória em `base.json`, já que cor
  entra no prompt pelo próprio valor) especificamente pra dar ao claudebot um tom mais fiel à cor de marca do
  Claude do que `Coral` (que era só o mais próximo disponível antes).
- **Visor virou um formato só, fixo pra todas as 15** (retângulo horizontal largo, cantos arredondados) — o que
  variava por formato de visor passou a variar só por símbolo do olho, e os olhos deixaram de ser formas
  geométricas abstratas (anel, losango, cruz) pra virar ícones inspirados em caracteres ASCII/emoji (`O`, `#`,
  coração, nota musical, o "olhar de lado" `(¬_¬")`...) — ver `eyes.template`/`eyes.extra` de cada variante no
  `portrait.json` pro estado atual.

Duas lições de prompt engineering que vieram de testar de verdade no ComfyUI (não só no `-e`):

1. **Pedir "ASCII text characters"/"font"/"monospace" no prompt empurra o modelo pro caminho de renderizar texto
   de verdade** — que ele renderiza mal, mesmo pra um caractere só. A correção foi descrever cada olho como
   **ícone/forma gráfica** (`"a simple bold ring outline shape, like a capital letter O"`), com o caractere real
   só como referência de silhueta entre vírgulas, nunca como instrução de "escrever".
2. **Negação no positivo é frágil, e sem negativo real (modo `distilled`) não tem reforço nenhum.** A boca
   insistiu em aparecer mesmo com "no mouth" explícito no prompt — a correção que funcionou foi trocar a negação
   por descrição puramente afirmativa do que existe ("a completely smooth, blank, uninterrupted white
   faceplate..."), evitando a palavra "mouth" de propósito. Isso é o mesmo limite, por natureza, que faz a
   aderência à imagem de referência ser inconsistente no modo `distilled` (`CFG=1`, sem *classifier-free
   guidance*) — trocar pro modo `"base"` (CFG=5 real) resolveria os dois ao mesmo tempo, mas o Rodrigo optou por
   ficar no `distilled` (~5x mais rápido) e aceitar a inconsistência.

## A segunda feature nova: `referenceImage` por variante

Depois de a espécie ganhar referência de imagem no nível do gênero (pra ancorar consistência visual entre as 15),
apareceu o mesmo problema que motivou não usar referência nenhuma na primeira versão: a referência do gênero
"vencia" o texto sempre que a descrição do olho também puxava pro redondo, apagando a diferença entre variantes
que deveriam ser visualmente distintas. A correção não foi tirar a referência de novo — foi permitir que **uma
variante específica sobrescreva a referência do gênero com uma imagem dedicada, gerada já mostrando exatamente o
resultado que aquela variante pede** (o Rodrigo passou a gerar essas referências dedicadas com outro modelo,
fora deste pipeline, uma por variante problemática).

`geracaoArt.<gênero>.variantes.<chave>.referenceImage` — ao contrário da lista do gênero, é **uma imagem só**
(`z.string()`, não `z.array()`), e **substitui inteira** a lista do gênero pra aquela variante (mesma regra de
"mais específico vence" do `fixed` e de um `template`), nunca concatena. Implementação:

- `schema.ts`: `zVariante` ganhou o campo; a descrição de `referenceImage` no bloco de gênero foi atualizada pra
  deixar de dizer "sem override por variante".
- `generate-art/index.ts`: o upload de referência pro ComfyUI, que antes acontecia uma vez só por gênero (fora
  do loop de variantes), passou pra **dentro** do loop, resolvendo por variante — com um cache por caminho de
  arquivo, pra variantes que reaproveitam a mesma imagem (a do gênero, ou coincidentemente o mesmo override) não
  reenviarem o arquivo duas vezes.
- `validacao.ts`: passou a conferir também que o arquivo do override existe no disco, nomeando a variante no
  erro — mesma disciplina que já existia pra lista do gênero.
- 2 testes novos em `validacao.test.ts` (arquivo inexistente → erro nomeando a variante; arquivo existente →
  passa sem afetar as demais variantes do lote).

Na prática, das 15 variantes finais, 9 ganharam `referenceImage` própria (`001`, `002`... ver `portrait.json`
pra lista exata), cada uma apontando pra uma imagem gerada especificamente mostrando aquele símbolo de olho.

## O que ficou pra depois

Gerar as 15 imagens de verdade (`bun run art ssm_claudebot genderless`, sem `-e`) e promovê-las (`-p`) é decisão
e execução do Rodrigo — consome GPU local, fora do que a IA faz sozinha neste pipeline (ver
`docs/pipeline-generate-art.md`). Até lá, `bun run validate ssm_claudebot` acusa de propósito a contagem de PNGs
(0 de 15) — não é bug, é o estado esperado de uma espécie ainda sem arte gerada. `bun run taxonomy`/`bun run
portrait` (que registrariam a espécie em `common/` e no `mod/` de fato) também ficam para depois da arte existir,
para não deixar o mod referenciando um retrato sem textura.

Ver o estado atual dos dois overrides (`fixed` e `referenceImage` por variante) em `docs/pipeline-generate-art.md`.
