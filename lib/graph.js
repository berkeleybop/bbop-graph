/** 
 * Purpose: Basic edged graph and operations.
 * 
 * NOTE: A model instance may not be the whole graph, just a
 * subgraph--this is the difference between nodes and
 * named_nodes. nodes are real things, while named_nodes are things
 * referenced by edges.
 * 
 * Check TODOs, we would like everything as linear as possible.
 * 
 * TODO: memoize everything but add_*. Functional enough that it
 * should work if we just empty the caches after every add_* op.
 * 
 * @module bbop-graph
 */

var us = require('underscore');
var each = us.each;
var keys = us.keys;
var bbop = require('bbop-core');

///
/// Okay, first off, definitions and prototypes of everything we need
/// to work.
///

// Common point for assigning the default predicate in here.
var default_predicate = 'points_at';

///
/// Node sub-object.
///

/**
 * Contructor for a BBOP graph model node.
 * 
 * @constructor
 * @param {string} new_id - a unique id for the node
 * @param {string} new_label - (optional) a user-friendly description of the node
 * @returns {this} new bbop model node
 */
function node(new_id, new_label){
    this._is_a = 'bbop-graph.node';
    this._id = new_id || null;
    this._label = new_label || null;

    // Only have a real type if the constructor went properly.
    this._type = 'node';

    this._metadata = null;
}

/**
 * Getter/setter for node id.
 *
 * @param {string} value - (optional) new value for this property to take
 * @returns {string} string
 */
node.prototype.id = function(value){
    if(value){ this._id = value; }
    return this._id;
};

/**
 * Getter/setter for node type.
 *
 * @param {string} value - (optional) new value for this property to take
 * @returns {string} string
 */
node.prototype.type = function(value){
    if(value){ this._type = value; }
    return this._type; };

/**
 * Getter/setter for node label.
 *
 * @param {string} value - (optional) new value for this property to take
 * @returns {string} string
 */
node.prototype.label = function(value){
    if(value){ this._label = value; }
    return this._label;
 };

/**
 * Getter/setter for node metadata.
 * 
 * The metadata value does not necessarily have to be an atomic type.
 *
 * @param {Object} value - (optional) new value for this property to take; only objects (not Arrays)
 * @returns {Object|null} value
 */
node.prototype.metadata = function(value){
    if( us.isObject(value) && ! us.isArray(value) ){
	this._metadata = value;
    }
    return this._metadata;
 };

/**
 * Get a fresh new copy of the current node (using bbop.clone for
 * metadata object). This includes copying the ID--you'd have to
 * change it on your own.
 *
 * @returns {node} node
 */
node.prototype.clone = function(){

    // Base.
    var new_clone = new node();

    // ID.
    new_clone.id(this.id());

    // Label.
    new_clone.label(this.label());

    // Type.
    new_clone.type(this.type());

    // Meta.
    new_clone.metadata(bbop.clone(this.metadata()));

    return new_clone;
};

///
/// Edge sub-object.
///

/**
 * Contructor for a BBOP graph model edge.
 * 
 * If no predicate is given, <default_predicate> is used.
 * Predicates are currently treated as raw strings.
 * 
 * Note that these edges have no ID associated with them.
 * 
 * @constructor
 * @param {string} subject - node id string or node
 * @param {string} object - node id string or node
 * @param {string} predicate - (optional) a user-friendly description of the node
 * @returns {edge} bbop model edge
 */
function edge(subject, object, predicate){
    this._is_a = 'bbop-graph.edge';

    if( ! subject || ! object ){
	throw new Error('incomplete arguments for new edge');
    }

    /**
     * The predicate we'll use when none other is defined. You can
     * probably safely ignore this if all of the edges in your graph are
     * the same.
     *
     * @variable
     */
    this.default_predicate = default_predicate;

    // Either a string or a node.
    if( typeof(subject) === 'string' ){
	this._subject_id = subject;	
    }else if( subject.id && typeof(subject.id) === 'function' ){
	this._subject_id = subject.id();
    }else{
	throw new Error('cannot parse subject argument for edge');
    }

    // Either a string or a node.
    if( typeof(object) === 'string' ){
	this._object_id = object;	
    }else if( object.id && typeof(object.id) === 'function' ){
	this._object_id = object.id();
    }else{
	throw new Error('cannot parse object argument for edge');
    }

    // Predicate default or incoming.
    this._predicate_id = this.default_predicate;
    if( predicate ){
	this._predicate_id = predicate;
    }

    // Only have a real type if the constructor went properly.
    this._type = 'edge';

    //
    this._metadata = null;
}

/**
 * Getter/setter for edge subject id.
 *
 * @returns {string} string
 */
edge.prototype.subject_id = function(){
    return this._subject_id;
};

/**
 * Getter/setter for edge object id.
 *
 * @returns {string} string
 */
edge.prototype.object_id = function(){
    return this._object_id;
};

/**
 * Getter/setter for edge predicate id.
 *
 * @returns {string} string
 */
edge.prototype.predicate_id = function(){
    return this._predicate_id;
};

/**
 * Getter/setter for edge type.
 *
 * @param {String} value - (optional) new value for this property to take
 * @returns {String} string
 */
edge.prototype.type = function(value){
    if( typeof(value) !== 'undefined' ){
	this._type = value;
    }
    return this._type;
};

/**
 * Getter/setter for edge metadata.
 * 
 * The metadata value does not necessarily have to be an atomic type.
 *
 * @param {Object} value - (optional) new value for this property to take; only objects (not Arrays)
 * @returns {Object|null} value
 */
