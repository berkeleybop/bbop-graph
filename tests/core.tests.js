////
//// Some unit testing for bbop-graph.
////

var assert = require('chai').assert;
var model = new require('..');

//console.log(">>>: ", model);

describe('node', function(){

    it('works at all', function(){

	// Setup.
	var n1 = new model.node('a');
	
	//mr_t.is_defined(n1, 'at least this would be nice (node)');
	
	assert.equal('a', n1.id(), 'is a');
	assert.equal('node', n1.type(), 'is a node');
	
	n1.id('b');
	
	assert.equal('b', n1.id(), 'is b');
    });

});

describe('edges', function(){

    // Setup.
    var n1 = null;
    var n2 = null;
    var n3 = null;
    var e1 = null;
    var e2 = null;
    var e3 = null;
    
    // Pre-run.    
    before(function() {
	// Setup.
	n1 = new model.node('a');
	n2 = new model.node('b');
	n3 = new model.node('c');
	
	e1 = new model.edge(n1, n2);
	e2 = new model.edge(n2, n3, 'foo');
	e3 = new model.edge('d', 'e', 'bar');
    });

    it('basically functional', function(){
	
	assert.isDefined(e1, 'at least this would be nice (edge 1)');
	assert.isDefined(e2, 'at least this would be nice (edge 2)');
	assert.isDefined(e2, 'at least this would be nice (edge 3)');
	
	assert.equal('a', e1.subject_id(), 'is a');
	assert.equal('b', e1.object_id(), 'is b');
	assert.equal('e', e3.object_id(), 'is e');
	
	assert.equal(e1.default_predicate, e1.predicate_id(), 'is p');
	assert.equal('foo', e2.predicate_id(), 'is p 2');
	
    });
});

