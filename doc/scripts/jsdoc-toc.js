(function($) {
    // TODO: make the node ID configurable
    var treeNode = $('#jsdoc-toc-nav');

    // initialize the tree
    treeNode.tree({
        autoEscape: false,
        closedIcon: '&#x21e2;',
        data: [{"label":"<a href=\"module-bbop-graph.html\">bbop-graph</a>","id":"module:bbop-graph","children":[{"label":"<a href=\"module-bbop-graph-edge.html\">edge</a>","id":"module:bbop-graph~edge","children":[]},{"label":"<a href=\"module-bbop-graph-graph.html\">graph</a>","id":"module:bbop-graph~graph","children":[]},{"label":"<a href=\"module-bbop-graph-node.html\">node</a>","id":"module:bbop-graph~node","children":[]}]}],
        openedIcon: ' &#x21e3;',
        saveState: true,
        useContextMenu: false
    });

    // add event handlers
    // TODO
})(jQuery);
