import * as yup from 'yup';

export default (data, feeds) => {
  const urls = feeds.map(({ url }) => url);
  const schema = yup.string().url().notOneOf(urls);

  try {
    schema.validateSync(data);
    return null;
  } catch (e) {
    return e.message;
  }
};
