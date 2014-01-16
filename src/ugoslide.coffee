$.fn.extend
  offsetFrom: ($el) ->
    from = $el.offset()
    to = @offset()

    top: to.top - from.top
    left: to.left - from.left

  eachTextNode: (f) ->
    @contents().each ->
      switch @nodeType
        when 3 then f.call @, @
        when 1 then $(@).eachTextNode f

class UgoSlide
  constructor: (@$root, @cssWord = WORD_DEFAULTS) ->
    @pages = @$root.children('.page').map -> $(@)
    @wordElems = {}

    @rootSize =
      width: @$root[0].clientWidth
      height: @$root[0].clientHeight

    @initStyle()
    @init()

  initStyle: ->
    @$words = $ '<div />',
      class: 'ugoline-words'
      css:
        position: 'absolute'
        overflow: 'hidden'
        width: @rootSize.width
        height: @rootSize.height
        margin: 0
        zIndex: @pages.length + 1

    @$root.append @$words
    @$root.css 'position', 'relative' if @$root.css('position') == 'static'

    for $page, i in @pages
      $page.css
        position: 'absolute'
        opacity: 0
        zIndex: i
        transition: '1.5s'

  init: ->
    wordCountsSum = {}

    for $el in @pages
      # 各テキストノードを字句単位のノードに変換
      $el.eachTextNode (el) =>
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
          $word = $ '<span />',
            class: 'ugoslide-word'
            text: word
            css: $.extend {
              position: 'absolute'
              margin: 0
              padding: 0
              userSelect: 'none'
              transition: "#{1.3 - word.length / 12}s ease-out"
            }, @cssSplashed(@cssWord)

          $word.showed = false
          @$words.append $word
          $word

    $('.ugoslide-word-base').each ->
      $word = $(@)
      $word.data 'color', $word.css('color')
      $word.css 'color', 'rgba(0,0,0,0)'

  choiceSequence: (arr) ->
    arr.shift()

  choiceRandom: (arr) ->
    k = Math.floor(Math.random()*arr.length)
    ret = arr[k]
    arr.splice(k, 1)
    ret

  # ひらがな, カタカナ, 漢字, アルファベットあたりをサポート
  characterGroup: (code, current) ->
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

  splitText: (str) ->
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

  showAt: (idx) ->
    $page.css 'opacity', 0 for $page in @pages
    $page = @pages[idx]
    $page.css 'opacity', 1

    wordElems = {}
    wordElems[k] = $.merge [], arr for k, arr of @wordElems

    # 表示する要素に反映
    $page.find('.ugoslide-word-base').each (_, el) =>
      $el = $(el)
      $word = @choiceRandom wordElems[$el.text()]
      $word.showed = true
      $word.css @cssReflecting($el, @cssWord)

    # 表示しない要素に反映
    for _, ls of wordElems
      for $word in ls
        continue unless $word.showed
        $word.showed = false
        $word.css @cssSplashed(@cssWord)

  cssReflecting: ($el, base) ->
    ret = $el.offsetFrom @$root
    ret[key] = $el.css key for key, _ of base
    ret.color = $el.data 'color'
    ret

  cssSplashed: (base) ->
    $.extend @makeSplashPos(), base

  makeSplashPos: ->
    # opacity: 0をつけて適当に飛ばしてもいいが, さらに重くなる
    if Math.random() < 0.5
      top: if Math.random() < 0.5 then -20 else @rootSize.height + 10
      left: Math.random() * @rootSize.width
    else
      top: Math.random() * @rootSize.height
      left: if Math.random() < 0.5 then -120 else @rootSize.width + 10

  OPEN = '<span class="ugoslide-word-base">'
  CLOSE = '</span>'

  WORD_DEFAULTS =
    fontSize: '10px'
    fontWeight: 'normal'
    fontStyle: 'normal'
    fontFamily: 'sans-serif'
    color: '#fff'

window.UgoSlide = UgoSlide

