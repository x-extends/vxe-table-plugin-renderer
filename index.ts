import { CreateElement, VNode } from 'vue'
import XEUtils from 'xe-utils'
import {
  VXETableCore,
  ColumnCellRenderOptions,
  ColumnCellRenderParams
} from 'vxe-table'

const defaultColors = ['#2F4554', '#C23531', '#61A0A8', '#D48265', '#91C7AE', '#749F83', '#CA8622', '#006699', '#BDA29A', '#546570']
const tmplOpts = { tmplRE: /\{([.\w[\]\s]+)\}/g }

function getDefaultColor (index: number) {
  return defaultColors[index % 10]
}

function toRGBLight (color: string, level: number) {
  const rgbs = color.match(/(\d{1,3}),\s?(\d{1,3}),\s?(\d{1,3})(,\s?(\d{1,3}))?/)
  if (rgbs) {
    const r = parseInt(rgbs[1])
    const g = parseInt(rgbs[2])
    const b = parseInt(rgbs[3])
    const alpha = parseInt(rgbs[5])
    return `rgb(${r + level},${g + level},${b + level}${alpha ? `,${alpha}` : ''})`
  }
  return null
}

function getStyleUnit (val?: number | string) {
  return XEUtils.isNumber(val) ? `${val}px` : val
}

function showTooltip (elem: HTMLElement, params: ColumnCellRenderParams, formatter: string, value: any) {
  const { row, column, $table } = params
  const content = XEUtils.isString(formatter) ? XEUtils.template(formatter, { value, row, column }, tmplOpts) : ''
  $table.openTooltip(elem, content)
}

function hideTooltip (elem: HTMLElement, params: ColumnCellRenderParams) {
  const { $table } = params
  if ($table) {
    $table.closeTooltip()
  }
}

function createBarVNs (h: CreateElement, params: ColumnCellRenderParams, renderOpts: ColumnCellRenderOptions) {
  const { row, column } = params
  const { props = {} } = renderOpts
  const { margin, colors = [], bar = {}, label: barLabel = {}, tooltip = {} } = props
  const { max } = bar
  const barHeight = getStyleUnit(bar.width)
  let cellValue = row[column.property] as any[]
  if (!XEUtils.isArray(cellValue)) {
    cellValue = [cellValue]
  }
  const numList: number[] = []
  let maxVal = 0
  cellValue.forEach((num) => {
    num = XEUtils.toNumber(num)
    maxVal = Math.max(maxVal, num)
    numList.push(num)
  })
  const ratio = Math.max(XEUtils.toNumber(max), maxVal) / 100
  const barList = numList.map(num => parseInt(`${num / ratio}`))
  return barList.map((barValue, index) => {
    let labelPosition
    if (barValue < 30) {
      labelPosition = 'outer'
    } else if (barValue > 70) {
      labelPosition = 'inner'
    }
    return h('span', {
      class: ['vxe-renderer-bar', {
        [`label--${labelPosition}`]: labelPosition
      }],
      style: {
        margin: getStyleUnit(margin),
        height: barHeight,
        lineHeight: barHeight
      }
    }, [
      h('span', {
        class: 'vxe-renderer-bar--chart',
        style: {
          width: `${barValue}%`,
          backgroundColor: colors[index] || getDefaultColor(index)
        },
        on: {
          mouseenter (evnt: MouseEvent) {
            const elem = evnt.currentTarget as HTMLSpanElement
            const hoverColor = toRGBLight(elem.style.backgroundColor, 10)
            if (hoverColor) {
              elem.style.backgroundColor = hoverColor
            }
            if (tooltip.formatter) {
              showTooltip(elem, params, tooltip.formatter, numList[index])
            }
          },
          mouseleave (evnt: MouseEvent) {
            const elem = evnt.currentTarget as HTMLSpanElement
            const reColor = colors[index] || getDefaultColor(index)
            elem.style.backgroundColor = reColor
            hideTooltip(elem, params)
          }
        }
      }),
      h('span', {
        class: 'vxe-renderer-bar--label',
        style: {
          color: barLabel.color
        }
      }, XEUtils.isString(barLabel.formatter) ? XEUtils.template(barLabel.formatter, { value: numList[index], row, column }, tmplOpts) : null)
    ])
  })
}

