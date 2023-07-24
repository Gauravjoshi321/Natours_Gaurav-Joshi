import axios from "axios";
import { showAlert } from "./alerts";


/////////////////////////////////////////////////////////////////////////


export const udpateSettings = async function (data, type) {
  try {
    const url = type === 'Password' ?
      'http://127.0.0.1:3000/api/v1/users/updatePassword' :
      'http://127.0.0.1:3000/api/v1/users/updateMe'

    const res = await axios({
      method: 'PATCH',
      url,
      data
    })

    if (res.data.status === 'success') {
      showAlert('success', `User ${type} updated successfuly`);
      location.reload(true);
    }

  } catch (err) {
    showAlert('error', err.response.data.message)
  }
}


// export const changeUserData = async function (name, email) {
//   try {

//     const res = await axios({
//       method: 'PATCH',
//       url: 'http://127.0.0.1:3000/api/v1/users/updateMe',
//       data: {
//         name,
//         email
//       }
//     })

//     if (res.data.status === 'success') {
//       showAlert('success', 'User updated successfuly');
//     }

//   } catch (err) {
//     showAlert('error', err.response.data.message)
//   }
// }

// export const updatePassword = async function (passwordCurrent, password, passwordConfirm) {
//   try {
//     const res = await axios({
//       method: 'PATCH',
//       url: 'http://127.0.0.1:3000/api/v1/users/updatePassword',
//       data: {
//         passwordCurrent,
//         password,
//         passwordConfirm
//       }
//     })

//     if (res.data.status === 'success') showAlert('success', 'Password updated successfuly');

//   } catch (err) {
//     showAlert('error', err.response.data.message);
//   }
// }

