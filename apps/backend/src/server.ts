import { json, urlencoded } from "body-parser";
import express, { type Express } from "express";
import morgan from "morgan";
import cors from "cors";

export const createServer = (): Express => {
  const app = express();
  app
    .disable("x-powered-by")
    .use(morgan("dev"))
    .use(urlencoded({ extended: true }))
    .use(json())
    .use(cors())
    .get("/", (_, res) => {
      return res.json({ message: "Backend server up", status: "running" });
    })
    .get("/api/health", (_, res) => {
      return res.json({ status: "ok", service: "OneDesk API" });
    })
    .get("/api/message/:name", (req, res) => {
      return res.json({ message: `Hello ${req.params.name} from OneDesk!` });
    });

  return app;
};
