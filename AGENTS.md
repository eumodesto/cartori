<!-- BEGIN:cartori-invariants -->
# Invariantes Cartori

- `authId` (Supabase Auth → `User.authId`) é a identidade canônica.
- Conhecer um UUID não concede acesso.
- O browser não define privilégio (`role`, `userId`, `organizationId` no body são ignorados).
- Autorização é server-side (`requireAuth` / policy). Fail-closed.
- `User.role` é papel de plataforma (`CLIENT` | `OPERATOR` | `ADMIN`). Não confundir com `OrganizationMemberRole.ADMIN`.
- Tenant empresarial = `OrganizationMember` **ACTIVE**. Não existe FK `User.organizationId`.
- Organization ≠ Partner. Membership ≠ Partner.
- `Order.organizationId` é contexto, não ACL universal. Pedido B2C: `order.userId === context.userId`.
- Pagamento é server-authoritative (valor e status vêm do servidor / Mercado Pago).
- Nunca commitar secrets.

Procedimentos: `.agents/skills/`.
<!-- END:cartori-invariants -->
