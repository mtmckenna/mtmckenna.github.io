function contentResize() {
    if ($(window).width() <= 500) {
        document.getElementById('content').style.width = ($(window).width() - 30 ) + 'px';
    }
    else {
        document.getElementById('content').style.width = '500px';
    }
}
