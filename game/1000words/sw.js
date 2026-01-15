const CACHE_NAME = 'steve-vocab-v4';

// 1. 只放你确定路径正确的本地文件
const PRE_CACHE = [
  './',
  './index.html',
  'https://fastly.jsdelivr.net/npm/@babel/standalone@7.23.0/babel.min.js',
  './music/correct.mp3',
  './music/wrong.mp3',
  './music/finish.mp3',
  './music/star.mp3'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // 使用 map 逐个添加，防止其中一个失败导致全部失败
      return Promise.allSettled(
        PRE_CACHE.map(url => cache.add(url))
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  // 跳过外部 CDN (如 tailwind)，只拦截同源资源或特定图片
  if (event.request.url.includes('tailwindcss.com')) return;

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((fetchResponse) => {
        // 动态缓存图片
        if (fetchResponse.ok && event.request.url.includes('.webp')) {
          const responseClone = fetchResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
        }
        return fetchResponse;
      }).catch(() => {
        // 离线备选
        return response; 
      });
    })
  );
});

