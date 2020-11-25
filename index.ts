/* eslint-disable no-unused-vars */
import { CreateElement } from 'vue'
import XEUtils from 'xe-utils/ctor'
import {
  VXETable,
  ColumnCellRenderOptions,
  ColumnCellRenderParams
} from 'vxe-table/lib/vxe-table'
/* eslint-enable no-unused-vars */

const defaultLineColors = ['#C23531', '#2F4554', '#91C7AE', '#D48265', '#FFDB5C', '#006699', '#BDA29A', '#797B7F']

function createProgressBarVNs (h: CreateElement, params: ColumnCellRenderParams, renderOptList: ColumnCellRenderOptions[]) {
  const { row, column } = params
  let cellValue = row[column.property]
  if (!XEUtils.isArray(cellValue)) {
    cellValue = [cellValue]
  }
  return renderOptList.map((renderOpts, index) => {
    const { props = {} } = renderOpts
    const { margin, lineWidth, lineColor, lineBgColor } = props
    const progressValue = Math.min(100, XEUtils.toNumber(cellValue[index]))
    let barMargin = XEUtils.isNumber(margin) ? `${margin}px` : margin
    let barHeight = XEUtils.isNumber(lineWidth) ? `${lineWidth}px` : lineWidth
    let labelPosition
    if (progressValue < 30) {
      labelPosition = 'outer'
    } else if (progressValue > 70) {
      labelPosition = 'inner'
    }
    return h('span', {
      class: ['vxe-renderer--progress-bar', {
        [`label--${labelPosition}`]: labelPosition
      }],
      style: {
        margin: barMargin,
        height: barHeight,
        lineHeight: barHeight,
        backgroundColor: lineBgColor
      }
    }, [
      h('span', {
        class: 'vxe-renderer--progress-bar-chart',
        style: {
          width: `${progressValue}%`,
          backgroundColor: lineColor || defaultLineColors[index]
        }
      }),
      h('span', {
        class: 'vxe-renderer--progress-bar-label'
      }, `${progressValue}%`)
    ])
  })
}

function createProgressRingVNs (h: CreateElement, params: ColumnCellRenderParams, renderOptList: ColumnCellRenderOptions[]) {
  const { row, column } = params
  let cellValue = row[column.property]
  if (!XEUtils.isArray(cellValue)) {
    cellValue = [cellValue]
  }
  return renderOptList.map((renderOpts, index) => {
    const { props = {} } = renderOpts
    const { width, height, margin, labelColor, lineColor, lineBgColor, hollowColor } = props
    const progressValue = Math.min(100, XEUtils.toNumber(cellValue[index]))
    let barMargin = XEUtils.isNumber(margin) ? `${margin}px` : margin
    let halfRing = 0
    let maskRing = 0
    if (progressValue) {
      if (progressValue > 50) {
        halfRing = XEUtils.floor((progressValue - 50) * 3.6)
        maskRing = 180
      } else {
        maskRing = XEUtils.floor(progressValue * 3.6)
      }
    }
    return h('span', {
      class: 'vxe-renderer--progress-ring',
      style: {
        margin: barMargin,
        width: XEUtils.isNumber(width) ? `${width}px` : width,
        height: XEUtils.isNumber(height) ? `${height}px` : height,
        backgroundColor: lineBgColor
      }
    }, [
      h('span', {
        class: 'vxe-renderer--progress-ring-piece-prev',
        style: {
          backgroundColor: lineColor || defaultLineColors[index]
        }
      }),
      h('span', {
        class: ['vxe-renderer--progress-ring-piece-naxt', {
          'is--half': halfRing
        }],
        style: {
          backgroundColor: lineColor || defaultLineColors[index],
          transform: `rotate(${halfRing}deg)`
        }
      }),
      h('span', {
        class: 'vxe-renderer--progress-ring-mask',
        style: {
          backgroundColor: lineBgColor,
          transform: `rotate(${maskRing}deg)`
        }
      }),
      h('span', {
        class: 'vxe-renderer--progress-ring-hollow',
        style: {
          backgroundColor: hollowColor
        }
      }),
      h('span', {
        class: 'vxe-renderer--progress-ring-label',
        style: {
          color: labelColor
        }
      }, `${progressValue}%`)
    ])
  })
}

/**
 * 渲染函数
 */
const renderMap = {
  ProgressBar: {
    renderDefault (h: CreateElement, renderOpts: ColumnCellRenderOptions, params: ColumnCellRenderParams) {
      return createProgressBarVNs(h, params, [renderOpts])
    }
  },
  ProgressBars: {
    renderDefault (h: CreateElement, renderOpts: ColumnCellRenderOptions, params: ColumnCellRenderParams) {
      return createProgressBarVNs(h, params, renderOpts.children || [])
    }
  },
  ProgressRing: {
    renderDefault (h: CreateElement, renderOpts: ColumnCellRenderOptions, params: ColumnCellRenderParams) {
      return createProgressRingVNs(h, params, [renderOpts])
    }
  },
  ProgressRings: {
    renderDefault (h: CreateElement, renderOpts: ColumnCellRenderOptions, params: ColumnCellRenderParams) {
      return createProgressRingVNs(h, params, renderOpts.children || [])
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
