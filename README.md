# Cartão de Emergência

Aplicação web para criar um cartão de emergência digital com dados de saúde, contatos importantes e preferências de privacidade.

A ideia é reunir informações essenciais em um formato simples, claro e acessível para situações em que rapidez e organização fazem diferença.

> Este projeto é um apoio informacional. Ele não substitui atendimento médico, prontuário oficial, diagnóstico ou orientação profissional.

## O que o projeto faz

- Permite criar conta e entrar com e-mail e senha.
- Salva dados pessoais básicos do usuário.
- Organiza informações de saúde, como tipo sanguíneo, alergias, medicamentos e condições médicas.
- Permite cadastrar contatos de emergência.
- Mostra um cartão privado para o usuário autenticado.
- Permite habilitar ou desabilitar um cartão público por token.
- Permite controlar se informações médicas aparecem no cartão público.

## Stack

- HTML
- CSS
- JavaScript vanilla
- Tailwind via CDN
- Lucide Icons via CDN
- Node.js em funções serverless
- PostgreSQL com `pg`

Dependência principal:

```json
{
  "pg": "^8.16.3"
}
```

## Principais páginas

| Página | Arquivo | Finalidade |
| --- | --- | --- |
| Landing page | `index.html` | Apresentação do produto e chamadas para login/cadastro |
| Login | `pages/login.html` | Entrada do usuário |
| Cadastro | `pages/register.html` | Criação de conta |
| Dashboard | `pages/dashboard.html` | Visão geral após login |
| Meu cartão | `pages/card.html` | Cartão de emergência privado |
| Informações de saúde | `pages/information.html` | Cadastro dos dados médicos |
| Contatos | `pages/contacts.html` | Gerenciamento de contatos de emergência |
| Perfil | `pages/profile.html` | Dados pessoais |
| Configurações | `pages/config.html` | Privacidade, cartão público e conta |
| Cartão público | `pages/public-card.html` | Visualização pública por token |

## Estrutura

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

- `css/index.css`: estilos da landing page.
- `css/app.css`: tema claro compartilhado das páginas internas.

O visual atual usa uma identidade clara e acolhedora, com fundo quente, verde-água como cor principal, coral apenas em detalhes, cards brancos, bordas suaves e foco visível para acessibilidade.

## API

Endpoint principal:

```text
/api/auth
```

Operações por `action`:

```text
POST /api/auth?action=register
POST /api/auth?action=login
GET  /api/auth?action=medical&userId=1
PUT  /api/auth?action=medical
GET  /api/auth?action=contacts&userId=1
POST /api/auth?action=contacts
PUT  /api/auth?action=contacts
DELETE /api/auth?action=contacts&userId=1&contactId=10
PUT  /api/auth?action=config
```

Cartão público:

```text
GET /api/public/token?token=<token>
```

## Banco de dados

O projeto espera um PostgreSQL configurado por variável de ambiente:

```env
DATABASE_URL=postgres://usuario:senha@host:porta/banco
```

Tabelas esperadas pelo código:

- `users`
- `medical_info`
- `emergency_contacts`

Campos importantes:

- `users`: `id`, `name`, `email`, `cpf`, `phone`, `password_hash`, `birth_date`, `public_token`, `show_medical_info`, `public_card`, `notifications`.
- `medical_info`: `user_id`, `blood_type`, `allergies`, `medications`, `conditions`, `neurological_conditions`, `card_validation_date`.
- `emergency_contacts`: `id`, `user_id`, `name`, `phone`, `relationship`, `email`.

## Como rodar

Instale as dependências:

```bash
npm install
```

Para abrir apenas o frontend, use qualquer servidor estático na raiz do projeto.

Exemplo:

```bash
npx serve .
```

Depois acesse a URL exibida no terminal.

Para usar a API, rode o projeto em um ambiente compatível com funções serverless, como Vercel, e configure `DATABASE_URL`.

## Autenticação local

O frontend usa `localStorage` para manter dados básicos de sessão e fallback visual.

Chaves principais:

- `medalert_logged`
- `medalert_current_user`
- `medalert_user`

## Segurança e privacidade

O projeto já inclui:

- Hash de senha com `scrypt`.
- Token público gerado com `crypto.randomBytes(32)`.
- Preferência para habilitar/desabilitar cartão público.
- Preferência para exibir/ocultar informações médicas no cartão público.

Pontos importantes antes de produção:

- Substituir a autenticação baseada em `localStorage` por sessão segura ou JWT.
- Validar permissões no backend por usuário autenticado.
- Adicionar recuperação de senha.
- Adicionar rate limiting em login e cadastro.
- Versionar o schema SQL ou criar migrations.
- Revisar requisitos de LGPD e política de privacidade.

## Limitações conhecidas

- Não há recuperação real de senha.
- Não há testes automatizados.
- O schema SQL não está versionado no repositório.
- O login com Google é apenas visual.
- Notificações aparecem como preferência, mas não há serviço de notificação implementado.

## Próximos passos sugeridos

- Criar migrations do banco.
- Adicionar scripts de desenvolvimento no `package.json`.
- Implementar autenticação segura.
- Gerar QR Code real para o cartão público.
- Criar página de política de privacidade.
- Adicionar exportação ou impressão do cartão.
