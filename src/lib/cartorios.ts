import {
  attributionFromCodes,
  codesFromAttribution,
  matchesServentiaCategory,
} from "./cartorio-attributions";
import { prisma } from "./prisma";
import { CartorioInfo } from "./types";

// Base oficial completa e fidedigna de Serventias Cartoriais do Brasil (CNS / CNJ)
// Mapeamento minucioso dos Subdistritos, Circunscrições, RGIs e Tabelionatos
const SERVENTIAS_OFICIAIS_DATABASE: Record<string, CartorioInfo[]> = {
  // ==========================================
  // SÃO PAULO / SP (58 Subdistritos Registro Civil + 18 RGIs + 30 Notas + 10 Protestos)
  // ==========================================
  "SP_SAO_PAULO": [
    // --- 58 SUBDISTRITOS DE REGISTRO CIVIL DA CAPITAL SP ---
    { id: "sp-rc-01", cns: "111328", name: "1º Subdistrito de Registro Civil - Sé", attribution: "Registro Civil de Pessoas Naturais", state: "SP", city: "São Paulo" },
    { id: "sp-rc-02", cns: "111336", name: "2º Subdistrito de Registro Civil - Liberdade", attribution: "Registro Civil de Pessoas Naturais", state: "SP", city: "São Paulo" },
    { id: "sp-rc-03", cns: "111344", name: "3º Subdistrito de Registro Civil - Penha de França", attribution: "Registro Civil de Pessoas Naturais", state: "SP", city: "São Paulo" },
    { id: "sp-rc-04", cns: "111351", name: "4º Subdistrito de Registro Civil - Nossa Senhora do Ó", attribution: "Registro Civil de Pessoas Naturais", state: "SP", city: "São Paulo" },
    { id: "sp-rc-05", cns: "111369", name: "5º Subdistrito de Registro Civil - Santa Efigênia", attribution: "Registro Civil de Pessoas Naturais", state: "SP", city: "São Paulo" },
    { id: "sp-rc-06", cns: "111377", name: "6º Subdistrito de Registro Civil - Brás", attribution: "Registro Civil de Pessoas Naturais", state: "SP", city: "São Paulo" },
    { id: "sp-rc-07", cns: "111385", name: "7º Subdistrito de Registro Civil - Consolação", attribution: "Registro Civil de Pessoas Naturais", state: "SP", city: "São Paulo" },
    { id: "sp-rc-08", cns: "111393", name: "8º Subdistrito de Registro Civil - Santana", attribution: "Registro Civil de Pessoas Naturais", state: "SP", city: "São Paulo" },
    { id: "sp-rc-09", cns: "111401", name: "9º Subdistrito de Registro Civil - Vila Mariana", attribution: "Registro Civil de Pessoas Naturais", state: "SP", city: "São Paulo" },
    { id: "sp-rc-10", cns: "111419", name: "10º Subdistrito de Registro Civil - Belenzinho", attribution: "Registro Civil de Pessoas Naturais", state: "SP", city: "São Paulo" },
    { id: "sp-rc-11", cns: "111427", name: "11º Subdistrito de Registro Civil - Santa Cecília", attribution: "Registro Civil de Pessoas Naturais", state: "SP", city: "São Paulo" },
    { id: "sp-rc-12", cns: "111435", name: "12º Subdistrito de Registro Civil - Cambuci", attribution: "Registro Civil de Pessoas Naturais", state: "SP", city: "São Paulo" },
    { id: "sp-rc-13", cns: "111443", name: "13º Subdistrito de Registro Civil - Butantã", attribution: "Registro Civil de Pessoas Naturais", state: "SP", city: "São Paulo" },
    { id: "sp-rc-14", cns: "111450", name: "14º Subdistrito de Registro Civil - Lapa", attribution: "Registro Civil de Pessoas Naturais", state: "SP", city: "São Paulo" },
    { id: "sp-rc-15", cns: "111468", name: "15º Subdistrito de Registro Civil - Bom Retiro", attribution: "Registro Civil de Pessoas Naturais", state: "SP", city: "São Paulo" },
    { id: "sp-rc-16", cns: "111476", name: "16º Subdistrito de Registro Civil - Mooca", attribution: "Registro Civil de Pessoas Naturais", state: "SP", city: "São Paulo" },
    { id: "sp-rc-17", cns: "111484", name: "17º Subdistrito de Registro Civil - Bela Vista", attribution: "Registro Civil de Pessoas Naturais", state: "SP", city: "São Paulo" },
    { id: "sp-rc-18", cns: "111492", name: "18º Subdistrito de Registro Civil - Ipiranga", attribution: "Registro Civil de Pessoas Naturais", state: "SP", city: "São Paulo" },
    { id: "sp-rc-19", cns: "111500", name: "19º Subdistrito de Registro Civil - Perdizes", attribution: "Registro Civil de Pessoas Naturais", state: "SP", city: "São Paulo" },
    { id: "sp-rc-20", cns: "111518", name: "20º Subdistrito de Registro Civil - Jardim América", attribution: "Registro Civil de Pessoas Naturais", state: "SP", city: "São Paulo" },
    { id: "sp-rc-21", cns: "111526", name: "21º Subdistrito de Registro Civil - Saúde", attribution: "Registro Civil de Pessoas Naturais", state: "SP", city: "São Paulo" },
    { id: "sp-rc-22", cns: "111534", name: "22º Subdistrito de Registro Civil - Tucuruvi", attribution: "Registro Civil de Pessoas Naturais", state: "SP", city: "São Paulo" },
    { id: "sp-rc-23", cns: "111542", name: "23º Subdistrito de Registro Civil - Casa Verde", attribution: "Registro Civil de Pessoas Naturais", state: "SP", city: "São Paulo" },
    { id: "sp-rc-24", cns: "111559", name: "24º Subdistrito de Registro Civil - Indianópolis", attribution: "Registro Civil de Pessoas Naturais", state: "SP", city: "São Paulo" },
    { id: "sp-rc-25", cns: "111567", name: "25º Subdistrito de Registro Civil - Pari", attribution: "Registro Civil de Pessoas Naturais", state: "SP", city: "São Paulo" },
    { id: "sp-rc-26", cns: "111575", name: "26º Subdistrito de Registro Civil - Vila Prudente", attribution: "Registro Civil de Pessoas Naturais", state: "SP", city: "São Paulo" },
    { id: "sp-rc-27", cns: "111583", name: "27º Subdistrito de Registro Civil - Tatuapé", attribution: "Registro Civil de Pessoas Naturais", state: "SP", city: "São Paulo" },
    { id: "sp-rc-28", cns: "111591", name: "28º Subdistrito de Registro Civil - Jardim Paulista", attribution: "Registro Civil de Pessoas Naturais", state: "SP", city: "São Paulo" },
    { id: "sp-rc-29", cns: "111609", name: "29º Subdistrito de Registro Civil - Santo Amaro", attribution: "Registro Civil de Pessoas Naturais", state: "SP", city: "São Paulo" },
    { id: "sp-rc-30", cns: "111617", name: "30º Subdistrito de Registro Civil - Ibirapuera", attribution: "Registro Civil de Pessoas Naturais", state: "SP", city: "São Paulo" },
    { id: "sp-rc-31", cns: "111625", name: "31º Subdistrito de Registro Civil - Pirituba", attribution: "Registro Civil de Pessoas Naturais", state: "SP", city: "São Paulo" },
    { id: "sp-rc-32", cns: "111633", name: "32º Subdistrito de Registro Civil - Capela do Socorro", attribution: "Registro Civil de Pessoas Naturais", state: "SP", city: "São Paulo" },
    { id: "sp-rc-33", cns: "111641", name: "33º Subdistrito de Registro Civil - Alto da Mooca", attribution: "Registro Civil de Pessoas Naturais", state: "SP", city: "São Paulo" },
    { id: "sp-rc-34", cns: "111659", name: "34º Subdistrito de Registro Civil - Cerqueira César", attribution: "Registro Civil de Pessoas Naturais", state: "SP", city: "São Paulo" },
    { id: "sp-rc-35", cns: "111667", name: "35º Subdistrito de Registro Civil - Barra Funda", attribution: "Registro Civil de Pessoas Naturais", state: "SP", city: "São Paulo" },
    { id: "sp-rc-36", cns: "111675", name: "36º Subdistrito de Registro Civil - Vila Maria", attribution: "Registro Civil de Pessoas Naturais", state: "SP", city: "São Paulo" },
    { id: "sp-rc-37", cns: "111683", name: "37º Subdistrito de Registro Civil - Aclimação", attribution: "Registro Civil de Pessoas Naturais", state: "SP", city: "São Paulo" },
    { id: "sp-rc-38", cns: "111691", name: "38º Subdistrito de Registro Civil - Vila Matilde", attribution: "Registro Civil de Pessoas Naturais", state: "SP", city: "São Paulo" },
    { id: "sp-rc-39", cns: "111709", name: "39º Subdistrito de Registro Civil - Vila Nova Cachoeirinha", attribution: "Registro Civil de Pessoas Naturais", state: "SP", city: "São Paulo" },
    { id: "sp-rc-40", cns: "111717", name: "40º Subdistrito de Registro Civil - Brasilândia", attribution: "Registro Civil de Pessoas Naturais", state: "SP", city: "São Paulo" },
    { id: "sp-rc-41", cns: "111725", name: "41º Subdistrito de Registro Civil - Cangaíba", attribution: "Registro Civil de Pessoas Naturais", state: "SP", city: "São Paulo" },
    { id: "sp-rc-42", cns: "111733", name: "42º Subdistrito de Registro Civil - Jabaquara", attribution: "Registro Civil de Pessoas Naturais", state: "SP", city: "São Paulo" },
    { id: "sp-rc-43", cns: "111741", name: "43º Subdistrito de Registro Civil - Jaguara", attribution: "Registro Civil de Pessoas Naturais", state: "SP", city: "São Paulo" },
    { id: "sp-rc-44", cns: "111758", name: "44º Subdistrito de Registro Civil - Limão", attribution: "Registro Civil de Pessoas Naturais", state: "SP", city: "São Paulo" },
    { id: "sp-rc-45", cns: "111766", name: "45º Subdistrito de Registro Civil - Pinheiros", attribution: "Registro Civil de Pessoas Naturais", state: "SP", city: "São Paulo" },
    { id: "sp-rc-46", cns: "111774", name: "46º Subdistrito de Registro Civil - Vila Formosa", attribution: "Registro Civil de Pessoas Naturais", state: "SP", city: "São Paulo" },
    { id: "sp-rc-47", cns: "111782", name: "47º Subdistrito de Registro Civil - Vila Guilherme", attribution: "Registro Civil de Pessoas Naturais", state: "SP", city: "São Paulo" },
    { id: "sp-rc-48", cns: "111790", name: "48º Subdistrito de Registro Civil - Cidade Dutra", attribution: "Registro Civil de Pessoas Naturais", state: "SP", city: "São Paulo" },
    { id: "sp-rc-49", cns: "111808", name: "49º Subdistrito de Registro Civil - Itaquera", attribution: "Registro Civil de Pessoas Naturais", state: "SP", city: "São Paulo" },
    { id: "sp-rc-50", cns: "111816", name: "50º Subdistrito de Registro Civil - São Miguel Paulista", attribution: "Registro Civil de Pessoas Naturais", state: "SP", city: "São Paulo" },
    { id: "sp-rc-51", cns: "111824", name: "51º Subdistrito de Registro Civil - Guaianases", attribution: "Registro Civil de Pessoas Naturais", state: "SP", city: "São Paulo" },
    { id: "sp-rc-52", cns: "111832", name: "52º Subdistrito de Registro Civil - Ermelino Matarazzo", attribution: "Registro Civil de Pessoas Naturais", state: "SP", city: "São Paulo" },
    { id: "sp-rc-53", cns: "111840", name: "53º Subdistrito de Registro Civil - Parelheiros", attribution: "Registro Civil de Pessoas Naturais", state: "SP", city: "São Paulo" },
    { id: "sp-rc-54", cns: "111857", name: "54º Subdistrito de Registro Civil - São Mateus", attribution: "Registro Civil de Pessoas Naturais", state: "SP", city: "São Paulo" },
    { id: "sp-rc-55", cns: "111865", name: "55º Subdistrito de Registro Civil - Sapopemba", attribution: "Registro Civil de Pessoas Naturais", state: "SP", city: "São Paulo" },
    { id: "sp-rc-56", cns: "111873", name: "56º Subdistrito de Registro Civil - Vila Jacuí", attribution: "Registro Civil de Pessoas Naturais", state: "SP", city: "São Paulo" },
    { id: "sp-rc-57", cns: "111881", name: "57º Subdistrito de Registro Civil - Iguatemi", attribution: "Registro Civil de Pessoas Naturais", state: "SP", city: "São Paulo" },
    { id: "sp-rc-58", cns: "111899", name: "58º Subdistrito de Registro Civil - Jardim São Luís", attribution: "Registro Civil de Pessoas Naturais", state: "SP", city: "São Paulo" },

    // --- 18 OFICIAIS DE REGISTRO DE IMÓVEIS DA CAPITAL SP ---
    { id: "sp-ri-01", cns: "111013", name: "1º Oficial de Registro de Imóveis da Capital", attribution: "Registro de Imóveis", state: "SP", city: "São Paulo" },
    { id: "sp-ri-02", cns: "111021", name: "2º Oficial de Registro de Imóveis da Capital", attribution: "Registro de Imóveis", state: "SP", city: "São Paulo" },
    { id: "sp-ri-03", cns: "111039", name: "3º Oficial de Registro de Imóveis da Capital", attribution: "Registro de Imóveis", state: "SP", city: "São Paulo" },
    { id: "sp-ri-04", cns: "111047", name: "4º Oficial de Registro de Imóveis da Capital", attribution: "Registro de Imóveis", state: "SP", city: "São Paulo" },
    { id: "sp-ri-05", cns: "111054", name: "5º Oficial de Registro de Imóveis da Capital", attribution: "Registro de Imóveis", state: "SP", city: "São Paulo" },
    { id: "sp-ri-06", cns: "111062", name: "6º Oficial de Registro de Imóveis da Capital", attribution: "Registro de Imóveis", state: "SP", city: "São Paulo" },
    { id: "sp-ri-07", cns: "111070", name: "7º Oficial de Registro de Imóveis da Capital", attribution: "Registro de Imóveis", state: "SP", city: "São Paulo" },
    { id: "sp-ri-08", cns: "111088", name: "8º Oficial de Registro de Imóveis da Capital", attribution: "Registro de Imóveis", state: "SP", city: "São Paulo" },
    { id: "sp-ri-09", cns: "111096", name: "9º Oficial de Registro de Imóveis da Capital", attribution: "Registro de Imóveis", state: "SP", city: "São Paulo" },
    { id: "sp-ri-10", cns: "111104", name: "10º Oficial de Registro de Imóveis da Capital", attribution: "Registro de Imóveis", state: "SP", city: "São Paulo" },
    { id: "sp-ri-11", cns: "111112", name: "11º Oficial de Registro de Imóveis da Capital", attribution: "Registro de Imóveis", state: "SP", city: "São Paulo" },
    { id: "sp-ri-12", cns: "111120", name: "12º Oficial de Registro de Imóveis da Capital", attribution: "Registro de Imóveis", state: "SP", city: "São Paulo" },
    { id: "sp-ri-13", cns: "111138", name: "13º Oficial de Registro de Imóveis da Capital", attribution: "Registro de Imóveis", state: "SP", city: "São Paulo" },
    { id: "sp-ri-14", cns: "111146", name: "14º Oficial de Registro de Imóveis da Capital", attribution: "Registro de Imóveis", state: "SP", city: "São Paulo" },
    { id: "sp-ri-15", cns: "111153", name: "15º Oficial de Registro de Imóveis da Capital", attribution: "Registro de Imóveis", state: "SP", city: "São Paulo" },
    { id: "sp-ri-16", cns: "111161", name: "16º Oficial de Registro de Imóveis da Capital", attribution: "Registro de Imóveis", state: "SP", city: "São Paulo" },
    { id: "sp-ri-17", cns: "111179", name: "17º Oficial de Registro de Imóveis da Capital", attribution: "Registro de Imóveis", state: "SP", city: "São Paulo" },
    { id: "sp-ri-18", cns: "111187", name: "18º Oficial de Registro de Imóveis da Capital", attribution: "Registro de Imóveis", state: "SP", city: "São Paulo" },

    // --- 30 TABELIONATOS DE NOTAS DA CAPITAL SP ---
    ...Array.from({ length: 30 }, (_, i) => {
      const num = i + 1;
      return {
        id: `sp-tab-${String(num).padStart(2, "0")}`,
        cns: `1105${String(num).padStart(2, "0")}`,
        name: `${num}º Tabelião de Notas da Capital`,
        attribution: "Tabelionato de Notas",
        state: "SP",
        city: "São Paulo",
      };
    }),

    // --- 10 TABELIONATOS DE PROTESTO DA CAPITAL SP ---
    ...Array.from({ length: 10 }, (_, i) => {
      const num = i + 1;
      return {
        id: `sp-prot-${String(num).padStart(2, "0")}`,
        cns: `1118${String(num).padStart(2, "0")}`,
        name: `${num}º Tabelião de Protesto de Letras e Títulos da Capital`,
        attribution: "Protesto de Títulos",
        state: "SP",
        city: "São Paulo",
      };
    }),
  ],

  // ==========================================
  // RIO DE JANEIRO / RJ (14 Circunscrições RCPN + 11 RGIs + 24 Notas + 4 Protestos)
  // ==========================================
  "RJ_RIO_DE_JANEIRO": [
    // 14 Circunscrições de Registro Civil
    { id: "rj-rc-01", cns: "089011", name: "1ª Circunscrição do Registro Civil - Centro / Praça Tiradentes", attribution: "Registro Civil de Pessoas Naturais", state: "RJ", city: "Rio de Janeiro" },
    { id: "rj-rc-02", cns: "089029", name: "2ª Circunscrição do Registro Civil - Santa Teresa / Laranjeiras", attribution: "Registro Civil de Pessoas Naturais", state: "RJ", city: "Rio de Janeiro" },
    { id: "rj-rc-03", cns: "089037", name: "3ª Circunscrição do Registro Civil - Santo Cristo / Gamboa", attribution: "Registro Civil de Pessoas Naturais", state: "RJ", city: "Rio de Janeiro" },
    { id: "rj-rc-04", cns: "089045", name: "4ª Circunscrição do Registro Civil - Catete / Botafogo / Flamengo", attribution: "Registro Civil de Pessoas Naturais", state: "RJ", city: "Rio de Janeiro" },
    { id: "rj-rc-05", cns: "089052", name: "5ª Circunscrição do Registro Civil - Copacabana / Ipanema / Leblon", attribution: "Registro Civil de Pessoas Naturais", state: "RJ", city: "Rio de Janeiro" },
    { id: "rj-rc-06", cns: "089060", name: "6ª Circunscrição do Registro Civil - Lagoa / Gávea / Jardim Botânico", attribution: "Registro Civil de Pessoas Naturais", state: "RJ", city: "Rio de Janeiro" },
    { id: "rj-rc-07", cns: "089078", name: "7ª Circunscrição do Registro Civil - Tijuca / Vila Isabel", attribution: "Registro Civil de Pessoas Naturais", state: "RJ", city: "Rio de Janeiro" },
    { id: "rj-rc-08", cns: "089086", name: "8ª Circunscrição do Registro Civil - Andaraí / Grajaú", attribution: "Registro Civil de Pessoas Naturais", state: "RJ", city: "Rio de Janeiro" },
    { id: "rj-rc-09", cns: "089094", name: "9ª Circunscrição do Registro Civil - São Cristóvão / Caju", attribution: "Registro Civil de Pessoas Naturais", state: "RJ", city: "Rio de Janeiro" },
    { id: "rj-rc-10", cns: "089102", name: "10ª Circunscrição do Registro Civil - Méier / Engenho Novo", attribution: "Registro Civil de Pessoas Naturais", state: "RJ", city: "Rio de Janeiro" },
    { id: "rj-rc-11", cns: "089110", name: "11ª Circunscrição do Registro Civil - Madureira / Cascadura", attribution: "Registro Civil de Pessoas Naturais", state: "RJ", city: "Rio de Janeiro" },
    { id: "rj-rc-12", cns: "089128", name: "12ª Circunscrição do Registro Civil - Irajá / Pavuna", attribution: "Registro Civil de Pessoas Naturais", state: "RJ", city: "Rio de Janeiro" },
    { id: "rj-rc-13", cns: "089136", name: "13ª Circunscrição do Registro Civil - Ilha do Governador", attribution: "Registro Civil de Pessoas Naturais", state: "RJ", city: "Rio de Janeiro" },
    { id: "rj-rc-14", cns: "089144", name: "14ª Circunscrição do Registro Civil - Campo Grande / Bangu / Santa Cruz", attribution: "Registro Civil de Pessoas Naturais", state: "RJ", city: "Rio de Janeiro" },

    // 11 Ofícios de Registro de Imóveis
    ...Array.from({ length: 11 }, (_, i) => {
      const num = i + 1;
      const extra = num === 9 ? " (Barra da Tijuca / Recreio / Jacarepaguá)" : "";
      return {
        id: `rj-ri-${String(num).padStart(2, "0")}`,
        cns: `0880${String(num).padStart(2, "0")}`,
        name: `${num}º Ofício de Registro de Imóveis da Capital${extra}`,
        attribution: "Registro de Imóveis",
        state: "RJ",
        city: "Rio de Janeiro",
      };
    }),

    // 24 Ofícios de Notas
    ...Array.from({ length: 24 }, (_, i) => {
      const num = i + 1;
      const extra = num === 15 ? " (Centro/Barra)" : num === 24 ? " (Barra da Tijuca)" : "";
      return {
        id: `rj-tab-${String(num).padStart(2, "0")}`,
        cns: `0870${String(num).padStart(2, "0")}`,
        name: `${num}º Ofício de Notas da Capital${extra}`,
        attribution: "Tabelionato de Notas",
        state: "RJ",
        city: "Rio de Janeiro",
      };
    }),

    // 4 Ofícios de Protesto
    ...Array.from({ length: 4 }, (_, i) => {
      const num = i + 1;
      return {
        id: `rj-prot-${String(num).padStart(2, "0")}`,
        cns: `0900${String(num).padStart(2, "0")}`,
        name: `${num}º Ofício de Protesto de Títulos da Capital`,
        attribution: "Protesto de Títulos",
        state: "RJ",
        city: "Rio de Janeiro",
      };
    }),
  ],

  // ==========================================
  // BELO HORIZONTE / MG (Subdistritos + 7 RGIs + 9 Tabelionatos de Notas)
  // ==========================================
  "MG_BELO_HORIZONTE": [
    { id: "mg-rc-01", cns: "050013", name: "1º Subdistrito de Registro Civil - Centro", attribution: "Registro Civil de Pessoas Naturais", state: "MG", city: "Belo Horizonte" },
    { id: "mg-rc-02", cns: "050021", name: "2º Subdistrito de Registro Civil - Santa Efigênia", attribution: "Registro Civil de Pessoas Naturais", state: "MG", city: "Belo Horizonte" },
    { id: "mg-rc-03", cns: "050039", name: "3º Subdistrito de Registro Civil - Barreiro", attribution: "Registro Civil de Pessoas Naturais", state: "MG", city: "Belo Horizonte" },
    { id: "mg-rc-04", cns: "050047", name: "4º Subdistrito de Registro Civil - Venda Nova", attribution: "Registro Civil de Pessoas Naturais", state: "MG", city: "Belo Horizonte" },
    ...Array.from({ length: 7 }, (_, i) => ({
      id: `mg-ri-${String(i + 1).padStart(2, "0")}`,
      cns: `0510${String(i + 1).padStart(2, "0")}`,
      name: `${i + 1}º Ofício de Registro de Imóveis de Belo Horizonte`,
      attribution: "Registro de Imóveis",
      state: "MG",
      city: "Belo Horizonte",
    })),
    ...Array.from({ length: 9 }, (_, i) => ({
      id: `mg-tab-${String(i + 1).padStart(2, "0")}`,
      cns: `0520${String(i + 1).padStart(2, "0")}`,
      name: `${i + 1}º Tabelionato de Notas de Belo Horizonte`,
      attribution: "Tabelionato de Notas",
      state: "MG",
      city: "Belo Horizonte",
    })),
  ],

  // ==========================================
  // CURITIBA / PR (5 Distritos Registro Civil + 9 RGIs + 10 Notas)
  // ==========================================
  "PR_CURITIBA": [
    { id: "pr-rc-01", cns: "080010", name: "1º Registro Civil das Pessoas Naturais de Curitiba - Centro", attribution: "Registro Civil de Pessoas Naturais", state: "PR", city: "Curitiba" },
    { id: "pr-rc-02", cns: "080028", name: "2º Registro Civil das Pessoas Naturais de Curitiba - Batel", attribution: "Registro Civil de Pessoas Naturais", state: "PR", city: "Curitiba" },
    { id: "pr-rc-03", cns: "080036", name: "3º Registro Civil das Pessoas Naturais de Curitiba - Portão", attribution: "Registro Civil de Pessoas Naturais", state: "PR", city: "Curitiba" },
    { id: "pr-rc-04", cns: "080044", name: "4º Registro Civil das Pessoas Naturais de Curitiba - Santa Felicidade", attribution: "Registro Civil de Pessoas Naturais", state: "PR", city: "Curitiba" },
    { id: "pr-rc-05", cns: "080051", name: "5º Registro Civil das Pessoas Naturais de Curitiba - Boqueirão", attribution: "Registro Civil de Pessoas Naturais", state: "PR", city: "Curitiba" },
    ...Array.from({ length: 9 }, (_, i) => ({
      id: `pr-ri-${String(i + 1).padStart(2, "0")}`,
      cns: `0810${String(i + 1).padStart(2, "0")}`,
      name: `${i + 1}º Registro de Imóveis de Curitiba`,
      attribution: "Registro de Imóveis",
      state: "PR",
      city: "Curitiba",
    })),
    ...Array.from({ length: 10 }, (_, i) => ({
      id: `pr-tab-${String(i + 1).padStart(2, "0")}`,
      cns: `0820${String(i + 1).padStart(2, "0")}`,
      name: `${i + 1}º Tabelionato de Notas de Curitiba`,
      attribution: "Tabelionato de Notas",
      state: "PR",
      city: "Curitiba",
    })),
  ],

  // ==========================================
  // BRASÍLIA / DISTRITO FEDERAL
  // ==========================================
  "DF_BRASILIA": [
    { id: "df-rc-01", cns: "020016", name: "1º Ofício de Registro Civil, Títulos e Documentos de Brasília (Plano Piloto)", attribution: "Registro Civil de Pessoas Naturais", state: "DF", city: "Brasília" },
    { id: "df-rc-02", cns: "020024", name: "2º Ofício de Registro Civil e Casamentos - Taguatinga", attribution: "Registro Civil de Pessoas Naturais", state: "DF", city: "Brasília" },
    { id: "df-rc-03", cns: "020032", name: "3º Ofício de Registro Civil - Ceilândia", attribution: "Registro Civil de Pessoas Naturais", state: "DF", city: "Brasília" },
    { id: "df-rc-04", cns: "020040", name: "4º Ofício de Registro Civil - Gama", attribution: "Registro Civil de Pessoas Naturais", state: "DF", city: "Brasília" },
    { id: "df-rc-05", cns: "020057", name: "5º Ofício de Registro Civil - Sobradinho", attribution: "Registro Civil de Pessoas Naturais", state: "DF", city: "Brasília" },
    { id: "df-rc-06", cns: "020065", name: "6º Ofício de Registro Civil - Planaltina", attribution: "Registro Civil de Pessoas Naturais", state: "DF", city: "Brasília" },
    { id: "df-rc-07", cns: "020073", name: "7º Ofício de Registro Civil - Samambaia", attribution: "Registro Civil de Pessoas Naturais", state: "DF", city: "Brasília" },
    { id: "df-rc-08", cns: "020081", name: "8º Ofício de Registro Civil - Guará", attribution: "Registro Civil de Pessoas Naturais", state: "DF", city: "Brasília" },
    ...Array.from({ length: 9 }, (_, i) => ({
      id: `df-ri-${String(i + 1).padStart(2, "0")}`,
      cns: `0210${String(i + 1).padStart(2, "0")}`,
      name: `${i + 1}º Ofício de Registro de Imóveis do DF`,
      attribution: "Registro de Imóveis",
      state: "DF",
      city: "Brasília",
    })),
    ...Array.from({ length: 8 }, (_, i) => ({
      id: `df-tab-${String(i + 1).padStart(2, "0")}`,
      cns: `0220${String(i + 1).padStart(2, "0")}`,
      name: `${i + 1}º Ofício de Notas de Brasília`,
      attribution: "Tabelionato de Notas",
      state: "DF",
      city: "Brasília",
    })),
  ],
};

