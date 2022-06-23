import i18n from 'i18next';
import * as yup from 'yup';
import _ from 'lodash';
import axios from 'axios';
import render from './view.js';
import ru from './locales/ru.js';
import parseRSS from './parser.js';
import { getPostState } from './processing.js';
import proxify from './proxy.js';
import runHandlers from './handlers.js';

export default () => {
  const defaultLanguage = 'ru';
  const updateInterval = 5000;

  const i18nInstance = i18n.createInstance();
  i18nInstance.init({
    lng: defaultLanguage,
    debug: true,
    resources: {
      ru,
    },
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

  const watchedState = render(elements, state, i18nInstance);

  runHandlers(watchedState, state, elements);

  const updatePosts = () => {
    const { feeds, posts } = state;
    const promises = feeds.map((feed) => axios.get(proxify(feed.url))
      .then((response) => {
        const data = parseRSS(response);
        const difference = _.differenceBy(data.posts, posts, 'link');
        if (difference) {
          const newPostState = getPostState(feed.id, difference);
          state.posts = [...posts, ...newPostState];
          watchedState.process = 'updating';
          watchedState.process = null;
        }
      }));
    Promise.all(promises)
      .then(() => setTimeout(updatePosts, updateInterval));
  };

  setTimeout(updatePosts, updateInterval);
};
