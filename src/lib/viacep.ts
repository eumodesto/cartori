export interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  erro?: boolean;
}

export async function fetchAddressByCep(cep: string): Promise<ViaCepResponse | null> {
  const cleanCep = cep.replace(/\D/g, "");
  if (cleanCep.length !== 8) return null;

  try {
    const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`, {
      next: { revalidate: 86400 },
    });

    if (!res.ok) return null;
    const data: ViaCepResponse = await res.json();

    if (data.erro) return null;
    return data;
  } catch (error) {
    console.error("Erro ViaCEP:", error);
    return null;
  }
}
