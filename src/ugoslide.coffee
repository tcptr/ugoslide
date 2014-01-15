class UgoSlide
  OPEN = '<span class="prechar">'
  CLOSE = '</span>'

  constructor: (@$root, @defaults) ->
    @pages = @$root.children('.page').map -> $(this)
    @size =
      width: @$root[0].clientWidth
      height: @$root[0].clientHeight
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

  # デフォルトでは, 上から順番に取るため同じような要素が同じまま残る
  choice: (arr) ->
    arr.shift()

  # デフォルトでは単語単位
  splitChar: (str) ->
    OPEN + str.split(/(\s+)/).join(CLOSE + OPEN) + CLOSE

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