interface PieBlockItem {
  val: number;
  deg: number;
  index: number;
}

function parsePieAreas (blockList: PieBlockItem[], total: number) {
  const prves: PieBlockItem[] = []
  const nexts: PieBlockItem[] = []
  let countDeg = 0
  const ratio = total / 360
  blockList.forEach((item) => {
    item.deg = countDeg
    countDeg += parseInt(`${item.val / ratio}`)
    if (countDeg > 180 && item.deg <= 180) {
      const repairItem = Object.assign({}, item)
      prves.push(repairItem)
      item.deg = 180
    }
    if (countDeg > 180) {
      nexts.push(item)
    } else {
      prves.push(item)
    }
  })
  return { prves, nexts }
}

function createPieVNs (h: CreateElement, params: ColumnCellRenderParams, renderOptList: ColumnCellRenderOptions[], cellValue: any[]) {
  if (!XEUtils.isArray(cellValue)) {
    cellValue = [cellValue]
  }
  return renderOptList.map((renderOpts, renderIndex) => {
    const { row, column } = params
    const { props = {} } = renderOpts
    const { margin, colors = [], ring = {}, label: ringLabel = {}, tooltip = {} } = props
    let pieVals = cellValue[renderIndex] as any[]
    const pieDiameter = getStyleUnit(props.diameter)
    const ringDiameter = getStyleUnit(ring.diameter)
    const blockList: PieBlockItem[] = []
    let countVal = 0
    if (!XEUtils.isArray(pieVals)) {
      pieVals = [pieVals]
    }
    pieVals.forEach((val, index) => {
      val = XEUtils.toNumber(val)
      countVal += val
      blockList.push({ val, deg: 0, index })
    })
    const { prves: prveList, nexts: nextList } = parsePieAreas(blockList, countVal)
    const blockOns = {
      mouseenter (evnt: MouseEvent) {
        const elem = evnt.currentTarget as HTMLSpanElement & { parentNode: HTMLSpanElement & { parentNode: HTMLSpanElement } }
        const index = XEUtils.toNumber(elem.getAttribute('block'))
        const hoverColor = toRGBLight(elem.style.backgroundColor, 10)
        if (hoverColor) {
          XEUtils.arrayEach(elem.parentNode.parentNode.querySelectorAll(`.block-${index}`), (elem: any) => {
            elem.style.backgroundColor = hoverColor
          })
        }
        if (tooltip.formatter) {
          showTooltip(elem, params, tooltip.formatter, blockList[index].val)
        }
      },
      mouseleave (evnt: MouseEvent) {
        const elem = evnt.currentTarget as HTMLSpanElement & { parentNode: HTMLSpanElement & { parentNode: HTMLSpanElement } }
        const index = XEUtils.toNumber(elem.getAttribute('block'))
        const reColor = colors[index] || getDefaultColor(index)
        XEUtils.arrayEach(elem.parentNode.parentNode.querySelectorAll(`.block-${index}`), (elem: any) => {
          elem.style.backgroundColor = reColor
        })
        hideTooltip(elem, params)
      }
    }

    const pieVNs = [
      h('span', {
        class: 'vxe-renderer-pie--next-half'
      }, nextList.map((item) => {
        return h('span', {
          class: ['vxe-renderer-pie--block', `block-${item.index}`],
          style: {
            backgroundColor: colors[item.index] || getDefaultColor(item.index),
            transform: `rotate(${item.deg - 180}deg)`
          },
          attrs: {
            block: item.index
          },
          on: blockOns
        })
      })),
      h('span', {
        class: 'vxe-renderer-pie--prve-half'
      }, prveList.map((item) => {
        return h('span', {
          class: ['vxe-renderer-pie--block', `block-${item.index}`],
          style: {
            backgroundColor: colors[item.index] || getDefaultColor(item.index),
            transform: `rotate(${item.deg}deg)`
          },
          attrs: {
            block: item.index
          },
          on: blockOns
        })
      }))
    ]

    if (ringDiameter) {
      pieVNs.push(
        h('span', {
          class: 'vxe-renderer-pie--ring-bg',
          style: {
            width: ringDiameter,
            height: ringDiameter,
            backgroundColor: ring.color
          }
        }),
        h('span', {
          class: 'vxe-renderer-pie--ring-label',
          style: {
            color: ringLabel.color
          }
        }, XEUtils.isString(ringLabel.formatter) ? XEUtils.template(ringLabel.formatter, { value: row[column.property] || [], row, column }, tmplOpts) : null)
      )
    }

    return h('span', {
      class: 'vxe-renderer-pie',
      style: {
        margin: getStyleUnit(margin),
        width: pieDiameter,
        height: pieDiameter
      }
    }, pieVNs)
  })
}

