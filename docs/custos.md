# 📊 Planejamento de Custos - Plataforma EAM

Este documento detalha o planejamento financeiro para a construção e manutenção do MVP (Mínimo Produto Viável) da plataforma EAM. O foco inicial foi minimizar despesas com servidores utilizando arquitetura serverless de ponta, permitindo que o investimento seja focado na equipe.

## 1. Custos de Infraestrutura e Ferramentas (SaaS)

Para a fase inicial do MVP, priorizamos ferramentas com *Free Tiers* generosos. Abaixo está a tabela do custo atual e o custo projetado quando a aplicação precisar escalar para centenas de usuários simultâneos.

| Serviço | Utilidade | Plano MVP (Atual) | Plano Pro (Pós-Escala) |
|---|---|---|---|
| **Supabase** | Banco de Dados (PostgreSQL), Auth e API | Free Tier ($0/mês) | Pro Tier ($25/mês) |
| **Vercel / Netlify** | Hospedagem do Front-end (React/Vite) | Hobby Tier ($0/mês) | Pro Tier ($20/mês) |
| **Figma** | Design de Interfaces e Prototipação UI/UX | Free Tier ($0/mês) | Pro Tier ($15/mês/user) |
| **Github** | Controle de Versão, Repositório e CI/CD | Free Tier ($0/mês) | Team ($4/mês/user) |
| **Registro de Domínio** | Domínio customizado (ex: eam.com.br) | R$ 40/ano | R$ 40/ano |

> **Custo Total de Infraestrutura (MVP):** R$ 40,00 ao ano (apenas domínio).
> **Custo Total de Infraestrutura (Escala):** ~$60 dólares / mês.

---

## 2. Custos com Equipe de Desenvolvimento (CAPEX)

O desenvolvimento da plataforma envolve uma *squad* dedicada com 4 profissionais. O cálculo abaixo é uma projeção de mercado do valor da mão de obra para o desenvolvimento do MVP ao longo de 2 meses (part-time ágil, aprox. 80 horas/mês por integrante).

| Cargo / Função | Custo Hora Estimado | Horas Mês | Total Mensal por Profissional |
|---|---|---|---|
| **Desenvolvedor Front-end / UX UI** | R$ 60,00 / h | 80 h | R$ 4.800,00 |
| **Desenvolvedor Back-end / DBA** | R$ 70,00 / h | 80 h | R$ 5.600,00 |
| **Arquiteto de Software / Requisitos**| R$ 80,00 / h | 80 h | R$ 6.400,00 |
| **Gerente de Produtos / Scrum Master** | R$ 75,00 / h | 80 h | R$ 6.000,00 |

> **Custo Mensal da Equipe:** R$ 22.800,00 
> **Custo Total de Mão de Obra do Projeto (2 meses):** R$ 45.600,00

---

## 3. Resumo Executivo e ROI

1. **Custo Operacional Inicial (OPEX):** Virtualmente zero, sustentado pelos planos gratuitos excelentes do Supabase e plataformas de hosting modernas.
2. **Custo de Desenvolvimento (CAPEX):** Estimado em **R$ 45.600,00**, correspondente ao esforço técnico dos 4 membros do grupo.

Essa estratégia permite que o risco financeiro do MVP seja extremamente baixo e possibilita a validação real do controle de cautelas e manutenções no mercado antes de realizar aportes financeiros robustos em infraestrutura de TI.
