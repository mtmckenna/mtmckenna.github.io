class window.EarthMover
  constructor: ->
    $(window).scroll @moveTheEarth

  percentScrolled: ->
    docHeight = $(document).height()
    winHeight = $(window).height()
    scrolled = $(window).scrollTop()
    scrollable = docHeight - winHeight
    scrolled / scrollable

  pixelsScrolled: ->
    docHeight = $(document).height()
    pixelsScrolled = @percentScrolled() * docHeight

  moveTheEarth: =>
    $('#earth').offset { top: @pixelsScrolled() }

$(document).ready ->
    window.earthMover = new EarthMover
