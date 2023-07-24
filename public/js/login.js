import axios from "axios";
import { showAlert } from "./alerts";

export const login = async function (email, password) {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/users/login',
      data: {
        email,
        password
      }
    });

    if (res.data.status === 'success') {
      showAlert('success', "Logged in successfuly");
      window.setTimeout(() => {
        location.assign('/');
      }, 1000)
    }

  } catch (err) {
    showAlert('error', err.response.data.message);
  }
}

export const logout = async function () {
  console.log("this is hiii from axios")
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://127.0.0.1:3000/api/v1/users/logout'
    })

    if (res.data.status === 'success') {
      showAlert('success', "Logged out successfuly");
      window.setTimeout(() => {
        location.reload(true);
        location.assign('/');
      }, 1000)
    }

  } catch (err) {
    showAlert('error', "Problem in logging out! Try again");
  }
}


