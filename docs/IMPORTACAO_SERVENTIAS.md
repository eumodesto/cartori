# Importação de serventias (cartórios) do CNJ

Preenche a tabela `Cartorio` com nome, atribuições, município, endereço, telefone e
e-mail de todas as serventias extrajudiciais ativas do país. A Consulta de cartórios
da Gestão B2B (`/painel/cartorios`) lê essa tabela antes da lista embutida.

Script: `scripts/import-serventias-cnj.mjs` (testes em `tests/unit/import-serventias-cnj.test.ts`).

## Fonte

- **Justiça Aberta**, Corregedoria Nacional de Justiça (CNJ): consulta pública
  "Produtividade e localização de serventias extrajudiciais"
  (https://justicaaberta.cnj.jus.br/). O script chama a mesma API que a página usa
  (`POST https://justicaabertaapi.cnj.jus.br/v1/api/serventias`), sem login.
- Os dados são declarados pelos próprios cartórios ao CNJ. Podem estar desatualizados
  num ou noutro caso; o script não corrige nem completa nada à mão.
- Licença: o CNJ publica para consulta pública e não declara licença aberta
  específica. Uso aqui: consulta interna B2B, com a fonte citada. A Amanda continua
  proibida de indicar órgão oficial ao cliente.
- Conferido em 19/10/2026: 16.269 registros, 12.012 ativos com atribuição;
  99,9% com telefone, 100% com endereço e e-mail.

## O que o script faz

- Baixa por UF (1000 por página, pausa de 0,5 s entre páginas, ~1 min no total).
- Ignora serventias com status "Inativo" e registros sem atribuição (corregedorias).
- Município: nome oficial do IBGE (`src/lib/ibge-localidades.json`). No DF tudo vira
  "Brasília" (Taguatinga, Gama etc. são regiões administrativas, não municípios).
- Atribuições → códigos de `src/lib/cartorio-attributions.ts` (`REGISTRO_CIVIL`,
  `NOTAS`, `IMOVEIS`, `PROTESTO`, `EMPRESAS`, `OUTROS`).
- Upsert por CNS em lotes. Rodar de novo só atualiza. Endereço, telefone e e-mail
  vazios na fonte **não apagam** o que já está no banco. `officialName` e
  `officialInCharge` não são tocados. Nenhuma linha é apagada (`OrderItem` aponta
  para `Cartorio.id`).
- Recusa qualquer banco que não seja `localhost/cartori_test` sem `--allow-remote`.

## Testar localmente

```bash
npm run db:test:up
npm run db:test:migrate
node scripts/import-serventias-cnj.mjs --dry-run
node scripts/import-serventias-cnj.mjs
```

Sem `DATABASE_URL`, o script grava no banco de teste do Docker.

## Rodar em produção (dono do projeto)

1. Conferir antes, sem gravar nada:

   ```bash
   node scripts/import-serventias-cnj.mjs --dry-run
   ```

2. Gravar no Supabase. O script usa `DATABASE_URL_UNPOOLED` (conexão direta) se
   existir, senão `DATABASE_URL`. Com o `.env` de produção na raiz:

   ```bash
   node --env-file=.env scripts/import-serventias-cnj.mjs --allow-remote
   ```

   No fim ele mostra quantas linhas a tabela tem e quantas têm telefone, endereço e
   e-mail.

Para atualizar depois (cartório mudou de telefone, serventia nova), é só rodar o
mesmo comando de novo. Opções úteis: `--uf SP,RJ` (só essas UFs),
`--save arq.json` / `--from-file arq.json` (guardar e reaproveitar o download).
O arquivo salvo traz nome de titulares e substitutos: não commitar.
