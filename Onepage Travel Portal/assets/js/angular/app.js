var travelApp = angular.module('travelhope',['ngSanitize','daterangepicker','ngAnimate','rzModule','ui.bootstrap']);
var baseUrl = "http://172.104.250.11:3000/";

travelApp.controller('mainController', function($scope,$timeout,$sce, $http,dataFactory) {
  $scope.showLoading = true;
  $scope.showMoreLoading = false;
  $scope.adultsCount = 1;
  $scope.childCount = 0;
  $scope.mainImg = "";
  $scope.mapUrl = "";
  $scope.showDetailsSection = false;
  $scope.loading = false;
  $scope.dateFormat = "MM/DD/YYYY";

  $scope.starsList = [{
       Id: 1
   }, {
       Id: 2
   }, {
       Id: 3
   }, {
       Id: 4
   }, {
       Id: 5
   }];

  //Get locations list
  $scope.getResults = function(val) {
   return $http.get(baseUrl+'locations/list', {
     params: {
       query: val,
       limit: 25
     }
   }).then(function(response){
     return response.data.locations;

   });
 };
//End Get locations list

//Date functionality
  $scope.datePicker = {};
  $scope.datePicker.date = {
      startDate: moment().subtract(1, "days"),
      endDate: moment()
  };

  // $scope.setRange = function () {
  //     $scope.date = {
  //         startDate: moment().subtract(5, "days"),
  //         endDate: moment()
  //     };
  // };

  //Watch for date changes
  $scope.$watch('datePicker.date', function(newDate) {
    $scope.checkin = newDate.startDate.format($scope.dateFormat);
    $scope.checkout = newDate.endDate.format($scope.dateFormat);
    console.log('New checkin date is ',   newDate.startDate.format($scope.dateFormat) );
  }, false);

  //End Date functionality

  $scope.refreshSlider = function() {
    $timeout(function() {
      $scope.$broadcast('rzSliderForceRender');
    });
  };
  // Start Price Range Slider
  $scope.minRangeSlider = {
  minValue: 10,
  maxValue: 90,
  options: {
  floor: 1,
  ceil: 100,
  step: 1
  }
  };



  // End Price Range Slider

  $http.get(baseUrl+'hotels/list').
       then(function(response) {
           $scope.showLoading = false;
           $scope.results = response.data;
       });

    $scope.selectedLoc = function(value){
    $scope.searchLocation = value.name;
    }

 $scope.search = function(){
      $scope.results = {};
      $scope.showornot=true;
     $scope.showLoading = true;
   $http.get(baseUrl+'hotels/list',{params: {city: $scope.searchLocation}}).
        then(function(response) {
            $scope.showLoading = false;
            $scope.results = response.data;
        });

 }


 $scope.searchFilter = function(){
      $scope.results = {};
     $scope.showLoading = true;
   $http.get(baseUrl+'hotels/list',{params: {city: $scope.searchLocation, ratingStars: $scope.starsList.Id,minRate: $scope.minRangeSlider.minValue,maxRate: $scope.minRangeSlider.maxValue}}).
        then(function(response) {
            $scope.showLoading = false;
            $scope.results = response.data;
        });

 }

  $scope.getMoreResults = function(){
      if($scope.results.resultsAvailable && $scope.loading == false){
         $scope.loading = true;
          $scope.showMoreLoading = true;
      $http.get(baseUrl+'hotels/list',{params: {loadMore: true, sessionID: $scope.results.sessionID,cKey: $scope.results.cKey,cLoc: $scope.results.cLoc}}).
           then(function(response) {
               $scope.showMoreLoading = false;

                var res = response.data;

                for(var i = 0; i < res.list.length; i++) {
                    $scope.results.list.push(res.list[i]);
                  }

                $scope.results.resultsAvailable = res.resultsAvailable;
                $scope.results.cKey = res.cKey;
                $scope.results.cLoc = res.cLoc;


              console.log("loaded results....");
              $scope.loading = false;
           });

      }


  };


  $scope.LoadMoreData = function(){

    if(!$scope.loading){
      console.log("loading results....");
      $scope.getMoreResults();
    }

  }


  $scope.getMap = function(latlong){
  $scope.mapUrl = $sce.trustAsResourceUrl("https://maps.google.com/maps?hl=es;z=14&output=embed&q="+latlong);
  }

  $scope.showDetails = function(id) {
      $scope.showDetailsSection = true;
      $scope.showDetailsLoading = true;
      $http.get(baseUrl+'hotel',{ params: {hotelId: id, sessionID: $scope.results.sessionID,showrooms: 'no' }}).
           then(function(response) {
             $scope.showDetailsLoading = false;
             $scope.details = response.data;
             $scope.mainImg = $scope.details.images[0].thumbnail;
             //$scope.latlong = $scope.details.latitude+","+$scope.details.longitude;
             $scope.latlong = $scope.details.title;
             $scope.getMap($scope.latlong);
              console.log(response);
           });

           //$http.get(baseUrl+'hotel/'+id+'/'+$scope.results.sessionID+'/yes').
          $http.get(baseUrl+'hotel',{ params: {hotelId: id, sessionID: $scope.results.sessionID,showrooms: 'yes' }}).
                then(function(response) {
                 $scope.roomDetails = response.data;
                 console.log(response);
                });
   };

   $scope.selectImg = function(img) {
      $scope.mainImg = img;
    };

});

travelApp.filter('cut', function () {
        return function (value, wordwise, max, tail) {
            if (!value) return '';

            max = parseInt(max, 10);
            if (!max) return value;
            if (value.length <= max) return value;

            value = value.substr(0, max);
            if (wordwise) {
                var lastspace = value.lastIndexOf(' ');
                if (lastspace !== -1) {
                if (value.charAt(lastspace-1) === '.' || value.charAt(lastspace-1) === ',') {
                    lastspace = lastspace - 1;
                  }
                  value = value.substr(0, lastspace);
                }
            }

            return value + (tail || ' …');
        };
    });

travelApp.directive("stars", function() {
    return {
        restrict : "E",
        scope: {
      total: '='
        },
        template : "<i class='star text-warning fa fa-star' ng-repeat='star in filledstars'></i><i class='star text-warning fa fa-star-o' ng-repeat='star in stars'></i>",
        link: function (scope, elem, attrs) {
          scope.$watch("total",function(newValue,oldValue) {
            scope.total = newValue;
      //   console.log("changed "+scope.total+" value");
     });



        function updateStars() {
            if(scope.total == 0){
              scope.stars = [1,2,3,4];
              scope.filledstars = [1];
            }else{
              scope.stars = [1,2,3,4,5];
              scope.filledstars = [];
            }

          for (var i = 0; i < scope.total; i++) {
            scope.stars.pop({});
            scope.filledstars.push({});
          }

      };

      scope.$watch('total', function(oldValue, newValue) {
          updateStars();
      });

      }
    };
});

travelApp.directive("whenScrolled", function(){
  return{

    restrict: 'A',
    link: function(scope, elem, attrs){

      raw = elem[0];
      elem.bind("scroll", function(){
        if(raw.scrollTop+raw.offsetHeight+10 >= raw.scrollHeight/1.2){
          scope.loading = true;
          scope.$apply(attrs.whenScrolled);

        }
      });
    }
  }
});


travelApp.factory('dataFactory', function($http) {
  return {
    get: function(url) {
      return $http.get(url).then(function(resp) {
      });
    }
  };
});
