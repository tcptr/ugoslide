$.fn.extend
  positionFrom: ($el) ->
    from = $el.offset()
    to = @offset()

    top: to.top - from.top
    left: to.left - from.left

  eachTextNode: (f) ->
    @contents().each ->
      switch @nodeType
        when 3 then f.call @, @
        when 1 then $(@).eachTextNode f

  tree: (f, depth = 0) ->
    depth += 1
    @children().each ->
      f.call @, @, depth
      $(@).tree f, depth

class UgoSlide
  constructor: (@$root, @cssWord = WORD_DEFAULTS, @cssNode = NODE_DEFAULTS) ->
    @pages = @$root.children('.page').map -> $(@)
    @wordElems = {}
    @nodeElems = {}

    @rootSize =
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
    nodeCountsSum = {}
    wordCountsSum = {}

    mergeCount = (from, to) ->
      to[k] = Math.max(to[k] ? 0, count) for k, count of from

    for $el in @pages
      nodeCounts = {}
      wordCounts = {}

      # 各ノードの数を数える
      $el.tree (el, depth) =>
        key = "#{el.tagName}-#{depth}"
        nodeCounts[key] = (nodeCounts[key] ? 0) + 1
        $(el).addClass 'ugoslide-node-base'
        # TODO nodeのz-indexに対応していない

      # 各テキストノードを字句単位のノードに変換
      $el.eachTextNode (el) =>
        html = @splitText el.data
        $(el).replaceWith html

      # 字句を数える
      $el.find('.ugoslide-word-base').each ->
        word = $(@).text()
        wordCounts[word] = (wordCounts[word] ? 0) + 1

      # 必要な字句/ノード数を算出
      mergeCount nodeCounts, nodeCountsSum
      mergeCount wordCounts, wordCountsSum

    # 必要なノードを初期化
    for key, count of nodeCountsSum
      [tagName, depth] = key.split(/-/)
      @nodeElems[key] =
        for _ in [1..count]
          $node = $ "<#{tagName} />",
            class: 'ugoslide-node'
            css: $.extend {
              position: 'absolute'
              margin: 0
              padding: 0
              zIndex: depth
              transition: "1.0s ease-out"
            }, @cssSplashed(@cssNode)

          $node.showed = false
          @$root.append $node
          $node

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
              zIndex: 9999
              transition: "#{1.3 - word.length / 12}s ease-out"
            }, @cssSplashed(@cssWord)

          $word.showed = false
          @$root.append $word
          $word

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
    $page = @pages[idx]

    copy = (dic) ->
      ret = {}
      ret[k] = $.merge [], arr for k, arr of dic
      ret

    wordElems = copy @wordElems
    nodeElems = copy @nodeElems

    # 表示する要素に反映
    $page.find('.ugoslide-word-base').each (_, el) =>
      $el = $(el)
      $word = @choiceRandom wordElems[$el.text()]
      $word.showed = true
      $word.css @cssReflecting($el, @cssWord)

    $page.tree (el, depth) =>
      $el = $(el)
      return unless $el.hasClass 'ugoslide-node-base'
      $node = @choiceSequence nodeElems["#{el.tagName}-#{depth}"]
      $node.showed = true
      $node.css @cssReflecting($el, @cssNode)

    # 表示しない要素に反映
    for _, ls of wordElems
      for $word in ls
        continue unless $word.showed
        $word.showed = false
        $word.css @cssSplashed(@cssWord)

    for _, ls of nodeElems
      for $node in ls
        continue unless $node.showed
        $node.showed = false
        $node.css @cssSplashed(@cssNode)

  cssReflecting: ($el, base) ->
    ret = $el.positionFrom @$root
    ret[key] = $el.css key for key, _ of base
    ret

  cssSplashed: (base) ->
    $.extend @makeSplashPos(), base

  makeSplashPos: ->
    # opacity: 0をつけて適当に飛ばしてもいいが, さらに重くなる
    if Math.random() < 0.5
      top: if Math.random() < 0.5 then -120 else @rootSize.height + 10
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

  NODE_DEFAULTS =
    width: 0
    height: 0
    paddingLeft: 0
    paddingRight: 0
    paddingTop: 0
    paddingBottom: 0
    backgroundColor: '#fff'
    borderLeftColor: '#fff'
    borderRightColor: '#fff'
    borderTopColor: '#fff'
    borderBottomColor: '#fff'
    borderLeftWidth: 0
    borderTopWidth: 0
    borderBottomWidth: 0
    borderRightWidth: 0
    borderLeftStyle: 'solid'
    borderTopStyle: 'solid'
    borderBottomStyle: 'solid'
    borderRightStyle: 'solid'

window.UgoSlide = UgoSlide

