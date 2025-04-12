const express = require("express");
const app = express();

require("./startup/logging")();
require("./startup/config")();
require("./startup/db")();
require("./startup/routes")(app);
// require("./startup/jobs")();

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`App is running on http://localhost:${PORT}`);
});
