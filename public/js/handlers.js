var handlers = {
  saveItem: function(item) {
    item.start = moment(item.start).utc().format();
    item.end = moment(item.end).utc().format();
    if (item._id) { // Existing item
      $.ajax({
        type: 'POST',
        url: '/item/' + item._id + '.json',
        data: item,
        success: function(data) {
          for (var i = 0; i < gdata.length; i++) {
            if (gdata[i]._id == data._id) {
              gdata[i] = data;
            }
          }
          timelineUpdate(gdata);
          changeURL('/');
        }
      });
    } else { // New Item
      $.ajax({
        type: 'POST',
        url: '/item/new.json',
        data: item,
        success: function(data) {
          gdata.push(data);
          timelineUpdate(gdata);
          changeURL('/');
        }
      });
    }
  },

  saveAccount: function(account) {
    $.ajax({
      type: 'POST',
      url: '/account.json',
      data: account,
      success: function(data) {
        changeURL('/');
      }
    });
  },

  mouseDown: function(e) {
    if ($('.timeline-visualization')[0]) {
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

  loadData: function(link, error, cb, param) {
    if (!link) link = '/items.json';
    $.ajax({
      url: link,
      success: function(data) {
        if (data) {
          handlers.loadedData(data);
          if (cb && param) {
            cb(param);
          } else if (cb) cb();
        } else if (error) showError(error);
      }
    });
  },

  loadedData: function(data) {
    gdata = data;
    timelineUpdate(gdata);
  },

  setupRoutes: function() {
    crossroads.addRoute('/', function(id) {
      setModal();
      if (!gdata) handlers.loadData();
    }, 0);

    crossroads.addRoute('/about', function(id) {
      setModal('about');
      if (!gdata) handlers.loadData();
    }, 1);

    crossroads.addRoute('/account', function(id) {
      $.ajax({
        url: '/account.json',
        success: function(data) {
          if (data) {
            data.createdAt = moment(data.createdAt).format("MMM D YYYY, h:mm a");
            data.share = window.location.protocol + "//" + window.location.host + "/user/" + data._id;
            setFormData($("#account form"), data);
            setModal('account');
          } else changeURL('/');
        }
      });
      if (!gdata) handlers.loadData();
    }, 1);

    crossroads.addRoute('/user/{id}', function(id) {
      setModal();
      handlers.loadData('/user/' + id + '.json', 'This user has not set their items to public or does not exist.');
    }, 1);

    //crossroads.addRoute('/list/new ', function(id) {
    //  setModal('list');
    //}, 2);

    //crossroads.addRoute('/list/edit/(id) ', function(id) {
    //  setModal('list');
    //}, 2);

    crossroads.addRoute('/list/{id}', function(id) {
      setModal();
      handlers.loadData('/list/' + id + '.json', 'This list is not public or does not exist.');
    }, 1);

    function doNew() {
      setFormData($("#item form"), {start: moment().format("MMM D YYYY, h:mm a"), end: moment().add('days', 7).format("MMM D YYYY, h:mm a")});
      setModal('item');
    }

    crossroads.addRoute('/item/new', function() {
      if (!gdata) {
        handlers.loadData(null, 'You must be logged in to create items.', doNew);
      } else doNew();
    }, 2);

    function doItem(id) {
      for (var i = 0; i < gdata.length; i++) {
        if (gdata[i]._id == id) {
          gdata[i].start = moment(gdata[i].start).format("MMM D YYYY, h:mm a");
          gdata[i].end = moment(gdata[i].end).format("MMM D YYYY, h:mm a");
          setFormData($("#item form"), gdata[i]);
          break;
        }
      }
      setModal('item');
    }

    crossroads.addRoute('/item/{id}', function(id) {
      if (!gdata) {
        handlers.loadData(null, 'This item is not public or does not exist.', doItem, id);
      } else doItem(id);
    }, 1);

    crossroads.bypassed.add(function(request) {
      if (window.location.pathname != request) window.location = request;
    });
  }
};