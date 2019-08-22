# vxe-table-plugin-renderer

[![npm version](https://img.shields.io/npm/v/vxe-table-plugin-renderer.svg?style=flat-square)](https://www.npmjs.org/package/vxe-table-plugin-renderer)
[![npm downloads](https://img.shields.io/npm/dm/vxe-table-plugin-renderer.svg?style=flat-square)](http://npm-stat.com/charts.html?package=vxe-table-plugin-renderer)
[![gzip size: JS](http://img.badgesize.io/https://unpkg.com/vxe-table-plugin-renderer/dist/index.min.js?compression=gzip&label=gzip%20size:%20JS)](https://unpkg.com/vxe-table-plugin-renderer/dist/index.min.js)
[![gzip size: CSS](http://img.badgesize.io/https://unpkg.com/vxe-table-plugin-renderer/dist/style.min.css?compression=gzip&label=gzip%20size:%20CSS)](https://unpkg.com/vxe-table-plugin-renderer/dist/style.min.css)
[![npm license](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/xuliangzhan/vxe-table-plugin-renderer/blob/master/LICENSE)

该插件用于在 [vxe-table](https://github.com/xuliangzhan/vxe-table) 表格中实现简单的渲染器

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

### XInput

#### XInput Props

| 属性 | 描述 | 类型 | 可选值 | 默认值 |
|------|------|-----|-----|-----|
| prefixIcon | 输入框头部图标 | Object | — | — |
| suffixIcon | 输入框尾部图标 | Object | — | — |

#### XInput Event

| 属性 | 描述 | 参数 |
|------|------|-----|-----|-----|
| prefix-click | 头部图标点击时会触发该方法 | params, evnt |
| suffix-click | 尾部图标点击时会触发该方法 | params, evnt |

### XTextarea

#### XTextarea Props

| 属性 | 描述 | 类型 | 可选值 | 默认值 |
|------|------|-----|-----|-----|
| maxWidth | 最大宽 | Number | — | — |
| maxHeight | 最大高 | Number | — | — |

## Cell demo

默认直接使用 class=vxe-table-x-renderer 既可，当然你也可以不引入默认样式，自行实现样式也是可以的。

```html
<vxe-table
  border
  class="vxe-table-x-renderer"
  height="600"
  :data.sync="tableData"
  :edit-config="{trigger: 'click', mode: 'cell'}">
  <vxe-table-column type="selection" width="60"></vxe-table-column>
  <vxe-table-column type="index" width="60"></vxe-table-column>
  <vxe-table-column prop="name" label="Name" :edit-render="{name: 'XInput'}"></vxe-table-column>
  <vxe-table-column prop="role" label="Role" :edit-render="{name: 'XTextarea'}"></vxe-table-column>
</vxe-table>
```

```javascript
export default {
  data () {
    return {
      tableData: [
        {
          id: 100,
          name: 'test',
          age: 26,
          role: 'Develop',
        }
      ]
    }
  }
}
```

## Filter demo

```html
<vxe-table
  border
  height="600"
  :data.sync="tableData">
  <vxe-table-column type="index" width="60"></vxe-table-column>
  <vxe-table-column prop="name" label="Name"></vxe-table-column>
  <vxe-table-column prop="age" label="Age"></vxe-table-column>
  <vxe-table-column prop="date" label="Date" :filters="[{data: []}]" :filter-render="{name: 'Input'}"></vxe-table-column>
</vxe-table>
```

```javascript
export default {
  data () {
    return {
      tableData: [
        {
          id: 100,
          name: 'test',
          age: 26,
          date: null
        }
      ]
    }
  }
}
```

## License

MIT License, 2019-present, Xu Liangzhan