/**
 * 基于 vxe-table 表格的扩展插件，提供一些常用的渲染器
 */
export const VXETablePluginRenderer = {
  install (vxetable: VXETableCore) {
    // 检查版本
    if (!/^(2|3)\./.test(vxetable.version)) {
      console.error('[vxe-table-plugin-renderer 3.x] Version vxe-table 3.x is required')
    }

    vxetable.renderer.mixin({
      bar: {
        renderDefault (h, renderOpts, params) {
          return createBarVNs(h, params, renderOpts)
        }
      },
      pie: {
        renderDefault (h, renderOpts, params) {
          const { row, column } = params
          const cellValue = row[column.property]
          return createPieVNs(h, params, [renderOpts], cellValue ? [cellValue] : [])
        }
      },
      pies: {
        renderDefault (h, renderOpts, params) {
          const { row, column } = params
          const cellValue = row[column.property]
          return createPieVNs(h, params, renderOpts.children || [], cellValue)
        }
      },
      rate: {
        renderDefault (h, renderOpts, params) {
          const { row, column } = params
          const { props = {} } = renderOpts
          const { colors = [] } = props
          const cellValue = XEUtils.toNumber(row[column.property])
          const rateVNs: VNode[] = []
          let lastColor: string
          XEUtils.range(0, XEUtils.toNumber(props.count) || 5).forEach((obj, index) => {
            const itemIndex = index + 1
            const isActive = cellValue >= itemIndex
            let itemColor: string
            if (isActive) {
              if (colors[itemIndex]) {
                lastColor = colors[itemIndex]
              }
              itemColor = lastColor || '#F7BA2A'
            } else {
              itemColor = colors[0] || '#E9E9E9'
            }
            const itemOns = {
              mouseenter (evnt: MouseEvent) {
                const elem = evnt.currentTarget as HTMLSpanElement
                const hoverColor = toRGBLight(elem.style.color, 10)
                if (hoverColor) {
                  elem.style.color = hoverColor
                }
              },
              mouseleave (evnt: MouseEvent) {
                const elem = evnt.currentTarget as HTMLSpanElement
                elem.style.color = itemColor
              }
            }
            rateVNs.push(
              h('span', {
                class: 'vxe-renderer-rate-item',
                style: {
                  color: itemColor
                },
                on: isActive ? itemOns : {}
              })
            )
          })
          return [
            h('div', {
              class: 'vxe-renderer-rate'
            }, rateVNs)
          ]
        }
      }
    })
  }
}

if (typeof window !== 'undefined' && window.VXETable && window.VXETable.use) {
  window.VXETable.use(VXETablePluginRenderer)
}

export default VXETablePluginRenderer
