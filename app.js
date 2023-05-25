const path = require('path');
const express = require("express");
require("express-async-errors");
const cors = require("cors");
const morgan = require("morgan");
const {errorHandler} = require("./middlewares/error");
const userRouter = require("./routes/user");
const actorRouter = require("./routes/actor");
const movieRouter = require("./routes/movie");
const adminRouter = require("./routes/admin");
const {handleNotFound} = require("./utils/helpers");
require("dotenv").config();
require("./db");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(morgan("dev"));
app.use("/api/user", userRouter);
app.use("/api/actor", actorRouter);
app.use("/api/movie", movieRouter);
app.use("/api/admin", adminRouter);
app.use("/*", handleNotFound);
app.use(errorHandler);

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log("The port is listening to port 8000");
});