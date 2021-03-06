export default (response) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(response.data.contents, 'text/xml');

  const parserError = doc.querySelector('parsererror');
  if (parserError) {
    const error = new Error();
    error.isParserError = true;
    throw error;
  }

  const title = doc.querySelector('title').textContent;
  const description = doc.querySelector('description').textContent;
  const feed = {
    title,
    description,
  };

  const posts = [...doc.querySelectorAll('item')]
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
