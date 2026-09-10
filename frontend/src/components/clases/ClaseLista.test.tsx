import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ClaseLista from './ClaseLista';

const clase = { idClase: 1, nombreClase: 'Explorador', descripcionClase: 'Exploración' };

describe('ClaseLista: teclado', () => {
  it.each(['Enter', ' '])('selecciona con %s y expone la selección', key => {
    const seleccionar = vi.fn();
    render(<ClaseLista clases={[clase]} claseSeleccionadaId={1} onSeleccionar={seleccionar} />);
    const card = screen.getByRole('button', { name: /Explorador/ });
    expect(card).toHaveAttribute('aria-pressed', 'true');
    fireEvent.keyDown(card, { key });
    expect(seleccionar).toHaveBeenCalledExactlyOnceWith(clase);
  });

  it('el teclado de una acción interna no selecciona la tarjeta', () => {
    const seleccionar = vi.fn();
    render(<ClaseLista clases={[clase]} onSeleccionar={seleccionar} onEditar={vi.fn()} />);
    fireEvent.keyDown(screen.getByRole('button', { name: 'Editar' }), { key: 'Enter' });
    expect(seleccionar).not.toHaveBeenCalled();
  });

  it('sin selección no ofrece un botón ficticio', () => {
    render(<ClaseLista clases={[clase]} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
