/**
 * This file contains functions related to the syntax checking and 
 * cycle detection for the web
 */


/**
 * Alert the user if there are any cycles and mark the elements in the cycle as red
 * If there are no cycles then remove the red elements if there are any
 *
 * @param {Boolean} cycle: The constraint links in the current model.
 */
function cycleCheckForLinks(cycle) {
	var elements;
	var cellView;
		// If there is no cycle, leave the color the way it was
	if (!cycle[0]) {
		elements = graph.getElements();
		for (var i = 0; i < elements.length; i++) {
			cellView  = elements[i].findView(paper);
			cellView.model.changeToOriginalColour();
		}
	}
	else {
		swal("Cycle in the graph", "", "error");
		elements = graph.getElements();
		var color_list = initColorList();
		var cycleIndex = 0; 
		for (var k = 0 ; k < cycle[1].length; k++){
			if(cycle[1][k].length > 0) {
			console.log("cycleIndex = "+cycleIndex);
			var color = color_list[cycleIndex];
			cycleIndex += 1;
			console.log("color = "+color);
			
			console.log("k ="+k);	
			for (var l = 0 ; l< cycle[1][k].length; l++){
				console.log("l ="+l);
				for (var i = 0; i < elements.length; i++) {
				cellView  = elements[i].findView(paper);
				//if (recursiveStack[cellView.model.attributes.elementid]) 
				if (cellView.model.attributes.elementid === cycle[1][k][l] && cellView.model.attributes.type != "basic.Actor"){
					console.log("coloring "+cellView.model.attributes.elementid);
						cellView.model.attr({'.outer': {'fill': color}});
					}
					//else {
						//cellView.model.changeToOriginalColour();
					//}
				}	
			}
			
		}	
	}
	}
	
}

function initColorList() {
	var color_list = [];
	//old color scheme
	// color_list.push('#963232')
	// color_list.push('#b82f27')
	// color_list.push('#29611f')
	// color_list.push('#bf7a10')
	// color_list.push('#670000')

	// color_list.push('#E85D04');
	// color_list.push('#F48C06');
	// color_list.push('#FAA307');
	// color_list.push('#FFBA08');
	// color_list.push('#AC7242');

	color_list.push('#ccff00'); //yellow-green
	color_list.push('#09fbd3'); //green blue *
	color_list.push('#ff00c0'); //pink *
	color_list.push('#00ff00'); //green *
	color_list.push('#fffd5a'); //yellow *

	//var num = Math.round(Math.random() * 6);
	//return color_list[num];
	return color_list;
}

/**
 * Initializes and returns a 'DestSourceMapper' object which contains
 * information about links by indicating the source nodes to destination nodes
 *
 * @param {Array of joint.dia.Link} jointLinks
 * @param {Array of InputLink} inputlinks
 * @returns {Object}
 *
 * Example object:
 *
 * {linkDestID : {source: [],
 *		          constraint: [],
 *		          linkView: []
 *				 }
 * }
 *
 * linkDestID: id of a destination node for links
 * source: id of the source of the link
 * contraint: contraint types
 * linkView: linkView of the link
 * 
 * Interpretation:
 * If dest = 0, source[i] = 1, constraint[i] = AND,
 * this means that the i'th link is an AND constraint
 * link from node 1 to node 0
 * 
 */
function initializeDestSourceMapper(jointLinks, inputlinks) {
    let destSourceMapper = {};
    let linkView;
    let constraint;
    for(var j = 0; j < inputlinks.length; j++) {
        linkView  = jointLinks[j].findView(paper);

        if(!(inputlinks[j].linkDestID in destSourceMapper)) {
            // Create empty object and arrays
            destSourceMapper[inputlinks[j].linkDestID] = {};
            destSourceMapper[inputlinks[j].linkDestID]["source"] = [];
            destSourceMapper[inputlinks[j].linkDestID]["constraint"] = [];
            destSourceMapper[inputlinks[j].linkDestID]["findview"] = [];
        }

        if (inputlinks[j].postType != null) {
            constraint = inputlinks[j].linkType+"|"+inputlinks[j].postType;
        }else {
            constraint = inputlinks[j].linkType;
        }
        destSourceMapper[inputlinks[j].linkDestID]["source"].push(inputlinks[j].linkSrcID);
        destSourceMapper[inputlinks[j].linkDestID]["constraint"].push(constraint);
        destSourceMapper[inputlinks[j].linkDestID]["findview"].push(linkView);
    }
    return destSourceMapper;
}

