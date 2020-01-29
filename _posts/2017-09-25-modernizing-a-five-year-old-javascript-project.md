---
layout: post
title: Modernizing a Five-Year-Old JavaScript Project
---

![GIF of the Green Button Grapher app](/images/green-button-grapher.gif)

Languishing on my GitHub account is a five-year-old JavaScript app called ["Green Button Grapher"](https://github.com/mtmckenna/green-button-grapher) that parses and charts [Green Button Data](http://www.greenbuttondata.org/) (power usage data that utility companies provide to consumers as XML files via their websites).

Over the last half-decade, I've received a few emails about the Grapher, most of which I shamefully ignored because I was afraid to dive back into that old, impossible-to-understand code. After all, the code was written in the waning moments of the jQuery Spaghetti Code Era or at least before I knew how to implement decent JavaScript design patterns.

And then one day I received a pull request to the repo. This pull request spurred me to modernize the code so I could support the app for the small number of people using it.

## The Goal

The goal of this rewrite was to apply what I've learned about building sustainable JS apps to the Green Button Grapher so it could be modified and extended. To do something like this, I would normally reach for [Ember](https://emberjs.com/) and take advantage of the way the framework handles so much of the bothersome boilerplate and [bike-shedding](https://en.wikipedia.org/wiki/Law_of_triviality) typical in JavaScript development. However, I also wanted to get a bit more experience with [React](https://facebook.github.io/react/)/[create-react-app](https://github.com/facebookincubator/create-react-app) not only to better understand non-Ember ecosystems but also to see if the React ecosystem has addressed the things I found cumbersome about it a couple years ago. For that reason, I decided to try create-react-app for this project.

## What It Was

The Green Button Grapher was built in what felt like the last possible instant when JS development was both ugly and simple: code wasn't usually transpiled, [modules were super complicated](https://gist.github.com/branneman/558ef3a37ffd58ea004e00db5b201677
), and dependency management mostly involved throwing the latest version of jQuery in a `lib` folder. So the Grapher had a lot of cruft. Here are some lowlights:

- There was a global `app` variable, which---at the time---was considered a best practice to not pollute the global namespace. People are more into modules nowadays.
- All the code lived in a 624-line `app.js` file. I either didn't know how or didn't care to split this enormous file into smaller ones, which certainly made `app.js` intimidating to look at five years later.
- There were no tests. Nor was the code written in a way that unit tests could be possible. This made the refactor harder than it had to be.
- I used a slew of polyfills to deal with inconsistencies among web browsers circa 2012 (e.g. the charting library I was using has a Flash-based fallback since not every browser supported the HTML canvas element). Not only did all these polyfills add to the load time, but some of them are no longer maintained.

## Acceptance Tests

I wish I had created acceptance tests when I built this thing originally, but I didn't, so my first step was to create one. Once I had this high-level acceptance test, I'd be able to tell if I broke anything important during the migration process by watching the test pass or fail. To that end, I used [Nightmare.js](https://github.com/segmentio/nightmare) to test the main things the Grapher is supposed to do:

1. Allow people to upload their own Green Button XML files (to the browser; not over the network)
2. Display the data both as a chart and as a summary of values (power usage total, cost total, etc.)

Since testing that the chart displays correctly would be pretty complicated, I settled on testing only that the displayed values were correct (e.g. that the total cost of power was correct).

Here's what the acceptance test looks like:

~~~
describe('When the app boots', function () {
  test('it displays test data and can parse a new file', async function () {
    const SECOND_FILE_PATH = '/public/data/Mountain_Single_family_Jan_1_2011_to_Jan_1_2012.xml';
    const FULL_SECOND_FILE_PATH = `${process.cwd()}${SECOND_FILE_PATH}`;

    let page = visit('/');

    let initialText = await page
      .wait(() => document.body.textContent.includes('123 PRETEND ST BERKELEY CA 94707-2701'))
      .evaluate(() => document.body.textContent);

    expect(initialText).toContain('Total: $1.30');
    expect(initialText).toContain('Total peak: $0.45');

    page.upload("input[type='file']", FULL_SECOND_FILE_PATH);

    let textAfterUpload = await page
      .wait(() => document.body.textContent.includes('Mountain Single-family'))
      .click("button[data-type='chart-type-power-usage']")
      .evaluate(() => document.body.textContent)
      .end();

    expect(textAfterUpload).toContain('Total: 24,380 kWh');
    expect(textAfterUpload).toContain('Total peak: 5,339 kWh');
  });
});
~~~

## Migrating from jQuery Spaghetti to React

Most of the old spaghetti code worked by querying for DOM elements via their ID and adding event handlers to them (e.g click handlers). That gave me a pretty straight-forward migration loop to go from unstructured JS to React.

I started by copying all the old HTML and JS into the main React app so it mostly ran as it has for the past five years. Then I started peeling out components in the following way:

1. Create a React component that renders the same HTML that exists in the old app. At this point the component doesn't do anything other than render HTML.
2. Confirm the acceptance test still passes.
3. Pull the relevant logic out of `app.js` and place it into the component.
4. Confirm the acceptance test still passes.

## Upsides

The biggest win from the refactor is mainly breaking the spaghetti logic out into more coherent chunks, but there are other wins as well:

- I was able to remove jQuery as a dependency, which is mildly helpful in reducing the overall file size.
- Using a modern JS dev environment means I can experience the joy and time savings of live-reloading the browser on code changes.
- Third-party libraries (e.g. [Chart.js](http://www.chartjs.org/)) are easier to integrate via NPM modules rather than copying libraries into a `lib` folder.

## Downsides

As helpful as this rewrite was to the maintainability of the code, there are some downsides.

For starters, while there are fewer independent  plugins needed to run the app, there is now a large build system required---it is no longer sufficient to change `app.js` and simply reload the page. Instead, I need to make sure NPM/yarn is in good shape, dependencies are installed, and the development server is running.

Next, I've replaced that single gargantuan 624-line `app.js` file with 20 files containing a total of 775 lines---for a refactor aimed at simplifying the code, it feels weird to have increased the amount of it. Granted, the new app is easier to maintain in most ways, but it was nice to have the whole app in one file (as long as I didn't have to change anything…).

## create-react-app vs. ember-cli

While create-react-app was a great help in getting the React ecosystem up and running (e.g. setting up a linter, a testing environment, etc.), I think it still lags behind [ember-cli](https://ember-cli.com/) as a useful tool for managing a dev environment . For example, I wanted to add a new [Webpack loader](https://webpack.github.io/docs/loaders.html) to the app but found out I couldn't do that easily without "ejecting" the app from create-react-app, meaning I'd lose the advantage of a community-maintained CLI.

A major benefit of Ember and ember-cli is that there is a community-maintained upgrade path from one version to the next and a community-maintained add-on system, which is pretty handy if you don't want to have to reimplement your development environment every few months.

## Try It Out

The newest version of the [Green Button Grapher is on GitHub Pages](https://mtmckenna.github.io/green-button-grapher/). Try it out using your own Green Button Data downloaded from your utility company’s website ([here are instructions for downloading Green Button Data from PG&E](https://energy.gov/sites/prod/files/Using%20Green%20Button%20Download.pdf
)). If you find bugs or have suggestions, please feel free to email me.

