# Cartão de Emergência

Landing page e aplicação web para criação, organização e compartilhamento controlado de um cartão de emergência digital com informações de saúde, contatos importantes e dados essenciais para situações de urgência.

O projeto nasceu com a identidade `MedAlert` em alguns arquivos internos, mas a experiência visual atual usa o posicionamento "Cartão de Emergência", com uma interface clara, acolhedora e voltada a conforto, segurança e controle do usuário.

## Objetivo

O Cartão de Emergência ajuda uma pessoa a manter informações importantes de saúde em um único lugar, com acesso simples em momentos nos quais clareza e rapidez podem fazer diferença.

A proposta do produto é permitir que o usuário:

- Crie uma conta.
- Cadastre dados pessoais básicos.
- Registre informações médicas relevantes.
- Adicione contatos de emergência.
- Visualize um cartão organizado com esses dados.
- Controle se o cartão pode ser acessado publicamente.
- Controle se as informações médicas aparecem no cartão público.

> Importante: este projeto é um protótipo/aplicação web de apoio informacional. Ele não substitui atendimento médico, diagnóstico, prontuário oficial ou orientação profissional em emergências.

## Experiência do usuário

A interface foi redesenhada para abandonar o visual escuro com vermelho forte e adotar um padrão mais leve e confiável:

- Fundo claro e quente.
- Verde-água como cor principal.
- Coral apenas como detalhe pontual.
- Cards brancos com bordas suaves.
- Sombras leves esverdeadas.
- Tipografia forte nos títulos e confortável no corpo.
- Layout responsivo para desktop e mobile.
- Navegação inferior nas principais telas mobile.
- Foco visível em campos, links e botões.

## Stack

O projeto usa uma stack simples e direta:

- HTML estático.
- CSS puro.
- Tailwind via CDN.
- Lucide Icons via CDN.
- JavaScript vanilla no frontend.
- API serverless em Node.js.
- PostgreSQL via pacote `pg`.
- Estrutura compatível com deploy em ambientes como Vercel.

Dependência declarada:

```json
{
  "pg": "^8.16.3"
}
```

## Principais telas

### Landing page

Arquivo: `index.html`

Página pública inicial do projeto. Apresenta:

- Header fixo translúcido.
- Hero com proposta de valor.
- Mockup visual do cartão de emergência.
- Benefícios principais.
- Seção "Como funciona".
- Bento grid de recursos.
- Seção de privacidade e controle.
- CTA final para cadastro.
- Footer com links para login, cadastro e privacidade.

Estilos principais:

- `css/index.css`
- `js/index.js`

### Login

Arquivo: `pages/login.html`

Permite autenticação do usuário com e-mail e senha.

Script:

- `js/login.js`

Principais IDs usados pelo script:

- `loginForm`
- `email`
- `password`
- `togglePassword`
- `eyeIcon`
- `rememberMe`
- `loginMessage`

### Cadastro

Arquivo: `pages/register.html`

Permite criar uma conta informando:

- Nome completo.
- E-mail.
- CPF.
- Telefone.
- Senha.
- Confirmação de senha.
- Aceite de termos.

Script:

- `js/register.js`

Principais IDs usados pelo script:

- `registerForm`
- `name`
- `email`
- `cpf`
- `phone`
- `password`
- `confirmPassword`
- `togglePassword`
- `toggleConfirmPassword`
- `terms`
- `registerMessage`

### Dashboard

Arquivo: `pages/dashboard.html`

Área inicial autenticada. Mostra:

- Saudação ao usuário.
- Status do cartão.
- Resumo das informações de emergência.
- Acesso rápido para cartão, dados médicos, contatos e perfil.

Script:

- `js/dashboard.js`

### Meu cartão

Arquivo: `pages/card.html`

Mostra uma prévia organizada do cartão de emergência do usuário.

Inclui:

- Nome e avatar com iniciais.
- Data de nascimento.
- Data de validação do cartão.
- Tipo sanguíneo.
- Alergias.
- Medicamentos.
- Condições médicas.
- Condições neurológicas.
- Contato de emergência principal.
- Link para o cartão público quando habilitado.

Script:

- `js/card.js`

### Informações de saúde

Arquivo: `pages/information.html`

Formulário para cadastrar ou editar informações médicas.

Campos principais:

