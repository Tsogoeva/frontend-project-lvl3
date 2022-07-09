import onChange from 'on-change';

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
  a.classList.add('fw-bold');
  a.dataset.id = `a_${post.id}`;
  a.setAttribute('target', '_blank');
  a.setAttribute('rel', 'noopener noreferrer');
  a.textContent = post.title;

  const button = document.createElement('button');
  button.setAttribute('type', 'button');
  button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
  button.dataset.id = `btn_${post.id}`;
  button.dataset.bsToggle = 'modal';
  button.dataset.bsTarget = '#modal';
  button.textContent = text;

  listGroupItem.prepend(a, button);

  return listGroupItem;
};

const renderVisitedPost = (posts, elements) => {
  const { postsContainer } = elements;

  Array.from(posts).forEach(({ id }) => {
    const currentPost = postsContainer.querySelector(`[data-id="a_${id}"]`);
    currentPost.classList.remove('fw-bold');
    currentPost.classList.add('fw-normal', 'link-secondary');
  });
};

const renderModal = (post, elements) => {
  const {
    modalTitle,
    modalDescription,
    modalLink,
  } = elements;

  modalTitle.textContent = post.title;
  modalDescription.textContent = post.description;
  modalLink.href = post.link;
};

const renderData = (state, elements, i18nInstance) => {
  const { feedContainer, postsContainer } = elements;

  feedContainer.innerHTML = '';
  postsContainer.innerHTML = '';

  const feedBlock = buildBlock(i18nInstance.t('feeds'));
  feedContainer.prepend(feedBlock);

  const feedList = feedContainer.querySelector('ul');
  state.feeds.forEach((feed) => {
    const builtFeed = makeFeed(feed);
    feedList.prepend(builtFeed);
  });

  const postsBlock = buildBlock(i18nInstance.t('posts'));
  postsContainer.prepend(postsBlock);

  const postsList = postsContainer.querySelector('ul');
  state.posts.forEach((post) => {
    const builtPost = makePost(post, i18nInstance.t('buttons.view'));
    postsList.append(builtPost);
  });
};

export default (elements, state, i18nInstance) => onChange(state, (_path, value) => {
  const {
    feedback,
    field,
    form,
    submit,
  } = elements;

  switch (value) {
    case 'receiving':
      submit.setAttribute('disabled', '');
      field.setAttribute('readonly', '');
      feedback.textContent = i18nInstance.t('loading');
      feedback.classList.remove('text-danger');
      feedback.classList.remove('text-success');
      break;

    case 'failed':
      submit.removeAttribute('disabled');
      field.removeAttribute('readonly');
      field.classList.add('is-invalid');
      feedback.textContent = i18nInstance.t(`errors.${state.message}`);
      feedback.classList.remove('text-success');
      feedback.classList.add('text-danger');
      break;

    case 'received':
      submit.removeAttribute('disabled');
      field.removeAttribute('readonly');
      field.classList.remove('is-invalid');
      feedback.textContent = i18nInstance.t('success');
      feedback.classList.remove('text-danger');
      feedback.classList.add('text-success');
      form.reset();
      field.focus();
      renderData(state, elements, i18nInstance);
      break;

    case 'updating':
      if (state.message === 'networkError') {
        field.classList.remove('is-invalid');
        feedback.textContent = i18nInstance.t('success');
        feedback.classList.remove('text-danger');
        feedback.classList.add('text-success');
      }
      renderData(state, elements, i18nInstance);
      renderVisitedPost(state.visitedPosts, elements);
      break;

    case 'visited post':
      renderVisitedPost(state.visitedPosts, elements);
      break;

    case 'preview':
      renderModal(state.previewPost, elements);
      break;

    case null:
      break;

    default:
      throw new Error(`Unknown process: ${value}`);
  }
});
