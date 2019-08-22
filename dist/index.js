(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define("vxe-table-plugin-renderer", ["exports", "xe-utils"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("xe-utils"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.XEUtils);
    global.VXETablePluginRenderer = mod.exports.default;
  }
})(this, function (_exports, _xeUtils) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports["default"] = _exports.VXETablePluginRenderer = void 0;
  _xeUtils = _interopRequireDefault(_xeUtils);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

  function getCursorPosition(textarea) {
    var rangeData = {
      text: '',
      start: 0,
      end: 0
    };

    if (textarea.setSelectionRange) {
      rangeData.start = textarea.selectionStart;
      rangeData.end = textarea.selectionEnd;
      rangeData.text = rangeData.start !== rangeData.end ? textarea.value.substring(rangeData.start, rangeData.end) : '';
    } else if (document.selection) {
      var index = 0;
      var range = document.selection.createRange();
      var textRange = document.body.createTextRange();
      textRange.moveToElementText(textarea);
      rangeData.text = range.text;
      rangeData.bookmark = range.getBookmark();

      for (; textRange.compareEndPoints('StartToStart', range) < 0 && range.moveStart('character', -1) !== 0; index++) {
        if (textarea.value.charAt(index) === '\n') {
          index++;
        }
      }

      rangeData.start = index;
      rangeData.end = rangeData.text.length + rangeData.start;
    }

    return rangeData;
  }

  function setCursorPosition(textarea, rangeData) {
    if (textarea.setSelectionRange) {
      textarea.focus();
      textarea.setSelectionRange(rangeData.start, rangeData.end);
    } else if (textarea.createTextRange) {
      var textRange = textarea.createTextRange();

      if (textarea.value.length === rangeData.start) {
        textRange.collapse(false);
        textRange.select();
      } else {
        textRange.moveToBookmark(rangeData.bookmark);
        textRange.select();
      }
    }
  }

  var $text = document.createElement('span');
  $text.className = 'x-textarea--resize';
  $text.style.visibility = 'hidden';
  $text.style.zIndex = '-1';
  $text.style.position = 'absolute';

  function autoResizeTextarea(evnt, renderOpts, params) {
    var _renderOpts$props = renderOpts.props,
        props = _renderOpts$props === void 0 ? {} : _renderOpts$props;
    var $table = params.$table,
        column = params.column;
    var minWidth = column.renderWidth,
        minHeight = column.renderHeight;
    var inpElem = evnt.target; // let cell = inpElem.parentNode.parentNode ? inpElem.parentNode.parentNode.parentNode : null

    var maxWidth = props.maxWidth || 600;
    var maxHeight = props.maxHeight || 400;
    $text.textContent = "".concat(inpElem.value, "\n");
    $text.style.maxWidth = "".concat(maxWidth, "px");

    if (!$text.parentNode) {
      $table.$el.appendChild($text);
    }

    var height = Math.min(maxHeight, $text.offsetHeight + 4);
    inpElem.style.width = "".concat(Math.min(maxWidth, Math.max(minWidth, $text.offsetWidth + 20)), "px");
    inpElem.style.height = "".concat(height < minHeight ? minHeight : height, "px");
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
      _xeUtils["default"].assign(on, _xeUtils["default"].objectMap(events, function (cb) {
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
        var _renderOpts$props2 = renderOpts.props,
            props = _renderOpts$props2 === void 0 ? {} : _renderOpts$props2,
            attrs = renderOpts.attrs,
            _renderOpts$events = renderOpts.events,
            events = _renderOpts$events === void 0 ? {} : _renderOpts$events;
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
            height: "".concat(column.renderHeight - 1, "px")
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
            height: "".concat(column.renderHeight - 1, "px")
          }
        }, [h('textarea', {
          "class": 'x-textarea',
          attrs: attrs,
          domProps: {
            value: model.value
          },
          on: _xeUtils["default"].assign(getEvents(renderOpts, params), {
            cut: autoResizeEvent,
            paste: autoResizeEvent,
            drop: autoResizeEvent,
            focus: autoResizeEvent,
            keydown: function keydown(evnt) {
              if (evnt.keyCode === 13 && (!$table.keyboardConfig || evnt.altKey)) {
                evnt.preventDefault();
                evnt.stopPropagation();
                var inpElem = evnt.target;
                var rangeData = getCursorPosition(inpElem);
                var pos = rangeData.end;
                var cellValue = inpElem.value;
                cellValue = "".concat(cellValue.slice(0, pos), "\n").concat(cellValue.slice(pos, cellValue.length));
                inpElem.value = cellValue;
                model.update = true;
                model.value = cellValue;
                setTimeout(function () {
                  rangeData.start = rangeData.end = ++pos;
                  setCursorPosition(inpElem, rangeData);
                  autoResizeEvent(evnt, renderOpts, params);
                });
              } else {
                autoResizeEvent(evnt, renderOpts, params);
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
        }, _xeUtils["default"].get(row, column.property))];
      }
    }
  };
  var VXETablePluginRenderer = {
    install: function install(_ref) {
      var renderer = _ref.renderer;
      // 添加到渲染器
      renderer.mixin(renderMap);
    }
  };
  _exports.VXETablePluginRenderer = VXETablePluginRenderer;

  if (typeof window !== 'undefined' && window.VXETable) {
    window.VXETable.use(VXETablePluginRenderer);
  }

  var _default = VXETablePluginRenderer;
  _exports["default"] = _default;
});