require("dotenv").config();

// libraries import
const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { z } = require("zod");

// import modules
const { auth } = require("./auth");
const { UserModel, TodoModel } = require("./db");

// instances
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

// define zod schema
const signupSchema = z.object({
  username: z.string().min(3).max(20),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number "),
});

const signinSchema = z.object({
  username: z.string(),
  password: z.string(),
});

//logger
function logger(req, res, next) {
  const requestmethod = req.method;
  console.log(requestmethod + "request came");
  next();
}

//signup
app.post("/signup", logger, async function (req, res) {
  // validate input
  const validation = signupSchema.safeParse(req.body);

  // validation check
  if (!validation.success) {
    return res.status(400).json({
      message: "validation failed",
      error: validation.error.issues.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      })),
    });
  }

  // validation response store in variables
  const username = validation.data.username;
  const password = validation.data.password;

  //password hashing with bcrypt
  const hashedpassword = await bcrypt.hash(password, 5);

  // save to db
  try {
    await UserModel.create({
      username: username,
      password: hashedpassword,
    });

    res.status(201).json({
      Message: "you have signup",
    });
  } catch (error) {
    console.error("mongo add user error: ", error);
    return res.status(500).json({
    message: "Failed to create user (username may already exist)",
    error: error.message,
  });
  }
});

//signin
app.post("/signin", logger, async function (req, res) {
  const validation = signinSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      message: "Invalid input",
      errors: validation.error.issues,
    });
  }

  const { username, password } = validation.data;

  try {
    // 1. Search by username ONLY
    const user = await UserModel.findOne({
      username: username,
    });

    // 2. Check if user exists
    if (!user) {
      return res.status(403).json({ message: "Invalid credentials" });
    }

    // 3. Compare plain password with stored bcrypt hash
    const iMatch = await bcrypt.compare(password, user.password);

    if (!iMatch) {
      return res.status(403).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        Id: user._id.toString(),
      },
      process.env.JWT_SECRET,
    );

    res.header("token", token);

    res.json({
      token: token,
      Massage: "You are signed in",
    });


  } catch (error) {
    console.error("mongo Error", error);
    return res.status(500).json({ message: "Internal server error" });
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

    res.json({
      todos: Todosdata,
    });
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
    return res.status(500).json({
    message: "Failed to create todo",
    error: error.message,
  });
  }
});

app.listen(3000);
