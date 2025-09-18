var { Sidechain } = require("@nprapps/sidechain");
Sidechain.registerGuest();

var $ = require("./lib/qsa");
var { isMobile } = require("./lib/breakpoints")
var { html, svg, render } = require("lit-html");
var d3 = {
  ...require("d3-scale")
};
var canvas = $.one(".arrow-box svg");

var data = window.DATA;
var values = data.flatMap(d => [d.from, d.to]);
var max = Math.max(...values);
var min = Math.min(...values);

// customize label formats here:
var formatter = v => (v * 100).toFixed(1) + "%";
var axisFormatter = v => (v * 100).toFixed(0) + "%";
const HEAD = 4;

var draw = function() {
  var bounds = canvas.getBoundingClientRect();
  canvas.setAttribute("width", bounds.width);
  canvas.setAttribute("height", bounds.height);
  var scale = d3.scaleLinear()
    .domain([min, max])
    .range([0, bounds.width])
    .nice();

  var arrows = $(".row").map(function(element) {
    var id = element.dataset.row * 1;
    var { group, from, to } = data.find(d => d.id == id);
    var rowBounds = element.getBoundingClientRect();
    var top = rowBounds.top - bounds.top;
    var height = rowBounds.height;
    var y = top + height / 2;
    return { group, element, id, y, from, to };
  });

  render(svg`
    <g class="ticks">
      ${scale.ticks(isMobile.matches ? 5 : 7).map(t => svg`
      <text x=${scale(t)} y=12 class="axis-label">
        ${axisFormatter(t)}
      </text>
      <path d="M${scale(t)},15 V${bounds.height}" class="grid" />
      `)}
    </g>
    <g class="arrows">
      ${arrows.map(l => {
        var unit = l.from < l.to ? 1 : -1;
        return svg`
        <g class="arrow-row" data-series=${l.group}>
          <path
            class="track"
            d="M0,${l.y} H${bounds.width}"
          />
          <path class="arrow ${unit > 0 ? "increase" : "decrease"}"
            d="
              M${scale(l.from)},${l.y}
              H${scale(l.to)}"
          />
          <path class="arrow head ${unit > 0 ? "increase" : "decrease"}"
            d="
              M${scale(l.to)},${l.y}
              m${-HEAD * unit},${-HEAD}
              l${HEAD * unit},${HEAD}
              l${-HEAD * unit},${HEAD}"
          />
        </g>
        <text x=${scale(l.from) + -2 * unit} y=${l.y + 4}
          class="from ${unit > 0 ? "left" : "right"}">
          ${formatter(l.from)}
        </text>
        <text x=${scale(l.to) + 3 * unit} y=${l.y + 4}
          class="to ${unit > 0 ? "right" : "left"}">
          ${formatter(l.to)}
        </text>
        `;
      })}
    </g>
  `, canvas)

}

draw();
window.addEventListener("resize", draw);