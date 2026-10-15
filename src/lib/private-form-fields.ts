import { FormFieldDefinition } from "./types";

/**
 * Campos de formulário das certidões privadas (Registro Civil), vendidas só na área logada.
 * Importe SOMENTE em código de servidor (via private-catalog.ts): em componente "use client"
 * estes dados iriam para o JS público.
 */
export const PRIVATE_FORM_FIELDS: Record<string, FormFieldDefinition[]> = {
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
};
