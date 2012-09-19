$(function() {
  var $document = $(document)
    , addedScroll = false;

  $document.scroll(function(e) {
    if ($document.scrollTop() > 4) {
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
    history.go(-1);
  });
});

var watdo = angular.module('watdo', []);
watdo.config(function($routeProvider) {
  $routeProvider
    .when('/item/:id', { action: 'item.show' });
});

watdo.controller('TimelineCtrl', function TimelineCtrl($scope, $http, $location) {
  $http({
    method: 'GET',
    url: '/items.json'
  }).success(function(data) {
    $scope.data = data;
  });
});

watdo.controller('ItemCtrl', function ItemCtrl($scope, $route, $routeParams, $http) {
  render = function() {
    var id = $routeParams.id;
    if (typeof id !== 'undefined' && typeof $route.current !== 'undefined') {
      $http({
        method: 'GET',
        url: '/item/' + id + '.json'
      }).success(function(data) {
        $scope.item = data;
        $('#item').show();
      });
    } else {
      $('#item').hide();
    }
  };
  $scope.$on('$routeChangeSuccess', function($currentRoute, $previousRoute) {
    render();
  })
});

watdo.directive('timelineVisualization', function() {
  return {
    restrict: 'C',
    scope: {
      val: '='
    },
    link: function(scope, element, attrs) {
      scope.$watch('val', function(newVal, oldVal) {
        if (!newVal) return;
        generateTimeline(element[0], newVal);
      });
    }
  };
});

//watdo