describe('simple model', function(){

    var g = null;
    var dpred = null;	

    // Pre-run.    
    before(function() {
	// Create graph described below.
	//
	//      a   n   x   z  
	//     / \  |   |
	//    b   c |   y?  <-- y is not extant, just referenced
	//   ||  / \|
	//   || e   d
	//    \\___//  <-- non-default relationship (d is_a b)
	//     \---/
	//
	g = new model.graph();
	g.add_node(new model.node('a'));
	g.add_node(new model.node('b'));
	g.add_node(new model.node('c'));
	g.add_node(new model.node('d'));
	g.add_node(new model.node('e'));
	g.add_node(new model.node('n'));
	g.add_node(new model.node('x'));
	g.add_node(new model.node('z'));
	g.add_edge(new model.edge('b', 'a'));
	g.add_edge(new model.edge('c', 'a'));
	g.add_edge(new model.edge('d', 'c'));
	g.add_edge(new model.edge('e', 'c'));
	g.add_edge(new model.edge('d', 'n'));
	g.add_edge(new model.edge('d', 'b', 'is_a'));
	g.add_edge(new model.edge('y', 'x'));

	dpred = g.default_predicate;
    });	
    
    it('graph construction', function(){

	assert.isDefined(g, 'at least this would be nice (graph)');
	assert.equal(8, g.all_nodes().length, '7 nodes');
	assert.equal(7, g.all_edges().length, '7 edges');
	assert.equal(7, g.all_edges().length, '7 edges');
	assert.equal(1, g.get_singleton_nodes().length, 'just one single');
	assert.equal('z', g.get_singleton_nodes()[0].id(), 'z alone');
	assert.equal(1, g.all_dangling().length, 'just one dangle');
	assert.equal(false, g.is_complete(), 'nope'); 
    });
    
    it('leaf correctness', function(){

	assert.equal(false, g.is_leaf_node('a'), '! leaf a');
	assert.equal(false, g.is_leaf_node('b'), '! leaf b');
	assert.equal(false, g.is_leaf_node('c'), '! leaf c');
	assert.equal(true, g.is_leaf_node('d'), 'leaf d');
	assert.equal(true, g.is_leaf_node('e'), 'leaf e');
	assert.equal(false, g.is_leaf_node('n'), '! leaf n');
	assert.equal(false, g.is_leaf_node('x'), '! leaf z');
	assert.equal(false, g.is_leaf_node('y'), '! leaf y');
	assert.equal(true, g.is_leaf_node('z'), 'leaf z');
	assert.equal(3, g.get_leaf_nodes().length, '3 leaves');
    });
    
    it('root correctness', function(){

	assert.equal(true, g.is_root_node('a'), 'root a');
	assert.equal(false, g.is_root_node('b'), '! root b');
	assert.equal(false, g.is_root_node('c'), '! root c');
	assert.equal(false, g.is_root_node('d'), '! root d');
	assert.equal(false, g.is_root_node('e'), '! root e');
	assert.equal(true, g.is_root_node('n'), 'root n');
	assert.equal(true, g.is_root_node('x'), 'root z');
	assert.equal(false, g.is_root_node('y'), '! root y');
	assert.equal(true, g.is_root_node('z'), 'root z');
	assert.equal(4, g.get_root_nodes().length, '4 roots');
    });
    
    it('graph structure up', function(){

	assert.equal(0, g.get_parent_nodes('a').length, 'a is root');
	assert.equal(1, g.get_parent_nodes('b').length, 'b under a (1)');
	assert.equal('a', g.get_parent_nodes('b')[0].id(), 'b under a (2)');
	assert.equal(3, g.get_parent_nodes('d').length, 'd: b c n');
	assert.equal(2, g.get_parent_nodes('d', dpred).length, 'd: c n');
	assert.equal(1, g.get_parent_nodes('d', 'is_a').length, 'd: b');
    });
    
    it('graph structure down', function(){

	assert.equal(2, g.get_child_nodes('a').length, 'a has 2');
	assert.equal(1, g.get_child_nodes('b').length, 'b has 1');
	assert.equal('d', g.get_child_nodes('b')[0].id(), 'b: d 1');
	assert.equal(0, g.get_child_nodes('b', dpred).length, 'b: d 2');
	assert.equal('d', g.get_child_nodes('b', 'is_a')[0].id(), 'b: d 3');
	assert.equal(0, g.get_child_nodes('d').length, 'd: -');
	assert.equal(0, g.get_child_nodes('z').length, 'z: -');
	assert.equal(0, g.get_child_nodes('x').length, 'x: -');
    });
    
    it('edges and predicates', function(){

	//g.add_edge(new model.edge('d', 'b', 'is_a'));
	var med = g.get_edges('d', 'b');
	assert.equal(med.length, 1, 'one edge');
	assert.equal(med[0].predicate_id(), 'is_a', 'one edge is_a');
	var mrel = g.get_predicates('d', 'b');
	assert.equal(mrel.length, 1, 'one pred');
	assert.equal(mrel[0], 'is_a', 'one pred is_a');
    });
    
    it('subgraph test 1', function(){

	var sub1 = g.get_ancestor_subgraph('d');
	// Roots.
	assert.equal(true, sub1.is_root_node('a'), 'root a');
	assert.equal(true, sub1.is_root_node('n'), 'root n');
	assert.equal(false, sub1.is_root_node('x'), '! root x');
	assert.equal(2, sub1.get_root_nodes().length, '2 roots');
	// Leaves.
	assert.equal(1, sub1.get_leaf_nodes().length, '1 leaf');
	assert.equal('d', sub1.get_leaf_nodes()[0].id(), 'd leaf');
	// Graph structure up.
	assert.equal(0, sub1.get_parent_nodes('a').length, 'a is root');
	assert.equal(1, sub1.get_parent_nodes('b').length, 'b under a (1)');
	assert.equal('a', sub1.get_parent_nodes('b')[0].id(), 'b under a (2)');
	assert.equal(3, sub1.get_parent_nodes('d').length, 'd: b c n');
	assert.equal(2, sub1.get_parent_nodes('d', dpred).length, 'd: c n');
	assert.equal(1, sub1.get_parent_nodes('d', 'is_a').length, 'd: b');
	// Graph structure down.
	assert.equal(2, sub1.get_child_nodes('a').length, 'a has 2');
	assert.equal(1, sub1.get_child_nodes('b').length, 'b has 1');
	assert.equal('d', sub1.get_child_nodes('b')[0].id(), 'b: d 1');
	assert.equal(0, sub1.get_child_nodes('b', dpred).length, 'b: d 2');
	assert.equal('d', sub1.get_child_nodes('b', 'is_a')[0].id(), 'b: d 3');
	assert.equal(0, sub1.get_child_nodes('d').length, 'd: -');
    });
    
    it('subgraph test 2', function(){

	var sub2 = g.get_ancestor_subgraph('d', 'is_a');
	// Roots.
	assert.equal(false, sub2.is_root_node('a'), '! root a');
	assert.equal(false, sub2.is_root_node('d'), '! root d');
	assert.equal(true, sub2.is_root_node('b'), 'root b');
	// Leaves.
	assert.equal(1, sub2.get_leaf_nodes().length, '1 leaf');
	assert.equal('d', sub2.get_leaf_nodes()[0].id(), 'd leaf');
	// Graph structure up.
	assert.equal(0, sub2.get_parent_nodes('b').length, 'b root');
	assert.equal(1, sub2.get_parent_nodes('d').length, 'd: b');
	assert.equal(0, sub2.get_parent_nodes('d', dpred).length, 'd: -');
	assert.equal(1, sub2.get_parent_nodes('d', 'is_a').length, 'd: b');
	// Graph structure down.
	assert.equal('d', sub2.get_child_nodes('b')[0].id(), 'b: d 1');
	assert.equal(0, sub2.get_child_nodes('b', dpred).length, 'b: d 2');
	assert.equal('d', sub2.get_child_nodes('b', 'is_a')[0].id(), 'b:d 3');
	assert.equal(0, sub2.get_child_nodes('d').length, 'd: -');
    });

});

