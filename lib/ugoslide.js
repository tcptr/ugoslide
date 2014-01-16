(function() {
  var UgoSlide;

  $.fn.extend({
    offsetFrom: function($el) {
      var from, to;
      from = $el.offset();
      to = this.offset();
      return {
        top: to.top - from.top,
        left: to.left - from.left
      };
    },
    eachTextNode: function(f) {
      return this.contents().each(function() {
        switch (this.nodeType) {
          case 3:
            return f.call(this, this);
          case 1:
            return $(this).eachTextNode(f);
        }
      });
    }
  });

  UgoSlide = (function() {
    var CLOSE, OPEN, WORD_DEFAULTS;

    function UgoSlide($root, cssWord) {
      this.$root = $root;
      this.cssWord = cssWord != null ? cssWord : WORD_DEFAULTS;
      this.pages = this.$root.children('.page').map(function() {
        return $(this);
      });
      this.wordElems = {};
      this.rootSize = {
        width: this.$root[0].clientWidth,
        height: this.$root[0].clientHeight
      };
      this.initStyle();
      this.init();
    }

    UgoSlide.prototype.initStyle = function() {
      var $el, $page, i, _i, _j, _len, _len1, _ref, _ref1, _results;
      this.$words = $('<div />', {
        "class": 'ugoline-words',
        css: {
          position: 'absolute',
          overflow: 'hidden',
          width: this.rootSize.width,
          height: this.rootSize.height,
          margin: 0,
          zIndex: this.pages.length + 1
        }
      });
      this.$root.append(this.$words);
      this.$navigator = this.$root.find('.navigator');
      this.$navigator.css('z-index', this.pages.length + 2);
      _ref = this.pages;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        $page = _ref[i];
        $page.css({
          position: 'absolute',
          opacity: 0,
          zIndex: i
        });
      }
      _ref1 = [this.$root, this.$navigator];
      _results = [];
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        $el = _ref1[_j];
        if ($el.css('display') === 'static') {
          _results.push($el.css('display', 'relative'));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    UgoSlide.prototype.init = function() {
      var $el, $word, count, k, word, wordCounts, wordCountsSum, _, _i, _len, _ref, _ref1,
        _this = this;
      wordCountsSum = {};
      _ref = this.pages;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        $el = _ref[_i];
        $el.eachTextNode(function(el) {
          var html;
          if (!/\S/.test(el.data)) {
            return;
          }
          html = _this.splitText(el.data);
          return $(el).replaceWith(html);
        });
        wordCounts = {};
        $el.find('.ugoslide-word-base').each(function() {
          var word, _ref1;
          word = $(this).text();
          return wordCounts[word] = ((_ref1 = wordCounts[word]) != null ? _ref1 : 0) + 1;
        });
        for (k in wordCounts) {
          count = wordCounts[k];
          wordCountsSum[k] = Math.max((_ref1 = wordCountsSum[k]) != null ? _ref1 : 0, count);
        }
      }
      for (word in wordCountsSum) {
        count = wordCountsSum[word];
        this.wordElems[word] = (function() {
          var _j, _results;
          _results = [];
          for (_ = _j = 1; 1 <= count ? _j <= count : _j >= count; _ = 1 <= count ? ++_j : --_j) {
            $word = $('<span />', {
              "class": 'ugoslide-word',
              text: word,
              css: $.extend({
                position: 'absolute',
                margin: 0,
                padding: 0,
                userSelect: 'none',
                transition: "" + (1.3 - word.length / 12) + "s ease-out"
              }, this.cssSplashed(this.cssWord))
            });
            $word.showed = false;
            this.$words.append($word);
            _results.push($word);
          }
          return _results;
        }).call(this);
      }
      return $('.ugoslide-word-base').each(function() {
        $word = $(this);
        $word.data('color', $word.css('color'));
        return $word.css('color', 'rgba(0,0,0,0)');
      });
    };

    UgoSlide.prototype.choiceSequence = function(arr) {
      return arr.shift();
    };

    UgoSlide.prototype.choiceRandom = function(arr) {
      var k, ret;
      k = Math.floor(Math.random() * arr.length);
      ret = arr[k];
      arr.splice(k, 1);
      return ret;
    };

    UgoSlide.prototype.characterGroup = function(code, current) {
      if (code === 0x20 || code === 0x3040) {
        return 'space';
      } else if (0x21 <= code && code <= 0x3f || 0x3a <= code && code <= 0x40 || 0x5b <= code && code <= 0x60 || 0x7b <= code && code <= 0x7f) {
        return 'symbol';
      } else if (0x30 <= code && code <= 0x39) {
        return 'number';
      } else if (0x41 <= code && code <= 0x5a || 0x61 <= code && code <= 0x7a) {
        return 'alphabet';
      } else if (0x3041 <= code && code <= 0x309f || current === 'hiragana' && code === 0x30fc) {
        return 'hiragana';
      } else if (0x30a0 <= code && code <= 0x30ff) {
        return 'katakana';
      } else if (0x3400 <= code && code <= 0x9fff) {
        return 'kanji';
      } else {
        return 'others';
      }
    };

    UgoSlide.prototype.splitText = function(str) {
      var g, group, i, push, ret, tmp, _i, _ref;
      ret = "";
      tmp = "";
      group = this.characterGroup(str.charCodeAt(0));
      i = 0;
      push = function() {
        if (tmp.length === 0) {
          return;
        }
        ret += group === 'space' ? tmp : OPEN + tmp + CLOSE;
        return tmp = "";
      };
      for (i = _i = 0, _ref = str.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        g = this.characterGroup(str.charCodeAt(i), group);
        if (g !== group) {
          push();
          group = g;
        }
        tmp += str.charAt(i);
      }
      push();
      return ret;
    };

    UgoSlide.prototype.showAt = function(idx) {
      var $page, $word, arr, k, ls, wordElems, _, _i, _len, _ref, _ref1, _results,
        _this = this;
      _ref = this.pages;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        $page = _ref[_i];
        $page.css('opacity', 0);
      }
      $page = this.pages[idx];
      $page.css({
        opacity: 1,
        transition: '1.5s ease-out'
      });
      wordElems = {};
      _ref1 = this.wordElems;
      for (k in _ref1) {
        arr = _ref1[k];
        wordElems[k] = $.merge([], arr);
      }
      $page.find('.ugoslide-word-base').each(function(_, el) {
        var $el, $word;
        $el = $(el);
        $word = _this.choiceRandom(wordElems[$el.text()]);
        $word.showed = true;
        return $word.css(_this.cssReflecting($el, _this.cssWord));
      });
      _results = [];
      for (_ in wordElems) {
        ls = wordElems[_];
        _results.push((function() {
          var _j, _len1, _results1;
          _results1 = [];
          for (_j = 0, _len1 = ls.length; _j < _len1; _j++) {
            $word = ls[_j];
            if (!$word.showed) {
              continue;
            }
            $word.showed = false;
            _results1.push($word.css(this.cssSplashed(this.cssWord)));
          }
          return _results1;
        }).call(this));
      }
      return _results;
    };

    UgoSlide.prototype.cssReflecting = function($el, base) {
      var key, ret, _;
      ret = $el.offsetFrom(this.$root);
      for (key in base) {
        _ = base[key];
        ret[key] = $el.css(key);
      }
      ret.color = $el.data('color');
      return ret;
    };

    UgoSlide.prototype.cssSplashed = function(base) {
      return $.extend(this.makeSplashPos(), base);
    };

    UgoSlide.prototype.makeSplashPos = function() {
      if (Math.random() < 0.5) {
        return {
          top: Math.random() < 0.5 ? -20 : this.rootSize.height + 10,
          left: Math.random() * this.rootSize.width
        };
      } else {
        return {
          top: Math.random() * this.rootSize.height,
          left: Math.random() < 0.5 ? -120 : this.rootSize.width + 10
        };
      }
    };

    OPEN = '<span class="ugoslide-word-base">';

    CLOSE = '</span>';

    WORD_DEFAULTS = {
      fontSize: '10px',
      fontWeight: 'normal',
      fontStyle: 'normal',
      fontFamily: 'sans-serif',
      color: '#fff'
    };

    return UgoSlide;

  })();

  window.UgoSlide = UgoSlide;

}).call(this);
