// Один головний домен: www.oleksweb.com і oleks-web.pages.dev → oleksweb.com (301).
// Прев'ю-деплої (*.oleks-web.pages.dev) не чіпаємо.
const MAIN = 'oleksweb.com';
const ALIASES = ['www.oleksweb.com', 'oleks-web.pages.dev'];

export async function onRequest({ request, next }) {
  const url = new URL(request.url);
  if (ALIASES.includes(url.hostname)) {
    url.hostname = MAIN;
    return Response.redirect(url.toString(), 301);
  }
  return next();
}
