const express = require("express");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());
const JWT_SECRET = "bhaveshchavda";

const users = [];
const todos = [
  {
    id: 1,
    title: "buy milk",
    username: "bhavesh",
  },
];
const requestLog = [];
app.use(express.static("public"));

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
app.post("/signup", logger, function (req, res) {
  const username = req.body.username;
  const password = req.body.password;

  users.push({
    username: username,
    password: password,
  });

  res.status(201).json({
    Message: "you have signup",
  });
});

//signin
app.post("/signin", logger, function (req, res) {
  const username = req.body.username;
  const password = req.body.password;

  const founduser = users.find(
    (u) => u.username === username && u.password === password,
  );

  if (founduser) {
    try {
      const token = jwt.sign(
        {
          username: founduser.username,
        },
        JWT_SECRET,
      );

      res.header("token", token);

      res.json({
        token: token,
        Massage: "You are signed in",
      });
    } catch (error) {
      console.error(error);
    }
  } else {
    res.status(403).send({
      message: "Invalid Token",
    });
  }
});

//auth
function auth(req, res, next) {
  const token = req.headers.token;

  if (!token) {
    return res.status(401).send({
      message: "token is missing",
    });
  }

  const decodedToken = jwt.verify(token, JWT_SECRET);

  if (decodedToken.username) {
    req.username = decodedToken.username;
    next();
  } else {
    res.json({
      message: "you are not logged in",
    });
  }
}

//me
app.get("/me", logger, auth, function (req, res) {
  const currentUser = req.username;
  const foundUser = users.find((u) => u.username === currentUser);

  res.json({
    username: foundUser.username,
  });
});

//todos
app.get("/todos", logger, auth, function (req, res) {
  const currentuser = req.username;

  const usertodos = todos.filter((todo) => todo.username === currentuser);

  res.json({
    todos: usertodos,
  });
});

//todo
app.post("/todo", logger, auth, function (req, res) {
  const currentuser = req.username;
  // Accept either 'title' or 'todo' from body
  const title = req.body.title || req.body.todo;

  // 1. Input Validation
  if (!title) {
    return res.status(400).json({
      message: "Todo title is required",
    });
  }

  try {
    const todoObj = {
      id: Date.now(), // Safe unique ID using timestamp
      title: title,
      completed: false,
      username: currentuser,
    };

    todos.push(todoObj);

    // 2. Return 201 Created Status
    res.status(201).json({
      todoitem: todoObj,
    });
  } catch (error) {
    console.error("Error creating todo:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
});

app.listen(3000);