// Test cases from owltools.graph.shunt junit test cases.
describe('loading from JSON (good with Solr/GOlr)', function(){

    var g1 = null;
    var g2 = null;

    // Pre-run.    
    before(function() {

	var jo = {"nodes":[{"id":"a","lbl":"A"},{"id":"b","lbl":"B"}],"edges":[{"sub":"a","obj":"b","pred":"is_a"}]};
	g1 = new model.graph();
	g1.load_json(jo);

	// A bit of GO.
	// Generate from:
	//    cd ~/local/src/svn/owltools/OWLTools-Runner
	//    ./bin/owltools --solr-shunt-test
	var go = {"nodes":[{"id":"GO:0009987","lbl":"cellular process"},{"id":"GO:0048869","lbl":"cellular developmental process"},{"id":"GO:0048731","lbl":"system development"},{"id":"GO:0007275","lbl":"multicellular organismal development"},{"id":"GO:0030154","lbl":"cell differentiation"},{"id":"GO:0007399","lbl":"nervous system development"},{"id":"GO:0048856","lbl":"anatomical structure development"},{"id":"GO:0008150","lbl":"biological_process"},{"id":"GO:0022008","lbl":"neurogenesis"},{"id":"GO:0042063","lbl":"gliogenesis"},{"id":"GO:0032502","lbl":"developmental process"},{"id":"GO:0032501","lbl":"multicellular organismal process"},{"id":"GO:0048699","lbl":"generation of neurons"}],"edges":[{"sub":"GO:0022008","obj":"GO:0007399","pred":"part_of"},{"sub":"GO:0042063","obj":"GO:0022008","pred":"is_a"},{"sub":"GO:0022008","obj":"GO:0030154","pred":"is_a"},{"sub":"GO:0032501","obj":"GO:0008150","pred":"is_a"},{"sub":"GO:0032502","obj":"GO:0008150","pred":"is_a"},{"sub":"GO:0048731","obj":"GO:0048856","pred":"is_a"},{"sub":"GO:0007399","obj":"GO:0048731","pred":"is_a"},{"sub":"GO:0007275","obj":"GO:0032501","pred":"is_a"},{"sub":"GO:0007275","obj":"GO:0032502","pred":"is_a"},{"sub":"GO:0048856","obj":"GO:0032502","pred":"is_a"},{"sub":"GO:0048869","obj":"GO:0009987","pred":"is_a"},{"sub":"GO:0048699","obj":"GO:0022008","pred":"is_a"},{"sub":"GO:0048869","obj":"GO:0032502","pred":"is_a"},{"sub":"GO:0009987","obj":"GO:0008150","pred":"is_a"},{"sub":"GO:0030154","obj":"GO:0048869","pred":"is_a"},{"sub":"GO:0048731","obj":"GO:0007275","pred":"part_of"}]};
	g2 = new model.graph();
	g2.load_json(go);
    });

    it('graph one okay', function(){

	assert.isTrue(g1.is_root_node('b'), 'root b');
	assert.isFalse(g1.is_root_node('a'), '! root a');
	assert.equal('b', g1.get_parent_nodes('a')[0].id(), 'b under a');
    });

    it('graph two okay', function(){
	
	var leaves = g2.get_child_nodes('GO:0022008');
	assert.equal(leaves.length, 2, 'two children for GO:0022008');
	
	var leaf1 = leaves[0];
	var leaf2 = leaves[1];
	assert.includeMembers(['GO:0042063', 'GO:0048699'], [leaf1.id()],
			      'either of the two kids (1)');
	assert.includeMembers(['GO:0042063', 'GO:0048699'], [leaf2.id()],
			      'either of the two kids (2)');
	assert.notEqual(leaf1.id(), leaf2.id(),
			'the children are different');
	assert.equal(g2.get_child_nodes('GO:0022008', 'part_of').length, 0,
		     'no part_of kids');
	assert.equal(g2.get_child_nodes('GO:0022008', 'is_a').length, 2,
		     'two is_a kids');
    });
});

