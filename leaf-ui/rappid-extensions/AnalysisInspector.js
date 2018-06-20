var epochLists = [];
var num = 0;
var goalIdMapper = {};
var constraintID = 0;
var rx = /Goal_\d+/g; // MATCH goal name Goal_x
var extractEB = /[A-Z]+$/;
var saveIntermValues = {};
var gloablI = 0;
var absoluteTimeValues;
var saveIVT;
var AnalysisInspector = Backbone.View.extend({

	className: 'analysis-inspector',
	template: [
		'<h2 style="text-align:center; width:100%;margin-top:6px;margin-bottom:0px">Analysis</h2>',
		'<hr>',
		'<h3> Simulation Start: 0 </h3>',
		'<label class="sub-label">Max Absolute Time</label>',
		'<input id="max-abs-time" class="sub-label" type="number" min="1" step="1" value="100"/>',
		'<br>',
		'<label class="sub-label">Conflict Prevention Level</label>',
		'<select id="conflict-level" class="sub-label" style="height:30px;">',
			'<option value=S selected> Strong</option>',
	        '<option value=M> Medium</option>',
	        '<option value=W> Weak</option>',
	        '<option value=N> None</option>',
		'</select>',
		'<br>',
		'<label class="sub-label">Num Relative Time Points</label>',
		'<input id="num-rel-time" class="sub-label" type="number" min="0" max="20" step="1" value="1"/>',
		'<br>',
		'<label class="sub-label">Absolute Time Points</label>',
		'<font size="2">(e.g. 5 8 22)</font>',
		'<input id="abs-time-pts" class="sub-label" type="text"/>',
		'<br>',
		'<hr>',
		'<button id="btn-view-assignment" class="analysis-btns inspector-btn sub-label green-btn">View List of Assignments</button>',
		'<button id="btn-view-intermediate" class="analysis-btns inspector-btn sub-label green-btn">View Intermediate Values</button>',

		// This is the modal box of assignments
		'<div id="myModal" class="modal">',
		  '<div class="modal-content">',
		    '<div class="modal-header">',
		      '<span class="close">&times;</span>',
		      '<h2>Absolute and Relative Assignments</h2>',
		    '</div>',
		    '<div class="modal-body">',
		      '<h3 style="text-align:left; color:#1E85F7; margin-bottom:5px;">Absolute Intention Assignments</h3>',
		      	'<table id="node-list" class="abs-table">',
		      	  '<tr>',
		      	    '<th>Epoch Boundary Name</th>',
		      	    '<th>Function</th>',
		      	    '<th>Assigned Time</th>',
		      	    '<th>Action</th>',
		      	  '</tr>',
		      	'</table>',
					'<div class=absRelationship>',
						'<h3 style="text-align:left; color:#1E85F7; margin-bottom:5px;">Absolute Relationship Assignment</h3>',
							'<table id="link-list" class="abs-table">',
								'<tr>',
									'<th>Link Type</th>',
									'<th>Source Node name</th>',
									'<th>Dest Node name</th>',
									'<th>Assigned Time</th>',
									'<th>Action</th>',
								'</tr>',
							'</table>',
					'</div>',
					'<div class=relIntetion>',
						'<div class=headings>',
							'<h3 style="text-align:left; color:#1E85F7; margin-bottom:5px;">Relative Intention Assignments',
								'<div class="addIntetion" style="display:inline">',
										'<i class="fa fa-plus" id="addIntent" style="font-size:30px; float:right; margin-right:20px;"></i>',
								'</div>',
							'</h3>',
						'</div>',
						'<div>',
								'<table id="rel-intention-assignents" class="rel-intent-table">',
								 '<tr>',
								 	'<th>Epoch Boundary Name 1</th>',
									'<th>Relationship</th>',
									'<th>Epcoch Boundary Name 2</th>',
									'<th></th>',
								 '</tr>',
								 '</table>',
						'</div>',
		    '</div>',
			'<div class="modal-footer" style="margin-top: 10px;">',
				'<button id="btn-save-assignment" class="analysis-btns inspector-btn sub-label green-btn" style="border-radius:40px;">Save</button>',
			'</div>',
		'</div>',
		'</div>',
		'</div>',
		'<div id="intermediateTable" class="intermT">',
			'<div class="intermContent">',
				'<div class="intermHeader">',
					'<span class="closeIntermT">&times;</span>',
					'<h2>Intermediate Values Table</h2>',
				'</div>',
				'<div class="intermBody">',
						'<table id="interm-list" class="interm-table">',
							'<thead id = "header">',
								'<th style="width:110px">   		 </th>',
								'<th>  Initial Value  </th>',
							'</thead>',
							'<tr id="intentionRows">',
							'<th>',
									'<div class="divisionLine"></div>',
									'<div class="intentionPlace"><b>Intention</b></div>',
									'<div class="timePlace"><b>Timeline</b></div>',
									'<div class="outerdivslant borderdraw2">',
									'</div>',
									'<div class = "innerdivslant borderdraw2">',
									'</div>',
								'</th>',
								'<th>0</th>',
							'</tr>',
					'</table>',
					'<button id="btn-save-intermT" class="analysis-btns inspector-btn sub-label green-btn" style="border-radius:40px;">Save</button>',
				'</div>',
			'</div>',
		'</div>',
		'<br>',
		'<hr>',
		'<button id="btn-single-path" class="analysis-btns inspector-btn sub-label green-btn">Simulate Single Path</button>',
		//'<button id="btn-single-path" class="analysis-btns inspector-btn sub-label green-btn">1. Simulate Single Path</button>',
		'<button id="btn-all-next-state" class="analysis-btns inspector-btn sub-label ice-btn">Explore Possible Next States</button>'
	].join(''),

	events: {
		'click #btn-view-assignment': 'loadModalBox',
		'click #btn-view-intermediate': 'loadIntermediateValues',
		'click .close': 'dismissModalBox',
		'click .closeIntermT':'dismissIntermTable',
		'click .unassign-btn': 'unassignValue',
		'click #btn-save-assignment': 'saveAssignment',
		'click #btn-single-path': 'singlePath',
		'click #btn-all-next-state': 'getAllNextStates',
		'click .addIntetion' : 'addnewIntention',
		'click #btn-save-intermT' : 'saveIntermTable',
	},

	render: function() {
		// These functions are used to communicate between analysisInspector and Main.js
		this.$el.html(_.template(this.template)());
		$('head').append('<script src="./scripts/js-objects/analysis.js"></script>');
	},

	/**
	 * Retrieves information about the current model and sends to the backend
	 * to do single path analysis.
	 *
	 * This function is called on click for #btn-single-path
	 */
	singlePath: function() {
		//Create the object and fill the JSON file to be sent to backend.
		//Get the AnalysisInspector view information
		var analysis = new InputAnalysis();
		//Set the type of analysis
		analysis.action = "singlePath";
		//Prepare and send data to backend
		this.sendToBackend(analysis);
	},

	/**
	 * Retrieves information about the current model and sends to the backend
	 * to get all next possible states.
	 *
	 * This function is called on click for #btn-all-next-state
	 */
	getAllNextStates: function() {
		//Create the object and fill the JSON file to be sent to backend.
		//Get the AnalysisInspector view information
		var analysis = new InputAnalysis();
		//Set the type of analysis
		analysis.action = "allNextStates";
		//Prepare and send data to backend
		this.sendToBackend(analysis);

	},

	/**
	 * Creates an object to send to the backend and calls
	 * a backendComm() to send to backend
	 *  
	 * @param {Object} analysis
	 *   InputAnalysis() object
	 */
	sendToBackend: function(analysis){
		var js_object = {};
		js_object.analysis = getAnalysisValues(analysis);
		//Get the Graph Model
		js_object.model = getFrontendModel(false);

		this.saveElementsInGlobalVariable();

		if(js_object.model == null){
			return null;
		}

		//Send data to backend
		backendComm(js_object);
	},

	/**
	 * Removes all html for this inspector
	 */
	clear: function(e){
		this.$el.html('');
	},
	/********************** Modal box related ****************************/

	/**
     * Displays the absolute and relative assignments modal for the user.
     *
     * This function is called on click for #btn-view-assignment.
	 */
	loadModalBox: function(event) {
		epochLists = [];
		graph.constraintValues = [];
		var modal = document.getElementById('myModal');

		// Clear all previous table entries
		$(".abs-table").find("tr:gt(0)").remove();

		var btn_html = '<td><button class="unassign-btn" > Unassign </button></td>';
		
		// Display the modal by setting it to block display
		modal.style.display = "block";


		// Get a list of nodes
		// Populate non UD element only
		var elements = graph.getElements();
		var links = graph.getLinks();
		var outputList = "\n";
		for (var i = 0; i < elements.length; i ++){
			var cellView = elements[i].findView(paper);
			var cell = cellView.model;
			if (cell.attributes.type !== "basic.Actor") {

				var func = cell.attr('.funcvalue').text;

				// strips all return and newline characters; ensures no double-white space; strips leading/trailing whitespace
				var name = cell.attr('.name').text.replace(/(\n+|\r+|\s\s+)/gm," ").replace(/(^\s|\s$)/gm,'');

				goalIdMapper[name] = cell.attributes.elementid;
				var assigned_time = cell.attr('.assigned_time');

				if (func != 'UD' && func != 'D' && func != 'I' && func != 'C' && func != 'R' && func != "" && func != 'NB') {
					// If no assigned_time in the node, make the default value blank
					if (!assigned_time) {
						cell.attr('.assigned_time', {0: ''});
					}

					assigned_time = cell.attr('.assigned_time')[0];

					//TODO: Figure out how to only add these values if they don't exist.
					epochLists.push(name + ': A');
					outputList += name.replace(/(\r\n|\n|\r)/gm," ");
					outputList += ': A' + '\t' + func + "\n";
					$('#node-list').append('<tr><td>' + name + ': A' + '</td><td>' + func + '</td>' +
						'<td><input type="text" name="sth" value="' + assigned_time + '"></td>' + btn_html +
						'<input type="hidden" name="id" value="' + cell.id + '"> </td> </tr>');
				}
			}
		}
		// Populate UD element
		for (var i = 0; i < elements.length; i ++){
			var cellView = elements[i].findView(paper);
			var cell = cellView.model;
			if(cell.attributes.type !== "basic.Actor"){

				var func = cell.attr('.funcvalue').text;
				var name = cell.attr('.name').text;
				var assigned_time = cell.attr('.assigned_time');

				if(func == 'UD'){
					var fun_len = cell.attr('.constraints').function.length - 1;
					var current_something = 'A';
					// If no assigned_time in the node, save blank into the node
					if (!assigned_time){
						cell.attr('.assigned_time', {0: ''});
						assigned_time = cell.attr('.assigned_time');
					}
					// If the length of assigned_time does not equal to the fun_len, add none until they are equal
					var k = 0;
					while (Object.keys(assigned_time).length < fun_len){
						cell.attr('.assigned_time')[k] = '';
						assigned_time = cell.attr('.assigned_time');
						k ++;
					}
					for (var j = 0; j < fun_len; j++){

						epochLists.push(name + ': ' + current_something);
						outputList += name.replace(/(\r\n|\n|\r)/gm," ");
						outputList += ': ' + current_something + '\t' + func + "\n";
						$('#node-list').append('<tr><td>' + name +': '+ current_something + '</td><td>' + func + '</td>'  +
							'<td><input type="text" name="sth" value=' +assigned_time[j] + '></td>' + btn_html +
							'<input type="hidden" name="id" value="' + cell.id + '_' + j + '"> </td> </tr>');
						current_something = String.fromCharCode(current_something.charCodeAt(0) + 1);
					}

				}
			}
		}

		// Get a list of links
		for (var i = 0; i < links.length; i ++){
			var link = links[i];
			var source = null;
			var target = null;
			if (link.get("source").id){
				source = graph.getCell(link.get("source").id);
			}
			if (link.get("target").id){
				target = graph.getCell(link.get("target").id);
			}
			if (source && target){
				var source_name = source.attr('.name').text;
				var target_name = target.attr('.name').text;
				var assigned_time = link.attr('.assigned_time');
				var link_type = link.get('labels')[0].attrs.text.text;
				// If no assigned_time in the link, save 'None' into the link
				if (!assigned_time){
					link.attr('.assigned_time', {0: ''});
					assigned_time = link.attr('.assigned_time');
				}
				if (link_type == 'NBD' || link_type == 'NBT' || link_type.indexOf('|') > -1){
					$('#link-list').append('<tr><td>' + link_type + '</td><td>' + source_name + '</td><td>' + target_name +
						'</td><td><input type="text" name="sth" value=' +assigned_time[0] + '></td>' + btn_html +
						'<input type="hidden" name="id" value="' + link.id + '"> </td> </tr>'+ '</tr>');
				}
			}

		}
		num+=1;

	},
	/*load valus for intermediate table dialog*/
	/**
	 * Displays the intermediate values table modal for the user
	 *
	 * This function is called on click for #btn-view-intermediate
	 */
	loadIntermediateValues: function(e){
		var time_values = {};
		$('#interm-list').find("tr:gt(1)").remove();
		$('#header').find("th:gt(1)").remove();
		$('#intentionRows').find("th:gt(1)").remove();
		var intermTDialog = document.getElementById('intermediateTable');
		intermTDialog.style.display = "block";
		var elements = graph.getElements();
		var intermTable = document.querySelector('.interm-table');
		var absValues = document.getElementById('abs-time-pts').value;
		var absTimeValues;
		if(absValues != ""){
			absTimeValues = absValues.split(" ")
			.map(function(i){
				// Parse absValues into numbers
				if(i!=""){
					return parseInt(i, 10);
				}
			});
			// Sort absTimeValues into acending order
			absTimeValues.sort(function(a, b){return a-b});
			var headers = document.getElementById('header');
			var rows = headers.querySelector('tr');
			var intentRows = document.getElementById('intentionRows')
			for(var i = 0; i < absTimeValues.length; i++){
				if(!(absTimeValues[i] in time_values)){
					time_values[absTimeValues[i]] = [];
					time_values[absTimeValues[i]].push("Absolute");
				}
			}
		}
		else{
			absTimeValues = [];
		}
		absoluteTimeValues = absTimeValues;
		Object.keys(time_values).forEach(function(key){
			var th = document.createElement('th');
			var thint = document.createElement('th');
            // Displaying each absolute time value into the table 
			if (time_values[key].length == 1){
				th.innerHTML = time_values[key][0];
				thint.innerHTML = key;
				rows.appendChild(th);
				intentRows.appendChild(thint);
			}
		})

        // Make option select tags
		var sat_values = '<select id="evalID"><option value="empty;" selected> </option>';
		var sat_valueLists = ['Unknown','None (T, T) ', 'Satisfied (FS, T) ','Partially Satisfied (PS, T) ',
		'Denied (T, FD) ', 'Partially Denied (T, PD)'];
		var eval_list = ['unknown', 'none','satisfied','partiallysatisfied', 'denied','partiallydenied'];
		for(var i = 0; i < sat_valueLists.length; i++){
			var value = '<option value="' + eval_list[i] + '">'+ sat_valueLists[i] + '</option>';
			sat_values += value
		}
		sat_values += '</select>';
		for (var i = 0; i < elements.length; i++){
			var cellView = elements[i].findView(paper);
			var cell = cellView.model;
			if(cell.attributes.type !== "basic.Actor"){
				var initvalue = cell.attr('.satvalue').text;
				var name = cell.attr('.name').text.replace(/(\n+|\r+|\s\s+)/gm," ").replace(/(^\s|\s$)/gm,'');

				// Check if initial value is empty, if so, add (T,T) as a value
				if($.isEmptyObject(time_values)){
					if  (initvalue.trim() == ""){
						$('#interm-list').append('<tr><td>' + name + '</td><td>(T,T)</td></tr>');
					}
					else{
						$('#interm-list').append('<tr><td>' + name + '</td><td>' + initvalue +'</td></tr>');
					}
				}
				else{
					// If no previously saved table, display options for each time value
					if  (initvalue.trim() == ""){
						var appendList = '<tr><td>' + name + '</td><td>(T,T)</td>';
						if(saveIVT == null){
							for(var j = 0; j < Object.keys(time_values).length; j++){
								appendList += '<td>' + sat_values + '</td>';
							}
						}
						else if(saveIVT.length>0){
							for(var j = 0; j < Object.keys(time_values).length; j++){
								appendList += '<td>' + $("#evalID").val('(FS, T)') + '</td>';
							}
						}
						appendList += '</tr>';
						$('#interm-list').append(appendList);
					}
					else{
						// Display previously saved table
						var appendList = '<tr><td>' + name + '</td><td>'+ initvalue +'</td>';
						var test ='';
						for(var j = 0; j < Object.keys(time_values).length; j++){
							appendList += '<td>' + sat_values + '</td>';
						}
						appendList += '</tr>';
						$('#interm-list').append(appendList);
					}
				}
			}
		}
	},
	// Dismiss modal box
	dismissModalBox: function(e){
		var modal = document.getElementById('myModal');
		modal.style.display = "none";

	},
	dismissIntermTable: function(e){
		var intermT = document.getElementById('intermediateTable');
		intermT.style.display = "none";
	},

	// Trigger when unassign button is pressed. Change the assigned time of the node/link in the same row to none
	unassignValue: function(e){
		var button = e.target;
		var row = $(button).closest('tr');
		var assigned_time = row.find('input[type=text]');
		$(assigned_time).val('');
	},
	saveRelativeValues: function(){
		var epoch1Lists = $('#rel-intention-assignents tr #epoch1List select');
		var relationshipLists = $('#rel-intention-assignents tr #relationshipLists select');
		var epoch2Lists = $('#rel-intention-assignents tr #epoch2List select');
		for(var i = 0; i < epoch1Lists.length; i++){
			if(epoch1Lists[i].value != null && epoch2Lists[i].value != null){
				var extractGoal1full = epoch1Lists[i].value;
				var extractGoal2full = epoch2Lists[i].value;
				var extractGoal1 = extractGoal1full.substring(0, extractGoal1full.length - 3);
				var extractGoal2 = extractGoal2full.substring(0, extractGoal2full.length - 3);
				var constraintSrcID = goalIdMapper[extractGoal1];
				var constraintDestID = goalIdMapper[extractGoal2];
				var type = relationshipLists[i].value;
				debugger
				if(type == 'eq'){
					type = '=';
				}
				else if (type=='lt') {
					type = '<';
				}
				if(graph.constraintValues.length == 0){
					graph.constraintValues[0] = {};
					graph.constraintValues[0]["constraintType"] = type;
					graph.constraintValues[0]["constraintSrcID"] = constraintSrcID;
					graph.constraintValues[0]["constraintSrcEB"] = epoch1Lists[i].value.match(extractEB)[0];
					graph.constraintValues[0]["absoluteValue"] = -1;
					graph.constraintValues[0]["constraintDestID"] = constraintDestID;
					graph.constraintValues[0]["constraintDestEB"] = epoch2Lists[i].value.match(extractEB)[0];
				}
				else{
					newConstarint = {};
					newConstarint['constraintType'] = type;
					newConstarint['constraintSrcID'] = constraintSrcID;
					newConstarint['constraintSrcEB'] = epoch1Lists[i].value.match(extractEB)[0];
					newConstarint['constraintDestID'] = constraintDestID;
					newConstarint['constraintDestEB'] = epoch2Lists[i].value.match(extractEB)[0];
					newConstarint['absoluteValue'] = -1;
					graph.constraintValues.push(newConstarint);
				}
		}


		}

	},
	// Update all nodes with the updated assigned time
	// TODO: Check if the times users put in are valid
	saveAssignment: function(e){

		this.saveRelativeValues();
		var time_values = {};
		$.each($('#node-list').find("tr input[type=text]"), function(){
			var new_time = $(this).val();
			var row = $(this).closest('tr');
			var srcEB = row.find('td').html();
			var func_value = row.find('td:nth-child(2)').html();
			var id = row.find('input[type=hidden]').val();

			// If func is not UD, just find the cell and update it
			if (func_value != 'UD'){
				var cell = graph.getCell(id);
				cell.attr('.assigned_time')[0] = new_time;
				if(new_time.trim() != ""){
					if(!(new_time in time_values) ){
						time_values[new_time] = [];
						time_values[new_time].push('Absolute Intentions')
					}
					else if(!(time_values[new_time].includes('Absolute Intentions'))){
						time_values[new_time].push('Absolute Intentions');
					}
				}

			}
			// If func is UD, extract the index i from id, and update i-th assigned time of the node
			else {
				var index = id[id.length - 1];
				id = id.substring(0, id.length - 2);
				var cell = graph.getCell(id);
				cell.attr('.assigned_time')[index] = new_time;
				if(new_time.trim() != ""){
					if(!(new_time in time_values) ){
						time_values[new_time] = [];
						time_values[new_time].push('Absolute Intentions')
					}
					else if(!(time_values[new_time].includes('Absolute Intentions'))){
						time_values[new_time].push('Absolute Intentions');
					}
				}
			}
				if(graph.constraintValues.length == 0 && (new_time != null && new_time.length > 0)){
					graph.constraintValues[0] = {};
					graph.constraintValues[0]['constraintType'] = "A"; // A for absolute
					graph.constraintValues[0]['constraintSrcID'] = cell.attributes.elementid;
					graph.constraintValues[0]['constraintSrcEB'] = srcEB.match(extractEB)[0];

					graph.constraintValues[0]['absoluteValue'] = new_time;
					graph.constraintValues[0]['constraintDestID'] = null;
					graph.constraintValues[0]['constraintDestEB'] = null;
				}
				else{
					if(new_time != null && new_time.length > 0 ){
						newConstarint = {};
						newConstarint['constraintType'] = "A";
						newConstarint['constraintSrcID'] = cell.attributes.elementid;
						newConstarint['constraintSrcEB'] = srcEB.match(extractEB)[0];
						newConstarint['absoluteValue'] = new_time;
						newConstarint['constraintDestID'] = null;
						newConstarint['constraintDestEB'] = null;
						graph.constraintValues.push(newConstarint);
					}
				}


		});

		$.each($('#link-list').find("tr input[type=text]"), function(){
			var new_time = $(this).val();
			var row = $(this).closest('tr');
			var func_value = row.find('td:nth-child(2)').html();
			var id = row.find('input[type=hidden]').val();

			var links = graph.getLinks();
			for (var i = 0; i < links.length; i ++){
				if (links[i].id == id) {
					var link = links[i];
					break;
				}
			}
			if(new_time.trim() != ""){
				if(!(new_time in time_values) ){
					time_values[new_time] = [];
					time_values[new_time].push('Absolute Relationship')
				}
				else if(!(time_values[new_time].includes('Absolute Relationship'))){
					time_values[new_time].push('Absolute Relationship');
				}
			}

			link.attr('.assigned_time')[0] = new_time;

		});
		// After that dismiss the box
		var modal = document.getElementById('myModal');
		modal.style.display = "none";
		$("#epoch1List select").val();


	},
	returnElementIds: function(){
		var elements = graph.getElements();
		var elementLst = [];
		for (var i = 0; i < elements.length; i++){
			var cellView = elements[i].findView(paper);
			var cell = cellView.model;
			elementLst.push(cell.attributes.elementid);
		}
		return elementLst;
	},
	saveIntermTable: function(){
		saveIVT = getUserEvaluations();

		this.dismissIntermTable();
	},
	returnInputEval: function(){
		return saveIVT;
	},
	saveElementsInGlobalVariable: function(){
		var elements = [];
		for (var i = 0; i < graph.getElements().length; i++){
			if (!(graph.getElements()[i] instanceof joint.shapes.basic.Actor)){
				elements.push(graph.getElements()[i]);
			}
		}
		graph.allElements = elements;
		graph.elementsBeforeAnalysis = elements;
	},
	addnewIntention: function(){
		var elements = graph.getElements();


		var epoch1 = '<div class="epochLists" id="epoch1List"><select><option selected>...</option>';
		for(var i = 0; i < epochLists.length; i++){
			var newEpoch = '<option>' + epochLists[i] + '</option>';
			epoch1 += newEpoch
		}
		epoch1 += '</select></div>';
		var epoch2 =  '<div class="epochLists" id="epoch2List"><select><option selected>...</option>';
		for(var i = 0; i < epochLists.length; i++){
			var newEpoch = '<option>' + epochLists[i] + '</option>';
			epoch2 += newEpoch
		}
		epoch2 += '</select></div>';

		var relationship = '<div class="epochLists" id="relationshipLists"><select><option selected>...'+
		'</option><option value="eq">=</option><option value="lt"><</option></select></div>'

		$('#rel-intention-assignents').append('<tr><td>' + epoch1 + '</td><td>' + relationship +
		 '</td><td>'+ epoch2 +'</td><td><i class="fa fa-trash-o fa-2x" id="removeIntention" aria-hidden="true" onClick="$(this).closest(\'tr\').remove();"></i></td></tr>');


	},

});
