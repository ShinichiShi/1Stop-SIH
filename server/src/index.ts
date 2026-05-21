import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), "../.env"), override: false });
import express, { Request, Response } from "express";
import { startServer, app } from "./util";
import cors from "cors";
import multer from "multer";

import {
  trackBus,
  getNearestBusStops,
  getNextStop,
  getBusesForStop,
  getCommonRoutes,
  getRoute,
  getAllStops,
  calcCrowdDensity,
  getAllActiveBuses,
  getBusStat
} from "./controller/busController";

import { addNewRoute, addNewStop } from "./controller/routeController";
import { rateLimiter } from "./middleware/rateLimiter";
import { openApiSpec } from "./docs/openapi";

// Multer Setup 
const tmpDir = "uploads";
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tmpDir);
  },
  filename: (req, file, cb) => {
    const ext = file.originalname.split(".").pop();
    cb(null, `${Date.now()}.${ext}`);
  },
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: Function) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Only image files allowed!"), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

// Middlewares
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(rateLimiter);

// Routes
app.get("/", (req: Request, res: Response) => res.redirect("/docs"));

app.get("/openapi.json", (req: Request, res: Response) => {
  res.json(openApiSpec);
});

app.get("/docs", (req: Request, res: Response) => {
  res.type("html").send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>1Stop API Docs</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist/swagger-ui.css" />
    <style>
      html, body {
        margin: 0;
        padding: 0;
      }
      #swagger-ui {
        max-width: 1200px;
        margin: 0 auto;
      }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-standalone-preset.js"></script>
    <script>
      window.onload = () => {
        window.ui = SwaggerUIBundle({
          url: '/openapi.json',
          dom_id: '#swagger-ui',
          deepLinking: true,
          presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
          layout: 'StandaloneLayout'
        });
      };
    </script>
  </body>
</html>`);
});

app.get("/test", (req: Request, res: Response) => res.json("server running"));

app.post("/getNearestBustops", getNearestBusStops);
app.post("/getBusesForStop", getBusesForStop);
app.post("/getCommonRoutes", getCommonRoutes);
app.post("/trackBus", trackBus);
app.post("/getNextStop", getNextStop);
app.post("/addNewRoute", addNewRoute);
app.post("/addNewStop", addNewStop);
app.post("/calcCrowdDensity", upload.single("image"), calcCrowdDensity);

app.get("/getRoute", getRoute);
app.get("/getAllStops", getAllStops);
app.get("/getAllActveBuses", getAllActiveBuses);
app.get("/getBusStats", getBusStat);

startServer();
