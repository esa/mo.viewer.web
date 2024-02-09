/* eslint-disable guard-for-in */
const URL_KEY_NODE = "u";
const URL_KEY_BRANCH = "b";

const treeCompareFunction = (a, b) => a.text.localeCompare(b.text);
/**
 * Recursively generate a tree node structure from a given XML node
 * @param {*} xmlNode
 * @param {*} treeLevel
 * @param {*} parentTreeNode
 */
function parseMoNode(xmlNode, treeLevel = 0, parentTreeNode = null) {
  // skip ommited node types
  if (!OMMITED_NODE_TYPES.includes(xmlNode.tagName)) {
    const nodeDisplayName = treeElementName(xmlNode);
    const newTreeNode = {
      'text': nodeDisplayName,
      'children': [],
      'icon': iconPath(xmlNode.tagName),
      'id': parentTreeNode == null ? nodeDisplayName : (parentTreeNode.id + '_' + nodeDisplayName),
      'data': {
        'path': parentTreeNode == null ? nodeDisplayName : (parentTreeNode.data.path + '/' + nodeDisplayName),
        'xml_node': xmlNode,
      },
    };

    // if it's a root element, i.e. a book
    if (parentTreeNode == null) {
      console.debug('Adding Area: ' + newTreeNode.text);
      tree.data.push(newTreeNode);
      tree.data.sort(treeCompareFunction);

      if (navigator.appName == 'Microsoft Internet Explorer' || !!(navigator.userAgent.match(/Trident/) || navigator.userAgent.match(/rv:11/)) || (typeof $.browser !== 'undefined' && $.browser.msie == 1)) {
        // IE is not supported
      } else {
        // if the book is available as a PDF file
        buildPdfNode(newTreeNode, nodeDisplayName, parentTreeNode);
      }
    } else {
      parentTreeNode.children.push(newTreeNode);
    }

    xmlNode.tree_node = newTreeNode; // link the XML tree node to jsTree node
    tree.nodePathMap[newTreeNode.data.path] = newTreeNode;

    parentTreeNode = newTreeNode;
  }

  // Cannot iterate over Element.children for IE compatibility
  for (let i = 0; i < xmlNode.childNodes.length; ++i) {
    const child = xmlNode.childNodes[i];
    if (child instanceof Element) {
      // Populate Area and Service members and propagate them recursively
      if (child.isTag('mal:area')) {
        child.area = child.getAttribute('name');
      }
      child.area = child.area || child.parentNode.area;

      if (child.isTag('mal:service')) {
        child.service = child.getAttribute('name');
      }
      child.service = child.service || child.parentNode.service;

      parseMoNode(child, treeLevel + 1, parentTreeNode);
    }
  }
}

/**
 *
 * @param {*} newTreeNode
 * @param {*} nodeDisplayName
 * @param {*} parentTreeNode
 */
function buildPdfNode(newTreeNode, nodeDisplayName, parentTreeNode) {
  if (configServiceBookFiles[newTreeNode.text]) {
    // then create a book entry
    const pdf = configServiceBookFiles[newTreeNode.text];
    console.debug('Adding PDF: ' + newTreeNode.text);
    const pdfTreeNode = {
      'text': pdf.name,
      'children': [],
      'icon': iconPath(pdf.icon),
      'id': newTreeNode.id + '_' + nodeDisplayName,
      'data': {
        'path': parentTreeNode == null ? nodeDisplayName : newTreeNode.data.path + '/' + nodeDisplayName,
        // creates a fake XML node
        'xml_node': {
          tagName: 'book',
          pdfInfo: pdf,
        },
      },
    };
    newTreeNode.children.push(pdfTreeNode);
  }
}

/**
 *
 * @param {*} filepath
 * @return {Promise} Promise allowing to track the retrieval status
 */
async function processXMLFile(filepath) {
  // console.info("loading " + filepath);
  jQuery.ajaxSetup({ async: true });

  return $.get(filepath, function (d) {
    parseMoNode(d.documentElement);
  }, 'xml');
}

/**
 *
 * @return {Array<Promise>} Array of promises allowing to track the laod status
 */
function loadMoSpecs() {
  var branch = getUrlParameter(URL_KEY_BRANCH);
  if (branch == null || branch == '' ||
    configServiceDefFiles[branch] === undefined) {
    branch = configDefaultBranch;
    $('#branchSelect').val(branch);
  }
  const promises = [];
  for (const key in configServiceDefFiles[branch]) {
    promises.push(processXMLFile(configServiceDefFiles[branch][key]));
  }
  return promises;
}

