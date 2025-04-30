---
title: "HTTP Caching aka. Cache-Control"
date: 2025-03-31T15:30:34+02:00
draft: false
description: Learn how to implement proper HTTP caching strategies to dramatically improve website performance. Includes recommended settings for HTML, static assets, and images.
publishDate: 2025-04-30T23:32:06+02:00
menu: favorites
---

{{< toc >}}

A few weeks ago I migrated my blog away from Netlify to host it myself again.

That meant I have to configure HTTP caching by myself.
Proper HTTP caching can dramatically improve website performance and user experience, especially on small servers.
It is not that complicated but somehow I just couldn't get it in my head.
And as the best way to understand things is to explain them to others, here is my attempt.

HTTP caching is nothing new and has good documentation.
So this is mostly a summary and reference to myself.
If you want to dig deeper at the end I have listed all my sources I have used for this post.

> **tl;dr**
>
> After my research these are my recommended settings for static public content:
>
> - Main contennt like HTML pages, where URLs don't change: `no-cache`
> - Static assets (unique URLs on each change, fingerprint):  
>   `max-age=31536000, immutable`
> - Images, that change infrequently and are not critical: `max-age=604800`
> - Images that need to be updated frequently (depends on traffic and frequency):
>   `max-age=600, must-revalidate, stale-while-revalidate=300`

## What is HTTP Caching?

