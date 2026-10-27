# SGLV

Fundação do Sistema de Gestão de Locação de Veículos: SPA Angular e API ASP.NET Core em camadas, com SQL Server.

## Decisões técnicas

- .NET 10 LTS e Angular 20 LTS, ambos com componentes standalone.
- API organizada em `Domain`, `Application`, `Infrastructure` e `Api`.
- SQL Server com EF Core e migrations; o banco aplica migrations pendentes ao iniciar a API.
- ASP.NET Core Identity aplica hashing seguro de senha e controla os perfis `Cliente`, `Atendente`, `Operador` e `Administrador`.
- JWT em cookie `HttpOnly`, `SameSite=Strict`, enviado pela SPA através do proxy local; o token não fica acessível ao JavaScript.
- A SPA tem áreas Portal e Admin, guards por perfil e um interceptor de sessão/erros. A tela de cadastro cria usuários `Cliente`.
- Datas persistidas como `DateTimeOffset` são normalizadas para UTC; a apresentação Angular usa `America/Sao_Paulo`. `TimeProvider` é injetado no serviço de autenticação.
- Propriedades `decimal` no EF Core usam precisão `decimal(18,2)`.
- ESLint/Angular ESLint, Prettier, analisadores .NET e `.editorconfig` fazem parte da base. A interface inicial usa CSS responsivo, sem biblioteca visual.

## Subir o ambiente local

Pré-requisitos: Docker com Compose, Git e acesso à internet para baixar as imagens/dependências.

1. Na raiz do repositório, copie o exemplo de ambiente:

   ```sh
   cp .env.example .env
   ```

   Os valores são exclusivos para desenvolvimento local. Nunca reutilize-os fora desta máquina; use User Secrets ou um gerenciador de segredos nos demais ambientes.

2. Construa e inicie SQL Server, API e SPA:

   ```sh
   docker compose up --build
   ```

   O primeiro build baixa as imagens e instala as dependências. A API aguarda o banco ficar saudável, aplica a migration inicial e cria os perfis.

3. Abra <http://localhost:4200>, crie uma conta no Portal e a sessão será iniciada. A SPA chama `GET /api/portal`, um endpoint protegido por perfil. A API também está em <http://localhost:5080>; verifique banco e API em <http://localhost:5080/health>. O documento OpenAPI fica em <http://localhost:5080/openapi/v1.json> no ambiente local.

Para encerrar, use `Ctrl+C` e `docker compose down`. Os dados do SQL Server permanecem no volume `sqlserver-data`; para removê-los, acrescente `-v`.

## Build, análise estática e testes

Com .NET 10, Node.js 24, npm e Chrome/Chromium instalados, execute na raiz:

```sh
make verify
```

O comando compila e testa a solução .NET (o teste de migration usa SQL Server via Testcontainers) e executa lint, build e testes Jasmine/Karma no Angular. Os testes de integração .NET requerem Docker em execução.

## Execução da API fora do Compose

Configure `ConnectionStrings:DefaultConnection` e `Jwt:SigningKey` em User Secrets, e mantenha SQL Server disponível. Por exemplo:

```sh
dotnet user-secrets set --project src/api/Api "Jwt:SigningKey" "<chave-local-com-no-minimo-32-caracteres>"
dotnet run --project src/api/Api
```

Não comite `.env`, chaves de assinatura, senhas ou outras credenciais. A configuração `.env.example` serve apenas ao Compose local.
