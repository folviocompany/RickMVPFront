import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import StatusBadge from './StatusBadge'

describe('StatusBadge', () => {
  it('mostra revisão para pedido pendente', () => {
    render(<StatusBadge status="REVISAO" />)
    expect(screen.getByText('Revisar')).toBeInTheDocument()
  })

  it('diferencia item não identificado', () => {
    render(<StatusBadge mapped={false} />)
    expect(screen.getByText('Não identificado')).toBeInTheDocument()
  })
})
