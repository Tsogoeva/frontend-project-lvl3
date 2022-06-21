import i18n from 'i18next';
import * as yup from 'yup';
// import onChange from 'on-change';
// import _ from 'lodash';
import axios from 'axios';
import render from './view.js';
import resources from './locales/index.js';
import parseRSS from './parser.js';
import { getFeedState, getPostState } from './processing.js';
import getProxy from './proxyOfURL.js';
import updatePosts from './updater.js';

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
    debug: true,
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
    feedback: document.querySelector('.feedback'),
    containerFeed: document.querySelector('.feeds'),
    containerPosts: document.querySelector('.posts'),
  };

  // https://www.fontanka.ru/fontanka.rss

  const state = {
    currentURL: '',
    currentFeedId: 0,
    process: '', // receiving, received, update, failed, previewPost, readPost
    message: '',
    // valid: null, // true, false
    errors: {},
    feeds: [],
    posts: [],
  };

  const watchedState = render(elements, state, i18nInstance);

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    state.currentURL = formData.get('url');

    validator(state.currentURL, state.feeds)
      .then(() => {
      // state.feeds.push(state.currentURL);
      // watchedState.process = 'receiving';
      // state.valid = true;
        axios.get(getProxy(state.currentURL))
          .then((response) => {
            const data = parseRSS(response);
            const feedState = getFeedState(state, data.feed);
            state.currentFeedId = feedState.id;
            state.feeds.push(feedState);

            const postState = getPostState(state.currentFeedId, data.posts);
            state.posts = state.posts.concat(postState);

            watchedState.process = 'received';
            // console.log(state);
          })
          .catch((err) => {
            state.message = err;
            state.process = 'failed';
            // console.log(state);
          });
      }).catch((error) => {
        const [{ key }] = error.errors;
        state.message = key;
        // state.valid = false;
        watchedState.process = 'failed';
      });
  });
  setTimeout(() => updatePosts(state), 5000);
};
