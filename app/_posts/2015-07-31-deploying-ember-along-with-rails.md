---
layout: post
title: Deploy Your Ember App Along With Your Ruby on Rails App
---

[deploy-video]: https://www.youtube.com/watch?v=4EDetv_Rw5U
[ember-cli-deploy]: http://ember-cli.github.io/ember-cli-deploy/
[deploy-ember-project]: https://github.com/mtmckenna/deploy-ember-with-rails
[ember-cli-rails]: https://github.com/rwz/ember-cli-rails
[fingerprinting-issues]: https://github.com/rwz/ember-cli-rails/issues/30
[deploy-gist]: https://gist.github.com/twetzel/66de336327f79beac0e0
[twetzel]: https://gist.github.com/twetzel
[capistrano]: http://capistranorb.com/
[luke melia]: http://www.lukemelia.com/
[emberconf 2015]: http://emberconf.com/

##Introduction

There are a number of ways to deploy an Ember app to a production environment. [This video][deploy-video] by [Luke Melia] at [EmberConf 2015] includes a great explanation of how to use Ember's best practice for deployment: [ember-cli-deploy]. In additon to [ember-cli-deploy], there's also a Gem called [ember-cli-rails], which can be super helpful for getting started with deploying Ember along with Rails. However, when using [ember-cli-rails], I ran into [fingerprinting issues][fingerprinting-issues] with an Ember app that had references to images within the Ember templates and ultimately decided to go withiout the Gem.

Perhaps you don't want to go the best practice route anyway. Perhaps you simply want to create an Ember app associated with just one controller on your already existing Rails application without having to handle any weirdness with CSRF, JS files hosted on multiple servers, etc that may arise from the [ember-cli-deploy] strategy. In that case, it may be easiest to have your Ember app's assets (js, css, images) uploaded to your production Rails server during the deploy process of your Rails app. Certainly, this sort of deploy can be limiting (e.g. to do deploy the front end, you must also deploy the back end), but the upside is that the deploy process is somewhat simpler in that there is only one asset server in the mix.

In my experience, the easiest way to deploy an Ember app to your production Rails server is to precompile the Rails and Ember assets locally and rsync them to the remote server via [Capistrano]. Over the rest of this post, I'll describe how to set up this process. If you'd like a reference, I've posted a [demo project on GitHub][deploy-ember-project].

##Steps

The steps are as follows:

