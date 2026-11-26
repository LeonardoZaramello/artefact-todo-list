import { NextResponse } from 'next/server'
import { criarTarefa, listarTarefas, validarTarefa } from './dados'

export async function GET() {
  return NextResponse.json(listarTarefas())
}

export async function POST(request: Request) {
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

  return NextResponse.json(criarTarefa(validacao.dados), { status: 201 })
}
