import { fireEvent, render, screen, within, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import PersonajeLista from './PersonajeLista';
import type { Personaje } from '../../interfaces';

afterEach(cleanup);
const propio: Personaje = { idPersonaje: 1, nombreFicticio: 'Propio', raza: 'Elfo', xp: 0, nivel: 1, dinero: 100, idClase: 1, idUsuarioJugador: 1, idPartida: 1 };
const ajeno: Personaje = { ...propio, idPersonaje: 2, nombreFicticio: 'Ajeno', idUsuarioJugador: 2 };

describe('acciones y teclado de personajes', () => {
  it('muestra acciones solo para personajes que se pueden gestionar', () => {
    const editar = vi.fn();
    render(<PersonajeLista personajes={[propio, ajeno]} clases={[]} onSeleccionar={vi.fn()} onEditar={editar} onEliminar={vi.fn()} puedeGestionar={p => p.idUsuarioJugador === 1} />);
    const propia = screen.getByRole('button', { name: /Propio/ });
    const otra = screen.getByRole('button', { name: /Ajeno/ });
    fireEvent.click(within(propia).getByRole('button', { name: 'Editar' }));
    expect(editar).toHaveBeenCalledWith(propio);
    expect(within(otra).queryByRole('button', { name: 'Editar' })).not.toBeInTheDocument();
    expect(within(otra).queryByRole('button', { name: 'Eliminar' })).not.toBeInTheDocument();
  });

  it.each(['Enter', ' '])('selecciona la tarjeta con %s', key => {
    const seleccionar = vi.fn();
    render(<PersonajeLista personajes={[propio]} clases={[]} onSeleccionar={seleccionar} personajeSeleccionadoId={1} />);
    const card = screen.getByRole('button', { name: /Propio/ });
    expect(card).toHaveAttribute('aria-pressed', 'true');
    fireEvent.keyDown(card, { key });
    expect(seleccionar).toHaveBeenCalledWith(propio);
  });

  it('no interpreta el teclado de un botón interno como selección de tarjeta', () => {
    const seleccionar = vi.fn();
    render(<PersonajeLista personajes={[propio]} clases={[]} onSeleccionar={seleccionar} onEditar={vi.fn()} />);
    fireEvent.keyDown(screen.getByRole('button', { name: 'Editar' }), { key: 'Enter' });
    expect(seleccionar).not.toHaveBeenCalled();
  });
});