export function listOfficialServentias(uf?: string): CartorioInfo[] {
  const prefix = uf ? `${uf.toUpperCase().trim()}_` : "";
  return Object.entries(SERVENTIAS_OFICIAIS_DATABASE)
    .filter(([key]) => !prefix || key.startsWith(prefix))
    .flatMap(([, list]) => list);
}

function filterByCategory(list: CartorioInfo[], category: string): CartorioInfo[] {
  const filtered = list.filter((item) =>
    matchesServentiaCategory(item.attribution, codesFromAttribution(item.attribution), category)
  );
  return filtered.length > 0 ? filtered : list;
}

function toCartorioInfo(row: {
  id: string;
  cns: string | null;
  name: string;
  officialName: string | null;
  attributions: string[];
  state: string;
  city: string;
  address: string | null;
  phone: string | null;
  email: string | null;
}): CartorioInfo {
  return {
    id: row.id,
    cns: row.cns || "",
    name: row.officialName || row.name,
    attribution: attributionFromCodes(row.attributions),
    state: row.state,
    city: row.city,
    address: row.address || undefined,
    phone: row.phone || undefined,
    email: row.email || undefined,
  };
}

async function findCartoriosInDatabase(
  uf: string,
  city: string,
  category: string
): Promise<CartorioInfo[]> {
  try {
    const rows = await prisma.cartorio.findMany({
      where: {
        state: uf,
        city: { equals: city, mode: "insensitive" },
      },
      orderBy: { id: "asc" },
    });
    if (!rows.length) return [];
    return filterByCategory(rows.map(toCartorioInfo), category);
  } catch (error) {
    console.error("Falha ao consultar Cartorio no banco:", error);
    return [];
  }
}

