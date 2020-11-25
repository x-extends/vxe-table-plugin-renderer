/* eslint-disable no-unused-vars */
import { CreateElement } from 'vue'
import XEUtils from 'xe-utils/ctor'
import {
  VXETable,
  ColumnCellRenderOptions,
  ColumnCellRenderParams
} from 'vxe-table/lib/vxe-table'
/* eslint-enable no-unused-vars */

/**
 * 渲染函数
 */
const renderMap = {
  ProgressBar: {
    renderDefault (h: CreateElement, renderOpts: ColumnCellRenderOptions, params: ColumnCellRenderParams) {
      const { row, column } = params
      const { props = {} } = renderOpts
      const { lineWidth, lineColor, lineBgColor } = props
      const cellValue = Math.min(100, XEUtils.toNumber(row[column.property]))
      let labelPosition
      if (cellValue < 30) {
        labelPosition = 'outer'
      } else if (cellValue > 70) {
        labelPosition = 'inner'
      }
      return [
        h('span', {
          class: ['vxe-renderer--progress-bar', {
            [`label--${labelPosition}`]: labelPosition
          }],
          style: {
            backgroundColor: lineBgColor
          }
        }, [
          h('span', {
            class: 'vxe-renderer--progress-bar-chart',
            style: {
              width: `${cellValue}%`,
              height: XEUtils.isNumber(lineWidth) ? `${lineWidth}` : lineWidth,
              backgroundColor: lineColor
            }
          }),
          h('span', {
            class: 'vxe-renderer--progress-bar-label'
          }, `${cellValue}%`)
        ])
      ]
    }
  },
  ProgressRing: {
    renderDefault (h: CreateElement, renderOpts: ColumnCellRenderOptions, params: ColumnCellRenderParams) {
      const { row, column } = params
      const { props = {} } = renderOpts
      const { width, height, labelColor, lineColor, lineBgColor, hollowColor } = props
      const cellValue = Math.min(100, XEUtils.toNumber(row[column.property]))
      let halfRing = 0
      let maskRing = 0
      if (cellValue) {
        if (cellValue > 50) {
          halfRing = XEUtils.floor((cellValue - 50) * 3.6)
          maskRing = 180
        } else {
          maskRing = XEUtils.floor(cellValue * 3.6)
        }
      }
      return [
        h('span', {
          class: 'vxe-renderer--progress-ring',
          style: {
            width: XEUtils.isNumber(width) ? `${width}px` : width,
            height: XEUtils.isNumber(height) ? `${height}px` : height,
            backgroundColor: lineBgColor
          }
        }, [
          h('span', {
            class: 'vxe-renderer--progress-ring-piece-prev',
            style: {
              backgroundColor: lineColor
            }
          }),
          h('span', {
            class: ['vxe-renderer--progress-ring-piece-naxt', {
              'is--half': halfRing
            }],
            style: {
              backgroundColor: lineColor,
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
          }, `${cellValue}%`)
        ])
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
