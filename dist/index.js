(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define("vxe-table-plugin-renderer", [], factory);
  } else if (typeof exports !== "undefined") {
    factory();
  } else {
    var mod = {
      exports: {}
    };
    factory();
    global.VXETablePluginRenderer = mod.exports.default;
  }
})(this, function () {
  "use strict";

  exports.__esModule = true;

  var xe_utils_1 = require("xe-utils");

  function getCursorPosition(textarea) {
    var rangeData = {
      text: '',
      start: 0,
      end: 0
    };

    if (textarea.setSelectionRange) {
      rangeData.start = textarea.selectionStart;
      rangeData.end = textarea.selectionEnd;
    }

    return rangeData;
  }

  function setCursorPosition(textarea, rangeData) {
    if (textarea.setSelectionRange) {
      textarea.focus();
      textarea.setSelectionRange(rangeData.start, rangeData.end);
    }
  }

  var $text;

  if (typeof document !== 'undefined') {
    $text = document.createElement('span');
    $text.className = 'x-textarea--resize';
    $text.style.visibility = 'hidden';
    $text.style.zIndex = '-1';
    $text.style.position = 'absolute';
  }

  function autoResizeTextarea(evnt, renderOpts, params) {
    var _a = renderOpts.props,
        props = _a === void 0 ? {} : _a;
    var $table = params.$table,
        column = params.column;
    var minWidth = column.renderWidth,
        minHeight = column.renderHeight;
    var inpElem = evnt.target; // let cell = inpElem.parentNode.parentNode ? inpElem.parentNode.parentNode.parentNode : null

    var maxWidth = props.maxWidth || 600;
    var maxHeight = props.maxHeight || 400;
    $text.textContent = inpElem.value + "\n";
    $text.style.maxWidth = maxWidth + "px";

    if (!$text.parentNode) {
      $table.$el.appendChild($text);
    }

    var height = Math.min(maxHeight, $text.offsetHeight + 4);
    inpElem.style.width = Math.min(maxWidth, Math.max(minWidth, $text.offsetWidth + 20)) + "px";
    inpElem.style.height = (height < minHeight ? minHeight : height) + "px";
    inpElem.style.overflowY = height > maxWidth ? 'auto' : '';
  }

  function getEvents(renderOpts, params) {
    var events = renderOpts.events;
    var $table = params.$table,
        column = params.column;
    var model = column.model;
    var on = {
      input: function input(evnt) {
        var cellValue = evnt.target.value;
        model.update = true;
        model.value = cellValue;
        $table.updateStatus(params, cellValue);
      }
    };

    if (events) {
      xe_utils_1["default"].assign(on, xe_utils_1["default"].objectMap(events, function (cb) {
        return function () {
          cb.apply(null, [params].concat.apply(params, arguments));
        };
      }));
    }

    return on;
  }
  /**
   * 渲染函数
   */


  var renderMap = {
    XInput: {
      autofocus: '.x-input',
      renderEdit: function renderEdit(h, renderOpts, params) {
        var _a = renderOpts.props,
            props = _a === void 0 ? {} : _a,
            attrs = renderOpts.attrs,
            _b = renderOpts.events,
            events = _b === void 0 ? {} : _b;
        var column = params.column;
        var model = column.model;
        var prefixIcon = props.prefixIcon,
            suffixIcon = props.suffixIcon;
        var prefixClick = events.prefixClick,
            suffixClick = events.suffixClick;
        return [h('div', {
          "class": ['x-input--wrapper', {
            'is--prefix': props.prefixIcon,
            'is--suffix': props.suffixIcon
          }],
          style: {
            height: column.renderHeight - 1 + "px"
          }
        }, [prefixIcon ? h('i', {
          "class": ['x-input--prefix', prefixIcon, {
            'is--trigger': prefixClick
          }],
          on: prefixClick ? {
            click: function click(evnt) {
              return prefixClick(params, evnt);
            }
          } : null
        }) : null, h('input', {
          "class": 'x-input',
          attrs: attrs,
          domProps: {
            value: model.value
          },
          on: getEvents(renderOpts, params)
        }), suffixIcon ? h('i', {
          "class": ['x-input--suffix', suffixIcon, {
            'is--trigger': suffixClick
          }],
          on: suffixClick ? {
            click: function click(evnt) {
              return suffixClick(params, evnt);
            }
          } : null
        }) : null])];
      }
    },
    XTextarea: {
      autofocus: '.x-textarea',
      renderEdit: function renderEdit(h, renderOpts, params) {
        var attrs = renderOpts.attrs,
            events = renderOpts.events;
        var $table = params.$table,
            column = params.column;
        var model = column.model;

        var autoResizeEvent = function autoResizeEvent(evnt) {
          setTimeout(function () {
            return autoResizeTextarea(evnt, renderOpts, params);
          }, 0);

          if (events && events[evnt.type]) {
            events[evnt.type](params, evnt);
          }
        };

        return [h('div', {
          "class": 'x-textarea--wrapper',
          style: {
            height: column.renderHeight - 1 + "px"
          }
        }, [h('textarea', {
          "class": 'x-textarea',
          attrs: attrs,
          domProps: {
            value: model.value
          },
          on: xe_utils_1["default"].assign(getEvents(renderOpts, params), {
            cut: autoResizeEvent,
            paste: autoResizeEvent,
            drop: autoResizeEvent,
            focus: autoResizeEvent,
            keydown: function keydown(evnt) {
              if (evnt.keyCode === 13 && (!$table.keyboardConfig || evnt.altKey)) {
                evnt.preventDefault();
                evnt.stopPropagation();
                var inpElem_1 = evnt.target;
                var rangeData_1 = getCursorPosition(inpElem_1);
                var pos_1 = rangeData_1.end;
                var cellValue = inpElem_1.value;
                cellValue = cellValue.slice(0, pos_1) + "\n" + cellValue.slice(pos_1, cellValue.length);
                inpElem_1.value = cellValue;
                model.update = true;
                model.value = cellValue;
                setTimeout(function () {
                  rangeData_1.start = rangeData_1.end = ++pos_1;
                  setCursorPosition(inpElem_1, rangeData_1);
                  autoResizeEvent(evnt);
                });
              } else {
                autoResizeEvent(evnt);
              }
            },
            compositionstart: autoResizeEvent,
            compositionupdate: autoResizeEvent,
            compositionend: autoResizeEvent
          })
        })])];
      },
      renderCell: function renderCell(h, renderOpts, params) {
        var row = params.row,
            column = params.column;
        return [h('span', {
          "class": 'x-textarea--content'
        }, xe_utils_1["default"].get(row, column.property))];
      }
    }
  };
  /**
   * 基于 vxe-table 表格的增强插件，提供一些常用的渲染器
   */

  exports.VXETablePluginRenderer = {
    install: function install(xtable) {
      xtable.renderer.mixin(renderMap);
    }
  };

  if (typeof window !== 'undefined' && window.VXETable) {
    window.VXETable.use(exports.VXETablePluginRenderer);
  }

  exports["default"] = exports.VXETablePluginRenderer;
});