/**
 * Returns a syntax error message.
 *
 * Prerequisite: There are links from each node with ids in sourceList
 * to the node with id destId, and there exists a syntax error for these links. 
 *
 * @param {Array of Object} naryRelationships
 *   array containing the objects that represent
 *   source nodes that participate in an n-ary relationship
 * @param {String} destId
 *   destination id
 * @returns {String}
 */
function generateSyntaxMessage(naryRelationships, destId){

	let sourceNodeText = '';
	let suggestionText = 'Have all n-ary links from ';
	var constraintsText = '';
	var constraintArr = [];

	// Determine which n-ary relationships are present
	for (var i = 0; i < naryRelationships.length; i++) {
		if (!constraintArr.includes(naryRelationships[i].constraint)) {
			constraintArr.push(naryRelationships[i].constraint);
		}
	}

	// Create a string for the n-ary relationships
	for (var i = 0; i < constraintArr.length - 1; i++) {
		constraintsText += constraintArr[i] + ' or ';
	}
	constraintsText += constraintArr[constraintArr.length - 1];

	// Create a string for the source nodes
    for (var i = 0; i < naryRelationships.length - 1; i++) {
    	sourceNodeText += getNodeName(naryRelationships[i].source);
    	if (i != naryRelationships.length -2) {
    		sourceNodeText += ', ';
    	} else {
    		sourceNodeText += ' ';
    	}
    }

    sourceNodeText += 'and ' + getNodeName(naryRelationships[naryRelationships.length - 1].source);
    suggestionText += sourceNodeText + ' to ' + getNodeName(destId) + ' as ' + constraintsText + '.';

    // As an example, suggestionText should now look something like:
    // "Have all n-ary links from Task_1, Task_2 and Task_3 to Goal_0 as AND or NO RELATIONSHIP or OR.""
    var s = '<p style="text-align:left"><b style="color:black"> Source nodes: </b>' + sourceNodeText + '<br>' +
    	'<b style="color:black"> Destination node: </b>' + getNodeName(destId) + 
    	'<br><b style="color:black"> Suggestion: </b>' + suggestionText + '<br></p>';

    return s;
}

/**
 * Returns the node name for the given element id
 *
 * @param {String} id
 * @Returns {String}
 */
function getNodeName(id){
    var listNodes = graph.getElements();
    for(var i = 0; i < listNodes.length; i++){
        var cellView  = listNodes[i].findView(paper);
        if(id == cellView.model.attributes.elementid){
            var nodeName = cellView.model.attr(".name");
            return nodeName.text;
        }
    }
}

/**
 * Returns true iff any two n-ary constraints in 
 * naryRelationships are different
 *
 * @param {Object} naryRelationships
 *   an array containing the objects that represent
 *   source nodes that participate in an n-ary relationship,
 *   (ie, AND, OR, NO RELATIONSHIP)
 * @returns {boolean} 
 */
function syntaxErrorExists(naryRelationships) {

	if (naryRelationships.length < 2) {
		return false;
	}
	for (var i = 1; i < naryRelationships.length; i++) {
		if (naryRelationships[0].constraint != naryRelationships[i].constraint) {
			return true;
		}
	}

	return false;
}

/**
 * Return an array containing the objects that represent
 * source nodes that participate in an n-ary relationship,
 * (ie, AND, OR, NO RELATIONSHIP), with the node with id destId
 *
 * Example return object:
 * [
 *     {source: 1, constraint: 'AND', findview: Object},
 *     {source: 2, constraint: 'OR', findview: Object}
 * ]
 *
 * @param {Object} destSourceMapper
 * @param {String} destId
 * @returns {Array of Object}
 */
function getNaryRelationships(destSourceMapper, destId) {
	var result = [];

	var constraints = destSourceMapper[destId].constraint;
	for (var i = 0; i < constraints.length; i++) {
		if (constraints[i] == 'AND' || 
			constraints[i] == 'OR' || 
			constraints[i] == 'NO RELATIONSHIP') {
			var obj = {
				source: destSourceMapper[destId].source[i],
				constraint: constraints[i],
				findview: destSourceMapper[destId].findview[i]
			};
			result.push(obj);
		}
	}

	return result;
}

/**
 * Changes the colour and stroke-width of all linkViews in 
 * linkViewArray
 *
 * @param {Array of joint.dia.LinkView} linkViewArray
 * @param {String} colour
 * @param {Number} strokeWidth
 */
function changeLinkColour(linkViewArray, colour, strokeWidth) {
	for (var i = 0; i < linkViewArray.length; i++) {
		linkViewArray[i].model.attr({'.connection': {'stroke': colour}});
        linkViewArray[i].model.attr({'.marker-target': {'stroke': colour}});
        linkViewArray[i].model.attr({'.connection': {'stroke-width': strokeWidth}});
        linkViewArray[i].model.attr({'.marker-target': {'stroke-width': strokeWidth}});
	}
}