/**
 * Selects the node provided in the URL
 */
function selectNodeFromURL() {
  const nodePath = getUrlParameter(URL_KEY_NODE);
  if (typeof nodePath !== 'undefined') {
    selectNodeFromPath(nodePath);
  }
}

/**
 * Selects the node provided in the URL
 * @param {string} nodePathFromTheUrl
 */
function selectNodeFromPath(nodePathFromTheUrl) {
  const tmpNode = tree.nodePathMap[nodePathFromTheUrl];
  if (tmpNode != null) {
    $('#div_tree').jstree('deselect_all');
    $('#div_tree').jstree('select_node', tmpNode.id);
    $('#div_tree').jstree('open_node', tmpNode.id);
  }
}

/**
 * Hover handler for tree nodes
 * @param {*} event
 * @param {*} data
 */
function treeNodeOnHoverHandler(event, data) {
  hoverInToMiniview(data.node.data.xml_node, $('#' + data.node.a_attr.id));
}

/**
 * Un-hover handler for tree nodes
 * @param {*} event
 * @param {*} data
 */
function onDehoverHandler(event, data) {
  hoverOutOfMiniview(data.node.data.xml_node, $('#' + data.node.a_attr.id));
}

/**
 * Select handler for tree nodes
 * @param {*} event
 * @param {*} data
 */
function onSelectHandler(event, data) {
  onNodeSelect(data.node);
}

/**
 * Branch change handler
 * @param {*} event
 */
function onBranchChanged(event) {
  var newBranch = $('#branchSelect').val();
  var oldBranch = getUrlParameter(URL_KEY_BRANCH);
  var curNode = getUrlParameter(URL_KEY_NODE)
  if (typeof oldBranch !== "undefined" && oldBranch !== newBranch) {
    history.pushState({}, "",
      encodeUrlParameters({ [URL_KEY_NODE]: curNode, [URL_KEY_BRANCH]: newBranch }));
    location.reload();
  }
}

window.onload = function () {
  for (const branchName in configServiceDefFiles) {
    $('#branchSelect').append(new Option(branchName, branchName));
  }
  // branch select
  $('#branchSelect').val(getUrlParameter(URL_KEY_BRANCH));
  $('#branchSelect').change(onBranchChanged);

  divMain = document.getElementById('div_main');

  $('#div_tree').on('hover_node.jstree', treeNodeOnHoverHandler);
  $('#div_tree').on('dehover_node.jstree', onDehoverHandler);
  $('#div_tree').on('select_node.jstree', onSelectHandler);

  tree = {};
  tree.nodePathMap = [];
  tree.data = [];
  const promises = loadMoSpecs();
  Promise.all(promises).then(specLoadedCallback);
};

/**
 * Callback for when all the specs are loaded
 */
function specLoadedCallback() {
  $('#div_tree').jstree({
    'core': {
      'multiple': false, // No multiselection
      'animation': false, // No animation
      'data': tree.data,
    },
    'search': {
      'fuzzy': false,
      'show_only_matches': true,
      'show_only_matches_children': true,
    },
    'plugins': ['search'],
  });

  $('#searchbox').on('input', function (e) {
    $('#div_tree').jstree(true).search($('#searchbox').val());
  });

  selectNodeFromURL();
}

$(window).on('popstate', function (e) {
  selectNodeFromURL();
});

function onNodeSelect(tree_node) {
  var xml_node = tree_node.data.xml_node;
  div_main.innerHTML = "";

  // this variable will contain a list of function to be executed after the
  // drawer_func has been called
  post_draw = [];

  var drawer_func = drawers[xml_node.tagName];
  if (typeof drawer_func == 'undefined')
    drawer_func = drawers["default"];

  var nodePath = getUrlParameter(URL_KEY_NODE);
  var curBranch = getUrlParameter(URL_KEY_BRANCH);
  if (typeof nodePath !== "undefined" && nodePath !== tree_node.data.path) {
    history.pushState({}, "",
      encodeUrlParameters({ [URL_KEY_NODE]: tree_node.data.path, [URL_KEY_BRANCH]: curBranch }));
  }
  document.title = tree_node.data.path + " - MO Web Viewer";

  drawer_func(xml_node);
  draw_errors(xml_node);
  draw_documentation(xml_node);
  draw_comments(xml_node);

  for (p in post_draw) {
    post_draw[p]();
  }
}


