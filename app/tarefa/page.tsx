'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState, type FormEvent } from 'react'
import {
  atualizarTarefa,
  chaves,
  criarTarefa,
  formatarData,
  obterTarefa,
  type Tarefa,
  type TarefaInput,
} from '../tarefas-api'

export default function Page() {
  return (
    <Suspense fallback={<Carregando texto="Carregando…" />}>
      <TelaDeTarefa />
    </Suspense>
  )
}

function TelaDeTarefa() {
  const id = useSearchParams().get('id')

  return id ? <CarregarTarefa id={id} /> : <Formulario />
}

function CarregarTarefa({ id }: { id: string }) {
  const { data: tarefa, isPending, isError, refetch } = useQuery({
    queryKey: chaves.tarefa(id),
    queryFn: () => obterTarefa(id),
  })

  if (isPending) {
    return <Carregando texto="Carregando tarefa…" />
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/60 dark:bg-red-950/40">
        <p className="text-sm font-medium text-red-700 dark:text-red-300">
          Não foi possível carregar a tarefa.
        </p>
        <div className="mt-3 flex items-center gap-4">
          <button
            type="button"
            onClick={() => void refetch()}
            className="text-sm font-medium text-red-700 underline underline-offset-2 hover:no-underline dark:text-red-300"
          >
            Tentar novamente
          </button>
          <Link
            href="/"
            className="text-sm font-medium text-red-700 underline underline-offset-2 hover:no-underline dark:text-red-300"
          >
            Voltar
          </Link>
        </div>
      </div>
    )
  }

  if (!tarefa) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <p className="font-medium">Tarefa não encontrada</p>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Ela pode ter sido excluída ou o link está incorreto.
        </p>
        <Link
          href="/"
          className="mt-4 inline-flex rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Voltar para a lista
        </Link>
      </div>
    )
  }

  return <Formulario key={tarefa.id} tarefa={tarefa} />
}

function Formulario({ tarefa }: { tarefa?: Tarefa }) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [titulo, setTitulo] = useState(tarefa?.titulo ?? '')
  const [descricao, setDescricao] = useState(tarefa?.descricao ?? '')
  const [erroTitulo, setErroTitulo] = useState('')

  const salvar = useMutation({
    mutationFn: (dados: TarefaInput) =>
      tarefa ? atualizarTarefa(tarefa.id, dados) : criarTarefa(dados),
    onSuccess: (tarefaSalva) => {
      queryClient.setQueryData(chaves.tarefa(tarefaSalva.id), tarefaSalva)
      queryClient.setQueryData<Tarefa[]>(chaves.tarefas, (tarefasAtuais) => {
        if (!tarefasAtuais) {
          return [tarefaSalva]
        }

        return tarefa
          ? tarefasAtuais.map((item) =>
              item.id === tarefaSalva.id ? tarefaSalva : item,
            )
          : [tarefaSalva, ...tarefasAtuais]
      })
      void queryClient.invalidateQueries({ queryKey: chaves.tarefas })
      router.push('/')
    },
  })

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()

    if (!titulo.trim()) {
      setErroTitulo('Informe o título da tarefa.')
      return
    }

    setErroTitulo('')
    salvar.mutate({ titulo: titulo.trim(), descricao: descricao.trim() })
  }

  const classeInput =
    'mt-1.5 w-full rounded-lg border bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:ring-2 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500'

  return (
    <div>
      <Link
        href="/"
        className="text-sm text-zinc-500 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        ← Voltar para a lista
      </Link>

      <h1 className="mt-4 text-2xl font-semibold tracking-tight">
        {tarefa ? 'Editar tarefa' : 'Nova tarefa'}
      </h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        {tarefa
          ? 'Atualize as informações da tarefa.'
          : 'Preencha os dados para criar uma nova tarefa.'}
      </p>

      <form
        onSubmit={enviar}
        noValidate
        className="mt-6 space-y-5 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6 dark:border-zinc-800 dark:bg-zinc-900"
      >
        <div>
          <label htmlFor="titulo" className="block text-sm font-medium">
            Título <span className="text-red-600 dark:text-red-400">*</span>
          </label>
          <input
            id="titulo"
            value={titulo}
            onChange={(evento) => {
              setTitulo(evento.target.value)
              if (erroTitulo) setErroTitulo('')
            }}
            maxLength={120}
            autoFocus
            placeholder="Ex.: Revisar o relatório mensal"
            aria-invalid={Boolean(erroTitulo)}
            aria-describedby={erroTitulo ? 'titulo-erro' : undefined}
            className={`${classeInput} ${
              erroTitulo
                ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10 dark:border-red-800'
                : 'border-zinc-300 focus:border-zinc-900 focus:ring-zinc-900/10 dark:border-zinc-700 dark:focus:border-zinc-300 dark:focus:ring-zinc-100/10'
            }`}
          />
          {erroTitulo ? (
            <p
              id="titulo-erro"
              role="alert"
              className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400"
            >
              {erroTitulo}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="descricao" className="block text-sm font-medium">
            Descrição{' '}
            <span className="font-normal text-zinc-500">(opcional)</span>
          </label>
          <textarea
            id="descricao"
            value={descricao}
            onChange={(evento) => setDescricao(evento.target.value)}
            maxLength={1000}
            rows={4}
            placeholder="Detalhes adicionais sobre a tarefa."
            className={`${classeInput} resize-y border-zinc-300 focus:border-zinc-900 focus:ring-zinc-900/10 dark:border-zinc-700 dark:focus:border-zinc-300 dark:focus:ring-zinc-100/10`}
          />
        </div>

        {salvar.isError ? (
          <p
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
          >
            {salvar.error instanceof Error
              ? salvar.error.message
              : 'Não foi possível salvar a tarefa.'}
          </p>
        ) : null}

        {tarefa ? (
          <p className="text-xs text-zinc-500">
            Criada em {formatarData(tarefa.dataCriacao)}
          </p>
        ) : null}

        <div className="flex items-center justify-end gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <Link
            href="/"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={salvar.isPending}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            {salvar.isPending
              ? 'Salvando…'
              : tarefa
                ? 'Salvar alterações'
                : 'Criar tarefa'}
          </button>
        </div>
      </form>
    </div>
  )
}

function Carregando({ texto }: { texto: string }) {
  return (
    <p className="text-sm text-zinc-500 dark:text-zinc-400">{texto}</p>
  )
}
