var module = angular.module("shipping-visualizer");

/**
 * This controls the individual dock so that they can be unique without duplicating code
 */
module.controller("DockController", ["$scope", function($scope) {
	
	/**
	 * Initializes a controller with a particular id so that it can be referenced later
	 */
	$scope.init = function(id)
	{
		$scope.id = id;
	};
	
}]);