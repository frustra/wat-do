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

  $('#topbar .info').click(function(e) {
    e.preventDefault();
  });

  $('.overlay-inner').click(function(e) {
    var save = $(window).scrollLeft();
    window.location.hash = '';
    $(window).scrollLeft(save);
  });

  $('.editable').keydown(function(e) {
    if (e.which == 27) { // Escape
      // TODO - Reset data in field
      e.target.blur();
      e.preventDefault();
    } else if (e.which == 13) { // Return
      e.target.blur();
      e.preventDefault();
    }
  });

  timelineInit();
  $(window).bind("mousedown", mouseDown);
});

function mouseDown(e) {
  if (e.clientY > 52) {
    gtl.mouse = [e.screenX, e.screenY];
    gtl.mousestart = gtl.mouse;
    $(window).bind("mousemove", mouseMove).bind("mouseup", mouseUp);
    e.preventDefault();
  }
}

function mouseMove(e) {
  $(window).scrollLeft($(window).scrollLeft() + gtl.mouse[0] - e.screenX);
  $(window).scrollTop($(window).scrollTop() + gtl.mouse[1] - e.screenY);
  gtl.mouse = [e.screenX, e.screenY];
  e.preventDefault();
}

function mouseUp(e) {
  $(window).scrollLeft($(window).scrollLeft() + gtl.mouse[0] - e.screenX);
  $(window).scrollTop($(window).scrollTop() + gtl.mouse[1] - e.screenY);
  gtl.mouse = [e.screenX, e.screenY];
  e.preventDefault();
  $(window).unbind("mousemove", mouseMove).unbind("mouseup", mouseUp);
}

var watdo = angular.module('watdo', []);
watdo.config(function($routeProvider) {
  $routeProvider
    .when('/item/:id', { action: 'item.show' });
});

watdo.controller('TimelineCtrl', function TimelineCtrl($rootScope, $http, $location) {
  $http({
    method: 'GET',
    url: '/items.json'
  }).success(function(data) {
    $rootScope.data = data;
    timelineUpdate($rootScope.data);
  });
});

watdo.controller('ItemCtrl', function ItemCtrl($scope, $rootScope, $route, $routeParams, $http) {
  render = function() {
    var id = $routeParams.id;
    if (typeof id !== 'undefined' && typeof $route.current !== 'undefined') {
      if (id == 'new') {
        // new item
        $scope.saveItem = function() {
          var item = $scope.item;
          $http({
            method: 'POST',
            url: '/item/new.json',
            data: item
          }).success(function(data) {
            $scope.item = data;
            $rootScope.data.push(data);
            timelineUpdate($rootScope.data);
            var save = $(window).scrollLeft();
            window.location.hash = '';
            $(window).scrollLeft(save);
          });
        };

        $scope.item = { name: '', desc: '' };
        $(window).unbind("mousedown", mouseDown);
        $('#item').show();
      } else if (id != '') {
        // existing item
        $scope.saveItem = function() {
          var item = $scope.item;
          $http({
            method: 'POST',
            url: '/item/' + item._id + '.json',
            data: item
          }).success(function(data) {
            $scope.item = data;
            for (var i = 0; i < $rootScope.data.length; i++) {
              if ($rootScope.data[i]._id == data._id) {
                $rootScope.data[i] = data;
              }
            }
            timelineUpdate($rootScope.data);
            var save = $(window).scrollLeft();
            window.location.hash = '';//#/item/' + data._id;
            $(window).scrollLeft(save);
          });
        };

        $http({
          method: 'GET',
          url: '/item/' + id + '.json'
        }).success(function(data) {
          $scope.item = data;
          $(window).unbind("mousedown", mouseDown);
          $('#item').show();
        });
      }
    } else {
      $('#item').hide();
      $(window).bind("mousedown", mouseDown);
    }
  };
  $scope.$on('$routeChangeSuccess', function($currentRoute, $previousRoute) {
    render();
  });
});
