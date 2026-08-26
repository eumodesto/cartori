import Link from "next/link";
import { ShieldCheck, Lock, Award, Building, CheckCircle2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Col 1 */}
          <div className="space-y-4">
            <span className="text-2xl font-black tracking-tight text-white font-serif">
              CARTORI<span className="text-amber-400">.</span>
            </span>
            <p className="text-xs text-slate-400 leading-relaxed">
              Plataforma tecnológica especializada em gestão, busca e solicitação centralizada de certidões em cartórios de todo o Brasil.
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs text-slate-400">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Conexão Segura SSL 256-Bit e Assinatura Digital ICP-Brasil</span>
            </div>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Certidões Principais
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link href="/solicitar/certidao-de-nascimento" className="hover:text-amber-400 transition-colors">Certidão de Nascimento</Link></li>
              <li><Link href="/solicitar/certidao-de-casamento" className="hover:text-amber-400 transition-colors">Certidão de Casamento</Link></li>
              <li><Link href="/solicitar/certidao-de-obito" className="hover:text-amber-400 transition-colors">Certidão de Óbito</Link></li>
              <li><Link href="/solicitar/certidao-negativa-de-testamento" className="hover:text-amber-400 transition-colors">Negativa de Testamento (CENSEC)</Link></li>
              <li><Link href="/solicitar/certidao-de-matricula-de-imovel" className="hover:text-amber-400 transition-colors">Matrícula de Imóvel</Link></li>
              <li><Link href="/solicitar/certidao-de-protesto" className="hover:text-amber-400 transition-colors">Certidão de Protesto</Link></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Soluções B2B
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link href="#b2b" className="hover:text-amber-400 transition-colors">Escritórios de Advocacia</Link></li>
              <li><Link href="#b2b" className="hover:text-amber-400 transition-colors">Imobiliárias & Construtoras</Link></li>
              <li><Link href="#b2b" className="hover:text-amber-400 transition-colors">Pedidos em Lote & Multi-Itens</Link></li>
              <li><Link href="#b2b" className="hover:text-amber-400 transition-colors">Faturamento Consolidado</Link></li>
              <li><Link href="#b2b" className="hover:text-amber-400 transition-colors">Gestão por Processo / Imóvel</Link></li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Pagamento & Segurança
            </h4>
            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-3">
              <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold">
                <Lock className="w-4 h-4" />
                <span>Processamento Oficial Mercado Pago</span>
              </div>
              <p className="text-[11px] text-slate-400">
                PIX Instantâneo com QR Code dinâmico, Cartão de Crédito e Boleto com compensação automática.
              </p>
              <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-medium pt-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>CNPJ 100% Regularizado</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} CARTORI. Todos os direitos reservados.</p>
          <div className="flex items-center gap-6">
            <Link href="/termos" className="hover:text-slate-400">Termos de Uso</Link>
            <Link href="/privacidade" className="hover:text-slate-400">Privacidade (LGPD)</Link>
            <Link href="/contato" className="hover:text-slate-400">Suporte ao Cliente</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
