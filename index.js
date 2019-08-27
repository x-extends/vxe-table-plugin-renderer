import XEUtils from 'xe-utils'

function getCursorPosition (textarea) {
  let rangeData = { text: '', start: 0, end: 0 }
  if (textarea.setSelectionRange) {
    rangeData.start = textarea.selectionStart
    rangeData.end = textarea.selectionEnd
    rangeData.text = (rangeData.start !== rangeData.end) ? textarea.value.substring(rangeData.start, rangeData.end) : ''
  } else if (document.selection) {
    let index = 0
    let range = document.selection.createRange()
    let textRange = document.body.createTextRange()
    textRange.moveToElementText(textarea)
    rangeData.text = range.text
    rangeData.bookmark = range.getBookmark()
    for (; textRange.compareEndPoints('StartToStart', range) < 0 && range.moveStart('character', -1) !== 0; index++) {
      if (textarea.value.charAt(index) === '\n') {
        index++
      }
    }
    rangeData.start = index
    rangeData.end = rangeData.text.length + rangeData.start
  }
  return rangeData
}

function setCursorPosition (textarea, rangeData) {
  if (textarea.setSelectionRange) {
    textarea.focus()
    textarea.setSelectionRange(rangeData.start, rangeData.end)
  } else if (textarea.createTextRange) {
    let textRange = textarea.createTextRange()
    if (textarea.value.length === rangeData.start) {
      textRange.collapse(false)
      textRange.select()
    } else {
      textRange.moveToBookmark(rangeData.bookmark)
      textRange.select()
    }
  }
}

const $text = document.createElement('span')
$text.className = 'x-textarea--resize'
$text.style.visibility = 'hidden'
$text.style.zIndex = '-1'
$text.style.position = 'absolute'

function autoResizeTextarea (evnt, renderOpts, params) {
  let { props = {} } = renderOpts
  let { $table, column } = params
  let { renderWidth: minWidth, renderHeight: minHeight } = column
  let inpElem = evnt.target
  // let cell = inpElem.parentNode.parentNode ? inpElem.parentNode.parentNode.parentNode : null
  let maxWidth = props.maxWidth || 600
  let maxHeight = props.maxHeight || 400
  $text.textContent = `${inpElem.value}\n`
  $text.style.maxWidth = `${maxWidth}px`
  if (!$text.parentNode) {
    $table.$el.appendChild($text)
  }
  let height = Math.min(maxHeight, $text.offsetHeight + 4)
  inpElem.style.width = `${Math.min(maxWidth, Math.max(minWidth, $text.offsetWidth + 20))}px`
  inpElem.style.height = `${height < minHeight ? minHeight : height}px`
  inpElem.style.overflowY = height > maxWidth ? 'auto' : ''
}

function getEvents (renderOpts, params) {
  let { events } = renderOpts
  let { $table, column } = params
  let { model } = column
  let on = {
    input (evnt) {
      let cellValue = evnt.target.value
      model.update = true
      model.value = cellValue
      $table.updateStatus(params, cellValue)
    }
  }
  if (events) {
    XEUtils.assign(on, XEUtils.objectMap(events, cb => function () {
      cb.apply(null, [params].concat.apply(params, arguments))
    }))
  }
  return on
}

/**
 * 渲染函数
 */
const renderMap = {
  XInput: {
    autofocus: '.x-input',
    renderEdit (h, renderOpts, params) {
      let { props = {}, attrs, events = {} } = renderOpts
      let { column } = params
      let { model } = column
      let { prefixIcon, suffixIcon } = props
      let { prefixClick, suffixClick } = events
      return [
        h('div', {
          class: ['x-input--wrapper', {
            'is--prefix': props.prefixIcon,
            'is--suffix': props.suffixIcon
          }],
          style: {
            height: `${column.renderHeight - 1}px`
          }
        }, [
          prefixIcon ? h('i', {
            class: ['x-input--prefix', prefixIcon, {
              'is--trigger': prefixClick
            }],
            on: prefixClick ? {
              click: evnt => prefixClick(params, evnt)
            } : null
          }) : null,
          h('input', {
            class: 'x-input',
            attrs,
            domProps: {
              value: model.value
            },
            on: getEvents(renderOpts, params)
          }),
          suffixIcon ? h('i', {
            class: ['x-input--suffix', suffixIcon, {
              'is--trigger': suffixClick
            }],
            on: suffixClick ? {
              click: evnt => suffixClick(params, evnt)
            } : null
          }) : null
        ])
      ]
    }
  },
  XTextarea: {
    autofocus: '.x-textarea',
    renderEdit (h, renderOpts, params) {
      let { attrs, events } = renderOpts
      let { $table, column } = params
      let { model } = column
      let autoResizeEvent = evnt => {
        setTimeout(() => autoResizeTextarea(evnt, renderOpts, params), 0)
        if (events && events[evnt.type]) {
          events[evnt.type](params, evnt)
        }
      }
      return [
        h('div', {
          class: 'x-textarea--wrapper',
          style: {
            height: `${column.renderHeight - 1}px`
          }
        }, [
          h('textarea', {
            class: 'x-textarea',
            attrs,
            domProps: {
              value: model.value
            },
            on: XEUtils.assign(getEvents(renderOpts, params), {
              cut: autoResizeEvent,
              paste: autoResizeEvent,
              drop: autoResizeEvent,
              focus: autoResizeEvent,
              keydown (evnt) {
                if (evnt.keyCode === 13 && (!$table.keyboardConfig || evnt.altKey)) {
                  evnt.preventDefault()
                  evnt.stopPropagation()
                  let inpElem = evnt.target
                  let rangeData = getCursorPosition(inpElem)
                  let pos = rangeData.end
                  let cellValue = inpElem.value
                  cellValue = `${cellValue.slice(0, pos)}\n${cellValue.slice(pos, cellValue.length)}`
                  inpElem.value = cellValue
                  model.update = true
                  model.value = cellValue
                  setTimeout(() => {
                    rangeData.start = rangeData.end = ++pos
                    setCursorPosition(inpElem, rangeData)
                    autoResizeEvent(evnt, renderOpts, params)
                  })
                } else {
                  autoResizeEvent(evnt, renderOpts, params)
                }
              },
              compositionstart: autoResizeEvent,
              compositionupdate: autoResizeEvent,
              compositionend: autoResizeEvent
            })
          })
        ])
      ]
    },
    renderCell (h, renderOpts, params) {
      let { row, column } = params
      return [
        h('span', {
          class: 'x-textarea--content'
        }, XEUtils.get(row, column.property))
      ]
    }
  }
}

export const VXETablePluginRenderer = {
  install ({ renderer }) {
    renderer.mixin(renderMap)
  }
}

if (typeof window !== 'undefined' && window.VXETable) {
  window.VXETable.use(VXETablePluginRenderer)
}

export default VXETablePluginRenderer
