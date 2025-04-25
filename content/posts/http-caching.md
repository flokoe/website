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

- what i http caching (loca lcient caching aka proxy/browser caching)
- same header for different things, can send from brwoser or any client and server

## How Does HTTP Caching Work?

- how does caching work?
- how does legacy caching no cache control header work?
- how does cache control header work?

## How to Make the Best Use of HTTP Caching

{{% plug %}}

## Sources

- <https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching>
- <https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control>
- <https://csswizardry.com/2019/03/cache-control-for-civilians/>
- <https://jakearchibald.com/2016/caching-best-practices/>
- <https://www.mnot.net/cache_docs/>
- <https://http.dev/caching>
- <https://http.dev/cache-control>
