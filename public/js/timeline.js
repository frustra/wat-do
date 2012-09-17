window.onload = function() {
  var scale = 100;
  var x = d3.scale.linear()
    .range([0, scale]);
  var w = d3.scale.linear()
    .range([0, scale]);
  var y = d3.scale.linear();
  var mouse;

  var main = d3.select("#timeline-wrap")
    .attr("style", "height:" + screen.height + "px;");

  var maxxoffset = 0;
  var xoffset = 0;
  var timeline = main.select("#timeline")
    .attr("style", "left:" + xoffset + "px;");
  var body = timeline.append("div");
  var rules = timeline.append("div");

  d3.json("/items.json", function(data) {
    var gstart = (screen.width * -0.24);
    var gend = d3.max(data, function(d) { return d.end }) + (screen.width * 0.24);
    gend -= gstart % 24;
    gstart -= gstart % 24;

    var height = data.length * 80;
    main.attr("style", "height:" + (height + 40) + "px;");
    y.range([0, height]);

    x.domain([gstart, gstart + 24]);
    w.domain([0, 24]);
    y.domain([0, data.length]);

    maxxoffset = w(-gend);
    xoffset = w(gstart) + 200;
    timeline.attr("style", "left:" + xoffset + "px;");

    var bars = rules.selectAll(".rule")
      .data(d3.range((gend - gstart) / 24))
      .enter();

    bars.append("div")
      .attr("class", "rule")
      .attr("style", function(d) { return "left:" + x(d * 24 + gstart) + "px;height:" + (height + 10) + "px;"; });

    bars.append("span")
      .attr("class", "rule")
      .attr("style", function(d) { return "left:" + (x(d * 24 + gstart) - (4 * d.toString().length)) + "px;"; })
      .text(function(d) { return d; });

    rules.selectAll(".now")
      .data(d3.range(1))
      .enter().append("div")
      .attr("class", "now")
      .attr("style", "left:" + x(0) + "px;height:" + (height + 10) + "px;");

    // rules.selectAll(".past")
    //   .data(d3.range(1))
    //   .enter().append("rect")
    //   .attr("class", "past")
    //   .attr("x", x(gstart))
    //   .attr("y", y(0) + 30)
    //   .attr("width", x(0))
    //   .attr("height", height + 35);

    body.selectAll("div")
      .data(data)
      .enter().append("div")
      .attr("class", "item")
      .attr("style", function(d,i) { return "left:" + x(d.start) + "px;top:" + (y(i) + 35) + "px;"; });

    main.on("mousedown", function() {
      mouse = [d3.event.pageX, d3.event.pageY];
      d3.event.preventDefault();
    });
    d3.select(window).on("mousemove", function() {
      if (mouse) {
        var tmp = xoffset + d3.event.pageX - mouse[0];
        tmp = Math.max(Math.min(tmp, w(24)), maxxoffset);
        timeline.attr("style", "left:" + tmp + "px;");
        d3.event.preventDefault();
      }
    }).on("mouseup", function() {
      if (mouse) {
        xoffset += d3.event.pageX - mouse[0];
        xoffset = Math.max(Math.min(xoffset, w(24)), maxxoffset);
        timeline.attr("style", "left:" + xoffset + "px;");
        d3.event.preventDefault();
        mouse = null;
      }
    });

    setTimeout(function(){
      body.selectAll("div")
        .data(data)
        .attr("style", function(d,i) { return "left:" + x(d.start) + "px;top:" + (y(i) + 35) + "px;width:" + w(d.end - d.start) + "px;"; });
      }, 100);
  });
};