HTTP Caching, Web Cache, Proxy Cache, Browser Cache or just the Cache.
As we can see, this term is heavily loaded, and mostly refers to two technologies: HTTP Caching on the protocol level as defined in [RFC 9111](https://httpwg.org/specs/rfc9111.html) or caching content server side in RAM on the edge via applications like Varnish.

This post is about HTTP Caching (sometimes Web Cache) on the protocol level, which components like proxies and browsers partially implement. This is the most common cache mechanism which is easy to implement and has wide adoption.

The browser itself has multiple different Cache mechanisms, but the mechanism that handles the HTTP Cache is sometimes referred to as the Disk Cache (commonly known as just the "browser cache", which is misleading as there is no single browser cache).
For the curious, I recommend reading [A Tale of Four Caches](https://calendar.perfplanet.com/2016/a-tale-of-four-caches/) by Yoav Weiss, which explains the different cache mechanisms in the browser.

Important to understand is that the behavior of the HTTP Cache is controlled via different HTTP headers, mostly `Cache-Control`.
The final behavior is the result of the exchange of varying cache-related headers between the local client (Browser or even curl) and the remote (origin or proxy server).

## How Does HTTP Caching Work?

Modern browsers are pretty smart and always try to cache as many resources as possible. Even if you do not provide explicit cache headers.
In this case, the browser tries to heuristically cache resources.

Before we proceed, we have to understand the following concept: freshness.

A resource is considered fresh when certain conditions are met.
Fresh resources will be reused from the cache.
Stale resources must first be validated before being used.
This means the server has to be asked if the resource has changed.
If not, the resources will be marked as fresh again and reused.

### Heuristic Caching

This is the last resort if no information about the cache behavior is provided.
The client just looks at the `Last-Modified` header and assumes that resources that haven't changed recently won't change anytime soon, and caches it for maybe 10% of the time that the resource hasn't changed (this may vary by implementation).

For example, a resource that hasn't change for a year will be cache for about 36 days.
That's probably not what you want, and you should always provide a `Cache-Control` header.

### `Expires` Header

In HTTP/1.0 the `Expires` header was added and browsers use it to determine freshness, but the date format is difficult to parse and therefore, in HTTP/1.1 `Cache-Control` got added.

Some servers add the `Expires` header for compatibility, but `Cache-Control` always has priority.
The `Expires` header is deprecated, and you should not use it anymore.

### `Cache-Control` Header

The `Cache-Control` header has many directives and can be sent in the request and response.
Some directives are only available in one or the other.
Some directives work in both, but have different functions.

The most common directive is probably `max-age` ("successor" of the `Expires` header) and determines how long a response can be considered as fresh (like a TTL).
Let's consider our browser requesting a resource for the firs time, we may get a response like this.

```bash {lineNos=inline hl_lines=[4, 7,8,11]}
$ curl -I http://localhost/
HTTP/1.1 200 OK
Accept-Ranges: bytes
Cache-Control: max-age=3600
Content-Length: 18753
Content-Type: text/html; charset=utf-8
Etag: "d9cob51d320wegx"
Last-Modified: Mon, 21 Apr 2025 22:34:35 GMT
Server: Caddy
Vary: Accept-Encoding
Date: Tue, 29 Apr 2025 18:58:24 GMT
```

As we can see in lines 4 and 11, the response has a `max-age` of 3600 and was generated at 18:58:24 GMT.
So within the time frame of the date plus the seconds of `max-age` the response would be considered to be fresh.
A new request to the same resource within this time frame would just reuse the local cache.
A request after this point would first ask the server if the response is still valid before reusing it.

### Validation

The process of asking the server if a local resource is still up-to-date is called validation.
To validate a cached response, the client sends a conditional request to the same resource and provides the `If-Modified-Since` header with the current date and `If-None-Match` header with the ETag of the original response.

The server then uses these headers to determine if the resource has changed.
If both headers are provided, the ETag has precedence.
If the resource is the same or has not changed, the server simply answers with an `304 Not Modified` without sending the entire resource again.

```bash {lineNos=inline}
# Notice the quotes around the ETag, these have to be included in the header
$ curl -I -H 'If-None-Match: "d9cob51d320wegx"' http://localhost/
HTTP/1.1 304 Not Modified
Cache-Control: max-age=3600
Etag: "d9cob51d320wegx"
Server: Caddy
Vary: Accept-Encoding
Date: Tue, 29 Apr 2025 19:53:00 GMT

# Check current date against Last-Modified date
$ curl -I -H "If-Modified-Since: Tue, 29 Apr 2025 21:53:00 GMT" http://localhost/
HTTP/1.1 304 Not Modified
Cache-Control: max-age=3600
Etag: "d9cob51d320wegx"
Server: Caddy
Vary: Accept-Encoding
Date: Tue, 29 Apr 2025 19:53:59 GMT
```

The Browser now resets the `Date` and `Cache-Control` headers of the old response, which marks the resource as fresh again.

### More Useful Directives

First, there is `no-cache`, which against its name does not prevent caching and just instructs the browser to always ask the server if the resource is still valid before using the cache.

With `immutable` the browser never bothers to even send validation requests.
Only use this if the resource has a unique path like a fingerprint or version parameter in the URL.

`must-revalidate` forces the browser to validate the resource as soon as it becomes stale.
This can be useful for resources that always must be up-to-date, but be careful this will result in an 504 if the origin is unreachable.

There are many more directives, for a reference, I recommend having a look at [Cache-Control - Expert Guide to HTTP headers](https://http.dev/cache-control)
and [MDN Cache-Control](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control).

## How to Make the Best Use of HTTP Caching

Now that we know how HTTP Caching works, it leaves the question of how we can benefit from it.

This is probably needs to be a decision on a case by case bases, but for public resources `no-cache` is most likely a safe default.
This instructs the client to cache the resources but validate them every time.

For static resources like assets with good cache busting, you can use a high `max-age` and `immutable`.

For other content like images, it depends on your preference and use case, for most images you can probably safely use `max-age` time of a few days or weeks.

The perfect settings are something one has to experiment with.
But as usual, it is best to keep it simple and stick to reasonable values and trying them for some time before changing them or building super complex setups.

## Further Reading

- [A Tale of Four Caches](https://calendar.perfplanet.com/2016/a-tale-of-four-caches/): A fascinating view into the different browser cache mechanisms.
- [MDN HTTP Caching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching) and [HTTP Caching explained](https://http.dev/caching): Some general explanations of HTTP Caching.
- [Cache-Control for Civilians](https://csswizardry.com/2019/03/cache-control-for-civilians/): Easy to understand and simple everyday examples.
- [Caching Tutorial for Web Authors and Webmasters](https://www.mnot.net/cache_docs/): Comprehensive information about HTTP Caching and how to implement it, partly a bit dated, but still an interesting read.
- [Cache-Control - Expert Guide to HTTP headers](https://http.dev/cache-control) and [MDN Cache-Control](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control): Use as reference for `Cache-Control` directives.

{{% plug %}}
