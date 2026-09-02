import { FormFieldDefinition } from "./types";

/** Campos do CRC (ProductField), sem steps, localização, tipo_produto nem apostila genérica. */
export const CRC_FORM_FIELDS: Record<string, FormFieldDefinition[]> = {
  "certidao-de-nascimento": [
    {
      "id": "numero_termo",
      "label": "Número do Termo",
      "type": "text",
      "required": false
    },
    {
      "id": "numero_folha",
      "label": "Número da Folha",
      "type": "text",
      "required": false
    },
    {
      "id": "numero_livro",
      "label": "Número do Livro",
      "type": "text",
      "required": false
    },
    {
      "id": "averbacao",
      "label": "Averbação",
      "type": "checkbox",
      "required": false,
      "visibleWhen": {
        "field": "_uf",
        "in": [
          "AC",
          "AL",
          "AM",
          "AP",
          "BA",
          "CE",
          "DF",
          "ES",
          "GO",
          "MA",
          "MG",
          "MS",
          "MT",
          "PA",
          "PB",
          "PE",
          "PI",
          "PR",
          "RJ",
          "RN",
          "RO",
          "RR",
          "RS",
          "SC",
          "SE",
          "SP",
          "TO"
        ]
      },
      "price": 99.97,
      "priceByUf": {
        "MG": 129.97,
        "PI": 129.97,
        "SC": 129.97,
        "SE": 129.97,
        "SP": 129.97,
        "TO": 129.97,
        "AC": 99.97,
        "AL": 99.97,
        "AM": 99.97,
        "AP": 99.97,
        "BA": 99.97,
        "CE": 99.97,
        "DF": 99.97,
        "ES": 99.97,
        "GO": 99.97,
        "MA": 99.97,
        "MS": 99.97,
        "MT": 99.97,
        "PA": 99.97,
        "PB": 99.97,
        "PE": 99.97,
        "PR": 99.97,
        "RJ": 99.97,
        "RN": 99.97,
        "RO": 99.97,
        "RR": 99.97,
        "RS": 99.97
      }
    },
    {
      "id": "nome_completo_registrado",
      "label": "Nome Completo Registrado na Certidão",
      "type": "text",
      "required": true
    },
    {
      "id": "nome_completo_mae",
      "label": "Nome Completo da Mãe na Certidão",
      "type": "text",
      "required": true
    },
    {
      "id": "inteiro_teor",
      "label": "Inteiro teor",
      "type": "radio",
      "required": false,
      "options": [
        {
          "label": "Inteiro teor — reprográfica",
          "value": "inteiro_teor_reprografica",
          "price": 279.97,
          "priceByUf": {
            "BA": 279.97,
            "MA": 279.97,
            "AC": 299.77,
            "AL": 299.77,
            "AM": 299.77,
            "AP": 299.77,
            "CE": 299.77,
            "DF": 299.77,
            "ES": 299.77,
            "MG": 299.77,
            "MS": 299.77,
            "MT": 299.77,
            "PB": 299.77,
            "PE": 299.77,
            "PI": 299.77,
            "PR": 299.77,
            "RN": 299.77,
            "RO": 299.77,
            "RR": 299.77,
            "RS": 299.77,
            "SC": 299.77,
            "SE": 299.77,
            "SP": 299.77,
            "TO": 299.77,
            "GO": 229.97,
            "PA": 459.97,
            "RJ": 459.97
          }
        },
        {
          "label": "Inteiro teor — transcrita",
          "value": "inteiro_teor",
          "price": 279.97,
          "priceByUf": {
            "AC": 299.77,
            "AL": 299.77,
            "AM": 299.77,
            "AP": 299.77,
            "CE": 299.77,
            "DF": 299.77,
            "ES": 299.77,
            "MG": 299.77,
            "MS": 299.77,
            "MT": 299.77,
            "PB": 299.77,
            "PE": 299.77,
            "PI": 299.77,
            "PR": 299.77,
            "RN": 299.77,
            "RO": 299.77,
            "RR": 299.77,
            "RS": 299.77,
            "SC": 299.77,
            "SE": 299.77,
            "SP": 299.77,
            "TO": 299.77,
            "GO": 229.97,
            "PA": 459.97,
            "RJ": 459.97
          }
        }
      ],
      "visibleWhen": [
        {
          "field": "_uf",
          "in": [
            "AC",
            "AL",
            "AM",
            "AP",
            "BA",
            "CE",
            "DF",
            "ES",
            "GO",
            "MA",
            "MG",
            "MS",
            "MT",
            "PA",
            "PB",
            "PE",
            "PI",
            "PR",
            "RJ",
            "RN",
            "RO",
            "RR",
            "RS",
            "SC",
            "SE",
            "SP",
            "TO"
          ]
        },
        {
          "field": "_format",
          "notIn": [
            "DIGITAL_ECERTIDAO"
          ]
        }
      ]
    },
    {
      "id": "nome_completo_pai",
      "label": "Nome Completo do Pai na Certidão",
      "type": "text",
      "required": true
    },
    {
      "id": "data-de-nascimento",
      "label": "Data de Nascimento",
      "type": "date",
      "required": true
    },
    {
      "id": "traducao-juramentada",
      "label": "Tradução Juramentada",
      "type": "select",
      "required": false,
      "options": [
        {
          "label": "Francês",
          "value": "frances",
          "price": 504.99
        },
        {
          "label": "Chinês",
          "value": "chines",
          "price": 578.99
        },
        {
          "label": "Espanhol",
          "value": "espanhol",
          "price": 358.99
        },
        {
          "label": "Italiano",
          "value": "italiano",
          "price": 257.99
        },
        {
          "label": "Inglês",
          "value": "ingles",
          "price": 253.99
        },
        {
          "label": "Japonês",
          "value": "japones",
          "price": 484.99
        },
        {
          "label": "Alemão",
          "value": "alemao",
          "price": 598.99
        }
      ],
      "visibleWhen": {
        "field": "_format",
        "notIn": [
          "DIGITAL_ECERTIDAO"
        ]
      }
    },
    {
      "id": "apostilamento_traduzida",
      "label": "Deseja apostilar a certidão traduzida?",
      "type": "checkbox",
      "required": false,
      "visibleWhen": [
        {
          "field": "_uf",
          "in": [
            "AC",
            "AL",
            "AM",
            "AP",
            "BA",
            "CE",
            "DF",
            "ES",
            "GO",
            "MG",
            "MS",
            "MT",
            "PA",
            "PB",
            "PE",
            "PI",
            "PR",
            "RJ",
            "RN",
            "RO",
            "RS",
            "SC",
            "SE",
            "SP",
            "TO"
          ]
        },
        {
          "field": "traducao-juramentada",
          "in": [
            "alemao",
            "chines",
            "espanhol",
            "frances",
            "ingles",
            "italiano",
            "japones"
          ]
        }
      ],
      "price": 159.97,
      "priceByUf": {
        "GO": 229.97,
        "PE": 229.97,
        "RS": 229.97,
        "MG": 295.97,
        "PA": 295.97,
        "RJ": 295.97,
        "SP": 295.97,
        "PB": 209.97,
        "PI": 209.97,
        "PR": 209.97,
        "RN": 209.97,
        "SE": 209.97,
        "AC": 159.97,
        "AL": 159.97,
        "MS": 259.97,
        "BA": 279.97,
        "MT": 279.97,
        "ES": 199.97,
        "SC": 199.97,
        "TO": 199.97,
        "AM": 179.97,
        "AP": 179.97,
        "CE": 179.97,
        "DF": 179.97,
        "RO": 179.97
      }
    }
  ],
  "certidao-de-casamento": [
    {
      "id": "numero_livro",
      "label": "Número do Livro",
      "type": "text",
      "required": false
    },
    {
      "id": "averbacao",
      "label": "Averbação",
      "type": "checkbox",
      "required": false,
      "visibleWhen": {
        "field": "_uf",
        "in": [
          "AC",
          "AL",
          "AM",
          "AP",
          "BA",
          "CE",
          "DF",
          "ES",
          "GO",
          "MA",
          "MG",
          "MS",
          "MT",
          "PA",
          "PB",
          "PE",
          "PI",
          "PR",
          "RJ",
          "RN",
          "RO",
          "RR",
          "RS",
          "SC",
          "SE",
          "SP",
          "TO"
        ]
      },
      "price": 99.97,
      "priceByUf": {
        "MG": 129.97,
        "PI": 129.97,
        "SC": 129.97,
        "SE": 129.97,
        "SP": 129.97,
        "TO": 129.97,
        "AC": 99.97,
        "AL": 99.97,
        "AM": 99.97,
        "AP": 99.97,
        "BA": 99.97,
        "CE": 99.97,
        "DF": 99.97,
        "ES": 99.97,
        "GO": 99.97,
        "MA": 99.97,
        "MS": 99.97,
        "MT": 99.97,
        "PA": 99.97,
        "PB": 99.97,
        "PE": 99.97,
        "PR": 99.97,
        "RJ": 99.97,
        "RN": 99.97,
        "RO": 99.97,
        "RR": 99.97,
        "RS": 99.97
      }
    },
    {
      "id": "nome_completo_esposo",
      "label": "Nome Completo do Cônjuge Esposo",
      "type": "text",
      "required": true
    },
    {
      "id": "numero_folha",
      "label": "Número da Folha",
      "type": "text",
      "required": false
    },
    {
      "id": "nome_completo_esposa",
      "label": "Nome Completo da Cônjuge Esposa",
      "type": "text",
      "required": true
    },
    {
      "id": "inteiro_teor",
      "label": "Inteiro teor",
      "type": "radio",
      "required": false,
      "options": [
        {
          "label": "Inteiro teor — transcrita",
          "value": "inteiro_teor",
          "price": 229.97,
          "priceByUf": {
            "GO": 229.97,
            "PA": 459.97,
            "RJ": 459.97,
            "BA": 279.97,
            "MA": 279.97,
            "AC": 299.77,
            "AL": 299.77,
            "AM": 299.77,
            "AP": 299.77,
            "CE": 299.77,
            "DF": 299.77,
            "ES": 299.77,
            "MG": 299.77,
            "MS": 299.77,
            "MT": 299.77,
            "PB": 299.77,
            "PE": 299.77,
            "PI": 299.77,
            "PR": 299.77,
            "RN": 299.77,
            "RO": 299.77,
            "RR": 299.77,
            "RS": 299.77,
            "SC": 299.77,
            "SE": 299.77,
            "SP": 299.77,
            "TO": 299.77
          }
        },
        {
          "label": "Inteiro teor — reprográfica",
          "value": "inteiro_teor_reprografica",
          "price": 229.97,
          "priceByUf": {
            "PA": 459.97,
            "RJ": 459.97,
            "BA": 279.97,
            "MA": 279.97,
            "AC": 299.77,
            "AL": 299.77,
            "AM": 299.77,
            "AP": 299.77,
            "CE": 299.77,
            "DF": 299.77,
            "ES": 299.77,
            "MG": 299.77,
            "MS": 299.77,
            "MT": 299.77,
            "PB": 299.77,
            "PE": 299.77,
            "PI": 299.77,
            "PR": 299.77,
            "RN": 299.77,
            "RO": 299.77,
            "RR": 299.77,
            "RS": 299.77,
            "SC": 299.77,
            "SE": 299.77,
            "SP": 299.77,
            "TO": 299.77
          }
        }
      ],
      "visibleWhen": [
        {
          "field": "_uf",
          "in": [
            "AC",
            "AL",
            "AM",
            "AP",
            "BA",
            "CE",
            "DF",
            "ES",
            "GO",
            "MA",
            "MG",
            "MS",
            "MT",
            "PA",
            "PB",
            "PE",
            "PI",
            "PR",
            "RJ",
            "RN",
            "RO",
            "RR",
            "RS",
            "SC",
            "SE",
            "SP",
            "TO"
          ]
        },
        {
          "field": "_format",
          "notIn": [
            "DIGITAL_ECERTIDAO"
          ]
        }
      ]
    },
    {
      "id": "numero_termo",
      "label": "Número do Termo",
      "type": "text",
      "required": false
    },
    {
      "id": "data-de-casamento",
      "label": "Data de Casamento",
      "type": "date",
      "required": true
    },
    {
      "id": "traducao-juramentada",
      "label": "Tradução Juramentada",
      "type": "select",
      "required": false,
      "options": [
        {
          "label": "Espanhol",
          "value": "espanhol",
          "price": 358.99
        },
        {
          "label": "Inglês",
          "value": "ingles",
          "price": 253.99
        },
        {
          "label": "Chinês",
          "value": "chines",
          "price": 578.99
        },
        {
          "label": "Alemão",
          "value": "alemao",
          "price": 598.99
        },
        {
          "label": "Italiano",
          "value": "italiano",
          "price": 257.99
        },
        {
          "label": "Francês",
          "value": "frances",
          "price": 504.99
        },
        {
          "label": "Japonês",
          "value": "japones",
          "price": 484.99
        }
      ],
      "visibleWhen": {
        "field": "_format",
        "notIn": [
          "DIGITAL_ECERTIDAO"
        ]
      }
    },
    {
      "id": "apostilamento_traduzida",
      "label": "Deseja apostilar a certidão traduzida?",
      "type": "checkbox",
      "required": false,
      "visibleWhen": [
        {
          "field": "_uf",
          "in": [
            "AC",
            "AL",
            "AM",
            "AP",
            "BA",
            "CE",
            "DF",
            "ES",
            "GO",
            "MG",
            "MS",
            "MT",
            "PA",
            "PB",
            "PE",
            "PI",
            "PR",
            "RJ",
            "RN",
            "RO",
            "RS",
            "SC",
            "SE",
            "SP",
            "TO"
          ]
        },
        {
          "field": "_format",
          "notIn": [
            "DIGITAL_ECERTIDAO"
          ]
        },
        {
          "field": "traducao-juramentada",
          "in": [
            "alemao",
            "chines",
            "espanhol",
            "frances",
            "ingles",
            "italiano",
            "japones"
          ]
        }
      ],
      "price": 159.97,
      "priceByUf": {
        "ES": 199.97,
        "SC": 199.97,
        "TO": 199.97,
        "MS": 259.97,
        "GO": 229.97,
        "PE": 229.97,
        "RS": 229.97,
        "BA": 279.97,
        "MT": 279.97,
        "MG": 295.97,
        "PA": 295.97,
        "RJ": 295.97,
        "SP": 295.97,
        "AM": 179.97,
        "AP": 179.97,
        "CE": 179.97,
        "DF": 179.97,
        "RO": 179.97,
        "PB": 209.97,
        "PI": 209.97,
        "PR": 209.97,
        "RN": 209.97,
        "SE": 209.97,
        "AC": 159.97,
        "AL": 159.97
      }
    }
  ],
  "certidao-de-obito": [
    {
      "id": "averbacao",
      "label": "Averbação",
      "type": "checkbox",
      "required": false,
      "visibleWhen": {
        "field": "_uf",
        "in": [
          "AC",
          "AL",
          "AM",
          "AP",
          "BA",
          "CE",
          "DF",
          "ES",
          "GO",
          "MA",
          "MG",
          "MS",
          "MT",
          "PA",
          "PB",
          "PE",
          "PI",
          "PR",
          "RJ",
          "RN",
          "RO",
          "RR",
          "RS",
          "SC",
          "SE",
          "SP",
          "TO"
        ]
      },
      "price": 99.97,
      "priceByUf": {
        "AC": 99.97,
        "AL": 99.97,
        "AM": 99.97,
        "AP": 99.97,
        "BA": 99.97,
        "CE": 99.97,
        "DF": 99.97,
        "ES": 99.97,
        "GO": 99.97,
        "MA": 99.97,
        "MS": 99.97,
        "MT": 99.97,
        "PA": 99.97,
        "PB": 99.97,
        "PE": 99.97,
        "PR": 99.97,
        "RJ": 99.97,
        "RN": 99.97,
        "RO": 99.97,
        "RR": 99.97,
        "RS": 99.97,
        "MG": 129.97,
        "PI": 129.97,
        "SC": 129.97,
        "SE": 129.97,
        "SP": 129.97,
        "TO": 129.97
      }
    },
    {
      "id": "nome_do_falecido",
      "label": "Nome Completo do(a) Falecido(a) na Certidão",
      "type": "text",
      "required": true
    },
    {
      "id": "numero_livro",
      "label": "Número do Livro",
      "type": "text",
      "required": false
    },
    {
      "id": "nome_completo_mae",
      "label": "Nome Completo da Mãe na Certidão",
      "type": "text",
      "required": true
    },
    {
      "id": "numero_folha",
      "label": "Número da Folha",
      "type": "text",
      "required": false
    },
    {
      "id": "nome_completo_pai",
      "label": "Nome Completo do Pai na Certidão",
      "type": "text",
      "required": true
    },
    {
      "id": "inteiro_teor",
      "label": "Inteiro teor",
      "type": "radio",
      "required": false,
      "options": [
        {
          "label": "Inteiro teor — reprográfica",
          "value": "inteiro_teor_reprografica",
          "price": 279.97,
          "priceByUf": {
            "BA": 279.97,
            "MA": 279.97,
            "AC": 299.77,
            "AL": 299.77,
            "AM": 299.77,
            "AP": 299.77,
            "CE": 299.77,
            "DF": 299.77,
            "ES": 299.77,
            "MG": 299.77,
            "MS": 299.77,
            "MT": 299.77,
            "PB": 299.77,
            "PE": 299.77,
            "PI": 299.77,
            "PR": 299.77,
            "RN": 299.77,
            "RO": 299.77,
            "RR": 299.77,
            "RS": 299.77,
            "SC": 299.77,
            "SE": 299.77,
            "SP": 299.77,
            "TO": 299.77,
            "PA": 459.97,
            "RJ": 459.97,
            "GO": 229.97
          }
        },
        {
          "label": "Inteiro teor — transcrita",
          "value": "inteiro_teor",
          "price": 279.97,
          "priceByUf": {
            "AC": 299.77,
            "AL": 299.77,
            "AM": 299.77,
            "AP": 299.77,
            "CE": 299.77,
            "DF": 299.77,
            "ES": 299.77,
            "MG": 299.77,
            "MS": 299.77,
            "MT": 299.77,
            "PB": 299.77,
            "PE": 299.77,
            "PI": 299.77,
            "PR": 299.77,
            "RN": 299.77,
            "RO": 299.77,
            "RR": 299.77,
            "RS": 299.77,
            "SC": 299.77,
            "SE": 299.77,
            "SP": 299.77,
            "TO": 299.77,
            "PA": 459.97,
            "RJ": 459.97,
            "GO": 229.97
          }
        }
      ],
      "visibleWhen": [
        {
          "field": "_uf",
          "in": [
            "AC",
            "AL",
            "AM",
            "AP",
            "BA",
            "CE",
            "DF",
            "ES",
            "GO",
            "MA",
            "MG",
            "MS",
            "MT",
            "PA",
            "PB",
            "PE",
            "PI",
            "PR",
            "RJ",
            "RN",
            "RO",
            "RR",
            "RS",
            "SC",
            "SE",
            "SP",
            "TO"
          ]
        },
        {
          "field": "_format",
          "notIn": [
            "DIGITAL_ECERTIDAO"
          ]
        }
      ]
    },
    {
      "id": "numero_termo",
      "label": "Número do Termo",
      "type": "text",
      "required": false
    },
    {
      "id": "data-do-obito",
      "label": "Data de Óbito",
      "type": "date",
      "required": true
    },
    {
      "id": "traducao-juramentada",
      "label": "Tradução Juramentada",
      "type": "select",
      "required": false,
      "options": [
        {
          "label": "Italiano",
          "value": "italiano",
          "price": 257.99
        },
        {
          "label": "Alemão",
          "value": "alemao",
          "price": 598.99
        },
        {
          "label": "Japonês",
          "value": "japones",
          "price": 484.99
        },
        {
          "label": "Espanhol",
          "value": "espanhol",
          "price": 358.99
        },
        {
          "label": "Francês",
          "value": "frances",
          "price": 504.99
        },
        {
          "label": "Inglês",
          "value": "ingles",
          "price": 253.99
        },
        {
          "label": "Chinês",
          "value": "chines",
          "price": 578.99
        }
      ],
      "visibleWhen": {
        "field": "_format",
        "notIn": [
          "DIGITAL_ECERTIDAO"
        ]
      }
    },
    {
      "id": "apostilamento_traduzida",
      "label": "Deseja apostilar a certidão traduzida?",
      "type": "checkbox",
      "required": false,
      "visibleWhen": [
        {
          "field": "_uf",
          "in": [
            "AC",
            "AL",
            "AM",
            "AP",
            "BA",
            "CE",
            "DF",
            "ES",
            "GO",
            "MG",
            "MS",
            "MT",
            "PA",
            "PB",
            "PE",
            "PI",
            "PR",
            "RJ",
            "RN",
            "RO",
            "RS",
            "SC",
            "SE",
            "SP",
            "TO"
          ]
        },
        {
          "field": "traducao-juramentada",
          "in": [
            "alemao",
            "chines",
            "espanhol",
            "frances",
            "ingles",
            "italiano",
            "japones"
          ]
        }
      ],
      "price": 159.97,
      "priceByUf": {
        "BA": 279.97,
        "MT": 279.97,
        "GO": 229.97,
        "PE": 229.97,
        "RS": 229.97,
        "AC": 159.97,
        "AL": 159.97,
        "PB": 295.97,
        "PI": 295.97,
        "PR": 295.97,
        "RN": 295.97,
        "SE": 295.97,
        "MS": 259.97,
        "AM": 179.97,
        "AP": 179.97,
        "CE": 179.97,
        "DF": 179.97,
        "RO": 179.97,
        "MG": 295.97,
        "PA": 295.97,
        "RJ": 295.97,
        "SP": 295.97,
        "ES": 199.97,
        "SC": 199.97,
        "TO": 199.97
      }
    }
  ],
  "certidao-de-divorcio": [
    {
      "id": "averbacao",
      "label": "Averbação",
      "type": "checkbox",
      "required": false,
      "visibleWhen": {
        "field": "_uf",
        "in": [
          "AC",
          "AL",
          "AM",
          "AP",
          "BA",
          "CE",
          "DF",
          "ES",
          "GO",
          "MA",
          "MG",
          "MS",
          "MT",
          "PA",
          "PB",
          "PE",
          "PI",
          "PR",
          "RJ",
          "RN",
          "RO",
          "RR",
          "RS",
          "SC",
          "SE",
          "SP",
          "TO"
        ]
      },
      "price": 99.97,
      "priceByUf": {
        "AC": 99.97,
        "AL": 99.97,
        "AM": 99.97,
        "AP": 99.97,
        "BA": 99.97,
        "CE": 99.97,
        "DF": 99.97,
        "ES": 99.97,
        "GO": 99.97,
        "MA": 99.97,
        "MS": 99.97,
        "MT": 99.97,
        "PA": 99.97,
        "PB": 99.97,
        "PE": 99.97,
        "PR": 99.97,
        "RJ": 99.97,
        "RN": 99.97,
        "RO": 99.97,
        "RR": 99.97,
        "RS": 99.97,
        "MG": 129.97,
        "PI": 129.97,
        "SC": 129.97,
        "SE": 129.97,
        "SP": 129.97,
        "TO": 129.97
      }
    },
    {
      "id": "numero_livro",
      "label": "Número do Livro",
      "type": "text",
      "required": false
    },
    {
      "id": "nome_do_conjuge_esposo",
      "label": "Nome Completo do Esposo na Certidão",
      "type": "text",
      "required": true
    },
    {
      "id": "nome_completo_esposa",
      "label": "Nome Completo da Esposa na Certidão",
      "type": "text",
      "required": true
    },
    {
      "id": "numero_folha",
      "label": "Número da Folha",
      "type": "text",
      "required": false
    },
    {
      "id": "numero_termo",
      "label": "Número do Termo",
      "type": "text",
      "required": false
    },
    {
      "id": "inteiro_teor",
      "label": "Inteiro teor",
      "type": "radio",
      "required": false,
      "options": [
        {
          "label": "Inteiro teor — transcrita",
          "value": "inteiro_teor",
          "price": 369.77,
          "priceByUf": {
            "AM": 369.77,
            "AP": 369.77,
            "MS": 369.77,
            "PE": 369.77,
            "RO": 369.77,
            "BA": 360.9,
            "CE": 360.9,
            "MT": 360.9,
            "TO": 360.9,
            "PA": 509.87,
            "GO": 322.21,
            "RJ": 540.51,
            "PR": 329.3,
            "MG": 380.07,
            "PB": 380.07,
            "RR": 380.07,
            "RS": 380.07,
            "SC": 380.07,
            "SE": 380.07,
            "AC": 350.9,
            "DF": 350.9,
            "ES": 350.9,
            "PI": 350.9,
            "RN": 350.9,
            "SP": 350.9,
            "AL": 344.13,
            "MA": 344.13
          }
        },
        {
          "label": "Inteiro teor — reprográfica",
          "value": "inteiro_teor_reprografica",
          "price": 369.77,
          "priceByUf": {
            "BA": 360.9,
            "CE": 360.9,
            "MT": 360.9,
            "TO": 360.9,
            "PA": 509.87,
            "GO": 322.21,
            "RJ": 540.51,
            "PR": 329.3,
            "MG": 380.07,
            "PB": 380.07,
            "RR": 380.07,
            "RS": 380.07,
            "SC": 380.07,
            "SE": 380.07,
            "AC": 350.9,
            "DF": 350.9,
            "ES": 350.9,
            "PI": 350.9,
            "RN": 350.9,
            "SP": 350.9,
            "AL": 344.13,
            "MA": 344.13
          }
        }
      ],
      "visibleWhen": [
        {
          "field": "_uf",
          "in": [
            "AC",
            "AL",
            "AM",
            "AP",
            "BA",
            "CE",
            "DF",
            "ES",
            "GO",
            "MA",
            "MG",
            "MS",
            "MT",
            "PA",
            "PB",
            "PE",
            "PI",
            "PR",
            "RJ",
            "RN",
            "RO",
            "RR",
            "RS",
            "SC",
            "SE",
            "SP",
            "TO"
          ]
        },
        {
          "field": "_format",
          "notIn": [
            "DIGITAL_ECERTIDAO"
          ]
        }
      ]
    },
    {
      "id": "data-do-casamento",
      "label": "Data do Casamento",
      "type": "date",
      "required": true
    },
    {
      "id": "traducao-juramentada",
      "label": "Tradução Juramentada",
      "type": "select",
      "required": false,
      "options": [
        {
          "label": "Francês",
          "value": "frances",
          "price": 504.99
        },
        {
          "label": "Japonês",
          "value": "japones",
          "price": 484.99
        },
        {
          "label": "Espanhol",
          "value": "espanhol",
          "price": 358.99
        },
        {
          "label": "Alemão",
          "value": "alemao",
          "price": 598.99
        },
        {
          "label": "Italiano",
          "value": "italiano",
          "price": 257.99
        },
        {
          "label": "Chinês",
          "value": "chines",
          "price": 578.99
        },
        {
          "label": "Inglês",
          "value": "ingles",
          "price": 253.99
        }
      ],
      "visibleWhen": {
        "field": "_format",
        "notIn": [
          "DIGITAL_ECERTIDAO"
        ]
      }
    },
    {
      "id": "apostilamento_traduzida",
      "label": "Deseja apostilar a certidão traduzida?",
      "type": "checkbox",
      "required": false,
      "visibleWhen": [
        {
          "field": "_uf",
          "in": [
            "AC",
            "AL",
            "AM",
            "AP",
            "BA",
            "CE",
            "DF",
            "ES",
            "GO",
            "MA",
            "MG",
            "MS",
            "MT",
            "PA",
            "PB",
            "PE",
            "PI",
            "PR",
            "RJ",
            "RN",
            "RO",
            "RS",
            "SC",
            "SE",
            "SP",
            "TO"
          ]
        },
        {
          "field": "traducao-juramentada",
          "in": [
            "alemao",
            "chines",
            "espanhol",
            "frances",
            "ingles",
            "italiano",
            "japones"
          ]
        }
      ],
      "price": 159.9,
      "priceByUf": {
        "AM": 179.97,
        "AP": 179.97,
        "CE": 179.97,
        "DF": 179.97,
        "RO": 179.97,
        "ES": 199.97,
        "SC": 199.97,
        "TO": 199.97,
        "MG": 297.97,
        "PA": 297.97,
        "RJ": 297.97,
        "SP": 297.97,
        "AC": 159.9,
        "AL": 159.9,
        "PB": 209.9,
        "PI": 209.9,
        "PR": 209.9,
        "RN": 209.9,
        "SE": 209.9,
        "GO": 229.97,
        "PE": 229.97,
        "RS": 229.97,
        "BA": 279.97,
        "MA": 279.97,
        "MT": 279.97,
        "MS": 259.97
      }
    }
  ],
  "certidao-de-interdicao": [
    {
      "id": "nome_completo",
      "label": "Nome Completo",
      "type": "text",
      "required": true
    },
    {
      "id": "pessoa_fisica_juridica",
      "label": "Pessoa Física ou Jurídica",
      "type": "radio",
      "required": true,
      "options": [
        {
          "label": "Pessoa Física",
          "value": "pessoa-fisica"
        },
        {
          "label": "Pessoa Jurídica",
          "value": "pessoa-juridica"
        }
      ]
    },
    {
      "id": "nome",
      "label": "Nome",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-fisica"
        ]
      }
    },
    {
      "id": "cpf",
      "label": "CPF",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-fisica"
        ]
      }
    },
    {
      "id": "razao_social",
      "label": "Razão Social",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-juridica"
        ]
      }
    },
    {
      "id": "cnpj",
      "label": "CNPJ",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-juridica"
        ]
      }
    },
    {
      "id": "numero_folha",
      "label": "Número da Folha",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "nao_sei_livro_folha",
        "notIn": [
          "true"
        ]
      }
    },
    {
      "id": "numero_livro",
      "label": "Número do Livro",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "nao_sei_livro_folha",
        "notIn": [
          "true"
        ]
      }
    },
    {
      "id": "nao_sei_livro_folha",
      "label": "Não sei o livro e a folha",
      "type": "checkbox",
      "required": false
    },
    {
      "id": "data_ato",
      "label": "Data do Ato",
      "type": "date",
      "required": true
    }
  ],
  "certidao-negativa-de-testamento": [
    {
      "id": "state",
      "label": "Qual Estado Foi Registrado o Óbito?",
      "type": "select",
      "required": true,
      "dataSource": "ibge-uf"
    },
    {
      "id": "nome_do_falecido",
      "label": "Nome do(a) Falecido(a)",
      "type": "text",
      "required": true
    },
    {
      "id": "rg_falecido",
      "label": "Número da Identidade (RG)",
      "type": "number",
      "required": true
    },
    {
      "id": "data_nascimento",
      "label": "Data de Nascimento",
      "type": "text",
      "required": true,
      "placeholder": "Formato: 01/02/1989"
    },
    {
      "id": "data_obito",
      "label": "Data de Óbito",
      "type": "text",
      "required": false,
      "placeholder": "DD/MM/AAAA"
    },
    {
      "id": "orgao_emissor",
      "label": "Órgão Emissor",
      "type": "text",
      "required": true
    },
    {
      "id": "cpf",
      "label": "CPF do(a) Falecido(a)",
      "type": "text",
      "required": true
    },
    {
      "id": "nao_possui_data_obito",
      "label": "Possui data de óbito?",
      "type": "checkbox",
      "required": false
    },
    {
      "id": "nome_mae_falecido",
      "label": "Nome da Mãe do(a) Falecido(a)",
      "type": "text",
      "required": true
    },
    {
      "id": "nao_possui_cpf",
      "label": "O(A) Falecido(a) Possui CPF?",
      "type": "checkbox",
      "required": false
    },
    {
      "id": "nome_pai_do_falecido",
      "label": "Nome do Pai do(a) Falecido(a)",
      "type": "text",
      "required": true
    },
    {
      "id": "finalidade_certidao",
      "label": "Qual a finalidade da certidão?",
      "type": "text",
      "required": true
    }
  ],
  "consulta-de-inventario": [
    {
      "id": "pessoa_fisica_juridica",
      "label": "Pessoa Física ou Jurídica?",
      "type": "radio",
      "required": false,
      "options": [
        {
          "label": "Pessoa Jurídica (CNPJ)",
          "value": "pessoa-juridica"
        },
        {
          "label": "Pessoa Física (CPF)",
          "value": "pessoa-fisica"
        }
      ]
    },
    {
      "id": "nome_completo",
      "label": "Nome Completo",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-fisica"
        ]
      }
    },
    {
      "id": "cpf",
      "label": "CPF",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-fisica"
        ]
      }
    },
    {
      "id": "razao_social",
      "label": "Razão Social",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-juridica"
        ]
      }
    },
    {
      "id": "cnpj",
      "label": "CNPJ",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-juridica"
        ]
      }
    }
  ],
  "certidao-de-inventario": [
    {
      "id": "nome_completo",
      "label": "Nome Completo",
      "type": "text",
      "required": true
    },
    {
      "id": "pessoa_fisica_juridica",
      "label": "Pessoa Física ou Jurídica?",
      "type": "radio",
      "required": true,
      "options": [
        {
          "label": "Pessoa Jurídica",
          "value": "pessoa_juridica"
        },
        {
          "label": "Pessoa Física",
          "value": "pessoa_fisica"
        }
      ]
    },
    {
      "id": "nome",
      "label": "Nome",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-fisica"
        ]
      }
    },
    {
      "id": "cpf",
      "label": "CPF",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-fisica"
        ]
      }
    },
    {
      "id": "razao_social",
      "label": "Razão Social",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-juridica"
        ]
      }
    },
    {
      "id": "cnpj",
      "label": "CNPJ",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-juridica"
        ]
      }
    },
    {
      "id": "numero_livro",
      "label": "Número do Livro",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "nao_sabe_livro_folha",
        "notIn": [
          "true"
        ]
      }
    },
    {
      "id": "numero_folha",
      "label": "Número da Folha",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "nao_sabe_livro_folha",
        "notIn": [
          "true"
        ]
      }
    },
    {
      "id": "nao_sabe_livro_folha",
      "label": "Não sei o livro e a folha",
      "type": "checkbox",
      "required": false
    },
    {
      "id": "data_ato",
      "label": "Data do Ato",
      "type": "date",
      "required": true
    }
  ],
  "certidao-de-procuracao": [
    {
      "id": "nome_completo",
      "label": "Nome Completo",
      "type": "text",
      "required": true
    },
    {
      "id": "pessoa_fisica_juridica",
      "label": "Pessoa Física ou Jurídica?",
      "type": "radio",
      "required": true,
      "options": [
        {
          "label": "Pessoa Jurídica",
          "value": "pessoa-juridica"
        },
        {
          "label": "Pessoa Física",
          "value": "pessoa-fisica"
        }
      ]
    },
    {
      "id": "nome",
      "label": "Nome",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-fisica"
        ]
      }
    },
    {
      "id": "cpf",
      "label": "CPF",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-fisica"
        ]
      }
    },
    {
      "id": "razao_social",
      "label": "Razão Social",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-juridica"
        ]
      }
    },
    {
      "id": "cnpj",
      "label": "CNPJ",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-juridica"
        ]
      }
    },
    {
      "id": "numero_livro",
      "label": "Número do Livro",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "nao_sei_livro_folha",
        "notIn": [
          "true"
        ]
      }
    },
    {
      "id": "numero_folhe",
      "label": "Número da Folha",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "nao_sei_livro_folha",
        "notIn": [
          "true"
        ]
      }
    },
    {
      "id": "nao_sei_livro_folha",
      "label": "Não sei o livro e a folha",
      "type": "checkbox",
      "required": false
    },
    {
      "id": "data_ato",
      "label": "Data do Ato",
      "type": "text",
      "required": true
    }
  ],
  "certidao-de-escritura-de-ata-notarial": [
    {
      "id": "nome",
      "label": "Nome Completo",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-fisica"
        ]
      }
    },
    {
      "id": "pessoa_fisica_juridica",
      "label": "Pessoa Física ou Jurídica",
      "type": "radio",
      "required": true,
      "options": [
        {
          "label": "Pessoa Jurídica",
          "value": "pessoa-juridica"
        },
        {
          "label": "Pessoa Física",
          "value": "pessoa-fisica"
        }
      ]
    },
    {
      "id": "razao_social",
      "label": "Razão Social",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-juridica"
        ]
      }
    },
    {
      "id": "cnpj",
      "label": "CNPJ",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-juridica"
        ]
      }
    },
    {
      "id": "nome_pessoa",
      "label": "Nome",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-fisica"
        ]
      }
    },
    {
      "id": "cpf",
      "label": "CPF",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-fisica"
        ]
      }
    },
    {
      "id": "numero_livro",
      "label": "Número do Livro",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "nao_sei_livro",
        "notIn": [
          "true"
        ]
      }
    },
    {
      "id": "numero_folha",
      "label": "Número da Folha",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "nao_sei_livro",
        "notIn": [
          "true"
        ]
      }
    },
    {
      "id": "nao_sei_livro",
      "label": "Não sei o livro e a folha",
      "type": "checkbox",
      "required": false
    },
    {
      "id": "data_ato",
      "label": "Data do Ato",
      "type": "date",
      "required": true
    }
  ],
  "certidao-de-escritura-de-cessao-de-direito-de-imovel": [
    {
      "id": "nome_completo",
      "label": "Nome Completo",
      "type": "text",
      "required": true
    },
    {
      "id": "pessoa_fisica_juridica",
      "label": "Pessoa Física ou Jurídica",
      "type": "radio",
      "required": true,
      "options": [
        {
          "label": "Pessoa Física",
          "value": "pessoa-fisica"
        },
        {
          "label": "Pessoa Jurídica",
          "value": "pessoa-juridica"
        }
      ]
    },
    {
      "id": "nome",
      "label": "Nome",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-fisica"
        ]
      }
    },
    {
      "id": "cpf",
      "label": "CPF",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-fisica"
        ]
      }
    },
    {
      "id": "razao_social",
      "label": "Razão Social",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-juridica"
        ]
      }
    },
    {
      "id": "cnpj",
      "label": "CNPJ",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-juridica"
        ]
      }
    },
    {
      "id": "numero_livro",
      "label": "Número do Livro",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "nao_sei_livro",
        "notIn": [
          "true"
        ]
      }
    },
    {
      "id": "numero_folha",
      "label": "Número da Folha",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "nao_sei_livro",
        "notIn": [
          "true"
        ]
      }
    },
    {
      "id": "nao_sei_livro",
      "label": "Não sei o livro e a folha",
      "type": "checkbox",
      "required": false
    },
    {
      "id": "data_ato",
      "label": "Data do Ato",
      "type": "text",
      "required": true
    }
  ],
  "certidao-de-escritura-de-compra-e-venda": [
    {
      "id": "nome_completo",
      "label": "Nome Completo",
      "type": "text",
      "required": true
    },
    {
      "id": "pessoa_fisica_juridica",
      "label": "Pessoa Física ou Jurídica?",
      "type": "radio",
      "required": true,
      "options": [
        {
          "label": "Pessoa Física",
          "value": "pessoa-fisica"
        },
        {
          "label": "Pessoa Jurídica",
          "value": "pessoa-juridica"
        }
      ]
    },
    {
      "id": "nome",
      "label": "Nome",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-fisica"
        ]
      }
    },
    {
      "id": "cpf",
      "label": "CPF",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-fisica"
        ]
      }
    },
    {
      "id": "razao_social",
      "label": "Razão Social",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-juridica"
        ]
      }
    },
    {
      "id": "cnpj",
      "label": "CNPJ",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-juridica"
        ]
      }
    },
    {
      "id": "numero_livro",
      "label": "Número do Livro",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "nao_sei_livro_folha",
        "notIn": [
          "true"
        ]
      }
    },
    {
      "id": "numero_folha",
      "label": "Número da Folha",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "nao_sei_livro_folha",
        "notIn": [
          "true"
        ]
      }
    },
    {
      "id": "nao_sei_livro_folha",
      "label": "Não sei o livro e a folha",
      "type": "checkbox",
      "required": false
    },
    {
      "id": "data_ato",
      "label": "Data do Ato",
      "type": "date",
      "required": true
    }
  ],
  "certidao-de-escritura-de-divorcio": [
    {
      "id": "pessoa_fisica_juridica",
      "label": "Pessoa Física ou Jurídica",
      "type": "radio",
      "required": true,
      "options": [
        {
          "label": "Pessoa Física",
          "value": "pessoa-fisica"
        },
        {
          "label": "Pessoa Jurídica",
          "value": "pessoa-juridica"
        }
      ]
    },
    {
      "id": "nome_completo",
      "label": "Nome Completo",
      "type": "text",
      "required": true
    },
    {
      "id": "nome",
      "label": "Nome",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-fisica"
        ]
      }
    },
    {
      "id": "cpf",
      "label": "CPF",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-fisica"
        ]
      }
    },
    {
      "id": "razao_social",
      "label": "Razão Social",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-juridica"
        ]
      }
    },
    {
      "id": "cnpj",
      "label": "CNPJ",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-juridica"
        ]
      }
    },
    {
      "id": "numero_folha",
      "label": "Número da Folha",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "sabe_livro_folha",
        "notIn": [
          "true"
        ]
      }
    },
    {
      "id": "numero_livro",
      "label": "Número do Livro",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "sabe_livro_folha",
        "notIn": [
          "true"
        ]
      }
    },
    {
      "id": "sabe_livro_folha",
      "label": "Não sei o livro e a folha",
      "type": "checkbox",
      "required": false
    },
    {
      "id": "data_ato",
      "label": "Data do Ato",
      "type": "date",
      "required": true
    }
  ],
  "certidao-de-escritura-de-doacao": [
    {
      "id": "nome_completo",
      "label": "Nome Completo",
      "type": "text",
      "required": true
    },
    {
      "id": "pessoa_fisica_juridica",
      "label": "Pessoa Física ou Jurídica",
      "type": "radio",
      "required": true,
      "options": [
        {
          "label": "Pessoa Jurídica",
          "value": "pessoa-juridica"
        },
        {
          "label": "Pessoa Física",
          "value": "pessoa-fisica"
        }
      ]
    },
    {
      "id": "nome",
      "label": "Nome",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-fisica"
        ]
      }
    },
    {
      "id": "cpf",
      "label": "CPF",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-fisica"
        ]
      }
    },
    {
      "id": "razao_social",
      "label": "Razão Social",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-juridica"
        ]
      }
    },
    {
      "id": "cnpj",
      "label": "CNPJ",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-juridica"
        ]
      }
    },
    {
      "id": "numero_livro",
      "label": "Número do Livro",
      "type": "text",
      "required": true
    },
    {
      "id": "numero_folha",
      "label": "Número da Folha",
      "type": "text",
      "required": true
    },
    {
      "id": "data_ato",
      "label": "Data do Ato",
      "type": "date",
      "required": true
    }
  ],
  "certidao-de-escritura-de-emancipacao": [
    {
      "id": "pessoa_fisica_juridica",
      "label": "Pessoa Física ou Jurídica?",
      "type": "radio",
      "required": true,
      "options": [
        {
          "label": "Pessoa Jurídica",
          "value": "pessoa-juridica"
        },
        {
          "label": "Pessoa Física",
          "value": "pessoa-fisica"
        }
      ]
    },
    {
      "id": "nome_completo",
      "label": "Nome Completo",
      "type": "text",
      "required": true
    },
    {
      "id": "nome",
      "label": "Nome",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-fisica"
        ]
      }
    },
    {
      "id": "cpf",
      "label": "CPF",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-fisica"
        ]
      }
    },
    {
      "id": "razao_social",
      "label": "Razão Social",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-juridica"
        ]
      }
    },
    {
      "id": "cnpj",
      "label": "CNPJ",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-juridica"
        ]
      }
    },
    {
      "id": "sabe_livro_folha",
      "label": "Não sei o livro e a folha",
      "type": "checkbox",
      "required": false
    },
    {
      "id": "numero_livro",
      "label": "Número do Livro",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "sabe_livro_folha",
        "notIn": [
          "true"
        ]
      }
    },
    {
      "id": "numero_folha",
      "label": "Número da Folha",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "sabe_livro_folha",
        "notIn": [
          "true"
        ]
      }
    },
    {
      "id": "data_ato",
      "label": "Data do Ato",
      "type": "date",
      "required": true
    }
  ],
  "certidao-de-escritura-de-hipoteca": [
    {
      "id": "pessoa_fisica_juridica",
      "label": "Pessoa Física ou Jurídica",
      "type": "radio",
      "required": true,
      "options": [
        {
          "label": "Pessoa Física",
          "value": "pessoa-fisica"
        },
        {
          "label": "Pessoa Jurídica",
          "value": "pessoa-juridica"
        }
      ]
    },
    {
      "id": "nome_completo",
      "label": "Nome Completo",
      "type": "text",
      "required": true
    },
    {
      "id": "nome_pessoa",
      "label": "Nome",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-fisica"
        ]
      }
    },
    {
      "id": "cpf",
      "label": "CPF",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-fisica"
        ]
      }
    },
    {
      "id": "razao_social",
      "label": "Razão Social",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-juridica"
        ]
      }
    },
    {
      "id": "cnpj",
      "label": "CNPJ",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-juridica"
        ]
      }
    },
    {
      "id": "numero_livro",
      "label": "Número do Livro",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "livro_folha",
        "notIn": [
          "true"
        ]
      }
    },
    {
      "id": "numero_folha",
      "label": "Número da Folha",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "livro_folha",
        "notIn": [
          "true"
        ]
      }
    },
    {
      "id": "livro_folha",
      "label": "Sabe o livro ou folha?",
      "type": "checkbox",
      "required": false
    },
    {
      "id": "data_ato",
      "label": "Data do Ato",
      "type": "date",
      "required": true
    }
  ],
  "certidao-de-escritura-de-imovel": [
    {
      "id": "nome_completo",
      "label": "Nome Completo",
      "type": "text",
      "required": true
    },
    {
      "id": "pessoa_fisica_juridica",
      "label": "Pessoa Física ou Jurídica",
      "type": "radio",
      "required": true,
      "options": [
        {
          "label": "Pessoa Jurídica",
          "value": "pessoa-juridica"
        },
        {
          "label": "Pessoa Física",
          "value": "pessoa-fisica"
        }
      ]
    },
    {
      "id": "nome",
      "label": "Nome",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-fisica"
        ]
      }
    },
    {
      "id": "cpf",
      "label": "CPF",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-fisica"
        ]
      }
    },
    {
      "id": "razao_social",
      "label": "Razão Social",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-juridica"
        ]
      }
    },
    {
      "id": "cnpj",
      "label": "CNPJ",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-juridica"
        ]
      }
    },
    {
      "id": "numero_livro",
      "label": "Número do Livro",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "nao_sei_livro_folha",
        "notIn": [
          "true"
        ]
      }
    },
    {
      "id": "numero_folhe",
      "label": "Número da Folha",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "nao_sei_livro_folha",
        "notIn": [
          "true"
        ]
      }
    },
    {
      "id": "nao_sei_livro_folha",
      "label": "Não sei o livro e a folha",
      "type": "checkbox",
      "required": false
    },
    {
      "id": "data_ato",
      "label": "Data do Ato",
      "type": "date",
      "required": true
    }
  ],
  "certidao-de-escritura-de-inventario-e-partilha": [
    {
      "id": "nome_completo",
      "label": "Nome Completo",
      "type": "text",
      "required": true
    },
    {
      "id": "pessoa_fisica_juridica",
      "label": "Pessoa Física ou Jurídica",
      "type": "radio",
      "required": true,
      "options": [
        {
          "label": "Pessoa Jurídica",
          "value": "pessoa-juridica"
        },
        {
          "label": "Pessoa Física",
          "value": "pessoa-fisica"
        }
      ]
    },
    {
      "id": "nome",
      "label": "Nome",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-fisica"
        ]
      }
    },
    {
      "id": "cpf",
      "label": "CPF",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-fisica"
        ]
      }
    },
    {
      "id": "razao_social",
      "label": "Razão Social",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-juridica"
        ]
      }
    },
    {
      "id": "cnpj",
      "label": "CNPJ",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-juridica"
        ]
      }
    },
    {
      "id": "numero_livro",
      "label": "Número do Livro",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "nao_sei_livro",
        "notIn": [
          "true"
        ]
      }
    },
    {
      "id": "numero_folha",
      "label": "Número da Folha",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "nao_sei_livro",
        "notIn": [
          "true"
        ]
      }
    },
    {
      "id": "nao_sei_livro",
      "label": "Não sei o livro e a folha",
      "type": "checkbox",
      "required": false
    },
    {
      "id": "data_ato",
      "label": "Data do Ato",
      "type": "date",
      "required": true
    }
  ],
  "certidao-de-escritura-de-pacto-antenupcial": [
    {
      "id": "nome_completo",
      "label": "Nome completo",
      "type": "text",
      "required": true
    },
    {
      "id": "pessoa_fisica_juridica",
      "label": "Pessoa Física ou Jurídica",
      "type": "radio",
      "required": true,
      "options": [
        {
          "label": "Pessoa Física",
          "value": "pessoa-fisica"
        },
        {
          "label": "Pessoa Jurídica",
          "value": "pessoa-juridica"
        }
      ]
    },
    {
      "id": "nome",
      "label": "Nome",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-fisica"
        ]
      }
    },
    {
      "id": "cpf",
      "label": "CPF",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-fisica"
        ]
      }
    },
    {
      "id": "razao_socila",
      "label": "Razão Social",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-juridica"
        ]
      }
    },
    {
      "id": "cnpj",
      "label": "CNPJ",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-juridica"
        ]
      }
    },
    {
      "id": "numero_livro",
      "label": "Número do Livro",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "nao_sei_livro_folha",
        "notIn": [
          "true"
        ]
      }
    },
    {
      "id": "numero_folhe",
      "label": "Número da Folha",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "nao_sei_livro_folha",
        "notIn": [
          "true"
        ]
      }
    },
    {
      "id": "nao_sei_livro_folha",
      "label": "Não sei o livro e a folha",
      "type": "checkbox",
      "required": true
    },
    {
      "id": "data_ato",
      "label": "Data do Ato",
      "type": "date",
      "required": true
    }
  ],
  "certidao-de-escritura-de-permuta": [
    {
      "id": "pessoa_fisica_juridica",
      "label": "Pessoa Física ou Jurídica?",
      "type": "radio",
      "required": true,
      "options": [
        {
          "label": "Pessoa Jurídica",
          "value": "pessoa-juridica"
        },
        {
          "label": "Pessoa Física",
          "value": "pessoa-fisica"
        }
      ]
    },
    {
      "id": "nome_completo",
      "label": "Nome Completo",
      "type": "text",
      "required": true
    },
    {
      "id": "nome_pessoa",
      "label": "Nome",
      "type": "text",
      "required": false,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-fisica"
        ]
      }
    },
    {
      "id": "cpf",
      "label": "CPF",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-fisica"
        ]
      }
    },
    {
      "id": "razao_social",
      "label": "Razão Social",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-juridica"
        ]
      }
    },
    {
      "id": "cnpj",
      "label": "CNPJ",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-juridica"
        ]
      }
    },
    {
      "id": "numero_livro",
      "label": "Número do Livro",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "nao_sei_livro_folha",
        "notIn": [
          "true"
        ]
      }
    },
    {
      "id": "numero_folha",
      "label": "Número da Folha",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "nao_sei_livro_folha",
        "notIn": [
          "true"
        ]
      }
    },
    {
      "id": "nao_sei_livro_folha",
      "label": "Não sei o livro e a folha",
      "type": "checkbox",
      "required": true
    },
    {
      "id": "dara_ato",
      "label": "Data do Ato",
      "type": "date",
      "required": true
    }
  ],
  "certidao-de-escritura-de-registro-de-condominio": [
    {
      "id": "nome_completo",
      "label": "Nome Completo",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-fisica"
        ]
      }
    },
    {
      "id": "pessoa_fisica_juridica",
      "label": "Pessoa Física ou Jurídica",
      "type": "radio",
      "required": true,
      "options": [
        {
          "label": "Pessoa Física",
          "value": "pessoa-fisica"
        },
        {
          "label": "Pessoa Jurídica",
          "value": "pessoa-juridica"
        }
      ]
    },
    {
      "id": "Nome",
      "label": "Nome",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-fisica"
        ]
      }
    },
    {
      "id": "cpf",
      "label": "CPF",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-fisica"
        ]
      }
    },
    {
      "id": "razao_social",
      "label": "Razão Social",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-juridica"
        ]
      }
    },
    {
      "id": "cnpj",
      "label": "CNPJ",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-juridica"
        ]
      }
    },
    {
      "id": "numero_livro",
      "label": "Número do Livro",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "sabe_livro_folha",
        "notIn": [
          "true"
        ]
      }
    },
    {
      "id": "numero_folha",
      "label": "Número da Folha",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "sabe_livro_folha",
        "notIn": [
          "true"
        ]
      }
    },
    {
      "id": "sabe_livro_folha",
      "label": "Não sei o livro e a folha",
      "type": "checkbox",
      "required": false
    },
    {
      "id": "data_ato",
      "label": "Data do Ato",
      "type": "date",
      "required": true
    }
  ],
  "certidao-de-escritura-de-registro-de-partilha": [
    {
      "id": "nome_completo",
      "label": "Nome Completo",
      "type": "text",
      "required": true
    },
    {
      "id": "pessoa_fisica_juridica",
      "label": "Pessoa Física ou Jurídica?",
      "type": "radio",
      "required": true,
      "options": [
        {
          "label": "Pessoa Jurídica",
          "value": "pessoa-juridica"
        },
        {
          "label": "Pessoa Física",
          "value": "pessoa-fisica"
        }
      ]
    },
    {
      "id": "nome",
      "label": "Nome",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-fisica"
        ]
      }
    },
    {
      "id": "cpf",
      "label": "CPF",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-fisica"
        ]
      }
    },
    {
      "id": "razao_social",
      "label": "Razão Social",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-juridica"
        ]
      }
    },
    {
      "id": "cnpj",
      "label": "CNPJ",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-juridica"
        ]
      }
    },
    {
      "id": "numero_livro",
      "label": "Número do Livro",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "nao_sei_livro_folha",
        "notIn": [
          "true"
        ]
      }
    },
    {
      "id": "numero_folha",
      "label": "Número da Folha",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "nao_sei_livro_folha",
        "notIn": [
          "true"
        ]
      }
    },
    {
      "id": "nao_sei_livro_folha",
      "label": "Não sei o livro e a folha",
      "type": "checkbox",
      "required": false
    },
    {
      "id": "data_ato",
      "label": "Data do ato",
      "type": "date",
      "required": true
    }
  ],
  "certidao-de-escritura-de-renuncia-de-heranca": [
    {
      "id": "nome_completo",
      "label": "Nome completo",
      "type": "text",
      "required": true
    },
    {
      "id": "pessoa_fisica_juridica",
      "label": "Pessoa Física ou Jurídica?",
      "type": "radio",
      "required": true,
      "options": [
        {
          "label": "Pessoa Jurídica",
          "value": "pessoa-juridica"
        },
        {
          "label": "Pessoa Física",
          "value": "pessoa-fisica"
        }
      ]
    },
    {
      "id": "nome",
      "label": "Nome",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-fisica"
        ]
      }
    },
    {
      "id": "cpf",
      "label": "CPF",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-fisica"
        ]
      }
    },
    {
      "id": "razao_social",
      "label": "Razão Social",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-juridica"
        ]
      }
    },
    {
      "id": "cnpj",
      "label": "CNPJ",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-juridica"
        ]
      }
    },
    {
      "id": "numero_livro",
      "label": "Número do Livro",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "sabe_livro_folha",
        "notIn": [
          "true"
        ]
      }
    },
    {
      "id": "numero_folha",
      "label": "Número da Folha",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "sabe_livro_folha",
        "notIn": [
          "true"
        ]
      }
    },
    {
      "id": "sabe_livro_folha",
      "label": "Não sei o livro e a folha",
      "type": "checkbox",
      "required": false
    },
    {
      "id": "data_ato",
      "label": "Data do Ato",
      "type": "date",
      "required": true
    }
  ],
  "certidao-de-escritura-de-substabelecimento": [
    {
      "id": "nome_completo",
      "label": "Nome Completo",
      "type": "text",
      "required": true
    },
    {
      "id": "pessoa_fisica_juridica",
      "label": "Pessoa Física ou Jurídica?",
      "type": "radio",
      "required": true,
      "options": [
        {
          "label": "Pessoa Jurídica",
          "value": "pessoa-juridica"
        },
        {
          "label": "Pessoa Física",
          "value": "pessoa-fisica"
        }
      ]
    },
    {
      "id": "nome",
      "label": "Nome",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-fisica"
        ]
      }
    },
    {
      "id": "cpf",
      "label": "CPF",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-fisica"
        ]
      }
    },
    {
      "id": "razao_social",
      "label": "Razão Social",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-juridica"
        ]
      }
    },
    {
      "id": "cnpj",
      "label": "CNPJ",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-juridica"
        ]
      }
    },
    {
      "id": "numero_livro",
      "label": "Número do Livro",
      "type": "text",
      "required": true
    },
    {
      "id": "numero_folha",
      "label": "Número da Folha",
      "type": "text",
      "required": true
    },
    {
      "id": "data_ato",
      "label": "Data do Ato",
      "type": "date",
      "required": true
    }
  ],
  "certidao-de-escritura-de-uniao-estavel": [
    {
      "id": "nome_completo",
      "label": "Nome completo",
      "type": "text",
      "required": true
    },
    {
      "id": "pessoa_fisica_juridica",
      "label": "Pessoa Física ou Jurídica?",
      "type": "radio",
      "required": true,
      "options": [
        {
          "label": "Pessoa Física",
          "value": "pessoa-fisica"
        },
        {
          "label": "Pessoa Jurídica",
          "value": "pessoa-juridica"
        }
      ]
    },
    {
      "id": "nome",
      "label": "Nome",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-fisica"
        ]
      }
    },
    {
      "id": "cpf",
      "label": "CPF",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-fisica"
        ]
      }
    },
    {
      "id": "razao_social",
      "label": "Razão Social",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-juridica"
        ]
      }
    },
    {
      "id": "cnpj",
      "label": "CNPJ",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-juridica"
        ]
      }
    },
    {
      "id": "numero_livro",
      "label": "Número do Livro",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "nao_sei_livro_folha",
        "notIn": [
          "true"
        ]
      }
    },
    {
      "id": "numero_folha",
      "label": "Número da Folha",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "nao_sei_livro_folha",
        "notIn": [
          "true"
        ]
      }
    },
    {
      "id": "nao_sei_livro_folha",
      "label": "Não sei o livro e a folha",
      "type": "checkbox",
      "required": false
    },
    {
      "id": "data_ato",
      "label": "Data do Ato",
      "type": "date",
      "required": true
    }
  ],
  "certidao-de-escritura-de-usucapiao": [
    {
      "id": "numero_livro",
      "label": "Número do Livro",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "nao_sei_livro",
        "notIn": [
          "true"
        ]
      }
    },
    {
      "id": "nome_completo",
      "label": "Nome Completo",
      "type": "text",
      "required": true
    },
    {
      "id": "numero_folha",
      "label": "Número da Folha",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "nao_sei_livro",
        "notIn": [
          "true"
        ]
      }
    },
    {
      "id": "nao_sei_livro",
      "label": "Não sei o livro e a folha",
      "type": "checkbox",
      "required": false
    },
    {
      "id": "data_ato",
      "label": "Data do Ato",
      "type": "date",
      "required": true
    }
  ],
  "certidao-de-matricula-de-imovel": [
    {
      "id": "emitir_por",
      "label": "Como emitir",
      "type": "select",
      "required": true,
      "options": [
        {
          "label": "Número da Matrícula",
          "value": "matricula"
        },
        {
          "label": "Endereço do Imóvel",
          "value": "endereco"
        },
        {
          "label": "Matrícula e pelo Endereço",
          "value": "matricula_endereco"
        }
      ]
    },
    {
      "id": "negativa_onus",
      "label": "Certidão Negativa de Ônus de Imóvel",
      "type": "checkbox",
      "required": false,
      "visibleWhen": {
        "field": "_uf",
        "in": [
          "AC",
          "AL",
          "AM",
          "AP",
          "BA",
          "CE",
          "DF",
          "ES",
          "GO",
          "MA",
          "MG",
          "MS",
          "MT",
          "PA",
          "PB",
          "PE",
          "PI",
          "PR",
          "RJ",
          "RN",
          "RO",
          "RR",
          "RS",
          "SC",
          "SE",
          "SP",
          "TO"
        ]
      }
    },
    {
      "id": "numero_matricula",
      "label": "Digite o Número da Matrícula",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "emitir_por",
        "in": [
          "matricula",
          "matricula_endereco"
        ]
      }
    },
    {
      "id": "cep_autocomplete",
      "label": "CEP",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "emitir_por",
        "in": [
          "endereco",
          "matricula_endereco"
        ]
      }
    },
    {
      "id": "cep_uf",
      "label": "UF",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "emitir_por",
        "in": [
          "endereco",
          "matricula_endereco"
        ]
      },
      "dataSource": "ibge-uf"
    },
    {
      "id": "cep_cidade",
      "label": "Cidade",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "emitir_por",
        "in": [
          "endereco",
          "matricula_endereco"
        ]
      },
      "dataSource": "ibge-city"
    },
    {
      "id": "cep_bairro",
      "label": "Bairro",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "emitir_por",
        "in": [
          "endereco",
          "matricula_endereco"
        ]
      }
    },
    {
      "id": "cep_logradouro",
      "label": "Logradouro",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "emitir_por",
        "in": [
          "endereco",
          "matricula_endereco"
        ]
      }
    },
    {
      "id": "cep_numero",
      "label": "Número",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "emitir_por",
        "in": [
          "endereco",
          "matricula_endereco"
        ]
      }
    },
    {
      "id": "cep_complemento",
      "label": "Complemento",
      "type": "text",
      "required": false,
      "visibleWhen": {
        "field": "emitir_por",
        "in": [
          "endereco",
          "matricula_endereco"
        ]
      }
    }
  ],
  "busca-da-matricula-do-imovel": [
    {
      "id": "metodo_busca",
      "label": "Selecione o método de busca",
      "type": "radio",
      "required": true,
      "options": [
        {
          "label": "CNPJ do Proprietário",
          "value": "cnpj-proprietario"
        },
        {
          "label": "Endereço do Imóvel",
          "value": "endereco-imovel",
          "price": 170
        },
        {
          "label": "CPF do Proprietário",
          "value": "cpf-proprietario"
        }
      ]
    },
    {
      "id": "nome_completo",
      "label": "Nome Completo",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "metodo_busca",
        "in": [
          "cpf-proprietario"
        ]
      }
    },
    {
      "id": "cpf",
      "label": "CPF",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "metodo_busca",
        "in": [
          "cpf-proprietario"
        ]
      }
    },
    {
      "id": "todos_cartorios_cidade",
      "label": "Todos os Cartórios",
      "type": "checkbox",
      "required": false
    },
    {
      "id": "possiveis_proprietarios",
      "label": "Possíveis Proprietários",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "metodo_busca",
        "in": [
          "endereco-imovel"
        ]
      }
    },
    {
      "id": "razao_social",
      "label": "Razão Social",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "metodo_busca",
        "in": [
          "cnpj-proprietario"
        ]
      }
    },
    {
      "id": "cnpj",
      "label": "CNPJ",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "metodo_busca",
        "in": [
          "cnpj-proprietario"
        ]
      }
    },
    {
      "id": "cep_uf",
      "label": "UF",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "metodo_busca",
        "in": [
          "endereco-imovel"
        ]
      },
      "dataSource": "ibge-uf"
    },
    {
      "id": "cep_cidade",
      "label": "Cidade",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "metodo_busca",
        "in": [
          "endereco-imovel"
        ]
      },
      "dataSource": "ibge-city"
    },
    {
      "id": "cep_bairro",
      "label": "Bairro",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "metodo_busca",
        "in": [
          "endereco-imovel"
        ]
      }
    },
    {
      "id": "cep_logradouro",
      "label": "Logradouro",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "metodo_busca",
        "in": [
          "endereco-imovel"
        ]
      }
    },
    {
      "id": "cep_numero",
      "label": "Número",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "metodo_busca",
        "in": [
          "endereco-imovel"
        ]
      }
    },
    {
      "id": "cep_complemento",
      "label": "Complemento",
      "type": "text",
      "required": false,
      "visibleWhen": {
        "field": "metodo_busca",
        "in": [
          "endereco-imovel"
        ]
      }
    },
    {
      "id": "cep_autocomplete",
      "label": "CEP",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "metodo_busca",
        "in": [
          "endereco-imovel"
        ]
      }
    }
  ],
  "certidao-negativa-de-onus-de-imovel": [
    {
      "id": "emitir_por",
      "label": "Como emitir",
      "type": "select",
      "required": true,
      "options": [
        {
          "label": "Número da Matrícula",
          "value": "matricula"
        },
        {
          "label": "Endereço do Imóvel",
          "value": "endereco"
        },
        {
          "label": "Matrícula e pelo Endereço",
          "value": "matricula_endereco"
        }
      ]
    },
    {
      "id": "certidao_matricula_atualizada_inteiro_teor",
      "label": "Certidão de Matrícula Atualizada com Inteiro Teor",
      "type": "checkbox",
      "required": false,
      "visibleWhen": {
        "field": "_uf",
        "in": [
          "AC",
          "AL",
          "AM",
          "AP",
          "BA",
          "CE",
          "DF",
          "ES",
          "GO",
          "MA",
          "MG",
          "MS",
          "MT",
          "PA",
          "PB",
          "PE",
          "PI",
          "PR",
          "RJ",
          "RN",
          "RO",
          "RR",
          "RS",
          "SC",
          "SE",
          "SP",
          "TO"
        ]
      }
    },
    {
      "id": "numero_matricula",
      "label": "Digite o Número da Matrícula",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "emitir_por",
        "in": [
          "matricula",
          "matricula_endereco"
        ]
      }
    },
    {
      "id": "cep_autocomplete",
      "label": "CEP",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "emitir_por",
        "in": [
          "endereco",
          "matricula_endereco"
        ]
      }
    },
    {
      "id": "cep_uf",
      "label": "UF",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "emitir_por",
        "in": [
          "endereco",
          "matricula_endereco"
        ]
      },
      "dataSource": "ibge-uf"
    },
    {
      "id": "cep_cidade",
      "label": "Cidade",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "emitir_por",
        "in": [
          "endereco",
          "matricula_endereco"
        ]
      },
      "dataSource": "ibge-city"
    },
    {
      "id": "cep_bairro",
      "label": "Bairro",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "emitir_por",
        "in": [
          "endereco",
          "matricula_endereco"
        ]
      }
    },
    {
      "id": "cep_logradouro",
      "label": "Logradouro",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "emitir_por",
        "in": [
          "endereco",
          "matricula_endereco"
        ]
      }
    },
    {
      "id": "cep_numero",
      "label": "Número",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "emitir_por",
        "in": [
          "endereco",
          "matricula_endereco"
        ]
      }
    },
    {
      "id": "cep_complemento",
      "label": "Complemento",
      "type": "text",
      "required": false,
      "visibleWhen": {
        "field": "emitir_por",
        "in": [
          "endereco",
          "matricula_endereco"
        ]
      }
    }
  ],
  "certidao-negativa-de-propriedade-imovel": [
    {
      "id": "nome_proprietario",
      "label": "Nome do Proprietário",
      "type": "text",
      "required": false
    },
    {
      "id": "cpf_cnpj",
      "label": "CPF ou CNPJ do Proprietário",
      "type": "text",
      "required": false
    },
    {
      "id": "finalidade_certidao",
      "label": "Qual a Finalidade Desta Certidão?",
      "type": "text",
      "required": false
    }
  ],
  "pesquisa-de-imoveis": [
    {
      "id": "pessoa_fisica_juridica",
      "label": "Pessoa Física ou Jurídica?",
      "type": "radio",
      "required": true,
      "options": [
        {
          "label": "Jurídica",
          "value": "juridica"
        },
        {
          "label": "Física",
          "value": "fisica"
        }
      ]
    },
    {
      "id": "nome_proprietario",
      "label": "Nome Completo",
      "type": "text",
      "required": true
    },
    {
      "id": "cpf",
      "label": "CPF",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-fisica"
        ]
      }
    },
    {
      "id": "razao_social",
      "label": "Razão Social",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-juridica"
        ]
      }
    },
    {
      "id": "cnpj",
      "label": "CNPJ",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-juridica"
        ]
      }
    }
  ],
  "certidao-de-protesto": [
    {
      "id": "pessoa_fisica_juridica",
      "label": "Pessoa Física ou Jurídica",
      "type": "radio",
      "required": true,
      "options": [
        {
          "label": "Pessoa Jurídica",
          "value": "pessoa-juridica"
        },
        {
          "label": "Pessoa Física",
          "value": "pessoa-fisica"
        }
      ]
    },
    {
      "id": "nome_completo",
      "label": "Nome Completo",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-fisica"
        ]
      }
    },
    {
      "id": "cpf",
      "label": "CPF",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-fisica"
        ]
      }
    },
    {
      "id": "razao_social",
      "label": "Razão Social",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-juridica"
        ]
      }
    },
    {
      "id": "cnpj",
      "label": "CNPJ",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-juridica"
        ]
      }
    }
  ],
  "pesquisa-de-protesto": [
    {
      "id": "pessoa_fisica_juridica",
      "label": "Pessoa Física ou Jurídica?",
      "type": "radio",
      "required": false,
      "options": [
        {
          "label": "Pessoa Física (CPF)",
          "value": "pessoa-fisica"
        },
        {
          "label": "Pessoa Jurídica (CNPJ)",
          "value": "pessoa-juridica"
        }
      ]
    },
    {
      "id": "cpf",
      "label": "CPF",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-fisica"
        ]
      }
    },
    {
      "id": "cnpj",
      "label": "CNPJ",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-juridica"
        ]
      }
    }
  ],
  "trf-certidao-de-distribuicao-da-justica-federal": [
    {
      "id": "pessoa_fisica_juridica",
      "label": "Pessoa Física ou Jurídica",
      "type": "radio",
      "required": true,
      "options": [
        {
          "label": "Pessoa Jurídica",
          "value": "pessoa-juridica"
        },
        {
          "label": "Pessoa Física",
          "value": "pessoa-fisica"
        }
      ]
    },
    {
      "id": "nome_da_mae",
      "label": "Nome da Mãe",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-fisica"
        ]
      }
    },
    {
      "id": "cnpj",
      "label": "CNPJ",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-juridica"
        ]
      }
    },
    {
      "id": "tipo_certidao",
      "label": "Tipo de Certidão",
      "type": "select",
      "required": true,
      "options": [
        {
          "label": "Cível",
          "value": "civel"
        },
        {
          "label": "Eleitoral",
          "value": "eleitoral"
        },
        {
          "label": "Cível e Criminal",
          "value": "civel-criminal"
        },
        {
          "label": "Criminal",
          "value": "criminal"
        }
      ]
    },
    {
      "id": "rg",
      "label": "RG",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-fisica"
        ]
      }
    },
    {
      "id": "cpf",
      "label": "CPF",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-fisica"
        ]
      }
    },
    {
      "id": "nome_pai",
      "label": "Nome do Pai",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-fisica"
        ]
      }
    },
    {
      "id": "razao_social",
      "label": "Razão Social",
      "type": "text",
      "required": false,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-juridica"
        ]
      }
    },
    {
      "id": "nome_completo",
      "label": "Nome Completo",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-fisica"
        ]
      }
    },
    {
      "id": "orgao_expedidor",
      "label": "Orgão Expedidor",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-fisica"
        ]
      }
    },
    {
      "id": "regime_tribunal",
      "label": "Regime do Tribunal Federal",
      "type": "select",
      "required": true,
      "options": [
        {
          "label": "3ª Região",
          "value": "teceira-regiao"
        },
        {
          "label": "4ª Região",
          "value": "quarta-regiao"
        },
        {
          "label": "1ª Região",
          "value": "primeira-regiao"
        },
        {
          "label": "5ª Região",
          "value": "quinta-regiao"
        },
        {
          "label": "2ª Região",
          "value": "segunda-regiao"
        },
        {
          "label": "6ª Região",
          "value": "sexta-regiao"
        }
      ]
    },
    {
      "id": "orgao",
      "label": "Órgão",
      "type": "select",
      "required": true,
      "options": [
        {
          "label": "Fins Eleitorais (Lei da Ficha Limpa)",
          "value": "fins-eleitorais"
        },
        {
          "label": "Fins Gerais 2º Grau (TRF)",
          "value": "fins-gerais-segundo-grau-trf"
        },
        {
          "label": "Fins Gerais 1º Grau",
          "value": "fins-gerais-primeiro-grau"
        }
      ]
    },
    {
      "id": "estado_civil",
      "label": "Estado Civil",
      "type": "select",
      "required": true,
      "options": [
        {
          "label": "Divorciado(a)",
          "value": "divorciado"
        },
        {
          "label": "Casado(a)",
          "value": "casado"
        },
        {
          "label": "Solteiro(a)",
          "value": "solteiro"
        },
        {
          "label": "Viúvo(a)",
          "value": "viuvo"
        },
        {
          "label": "Separado(a)",
          "value": "separado"
        }
      ],
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-fisica"
        ]
      }
    }
  ],
  "trt-certidao-de-acoes-trabalhistas-ceat": [
    {
      "id": "pessoa_fisica_juridica",
      "label": "Pessoa Física ou Jurídica?",
      "type": "radio",
      "required": true,
      "options": [
        {
          "label": "Pessoa Física",
          "value": "pessoa-fisica"
        },
        {
          "label": "Pessoa Jurídica",
          "value": "pessoa-juridica"
        }
      ]
    },
    {
      "id": "regiao_tribunal",
      "label": "Região do Tribunal Federal",
      "type": "select",
      "required": true,
      "options": [
        {
          "label": "21ª - Jurisdição no Estado do Rio Grande do Norte",
          "value": "vigesima-primeira"
        },
        {
          "label": "22ª - Jurisdição no Estado do Piauí",
          "value": "vigesima-segunda"
        },
        {
          "label": "15ª - Jurisdição no Estado de São Paulo (Interior)",
          "value": "decima-quinta-jurisdicao-sp"
        },
        {
          "label": "3ª - Jurisdição no Estado de Minas Gerais",
          "value": "terceira-jurisdicao-minas"
        },
        {
          "label": "19ª - Jurisdição no Estado de Alagoas",
          "value": "decima-nona"
        },
        {
          "label": "18ª - Jurisdição no Estado de Goiás",
          "value": "decima-oitava"
        },
        {
          "label": "11ª - Jurisdição no Estado de Roraima e Amazonas",
          "value": "decima-primeira-jurisdicao-roraima-amazonas"
        },
        {
          "label": "7ª - Jurisdição no Estado do Ceará",
          "value": "setima-jurisdicao-ceara"
        },
        {
          "label": "12ª - Jurisdição no Estado de Santa Catarina",
          "value": "decima-segunda-jurisdicao-santa-catarina"
        },
        {
          "label": "23ª - Jurisdição no Estado do Mato Grosso",
          "value": "vigesima-terceira"
        },
        {
          "label": "2ª - Jurisdição no Estado de São Paulo (capital)",
          "value": "segunda-jurisdição-de-sao-paulo"
        },
        {
          "label": "13ª - Jurisdição no Estado da Paraíba",
          "value": "decima-terceira-jurisdicao-paraiba"
        },
        {
          "label": "8ª - Jurisdição nos Estados do Pará e Amapá",
          "value": "oitava-jurisdicao-para-amapa"
        },
        {
          "label": "14ª - Jurisdição nos Estados do Acre e Rondônia",
          "value": "decima-quarta-jurisdicao-acre-rondonia"
        },
        {
          "label": "20ª - Jurisdição no Estado de Sergipe",
          "value": "vigesima"
        },
        {
          "label": "5ª - Jurisdição no Estado da Bahia",
          "value": "quinta-jurisdicao-bahia"
        },
        {
          "label": "16ª - Jurisdição no Estado do Maranhão",
          "value": "decima-sexta-ma"
        },
        {
          "label": "1ª -Jurisdição no Estado do Rio de Janeiro",
          "value": "primeira-jurisdicao-do-rio-de-janeiro"
        },
        {
          "label": "9ª - Jurisdição no Estado do Paraná",
          "value": "nona-juridicao-parana"
        },
        {
          "label": "10ª - Jurisdição no Distrito Federal e Tocantins",
          "value": "decima-jurisdicao-tocantins"
        },
        {
          "label": "24ª - Jurisdição no Estado do Mato Grosso do Sul",
          "value": "vigesima-quarta"
        },
        {
          "label": "17ª - Jurisdição no Estado do Espírito Santo",
          "value": "decima-setima"
        },
        {
          "label": "4ª - Jurisdição no Estado do Rio Grande do Sul",
          "value": "quarta-jurisdicao-rio-grande-do-sul"
        },
        {
          "label": "6ª - Jurisdição no Estado de Pernambuco",
          "value": "sexta-juridicao-pernambuco"
        }
      ]
    },
    {
      "id": "razao_social",
      "label": "Razão Social",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-juridica"
        ]
      }
    },
    {
      "id": "nome_completo",
      "label": "Nome Completo",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-fisica"
        ]
      }
    },
    {
      "id": "cnpj",
      "label": "CNPJ",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-juridica"
        ]
      }
    },
    {
      "id": "cpf",
      "label": "CPF",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-fisica"
        ]
      }
    }
  ],
  "ccir-certificado-cadastro-imovel-rural-incra": [
    {
      "id": "state",
      "label": "Estado",
      "type": "select",
      "required": true,
      "dataSource": "ibge-uf"
    },
    {
      "id": "pessoa_fisica_juridica",
      "label": "Pessoa Física ou Jurídica",
      "type": "radio",
      "required": true,
      "options": [
        {
          "label": "Pessoa Jurídica (CNPJ)",
          "value": "pessoa-juridica"
        },
        {
          "label": "Pessoa Física (CPF)",
          "value": "pessoa-fisica"
        }
      ]
    },
    {
      "id": "codigo_imovel",
      "label": "Código do Imóvel Rural (contém 13 dígitos)",
      "type": "text",
      "required": false
    },
    {
      "id": "city",
      "label": "Município",
      "type": "select",
      "required": true,
      "dataSource": "ibge-city"
    },
    {
      "id": "cnpj",
      "label": "CNPJ",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-juridica"
        ]
      }
    },
    {
      "id": "cpf",
      "label": "CPF",
      "type": "text",
      "required": true,
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-fisica"
        ]
      }
    },
    {
      "id": "natureza_juridica",
      "label": "Natureza Jurídica",
      "type": "select",
      "required": false,
      "options": [
        {
          "label": "Órgão Público do Poder Executivo Federal",
          "value": "orgao-publico-do-poder-executivo-federal"
        },
        {
          "label": "Órgão Público do Poder Executivo Estadual ou do Distrito Federal",
          "value": "orgao-publico-do-poder-executivo-estadual-ou-do-distrito-federal"
        },
        {
          "label": "Sociedade Empresária em Comandita por Ações",
          "value": "sociedade-empresaria-em-comandita-por-acoes"
        },
        {
          "label": "Grupo de Sociedades",
          "value": "grupo-de-sociedades"
        },
        {
          "label": "Fundo Público da Administração Direta Estadual ou do Distrito Federal",
          "value": "fundo-publico-da-administracao-direta-estadual-ou-do-distrito-federal"
        },
        {
          "label": "Empresa Individual de Responsabilidade Limitada (de Natureza Simples)",
          "value": "empresa-individual-de-responsabilidade-limitada-de-natureza-simples"
        },
        {
          "label": "Órgão de Direção Nacional de Partido Político",
          "value": "orgao-de-direcao-nacional-de-partido-politico"
        },
        {
          "label": "Demais Condomínios",
          "value": "demais-condominios"
        },
        {
          "label": "Empresa Pública",
          "value": "empresa-publica"
        },
        {
          "label": "Sociedade Unipessoal de Advogados",
          "value": "sociedade-unipessoal-de-advogados"
        },
        {
          "label": "Administração Direta",
          "value": "administração_direta"
        },
        {
          "label": "Sociedade Empresária em Nome Coletivo",
          "value": "sociedade-empresaria-em-nome-coletivo"
        },
        {
          "label": "Sociedade De Capital E Indústria",
          "value": "sociedade-de-capital-e-industria"
        },
        {
          "label": "Sociedade Empresária Limitada",
          "value": "sociedade-empresaria-limitada"
        },
        {
          "label": "Autarquia Federal",
          "value": "autarquia_federal"
        },
        {
          "label": "Fundação Pública de Direito Público Estadual ou do Distrito Federal",
          "value": "fundacao-publica-de-direito-publico-estadual-ou-do-distrito-federal"
        },
        {
          "label": "Sociedade Civil Com Fins Lucrativos",
          "value": "sociedade-civil-com-fins-lucrativos"
        },
        {
          "label": "Candidato a Cargo Político Eletivo",
          "value": "candidato-cargo-político-eletivo"
        },
        {
          "label": "Órgão Público Autônomo Federal",
          "value": "orgao-publico-autonomo-federal"
        },
        {
          "label": "Sociedade Simples Limitada",
          "value": "sociedade-simples-limitada"
        },
        {
          "label": "Outras Instituições Extraterritoriais",
          "value": "outras-instituicoes-extraterritoriais"
        },
        {
          "label": "Órgão Público do Poder Legislativo Estadual ou do Distrito Federal",
          "value": "orgao-publico-do-poder-legislativo-estadual-ou-do-distrito-federal"
        },
        {
          "label": "Município",
          "value": "municipio"
        },
        {
          "label": "Sociedade Anônima Aberta",
          "value": "sociedade-anonima-aberta"
        },
        {
          "label": "Associação Privada",
          "value": "associacao_privada"
        },
        {
          "label": "Sociedade Anônima Fechada",
          "value": "sociedade-anonima-fechada"
        },
        {
          "label": "Serviço Social Autônomo",
          "value": "servico-social-autonomo"
        },
        {
          "label": "Cooperativas de Consumo",
          "value": "cooperativas-consumo"
        },
        {
          "label": "Segurado Especial",
          "value": "segurado-especial"
        },
        {
          "label": "Órgão Público Autônomo Estadual ou do Distrito Federal",
          "value": "Órgão publico-autonomo-estadual-ou-do-distrito-federal"
        },
        {
          "label": "Órgão Público do Poder Judiciário Federal",
          "value": "orgao-publico-do-poder-judiciario-federal"
        },
        {
          "label": "Órgão Público do Poder Executivo Municipal",
          "value": "orgao-publico-do-poder-executivo-municipal"
        },
        {
          "label": "Órgão Público do Poder Legislativo Municipal",
          "value": "orgao-publico-do-poder-legislativo-municipal"
        },
        {
          "label": "Fundação Pública de Direito Privado Federal",
          "value": "fundacao-publica-de-direito-privado-federal"
        },
        {
          "label": "Empresa Binacional",
          "value": "empresa-binacional"
        },
        {
          "label": "Fundo Público da Administração Indireta Federal",
          "value": "fundo-publico-da-administracao-indireta-federal"
        },
        {
          "label": "Fundo Público da Administração Indireta Estadual ou do Distrito Federal",
          "value": "fundo-publico-da-administracao-indireta-estadual-ou-do-distrito-federal"
        },
        {
          "label": "Fundação Pública de Direito Público Federal",
          "value": "fundacao-publica-de-direito-publico-federal"
        },
        {
          "label": "Sociedade Empresária",
          "value": "sociedade-empresaria"
        },
        {
          "label": "Órgão de Direção Local de Partido Político",
          "value": "orgao-de-direcao-local-de-partido-politico"
        },
        {
          "label": "Produtor Rural (Pessoa Física)",
          "value": "produtor-rural-pessoa-fisica"
        },
        {
          "label": "Consórcio de Empregadores",
          "value": "consorcio-empregadores"
        },
        {
          "label": "Serviço Notarial e Registral (Cartório)",
          "value": "servico-notarial-e-registral-cartorio"
        },
        {
          "label": "Empresa Individual Imobiliária",
          "value": "empresa-individual-imobiliaria"
        },
        {
          "label": "Clube/Fundo de Investimento",
          "value": "clube-fundo-investimento"
        },
        {
          "label": "Consórcio de Sociedades",
          "value": "consorcio-sociedades"
        },
        {
          "label": "Representação Diplomática Estrangeira",
          "value": "representacao-diplomatica-estrangeira"
        },
        {
          "label": "Consórcio Público de Direito Privado",
          "value": "consorcio-publico-direito-privado"
        },
        {
          "label": "Comitê Financeiro de Partido Político",
          "value": "comite-financeiro-partido-politico"
        },
        {
          "label": "Sociedade Simples Pura",
          "value": "sociedade-simples-pura"
        },
        {
          "label": "Organização Internacional",
          "value": "organizacao-internacional"
        },
        {
          "label": "Condomínio Edilício",
          "value": "condomínio-edilicio"
        },
        {
          "label": "Comissão Polinacional",
          "value": "comissão_polinacional"
        },
        {
          "label": "Fundo Público da Administração Indireta Municipal",
          "value": "fundo-publico-da-administracao-indireta-municipal"
        },
        {
          "label": "Comissão de Conciliação Prévia",
          "value": "comissao-conciliação-previa"
        },
        {
          "label": "Consórcio Público de Direito Público (Associação Pública)",
          "value": "consorcio-publico-de-direito-publico-associacao-publica"
        },
        {
          "label": "Órgão Público do Poder Legislativo Federal",
          "value": "orgao-publico-do-poder-legislativo-federal"
        },
        {
          "label": "Empresa Individual de Responsabilidade Limitada (de Natureza Empresária)",
          "value": "empresa-individual-de-responsabilidade-limitada-natureza-empresaria"
        },
        {
          "label": "Fundo Privado",
          "value": "fundo-privado"
        },
        {
          "label": "Autarquia Estadual ou do Distrito Federal",
          "value": "autarquia_estadual_ou_do_distrito_federal"
        },
        {
          "label": "Organização Social (OS)",
          "value": "organizacao-social-os"
        },
        {
          "label": "Órgão de Direção Regional de Partido Político",
          "value": "orgao-de-direcao-regional-de-partido-politico"
        },
        {
          "label": "Comunidade Indígena",
          "value": "comunidade-indigena"
        },
        {
          "label": "União",
          "value": "uniao"
        },
        {
          "label": "Sociedade Simples em Nome Coletivo",
          "value": "sociedade-simples-em-nome-coletivo"
        },
        {
          "label": "Sociedade Simples em Comandita Simples",
          "value": "sociedade-simples-em-comandita-simples"
        },
        {
          "label": "Contribuinte individual",
          "value": "contribuinte-individual"
        },
        {
          "label": "Cooperativa",
          "value": "cooperativa"
        },
        {
          "label": "Fundo Público da Administração Direta Municipal",
          "value": "fundo-publico-da-administracao-direta-municipal"
        },
        {
          "label": "Fundo Público da Administração Direta Federal",
          "value": "fundo-publico-da-administracao-direta-federal"
        },
        {
          "label": "Sociedade em Conta de Participação",
          "value": "sociedade-em-conta-de-participacao"
        },
        {
          "label": "Órgão Público do Poder Judiciário Estadual",
          "value": "orgao-publico-do-poder-judiciario-estadual"
        },
        {
          "label": "Organização Religiosa",
          "value": "organizacao-religiosa"
        },
        {
          "label": "Leiloeiro",
          "value": "leiloeiro"
        },
        {
          "label": "Empresa Domiciliada no Exterior",
          "value": "empresa-domiciliada-exterior"
        },
        {
          "label": "Fundação Pública de Direito Privado Estadual ou do Distrito Federal",
          "value": "fundacao-publica-de-direito-privado-estadual-ou-do-distrito-federal"
        },
        {
          "label": "Autarquia",
          "value": "autarquia"
        },
        {
          "label": "Consórcio Simples",
          "value": "consorcio-simples"
        },
        {
          "label": "Sociedade De Economia Mista",
          "value": "sociedade-de-economia-mista"
        },
        {
          "label": "Fundação Pública de Direito Público Municipal",
          "value": "fundacao-publica-de-direito-publico-municipal"
        },
        {
          "label": "Autarquia Municipal",
          "value": "autarquia-municipal"
        },
        {
          "label": "Fundação Pública de Direito Privado Municipal",
          "value": "fundacao-publica-de-direito-privado-municipal"
        },
        {
          "label": "Sociedade Empresária em Comandita Simples",
          "value": "sociedade-empresaria-em-comandita-simples"
        }
      ],
      "visibleWhen": {
        "field": "pessoa_fisica_juridica",
        "in": [
          "pessoa-juridica"
        ]
      }
    }
  ]
};
