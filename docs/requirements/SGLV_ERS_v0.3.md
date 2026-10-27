# SGLV — Especificação de Requisitos de Software (ERS)

> **Versão:** 0.3  
> **Data:** 27/10/2026  
> **Status:** Baseline funcional preliminar — pendente de validações de negócio e jurídica  
> **Entrega-alvo do MVP:** 06/11/2026  
> **Produto:** Sistema de Gestão de Locação de Veículos (SGLV)

## 1. Visão geral

O SGLV é uma aplicação web responsiva para locação tradicional de veículos por diária, composta por um portal de clientes e um ambiente administrativo para funcionários da locadora.

### 1.1 Objetivos

- Permitir consulta de categorias, tarifas e disponibilidade.
- Permitir solicitação de reservas com antecipação equivalente a uma diária.
- Registrar e validar manualmente pagamentos realizados fora do sistema.
- Gerenciar reservas, retiradas, devoluções, cálculo financeiro e a situação da frota.
- Garantir integridade transacional, rastreabilidade e autorização por perfil.

### 1.2 Premissas do MVP

| Aspecto | Definição |
|---|---|
| Modelo | Locação tradicional por diária |
| Canais | Portal do cliente e sistema administrativo |
| Público inicial | Pessoas físicas no Brasil (premissa a confirmar) |
| Idioma e moeda | Português do Brasil e BRL |
| Reserva | Por **categoria**, com alocação de veículo físico na retirada |
| Pagamento para confirmação | Antecipação equivalente a **uma diária** |
| Prazo para informar pagamento | **2 horas corridas** desde a criação da reserva |
| Processamento | Pagamento externo, com informação e validação manual no sistema |
| Cancelamento | Regra comercial de não reembolso após confirmação, **ressalvadas hipóteses legais de restituição** |
| Integração com gateway | Fora do MVP |

> **Atenção jurídica:** Uma proibição absoluta de reembolso não deve ser implementada sem ressalvas. Reservas contratadas no portal podem estar sujeitas ao direito de arrependimento previsto no art. 49 do Código de Defesa do Consumidor e ao Decreto nº 7.962/2013, além de outras obrigações aplicáveis. A interpretação para o caso concreto deve ser validada juridicamente antes da operação comercial. Referências: [Lei nº 8.078/1990](https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm) e [Decreto nº 7.962/2013](https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2013/decreto/d7962.htm).

## 2. Atores e permissões

| Ator | Responsabilidades |
|---|---|
| Visitante | Consultar categorias, tarifas e disponibilidade |
| Cliente | Cadastrar-se, autenticar-se, solicitar reserva, informar pagamento, acompanhar e cancelar reserva |
| Atendente | Administrar reservas, validar pagamentos, conferir documentação, abrir e encerrar locações |
| Operador de frota | Registrar condições, quilometragem, combustível, retirada e devolução |
| Administrador | Configurar categorias, veículos, tarifas, usuários e parâmetros |
| Sistema (processador de tarefas) | Expirar solicitações e atualizar capacidade conforme regras |

No MVP, atendente e operador podem compartilhar um perfil operacional, sem eliminar a distinção lógica de responsabilidades.

## 3. Jornada principal

1. Cliente consulta disponibilidade para categoria e período.
2. Cliente seleciona categoria e visualiza preço total e antecipação de uma diária.
3. Cliente confirma solicitação; sistema cria reserva **Aguardando pagamento**, registra valor/condições e retém capacidade por até 2 horas.
4. Cliente realiza pagamento fora do sistema e informa referência/dados (comprovante opcional).
5. Reserva passa para **Em análise** sem confirmação automática.
6. Atendente confere o efetivo recebimento e aprova ou rejeita o pagamento.
7. Após aprovação e validação das condições de elegibilidade, reserva passa a **Confirmada**.
8. Na retirada, atendente valida condutor, atribui veículo físico e registra abertura da locação.
9. Na devolução, funcionário registra condições e dados operacionais; sistema calcula total, deduz valores validados e apura saldo.
10. Locação é encerrada e o veículo retorna à disponibilidade apenas se estiver apto.

### 3.1 Estados

**Reserva:** `AGUARDANDO_PAGAMENTO`, `EM_ANALISE`, `CONFIRMADA`, `EXPIRADA`, `CANCELADA`, `CONVERTIDA_EM_LOCACAO`.

