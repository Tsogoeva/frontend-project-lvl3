import * as yup from 'yup';
import { Modal } from 'bootstrap';
import axios from 'axios';
import parseRSS from './parser.js';
import { getFeedState, getPostState } from './processing.js';
import proxify from './proxy.js';

const validator = (link, feeds) => {
  const urls = feeds.map(({ url }) => url);
  return yup.string()
    .url()
    .notOneOf(urls)
    .validate(link);
};

export default (watchedState, state, elements) => {
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
    watchedState.process = 'receiving';

    validator(state.currentURL, state.feeds)
      .then(() => {
        axios.get(proxify(state.currentURL))
          .then((response) => {
            const data = parseRSS(response);
            const feedState = getFeedState(state, data.feed);
            state.currentFeedId = feedState.id;
            state.feeds.push(feedState);

            const postState = getPostState(state.currentFeedId, data.posts);
            state.posts = [...state.posts, ...postState];
            watchedState.process = 'received';
          })
          .catch((err) => {
            state.message = err.message === 'parseError'
              ? 'parseError'
              : 'networkError';
            watchedState.process = 'failed';
          });
      }).catch((error) => {
        const [{ key }] = error.errors;
        state.message = key;
        watchedState.process = 'failed';
      });
  };

  const handlerOpenPreview = (e) => {
    const btnIdPrefix = 'btn_';
    const aIdPrefix = 'a_';

    const currentId = e.target.dataset?.id;

    if (currentId && currentId.match(/btn_post_\d+$/)) {
      const postId = currentId.substring(btnIdPrefix.length, currentId.length);
      const currentPost = state.posts.filter(({ id }) => id === postId)[0];

      currentPost.visited = true;
      state.previewPost = currentPost;
      watchedState.process = 'updating';
      watchedState.process = 'preview';
      watchedState.process = null;

      modal.show();
    }
    if (currentId && currentId.match(/a_post_\d+$/)) {
      const postId = currentId.substring(aIdPrefix.length, currentId.length);
      const currentPost = state.posts.filter(({ id }) => id === postId)[0];

      currentPost.visited = true;
      watchedState.process = 'updating';
      watchedState.process = null;
    }
  };

  const handlerClosePreview = () => {
    modal.hide();
  };

  form.addEventListener('submit', handlerForm);
  postsContainer.addEventListener('click', handlerOpenPreview);
  modalClosingButtons.forEach((button) => {
    button.addEventListener('click', handlerClosePreview);
  });
};
