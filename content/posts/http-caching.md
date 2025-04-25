---
title: "HTTP Caching aka. Cache-Control"
date: 2025-03-31T15:30:34+02:00
draft: true
description:
publishDate:
---

{{< toc >}}

## tl;dr

After my research these are my recommended settings for static content:

```plain
# foobar
```

## The Quest for Better Caching

A few weeks ago I migrated my blog away from Netlify to host it myself again.

That meant I have to configure HTTP caching by myself and even though it it not that complicated I just could not get it in my head.
And as the best way to understand things is to explain them to others, here is my attempt.

HTTP caching is nothing new and has good documentation.
So this is mostly a summary and reference to myself.
If you want to dig deeper at the end I have listed all my sources I have used for this post.

## What is HTTP Caching?

HTTP Caching, Web Cache, Proxy Cache, Browser Cache or just the Cache.
As we can see, this term is heavily loaded, and mostly refers to two technologies: HTTP Caching as defined in [RFC 9111](https://httpwg.org/specs/rfc9111.html) or caching content server side in RAM on the edge via applications like Varnish.

This post is about HTTP Caching (sometimes Web Cache) on the protocol level, which components like proxies and browsers partially implement.
The browser itself has multiple different Cache mechanisms, but the mechanism that handles the HTTP Cache is sometimes referred to as the Disk Cache (commonly known as just the browser cache, which is misleading as there is no single browser cache).
For the curious, I recommend reading [A Tale of Four Caches](https://calendar.perfplanet.com/2016/a-tale-of-four-caches/) by Yoav Weiss, which explains the different cache mechanisms in the browser.

Important to understand is that the behavior of the HTTP Cache is controlled via different HTTP headers, mostly `Cache-Control`.
The final behavior is the result of the exchange of varying cache-related headers between the local client (Browser or even curl) and the remote (origin or proxy server).

## How Does HTTP Caching Work?

- how does caching work?
- how does legacy caching no cache control header work?
- how does cache control header work?
- same header for different things, can send from brwoser or any client and server

## How to Make the Best Use of HTTP Caching

{{% plug %}}

## Sources

- [A Tale of Four Caches](https://calendar.perfplanet.com/2016/a-tale-of-four-caches/) by Yoav Weiss
- <https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching>
- <https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control>
- <https://csswizardry.com/2019/03/cache-control-for-civilians/>
- <https://jakearchibald.com/2016/caching-best-practices/>
- <https://www.mnot.net/cache_docs/>
- <https://http.dev/caching>
- <https://http.dev/cache-control>
