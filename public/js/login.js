import axios from "axios";
import { showAlert } from "./alerts";

export const login = async function (email, password) {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
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
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout'
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


