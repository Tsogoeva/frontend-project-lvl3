import i18n from 'i18next';
import * as yup from 'yup';
import render from './view.js';
import ru from './locales/ru.js';
import { eventHandlers } from './handlers.js';
import { updatePosts } from './updating.js';

export default () => {
  const defaultLanguage = 'ru';

  const i18nInstance = i18n.createInstance();
  i18nInstance.init({
    lng: defaultLanguage,
    debug: false,
    resources: {
      ru,
    },
  }).then(() => {
    yup.setLocale({
      string: {
        url: 'URL is invalid',
      },
      mixed: {
        notOneOf: 'RSS already added',
      },
    });
  });

  const elements = {
    field: document.querySelector('#url-input'),
    form: document.querySelector('form'),
    submit: document.querySelector('[type="submit"]'),
    feedback: document.querySelector('.feedback'),
    feedContainer: document.querySelector('.feeds'),
    postsContainer: document.querySelector('.posts'),

    modal: document.querySelector('#modal'),
    modalTitle: document.body.querySelector('.modal-title'),
    modalDescription: document.body.querySelector('.modal-body'),
    modalLink: document.body.querySelector('.modal-footer > a'),
    modalClosingButtons: document.querySelectorAll('[data-bs-dismiss="modal"]'),
  };

  const state = {
    process: null, // receiving, received, updating, failed, preview
    message: '',
    currentURL: '',
    currentFeedId: 0,
    previewPost: '',
    feeds: [],
    posts: [],
  };

  const view = render(elements, state, i18nInstance);

  eventHandlers(view, state, elements);
  updatePosts(view, state);
};
