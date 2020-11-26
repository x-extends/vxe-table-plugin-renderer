/* eslint-disable no-unused-vars */
import { CreateElement } from 'vue'
import XEUtils from 'xe-utils/ctor'
import {
  VXETable,
  ColumnCellRenderOptions,
  ColumnCellRenderParams
} from 'vxe-table/lib/vxe-table'
/* eslint-enable no-unused-vars */

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
  const { row, $table } = params
  const content = XEUtils.isString(formatter) ? XEUtils.template(formatter, { value, row }, tmplOpts) : null
  $table.openTooltip(elem, content)
}

function hideTooltip (elem: HTMLElement, params: ColumnCellRenderParams) {
  const { $table } = params
  $table.clostTooltip()
}

function createBarVNs (h: CreateElement, params: ColumnCellRenderParams, renderOpts: ColumnCellRenderOptions) {
  const { row, column, $table } = params
  const { props = {} } = renderOpts
  const { margin, colors = [], bar = {}, label: barLabel = {}, tooltip = {} } = props
  const { max } = bar
  let barHeight = getStyleUnit(bar.width)
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
      }, XEUtils.isString(barLabel.formatter) ? XEUtils.template(barLabel.formatter, { value: numList[index], row }, tmplOpts) : null)
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
          XEUtils.arrayEach(elem.parentNode.parentNode.querySelectorAll(`.block-${index}`), elem => {
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
        XEUtils.arrayEach(elem.parentNode.parentNode.querySelectorAll(`.block-${index}`), elem => {
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
        }, XEUtils.isString(ringLabel.formatter) ? XEUtils.template(ringLabel.formatter, { value: row[column.property] || [], row }, tmplOpts) : null)
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
 * 渲染函数
 */
const renderMap = {
  bar: {
    renderDefault (h: CreateElement, renderOpts: ColumnCellRenderOptions, params: ColumnCellRenderParams) {
      return createBarVNs(h, params, renderOpts)
    }
  },
  pie: {
    renderDefault (h: CreateElement, renderOpts: ColumnCellRenderOptions, params: ColumnCellRenderParams) {
      const { row, column } = params
      let cellValue = row[column.property]
      return createPieVNs(h, params, [renderOpts], cellValue ? [cellValue] : [])
    }
  },
  pies: {
    renderDefault (h: CreateElement, renderOpts: ColumnCellRenderOptions, params: ColumnCellRenderParams) {
      const { row, column } = params
      let cellValue = row[column.property]
      return createPieVNs(h, params, renderOpts.children || [], cellValue)
    }
  },
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
