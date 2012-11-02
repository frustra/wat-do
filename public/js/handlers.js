var handlers = {
  getListPrefix: function() {
    switch (handlers.dataType) {
      case 1:
        return '/list/' + handlers.dataId;
      case 2:
        return '/user/' + handlers.dataId;
      default:
        return '';
    }
  },

  saveItem: function(item) {
    item.start = moment(item.start).utc().format();
    item.end = moment(item.end).utc().format();
    if (item._id) { // Existing item
      makeRequest('POST', handlers.getListPrefix() + '/item/' + item._id + '.json', false, item, function(data) {
        for (var i = 0; i < gdata.length; i++) {
          if (gdata[i]._id == data._id) {
            gdata[i] = data;
            break;
          }
        }
        timelineUpdate(gdata);
        handlers.changeURL('/');
      });
    } else { // New Item
      makeRequest('POST', handlers.getListPrefix() + '/item/new.json', false, item, function(data) {
        gdata.push(data);
        timelineUpdate(gdata);
        handlers.changeURL('/');
      });
    }
  },

  deleteItem: function(item) {
    makeRequest('DELETE', handlers.getListPrefix() + '/item/' + item._id + '.json', false, function(data) {
      for (var i = 0; i < gdata.length; i++) {
        if (gdata[i]._id === item._id) {
          gdata.splice(i, 1);
          break;
        }
      }
      timelineUpdate(gdata);
      handlers.changeURL('/');
    });
  },

  saveAccount: function(account) {
    makeRequest('POST', '/account.json', false, account, function(data) {
      handlers.changeURL('/');
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

  dataType: null,
  dataId: null,
  loadData: function(type, id, cb, param) {
    if (typeof id === 'function') {
      param = cb;
      cb = id;
      id = undefined;
    }
    var link = '/items.json';
    switch (type) {
      case 0:
        link = '/items.json';
        if (handlers.dataType == 0) {
          if (cb && param) {
            cb(param);
          } else if (cb) cb();
          return;
        }
        break;
      case 1:
        link = '/list/' + id + '.json';
        if (handlers.dataType == 1 && handlers.dataId == id) {
          if (cb && param) {
            cb(param);
          } else if (cb) cb();
          return;
        }
        break;
      case 2:
        link = '/user/' + id + '.json';
        if (handlers.dataType == 2 && handlers.dataId == id) {
          if (cb && param) {
            cb(param);
          } else if (cb) cb();
          return;
        }
        break;
      default:
        if (gdata) {
          if (cb && param) {
            cb(param);
          } else if (cb) cb();
          return;
        }
        type = 0;
        id = undefined;
    }
    makeRequest('GET', link, false, function(data) {
      handlers.dataType = type;
      handlers.dataId = id;
      gdata = data;
      timelineUpdate(gdata);
      if (cb && param) {
        cb(param);
      } else if (cb) cb();
    });
  },

  setupRoutes: function() {
    crossroads.addRoute('/', function(id) {
      setModal();
      handlers.setTimelineVisible(user);
      if (user) handlers.loadData(0);
    }, 0);

    crossroads.addRoute('/about', function(id) {
      setModal('about');
      handlers.setTimelineVisible(user);
      if (user) handlers.loadData();
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
        handlers.loadData();
      } else showError('You must be logged in to view this page.');
    }, 1);

    //crossroads.addRoute('/list/new ', function(id) {
    //  setModal('list');
    //}, 2);

    //crossroads.addRoute('/list/edit/(id) ', function(id) {
    //  setModal('list');
    //}, 2);

    crossroads.addRoute('/list/{id}', function(id) {
      setModal();
      handlers.setTimelineVisible(true);
      handlers.loadData(1, id);
    }, 1);

    crossroads.addRoute('/list/{lid}/item/{iid}', function(lid, iid) {
      setModal();
      handlers.setTimelineVisible(true);
      handlers.loadData(1, lid, doItem, iid);
    }, 1);

    crossroads.addRoute('/list/{id}/item/new', function(id) {
      setModal();
      handlers.setTimelineVisible(user);
      if (user) {
        handlers.loadData(1, id, doNew);
      } else showError('You must be logged in to create new items.');
    }, 2);

    crossroads.addRoute('/user/{id}', function(id) {
      setModal();
      handlers.setTimelineVisible(true);
      handlers.loadData(2, id);
    }, 1);

    crossroads.addRoute('/user/{uid}/item/{iid}', function(uid, iid) {
      setModal();
      handlers.setTimelineVisible(true);
      handlers.loadData(2, uid, doItem, iid);
    }, 1);

    crossroads.addRoute('/user/{id}/item/new', function(id) {
      setModal();
      handlers.setTimelineVisible(user);
      if (user) {
        handlers.loadData(2, id, doNew);
      } else showError('You must be logged in to create new items.');
    }, 1);

    crossroads.addRoute('/item/new', function() {
      handlers.setTimelineVisible(user);
      if (user) {
        handlers.loadData(0, doNew);
      } else showError('You must be logged in to create new items.');
    }, 2);

    crossroads.addRoute('/item/{id}', function(id) {
      handlers.setTimelineVisible(user);
      if (user) {
        handlers.loadData(0, doItem, id);
      } else showError('You must be logged in to view this page.');
    }, 1);

    crossroads.bypassed.add(function(request) {
      if (window.location.pathname != request) window.location = request;
    });

    function doNew() {
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
          form.find('.btn-delete').show();
          setFormData(form, gdata[i]);
          setModal('item');
          return;
        }
      }
      showError('The requested item does not exist.');
    }
  }
};