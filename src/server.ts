const express = require("express");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev, dir: "src" });
const handler = nextApp.getRequestHandler();

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

  app.use("/api", require("./api"));

  app.listen(app.get("port"), () => {
    console.log("[*] Server started on port " + app.get("port"));
  });
});
