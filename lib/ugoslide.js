(function() {
  var UgoSlide;

  $.fn.extend({
    positionFrom: function($el) {
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
    },
    tree: function(f, depth) {
      if (depth == null) {
        depth = 0;
      }
      depth += 1;
      return this.children().each(function() {
        f.call(this, this, depth);
        return $(this).tree(f, depth);
      });
    }
  });

  UgoSlide = (function() {
    var CLOSE, NODE_DEFAULTS, OPEN, WORD_DEFAULTS;

    function UgoSlide($root, cssWord, cssNode) {
      this.$root = $root;
      this.cssWord = cssWord != null ? cssWord : WORD_DEFAULTS;
      this.cssNode = cssNode != null ? cssNode : NODE_DEFAULTS;
      this.pages = this.$root.children('.page').map(function() {
        return $(this);
      });
      this.wordElems = {};
      this.nodeElems = {};
      this.rootSize = {
        width: this.$root[0].clientWidth,
        height: this.$root[0].clientHeight
      };
      this.initStyle();
      this.init();
    }

    UgoSlide.prototype.initStyle = function() {
      var $page, _i, _len, _ref, _results;
      if (this.$root.css('position') === 'static') {
        this.$root.css('position', 'relative');
      }
      this.$root.css('overflow', 'hidden');
      _ref = this.pages;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        $page = _ref[_i];
        _results.push($page.css({
          position: 'absolute',
          visibility: 'hidden'
        }));
      }
      return _results;
    };

    UgoSlide.prototype.init = function() {
      var $el, $node, $word, count, depth, key, mergeCount, nodeCounts, nodeCountsSum, tagName, word, wordCounts, wordCountsSum, _, _i, _len, _ref, _ref1, _results,
        _this = this;
      nodeCountsSum = {};
      wordCountsSum = {};
      mergeCount = function(from, to) {
        var count, k, _ref, _results;
        _results = [];
        for (k in from) {
          count = from[k];
          _results.push(to[k] = Math.max((_ref = to[k]) != null ? _ref : 0, count));
        }
        return _results;
      };
      _ref = this.pages;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        $el = _ref[_i];
        nodeCounts = {};
        wordCounts = {};
        $el.tree(function(el, depth) {
          var key, _ref1;
          key = "" + el.tagName + "-" + depth;
          nodeCounts[key] = ((_ref1 = nodeCounts[key]) != null ? _ref1 : 0) + 1;
          return $(el).addClass('ugoslide-node-base');
        });
        $el.eachTextNode(function(el) {
          var html;
          html = _this.splitText(el.data);
          return $(el).replaceWith(html);
        });
        $el.find('.ugoslide-word-base').each(function() {
          var word, _ref1;
          word = $(this).text();
          return wordCounts[word] = ((_ref1 = wordCounts[word]) != null ? _ref1 : 0) + 1;
        });
        mergeCount(nodeCounts, nodeCountsSum);
        mergeCount(wordCounts, wordCountsSum);
      }
      for (key in nodeCountsSum) {
        count = nodeCountsSum[key];
        _ref1 = key.split(/-/), tagName = _ref1[0], depth = _ref1[1];
        this.nodeElems[key] = (function() {
          var _j, _results;
          _results = [];
          for (_ = _j = 1; 1 <= count ? _j <= count : _j >= count; _ = 1 <= count ? ++_j : --_j) {
            $node = $("<" + tagName + " />", {
              "class": 'ugoslide-node',
              css: $.extend({
                position: 'absolute',
                margin: 0,
                padding: 0,
                zIndex: depth,
                transition: "1.0s ease-out"
              }, this.cssSplashed(this.cssNode))
            });
            $node.showed = false;
            this.$root.append($node);
            _results.push($node);
          }
          return _results;
        }).call(this);
      }
      _results = [];
      for (word in wordCountsSum) {
        count = wordCountsSum[word];
        _results.push(this.wordElems[word] = (function() {
          var _j, _results1;
          _results1 = [];
          for (_ = _j = 1; 1 <= count ? _j <= count : _j >= count; _ = 1 <= count ? ++_j : --_j) {
            $word = $('<span />', {
              "class": 'ugoslide-word',
              text: word,
              css: $.extend({
                position: 'absolute',
                margin: 0,
                padding: 0,
                zIndex: 9999,
                transition: "" + (1.3 - word.length / 12) + "s ease-out"
              }, this.cssSplashed(this.cssWord))
            });
            $word.showed = false;
            this.$root.append($word);
            _results1.push($word);
          }
          return _results1;
        }).call(this));
      }
      return _results;
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
      var $node, $page, $word, copy, ls, nodeElems, wordElems, _, _i, _len, _results,
        _this = this;
      $page = this.pages[idx];
      copy = function(dic) {
        var arr, k, ret;
        ret = {};
        for (k in dic) {
          arr = dic[k];
          ret[k] = $.merge([], arr);
        }
        return ret;
      };
      wordElems = copy(this.wordElems);
      nodeElems = copy(this.nodeElems);
      $page.find('.ugoslide-word-base').each(function(_, el) {
        var $el, $word;
        $el = $(el);
        $word = _this.choiceRandom(wordElems[$el.text()]);
        $word.showed = true;
        return $word.css(_this.cssReflecting($el, _this.cssWord));
      });
      $page.tree(function(el, depth) {
        var $el, $node;
        $el = $(el);
        if (!$el.hasClass('ugoslide-node-base')) {
          return;
        }
        $node = _this.choiceSequence(nodeElems["" + el.tagName + "-" + depth]);
        $node.showed = true;
        return $node.css(_this.cssReflecting($el, _this.cssNode));
      });
      for (_ in wordElems) {
        ls = wordElems[_];
        for (_i = 0, _len = ls.length; _i < _len; _i++) {
          $word = ls[_i];
          if (!$word.showed) {
            continue;
          }
          $word.showed = false;
          $word.css(this.cssSplashed(this.cssWord));
        }
      }
      _results = [];
      for (_ in nodeElems) {
        ls = nodeElems[_];
        _results.push((function() {
          var _j, _len1, _results1;
          _results1 = [];
          for (_j = 0, _len1 = ls.length; _j < _len1; _j++) {
            $node = ls[_j];
            if (!$node.showed) {
              continue;
            }
            $node.showed = false;
            _results1.push($node.css(this.cssSplashed(this.cssNode)));
          }
          return _results1;
        }).call(this));
      }
      return _results;
    };

    UgoSlide.prototype.cssReflecting = function($el, base) {
      var key, ret, _;
      ret = $el.positionFrom(this.$root);
      for (key in base) {
        _ = base[key];
        ret[key] = $el.css(key);
      }
      return ret;
    };

    UgoSlide.prototype.cssSplashed = function(base) {
      return $.extend(this.makeSplashPos(), base);
    };

    UgoSlide.prototype.makeSplashPos = function() {
      if (Math.random() < 0.5) {
        return {
          top: Math.random() < 0.5 ? -120 : this.rootSize.height + 10,
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

    NODE_DEFAULTS = {
      width: 0,
      height: 0,
      paddingLeft: 0,
      paddingRight: 0,
      paddingTop: 0,
      paddingBottom: 0,
      backgroundColor: '#fff',
      borderLeftColor: '#fff',
      borderRightColor: '#fff',
      borderTopColor: '#fff',
      borderBottomColor: '#fff',
      borderLeftWidth: 0,
      borderTopWidth: 0,
      borderBottomWidth: 0,
      borderRightWidth: 0,
      borderLeftStyle: 'solid',
      borderTopStyle: 'solid',
      borderBottomStyle: 'solid',
      borderRightStyle: 'solid'
    };

    return UgoSlide;

  })();

  window.UgoSlide = UgoSlide;

}).call(this);
