import axios from "axios";
import { showAlert } from "./alerts";

export const forgotPassword = async function (email) {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/users/forgotPassword',
      data: {
        email
      }
    });

    if (res.data.status === 'success') {
      showAlert('success', "reset password email sended to your mail");
      window.setTimeout(() => {
        location.assign('/');
      }, 5000)
    }

  } catch (err) {
    showAlert('error', err.response.data.message);
  }
}