1. [Move Your Ember App into Your Rails Git Repo](#1)
1. [Symlink Your Ember "dist" Directory into the Rails "assets" Directory](#2)
1. [Create a New Layout for the Controller That Will Load Your Ember App](#3)
1. [Add Your Ember App's Assets to Rails' Asset Precompile Assets Array](#4)
1. [Disable Ember's 'storeConfigInMeta' Property](#5)
1. [Update Capistrano's Deploy Task](#6)
1. [Develop and Deploy](#7)

## <a name="1"></a> 1. Move Your Ember App into Your Rails Git Repo

The first step is simple: make sure your Ember app lives inside your Rails git repo. For example, [my demo Rails project][deploy-ember-project] is located in `~/workspace/deploy-ember-with-rails/`. I've therefore moved my Ember app to `~/workspace/deploy-ember-with-rails/ember-app`.

## <a name="2"></a> 2. Symlink Your Ember App's "dist" Directory into the Rails "assets" Directory

The next step is to symlink your Ember app's "dist" directory into the Rails asset directory. The point of this step is to place the assets that Ember compiles into a location that the Rails asset pipeline will pick up.

To create this symlink, go into your Rails app's root directory and use the following commands (where "ember-app" is the location of the Ember app from the previous step):

```
mkdir app/assets/ember-app
cd app/assets/ember-app
ln -s ../../../ember-app/dist/assets ember-app
```

You'll now have a semi-unseemly directory name at `rails-app/app/assets/ember-app/ember-app` that will house your Ember assets.

## <a name="3"></a> 3. Create a New Layout for the Controller That Will Load Your Ember App

Now that your Ember app's assets are symlinked into a place where the Rails asset pipeline can pick them up, you'll need to insert a reference to these assets into the view that Rails serves up. You can insert this reference by creating a separate layout called something like `ember_application.html.erb` and adding `layout 'ember_application'` to the top of the controller that will display the Ember app. For example:

```
class EmberAppController < ApplicationController
  layout 'ember_application'
  def show
  end
end
```

Here is the contents of `ember_application.html.erb`:

```
<!DOCTYPE html>
<html>
<head>
  <title>DeployEmberWithRails</title>
  <%= stylesheet_link_tag    'application', media: 'all' %>
  <%= javascript_include_tag 'application' %>

  <%= javascript_include_tag 'ember-app/vendor' %>
  <%= stylesheet_link_tag 'ember-app/vendor' %>

  <%= javascript_include_tag 'ember-app/ember-app' %>
  <%= stylesheet_link_tag 'ember-app/ember-app' %>

  <%= csrf_meta_tags %>
</head>
<body>
  <div id="#ember-app">
  <%= yield %>
  </div>
</body>
</html>
```

The Javascript and stylesheet include tags insert your Ember app's assets into the page, and the `<div id="#ember-app">` tag provides the `<div>` in which Ember can insert your app.

## <a name="4"></a> 4. Add Your Ember App's Assets to Rails' Asset Precompile Assets Array

Rails must know which assets it has to precompile during deploy. To inform Rails that you also want to precompile your Ember assets, add the following line to your `config/initializers/assets.rb` file;

```
Rails.application.config.assets.precompile += %w(ember-app/ember-app.js ember-app/ember-app.css ember-app/vendor.js ember-app/vendor.css)
```

## <a name="5"></a> 5. Disable Ember's 'storeConfigInMeta' Property

By default, Ember stores configuration info about your application's environment in a `<meta>` tag within Ember's `index.html` page. Since you are loading the Ember app from a view generated by Rails rather than one generated by Ember, this `<meta>` tag won't exist. Fortunately, Ember has a property called `storeConfigInMeta` that can be set to `false`, which forces Ember to stoe this environment information in a Javascript file instead of a `<meta>` tag. The `storeConfigInMeta` property can be set from within the `ember-cli-build.js` file like so:

```
module.exports = function(defaults) {
  var app = new EmberApp(defaults, {
    storeConfigInMeta: false
  });
  return app.toTree();
};
```

## <a name="6"></a> 6. Update Capistrano's Deploy Task

Finally, we have to update Capistrano's deploy task so that it precompile both your Ember and Rails assets and rsync them to your remote server. The task I use is based off [this useful gist][deploy-gist] created by GitHub user [twetzel].

To use this updated deploy task, create a file in the `lib/capistrano/tasks/` directory called `deploy.rb`:

```
namespace :deploy do

  desc 'Compile assets'
  task :compile_assets => [:set_rails_env] do
    # invoke 'deploy:assets:precompile'
    invoke 'deploy:assets:precompile_local'
    invoke 'deploy:assets:backup_manifest'
  end

  namespace :assets do
    desc "Precompile assets locally and then rsync to web servers"

    ember_app_name = "ember-app"
    local_ember_assets_dir = "./public/assets/"

    task :precompile_local do
      # compile assets locally
      run_locally do
        execute "cd #{ember_app_name} && ember build --environment=production"
        execute "RAILS_ENV=#{fetch(:stage)} bundle exec rake assets:precompile"
      end

      # rsync to each server
      on roles( fetch(:assets_roles, [:web]) ) do
        # this needs to be done outside run_locally in order for host to exist
        remote_assets_dir = "#{host.user}@#{host.hostname}:#{release_path}/public/assets/"

        run_locally { execute "rsync -av --delete #{local_ember_assets_dir} #{remote_assets_dir}" }
      end

      # clean up
      run_locally { execute "rm -rf #{local_ember_assets_dir}" }
    end
  end
end
```

In your `Capfile`, add `load 'lib/capistrano/tasks/deploy.rb'`.

## <a name="7"></a> 7. Develop and Deploy

At this point, you should be able to develop locally and deploy to your remote server. To develop locally, you can run your Rails server (`bin/rails s`) in one terminal and build your Ember app in another (`ember build --watch --environment=development). When you visit the Rails app at http://localhost:3000, your Ember app should be available for you to see.

When deploying (`cap produciton deploy`), your assets should compile locally and then be rsync'd up to the server. And then your Ember app is live. Hooray!

