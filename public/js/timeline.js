window.onload = function() {
  var scale = 100;
  var x = d3.scale.linear()
    .range([0, scale]);
  var w = d3.scale.linear()
    .range([0, scale]);
  var y = d3.scale.linear();
  var mouse;

  var svg = d3.select("#timeline").append("svg")
    .attr("height", screen.height);

  var maxxoffset = 0;
  var xoffset = 0;
  var timeline = svg.append("g")
    .attr("transform", "translate(" + xoffset + ",0)");
  var body = timeline.append("g");
  var rules = timeline.append("g");

  d3.json("timeline.json", function(data) {
    var gstart = (screen.width * -0.24);
    var gend = d3.max(data.items, function(d) { return d.end }) + (screen.width * 0.24);
    gend -= gstart % 24;
    gstart -= gstart % 24;

    var height = data.items.length * 80;
    svg.attr("height", height + 40);
    y.range([0, height]);

    x.domain([gstart, gstart + 24]);
    w.domain([0, 24]);
    y.domain([0, data.items.length]);

    maxxoffset = w(-gend);
    xoffset = w(gstart) + 200;

    var bars = rules.selectAll(".rule")
      .data(d3.range((gend - gstart) / 24))
      .enter();

    bars.append("line")
      .attr("class", "rule")
      .attr("x1", function(d) { return x(d * 24 + gstart); })
      .attr("x2", function(d) { return x(d * 24 + gstart); })
      .attr("y1", y(0) + 30)
      .attr("y2", height + 35);

    bars.append("text")
      .attr("class", "rule")
      .attr("dy", ".35em")
      .attr("x", function(d) { return x(d * 24 + gstart) - (4 * d.toString().length); })
      .attr("y", 15)
      .text(function(d) { return d; });

    rules.selectAll(".now")
      .data(d3.range(1))
      .enter().append("line")
      .attr("class", "now")
      .attr("x1", x(0))
      .attr("x2", x(0))
      .attr("y1", y(0) + 30)
      .attr("y2", height + 35);

    // rules.selectAll(".past")
    //   .data(d3.range(1))
    //   .enter().append("rect")
    //   .attr("class", "past")
    //   .attr("x", x(gstart))
    //   .attr("y", y(0) + 30)
    //   .attr("width", x(0))
    //   .attr("height", height + 35);

    body.selectAll("rect")
      .data(data.items)
      .enter().append("rect")
      .attr("class", "item")
      .attr("x", function(d) { return x(d.start); })
      .attr("y", function(d,i) { return y(i) + 35; })
      .attr("height", 75)
      .attr("width", 1e-6);

    svg.on("mousedown", function() {
      mouse = [d3.event.pageX, d3.event.pageY];
      d3.event.preventDefault();
    });
    d3.select(window).on("mousemove", function() {
      if (mouse) {
        var tmp = xoffset + d3.event.pageX - mouse[0];
        tmp = Math.max(Math.min(tmp, 0), maxxoffset);
        timeline.attr("transform", "translate(" + tmp + ",0)");
        d3.event.preventDefault();
      }
    }).on("mouseup", function() {
      if (mouse) {
        xoffset += d3.event.pageX - mouse[0];
        xoffset = Math.max(Math.min(xoffset, 0), maxxoffset);
        timeline.attr("transform", "translate(" + xoffset + ",0)");
        d3.event.preventDefault();
        mouse = null;
      }
    });

    redraw();

    function redraw() {
      body.selectAll("rect")
        .data(data.items)
        .transition()
        .duration(750)
        .attr("width", function(d) { return w(d.end - d.start); });
      timeline.attr("transform", "translate(" + xoffset + ",0)");
    }
  });
};