import axios from "axios";
import { showAlert } from "./alerts";

export const signup = async function (name, email, password, passwordConfirm) {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/users/signup',
      data: {
        name,
        email,
        password,
        passwordConfirm
      }
    });

    if (res.data.status === 'success') {
      showAlert('success', "You have signed up successfully");
      window.setTimeout(() => {
        location.assign('/');
      }, 1000)
    }

  } catch (err) {
    showAlert('error', err.response.data.message);
  }
}