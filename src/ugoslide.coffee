class UgoSlide
  OPEN = '<span class="prechar">'
  CLOSE = '</span>'

  constructor: (@$root, @defaults) ->
    @pages = @$root.children('.page').map -> $(this)
    @size =
      width: @$root[0].clientWidth
      height: @$root[0].clientHeight
    @choice = @choiceSequence
    @initStyle()
    @init()

  initStyle: ->
    @$root.css 'position', 'relative' if @$root.css('position') == 'static'
    @$root.css 'overflow', 'hidden'

    for $page in @pages
      $page.css
        position: 'absolute'
        visibility: 'hidden'

  init: ->
    mergedChars = {}

    for $el in @pages
      # 各要素のテキストノードを文字単位に分割
      @replaceTextNode $el

      # 各文字を数え, 統合, 必要な文字数を算出
      for char, count of @analyze $el
        mergedChars[char] = Math.max(mergedChars[char] ? 0, count)

    @charElems = {}

    # 必要な文字を初期化
    for char, count of mergedChars
      @charElems[char] =
        for _ in [1..count]
          $char = $('<span class="ugoslide-char">' + char + '</span>')
          $char.showed = false

          $char.css 'position', 'absolute'
          $char.css @cssSplashed()
          $char.css 'transition', "#{1.3 - char.length / 12}s ease-out"

          @$root.append $char
          $char

  replaceTextNode: ($elem) ->
    $elem.contents().each (_, el) =>
      switch el.nodeType
        when 3
          return unless /\S/.test el.data
          text = @splitChar el.data
          $(el).replaceWith text
        when 1
          @replaceTextNode $(el)

  analyze: ($elem) ->
    ret = {}

    $elem.find('.prechar').each (_, el) =>
      char = $(el).text()
      ret[char] = (ret[char] ? 0) + 1

    ret

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

  # デフォルトでは単語単位
  splitChar: (str) ->
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
    $page = @pages[idx]

    # 一段階コピー
    fromElems = {}
    fromElems[char] = $.merge [], elems for char, elems of @charElems

    # 表示する要素に反映
    $page.find('.prechar').each (_, el) =>
      $el = $(el)
      $char = @choice fromElems[$el.text()]
      $char.showed = true
      $char.css @cssReflecting($el)

    # 表示しない要素に反映
    for _, elems of fromElems
      for $char in elems
        continue unless $char.showed
        $char.showed = false
        $char.css @cssSplashed()

  cssReflecting: ($el) ->
    ret = $el.position()
    ret[key] = $el.css key for key, _ of @defaults
    ret

  cssSplashed: ->
    $.extend @makeSplashPos(), @defaults

  makeSplashPos: ->
    # opacity: 0をつけて適当に飛ばしてもいいが, さらに重くなる
    if Math.random() < 0.5
      top: if Math.random() < 0.5 then -120 else @size.height + 10
      left: Math.random() * @size.width
    else
      top: Math.random() * @size.height
      left: if Math.random() < 0.5 then -120 else @size.width + 10

window.UgoSlide = UgoSlide

