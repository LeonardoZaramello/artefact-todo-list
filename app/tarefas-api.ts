export type Tarefa = {
  id: string
  titulo: string
  descricao: string
  dataCriacao: string
}

export type TarefaInput = Pick<Tarefa, 'titulo' | 'descricao'>

export const chaves = {
  tarefas: ['tarefas'] as const,
  tarefa: (id: string) => ['tarefa', id] as const,
}

async function requisitar<T>(url: string, init?: RequestInit): Promise<T> {
  const resposta = await fetch(url, {
    ...init,
    cache: 'no-store',
    ...(init?.body
      ? { headers: { 'Content-Type': 'application/json' } }
      : {}),
  })

  if (resposta.status === 204) {
    return undefined as T
  }

  const dados = await resposta.json().catch(() => null)

  if (!resposta.ok) {
    const mensagem =
      (dados as { erro?: string } | null)?.erro ??
      'Não foi possível concluir a operação.'
    throw new Error(mensagem)
  }

  return dados as T
}

export function listarTarefas(): Promise<Tarefa[]> {
  return requisitar<Tarefa[]>('/api/tarefas')
}

export async function obterTarefa(id: string): Promise<Tarefa | null> {
  const resposta = await fetch(`/api/tarefas/${encodeURIComponent(id)}`, {
    cache: 'no-store',
  })

  if (resposta.status === 404) {
    return null
  }

  if (!resposta.ok) {
    throw new Error('Não foi possível carregar a tarefa.')
  }

  return resposta.json()
}

export function criarTarefa(dados: TarefaInput): Promise<Tarefa> {
  return requisitar<Tarefa>('/api/tarefas', {
    method: 'POST',
    body: JSON.stringify(dados),
  })
}

export function atualizarTarefa(
  id: string,
  dados: TarefaInput,
): Promise<Tarefa> {
  return requisitar<Tarefa>(`/api/tarefas/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(dados),
  })
}

export function excluirTarefa(id: string): Promise<void> {
  return requisitar<void>(`/api/tarefas/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}

export function formatarData(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}