**Pagamento:** `PENDENTE`, `INFORMADO`, `VALIDADO`, `REJEITADO`, `ESTORNADO` (este último somente após conclusão real da devolução financeira).

**Locação:** `ABERTA`, `EM_ANDAMENTO`, `ENCERRADA`.

**Veículo:** estado operacional (`DISPONIVEL`, `LOCADO`, `EM_MANUTENCAO` etc.) separado da **disponibilidade calculada por período**. Uma reserva de categoria não significa que uma placa específica esteja alocada.

### 3.2 Fluxos alternativos críticos

- Prazo vencido sem pagamento informado → reserva expirada e capacidade liberada.
- Pagamento informado tempestivamente → análise manual; não expirar pela regra aplicável à ausência de informação.
- Pagamento informado após expiração → tratar como exceção; nunca confirmar automaticamente.
- Pagamento rejeitado → não confirmar; tratar retenção/liberação conforme política definida.
- Cancelamento → registrar motivo e avaliar restituição legalmente devida.
- Veículo inapto após devolução → bloquear nova disponibilização até liberação operacional.

## 4. Regras de negócio consolidadas

**P0** = necessária ao fluxo mínimo e à homologação.

| ID | Regra | Prioridade |
|---|---|---|
| RN-001 | Retirada prevista deve anteceder a devolução prevista. | P0 |
| RN-002 | Disponibilidade deve ser calculada por categoria e período, considerando capacidade comprometida. | P0 |
| RN-003 | Criação de reserva e retenção de capacidade devem ser transacionais para impedir sobrecontratação. | P0 |
| RN-004 | Solicitação registra tarifa, período, valor total e condições comerciais vigentes. | P0 |
| RN-005 | Antecipação corresponde ao valor de uma diária aplicada à reserva. | P0 |
| RN-006 | Cliente tem 2 horas corridas desde a criação da reserva para informar pagamento. | P0 |
| RN-007 | Capacidade da categoria fica retida enquanto a reserva estiver elegível. | P0 |
| RN-008 | Reserva sem pagamento informado no prazo expira e libera capacidade. | P0 |
| RN-009 | Pagamento informado dentro do prazo aguarda validação e mantém retenção temporária, conforme prazo de análise ainda a definir. | P0 |
| RN-010 | Informar pagamento não confirma a reserva. | P0 |
| RN-011 | Somente funcionário autorizado pode validar pagamentos. | P0 |
| RN-012 | Um mesmo pagamento não pode ser validado duas vezes. | P0 |
| RN-013 | Confirmação exige pagamento validado e demais condições de elegibilidade satisfeitas. | P0 |
| RN-014 | Reserva expirada não pode ser confirmada automaticamente. | P0 |
| RN-015 | Cancelamento voluntário após confirmação segue política comercial de não reembolso, ressalvados direitos legais e hipóteses obrigatórias de restituição. | P0 |
| RN-016 | Reembolso devido deve permitir registro e processamento manual, com rastreabilidade. | P0 |
| RN-017 | Somente reserva confirmada origina locação. | P0 |
| RN-018 | Um mesmo veículo não pode ter duas locações ativas simultâneas. | P0 |
| RN-019 | Retirada exige validação de condutor e condições contratuais. | P0 |
| RN-020 | Quilometragem de devolução não pode ser inferior à de retirada, exceto ajuste autorizado e auditado. | P0 |
| RN-021 | Cálculo final deduz pagamentos efetivamente validados. | P0 |
| RN-022 | Movimentação financeira registra responsável e data/hora. | P0 |
| RN-023 | Veículo inapto após devolução não deve ser liberado automaticamente. | P0 |
| RN-024 | Alterações críticas em reservas, contratos, tarifas e pagamentos são auditáveis. | P0 |
| RN-025 | Cliente pode consultar reservas e solicitar cancelamento no portal. | P0 |

### 4.1 Cálculo comercial

```text
antecipacao = tarifa_aplicada_de_uma_diaria
valor_total = diarias_apuradas + adicionais - descontos_aplicaveis
saldo_final = valor_total - soma(pagamentos_validados)
```

**Exemplo ilustrativo:** tarifa R$ 180/dia × 3 diárias = R$ 540; antecipação R$ 180; adicionais R$ 0; saldo R$ 360.

Regras exatas de início/fim de diária, frações, tolerância, multas e adicionais permanecem pendentes (PD-03 e PD-04).

## 5. Requisitos funcionais

### 5.1 Identidade e clientes

