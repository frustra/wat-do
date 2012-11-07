var handlers = {
  saveList: function(list) {
    if (list._id) { // Existing List
      makeRequest('POST', '/list/' + list._id + '.json', false, list, function(data) {
        $('.overlay-inner').click();
      });
    } else { // New List
      makeRequest('POST', '/list/new.json', false, list, function(data) {
        handlers.changeURL('/list/' + data);
      });
    }
  },

  deleteList: function(list) {
    makeRequest('DELETE', '/list/' + list._id + '.json', false, function(data) {
      handlers.changeURL('/');
    });
  },

  saveItem: function(item) {
    item.start = moment(item.start).utc().format();
    item.end = moment(item.end).utc().format();
    if (item._id) { // Existing item
      makeRequest('POST', '/item/' + item._id + '.json', false, item, function(data) {
        for (var i = 0; i < gdata.length; i++) {
          if (gdata[i]._id == data._id) {
            gdata[i] = data;
            break;
          }
        }
        timelineUpdate(gdata);
        $('.overlay-inner').click();
      });
    } else { // New Item
      item.user = handlers.currentUser;
      item.list = handlers.currentList;
      console.log(item);
      makeRequest('POST', '/item/new.json', false, item, function(data) {
        gdata.push(data);
        timelineUpdate(gdata);
        $('.overlay-inner').click();
      });
    }
  },

  deleteItem: function(item) {
    makeRequest('DELETE', '/item/' + item._id + '.json', false, function(data) {
      for (var i = 0; i < gdata.length; i++) {
        if (gdata[i]._id === item._id) {
          gdata.splice(i, 1);
          break;
        }
      }
      timelineUpdate(gdata);
      $('.overlay-inner').click();
    });
  },

  saveAccount: function(account) {
    makeRequest('POST', '/account.json', false, account, function(data) {
      $('.overlay-inner').click();
    });
  },

  mouseDown: function(e) {
    if ($('section#timeline-wrap').is(':visible')) {
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
    }
  },

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
    makeRequest('GET', link, false, function(data) {
      handlers.currentUser = user;
      handlers.currentList = list;
      handlers.currentPerm = data.permission;
      handlers.updatePermissions();
      gdata = data.list;
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
  },

  setupRoutes: function() {
    crossroads.addRoute('/', function(id) {
      setModal();
      handlers.setTimelineVisible(user);
      if (user) handlers.loadData();
    }, 0);

    crossroads.addRoute('/about', function(id) {
      setModal('about');
      handlers.setTimelineVisible(user);
      if (user) handlers.loadData(handlers.currentUser, handlers.currentList);
    }, 1);

    crossroads.addRoute('/account', function(id) {
      handlers.setTimelineVisible(user);
      if (user) {
        makeRequest('GET', '/account.json', false, function(data) {
          data.createdAt = moment(data.createdAt).format("MMM D YYYY, h:mm a");
          data.share = window.location.protocol + "//" + window.location.host + "/user/" + data._id;
          setFormData($("#account form"), data);
          setModal('account');
        });
        handlers.loadData(handlers.currentUser, handlers.currentList);
      } else showError('You must be logged in to view this page.');
    }, 1);

    crossroads.addRoute('/list/new', function() {
      if (user) {
        var form = $("#list form");
        form.find('.btn-delete').hide();
        form.find('#sharelink').hide();
        setFormData(form);
        setModal('list');
      } else showError('You must be logged in to create new lists.');
    }, 2);

    crossroads.addRoute('/list/{id}/edit', function(id) {
      if (user) {
        makeRequest('GET', '/list/' + id + '.json', false, function(data) {
          if (data.permission < 2) {
            showError('You do not have permission to edit this list.');
            return;
          }
          data.share = window.location.protocol + "//" + window.location.host + "/list/" + data._id;
          var form = $("#list form");
          if (data.permission > 2) form.find('.btn-delete').show();
          form.find('#sharelink').show();
          setFormData(form, data);
          setModal('list');
        });
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
        makeRequest('GET', '/item/' + id + '.json', false, function(data) {
          handlers.loadData(data.user, data.list, function() {
            if (data.user) {
              handlers.lastpage = '/user/' + data.user;
              window.history.replaceState({'watpage': '/user/' + data.user}, 'Title', '/user/' + data.user);
              window.history.pushState({'watpage': '/item/' + id}, 'Title', '/item/' + id);
            } else if (data.list) {
              handlers.lastpage = '/list/' + data.list;
              window.history.replaceState({'watpage': '/list/' + data.list}, 'Title', '/list/' + data.list);
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
      setFormData(form, {start: moment().format("MMM D YYYY, h:mm a"), end: moment().add('days', 7).format("MMM D YYYY, h:mm a")});
      setModal('item');
    }

    function doItem(id) {
      for (var i = 0; i < gdata.length; i++) {
        if (gdata[i]._id == id) {
          gdata[i].start = moment(gdata[i].start).format("MMM D YYYY, h:mm a");
          gdata[i].end = moment(gdata[i].end).format("MMM D YYYY, h:mm a");
          var form = $("#item form");
          if (handlers.currentPerm > 0) form.find('.btn-delete').show();
          form.find('.btn-cancel').val(handlers.currentPerm > 0 ? 'Cancel' : 'Close');
          setFormData(form, gdata[i]);
          setModal('item');
          return;
        }
      }
      showError('The requested item does not exist.');
    }
  }
};