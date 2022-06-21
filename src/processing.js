import _ from 'lodash';

export const getFeedState = (state, feed) => ({
  title: feed.title,
  description: feed.description,
  id: _.uniqueId('feed_'),
  url: state.currentURL,
});

export const getPostState = (feedId, posts) => posts.map((post) => ({
  title: post.title,
  description: post.description,
  link: post.link,
  id: _.uniqueId('post_'),
  feedId,
}));