/**
 * Displays error popup with title and message
 *
 * @param {String} title
 * @param {String} message
 */
function alertSyntaxError(title, message) {
	swal({
        	title: title,
            type: "warning",
            html: message,
            showCloseButton: true,
            showCancelButton: true,
            confirmButtonText: "Ok",
            cancelButtonText: "Go back to Model View",
            cancelButtonClass: "backModel"
        }).then(function() {

        }, function(dismiss) {
            if (dismiss === 'cancel') {
                $("#model-cur-btn").trigger("click");
            }
    });
}

/**
 * Performs a syntax check on the current model, by checking if each destination
 * nodes with links, have valid constraints.
 * Returns true and displays an error popup iff a syntax error exists
 *
 * @returns {boolean}
 */
function syntaxCheck() {

    // Get all links in the form of an InputLink
    var inputLinks = getLinks();

    // Get all links in the form of a joint.dia.Link
    var jointLinks = graph.getLinks();

    // Create an object that represents the constraint links and its sources and destination
    let destSourceMapper = initializeDestSourceMapper(jointLinks, inputLinks);
    let errorText = '';

    for (var destId in destSourceMapper){

    	var naryRelationships = getNaryRelationships(destSourceMapper, destId);

        // If there is a syntax error.
        if (syntaxErrorExists(naryRelationships)){

            errorText += generateSyntaxMessage(naryRelationships, destId);

            var linkViews = [];
            for (var i = 0; i < naryRelationships.length; i++) {
            	linkViews.push(naryRelationships[i].findview);
            }

            changeLinkColour(linkViews, 'red', 3);

        } else {
        	changeLinkColour(destSourceMapper[destId]['findview'], 'black', 1);
        }
    }

    if (errorText) {
    	alertSyntaxError('We found invalid link combinations', errorText);
    	return true;
    }
    return false;
}

function isACycle(cycleList) {
	return (cycleList != null);
}





function cycleSearchLinkEliminationMethod() { //this has problems lol 
	var links = getLinks();
	var vertices = getElementList();
	var isCycle = false;
	var linkMap = [];
	var notVisited = getElementList();

	links.forEach(function(element){ //create array of links: each link has it's scrID in slot 0 and destID in slot 1
		var linkNodes = [];
		linkNodes.push(element.linkSrcID);
		linkNodes.push(element.linkDestID);

		linkMap.push(linkNodes);
	});

	console.log(linkMap);
	var init = linkMap.length;

for(var k = 0, allCycleLinks = false; k < init && allCycleLinks == false; ++k) {
	var destMatch = false;
	var srcMatch = false;
	allCycleLinks = true;
	console.log("pass");

	var srcID;
	var destID

	for(var i = 0; i < linkMap.length; ++i) {
		//destMatch = false;
		srcID = linkMap[i][0];
		var isCycleNode = false;
		for(var j = 0; j < linkMap.length; ++j) {
			destID = linkMap[j][1];
			if(destID == srcID) {
				//destMatch = true;
				// allCycleLinks = false;
				// linkMap.splice(i, 1);
				isCycleNode = true;
				break;
			}
		}
		if(!isCycleNode) { //eliminate the link
			linkMap.splice(i, 1);
			allCycleLinks = false;
		}
	}

	//console.log(linkMap);

	for(var i = 0; i < linkMap.length; ++i) {
		destID = linkMap[i][1];
		//srcMatch = false;
		var isCycleNode = false;

		for(var j = 0; j < linkMap.length; ++j) {
			srcID = linkMap[j][0];
			if(destID == srcID) {
				//srcMatch = true;
				//allCycleLinks = false;
				//linkMap.splice(i, 1);
				isCycleNode = true;
				break;
			}
		}
		if(!isCycleNode) { //eliminate the link
			linkMap.splice(i, 1);
			allCycleLinks = false;
		}
	}


	//console.log(linkMap);
}

console.log(linkMap);
if(linkMap.length == 0) {
	return null;
}
// //transpose graph xxx


//distinguish cycles

var cycleNodeList = [];

	//console.log(linkMap.indexOf(currID));
	var temp = 0;
	while(linkMap.length > 0 && temp < 100) {
		var cycle = [];
		var startID = linkMap[0][0];
		console.log("startID = "+startID);
		var currID = linkMap[0][1];

		linkMap.splice(0, 1);

		cycle.push(startID);

	while(currID != startID && temp < 100) { //iterate through cycle
		cycle.push(currID);
		var prevIndex = getIndexOfSrcID(currID, linkMap);
		if(prevIndex != -1)  {
		currID = linkMap[prevIndex][1]; 
		linkMap.splice(prevIndex, 1);
		}
		else {
			console.log("something went wrong lol");
			break;
		}
		++temp;
	}

	console.log(cycle);
	cycleNodeList.push(cycle);
	++temp;
}


console.log(cycleNodeList);
return cycleNodeList;


}