| ID | Descrição | Prioridade |
|---|---|---|
| RF-001 | Cadastrar clientes pessoa física. | P0 |
| RF-002 | Autenticar clientes e funcionários e controlar acesso por perfil. | P0 |
| RF-003 | Consultar e editar dados cadastrais. | P0 |
| RF-004 | Cadastrar condutores e dados de CNH. | P1 |

> **Nota de escopo:** Embora o cadastro detalhado do condutor seja P1, a verificação mínima de elegibilidade na retirada continua obrigatória (RN-019, UC-006).

### 5.2 Frota e tarifas

| ID | Descrição | Prioridade |
|---|---|---|
| RF-005 | Cadastrar e manter veículos. | P0 |
| RF-006 | Gerenciar categorias de veículos. | P0 |
| RF-007 | Controlar condição operacional dos veículos. | P0 |
| RF-008 | Cadastrar tarifas diárias por categoria. | P0 |
| RF-009 | Registrar bloqueios e indisponibilidades. | P0 |

### 5.3 Reservas

| ID | Descrição | Prioridade |
|---|---|---|
| RF-010 | Consultar disponibilidade por categoria e período. | P0 |
| RF-011 | Calcular tarifa total e antecipação equivalente a uma diária. | P0 |
| RF-012 | Criar reserva pendente com prazo de 2 horas. | P0 |
| RF-013 | Consultar e solicitar cancelamento de reserva. | P0 |
| RF-014 | Administrar reservas e transições de estado. | P0 |
| RF-015 | Alterar período de reserva com recálculo e disponibilidade. | P1 |

### 5.4 Locações

| ID | Descrição | Prioridade |
|---|---|---|
| RF-016 | Converter reserva confirmada em locação. | P0 |
| RF-017 | Associar veículo físico à locação. | P0 |
| RF-018 | Registrar data/hora, quilometragem e combustível na retirada. | P0 |
| RF-019 | Registrar vistoria de saída. | P1 |
| RF-020 | Emitir resumo da locação. | P0 |

### 5.5 Devolução e financeiro

| ID | Descrição | Prioridade |
|---|---|---|
| RF-021 | Registrar data/hora, quilometragem e combustível na devolução. | P0 |
| RF-022 | Calcular total devido, deduções e saldo final. | P0 |
| RF-023 | Encerrar locação e atualizar elegibilidade do veículo. | P0 |
| RF-024 | Registrar e consultar pagamentos manualmente. | P0 |
| RF-025 | Registrar avarias e ocorrências. | P1 |

### 5.6 Administração e relatórios

| ID | Descrição | Prioridade |
|---|---|---|
| RF-026 | Administrar usuários e perfis. | P0 |
| RF-027 | Visualizar painel operacional. | P0 |
| RF-028 | Consultar histórico de locações. | P0 |
| RF-029 | Visualizar indicadores básicos de frota. | P1 |
| RF-030 | Auditar eventos e mudanças críticas. | P0 |

### 5.7 Pagamento e confirmação

| ID | Descrição | Prioridade |
|---|---|---|
| RF-031 | Gerar identificador e prazo da reserva. | P0 |
| RF-032 | Receber informação e referência de pagamento. | P0 |
| RF-033 | Validar ou rejeitar pagamento manualmente. | P0 |
| RF-034 | Confirmar reserva após aprovação e validação de elegibilidade. | P0 |
| RF-035 | Expirar reservas sem pagamento informado no prazo. | P0 |
| RF-036 | Reter capacidade temporariamente. | P0 |
| RF-037 | Manter histórico de eventos financeiros. | P0 |
| RF-038 | Tratar pagamentos informados após expiração. | P0 |
| RF-039 | Registrar cancelamentos e reembolsos elegíveis. | P0 |
| RF-040 | Exibir resumo, instruções e situação da reserva no portal. | P0 |

## 6. Casos de uso e critérios de aceite

### UC-001 — Criar reserva

- **Ator:** Cliente.
- **RFs:** RF-010, RF-011, RF-012, RF-031, RF-036, RF-040.
- **Pré-condições:** categoria/tarifa disponíveis; período válido; cliente identificado para concluir a solicitação.
- **Fluxo:** informar período → consultar categorias e preços → selecionar categoria → revalidar disponibilidade → criar reserva pendente → apresentar prazo e instruções.

**Critérios de aceite:**

