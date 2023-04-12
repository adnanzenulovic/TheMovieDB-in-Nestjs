const forms = document.querySelector('.forms'),
  pwShowHide = document.querySelectorAll('.eye-icon'),
  links = document.querySelectorAll('.link'),
  emailSignIn = document.getElementById('emailSignIn'),
  passwordSignIn = document.getElementById('passwordSignIn'),
  emailSignUp = document.getElementById('emailSignUp'),
  passwordSignUp1 = document.getElementById('passwordSignUp1'),
  passwordSignUp2 = document.getElementById('passwordSignUp2'),
  signInButton = document.getElementById('signInButton'),
  signUpButton = document.getElementById('signUpButton');

signInButton.addEventListener('click', signin);
signUpButton.addEventListener('click', signup);

async function signin() {
  // if (
  //   !validateEmail(emailSignIn.value) ||
  //   !validatePassword(passwordSignIn.value)
  // )
  //   return alert('Something is wrong..');
  // const body = {
  //   email: emailSignIn.value,
  //   password: passwordSignIn.value,
  // };

  const body = {
    email: 'ado@gmail.com',
    password: 'Stajeovo123',
  };

  let response = await fetch('http://localhost:3000/auth/signin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (response.status === 200) location.reload();
  if (response.status == 403) alert('Please Check your Credentials');
}

async function signup() {
  const email = emailSignUp.value,
    password1 = passwordSignUp1.value,
    password2 = passwordSignUp2.value;

  const body = {
    email: 'ado@gmail.com',
    password: 'Stajeovo123',
  };

  if (!validateEmail(email)) {
    return alert('Please enter a valid email address');
  }

  if (!validatePassword(password1)) {
    return alert('Password must be at least 8 characters long');
  }

  if (password1 !== password2) {
    return alert('Passwords do not match');
  }
  try {
    let response = await fetch('http://localhost:3000/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    // response = await response.json();
    if (response.status == 201) location.reload();
    if (response.status == 403) alert('Email already used!');
  } catch (error) {
    console.log({ error });
  }
}

pwShowHide.forEach((eyeIcon) => {
  eyeIcon.addEventListener('click', () => {
    let pwFields =
      eyeIcon.parentElement.parentElement.querySelectorAll('.password');

    pwFields.forEach((password) => {
      if (password.type === 'password') {
        password.type = 'text';
        eyeIcon.classList.replace('bx-hide', 'bx-show');
        return;
      }
      password.type = 'password';
      eyeIcon.classList.replace('bx-show', 'bx-hide');
    });
  });
});

links.forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault(); //preventing form submit
    forms.classList.toggle('show-signup');
  });
});

function validateEmail(email) {
  const regex = /\S+@\S+\.\S+/;
  return regex.test(email);
}
function validatePassword(password) {
  return password.length >= 8;
}
