import { FormFieldDefinition } from "./types";

/** Campos do CRC (ProductField), sem steps, localização, tipo_produto nem apostila genérica. */
export const CRC_FORM_FIELDS: Record<string, FormFieldDefinition[]> = {
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
};