- **CA-001:** Dada capacidade disponível, ao confirmar solicitação, o sistema cria reserva `AGUARDANDO_PAGAMENTO`.
- **CA-002:** Antecipação registrada é igual à tarifa aplicada de uma diária.
- **CA-003:** Prazo é exatamente 120 minutos após a criação, segundo horário confiável do servidor.
- **CA-004:** Criação da reserva compromete temporariamente capacidade da categoria.
- **CA-005:** Duas tentativas concorrentes pela última unidade não geram sobrecontratação.
- **CA-006:** Tarifas, períodos e condições apresentados ficam associados à reserva.

### UC-002 — Informar pagamento

- **Ator:** Cliente.
- **RFs:** RF-032, RF-037, RF-040.
- **Pré-condições:** reserva elegível para receber informação de pagamento.
- **Fluxo:** abrir reserva → consultar valor/prazo → informar método, valor, data e referência (comprovante opcional) → registrar envio → exibir `EM_ANALISE`.

**Critérios de aceite:**

- **CA-007:** Dados informados são persistidos e associados à reserva.
- **CA-008:** Informação tempestiva altera a reserva para `EM_ANALISE`, sem confirmação automática.
- **CA-009:** Sistema impede duplicidade financeira da mesma referência ou trata novo envio como atualização rastreável.
- **CA-010:** Histórico inclui autoria, data/hora e situação informada.
- **CA-011:** Informação após expiração é tratada como exceção, sem restauração automática da reserva.

### UC-003 — Validar pagamento

- **Ator:** Atendente autorizado.
- **RFs:** RF-024, RF-033, RF-034, RF-037.
- **Pré-condições:** pagamento informado e usuário com permissão.
- **Fluxo:** listar pendências → consultar dados → verificar recebimento externamente → aprovar/rejeitar → registrar decisão → atualizar reserva elegível.

**Critérios de aceite:**

- **CA-012:** Usuário sem permissão não consegue validar pagamento.
- **CA-013:** Aprovação de pagamento válido confirma somente reserva elegível.
- **CA-014:** Rejeição não confirma a reserva e registra justificativa.
- **CA-015:** Aprovação duplicada não duplica créditos/valores.
- **CA-016:** Ação grava usuário, horário, resultado e referência.

### UC-004 — Expirar reserva

- **Ator:** Sistema (tarefa automática).
- **RFs:** RF-035, RF-036, RF-038.
- **Pré-condições:** reserva `AGUARDANDO_PAGAMENTO` com prazo expirado.
- **Fluxo:** localizar reservas vencidas → conferir estado e registros de pagamento → expirar elegíveis → liberar retenção → auditar.

**Critérios de aceite:**

- **CA-017:** Reserva sem pagamento informado após 120 minutos passa a `EXPIRADA`.
- **CA-018:** A expiração libera a capacidade correspondente.
- **CA-019:** Reserva em análise por pagamento tempestivo não é expirada pela regra de ausência de informação.
- **CA-020:** Pagamento tardio não confirma reserva expirada.
- **CA-021:** Expiração e validação concorrentes não produzem estado inconsistente.

### UC-005 — Cancelar reserva e tratar reembolso

- **Atores:** Cliente e atendente.
- **RFs:** RF-013, RF-039.
- **Pré-condições:** reserva cancelável segundo a política aplicável.
- **Fluxo:** solicitar cancelamento → registrar motivo → avaliar retenção/reembolso e direitos legais → cancelar → liberar capacidade → registrar eventual processo manual de restituição.

**Critérios de aceite:**

- **CA-022:** Cancelamento registra solicitante, motivo e data/hora.
- **CA-023:** Capacidade comprometida é liberada quando o cancelamento se efetiva.
- **CA-024:** Regra comercial de não reembolso nunca suprime hipótese legal de restituição.
- **CA-025:** Reembolso devido é rastreável; status `ESTORNADO` só após efetiva conclusão financeira.

### UC-006 — Efetivar retirada

- **Ator:** Atendente/operador.
- **RFs:** RF-016, RF-017, RF-018, RF-020.
- **Pré-condições:** reserva `CONFIRMADA`, condutor validado, veículo apto.
- **Fluxo:** localizar reserva → conferir condutor/condições → escolher veículo → registrar dados de retirada → abrir locação.

**Critérios de aceite:**

