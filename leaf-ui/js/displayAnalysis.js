/**
 * This file contains functions that help display the analysis
 * that the web application would receive from the back end.
 */

/**
 * Displays the analysis to the web app, by displaying the slider and the 
 * history log
 *
 * @param {Object} analysisResults
 *   Object which contains data gotten from back end 
 */
function displayAnalysis(analysisResults){

	// Change the format of the analysis result from the back end
	var currentAnalysis = new analysisObject.initFromBackEnd(analysisResults);
	currentAnalysis.type = "Single Path";

	// Save data for get possible next states
	savedAnalysisData.finalAssignedEpoch = analysisResults.finalAssignedEpoch;
	savedAnalysisData.finalValueTimePoints = analysisResults.finalValueTimePoints;

	// Check if slider has already been initialized
	if (sliderObject.sliderElement.hasOwnProperty('noUiSlider')) {
		sliderObject.sliderElement.noUiSlider.destroy();
	}

	// This might be unnecessary 
	// ElementList = analysisResults.elementList;

	// Update history log
	updateHistory(currentAnalysis);

	createSlider(currentAnalysis, false);
}

/**
 * Creates a slider and displays it in the web app
 *
 * @param {Object} currentAnalysis
 *   Contains data about the analysis that the back end performed
 * @param {number} currentValueLimit
 * @param {Boolean} isSwitch
 *   True if the slider is being created when we are switching analysis's
 *   with the history log, false otherwise
 */
function createSlider(currentAnalysis, isSwitch) {

	var sliderMax = currentAnalysis.timeScale;
	var density = (sliderMax < 25) ? (100 / sliderMax) : 4;
	
	noUiSlider.create(sliderObject.sliderElement, {
		start: 0,
		step: 1,
		behaviour: 'tap',
		connect: 'lower',
		direction: 'ltr',
		range: {
			'min': 0,
			'max': sliderMax
		},
		pips: {
			mode: 'values',
			values: [],
			density: density
		}
	});

	// Set initial value of the slider
	sliderObject.sliderElement.noUiSlider.set(isSwitch ? 0 : sliderMax);

	sliderObject.sliderElement.noUiSlider.on('update', function( values, handle ) {
		updateSliderValues(parseInt(values[handle]), currentAnalysis);
	});

	adjustSliderWidth(sliderMax);
}

/*
 * Creates and displays new slider after the user clicks a different
 * analysis from the history log. This function is called when 
 * the user clicks a different analysis from the history log.
 *
 * @param {Object} currentAnalysis
 *   Contains data about the analysis that the back end performed
 * @param {Number} historyIndex
 *   A valid index for the array historyObject.allHistory, indicating 
 *   which analysis/history log that the user clicked on
 */
function switchHistory(currentAnalysis) {

	sliderObject.sliderElement.noUiSlider.destroy();
	createSlider(currentAnalysis, true);
}


/**
 * Adjusts the width of the slider depending on the width of the paper
 *
 * @param {Number} maxValue
 *   The maximum value for the current slider
 */
function adjustSliderWidth(maxValue){
	// Min width of slider is 15% of paper's width
	var min = $('#paper').width() * 0.1;
	// Max width of slider is 90% of paper's width
	var max = $('#paper').width() * 0.8;
	// This is the width based on maxvalue
	var new_width = $('#paper').width() * maxValue / 100;
	// new_width is too small or too large, adjust
	if (new_width < min){
		new_width = min;
	}
	if (new_width > max){
		new_width = max;
	}
	$('#slider').width(new_width);


}

/**
 * Updates the slider values at the bottom left hand side of the paper,
 * to represent the current slider's position.
 *
 * @param {Number} sliderValue
 *   Current value of the slider
 * @param {Number} currentValueLimit
 * @param {Object} currentAnalysis
 *   Contains data about the analysis that the back end performed
 */
function updateSliderValues(sliderValue, currentAnalysis){

	var value = sliderValue;
	$('#sliderValue').text(value);
	sliderObject.sliderValueElement.innerHTML = value + "|" + currentAnalysis.relativeTime[value];

	for (var i = 0; i < currentAnalysis.numOfElements; i++) {
		updateNodeValues(i, currentAnalysis.elements[i].status[value], "renderAnalysis");
	}
}


/**
 * Updates the satisfaction value of a particular node in the graph.
 *
 * @param {Number} elementIndex
 *   The index of the node of interest in the array graph.getElements
 * @param {String} satValue
 *   Satisfaction value in string form. ie: '0011' for satisfied
 * @param {String} mode
 *   Determines how to updates node values.
 *   mode is either 'renderAnalysis' or 'toInitModel'
 */
function updateNodeValues(elementIndex, satValue, mode) {
	var cell = graph.allElements[elementIndex];
	var value;

	// Update node based on values from cgi file
	if (mode == "renderAnalysis") {
		value = satValue;

	// Update node based on values saved from graph prior to analysis
	} else if (mode == "toInitModel") {
		value = satValueDict[cell.attributes.attrs[".satvalue"].value];
	}

	if (value in satisfacationValuesDict) {
        cell.attr(".satvalue/text", satisfacationValuesDict[value].satValue);
        cell.attr({text: {fill: satisfacationValuesDict[value].color}});
    }
    else {
		cell.removeAttr(".satvalue/d");
	}
}


/**
 * Display history log
 *
 */
$('#history').on("click", ".log-elements", function(e){
	var txt = $(e.target).text();
	var step = parseInt(txt.split(":")[0].split(" ")[1]);
	var log = historyObject.allHistory[step - 1];
	var currentAnalysis = log.analysis;

	switchHistory(currentAnalysis);

	$(".log-elements:nth-of-type(" + historyObject.currentStep.toString() +")").css("background-color", "");
	$(e.target).css("background-color", "#E8E8E8");

	historyObject.currentStep = step;
});


/**
 * Clears the history log on the web application, and clears 
 * historyObject to its inital state
 */
function clearHistoryLog(){

	$('.log-elements').remove();

	if (sliderObject.sliderElement.noUiSlider) {
		sliderObject.sliderElement.noUiSlider.destroy();
	}

	sliderObject.pastAnalysisValues = [];

	historyObject.allHistory = [];
	historyObject.currentStep = null;
	historyObject.nextStep = 1;
}


/**
 * Updates history log in order to display the new analysis,
 * and updates the historyObject to store information about 
 * the new analysis.
 *
 * @param {Object} currentAnalysis
 *   Contains data about the analysis that the back end performed
 * @param {Number} currentValueLimit
 */
function updateHistory(currentAnalysis){
	var logMessage = "Step " + historyObject.nextStep.toString() + ": " + currentAnalysis.type;
	logMessage = logMessage.replace("<", "&lt");

	if ($(".log-elements")) {
		$(".log-elements").last().css("background-color", "");
	}

	$("#history").append("<a class='log-elements' style='background-color:#E8E8E8''>" + logMessage + "</a>");

	historyObject.currentStep = historyObject.nextStep;
	historyObject.nextStep++;

	if (historyObject.allHistory.length == 0) {
		var log = new logObject(currentAnalysis, 0);
	} else {
		var l = historyObject.allHistory.length - 1;
		// historyObject.allHistory[l].sliderEnd = currentValueLimit;
		// historyObject.allHistory[l].analysisLength = currentValueLimit - historyObject.allHistory[l].sliderBegin;
		var log = new logObject(currentAnalysis, 0);
	}

	historyObject.allHistory.push(log);
}