edge.prototype.metadata = function(value){
    if( us.isObject(value) && ! us.isArray(value) ){
	this._metadata = value;
    }
    return this._metadata;
 };

/**
 * Get a fresh new copy of the current edge (using bbop.clone for
 * metadata object).
 *
 * @returns {edge} - new copy of edge
 */
edge.prototype.clone = function(){

    // Base.
    var new_clone = new edge(this.subject_id(),
			     this.object_id(),
			     this.predicate_id());

    // Predicate.
    new_clone.default_predicate = this.default_predicate;

    // Type.
    new_clone.type(this.type());

    // Metadata.
    new_clone.metadata(bbop.clone(this.metadata()));

    return new_clone;
};

///
/// Graph sub-object.
///

/**
 * Contructor for a BBOP graph model graph.
 * 
 * TODO: make compilation piecewise with every added node and edge.
 * 
 * @constructor
 * @returns {graph} bbop model graph
 */
function graph(){
    this._is_a = 'bbop-graph.graph';

    /**
     * The predicate we'll use when none other is defined. You can
     * probably safely ignore this if all of the edges in your graph are
     * the same.
     *
     * @variable
     */
    this.default_predicate = default_predicate;

    this._id = null;
    this._metadata = null;

    // A per-graph logger.
    this._logger = new bbop.logger(this._is_a);
    this._logger.DEBUG = true;
    //this._logger.DEBUG = false;
    //function ll(str){ anchor._logger.kvetch(str); }

    // For node and edge (hash not possible for edges--only relation,
    // not "real").
    this._nodes = {}; // node_id -> node
    this._edge_list = []; // just an easy access list (hard to pull from sop)
    this._predicates = {}; // reference count

    // Useful for things like leaves, roots, dangling, and
    // singletons--all things referenced by edges.
    this._subjects = {}; // reference count
    this._objects = {}; // reference count

    // New parallel structures to for our simplified graph.
    this._so_table = {}; // reference count
    this._os_table = {}; // reference count
    this._sop_table = {}; // [sub][obj][pred] = edge

    // Table structures for quick lookups of node properties.
    this._is_a_singleton_lookup = {}; // node_id -> true
}

/**
 * Create an edge for use in internal operations.
 *
 * @param {string} subject - node id string or node
 * @param {string} object - node id string or node
 * @param {string} predicate - (optional) a user-friendly description of the node
 * @returns {edge} bbop model edge
 */
graph.prototype.create_edge = function(subject, object, predicate){
    return new edge(subject, object, predicate);
};

/**
 * Create a node for use in internal operations.
 *
 * @param {string} new_id - a unique id for the node
 * @param {string} new_label - (optional) a user-friendly description of the node
 * @returns {node} new bbop model node
 */
graph.prototype.create_node = function(new_id, new_label){
    return new node(new_id, new_label);
};

/**
 * Create a graph for use in internal operations.
 *
 * @returns {graph} bbop model graph
 */
graph.prototype.create_graph = function(){
    return new graph();
};

/**
 * Getter/setter for graph metadata.
 * 
 * The metadata value does not necessarily have to be an atomic type.
 *
 * @param {Object} value - (optional) new value for this property to take; only objects (not Arrays)
 * @returns {Object|null} value
 */
graph.prototype.metadata = function(value){
    if( us.isObject(value) && ! us.isArray(value) ){
	this._metadata = value;
    }
    return this._metadata;
 };

/**
 * Create a clone of the graph.
 *
 * @returns {graph} bbop model graph
 */
graph.prototype.clone = function(){
    var anchor = this;

    var new_graph = anchor.create_graph();

    // Collect the nodes and edges.
    each(anchor.all_nodes(), function(node){
	//console.log('nid: ' + node.id());
	new_graph.add_node(node.clone());
    });
    each(anchor.all_edges(), function(edge){
	//console.log('eid: ' + edge.subject());
	new_graph.add_edge(edge.clone());
    });

    // Collect other information.
    new_graph.default_predicate = anchor.default_predicate;
    new_graph._id = anchor._id;

    // Meta.
    new_graph.metadata(bbop.clone(this.metadata()));

    return new_graph;
};

/**
 * Getter/setter for the graph id.
 *
 * @param {string} value - (optional) new value for this property to take
 * @returns {string} string
 */
graph.prototype.id = function(value){
    if( value ){ this._id = value; }
    return this._id;
};

/**
 * See if the graph self-reports as incomplete.
 * Should be true, unless metadata has
 *
 * @returns {Boolean} whether or not all nodes/edges are represented
 */
graph.prototype.incomplete_p = function(){

    var ret = false;

    if( this._metadata ){
	if( typeof( this._metadata['incomplete-p'] !== 'undefined' ) ){
	    var inc = this._metadata['incomplete-p'];
	    if( inc === true || inc === 'true' ){
		ret = true;
	    }
	}
    }

    return ret;
};

/**
 * Return the number of self-reported nodes.
 * Should be nodes.length, unless incomplete_p, in which case it will
 * search for a count in the metadata.
 *
 * @returns {Number} number of nodes represented
 */
