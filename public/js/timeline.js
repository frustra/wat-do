var gtl = {scale: 100, mouse: null, mousestart: null, scrolled: false};

var timelineInit = function() {
  gtl.x = d3.scale.linear()
    .range([0, gtl.scale]);
  gtl.w = d3.scale.linear()
    .range([0, gtl.scale])
    .domain([0, 24]);
  gtl.y = d3.scale.linear();

  gtl.main = d3.select(".timeline-visualization")
    .attr("style", "height:" + screen.height + "px;");

  gtl.timeline = gtl.main.append("div").attr("id", "timeline");
  gtl.rules = gtl.timeline.append("div").attr("id", "tlrules");
  gtl.body = gtl.timeline.append("div").attr("id", "tlbody");

  setInterval(timeUpdate, 1000);
};

function timeUpdate() {
  gtl.rules.selectAll(".now")
    .transition().duration(750)
    .style("left", gtl.x(moment().diff(gtl.starttime) / 3600000) + "px");

  gtl.body.selectAll(".white")
    .transition().duration(750)
    .style("width", function(d) { return Math.max(0, gtl.w(-d.rstart + moment().diff(gtl.starttime) / 3600000) - 1) + "px"; });
}

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
    .transition().duration(750)
    .style("left", gtl.x(0) + "px");

  gtl.body.selectAll(".white")
    .transition().duration(750)
    .style("width", function(d) { return Math.max(0, gtl.w(-d.rstart) - 1) + "px"; });
}

function barsExit(bars) {
  bars.transition().duration(750).remove();
}

function itemsEnter(items) {
  var wrap = items.append("div")
    .attr("class", "item-wrap");

  wrap.append("div")
    .attr("class", "item-back")
    .style("left", function(d) { return gtl.x(d.rstart) + "px"; })
    .style("top", function(d, i) { return (gtl.y(i) + 45) + "px"; })
    .append("div")
    .attr("class", "white")
    .style("width", function(d) { return Math.max(0, gtl.w(-d.rstart) - 1) + "px"; });

  var front = wrap.append("div")
    .attr("class", "item")
    .style("left", function(d) { return gtl.x(d.rstart) + "px"; })
    .style("top", function(d, i) { return (gtl.y(i) + 45) + "px"; });

  front.append("div")
    .attr("class", "info title")
    .attr("title", function(d) { return d.name; })
    .text(function(d) { return d.name; });

  front.append("div")
    .attr("class", "info desc")
    .attr("title", function(d) { return d.desc; })
    .text(function(d) { return d.desc; });

  front.append("div")
    .attr("class", "info due")
    .attr("title", function(d) { return moment().add('hours', d.rend).calendar(); })
    .text(function(d) { return moment().add('hours', d.rend).calendar(); });

  front.on("click", function(d) {
    if (gtl.mousestart && Math.abs(d3.event.screenX - gtl.mousestart[0]) < 2) {
      location.hash = '#/item/' + d._id;
    }
  });
}

function itemsUpdate(items) {
  items.select(".item-back")
    .style("top", function(d, i) { return (gtl.y(i) + 45) + "px"; })
    .transition().duration(750)
    .style("left", function(d) { return gtl.x(d.rstart) + "px"; })
    .style("width", function(d) { return gtl.w(d.rend - d.rstart) + "px"; })
    .select(".white")
    .transition().duration(750)
    .style("width", function(d) { return Math.max(0, gtl.w(-d.rstart) - 1) + "px"; });

  var front = items.select(".item")
    .style("top", function(d, i) { return (gtl.y(i) + 45) + "px"; })
    .transition().duration(750)
    .style("left", function(d) { return gtl.x(d.rstart) + "px"; })
    .style("width", function(d) { return gtl.w(d.rend - d.rstart) + "px"; });

  front.select(".title")
    .attr("title", function(d) { return d.name; })
    .text(function(d) { return d.name; });

  front.select(".desc")
    .attr("title", function(d) { return d.desc; })
    .text(function(d) { return d.desc; });

  front.select(".due")
    .attr("title", function(d) { return moment().add('hours', d.rend).calendar(); })
    .text(function(d) { return moment().add('hours', d.rend).calendar(); });
}

function itemsExit(items) {
  items.transition().duration(750).style("opacity", 0).remove();
}

var timelineUpdate = function(data) {
  var currentDate = moment();
  gtl.starttime = currentDate;
  
  for (var i = 0; i < data.length; ++i) {
    data[i].rstart = moment(data[i].start).diff(currentDate) / 3600000;
    data[i].rend = moment(data[i].end).diff(currentDate) / 3600000;
  }
  gtl.gstart = Math.min(0, d3.min(data, function(d) { return d.rstart; }));
  gtl.gend = Math.max(0, d3.max(data, function(d) { return d.rend; }));
  if (isNaN(gtl.gstart)) gtl.gstart = 0;
  if (isNaN(gtl.gend)) gtl.gend = 0;
  gtl.gstart -= (screen.width / gtl.scale * 24);
  gtl.gend += (screen.width / gtl.scale * 24);

  var height = data.length * 70;
  gtl.main.attr("style", "height:" + (height + 50) + "px;");
  gtl.y.range([0, height]);

  gtl.x.domain([gtl.gstart, gtl.gstart + 24]);
  gtl.y.domain([0, data.length]);

  var bars = gtl.rules.selectAll(".rule-wrap")
    .data(d3.range(Math.floor((gtl.gend - gtl.gstart) / 24)));

  barsEnter(bars.enter());
  barsUpdate(bars);
  barsExit(bars.exit());

  var items = gtl.body.selectAll(".item-wrap")
    .data(data.sort(function(a, b) {
      if (a.rend < 0 && b.rend >= 0) return 1;
      if (b.rend < 0 && a.rend >= 0) return -1;
      var ret = 0;
      if (a.rend < b.rend) {
        ret = -1;
      } else if (a.rend == b.rend) {
        if (a.rstart < b.rstart) {
          ret = -1;
        } else if (a.rstart > b.rstart) {
          ret = 1;
        }
      } else ret = 1;
      if (a.rend < 0) return -ret;
      return ret;
    }), function(d) { return d._id; });

  itemsEnter(items.enter());
  itemsUpdate(items);
  itemsExit(items.exit());

  if (!gtl.mouse && !gtl.scrolled) {
    $(window).scrollLeft(gtl.x(0) - $(window).width() / 2);
    gtl.scrolled = true;
  }
};