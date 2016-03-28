var module = angular.module("shipping-visualizer");

/**
 * This is the main controller for the application. It has all the extra wiring to make the whole thing work
 * 
 */
module.controller("MainAppController", ["$scope", "$http", function($scope, $http) {
	
	/**
	 * A URL to the Partition service.
	 */
	//$scope.partitionServiceUrl = "http://localhost:8081/partitioner/webapi/partition";
	$scope.partitionServiceUrl = "http://partitionservice.us-east-1.elasticbeanstalk.com/webapi/partition";
	
	
	/**
	 * Sets up the sorting algorithms and the algo name
	 */
	$scope.sortingAlgos = {
			"One To One" : "oneToOne",
			"Greedy" : "greedy",
			"Random" : "random",
			"Sorted Greedy": "sortedGreedy",
			"Reverse Sorted Greedy": "reverseSortedGreedy"
	};
	
	/**
	 * Keeps track of the warehouse and its selected algo
	 */
	$scope.warehouseIdToAlgo = new Array();
	
	/**
	 * Keeps track of the warehouse and its packages should breakdown
	 */
	$scope.warehouseIdToBreakdown = new Array();
	
	/**
	 * Slider defaults for the max load of the truck
	 */
	$scope.truckMaxCapacitySlider = {
			value: 2000,
			options: {
				floor: 1,
				ceil: 10000,
				showSelectionBar: true,
				 translate: function(value) {
				      return value + " lbs.";
				    }
			}
	};
	
	/**
	 * Slider defaults for the package generator slider
	 */
	$scope.packageGeneratorSlider = {
			value: 10,
			options: {
				floor: 1,
				ceil: 20,
				showSelectionBar: true
			}
	};
	
	/**
	 * Multiple different vehicles for different max loads
	 */
	$scope.truckImages = ["images/mini.jpg",
	                      "images/pickup-truck.jpg",
	                      "images/box-truck.jpg",
	                      "images/tractor-trailer.png"
	                      ];
	
	/**
	 * The truck image to use for the application
	 */
	$scope.truckImageUrl = $scope.truckImages[1];
	
	/**
	 * Call back when a users lets go of the slider to set the picture appropriately
	 */
	$scope.$on("slideEnded", function() {
		
		var weight = $scope.truckMaxCapacitySlider.value;
		
		if(weight < 1000)
			$scope.truckImageUrl = $scope.truckImages[0];
		else if(weight <= 2000)
			$scope.truckImageUrl = $scope.truckImages[1];
		else if(weight <= 5000)
			$scope.truckImageUrl = $scope.truckImages[2];
		else if(weight <= 10000)
			$scope.truckImageUrl = $scope.truckImages[3];
		
		$scope.clearTrucks();
		$scope.$apply();	//call apply to let the variables get updated
	});
	
	/**
	 * All the packages that are available for this simulation.
	 * This is what is used in the warehouse
	 */
	$scope.packages = new Array();
	
	
	
	/**
	 * Adds a package to the list of packages. Can also add multiple packages at the same time
	 * @param weight the weight of a package
	 * @param numberOfPackages the number of packages you should add
	 * @param randomize if true will randomize and use the weight as a max
	 */
	$scope.addPackages = function(weight, numberOfPackages, randomize)
	{
		//no point adding a weight if its invalid
		if(!weight || weight <= 0)
			return;
		
		//defensively add a package if number of packages are incorrect
		if(!numberOfPackages || numberOfPackages < 0)
			numberOfPackages = 1;
		
		var modifiedWeight = weight;
		
		for(var i = 0; i < numberOfPackages; i++)
		{
			if(randomize == true)
				modifiedWeight = Math.floor((Math.random() * weight) + 1);
				
			$scope.packages.push(modifiedWeight);
		}
	}
	
	/**
	 * Convenience method for checking if the package is too heavy
	 * @returns true if its too heavy. falst if it is not
	 */
	$scope.isPackagesTooHeavy = function()
	{
		for(var i = 0; i < $scope.packages.length; i++)
		{
			if($scope.packages[i] > $scope.truckMaxCapacitySlider.value)
				return true;
		}
		
		return false;
	}
	
	/**
	 * Calls the partition service and breaks down the packages based on the algorithms that is selected
	 */
	$scope.loadPackages = function()
	{
		if($scope.isPackagesTooHeavy())
		{
			window.alert("At least one package is too heavy for the truck you have selected.");
			return;
		}
			
		var packagesString = $scope.getPackagesString();
		
		for(var i = 0; i < $scope.warehouseIdToAlgo.length; i++)
		{
			var warehouseAlgo = $scope.warehouseIdToAlgo[i];	//get the algo friendly name
			var algo = $scope.sortingAlgos[warehouseAlgo];	//look up the actual algo key
			
			//closure to keep track of the i
			(function(index){
				$http({
					method: 'GET',
					url: $scope.partitionServiceUrl,
					headers: {
						values : packagesString,
						maxSum	:  $scope.truckMaxCapacitySlider.value,
						algo : algo
					}
					}).then(function successCallback(response){
						//just assign the data
						$scope.warehouseIdToBreakdown[index] = response.data;
					}, function errorCallback(response){
						//simple popup saying that something went wrong
						window.alert("Unable to process your request. Please try again later");
					});
			})(i);
		}
		
		//collapse the settings so the user can see better the docks
		$('#configurationBody').collapse('hide');
			
	};
	
	/**
	 * Put the string into the comma separate format that is expected with the partition service
	 */
	$scope.getPackagesString = function()
	{
		var packagesString = "";
		
		for(var i = 0; i < $scope.packages.length; i++)
		{
			packagesString += $scope.packages[i];
			
			//append all but the last comma to the packages
			if(i != $scope.packages.length - 1)
				packagesString += ",";
		}
		
		return packagesString;
	};
	
	/**
	 * Calculates the sum given an array of values
	 */
	$scope.calculateSum = function(values)
	{
		if(!values || !values.length)
			return 0;
		
		var sum = 0;
		for(var i = 0; i < values.length; i++)
			sum += values[i];
		
		return sum;
	};
	
	/**
	 * Clears all the trucks from having any info
	 */
	$scope.clearTrucks = function()
	{
		$scope.warehouseIdToBreakdown = new Array();
	};
	
	/**
	 * Clears all the packages from the warehouse
	 */
	$scope.clearWarehouse = function()
	{
		$scope.packages = new Array();
		$scope.clearTrucks();
	};
	
	/**
	 * Convenience method that determines if a package is heavy or not so that it can be
	 * colored easily 
	 */
	$scope.getPackageClassification = function(packageWeight)
	{
		if(!packageWeight || packageWeight <= 0)
			return "";	//unknown
		
		var percentage = 100 * packageWeight / $scope.truckMaxCapacitySlider.value;
		
		if(percentage > 100)
			return "too-heavy";
		else if(percentage >= 40)
			return "very-heavy";
		else if(percentage >= 30)
			return "heavy";
		else if(percentage >= 20)
			return "normal";
		else if(percentage >= 10)
			return "light";
		else
			return "very-light";
	};
	
	/**
	 * Sets the algo for the selected warehouse.
	 */
	$scope.updateAlgo = function(id, selectedAlgo)
	{		
		$scope.warehouseIdToAlgo[id] = selectedAlgo;
		$scope.clearTrucks();
	};	
	
	/**
	 * Calculates the total percentage that is filled
	 */
	$scope.getPercentFilled = function(id)
	{
		var totalWeight = $scope.calculateSum($scope.packages);
		var trucks = ($scope.warehouseIdToBreakdown[id]) ? $scope.warehouseIdToBreakdown[id].length : 0;
		var availableCapacity = $scope.truckMaxCapacitySlider.value * trucks;
		return 100 * totalWeight / availableCapacity;
	}
	
	/**
	 * Gets the total wasted space for a particular id
	 */
	$scope.getWastedSpace = function(id)
	{
		var totalWeight = $scope.calculateSum($scope.packages);
		var trucks = ($scope.warehouseIdToBreakdown[id]) ? $scope.warehouseIdToBreakdown[id].length : 0;
		var availableCapacity = $scope.truckMaxCapacitySlider.value * trucks;
		return availableCapacity - totalWeight;
	}
	
}]);