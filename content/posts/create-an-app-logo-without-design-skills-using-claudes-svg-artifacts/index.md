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

My project was a GTK4/Adwaita application for the GNOME desktop.
To ensure design consistency, I turned to GNOME's Human Interface Guidelines (HIG), which outline how applications should look and behave, including specifications for [app icons](https://developer.gnome.org/hig/guidelines/app-icons.html).

I compiled all the HIG's restructured text files into a single document for Claude.
In retrospect, just the icon guidelines page would probably have been sufficient.
My initial prompt included the entire HIG along with details about my application's name and purpose.

{{< gallery "Result of the one-shot prompt. Not exactly what I had in mind." >}}
first-prompt.webp|Result of the one-shot prompt. Not exactly what I had in mind.
{{< /gallery >}}

Well, not really what I expected, but to be fair, I didn't give it much thought.
So let's iterate and give the AI more to work on. I had some sort of audio wave signal in mind.

{{< gallery "The second attempt." >}}
second-prompt.webp|The second attempt.
{{< /gallery >}}

More like it, but still kind of janky.
The vertical bars are too thin, not centered and I don't know about the random dotted circle.
Let's see what we can do about it.

Now, the third try did surprise me because it looked acceptable for the first time.

{{< gallery "The first acceptable result." >}}
third-prompt.webp|The first acceptable result.
{{< /gallery >}}

This design looked more like app icons I was already familiar with.
While the audio wave still looked odd, the overall direction was promising.
I experimented with various colors and icons, though most attempts were unsuccessful.
None of the versions were particularly good, but two stood out: one featuring an appealing gradient and another with better vertical bars.

{{< gallery "Some experiments." >}}
variant1.webp|Weird interpretation of an audio wave.
variant2.webp|Good vertical bars.
variant3.webp|Nice looking red gradient.
variant4.webp
variant5.webp
variant6.webp
{{< /gallery >}}

I could have tried to merge these two versions via AI, but it seemed easier to merge them by hand.
I just pasted the one with the nice gradient into an [SVG Viewer](https://www.svgviewer.dev/) and removed the old sound wave.
After that I copied the good vertical bars from the other version.

{{< gallery "Result of manually merging the two versions." >}}
clean-version.webp|Result of manually merging the two versions.
{{< /gallery >}}

After I only got the elements I liked, I just need to reorder them.
This would probably be easy to do manually in Inkscape, but I was curious if the AI would be able to complete this task.
To my surprise, it worked rather well.

{{< gallery "The AI created a waveform and centered it perfectly." >}}
centered-version.webp|The AI created a waveform and centered it perfectly.
{{< /gallery >}}

There was just one last thing that bothered me.
The 3D effect at the bottom was difficult to see.
So I asked the AI to make it thicker and darker and it worked flawlessly.

{{< gallery "Make the 3D effect at the bottom darker and thicker." >}}
rework-3d-effect.webp|Make the 3D effect at the bottom darker and thicker.
{{< /gallery >}}

Within a few minutes, I got an app logo that I am pretty happy with.
Sure, is it the best and most recognizable logo? No.
Also, no. Could they do it faster? Probably.
But for people like me, who work alone on our weekend project and don't have the necessary skill set, it may prevent some frustration.

**So what are my learnings for this project?**

- Keep it simple and small.
- Use existing design guidelines and examples as context.
- Do not expect the first version to be perfect.
- If the AI fails, do not be afraid to fix things manually.
- Do not waste your time trying to force the AI to create the perfect result.
- Use intermediate results as a new base/context.
