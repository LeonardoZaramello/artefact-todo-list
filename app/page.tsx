'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { Suspense } from 'react'
import {
  chaves,
  excluirTarefa,
  formatarData,
  listarTarefas,
  type Tarefa,
} from './tarefas-api'

export default function Page() {
  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tarefas</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Crie, edite e acompanhe suas tarefas.
          </p>
        </div>
        <Link
          href="/tarefa"
          className="shrink-0 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Nova tarefa
        </Link>
      </div>

      <Suspense fallback={<Carregando texto="Carregando tarefas…" />}>
        <ListaDeTarefas />
      </Suspense>
    </div>
  )
}

function ListaDeTarefas() {
  const queryClient = useQueryClient()
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: chaves.tarefas,
    queryFn: listarTarefas,
  })

  const exclusao = useMutation({
    mutationFn: excluirTarefa,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: chaves.tarefas })
      const anteriores = queryClient.getQueryData<Tarefa[]>(chaves.tarefas)

      queryClient.setQueryData<Tarefa[]>(chaves.tarefas, (tarefasAtuais) =>
        tarefasAtuais?.filter((tarefa) => tarefa.id !== id),
      )

      return { anteriores }
    },
    onError: (_erro, _id, contexto) => {
      if (contexto?.anteriores) {
        queryClient.setQueryData(chaves.tarefas, contexto.anteriores)
      }
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: chaves.tarefas }),
  })

  if (isPending) {
    return <Carregando texto="Carregando tarefas…" />
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/60 dark:bg-red-950/40">
        <p className="text-sm font-medium text-red-700 dark:text-red-300">
          Não foi possível carregar as tarefas.
        </p>
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
          {error instanceof Error ? error.message : 'Tente novamente.'}
        </p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="mt-3 text-sm font-medium text-red-700 underline underline-offset-2 hover:no-underline dark:text-red-300"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  const tarefas = data ?? []

  function confirmarExclusao(tarefa: Tarefa) {
    if (window.confirm(`Excluir a tarefa "${tarefa.titulo}"?`)) {
      exclusao.mutate(tarefa.id)
    }
  }

  return (
    <div>
      {tarefas.length > 0 ? (
        <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-400">
          {`${tarefas.length} ${
            tarefas.length === 1 ? 'tarefa cadastrada' : 'tarefas cadastradas'
          }.`}
        </p>
      ) : null}

      {exclusao.isError ? (
        <p
          role="alert"
          className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
        >
          Não foi possível excluir a tarefa. Tente novamente.
        </p>
      ) : null}

      {tarefas.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-zinc-300 p-10 text-center dark:border-zinc-700">
          <p className="font-medium">Nenhuma tarefa por aqui</p>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Crie sua primeira tarefa para começar.
          </p>
          <Link
            href="/tarefa"
            className="mt-4 inline-flex rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Criar tarefa
          </Link>
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-zinc-200 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
          {tarefas.map((tarefa) => {
            const excluindo =
              exclusao.isPending && exclusao.variables === tarefa.id

            return (
              <li
                key={tarefa.id}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="min-w-0">
                  <Link
                    href={`/tarefa?id=${tarefa.id}`}
                    className="font-medium text-zinc-900 hover:underline dark:text-zinc-100"
                  >
                    {tarefa.titulo}
                  </Link>
                  {tarefa.descricao ? (
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                      {tarefa.descricao}
                    </p>
                  ) : null}
                  <p className="mt-2 text-xs text-zinc-500">
                    Criada em {formatarData(tarefa.dataCriacao)}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <Link
                    href={`/tarefa?id=${tarefa.id}`}
                    className="text-sm font-medium text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                  >
                    Editar
                  </Link>
                  <button
                    type="button"
                    onClick={() => confirmarExclusao(tarefa)}
                    disabled={excluindo}
                    className="text-sm font-medium text-red-600 transition hover:text-red-700 disabled:opacity-50 dark:text-red-400 dark:hover:text-red-300"
                  >
                    {excluindo ? 'Excluindo…' : 'Excluir'}
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function Carregando({ texto }: { texto: string }) {
  return (
    <p className="text-sm text-zinc-500 dark:text-zinc-400">{texto}</p>
  )
}
