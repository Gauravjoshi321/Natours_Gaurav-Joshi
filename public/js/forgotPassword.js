import axios from "axios";
import { showAlert } from "./alerts";

export const forgotPassword = async function (email) {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/forgotPassword',
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