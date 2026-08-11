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

  alert(response.data.Massage);
}


