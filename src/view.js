export default (path, value) => {
  const input = document.querySelector('#url-input');
  //   console.log(input)
  //   console.log(path)
  if (path === 'form.valid') {
    // console.log(value)
    switch (value) {
      case false:
        input.classList.add('is-invalid');
        break;
      case true:
        input.classList.remove('is-invalid');
        break;
      default:
        break;
    }
  }
};