graph.prototype.complete_node_count = function(){

    var ret = null;

    if( this.incomplete_p() ){
	if( typeof( this._metadata['complete-node-count'] !== 'undefined' ) ){
	    var cnt = this._metadata['complete-node-count'];
	    if( us.isNumber(cnt) || us.isString(cnt) ){
		ret = parseInt(cnt);
	    }
	}
    }

    // Apparently not incomplete, or at least not structured
    // correctly. Grab the counts instead.
    if( ret === null ){
	ret = this.all_nodes().length;
    }

    return ret;
};

/**
 * Return the number of self-reported edges.
 * Should be edges.length, unless incomplete_p, in which case it will
 * search for a count in the metadata.
 *
 * @returns {Number} number of edges represented
 */
graph.prototype.complete_edge_count = function(){

    var ret = null;

    if( this.incomplete_p() ){
	if( typeof( this._metadata['complete-edge-count'] !== 'undefined' ) ){
	    var cnt = this._metadata['complete-edge-count'];
	    if( us.isNumber(cnt) || us.isString(cnt) ){
		ret = parseInt(cnt);
	    }
	}
    }

    // Apparently not incomplete, or at least not structured
    // correctly. Grab the counts instead.
    if( ret === null ){
	ret = this.all_edges().length;
    }

    return ret;
};

/**
 * Add a node to the graph.
 *
 * @param {node} node - node to add to the graph
 */
graph.prototype.add_node = function(node){

    // Check for anything funny.
    if( ! node.id() ){
	throw new Error("no anonymous nodes: " + node.id());
    }else{

	var nid = node.id();
	
	// Add it to all the concerned recall data structures.
	this._nodes[ nid ] = node;
	
	// If this does not belong to any relation so far, then it is a
	// singleton.
	if( ! this._subjects[ nid ] && ! this._objects[ nid ] ){
	    this._is_a_singleton_lookup[ nid ] = true;
	}
    }
};

/**
 * Remove a node from the graph.
 *
 * @param {String} node_id - the id for a node
 * @param {Boolean} clean_p - (optional) remove all edges connects to node (default false)
 * @returns {Boolean} true if node found and destroyed
 */
graph.prototype.remove_node = function(node_id, clean_p){
    var anchor = this;
    
    var ret = false;

    //console.log('remove node: ' + node_id);

    // Only remove extant nodes.
    if( anchor.get_node(node_id) ){
	ret = true;

	// Add it to all the concerned recall data structures.
	delete anchor._nodes[ node_id ];
	
	// Non-extant nodes are not singletons.
	delete anchor._is_a_singleton_lookup[ node_id ];

	// Dispose of any associated edges.
	if( clean_p ){

	    // Find all the possible extant edges.
	    var edge_pairs = [];
	    if( anchor._so_table[ node_id ] ){		
		each(keys(anchor._so_table[node_id] ), function(obj_id){
		    edge_pairs.push([node_id, obj_id]);
		});
	    }
	    if( anchor._os_table[ node_id ] ){		
		each(keys(anchor._os_table[node_id] ), function(sub_id){
		    edge_pairs.push([sub_id, node_id]);
		});
	    }

	    // Remove the edges from these pairs.
	    each(edge_pairs, function(pair){
		var expanded_edges = anchor.get_edges(pair[0], pair[1]);
		each(expanded_edges, function(edge){
		    anchor.remove_edge(edge.subject_id(), 
				       edge.object_id(), 
				       edge.predicate_id());
		});
	    });
	}
    }

    return ret;
};

/**
 * Add an edge to the graph.
 *
 * @param {edge} edge - edge to add to the graph
 */
graph.prototype.add_edge = function(edge){

    //
    var sub_id = edge.subject_id();
    var obj_id = edge.object_id();
    var pred_id = edge.predicate_id();

    // First, attempt to remove the edge.
    var is_new_triple = true;
    if( this.remove_edge(sub_id, obj_id, pred_id) ){
	is_new_triple = false;
    }

    // Subject -> object -> refcount.
    if( ! this._so_table[ sub_id ] ){ // ensure
	this._so_table[ sub_id ] = {};
    }
    if( typeof(this._so_table[ sub_id ][ obj_id ]) === 'undefined' ){
	this._so_table[ sub_id ][ obj_id ] = 1;
    }else{
	this._so_table[ sub_id ][ obj_id ]++;
    }

    // Object -> subject -> refcount.
    if( ! this._os_table[ obj_id ] ){ // ensure
	this._os_table[ obj_id ] = {};
    }
    if( typeof(this._os_table[ obj_id ][ sub_id ]) === 'undefined' ){
	this._os_table[ obj_id ][ sub_id ] = 1;
    }else{
	this._os_table[ obj_id ][ sub_id ]++;
    }

    // Subject -> object -> predicate -> edge.
    if( ! this._sop_table[ sub_id ] ){ // ensure
	this._sop_table[ sub_id ] = {};
    }
    if( ! this._sop_table[ sub_id ][ obj_id ] ){ // deeper ensure
	this._sop_table[ sub_id ][obj_id] = {};
    }
    // Blow away old either way--new or replacement.
    this._sop_table[ sub_id ][ obj_id ][ pred_id ] = edge;

    // If this is a new predicate, count of 1; otherwise increment
    // only if this is a new edge.
    if( ! this._predicates[ pred_id ] ){
	this._predicates[ pred_id ] = 1;
    }else{
	// Only increment if it's a new triple (pred).
	//if( is_new_triple ){ this._predicates[ pred_id ]++; }
	this._predicates[ pred_id ]++;
    }

    // Update reference counts for subjects.
    if( ! this._subjects[ sub_id ] ){
	this._subjects[ sub_id ] = 1;
    }else{
	// Only increment if it's a new triple (pred).
	//if( is_new_triple ){ this._subjects[ sub_id ]++; }
	this._subjects[ sub_id ]++;
    }

    // Update reference counts for objects.
    if( ! this._objects[ obj_id ] ){
	this._objects[ obj_id ] = 1; 
    }else{
	// Only increment if it's a new triple (pred).
	//if( is_new_triple ){ this._objects[ obj_id ]++; }
	this._objects[ obj_id ]++;
    }

    // Remove the edge's subject and object from the singleton
    // table--they are now referenced by something.
    if( this._is_a_singleton_lookup[ sub_id ] ){
	delete this._is_a_singleton_lookup[ sub_id ];
    }
    if( this._is_a_singleton_lookup[ obj_id ] ){
	delete this._is_a_singleton_lookup[ obj_id ];
    }

    // Onto the array and subject and object into named bodies.
    this._edge_list.push(edge);
};

