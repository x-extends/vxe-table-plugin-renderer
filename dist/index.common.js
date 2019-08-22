"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.VXETablePluginRenderer = void 0;

var _xeUtils = _interopRequireDefault(require("xe-utils"));

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

function autoResizeWidth(evnt, editRender, params) {
  var $table = params.$table,
      column = params.column;
  var minWidth = column.renderWidth,
      minHeight = column.renderHeight;
  var inpElem = evnt.target;
  var cell = inpElem.parentNode.parentNode ? inpElem.parentNode.parentNode.parentNode : null;
  var maxWidth = editRender.maxWidth || cell.offsetWidth;
  var maxHeight = editRender.maxHeight || 400;
  $text.textContent = "".concat(inpElem.value, "\n");
  $text.style.maxWidth = "".concat(maxWidth, "px");

  if (!$text.parentNode) {
    $table.$el.appendChild($text);
  }

  var height = Math.max(minHeight, $text.offsetHeight + 4);
  inpElem.style.width = "".concat(Math.min(maxWidth, Math.max(minWidth, $text.offsetWidth + 20)), "px");
  inpElem.style.height = "".concat(height > maxHeight ? maxHeight : height, "px");
  inpElem.style.overflowY = height > maxWidth ? 'auto' : '';
}
/**
 * 渲染函数
 */


var renderMap = {
  XTextarea: {
    autofocus: '.vxe-textarea',
    renderEdit: function renderEdit(h, editRender, params) {
      var $table = params.$table,
          column = params.column;
      var model = column.model;

      var autoResizeEvent = function autoResizeEvent(evnt) {
        setTimeout(function () {
          return autoResizeWidth(evnt, editRender, params);
        }, 0);
      };

      return [h('div', {
        "class": 'vxe-input--wrapper x-textarea',
        style: {
          height: "".concat(column.renderHeight - 1, "px")
        }
      }, [h('textarea', {
        "class": 'vxe-textarea',
        domProps: {
          value: model.value
        },
        on: {
          input: function input(evnt) {
            var inpElem = evnt.target;
            model.update = true;
            model.value = inpElem.value;
          },
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
                autoResizeEvent(evnt, editRender, params);
              });
            } else {
              autoResizeEvent(evnt, editRender, params);
            }
          },
          compositionstart: autoResizeEvent,
          compositionupdate: autoResizeEvent,
          compositionend: autoResizeEvent
        }
      })])];
    },
    renderCell: function renderCell(h, editRender, params) {
      var row = params.row,
          column = params.column;
      return [h('span', {
        domProps: {
          innerHTML: _xeUtils["default"].escape(_xeUtils["default"].get(row, column.property)).replace(/\n/g, '<br>')
        }
      })];
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
exports.VXETablePluginRenderer = VXETablePluginRenderer;

if (typeof window !== 'undefined' && window.VXETable) {
  window.VXETable.use(VXETablePluginRenderer);
}

var _default = VXETablePluginRenderer;
exports["default"] = _default;