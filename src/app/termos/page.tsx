import type { Metadata } from "next";
import { LegalMail, LegalPage, LegalSection } from "@/components/storefront/legal-page";

export const metadata: Metadata = {
  title: "Termos e Condições de Uso | Cartori",
  description:
    "Termos de uso do Cartori.com.br, operado pela Cartore Express Ltda. Assessoria e intermediação documental — não somos cartório oficial.",
};

export default function TermosPage() {
  return (
    <LegalPage
      crumb="Termos de uso"
      kicker="Cartori.com.br"
      title="Termos e Condições de Uso"
      lede="Documento aplicável ao uso do site Cartori.com.br, operado pela CARTORE EXPRESS LTDA - EPP, CNPJ 57.448.583/0001-35, com sede em São Paulo - SP."
    >
      <LegalSection id="aviso-legal" title="1. Aviso legal e natureza dos serviços">
        <p>
          O site Cartori.com.br é operado e de propriedade da{" "}
          <strong>CARTORE EXPRESS LTDA - EPP</strong>, pessoa jurídica de direito privado,
          inscrita no CNPJ sob o nº <strong>57.448.583/0001-35</strong>, com sede na cidade de
          São Paulo - SP.
        </p>
        <p>
          O Cartori é uma empresa privada de assessoria e intermediação documental.{" "}
          <strong>Não somos</strong> um órgão governamental, Tribunal de Justiça, cartório
          oficial ou delegação do poder público. Prestamos um serviço de comodidade logística,
          que consiste em buscar, solicitar e realizar o pagamento de custas de certidões e
          documentos públicos junto aos órgãos competentes, mediante a cobrança de uma taxa de
          serviço.
        </p>
      </LegalSection>

      <LegalSection id="capacidade" title="2. Capacidade civil">
        <p>
          Os serviços oferecidos pelo Cartori são de uso estrito e exclusivo para pessoas
          físicas maiores de 18 (dezoito) anos e pessoas jurídicas. Ao utilizar nosso site e
          solicitar nossos serviços, o Usuário declara ter plena capacidade civil para aceitar
          estes Termos.
        </p>
      </LegalSection>

      <LegalSection id="objeto" title="3. Objeto dos serviços e logística de entrega">
        <p>
          Atuamos como intermediários para a emissão de certidões. A logística de entrega varia
          conforme o formato do documento solicitado:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Certidões digitais:</strong> o arquivo digital, emitido pelo órgão
            competente, é recepcionado por nossa equipe e repassado ao Usuário através do e-mail
            cadastrado ou pelo painel do site.
          </li>
          <li>
            <strong>Certidões físicas:</strong> a emissão e o envio físico do documento (via
            Correios ou transportadora) são de responsabilidade e execução exclusiva do órgão
            emissor (Cartório/Tribunal). O Cartori não possui controle sobre a logística, prazos
            de trânsito ou eventuais extravios das vias físicas após a postagem realizada pelo
            órgão.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="prazos" title="4. Prazos e responsabilidades">
        <p>
          O prazo estimado informado no site refere-se ao tempo médio de processamento. Por
          dependermos de sistemas governamentais e de cartórios terceiros, o Cartori não se
          responsabiliza por atrasos decorrentes de greves, inoperância de sistemas públicos ou
          exigências adicionais (diligências) feitas pelo cartório oficial para a emissão do
          documento.
        </p>
      </LegalSection>

      <LegalSection id="pagamentos" title="5. Pagamentos e processamento">
        <p>
          Todas as transações financeiras realizadas no site são processadas de forma segura por
          meio do gateway de pagamento Mercado Pago. O Cartori não tem acesso, não processa e
          não armazena os dados de cartão de crédito ou credenciais bancárias dos Usuários em
          seus próprios servidores.
        </p>
      </LegalSection>

      <LegalSection id="cancelamento" title="6. Política de cancelamento e arrependimento">
        <p>
          Em conformidade com o art. 49 do Código de Defesa do Consumidor, o Usuário tem o
          direito de cancelar o pedido em até 7 (sete) dias corridos. Contudo, excepciona-se o
          direito a reembolso total nos casos em que a prestação do serviço já tenha sido
          iniciada e os valores das taxas públicas (emolumentos cartorários) já tenham sido
          recolhidos ao cartório oficial, uma vez que tais taxas não são reembolsáveis pelo
          Estado. Neste cenário, não haverá estorno dos valores recolhidos aos cofres públicos.
        </p>
        <p>
          Para solicitações de suporte e cancelamento, o Usuário deve contatar o e-mail{" "}
          <LegalMail href="atendimento@cartori.com.br">atendimento@cartori.com.br</LegalMail>.
        </p>
      </LegalSection>

      <LegalSection id="foro" title="7. Foro de eleição">
        <p>
          Fica eleito o foro da Comarca de São Paulo, Estado de São Paulo, para dirimir
          quaisquer dúvidas ou litígios oriundos deste instrumento, com renúncia a qualquer
          outro, por mais privilegiado que seja.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
