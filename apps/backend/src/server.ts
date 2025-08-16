import { json, urlencoded } from "body-parser";
import express, { type Express } from "express";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import config from "./config";
import routes from "./routes";
import { errorHandler } from "./middlewares";
import { setupCompleteSwagger } from "./docs/swagger.config";

export const createServer = (): Express => {
  const app = express();
  
  app
    .disable("x-powered-by")
    .use(helmet()) // Security middleware
    .use(morgan("dev")) // Logging middleware
    .use(urlencoded({ extended: true }))
    .use(json())
    .use(cors())
    .get("/", (_, res) => {
      return res.json({ 
        message: "Government Appointment Booking System API", 
        status: "running",
        version: "1.0.0",
        timezone: config.timezone,
        documentation: "/api-docs"
      });
    });

  // Setup Complete Swagger documentation
  setupCompleteSwagger(app);

  app
    // API routes
    .use("/api", routes)
    // Error handling middleware (should be last)
    .use(errorHandler);

  return app;
};
