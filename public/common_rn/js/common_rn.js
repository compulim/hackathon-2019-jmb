/*__________________________________________________________

   �\���E��\��
_____________________________________________________________*/

function showLAYER(idName){ 

  if(document.getElementById) //NN6,Mozilla,IE5�p
    document.getElementById(idName).style.visibility
                                           = 'visible' 
    
  else if(document.all)       //IE4�p
    document.all(idName).style.visibility   = 'visible' 
    
  else if(document.layers)    //NN4�p
    document.layers[idName].visibility     = 'show' 

}

function hideLAYER(idName){ 

  if(document.getElementById) //NN6,Mozilla,IE5�p
    document.getElementById(idName).style.visibility
                                           = 'hidden' 
    
  else if(document.all)       //IE4�p
    document.all(idName).style.visibility  = 'hidden' 
    
  else if(document.layers)    //NN4�p
    document.layers[idName].visibility     = 'hide' 

}


/*__________________________________________________________

   ���q���܂̂��\��ꗗ
_____________________________________________________________*/

/* on�摜�L�[�v */
function cdatadomimg() {
	document.cDataLiDomImg.src = "/common_rn/img/parts_side_li_dom_001_o.gif";
}
function cdatadomimgO() {
	document.cDataLiDomImg.src = "/common_rn/img/parts_side_li_dom_001_n.gif";
}
function cdataintimg() {
	document.cDataLiIntImg.src = "/common_rn/img/parts_side_li_int_001_o.gif";
}
function cdataintimgO() {
	document.cDataLiIntImg.src = "/common_rn/img/parts_side_li_int_001_n.gif";
}


/*__________________________________________________________

   common
_____________________________________________________________*/


// �E�B���h�E ����
function closeWindow(){
window.close();
}


// �t���[����������
if (top != self) { top.location.href = self.location.href }


// �����G���W��
function isInsiteSearchForm(form) {
	var keyword = form.keyword;
	var value = keyword.value;
	if (!value || (value.match(/[\w| | ]/) && value.length == 1 ||value == JLJS_InsiteSearch.initValue)) {
		alert("2�����ȏ�i�����������j�̃L�[���[�h����͂������{�^�����N���b�N���Ă�������");
		keyword.value = '';
		JLJS.classAttr.add(keyword, JLJS_InsiteSearch.CLASS_TXBLA);
		keyword.focus();
		return false;
	} else {
		return true;
	}
}
function JLJS_InsiteSearchKeywordEvent() {
	this.initValue = 'JAL�T�C�g������';
	this.CLASS_TXBLA = 'txBla';
}
JLJS_InsiteSearchKeywordEvent.prototype = {
	onload : function(form) {
		if(form && form.keyword){
			var keywordElem = form.keyword;
			JLJS_InsiteSearch.onblur(keywordElem);
			keywordElem.blur();
		}
	},
	onblur : function(node) {
		if (node.value == '' || node.value == this.initValue) {
			node.value = this.initValue;
			JLJS.classAttr.remove(node, this.CLASS_TXBLA);
		}else{
			JLJS.classAttr.add(node, this.CLASS_TXBLA);
		}
		return false;
	},
	onfocus : function(node) {
		if (node.value == this.initValue){
			node.value = '';
		}
		JLJS.classAttr.add(node, this.CLASS_TXBLA);

		return false;
	}
}
var JLJS_InsiteSearch = new JLJS_InsiteSearchKeywordEvent();
function JLJS_InsiteSearchScope() {
	if(typeof ScopeManager == "function") {
		if(JLJS.env.isIE == true) {
			var version = navigator.appVersion.substr(navigator.appVersion.indexOf("MSIE ",0)+5,1);
			if(version < 7) {
				return;
			}
		}
		var scopeManager = new ScopeManager();
		if(document.getElementById("keyword01")) {
			scopeManager.goSuggest("keyword01");
		}
	}
}
JLJS.addOnload(
	function() {
		JLJS_InsiteSearch.onload(document.forms['InsiteSearchForm']);
		JLJS_InsiteSearchScope();
	}
);