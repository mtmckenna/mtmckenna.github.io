/*jshint sub:true*/
var app = {};

app.sqs = [];
app.maxHighlightOpac = 0.50;
app.sqWidth = 100;
app.width = 0;
app.height = 0;
app.restoreDuration = 1000;
app.restoreInterval = 50;
app.currentSq = 0;
app.earthInitPosition = $('#earth').offset();

app.mouseMoved = function(evt) {
    // Get index of sq in array
    var index = app.getIndex(evt.clientX, evt.clientY);

    /*console.log('x: ' + evt.clientX + ' y: ' + evt.clientY +
    'i[x]: ' + app.sqs[index]['x'] + 'i[y]: ' + app.sqs[index]['y'] +
    ' i: ' + index);*/

    // Return if mouse hasn't moved squares
    if (index === app.currentSq) return;

    var col = $('#column');
    var colTop = col.offset().top - $(window).scrollTop();
    var colLeft = col.offset().left - $(window).scrollLeft();
    var colWidth = col.width();

    // Don't highlight square if mouse is in the column
    if (evt.clientX > colLeft &&
        evt.clientX < colLeft + colWidth &&
        evt.clientY > colTop) return;

    app.currentSq = index;

    //var origAlpha = app.sqs[index]['a'];
    var origAlpha = 0.0;
    var currAlpha = app.maxHighlightOpac;

    // Number of steps required to get back to a zero-alpha state
    var restoreSteps = Math.abs(currAlpha - origAlpha) /
                        app.restoreDuration * app.restoreInterval;

    // If there's a timer going for this square already, kill it
    if (app.sqs[index]['timer']) {
        clearInterval(app.sqs[index]['timer']);
        app.sqs[index]['timer'] = null;
    }

    app.ctx.fillStyle = 'rgba(163, 163, 163,' + currAlpha + ')';
    //console.log('x y w: ' + app.sqs[index]['x'] + ' ' + app.sqs[index]['y'] + ' ' + app.sqWidth);

    // Animate sq fade
    function restoreAlpha() {
        currAlpha = currAlpha - restoreSteps;
        app.ctx.fillStyle = 'rgba(163, 163, 163,' + currAlpha + ')';
        app.ctx.clearRect(app.sqs[index]['x'], app.sqs[index]['y'], app.sqWidth, app.sqWidth);
        app.ctx.fillRect(app.sqs[index]['x'], app.sqs[index]['y'], app.sqWidth, app.sqWidth);
        //console.log('restore ' + currAlpha + ' ' + restoreSteps);

        // Reset square
        if (currAlpha <= 0.0) {
            app.ctx.fillStyle = 'rgba(163, 163, 163,' + origAlpha + ')';
            app.ctx.clearRect(app.sqs[index]['x'], app.sqs[index]['y'], app.sqWidth, app.sqWidth);
            clearInterval(app.sqs[index]['timer']);
            app.sqs[index]['timer'] = null;
        }
    }

    app.sqs[index]['timer'] = setInterval(restoreAlpha, app.restoreInterval);
};

// Get index of square for coordinates
app.getIndex = function(x, y) {
    var xNorm = Math.floor(x / app.sqWidth);
    var yNorm = Math.floor(y / app.sqWidth);
    var sqPerRow = Math.ceil(app.width / app.sqWidth);
    return xNorm + yNorm * sqPerRow;
};

// Build array of squares
app.buildGrid = function() {

    var i, x, y, sqPerRow, maxSqs;

    // Kill old timers
    for (i = 0; i < app.sqs.length; i++) {
        clearInterval(app.sqs[i]['timer']);
        app.sqs[i]['timer'] = null;
    }

    app.sqs = [];
    app.width = $(window).width();
    app.height = $(window).height();

    app.canvas.width = app.width;
    app.canvas.height = app.height;
    app.canvas.style.width = app.width + 'px';
    app.canvas.style.height = app.height + 'px';

    //app.sqWidth = Math.sqrt( app.width * app.height / app.maxSqs );
    //app.maxSqs = app.width * app.height / app.sqWidth;
    maxSqs = Math.ceil(app.width / app.sqWidth) *
        Math.ceil(app.height / app.sqWidth);
    sqPerRow = Math.ceil(app.width / app.sqWidth);

    x = 0;
    y = 0;

    for (i = 0; i <= maxSqs; i++) {
        y = Math.floor(i / sqPerRow) * app.sqWidth;

        app.sqs[i] = {};
        app.sqs[i]['x'] = x;
        app.sqs[i]['y'] = y;
        app.sqs[i]['timer'] = null;

        //console.log('x y i: ' + ' ' + x + ' ' + y + ' ' + i);

        x = x + app.sqWidth;
        if (x > app.width) x = 0;
    }
};

$(document).ready(function() {
    app.canvas = document.getElementById('bg-canvas');
    app.ctx = app.canvas.getContext('2d');

    app.buildGrid();

    $(document).mousemove(app.mouseMoved);
    $(window).resize();
});

$(window).resize(function() {
    app.buildGrid();
});

$(window).on('scroll', function(e) {
  var distance = $(this).scrollTop();
  var docHeight = $(document).height();
  var winHeight = $(window).height();
  var scrollable = docHeight - winHeight;

  var percentScrolled = distance / scrollable;
  var pixelsScrolled = percentScrolled * winHeight;

  $('#earth').offset({top: pixelsScrolled});
});
