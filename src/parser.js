export default (response) => {
  const parser = new DOMParser();
  const data = parser.parseFromString(response.data.contents, 'text/xml');

  const title = data.querySelector('title').textContent;
  const description = data.querySelector('description').textContent;
  const feed = { title, description };

  const posts = [...data.querySelectorAll('item')]
    .map((item) => {
      const postTitle = item.querySelector('title').textContent;
      const postDescription = item.querySelector('description').textContent;
      const postLink = item.querySelector('link').textContent;
      return {
        title: postTitle,
        description: postDescription,
        link: postLink,
      };
    });

  return { feed, posts };
};
