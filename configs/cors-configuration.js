import cors from "cors";

export const corsConfig = (app) => {
  const options = {
    origin: "*",
    methods: "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    allowedHeaders: "Origin,X-Requested-With,Content-Type,Accept,Authorization"
  };

  app.use(cors(options));

  app.options("*", cors(options));
};
