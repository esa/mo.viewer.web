function d_mal_fundamental(node, target_div) {
	target_div = target_div || divMain
	var tbl = document.createElement("table");
	var tblBody = document.createElement("tbody");

	// Name
	var row = document.createElement("tr");
	row.appendChild(blue_td_with_text("Name"))
	row.appendChild(td_with_text(node.getAttribute("name"), 3))
	tblBody.appendChild(row)

	// Extends
	row = document.createElement("tr");
	row.appendChild(blue_td_with_text("Extends"))
	if (node.childrenByTag("mal:extends")) {
		var super_type = node.childrenByTag("mal:extends")[0]// there only
		// one entry in
		// extends
		row.appendChild(td_with_text(str_mal_node_type(super_type), 3))
	} else {
		row.appendChild(td_with_text("", 3))
	}
	tblBody.appendChild(row)

	// Fundamentals are always abstract
	var row = document.createElement("tr");
	row.appendChild(blue_td_with_text("Abstract", 4))
	tblBody.appendChild(row)

	tbl.appendChild(tblBody);
	target_div.appendChild(tbl);
}

function d_mal_attribute(node, target_div) {
	target_div = target_div || divMain
	var tbl = document.createElement("table");
	var tblBody = document.createElement("tbody");

	// Name
	var row = document.createElement("tr");
	row.appendChild(blue_td_with_text("Name"))
	row.appendChild(td_with_text(node.getAttribute("name"), 3))
	tblBody.appendChild(row)

	// Extends
	row = document.createElement("tr");
	row.appendChild(blue_td_with_text("Extends"))
	row.appendChild(td_with_text(create_type_annotation("Attribute", "MAL/Data/Attribute", null), 3))
	tblBody.appendChild(row)

	// short form part
	if (node.getAttribute("shortFormPart")) {
		var row = document.createElement("tr");
		row.appendChild(blue_td_with_text("Short Form Part"))
		row.appendChild(td_with_text(node.getAttribute("shortFormPart"), 3))
		tblBody.appendChild(row)
	}

	tbl.appendChild(tblBody);
	target_div.appendChild(tbl);
}

function d_mal_composite(node, target_div) {
	target_div = target_div || divMain
	var tbl = document.createElement("table");
	var tblBody = document.createElement("tbody");

	// Name
	var row = document.createElement("tr");
	row.appendChild(blue_td_with_text("Name"))
	row.appendChild(td_with_text(node.getAttribute("name"), 3))
	tblBody.appendChild(row)

	// Extends
	row = document.createElement("tr");
	row.appendChild(blue_td_with_text("Extends"))
	if (node.childrenByTag("mal:extends")) {
		/* Only one node in extends */
		var superType = node.childrenByTag("mal:extends")[0]
		row.appendChild(td_with_text(str_mal_node_type(superType), 3))
	} else {
		row.appendChild(td_with_text("MAL:Composite", 3))
	}
	tblBody.appendChild(row)

	// short form part
	if (node.getAttribute("shortFormPart")) {
		var row = document.createElement("tr");
		row.appendChild(blue_td_with_text("Short Form Part"))
		row.appendChild(td_with_text(node.getAttribute("shortFormPart"), 3))
		tblBody.appendChild(row)
	} else {
		// Abstract
		var row = document.createElement("tr");
		row.appendChild(blue_td_with_text("Abstract", 4))
		tblBody.appendChild(row)
	}
	buildFieldsTable(node, tblBody);

	tbl.appendChild(tblBody);
	target_div.appendChild(tbl);
}

/**
 *
 * @param {Node} node XML node
 * @param {Element} tblBody table body element to insert rows in
 * @param {boolean} inherited if the fields are inherited
 * @param {boolean} headerAdded if a header was already added to the table
 *
 * @returns True if any fields were added
 */
