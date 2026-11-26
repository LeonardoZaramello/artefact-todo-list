import type { Tarefa, TarefaInput } from '../../tarefas-api'

type Armazenamento = typeof globalThis & {
  __tarefasEmMemoria?: Tarefa[]
}

const globalComTarefas = globalThis as Armazenamento

function tarefas(): Tarefa[] {
  if (!globalComTarefas.__tarefasEmMemoria) {
    const agora = Date.now()
    const dia = 24 * 60 * 60 * 1000

    globalComTarefas.__tarefasEmMemoria = [
      {
        id: crypto.randomUUID(),
        titulo: 'Revisar o backlog',
        descricao: 'Priorizar as tarefas da próxima semana.',
        dataCriacao: new Date(agora - 2 * dia).toISOString(),
      },
      {
        id: crypto.randomUUID(),
        titulo: 'Enviar relatório mensal',
        descricao: '',
        dataCriacao: new Date(agora - dia).toISOString(),
      },
      {
        id: crypto.randomUUID(),
        titulo: 'Estudar TanStack Query',
        descricao: 'Revisar useQuery, useMutation e invalidação de cache.',
        dataCriacao: new Date(agora).toISOString(),
      },
    ]
  }

  return globalComTarefas.__tarefasEmMemoria
}

export function listarTarefas(): Tarefa[] {
  return [...tarefas()].sort((a, b) =>
    b.dataCriacao.localeCompare(a.dataCriacao),
  )
}

export function obterTarefa(id: string): Tarefa | null {
  return tarefas().find((tarefa) => tarefa.id === id) ?? null
}

export function criarTarefa(dados: TarefaInput): Tarefa {
  const tarefa: Tarefa = {
    id: crypto.randomUUID(),
    titulo: dados.titulo,
    descricao: dados.descricao,
    dataCriacao: new Date().toISOString(),
  }

  tarefas().push(tarefa)

  return tarefa
}

export function atualizarTarefa(
  id: string,
  dados: TarefaInput,
): Tarefa | null {
  const tarefa = obterTarefa(id)

  if (!tarefa) {
    return null
  }

  tarefa.titulo = dados.titulo
  tarefa.descricao = dados.descricao

  return tarefa
}

export function excluirTarefa(id: string): boolean {
  const lista = tarefas()
  const indice = lista.findIndex((tarefa) => tarefa.id === id)

  if (indice === -1) {
    return false
  }

  lista.splice(indice, 1)

  return true
}

type Validacao =
  | { ok: true; dados: TarefaInput }
  | { ok: false; erro: string }

export function validarTarefa(valor: unknown): Validacao {
  if (typeof valor !== 'object' || valor === null) {
    return { ok: false, erro: 'Dados inválidos.' }
  }

  const { titulo, descricao } = valor as {
    titulo?: unknown
    descricao?: unknown
  }

  if (typeof titulo !== 'string' || titulo.trim() === '') {
    return { ok: false, erro: 'O título é obrigatório.' }
  }

  const tituloLimpo = titulo.trim()

  if (tituloLimpo.length > 120) {
    return { ok: false, erro: 'O título deve ter até 120 caracteres.' }
  }

  if (descricao !== undefined && typeof descricao !== 'string') {
    return { ok: false, erro: 'A descrição deve ser um texto.' }
  }

  const descricaoLimpa = typeof descricao === 'string' ? descricao.trim() : ''

  if (descricaoLimpa.length > 1000) {
    return { ok: false, erro: 'A descrição deve ter até 1000 caracteres.' }
  }

  return { ok: true, dados: { titulo: tituloLimpo, descricao: descricaoLimpa } }
}
