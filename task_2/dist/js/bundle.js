"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

(function (context) {
  context.Anim = function () {
    var _setValue = function _setValue(o, p, v) {
      return !o || !o.hasOwnProperty(p) || (o[p] = v);
    },
        timings = {
      'linear': function linear(p) {
        return p;
      },
      'circ': function circ(p) {
        return p < 0 ? 0 : p > 1 ? 1 : 1 - Math.sin(Math.acos(p));
      },
      'bounce': function bounce(p) {
        for (var a = 0, b = 1; 1; a += b, b /= 2) {
          if (p >= (7 - 4 * a) / 11) {
            return -Math.pow((11 - 6 * a - 11 * p) / 4, 2) + b * b;
          }
        }
      },
      'elastic': function elastic(p) {
        return Math.pow(2, 20 * (p - .8)) * Math.cos(6 * p * p - 6) / 16;
      }
    },
        ease = {
      'in': function _in(f) {
        return f;
      },
      'out': function out(f) {
        return function (p) {
          return 1 - f(1 - p);
        };
      },
      'both': function both(f) {
        return function (p) {
          return p < .5 ? f(2 * p) / 2 : (2 - f(2 * (1 - p))) / 2;
        };
      }
    };

    this.add = function (id, duration) {
      var _this = this;

      if (id == 'update' || id == 'add' || id == 'loop' || typeof duration !== 'number') return;
      var a = {
        duration: duration,
        progress: 0,
        started: false,
        timing: timings['linear'],
        ease: ease['in'],
        run: function run() {
          _this.started = true;
          _this.timeStart = Date.now();
        }
      },
          r = {
        anim: this,
        timing: function timing(t) {
          var e = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'in';
          a.timing = typeof t === 'function' ? t : timings[t] || timings['linear'];
          a.ease = ease[e] || ease['in'];
          return r;
        },
        "for": function _for(obj, prop) {
          a.object = obj;
          a.property = prop;
          return r;
        },
        from: function from(v) {
          a.from = v;
          return r;
        },
        to: function to(v) {
          a.to = v;
          return r;
        },
        tick: function tick(_tick) {
          a.tick = _tick;
          return r;
        },
        after: function after(_after) {
          a.after = _after;
          return r;
        },
        run: function run() {
          a.started = true;
          a.timeStart = Date.now();
          return r;
        }
      };
      this[id] = a;
      return r;
    };

    this.update = function (t) {
      var r = false;

      for (var index in this) {
        var f = this[index];
        if (_typeof(f) !== 'object') continue;

        if (!f.started) {
          f.timeStart = t - f.duration * f.progress;
          continue;
        }

        f.progress = (t - f.timeStart) / f.duration;
        r = true;

        if (f.progress >= 1 || isNaN(f.progress) || typeof f.from === 'number' && f.from === f.to) {
          if (typeof f.to === 'number') _setValue(f.object, f.property, typeof f.tick === 'function' ? f.tick(f.to) || f.to : f.to);
          if (typeof f.after === 'function') f.after.call(this);
          delete this[index];
          continue;
        }

        var value = typeof f.from === 'number' && typeof f.to === 'number' ? (f.to - f.from) * f.ease(f.timing)(f.progress) + f.from : f.ease(f.timing)(f.progress);

        _setValue(f.object, f.property, typeof f.tick === 'function' ? f.tick(value, f.from, f.to) || value : value);
      }

      return r;
    };

    this.loop = function () {
      this.update(Date.now());
      window.setTimeout(this.loop.bind(this), 1e3 / 60);
    };
  }; // eslint-disable-next-line no-undef

})(typeof exports === 'undefined' ? window : exports);
/* app.js */


'use strict';

