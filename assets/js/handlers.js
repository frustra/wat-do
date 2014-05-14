var handlers = {
  saveList: function(list) {
    list.name = list.name.trim();
    if (list.name.length <= 0) {
      alert("You must enter a list name.");
      return;
    }
    $('#list .btn-save').attr('disabled', 'disabled');
    if (list._id) { // Existing List
      makeRequest('POST', '/list/' + list._id + '.json', list, function(data) {
        if (handlers.currentList === data._id) {
          $('#listname').text(data.name);
          handlers.currentName = data.name;
        }
        if (handlers.updates.listsubs[data._id]) handlers.updates.listsubs[data._id].name = data.name;
        for (var i = 0; i < handlers.updates.lists.length; i++) {
          if (handlers.updates.lists[i]._id === data._id) {
            handlers.updates.lists[i].name = data.name;
            break;
          }
        }
        $('.overlay-inner').click();
      });
    } else { // New List
      makeRequest('POST', '/list/new.json', list, function(data) {
        handlers.updates.lists.push(data);
        handlers.updates.listsubs[data._id] = {name: data.name, updates: 0};
        handlers.changeURL('/list/' + data._id);
      });
    }
  },

  deleteList: function(list) {
    if (confirm("Are you sure you want to delete the list: " + list.name)) {
      $('#list .btn-delete').attr('disabled', 'disabled');
      makeRequest('DELETE', '/list/' + list._id + '.json', function(data) {
        handlers.updates.notifications -= handlers.updates.listsubs[data].updates;
        handlers.updates.listsubs[data] = undefined;
        for (var i = 0; i < handlers.updates.lists.length; i++) {
          if (handlers.updates.lists[i]._id === data) {
            handlers.updates.lists.splice(i, 1);
            break;
          }
        }
        handlers.refreshUpdates(handlers.currentUser, handlers.currentList);
        handlers.changeURL('/');
      });
    }
  },

  saveItem: function(item) {
    item.name = item.name.trim();
    if (item.name.length <= 0) {
      alert("You must enter an item name.");
      return;
    }
    var tmpdate1 = moment(item.startday + ", " + item.starthour, "MMM D YYYY, h:mm a");
    var tmpdate2 = moment(item.endday + ", " + item.endhour, "MMM D YYYY, h:mm a");
    var datenow = moment();
    if (!tmpdate1.isValid() || !tmpdate2.isValid()) {
      alert("One of the dates you entered is not valid.");
      return;
    } else if (Math.abs(tmpdate1.diff(datenow, 'years', true)) > 1 || Math.abs(tmpdate2.diff(datenow, 'years', true)) > 1) {
      alert("You cannot add items with dates so far away.");
      return;
    } else if (tmpdate1.diff(tmpdate2) >= 0) {
      alert("Your item must be due after it starts.");
      return;
    }
    $('#item .btn-save').attr('disabled', 'disabled');
    item.start = tmpdate1.utc().format();
    item.end = tmpdate2.utc().format();
    if (item._id && item._id != -1) { // Existing item
      makeRequest('POST', '/item/' + item._id + '.json', item, function(data) {
        for (var i = 0; i < gdata.length; i++) {
          if (gdata[i]._id == data.item._id) {
            gdata[i] = data.item;
            break;
          }
        }
        timelineUpdate(gdata);
        handlers.refreshUpdates(data.user, data.list, data.updatechange);
        $('.overlay-inner').click();
      });
    } else { // New Item
      item.user = handlers.currentUser;
      item.list = handlers.currentList;
      makeRequest('POST', '/item/new.json', item, function(data) {
        gdata.push(data.item);
        timelineUpdate(gdata);
        handlers.refreshUpdates(data.user, data.list, data.updatechange);
        $('.overlay-inner').click();
      });
    }
  },

  deleteItem: function(item) {
    if (confirm("Are you sure you want to delete the item: " + item.name)) {
      $('#item .btn-delete').attr('disabled', 'disabled');
      makeRequest('DELETE', '/item/' + item._id + '.json', function(data) {
        for (var i = 0; i < gdata.length; i++) {
          if (gdata[i]._id === data.id) {
            gdata.splice(i, 1);
            break;
          }
        }
        timelineUpdate(gdata);
        handlers.refreshUpdates(data.user, data.list, data.updatechange);
        $('.overlay-inner').click();
      });
    }
  },

  saveAccount: function(account) {
    account.name = account.name.trim();
    if (account.name.length <= 0) {
      alert("You must enter a name.");
      return;
    }
    makeRequest('POST', '/account.json', account, function() {
      $('.overlay-inner').click();
    });
  },

  subscribe: function(subscribe) {
    makeRequest('POST', '/updates.json', {subscribe: subscribe, user: handlers.currentUser, list: handlers.currentList}, function(data) {
      handlers.updates = data;
      handlers.refreshUpdates(handlers.currentUser, handlers.currentList);
    });
  },

  mouseDown: function(e) {
    if ($('section#timeline-wrap').is(':visible') && !$('#modal').is(':visible')) {
      var $window = $(window);
      if (e.clientY > 52 && e.clientX < $window.width() && e.clientY < $window.height()) {
        gtl.mousestart = [e.screenX, e.screenY];
        gtl.mouse = [$window.scrollLeft() + gtl.mousestart[0], $window.scrollTop() + gtl.mousestart[1]];
        $window.bind("mousemove", handlers.mouseMove).bind("mouseup", handlers.mouseUp);
        e.preventDefault();
      }
    }
  },

  mouseMove: function(e) {
    if (gtl.mouse[0] != e.screenX || gtl.mouse[1] != e.screenY) {
      window.scrollTo(gtl.mouse[0] - e.screenX, gtl.mouse[1] - e.screenY);
    }
    e.preventDefault();
  },

  mouseUp: function(e) {
    window.scrollTo(gtl.mouse[0] - e.screenX, gtl.mouse[1] - e.screenY);
    e.preventDefault();
    $(window).unbind("mousemove", handlers.mouseMove).unbind("mouseup", handlers.mouseUp);
  },

  lastpage: undefined,
  changeURL: function(page, noHistory) {
    crossroads.parse(page);
    if (!noHistory) {
      handlers.lastpage = window.location.pathname;
      window.history.replaceState({'watpage': window.location.pathname}, 'Title', window.location.pathname);
      window.history.pushState({'watpage': page}, 'Title', page);
    }
  },

  setTimelineVisible: function(visible) {
    var $sectiontimeline = $('section#timeline-wrap');
    var $sectionhome = $('section#home');
    if (visible) {
      if (!$sectiontimeline.is(':visible')) $sectiontimeline.show();
      if ($sectionhome.is(':visible')) $sectionhome.hide();
      if (!gtl.init) timelineInit();
    } else {
      if ($sectiontimeline.is(':visible')) $sectiontimeline.hide();
      if (!$sectionhome.is(':visible')) $sectionhome.show();
      $('#listname').text('');
      handlers.currentName = null;
      handlers.currentUser = null,
      handlers.currentList = null,
      handlers.currentPerm = -1;
      handlers.updatePermissions();
    }
  },

  updates: null,
  refreshUpdates: function(userid, listid, change, cb) {
    if (!user) return;
    if (typeof change === 'function') {
      cb = change;
      change = undefined;
    }
    if (!handlers.updates) {
      makeRequest('GET', '/updates.json', function(data) {
        if (data) {
          handlers.updates = data;
          handlers.refreshUpdates(userid, listid, change, cb);
        }
      });
      return;
    }
    var subbed = false;
    if (userid) {
      subbed = handlers.updates.usersubs[userid];
    } else if (listid) {
      subbed = handlers.updates.listsubs[listid];
    }
    if (subbed) {
      if (change) {
        subbed.updates += change;
        handlers.updates.notifications += change;
      }
      $('.subscribe').attr('subbed', 'subbed');
    } else $('.subscribe').removeAttr('subbed');
    $('#updates').text(handlers.updates.notifications).attr('updates', handlers.updates.notifications);
    if (handlers.updates.notifications > 0) {
      document.title = "(" + handlers.updates.notifications + ") wat do?";
    } else {
      document.title = "wat do?";
    }
    if (cb) cb();
  },

  currentName: null,
  currentUser: null,
  currentList: null,
  currentPerm: -1,
  loadData: function(user, list, cb, param) {
    if (typeof user === 'function') {
      param = list;
      cb = user;
      list = undefined;
      user = undefined;
    }
    if (gdata && handlers.currentUser == user && handlers.currentList == list) {
      if (cb && param) {
        cb(param);
      } else if (cb) cb();
      return;
    }
    var link = '/items.json';
    if (user) {
      link = '/user/' + user + '.json';
    } else if (list) {
      link = '/list/' + list + '.json';
    }
    makeRequest('GET', link, function(data) {
      if (!user && !list) {
        $('.subscribe').hide();
      } else $('.subscribe').show();
      $('#listname').text(data.name);
      handlers.currentName = data.name;
      handlers.currentUser = user;
      handlers.currentList = list;
      handlers.currentPerm = data.permission;
      handlers.updatePermissions();
      handlers.refreshUpdates(handlers.currentUser, handlers.currentList);
      gdata = data.list;
      gtl.smoothscroll = true;
      timelineUpdate(gdata);
      if (cb && param) {
        cb(param);
      } else if (cb) cb();
    });
  },

  updatePermissions: function() {
    $('[perm]').each(function() {
      $this = $(this);
      if ($this.filter('input[type="text"],input[type="checkbox"],textarea').length > 0) {
        $this.attr('hasperm', 'hasperm');
        if ($this.attr('perm') > handlers.currentPerm) {
          $this.attr('readonly', 'readonly');
        } else $this.removeAttr('readonly');
      } else {
        if ($this.attr('perm') > handlers.currentPerm) {
          $this.removeAttr('hasperm');
        } else $this.attr('hasperm', 'hasperm');
      }
    });
    if (!user || (!handlers.currentUser && !handlers.currentList)) {
      $('.subscribe').hide();
    } else $('.subscribe').show();
  },

  setupRoutes: function() {
    crossroads.addRoute('/', function() {
      setModal();
      handlers.setTimelineVisible(user);
      if (user) handlers.loadData();
    }, 0);

    crossroads.addRoute('/about', function() {
      setModal('about');
      handlers.setTimelineVisible(user);
      if (user) handlers.loadData(handlers.currentUser, handlers.currentList);
    }, 1);

    crossroads.addRoute('/account', function() {
      handlers.setTimelineVisible(user);
      if (user) {
        makeRequest('GET', '/account.json', function(data) {
          data.createdAt = moment(data.createdAt).format("MMM D YYYY, h:mm a");
          data.share = window.location.protocol + "//" + window.location.host + "/user/" + data._id;
          setFormData($("#account form"), data);
          setModal('account');
        });
        handlers.loadData(handlers.currentUser, handlers.currentList);
      } else showError('You must be logged in to view this page.');
    }, 1);

    crossroads.addRoute('/updates', function() {
      handlers.setTimelineVisible(user);
      if (user) {
        handlers.refreshUpdates(handlers.currentUser, handlers.currentList, function() {
          handlers.populateUpdates();
          setModal('updates');
          handlers.loadData(handlers.currentUser, handlers.currentList);
        });
      } else showError('You must be logged in to view this page.');
    }, 1);

    crossroads.addRoute('/list/new', function() {
      handlers.setTimelineVisible(user);
      if (user) {
        var form = $("#list form");
        form.find('.btn-delete').hide();
        form.find('#sharelink').hide();
        form.find('#listowner').hide();
        setFormData(form);
        $('#list #members-list').html('');
        setModal('list');
        handlers.loadData(handlers.currentUser, handlers.currentList);
      } else showError('You must be logged in to create new lists.');
    }, 2);

    crossroads.addRoute('/list/{id}/edit', function(id) {
      handlers.setTimelineVisible(user);
      if (user) {
        makeRequest('GET', '/list/' + id + '.json', function(data) {
          if (data.permission < 2) {
            showError('You do not have permission to edit this list.');
            return;
          }
          data.ownername = data.owner.name + " (" + data.owner.email + ")";
          data.share = window.location.protocol + "//" + window.location.host + "/list/" + data._id;
          var form = $("#list form");
          if (data.permission > 2) form.find('.btn-delete').show();
          form.find('#sharelink').show();
          form.find('#listowner').show();
          setFormData(form, data);
          handlers.populateListMembers(data);
          setModal('list');
        });
        handlers.loadData(null, id);
      } else showError('You must be logged in to edit lists.');
    }, 2);

    crossroads.addRoute('/list/{id}', function(id) {
      setModal();
      handlers.setTimelineVisible(true);
      handlers.loadData(null, id);
    }, 1);

    crossroads.addRoute('/user/{id}', function(id) {
      setModal();
      handlers.setTimelineVisible(true);
      handlers.loadData(id);
    }, 1);

    crossroads.addRoute('/item/new', function() {
      handlers.setTimelineVisible(user);
      if (user) {
        handlers.loadData(handlers.currentUser, handlers.currentList, doNewItem);
      } else showError('You must be logged in to create new items.');
    }, 2);

    crossroads.addRoute('/item/{id}', function(id) {
      handlers.setTimelineVisible(true);
      if (!gdata) {
        makeRequest('GET', '/item/' + id + '.json', function(data) {
          handlers.loadData(data.user && data.user._id, data.list && data.list._id, function() {
            if (data.user) {
              handlers.lastpage = '/user/' + data.user._id;
              window.history.replaceState({'watpage': '/user/' + data.user._id}, 'Title', '/user/' + data.user._id);
              window.history.pushState({'watpage': '/item/' + id}, 'Title', '/item/' + id);
            } else if (data.list) {
              handlers.lastpage = '/list/' + data.list._id;
              window.history.replaceState({'watpage': '/list/' + data.list._id}, 'Title', '/list/' + data.list._id);
              window.history.pushState({'watpage': '/item/' + id}, 'Title', '/item/' + id);
            }
            doItem(id);
          });
        });
      } else handlers.loadData(handlers.currentUser, handlers.currentList, doItem, id);
    }, 1);

    crossroads.bypassed.add(function(request) {
      if (window.location.pathname != request) window.location = request;
    });

    function doNewItem() {
      var form = $("#item form");
      form.find('.btn-delete').hide();
      form.find('.btn-list').hide();
      var start = moment().startOf('day');
      var end = moment().startOf('day').add('days', 7);
      setFormData(form, {
        _id: -1,
        startday: start.format("MMM D YYYY"),
        starthour: start.format("h:mm a"),
        endday: end.format("MMM D YYYY"),
        endhour: end.format("h:mm a")
      });
      setModal('item');
    }

    function doItem(id) {
      for (var i = 0; i < gdata.length; i++) {
        if (gdata[i]._id == id) {
          var start = moment(gdata[i].start);
          var end = moment(gdata[i].end);
          gdata[i].startday = start.format("MMM D YYYY");
          gdata[i].starthour = start.format("h:mm a");
          gdata[i].endday = end.format("MMM D YYYY");
          gdata[i].endhour = end.format("h:mm a");
          var form = $("#item form");
          if (handlers.currentPerm > 0) form.find('.btn-delete').show();
          if (!handlers.currentList && !handlers.currentUser) {
            form.find('.btn-list').show();
          } else form.find('.btn-list').hide();
          if (user) {
            form.find('.btn-save').show();
          } else form.find('.btn-save').hide();
          form.find('.btn-cancel').val(user ? 'Cancel' : 'Close');
          setFormData(form, gdata[i]);
          setModal('item');
          return;
        }
      }
      showError('The requested item does not exist.');
    }
  },

  populateUpdates: function() {
    var tmp = [];
    tmp.push({name: 'Your List'});
    tmp = tmp.concat(handlers.updates.lists);
    var lists = d3.select('#updates #lists').selectAll('li').data(tmp);
    var tmp = lists.enter().append('li')
      .append('a')
      .attr('href', function(d) { return d._id ? ('/list/' + d._id) : ('/user/' + handlers.updates.self); });
    tmp.append('span')
      .text(function(d) { return d.name; });
    tmp.append('div')
      .attr('class', 'updates')
      .attr('updates', function(d) {
        if (!d._id) {
          return handlers.updates.usersubs[handlers.updates.self] ? handlers.updates.usersubs[handlers.updates.self].updates : 0;
        } else {
          return handlers.updates.listsubs[d._id] ? handlers.updates.listsubs[d._id].updates : 0;
        }
      })
      .text(function(d) {
        if (!d._id) {
          return handlers.updates.usersubs[handlers.updates.self] ? handlers.updates.usersubs[handlers.updates.self].updates : 0;
        } else {
          return handlers.updates.listsubs[d._id] ? handlers.updates.listsubs[d._id].updates : 0;
        }
      });

    tmp = lists.select('a')
      .attr('href', function(d) { return d._id ? ('/list/' + d._id) : ('/user/' + handlers.updates.self); });
    tmp.select('span')
      .text(function(d) { return d.name; })
    tmp.select('div')
      .attr('updates', function(d) {
        if (!d._id) {
          return handlers.updates.usersubs[handlers.updates.self] ? handlers.updates.usersubs[handlers.updates.self].updates : 0;
        } else {
          return handlers.updates.listsubs[d._id] ? handlers.updates.listsubs[d._id].updates : 0;
        }
      })
      .text(function(d) {
        if (!d._id) {
          return handlers.updates.usersubs[handlers.updates.self] ? handlers.updates.usersubs[handlers.updates.self].updates : 0;
        } else {
          return handlers.updates.listsubs[d._id] ? handlers.updates.listsubs[d._id].updates : 0;
        }
      });

    lists.exit().remove();

    if (Object.keys(handlers.updates.usersubs).length <= 0 && Object.keys(handlers.updates.listsubs).length <= 0) {
      $('#updates #listsubs').html('<li><a><span>None</span><div class="updates"></div></a></li>');
    } else {
      var subs = [];
      for (var id in handlers.updates.usersubs) {
        if (handlers.updates.usersubs[id]) subs.push({_id: id, link: '/user/' + id, sub: handlers.updates.usersubs[id]});
      }
      for (var id in handlers.updates.listsubs) {
        if (handlers.updates.listsubs[id]) subs.push({_id: id, link: '/list/' + id, sub: handlers.updates.listsubs[id]});
      }

      var listsubs = d3.select('#updates #listsubs').selectAll('li').data(subs);

      var tmp = listsubs.enter().append('li')
        .append('a')
        .attr('href', function(d) { return d.link; });
      tmp.append('span')
        .text(function(d) { return d.sub.name; });
      tmp.append('div')
        .attr('class', 'updates')
        .attr('updates', function(d) { return d.sub.updates; })
        .text(function(d) { return d.sub.updates; });

      tmp = listsubs.select('a')
        .attr('href', function(d) { return d.link; });
      tmp.select('span')
        .text(function(d) { return d.sub.name; })
      tmp.select('div')
        .attr('updates', function(d) { return d.sub.updates; })
        .text(function(d) { return d.sub.updates; });

      listsubs.exit().remove();
    }
  },

  populateListMembers: function(list) {
    var members = d3.select('#list #members-list').selectAll('tr').data(list.members);
    var tmp = members.enter().append('tr');
    tmp.append('td')
      .attr('class', 'left')
      .text('X')
      .on("click", function(d, i) {
        list.members.splice(i, 1);
        $('#list form').data('js-data', list);
        handlers.populateListMembers(list);
      });
    tmp.append('td')
      .attr('class', 'name')
      .append('p')
      .text(function(d) { return d.user.email; });
    tmp = tmp.append('td')
      .attr('class', 'right')
      .append('select')
      .attr('class', 'permission medium')
      .on("change", function(d) {
        d.permission = $(d3.event.target).val();
        $('#list form').data('js-data', list);
      });
    tmp.append('option')
      .attr('class', 'option0')
      .attr('value', '0')
      .attr('selected', function(d) { return d.permission == 0 ? 'selected' : undefined; })
      .text('View Only');
    tmp.append('option')
      .attr('class', 'option1')
      .attr('value', '1')
      .attr('selected', function(d) { return d.permission == 1 ? 'selected' : undefined; })
      .text('View & Edit');
    tmp.append('option')
      .attr('class', 'option2')
      .attr('value', '2')
      .attr('selected', function(d) { return d.permission == 2 ? 'selected' : undefined; })
      .text('Admin');

    members.select('.name p')
      .text(function(d) {
        if (d.user.name) {
          return d.user.name + " (" + d.user.email + ")";
        } else return d.user.email;
      });
    members.select('.right option0')
      .attr('selected', function(d) { return d.permission == 0 ? 'selected' : undefined; });
    members.select('.right option1')
      .attr('selected', function(d) { return d.permission == 1 ? 'selected' : undefined; });
    members.select('.right option2')
      .attr('selected', function(d) { return d.permission == 2 ? 'selected' : undefined; });

    members.exit().remove();
  }
};