/*__________________________________________________________

   Define common variables and methods (rev007_JAL_BRANCH_6)

_____________________________________________________________*/

function JLJScommon() {
	this.env  = {};
	this.ns   = {};
	this.prfx = {};
	this.geom = {};

	this.env.ua	   = navigator.userAgent;
	this.env.isMac	   = this.env.ua.match(/Mac/);
	this.env.isWin	   = this.env.ua.match(/Win/);
	this.env.isNN	   = document.layers;
	this.env.isGecko   = this.env.ua.match(/Gecko\//);
	this.env.geckoPSub = this.getGeckoProductSub();
	this.env.isSafari  = this.env.ua.match(/AppleWebKit/);
	this.env.isOpera   = window.opera;
	this.env.isIE	   = (document.all && !this.env.isOpera);
	this.env.DOMok	   = (document.documentElement && document.getElementsByTagName);
	this.ns.rootNS	   = (this.env.DOMok) ? document.documentElement.namespaceURI : null;
	this.ns.xhtml1	   = 'http://www.w3.org/1999/xhtml';
	this.ns.jalattrs   = 'urn:jal.attrs';
	this.prfx.jalattrs = 'jalattrs:';

	this.showErrMsg   = false;
//	this.showErrMsg   = true;
	window.onerror	  = this.errorHandler;
}

JLJScommon.prototype = {
	openWindow : function (url, title, width, height, options) {
		if (!url)	  return;
		if (window.event) window.event.returnValue = false;
		if (!title)	  title   = '_blank';
		if (!options) {
			options = (title == 'popup_brand') ?
			    'toolbar=no,location=no,directories=no,status=yes,menubar=no,scrollbars=no,resizable=no,favorites=no'	:
			    'toolbar=no,location=no,directories=no,status=yes,menubar=no,scrollbars=yes,resizable=yes,favorites=no';
		}
		var geom   = 'width=' + width + ',height=' + height;
		var newWin = window.open(url, title, geom  + ',' + options);
		newWin.focus();
	},

	preloadImage : function(src) {
		if (!document.images || !src) return null;
		var img = new Image();
		img.src = src;
		return img;
	},

	getElementsByTagName : function(tagName, baseNode) {
		if (!tagName) return null;
		if (tagName.toLowerCase() == 'body' && document.body) return [document.body]; // measure for Netscape7.1
		if (!baseNode || !baseNode.nodeType || baseNode.nodeType != 1) baseNode = document;

		if (baseNode == document && tagName == '*' && document.all) {
			var elms = document.all, ret = [];
			for (var i = 0; i < elms.length; i++) {
				if (elms[i].nodeType == 1) {
					ret[ret.length] = elms[i];
				}
			}
			return ret;
		}
		return (!baseNode.getElementsByTagName) ?
			null :
			(JLJS.ns.rootNS) ? baseNode.getElementsByTagNameNS(JLJS.ns.xhtml1, tagName) :
					   baseNode.getElementsByTagName(tagName);
	},

	getElementsByClassName : function(className, tagName, baseNode) {
		if (!className) return null;
		if (!tagName) tagName = '*';
		var ret  = [];
		var objs = JLJS.getElementsByTagName(tagName, baseNode);
		for (var i = 0; i < objs.length; i++) {
			if (!objs[i].className) continue;
			var classes = objs[i].className.split(' ');
			for (var j = 0; j < classes.length; j++)
				if (classes[j] == className) { ret[ret.length] = objs[i]; break; }
		}
		return ret;
	},

	concatNodeList : function() {
		var ret = [];
		if (typeof arguments[0] != 'object' && typeof arguments[0] != 'function') // Safari returns 'function' when arg is [NodeList]
			return ret;
		for (var i = 0; i < arguments.length; i++)
			for (var j = 0; j < arguments[i].length; j++) 
				ret[ret.length] = arguments[i][j];
		return ret;
	},


	createElement : function(tagName) {
		return (JLJS.ns.rootNS) ?
			document.createElementNS(JLJS.ns.xhtml1, tagName) :
			document.createElement(tagName);
	},

	createText : function(str, node) {
		if (!str || !node || node.nodeType != 1) return;
		if (JLJS.env.isMac && JLJS.env.isIE && JLJS.env.ua.match(/MSIE 5.0/))
			node.innerHTML += str;
		else
			node.appendChild(document.createTextNode(str));
		return node;
	},

	getAttr : function(node, attr) {
		if (!node || !attr || node.nodeType != 1) return null;
		var msIeNum = "0";
		if(JLJS.env.ua.match(/MSIE/)){
			msIeNum = JLJS.env.ua.substring(JLJS.env.ua.indexOf("MSIE"));
			msIeNum = msIeNum.substring(0, msIeNum.indexOf(";"));
			msIeNum = msIeNum.replace("MSIE ","");
		}
		attr += (document.all && attr == 'class' && !(parseInt(msIeNum) >= 8 && document.documentMode >= 8)) ? 'Name' : ''; // Measure for IE
		var ret = node.getAttribute(attr);
		if (!ret && node.getAttributeNS && attr.match(/:/)) {
			var prfx = attr.split(':')[0];
			var attr = attr.split(':')[1];
			return node.getAttributeNS(JLJS.ns[prfx], attr)
		} else
			return ret;
	},

	setAttr : function(node, attr, value) {
		if (!node || !attr) return;
		if (attr.match(/:/)) {
			var prfx = attr.split(':')[0];
			var attr = attr.split(':')[1];
			if (node.setAttributeNS && node.namespaceURI || JLJS.env.isSafari)
				node.setAttributeNS(JLJS.ns[prfx], attr, value);
			else {
				node.setAttribute('xmlns:' + prfx, JLJS.ns[prfx]);
				node.setAttribute(prfx + ':' + attr, value);
			}
		} else {
			var msIeNum = "0";
			if(JLJS.env.ua.match(/MSIE/)){
				msIeNum = JLJS.env.ua.substring(JLJS.env.ua.indexOf("MSIE"));
				msIeNum = msIeNum.substring(0, msIeNum.indexOf(";"));
				msIeNum = msIeNum.replace("MSIE ","");
			}
			attr += (document.all && attr == 'class' && !(parseInt(msIeNum) >= 8 && document.documentMode >= 8)) ? 'Name' : ''; // Measure for IE
			node.setAttribute(attr, value);
		}
	},

	classAttr : {
		check : function(node, value) {
			var ret = false;
			if (node && value && JLJS.getAttr(node, 'class')) {
				var names = JLJS.getAttr(node, 'class').split(' ');
				for (var i = 0; i < names.length && !ret; i++)
					ret = (names[i] == value)
			}
			return ret;
		},
		
		add : function(node, value) {
			if (!node)
				return null;
			if (value && !JLJS.classAttr.check(node, value))
				JLJS.setAttr(node, 'class', ((node.className) ? node.className + ' ' + value : value))
			return JLJS.getAttr(node, 'class');
		},
	
		remove : function(node, value) {
			if (!node)
				return null;
			if (value && JLJS.classAttr.check(node, value)) {
				var names  = JLJS.getAttr(node, 'class').split(' ');
				var nNames = [];
				for (var i = 0; i < names.length; i++)
					if (names[i] != value)
						nNames[nNames.length] = names[i];
				JLJS.setAttr(node, 'class', nNames.join(' '));
			}
			return JLJS.getAttr(node, 'class');
		}
	},

	getInnerText : function(node) {
		var nodes = node.childNodes, ret = [];
		for (var i = 0; i < nodes.length; i++)
			if (nodes[i].hasChildNodes())
				ret[ret.length] = JLJS.getInnerText(nodes[i]);
			else if (nodes[i].nodeType == 3 /* Node.TEXT_NODE */)
				ret[ret.length] = nodes[i].nodeValue;
			else if (nodes[i].alt)
				ret[ret.length] = nodes[i].alt;
		return ret.join('').replace(/\s+/g, ' ');
	},

	getOffset : function(obj, axis, sum) {
		if (!sum) var sum = 0;
		sum += (axis == 'X')	  ? obj.offsetLeft : obj.offsetTop;
		return (obj.offsetParent) ? JLJS.getOffset(obj.offsetParent, axis, sum) : sum;
	},

	getFirstCellsInAxis : function(tableCellNode) {
		var ret = { col : null, row : null }
		if (tableCellNode && tableCellNode.nodeName && tableCellNode.nodeName.match(/^(td|th)$/i)) {
			var parentTable = ( function (node) {
					return (!node || !node.nodeName) ?
						null : (node.nodeName.match(/^table$/i)) ?
							node : arguments.callee(node.parentNode);
				} )(tableCellNode);
			var colNum = ( function (node, cnt) {
					if (!cnt) cnt = 0;
					return (!node) ?
						cnt - 1 : arguments.callee(node.previousSibling, cnt + ((node.nodeName.match(/^(td|th)$/i)) ? 1 : 0));
				} ) (tableCellNode);
			ret.col = JLJS.getNthCellInRow(JLJS.getElementsByTagName('tr', parentTable)[0], colNum);
			ret.row = JLJS.getNthCellInRow(tableCellNode.parentNode, 0);
		}
		return ret;
	},

	getNthCellInRow : function(tableRowNode, num) {
		var ret = null;
		if (tableRowNode && tableRowNode.nodeName && tableRowNode.nodeName.match(/^tr$/i) && num > -1) {
			var node = tableRowNode.firstChild;
			var cnt  = -1;
			while (node) {
				if (node.nodeName.match(/^th|td/i)) cnt++;
				if (num == cnt) { ret = node; break; }
				node = node.nextSibling;
			}
		}
		return ret;
	},

	normalizeEmptyTextNode : function (baseNode) {
		if (!baseNode || baseNode.nodeType != 1 || (JLJS.env.isIE && JLJS.env.isMac)) return;
		(function (curNode) {
			for (var i = 0; i < curNode.childNodes.length; i++) {
				var node = curNode.childNodes[i];
				 if (node.nodeType == 3 && node.nodeValue.match(/^\s*$/))  {
					node.parentNode.removeChild(node);
					i--;
				} else if (node.nodeType == 1 && node.hasChildNodes()) {
					arguments.callee(node);
				}
			}
		})(baseNode);
	},

	processDuringLoad : function(fn, wait) {
		if (!JLJS.psDuringLoad) JLJS.psDuringLoad = [];
		if (!wait) var wait = 500;
		fn();
		JLJS.psDuringLoad[JLJS.psDuringLoad.length] = setInterval(fn, wait);
		JLJS.addOnload(fn);
		JLJS.addOnload(JLJS.clearProcessDuringLoad);
	},
	
	clearProcessDuringLoad : function(){
		if (!JLJS.psDuringLoad) return;
		for (var i = 0; i < JLJS.psDuringLoad.length; i++)
			clearInterval(JLJS.psDuringLoad[i]);
	},
	
	addEvent : function(obj, type, listener) {
		if(!obj || !type || !listener) return;
		if (obj.addEventListener) {  // Std DOM Events
			obj.addEventListener(type, listener, false);
		} else {
			if (obj.attachEvent) {	 // WinIE
					obj.attachEvent(
						'on' + type,
						function() { listener( {
							type		: window.event.type,
							target		: window.event.srcElement,
							currentTarget	: obj,
							clientX 	: window.event.clientX,
							clientY 	: window.event.clientY,
							pageX		: (document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft) + window.event.clientX,
							pageY		: (document.documentElement.scrollTop  ? document.documentElement.scrollTop  : document.body.scrollTop ) + window.event.clientY,
							stopPropagation : function() { window.event.cancelBubble = true  },
							preventDefault	: function() { window.event.returnValue  = false }
						} ) }
					);
			} else {		 // MacIE
				var exists = obj['on' + type];
			    obj['on' + type]  = (exists) ?
					function() {
						exists();
						listener( {
							type		: window.event.type,
							target		: window.event.srcElement,
							currentTarget	: obj,
							clientX 	: window.event.clientX,
							clientY 	: window.event.clientY,
							pageX		: (document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft) + window.event.clientX,
							pageY		: (document.documentElement.scrollTop  ? document.documentElement.scrollTop  : document.body.scrollTop ) + window.event.clientY,
							stopPropagation : function() { window.event.cancelBubble = true  },
							preventDefault	: function() { window.event.returnValue  = false }
						} );
					} : function() {
						listener( {
							type		: window.event.type,
							target		: window.event.srcElement,
							currentTarget	: obj,
							clientX 	: window.event.clientX,
							clientY 	: window.event.clientY,
							pageX		: (document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft) + window.event.clientX,
							pageY		: (document.documentElement.scrollTop  ? document.documentElement.scrollTop  : document.body.scrollTop ) + window.event.clientY,
							stopPropagation : function() { window.event.cancelBubble = true  },
							preventDefault	: function() { window.event.returnValue  = false }
						} )
					};
			}
		}
	},

	addOnload : function(listener) {
		JLJS.addEvent(window, 'load', listener)
	},

	getMousePos : function(e) {
		var w = window;
		var d = document.documentElement;
		var b = d.getElementsByTagName('body')[0];
		var isMacIE = (JLJS.env.isMac && JLJS.env.isIE);

		JLJS.geom.scrollX = (w.scrollX) ? w.scrollX : (d.scrollLeft) ? d.scrollLeft : b.scrollLeft;
		JLJS.geom.scrollY = (w.scrollY) ? w.scrollY : (d.scrollTop)  ? d.scrollTop  : b.scrollTop;
		JLJS.geom.windowW = (w.innerWidth)  ? w.innerWidth  : (!isMacIE) ? d.offsetWidth : b.scrollWidth;
		JLJS.geom.windowH = (w.innerHeight) ? w.innerHeight : (!isMacIE) ? d.offsetHeight: b.scrollHeight;
		JLJS.geom.pageW   = (!isMacIE) ? b.scrollWidth	: d.offsetWidth;
		JLJS.geom.pageH   = (!isMacIE) ? b.scrollHeight : d.offsetHeight;
		JLJS.geom.windowX = e.clientX - (( JLJS.env.isSafari) ? JLJS.geom.scrollX : 0);
		JLJS.geom.windowY = e.clientY - (( JLJS.env.isSafari) ? JLJS.geom.scrollY : 0);
		JLJS.geom.mouseX  = e.clientX + ((!JLJS.env.isSafari) ? JLJS.geom.scrollX : 0);
		JLJS.geom.mouseY  = e.clientY + ((!JLJS.env.isSafari) ? JLJS.geom.scrollY : 0);

		// for debug
		/*
		window.status = 'windowX:'    + JLJS.geom.windowX + ' / windowY:' + JLJS.geom.windowY
			      + ' / scrollX:' + JLJS.geom.scrollX + ' / scrollY:' + JLJS.geom.scrollY
			      + ' / left:'    + JLJS.geom.mouseX  + ' / top:'	  + JLJS.geom.mouseY;
		*/
	},

	getGeckoProductSub : function() {
		if (!navigator.productSub || this.env.isSafari) return null;
		return parseInt(navigator.productSub);
	},

	errorHandler : function() {
		if (JLJS.showErrMsg) {
			var msg = 'Error: ' + arguments[0] + '\n' +
				  'File: '  + arguments[1] + '\n' + 
				  'Line: '  + arguments[2];
			alert(msg);
		}
		return true;
	}
};



/* ------ JLJS_collapseBlock ------ */

function JLJS_collapseBlock (targetBlockId, controllerId, switcherElementName) {
	if (!targetBlockId || !controllerId) return;
	if (!switcherElementName) switcherElementName = 'a';
	this.target   = document.getElementById(targetBlockId);
	this.control  = document.getElementById(controllerId);
	this.switcher = (this.control) ? JLJS.getElementsByTagName(switcherElementName, this.control) : [];
	this.init();
}

JLJS_collapseBlock.prototype = {
	init : function () {
		if (!this.target || !this.switcher[0]) return;
		this.target.style.display      = 'none';
		this.switcher[0].style.display = 'none';
		this.switcher[1].style.display = 'inline';
	},

	toggle : function () {
		this.target.style.display      = (this.target.style.display	 == 'none'  ) ? 'block'  : 'none'  ;
		this.switcher[0].style.display = (this.switcher[0].style.display == 'none'  ) ? 'inline' : 'none'  ;
		this.switcher[1].style.display = (this.switcher[1].style.display == 'inline') ? 'none'	 : 'inline';
	}
}



/* ------ normalize empty textnodes in footer ------ */

function normalizeEmptyTextnodesInFooter() {
	var ids = ['globalFooterA01', 'globalFooterA02', 'globalFooterA03', 'sectionNavigationA01'];
	for (var i in ids) {
		JLJS.normalizeEmptyTextNode(document.getElementById(ids[i]));
	}
}




/* ----- main (startup) ----- */

var JLJS = new JLJScommon;
window.focus();
JLJS.addOnload(normalizeEmptyTextnodesInFooter);


/* ----- activecontents (060609add) ----- */
function JLJS_AddExtension(src, ext)
{
  if (src.indexOf('?') != -1)
    return src.replace(/\?/, ext+'?');	
  else
    return src + ext;
}

function JLJS_Generateobj(objAttrs, params, embedAttrs) 
{ 
  var str = '<object ';
  for (var i in objAttrs)
    str += i + '="' + objAttrs[i] + '" ';
  str += '>';
  for (var i in params)
    str += '<param name="' + i + '" value="' + params[i] + '" /> ';
  str += '<embed ';
  for (var i in embedAttrs)
    str += i + '="' + embedAttrs[i] + '" ';
  str += ' ></embed></object>';

  document.write(str);
}

function JLJS_FL_RunContent(){
  var ret =	
    JLJS_GetArgs
    (  arguments, ".swf", "movie", "clsid:d27cdb6e-ae6d-11cf-96b8-444553540000"
     , "application/x-shockwave-flash"
    );
  JLJS_Generateobj(ret.objAttrs, ret.params, ret.embedAttrs);
}

function JLJS_GetArgs(args, ext, srcParamName, classid, mimeType){
  var ret = new Object();
  ret.embedAttrs = new Object();
  ret.params = new Object();
  ret.objAttrs = new Object();
  for (var i=0; i < args.length; i=i+2){
    var currArg = args[i].toLowerCase();	

    switch (currArg){	
      case "classid":
	break;
      case "pluginspage":
	ret.embedAttrs[args[i]] = args[i+1];
	break;
      case "src":
      case "movie":	
	args[i+1] = JLJS_AddExtension(args[i+1], ext);
	ret.embedAttrs["src"] = args[i+1];
	ret.params[srcParamName] = args[i+1];
	break;
      case "onafterupdate":
      case "onbeforeupdate":
      case "onblur":
      case "oncellchange":
      case "onclick":
      case "ondblClick":
      case "ondrag":
      case "ondragend":
      case "ondragenter":
      case "ondragleave":
      case "ondragover":
      case "ondrop":
      case "onfinish":
      case "onfocus":
      case "onhelp":
      case "onmousedown":
      case "onmouseup":
      case "onmouseover":
      case "onmousemove":
      case "onmouseout":
      case "onkeypress":
      case "onkeydown":
      case "onkeyup":
      case "onload":
      case "onlosecapture":
      case "onpropertychange":
      case "onreadystatechange":
      case "onrowsdelete":
      case "onrowenter":
      case "onrowexit":
      case "onrowsinserted":
      case "onstart":
      case "onscroll":
      case "onbeforeeditfocus":
      case "onactivate":
      case "onbeforedeactivate":
      case "ondeactivate":
      case "type":
      case "codebase":
	ret.objAttrs[args[i]] = args[i+1];
	break;
      case "width":
      case "height":
      case "align":
      case "vspace":	
      case "hspace":
      case "class":
      case "title":
      case "accesskey":
      case "name":
      case "id":
      case "tabindex":
	ret.embedAttrs[args[i]] = ret.objAttrs[args[i]] = args[i+1];
	break;
      default:
	ret.embedAttrs[args[i]] = ret.params[args[i]] = args[i+1];
    }
  }
  ret.objAttrs["classid"] = classid;
  if (mimeType) ret.embedAttrs["type"] = mimeType;
  return ret;
}
