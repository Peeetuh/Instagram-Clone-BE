const express = require("express");
const PORT = 4000;
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const { MONGODB_URL } = require("./config");

mongoose.connect(MONGODB_URL);

mongoose.connection.on("connected", () => {
  console.log("DB connected");
});

mongoose.connection.on("error", (error) => {
  console.log("Error connecting to DB");
});

require("./models/user_model");

app.use(cors());
app.use(express.json());

require("./models/user_model");
app.use(require("./routes/user_route"));

app.listen(PORT, () => {
  console.log("Server listening");
});
