/**
 * Main initialization of AngularJS
 * Added a dependency for rzModule (scroll widget)
 */
var module = angular.module("shipping-visualizer", ["rzModule"]); 


/**
 * Turn off debug
 */
module.config(["$compileProvider", function($compileProvider) {
    $compileProvider.debugInfoEnabled(false);
}]);