- Tipo sanguíneo.
- Data de nascimento.
- Data de validação do cartão.
- Condições neurológicas e neurodivergências.
- Outra condição.
- Alergias.
- Medicamentos.
- Outras condições médicas.

Script:

- `js/information.js`

### Contatos de emergência

Arquivo: `pages/contacts.html`

Permite adicionar, listar, editar e excluir contatos de emergência.

Campos:

- Nome completo.
- Telefone.
- Grau de parentesco.
- E-mail opcional.

Script:

- `js/contacts.js`

### Perfil

Arquivo: `pages/profile.html`

Permite visualizar e atualizar dados pessoais.

Campos:

- Nome completo.
- E-mail.
- CPF.
- Telefone.

Script:

- `js/profile.js`

### Configurações

Arquivo: `pages/config.html`

Permite gerenciar preferências da conta:

- E-mail.
- Nova senha.
- Exibir informações médicas.
- Habilitar cartão público.
- Receber notificações.
- Copiar link público quando disponível.
- Sair da conta.

Script:

- `js/config.js`

### Cartão público

Arquivo: `pages/public-card.html`

Página pública acessada por token. Mostra o cartão de emergência quando:

- O token existe.
- O usuário habilitou cartão público.
- As permissões permitem exibir os dados.

Script:

- `js/public-card.js`

Endpoint usado:

- `GET /api/public/token?token=<token>`

## Estilos

### `css/index.css`

Estilos específicos da landing page.

Inclui:

- Tokens visuais da landing.
- Header fixo.
- Hero.
- Mockup do celular.
- Cards flutuantes.
- Seções institucionais.
- Bento grid.
- CTA final.
- Responsividade.
- Animações discretas.
- Estados de foco.

### `css/app.css`

Estilos compartilhados das páginas internas.

Ele aplica o novo padrão visual claro sem reescrever toda a marcação antiga.

Inclui:

- Tokens de cor compartilhados.
- Sobrescrita do tema antigo `medalert`.
- Sidebar clara.
- Navegação mobile clara.
- Cards, formulários, inputs e botões no novo padrão.
- Acessibilidade de foco.
- Ajustes responsivos.
- Correção visual de estados de erro e aviso.

## Estrutura de arquivos

```text
.
├── index.html
├── package.json
├── css
│   ├── app.css
│   └── index.css
├── js
│   ├── card.js
│   ├── config.js
│   ├── contacts.js
│   ├── dashboard.js
│   ├── index.js
│   ├── information.js
│   ├── login.js
│   ├── profile.js
│   ├── public-card.js
│   └── register.js
├── pages
│   ├── card.html
│   ├── config.html
│   ├── contacts.html
│   ├── dashboard.html
│   ├── information.html
│   ├── login.html
│   ├── profile.html
│   ├── public-card.html
│   └── register.html
└── api
    ├── auth.js
    ├── auth
    │   ├── config.js
    │   ├── contacts.js
    │   ├── database.js
    │   ├── login.js
    │   ├── medical.js
    │   ├── register.js
    │   ├── user-query.js
    │   └── utils.js
    └── public
        └── token.js
```

## Fluxo de autenticação

O projeto usa uma combinação de API e `localStorage`.

Após login ou cadastro, o frontend salva informações locais em chaves como:

- `medalert_logged`
- `medalert_current_user`
- `medalert_user`

Essas chaves são usadas pelas telas internas para:

- Verificar se o usuário está autenticado.
- Preencher sidebar e avatar.
- Exibir dados em fallback quando a API não está disponível.
- Redirecionar para `login.html` quando não há sessão local.

## API

O ponto principal da API é:

```text
/api/auth
```

A API usa o parâmetro `action` para rotear operações:

```text
/api/auth?action=register
/api/auth?action=login
/api/auth?action=medical
/api/auth?action=contacts
/api/auth?action=config
```

Também existe uma rota pública:

```text
/api/public/token?token=<token>
```

### Teste de conexão

```http
GET /api/auth
```

Sem `action`, tenta consultar o PostgreSQL e retorna o horário do banco.

### Cadastro

```http
POST /api/auth?action=register
```

Body esperado:

```json
{
  "name": "Nome completo",
  "email": "usuario@email.com",
  "cpf": "000.000.000-00",
  "phone": "(00) 00000-0000",
  "password": "senha-com-6-ou-mais-caracteres"
}
```