describe('failing case from the taxslim', function(){

    // Pre-run.    
    before(function() {
    });

    it('check', function(){

	var tax = 
	    {"nodes": [
		{"id":"NCBITaxon:33316","lbl":"Coelomata"},
		{"id":"NCBITaxon:2759","lbl":"Eukaryota"},
		{"id":"NCBITaxon:117565","lbl":"Hyperotreti"},
		{"id":"NCBITaxon:33154","lbl":"Fungi/Metazoa group"},
		{"id":"NCBITaxon:1","lbl":"root"},
		{"id":"NCBITaxon:7742","lbl":"Vertebrata"},
		{"id":"NCBITaxon:7711","lbl":"Chordata"},
		{"id":"NCBITaxon:89593","lbl":"Craniata"},
		{"id":"NCBITaxon:6072","lbl":"Eumetazoa"},
		{"id":"NCBITaxon:131567","lbl":"cellular organisms"},
		{"id":"NCBITaxon:33511","lbl":"Deuterostomia"},
		{"id":"NCBITaxon:33213","lbl":"Bilateria"},
		{"id":"NCBITaxon:33208","lbl":"Metazoa"}
	    ],
	     "edges": [
		 {"sub":"NCBITaxon:33208","obj":"NCBITaxon:33154","pred":"is_a"},
		 {"sub":"NCBITaxon:33154","obj":"NCBITaxon:2759","pred":"is_a"},
		 {"sub":"NCBITaxon:6072","obj":"NCBITaxon:33208","pred":"is_a"},
		 {"sub":"NCBITaxon:33316","obj":"NCBITaxon:33213","pred":"is_a"},
		 {"sub":"NCBITaxon:2759","obj":"NCBITaxon:131567","pred":"is_a"},
		 {"sub":"NCBITaxon:89593","obj":"NCBITaxon:7711","pred":"is_a"},
		 {"sub":"NCBITaxon:33511","obj":"NCBITaxon:33316","pred":"is_a"},
		 {"sub":"NCBITaxon:7711","obj":"NCBITaxon:33511","pred":"is_a"},
		 {"sub":"NCBITaxon:33213","obj":"NCBITaxon:6072","pred":"is_a"},
		 {"sub":"NCBITaxon:7742","obj":"NCBITaxon:89593","pred":"is_a"},
		 {"sub":"NCBITaxon:131567","obj":"NCBITaxon:1","pred":"is_a"},
		 {"sub":"NCBITaxon:117565","obj":"NCBITaxon:89593","pred":"is_a"}
	     ]
	    };
	
	var g = new model.graph();
	var result2 = g.load_json(tax);
	
	assert.isTrue(g.is_complete(), 'tax is complete');
	
	var leaves = g.get_child_nodes('NCBITaxon:89593');
	assert.equal(2, leaves.length, 'two children for NCBITaxon:89593');
	var root_kids = g.get_child_nodes('NCBITaxon:1');
	assert.equal(1, root_kids.length, 'one kid for root');
	assert.equal('NCBITaxon:131567', root_kids[0].id(),
		     'and the one root kid is NCBITaxon:131567');
	
    });
});

describe('roundtrip', function(){

    // Pre-run.    
    before(function() {
    });

    it('original obj and json', function(){
	
	var simp = {"nodes":[{"id":"a","lbl":"A"},{"id":"b","lbl":"B"}],"edges":[{"sub":"a","obj":"b","pred":"is_a"}]};
	var g = new model.graph();
	var l = g.load_json(simp);
	var r = g.to_json();
	assert.deepEqual(simp, r, 'round trip');
    });
    
});

