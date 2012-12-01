/** @license
 * wat-do <https://github.com/j1i/wat-do/>
 * License: MIT
 * Author: Jacob Wirth, Justin Li
 */
var gdata = null;

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
  } else {
    $('#modal').hide();
  }
}

function setFormData(form, obj, force) {
  if (!form.data('js-data')) return;
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
  if ($('#modal').is(':visible')) {
    if (msg) {
      alert(msg);
    } else alert($('#error #defaultmsg').text());
  } else {
    if (msg) {
      $('#error #defaultmsg').hide();
      $('#error #msg').show().text(msg);
    } else {
      $('#error #defaultmsg').show();
      $('#error #msg').hide();
    }
    setModal('error');
  }
}

function makeRequest(type, url, reqdata, callback) {
  if (typeof reqdata === 'function') {
    callback = reqdata;
    reqdata = undefined;
  }
  $.ajax({
    type: type,
    url: url,
    data: reqdata,
    success: function(data) {
      if (!data) {
        showError();
      } else if (data.error) {
        console.log('Error: ' + data.error);
        if (data.error === "no-user") {
          user = false;
          handlers.setTimelineVisible(false);
          setModal();
          handlers.lastpage = '/';
          window.history.replaceState({'watpage': '/'}, 'Title', '/');
          window.history.pushState({'watpage': window.location.pathname}, 'Title', window.location.pathname);
        }
        showError(data.msg);
      } else if (data.response) {
        callback(data.response);
      } else showError();
    },
    error: function(jqXHR, status, error) {
      if (status === 'timeout') {
        showError('wat do could not connect to the server, please try again later.');
      } else {
        console.log('Request error: ' + status + (error ? ' - ' + error : ''));
        showError();
      }
    }
  });
}

var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-20354481-13']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

$(function() {

  var $window = $(window)
    , addedScroll = false;

  $window.scroll(function() {
    if ($window.scrollTop() > 1) {
      if (addedScroll) return;
      addedScroll = true;
      $('body').addClass('scroll');
    } else {
      $('body').removeClass('scroll');
      addedScroll = false;
    }
  });

  $window.resize(function() {
    $('#modal .content').css('max-height', ($window.height() - 80) + 'px');
    $('.modal-inner').each(function() {
      var $this = $(this);
      $this.css('max-height', ($window.height() - 80 - $this.outerHeight(true) + $this.height()) + 'px');
    });
  });

  $(document).on('click', 'a', function(e) {
    var $this = $(this);
    if ($this.attr('href')) {
      e.preventDefault();
      handlers.changeURL($this.attr('href'));
    }
  });

  $('.overlay-inner').click(function() {
    if (window.location.pathname !== '/') {
      if (!handlers.lastpage || window.history.length <= 1) {
        handlers.changeURL('/');
      } else window.history.back();
    } else setModal();
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

  $('.btn-cancel').click(function() {
    setFormData($(this).parents('form[js-form]'), null, true);
    $('.overlay-inner').click();
  });

  $('input.link[readonly]').click(function() {
    $(this).select();
  });

  handlers.updatePermissions();

  window.onpopstate = function(event) {
    if (event.state != undefined && event.state.watpage != undefined) handlers.changeURL(event.state.watpage, true);
  };

  handlers.setupRoutes();
  handlers.changeURL(window.location.pathname, true);
  $window.bind("mousedown", handlers.mouseDown);
  $window.resize();
});
