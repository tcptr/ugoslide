class UgoSlide
  constructor: (options = {}) ->
    @options = $.extend {
      root: '.ugoslide'
      observe:
        fontSize: '10px'
        fontWeight: 'normal'
        fontStyle: 'normal'
        fontFamily: 'sans-serif'
        color: '#fff'
      scalable: true
    }, options

    @$root = $(@options.root)
    @pages = @$root.children('.ugoslide-page').map -> $(@)
    @wordElems = {}

    @initElements()
    @compile()

    setTimeout((=> @showAt 0), @pageDuration())

  pageDuration: ->
    if @options.scalable
      d = $('.ugoslide-page').css('transitionDuration')
      Number(d.substr(0, d.length-1)) * 1000
    else
      0

  initElements: ->
    if @$root.find('.ugoslide-navigator').length == 0
      @$root.append """
        <div class="ugoslide-navigator">
          <a href="#" class="ugoslide-prev">&lt;&lt;</a>
          <span class="ugoslide-current"></span>
          <a href="#" class="ugoslide-next">&gt;&gt;</a>
        </div>
      """

    if @$root.find('.ugoslide-words').length == 0
      @$root.append '<div class="ugoslide-words"></div>'

    @$words = @$root.find '.ugoslide-words'
    @$navigatorCurrent = $('.ugoslide-current')

    $('.ugoslide-prev').on 'click', => @showPrev()
    $('.ugoslide-next').on 'click', => @showNext()

    $(window).on 'keydown', (e) =>
      switch e.which
        when 37 then @showPrev()
        when 39 then @showNext()

    if @options.scalable
      textScale = =>
        size = Math.min(@$root[0].clientWidth, @$root[0].clientHeight) / 30
        @$root.css 'font-size', size

      $(window).on 'resize', =>
        textScale()
        setTimeout((=> @showCurrent()), @pageDuration())

      textScale()

  compile: ->
    eachTextNode = ($el, f) ->
      $el.contents().each ->
        switch @nodeType
          when 3 then f @
          when 1 then eachTextNode $(@), f

    wordCountsSum = {}

    for $el in @pages
      # 各テキストノードを字句単位のノードに変換
      eachTextNode $el, (el) =>
        return unless /\S/.test el.data
        html = @splitText el.data
        $(el).replaceWith html

      # 字句を数える
      wordCounts = {}
      $el.find('.ugoslide-word-base').each ->
        word = $(@).text()
        wordCounts[word] = (wordCounts[word] ? 0) + 1

      for k, count of wordCounts
        wordCountsSum[k] = Math.max(wordCountsSum[k] ? 0, count)

    # 必要な字句を初期化
    for word, count of wordCountsSum
      @wordElems[word] =
        for _ in [1..count]
          css = @cssSplashed()
          css.transitionDuration = @transitionDuration(word) + 's'

          $word = $ '<span />',
            class: 'ugoslide-word'
            text: word
            css: css
          $word.showed = false
          @$words.append $word
          $word

    # 文字色を退避
    $('.ugoslide-word-base').each ->
      $word = $(@)
      $word.data 'color', $word.css('color')
      $word.css 'color', 'rgba(0,0,0,0)'

  splitText: (str) ->
    OPEN = '<span class="ugoslide-word-base">'
    CLOSE = '</span>'
    ret = ""
    tmp = ""
    group = @characterGroup str.charCodeAt(0)
    i = 0

    push = ->
      return if tmp.length == 0
      ret += if group == 'space' then tmp else OPEN + tmp + CLOSE
      tmp = ""

    for i in [0...str.length]
      g = @characterGroup(str.charCodeAt(i), group)
      if g != group
        push()
        group = g
      tmp += str.charAt i

    push()
    ret

  showAt: (index, force = false) ->
    return if index == @index && !force

    @pages[@index].css 'opacity', 0 if @index?
    @index = index
    return unless index?

    $page = @pages[index]
    $page.css 'opacity', 1
    @$navigatorCurrent.html "#{@index+1}/#{@pages.length}"

    wordElems = {}
    wordElems[k] = $.merge [], arr for k, arr of @wordElems

    # 表示する要素に反映
    $page.find('.ugoslide-word-base').each (_, el) =>
      $el = $(el)
      $word = @choiceRandom wordElems[$el.text()]
      $word.showed = true
      $word.css @cssReflecting($el)

    # 表示しない要素に反映
    for _, ls of wordElems
      for $word in ls
        continue unless $word.showed
        $word.showed = false
        $word.css @cssSplashed()

    false

  cssReflecting: ($el) ->
    elOffset = $el.offset()
    rootOffset = @$root.offset()

    ret =
      top: elOffset.top - rootOffset.top
      left: elOffset.left - rootOffset.left
    ret[key] = $el.css key for key, _ of @options.observe
    ret.color = $el.data 'color'
    ret

  cssSplashed: ->
    $.extend @makeSplashPos(), @options.observe

  makeSplashPos: ->
    # opacity: 0をつけて適当に飛ばしてもいいが, さらに重くなる
    if Math.random() < 0.5
      top: if Math.random() < 0.5 then -20 else @$root[0].clientHeight + 10
      left: Math.random() * @$root[0].clientWidth
    else
      top: Math.random() * @$root[0].clientHeight
      left: if Math.random() < 0.5 then -120 else @$root[0].clientWidth + 10

  choiceSequence: (arr) ->
    arr.shift()

  choiceRandom: (arr) ->
    k = Math.floor(Math.random()*arr.length)
    ret = arr[k]
    arr.splice(k, 1)
    ret

  transitionDuration: (word) ->
    Math.max(1.3 - word.length / 12, 0.2)

  characterGroup: (code, current) ->
    # ひらがな, カタカナ, 漢字, アルファベットあたりをサポート
    if code == 0x20 || code == 0x3040
      'space'
    else if 0x21 <= code && code <= 0x3f ||
            0x3a <= code && code <= 0x40 ||
            0x5b <= code && code <= 0x60 ||
            0x7b <= code && code <= 0x7f
      'symbol'
    else if 0x30 <= code && code <= 0x39
      'number'
    else if 0x41 <= code && code <= 0x5a ||
            0x61 <= code && code <= 0x7a
      'alphabet'
    else if 0x3041 <= code && code <= 0x309f ||
            current == 'hiragana' && code == 0x30fc
      'hiragana'
    else if 0x30a0 <= code && code <= 0x30ff
      'katakana'
    else if 0x3400 <= code && code <= 0x9fff
      'kanji'
    else
      'others'

  showCurrent: ->
    return unless @index?
    @showAt @index, true

  showPrev: ->
    return unless @index?
    @showAt((@pages.length + @index - 1) % @pages.length)

  showNext: ->
    return unless @index?
    @showAt((@index + 1) % @pages.length)

window.UgoSlide = UgoSlide

