$ ->
  $('code').each -> hljs.highlightBlock this

  slide = new UgoSlide $('.slide'),
    'font-size': '10px'
    'font-weight': 'normal'
    'font-style': 'normal'
    'font-family': 'sans-serif'
    'color': '#fff'

  slide.idx = 0

  slide.updatePage = ->
    $('.navigator .current').html "#{@idx+1}/#{@pages.length}"

  slide.showPrev = ->
    @idx = (@pages.length + @idx - 1) % @pages.length
    @showAt @idx
    @updatePage()

  slide.showNext = ->
    @idx = (@idx + 1) % @pages.length
    @showAt @idx
    @updatePage()

  slide.updatePage()

  setTimeout ->
    slide.showAt 0

    $('.navigator .prev').on 'click', (e) ->
      e.preventDefault()
      slide.showPrev()

    $('.navigator .next').on 'click', (e) ->
      e.preventDefault()
      slide.showNext()

    $(window).on 'keydown', (e) ->
      switch e.which
        when 37 then slide.showPrev()
        when 39 then slide.showNext()

  , 500

