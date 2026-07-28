// Test unitario: el middleware validate() en si mismo, con req/res simulados
// (sin levantar Express ni un servidor real).
import Joi from 'joi';
import { type Request, type Response } from 'express';
import { validate, idParamSchema } from './validate';

function mockRes() {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('validate() middleware', () => {
  it('llama a next() cuando los datos son validos', async () => {
    const schema = Joi.object({ nombre: Joi.string().min(2).required() });
    const middleware = validate({ schema });
    const req = { body: { nombre: 'Bardo' } } as Request;
    const res = mockRes();
    const next = jest.fn();

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('responde 400 con el listado de errores cuando los datos son invalidos', async () => {
    const schema = Joi.object({ nombre: Joi.string().min(5).required() });
    const middleware = validate({ schema });
    const req = { body: { nombre: 'Ab' } } as Request;
    const res = mockRes();
    const next = jest.fn();

    await middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    const respuesta = (res.json as jest.Mock).mock.calls[0][0];
    expect(respuesta.errores.length).toBeGreaterThan(0);
  });

  it('con stripUnknown, saca del objeto los campos que el schema no pidio', async () => {
    const schema = Joi.object({ nombre: Joi.string().required() });
    const middleware = validate({ schema });
    const req = { body: { nombre: 'Bardo', campoTrampa: 'no deberia sobrevivir' } } as Request;
    const res = mockRes();
    const next = jest.fn();

    await middleware(req, res, next);

    expect(req.body).toEqual({ nombre: 'Bardo' });
  });

  it('idParamSchema (compartido entre rutas) rechaza un id no numerico', async () => {
    const middleware = validate({ schema: idParamSchema, ubicacion: 'params' });
    const req = { params: { id: 'no-es-un-numero' } } as unknown as Request;
    const res = mockRes();
    const next = jest.fn();

    await middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });
});
