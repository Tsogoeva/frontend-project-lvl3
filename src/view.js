export default (state, (path, value) => {
    const input = document.querySelector('.form-control');
    if (path === 'state.form')
    switch (value) {
        case 'false':
        input.classList.add('is-invalid');
        break;
        default:
            break;
    }
});
