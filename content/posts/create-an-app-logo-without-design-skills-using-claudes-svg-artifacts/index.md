---
title: Create an App Logo Without Design Skills Using Claude's SVG Artifacts
date: 2025-03-28T13:50:06+01:00
draft: true
description: foobar
publishDate: '2025-03-31T23:52:00+02:00'
---

I have created a good enough looking logo for my weekend project in minutes.
Without any design skills or expensive software using Claude's SVG artifact feature.

As an SRE/Platform engineer, I appreciate visually pleasing designs but lack both the skills to create them and the interest in learning design software.
So why not ask the mighty AI?

Claude's Artifacts can preview SVGs directly, a good tool for an iterative, exploratory approach.
Initially skeptical, I was pleasantly surprised by the results — more than adequate for my weekend project.

## Setting the Context

My project was a GTK4/Adwaita application for the GNOME desktop.
To ensure design consistency, I turned to GNOME's Human Interface Guidelines (HIG), which outline how applications should look and behave, including specifications for [app icons](https://developer.gnome.org/hig/guidelines/app-icons.html).

I compiled all the HIG's restructured text files into a single document for Claude.
In retrospect, just the icon guidelines page would probably have been sufficient.
My initial prompt included the entire HIG along with details about my application's name and purpose.

{{< gallery "Result of the one-shot prompt. Not exactly what I had in mind." >}}
first-prompt.webp|Result of the one-shot prompt. Not exactly what I had in mind.
{{< /gallery >}}

well, not really what i expect, but to be fair, I didnt know what to expect really.

This is the second learning, one shots are problably not what i want

So lets iterate and give the AI more to work on. I had some sort of audio wave
signal in mind so in my second prompt i gave the direction

{{< gallery "second prompt" >}}
second-prompt.webp|alttext
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

Now that i got the lement that i want, i just need to reorder them as i like. I
probably could have done thah manually in Inkscape, but i was curious if the AI
could do this to. And to my suprise i worked rather well. Center and like a wave
form.

{{< gallery "second prompt" >}}
centered-version.webp
{{< /gallery >}}

After using this version mir aufgefallen, that
the 3d effect at the bottom is hard to see. So i asked the ai to make it thicker and darker
and this worked flawlessly.

{{< gallery "second prompt" >}}
centered-version.webp|foo
{{< /gallery >}}

So what are the learnings for this?

- simple and small projects
- if yyuo got design docs/guideliens us them as context
- dont extepc one shots
- dont expect perfect/final version, dont be afraid to bastel manually
- do not hang up on lettgin the ai do it

- first learning, if you have design material, examples etc give it

For this looked good enoigh. Sure, is it the best and most recognizable logo? No

but for people like me, who work alone on our weekend project, how dont have the skill,
or will to learn to do this, this is afeasabvle approch.

In my specific case I needed a Logo for my GTK/adwaita application.

so i coudl vorstellen for someone who actallly knows they are doing this for
low to medium complex project this could speed up their work
or not ymmv

{{% plug %}}
