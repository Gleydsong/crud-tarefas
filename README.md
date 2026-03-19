# API de Gerenciamento de Tarefas

API RESTful para gerenciar tarefas (to-do list) com operações CRUD completas, desenvolvida em Node.js puro usando o módulo HTTP.

## Recursos

- ✅ Criar tarefas (Create)
- ✅ Listar tarefas com filtros (Read)
- ✅ Atualizar tarefas (Update)
- ✅ Deletar tarefas (Delete)
- ✅ Marcar tarefa como concluída/pendente (PATCH)
- ✅ Importação de tarefas via CSV

## Estrutura do Projeto

```
crud-tarefas/
├── data/
│   └── tasks.json          # Banco de dados JSON
├── src/
│   ├── server.js           # Servidor HTTP
│   ├── routes.js           # Rotas da API
│   ├── database/
│   │   └── database.js     # Operações de persistência
│   ├── middleware/
│   │   └── middleware.js  # Funções utilitárias
│   └── import-csv.js      # Script de importação
├── tasks.csv              # Arquivo de exemplo CSV
├── package.json
└── README.md
```

## Instalação

```bash
# Clonar o repositório
git clone <repo-url>
cd crud-tarefas

# Instalar dependências
npm install
```

## Uso

### Iniciar o servidor

```bash
npm start
```

O servidor estará disponível em `http://localhost:3000`

### Desenvolvimento (com watch mode)

```bash
npm run dev
```

## API Reference

### Listar todas as tarefas

```bash
GET /tasks
```

**Filtros (query params):**
- `?title=<termo>` - Filtrar por título
- `?description=<termo>` - Filtrar por descrição

**Exemplo:**
```bash
curl http://localhost:3000/tasks?title=node
```

---

### Criar tarefa

```bash
POST /tasks
```

**Body:**
```json
{
  "title": "Minha tarefa",
  "description": "Descrição da tarefa"
}
```

**Exemplo:**
```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Estudar Node.js", "description": "Revisar conceitos de HTTP"}'
```

---

### Atualizar tarefa

```bash
PUT /tasks/:id
```

**Body (campos opcionais):**
```json
{
  "title": "Novo título",
  "description": "Nova descrição"
}
```

**Exemplo:**
```bash
curl -X PUT http://localhost:3000/tasks/<id> \
  -H "Content-Type: application/json" \
  -d '{"title": "Tarefa atualizada"}'
```

---

### Deletar tarefa

```bash
DELETE /tasks/:id
```

**Exemplo:**
```bash
curl -X DELETE http://localhost:3000/tasks/<id>
```

---

### Alternar status de conclusão

```bash
PATCH /tasks/:id/complete
```

Alterna entre concluída e pendente.

**Exemplo:**
```bash
curl -X PATCH http://localhost:3000/tasks/<id>/complete
```

---

## Importação CSV

### Formato do arquivo CSV

```csv
title,description
Task 01,Descrição da Task 01
Task 02,Descrição da Task 02
Task 03,Descrição da Task 03
```

### Executar importação

```bash
npm run import-csv tasks.csv
```

Ou diretamente:

```bash
node src/import-csv.js tasks.csv
```

**Nota:** O servidor deve estar rodando antes da importação.

## Estrutura de uma Tarefa

```json
{
  "id": "mmxx0g71h9ab8gamobk",
  "title": "Minha tarefa",
  "description": "Descrição da tarefa",
  "completed_at": null,
  "created_at": "2026-03-19T20:20:53.629Z",
  "updated_at": "2026-03-19T20:20:53.629Z"
}
```

## Tecnologias

- Node.js (módulo HTTP nativo)
- csv-parse (para importação de CSV)
- Arquivo JSON para persistência

## Licença

ISC