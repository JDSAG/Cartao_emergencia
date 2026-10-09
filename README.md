# Cartão de Emergência

Aplicação web para criar um **cartão de emergência digital** com dados de saúde, contatos importantes e preferências de privacidade.

A ideia é reunir informações essenciais em um formato simples, claro e acessível para situações em que rapidez e organização fazem diferença.

> [!WARNING]
> Este projeto é um apoio informacional. Ele **não substitui** atendimento médico, prontuário oficial, diagnóstico ou orientação profissional.

---

## Sumário

- [Funcionalidades](#funcionalidades)
- [Stack](#stack)
- [Arquitetura](#arquitetura)
- [Páginas](#páginas)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Estilos](#estilos)
- [API](#api)
- [Banco de dados](#banco-de-dados)
- [Como rodar](#como-rodar)
- [Autenticação local](#autenticação-local)
- [Segurança e privacidade](#segurança-e-privacidade)
- [Limitações conhecidas](#limitações-conhecidas)

---

## Funcionalidades

- Criação de conta e login com e-mail e senha.
- Cadastro de dados pessoais básicos.
- Organização de informações de saúde: tipo sanguíneo, alergias, medicamentos e condições médicas.
- Gerenciamento de contatos de emergência.
- Cartão privado, visível apenas para o usuário autenticado.
- Cartão público acessível por token, que pode ser habilitado ou desabilitado.
- Controle sobre a exibição de informações médicas no cartão público.

## Stack

| Camada | Tecnologia |
| --- | --- |
| Marcação | HTML |
| Estilo | CSS + Tailwind via CDN |
| Ícones | Lucide Icons via CDN |
| Lógica no cliente | JavaScript vanilla |
| Backend | Node.js em funções serverless |
| Banco de dados | PostgreSQL (`pg`) |

Dependência principal:

```json
{
  "pg": "^8.16.3"
}
```

## Arquitetura

Visão geral de como as partes se comunicam:

```mermaid
flowchart LR
    U([Usuário]) --> F[Frontend<br/>HTML + CSS + JS]
    V([Visitante / Socorrista]) --> P[Cartão público<br/>public-card.html]

    F -->|/api/auth?action=...| A[Função serverless<br/>api/auth.js]
    P -->|/api/public/token| T[Função serverless<br/>api/public/]

    A --> DB[(PostgreSQL)]
    T --> DB

    F -.->|sessão básica| LS[(localStorage)]
```

## Fluxo do usuário

```mermaid
flowchart TD
    A[Landing page] --> B{Já tem conta?}
    B -- Não --> C[Cadastro]
    B -- Sim --> D[Login]
    C --> D
    D --> E[Dashboard]
    E --> F[Informações de saúde]
    E --> G[Contatos de emergência]
    E --> H[Perfil]
    E --> I[Meu cartão]
    E --> J[Configurações]
    J --> K{Cartão público<br/>habilitado?}
    K -- Sim --> L[Link com token<br/>compartilhável]
    K -- Não --> M[Somente cartão privado]
```

## Páginas

| Página | Arquivo | Finalidade |
| --- | --- | --- |
| Landing page | `index.html` | Apresentação do produto e chamadas para login/cadastro |
| Login | `pages/login.html` | Entrada do usuário |
| Cadastro | `pages/register.html` | Criação de conta |
| Dashboard | `pages/dashboard.html` | Visão geral após o login |
| Meu cartão | `pages/card.html` | Cartão de emergência privado |
| Informações de saúde | `pages/information.html` | Cadastro dos dados médicos |
| Contatos | `pages/contacts.html` | Gerenciamento de contatos de emergência |
| Perfil | `pages/profile.html` | Dados pessoais |
| Configurações | `pages/config.html` | Privacidade, cartão público e conta |
| Cartão público | `pages/public-card.html` | Visualização pública por token |

## Estrutura do projeto

```text
.
├── api
│   ├── auth.js
│   ├── auth/
│   └── public/
├── css
│   ├── app.css
│   └── index.css
├── js
├── pages
├── index.html
├── package.json
└── README.md
```

## Estilos

| Arquivo | Escopo |
| --- | --- |
| `css/index.css` | Landing page |
| `css/app.css` | Tema claro compartilhado das páginas internas |

O visual usa uma identidade clara e acolhedora: fundo quente, verde-água como cor principal, coral apenas em detalhes, cards brancos, bordas suaves e foco visível para acessibilidade.

## API

### Endpoint principal

```text
/api/auth
```

As operações são selecionadas pelo parâmetro `action`:

| Método | Rota | Descrição |
| --- | --- | --- |
| `POST` | `/api/auth?action=register` | Cria uma conta |
| `POST` | `/api/auth?action=login` | Autentica o usuário |
| `GET` | `/api/auth?action=medical&userId=1` | Busca informações médicas |
| `PUT` | `/api/auth?action=medical` | Atualiza informações médicas |
| `GET` | `/api/auth?action=contacts&userId=1` | Lista contatos de emergência |
| `POST` | `/api/auth?action=contacts` | Cria um contato |
| `PUT` | `/api/auth?action=contacts` | Atualiza um contato |
| `DELETE` | `/api/auth?action=contacts&userId=1&contactId=10` | Remove um contato |
| `PUT` | `/api/auth?action=config` | Atualiza configurações de privacidade |

### Cartão público

| Método | Rota | Descrição |
| --- | --- | --- |
| `GET` | `/api/public/token?token=<token>` | Retorna os dados do cartão público |

### Exemplo: acesso ao cartão público

```mermaid
sequenceDiagram
    actor S as Socorrista
    participant P as public-card.html
    participant API as /api/public/token
    participant DB as PostgreSQL

    S->>P: Acessa o link com token
    P->>API: GET ?token=...
    API->>DB: Busca usuário pelo public_token
    DB-->>API: Dados do usuário
    alt public_card = false
        API-->>P: Cartão indisponível
    else public_card = true
        alt show_medical_info = true
            API-->>P: Dados pessoais + médicos + contatos
        else show_medical_info = false
            API-->>P: Dados pessoais + contatos
        end
    end
    P-->>S: Exibe o cartão
```

## Banco de dados

Configure a conexão por variável de ambiente:

```env
DATABASE_URL=postgres://usuario:senha@host:porta/banco
```

### Diagrama entidade-relacionamento

```mermaid
erDiagram
    users ||--o| medical_info : possui
    users ||--o{ emergency_contacts : cadastra

    users {
        int id PK
        string name
        string email
        string cpf
        string phone
        string password_hash
        date birth_date
        string public_token
        boolean show_medical_info
        boolean public_card
        boolean notifications
    }

    medical_info {
        int user_id FK
        string blood_type
        text allergies
        text medications
        text conditions
        text neurological_conditions
        date card_validation_date
    }

    emergency_contacts {
        int id PK
        int user_id FK
        string name
        string phone
        string relationship
        string email
    }
```

### Tabelas esperadas

| Tabela | Campos principais |
| --- | --- |
| `users` | `id`, `name`, `email`, `cpf`, `phone`, `password_hash`, `birth_date`, `public_token`, `show_medical_info`, `public_card`, `notifications` |
| `medical_info` | `user_id`, `blood_type`, `allergies`, `medications`, `conditions`, `neurological_conditions`, `card_validation_date` |
| `emergency_contacts` | `id`, `user_id`, `name`, `phone`, `relationship`, `email` |

## Como rodar

**1. Instale as dependências**

```bash
npm install
```

**2. Frontend apenas**

Use qualquer servidor estático na raiz do projeto:

```bash
npx serve .
```

Depois acesse a URL exibida no terminal.

**3. Frontend + API**

Rode o projeto em um ambiente compatível com funções serverless (como a Vercel) e configure a variável `DATABASE_URL`.

## Autenticação local

O frontend usa `localStorage` para manter dados básicos de sessão e fallback visual.

| Chave | Uso |
| --- | --- |
| `medalert_logged` | Indica se há usuário logado |
| `medalert_current_user` | Usuário atual |
| `medalert_user` | Dados do usuário para exibição |

## Segurança e privacidade

### O que já está implementado

| Recurso | Detalhes |
| --- | --- |
| Hash de senha | Algoritmo `scrypt` |
| Token público | Gerado com `crypto.randomBytes(32)` |
| Cartão público opcional | Pode ser habilitado ou desabilitado pelo usuário |
| Dados médicos opcionais | Podem ser exibidos ou ocultados no cartão público |

### Pontos de atenção antes de produção

| Ponto | Situação |
| --- | --- |
| Autenticação baseada em `localStorage` | Deve ser substituída por sessão segura ou JWT |
| Permissões no backend | Validar por usuário autenticado |
| Recuperação de senha | Não implementada |
| Rate limiting em login e cadastro | Não implementado |
| Schema SQL versionado / migrations | Ausente |
| LGPD e política de privacidade | Requer revisão |

## Limitações conhecidas

- Não há recuperação real de senha.
- Não há testes automatizados.
- O schema SQL não está versionado no repositório.
- O login com Google é apenas visual.
- Notificações aparecem como preferência, mas não há serviço de notificação implementado.
