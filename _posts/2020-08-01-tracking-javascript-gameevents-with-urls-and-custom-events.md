---
layout: post
title: Tracking JavaScript Game Events with URLs and Custom Events
---

![Image of URL Analytics from Plausible.io](/images/plausible.png){:.center-item}


One underrated thing about making games for the web is how many options you have for tracking traffic and in-game events. Probably the most commonly used option is [Google Analytics](https://analytics.google.com/analytics/web/#/), which has the advantage of being free and allowing both URL tracking and [sending custom events](https://developers.google.com/analytics/devguides/collection/analyticsjs/sending-hits).

However, there are a few downsides of Google Analytics (GA), one major one being that GA collects a lot of data on your players, perhaps [more than you intend to collect](https://www.fastcompany.com/90300072/its-time-to-ditch-google-analytics). Mainly for that reason, when choosing a service to do event tracking for [Matt Fantasy VI](https://mattfantasy.com), I decided to go with [Plausible.io](https://www.plausible.io), which is a much simpler, more privacy focused alternative to GA. While Plausible is not free (after a trial), I felt it was worth giving a shot.

[Plausible's tutorial](https://docs.plausible.io/plausible-script) goes over the basics of getting started with tracking, but the main thing I want to get across is that I have two ways of tracking how someone is progressing in my game:

- URLs
- Custom events

Re: URLs: In [Matt Fantasy](https://www.mattfantasy.com), menus and levels each have their own path (e.g. the first level is https://www.mattfantasy.com/minetown), which will be tracked automatically by Plausible (as you’d expect by any website analytics service).

Re: custom events: To know that people are reaching a specific point in the game, I wanted to fire off events to Plausible after various in-game events occur (e.g. when the first cinematic ends, the first battle ends, etc.). Fortunately, [custom events like this are possible in Plausible](https://docs.plausible.io/custom-event-goals/), if not quite as automatic to set up as URL paths. Now that I’ve got a few custom events created, I was able to create some goals in Plausible:

![Image of Custom Events Analytics from Plausible.io](/images/plausible2.png){:.center-item}

The only downside is that Plausible shows me how low my game traffic is right now... maybe a topic for another day.

To round it out: Tracking game events on the web is pretty straight forward, especially if you take advantage of analytics services automatically tracking changes in URL paths. [Google Analytics](https://analytics.google.com/analytics/web/#/) is probably the most robust free service available, but player privacy may be a concern. After doing some research for [Matt Fantasy VI](https://www.mattfantasy.com), I ended up going with [Plausible](https://www.plausible.io).

