var gtl = {scale: 100, maxxoffset: 0, xoffset: 1, mouse: null, lastmouse: null};

var timelineInit = function() {
  gtl.x = d3.scale.linear()
    .range([0, gtl.scale]);
  gtl.w = d3.scale.linear()
    .range([0, gtl.scale])
    .domain([0, 24]);
  gtl.y = d3.scale.linear();

  gtl.main = d3.select(".timeline-visualization")
    .attr("style", "height:" + screen.height + "px;");

  gtl.timeline = gtl.main.append("div").attr("id", "timeline")
    .attr("style", "left:" + gtl.xoffset + "px;");
  gtl.rules = gtl.timeline.append("div").attr("id", "tlrules");
  gtl.body = gtl.timeline.append("div").attr("id", "tlbody");

  d3.select("#timeline-wrap").on("mousedown", function() {
    gtl.mouse = [d3.event.pageX, d3.event.pageY];
    gtl.lastmouse = gtl.mouse;
    d3.event.preventDefault();
  });

  d3.select(window).on("mousemove", function() {
    if (gtl.mouse) {
      var tmp = gtl.xoffset + d3.event.pageX - gtl.mouse[0];
      tmp = Math.max(Math.min(tmp, 0), gtl.maxxoffset);
      gtl.timeline.attr("style", "left:" + tmp + "px;");
      d3.event.preventDefault();
    }
  }).on("mouseup", function() {
    if (gtl.mouse) {
      gtl.xoffset += d3.event.pageX - gtl.mouse[0];
      gtl.xoffset = Math.max(Math.min(gtl.xoffset, 0), gtl.maxxoffset);
      gtl.timeline.attr("style", "left:" + gtl.xoffset + "px;");
      d3.event.preventDefault();
      gtl.mouse = null;
    }
  });
};

function barsEnter(bars) {
  var wrap = bars.append("div").attr("class", "rule-wrap");

  wrap.append("div")
    .attr("class", "rule")
    .style("left", function(d) { return gtl.x(d * 24 - Math.floor(-gtl.gstart / 24) * 24 + 24 - moment().hours()) + "px"; });

  wrap.append("div")
    .attr("class", "rule-text")
    .style("left", function(d) { return (gtl.x(d * 24 - Math.floor(-gtl.gstart / 24) * 24 + 24 - moment().hours()) - (gtl.scale / 2)) + "px"; })
    .style("width", function(d) { return gtl.scale + "px"; })
    .html(function(d) { var tmp = moment().add('days', d - Math.floor(-gtl.gstart / 24) + 1); return tmp.format("ddd") + "<br/>" + tmp.format("MMM D"); });

  gtl.rules.selectAll(".now")
    .data(d3.range(1))
    .enter().append("div")
    .attr("class", "now")
    .style("left", gtl.x(0) + "px");
}

function barsUpdate(bars) {
  bars.select(".rule")
    .transition().duration(750)
    .style("left", function(d) { return gtl.x(d * 24 - Math.floor(-gtl.gstart / 24) * 24 + 24 - moment().hours()) + "px"; });

  bars.select(".rule-text")
    .html(function(d) { var tmp = moment().add('days', d - Math.floor(-gtl.gstart / 24) + 1); return tmp.format("ddd") + "<br/>" + tmp.format("MMM D"); })
    .transition().duration(750)
    .style("left", function(d) { return (gtl.x(d * 24 - Math.floor(-gtl.gstart / 24) * 24 + 24 - moment().hours()) - (gtl.scale / 2)) + "px"; })
    .style("width", function(d) { return gtl.scale + "px"; });

  gtl.rules.selectAll(".now")
    .data(d3.range(1))
    .transition().duration(750)
    .style("left", gtl.x(0) + "px");
}

function barsExit(bars) {
  bars.transition().duration(750).remove();
}

