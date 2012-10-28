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

  setupRoutes: function() {
    crossroads.addRoute('/', function(id) {
      setModal();
    }, 0);

    crossroads.addRoute('/about', function(id) {
      setModal('about');
    }, 1);

    crossroads.addRoute('/item/new', function(id) {
      setFormData($("#item form"), {start: moment().format("MMM D YYYY, h:mm a"), end: moment().add('days', 7).format("MMM D YYYY, h:mm a")});
      setModal('item');
    }, 2);

    crossroads.addRoute('/item/{id}', function(id) {
      for (var i = 0; i < gdata.length; i++) {
        if (gdata[i]._id == id) {
          gdata[i].start = moment(gdata[i].start).format("MMM D YYYY, h:mm a");
          gdata[i].end = moment(gdata[i].end).format("MMM D YYYY, h:mm a");
          setFormData($("#item form"), gdata[i]);
          break;
        }
      }
      setModal('item');
    }, 1);

    crossroads.bypassed.add(function(request) {
      if (window.location.pathname != request) window.location = request;
    });
  }
};