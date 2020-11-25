# vxe-table-plugin-renderer

[![gitee star](https://gitee.com/xuliangzhan_admin/vxe-table-plugin-renderer/badge/star.svg?theme=dark)](https://gitee.com/xuliangzhan_admin/vxe-table-plugin-renderer/stargazers)
[![npm version](https://img.shields.io/npm/v/vxe-table-plugin-renderer.svg?style=flat-square)](https://www.npmjs.com/package/vxe-table-plugin-renderer)
[![npm downloads](https://img.shields.io/npm/dm/vxe-table-plugin-renderer.svg?style=flat-square)](http://npm-stat.com/charts.html?package=vxe-table-plugin-renderer)
[![npm license](https://img.shields.io/github/license/mashape/apistatus.svg)](LICENSE)

基于 [vxe-table](https://github.com/xuliangzhan/vxe-table) 表格的增强插件，提供一些常用的渲染器

## Installing

```shell
npm install xe-utils vxe-table vxe-table-plugin-renderer
```

```javascript
import Vue from 'vue'
import VXETable from 'vxe-table'
import VXETablePluginRenderer from 'vxe-table-plugin-renderer'
import 'vxe-table-plugin-renderer/dist/style.css'

Vue.use(VXETable)
VXETable.use(VXETablePluginRenderer)
```

## API

### ProgressBar 进度条

#### ProgressBar Props

| 属性 | 描述 | 类型 | 可选值 | 默认值 |
|------|------|-----|-----|-----|
| lineWidth | 线宽度 | number | — | — |
| lineColor | 线颜色 | string | — | — |
| lineBgColor | 线背景颜色 | string | — | — |
| labelColor | 显示值的颜色 | string | — | — |

### ProgressRing 环形进度条

#### ProgressRing Props

| 属性 | 描述 | 类型 | 可选值 | 默认值 |
|------|------|-----|-----|-----|
| width | 宽度 | number | — | — |
| height | 高度 | number | — | — |
| margin | 间距 | string | — | — |
| lineColor | 线颜色 | string | — | — |
| lineBgColor | 线背景颜色 | string | — | — |
| hollowColor | 圆心的背景颜色 | string | — | — |
| labelColor | 显示值的颜色 | string | — | — |

## Demo

```html
<vxe-table
  border
  height="600"
  :data="tableData">
  <vxe-table-column type="checkbox" width="60"></vxe-table-column>
  <vxe-table-column field="name" width="200"></vxe-table-column>
  <vxe-table-column field="num1" title="Progress Bar" :cell-render="{name: 'ProgressBar'}"></vxe-table-column>
  <vxe-table-column field="num2" title="Progress Ring" :cell-render="{name: 'ProgressRing'}"></vxe-table-column>
</vxe-table>
```

```javascript
export default {
  data () {
    return {
      tableData: [
        { id: 100, name: 'test1', num1: 30, num2: 60 },
        { id: 101, name: 'test2', num1: 15, num2: 85 },
        { id: 102, name: 'test3', num1: 75, num2: 45 }
      ]
    }
  }
}
```

## License

MIT License, 2019-present, Xu Liangzhan