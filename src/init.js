import i18n from 'i18next';
import onChange from 'on-change';
import _ from 'lodash';
import render from './view.js';
import validator from './validator.js';

export default () => {
  const defaultLanguage = 'ru';
  const i18nInstance = i18n.createInstance();
  i18nInstance.init({
    lng: defaultLanguage,
    debug: false,
    /* resources, */
  });

  const state = onChange({
    form: {
      valid: true,
      processState: 'filling',
      processError: null,
      errors: {},
    },
    feeds: [
      { url: 'https://www.fontanka.ru/fontanka.rss', id: '1', postsId: '4' },
    ],
  }, render);

  const field = document.querySelector('#url-input');
  const form = document.querySelector('form');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = formData.get('url');
    // console.log(data)

    const error = validator(data, state.feeds);
    // console.log(error);
    // console.log(state);

    if (!error) {
      state.feeds.unshift({ url: data, id: _.uniqueId() });
      state.form.valid = true;
      // console.log(state);
      form.reset();
      field.focus();
    } else {
      state.form.valid = false;
      state.form.errors = error;
      // console.log(state);
    }
  });
};
