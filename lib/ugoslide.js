(function() {
  var UgoSlide;

  UgoSlide = (function() {
    var CLOSE, OPEN;

    OPEN = '<span class="prechar">';

    CLOSE = '</span>';

    function UgoSlide($root, defaults) {
      this.$root = $root;
      this.defaults = defaults;
      this.pages = this.$root.children('.page').map(function() {
        return $(this);
      });
      this.size = {
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
      var $char, $el, char, count, mergedChars, _, _i, _len, _ref, _ref1, _ref2, _results;
      mergedChars = {};
      _ref = this.pages;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        $el = _ref[_i];
        this.replaceTextNode($el);
        _ref1 = this.analyze($el);
        for (char in _ref1) {
          count = _ref1[char];
          mergedChars[char] = Math.max((_ref2 = mergedChars[char]) != null ? _ref2 : 0, count);
        }
      }
      this.charElems = {};
      _results = [];
      for (char in mergedChars) {
        count = mergedChars[char];
        _results.push(this.charElems[char] = (function() {
          var _j, _results1;
          _results1 = [];
          for (_ = _j = 1; 1 <= count ? _j <= count : _j >= count; _ = 1 <= count ? ++_j : --_j) {
            $char = $('<span class="ugoslide-char">' + char + '</span>');
            $char.showed = false;
            $char.css('position', 'absolute');
            $char.css(this.cssSplashed());
            $char.css('transition', "" + (1.3 - char.length / 12) + "s ease-out");
            this.$root.append($char);
            _results1.push($char);
          }
          return _results1;
        }).call(this));
      }
      return _results;
    };

    UgoSlide.prototype.replaceTextNode = function($elem) {
      var _this = this;
      return $elem.contents().each(function(_, el) {
        var text;
        switch (el.nodeType) {
          case 3:
            if (!/\S/.test(el.data)) {
              return;
            }
            text = _this.splitChar(el.data);
            return $(el).replaceWith(text);
          case 1:
            return _this.replaceTextNode($(el));
        }
      });
    };

    UgoSlide.prototype.analyze = function($elem) {
      var ret,
        _this = this;
      ret = {};
      $elem.find('.prechar').each(function(_, el) {
        var char, _ref;
        char = $(el).text();
        return ret[char] = ((_ref = ret[char]) != null ? _ref : 0) + 1;
      });
      return ret;
    };

    UgoSlide.prototype.choice = function(arr) {
      return arr.shift();
    };

    UgoSlide.prototype.splitChar = function(str) {
      return OPEN + str.split(/(\s+)/).join(CLOSE + OPEN) + CLOSE;
    };

    UgoSlide.prototype.showAt = function(idx) {
      var $char, $page, char, elems, fromElems, _, _ref, _results,
        _this = this;
      $page = this.pages[idx];
      fromElems = {};
      _ref = this.charElems;
      for (char in _ref) {
        elems = _ref[char];
        fromElems[char] = $.merge([], elems);
      }
      $page.find('.prechar').each(function(_, el) {
        var $char, $el;
        $el = $(el);
        $char = _this.choice(fromElems[$el.text()]);
        $char.showed = true;
        return $char.css(_this.cssReflecting($el));
      });
      _results = [];
      for (_ in fromElems) {
        elems = fromElems[_];
        _results.push((function() {
          var _i, _len, _results1;
          _results1 = [];
          for (_i = 0, _len = elems.length; _i < _len; _i++) {
            $char = elems[_i];
            if (!$char.showed) {
              continue;
            }
            $char.showed = false;
            _results1.push($char.css(this.cssSplashed()));
          }
          return _results1;
        }).call(this));
      }
      return _results;
    };

    UgoSlide.prototype.cssReflecting = function($el) {
      var key, ret, _, _ref;
      ret = $el.position();
      _ref = this.defaults;
      for (key in _ref) {
        _ = _ref[key];
        ret[key] = $el.css(key);
      }
      return ret;
    };

    UgoSlide.prototype.cssSplashed = function() {
      return $.extend(this.makeSplashPos(), this.defaults);
    };

    UgoSlide.prototype.makeSplashPos = function() {
      if (Math.random() < 0.5) {
        return {
          top: Math.random() < 0.5 ? -120 : this.size.height + 10,
          left: Math.random() * this.size.width
        };
      } else {
        return {
          top: Math.random() * this.size.height,
          left: Math.random() < 0.5 ? -120 : this.size.width + 10
        };
      }
    };

    return UgoSlide;

  })();

  window.UgoSlide = UgoSlide;

}).call(this);
