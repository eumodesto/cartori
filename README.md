# InterJuri

Plataforma InterJuri para solicitação e operação de certidões cartoriais.

## Desenvolvimento local

```bash
npm ci
npm run dev
```

O servidor local usa `http://localhost:3006`.

## Validação

```bash
npm run typecheck
npm run lint
npm test
```

Para testes de banco, use um PostgreSQL efêmero:

```bash
npm run db:test:up
npm run db:test:reset
npm run test:db
npm run db:test:down
```

## Banco e ambiente

- Runtime usa `DATABASE_URL` (pooler); migrations usam `DATABASE_URL_UNPOOLED`.
- Migrations são aplicadas com `npm run db:migrate`.
- Nunca use `prisma db push` em banco compartilhado.
- Nunca commite `.env`, tokens ou chaves de provedores.

## Regras arquiteturais obrigatórias

- Identidade canônica: Supabase Auth → `User.authId`.
- Autorização: server-side e fail-closed.
- Tenant empresarial: `OrganizationMember` com status `ACTIVE`.
- Pedido B2C: acesso pelo `Order.userId`; `organizationId` é contexto, não ACL universal.
- Pagamento: valor e status são determinados pelo servidor/Mercado Pago.

O inventário atual, limitações conhecidas e a ordem de recuperação estão em [`docs/INVENTARIO_PLATAFORMA.md`](docs/INVENTARIO_PLATAFORMA.md).
