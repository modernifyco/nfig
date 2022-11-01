import { Router, IRouter } from 'express';

export type HealthFactoryOptions = {};

export const create = (): IRouter => {
  const router = Router();

  router.get('/', (req, res) => res.status(200).send({ ok: true }));

  return router;
};
