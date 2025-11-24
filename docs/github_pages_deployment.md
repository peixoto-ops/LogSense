# Documentação do Deploy no GitHub Pages para o Projeto LogSense

Este documento detalha a configuração do workflow de build e deploy automático para o GitHub Pages, garantindo que o processo seja robusto e adaptado às necessidades de uma Single Page Application (SPA) como o LogSense.

## 1. Arquivo de Workflow (`.github/workflows/deploy.yml`)

O deploy é gerenciado por um workflow do GitHub Actions. Substituímos a abordagem anterior que utilizava a action `peaceiris/actions-gh-pages@v3` por um método mais moderno e seguro, recomendado pelo GitHub.

O novo workflow utiliza um conjunto de actions oficiais:
- `actions/checkout@v4`: Para acessar o código do repositório.
- `actions/setup-node@v4`: Para configurar o ambiente Node.js.
- `actions/configure-pages@v5`: Para preparar o ambiente do GitHub Pages.
- `actions/upload-pages-artifact@v3`: Para fazer o upload dos arquivos do site (a pasta `dist`) como um artefato.
- `actions/deploy-pages@v4`: Para pegar o artefato e publicá-lo no ambiente do GitHub Pages.

### Vantagens da Nova Abordagem:
- **Segurança:** As permissões (`pages: write`, `id-token: write`) são específicas para o deploy, evitando o uso de um token com acesso de escrita geral ao repositório.
- **Integração:** O deploy é oficialmente reconhecido pelo GitHub, com status visível na aba "Environments" do repositório.
- **Simplicidade:** Não é necessário manter um branch `gh-pages` separado, o que mantém o repositório mais limpo.

## 2. Passos Adicionais no Build

Dentro do workflow, após o passo `npm run build`, foram adicionados dois comandos essenciais:

### a. `cp dist/index.html dist/404.html`

- **O quê:** Este comando copia o `index.html` principal da aplicação para um novo arquivo chamado `404.html`.
- **Por quê:** O LogSense é uma Single Page Application (SPA). A navegação entre páginas (rotas como `/clusters` ou `/details`) é gerenciada pelo JavaScript no navegador. Quando um usuário tenta acessar uma dessas rotas diretamente, o servidor do GitHub Pages não encontra um arquivo correspondente e retorna um erro 404. Ao fornecer um `404.html` customizado (que é uma cópia da nossa aplicação), nós instruímos o GitHub Pages a carregar a aplicação principal. Uma vez carregada, o roteador do React assume e exibe a página correta com base na URL.

### b. `touch dist/.nojekyll`

- **O quê:** Este comando cria um arquivo vazio chamado `.nojekyll` na raiz da pasta de build (`dist`).
- **Por quê:** Por padrão, o GitHub Pages tenta processar todos os sites com um gerador de sites estáticos chamado Jekyll. O Jekyll pode ignorar ou modificar arquivos importantes cujo nome começa com um underscore (`_`), como a pasta `_assets` que o Vite pode gerar. A presença deste arquivo desativa completamente o processamento Jekyll, garantindo que o site seja publicado exatamente como foi gerado pelo Vite, sem modificações inesperadas que possam quebrar a aplicação.

## 3. Configuração no Vite (`vite.config.ts`)

A configuração `base: '/LogSense/'` no arquivo `vite.config.ts` permanece inalterada e é fundamental. Ela informa ao Vite que a aplicação não será servida da raiz de um domínio, mas sim de um subdiretório (`/LogSense/`), garantindo que todos os caminhos para os assets (JavaScript, CSS, imagens) sejam gerados corretamente.
