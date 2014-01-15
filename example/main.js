(function() {
  $(function() {
    var slide;
    $('code').each(function() {
      return hljs.highlightBlock(this);
    });
    slide = new UgoSlide($('.slide'), {
      'font-size': '10px',
      'font-weight': 'normal',
      'font-style': 'normal',
      'font-family': 'sans-serif',
      'color': '#fff'
    });
    slide.idx = 0;
    slide.updatePage = function() {
      return $('.navigator .current').html("" + (this.idx + 1) + "/" + this.pages.length);
    };
    slide.showPrev = function() {
      this.idx = (this.pages.length + this.idx - 1) % this.pages.length;
      this.showAt(this.idx);
      return this.updatePage();
    };
    slide.showNext = function() {
      this.idx = (this.idx + 1) % this.pages.length;
      this.showAt(this.idx);
      return this.updatePage();
    };
    slide.updatePage();
    return setTimeout(function() {
      slide.showAt(0);
      $('.navigator .prev').on('click', function(e) {
        e.preventDefault();
        return slide.showPrev();
      });
      $('.navigator .next').on('click', function(e) {
        e.preventDefault();
        return slide.showNext();
      });
      return $(window).on('keydown', function(e) {
        switch (e.which) {
          case 37:
            return slide.showPrev();
          case 39:
            return slide.showNext();
        }
      });
    }, 500);
  });

}).call(this);
