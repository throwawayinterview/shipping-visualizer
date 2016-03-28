var module = angular.module("shipping-visualizer");

/**
 * Sets up a basic controller so that multiple warehouses can be selected without duplicating code
 */
module.controller("WarehouseController", ["$scope", function($scope) {
	
	/**
	 * Keeps track of id and selected index
	 * @param id the unique id of the warehouse
	 * @param sortingAlgos a list of the sorting algos
	 * @param algoIndex the algo index that this warehouse should default to
	 */
	$scope.init = function(id, sortingAlgos, algoIndex)
	{
		$scope.id = id;
		$scope.allAlgos = Object.keys(sortingAlgos);
		var algo = Object.keys(sortingAlgos)[algoIndex];
		
		$scope.updateAlgo(id, algo);	//call the parent scope method
	};
	
	
}]);