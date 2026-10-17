import { CreditCard, FileSearch, ListChecks, Mailbox, Send } from "lucide-react";

const STEPS = [
  {
    icon: FileSearch,
    title: "Escolha a certidão",
    text: "Selecione o tipo, o estado, a cidade e o cartório. Se não souber o cartório, é só sinalizar: nossa equipe localiza.",
  },
  {
    icon: ListChecks,
    title: "Preencha e revise",
    text: "Informe os dados do documento. Junte quantas certidões precisar, de cartórios diferentes, em um só pedido.",
  },
  {
    icon: CreditCard,
    title: "Crie a conta e pague",
    text: "Pagamento por PIX ou cartão, processado pelo Mercado Pago. O valor reúne as custas do cartório e o nosso serviço.",
  },
  {
    icon: Send,
    title: "Nós fazemos o pedido",
    text: "A InterJuri solicita a certidão ao cartório em seu nome. Se o cartório pedir algum dado a mais, avisamos no painel.",
  },
  {
    icon: Mailbox,
    title: "Receba a certidão",
    text: "A via digital chega no painel e por e-mail. A via em papel é enviada pelo cartório, pelos Correios.",
  },
] as const;

/** Etapas do pedido, alinhadas aos Termos de Uso e à Política de Privacidade. */
export function HowItWorks() {
  return (
    <section id="como-funciona" className="scroll-mt-32 py-16 bg-neutral-0 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <span className="text-xs uppercase font-bold tracking-widest text-primary-700 bg-primary-50 px-3 py-1 rounded-full border border-primary-200">
            Passo a passo
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 font-serif">Como funciona</h2>
          <p className="text-sm text-slate-600">
            Do pedido à entrega, você acompanha cada etapa pelo painel da sua conta.
          </p>
        </div>

        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <li key={step.title} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-700 border border-primary-200">
                    <Icon className="w-5 h-5" aria-hidden />
                  </span>
                  <span className="text-xs font-bold text-slate-400">{String(index + 1).padStart(2, "0")}</span>
                </div>
                <h3 className="text-sm font-semibold text-slate-900">{step.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{step.text}</p>
              </li>
            );
          })}
        </ol>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 leading-relaxed">
          <p className="rounded-xl bg-slate-50 border border-slate-200 p-4">
            <strong className="text-slate-900">Empresa privada.</strong> A InterJuri não é cartório nem órgão
            público. Quem emite a certidão é o cartório responsável, e você também pode pedir diretamente a ele.
          </p>
          <p className="rounded-xl bg-slate-50 border border-slate-200 p-4">
            <strong className="text-slate-900">Prazos estimados.</strong> Cada certidão mostra o prazo médio, que
            depende do cartório e de eventuais exigências dele.
          </p>
          <p className="rounded-xl bg-slate-50 border border-slate-200 p-4">
            <strong className="text-slate-900">Guarde o seu PDF.</strong> O arquivo digital fica no painel por 30
            dias após a entrega. Cancelamento em até 7 dias, exceto custas já pagas ao cartório.{" "}
            <a href="/termos" className="font-semibold text-primary-700 underline underline-offset-2">
              Termos
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
