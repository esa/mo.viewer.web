//DOM patches
Node.prototype.getAttributeNames = Node.prototype.getAttributeNames || function () {
	var y = this;
	return Object.keys(y.attributes).map(function (x) {
		return y.attributes[x].name
	})
}

// DOM Addons
// index is optional, if < 0 then returns the full array, otherwise, the
// position in the provided index
Node.prototype.childrenByTag = function (tag, index) {
	if (typeof index == 'undefined')
		index = -1
	var self = this
	if (self.tagMap) {
		if (index <= -1)
			return self.tagMap[tag]
		if (self.tagMap[tag])
			return self.tagMap[tag][index]

		return null;
	}

	// if here, then initiate the map
	self.tagMap = {}
	var children = $(self).children();
	children.each(function (c) {
		self.tagMap[children[c].tagName] = self.tagMap[children[c].tagName] || []
		self.tagMap[children[c].tagName].push(children[c])
	})

	// now we're sure the map has been initiated
	return self.childrenByTag(tag, index)
}

Node.prototype.isTag = function (tag) {
	var self = this
	return (self.tagName == tag)
}

Node.prototype.eachTag = function (tag, func) {
	var self = this
	if (self.childrenByTag(tag)) {
		self.childrenByTag(tag).map(function (n) {
			func(n)
		})
	}
}

// Constants

TABLE_COMMENT_LENGTH_LIMIT = 80
COMMENT_MIN_WORDS = 12

SERVICE_HEADER = ["Area Identifier", "Service Identifier", "Area Number", "Service Number", "Area Version"]

OP_LIST_HEADER = ["Interaction Pattern", "Operation Identifier", "Operation Number", "Support in Replay",
	"Capability Set"]

ENUM_LIST_HEADER = ["Enumeration Value", "Numerical Value", "Comment"]

ERROR_HEADER = ["Error", "Comment", "Extra Info - Type", "Extra Info - Comment"]

COM_OBJECT_HEADER = ["Object Name", "Object Number", "Object Body Type", "Related points to", "Source points to"]

LONG_NAMES = {
	"mal:errors": "Errors",
	// interaction patterns
	"mal:sendIP": "Send",
	"mal:submitIP": "Submit",
	"mal:requestIP": "Request",
	"mal:invokeIP": "Invoke",
	"mal:progressIP": "Progress",
	"mal:pubsubIP": "Pub-Sub",
	// COM
	"com:events": "Events",
	"com:objects": "Objects",
	// Others
	"mal:dataTypes": "Data",

}

MESSAGE_NAMES = {
	"mal:send": "Send",
	"mal:invoke": "Invoke",
	"mal:acknowledgement": "Ack",
	"mal:response": "Response",
	"mal:request": "Request",
	"mal:progress": "Progress",
	"mal:update": "Update",
	"mal:submit": "Submit",
	"mal:publishNotify": "Publish / Notify",
}

IN_OR_OUT = {
	"mal:invoke": "IN",
	"mal:request": "IN",
	"mal:progress": "IN",
	"mal:submit": "IN",
	"mal:send": "IN",

	"mal:update": "OUT",
	"mal:acknowledgement": "OUT",
	"mal:response": "OUT",
	"mal:publishNotify": "OUT",
}

// these nodes will be processed but skipped from the tree. their children will
// be the children of these' nodes parents
OMMITED_NODE_TYPES = ["mal:specification", "mal:capabilitySet", "mal:documentation", "mal:messages", "com:features",
	"mal:errorRef", "mal:errors",
	// "mal:dataTypes",
	"mal:item", "mal:type", "mal:extends", "mal:field", "mal:extraInformation",
	// IP related
	"mal:invoke", "mal:acknowledgement", "mal:response", "mal:request", "mal:progress", "mal:update", "mal:submit",
	"mal:publishNotify", "mal:send"
	// COM related
	, "com:object", "com:event"
	, "com:objectType", "com:sourceObject", "com:relatedObject"
]

OMMITED_TYPE_NAME_IN_TREE = ["mal:area", "mal:service", "mal:fundamental", "mal:attribute", "mal:composite", "mal:error",]