Comportamento:

- Valida campos obrigatórios.
- Valida tamanho mínimo da senha.
- Normaliza e-mail.
- Impede duplicidade por e-mail ou CPF.
- Cria usuário.
- Gera `public_token`.
- Cria registro inicial em `medical_info`.
- Retorna o usuário formatado.

### Login

```http
POST /api/auth?action=login
```

Body esperado:

```json
{
  "email": "usuario@email.com",
  "password": "senha"
}
```

Comportamento:

- Busca usuário por e-mail.
- Verifica senha com hash `scrypt`.
- Retorna dados do usuário e configurações.

### Informações médicas

Carregar:

```http
GET /api/auth?action=medical&userId=1
```

Salvar:

```http
PUT /api/auth?action=medical
```

Body esperado:

```json
{
  "userId": 1,
  "birthDate": "1990-05-10",
  "bloodType": "O+",
  "allergies": "Dipirona",
  "medications": "Losartana",
  "conditions": "Hipertensão",
  "neurologicalConditions": "Nenhuma",
  "cardValidationDate": "2026-10-09"
}
```

Comportamento:

- Atualiza data de nascimento em `users`.
- Insere ou atualiza dados em `medical_info`.
- Retorna usuário atualizado.

### Contatos

Listar:

```http
GET /api/auth?action=contacts&userId=1
```

Criar:

```http
POST /api/auth?action=contacts
```

Body esperado:

```json
{
  "userId": 1,
  "name": "Ana Almeida",
  "phone": "(11) 98888-0000",
  "relationship": "Esposa",
  "email": "ana@email.com"
}
```

Atualizar:

```http
PUT /api/auth?action=contacts
```

Body esperado:

```json
{
  "userId": 1,
  "contactId": 10,
  "name": "Ana Almeida",
  "phone": "(11) 98888-0000",
  "relationship": "Esposa",
  "email": "ana@email.com"
}
```

Excluir:

```http
DELETE /api/auth?action=contacts&userId=1&contactId=10
```

### Configurações

```http
PUT /api/auth?action=config
```

Body esperado:

```json
{
  "userId": 1,
  "email": "novo@email.com",
  "password": "nova-senha-opcional",
  "settings": {
    "showMedicalInfo": true,
    "publicCard": false,
    "notifications": false
  }
}
```

Comportamento:

- Atualiza e-mail.
- Atualiza senha quando enviada.
- Atualiza preferências de privacidade.
- Retorna usuário atualizado.

### Cartão público por token

```http
GET /api/public/token?token=<token>
```

Comportamento:

- Busca usuário pelo `public_token`.
- Verifica se o cartão está habilitado como público.
- Retorna nome, datas, contato principal e, se permitido, dados médicos.

## Banco de dados

O projeto espera um PostgreSQL configurado pela variável de ambiente:

```env
DATABASE_URL=postgres://usuario:senha@host:porta/banco
```

A conexão é feita em:

```text
api/auth/database.js
```

O código remove alguns parâmetros de SSL da URL e usa:

```js
ssl: {
  rejectUnauthorized: false
}
```

### Tabelas esperadas

Pelo uso da API, o projeto espera pelo menos estas tabelas:

#### `users`

Campos usados:

- `id`
- `name`
- `email`
- `cpf`
- `phone`
- `password_hash`
- `birth_date`
- `public_token`
- `show_medical_info`
- `public_card`
- `notifications`

#### `medical_info`

Campos usados:

- `user_id`
- `blood_type`
- `allergies`
- `medications`
- `conditions`
- `neurological_conditions`
- `card_validation_date`

#### `emergency_contacts`

Campos usados:

- `id`
- `user_id`
- `name`
- `phone`
- `relationship`
- `email`

## Segurança

O projeto já possui alguns cuidados importantes:

- Senhas são armazenadas como hash `scrypt`, não texto puro.
- O token público é gerado com `crypto.randomBytes(32)`.
- O acesso público ao cartão depende da preferência `public_card`.
- As informações médicas podem ser ocultadas do cartão público por `show_medical_info`.
- Dados exibidos dinamicamente em contatos são escapados no frontend para reduzir risco de HTML injetado.

Pontos que devem ser reforçados em uma versão de produção:

- Trocar autenticação baseada apenas em `localStorage` por sessão segura ou JWT com expiração.
- Proteger rotas serverless com autenticação real.
- Validar permissões no backend por usuário autenticado, não apenas `userId`.
- Usar HTTPS em produção.
- Revisar LGPD, consentimento e política de privacidade.
- Evitar retornar mensagens técnicas de erro para usuários finais.
- Adicionar rate limiting para login e cadastro.
- Adicionar recuperação de senha real.

## Como rodar localmente

### 1. Instalar dependências

```bash
npm install
```

### 2. Rodar apenas o frontend estático

Como o frontend é estático, qualquer servidor de arquivos serve.

Exemplo com Node.js:

```bash
node -e "const http=require('http'),fs=require('fs'),path=require('path');const base=process.cwd();const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8'};http.createServer((req,res)=>{const url=new URL(req.url,'http://localhost');const file=path.join(base,decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));if(!file.startsWith(base)){res.writeHead(403);return res.end('Forbidden')}fs.readFile(file,(err,data)=>{if(err){res.writeHead(404);return res.end('Not found')}res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});res.end(data)})}).listen(4173,()=>console.log('http://localhost:4173'))"
```

Depois acesse:

```text
http://localhost:4173
```

### 3. Rodar com API

Para usar a API serverless localmente, é necessário um ambiente que execute as funções em `api/`, como Vercel CLI ou configuração equivalente.

Também é necessário definir:

```env
DATABASE_URL=...
```

Sem a API, algumas telas ainda podem abrir usando dados locais do navegador, mas login, cadastro, persistência real, cartão público e consultas ao banco dependem do backend.

## Deploy

O projeto é compatível com uma estrutura típica de deploy na Vercel:

- Páginas estáticas na raiz e em `pages/`.
- Funções serverless em `api/`.
- Variável `DATABASE_URL` configurada no ambiente.

Checklist de deploy:

- Configurar `DATABASE_URL`.
- Garantir que as tabelas do banco existam.
- Publicar arquivos estáticos.
- Verificar `GET /api/auth`.
- Testar cadastro e login.
- Testar edição de informações médicas.
- Testar contatos.
- Testar cartão público.

## Fluxo recomendado de uso

1. A pessoa acessa a landing page.
2. Clica em "Criar conta".
3. Informa dados básicos.
4. Entra no dashboard.
5. Preenche informações de saúde.
6. Adiciona contatos de emergência.
7. Visualiza o cartão.
8. Opcionalmente habilita cartão público nas configurações.
9. Compartilha o link público quando fizer sentido.

## Decisões de design

O visual atual foi guiado por três intenções:

### Conforto

Uso de fundo claro, tons suaves e espaços amplos para reduzir a sensação de urgência agressiva.

### Segurança

Uso de verde-água como cor principal, bordas leves, estados claros e comunicação direta.

### Controle

Ênfase em privacidade, preferências e capacidade do usuário decidir o que aparece no cartão.

## Acessibilidade

O projeto usa:

- HTML semântico nas principais páginas.
- Links e botões com áreas de toque adequadas.
- Foco visível em elementos interativos.
- Cores com melhor contraste em relação ao tema anterior.
- Ícones com texto próximo para evitar depender apenas de símbolos.
- Layout responsivo para telas pequenas.
- Respeito a `prefers-reduced-motion` nos estilos principais.

## Limitações conhecidas

- A autenticação ainda depende de `localStorage` no frontend.
- Não há recuperação real de senha.
- Não há painel administrativo.
- Não há testes automatizados.
- O schema SQL não está versionado no repositório.
- O botão de login com Google é apenas visual, sem integração OAuth.
- Notificações aparecem como preferência, mas não há serviço de notificação implementado.

## Possíveis próximos passos

- Adicionar migrations SQL.
- Criar scripts de desenvolvimento no `package.json`.
- Adicionar testes de frontend e API.
- Implementar autenticação com sessão segura.
- Implementar recuperação de senha.
- Adicionar QR Code real para o cartão público.
- Melhorar o fluxo de consentimento e privacidade.
- Criar página pública de política de privacidade.
- Adicionar exportação/impressão do cartão.
- Criar modo offline ou PWA.

## Créditos internos

Este README documenta a versão atual do projeto no repositório local, incluindo a reformulação visual clara aplicada à landing page e às páginas internas.
