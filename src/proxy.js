export default (url) => {
  const proxy = new URL('https://allorigins.hexlet.app/get');
  proxy.searchParams.set('disableCache', 'true');
  proxy.searchParams.set('url', url);
  return proxy.toString();
};
