import type { Metadata } from "next";
import { LegalMail, LegalPage, LegalSection } from "@/components/storefront/legal-page";

export const metadata: Metadata = {
  title: "Política de Privacidade (LGPD) | Cartori",
  description:
    "Como a Cartore Express Ltda. coleta, usa e protege dados pessoais no Cartori.com.br, em conformidade com a LGPD.",
};

export default function PrivacidadePage() {
  return (
    <LegalPage
      crumb="Privacidade"
      kicker="LGPD · Lei nº 13.709/2018"
      title="Política de Privacidade"
      lede="Esta política descreve como a CARTORE EXPRESS LTDA - EPP (CNPJ 57.448.583/0001-35), operadora do site Cartori.com.br, coleta, utiliza, compartilha e protege os dados pessoais dos Usuários."
    >
      <LegalSection id="publico" title="1. Público-alvo">
        <p>
          Nossos serviços são direcionados exclusivamente a maiores de 18 anos. Não coletamos
          intencionalmente dados de crianças ou adolescentes.
        </p>
      </LegalSection>

      <LegalSection id="dados" title="2. Quais dados coletamos e bases legais">
        <p>
          Para prestarmos nossos serviços, coletamos informações categorizadas da seguinte forma:
        </p>
        <ul className="list-disc pl-5 space-y-3">
          <li>
            <strong>Dados de cadastro e pedido (fornecidos por você):</strong> nome completo,
            CPF, e-mail, telefone, endereço de entrega e dados de filiação necessários
            exclusivamente para a busca da certidão (por exemplo: nome de pais/avós, estado
            civil, matrículas de imóveis).
            <br />
            <span className="text-neutral-600">
              Base legal: execução de contrato (art. 7º, V, da LGPD). É materialmente
              impossível localizar e emitir certidões junto aos órgãos públicos sem estes dados.
            </span>
          </li>
          <li>
            <strong>Dados de pagamento:</strong> transacionados via Mercado Pago. O Cartori
            retém apenas o status do pagamento e os dados de faturamento, sem armazenar os
            números do cartão de crédito.
            <br />
            <span className="text-neutral-600">
              Base legal: execução de contrato e obrigação legal (emissão de nota fiscal).
            </span>
          </li>
          <li>
            <strong>Dados de navegação e rastreamento (cookies e analytics):</strong>{" "}
            comportamento no site (cliques, mapas de calor, tempo na página, origem do tráfego)
            e identificadores de publicidade.
            <br />
            <span className="text-neutral-600">Base legal: consentimento e legítimo interesse.</span>
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="terceiros" title="3. Ferramentas de terceiros e rastreamento">
        <p>
          Para otimizar a experiência do Usuário e realizar campanhas de marketing, o site
          Cartori.com.br utiliza as seguintes tecnologias de terceiros, que podem coletar dados
          de navegação via cookies:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Google Analytics e Google Search Console:</strong> análise de tráfego,
            medição de audiência e desempenho do site.
          </li>
          <li>
            <strong>Microsoft Clarity:</strong> análise de usabilidade, com padrões de navegação
            e mapas de calor para identificar problemas na plataforma.
          </li>
          <li>
            <strong>Google Ads e Meta Ads (Facebook e Instagram):</strong> pixels e tags de
            conversão para exibir anúncios relevantes e medir o retorno das campanhas.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="compartilhamento" title="4. Com quem compartilhamos seus dados">
        <p>Os dados do Usuário jamais serão vendidos. O compartilhamento ocorre de forma restrita e justificada com:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Órgãos emissores</strong> (cartórios, tribunais e registros públicos): para
            a emissão oficial do documento. No caso de vias físicas, os dados de endereço são
            repassados a eles para viabilizar a postagem.
          </li>
          <li>
            <strong>Mercado Pago:</strong> processador financeiro responsável pela validação e
            cobrança segura.
          </li>
          <li>
            <strong>Plataformas de marketing</strong> (Google, Meta e Microsoft): apenas dados
            de navegação e cookies, de forma anonimizada ou pseudonimizada, para as finalidades
            do item 3.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="retencao" title="5. Retenção e minimização de dados">
        <p>Os dados fornecidos são armazenados em ambiente seguro. Regras de descarte:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Certidões digitais:</strong> o PDF da certidão digital gerada pelo cartório
            é mantido para o repasse ao Usuário e será total e definitivamente excluído de
            nossos servidores e bancos de dados em exatos 30 (trinta) dias após a entrega.
          </li>
          <li>
            <strong>Dados de cadastro:</strong> mantidos enquanto a conta estiver ativa ou pelo
            período necessário para cumprir obrigações legais (como a guarda de registros de
            acesso por 6 meses, exigida pelo Marco Civil da Internet).
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="direitos" title="6. Direitos do titular dos dados">
        <p>Em conformidade com o art. 18 da LGPD, você pode solicitar a qualquer momento:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>acesso, correção ou atualização de dados incompletos ou desatualizados;</li>
          <li>a revogação do consentimento para uso de cookies de marketing;</li>
          <li>
            a exclusão da conta e dos dados armazenados (desde que a manutenção não seja exigida
            por lei ou para a defesa da empresa em processos judiciais).
          </li>
        </ul>
        <p>
          Para exercer seus direitos, fazer solicitações relativas aos seus dados ou tirar
          dúvidas sobre esta política, entre em contato com nosso Encarregado de Proteção de
          Dados (DPO) pelo e-mail{" "}
          <LegalMail href="dpo@cartori.com.br">dpo@cartori.com.br</LegalMail>. Prazo de resposta:
          até 15 dias úteis, conforme regulamentação da ANPD.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
