---
title: Create an App Logo Without Design Skills Using Claude's SVG Artifacts
date: 2025-03-28T13:50:06+01:00
draft: false
description: foobar
publishDate: '2025-03-31T23:52:00+02:00'
---

I have created a good-enough looking logo for my week end project in minutes
without any design skills or expensive software using Claude's SVG artifact
feature.

I am a SRE/Platform engineer nad I like visual pleasing designs, but I got
absolutely zero skill or feeling to create such designs by myself and to be hostes
i am not really keen in invest the time to learn it-

so I though why not ask mighty AI? First my hopes where not htat hi, but in the
end the result where good enough fit, atleast for my projects.

Turns out, Claudes Artifacts can geneerate and preview svg directly and kinda
work for iterative and explorative approach without learning Inkascape or how svg
works (which is kind of a downside, a´but a compromise that worjed for me in themmoment)

So how to approach this task? As we want to prompt the AI we need to construct the
correct context for the Ai lets think about waht we want to achive. In my case,
I want A GTK4/Adwaita Aplpication for the GNOME Desktop.

luckily the gnome Ecosystem provide the Human interface guidelines which explain
how thinkgs should look and behavio in the Gnome Aplication. It also says a bit about
[app icons](https://developer.gnome.org/hig/guidelines/app-icons.html).

first learning, if you have design material, examples etc give it

So i concatrunates all the restctructed text files of the HIG into one single
big file (im nachinhein, the icon page would probably been enough)

So my first promt was just the entire HIG a little context about my application,
what it does and how it  was called.

{{< gallery "Result of the one-shot prompt" >}}
first-prompt.webp Result of the one-shot prompt
{{< /gallery >}}

well, not really what i expect, but to be fair, I didnt know what to expect really.

This is the second learning, one shots are problably not what i want

So lets iterate and give the AI more to work on. I had some sort of audio wave
signal in mind so in my second prompt i gave the direction

{{< gallery "second prompt" >}}
second-prompt.webp alttext
{{< /gallery >}}

more like it but still kinda janky. The striche are very think, not centered and
i dont know what the dott  circle should be.

Now the third try kinda suprise, because it looks acceptale for the first time.

{{< gallery "second prompt" >}}
third-prompt.webp
{{< /gallery >}}

This was more familiar with some app icons that already exsist. The audio wave
was still janky, but the direction was right. I played some more around with
colors and icons, mostly unsuccessful. None of the version were perfect, but
hrere were two there were interesting. one with a nice gradient the other with
vertical vsrs.

{{< gallery "second prompt" >}}
variant1.webp
variant2.webp
variant3.webp
variant4.webp
variant5.webp
variant6.webp
{{< /gallery >}}

I could have tried to merge these two versions but it was easiewr to mergen by hand.
i just pasted the one with the nice gradient itono an [svg viewer](https://www.svgviewer.dev/)
and removed the "sound wave", copy the bars frome the other version and clean it a bit up.

{{< gallery "second prompt" >}}
clean-version.webp
{{< /gallery >}}

In my specific case I needed a Logo for my GTK/adwaita application.

so i coudl vorstellen for someone who actallly knows they are doing this for
low to medium complex project this could speed up their work
or not ymmv

{{% plug %}}
