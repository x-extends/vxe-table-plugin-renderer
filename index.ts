import XEUtils from 'xe-utils/ctor'
import { VXETable } from 'vxe-table/lib/vxe-table'

interface posRangeData {
  text: string;
  start: number;
  end: number;
}

function getCursorPosition (textarea: HTMLTextAreaElement): posRangeData {
  let rangeData: posRangeData = { text: '', start: 0, end: 0 }
  if (XEUtils.isFunction(textarea.setSelectionRange)) {
    rangeData.start = textarea.selectionStart
    rangeData.end = textarea.selectionEnd
  }
  return rangeData
}

function setCursorPosition (textarea: HTMLTextAreaElement, rangeData: posRangeData) {
  if (XEUtils.isFunction(textarea.setSelectionRange)) {
    textarea.focus()
    textarea.setSelectionRange(rangeData.start, rangeData.end)
  }
}

var $text: HTMLSpanElement
if (typeof document !== 'undefined') {
  $text = document.createElement('span')
  $text.className = 'x-textarea--resize'
  $text.style.visibility = 'hidden'
  $text.style.zIndex = '-1'
  $text.style.position = 'absolute'
}

function autoResizeTextarea (evnt: any, renderOpts: any, params: any) {
  let { props = {} } = renderOpts
  let { $table, column } = params
  let { renderWidth: minWidth, renderHeight: minHeight } = column
  let inpElem: HTMLInputElement = evnt.target
  // let cell = inpElem.parentNode.parentNode ? inpElem.parentNode.parentNode.parentNode : null
  let maxWidth: number = props.maxWidth || 600
  let maxHeight: number = props.maxHeight || 400
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

function getEvents (renderOpts: any, params: any) {
  let { events } = renderOpts
  let { $table, column } = params
  let { model } = column
  let on = {
    input (evnt: any) {
      let cellValue = evnt.target.value
      model.update = true
      model.value = cellValue
      $table.updateStatus(params, cellValue)
    }
  }
  if (events) {
    XEUtils.assign(on, XEUtils.objectMap(events, (cb: Function) => function (...args: any[]) {
      cb.apply(null, [params].concat.apply(params, args))
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
    renderEdit (h: Function, renderOpts: any, params: any) {
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
              click: (evnt: any) => prefixClick(params, evnt)
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
              click: (evnt: any) => suffixClick(params, evnt)
            } : null
          }) : null
        ])
      ]
    }
  },
  XTextarea: {
    autofocus: '.x-textarea',
    renderEdit (h: Function, renderOpts: any, params: any) {
      let { attrs, events } = renderOpts
      let { $table, column } = params
      let { model } = column
      let autoResizeEvent = (evnt: any) => {
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
              keydown (evnt: any) {
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
                    autoResizeEvent(evnt)
                  })
                } else {
                  autoResizeEvent(evnt)
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
    renderCell (h: Function, renderOpts: any, params: any) {
      let { row, column } = params
      return [
        h('span', {
          class: 'x-textarea--content'
        }, XEUtils.get(row, column.property))
      ]
    }
  }
}

/**
 * 基于 vxe-table 表格的增强插件，提供一些常用的渲染器
 */
export const VXETablePluginRenderer = {
  install (xtable: typeof VXETable) {
    xtable.renderer.mixin(renderMap)
  }
}

if (typeof window !== 'undefined' && window.VXETable) {
  window.VXETable.use(VXETablePluginRenderer)
}

export default VXETablePluginRenderer
