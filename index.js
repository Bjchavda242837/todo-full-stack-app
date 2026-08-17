require("dotenv").config();

const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const { auth } = require("./auth");
const { UserModel, TodoModel } = require("./db");

const app = express();
app.use(express.json());
app.use(express.static("public"));

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("connected to mongoDB atlas successfully! 🍃");
  })
  .catch((error) => {
    console.error("failed to connect to MongoDB: ", error);
  });

// In-memory Variables
const users = [];
const todos = [
  {
    id: 1,
    title: "buy milk",
    username: "bhavesh",
  },
];
const requestLog = [];

//logger
function logger(req, res, next) {
  const requestmethod = req.method;
  requestLog.push({
    requestmethod: requestmethod,
  });
  console.log(requestmethod + "request came");
  next();
}

//signup
app.post("/signup", logger, async function (req, res) {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(401).json({
      message: "add creadicials",
    });
  }

  try {
    await UserModel.create({
      username: username,
      password: password,
    });

    res.status(201).json({
      Message: "you have signup",
    });
  } catch (error) {
    console.error("mongo add user error: ", error);
  }
});

//signin
app.post("/signin", logger, async function (req, res) {
  const username = req.body.username;
  const password = req.body.password;

  try {
    const response = await UserModel.findOne({
      username: username,
      password: password,
    });

    if (response) {
      const token = jwt.sign(
        {
          Id: response._id.toString(),
        },
        process.env.JWT_SECRET,
      );

      res.header("token", token);

      res.json({
        token: token,
        Massage: "You are signed in",
      });
    } else {
      res.status(403).send({
        message: "Invalid Token",
      });
    }
  } catch (error) {
    console.error("mongo Error", error);
  }
});

//me
app.get("/me", logger, auth, async function (req, res) {
  try {
    const Id = req.userId;

    const user = await UserModel.findById(Id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      username: user.username,
    });
  } catch (error) {
    console.error("Error in /me: ", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

//todos
app.get("/todos", logger, auth, async function (req, res) {
  const userId = req.userId;

  try {
    const Todosdata = await TodoModel.find({
      userId,
    });

    if (!Todosdata) {
      return res.status(401).json({
        message: "error in get todos",
      });
    }

    console.log(Todosdata);

    res.json({
      todos: Todosdata
    })
  } catch (error) {
    res.status(401).json({
      message: "didnt fetch todos mongo error",
    });
  }
});

//todo
app.post("/todo", logger, auth, async function (req, res) {
  const userId = req.userId;
  const title = req.body.title;

  // 1. Input Validation
  if (!title) {
    return res.status(400).json({
      message: "Todo title is required",
    });
  }

  try {
    await TodoModel.create({
      userId,
      title,
      done: false,
    });

    res.status(201).json({
      message: "todo is created",
    });
  } catch (error) {
    console.error("todo add Error: ", error);
  }
});

app.listen(3000);
