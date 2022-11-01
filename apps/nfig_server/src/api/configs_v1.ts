import { Router, IRouter } from 'express';
import { Provider } from 'nfig-common';
import bodyParser from 'body-parser';

export type ConfigsV1FactoryOptions = {
  provider: Provider;
};

export const create = ({ provider }: ConfigsV1FactoryOptions): IRouter => {
  const router = Router();

  router.get('/', async (req, res, next) => {
    try {
      res.send(await provider.getAll());
    } catch (err) {
      return next(err);
    }
  });

  router.delete('/clear', async (req, res, next) => {
    try {
      await provider.clear();
      return res.sendStatus(200);
    } catch (err) {
      return next(err);
    }
  });

  /* Application-level endpoints */

  router.post('/:appName', bodyParser.json(), async (req, res, next) => {
    try {
      await provider.setAppConfig(req.params.appName, req.body);

      return res.sendStatus(201);
    } catch (err) {
      return next(err);
    }
  });

  router.get('/:appName', async (req, res, next) => {
    try {
      const config = await provider.getAppConfig(req.params.appName);

      if (typeof config === 'undefined') {
        return res.sendStatus(404);
      }

      return res.send(config);
    } catch (err) {
      return next(err);
    }
  });

  router.delete('/:appName', async (req, res, next) => {
    try {
      await provider.deleteAppConfig(req.params.appName);
      return res.sendStatus(200);
    } catch (err) {
      return next(err);
    }
  });

  /* Environment-level endpoints */
  router.post(
    '/:appName/:envName',
    bodyParser.json(),
    async (req, res, next) => {
      try {
        await provider.setEnvConfig(
          req.params.appName,
          req.params.envName,
          req.body,
        );

        return res.sendStatus(201);
      } catch (err) {
        return next(err);
      }
    },
  );

  router.get('/:appName/:envName', async (req, res, next) => {
    try {
      const config = await provider.getEnvConfig(
        req.params.appName,
        req.params.envName,
      );

      if (typeof config === 'undefined') {
        return res.sendStatus(404);
      }

      return res.send(config);
    } catch (err) {
      return next(err);
    }
  });

  router.delete('/:appName/:envName', async (req, res, next) => {
    try {
      await provider.deleteEnvConfig(req.params.appName, req.params.envName);
      return res.sendStatus(200);
    } catch (err) {
      return next(err);
    }
  });

  /* Configuration-level endpoints */
  router.post(
    '/:appName/:envName/:key',
    bodyParser.text(),
    async (req, res, next) => {
      try {
        await provider.setConfig(
          req.params.appName,
          req.params.envName,
          req.params.key,
          req.body,
        );

        return res.sendStatus(201);
      } catch (err) {
        return next(err);
      }
    },
  );

  router.get('/:appName/:envName/:key', async (req, res, next) => {
    try {
      const config = await provider.getConfig(
        req.params.appName,
        req.params.envName,
        req.params.key,
      );

      if (typeof config === 'undefined') {
        return res.sendStatus(404);
      }

      return res.header('content-type', 'text/plain').send(config);
    } catch (err) {
      return next(err);
    }
  });

  router.delete('/:appName/:envName/:key', async (req, res, next) => {
    try {
      await provider.deleteConfig(
        req.params.appName,
        req.params.envName,
        req.params.key,
      );
      return res.sendStatus(200);
    } catch (err) {
      return next(err);
    }
  });

  return router;
};