window.addEventListener('load', function () {
  var params = {
    devicePixelRatio: 1,
    valueToString: function valueToString(val, _short) {
      var date = new Date(val).toDateString();

      if (_short) {
        return date.slice(4, date.length - 5);
      }

      return date.slice(0, 3) + ', ' + date.slice(4);
    },
    onValueSelect: function onValueSelect(selectedX, data) {
      var calcTrend = function calcTrend(currentValue, prevValue, cell) {
        if (prevValue === 0) {
          cell.textContent = 0;
          cell.classList.remove('positive', 'negative');
          return;
        }

        if (prevValue - currentValue === 0) {
          cell.textContent = prevValue;
          cell.classList.remove('positive', 'negative');
          return;
        }

        if (prevValue - currentValue > 0) {
          cell.textContent = prevValue + " (-".concat(((prevValue - currentValue) / currentValue * 100).toFixed(1), "%)");
          cell.classList.add('negative');
          cell.classList.remove('positive');
        } else {
          cell.textContent = prevValue + " (+".concat(((currentValue - prevValue) / currentValue * 100).toFixed(1), "%)");
          cell.classList.add('positive');
          cell.classList.remove('negative');
        }
      };

      data.forEachColumn(function (column) {
        var postfix = column.name.toLowerCase().replace(' ', '_');
        var cells = document.querySelectorAll("#detail-".concat(postfix, ">td:not(:first-child)"));
        if (!cells || cells.length < 3) return;
        cells[0].textContent = column.values[selectedX.index];
        calcTrend(column.values[selectedX.index], selectedX.index !== 0 ? column.values[selectedX.index - 1] : 0, cells[1]);
        calcTrend(column.values[selectedX.index], selectedX.index >= 7 ? column.values[selectedX.index - 7] : 0, cells[2]);
      });
      return false;
    },
    debug: false
  },
      Chart = new ChartView('chart', 'Proceeds', params, new DataLoader('data/', {
    before: 'data'
  }));

  window.switchMode = function () {
    var mode = document.getElementById('mode').innerText.toLowerCase();

    if (mode === 'night') {
      document.getElementsByTagName('body')[0].className = 'night';
      document.getElementById('mode').innerText = 'Day';
    } else {
      document.getElementsByTagName('body')[0].className = 'day';
      document.getElementById('mode').innerText = 'Night';
    }

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = chartViews[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var view = _step.value;
        Chart.updateColors();
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator["return"] != null) {
          _iterator["return"]();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  };
});
'use strict'; // eslint-disable-next-line no-unused-vars


var ChartData = function ChartData() {
  var _this2 = this;

  var binSearch = function binSearch(arr, value) {
    var start = 0;
    var stop = arr.length - 1;
    var m = ~~((start + stop) / 2);

    while (arr[m] !== value && start < stop) {
      if (value < arr[m]) {
        stop = m - 1;
      } else {
        start = m + 1;
      }

      m = ~~((start + stop) / 2);
    }

    return arr[m] !== value ? -1 : m;
  },
      binSearchFloor = function binSearchFloor(arr, value) {
    var start = 0;
    var stop = arr.length - 1;
    var m = ~~((start + stop) / 2);

    while (arr[m] !== value && start < stop) {
      if (value < arr[m]) {
        stop = m - 1;
      } else {
        start = m + 1;
      }

      m = ~~((start + stop) / 2);
    }

    return arr[m] <= value ? m : m === 0 ? 0 : m - 1;
  },
      binSearchCloser = function binSearchCloser(arr, value) {
    var start = 0;
    var stop = arr.length - 1;
    var m = ~~((start + stop) / 2);

    while (arr[m] !== value && start < stop) {
      if (value < arr[m]) {
        stop = m - 1;
      } else {
        start = m + 1;
      }

      m = ~~((start + stop) / 2);
    }

    if (arr[m] == value) return m;
    if (arr[m] > value) return arr[m] - value <= arr[m - 1] - value ? m : m - 1;
    if (arr[m] < value) return arr[m] - value <= arr[m + 1] - value ? m : m + 1;
    return -1;
  }; // TODO: neeeed refactoring


  var Data = function Data() {
    this.XMin = 0; // Infinity

    this.XMax = 1;
    this.YMin = 1e309; // Infinity

    this.YMax = 1;
    this.X = [];
    this.X_labels = [];
    this.columns = [];
    this.percentageSum = [];
    this.stacked = false;
    this.y_scaled = false;
    this.percentage = false;
    this.count = 0;
  },
      sumByX = function sumByX(xIndex, toColumn) {
    toColumn = toColumn || _this2.data.columns.length - 1;
    var sum = 0;

    for (var i = 0; i <= toColumn; i++) {
      sum += _this2.data.columns[i].values[xIndex] * _this2.data.columns[i].opacity;
    }

    return sum;
  };

  this.data = new Data();
  this.cache = [];

  this.setData = function (data) {
    var xValToStr = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
    _this2.data.stacked = data.stacked || false;
    _this2.data.y_scaled = data.y_scaled || false;
    _this2.data.percentage = data.percentage || false;
    var scale_base = 0;

    for (var i = 0; i < data.columns.length; i++) {
      var column = data.columns[i],
          id = column[0];

      if (data.types[id] === 'x') {
        _this2.data.X = column.slice(1);
        _this2.data.XMin = _this2.data.X[0];
        _this2.data.XMax = _this2.data.X[_this2.data.X.length - 1];
        if (xValToStr) _this2.data.X_labels = _this2.data.X.map(function (v) {
          return xValToStr(v, true);
        });
        continue;
      }

      var newColumn = {
        id: id,
        values: column.slice(1),
        name: data.names[id],
        type: data.types[id],
        color: data.colors[id],
        YMin: 1e309,
        YMax: 0,
        visible: true,
        opacity: 1
      };
      newColumn.YMin = Math.min.apply(null, newColumn.values);
      newColumn.YMax = Math.max.apply(null, newColumn.values);

      if (_this2.data.y_scaled) {
        if (!scale_base) {
          newColumn.y_scale = 1;
          scale_base = newColumn.YMax - newColumn.YMin;
        } else {
          newColumn.y_scale = scale_base / (newColumn.YMax - newColumn.YMin);
        }
      }

      _this2.data.columns.push(newColumn);
    }

    _this2.data.count = _this2.data.columns.length;
  };

  this.pushCache = function () {
    _this2.cache.push(_this2.data);
  };

  this.popCache = function () {
    _this2.data = _this2.cache.pop();
  };

  this.clearData = function () {
    _this2.data = new Data();
  };

  this.findX = function (X) {
    return binSearch(_this2.data.X, X);
  };

  this.getFloorX = function (X) {
    return binSearchFloor(_this2.data.X, X);
  };

  this.getCloserX = function (X) {
    return binSearchCloser(_this2.data.X, X);
  };

  this.getSumYValues = function (xIndex) {
    return sumByX(xIndex);
  };

  this.getYValue = function (colIndex, xIndex) {
    if (_this2.data.stacked) {
      if (_this2.data.percentage) {
        if (colIndex == 0) {
          return _this2.data.columns[colIndex].values[xIndex] * _this2.data.columns[colIndex].opacity / sumByX(xIndex);
        }

        return sumByX(xIndex, colIndex) / sumByX(xIndex);
      }

      if (colIndex == 0) {
        return _this2.data.columns[colIndex].values[xIndex] * _this2.data.columns[colIndex].opacity;
      }

      return sumByX(xIndex, colIndex);
    }

    if (_this2.data.y_scaled) {
      return _this2.data.columns[colIndex].values[xIndex] * _this2.data.columns[colIndex].y_scale;
    }

    return _this2.data.columns[colIndex].values[xIndex];
  };

  this.getMinMaxValue = function (begin, end) {
    var defaultMax = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 6;
    var defaultMin = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
    if (_this2.data.percentage) return {
      min: 0,
      max: 1,
      sub: 1
    };
    begin = begin || 0;
    end = end || _this2.data.X.length - 1;
    var min = 1e309,
        max = defaultMax;

    _this2.forEachColumn(function (column, colIndex) {
      if (!column.visible) return;

      _this2.forEachX(function (value, xIndex) {
        if (_this2.data.stacked) {
          if (colIndex == _this2.data.columns.length - 1) {
            var _y = _this2.getYValue(colIndex, xIndex);

            min = 0;
            max = Math.max(max, _y);
          }

          return;
        }

        if (_this2.data.y_scaled) {
          if (colIndex == 0) {
            var _y2 = _this2.getYValue(colIndex, xIndex);

            min = Math.min(min, _y2);
            max = Math.max(max, _y2);
          }

          return;
        }

        var y = _this2.getYValue(colIndex, xIndex);

        min = Math.min(min, y);
        max = Math.max(max, y);
      }, begin, end);
    });

    if (!isFinite(min)) min = defaultMin;
    return {
      min: min,
      max: max,
      sub: max - min
    };
  };

  this.getXRange = function (begin, end) {
    if (begin != undefined && end != undefined) {
      return _this2.data.X[end] - _this2.data.X[begin];
    }

    return _this2.data.XMax - _this2.data.XMin;
  };

  this.forEachColumn = function (callback) {
    var backward = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    if (backward) for (var i = _this2.data.columns.length; i--;) {
      callback(_this2.data.columns[i], i, _this2.data.columns);
    } else for (var _i = 0; _i < _this2.data.columns.length; _i++) {
      callback(_this2.data.columns[_i], _i, _this2.data.columns);
    }
  };

  this.forEachX = function (callback) {
    var from = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var to = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;
    to = to || _this2.data.X.length;

    for (var i = from; i <= to; i++) {
      if (_this2.data.X[i] !== undefined) callback(_this2.data.X[i], i);
    }
  };

  this.getX = function (index) {
    return _this2.data.X[index];
  };

  this.getLength = function () {
    return _this2.data.X.length;
  };

  this.getXLabel = function (index) {
    return _this2.data.X_labels[index];
  };
};
/* chartRender.js */
// eslint-disable-next-line no-unused-vars


var ChartRender = function ChartRender(canvas, chart, dpr, anim, params) {
  var _this3 = this;

  var height = canvas.height,
      width = canvas.width,
      yArea = height - params.fntAxesSize - 10 * dpr,
      levelHeigth = chart.data.percentage ? (yArea - topOffset) / 4 : yArea / 6,
      centerX = width / 2,
      centerY = height / 2;

  var ctx = canvas.getContext('2d'),
      numberFormat = function numberFormat(n) {
    var abs = Math.abs(n);
    if (abs > 1e9) return (n / 1e9).toFixed(2) + 'B';
    if (abs > 1e6) return (n / 1e6).toFixed(2) + 'M';
    if (abs > 1e3) return (n / 1e3).toFixed(1) + 'K';
    return n.toFixed(0);
  },
      gradation = function gradation(value) {
    var isMin = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    if (isMin) return value * 0.8;
    return value * 1.2;
  },
      text = function text(value, x, y) {
    var alpha = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1;
    ctx.globalAlpha = alpha;
    ctx.fillText(value, x, y);
    ctx.globalAlpha = 1;
  },
      line = function line(fromX, fromY, toX, toY) {
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
  },
      debugRender = function debugRender() {
    ctx.textAlign = 'right';
    ctx.strokeStyle = ctx.fillStyle = '#000';
    text("[".concat(canvas.width, " x ").concat(canvas.height, "]"), width, 10, 1);
    ctx.textAlign = 'left';
    ctx.imageSmoothingEnabled = true;
    text("cols: ".concat(chart.data.count, "  yMin:  ").concat(chart.data.YMin, " yMax:  ").concat(chart.data.YMax, " ( ").concat(chart.getMinMaxValue().sub, ") [").concat(chart.data.stacked ? ' stacked |' : '').concat(chart.data.y_scaled ? ' y_scaled |' : '').concat(chart.data.percentage ? ' percentage' : '', " ]"), 10, 20 * dpr, .8);

    if (pie.active) {
      text("Xrange: ".concat(pie.iBegin, "-").concat(pie.iEnd, " at  ").concat(chart.data.X.length, "  Sum: ").concat(pie.sum.toFixed(8), " "), 10, 32 * dpr, .8);
    } else {
      text("Xrange: ".concat(x_range.iBegin, "-").concat(x_range.iEnd, " at  ").concat(chart.data.X.length, "  XScale: ").concat(x_range.XScale.toFixed(8), " skipF: ").concat(x_range.skipFactor), 10, 32 * dpr, .8);
      text("Yrange: ".concat(numberFormat(y_range.min), "-").concat(numberFormat(y_range.max), " YScale: ").concat(y_range.YScale), 10, 44 * dpr, 1);
    }

    if (selectedX.selected) {
      text("X: ".concat(numberFormat(selectedX.xValue), " i: ").concat(selectedX.index), 10, 56 * dpr, 1);
    }

    var offset = 0;
    chart.forEachColumn(function (column) {
      ctx.strokeStyle = ctx.fillStyle = column.color;
      text("id: ".concat(column.id, " ( ").concat(column.type, " ) yMin:  ").concat(column.YMin, "  yMax:  ").concat(column.YMax) + (chart.data.y_scaled ? " scale: ".concat(column.y_scale) : ''), 10, (70 + offset) * dpr, 1);
      offset += 14;
    });
  },
      gridRender = function gridRender() {
    ctx.beginPath();
    ctx.strokeStyle = params.lineAxesColor;
    ctx.lineWidth = 1 * dpr;

    for (var y = yArea; y >= 0; y -= levelHeigth) {
      line(0, ~~y, width, ~~y);
    }

    ctx.stroke();
  },
      xAxisRender = function xAxisRender() {
    var y = yArea + params.fntAxesSize + 2 * dpr;
    ctx.strokeStyle = ctx.fillStyle = params.fntAxesColor;
    ctx.textAlign = 'center';
    chart.forEachX(function (value, index) {
      var x = (value - x_range.begin) * x_range.XScale;

      if (selectedX.selected && selectedX.index == index) {
        ctx.beginPath();
        ctx.strokeStyle = params.lineAxesColor;
        ctx.lineWidth = 1 * dpr;
        line(x, 0, x, yArea);
        ctx.stroke();
      }

      if (x_range.skipFactor >= 1) {
        var localFactor = index % x_range.skipFactor;

        if (anim.CR_xrange_skipAlpha_fadeOut && localFactor == x_range.skipFactor / 2) {
          ctx.measureText(chart.getXLabel(0), 0, 0, params.fntAxesSize).width;
          text(chart.getXLabel(index), x, y, x_range.skipAlpha);

          if (params.debug) {
            ctx.beginPath();
            ctx.strokeStyle = '#FF0000';
            ctx.lineWidth = 1 * dpr;
            line(x, 0, x, yArea);
            ctx.stroke();
          }

          return;
        }

        if (anim.CR_xrange_skipAlpha_fadeIn && index % (x_range.skipFactor * 2) == x_range.skipFactor) {
          text(chart.getXLabel(index), x, y, x_range.skipAlpha);

          if (params.debug) {
            ctx.beginPath();
            ctx.strokeStyle = '#00FF00';
            ctx.lineWidth = 1 * dpr;
            line(x, 0, x, yArea);
            ctx.stroke();
          }

          return;
        }

        if (localFactor != 0) return;
      }

      if (params.debug) {
        ctx.beginPath();
        ctx.strokeStyle = params.lineAxesColor;
        ctx.lineWidth = 1 * dpr;
        line(x, 0, x, yArea);
        ctx.stroke();
      }

      text(chart.data.X_labels[index], x, y, 1);

      if (params.debug) {
        ctx.beginPath();
        ctx.strokeStyle = '#0000FF';
        ctx.lineWidth = 2 * dpr;
        line(x - x_range.textWidth / 2, y, x + x_range.textWidth / 2, y);
        ctx.stroke();
      }
    }, x_range.iBegin, x_range.iEnd);
  },
      yAxisRender = function yAxisRender() {
    ctx.textAlign = 'left';
    if (chart.data.y_scaled) ctx.strokeStyle = ctx.fillStyle = chart.data.columns[0].color;else ctx.strokeStyle = ctx.fillStyle = params.fntAxesColor;
    var levels = 6,
        yRange = (y_range.max - y_range.min) / levels; //levelHeigth = yArea/levels;

    for (var i = levels; i--;) {
      var val = (y_range.max - y_range.min) / levels * i + y_range.min,
          y = yArea - levelHeigth * i;

      if (anim.CR_yRange) {
        var from = (anim.CR_yRange.from.max - anim.CR_yRange.from.min) / levels * i + anim.CR_yRange.from.min,
            //anim.CR_yRange.from / levels * i,
        to = (anim.CR_yRange.to.max - anim.CR_yRange.to.min) / levels * i + anim.CR_yRange.to.min,
            //anim.CR_yRange.to / levels * i,
        sign = Math.sign(to - from);
        text(numberFormat(from), 2 * dpr, y - 2 * dpr + sign * levelHeigth * anim.CR_yRange.progress, 1 - anim.CR_yRange.progress);
        text(numberFormat(to), 2 * dpr, y - 2 * dpr - sign * (levelHeigth - levelHeigth * anim.CR_yRange.progress), anim.CR_yRange.progress);
      } else {
        text(numberFormat(val), 2 * dpr, y - 2 * dpr, 1);
      }
    }

    if (chart.data.y_scaled) {
      ctx.textAlign = 'right';
      ctx.strokeStyle = ctx.fillStyle = chart.data.columns[1].color;

      for (var _i2 = levels; _i2--;) {
        var _val = (y_range.max - y_range.min) / chart.data.columns[1].y_scale / levels * _i2 + y_range.min / chart.data.columns[1].y_scale,
            _y3 = yArea - levelHeigth * _i2;

        if (anim.CR_yRange) {
          var _from = (anim.CR_yRange.from.max - anim.CR_yRange.from.min) / levels * _i2 + anim.CR_yRange.from.min,
              //anim.CR_yRange.from / levels * i,
          _to = (anim.CR_yRange.to.max - anim.CR_yRange.to.min) / levels * _i2 + anim.CR_yRange.to.min,
              //anim.CR_yRange.to / levels * i,
          _sign = Math.sign(_to - _from);

          text(numberFormat(_from), width - 2 * dpr, _y3 - 2 * dpr + _sign * levelHeigth * anim.CR_yRange.progress, 1 - anim.CR_yRange.progress);
          text(numberFormat(_to), width - 2 * dpr, _y3 - 2 * dpr - _sign * (levelHeigth - levelHeigth * anim.CR_yRange.progress), anim.CR_yRange.progress);
        } else {
          text(numberFormat(_val), width - 2 * dpr, _y3 - 2 * dpr, 1);
        }
      }
    }
  },
      yAxisPercentageRender = function yAxisPercentageRender() {
    ctx.textAlign = 'left';
    ctx.strokeStyle = ctx.fillStyle = params.fntAxesColor;
    var levels = 4,
        levelHeigth = (yArea - topOffset) / levels; // - params.fntAxesSize + 4*dpr;

    for (var i = levels + 1; i--;) {
      var y = yArea - levelHeigth * i;
      text(i * 25, 2 * dpr, y - 2 * dpr, 1);
    }
  },
      lineRender = function lineRender(column, colIndex) {
    ctx.beginPath();
    ctx.lineWidth = params.chrLnWidth;
    ctx.lineJoin = 'round';
    ctx.strokeStyle = column.color;
    ctx.globalAlpha = column.opacity;
    chart.forEachX(function (value, index) {
      var x = (value - x_range.begin) * x_range.XScale,
          y = chart.getYValue(colIndex, index) - y_range.min;
      if (index == x_range.iBegin) ctx.moveTo(x, yArea - y * y_range.YScale);else ctx.lineTo(x, yArea - y * y_range.YScale);
    }, x_range.iBegin, x_range.iEnd);
    ctx.stroke();
    ctx.globalAlpha = 1;
  },
      renderLineSelected = function renderLineSelected(column, colIndex) {
    ctx.beginPath();
    ctx.lineWidth = params.chrLnWidth;
    ctx.lineJoin = 'round';
    ctx.strokeStyle = column.color;
    ctx.fillStyle = params.bkgColor;
    ctx.globalAlpha = column.opacity;
    var x = (chart.getX(selectedX.index) - x_range.begin) * x_range.XScale,
        y = chart.getYValue(colIndex, selectedX.index) - y_range.min;
    ctx.arc(x, yArea - y * y_range.YScale, 4 * dpr, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
  },
      barRender = function barRender(column, colIndex) {
    var barWidth = width / (x_range.iEnd - x_range.iBegin) / 2;
    ctx.beginPath();
    ctx.fillStyle = column.color;
    ctx.moveTo(width, yArea);
    ctx.lineTo(0, yArea);
    chart.forEachX(function (value, index) {
      var x = (value - x_range.begin) * x_range.XScale,
          y = chart.getYValue(colIndex, index) - (!chart.data.stacked ? y_range.min : 0);
      ctx.lineTo(x - barWidth, yArea - y * y_range.YScale);
      ctx.lineTo(x + barWidth, yArea - y * y_range.YScale);
    }, x_range.iBegin, x_range.iEnd);
    ctx.closePath();
    ctx.fill();
  },
      barSelectedRender = function barSelectedRender(column, colIndex) {
    ctx.globalAlpha = 1;
    var barWidth = width / (x_range.iEnd - x_range.iBegin) / 2;
    var x = (chart.getX(selectedX.index) - x_range.begin) * x_range.XScale,
        y = chart.getYValue(colIndex, selectedX.index) - (!chart.data.stacked ? y_range.min : 0);
    ctx.beginPath();
    ctx.fillStyle = column.color;
    ctx.moveTo(x - barWidth, yArea);
    ctx.lineTo(x + barWidth, yArea);
    ctx.lineTo(x + barWidth, yArea - y * y_range.YScale);
    ctx.lineTo(x - barWidth, yArea - y * y_range.YScale);
    ctx.closePath();
    ctx.fill();
  },
      areaRender = function areaRender(column, colIndex) {
    ctx.beginPath();
    ctx.fillStyle = column.color;
    ctx.moveTo(width, yArea); //right-bottom corner

    ctx.lineTo(0, yArea); // left-bottom corner

    if (chart.data.percentage && order == 0) {
      ctx.lineTo(0, topOffset); // left-top corner 

      ctx.lineTo(width, topOffset); // right-top corner

      ctx.closePath();
      ctx.fill();
      return;
    }

    chart.forEachX(function (value, xIndex) {
      var x = (value - x_range.begin) * x_range.XScale,
          y = yArea - (chart.data.percentage ? yArea - topOffset : yArea) * chart.getYValue(colIndex, xIndex);
      ctx.lineTo(x, y);
    }, x_range.iBegin, x_range.iEnd);
    ctx.closePath();
    ctx.fill();
  },
      pieRender = function pieRender(column, index) {
    var value = pie.values[index] / pie.sum,
        angle = value * Math.PI * 2,
        textAngle = pie.renderAngle - angle / 2,
        textRadius = pie.radius * .7,
        fontSize = params.fntAxesSize + 20 * value;

    if (anim.pieRange) {
      var prevValue = pie.prevValues[index] / pie.prevSum;
      value = prevValue + (value - prevValue) * anim.pieRange.progress;
      angle = value * Math.PI * 2;
    }

    var cX = centerX,
        cY = centerY;

    if (index == selectedX.index) {
      cX += pie.selectedOut * Math.cos(textAngle);
      cY += pie.selectedOut * Math.sin(textAngle);
    }

    ctx.beginPath();
    ctx.fillStyle = column.color;
    ctx.moveTo(cX, cY);
    ctx.lineTo(cX + pie.radius * Math.cos(pie.renderAngle), cY + pie.radius * Math.sin(pie.renderAngle));
    ctx.arc(cX, cY, pie.radius, pie.renderAngle, pie.renderAngle - angle, true);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = textAngle > Math.PI / 2 || value < Math.PI * 2 / 3 ? 'center' : 'left';

    if (value > .02) {
      ctx.font = 'bold ' + fontSize + 'px ' + params.fntAxes;
      text(Math.round(value * 100).toFixed(0) + '%', cX + textRadius * Math.cos(textAngle), cY + textRadius * Math.sin(textAngle) + fontSize / 2);
      ctx.font = params.fntAxesSize + 'px ' + params.fntAxes;
    }

    pie.renderAngle -= angle;
  },
      zoomInRender = function zoomInRender() {
    ctx.globalAlpha = 1 - anim.zoomIn.progress;
  },
      zoomInPieRender = function zoomInPieRender() {
    ctx.fillStyle = params.bkgColor;
    ctx.fillRect(0, yArea, width, height - yArea);
    ctx.beginPath();
    ctx.fillStyle = '#FFFFFF';
    ctx.globalCompositeOperation = 'destination-in';
    ctx.arc(width / 2, height / 2, pie.radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  },
      zoomInPieChartRender = function zoomInPieChartRender(column, colIndex) {
    var pieAngle = 2 * Math.PI * chart.getYValue(colIndex, pie.index),
        setProgress = function setProgress(value) {
      var to = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      return (to - value) * pie.zoomProgress;
    };

    ctx.translate(centerX, centerY);
    ctx.rotate(Math.PI / 18 * pie.zoomProgress);
    ctx.translate(-centerX, -centerY);
    ctx.beginPath();
    ctx.fillStyle = ctx.strokeStyle = column.color;
    ctx.moveTo(width, yArea); //right-bottom corner

    ctx.lineTo(0, yArea); // left-bottom corner

    if (order == 0) {
      ctx.moveTo(width, yArea); //right-bottom corner

      ctx.lineTo(0, yArea); // left-bottom corner

      ctx.lineTo(0, topOffset); // left-top corner 

      ctx.lineTo(width, topOffset); // right-top corner

      ctx.closePath();
      ctx.fill();
      return;
    }

    ctx.moveTo(centerX + pie.radius, centerY);
    ctx.arc(width / 2, height / 2, pie.radius, 0, Math.PI + setProgress(Math.PI, pieAngle));
    var afterMiddle = false;
    chart.forEachX(function (value, xIndex) {
      var x = (value - x_range.begin) * x_range.XScale,
          y = yArea - (yArea - topOffset) * chart.getYValue(colIndex, xIndex);

      if (x >= centerX && !afterMiddle) {
        x += setProgress(x, centerX);
        afterMiddle = true;
      }

      if (!afterMiddle) {
        var radius = Math.abs(x - centerX),
            ang = Math.PI;
        y += setProgress(y, centerY);
        ang += setProgress(ang, pieAngle);
        x = Math.cos(ang) * radius + centerX;
        y += Math.sin(ang) * radius;
      } else {
        var deltaY = setProgress(y, centerY);
        var cy = y + (deltaY + deltaY * Math.pow((x - centerX) / centerX, 1 / 2));
        if (centerY < cy && centerY < y || centerY > cy && centerY > y) y = cy;else y = centerY;
      }

      ctx.lineTo(x, y);
    }, x_range.iBegin, x_range.iEnd);
    ctx.closePath();
    ctx.fill();
    ctx.resetTransform();
  },
      updateXRange = function updateXRange() {
    x_range.XScale = width / (x_range.end - x_range.begin);
    x_range.iBegin = chart.getFloorX(x_range.begin);
    x_range.iEnd = chart.getFloorX(x_range.end) + 1;

    if (skipFactorChaged) {
      x_range.textWidth = x_range.textWidth || ctx.measureText(chart.getXLabel(0)).width;
      var factor = 2 << ~~Math.log2((x_range.iEnd - x_range.iBegin) / ~~(width / x_range.textWidth));

      if (x_range.skipFactor != factor) {
        if (factor > x_range.skipFactor) {
          anim.add('CR_xrange_skipAlpha_fadeOut', 200)["for"](x_range, 'skipAlpha').from(1).to(0).tick(function () {
            flag = true;
          }).run();
        }

        if (factor < x_range.skipFactor) {
          anim.add('CR_xrange_skipAlpha_fadeIn', 200)["for"](x_range, 'skipAlpha').from(0).to(1).tick(function () {
            flag = true;
          }).run();
        }

        x_range.skipFactor = factor;
      }
    }

    skipFactorChaged = rangeXChanged = false;
  },
      updateYRange = function updateYRange() {
    var minMax = chart.getMinMaxValue(x_range.iBegin, x_range.iEnd),
        from = {
      min: y_range.min,
      max: y_range.max
    };

    if (from.min == minMax.min && from.max == minMax.max) {
      rangeYChanged = false;
      return;
    }

    if (anim.CR_yRange) {
      anim.CR_yRange.to = {
        min: gradation(minMax.min, true),
        max: gradation(minMax.max)
      };
      rangeYChanged = false;
      return;
    }

    anim.add('CR_yRange', 150).from(from).to({
      min: gradation(minMax.min, true),
      max: gradation(minMax.max)
    }).tick(function (value, from, to) {
      y_range.max = (to.max - from.max) * value + from.max;
      y_range.min = (to.min - from.min) * value + from.min;
      y_range.YScale = yArea / (y_range.max - y_range.min);
      flag = true;
    }).after(function () {
      /*y_range.max = minMax.max;
      y_range.min = minMax.min;
      y_range.YScale = yArea/(y_range.max - y_range.min);*/
      flag = true;
    }).run();
    rangeYChanged = false;
  },
      updatePieRange = function updatePieRange() {
    pie.iBegin = chart.getCloserX(pie.begin);
    pie.iEnd = chart.getCloserX(pie.end);
    pie.prevValues = pie.values.slice();
    pie.prevSum = pie.sum;
    delete pie.values;
    pie.values = [];
    pie.sum = 0;
    chart.forEachColumn(function (column, colIndex) {
      chart.forEachX(function (value, xIndex) {
        if (pie.values[colIndex]) pie.values[colIndex] += column.values[xIndex] * column.opacity;else pie.values[colIndex] = column.values[xIndex] * column.opacity;
        pie.sum += column.values[xIndex] * column.opacity;
      }, pie.iBegin, pie.iEnd);
    });
  },
      topOffset = params.fntAxesSize + 4 * dpr,
      x_range = {
    begin: 0,
    end: 0,
    XScale: 0,
    iBegin: 0,
    iEnd: 0,
    skipFactor: 0,
    textWidth: 0,
    skipAlpha: 0
  },
      y_range = {
    max: 6,
    min: 0,
    YScale: 0
  },
      selectedX = {
    selected: false,
    xValue: 0,
    index: 0,
    zoomed: false,
    piemode: false
  },
      pie = {
    active: false,
    zoomProgress: 0,
    radius: 0,
    dayOfWeek: 0,
    begin: 0,
    end: 0,
    iBegin: 0,
    iEnd: 0,
    prevValues: [],
    prevSum: [],
    values: [],
    sum: 0,
    renderAngle: 0,
    selected: -1,
    selectedOut: 0
  };

  var flag = true,
      rangeXChanged = true,
      rangeYChanged = true,
      skipFactorChaged = true,
      rangePieChanged = false,
      order = 0;
  ctx.imageSmoothingEnabled = true;
  ctx.font = params.fntAxesSize + 'px ' + params.fntAxes; //ctx.scale(1/dpr,-1/dpr);

  this.updateYRangeWA = function () {
    var _chart$getMinMaxValue = chart.getMinMaxValue(x_range.iBegin, x_range.iEnd),
        min = _chart$getMinMaxValue.min,
        max = _chart$getMinMaxValue.max;

    y_range.max = max;
    y_range.min = min;
    y_range.YScale = yArea / (y_range.max - y_range.min);
    rangeXChanged = true;
    rangeYChanged = false;
    flag = true;
  };

  this.setRange = function (begin, end) {
    if (begin > end) return;

    if (pie.active) {
      pie.begin = begin;
      pie.end = end;
      rangePieChanged = flag = true;
      return;
    }

    x_range.begin = begin;
    x_range.end = end;
    skipFactorChaged = rangeYChanged = true;
    rangeXChanged = flag = true;
    anim.add('bag', 100).tick(function () {
      rangeYChanged = flag = true;
    }).run();
  };

  this.setBeginRange = function (begin) {
    if (pie.active) {
      pie.begin = begin;
      rangePieChanged = flag = true;
      return;
    }

    x_range.begin = begin;
    skipFactorChaged = rangeYChanged = rangeXChanged = flag = true;
  };

  this.setEndRange = function (end) {
    if (pie.active) {
      pie.end = end;
      rangePieChanged = flag = true;
      return;
    }

    x_range.end = end;
    skipFactorChaged = rangeYChanged = rangeXChanged = flag = true;
  };

  this.getBeginRange = function () {
    return x_range.begin;
  };

  this.getEndRange = function () {
    return x_range.end;
  };

  this.setSelectedX = function (screenPosX, screenPosY) {
    if (pie.active) {
      var radius = Math.hypot(screenPosX - centerX, screenPosY - centerY);

      if (radius > pie.radius) {
        _this3.unsetSelectedX();

        flag = true;
        return false;
      }

      var percent = Math.acos((screenPosX - centerX) / radius) / Math.PI / 2;
      if (screenPosY < centerY) percent = 1 - percent;
      selectedX.selected = false;
      var sum = 1;
      chart.forEachColumn(function (column, index) {
        sum -= pie.values[index] / pie.sum;

        if (percent > sum && !selectedX.selected) {
          selectedX.index = index;
          selectedX.selected = true;
        }
      });
      anim.add('pieSelect', 100)["for"](pie, 'selectedOut').from(0).to(30).tick(function () {
        flag = true;
      }).run();
      selectedX.xValue = pie.values[selectedX.index];
      selectedX.piemode = true;
      flag = true;
      return true;
    }

    selectedX.selected = true;
    selectedX.index = chart.getCloserX(screenPosX / x_range.XScale + x_range.begin);
    selectedX.xValue = chart.getX(selectedX.index);
    flag = true;
    return true;
  };

  this.getSelectedX = function () {
    return selectedX;
  };

  this.unsetSelectedX = function () {
    selectedX.selected = false;
    selectedX.index = -1;
    selectedX.piemode = false;
  };

  this.zoomInPie = function () {
    if (!selectedX.selected) return;
    selectedX.zoomed = true;
    pie.active = true;
    pie.index = selectedX.index;
    pie.xValue = selectedX.xValue;

    _this3.setRange(selectedX.xValue, selectedX.xValue);

    anim.add('zoomInPie_radius', 1200).timing('elastic', 'out')["for"](pie, 'radius').from(width + height).to(Math.min(width, height) * .3).tick(function () {
      flag = true;
    }).run();
    anim.add('zoomInPie', 400)["for"](pie, 'zoomProgress').from(0).to(1).timing('circ', 'out').tick(function () {
      flag = true;
    }).after(function () {
      rangePieChanged = flag = false;
    }).run();
    return pie;
  };

  this.zoomOutPie = function () {
    if (!selectedX.selected) return;
    selectedX.zoomed = selectedX.piemode = pie.active = false;
    anim.add('zoomInPie_radius', 1200) //.timing('elastic','out')
    ["for"](pie, 'radius').from(width * .3).to(width + height).tick(function () {
      flag = true;
    }).run();
    anim.add('zoomInPie', 400)["for"](pie, 'zoomProgress').from(1).to(0).tick(function () {
      flag = true;
    }).after(function () {
      rangeXChanged = true; //updateXRange();

      flag = true;
    }).run();
  };

  this.zoomIn = function (cb) {
    if (!selectedX.selected) return;
    selectedX.zoomed = true;
    anim.add('zoomIn', 200).from({
      begin: x_range.begin,
      end: x_range.end
    }).tick(function (progress, from) {
      x_range.begin = from.begin + (selectedX.xValue - from.begin) * progress;
      x_range.end = from.end + (selectedX.xValue - from.end) * progress;
      rangeXChanged = true;
      flag = true;
    }).after(function () {
      cb();
      flag = true;
    }).run();
  };

  this.zoomOut = function () {
    selectedX.zoomed = false;
  };

  this.showColumn = function (index) {
    rangeYChanged = true;
    anim.add('columnOpacity', 200)["for"](chart.data.columns[index], 'opacity').from(0).to(1).timing('circ', 'out').tick(function () {
      rangePieChanged = flag = true;
    }).after(function () {
      rangePieChanged = flag = true;
    }).run();
  };

  this.hideColumn = function (index) {
    rangeYChanged = true;
    anim.add('columnOpacity', 200)["for"](chart.data.columns[index], 'opacity').from(1).to(0).tick(function () {
      rangePieChanged = flag = true;
    }).after(function () {
      rangePieChanged = flag = true;
    }).run();
  };

  this.prepare = function () {
    ctx.clearRect(0, 0, width, height);
    if (rangeXChanged) updateXRange();
    if (rangeYChanged) updateYRange();
    if (pie.active && rangePieChanged) updatePieRange();
    order = 0;
    pie.renderAngle = 0;
  };

  this.render = function () {
    if (selectedX.selected && chart.data.columns.length > 0 && chart.data.columns[0].type == 'bar') {
      ctx.globalAlpha = 0.5; //ctx.globalCompositeOperation = 'lighten';

      ctx.fillStyle = params.ltnColor;
      ctx.fillRect(0, 0, width, height);
      ctx.globalAlpha = 1; //ctx.globalCompositeOperation = 'source-over';
    }

    if (anim.zoomInPie) {
      zoomInPieRender();
    }

    if (pie.active) {
      gridRender();
      if (params.debug) debugRender();
      return;
    }

    gridRender();

    if (anim.zoomIn) {
      zoomInRender();
    }

    xAxisRender();
    if (chart.data.percentage) yAxisPercentageRender();else yAxisRender();
    if (params.debug) debugRender();
  };

  this.renderChart = function (column, index, columns) {
    var call = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : function (column, index) {
      if (anim.zoomInPie) {
        zoomInPieChartRender(column, index);
        return;
      }

      if (pie.active) {
        pieRender(column, index);
        return;
      }

      if (column.type === 'line') {
        lineRender(column, index);
        return;
      }

      if (column.type === 'bar') {
        barRender(column, index);
        return;
      }

      if (column.type === 'area') {
        areaRender(column, index);
        return;
      }
    };
    if (!column || column.opacity === 0) return;
    call(column, index, columns);
    order++;
  };

  this.renderChartSelected = function (column, index) {
    if (!column || column.opacity === 0) return;

    if (column.type === 'line') {
      renderLineSelected(column, index);
      return;
    }

    if (column.type === 'bar') {
      barSelectedRender(column, index);
      return;
    }
  };

  this["finally"] = function () {
    return flag = false;
  };

  this.flag = function () {
    return flag;
  };

  this.refresh = function () {
    return flag = true;
  };

  this.resize = function () {
    console.log('resize');
    var rect = {
      width: canvas.parentElement.clientWidth,
      height: canvas.parentElement.clientHeight
    };
    canvas.setAttribute('width', rect.width);
    canvas.setAttribute('height', rect.width * .8); //canvas.setAttribute('width','100%')

    width = rect.width;
    height = rect.width * .8;
    centerX = width / 2;
    centerY = height / 2;
    yArea = height - params.fntAxesSize - 10 * dpr;
    rangeXChanged = rangeYChanged = flag = true;
    levelHeigth = chart.data.percentage ? (yArea - topOffset) / 4 : yArea / 6;
  };

  this.direct = function () {
    return true;
  }; //pie.active || !chart.data.stacked;

};
/* chartView.js */


'use strict'; // eslint-disable-next-line no-unused-vars


var ChartView = function ChartView(c, title, params, dataLoader) {
  var _this4 = this;

  /* PRIVATE METHODS */
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      addDomElem = function addDomElem(parent, tag) {
    var classes = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
    var html = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '';
    var e = document.createElement(tag);
    parent.appendChild(e);
    e.classList.add(classes);
    e.innerHTML = html;
    return e;
  },
      getCloserStep = function getCloserStep(value, stepLength) {
    var floor = ~~(value / stepLength) * stepLength,
        before = value - floor;
    return floor + stepLength - value > before ? -before : floor + stepLength - value;
  },
      eventsInit = function eventsInit() {
    var supportsPassive = function () {
      var sp = false;

      try {
        var opts = Object.defineProperty({}, 'passive', {
          // eslint-disable-next-line getter-return
          get: function get() {
            sp = true;
          }
        });
        window.addEventListener('testPassive', null, opts);
        window.removeEventListener('testPassive', null, opts); // eslint-disable-next-line no-empty
      } catch (e) {}

      return sp;
    }(),
        onNavMove = function onNavMove(e) {
      if (!_this4.mouseFlags.onNavMove) return;
      var lim = _this4.$prv_container.offsetWidth - _this4.$nav.clientWidth - 2,
          left = ~~(_this4.$nav.offsetLeft + e.pageX - _this4.mouseFlags.prevX);
      _this4.$nav.style.left = (left <= 0 ? 0 : left >= lim ? lim : left) + 'px';

      _chartRender.setRange(screenPosToXValue(_this4.$nav.offsetLeft), screenPosToXValue(_this4.$nav.offsetLeft + _this4.$nav.offsetWidth));

      _this4.mouseFlags.prevX = e.pageX;
    },
        onMouseUp = function onMouseUp() {
      if (_previewRender.piemode) {
        if (!_this4.mouseFlags.onNavMove) return;

        if (_this4.$nav.offsetLeft % _this4.$prv_container.offsetWidth / 7 > 0) {
          _anim.add('pieModeNav', 100).from(_this4.$nav.offsetLeft).to(_this4.$nav.offsetLeft + getCloserStep(_this4.$nav.offsetLeft, _this4.$prv_container.offsetWidth / 7)).tick(function (value) {
            _this4.$nav.style.left = value + 'px';
          }).run();
        }
      }

      rangeInfoOut(_chartRender.getBeginRange(), _chartRender.getEndRange());
      _this4.mouseFlags.onNavMove = false;
    };

    _this4.$nav.addEventListener('mousedown', function (e) {
      _this4.mouseFlags.prevX = ~~e.pageX;
      if (e.pageX < _this4.$nav.offsetLeft + _this4.$navl.offsetWidth || e.pageX > _this4.$nav.offsetLeft + _this4.$nav.offsetWidth - _this4.$navr.offsetWidth) return; //_chartRender.unsetSelectedX();

      hidePlaque();
      _this4.mouseFlags.onNavMove = true;
    });

    _this4.$nav.addEventListener('mousemove', onNavMove);

    _this4.$nav.addEventListener('mouseup', onMouseUp);

    _this4.$nav.addEventListener('touchstart', function (e) {
      _this4.mouseFlags.prevX = ~~e.touches[0].pageX;
      if (e.touches[0].pageX < _this4.$nav.offsetLeft + _this4.$navl.offsetWidth || e.touches[0].pageX > _this4.$nav.offsetLeft + _this4.$nav.offsetWidth - _this4.$navr.offsetWidth) return; //_chartRender.unsetSelectedX();

      hidePlaque();
      _this4.mouseFlags.onNavMove = true;
    }, supportsPassive ? {
      passive: true
    } : false);

    _this4.$nav.addEventListener('touchmove', function (e) {
      onNavMove(e.touches[0]);
      e.stopPropagation();
    }, supportsPassive ? {
      passive: true
    } : false);

    _this4.$nav.addEventListener('touchend', onMouseUp);

    var onMouseDownNavL = function onMouseDownNavL(e) {
      _this4.mouseFlags.onBeginMove = true;
      _this4.mouseFlags.prevX = ~~e.pageX; //_chartRender.unsetSelectedX();

      hidePlaque();
    },
        onMouseMoveNavL = function onMouseMoveNavL(e) {
      if (!_this4.mouseFlags.onBeginMove) return;
      var lim = _this4.$nav.offsetLeft + _this4.$nav.clientWidth - _this4.$navl.clientWidth * 2,
          d = ~~(e.pageX - _this4.mouseFlags.prevX),
          left = _this4.$nav.offsetLeft + d;
      if (!d || left >= lim) return;
      _this4.$nav.style.left = (left <= 0 ? 0 : left >= lim ? left : left) + 'px';
      _this4.$nav.style.width = _this4.$nav.clientWidth - d + 'px';

      _chartRender.setBeginRange(screenPosToXValue(_this4.$nav.offsetLeft));

      _this4.mouseFlags.prevX = e.pageX;
    },
        onMouseUpNavL = function onMouseUpNavL() {
      _this4.mouseFlags.onBeginMove = false;

      if (_previewRender.piemode) {
        if (_this4.$nav.offsetLeft % _this4.$prv_container.offsetWidth / 7 > 0) {
          _anim.add('pieModeNavLeft', 100).from(_this4.$nav.offsetLeft).to(_this4.$nav.offsetLeft + getCloserStep(_this4.$nav.offsetLeft, _this4.$prv_container.offsetWidth / 7)).tick(function (value) {
            _this4.$nav.style.left = value + 'px';
          }).run();

          _anim.add('pieModeNavWidth', 100).from(_this4.$nav.offsetWidth).to(_this4.$nav.offsetWidth + getCloserStep(_this4.$nav.offsetWidth, _this4.$prv_container.offsetWidth / 7)).tick(function (value) {
            _this4.$nav.style.width = value + 'px';
          }).run();
        }
      }

      rangeInfoOut(_chartRender.getBeginRange(), _chartRender.getEndRange());
      _this4.mouseFlags.onNavMove = false;
    },
        onMouseDownNavR = function onMouseDownNavR(e) {
      _this4.mouseFlags.onEndMove = true;
      _this4.mouseFlags.prevX = ~~e.pageX; //_chartRender.unsetSelectedX();

      hidePlaque();
    },
        onMouseMoveNavR = function onMouseMoveNavR(e) {
      if (!_this4.mouseFlags.onEndMove) return;
      var d = ~~(e.pageX - _this4.mouseFlags.prevX);
      if (!d) return;
      _this4.$nav.style.width = _this4.$nav.clientWidth + d + 'px';

      _chartRender.setEndRange(screenPosToXValue(_this4.$nav.offsetLeft + _this4.$nav.offsetWidth));

      _this4.mouseFlags.prevX = e.pageX;
    },
        onMouseUpNavR = function onMouseUpNavR() {
      _this4.mouseFlags.onEndMove = false;

      if (_previewRender.piemode) {
        if (_this4.$nav.offsetLeft % _this4.$prv_container.offsetWidth / 7 > 0) {
          _anim.add('pieModeNavWidth', 100).from(_this4.$nav.offsetWidth).to(_this4.$nav.offsetWidth + getCloserStep(_this4.$nav.offsetWidth, _this4.$prv_container.offsetWidth / 7)).tick(function (value) {
            _this4.$nav.style.width = value + 'px';
          }).run();
        }
      }

      _this4.mouseFlags.onNavMove = false;
      rangeInfoOut(_chartRender.getBeginRange(), _chartRender.getEndRange());
    };

    _this4.$navl.addEventListener('touchstart', function (e) {
      onMouseDownNavL(e.touches[0]);
    }, supportsPassive ? {
      passive: true
    } : false);

    _this4.$navl.addEventListener('mousedown', onMouseDownNavL, supportsPassive ? {
      passive: true
    } : false);

    _this4.$navl.addEventListener('touchmove', function (e) {
      onMouseMoveNavL(e.touches[0]);
      e.stopPropagation();
    }, supportsPassive ? {
      passive: true
    } : false);

    _this4.$navl.addEventListener('mousemove', onMouseMoveNavL);

    _this4.$navl.addEventListener('touchend', onMouseUpNavL);

    _this4.$navl.addEventListener('mouseup', onMouseUpNavL);

    _this4.$navr.addEventListener('touchstart', function (e) {
      onMouseDownNavR(e.touches[0]);
    }, supportsPassive ? {
      passive: true
    } : false);

    _this4.$navr.addEventListener('mousedown', onMouseDownNavR, supportsPassive ? {
      passive: true
    } : false);

    _this4.$navr.addEventListener('touchmove', function (e) {
      onMouseMoveNavR(e.touches[0]);
      e.stopPropagation();
    }, supportsPassive ? {
      passive: true
    } : false);

    _this4.$navr.addEventListener('mousemove', onMouseMoveNavR);

    _this4.$navr.addEventListener('touchend', onMouseUpNavR);

    _this4.$navr.addEventListener('mouseup', onMouseUpNavR);

    _this4.$cnv.addEventListener('click', function (e) {
      if (_chartRender.setSelectedX(e.offsetX * _dpr, e.offsetY * _dpr)) if (_params.onValueSelect(_chartRender.getSelectedX(), _chart)) showPlaque(_chartRender.getSelectedX());else hidePlaque();
    });

    _this4.$plq.$caption.addEventListener('click', function () {
      if (_chartRender.getSelectedX().zoomed) return;
      zoomIn();
    });

    _this4.$zmo.addEventListener('click', function () {
      zoomOut();
    });

    window.addEventListener('resize', function () {
      if (_previewRender) _previewRender.resize();
      if (_chartRender) _chartRender.resize();
    });
  },
      rangeInfoOut = function rangeInfoOut(begin, end) {
    var dateBegin = new Date(begin),
        dateEnd = new Date(end);
    _this4.$rng.innerHTML = dateBegin.getDate() + ' ' + MONTHS[dateBegin.getMonth()] + ' ' + dateBegin.getFullYear() + ' - ' + dateEnd.getDate() + ' ' + MONTHS[dateEnd.getMonth()] + ' ' + dateEnd.getFullYear();
  },
      showPlaque = function showPlaque(selectedX) {
    if (!_this4.$plq) return;

    if (selectedX.piemode) {
      _this4.$plq.classList.add('show');

      _this4.$plq.$list.innerHTML = "<div><span>".concat(_chart.data.columns[selectedX.index].name, "</span><span style=\"color:").concat(_chart.data.columns[selectedX.index].color, "\">").concat(selectedX.xValue, "</span>");
      return;
    }

    _this4.$plq.$caption.innerHTML = '';
    _this4.$plq.$list.innerHTML = '';

    _this4.$plq.classList.add('show');

    _this4.$plq.$caption.innerHTML = _params.valToStr(selectedX.xValue, false);
    if (_chart.data.percentage) _this4.$plq.$list.classList.add('percentage');

    _chart.forEachColumn(function (column) {
      var innerHTML = '';

      if (column.visible) {
        if (_chart.data.percentage) {
          innerHTML = "<span>".concat((column.values[selectedX.index] / _chart.getSumYValues(selectedX.index) * 100).toFixed(0), "%</span>");
        }

        innerHTML += "<span>".concat(column.name, "</span><span style=\"color:").concat(column.color, "\">").concat(column.values[selectedX.index], "</span>");
        addDomElem(_this4.$plq.$list, 'div', "".concat(column.name.toLowerCase().replace(' ', '_')), innerHTML);
      }
    });
  },
      hidePlaque = function hidePlaque() {
    if (!_this4.$plq) return;

    _this4.$plq.classList.remove('show');

    _this4.$plq.$list.classList.remove('percentage');

    _this4.$plq.$caption.innerHTML = '';
    _this4.$plq.$list.innerHTML = '';
  },
      zoomIn = function zoomIn() {
    if (_dataLoader.zoomIn) {
      _chartRender.zoomIn(function () {
        _chart.pushCache();

        _chart.clearData();

        _dataLoader.getZoom(_chartRender.getSelectedX().xValue);

        _navigator.left = _this4.$nav.offsetLeft;
        _navigator.width = _this4.$nav.offsetWidth;

        _anim.add('zoomInNav', 400).tick(function (progress) {
          _this4.$nav.style.left = _navigator.left + (_this4.$prv_container.offsetWidth / 7 * 3 - _navigator.left) * progress + 'px';
          _this4.$nav.style.width = _navigator.width + (_this4.$prv_container.offsetWidth / 7 - _navigator.width) * progress + 'px';

          _chartRender.setRange(screenPosToXValue(_this4.$nav.offsetLeft), screenPosToXValue(_this4.$nav.offsetLeft + _this4.$nav.offsetWidth));
        }).after(function () {
          _chartRender.setRange(screenPosToXValue(_this4.$nav.offsetLeft), screenPosToXValue(_this4.$nav.offsetLeft + _this4.$nav.offsetWidth));
        }).run();
      });

      _this4.$cnt.classList.add('zoomed');
    } else if (_chart.data.percentage) {
      _chartRender.zoomInPie();

      _previewRender.piemode = true;

      _previewRender.setXAxis(_chartRender.getSelectedX().index - 3, _chartRender.getSelectedX().index + 4).setYAxis();

      _navigator.left = _this4.$nav.offsetLeft;
      _navigator.width = _this4.$nav.offsetWidth;

      _anim.add('zoomInNav', 400).tick(function (progress) {
        _this4.$nav.style.left = _navigator.left + (_this4.$prv_container.offsetWidth / 7 * 3 - _navigator.left) * progress + 'px';
        _this4.$nav.style.width = _navigator.width + (_this4.$prv_container.offsetWidth / 7 - _navigator.width) * progress + 'px'; //_chartRender.setRange(screenPosToXValue(this.$nav.offsetLeft), screenPosToXValue(this.$nav.offsetLeft + this.$nav.offsetWidth));
      }).after(function () {//_chartRender.setRange(screenPosToXValue(this.$nav.offsetLeft), screenPosToXValue(this.$nav.offsetLeft + this.$nav.offsetWidth));		
      }).run();

      _this4.$cnt.classList.add('zoomed');
    }

    hidePlaque();
  },
      zoomOut = function zoomOut() {
    if (dataLoader.zoomIn) {
      _chartRender.zoomOut();

      _chart.popCache();

      _previewRender.setXAxis().setYAxis();

      _anim.add('zoomOutNav', 400).from({
        left: _this4.$nav.offsetLeft,
        width: _this4.$nav.offsetWidth
      }).tick(function (progress, from) {
        _this4.$nav.style.left = from.left + (_navigator.left - from.left) * progress + 'px';
        _this4.$nav.style.width = from.width + (_navigator.width - from.width) * progress + 'px';

        _chartRender.setRange(screenPosToXValue(_this4.$nav.offsetLeft), screenPosToXValue(_this4.$nav.offsetLeft + _this4.$nav.offsetWidth));
      }).after(function () {
        _chartRender.setRange(screenPosToXValue(_this4.$nav.offsetLeft), screenPosToXValue(_this4.$nav.offsetLeft + _this4.$nav.offsetWidth));
      }).run();

      legendInit();

      _chartRender.setRange(screenPosToXValue(_this4.$nav.offsetLeft), screenPosToXValue(_this4.$nav.offsetLeft + _this4.$nav.offsetWidth));
    } else if (_chart.data.percentage) {
      _previewRender.piemode = false;

      _chartRender.zoomOutPie();

      _previewRender.setXAxis().setYAxis();

      _anim.add('zoomOutNav', 400).from({
        left: _this4.$nav.offsetLeft,
        width: _this4.$nav.offsetWidth
      }).tick(function (progress, from) {
        _this4.$nav.style.left = from.left + (_navigator.left - from.left) * progress + 'px';
        _this4.$nav.style.width = from.width + (_navigator.width - from.width) * progress + 'px'; //_chartRender.setRange(screenPosToXValue(this.$nav.offsetLeft), screenPosToXValue(this.$nav.offsetLeft + this.$nav.offsetWidth));
      }).after(function () {
        _chartRender.setRange(screenPosToXValue(_this4.$nav.offsetLeft), screenPosToXValue(_this4.$nav.offsetLeft + _this4.$nav.offsetWidth));
      }).run();
    }

    hidePlaque();

    _this4.$cnt.classList.remove('zoomed');
  },
      screenPosToXValue = function screenPosToXValue(pos) {
    return pos * _dpr / _previewRender.XScale + _chart.getX(_previewRender.iBegin);
  },
      previewRenderInit = function previewRenderInit() {
    // eslint-disable-next-line no-undef
    _previewRender = new PreviewRender(_this4.$prv, _chart, _dpr, _anim, _params);

    _previewRender.resize();

    _previewRender.setXAxis().setYAxis();
  },
      chartRenderInit = function chartRenderInit() {
    // eslint-disable-next-line no-undef
    _chartRender = new ChartRender(_this4.$cnv, _chart, _dpr, _anim, _params);

    _chartRender.resize();

    _chartRender.setRange(screenPosToXValue(_this4.$nav.offsetLeft), screenPosToXValue(_this4.$nav.offsetLeft + _this4.$nav.offsetWidth));
  },
      legendInit = function legendInit() {
    if (_chart.data.columns.length < 2) {
      _this4.$lgd.innerHTML = '';
      return;
    }

    var innerHTML = '';

    _chart.forEachColumn(function (column, index) {
      innerHTML = "<div data-column=\"".concat(index, "\" style=\"background-color:").concat(column.color, ";color:").concat(column.color, "\"><span>").concat(column.name, "</span></div>") + innerHTML;
    });

    _this4.$lgd.innerHTML = innerHTML;

    _this4.$lgd.childNodes.forEach(function (elem) {
      elem.addEventListener('click', function (e) {
        e.path[0].classList.toggle('unchecked');
        toggleColumnVisible(e.path[0].attributes['data-column'].value);
      });
    });
  },
      toggleColumnVisible = function toggleColumnVisible(index) {
    hidePlaque();
    _chart.data.columns[index].visible = !_chart.data.columns[index].visible;

    if (_chart.data.columns[index].visible) {
      _chartRender.showColumn(index);

      _previewRender.refreshBy(200);
    } else {
      _chartRender.hideColumn(index);

      _previewRender.refreshBy(200);
    }
  },
      render = function render() {
    if (_previewRender && _previewRender.flag()) _previewRender.prepare();
    if (_chartRender && _chartRender.flag()) _chartRender.prepare();

    _chart.forEachColumn(function (column, index, columns) {
      if (_previewRender && _previewRender.flag()) _previewRender.render(column, index, columns);
      if (_chartRender && _chartRender.flag()) _chartRender.renderChart(column, index, columns);
    }, _chartRender.direct());

    if (_chartRender && _chartRender.flag()) _chartRender.render();
    if (_chartRender.getSelectedX().selected) _chart.forEachColumn(function (column, index, columns) {
      if (_chartRender && _chartRender.flag()) _chartRender.renderChartSelected(column, index, columns);
    }, _chartRender.direct());
    if (_previewRender && _previewRender.flag()) _previewRender["finally"]();
    if (_chartRender && _chartRender.flag()) _chartRender["finally"]();
  },
      loop = function loop() {
    _animFrame.call(window, loop);

    _anim.update(Date.now());

    render();
  };
  /* PUBLIC FIELDS */


  this.$cnt = document.getElementById(c);
  this.$ttl = addDomElem(this.$cnt, params.titleTag || 'div', 'title');
  this.$zmo = addDomElem(this.$cnt, 'div', 'zoom-out', 'Zoom Out');
  this.$rng = addDomElem(this.$cnt, 'div', 'range');
  this.$plq = addDomElem(this.$cnt, 'div', 'plaque');
  this.$plq.$caption = addDomElem(this.$plq, 'div', 'caption');
  this.$plq.$list = addDomElem(this.$plq, 'div', 'list');
  hidePlaque();
  this.$lgd = addDomElem(this.$cnt, 'div', 'legend');
  this.$cnv_container = addDomElem(this.$cnt, 'div', 'canvas-container');
  this.$cnv = addDomElem(this.$cnv_container, 'canvas', 'chart');
  this.$prv_container = addDomElem(this.$cnt, 'div', 'preview-container');
  this.$prv = addDomElem(this.$prv_container, 'canvas', 'preview');
  this.$nav = addDomElem(this.$prv_container, 'div', 'nav');
  this.$navl = addDomElem(this.$nav, 'div', 'nav-left');
  this.$navr = addDomElem(this.$nav, 'div', 'nav-right');
  this.$nav.style.width = '100px';
  this.$ttl.innerHTML = this.title = title || 'Chart';
  this.mouseFlags = {
    onNavMove: false,
    onBeginMove: false,
    onEndMove: false,
    prevX: -1,
    prevY: -1
  };
  /* PRIVATE FIELDS */

  var _dpr = params.devicePixelRatio || window.devicePixelRatio || 1,
      _params = {
    prvLnWidth: params.previewLineWidth * _dpr || 2 * _dpr,
    chrLnWidth: params.chartLineWidth * _dpr || 2 * _dpr,
    fntAxes: params.fontAxes || window.getComputedStyle(this.$cnv).getPropertyValue('font-family'),
    fntAxesSize: params.fontAxesSize * _dpr || 10 * _dpr,
    fntAxesColor: params.fontAxesColor || window.getComputedStyle(this.$cnv).getPropertyValue('color'),
    lineAxesColor: params.lineAxesColor || window.getComputedStyle(this.$cnv).getPropertyValue('border-color'),
    bkgColor: params.backgroundColor || window.getComputedStyle(this.$cnv).getPropertyValue('background-color'),
    ltnColor: params.lightingColor || window.getComputedStyle(this.$cnv).getPropertyValue('lighting-color'),
    valToStr: params.valueToString || Number.prototype.toString.apply,
    timeToStr: params.timeToString || function (v) {
      return new Date(v).toJSON().slice(11, 16);
    },
    onValueSelect: params.onValueSelect || function () {
      return true;
    },
    debug: params.debug || false
  },
      // eslint-disable-next-line no-undef
  _chart = new ChartData(),
      _dataLoader = dataLoader,
      _navigator = {},
      // eslint-disable-next-line no-undef
  _anim = new Anim(),
      _animFrame = params.requestAnimFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (t) {
    window.setTimeout(t, 1e3 / 60);
  };

  var _previewRender, _chartRender;

  this.updateColors = function () {
    var colors = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    _params.fntAxesColor = colors.fontAxesColor || window.getComputedStyle(_this4.$cnv).getPropertyValue('color');
    _params.lineAxesColor = colors.lineAxesColor || window.getComputedStyle(_this4.$cnv).getPropertyValue('border-color');
    _params.bkgColor = colors.backgroundColor || window.getComputedStyle(_this4.$cnv).getPropertyValue('background-color');
    _params.ltnColor = colors.lightingColor || window.getComputedStyle(_this4.$cnv).getPropertyValue('lighting-color');

    _chartRender.refresh();
  };

  previewRenderInit();
  chartRenderInit();

  if (_dataLoader) {
    _dataLoader.setOnloadEvent(function (data, zoom) {
      _chart.setData(data, zoom ? _params.timeToStr : _params.valToStr);

      _previewRender.setXAxis().setYAxis();

      _chartRender.setRange(screenPosToXValue(_this4.$nav.offsetLeft), screenPosToXValue(_this4.$nav.offsetLeft + _this4.$nav.offsetWidth)); //_chartRender.updateYRangeWA();


      legendInit();
      rangeInfoOut(_chartRender.getBeginRange(), _chartRender.getEndRange());

      if (!zoom) {
        _anim.add('pieModeNavLeft', 100).from(_this4.$nav.offsetLeft).to(_this4.$nav.offsetLeft + 100).tick(function (value) {
          _this4.$nav.style.left = value + 'px';

          _chartRender.setRange(screenPosToXValue(_this4.$nav.offsetLeft), screenPosToXValue(_this4.$nav.offsetLeft + _this4.$nav.offsetWidth));
        }).run();
      }
    });
  }

  eventsInit();
  loop();
};
/* data_loader.js */
// eslint-disable-next-line no-unused-vars


var DataLoader = function DataLoader(uri, params) {
  var _this5 = this;

  this.xhr = new XMLHttpRequest();

  this.xhr.onreadystatechange = function () {
    if (_this5.xhr.readyState === 4 && _this5.xhr.status === 200) {
      if (typeof _this5.onload === 'function') _this5.onload(JSON.parse(_this5.xhr.responseText), _this5.zoomRequest);
      _this5.zoomRequest = false;
    }
  };

  this.uri = uri;
  this.path = '';
  this.before = params.before;
  this.zoomIn = params.zoomIn;
};

DataLoader.prototype = {
  pull: function pull(path) {
    this.path = path;
    this.xhr.open('GET', this.uri + path, true);
    this.xhr.send();
  },
  getZoom: function getZoom(value) {
    this.zoomRequest = true;
    this.pull(this.zoomIn(value) + '.json');
  },
  setOnloadEvent: function setOnloadEvent(cb) {
    this.onload = cb;
    if (this.before) this.pull(this.before + '.json');
  }
};
/* previewRender.js */
// eslint-disable-next-line no-unused-vars

var PreviewRender = function PreviewRender(canvas, chart, dpr, anim, params) {
  var _this6 = this;

  var width = canvas.width,
      height = canvas.height,
      yArea = height;
  this.XScale = 0;
  this.YScale = 0;
  this.iBegin = 0;
  this.iEnd = 0;
  this.piemode = false;

  var ctx = canvas.getContext('2d'),
      lineRender = function lineRender(column, colIndex) {
    ctx.beginPath();
    ctx.lineWidth = params.prvLnWidth;
    ctx.lineJoin = 'round';
    ctx.strokeStyle = column.color;
    ctx.globalAlpha = column.opacity;
    chart.forEachX(function (value, index) {
      var x = (value - chart.getX(_this6.iBegin)) * _this6.XScale,
          y = chart.getYValue(colIndex, index) - _this6.YMin;

      if (index == 0) ctx.moveTo(x, yArea - y * _this6.YScale);else ctx.lineTo(x, yArea - y * _this6.YScale);
    }, _this6.iBegin, _this6.iEnd);
    ctx.stroke();
    ctx.globalAlpha = 1;
  },
      barRender = function barRender(column, colIndex) {
    var count = _this6.iEnd - _this6.iBegin,
        barWidth = width / count / 2;
    ctx.beginPath();
    ctx.fillStyle = column.color;
    ctx.moveTo(width, yArea);
    ctx.lineTo(0, yArea);
    chart.forEachX(function (value, index) {
      var x = (value - chart.getX(_this6.iBegin)) * _this6.XScale,
          y = chart.getYValue(colIndex, index);

      ctx.lineTo(x - barWidth, yArea - y * _this6.YScale);
      ctx.lineTo(x + barWidth, yArea - y * _this6.YScale);
    }, _this6.iBegin, _this6.iEnd);
    ctx.closePath();
    ctx.fill();
  },
      areaRender = function areaRender(column, colIndex) {
    ctx.lineWidth = params.prvLnWidth;
    ctx.fillStyle = ctx.strokeStyle = column.color;
    ctx.beginPath();
    ctx.moveTo(width, yArea);
    ctx.lineTo(0, yArea);
    chart.forEachX(function (value, xIndex) {
      var x = (value - chart.getX(_this6.iBegin)) * _this6.XScale,
          y = chart.getYValue(colIndex, xIndex);

      ctx.lineTo(x, yArea - yArea * y);
    }, _this6.iBegin, _this6.iEnd);
    ctx.closePath();
    ctx.fill();
  },
      pieRender = function pieRender(column, colIndex) {
    var count = _this6.iEnd - _this6.iBegin,
        barWidth = width / count;
    ctx.beginPath();
    ctx.fillStyle = column.color;
    ctx.moveTo(width, yArea);
    ctx.lineTo(0, yArea);
    chart.forEachX(function (value, index) {
      var x = (value - chart.getX(_this6.iBegin)) * _this6.XScale,
          y = chart.getYValue(colIndex, index);

      ctx.lineTo(x, yArea - yArea * y);
      ctx.lineTo(x + barWidth, yArea - yArea * y);
    }, _this6.iBegin, _this6.iEnd);
    ctx.closePath();
    ctx.fill();
  };

  var flag = true;
  ctx.imageSmoothingEnabled = true;

  this.setXAxis = function (begin, end) {
    _this6.iBegin = begin || 0;
    _this6.iEnd = end || chart.getLength() - 1;
    _this6.xRange = chart.getXRange(_this6.iBegin, _this6.iEnd);
    _this6.XScale = width / _this6.xRange;
    flag = true;
    return _this6;
  };

  this.setYAxis = function () {
    var minMax = chart.getMinMaxValue(_this6.iBegin, _this6.iEnd, 6, 0);
    _this6.YMin = minMax.min;
    _this6.YScale = yArea / minMax.sub;
    flag = true;
    return _this6;
  };

  this.refreshBy = function (time) {
    anim.add('PR_refresh', time).timing('circ', 'out').tick(function () {
      flag = true;
    }).after(function () {
      flag = true;
    }).run();
  };

  this.prepare = function () {
    ctx.clearRect(0, 0, width, height);
  };

  this.render = function (column, index) {
    if (!column || column.opacity === 0) return;

    if (_this6.piemode) {
      pieRender(column, index);
      return;
    }

    if (column.type === 'line') {
      lineRender(column, index);
    }

    if (column.type === 'bar') {
      barRender(column, index);
    }

    if (column.type === 'area') {
      areaRender(column, index);
    }
  };

  this["finally"] = function () {
    flag = false;
  };

  this.refresh = function () {
    return flag = true;
  };

  this.resize = function () {
    var rect = {
      width: canvas.parentElement.clientWidth,
      height: canvas.parentElement.clientHeight
    };
    canvas.setAttribute('width', rect.width);
    canvas.setAttribute('height', rect.height);
    width = rect.width;
    _this6.XScale = width / _this6.xRange;
    console.log(canvas.parentElement.clientWidth);
    height = rect.height;
    yArea = rect.height;
    flag = true;
  };

  this.flag = function () {
    return flag;
  };
};