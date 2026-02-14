import helmet from "helmet";

export const helmetConfig = (app) => {
  app.use(helmet());

  app.use(helmet.noCache());

};
