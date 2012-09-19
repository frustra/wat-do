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
});

var watdo = angular.module('watdo', []);

watdo.controller('TimelineCtrl', function TimelineCtrl($scope, $http) {
  $http({
    method: 'GET',
    url: '/items.json'
  }).success(function(data) {
    $scope.data = data;
  })
});

function ItemCtrl($scope) {
  $scope.item = {
    name: 'test'
  }
}

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