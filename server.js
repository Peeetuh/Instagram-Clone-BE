const express = require("express");
const PORT = process.env.PORT || 4000;
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { MONGODB_URL } = require("./config");

global.__basedir = __dirname;
mongoose.connect(MONGODB_URL);

mongoose.connection.on("connected", () => {
  console.log("DB connected");
});

mongoose.connection.on("error", (error) => {
  console.log("Error connecting to DB");
});

require("./models/user_model");
require("./models/post_model");

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());


app.get("/", (req, res) => res.type('html').send("Home page accessed"));
app.use(require("./routes/user_route"));
app.use(require("./routes/post_route"));
app.use(require("./routes/file_route"));


app.listen(PORT, () => {
  console.log("Server listening");
});