function buildFieldsTable(node, tblBody, inherited = false, headerAdded = false) {
	if (node.childrenByTag("mal:extends")) {
		let superType = node.childrenByTag("mal:extends")[0];
		let { type_str, path_str } = decorateTypeNameAndPath($(superType).children()[0], undefined, "name");
		let parentNode = tree.nodePathMap[path_str].data.xml_node;
		headerAdded = buildFieldsTable(parentNode, tblBody, true, headerAdded);
	}
	// fields
	if (node.childrenByTag("mal:field")) {
		if (!headerAdded) {
			let header_row = tableRow(["Field", "Type", "Nullable", "Comment"]);
			header_row.setAttribute("class", "blue_bg");
			tblBody.appendChild(header_row);
		}

		node.childrenByTag("mal:field").map(
			function (f) {
				let row = document.createElement("tr");
				row.appendChild(td_with_text(f.getAttribute("name")));
				row.appendChild(td_with_text(str_mal_node_type(f)));
				row.appendChild(td_with_text(f.getAttribute("canBeNull") == "true"
					|| f.getAttribute("canBeNull") == null ? "Yes" : "No"));
				let tdl = td_with_text(f.getAttribute("comment"));
				tdl.style.textAlign = "left";
				row.appendChild(tdl);
				if (inherited) {
					row.style.backgroundColor = "#d0d0d0";
				}
				tblBody.appendChild(row);
			});
		return true;
	}
	return false;
}

function d_mal_ip(node, target_div) {
	target_div = target_div || divMain
	var tbl = document.createElement("table");
	var tblBody = document.createElement("tbody");

	d_mal_ip_header(tblBody, node.getAttribute("name"), LONG_NAMES[node.tagName])

	// Body header
	var row = document.createElement("tr");
	row.appendChild(blue_td_with_text("Pattern Sequence"))
	row.appendChild(blue_td_with_text("Message"))
	row.appendChild(blue_td_with_text("Body Signature"))
	tblBody.appendChild(row)

	// messages, assumes only one message entry
	node.eachTag("mal:messages", function (msg) {
		var msgChildren = $(msg).children()
		msgChildren.each(function (c) {
			tblBody.appendChild(tr_mal_message(msgChildren[c]))
		})
	})

	tbl.appendChild(tblBody);
	target_div.appendChild(tbl);

	// draw_errors(node,target_div)
	// draw_comments(node,target_div)
}

function d_mal_ip_header(tblBody, id, ip) {
	// Operation identifier
	var row = document.createElement("tr");
	row.appendChild(blue_td_with_text("Operation Identifier"))
	row.appendChild(td_with_text(id, 2))
	tblBody.appendChild(row)

	// Interaction Pattern
	var row = document.createElement("tr");
	row.appendChild(blue_td_with_text("Interaction Pattern"))
	row.appendChild(gray_td_with_text(ip, 2))
	tblBody.appendChild(row)
}

function tr_mal_message(node, target_div, unique_sufix) {
	target_div = target_div || divMain
	unique_sufix = unique_sufix || gen_suffix()

	var row = document.createElement("tr");
	var tag = node.tagName
	row.appendChild(gray_td_with_text(IN_OR_OUT[tag]))
	row.appendChild(gray_td_with_text(MESSAGE_NAMES[tag]))

	var td = td_with_text("")

	var ul = document.createElement("ul");

	// a field has a name and a type

	for (f in node.childrenByTag("mal:field")) {
		field = node.childrenByTag("mal:field")[f]

		var li = document.createElement("li");
		li.innerHTML = str_mal_node_type(field)// str_mal_field(field)
		li.innerHTML += " "

		var elem_name = document.createElement("a");

		elem_name.innerHTML = field.getAttribute("name")
		li.appendChild(elem_name)

		// comments view
		if (field.getAttribute("comment") && field.getAttribute("comment") != "") {
			// on hover comment
			var comment_div = document.createElement("div");
			var comment_div_id = "comment_" + field.getAttribute("name") + unique_sufix
			var comment_li_id = "li_" + field.getAttribute("name") + unique_sufix
			var elem_name_div_id = "elem_name_" + field.getAttribute("name") + unique_sufix

			li.setAttribute("id", comment_li_id)
			comment_div.setAttribute("id", comment_div_id);
			elem_name.setAttribute("id", elem_name_div_id);
			elem_name.setAttribute("class", "note");

			comment_div.setAttribute("class", "comment");
			comment_div.innerHTML = format_line_breaks(field.getAttribute("comment"))
			li.appendChild(comment_div)

			post_draw.push(comment_management_function(elem_name_div_id, comment_div_id, comment_li_id))
		}
		ul.appendChild(li)
	}

	// only a field not the type
	node.eachTag("mal:type", function (type) {
		var li = document.createElement("li");
		li.innerHTML = str_mal_type(type)
		ul.appendChild(li)

	})

	td.appendChild(ul)
	row.appendChild(td)

	return row
}

