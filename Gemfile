source "https://rubygems.org"
ruby RUBY_VERSION

require 'json'
require 'open-uri'
versions = JSON.parse(open('https://pages.github.com/versions.json').read)

gem 'jekyll'

# This is the default theme for new Jekyll sites. You may change this to anything you like.
gem "minima"

# If you have any plugins, put them here!
group :jekyll_plugins do
  gem "jekyll-feed"
  gem 'jekyll-redirect-from'
  gem 'github-pages'
end

# Windows does not include zoneinfo files, so bundle the tzinfo-data gem
gem 'tzinfo-data', platforms: [:mingw, :mswin, :x64_mingw, :jruby]

