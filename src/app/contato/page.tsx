import type { Metadata } from "next";
import { LegalMail, LegalPage, LegalSection } from "@/components/storefront/legal-page";

export const metadata: Metadata = {
  title: "Contato e suporte | Cartori",
  description:
    "Fale com o atendimento da Cartori ou com o encarregado de proteção de dados (DPO).",
};

export default function ContatoPage() {
  return (
    <LegalPage
      crumb="Contato"
      kicker="Suporte"
      title="Contato"
      lede="Canais oficiais da CARTORE EXPRESS LTDA - EPP, operadora do Cartori.com.br."
    >
      <LegalSection id="atendimento" title="Atendimento e cancelamentos">
        <p>
          Pedidos, prazos, diligências e cancelamento (art. 49 do CDC):{" "}
          <LegalMail href="atendimento@cartori.com.br">atendimento@cartori.com.br</LegalMail>.
        </p>
      </LegalSection>
      <LegalSection id="dpo" title="Proteção de dados (DPO)">
        <p>
          Acesso, correção, exclusão e demais direitos da LGPD:{" "}
          <LegalMail href="dpo@cartori.com.br">dpo@cartori.com.br</LegalMail>. Prazo de resposta:
          até 15 dias úteis.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
