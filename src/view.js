export default (elements, i18nInstance) => (path, value) => {
  //   console.log(input)
  //   console.log(path)
  if (path === 'valid') {
    // console.log(value)
    switch (value) {
      case false:
        elements.field.classList.add('is-invalid');
        break;
      case true:
        elements.field.classList.remove('is-invalid');
        break;
      default:
        break;
    }
  }
};