function getIndexOfSrcID(nodeID, linkMap) {
	for(var i = 0; i < linkMap.length; ++i) {
		if(linkMap[i][0] == nodeID) {
			console.log("found "+nodeID+" at index "+i);
			return i;
		}
	}
	return -1;
}

function colorCycles(cycleList) {
	var elements;
	var cellView;
		// If there is no cycle, leave the color the way it was
	if (!isACycle(cycleList)) {
		elements = graph.getElements();
		for (var i = 0; i < elements.length; i++) {
			cellView  = elements[i].findView(paper);
			cellView.model.changeToOriginalColour();
		}
	}
	else {
		swal("Cycle in the graph", "", "error");
		elements = graph.getElements();
		var color_list = initColorList();
		var cycleIndex = 0; 
		for (var k = 0 ; k < cycleList.length; k++){
			//if(cycle[1][k].length > 0) {
			//console.log("cycleIndex = "+cycleIndex);
			var color = color_list[cycleIndex];
			cycleIndex += 1;
			//console.log("color = "+color);
			
			//console.log("k ="+k);	
			for (var l = 0 ; l< cycleList[k].length; l++){
			//	console.log("l ="+l);
				for (var i = 0; i < elements.length; i++) {
				cellView  = elements[i].findView(paper);
				//if (recursiveStack[cellView.model.attributes.elementid]) 
				if (cellView.model.attributes.elementid == cycleList[k][l] && cellView.model.attributes.type != "basic.Actor"){
				//	console.log("coloring "+cellView.model.attributes.elementid);
						cellView.model.attr({'.outer': {'fill': color}});
					}

				}	
			}
			
		//}	
	}
	}
}

function cycleSearchDFSMethod() {
	var links = getLinks();
	var vertices = getElementList();
	var isCycle = false;

	//how can we initiate a list to traverse like a graph ? linked list baby xx
	//double array. index = src nodeID. sub array corresponds to each dest nodeID that goes with the src

	//initialize linkMap, a 2D array. 1st index = src nodeID. Subarray at index = dest nodes corresponding to the src
	var linkMap = initiateLinkGraph(vertices, links)
	console.log(linkMap);

	var cycleList = traverseGraphForCycles(linkMap);

	if(cycleList.length > 0) {
		return cycleList;
	}
	return null;
}

function initiateLinkGraph(vertices, links) {
	var linkMap = [];

	vertices.forEach(function(element){
		var src = element.id;
		linkMap[src] = [];
	 });

	links.forEach(function(element){
		var src = element.linkSrcID;
		//linkMap[src] = [];
		//linkMap[src].push([element.linkDestID]);
		linkMap[src].push(element.linkDestID);
	});

	return linkMap;
}

function traverseGraphForCycles(linkMap) {
	var vertices = getElementList();
	var notVisited = [];
	var cycleList = [];

	vertices.forEach(function(element){
		notVisited.push(element.id);
	 });


	while (notVisited.length > 0) { 	//while all nodes haven't yet been visited
	var start = notVisited[0]; 	//pick a start node
	//console.log(start);
	notVisited.splice(0,1); //remove curr from visited list
	var walkList = []; //should this be our linked list? maybe
	console.log("new walk");
	
	traverseGraphRecursive(linkMap, start, walkList, notVisited, cycleList); 
	}
	console.log(cycleList);
	return cycleList;
}

