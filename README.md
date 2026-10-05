# 🛠️ Plataforma EAM (Enterprise Asset Management)

Sistema web para o gerenciamento de ativos corporativos, controle de cautelas (empréstimos) e gestão de manutenções preventivas e corretivas.

## 🚀 Tecnologias Utilizadas

- **Front-end:** React.js, TypeScript, Vite, Tailwind CSS
- **Back-end & Banco de Dados:** Supabase (PostgreSQL)

---

## 👥 Equipe do Projeto

*(Preencha com os nomes dos 4 a 5 integrantes da equipe e suas funções, conforme os requisitos da disciplina)*

- **[Nome do Integrante 1]** - Desenvolvedor Front-end -> UX/UI Designer
- **[Nome do Integrante 2]** - Desenvolvedor Back-end -> Banco de Dados
- **[Nome do Integrante 3]** - Arquiteto de Software -> Analista de Requisitos
- **[Nome do Integrante 4]** - Gerente de Produtos -> Scrum Master
- **[Cesajulio]** - [Sua Função]

---

## 📢 Build in Public

Acompanhe nossa jornada de desenvolvimento do software nas redes sociais:

- [Post da Semana 1 - Instagram/LinkedIn](#)
- [Post da Semana 2 - Instagram/LinkedIn](#)
- [Post da Semana 3 - Instagram/LinkedIn](#)

---

## 📂 Entregáveis da Disciplina

Para a avaliação AV1, seguem as documentações exigidas nas semanas iniciais:

- **Semana 1:** [Link para o Protótipo no Figma](#) | Modelagem de Banco de Dados (ver `supabase_schema.sql`)
- **Semana 2:** [Planejamento de Custos](docs/custos.md) | Diagramas UML e C4 (Abaixo)
- **Semana 3:** [Link para o Organograma](#) | [Link para o Plano de Carreira](#)

---

## 📐 Diagramas UML

### Diagrama de Casos de Uso
Representa as interações principais entre os atores e o sistema.

```mermaid
flowchart LR
    User([Profissional de Saúde / Admin])
    
    subgraph Sistema EAM
        UC0(Login e Autenticação)
        UC1(Cadastrar Equipamento)
        UC2(Registrar Cautela)
        UC3(Registrar Devolução)
        UC4(Abrir Manutenção)
        UC5(Acompanhar Dashboard)
    end
    
    User --> UC0
    User --> UC1
    User --> UC2
    User --> UC3
    User --> UC4
    User --> UC5
```

### Diagrama de Classes
Entidades principais do sistema (baseado na modelagem do banco de dados).

```mermaid
classDiagram
    class Perfil {
        +UUID id
        +String nome
        +String funcao
        +Role role
    }
    class Equipamento {
        +UUID id
        +String nome
        +String numero_serie
        +String categoria
        +Status status
        +Date data_proxima_calibracao
    }
    class Cautela {
        +UUID id
        +String funcionario_responsavel
        +DateTime data_retirada
        +DateTime data_devolucao_prevista
        +Status status
    }
    class Manutencao {
        +UUID id
        +String descricao
        +Tipo tipo
        +DateTime data_abertura
        +Status status
    }

    Perfil "1" -- "0..*" Cautela : realiza
    Equipamento "1" -- "0..*" Cautela : possui
    Equipamento "1" -- "0..*" Manutencao : sofre
```

### Diagrama de Sequência (Fluxo de Cautela)

```mermaid
sequenceDiagram
    actor Usuario
    participant Frontend as SPA (React)
    participant Banco as Banco de Dados (Supabase)

    Usuario->>Frontend: Seleciona equipamento e preenche cautela
    Frontend->>Banco: POST: Salvar nova Cautela
    Banco-->>Frontend: Confirmação de salvamento
    Frontend->>Banco: PATCH: Atualizar status do Equipamento (em_cautela)
    Banco-->>Frontend: Confirmação de atualização
    Frontend-->>Usuario: Exibe mensagem de sucesso
```

### Diagrama de Atividade (Ciclo do Equipamento)

```mermaid
stateDiagram-v2
    [*] --> Disponível : Cadastro do Equipamento
    Disponível --> Em_Cautela : Registrar Cautela
    Em_Cautela --> Disponível : Devolver Equipamento
    Disponível --> Em_Manutenção : Enviar para Manutenção
    Em_Cautela --> Em_Manutenção : Equipamento apresentou defeito
    Em_Manutenção --> Disponível : Conclusão da Manutenção
```

---

## 🏗️ Diagramas C4 Model

### Diagrama de Contexto (Nível 1)
```mermaid
C4Context
    title Diagrama de Contexto (Nível 1) - Plataforma EAM
    
    Person(admin, "Administrador / Almoxarife", "Gerencia o inventário, realiza empréstimos e manutenções.")
    System(eam, "Plataforma EAM", "Sistema central para gestão dos equipamentos da empresa.")
    
    Rel(admin, eam, "Cadastra ativos, realiza cautelas e gerencia manutenções")
```

### Diagrama de Container (Nível 2)
```mermaid
C4Container
    title Diagrama de Container (Nível 2) - Plataforma EAM
    
    Person(admin, "Profissional de Saúde / Admin", "Utiliza o sistema logado em seu perfil.")
    
    System_Boundary(c1, "Plataforma EAM") {
        Container(spa, "Single Page Application", "React, Vite, Tailwind CSS", "Interface web (Com bloqueio de rotas via Auth).")
        ContainerDb(supabase, "BaaS / Database", "Supabase, PostgreSQL", "Armazena dados, perfis (Roles) e gerencia Login.")
    }
    
    Rel(admin, spa, "Acessa através do navegador", "HTTPS")
    Rel(spa, supabase, "Consome dados, operações (CRUD) e Auth", "REST API")
```
