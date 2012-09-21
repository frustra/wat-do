var generateTimeline = function(element, data) {
  var scale = 100;
  var x = d3.scale.linear()
    .range([0, scale]);
  var w = d3.scale.linear()
    .range([0, scale])
    .domain([0, 24]);
  var y = d3.scale.linear();
  var mouse;
  var lastmouse;

  var main = d3.select(element)
    .attr("style", "height:" + screen.height + "px;");

  var maxxoffset = 0;
  var xoffset = 0;
  var timeline = main.append("div").attr("id", "timeline")
    .attr("style", "left:" + xoffset + "px;");
  var rules = timeline.append("div").attr("id", "tlrules");
  var body = timeline.append("div").attr("id", "tlbody");

  var gstart = Math.min(0, d3.min(data, function(d) { return d.start; }));
  var gend = Math.max(0, d3.max(data, function(d) { return d.end; }));
  if (isNaN(gstart)) gstart = 0;
  if (isNaN(gend)) gend = 0;
  gstart -= (screen.width / scale * 24);
  gend += (screen.width / scale * 24);

  var height = data.length * 80;
  main.attr("style", "height:" + (height + 50) + "px;");
  y.range([0, height]);

  x.domain([gstart, gstart + 24]);
  y.domain([0, data.length]);

  maxxoffset = -x(gend + gstart);
  xoffset = -x(0) + 200;
  timeline.attr("style", "left:" + xoffset + "px;");

  var bars = rules.selectAll(".rule")
    .data(d3.range(Math.floor((gend - gstart) / 24)))
    .enter();

  bars.append("div")
    .attr("class", "rule")
    .attr("style", function(d) { return "left:" + x(d * 24 - Math.floor(-gstart / 24) * 24 + 24 - moment().hours()) + "px;"; });

  bars.append("div")
    .attr("class", "rule-text")
    .attr("style", function(d) { return "left:" + (x(d * 24 - Math.floor(-gstart / 24) * 24 + 24 - moment().hours()) - (scale / 2)) + "px;width:" + scale + "px;"; })
    .html(function(d) { var tmp = moment().add('days', d - Math.floor(-gstart / 24) + 1); return tmp.format("ddd") + "<br/>" + tmp.format("MMM D"); });

  rules.selectAll(".now")
    .data(d3.range(1))
    .enter().append("div")
    .attr("class", "now")
    .attr("style", "left:" + x(0) + "px;");

  var items = body.selectAll(".item")
    .data(data, function(d) { d['due'] = moment().add('hours', d.end); return d; })
    .enter();

  items.append("div")
    .attr("class", "item-back")
    .attr("style", function(d,i) { return "left:" + x(d.start) + "px;top:" + (y(i) + 45) + "px;"; })
    .append("div")
    .attr("class", "white")
    .attr("style", function(d) { return "width:" + Math.max(0, w(-d.start) - 1) + "px;"; });

  items = items.append("div")
    .attr("class", "item")
    .attr("style", function(d,i) { return "left:" + x(d.start) + "px;top:" + (y(i) + 45) + "px;"; });

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

  items.on("click", function(d) {
    if (lastmouse && Math.abs(d3.event.pageX - lastmouse[0]) < 2) {
      location.hash = '#/item/' + d.id;
    }
  });

  d3.select("#timeline-wrap").on("mousedown", function() {
    mouse = [d3.event.pageX, d3.event.pageY];
    lastmouse = mouse;
    d3.event.preventDefault();
  });

  d3.select(window).on("mousemove", function() {
    if (mouse) {
      var tmp = xoffset + d3.event.pageX - mouse[0];
      tmp = Math.max(Math.min(tmp, 0), maxxoffset);
      timeline.attr("style", "left:" + tmp + "px;");
      d3.event.preventDefault();
    }
  }).on("mouseup", function() {
    if (mouse) {
      xoffset += d3.event.pageX - mouse[0];
      xoffset = Math.max(Math.min(xoffset, 0), maxxoffset);
      timeline.attr("style", "left:" + xoffset + "px;");
      d3.event.preventDefault();
      mouse = null;
    }
  });

  setTimeout(function() { updateData(data); }, 100);

  function updateTime(data) {
    d3.selectAll(".white")
      .data(data)
      .attr("style", function(d) { return "width:" + Math.max(0, w(-d.start) - 1) + "px;"; });
  }

  function updateData(data) {
    d3.selectAll(".item-back")
      .data(data)
      .attr("style", function(d,i) { return "left:" + x(d.start) + "px;top:" + (y(i) + 45) + "px;width:" + w(d.end - d.start) + "px;"; });
    var items = d3.selectAll(".item")
      .data(data)
      .attr("style", function(d,i) { return "left:" + x(d.start) + "px;top:" + (y(i) + 45) + "px;width:" + w(d.end - d.start) + "px;"; });

    items.select(".title")
      .attr("title", function(d) { return d.title; })
      .text(function(d) { return d.title; });

    items.select(".desc")
      .attr("title", function(d) { return d.desc; })
      .text(function(d) { return d.desc; });

    items.select(".due")
      .attr("title", function(d) { return d.due.calendar(); })
      .text(function(d) { return d.due.calendar(); });
  }
};