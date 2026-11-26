# Lista de Tarefas

Aplicação simples com Next.js (App Router), React e TanStack Query.

## Páginas

- `/` — lista as tarefas cadastradas.
- `/tarefa` — cria uma nova tarefa.
- `/tarefa?id=<id>` — edita uma tarefa existente.

## Modelo da tarefa

| Campo        | Tipo                            | Obrigatório |
| ------------ | ------------------------------- | ----------- |
| `id`         | string (UUID gerado na criação) | sim         |
| `titulo`     | string                          | sim         |
| `descricao`  | string                          | não         |
| `dataCriacao`| timestamp ISO 8601              | automático  |

## Como rodar

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Estrutura

```text
app/
  page.tsx                  # lista de tarefas (React Query)
  tarefa/page.tsx           # criação/edição (React Query)
  tarefas-api.ts            # tipos, chamadas HTTP e query keys
  providers.tsx             # QueryClientProvider
  api/tarefas/route.ts      # GET (lista) e POST (cria)
  api/tarefas/[id]/route.ts # GET, PUT e DELETE por id
  api/tarefas/dados.ts      # armazenamento em memória
  layout.tsx
  globals.css
```

Os dados ficam em memória no servidor e são reiniciados junto com ele.