function d_mal_service(node, target_div) {
	target_div = target_div || divMain
	var area = node.parentNode

	var tbl = document.createElement("table");
	var tblBody = document.createElement("tbody");

	// ------------------ first blue header ------------------
	var header_row = tableRow(SERVICE_HEADER);
	header_row.setAttribute("class", "blue_bg");
	tblBody.appendChild(header_row)

	out = node
	tblBody.appendChild(tableRow([//
		area.getAttribute("name"), // area identifier
		node.getAttribute("name"), // service identifier
		area.getAttribute("number"), // area number
		node.getAttribute("number"), // service number
		area.getAttribute("version") // area version
	]))

	// -------------------- second blue header ------------------
	var header_row = tableRow(OP_LIST_HEADER);
	header_row.setAttribute("class", "blue_bg");
	tblBody.appendChild(header_row)

	// ---------------------- operations -------------------------
	var operations = []
	// list of operations independently of capability set
	node.eachTag("mal:capabilitySet", function (cs) {
		var csChildren = $(cs).children();
		csChildren.each(function (idx) {
			var ip = csChildren[idx]
			if (typeof ip != 'undefined') {
				// updates list of all operations on parent node
				if (ip.tagName.match(/mal:.*IP/)) {
					// parent node is service
					operations.push($(ip))
				}
			}
		})
	})

	for (opi in operations) {
		op = operations[opi]

		var tRow = tableRow([//
			LONG_NAMES[op[0].tagName],//
			op[0].getAttribute("name"),//
			op[0].getAttribute("number"), // area
			op[0].getAttribute("supportInReplay"), op[0].parentNode.getAttribute("number")])

		// add link to the operation
		var operationCell = tRow.cells[1]

		operationCell.setAttribute("id", gen_suffix())
		operationCell.setAttribute("class", "link")

		// on hover of the cell, show mini view of the operation
		// on click, go there
		postDrawCell = function (node, cell) {
			return function () {
				var jqCell = $("#" + cell.getAttribute("id"))
				jqCell.hover(function () {
					hoverInToMiniview(node, jqCell)
				}, function () {
					hoverOutOfMiniview(node, jqCell)
				})

				jqCell.click(function () {
					hoverOutOfMiniview(node, jqCell)
					selectNodeFromPath(node.tree_node.data.path)
				})
			}
		}
		post_draw.push(postDrawCell(op[0], operationCell))
		tblBody.appendChild(tRow)
	}

	// merge capabilitySets
	// iterates throw the cells, if the capability set matches with the previous
	// then it deletes the cell and increments the row span of the previous
	var prevCapSetCell = null
	for (var r = 0, row; row = tblBody.rows[r]; r++) {
		var currCell = row.cells[4]

		// enters a new capability set
		if (!prevCapSetCell || prevCapSetCell.innerHTML != currCell.innerHTML) {
			prevCapSetCell = currCell
		} else {
			var prevSpan = prevCapSetCell.getAttribute("rowspan") || 1
			prevCapSetCell.setAttribute("rowspan", parseInt(prevSpan) + 1)
			row.deleteCell(4)
		}

	}

	// put the <tbody> in the <table>
	tbl.appendChild(tblBody);

	target_div.appendChild(tbl);

}

function d_mal_enum(node, target_div) {
	target_div = target_div || divMain
	var tbl = document.createElement("table");
	var tblBody = document.createElement("tbody");
	var row

	// name
	row = document.createElement("tr");
	row.appendChild(blue_td_with_text("Name"))
	row.appendChild(td_with_text(node.getAttribute("name"), 2))
	tblBody.appendChild(row);
	// short form
	row = document.createElement("tr");
	row.appendChild(blue_td_with_text("Short Form Part"))
	row.appendChild(td_with_text(node.getAttribute("shortFormPart"), 2))
	tblBody.appendChild(row);

	var header_row = tableRow(ENUM_LIST_HEADER);
	header_row.setAttribute("class", "blue_bg");
	tblBody.appendChild(header_row)

	out = node

	for (it in node.childrenByTag("mal:item")) {
		item = node.childrenByTag("mal:item", it)
		row = document.createElement("tr");
		row.appendChild(td_with_text(item.getAttribute("value")))
		row.appendChild(td_with_text(item.getAttribute("nvalue")))
		row.appendChild(td_with_text(item.getAttribute("comment")))
		tblBody.appendChild(row);
	}

	// put the <tbody> in the <table>
	tbl.appendChild(tblBody);
	target_div.appendChild(tbl);
}