TAG_TO_ICON = {
	"unknown": "fff/asterisk_yellow.png",

	"mal:area": "fff/report.png",
	"mal:service": "fff/page_white_stack.png",
	"mal:sendIP": "fff/page_white.png",
	"mal:requestIP": "fff/page.png",
	"mal:submitIP": "fff/page_green.png",
	"mal:progressIP": "fff/page_red.png",
	"mal:invokeIP": "fff/page_purple.png",
	"mal:pubsubIP": "fff/page_orange.png",

	"mal:errorRef": "fff/link_error.png",

	"mal:fundamental": "fff/tag_blue.png",
	"mal:attribute": "fff/tag_green.png",
	"mal:enumeration": "fff/tag_red.png",

	"mal:error": "fff/error.png",
	"mal:errors": "fff/page_error.png",

	"mal:dataTypes": "fff/bricks.png",
	"mal:composite": "fff/brick.png",
	// COM types
	"com:events": "fff/page_bell.png",
	"com:event": "fff/bell.png",
	"com:object": "fff/database.png",
	"com:objects": "fff/page_white_database.png",

	//pdf
	"book": "fff/book.png",
	"book_red": "fff/book_red.png",
}

function iconPath(tag) {
	if (tag in TAG_TO_ICON) {
		return "icons/" + TAG_TO_ICON[tag]
	}
	return "icons/" + TAG_TO_ICON["unknown"];
}

function tableRow(headers) {
	var row = document.createElement("tr");

	// header row
	for (str_cnt in headers) {
		var cell = document.createElement("td");
		cell.innerHTML = headers[str_cnt];
		row.appendChild(cell)
	}
	return row
}

function treeElementTag(element) {
	var tag = element.tagName

	// shows only node name, but not the type (e.g. 'mal:area' will never be
	// shown)
	// Array.prototype.includes() is not used below for IE compatibility
	if (OMMITED_TYPE_NAME_IN_TREE.indexOf(tag) !== -1) {
		tag = null
	} else if (tag in LONG_NAMES) {
		tag = LONG_NAMES[tag]
	}
	return tag
}

function treeElementName(element) {
	var name

	if (element.getAttribute("name") == null) {
		name = treeElementTag(element)
	} else {
		name = element.getAttribute("name")
	}
	return name
}

function format_line_breaks(text) {
	if (text == null) {
		return null
	}
	return text.replace(/\n/g, "\n<br/>")
}

// ------------------ Table helpers ----------------------

function td_with_element(elem) {
	var cell = document.createElement("td");
	cell.appendChild(elem)
	return cell
}

function td_with_text(text, span) {
	span = span || 1
	var cell = document.createElement("td");
	cell.innerHTML = format_line_breaks(text)
	if (span > 1)
		cell.setAttribute("colspan", span)
	return cell
}

function blue_td_with_text(text, span) {
	span = span || 1
	var cell = td_with_text(text, span)
	cell.setAttribute("class", "blue_bg");
	return cell
}

function gray_td_with_text(text, span) {
	span = span || 1
	var cell = td_with_text(text, span)
	cell.setAttribute("class", "gray_bg");
	return cell
}

function str_mal_node_type(node, path_prefix) {
	return str_mal_type($(node).children()[0], path_prefix)
}

function str_mal_type(type, path_prefix) {
	return str_type(type, path_prefix, "name")
}
function str_com_type(type, path_prefix) {
	return str_type(type, path_prefix, "number")
}

function create_type_annotation(type_str, path_str, is_list) {
	var type_annotation = document.createElement("a")
	type_annotation.setAttribute("id", "type_" + gen_suffix())
	type_annotation.innerHTML = type_str

	// cannot access here, because the element has not yet been added to the
	// document, so it uses the post_draw
	post_draw.push(function () {
		var t_ann = $("#" + type_annotation.getAttribute("id"))
		if (tree.nodePathMap[path_str]) {
			t_ann.addClass("link")
			var xml_node = tree.nodePathMap[path_str].data.xml_node

			t_ann.hover(function () {
				hoverInToMiniview(xml_node, t_ann)
			}, function () {
				hoverOutOfMiniview(xml_node, t_ann)
			})

			t_ann.click(function () {
				hoverOutOfMiniview(xml_node, t_ann)
				selectNodeFromPath(path_str)
			})
		} else {
			//	t_ann.addClass("error")
		}
	})

	if (is_list == "true") {
		return "List&lt;" + type_annotation.outerHTML + "&gt; "
	} else {
		return type_annotation.outerHTML
	}
}

