import express, { Request, Response } from "express";
import next from "next";
import path from "path";
import * as api from "./api";
import { RepoResult, LanguageResult } from "./types";

const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev, dir: "src" });
const handler = nextApp.getRequestHandler();
require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
  silent: true
});

nextApp.prepare().then(() => {
  if (typeof process.env.CLIENT_ID === "undefined") {
    console.log("[*] Client ID not set.");
    return;
  }

  if (typeof process.env.CLIENT_SECRET === "undefined") {
    console.log("[*] Client secret not set.");
    return;
  }

  const app = express();
  app.set("port", process.env.PORT || 5000);
  app.get("*", (req: Request, res: Response) => {
    return handler(req, res);
  });

  app.get("/api/repo", (req: Request, res: Response) => {
    const repository = req.query.repository;
    if (!repository) {
      return res.json({
        success: false,
        message: "Invalid repository"
      });
    }

    api.calculateRepoStupidity(repository).then(
      (data: RepoResult) => {
        return res.json({
          success: true,
          data
        });
      },
      err => {
        return res.json({
          success: false,
          message: err.message
        });
      }
    );
  });

  app.get("/api/language", (req: Request, res: Response) => {
    const language = req.query.language;
    if (!language) {
      return res.json({
        success: false,
        message: "Invalid language"
      });
    }

    api.calculateLanguageStupidity(language).then(
      (data: LanguageResult) => {
        return res.json({
          success: true,
          data
        });
      },
      err => {
        if (err.message === "Invalid field.") {
          return res.json({
            success: false,
            message: "Invalid language"
          });
        }
        return res.json({
          success: false,
          message: err.message
        });
      }
    );
  });

  app.listen(app.get("port"), () => {
    console.log("[*] Server started on port " + app.get("port"));
  });
});