/**
 * Remove an edge to the graph.
 * The edge as referenced.
 *
 * @param {String} subject_id - subject by ID
 * @param {String} object_id - object by ID
 * @param {String} predicate_id - (Optional) predicate ID or default
 * @returns {Boolean} true if such an edge was found and deleted, false otherwise
 */
graph.prototype.remove_edge = function(subject_id, object_id, predicate_id){
    var anchor = this;

    // Ensure predicate.
    if( ! predicate_id ){ predicate_id = this.default_predicate; }

    // First determine if such an edge exists.
    var ret = false;
    var edge = this.get_edge(subject_id, object_id, predicate_id);
    if( edge ){
	ret = true; // looks like we have it.

	// Does this subject appear elsewhere? Decrement or eliminate
	// as necessary.
	if( this._subjects[ subject_id ] === 1 ){
	    delete this._subjects[ subject_id ];
	}else{
	    this._subjects[ subject_id ]--;
	}

	// Does this object appear elsewhere? Decrement or eliminate
	// as necessary.
	if( this._objects[ object_id ] === 1 ){
	    delete this._objects[ object_id ];
	}else{
	    this._objects[ object_id ]--;
	}

	// Does this predicate appear elsewhere? Decrement or
	// eliminate as necessary.
	if( this._predicates[ predicate_id ] === 1 ){
	    delete this._predicates[ predicate_id ];
	}else{
	    this._predicates[ predicate_id ]--;
	}

	// Remove from SOP. Don't need to do more as SOP is not
	// probed, just used as a lookup.
	delete this._sop_table[ subject_id ][ object_id ][ predicate_id ];

	// Remove from edge_list.
	this._edge_list = us.reject(this._edge_list, function(edge){
	    var ret = false;
	    if( edge.subject_id() === subject_id &&
		edge.object_id() === object_id &&
		edge.predicate_id() === predicate_id ){
		ret = true;
	    }
	    return ret;
	});

	// SO rels decrement or eliminate.
	if( this._so_table[ subject_id ][ object_id ] === 1 ){
	    delete this._so_table[ subject_id ][ object_id ];
	}else{
	    this._so_table[ subject_id ][ object_id ]--;
	}
	
	// OS rels decrement or eliminate.
	if( this._os_table[ object_id ][ subject_id ] === 1 ){
	    delete this._os_table[ object_id ][ subject_id ];
	}else{
	    this._os_table[ object_id ][ subject_id ]--;
	}
	
	// Do we make any singletons with this removal?
	// Was the subject singletoned?
	if( this._nodes[subject_id] && // can't singleton if not there
	    ! this._subjects[ subject_id ] && ! this._objects[ subject_id ] ){
	    this._is_a_singleton_lookup[ subject_id ] = true;
	}
	// Was the object singletoned?
	if( this._nodes[object_id] &&  // can't singleton if not there
	    ! this._subjects[ object_id ] && ! this._objects[ object_id ] ){
	    this._is_a_singleton_lookup[ object_id ] = true;
	}

	// Anybody to be removed from the list of dangling?
	// TODO: named_nodes no more?
    }

    return ret;
};

/**
 * Returns an /original/ list of all added nodes.
 *
 * @returns {Array} array of {node}
 */
graph.prototype.all_nodes = function(){
    return us.values(this._nodes);
};

/**
 * Returns an /original/ list of all added edges.
 *
 * @returns {Array} array of {edge}
 */
graph.prototype.all_edges = function(){
    return this._edge_list;
};

/**
 * Returns an /original/ list of all added predicates.
 *
 * @returns {Array} array of predicates (strings)
 */
graph.prototype.all_predicates = function(){
    return keys(this._predicates);
};

/**
 * List all external nodes by referenced id.
 *
 * @returns {Array} array of strings: external nodes by id
 */
graph.prototype.all_dangling = function(){
    var anchor = this;

    // All named nodes, real or not (edge view).
    var named_nodes = keys(this._subjects).concat( keys(this._objects) );

    // Disjoint of named and extant.
    var unnamed = [];
    each(named_nodes, function(named_id){
	if( ! anchor._nodes[named_id] ){
	    unnamed.push(named_id);
	}
    });
    return unnamed;
};

/**
 * Any bad parts in graph? Essentially, make sure that there are no
 * weird references and nothing is dangling.
 *
 * @returns {Boolean} boolean
 */
graph.prototype.is_complete = function(){
    var retval = true;
    if( this.all_dangling().length > 0 ){
	retval = false;
    }
    return retval;
};

