var generateTimeline = function(element, data) {
  var scale = 100;
  var x = d3.scale.linear()
    .range([0, scale]);
  var w = d3.scale.linear()
    .range([0, scale]);
  var y = d3.scale.linear();
  var mouse;

  var main = d3.select(element)
    .attr("style", "height:" + screen.height + "px;");

  var maxxoffset = 0;
  var xoffset = 0;
  var timeline = main.append("div").attr("id", "timeline")
    .attr("style", "left:" + xoffset + "px;");
  var rules = timeline.append("div");
  var body = timeline.append("div");

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

  maxxoffset = -w(gend);
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
    .attr("style", function(d) { return "left:" + (x(d * 24 + gstart) - (scale / 2)) + "px;width:" + scale + "px;"; })
    .text(function(d) { var tmp = moment().add('days', d + (gstart / 24)); return tmp.date() == 1 ? tmp.format("MMM D") : tmp.format("D"); });

  rules.selectAll(".now")
    .data(d3.range(1))
    .enter().append("div")
    .attr("class", "now")
    .attr("style", "left:" + x(0) + "px;height:" + (height + 10) + "px;");

  // rules.selectAll(".past")
  //   .data(d3.range(1))
  //   .enter().append("div")
  //   .attr("class", "past")
  //   .attr("style", "left:" + x(gstart) + "px;width:" + x(0) + "px;height:" + (height + 10) + "px;");

  var items = body.selectAll(".item")
    .data(data, function(d) { d['due'] = moment().add('hours', d.end); return d; })
    .enter().append("div")
    .attr("class", "item")
    .attr("style", function(d,i) { return "left:" + x(d.start) + "px;top:" + (y(i) + 35) + "px;"; });

  items.append("div")
    .attr("class", "info title")
    .attr("title", function(d) { return d.title; })
    .text(function(d) { return d.title; });

  items.append("div")
    .attr("class", "info desc")
    .attr("title", function(d) { return d.desc; })
    .text(function(d) { return d.desc; });

  items.append("div")
    .attr("class", "info due")
    .attr("title", function(d) { return d.due.calendar(); })
    .text(function(d) { return d.due.calendar(); });

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

  setTimeout(function() {
    body.selectAll(".item")
      .data(data)
      .attr("style", function(d,i) { return "left:" + x(d.start) + "px;top:" + (y(i) + 35) + "px;width:" + w(d.end - d.start) + "px;"; });
  }, 100);
};