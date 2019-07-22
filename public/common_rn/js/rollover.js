/*_____________________________________________________________

   Image rollover actions auto setup. (rev004b_JAL_BRANCH2)
_______________________________________________________________*/

// require common.js

/* --- constructor of roll over target object --- */

function JLJS_Rollover_Target (node, exceptCName) {
	if (!node || !node.nodeName) return;

	this.node = node;
	this.exceptCName = (exceptCName) ? exceptCName : '';
	this.classNames = {
		'hover' : 'pseudo-hover'
	};
	this.targets = [];
	this.node._RON_instance_ = this;

	this.setNode();
}

JLJS_Rollover_Target.prototype = {
	setNode : function () {
		if (this.isTargetNode(this.node)) {
			this.targets[this.targets.length] = new JLJS_Rollover_Image(this.node);
		} else {
			var nodes = JLJS.concatNodeList(JLJS.getElementsByTagName('img', this.node), JLJS.getElementsByTagName('input', this.node));
			for (var i = 0; i < nodes.length; i++) {
				if (this.isTargetNode(nodes[i])) {
					this.targets[this.targets.length] = new JLJS_Rollover_Image(nodes[i]);
				}
			}
		}
	},

	isTargetNode : function(node) {
		if (!node || !node.nodeName)
			return false;
		else if (!node.nodeName.match(/^(img|input)$/i))
			return false
		else if (node.nodeName.match(/^input$/i) && !JLJS.getAttr(node, 'type').match(/^image$/i))
			return false
		else if (this.exceptCName && JLJS.classAttr.check(node, this.exceptCName))
			return false
		else
			return true;
	},

	setStatus : function(status) {
		if (!this.node || typeof status != 'string' || this.classNames[status] == 'undefined') return;
		for (var i = 0; i < this.targets.length; i++) {
			this.targets[i].setStatus(status);
		}
		for (var i in this.classNames) {
			JLJS.classAttr.remove(this.node, this.classNames[i]);
		}
		if (this.classNames[status]) {
			JLJS.classAttr.add(this.node, this.classNames[status]);
		}
	}
};


/* --- constructor of roll over target images --- */

function JLJS_Rollover_Image (imgNode) {
	this.fileSuffixPtn   = /\.(jpe?g|gif|png)$/i;
	this.statusSuffixPtn = /_[nso]$/;
	this.statusSuffix    = {
		'normal'  : '_n',
		'hover'   : '_o'
	};
	this.setNode(imgNode);
}

JLJS_Rollover_Image.prototype = {
	setNode : function (imgNode) {
		var src     = JLJS.getAttr(imgNode, 'src');
		var fSuffix = (src)     ? src.match(this.fileSuffixPtn)[0]                                      : null;
		var fStatus = (fSuffix) ? src.replace(this.fileSuffixPtn, '').match(this.statusSuffixPtn)       : null;
		var fRemain = (fStatus) ? src.replace(this.fileSuffixPtn, '').replace(this.statusSuffixPtn, '') : null;

		if (fRemain && fStatus && fSuffix) {
			this.statusSuffix['default'] = fStatus;
			this.src = {};
			for (var i in this.statusSuffix) {
				this.src[i] = fRemain + this.statusSuffix[i] + fSuffix;
			}
			this.node = imgNode;
			this.preloadImage();
		}
	},
	
	preloadImage : function() {
		if (!this.node) return;
		for (var i in this.src) {
			if (this.src[i]) {
				JLJS.preloadImage(this.src[i]);
			}
		}
	},

	setStatus : function (status) {
		if (!this.node || typeof status != 'string' || !this.statusSuffix[status]) return;
		JLJS.setAttr(this.node, 'src', this.src[status]);
	}
};


/* --- rollover main --- */

function JLJS_Rollover_AutoSetup () {
	var targetCName = 'rollover';
	var exceptCName = 'norollover';

	var nodes = JLJS.getElementsByClassName(targetCName);
	for (var i = 0; i < nodes.length; i++) {
		if (nodes[i]._RON_instance_) continue;

		var RON = new JLJS_Rollover_Target(nodes[i], exceptCName);

		if (RON && RON.node && RON.node._RON_instance_) {
			JLJS.addEvent(RON.node, 'mouseover', function (e) {
				var obj = e.currentTarget._RON_instance_;
				obj.setStatus('hover');
			});
			JLJS.addEvent(RON.node, 'mouseout' , function (e) {
				var obj = e.currentTarget._RON_instance_;
				obj.setStatus('default');
			});
		}
	}
}



/* --- register start up method --- */

if (typeof JLJS == 'object' && JLJS.env.DOMok) {
	JLJS.addOnload(JLJS_Rollover_AutoSetup);
}