function str_type(type, path_prefix, id_type) {
	path_prefix = (typeof path_prefix == 'undefined') ? "Data/" : path_prefix
	var type_str = ""
	var path_str = ""

	var appendIf = function (a) {
		if (type.getAttribute(a)) {
			type_str += type.getAttribute(a) + ":"
			path_str += type.getAttribute(a) + "/"
		}
	}

	appendIf("area")
	appendIf("service")

	type_str += type.getAttribute(id_type)
	path_str += path_prefix + type.getAttribute(id_type)

	// remove current area from type
	if (type.area) {
		var area_prefix = type.area + ":"
		if (type_str.indexOf(area_prefix) == 0)
			type_str = type_str.slice(type_str.indexOf(area_prefix) + area_prefix.length)
	}

	// remove current service from type
	if (type.service) {
		var service_prefix = type.service + ":"
		if (type_str.indexOf(service_prefix) == 0)
			type_str = type_str.slice(type_str.indexOf(service_prefix) + service_prefix.length)
	}
	return create_type_annotation(type_str, path_str, type.getAttribute("list"))
}

function str_mal_field(node) {
	return str_mal_type(node) + " " + node.getAttribute("name")
}

// it returns a function that will hide/show the divs upon mouse hoover¡
// it is necessary hack due to variable scope
// if we were to simply pass the function, then the same 'comment_div_id'
// variable reference (and others)
// would pushed in (post_draw.push) on all calls
// this way, the comment_management_function creates a context/scope, and it is
// that scope that defines the function
function comment_management_function(trigger_div_id, comment_div_id, reference_position_div_id, relWidth, relHeight) {
	relWidth = relWidth || 1
	relHeight = relHeight || 1
	return function () {
		$('#' + trigger_div_id).on("mouseover", function () {
			var w = Math.trunc($('#' + reference_position_div_id).width() * relWidth)
			var h = Math.trunc($('#' + reference_position_div_id).height() * relHeight)

			$('#' + comment_div_id).css('margin-left', w + 'px');
			$('#' + comment_div_id).css('margin-top', '-' + h + 'px');

			$('#' + comment_div_id).show();
		}).on("mouseout", function () {
			$('#' + comment_div_id).hide();
		});
	}
}

function hoverInToMiniview(node, element) {
	$("#notification_bar").html(node.tagName)

	var miniview = $("#div_miniview")
	$(element).append(miniview)

	drawers[node.tagName] = drawers[node.tagName] || drawers["default"]

	miniview.html("")

	var l = $(element).offset().left + $(element).width();
	miniview.css('left', l + 'px');
	miniview.css('top', $(element).offset().top + 'px');

	drawers[node.tagName](node, miniview[0])

	// hide if there is nothing to show
	if (miniview.html() == "") {
		$(document.body).append(miniview)// moves away from the tree
		miniview.hide();
		// ugly hack.. sometimes the hide is ignored, with this timeout it
		// retries (if still empty div)
		setTimeout(function () {
			if (miniview.html() == "")
				miniview.hide();
		}, 500);
	} else {
		miniview.fadeIn(200);
	}
}

function hoverOutOfMiniview(node, element) {
	var miniview = $("#div_miniview")
	miniview.hide()
	$(document.body).append(miniview)// moves away from the tree
}

function gen_suffix() {
	return (new Date() * Math.ceil((Math.random() * 1000000)))
}

/**
	This function is used instead of URLSearchParams.get() for IE compatibility.
*/
function getUrlParameter(name) {
	name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
	var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
	var results = regex.exec(location.search);
	return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};

function onNodeSelect(tree_node) {
	var xml_node = tree_node.data.xml_node
	div_main.innerHTML = ""

	// this variable will contain a list of function to be executed after the
	// drawer_func has been called
	post_draw = []

	var drawer_func = drawers[xml_node.tagName]
	if (typeof drawer_func == 'undefined')
		drawer_func = drawers["default"]

	var nodePath = getUrlParameter("u");
	if (typeof nodePath !== "undefined" && nodePath !== tree_node.data.path) {
		var stateObj = {};
		history.pushState(stateObj, tree_node.data.path, "?u=" + tree_node.data.path);
	}
	document.title = tree_node.data.path + " - MO Web Viewer";

	drawer_func(xml_node);
	draw_errors(xml_node);
	draw_documentation(xml_node);
	draw_comments(xml_node);

	for (p in post_draw) {
		post_draw[p]()
	}
}
