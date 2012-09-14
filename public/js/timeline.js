window.onload = function() {
  var x = d3.scale.linear()
    .range([0, screen.width]);

  var w = d3.scale.linear()
    .range([0, screen.width]);

  var y = d3.scale.linear();

  var svg = d3.select("#timeline").append("svg")
    .attr("height", screen.height);

  var body = svg.append("g");
  var rules = svg.append("g");

  d3.json("timeline.json", function(data) {
    var gstart = d3.min(data.items, function(d) { return d.start }) - 10;
    var gend = d3.max(data.items, function(d) { return d.end }) + 10;

    var height = data.items.length * 80;
    svg.attr("height", height);
    y.range([0, height]);

    x.domain([gstart, gend]);
    w.domain([0, gend - gstart]);
    y.domain([0, data.items.length]);

    rules.selectAll(".rule")
      .data(x.ticks((gend - gstart) / 5))
      .enter().append("line")
      .attr("class", "rule")
      .attr("x1", function(d) { return x(d); })
      .attr("x2", function(d) { return x(d); })
      .attr("y1", y(0))
      .attr("y2", height);

    body.selectAll("rect")
      .data(data.items)
      .enter().append("rect")
      .attr("x", function(d) { return x(d.start); })
      .attr("y", function(d,i) { return y(i); })
      .attr("height", 75)
      .attr("width", 1e-6);

    redraw();

    function redraw() {
      body.selectAll("rect")
        .data(data.items)
        .transition()
        .duration(750)
        .attr("width", function(d) { return w(d.end - d.start); });
    }
  });
};