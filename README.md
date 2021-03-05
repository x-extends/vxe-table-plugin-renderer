# vxe-table-plugin-renderer

[![gitee star](https://gitee.com/xuliangzhan_admin/vxe-table-plugin-renderer/badge/star.svg?theme=dark)](https://gitee.com/xuliangzhan_admin/vxe-table-plugin-renderer/stargazers)
[![npm version](https://img.shields.io/npm/v/vxe-table-plugin-renderer.svg?style=flat-square)](https://www.npmjs.com/package/vxe-table-plugin-renderer)
[![npm downloads](https://img.shields.io/npm/dm/vxe-table-plugin-renderer.svg?style=flat-square)](http://npm-stat.com/charts.html?package=vxe-table-plugin-renderer)
[![npm license](https://img.shields.io/github/license/mashape/apistatus.svg)](LICENSE)

基于 [vxe-table](https://github.com/xuliangzhan/vxe-table) 表格的增强插件，提供一些常用的渲染器

## Installing

```shell
npm install xe-utils vxe-table@next vxe-table-plugin-renderer@next
```

```javascript
// ...
import VXETable from 'vxe-table'
import VXETablePluginRenderer from 'vxe-table-plugin-renderer'
import 'vxe-table-plugin-renderer/dist/style.css'
// ...

VXETable.use(VXETablePluginRenderer)
```

## API

### bar 柱状图

#### bar Props

| 属性 | 描述 | 类型 | 可选值 | 默认值 |
|------|------|-----|-----|-----|
| bar.width | 柱子宽度 | number | string | — | — |
| bar.max | 柱子最大值 | number | — | — |
| colors | 柱子颜色列表 | string[] | — | — |
| tooltip.formatter | 提示内容格式 | string | — | — |
| label.color | 显示值的颜色 | string | — | — |
| label.formatter | 显示值的格式（{row, value}） | string | — | — |

### pie 饼图

#### pie Props

| 属性 | 描述 | 类型 | 可选值 | 默认值 |
|------|------|-----|-----|-----|
| diameter | 饼图直径 | number | string | — | — |
| margin | 饼图间距 | number | string | — | 1px |
| colors | 扇区的颜色列表 | string[] | — | — |
| tooltip.formatter | 提示内容格式 | string | — | — |
| ring.diameter| 内圆直径 | number | string | — | — |
| ring.color | 内圆的颜色 | string | — | — |
| label.color | 显示值的颜色 | string | — | — |
| label.formatter | 显示值的格式（{row, value}） | string | — | — |

## Demo

```html
<vxe-table
  border
  show-overflow
  height="400"
  :data="tableData">
  <vxe-table-column type="checkbox" width="60"></vxe-table-column>
  <vxe-table-column field="name" width="200"></vxe-table-column>
  <vxe-table-column field="num1" title="Bar" :cell-render="{name: 'bar'}"></vxe-table-column>
  <vxe-table-column field="num2" title="Ring" :cell-render="{name: 'pie'}"></vxe-table-column>
</vxe-table>
```

```javascript
export default {
  data () {
    return {
      tableData: [
        { id: 100, name: 'test1', num1: [30, 47], num2: [60, 36, 36] },
        { id: 101, name: 'test2', num1: [15, 22], num2: [85, 22, 97] },
        { id: 102, name: 'test3', num1: [75, 36], num2: [45, 84, 66] }
      ]
    }
  }
}
```

## License

MIT License, 2019-present, Xu Liangzhan