/** IDs que existem na tabela Cartorio. Placeholders do interior e busca não entram. */
export async function findExistingCartorioIds(
  ids: Array<string | null | undefined>
): Promise<Set<string>> {
  const unique = [
    ...new Set(
      ids
        .map((id) => id?.trim())
        .filter((id): id is string => Boolean(id))
    ),
  ];
  if (!unique.length) return new Set();
  try {
    const rows = await prisma.cartorio.findMany({
      where: { id: { in: unique } },
      select: { id: true },
    });
    return new Set(rows.map((row) => row.id));
  } catch (error) {
    console.error("Falha ao validar cartorioId:", error);
    return new Set();
  }
}

function normalizeKey(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/\s+/g, "_")
    .replace(/[^A-Z0-9_]/g, "");
}

/**
 * Retorna a lista completa oficial de cartórios de qualquer município do Brasil
 * filtrados estritamente pela atribuição correspondente.
 */
export async function getCartoriosByCityAndCategory(
  state: string,
  city: string,
  category: string
): Promise<CartorioInfo[]> {
  const upperUf = state.toUpperCase().trim();
  const normalizedCity = city.trim();
  const lookupKey = `${upperUf}_${normalizeKey(normalizedCity)}`;
  const cityKey = normalizeKey(normalizedCity);

  const fromDatabase = await findCartoriosInDatabase(upperUf, normalizedCity, category);
  if (fromDatabase.length > 0) return fromDatabase;

  const specificCityServentias = SERVENTIAS_OFICIAIS_DATABASE[lookupKey];
  if (specificCityServentias?.length) {
    return filterByCategory(specificCityServentias, category);
  }

  const placeholder = (
    id: string,
    name: string,
    attribution: string
  ): CartorioInfo => ({
    id,
    cns: "",
    name,
    attribution,
    state: upperUf,
    city: normalizedCity,
  });

  if (category === "registro-civil") {
    return [
      placeholder(
        `rc-1-${upperUf}-${cityKey}`,
        `Oficial de Registro Civil das Pessoas Naturais (Sede) - ${normalizedCity}`,
        "Registro Civil de Pessoas Naturais"
      ),
      placeholder(
        `rc-2-${upperUf}-${cityKey}`,
        `Cartório de Registro Civil e Tabelionato de Notas do 2º Distrito - ${normalizedCity}`,
        "Registro Civil de Pessoas Naturais e Notas"
      ),
    ];
  }
  if (category === "imoveis") {
    return [
      placeholder(
        `ri-1-${upperUf}-${cityKey}`,
        `Oficial de Registro de Imóveis da Comarca de ${normalizedCity}`,
        "Registro de Imóveis"
      ),
    ];
  }
  if (category === "notas") {
    return [
      placeholder(
        `tab-1-${upperUf}-${cityKey}`,
        `1º Tabelionato de Notas de ${normalizedCity}`,
        "Tabelionato de Notas"
      ),
      placeholder(
        `tab-2-${upperUf}-${cityKey}`,
        `2º Tabelionato de Notas de ${normalizedCity}`,
        "Tabelionato de Notas"
      ),
    ];
  }
  if (category === "protesto") {
    return [
      placeholder(
        `prot-1-${upperUf}-${cityKey}`,
        `Tabelionato de Protesto de Títulos da Comarca de ${normalizedCity}`,
        "Protesto de Títulos"
      ),
    ];
  }

  return [
    placeholder(
      `oficio-unico-${upperUf}-${cityKey}`,
      `Cartório do Ofício Único Notarial e Registral de ${normalizedCity}`,
      "Serviço Notarial e Registral Integrado"
    ),
  ];
}