- **CA-026:** Reserva não confirmada não origina locação.
- **CA-027:** Veículo com locação ativa ou inapto não pode ser novamente entregue.
- **CA-028:** Retirada registra identificação do veículo, horário, quilometragem, combustível e responsável.
- **CA-029:** Locação preserva vínculo com reserva e pagamento antecipado validado.

### UC-007 — Devolver e encerrar locação

- **Ator:** Atendente/operador.
- **RFs:** RF-021, RF-022, RF-023, RF-024.
- **Pré-condições:** locação ativa.
- **Fluxo:** registrar devolução → verificar atrasos/condições → calcular total → deduzir pagamentos validados → registrar acerto → encerrar e atualizar veículo.

**Critérios de aceite:**

- **CA-030:** Registro de devolução contém horário, quilometragem e combustível.
- **CA-031:** Resumo financeiro diferencia diárias, adicionais, descontos, valores pagos e saldo.
- **CA-032:** A antecipação é deduzida uma única vez.
- **CA-033:** Locação não é encerrada sem dados mínimos de devolução.
- **CA-034:** Veículo inapto não volta automaticamente à disponibilidade.
- **CA-035:** Pendências financeiras ficam visíveis e rastreáveis.

### UC-008 — Administrar frota e tarifas

- **Ator:** Administrador.
- **RFs:** RF-005 a RF-009, RF-026 a RF-030.
- **Pré-condições:** usuário autenticado e autorizado.
- **Fluxo:** cadastrar categorias/veículos → configurar tarifas/vigências → registrar indisponibilidades → consultar operação e histórico.

**Critérios de aceite:**

- **CA-036:** Placa de veículo é única.
- **CA-037:** Tarifas exigem valores e vigências válidos.
- **CA-038:** Bloqueios por manutenção reduzem a capacidade disponível no período correspondente.
- **CA-039:** Alterações administrativas críticas geram auditoria.
- **CA-040:** Acesso a configurações respeita permissões.

## 7. Modelo conceitual de dados

| Entidade | Campos sugeridos |
|---|---|
| Cliente | id, nome, CPF, contato, endereço, status |
| Condutor | id, cliente_id, nome, CNH, validade, status_verificacao |
| Usuario | id, login, credencial_hash, perfil, status |
| Categoria | id, nome, descrição, características |
| Veiculo | id, placa, marca, modelo, ano, categoria_id, quilometragem, estado_operacional |
| Tarifa | id, categoria_id, valor_diaria, inicio_vigencia, fim_vigencia |
| Indisponibilidade | id, veiculo_id, inicio, fim, motivo |
| Reserva | id, cliente_id, categoria_id, retirada_prevista, devolucao_prevista, tarifa_snapshot, valor_total, valor_antecipacao, prazo_pagamento, status |
| Pagamento | id, reserva_id, valor, metodo, referencia, data_informacao, data_pagamento_informada, status |
| ValidacaoPagamento | id, pagamento_id, usuario_validador_id, decisao, justificativa, data_validacao |
| Locacao | id, reserva_id, veiculo_id, inicio_real, fim_real, status |
| Vistoria | id, locacao_id, tipo, quilometragem, combustivel, observacoes |
| Cobranca | id, locacao_id, descricao, valor, status |
| Reembolso | id, pagamento_id, valor, motivo, status, data_conclusao |
| HistoricoEvento | id, entidade, entidade_id, acao, usuario_id, data_hora, dados_resumidos |
| ConfiguracaoComercial | id, prazo_pagamento_minutos, prazo_analise_horas, regras_tarifarias, vigencia |

### 7.1 Relacionamentos e integridade

- Cliente possui diversas reservas; reserva referencia uma categoria e pode originar uma locação.
- Locação vincula uma reserva a um veículo físico.
- Reserva pode ter registros de pagamento e suas validações.
- Locação possui registros operacionais, cobranças e saldo financeiro.
- Índices/restrições devem impedir placa duplicada, duplicação financeira e conflitos de ocupação.
- Transições críticas de reserva devem usar transações e controle de concorrência.
- Armazenar valores monetários em tipo decimal apropriado, não ponto flutuante binário.
- Registrar instantes em padrão temporal consistente e exibir com o fuso aplicável.

## 8. Requisitos não funcionais

