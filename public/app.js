async function SignUp() {
  const usernameInput = document.getElementById("signup-username");
  const passwordInput = document.getElementById("signup-password");

  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  if (!username || !password) {
    console.log("please enter your cradencials");
    return;
  }

  try {
    const response = await axios.post("http://localhost:3000/signup", {
      username: username,
      password: password,
    });

    alert(response.data.Message);

    usernameInput.value = "";
    passwordInput.value = "";
  } catch (error) {
    console.error("Signup error:", error);
    alert(error.response?.data?.message || "Signup failed");
  }
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

  MeEndpoint();

  alert(response.data.Massage);

  document.getElementById("signin-username").value = "";
document.getElementById("signin-password").value = "";

}

async function MeEndpoint() {
  try {
    const response = await axios.get("http://localhost:3000/me", {
      headers: {
        token: localStorage.getItem("token"),
      },
    });

    document.getElementById("userinfo").innerText = response.data.username;
    showDashboard();
    getTodos();
  } catch (error) {
    console.error(error);
  }
}

async function addTodo() {
  const title = document.getElementById("todo-input").value;
  const token = localStorage.getItem("token");

  if (!title) {
    console.log("please enter title");
  } else {
    try {
      const response = await axios.post(
        "http://localhost:3000/todo",
        { title: title },
        { headers: { token: token } },
      );
      getTodos();

      

    } catch (error) {
      console.error("addtodo error " + error);
    }
  }

  document.getElementById("todo-input").value = "";

  
}

async function getTodos() {
  try {
    const response = await axios.get("http://localhost:3000/todos", {
      headers: {
        token: localStorage.getItem("token"),
      },
    });

    const todolist = response.data.todos;

    const tododiv = document.getElementById("todo-list");
    tododiv.innerHTML = "";

    todolist.forEach((todo) => {
      const li = document.createElement("li");
      li.textContent = todo.title;
      tododiv.appendChild(li);
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
