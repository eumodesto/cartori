# Estado saudável da plataforma

Este documento é o plano operacional para recuperar e manter o Cartori em um estado coerente. O código e as migrations são a fonte de verdade de comportamento; este arquivo registra decisões, riscos e ordem de execução.

## Ordem de recuperação

1. **Documentação:** remover referências a arquivos/rotas inexistentes e manter o README executável.
2. **Validação:** manter typecheck, lint, Vitest e testes de banco verdes no CI.
3. **Catálogo:** reduzir o fallback silencioso e garantir que preço de checkout venha do catálogo servidor.
4. **Autorização:** manter `authId`, membership `ACTIVE` e ownership de pedido; não abrir acesso org-wide sem uma política explícita.
5. **Pagamentos:** configurar segredo do webhook, tratar estorno/chargeback e substituir locks locais por coordenação persistente.
6. **Operação:** limitar dados visíveis por operador e implementar reenvio da outbox de e-mail.
7. **Legados:** decidir remoção ou uso de `PlatformAuditLog`, `User.staffPermissions` e do alias `/api/org/partner` por migration/versão de API.

## Estado atual

- CI existe em `.github/workflows/ci.yml`.
- Testes unitários e de banco existem em `tests/`.
- `npm run dev` expõe a porta `3006`.
- Catálogo usa banco com fallback estático; produtos informam a origem internamente e a rota de cartórios informa `source`/`fallback`. O fallback ainda deve ser temporário e não pode virar autoridade silenciosa.
- Boleto e `B2B_INVOICE` estão no domínio, mas não estão implementados no checkout.
- O painel B2B de equipe/financeiro continua placeholder.

## Critérios de aceite para alterações

- Nenhuma alteração de authz lê `role`, `userId` ou `organizationId` do body como autoridade.
- Nenhuma alteração de pedido permite acesso apenas por UUID ou `organizationId`.
- Nenhuma alteração de pagamento confia em valor/status enviados pelo browser.
- Migrations novas passam pelo banco efêmero, `npm run test:db` e `npm run typecheck`.
- Documentação nova aponta para caminhos existentes e distingue implementado, placeholder, futuro e legado.
