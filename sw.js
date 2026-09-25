---
layout: null
---
// Bump CACHE_NAME whenever this file's caching strategy changes; the activate
// handler deletes every cache that doesn't match, so old entries are purged.
var CACHE_NAME = "pixyll4";

var PRECACHE = [
  "{{ '/css/pixyll.css' | relative_url }}?{{ site.time | date: '%Y%m%d%H%M' }}",
  "{{ '/' | relative_url }}"
];

// Only these are worth keeping offline. Photos are deliberately excluded —
// the originals run to several megabytes each.
var CACHEABLE = [
  "{{ '/css/' | relative_url }}",
  "{{ '/js/' | relative_url }}",
  "https://fonts.googleapis.com",
  "https://fonts.gstatic.com"
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(function (cache) { return cache.addAll(PRECACHE); })
      // Take over immediately rather than waiting for every tab to close.
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (names) {
        return Promise.all(names.map(function (name) {
          if (name !== CACHE_NAME) { return caches.delete(name); }
        }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

function isCacheable(url) {
  for (var i = 0; i < CACHEABLE.length; i++) {
    var prefix = CACHEABLE[i];
    if (prefix.indexOf("http") === 0) {
      if (url.indexOf(prefix) === 0) { return true; }
    } else if (url.indexOf(self.location.origin + prefix) === 0) {
      return true;
    }
  }
  return false;
}

self.addEventListener("fetch", function (e) {
  var request = e.request;
  if (request.method !== "GET") { return; }

  // Pages go to the network first, so a deploy shows up on the very next load.
  // The cache is a fallback for when the network is unavailable, nothing more.
  if (request.mode === "navigate") {
    e.respondWith(
      fetch(request).catch(function () {
        return caches.match(request).then(function (cached) {
          return cached || caches.match("{{ '/' | relative_url }}");
        });
      })
    );
    return;
  }

  if (!isCacheable(request.url)) { return; }

  // Assets: serve the cached copy at once, then refresh it in the background.
  e.respondWith(
    caches.match(request).then(function (cached) {
      var network = fetch(request).then(function (response) {
        if (response && response.status === 200) {
          var copy = response.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(request, copy);
          });
        }
        return response;
      }).catch(function () {
        return cached;
      });

      return cached || network;
    })
  );
});
