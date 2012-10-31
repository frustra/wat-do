var gdata = null;
var owndata = false;

function setModal(name) {
  if (name) {
    $('#modal').show();
    $.each($('.modal-inner'), function() {
      var $this = $(this);
      if (this.id == name) {
        $this.show();
        $this.find("textarea").each(function() {
          if ($this.val() == '') $this.val('');
        });
      } else $this.hide();
    });
    $(window).unbind("mousedown", handlers.mouseDown);
  } else {
    $('#modal').hide();
    $(window).bind("mousedown", handlers.mouseDown);
  }
}

function setFormData(form, obj, force) {
  if (obj == null) {
    if (Object.keys(form.data('js-data')).length != 0 || force) {
      form.data('js-data', {});
      form.find('textarea[js-data],input[js-data]').each(function() {
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
      form.find('textarea[js-data],input[js-data]').each(function() {
        var $this = $(this);
        var key = $this.attr("js-data");
        var val = '';
        if (typeof obj[key] !== 'undefined') {
          val = obj[key];
        }
        $this.data("js-commit", val);
        if ($this.attr('type') == 'checkbox') {
          if (!!$this.attr('checked') != val) $this.click();
        } else $this.val(val);
      });
    }
  }
}

function showError(msg) {
  if (msg) {
    $('#error #defaultmsg').hide();
    $('#error #msg').show().text(msg);
  } else {
    $('#error #defaultmsg').show();
    $('#error #msg').hide();
  }
  setModal('error');
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
    handlers.changeURL($(this).attr('href'));
  });

  $('.overlay-inner').click(function(e) {
    if (!handlers.lastpage || window.history.length <= 1) {
      handlers.changeURL('/');
    } else window.history.back();
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
        var $this = $(this);
        if ($this.attr('type') == 'checkbox') {
          form.data('js-data')[$this.attr('js-data')] = !!$this.attr('checked');
        } else form.data('js-data')[$this.attr('js-data')] = $this.val();
      });
      handlers[form.attr('js-form')](form.data('js-data'));
    });
  });

  $('.btn-cancel').click(function(e) {
    setFormData($(this).parents('form[js-form]'), null, true);
    handlers.changeURL('/');
  });

  $('input.link[readonly]').click(function(e) {
    $(this).select();
  });

  window.onpopstate = function(event) {
    if (event.state != undefined && event.state.watpage != undefined) handlers.changeURL(event.state.watpage, true);
  };

  handlers.setupRoutes();

  if (fromserver.template === 'items') timelineInit();
  handlers.changeURL(window.location.pathname, true);

  $(window).bind("mousedown", handlers.mouseDown);
});