/**
 * Return a /copy/ of a node by id (not the original) if extant.
 *
 * @param {string} nid - the id of the node we're looking for
 * @returns {node} - copy of bbop model node
 */
graph.prototype.get_node = function(nid){
    var retnode = null;
    if( this._nodes[ nid ] ){
	var tmp_node = this._nodes[ nid ];
	retnode = tmp_node.clone();
    }
    return retnode;
};

/**
 * Return a /copy/ of an edge by ids (not the original) if extant.
 *
 * @param {string} sub_id - the subject_id of the edge we're looking for
 * @param {string} obj_id - the object_id of the edge we're looking for
 * @param {string} pred - (optional) the predicate of the edge we're looking for
 *
 * @returns {edge} - copy of bbop model edge
 */
graph.prototype.get_edge = function(sub_id, obj_id, pred){	

    if( ! pred ){ pred = this.default_predicate; }

    var ret_edge = null;
    if( this._sop_table[sub_id] &&
	this._sop_table[sub_id][obj_id] &&
	this._sop_table[sub_id][obj_id][pred] ){
	    var tmp_edge = this._sop_table[sub_id][obj_id][pred];
	    ret_edge = tmp_edge.clone();
	}
    return ret_edge; 
};

/**
 * Return all edges (copies) of given subject and object ids. Returns
 * entirely new edges.
 *
 * @param {String} sub_id - the subject_id of the edge we're looking for
 * @param {String} obj_id - the object_id of the edge we're looking for
 * @returns {Array} list of <edge>
 */
graph.prototype.get_edges = function(sub_id, obj_id){
    var anchor = this;

    var retlist = [];
    if( anchor._sop_table[sub_id] && anchor._sop_table[sub_id][obj_id] ){
	each(keys(anchor._sop_table[sub_id][obj_id]), function(pred){
	    var found_edge = anchor._sop_table[sub_id][obj_id][pred];
	    var tmp_edge = found_edge.clone();
	    retlist.push(tmp_edge);
	});
    }		

    return retlist;
};

/**
 * Return all edges (copies) of given subject id. Returns entirely new
 * edges.
 *
 * @param {String} sub_id - the subject_id of the edge we're looking for
 * @returns {Array} list of <edge>
 */
graph.prototype.get_edges_by_subject = function(sub_id){
    var anchor = this;

    var retlist = [];
    if( anchor._so_table[sub_id] ){
	each(keys(anchor._so_table[sub_id]), function(obj_id){
	    retlist = retlist.concat(anchor.get_edges(sub_id, obj_id));
	});
    }		

    return retlist;
};

/**
 * Return all edges (copies) of given object id. Returns entirely new
 * edges.
 *
 * @param {String} obj_id - the object_id of the edge we're looking for
 * @returns {Array} list of <edge>
 */
graph.prototype.get_edges_by_object = function(obj_id){
    var anchor = this;

    var retlist = [];
    if( anchor._os_table[obj_id] ){
	each(keys(anchor._os_table[obj_id]), function(sub_id){
	    retlist = retlist.concat(anchor.get_edges(sub_id, obj_id));
	});
    }		

    return retlist;
};

/**
 * Return all predicates of given subject and object ids.
 *
 * @param {String} sub_id - the subject_id of the edge we're looking for
 * @param {String} obj_id - the object_id of the edge we're looking for
 * @returns {Array} list of predicate ids (as strings)
 */
graph.prototype.get_predicates = function(sub_id, obj_id){
    var anchor = this;

    var retlist = [];
    if( anchor._sop_table[sub_id] && anchor._sop_table[sub_id][obj_id] ){
	each(keys(anchor._sop_table[sub_id][obj_id]), function(pred){
	    retlist.push(pred);
	});
    }

    return retlist;
};


/**
 * Translate an edge array into extant (node) bodies, switching on
 * either 'subject' or 'object'.
 * 
 * This will return the /original/ nodes.
 *
 * This will throw an error on any world issues that crop up.
 * 
 * @param {Array} in_edges - list if {edge} we want the subjects or objects of
 * @param {String} target - 'subject' or 'object'
 * @returns {Array} list of {node}
 */
graph.prototype.edges_to_nodes = function(in_edges, target){
    var anchor = this;
    
    // Double check.
    if( target !== 'subject' && target !== 'object'){
	throw new Error('Bad target for edges to bodies.');
    }

    // 
    var results = [];
    each(in_edges, function(in_e){

	// Switch between subject and object.
	var target_id = null;
	if( target === 'subject' ){
	    target_id = in_e.subject_id();
	}else{
	    target_id = in_e.object_id();
	}
	
	//
	if( target_id && anchor._nodes[ target_id ] ){
	    results.push(anchor._nodes[ target_id ]);
	}else{
	    throw new Error(target + ' world issue');
	}
    });

    return results;
};

/**
 * Roots are defined as nodes who are the subject of nothing,
 * independent of predicate.
 *
 * @param {string} nb_id - id of the node to check
 * @returns {boolean} - boolean
 */
graph.prototype.is_root_node = function(nb_id){
    var result = false;	
    if( this._nodes[ nb_id ] && ! this._subjects[ nb_id ] ){	    
	result = true;
    }
    return result;
};


/**
 * Return a list of /copies/ of the root nodes.
 * 
 * BUG/TODO: Could I speed this up by my moving some of the
 * calculation into the add_node and add_edge methods? O(|num(nodes)|)
 * 
 * @returns {Array} list of {node}
 */
