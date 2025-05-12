# Desafio de Projeção de Eventos (Meetime)

Este projeto é uma solução para o desafio de desenvolvimento front-end proposto, utilizando Angular para criar uma interface de projeção de eventos baseada em ciclos e entidades.

## Demonstração da Usabilidade

<!--
  INSTRUÇÃO: Insira seu GIF aqui.
  Exemplo:
  ![Demonstração da Aplicação](link_para_seu_gif.gif)
-->

## Tecnologias Utilizadas

- **Angular v17** (Conforme especificado nos requisitos do desafio)
- **TypeScript**
- **HTML5 & SCSS**
- **Angular Material:** Para componentes de UI.
- **NgRx ComponentStore:** Para gerenciamento de estado local reativo nos componentes.
- **ApexCharts (via ng-apexcharts):** Para visualização de dados em gráficos.
- **date-fns:** Para manipulação de datas.
- **lodash-es:** Para utilitários gerais.
- **ESLint & Prettier:** Para linting e formatação de código.
- **Husky & lint-staged:** Para garantir a qualidade do código antes dos commits.
- **Karma & Jasmine:** Para testes unitários.
- **Cypress:** Configurado para testes end-to-end.

## Pré-requisitos

- Node.js (v18.x ou superior recomendado)
- Angular CLI (v17.x ou compatível)
- npm (v9.x ou superior) ou yarn

## Configuração e Execução

1.  **Clonar o repositório:**

    ```bash
    git clone <URL_DO_SEU_REPOSITORIO_AQUI>
    cd challenge
    ```

2.  **Instalar dependências:**

    ```bash
    npm install
    ```

3.  **Servidor de Desenvolvimento:**
    Para iniciar o servidor de desenvolvimento local:

    ```bash
    ng serve
    # ou
    npm start
    ```

    Abra seu navegador e navegue para `http://localhost:4200/`. A aplicação recarregará automaticamente ao modificar os arquivos de origem.

4.  **Build do Projeto:**
    Para compilar o projeto para produção:
    ```bash
    ng build
    # ou
    npm run build
    ```
    Os artefatos da compilação serão armazenados no diretório `dist/`.

## Testes

### Testes Unitários

Para executar os testes unitários com Karma:

```bash
ng test
# ou
npm test
```

### Testes End-to-End (E2E)

O Cypress está configurado no projeto, permitindo a execução de testes E2E através do comando:

```bash
npm run e2e
```

**Nota:** A implementação completa dos testes End-to-End com Cypress é planejada como uma melhoria futura para este projeto. No momento, a estrutura está presente, mas os cenários de teste específicos não foram desenvolvidos.

## Qualidade de Código

O projeto utiliza ESLint para análise estática de código e Prettier para formatação automática. Husky e lint-staged estão configurados para executar essas verificações antes de cada commit.

- **Executar Linting:**
  ```bash
  npm run lint
  ```
  Este comando tentará corrigir automaticamente os problemas encontrados.

## Documentação Técnica

### Decisões de Arquitetura e Design

- **Gerenciamento de Estado:**

  - **NgRx ComponentStore:** Foi escolhido para o gerenciamento de estado reativo dentro dos componentes que necessitam de lógica mais complexa (como `ProjectionStore` para a feature de projeção). A escolha se deu pela sua praticidade, escopo local (evitando a complexidade de um store global como NgRx Store para este escopo) e pela facilidade de integração com RxJS para lidar com fluxos de dados assíncronos e reativos.

- **Estrutura de Pastas e Organização:**

  - O projeto segue um padrão de estruturação que visa a clareza e a manutenibilidade, dividindo as responsabilidades em camadas e módulos bem definidos.
  - `src/app/features`: Contém os componentes principais e a lógica de negócio específica de cada funcionalidade da aplicação (ex: a feature `projection` com seus componentes de tabela, gráfico e diálogo). Esta abordagem promove o baixo acoplamento entre features.
  - `src/app/shared`: Agrupa artefatos reutilizáveis como serviços (ex: `ApiService`), modelos de dados (`api.models.ts`), e futuramente componentes de UI genéricos ou pipes, facilitando a consistência e evitando duplicação de código.
  - Dentro de cada feature ou componente complexo, busca-se manter uma organização interna clara, separando template (HTML), estilos (SCSS) e lógica (TypeScript).

- **Componentes Standalone:**

  - A maioria dos componentes foi desenvolvida utilizando a API de Componentes Standalone, introduzida e incentivada nas versões mais recentes do Angular (incluindo Angular 17+).

  - **Motivação:** Esta abordagem simplifica o desenvolvimento ao reduzir a necessidade de `NgModules` para cada componente, diminuindo o boilerplate e facilitando o gerenciamento de dependências diretamente no metadado `@Component`. Isso torna os componentes mais autocontidos e melhora a organização geral do código, alinhando-se com as práticas modernas do framework.

### Motivação para Bibliotecas Externas

- **Angular Material:** Biblioteca de componentes UI robusta e alinhada com o ecossistema Angular, facilitando a criação de interfaces consistentes e acessíveis.
- **NgRx ComponentStore:** Conforme mencionado acima, para um gerenciamento de estado local eficiente e reativo.
- **ApexCharts (ng-apexcharts):** Escolhida pela sua flexibilidade e variedade de tipos de gráficos, adequada para a visualização das projeções de eventos.
- **date-fns:** Biblioteca leve e moderna para manipulação de datas, oferecendo funções imutáveis e fáceis de usar.
- **lodash-es:** Fornece funções utilitárias performáticas e modulares, úteis para manipulação de coleções e objetos, garantindo que apenas o código usado seja incluído no bundle final.

### Possíveis Melhorias Futuras

- Implementação completa de testes E2E com Cypress, cobrindo os principais fluxos de usuário.
- Internacionalização (i18n) da interface para suportar múltiplos idiomas.
- Adição de mais opções de personalização para os ciclos ou projeções (ex: editar eventos de um ciclo).
- Otimizações de performance para grandes volumes de dados de projeção, se aplicável.
- Melhor tratamento de erros e feedback visual mais detalhado para o usuário em diferentes cenários.
- Adicionar persistência de estado (ex: `localStorage`) para manter as seleções do usuário entre sessões.

---