function d_com_events(node, target_div, object_tag) {
	object_tag = object_tag || "com:event"
	d_com_objects(node, target_div, object_tag);
}

function d_com_objects(node, target_div, object_tag) {
	object_tag = object_tag || "com:object"
	target_div = target_div || divMain

	var tbl = document.createElement("table");
	var tblBody = document.createElement("tbody");
	var header_row = tableRow(COM_OBJECT_HEADER);
	header_row.setAttribute("class", "blue_bg");

	tblBody.appendChild(header_row)

	var row

	node.eachTag(object_tag, function (obj) {
		row = document.createElement("tr");
		row.appendChild(td_with_text(obj.getAttribute("name")))
		row.appendChild(td_with_text(obj.getAttribute("number")))

		// object body type
		var obj_body_type
		if (obj.childrenByTag("com:objectType")) {
			obj_body_type = str_mal_type(obj.childrenByTag("com:objectType")[0].childrenByTag("mal:type")[0])
		} else {
			obj_body_type = "No body"
		}
		row.appendChild(td_with_text(obj_body_type))

		// related & source
		var handle_obj_ref = function (typeTag) {
			//console.info(this)
			//console.info(typeTag)

			var refText
			if (this.childrenByTag(typeTag)) {
				var objType = this.childrenByTag(typeTag)[0].childrenByTag("com:objectType")
				// there is a defined type
				if (objType) {
					refText = str_com_type(objType[0])
				} else {
					refText = this.childrenByTag(typeTag)[0].getAttribute("comment")
				}
			} else {
				refText = "Set to NULL"
			}
			return td_with_text(refText)
		}

		row.appendChild(handle_obj_ref.bind(obj)("com:relatedObject"))
		row.appendChild(handle_obj_ref.bind(obj)("com:sourceObject"))

		tblBody.appendChild(row)
	})

	tbl.appendChild(tblBody);
	target_div.appendChild(tbl);
}

function default_drawer(node, target_div) {
	target_div = target_div || divMain
	if (node.getAttributeNames().length > 0)
		draw_table(node, target_div)
}

function draw_table(node, target_div) {
	target_div = target_div || divMain
	var keys = node.getAttributeNames()
	var comment = node.getAttribute("comment")

	if (typeof comment != 'undefined' && comment != null) {
		var index = keys.indexOf("comment")
		keys.splice(index, 1)
	}

	var elements = keys.map(function (k) {
		return node.getAttribute(k)
	})

	// no table to be shown
	if (elements.length == 0) {
		return
	}

	var tbl = document.createElement("table");
	var tblBody = document.createElement("tbody");

	// ------------------ first blue header ------------------
	var header_row = tableRow(keys);
	header_row.setAttribute("class", "blue_bg");
	tblBody.appendChild(header_row)

	tblBody.appendChild(tableRow(elements))

	// put the <tbody> in the <table>
	tbl.appendChild(tblBody);

	target_div.appendChild(tbl);
}

function draw_errors(node, target_div) {
	target_div = target_div || divMain
	// check if errors entry exists, if not, then exit
	if (node.childrenByTag("mal:errors", 0) == null) {
		return
	}

	// assumes only one entry
	var errorsNode = node.childrenByTag("mal:errors", 0)

	// first if entry exists
	if (errorsNode.childrenByTag("mal:errorRef", 0)) {
		var h2 = document.createElement("h2");
		h2.innerHTML = "Errors";
		target_div.appendChild(h2);

		// ------------------ first blue header ------------------
		var tbl = document.createElement("table");
		var tblBody = document.createElement("tbody");

		var header_row = tableRow(ERROR_HEADER);
		header_row.setAttribute("class", "blue_bg");
		tblBody.appendChild(header_row)

		errorsNode.eachTag("mal:errorRef", function (err) {
			// errors
			tblBody.appendChild(tr_errorRef(err))
		})
		// put the <tbody> in the <table>
		tbl.appendChild(tblBody);
		target_div.appendChild(tbl);

	}
}

function draw_documentation(node, target_div) {
	target_div = target_div || divMain
	// ------------------ Documents ---------------------
	node.eachTag("mal:documentation", function (doc) {
		var h2 = document.createElement("h2");
		h2.innerHTML = doc.getAttribute("name")
		target_div.appendChild(h2);
		target_div.innerHTML += doc.textContent;
	})
}

