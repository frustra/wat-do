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

  $('.overlay').click(function(e) {
    window.location.hash = '';
  });

  timelineInit();
});

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
            data.start = parseInt(data.start);
            data.end = parseInt(data.end);
            $scope.item = data;
            for (var i = 0; i < $rootScope.data.length; i++) {
              if ($rootScope.data[i]._id == data._id) {
                $rootScope.data[i] = data;
              }
            }
            timelineUpdate($rootScope.data);
            window.location.hash = '#';
          });
        };

        $scope.item = { name: '', desc: '' };
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
            window.location.hash = '#/item/' + data._id;
          });
        };

        $http({
          method: 'GET',
          url: '/item/' + id + '.json'
        }).success(function(data) {
          $scope.item = data;
          $('#item').show();
        });
      }
    } else {
      $('#item').hide();
    }
  };
  $scope.$on('$routeChangeSuccess', function($currentRoute, $previousRoute) {
    render();
  });
});
