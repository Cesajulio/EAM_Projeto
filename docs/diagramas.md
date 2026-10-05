# Diagramas do Projeto EAM

Este documento contém os diagramas arquiteturais e UML do sistema de gerenciamento de ativos (EAM), conforme exigido para a documentação do projeto.

---

## 1. Diagramas UML

### 1.1 Diagrama de Casos de Uso
Representa as interações principais entre os atores e o sistema EAM.

```mermaid
flowchart LR
    Admin([Usuário / Almoxarife])
    
    subgraph Sistema EAM
        UC1(Cadastrar Equipamento)
        UC2(Registrar Cautela)
        UC3(Registrar Devolução)
        UC4(Abrir Manutenção)
        UC5(Acompanhar Dashboard)
    end
    
    Admin --> UC1
    Admin --> UC2
    Admin --> UC3
    Admin --> UC4
    Admin --> UC5
```

### 1.2 Diagrama de Classes
Demonstra as entidades principais do sistema e seus relacionamentos (baseado no esquema de banco de dados).

```mermaid
classDiagram
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

    Equipamento "1" -- "0..*" Cautela : possui
    Equipamento "1" -- "0..*" Manutencao : sofre
```

### 1.3 Diagrama de Sequência (Fluxo de Cautela)
Detalha o fluxo de comunicação para o empréstimo (cautela) de um equipamento.

```mermaid
sequenceDiagram
    actor Usuario
    participant Frontend as SPA (React)
    participant Banco as Banco de Dados (Supabase)

    Usuario->>Frontend: Seleciona equipamento e preenche dados da cautela
    Frontend->>Banco: POST: Salvar nova Cautela
    Banco-->>Frontend: Confirmação de salvamento
    Frontend->>Banco: PATCH: Atualizar status do Equipamento para 'em_cautela'
    Banco-->>Frontend: Confirmação de atualização
    Frontend-->>Usuario: Exibe mensagem de sucesso e atualiza listagem
```

### 1.4 Diagrama de Atividade (Ciclo de Vida do Equipamento)
Mostra o fluxo de estados pelos quais um equipamento passa no sistema.

```mermaid
stateDiagram-v2
    [*] --> Disponível : Cadastro do Equipamento
    Disponível --> Em_Cautela : Registrar Cautela
    Em_Cautela --> Disponível : Devolver Equipamento
    Disponível --> Em_Manutenção : Enviar para Manutenção (Preventiva/Corretiva)
    Em_Cautela --> Em_Manutenção : Equipamento apresentou defeito
    Em_Manutenção --> Disponível : Conclusão da Manutenção
```

---

## 2. Diagramas C4 Model

### 2.1 Diagrama de Contexto (Nível 1)
Visão de alto nível de como o usuário interage com o sistema.

```mermaid
C4Context
    title Diagrama de Contexto (Nível 1) - Plataforma EAM
    
    Person(admin, "Administrador / Almoxarife", "Gerencia o inventário, realiza empréstimos e manutenções.")
    System(eam, "Plataforma EAM", "Sistema central para gestão dos equipamentos da empresa.")
    
    Rel(admin, eam, "Cadastra ativos, realiza cautelas e gerencia manutenções")
```

### 2.2 Diagrama de Container (Nível 2)
Visão arquitetural demonstrando a separação do Front-end (React) e Back-end as a Service (Supabase).

```mermaid
C4Container
    title Diagrama de Container (Nível 2) - Plataforma EAM
    
    Person(admin, "Administrador / Almoxarife", "Gerencia os ativos da empresa.")
    
    System_Boundary(c1, "Plataforma EAM") {
        Container(spa, "Single Page Application", "React, Vite, Tailwind CSS", "Fornece a interface web para o usuário interagir com o sistema.")
        ContainerDb(supabase, "BaaS e Banco de Dados", "Supabase, PostgreSQL", "Armazena dados das entidades, autenticação e expõe a API RESTful.")
    }
    
    Rel(admin, spa, "Acessa através do navegador", "HTTPS")
    Rel(spa, supabase, "Consome dados e realiza operações (CRUD)", "REST API / Supabase Client")
```
