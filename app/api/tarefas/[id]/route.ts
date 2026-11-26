import { NextResponse } from 'next/server'
import {
  atualizarTarefa,
  excluirTarefa,
  obterTarefa,
  validarTarefa,
} from '../dados'

type Contexto = {
  params: Promise<{ id: string }>
}

function naoEncontrada() {
  return NextResponse.json(
    { erro: 'Tarefa não encontrada.' },
    { status: 404 },
  )
}

export async function GET(_request: Request, { params }: Contexto) {
  const { id } = await params
  const tarefa = obterTarefa(id)

  if (!tarefa) {
    return naoEncontrada()
  }

  return NextResponse.json(tarefa)
}

export async function PUT(request: Request, { params }: Contexto) {
  const { id } = await params

  if (!obterTarefa(id)) {
    return naoEncontrada()
  }

  let corpo: unknown

  try {
    corpo = await request.json()
  } catch {
    return NextResponse.json(
      { erro: 'O corpo da requisição precisa ser um JSON válido.' },
      { status: 400 },
    )
  }

  const validacao = validarTarefa(corpo)

  if (!validacao.ok) {
    return NextResponse.json({ erro: validacao.erro }, { status: 400 })
  }

  const tarefa = atualizarTarefa(id, validacao.dados)

  if (!tarefa) {
    return naoEncontrada()
  }

  return NextResponse.json(tarefa)
}

export async function DELETE(_request: Request, { params }: Contexto) {
  const { id } = await params

  if (!excluirTarefa(id)) {
    return naoEncontrada()
  }

  return new Response(null, { status: 204 })
}
