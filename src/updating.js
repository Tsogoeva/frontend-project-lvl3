import axios from 'axios';
import _ from 'lodash';
import { errorHandler } from './handlers.js';
import parseRSS from './parser.js';
import { getPostState } from './processing.js';
import proxify from './proxy.js';

export const updateInterval = 5000;

export const updatePosts = (view, state) => {
  const promises = state.feeds.map((feed) => axios.get(proxify(feed.url))
    .then((response) => {
      const parseData = parseRSS(response);
      const difference = _.differenceBy(parseData.posts, state.posts, 'link');
      if (difference) {
        const newPostState = getPostState(feed.id, difference);
        state.posts = [...newPostState, ...state.posts];
        view.process = 'updating';
        view.process = null;
      }
    }));
  Promise
    .all(promises)
    .catch((error) => {
      errorHandler(error.message, state);
      view.process = 'failed';
      view.process = null;
    })
    .finally(() => setTimeout(() => updatePosts(view, state), updateInterval));
};
