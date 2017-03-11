// Set the dimensions of the canvas / graph
var margin = {top: 10, right: 30, bottom: 30, left: 30},
    width = 550 - margin.left - margin.right,
    height = 480 - margin.top - margin.bottom;

// Set the ranges
var x = d3.scaleLinear()
    .rangeRound([0, width]);
var y = d3.scaleLinear()
    .range([height, 0]);

// Adds the svg canvas
var svg = d3.select("#chart")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");

// add the tooltip area to the webpage
var tooltip = d3.select("#chart").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

function update(){

var t = d3.transition()
      .duration(1000);

// var file = "https://docs.google.com/spreadsheets/d/1-Vy9Yy4l8FBkP3n-ev9Ntr8TkNpHtginv3sPEVkV_i4/gviz/tq?tqx=out:csv&sheet=Sheet1"
 var file = "src/data/roster.csv"

// Get the data
d3.csv(file, function(error, data) {
    data.forEach(function(d) {
        d.Name = d.Name
        d.Value = +d.Value;
    });

    // Scale the range of the data
    // x.domain(d3.extent(data, function(d) { return d.Value; }));
    x.domain([2, 11]);
    y.domain([0, data.length]);


    // Set up the binning parameters for the histogram
    var nbins = data.length;

    var histogram = d3.histogram()
      .domain(x.domain())
      // Freedman–Diaconis rule
      // .thresholds(d3.thresholdFreedmanDiaconis(data.map(function (d){ return d.Value}),
      //                                          Math.min.apply(null, data.map(function (d){ return d.Value})),
      //                                          Math.max.apply(null, data.map(function (d){ return d.Value}))))
      .thresholds(x.ticks(nbins))
      .value(function(d) { return d.Value;} )

    // Compute the histogram
    var bins = histogram(data);

    // radius dependent of data length
    var radius = y(data.length-1)/2

    // bins objects
    var bin_container = svg.selectAll("g")
      .data(bins);

    bin_container.enter().append("g")
      // .attr("transform", function(d) { return "translate(" + (x(d.x0)+(x(d.x1)-x(d.x0))/2) + "," + y(data.length) + ")"; });

    // JOIN new data with old elements.
    var dots = bin_container.selectAll("circle")
      .data(function(d) {
        return d.map(function(data, i){return {"idx": i, "name": data.Name, "value": data.Value, "xpos": x(d.x0)+(x(d.x1)-x(d.x0))/2};})
        });

    // EXIT old elements not present in new data.
    dots.exit()
        .attr("class", "exit")
      .transition(t)
        .attr("r", 0)
        .remove();

    // UPDATE old elements present in new data.
    dots.attr("class", "update");

    // ENTER new elements present in new data.
    // var cdots = dots.enter().append("circle")
    dots.enter().append("circle")
      .attr("class", "enter")
      .attr("cx", function (d) {return d.xpos;})
      // .attr("cy", 0)
      .attr("cy", function(d) {
          return y(d.idx)-radius; })
      // .attr("r", function(d) { return (d.length==0) ? 0 : radius; })
      .attr("r", 0)
      //.style("fill", "steelblue")
      .merge(dots)
      .on("mouseover", function(d) {
          d3.select(this)
            .style("fill", "red")
          tooltip.transition()
               .duration(200)
               .style("opacity", .9);
          tooltip.html(d.name + "<br/> (" + d.value + ")")
            .style("left", d3.select(this).attr("cx") + "px")
            .style("top", (d3.select(this).attr("cy")-50) + "px");
        })
        .on("mouseout", function(d) {
          d3.select(this)
              .style("fill", "steelblue");
            tooltip.transition()
                 .duration(500)
                 .style("opacity", 0);
        })
      .transition()
        .duration(500)
        .attr("r", function(d) {
        return (d.length==0) ? 0 : radius; });
      // .style("fill", "black");;

});
};

svg.append("g")
.attr("class", "axis axis--x")
.attr("transform", "translate(0," + height + ")")
.call(d3.axisBottom(x));

//draw everything
update();
update();


// check and update every 2 sec
d3.interval(function() {
  update();
}, 2000);
