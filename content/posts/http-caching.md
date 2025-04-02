---
title: "HTTP Caching aka. Cache-Control"
date: 2025-03-31T15:30:34+02:00
draft: true
description:
publishDate:
---

{{< toc >}}

## tl;dr

after my research for a static html blog there are my recommendes settings:

- foo
- bar

a few days ago i migrated my blog aways from Netlfy to host it myself again.

that meant i hav o configure http caching by myself and even though it not that complicated i just ciould get it in my head. so what is the best way to understand thing by youself? if you explain it to others, so here we go.

HTTP caching is nothing new and very good documentes. So this is mostly a summary and reference to myself. If you want to dig deeper at the end i have listed all my [sources I have used for this post].

- what i http caching (loca lcient caching aka proxy/browser caching)
- how does caching work?
- how does legacy caching no cache control header work?
- how does cache control header work?
- settings for browser caching

same header for different things, can send from brwoser or any client and server

{{% plug %}}

## Sources

- <https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching>
- <https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control>
- <https://csswizardry.com/2019/03/cache-control-for-civilians/>
- <https://jakearchibald.com/2016/caching-best-practices/>
- <https://www.mnot.net/cache_docs/>
- <https://http.dev/caching>
- <https://http.dev/cache-control>
