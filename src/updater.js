import axios from 'axios';
import _ from 'lodash';
import getProxy from './proxyOfURL.js';
import parseRSS from './parser.js';
import { getPostState } from './processing.js';

export default (state) => {
// console.log('GGGGGGGGGGG');
  const { feeds, posts } = state;
  const promises = feeds.map((feed) => axios.get(getProxy(feed.url))
    .then((response) => {
      const data = parseRSS(response);
      const difference = _.differenceBy(data.posts, posts, 'link');
      if (difference) {
        const newPostState = getPostState(feed.id, difference);
        state.posts.concat(newPostState);
      }
    }));
  Promise.all(promises);
};
