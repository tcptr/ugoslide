$(function(){
  var markdown2slide = (function(){
    var open = '<div class="ugoslide-page">\n';
    var close = '</div>\n';

    var renderer = new marked.Renderer();
    renderer.hr = function() { return close + open; };

    var options = {
      renderer: renderer,
      gfm: true,
      breaks: true,
      highlight: function(code, lang) {
        // hljs.highlightBlock(this);
        if (lang && hljs.LANGUAGES[lang])
          return hljs.highlight(lang, code).value;
        else
          return hljs.highlightAuto(code).value;
      }
    };

    return function(str) {
      return open + marked(str, options) + close;
    };
  })();

  $('.ugoslide').html(markdown2slide( $('script[type="text/markdown"]').html() ));

  new UgoSlide();
});

