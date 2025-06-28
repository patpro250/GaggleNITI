const express = require("express");
const app = express();
const http = require("http");

const server = http.createServer(app);

server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;

app.set("trust proxy", 1);
require("./startup/logging")();
require("./startup/config")();
require("./startup/db")();
require("./startup/routes")(app);

require("./startup/jobs")();

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`App is running with Keep-Alive on http://localhost:${PORT}`);
});
