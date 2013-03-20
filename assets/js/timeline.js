var gtl = {init: false, scale: 100, mouse: null, mousestart: null, scrolled: false, smoothscroll: false};

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

  $('#done').click(function() {
    $('input[name="item-done"]').click();
  });
  $('input[name="item-done"]').click(function(e) {
    e.preventDefault();
    var $this = $(this);
    if (user) {
      if ($this.attr('checked')) {
        $this.attr('checked', false);
        $('#done').removeClass('done');
      } else {
        $this.attr('checked', true);
        $('#done').addClass('done');
      }
    }
    $this.blur();
  }).attr('checked', false);

  var formItem = $('#item form');
  formItem.find('.btn-delete').click(function() {
    handlers.deleteItem(formItem.data('js-data'));
  });
  formItem.find('.btn-list').click(function() {
    var item = formItem.data('js-data');
    if (item.user) {
      handlers.changeURL('/user/' + item.user._id);
    } else if (item.list) {
      handlers.changeURL('/list/' + item.list._id);
    }
  });

  var formList = $('#list form');
  formList.find('.btn-delete').click(function() {
    handlers.deleteList(formList.data('js-data'));
  });

  $('#editlist').click(function(e) {
    e.preventDefault();
    handlers.changeURL('/list/' + handlers.currentList + '/edit');
  });

  $('.subscribe').click(function(e) {
    e.preventDefault();
    var $this = $(this);
    if ($this.attr('subbed')) {
      $this.removeAttr('subbed');
    } else $this.attr('subbed', 'subbed');
    handlers.subscribe(!!$this.attr('subbed'));
  });

  $('#list #adduser').click(function(e) {
    e.preventDefault();
    var form = $('#list form');
    var email = form.find('#email').val();
    var permission = form.find('#members-head .permission').val();
    var list = form.data('js-data');
    for (var i = 0; i < list.members.length; i++) {
      if (list.members[i].user.email.toLowerCase() === email.toLowerCase()) {
        alert("This user is already added to the list.");
        return;
      }
    }
    makeRequest('POST', '/email.json', {email: email}, function(data) {
      list.members.push({permission: permission, user: data});
      handlers.populateListMembers(list);
    });
  });

  gtl.init = true;
  setInterval(timeUpdate, 1000);
};

function timeUpdate() {
  gtl.rules.selectAll(".now")
    .transition().duration(750).ease("linear")
    .style("left", gtl.x(moment().diff(gtl.starttime) / 3600000) + "px");

  gtl.body.selectAll(".white")
    .transition().duration(750).ease("linear")
    .style("width", function(d) { return Math.max(0, gtl.w(-d.rstart + moment().diff(gtl.starttime) / 3600000) - 1) + "px"; });

  gtl.body.selectAll(".item-back")
    .attr("rend", function(d) { return d.rend - moment().diff(gtl.starttime) / 3600000; });

  gtl.body.selectAll(".item")
    .attr("rend", function(d) { return d.rend - moment().diff(gtl.starttime) / 3600000; });
}

function barsEnter(bars) {
  var wrap = bars.append("div").attr("class", "rule-wrap");

  wrap.append("div")
    .attr("class", "rule")
    .style("left", function(d) { return gtl.x(d * 24 - Math.floor(-gtl.gstart / 24) * 24 + 24 - moment().hours()) + "px"; });

  wrap.append("div")
    .attr("class", "rule-text")
    .style("left", function(d) { return (gtl.x(d * 24 - Math.floor(-gtl.gstart / 24) * 24 + 24 - moment().hours()) - (gtl.scale / 2)) + "px"; })
    .style("width", function() { return gtl.scale + "px"; })
    .html(function(d) { var tmp = moment().add('days', d - Math.floor(-gtl.gstart / 24) + 1); return tmp.format("ddd") + "<br/>" + tmp.format("MMM D"); });

  gtl.rules.selectAll(".now")
    .data(d3.range(1))
    .enter().append("div")
    .attr("class", "now")
    .style("left", gtl.x(0) + "px");
}

function barsUpdate(bars) {
  bars.select(".rule")
    .transition().duration(750).ease("linear")
    .style("left", function(d) { return gtl.x(d * 24 - Math.floor(-gtl.gstart / 24) * 24 + 24 - moment().hours()) + "px"; });

  bars.select(".rule-text")
    .html(function(d) { var tmp = moment().add('days', d - Math.floor(-gtl.gstart / 24) + 1); return tmp.format("ddd") + "<br/>" + tmp.format("MMM D"); })
    .transition().duration(750).ease("linear")
    .style("left", function(d) { return (gtl.x(d * 24 - Math.floor(-gtl.gstart / 24) * 24 + 24 - moment().hours()) - (gtl.scale / 2)) + "px"; })
    .style("width", function() { return gtl.scale + "px"; });

  gtl.rules.selectAll(".now")
    .transition().duration(750).ease("linear")
    .style("left", gtl.x(0) + "px");

  gtl.body.selectAll(".white")
    .transition().duration(750).ease("linear")
    .style("width", function(d) { return Math.max(0, gtl.w(-d.rstart) - 1) + "px"; });
}

