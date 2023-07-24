import "@babel/polyfill";

import { displayMap } from './mapBox';
import { login, logout } from './login';
import { udpateSettings } from './updateSettings';
import { signup } from "./signup";
import { forgotPassword } from "./forgotPassword";
import { bookTour } from "./stripe";


///////////////////////////////////////////////////////

const mapBox = document.getElementById('map');
const signupForm = document.querySelector('.form--signup');
const loginForm = document.querySelector('.form--login');
const logoutBtn = document.querySelector('.nav__el--logout');
const userUpdateForm = document.querySelector('.form-user-data');
const passwordUpdateForm = document.querySelector('.form-user-settings');
const forgotPasswordForm = document.querySelector('.forgotPassword-form');
const bookTourButton = document.getElementById('book-tour');

// Display maps in tours
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

if (signupForm) {
  signupForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const name = document.getElementById('nameSignup').value;
    const email = document.getElementById('emailSignup').value;
    const password = document.getElementById('passwordSignup').value;
    const passwordConfirm = document.getElementById('passwordConfirmSignup').value;

    signup(name, email, password, passwordConfirm);

    document.getElementById('nameSignup').value = null;
    document.getElementById('emailSignup').value = null;
    document.getElementById('passwordSignup').value = null;
    document.getElementById('passwordConfirmSignup').value = null;
  })
}

// Extract values from the login form
if (loginForm) {
  loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    await login(email, password);

    document.getElementById('email').value = null;
    document.getElementById('password').value = null;
  })
}

if (logoutBtn) logoutBtn.addEventListener('click', logout);

if (userUpdateForm) {
  userUpdateForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const form = new FormData();

    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);

    udpateSettings(form, 'data');
  })
}


if (passwordUpdateForm) {
  passwordUpdateForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    document.querySelector('.password--save__btn').textContent = 'Updating...';

    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;


    await udpateSettings({ passwordCurrent, password, passwordConfirm }, 'Password');

    document.querySelector('.password--save__btn').textContent = 'save password';

    document.getElementById('password-current').value = null;
    document.getElementById('password').value = null;
    document.getElementById('password-confirm').value = null;
  })
}

if (forgotPasswordForm) {
  forgotPasswordForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const email = document.getElementById('forgotPasswordForm').value;

    forgotPassword(email);

    document.getElementById('forgotPasswordForm').value = null;
  })
}

if (bookTourButton) {
  bookTourButton.addEventListener('click', function (e) {
    bookTourButton.textContent = 'Processing...';
    const tourId = e.target.dataset.tourId;

    bookTour(tourId);
  })
}