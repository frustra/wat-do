var gdata = [];

function changeURL(page, noHistory) {
  crossroads.parse(page);
  if (!noHistory) {
    window.history.replaceState({'watpage': window.location.pathname}, 'Title', window.location.pathname);
    window.history.pushState({'watpage': page}, 'Title', page);
  }
}

function setModal(name) {
  if (name) {
    $('#modal').show();
    $.each($('.modal-inner'), function() {
      if ($(this)[0].id == name) {
        $(this).show();
        $(this).find("textarea").each(function() {
          if ($(this).val() == '') $(this).val('');
        });
      } else $(this).hide();
    });
    $(window).unbind("mousedown", mouseDown);
  } else {
    $('#modal').hide();
    $(window).bind("mousedown", mouseDown);
  }
}

function setFormData(form, obj, force) {
  if (obj == null) {
    if (Object.keys(form.data('js-data')).length != 0 || force) {
      form.data('js-data', {});
      $('textarea[js-data],input[js-data]').each(function() {
        var $this = $(this);
        $this.data('js-commit', null);
        if ($this.attr('type') == 'checkbox') {
          if (!!$this.attr('checked')) $this.click();
        } else $this.val('');
      });
    }
  } else {
    if (form.data('js-data') != obj || force) {
      form.data('js-data', obj);
      $.each(obj, function(k, v) {
        $("textarea[js-data='" + k + "'],input[js-data='" + k + "']").each(function() {
          var $this = $(this);
          $this.data("js-commit", v);
          if ($this.attr('type') == 'checkbox') {
            if (!!$this.attr('checked') != v) $this.click();
          } else $this.val(v);
        });
      });
    }
  }
}

$(function() {
  var $document = $(document)
    , addedScroll = false;

  $document.scroll(function(e) {
    if ($document.scrollTop() > 1) {
      if (addedScroll) return;
      addedScroll = true;
      $('body').addClass('scroll');
    } else {
      $('body').removeClass('scroll');
      addedScroll = false;
    }
  });

  $('a').click(function(e) {
    e.preventDefault();
    changeURL($(this).attr('href'));
  });

  $('.overlay-inner').click(function(e) {
    var save = $(window).scrollLeft();
    changeURL('/');
    $(window).scrollLeft(save);
  });

  $('.editable').keydown(function(e) {
    if (e.which == 27) { // Escape
      e.preventDefault();
      $(e.target).val($(e.target).data('js-commit'));
      e.target.blur();
    } else if (e.which == 13 && !e.shiftKey) { // Return
      e.preventDefault();
      e.target.blur();
    }
  });

  $('.editable input, .editable textarea').blur(function() {
    $(this).data("js-commit", $(this).val());
  });

  $('form[js-form]').each(function() {
    var form = $(this);
    form.data('js-data', {});
    form.submit(function(e) {
      e.preventDefault();
      form.find('textarea[js-data],input[js-data]').each(function() {
        if ($(this).attr('type') == 'checkbox') {
          form.data('js-data')[$(this).attr('js-data')] = !!$(this).attr('checked');
        } else form.data('js-data')[$(this).attr('js-data')] = $(this).val();
      });
      window[form.attr('js-form')](form.data('js-data'));
    });
  });

  $('#cancel').click(function(e) {
    setFormData($(this).parents('form[js-form]'), null, true);
    changeURL('/');
  });

  window.onpopstate = function(event) {
    if (event.state != undefined && event.state.watpage != undefined) changeURL(event.state.watpage, true);
  };

  crossroads.addRoute('/', function(id) {
    setModal();
  }, 0);

  crossroads.addRoute('/about', function(id) {
    setModal('about');
  }, 1);

  crossroads.addRoute('/item/new', function(id) {
    setFormData($("#item form"), null);
    setModal('item');
  }, 2);

  crossroads.addRoute('/item/{id}', function(id) {
    for (var i = 0; i < gdata.length; i++) {
      if (gdata[i]._id == id) {
        setFormData($("#item form"), gdata[i]);
        break;
      }
    }
    setModal('item');
  }, 1);

  crossroads.bypassed.add(function(request) {
    if (window.location.pathname != request) window.location = request;
  });

  timelineInit();
  $(window).bind("mousedown", mouseDown);

  $.ajax({
    url: '/items.json',
    success: function(data) {
      gdata = data;
      timelineUpdate(gdata);
      changeURL(window.location.pathname, true);
    }
  });
});

function saveItem(item) {
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
}