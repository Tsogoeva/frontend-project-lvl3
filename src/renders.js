const btnIdPrefix = 'btn_';
const aIdPrefix = 'a_';

const buildBlock = (text) => {
  const card = document.createElement('div');
  card.classList.add('card', 'border-0');

  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');

  const cardTitle = document.createElement('h2');
  cardTitle.classList.add('card-title', 'h4');
  cardTitle.textContent = text;

  cardBody.append(cardTitle);

  const listGroup = document.createElement('ul');
  listGroup.classList.add('list-group', 'border-0', 'rounded-0');

  card.append(cardBody, listGroup);

  return card;
};

const makeFeed = (feed) => {
  const listGroupItem = document.createElement('li');
  listGroupItem.classList.add('list-group-item', 'border-0', 'border-end-0');

  const itemTitle = document.createElement('h3');
  itemTitle.classList.add('h6', 'm-0');
  itemTitle.textContent = feed.title;

  const titleText = document.createElement('p');
  titleText.classList.add('m-0', 'small', 'text-black-50');
  titleText.textContent = feed.description;

  listGroupItem.append(itemTitle, titleText);

  return listGroupItem;
};

const makePost = (post, text) => {
  const listGroupItem = document.createElement('li');
  listGroupItem.classList.add(
    'list-group-item',
    'd-flex',
    'justify-content-between',
    'align-items-start',
    'border-0',
    'border-end-0',
  );

  const a = document.createElement('a');
  a.setAttribute('href', `${post.link}`);
  a.classList.add(post.visited ? 'fw-normal' : 'fw-bold');
  a.classList.add(post.visited ? 'link-secondary' : 'fw-bold');
  a.dataset.id = `${aIdPrefix}${post.id}`;
  a.setAttribute('target', '_blank');
  a.setAttribute('rel', 'noopener noreferrer');
  a.textContent = post.title;

  const button = document.createElement('button');
  button.setAttribute('type', 'button');
  button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
  button.dataset.id = `${btnIdPrefix}${post.id}`;
  button.dataset.bsToggle = 'modal';
  button.dataset.bsTarget = '#modal';
  button.textContent = text;

  listGroupItem.prepend(a, button);

  return listGroupItem;
};

export const renderModal = (post, elements) => {
  const {
    modalTitle,
    modalDescription,
    modalLink,
  } = elements;

  modalTitle.textContent = post.title;
  modalDescription.textContent = post.description;
  modalLink.href = post.link;
};

export const renderData = (state, elements, i18nInstance) => {
  const { containerFeed, containerPosts } = elements;
  containerFeed.innerHTML = '';
  containerPosts.innerHTML = '';

  const feedBlock = buildBlock(i18nInstance.t('feeds'));
  containerFeed.prepend(feedBlock);

  const feedList = feedBlock.querySelector('ul');
  const [currentFeed] = state.feeds.filter((feed) => state.currentFeedId === feed.id);
  const builtFeed = makeFeed(currentFeed);
  feedList.prepend(builtFeed);

  const postsBlock = buildBlock(i18nInstance.t('posts'));
  containerPosts.prepend(postsBlock);

  const postsList = postsBlock.querySelector('ul');
  const currentPosts = state.posts.filter((post) => state.currentFeedId === post.feedId);
  currentPosts.forEach((post) => {
    const builtPost = makePost(post, i18nInstance.t('buttons.view'));
    postsList.prepend(builtPost);
  });
};