function tr_errorRef(node, target_div) {
	target_div = target_div || divMain
	var row = document.createElement("tr");

	// ------------- error type
	row.appendChild(td_with_text(str_mal_node_type(node, "")))

	// ------------- comment
	var comment = node.getAttribute("comment")
	if (typeof comment != 'undefined' && comment != null) {

		row.appendChild(td_table_comment(node.getAttribute("comment")))

		// row.appendChild(td_with_text(comment))
	} else {
		row.appendChild(td_with_text(""))
	}

	if (node.childrenByTag("mal:extraInformation", 0)) {
		var extraInfo = node.childrenByTag("mal:extraInformation", 0)
		// ------------- Extra Info Type
		row.appendChild(td_with_text(str_mal_node_type(extraInfo)))

		// ------------- Extra Info Comment

		if (extraInfo.getAttribute("comment").length < TABLE_COMMENT_LENGTH_LIMIT) {
			row.appendChild(td_with_text(extraInfo.getAttribute("comment")))
		} else {
			row.appendChild(td_table_comment(extraInfo.getAttribute("comment")))
		}

	} else {
		row.appendChild(td_with_text("Not used", 2))
	}

	return row
}

function td_table_comment(full_comment, unique_sufix) {
	unique_sufix = unique_sufix || gen_suffix()

	if (full_comment.length < TABLE_COMMENT_LENGTH_LIMIT)
		return td_with_text(full_comment);

	var shortComment = full_comment.split(/\s+/).slice(0, COMMENT_MIN_WORDS).join(" ") + "..."

	var hidden_comment_div = document.createElement("div");
	var shown_comment_a = document.createElement("a");

	var hidden_comment_div_id = "hc_" + unique_sufix
	var shown_comment_a_id = "a_" + unique_sufix

	hidden_comment_div.setAttribute("id", hidden_comment_div_id);
	shown_comment_a.setAttribute("id", shown_comment_a_id);

	hidden_comment_div.setAttribute("class", "comment");
	shown_comment_a.setAttribute("class", "note");

	shown_comment_a.innerHTML = shortComment
	hidden_comment_div.innerHTML = format_line_breaks(full_comment)

	var td = td_with_element(shown_comment_a)
	var td_id = "td_" + unique_sufix
	td.setAttribute("id", td_id);

	shown_comment_a.appendChild(hidden_comment_div)

	post_draw.push(comment_management_function(shown_comment_a_id, hidden_comment_div_id, td_id, 0.15, 1));

	return td
}

function draw_comments(node, target_div) {
	target_div = target_div || divMain
	var comment = node.getAttribute("comment")
	if (typeof comment != 'undefined' && comment != null && comment != "") {
		var h2 = document.createElement("h2");
		h2.innerHTML = "Comment";

		target_div.appendChild(h2);
		target_div.innerHTML += format_line_breaks(comment) + "<br/>";
	}

	var note_counter = 1
	node.eachTag("mal:extraInformation", function (ei) {
		var h3 = document.createElement("h3");
		h3.innerHTML = "Note " + note_counter;

		target_div.appendChild(h3);
		target_div.innerHTML += format_line_breaks(ei.getAttribute("comment")) + "<br/>";
		note_counter++
	})
}

function d_pdf(node, target_div) {
	target_div = target_div || divMain

	var pdframe = document.createElement("iframe");
	pdframe.setAttribute("src", node.pdfInfo.pdfFilePath);
	target_div.appendChild(pdframe);
}

function d_xml(node, target_div) {
	if (!target_div) {
		window.open(node.xmlPath, '_blank').focus();
	}
}

drawers = {}
drawers["default"] = default_drawer

// drawers["mal:area"] = d_mal_area
drawers["mal:service"] = d_mal_service

drawers["mal:sendIP"] = d_mal_ip
drawers["mal:submitIP"] = d_mal_ip
drawers["mal:requestIP"] = d_mal_ip
drawers["mal:invokeIP"] = d_mal_ip
drawers["mal:progressIP"] = d_mal_ip
drawers["mal:pubsubIP"] = d_mal_ip

drawers["mal:enumeration"] = d_mal_enum

drawers["mal:fundamental"] = d_mal_fundamental
drawers["mal:attribute"] = d_mal_attribute
drawers["mal:composite"] = d_mal_composite

drawers["com:objects"] = d_com_objects
drawers["com:events"] = d_com_events

drawers["book"] = d_pdf

drawers["xml"] = d_xml
