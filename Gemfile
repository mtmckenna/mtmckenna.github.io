source "https://rubygems.org"
ruby RUBY_VERSION

require 'json'
require 'open-uri'
versions = JSON.parse(open('https://pages.github.com/versions.json').read)

gem 'jekyll'
gem 'eventmachine', '~> 1.2', platform: :ruby #https://github.com/jekyll/jekyll/pull/8111

# This is the default theme for new Jekyll sites. You may change this to anything you like.
gem "minima"

group :jekyll_plugins do
  gem "jekyll-feed"
  gem 'jekyll-redirect-from'
  gem 'github-pages'
  gem 'jekyll-minifier'
end

# Windows does not include zoneinfo files, so bundle the tzinfo-data gem
gem 'tzinfo-data', platforms: [:mingw, :mswin, :x64_mingw, :jruby]

