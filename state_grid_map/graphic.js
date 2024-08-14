var { Sidechain } = require("@nprapps/sidechain");
Sidechain.registerGuest();

// build our custom D3 object
var d3 = {
  ...require("d3-scale/dist/d3-scale.min")
};


// Global vars
var { COLORS, classify } = require("./lib/helpers");
var { isMobile } = require("./lib/breakpoints");
var $ = require("./lib/qsa");

var template = document.querySelector("#map-template");

// Initialize the graphic.
var onWindowLoaded = function () {
  render();
  window.addEventListener("resize", render);
};

// Render the graphic(s).
var render = function () {
  var { isNumeric } = window.LABELS;

  // Render the map!
  var container = "#state-grid-map";
  var element = document.querySelector(container);
  var width = element.offsetWidth;
  renderStateGridMap({
    container,
    element,
    width,
    data: DATA,
    // isNumeric will style the legend as a numeric scale
    isNumeric,
  });
};

// Render a state grid map.
var renderStateGridMap = function (config) {
  var valueColumn = "category";

  // Clear existing graphic (for redraw)
  var containerElement = config.element;
  containerElement.innerHTML = "";

  // Copy map template
  containerElement.append(template.content.cloneNode(true));

  // Extract categories from data
  var categories = [];

  if (LABELS.legendLabels && LABELS.legendLabels !== "") {
    // If custom legend labels are specified
    categories = LABELS.legendLabels.split("|").map((l) => l.trim());
  } else {
    // Default: Return sorted array of categories
    config.data.forEach(function (state) {
      if (valueColumn in state) {
        categories.push(state[valueColumn]);
      }
    });

    //dedupe
    categories = Array.from(new Set(categories)).sort();
  }

  if (config.isNumeric) {
    categories = categories.map(Number);
  }

  // Create legend
  var legendWrapper = containerElement.querySelector(".key-wrap");
  var legendElement = containerElement.querySelector(".key");

  if (config.isNumeric) {
    legendWrapper.classList.add("numeric-scale");

    var colorScale = d3
      .scaleThreshold()
      .domain(categories)
      .range([null, COLORS.purple2, COLORS.blue2, COLORS.teal2, COLORS.yellow2, COLORS.peach2]);
  } else {
    // Define color scale
    var colorScale = d3
      .scaleOrdinal()
      .domain(categories)
      .range([COLORS.red3, COLORS.yellow3, COLORS.blue3, COLORS.orange3, COLORS.teal3]);
  }

  for (var threshold of colorScale.domain()) {
    var keyItem = document.createElement("li")
    legendElement.append(keyItem)
    keyItem.classList.add("key-item");

    var b = document.createElement("b");
    b.style.background = colorScale(threshold);
    keyItem.append(b);

    var label = document.createElement("label");
    label.innerHTML = threshold;
    keyItem.append(label);
  }

  if (config.isNumeric && LABELS.maxLabel) {
    var last = legendElement.lastElementChild;
    var upperBound = document.createElement("label");
    upperBound.classList.add("end-label");
    upperBound.innerHTML = LABELS.maxLabel;
    last.append(upperBound);
  }

  // Select SVG element
  var chartElement = containerElement.querySelector("svg");

  // Set state colors
  for (var state of config.data) {
    if (state[valueColumn] !== null && state[valueColumn] !== undefined) {
      var stateClass = "state-" + classify(state.state_name);

      var selected = chartElement.querySelector("." + stateClass);
      if (!selected) return;
      selected.setAttribute("class", `${stateClass} state-active`);
      selected.setAttribute("fill", colorScale(state[valueColumn]));
    }
  };

  var ns = chartElement.namespaceURI;
  var labelGroup = document.createElementNS(ns, "g");
  chartElement.append(labelGroup);
  for (var d of config.data) {
    var state = STATES.find(s => s.name == d.state_name);
    var text = document.createElementNS(ns, "text");
    text.setAttribute("text-anchor", "middle");
    text.textContent = isMobile.matches ? state.usps : state.ap;
    labelGroup.append(text);
    text.setAttribute("class", valueColumn in d ? "label label-active" : "label");  
    var box = chartElement.querySelector(`.state-${classify(state.name)}`);
    var boxBounds = box.getBBox();
    var textBounds = text.getBBox();
    text.setAttribute("x", boxBounds.x + boxBounds.width * .5 + .52);
    text.setAttribute("y", boxBounds.y + boxBounds.width * .5 + textBounds.height * .6);
  }
};

// Initially load the graphic
// (NB: Use window.load to ensure all images have loaded)
window.onload = onWindowLoaded;
