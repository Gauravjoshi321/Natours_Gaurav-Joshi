const hideAlert = function () {
  const el = document.querySelector('.alert');
  if (el) el.parentElement.removeChild(el);
}

export const showAlert = function (type, message) {
  hideAlert();

  const markUp = `<div class="alert alert--${type}">${message}</div>`
  document.querySelector('body').insertAdjacentHTML('afterbegin', markUp);
  window.setTimeout(hideAlert, 5000);
}