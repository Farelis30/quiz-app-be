const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const questionsRouter = require("./router/questions/index.js");
const userRouter = require("./router/users/index.js");
const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(cors());
app.use("/image", express.static("image"));
app.use(userRouter);
app.use(questionsRouter);
app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