function barsExit(bars) {
  bars.transition().duration(750).remove();
}

function getListName(d) {
  if (d.user) {
    return d.user._id == handlers.currentUser ? '' : d.user.name;
  } else if (d.list) {
    return d.list._id == handlers.currentList ? '' : d.list.name;
  } else return '';
}

function itemsEnter(items) {
  var wrap = items.append("div")
    .attr("class", "item-wrap");

  wrap.append("div")
    .attr("class", "item-back")
    .attr("done", function(d) { return d.done; })
    .attr("rend", function(d) { return d.rend; })
    .attr("notify", function(d) { return (d.rend / (d.rend - d.rstart)) <= 0.2; })
    .style("left", function(d) { return gtl.x(d.rstart) + "px"; })
    .style("top", function(d, i) { return (gtl.y(i) + 45) + "px"; })
    .append("div")
    .attr("class", "white")
    .style("width", function(d) { return Math.max(0, gtl.w(-d.rstart) - 1) + "px"; });

  var front = wrap.append("div")
    .attr("class", "item")
    .attr("done", function(d) { return d.done; })
    .attr("rend", function(d) { return d.rend; })
    .attr("notify", function(d) { return (d.rend / (d.rend - d.rstart)) <= 0.2; })
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
    .attr("class", "info from")
    .attr("title", getListName)
    .text(getListName);

  front.append("div")
    .attr("class", "info due")
    .attr("title", function(d) { return moment().add('hours', d.rend).calendar(); })
    .text(function(d) { return moment().add('hours', d.rend).calendar(); });

  front.on("click", function(d) {
    if (gtl.mousestart && Math.abs(d3.event.screenX - gtl.mousestart[0]) < 2) {
      handlers.changeURL('/item/' + d._id);
    }
  });
}

function itemsUpdate(items) {
  items.select(".item-back")
    .style("top", function(d, i) { return (gtl.y(i) + 45) + "px"; })
    .attr("done", function(d) { return d.done; })
    .attr("rend", function(d) { return d.rend; })
    .attr("notify", function(d) { return (d.rend / (d.rend - d.rstart)) <= 0.2; })
    .transition().duration(750)
    .style("left", function(d) { return gtl.x(d.rstart) + "px"; })
    .style("width", function(d) { return gtl.w(d.rend - d.rstart) + "px"; })
    .select(".white")
    .style("width", function(d) { return Math.max(0, gtl.w(-d.rstart) - 1) + "px"; });

  var front = items.select(".item")
    .style("top", function(d, i) { return (gtl.y(i) + 45) + "px"; })
    .attr("done", function(d) { return d.done; })
    .attr("rend", function(d) { return d.rend; })
    .attr("notify", function(d) { return (d.rend / (d.rend - d.rstart)) <= 0.2; })
    .transition().duration(750)
    .style("left", function(d) { return gtl.x(d.rstart) + "px"; })
    .style("width", function(d) { return gtl.w(d.rend - d.rstart) + "px"; });

  front.select(".title")
    .attr("title", function(d) { return d.name; })
    .text(function(d) { return d.name; });

  front.select(".desc")
    .attr("title", function(d) { return d.desc; })
    .text(function(d) { return d.desc; });

  front.select(".from")
    .attr("title", getListName)
    .text(getListName);

  front.select(".due")
    .attr("title", function(d) { return moment().add('hours', d.rend).calendar(); })
    .text(function(d) { return moment().add('hours', d.rend).calendar(); });
}

function itemsExit(items) {
  items.transition().duration(750).style("opacity", 0).remove();
}

var timelineUpdate = function(data) {
  if (!gtl.init) timelineInit();
  if (!data) {
    showError();
    return;
  }
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
      if (a.done == b.done) {
        var endc = a.rend < b.rend ? -1 : (a.rend == b.rend ? 0 : 1);
        if (a.done) { // Sort completed items as most recent first
          return -endc;
        } else if (a.rstart > 0 || b.rstart > 0) { // Sort items that haven't started yet by start date
          return a.rstart < b.rstart ? -1 : (a.rstart == b.rstart ? endc : 1);
        } else { // Sort in-progress items by percentage complete
          var apercent = a.rend / (a.rend - a.rstart);
          var bpercent = b.rend / (b.rend - b.rstart);
          return apercent > bpercent ? 1 : (apercent == bpercent ? 0 : -1);
        }
      } else if (a.done) { // Completed items go underneith all other items
        return 1;
      } else return -1;
    }), function(d) { return d._id; });

  itemsEnter(items.enter());
  itemsUpdate(items);
  itemsExit(items.exit());

  if (!gtl.mouse && !gtl.scrolled) {
    $(window).scrollLeft(gtl.x(0) - $(window).width() / 2);
    gtl.scrolled = true;
  }
  if (gtl.smoothscroll) {
    $('body,html').animate({
      scrollLeft: gtl.x(0) - $(window).width() / 2
    }, 755, 'linear');
    gtl.smoothscroll = false;
  }
};
