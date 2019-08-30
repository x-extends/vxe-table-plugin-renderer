import VXETable from 'vxe-table'

export interface VXETablePluginStatic {
  install(xTable: typeof VXETable): void;
}

/**
 * 基于 vxe-table 表格的增强插件，提供一些常用的渲染器
 */
declare var VXETablePluginRenderer: VXETablePluginStatic;

export default VXETablePluginRenderer;