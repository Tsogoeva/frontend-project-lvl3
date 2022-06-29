import axios from 'axios';
import _ from 'lodash';
import parseRSS from './parser.js';
import { getFeedState, getPostState } from './processing.js';
import proxify from './proxy.js';

// const updating = (view, state) => {
const updateInterval = 5000;

const updateRequest = (view, state, link) => axios
  .get(link)
  .then((response) => {
    const data = parseRSS(response);
    const feedState = getFeedState(state, data.feed);
    state.currentFeedId = feedState.id;
    state.feeds.push(feedState);

    const postState = getPostState(state.currentFeedId, data.posts);
    state.posts = [...state.posts, ...postState];
    view.process = 'received';
  })
  .finally(() => setTimeout(() => updateRequest(link), updateInterval))
  .catch(() => {});

const updatePosts = (view, state) => {
  const promises = state.feeds.map((feed) => axios.get(proxify(feed.url))
    .then((response) => {
      const data = parseRSS(response);
      const difference = _.differenceBy(data.posts, state.posts, 'link');
      if (difference) {
        const newPostState = getPostState(feed.id, difference);
        state.posts = [...newPostState, ...state.posts];
        view.process = 'updating';
        view.process = null;
      }
    }));
  Promise
    .all(promises)
    .finally(() => setTimeout(updatePosts, updateInterval));
};

export default { updateInterval, updateRequest, updatePosts };
