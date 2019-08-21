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

function autoResizeWidth (evnt, editRender, params) {
  let { $table, column } = params
  let { renderWidth: minWidth, renderHeight: minHeight } = column
  let inpElem = evnt.target
  let cell = inpElem.parentNode.parentNode ? inpElem.parentNode.parentNode.parentNode : null
  let maxWidth = editRender.maxWidth || cell.offsetWidth
  let maxHeight = editRender.maxHeight || 400
  $text.textContent = `${inpElem.value}\n`
  $text.style.maxWidth = `${maxWidth}px`
  if (!$text.parentNode) {
    $table.$el.appendChild($text)
  }
  let height = Math.max(minHeight, $text.offsetHeight + 4)
  inpElem.style.width = `${Math.min(maxWidth, Math.max(minWidth, $text.offsetWidth + 20))}px`
  inpElem.style.height = `${height > maxHeight ? maxHeight : height}px`
  inpElem.style.overflowY = height > maxWidth ? 'auto' : ''
}

/**
 * 渲染函数
 */
const renderMap = {
  XTextarea: {
    autofocus: '.vxe-textarea',
    renderEdit (h, editRender, params) {
      let { $table, column } = params
      let { model } = column
      let autoResizeEvent = evnt => {
        setTimeout(() => autoResizeWidth(evnt, editRender, params), 0)
      }
      return [
        h('div', {
          class: 'vxe-input--wrapper x-textarea',
          style: {
            height: `${column.renderHeight - 1}px`
          }
        }, [
          h('textarea', {
            class: 'vxe-textarea',
            domProps: {
              value: model.value
            },
            on: {
              input (evnt) {
                let inpElem = evnt.target
                model.update = true
                model.value = inpElem.value
              },
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
                    autoResizeEvent(evnt, editRender, params)
                  })
                } else {
                  autoResizeEvent(evnt, editRender, params)
                }
              },
              compositionstart: autoResizeEvent,
              compositionupdate: autoResizeEvent,
              compositionend: autoResizeEvent
            }
          })
        ])
      ]
    },
    renderCell (h, editRender, params) {
      let { row, column } = params
      return [
        h('span', {
          domProps: {
            innerHTML: XEUtils.escape(XEUtils.get(row, column.property)).replace(/\n/g, '<br>')
          }
        })
      ]
    }
  }
}

export const VXETablePluginTextarea = {
  install ({ renderer }) {
    // 添加到渲染器
    renderer.mixin(renderMap)
  }
}

if (typeof window !== 'undefined' && window.VXETable) {
  window.VXETable.use(VXETablePluginTextarea)
}

export default VXETablePluginTextarea