graph.prototype.get_root_nodes = function(){
    var anchor = this;

    var results = [];
    each(keys(anchor._nodes ), function(nb_id){
	if( anchor.is_root_node(nb_id) ){
	    results.push( anchor.get_node(nb_id).clone() );
	}
    });

    return results;
};


/**
 * Leaves are defined as nodes who are the object of nothing,
 * independent of predicate.
 * 
 * @param {string} nb_id - id of the node to check
 * @returns {boolean} - boolean
 */
graph.prototype.is_leaf_node = function(nb_id){

    var result = false;
    if( this._nodes[ nb_id ] && ! this._objects[ nb_id ] ){	    
	result = true;
    }
    return result;
};

/**
 * Return a list of /copies/ of the leaf nodes.
 * 
 * BUG/TODO: Could I speed this up by my moving some of the
 * calculation into the add_node and add_edge methods? O(|num(nodes)|)
 * 
 * @returns {Array} list of {node}
 */
graph.prototype.get_leaf_nodes = function(){
    var anchor = this;

    var results = [];
    each(keys(anchor._nodes), function(nb_id){
	if( anchor.is_leaf_node(nb_id) ){
	    results.push( anchor.get_node(nb_id).clone() );
	}
    });

    return results;
};

/**
 * Find nodes that are roots and leaves over all relations. This
 * returns the /original/ node.
 * 
 * Throws an error if there is a world issue.
 *
 * @returns {Array} array of {node}
 */
graph.prototype.get_singleton_nodes = function(){
    var anchor = this;

    // Translate array into array extant bodies.
    var singleton_array = [];
    each(keys(anchor._is_a_singleton_lookup), function(singleton_id){
	if( anchor._nodes[ singleton_id ] ){
	    singleton_array.push( anchor._nodes[ singleton_id ] );
	}else{
	    throw new Error("world issue in get_singletons: " + singleton_id);
	}
    });

    return singleton_array;
};

/**
 * Return all parent edges; the /originals/. If no predicate is given,
 * use the default one.
 * 
 * TODO: it might be nice to memoize this since others depend on it.
 *
 * @param {String} nb_id - the node to consider
 * @param {String} in_pred - (optional) over this predicate, defaults to all
 * @returns {Array} array of <edge>
 */
graph.prototype.get_parent_edges = function(nb_id, in_pred){
    var anchor = this;

    var results = [];

    // Get all parents, or just parents from a specific relation.
    var preds_to_use = [];
    if( in_pred ){
	preds_to_use.push(in_pred);
    }else{
	preds_to_use = anchor.all_predicates();
    }

    // Try all of our desired predicates.
    each(preds_to_use, function(pred){

	// Scan the table for goodies; there really shouldn't be a
	// lot here.
	if( anchor._so_table[ nb_id ] ){		
	    each(keys(anchor._so_table[nb_id] ), function(obj_id){
		// If it looks like something is there, try to see
		// if there is an edge for our current pred.
		var tmp_edge = anchor.get_edge(nb_id, obj_id, pred);
		if( tmp_edge ){
		    results.push( tmp_edge );
		}
	    });
	}
    });

    return results;
};

/**
 * Return all child edges; the /originals/. If no predicate is given,
 * use the default one.
 * 
 * TODO: it might be nice to memoize this since others depend on it.
 *
 * @param {String} nb_id - the node to consider
 * @param {String} in_pred - (optional) over this predicate, defaults to all
 * @returns {Array} array of <edge>
 */
graph.prototype.get_child_edges = function(nb_id, in_pred){
    var anchor = this;

    var results = [];

    // Get all children, or just parents from a specific relation.
    var preds_to_use = [];
    if( in_pred ){
	preds_to_use.push(in_pred);
    }else{
	preds_to_use = anchor.all_predicates();
    }

    // Try all of our desired predicates.
    each(preds_to_use, function(pred){

	// Scan the table for goodies; there really shouldn't be a
	// lot here.
	if( anchor._os_table[ nb_id ] ){		
	    each(keys(anchor._os_table[nb_id] ), function(sub_id){
		// If it looks like something is there, try to see
		// if there is an edge for our current pred.
		var tmp_edge = anchor.get_edge(sub_id, nb_id, pred);
		if( tmp_edge ){
		    results.push( tmp_edge );
		}
	    });
	}
    });

    return results;
};

/**
 * Return all parent nodes; the /originals/. If no predicate is given,
 * use the default one.
 * 
 * @param {String} nb_id - the node to consider
 * @param {String} in_pred - (optional) over this predicate, defaults to all
 *
 * @returns {Array} list of {node}
 */
graph.prototype.get_parent_nodes = function(nb_id, in_pred){
    var anchor = this;

    var results = [];
    var edges = this.get_parent_edges(nb_id, in_pred);
    each(edges, function(edge){
	// Make sure that any found edges are in our
	// world.
	var obj_id = edge.object_id();
	var tmp_node = anchor.get_node(obj_id);
	if( tmp_node ){
	    results.push( tmp_node );
	}
    });

    return results;
};

/**
 * Return all child nodes; the /originals/. If no predicate is given,
 * use the default one.
 * 
 * @param {String} nb_id - the node to consider
 * @param {String} in_pred - (optional) over this predicate, defaults to all
 * @returns {Array} list of {node}
 */
