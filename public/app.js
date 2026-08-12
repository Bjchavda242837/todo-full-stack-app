async function SignUp() {
  const username = document.getElementById("signup-username").value;
  const password = document.getElementById("signup-password").value;

  if (!username || !password) {
    console.log("please enter your cradencials");
    return;
  }
  const response = await axios.post("http://localhost:3000/signup", {
    username: username,
    password: password,
  });

  alert(response.data.Message);
  console.log(response);
}

async function SignIn() {
  const username = document.getElementById("signin-username").value;
  const password = document.getElementById("signin-password").value;

  if (!username || !password) {
    console.log("please enter your cradencials");
    return;
  }

  const response = await axios.post("http://localhost:3000/signin", {
    username: username,
    password: password,
  });

  localStorage.setItem("token", response.data.token);

  MEendpoint();

  alert(response.data.Massage);
}

async function MEendpoint() {
  try {
    const response = await axios.get("http://localhost:3000/me", {
      headers: {
        token: localStorage.getItem("token"),
      },
    });

    document.getElementById("userinfo").innerText = response.data.username;
    showDashboard();
    getTodos()
  } catch (error) {
    console.error(error);
  }
}

async function addTodo() {
  const title = document.getElementById("todo-input").value;
  const token = localStorage.getItem("token")

  console.log(token);
  


  if (!title) {
    console.log("please enter title");

  } else {
    try {
      const response = await axios.post(
      "http://localhost:3000/todo",
      { title: title },              // 👈 Arg 2: Body payload sent to req.body
      { headers: { token: token } }  // 👈 Arg 3: Config sent to req.headers
    );
      getTodos()
    } catch (error) {
      console.error("addtodo error " + error);
    }
  }
}

async function getTodos() {
  try {
    const response = await axios.get("http://localhost:3000/todos", {
      headers: {
        token: localStorage.getItem("token"),
      },
    });

    const todolist = response.data.todos

    const tododiv = document.getElementById('todo-list')
    tododiv.innerHTML = ""

    todolist.forEach(todo => {
      const li = document.createElement("li")
      li.textContent = todo.title
      tododiv.appendChild(li)
    });
    
  } catch (error) {
    console.error("Error fetching todos:", error);
  }
}

// Inside your app.js after successful signin/getTodos:
function showDashboard() {
  // Hide Auth forms
  document.getElementById("auth-section").style.display = "none";

  // Show TODO Dashboard
  document.getElementById("dashboard-section").style.display = "block";
}

function showAuth() {
  // On Logout
  document.getElementById("auth-section").style.display = "block";
  document.getElementById("dashboard-section").style.display = "none";
}