function traverseGraphRecursive(linkMap, currNode, walkList, notVisited, cycleList) {

	//console.log(linkMap);
	//console.log("hi");
	console.log(currNode);
	//check each node if visited already (in current walk)
	if(walkList.includes(currNode)) {
		//if the node has been visited, you've found a cycle
		console.log("cycle found");
		var cycle = [];
		var prev = currNode;
		//the cycle is the part of the list from first instance of repeat node to now
		for(var i = walkList.indexOf(currNode); i < walkList.length; ++i) {
			cycle.push(walkList[i]);
			var remove = linkMap[prev].indexOf(walkList[i]); //get rid of cycle link to from prev to curr node so graph doesn't get stuck
			linkMap[prev].splice(remove, 1);
			prev = walkList[i];
		}
		//push it onto our cycle list
		cycleList.push(cycle);
		//console.log(cycle);
		//console.log(linkMap);

		//prevent graph from getting stuck...get rid of cycle link to from prev to curr node?
		// var prevNode = walkList[walkList.length-2];
		// var remove = linkMap[prevNode].indexOf(currNode);
		// linkMap[prevNode].splice(remove, 1);

	}
	
	//push node to walk list -> remove it from notVisited while we're at it
	walkList.push(currNode);
	//remove curr from notVisited list
	if(notVisited.includes(currNode)) {
		notVisited.splice(notVisited.indexOf(currNode), 1);
	}

	//if we have unvisited dest nodes, go there
	if(linkMap[currNode].length > 0) {
		for(var i = 0; i < linkMap[currNode].length; ++i) {
		var next = linkMap[currNode][i];
		walkList = traverseGraphRecursive(linkMap, next, walkList, notVisited, cycleList);
		}
		//linkMap[currNode] = []; //once all links are visited, remove them
	}
		//if not, go back/return
		//console.log("resetting walkList");
		//walkList = []; //reset walkList
		walkList.pop();
		return walkList;
}
/**
 * Returns true iff there is a cycle in the graph represented by
 * links and vertices. 
 * Reference: http://www.geeksforgeeks.org/detect-cycle-in-a-graph/
 *
 * @param {Object} links
 * @param {Object} vertices
 * @returns {Boolean}
 */
function cycleCheck(links, vertices) {
	var graphs = {};
	var visited = {};
	var cycle_list = []; 
	var cycle = false;
	//create a list of nodes that are both a destination and src for links
	//conduct a depth first search, see if a node returns to its parent node during a walk


	// Iterate over links to create map between src node and dest node of each link
	links.forEach(function(element){
		var src = element.linkSrcID;
		if(src in graphs){
			//graphs[src].push(element.linkDestID);
			graphs[src] = [element.linkDestID]
		}
		else{
			graphs[src] = [element.linkDestID];
		}
	});
	// Iterate over all vertices to initialize visited stack and recursive stack to false
	vertices.forEach(function(vertex){
		visited[vertex.id] = false;
		recursiveStack[vertex.id] = false;
	});

	vertices.forEach(function(vertex){ //for each vertex (node), see if it's a cycle ?
			if (!visited[vertex.id]) {
				cycle_sublist = []; 
				cycle_sublist.push(vertex.id);
				if (isCycle(vertex.id, visited, graphs,cycle_sublist,cycle_list)){ //recursively checks if there is a cycle connected to the vertex
					cycle = true;
				}
			}
	});
	var list = [] ;
	list.push(cycle);
	var cycleList = checkCycleList(cycle_list,graphs);
	// for(var i = 0; i < cycleList.length;++i) {
	// 	// if(cycleList[i].length < 3) {
	// 	// 	//cycleList.pop(i); 
	// 	// 	cycleList[i] = [];
	// 	// }

	// }
	list.push(cycleList);
	console.log(list);
	return list;
}

/**
 * Returns true if cycle is detected with DFS.
 * This function is not to be called on its own.
 * This function should be called as a helper function for
 * cycleCheck(). 
 *
 * @param {String} vertexId
 * @param {Object} visited
 * @param {Object} graphs
 * @returns {Boolean}
 */
function isCycle(vertexId, visited, graphs,cycle_sublist,cycle_list){
	visited[vertexId] = true;
	recursiveStack[vertexId] = true;
	

	if (graphs[vertexId] == null) {
		recursiveStack[vertexId] = false;
		return false;
	}
	else {
		for(var i = 0; i < graphs[vertexId].length; i++) {
			if (!visited[graphs[vertexId][i]]) {
				cycle_sublist.push(graphs[vertexId][i]);
				if (isCycle(graphs[vertexId][i], visited, graphs,cycle_sublist,cycle_list)) {
					return true;
				}
			}
			else if (recursiveStack[graphs[vertexId][i]]){
				cycle_list.push(cycle_sublist);
				return true;
			}
		}
	}
	recursiveStack[vertexId] = false;
	return false;
}

function checkCycleList(cycle_list,graphs){
	for (var i = 0 ; i < cycle_list.length; i++){
		var last = cycle_list[i].length - 1; 
		if (graphs[cycle_list[i][last]].length === 1){
			if (graphs[cycle_list[i][last]] != cycle_list[i][0]){
				vertexId = cycle_list[i].splice(0,1);
				recursiveStack[vertexId] = false;
			}
		}
		else{
			if (graphs[cycle_list[i][last]][0] !== cycle_list[i][0]){
				cycle_list[i].splice(0,1);
			}	
		}
	}
	return cycle_list;
}