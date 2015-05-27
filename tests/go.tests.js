////
//// The GO makes a nice test case.
////

var assert = require('chai').assert;
var model = new require('..');

///
/// Start unit testing.
///

describe('test using GO data', function(){

    var go_nodes = null;
    var go_edges = null;

    // Pre-run.    
    before(function() {
	// Remember, we are running from the project root, so relative
	// to there (?).
	go_nodes = require('./go.nodes.json');
	go_edges = require('./go.edges.json');
    });

    it('all good', function(){
	this.timeout(30000); // 30s

	// Global testing graph.
	var g = new model.graph();

	// Add all nodes.
	//print('all nodes len: ' + bbop.model.go.nodes.length);
	for( var n = 0; n < go_nodes.length; n++ ){
	    var jnode = go_nodes[n];
	    //print('index: ' + n + ' jnode: ' + jnode['id']);
	    g.add_node(new model.node(jnode['id']));
	}
	
	// Add all edges.
	// print('all edges len: ' + bbop.model.go.edges.length);
	for( var e = 0; e < go_edges.length; e++ ){
	    var jedge = go_edges[e];
	    //print('index: ' + e);
	    g.add_edge(new model.edge(jedge['subject'],
				      jedge['object'],
				      jedge['predicate']));
	}
	
	//
	assert.equal(3, g.get_root_nodes().length);//, 'right number of GO roots');
	assert.equal(false, g.is_leaf_node('GO:0022008'));//, 'neurogenesis ! a leaf');
	assert.equal(true, g.is_leaf_node('GO:0048174'));//, 'but this should be');
	
	// Let's get serious about parents.
	var p_hash = {};
	var parents = g.get_parent_nodes('GO:0022008');
	for( var i = 0; i < parents.length; i++ ){
	    p_hash[ parents[i].id() ] = true;
	}
	assert.equal(2, parents.length);//, '2 parents');
	assert.equal(true, p_hash['GO:0007399']);//, 'has 1 of 2');
	assert.equal(true, p_hash['GO:0030154']);//, 'has 2 of 2');
	
	// Let's get serious about children.
	var c_hash = {};
	var children = g.get_child_nodes('GO:0022008');
	for( var j = 0; j < children.length; j++ ){
	    c_hash[ children[j].id() ] = true;
	}
	assert.equal(5, g.get_child_nodes('GO:0022008').length);//, '5 kids');
	assert.equal(true, c_hash['GO:0048699']);//, 'has 1 of 5');
	assert.equal(true, c_hash['GO:0042063']);//, 'has 2 of 5');
	assert.equal(true, c_hash['GO:0050768']);//, 'has 3 of 5');
	assert.equal(true, c_hash['GO:0050769']);//, 'has 4 of 5');
	assert.equal(true, c_hash['GO:0050767']);//, 'has 5 of 5');
	
	// ファイト!
	var sub = g.get_ancestor_subgraph('GO:0022008');
	// Roots.
	assert.equal(1, sub.get_root_nodes().length);//, '1 sub root');
	assert.equal(true, sub.is_root_node('GO:0008150'));//, 'sub root');
	assert.equal(false, sub.is_root_node('GO:0032502'));//, '! sub root 1');
	assert.equal(false, sub.is_root_node('GO:0022008'));//, '! sub root 2');
	// Leaves.
	assert.equal(1, sub.get_leaf_nodes().length);//, '1 leaf');
	assert.equal('GO:0022008', sub.get_leaf_nodes()[0].id());//, 'pig leaf');
	assert.equal(true, sub.is_leaf_node('GO:0022008'));//, 'sub leaf');
	// Graph structure up.
	assert.equal(0, sub.get_parent_nodes('GO:0008150').length);//, '8150 root');
	assert.equal(2, sub.get_parent_nodes('GO:0022008').length);//, 'pig 2 up');
	assert.equal(1, sub.get_parent_nodes('GO:0030154').length);//, 'cell 1 up');
	// Graph structure down.
	assert.equal('GO:0048869', sub.get_child_nodes('GO:0009987')[0].id());//, 'to proc');
	// General.
	assert.equal(11, sub.all_nodes().length);//, '11 nodes');
		
    });

});