| ID | Requisito | Critério inicial |
|---|---|---|
| RNF-001 | Segurança | Autenticação, autorização por papel e hash seguro de senhas |
| RNF-002 | Integridade transacional | Sem sobrecontratação nem pagamento validado duplicado |
| RNF-003 | Proteção de dados | Acesso restrito e tratamento compatível com a LGPD |
| RNF-004 | Desempenho | Meta: 95% das consultas comuns em até 3 s sob carga de teste a definir |
| RNF-005 | Responsividade | Portal utilizável em desktop e celular |
| RNF-006 | Auditoria | Registro de eventos críticos com proteção contra alteração indevida |
| RNF-007 | Consistência temporal | Prazos calculados pelo servidor e fuso consistente |
| RNF-008 | Manutenibilidade | Separação entre interface, regras e persistência |
| RNF-009 | Recuperação | Backup e procedimento de restauração documentados |
| RNF-010 | Testabilidade | Testes de regras financeiras, concorrência e estados |

**Arquitetura lógica sugerida:** monólito modular com portal web, administração web, API de negócio, banco de dados relacional e processador de tarefas agendadas. A tecnologia exata será definida conforme a equipe e infraestrutura disponíveis.

## 9. Backlog priorizado

As estimativas em pontos são **relativas e preliminares**, não equivalem a horas de trabalho.

| Ordem | História | Descrição | Prioridade | Pontos | Dependências | RFs principais |
|---:|---|---|---|---:|---|---|
| 1 | US-01 | Estrutura da aplicação, banco e autenticação | P0 | 8 | — | RF-002, RF-026 |
| 2 | US-02 | Cadastro de categorias e veículos | P0 | 5 | US-01 | RF-005 a RF-007 |
| 3 | US-03 | Cadastro de tarifas e bloqueios | P0 | 5 | US-02 | RF-008, RF-009 |
| 4 | US-04 | Cadastro e autenticação de clientes | P0 | 5 | US-01 | RF-001, RF-003 |
| 5 | US-05 | Motor de disponibilidade e diárias | P0 | 13 | US-02, US-03 | RF-010, RF-011, RF-036 |
| 6 | US-06 | Criação de reserva e retenção por duas horas | P0 | 8 | US-04, US-05 | RF-012, RF-031, RF-040 |
| 7 | US-07 | Informação manual de pagamento pelo cliente | P0 | 5 | US-06 | RF-032, RF-037 |
| 8 | US-08 | Validação de pagamentos e confirmação | P0 | 8 | US-07 | RF-024, RF-033, RF-034 |
| 9 | US-09 | Expiração e tratamento de pagamentos tardios | P0 | 8 | US-06, US-08 | RF-035, RF-038 |
| 10 | US-10 | Cancelamento e reembolso | P0 | 5 | US-08 | RF-013, RF-039 |
| 11 | US-11 | Retirada, associação do veículo e locação | P0 | 8 | US-08 | RF-016 a RF-018, RF-020 |
| 12 | US-12 | Devolução, cálculo e encerramento | P0 | 13 | US-11 | RF-021 a RF-023 |
| 13 | US-13 | Painel operacional, histórico e auditoria | P0 | 8 | US-06 a US-12 | RF-014, RF-027, RF-028, RF-030 |
| 14 | US-14 | Cadastro detalhado de condutores | P1 | 3 | US-04 | RF-004 |
| 15 | US-15 | Alteração de reservas | P1 | 5 | US-05, US-06 | RF-015 |
| 16 | US-16 | Vistorias e registro de avarias | P1 | 8 | US-11, US-12 | RF-019, RF-025 |
| 17 | US-17 | Relatórios de utilização de frota | P1 | 5 | US-13 | RF-029 |
| | | **Total P0** | | **99** | | |
| | | **Total P1** | | **21** | | |
| | | **Total geral** | | **120** | | |

### 9.1 Observação sobre o prazo

O esforço de 99 pontos P0 em poucos dias úteis é significativo. A viabilidade depende da capacidade efetiva da equipe, reutilização de componentes e infraestrutura disponível. Caso necessário, reduzir primeiro sofisticações administrativas e relatórios, **sem retirar as regras mínimas de integridade financeira e de disponibilidade**.

## 10. Planejamento de entrega

| Data/período | Resultado esperado | Histórias |
|---|---|---|
| 28/10/2026 | Fundação e cadastros | US-01 a US-04 |
| 29–30/10/2026 | Disponibilidade e reservas | US-05 e US-06 |
| 02/11/2026 | Pagamentos e confirmação | US-07 e US-08 |
| 03/11/2026 | Expiração e cancelamento | US-09 e US-10 |
| 04/11/2026 | Retirada e devolução | US-11 e US-12 |
| 05/11/2026 | Painel, integração e testes | US-13, testes |
| 06/11/2026 | Homologação e demonstração do MVP | Jornada completa |

