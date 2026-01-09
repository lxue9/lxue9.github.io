const CACHE_NAME = 'steve-vocab-v1';

// 初始只缓存核心文件（外壳）
const PRE_CACHE = [
  './',
  './index.html',
  'https://cdn.tailwindcss.com'
  './music/correct.mp3'
  './music/wrong.mp3'
  './music/finish.mp3'
];

// 安装阶段
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRE_CACHE))
  );
});

// 激活阶段：清理旧缓存
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      })
    ))
  );
});

// 核心：拦截并自动缓存图片
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then(cachedResponse => {
      if (cachedResponse) return cachedResponse;

      return fetch(e.request).then(response => {
        // 如果请求的是图片（来自你的域名或 emoji 文件夹）
        if (e.request.url.includes('emoji/') || e.request.url.includes('.webp')) {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(e.request, response.clone()); // 边用边存
            return response;
          });
        }
        return response;
      });
    })
  );
});