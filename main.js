// Recursively generate a jsTree node structure from a given XML node
function mo_parse(xml_node, lvl, parent_tree_node) {
	lvl = lvl || 0
	parent_tree_node = parent_tree_node || null
	// String.prototype.repeat() is not used below for IE compatibility
	var prfx = "";
	while (lvl-- > 0) {
		prfx += ". "
	}

	// skip ommited node types
	// Array.prototype.includes() is not used below for IE compatibility
	if (OMMITED_NODE_TYPES.indexOf(xml_node.tagName) === -1) {
		var display_name = treeElementName(xml_node)
		var new_tree_node = {
			"text": display_name,
			"children": [],
			"icon": iconPath(xml_node.tagName),
			"id": parent_tree_node == null ? display_name : (parent_tree_node.id + "_" + display_name),
			"data": {
				"path": parent_tree_node == null ? display_name : (parent_tree_node.data.path + "/" + display_name),
				"xml_node": xml_node
			}
		}

		//if it's a root element, i.e. a book
		if (parent_tree_node == null) {
			tree.data.push(new_tree_node)

			if (navigator.appName == 'Microsoft Internet Explorer' ||  !!(navigator.userAgent.match(/Trident/) || navigator.userAgent.match(/rv:11/)) || (typeof $.browser !== "undefined" && $.browser.msie == 1))
			{
				//IE is not supported				
			}else
			{
				//if the book is available as a PDF file
				if(configServiceBookFiles[new_tree_node.text]){
					// then create a book entry
					var pdf = configServiceBookFiles[new_tree_node.text]
					console.info(new_tree_node.text);
					var pdf_tree_node = {
						"text": pdf.name,
						"children": [],
						"icon": iconPath(pdf.icon),
						"id": new_tree_node.id + "_" + display_name,
						"data": {
							"path": parent_tree_node == null ? display_name : new_tree_node.data.path + "/" + display_name,
							//creates a fake XML node
							"xml_node": {
								tagName:"book",
								pdfInfo: pdf
							}
						}
					}
					new_tree_node.children.push(pdf_tree_node)
				}
			}
		} else {
			parent_tree_node.children.push(new_tree_node)
		}

		xml_node.tree_node = new_tree_node // link the XML tree node to jsTree node
		tree.nameMap[name] = new_tree_node
		tree.nodePathMap[new_tree_node.data.path] = new_tree_node

		parent_tree_node = new_tree_node
	}

	// Cannot iterate over Element.children for IE compatibility
	for (var i = 0; i < xml_node.childNodes.length; ++i) {
		var child = xml_node.childNodes[i]
		if (child instanceof Element) {
			// Populate Area and Service members and propagate them recursively
			if (child.isTag("mal:area")) {
				child.area = child.getAttribute("name")
			}
			child.area = child.area || child.parentNode.area

			if (child.isTag("mal:service")) {
				child.service = child.getAttribute("name")
			}
			child.service = child.service || child.parentNode.service

			mo_parse(child, lvl + 1, parent_tree_node)
		}
	}
}

function processXMLFile(filepath) {
	// console.info("loading " + filepath);
	jQuery.ajaxSetup({ async: false });

	$.get(filepath, function (d) {
		mo_parse(d.documentElement)
	}, "xml")
}

function loadMoSpecs() {
	for (var key in configServiceDefFiles) {
		processXMLFile(configServiceDefFiles[key]);
	}
}

function selectNodeFromURL() {
	var nodePath = getUrlParameter("u");
	if (typeof nodePath !== "undefined") {
		selectNodeFromPath(nodePath);
	}
}

function selectNodeFromPath(p_node_path) {
	var tmp_node = tree.nodePathMap[p_node_path];
	if (tmp_node != null) {
		$("#div_tree").jstree("deselect_all");
		$("#div_tree").jstree("select_node", tmp_node.id);
		$("#div_tree").jstree("open_node", tmp_node.id);
	}
}

function onHoverHandler(event, data) {
	hoverInToMiniview(data.node.data.xml_node, $("#" + data.node.a_attr.id))
}

function onDehoverHandler(event, data) {
	hoverOutOfMiniview(data.node.data.xml_node, $("#" + data.node.a_attr.id))
}

function onSelectHandler(event, data) {
	onNodeSelect(data.node)
}

window.onload = function () {
	div_tree = document.getElementById('div_tree');
	div_main = document.getElementById('div_main');

	$("#div_tree").on("hover_node.jstree", onHoverHandler)
	$("#div_tree").on("dehover_node.jstree", onDehoverHandler)
	$("#div_tree").on("select_node.jstree", onSelectHandler)

	tree = {}
	tree.nodePathMap = []
	tree.nameMap = {}
	tree.data = []
	loadMoSpecs();

	$("#div_tree").jstree({
		"core": {
			"multiple": false, // No multiselection
			"animation": false, // No animation
			"data": tree.data
		},
		"search": {
			"fuzzy": false,
			"show_only_matches": true,
			"show_only_matches_children": true
		},
		"plugins": ["search"]
	});

	$("#searchbox").on('input', function (e) {
		$("#div_tree").jstree(true).search($("#searchbox").val());
	});

	selectNodeFromURL();
}

$(window).on("popstate", function (e) {
	selectNodeFromURL();
})