graph.prototype.get_child_nodes = function(nb_id, in_pred){
    var anchor = this;

    var results = [];
    var edges = this.get_child_edges(nb_id, in_pred);
    each(edges, function(edge){
	// Make sure that any found edges are in our
	// world.
	var sub_id = edge.subject_id();
	var tmp_node = anchor.get_node(sub_id);
	if( tmp_node ){
	    results.push( tmp_node );
	}
    });
    
    return results;
};

/**
 * Return a list with two nested lists, the first is a list of nodes,
 * the second is a list of edges.
 *
 * The argument function takes a node id and 0 or 1 predicates,
 * returns a list of edges from the node in question.
 *
 * @param {Function} walking_fun - function as described above
 * @param {String|Array} nb_id_or_list - the node id(s) to consider
 * @param {String} pid - (optional) over this predicate
 * @returns {Array} as described above
 */
graph.prototype.walker = function(walking_fun, nb_id_or_list, pid){
    var anchor = this;
    
    // Shared data structure to trim multiple paths.
    // Nodes: color to get through the graph quickly and w/o cycles.
    var seen_node_hash = {};
    // Edges: just listed--hashing would be essentially the same
    // as a call to graph.add_edge (I think--benchmark?).
    var seen_edge_list = [];

    // Define recursive ascent.
    function rec_walk(nid){

	//console.log('rec_walk on: ' + nid);

    	var results = [];
    	//var new_parent_edges = anchor.get_parent_edges(nid, pid);
    	var new_area_edges = walking_fun.call(anchor, nid, pid);

	// Capture edge list for later adding.
	each(new_area_edges, function(e){
	    seen_edge_list.push(e);
	});

	// Pull extant nodes from edges. NOTE: This is a retread of
	// what happens in get_parent_nodes to avoid another call to
	// get_parent_edges (as all this is now implemented).
	var new_area_nodes = [];
	each(new_area_edges, function(edge){
	    // Make sure that any found edges are in our world.
	    var obj_id = edge.object_id();
	    var temp_node = anchor.get_node(obj_id);
	    if( temp_node ){
		new_area_nodes.push( temp_node );
	    }
	});

	// Make sure we're in there too.
	var tmp_node = anchor.get_node(nid);
	if( tmp_node ){
	    new_area_nodes.push( tmp_node );
	}

	// Recur on unseen things and mark the current as seen.
    	each(new_area_nodes, function(new_node){
    	    // Only do things we haven't ever seen before.
    	    var new_node_id = new_node.id();
    	    if( ! seen_node_hash[ new_node_id ] ){
    		seen_node_hash[ new_node_id ] = new_node;
    		rec_walk(new_node_id);	
    	    }
    	});

    	return results;
    }
    
    // Recursive call and collect data from search. Make multiple
    // ids possible.
    if( us.isArray(nb_id_or_list) ){
	each(nb_id_or_list, function(item){
	    rec_walk(item);
	});
    }else{
    	rec_walk(nb_id_or_list);
    }
    
    return [
	us.values(seen_node_hash),
	seen_edge_list
    ];
};

/**
 * Return new ancestors subgraph. Single id or id list as first
 * argument. Predicate string/id is optional.
 *
 * @param {String|Array} nb_id_or_list - the node id(s) to consider
 * @param {String} pid - (optional) over this predicate
 * @returns {graph} new bbop model graph
 */
graph.prototype.get_ancestor_subgraph = function(nb_id_or_list, pid){

    var anchor = this;

    var walk_results = 
	anchor.walker(anchor.get_parent_edges, nb_id_or_list, pid);
    var walked_nodes = walk_results[0];
    var walked_edges = walk_results[1];
    
    // Build new graph using data.
    var new_graph = anchor.create_graph();
    each(walked_nodes, function(node){
	new_graph.add_node(node.clone());
    });
    each(walked_edges, function(edge){
	new_graph.add_edge(edge.clone());
    });

    return new_graph;
};

/**
 * Return new descendents subgraph. Single id or id list as first
 * argument. Predicate string/id is optional.
 *
 * @param {String|Array} nb_id_or_list - the node id(s) to consider
 * @param {String} pid - (optional) over this predicate
 * @returns {graph} new bbop model graph
 */
graph.prototype.get_descendent_subgraph = function(nb_id_or_list, pid){

    var anchor = this;

    var walk_results = 
	anchor.walker(anchor.get_child_edges, nb_id_or_list, pid);
    var walked_nodes = walk_results[0];
    var walked_edges = walk_results[1];
    
    // Build new graph using data.
    var new_graph = anchor.create_graph();
    each(walked_nodes, function(node){
	new_graph.add_node(node.clone());
    });
    each(walked_edges, function(edge){
	new_graph.add_edge(edge.clone());
    });

    return new_graph;
};

/**
 * True or false on whether or not a graph shares the same structure
 * as the current graph. This means that the (top-level) nodes have
 * the same IDs and every edge connects in the same way.
 *
 * This does not compare things like meta information, etc.
 * 
 * BUG/TODO: This should probably be moved to the superclass. Would
 * have an easier time optimizing in there too.
 * 
 * @param {graph} comp_graph graph to compare against
 * @returns {Boolean} well is it?
 */
