import i18n from 'i18next';
import axios from 'axios';
import { Modal } from 'bootstrap';
import * as yup from 'yup';
import _ from 'lodash';
import render from './view.js';
import parseRSS from './parser.js';
import ru from './locales/ru.js';

const proxify = (url) => {
  const proxy = new URL('https://allorigins.hexlet.app/get');
  proxy.searchParams.set('disableCache', 'true');
  proxy.searchParams.set('url', url);
  return proxy.toString();
};

const validator = (link, feeds) => {
  const urls = feeds.map(({ url }) => url);
  return yup.string()
    .url()
    .notOneOf(urls)
    .validate(link);
};

const errorHandler = (error, state) => {
  switch (true) {
    case (error.isAxiosError):
      state.message = 'networkError';
      break;
    case (error.isParserError):
      state.message = 'parseError';
      break;
    case (error instanceof yup.ValidationError):
      state.message = error.message;
      break;
    default:
      state.message = 'unknownError';
      break;
  }
};

const getFeedState = (state, feed) => ({
  title: feed.title,
  description: feed.description,
  id: _.uniqueId('feed_'),
  url: state.currentURL,
});

const getPostState = (feedId, posts) => posts.map((post) => ({
  title: post.title,
  description: post.description,
  link: post.link,
  id: _.uniqueId('post_'),
  feedId,
}));

const eventHandlers = (view, state, elements) => {
  const modal = new Modal(elements.modal);

  const {
    form,
    postsContainer,
    modalClosingButtons,
  } = elements;

  const handlerForm = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    state.currentURL = formData.get('url');
    view.process = 'receiving';

    validator(state.currentURL, state.feeds)
      .then(() => axios.get(proxify(state.currentURL)))
      .then((response) => {
        const data = parseRSS(response);
        const feedState = getFeedState(state, data.feed);
        state.currentFeedId = feedState.id;
        state.feeds.push(feedState);

        const postState = getPostState(state.currentFeedId, data.posts);
        state.posts = [...state.posts, ...postState];
        view.process = 'received';
      })
      .catch((error) => {
        errorHandler(error, state);
        view.process = 'failed';
        view.process = null;
      });
  };

  const handlerVisitedPosts = (e) => {
    const currentId = e.target.dataset?.id;

    const getPostId = (prefix, targetId) => {
      const postId = targetId.substring(prefix.length, targetId.length);
      const post = state.posts.find(({ id }) => id === postId);

      state.visitedPosts.add(post);
      view.process = 'visited post';

      return post;
    };

    const btnIdPrefix = 'btn_';
    const aIdPrefix = 'a_';

    if (currentId && currentId.match(/btn_post_\d+$/)) {
      const currentPost = getPostId(btnIdPrefix, currentId);
      state.previewPost = currentPost;
      view.process = 'preview';
      modal.show();
    }

    if (currentId && currentId.match(/a_post_\d+$/)) {
      getPostId(aIdPrefix, currentId);
    }
  };

  const handlerClosePreview = () => {
    modal.hide();
  };

  form.addEventListener('submit', handlerForm);
  postsContainer.addEventListener('click', handlerVisitedPosts);
  modalClosingButtons.forEach((button) => {
    button.addEventListener('click', handlerClosePreview);
  });
};

const updatePosts = (view, state) => {
  const updateInterval = 5000;

  const promises = state.feeds.map((feed) => axios.get(proxify(feed.url))
    .then((response) => {
      const parseData = parseRSS(response);
      const difference = _.differenceBy(parseData.posts, state.posts, 'link');
      if (difference) {
        const newPostState = getPostState(feed.id, difference);
        state.posts = [...newPostState, ...state.posts];
        view.process = 'updating';
      }
    }));
  Promise
    .all(promises)
    .catch((error) => {
      errorHandler(error, state);
      view.process = 'failed';
      view.process = null;
    })
    .finally(() => setTimeout(() => updatePosts(view, state), updateInterval));
};

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
        url: 'invalidURL',
      },
      mixed: {
        notOneOf: 'rssExist',
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
    process: null, // receiving, received, updating, failed, preview, visited post
    message: '',
    currentURL: '',
    currentFeedId: 0,
    visitedPosts: new Set(),
    previewPost: '',
    feeds: [],
    posts: [],
  };

  const view = render(elements, state, i18nInstance);

  eventHandlers(view, state, elements);
  updatePosts(view, state);
};