## 11. Cenários de teste críticos

- [ ] Duas reservas simultâneas para a última unidade da categoria não excedem capacidade.
- [ ] Reserva criada às 10h00 recebe prazo de pagamento de 12h00 (fuso de apresentação coerente).
- [ ] Reserva sem pagamento informado expira ao ultrapassar o prazo e libera capacidade.
- [ ] Pagamento informado antes do vencimento não é expirado pela rotina de ausência de pagamento.
- [ ] Pagamento informado após expiração não confirma automaticamente a reserva.
- [ ] Pagamento em valor divergente exige decisão administrativa, sem aprovação automática.
- [ ] A mesma referência financeira não gera dois pagamentos validados.
- [ ] Aprovação simultânea à rotina de expiração não causa estado inválido.
- [ ] Cancelamento libera capacidade e registra tratamento de restituição quando exigido.
- [ ] Reserva pendente/cancelada/expirada não origina locação.
- [ ] Veículo já locado não pode ser retirado novamente.
- [ ] Devolução desconta antecipação exatamente uma vez.
- [ ] Veículo com avaria ou condição impeditiva não volta automaticamente à disponibilidade.
- [ ] Usuário não autorizado não valida pagamento nem altera tarifas.
- [ ] Toda operação financeira crítica deixa trilha de auditoria.

## 12. Definition of Done

Uma história é considerada pronta quando:

- [ ] Código está integrado e revisado.
- [ ] Todos os critérios de aceite pertinentes foram atendidos.
- [ ] Testes principais e de exceção foram executados.
- [ ] Validação de entradas e autorização foram verificadas.
- [ ] Operações transacionais críticas preservam a integridade dos dados.
- [ ] Não existem defeitos bloqueadores conhecidos.
- [ ] Funcionalidade está demonstrável no ambiente do MVP.

**Jornada mínima de homologação:** cliente cadastrado → reserva → antecipação de uma diária → informação do pagamento → validação manual → confirmação → retirada → devolução → acerto financeiro.

## 13. Pendências e decisões abertas

| ID | Ponto | Proposta inicial | Estado |
|---|---|---|---|
| PD-01 | Método de pagamento externo | PIX com referência informada pelo cliente | A validar |
| PD-02 | Prazo máximo de análise do pagamento informado tempestivamente | 24 horas | A validar |
| PD-03 | Política de diárias e arredondamentos | Ciclos de 24 horas, com regra detalhada | A validar |
| PD-04 | Atraso na devolução | Cobrança adicional configurável | A validar |
| PD-05 | Unidade de retirada/devolução | Mesma unidade | A validar |
| PD-06 | Caução | Fora do MVP | A validar |
| PD-07 | Elegibilidade do condutor | Validação administrativa antes da retirada | A validar |
| PD-08 | Cancelamento, arrependimento e reembolso | Processo manual com revisão jurídica | **Bloqueante para operação comercial** |
| PD-09 | Aceite contratual | Registrar versão dos termos, responsável e momento | A validar |

## 14. Fora do escopo do MVP

- Aplicativos nativos para Android e iOS.
- Gateway automático de pagamentos e conciliação bancária automática.
- Precificação dinâmica, fidelidade e promoções avançadas.
- Integrações com seguradoras e autuações de trânsito.
- Telemetria veicular e rastreamento em tempo real.
- Assinatura eletrônica com provedor externo.
- Operação de múltiplas filiais, salvo ampliação expressa do escopo.
- Integração fiscal automatizada.

## 15. Controle de versões

| Versão | Data | Alterações |
|---|---|---|
| 0.1 | 27/10/2026 | Visão geral, atores, 30 requisitos e processos iniciais |
| 0.2 | 27/10/2026 | Pagamento antecipado e validação manual; requisitos RF-031 a RF-040 |
| **0.3** | **27/10/2026** | Antecipação de uma diária, prazo de duas horas, cancelamento com ressalvas legais, regras consolidadas, critérios de aceite e backlog priorizado |

---

**Status de aprovação:** documento apto a orientar refinamento técnico e implementação de protótipo/MVP; **não constitui aprovação jurídica, operacional ou de produção**. As decisões em aberto devem ser fechadas antes da entrega comercial.