function itemsEnter(items) {
  var wrap = items.append("div")
    .attr("class", "item-wrap");

  wrap.append("div")
    .attr("class", "item-back")
    .style("left", function(d) { return gtl.x(d.start) + "px"; })
    .style("top", function(d, i) { return (gtl.y(i) + 45) + "px"; })
    .append("div")
    .attr("class", "white")
    .style("width", function(d) { return Math.max(0, gtl.w(-d.start) - 1) + "px"; });

  var front = wrap.append("div")
    .attr("class", "item")
    .style("left", function(d) { return gtl.x(d.start) + "px"; })
    .style("top", function(d, i) { return (gtl.y(i) + 45) + "px"; });

  front.append("div")
    .attr("class", "info title")
    .attr("title", function(d) { return d.title; })
    .text(function(d) { return d.title; });

  front.append("div")
    .attr("class", "info desc")
    .attr("title", function(d) { return d.desc; })
    .text(function(d) { return d.desc; });

  front.append("div")
    .attr("class", "info due")
    .attr("title", function(d) { return d.due.calendar(); })
    .text(function(d) { return d.due.calendar(); });

  front.on("click", function(d) {
    if (gtl.lastmouse && Math.abs(d3.event.pageX - gtl.lastmouse[0]) < 2) {
      location.hash = '#/item/' + d.id;
    }
  });
}

function itemsUpdate(items) {
  items.select(".item-back")
    .style("top", function(d, i) { return (gtl.y(i) + 45) + "px"; })
    .transition().duration(750)
    .style("left", function(d) { return gtl.x(d.start) + "px"; })
    .style("width", function(d) { return gtl.w(d.end - d.start) + "px"; })
    .select(".white")
    .transition().duration(750)
    .style("width", function(d) { return Math.max(0, gtl.w(-d.start) - 1) + "px"; });

  var front = items.select(".item")
    .style("top", function(d, i) { return (gtl.y(i) + 45) + "px"; })
    .transition().duration(750)
    .style("left", function(d) { return gtl.x(d.start) + "px"; })
    .style("width", function(d) { return gtl.w(d.end - d.start) + "px"; });

  front.select("#title")
    .attr("title", function(d) { return d.title; })
    .text(function(d) { return d.title; });

  front.select("#desc")
    .attr("title", function(d) { return d.desc; })
    .text(function(d) { return d.desc; });

  front.select("#due")
    .attr("title", function(d) { return d.due.calendar(); })
    .text(function(d) { return d.due.calendar(); });
}

function itemsExit(items) {
  items.transition().duration(750).style("opacity", 0).remove();
}

var timelineUpdate = function(data) {
  gtl.gstart = Math.min(0, d3.min(data, function(d) { return d.start; }));
  gtl.gend = Math.max(0, d3.max(data, function(d) { return d.end; }));
  if (isNaN(gtl.gstart)) gtl.gstart = 0;
  if (isNaN(gtl.gend)) gtl.gend = 0;
  gtl.gstart -= (screen.width / gtl.scale * 24);
  gtl.gend += (screen.width / gtl.scale * 24);

  var height = data.length * 80;
  gtl.main.attr("style", "height:" + (height + 50) + "px;");
  gtl.y.range([0, height]);

  gtl.x.domain([gtl.gstart, gtl.gstart + 24]);
  gtl.y.domain([0, data.length]);

  gtl.maxxoffset = -gtl.x(gtl.gend) + screen.width;
  console.log(gtl.maxxoffset);
  if (gtl.xoffset > 0) {
    gtl.xoffset = -gtl.x(0) + 200;
  } else gtl.xoffset = Math.max(gtl.maxxoffset, gtl.xoffset);
  if (!gtl.mouse) gtl.timeline.attr("style", "left:" + gtl.xoffset + "px;");

  var bars = gtl.rules.selectAll(".rule-wrap")
    .data(d3.range(Math.floor((gtl.gend - gtl.gstart) / 24)));

  barsEnter(bars.enter());
  barsUpdate(bars);
  barsExit(bars.exit());

  var items = gtl.body.selectAll(".item-wrap")
    .data(data);

  itemsEnter(items.enter());
  itemsUpdate(items);
  itemsExit(items.exit());
};