$ ->
  $('code').each -> hljs.highlightBlock this

  slide = new UgoSlide $('.slide')

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
      slide.showPrev()
      false

    $('.navigator .next').on 'click', (e) ->
      slide.showNext()
      false

    $(window).on 'keydown', (e) ->
      switch e.which
        when 37 then slide.showPrev()
        when 39 then slide.showNext()

    setInterval ->
      return if Math.random() > 0.02
      slide.showAt slide.idx
    , 100

  , 500