graph.prototype.is_topologically_equal = function(comp_graph){
    var anchor = this;
    var ret = false;

    /// We're going to use a lot of short-ciruits to get out of the
    /// comparison as quickly as possible.

    var base_nodes = anchor.all_nodes();
    var base_edges = anchor.all_edges();
    var comp_nodes = comp_graph.all_nodes();
    var comp_edges = comp_graph.all_edges();
    if( base_nodes.length === comp_nodes.length &&
	base_edges.length === comp_edges.length ){

	    // Cycle over edges first, as they should be more
	    // characteristic.
	    each(base_edges, function(base_edge){
		var edge_p = comp_graph.get_edge(base_edge.subject_id(),
						 base_edge.object_id(),
						 base_edge.predicate_id());
		if( ! edge_p ){
		    return false; // failure to find edge - done
		}
	    });

	    // Cycle over nodes next.
	    each(base_nodes, function(base_node){
		var base_node_id = base_node.id();
		var node_p = comp_graph.get_node(base_node_id);
		if( ! node_p ){
		    return false; // failure to find edge - done
		}
	    });

	    // We got through the gauntlet, I guess we're good to go
	    // now.
	    ret = true;
	}
    
    return ret;
};

/**
 * Add a graph to the current graph, without sharing any of the merged
 * in graph's structure.
 * 
 * No graph metadata is imported unless current graph and metadata are
 * empty.
 * 
 * @param {graph} - graph
 * @returns {boolean} - true; side-effects: more graph
 */
graph.prototype.merge_in = function(in_graph){

    var anchor = this;

    // If our local graph is empty of nodes, edges, and metadata,
    // attempt to load in incoming metadata.
    if( anchor.all_nodes().length === 0 && anchor.all_edges().length === 0 ){
	if( anchor.metadata() === null || us.isEmpty(anchor.metadata()) ){
	    anchor.metadata(us.clone( in_graph.metadata() ));
	}
    }	
    
    // First, load nodes; scrape out what we can.
    each(in_graph.all_nodes(), function(in_node){
	var new_node = in_node.clone();
	anchor.add_node(new_node);
    });

    // Now try to load edges; scrape out what we can.
    each(in_graph.all_edges(), function(in_edge){
	var new_edge = in_edge.clone();
	anchor.add_edge(new_edge);
    });

    return true;
};

/**
 * Load the graph from the specified JSON object (not string).
 * 
 * TODO: a work in progress 'type' not currently imported (just as not
 * exported); actually, a lot not imported.
 *
 * No graph metadata is imported unless current graph and metadata are
 * empty.
 * 
 * This is meant to be an minimal importer for a minimal
 * format. Subclasses should use something else.
 * 
 * @param {object} - JSON object
 * @returns {boolean} - true; side-effects: creates the graph internally
 */
graph.prototype.load_base_json = function(json_object){

    var anchor = this;

    // If our local graph is empty of nodes, edges, and metadata,
    // attempt to load in incoming metadata.
    if( anchor.all_nodes().length === 0 && anchor.all_edges().length === 0 ){
	if( anchor.metadata() === null || us.isEmpty(anchor.metadata()) ){
	    if( json_object.meta ){
		anchor.metadata(us.clone( json_object.meta ));
	    }
	}
    }	
    
    // First, load nodes; scrape out what we can.
    if( json_object.nodes ){
	each(json_object.nodes, function(node_raw){
	    var nid = node_raw.id;
	    var nlabel = node_raw.lbl;
	    var n = anchor.create_node(nid, nlabel);
	    if(node_raw.meta){ n.metadata(node_raw.meta); }
	    anchor.add_node(n);
	});
    }

    // Now try to load edges; scrape out what we can.
    if( json_object.edges ){
	each(json_object.edges, function(edge_raw){
	    var e =
		anchor.create_edge(edge_raw.sub, edge_raw.obj, edge_raw.pred);
	    // Copy out meta.
	    if(edge_raw.meta){ e.metadata(edge_raw.meta); } 
	    
	    anchor.add_edge(e);
	});
    }

    return true;
};

/**
 * Dump out the graph into a JSON-able object.
 * 
 * TODO: a work in progress; 'type' not currently exported (just as
 * not imported). Graph metadata is exported.
 * 
 * @returns {object} - an object that can be converted to a JSON string by dumping.
 */
graph.prototype.to_json = function(){

    var anchor = this;

    // Copy
    var nset = [];
    each(anchor.all_nodes(), function(raw_node){
	
	var node = bbop.clone(raw_node);
	var ncopy = {};
	
	var nid = node.id();
	if(nid){ ncopy['id'] = nid; }
	
	// var nt = node.type();
	// if(nt){ ncopy['type'] = nt; }
	
	var nlabel = node.label();
	if(nlabel){ ncopy['lbl'] = nlabel; }
	
	var nmeta = node.metadata();
	if(nmeta){ ncopy['meta'] = nmeta; }
	
	nset.push(ncopy);
    });
    
    var eset = [];
    var ecopy = bbop.clone(anchor._edge_list);
    each(anchor.all_edges(), function(node){
	var ecopy = {};
	
	var s = node.subject_id();
	if(s){ ecopy['sub'] = s; }
	
	var o = node.object_id();
	if(o){ ecopy['obj'] = o; }
	
	var p = node.predicate_id();
	if(p){ ecopy['pred'] = p; }
	
	eset.push(ecopy);
    });
    
    // New exportable.
    var ret_obj = {'nodes': nset, 'edges': eset};
    
    // Optional graph metadata.
    var mset = null;
    if( anchor.metadata() ){
	ret_obj['meta'] = us.clone(anchor.metadata());
    }
    
    return ret_obj;
};


// Exportable body.
module.exports = {

    node: node,
    edge: edge,
    graph: graph

};
