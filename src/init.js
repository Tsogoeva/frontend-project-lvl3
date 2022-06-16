import i18n from 'i18next';
import * as yup from 'yup';
import onChange from 'on-change';
import _ from 'lodash';
import axios from 'axios';
import render from './view.js';
import resources from './locales/index.js';
import parseRSS from './parser.js';

const getProxy = (url) => {
  const proxy = new URL('/get', 'https://allorigins.hexlet.app');
  proxy.searchParams.set('url', url);
  proxy.searchParams.set('disableCache', 'true');
  return proxy.toString();
};

const validator = (link, feeds) => {
  const urls = feeds.map(({ url }) => url);
  return yup.string()
    .url()
    .notOneOf(urls)
    .validate(link);
};

export default () => {
  const defaultLanguage = 'ru';
  const i18nInstance = i18n.createInstance();
  i18nInstance.init({
    lng: defaultLanguage,
    debug: false,
    resources,
  }).then(() => {
    yup.setLocale({
      string: {
        url: () => ({ key: 'invalidURL' }),
      },
      mixed: {
        notOneOf: () => ({ key: 'rssAlreadyAdded' }),
      },
    });
  });

  const elements = {
    field: document.querySelector('#url-input'),
    form: document.querySelector('form'),
  };

  const state = onChange({
    currentURL: '',
    process: '', // receiving, received, update, fail, previewPost, readPost
    message: '',
    valid: null, // true, false
    errors: {},
    feeds: [
      { url: 'https://www.fontanka.ru/fontanka.rss', id: '1', postsId: '4' },
    ],
    posts: [],
  }, render(elements, i18nInstance));

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    state.currentURL = formData.get('url');

    validator(state.currentURL, state.feeds)
      .then(() => {
        state.feeds.push(state.currentURL);
        state.process = 'receiving';
        axios.get(getProxy(state.currentURL));
      })
      .then((response) => parseRSS(response));

    // console.log(state);

    /* if (!error) {
      state.feeds.unshift({ url: data, id: _.uniqueId() });
      state.valid = true;
      // console.log(state);
      form.reset();
      field.focus();
    } else {
      state.valid = false;
      state.errors = error;
      // console.log(state);
    } */
  });
};
