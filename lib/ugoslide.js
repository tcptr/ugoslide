(function() {
  var UgoSlide;

  UgoSlide = (function() {
    function UgoSlide(options) {
      var _this = this;
      if (options == null) {
        options = {};
      }
      this.options = $.extend({
        root: '.ugoslide',
        observe: {
          fontSize: '10px',
          fontWeight: 'normal',
          fontStyle: 'normal',
          fontFamily: 'sans-serif',
          color: '#fff'
        },
        scalable: true
      }, options);
      this.$root = $(this.options.root);
      this.pages = this.$root.children('.ugoslide-page').map(function() {
        return $(this);
      });
      this.wordElems = {};
      this.initElements();
      this.compile();
      setTimeout((function() {
        return _this.showAt(0);
      }), this.pageDuration());
    }

    UgoSlide.prototype.escape = function(key) {
      return '#' + key;
    };

    UgoSlide.prototype.unescape = function(key) {
      return key.substr(1);
    };

    UgoSlide.prototype.pageDuration = function() {
      var d;
      if (this.options.scalable) {
        d = $('.ugoslide-page').css('transitionDuration');
        return Number(d.substr(0, d.length - 1)) * 1000;
      } else {
        return 0;
      }
    };

    UgoSlide.prototype.initElements = function() {
      var getBehind, textScale,
        _this = this;
      if (this.$root.find('.ugoslide-navigator').length === 0) {
        this.$root.append("<div class=\"ugoslide-navigator\">\n  <a href=\"#\" class=\"ugoslide-prev\">&lt;&lt;</a>\n  <span class=\"ugoslide-current\"></span>\n  <a href=\"#\" class=\"ugoslide-next\">&gt;&gt;</a>\n</div>");
      }
      if (this.$root.find('.ugoslide-words').length === 0) {
        this.$root.append('<div class="ugoslide-words"></div>');
      }
      this.$words = this.$root.find('.ugoslide-words');
      this.$navigatorCurrent = $('.ugoslide-current');
      getBehind = function(e) {
        var elem;
        _this.$words.css('display', 'none');
        elem = document.elementFromPoint(e.pageX, e.pageY);
        _this.$words.css('display', 'block');
        return $(elem);
      };
      this.$words.on('click', function(e) {
        return getBehind(e).trigger(e);
      });
      this.$words.on('mousemove', function(e) {
        return _this.$words.css('cursor', getBehind(e).css('cursor'));
      });
      $('.ugoslide-prev').on('click', function() {
        return _this.showPrev();
      });
      $('.ugoslide-next').on('click', function() {
        return _this.showNext();
      });
      $(window).on('keydown', function(e) {
        switch (e.which) {
          case 37:
            return _this.showPrev();
          case 39:
            return _this.showNext();
        }
      });
      if (this.options.scalable) {
        textScale = function() {
          var size;
          size = Math.min(_this.$root[0].clientWidth, _this.$root[0].clientHeight) / 30;
          return _this.$root.css('font-size', size);
        };
        $(window).on('resize', function() {
          textScale();
          return setTimeout((function() {
            return _this.showCurrent();
          }), _this.pageDuration());
        });
        return textScale();
      }
    };

    UgoSlide.prototype.compile = function() {
      var $el, $word, count, css, eachTextNode, k, key, word, wordCounts, wordCountsSum, _, _i, _len, _ref, _ref1,
        _this = this;
      eachTextNode = function($el, f) {
        return $el.contents().each(function() {
          switch (this.nodeType) {
            case 3:
              return f(this);
            case 1:
              return eachTextNode($(this), f);
          }
        });
      };
      wordCountsSum = {};
      _ref = this.pages;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        $el = _ref[_i];
        eachTextNode($el, function(el) {
          var html;
          if (!/\S/.test(el.data)) {
            return;
          }
          html = _this.splitText(el.data);
          return $(el).replaceWith(html);
        });
        wordCounts = {};
        $el.find('.ugoslide-word-base').each(function(_, el) {
          var word, _ref1;
          word = _this.escape($(el).text());
          return wordCounts[word] = ((_ref1 = wordCounts[word]) != null ? _ref1 : 0) + 1;
        });
        for (k in wordCounts) {
          count = wordCounts[k];
          wordCountsSum[k] = Math.max((_ref1 = wordCountsSum[k]) != null ? _ref1 : 0, count);
        }
      }
      for (key in wordCountsSum) {
        count = wordCountsSum[key];
        word = this.unescape(key);
        this.wordElems[key] = (function() {
          var _j, _results;
          _results = [];
          for (_ = _j = 1; 1 <= count ? _j <= count : _j >= count; _ = 1 <= count ? ++_j : --_j) {
            css = this.cssSplashed();
            css.transitionDuration = this.transitionDuration(word) + 's';
            $word = $('<span />', {
              "class": 'ugoslide-word',
              text: word,
              css: css
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

    UgoSlide.prototype.splitText = function(str) {
      var CLOSE, OPEN, g, group, i, push, ret, tmp, _i, _ref;
      OPEN = '<span class="ugoslide-word-base">';
      CLOSE = '</span>';
      ret = '';
      tmp = '';
      group = this.characterGroup(str.charCodeAt(0));
      i = 0;
      push = function() {
        if (tmp.length === 0) {
          return;
        }
        ret += group === 'space' ? tmp : OPEN + tmp + CLOSE;
        return tmp = '';
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

    UgoSlide.prototype.showAt = function(index, force) {
      var $page, $word, arr, k, ls, wordElems, _, _i, _len, _ref,
        _this = this;
      if (force == null) {
        force = false;
      }
      if (index === this.index && !force) {
        return;
      }
      if (this.index != null) {
        this.pages[this.index].css({
          opacity: 0,
          zIndex: 1
        });
      }
      this.index = index;
      if (index == null) {
        return;
      }
      $page = this.pages[index];
      $page.css({
        opacity: 1,
        zIndex: 2
      });
      this.$navigatorCurrent.html("" + (this.index + 1) + "/" + this.pages.length);
      wordElems = {};
      _ref = this.wordElems;
      for (k in _ref) {
        arr = _ref[k];
        wordElems[k] = $.merge([], arr);
      }
      $page.find('.ugoslide-word-base').each(function(_, el) {
        var $el, $word;
        $el = $(el);
        $word = _this.choiceRandom(wordElems[_this.escape($el.text())]);
        $word.showed = true;
        return $word.css(_this.cssReflecting($el));
      });
      for (_ in wordElems) {
        ls = wordElems[_];
        for (_i = 0, _len = ls.length; _i < _len; _i++) {
          $word = ls[_i];
          if (!$word.showed && !force) {
            continue;
          }
          $word.showed = false;
          $word.css(this.cssSplashed());
        }
      }
      return false;
    };

    UgoSlide.prototype.cssReflecting = function($el) {
      var elOffset, key, ret, rootOffset, _, _ref;
      elOffset = $el.offset();
      rootOffset = this.$root.offset();
      ret = {
        top: elOffset.top - rootOffset.top,
        left: elOffset.left - rootOffset.left
      };
      _ref = this.options.observe;
      for (key in _ref) {
        _ = _ref[key];
        ret[key] = $el.css(key);
      }
      ret.color = $el.data('color');
      return ret;
    };

    UgoSlide.prototype.cssSplashed = function() {
      return $.extend(this.makeSplashPos(), this.options.observe);
    };

    UgoSlide.prototype.makeSplashPos = function() {
      if (Math.random() < 0.5) {
        return {
          top: Math.random() < 0.5 ? -20 : this.$root[0].clientHeight + 10,
          left: Math.random() * this.$root[0].clientWidth
        };
      } else {
        return {
          top: Math.random() * this.$root[0].clientHeight,
          left: Math.random() < 0.5 ? -120 : this.$root[0].clientWidth + 10
        };
      }
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

    UgoSlide.prototype.transitionDuration = function(word) {
      return Math.max(0.9 - word.length / 14, 0.2);
    };

    UgoSlide.prototype.characterGroup = function(code, current) {
      if (code === 0x20 || code === 0x3040) {
        return 'space';
      } else if (0x21 <= code && code <= 0x3f || 0x3a <= code && code <= 0x40 || 0x5b <= code && code <= 0x5e || code === 0x60 || 0x7b <= code && code <= 0x7f) {
        return 'symbol';
      } else if (0x30 <= code && code <= 0x39) {
        return 'number';
      } else if (0x41 <= code && code <= 0x5a || 0x61 <= code && code <= 0x7a || code === 0x5f) {
        return 'identifier';
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

    UgoSlide.prototype.showCurrent = function() {
      if (this.index == null) {
        return;
      }
      return this.showAt(this.index, true);
    };

    UgoSlide.prototype.showPrev = function() {
      if (this.index == null) {
        return;
      }
      return this.showAt((this.pages.length + this.index - 1) % this.pages.length);
    };

    UgoSlide.prototype.showNext = function() {
      if (this.index == null) {
        return;
      }
      return this.showAt((this.index + 1) % this.pages.length);
    };

    return UgoSlide;

  })();

  window.UgoSlide = UgoSlide;

}).call(this);
