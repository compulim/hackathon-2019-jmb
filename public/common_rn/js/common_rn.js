/*__________________________________________________________

   表示・非表示
_____________________________________________________________*/

function showLAYER(idName){ 

  if(document.getElementById) //NN6,Mozilla,IE5用
    document.getElementById(idName).style.visibility
                                           = 'visible' 
    
  else if(document.all)       //IE4用
    document.all(idName).style.visibility   = 'visible' 
    
  else if(document.layers)    //NN4用
    document.layers[idName].visibility     = 'show' 

}

function hideLAYER(idName){ 

  if(document.getElementById) //NN6,Mozilla,IE5用
    document.getElementById(idName).style.visibility
                                           = 'hidden' 
    
  else if(document.all)       //IE4用
    document.all(idName).style.visibility  = 'hidden' 
    
  else if(document.layers)    //NN4用
    document.layers[idName].visibility     = 'hide' 

}


/*__________________________________________________________

   お客さまのご予約一覧
_____________________________________________________________*/

/* on画像キープ */
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


// ウィンドウ 閉じる
function closeWindow(){
window.close();
}


// フレーム強制解除
if (top != self) { top.location.href = self.location.href }


// 検索エンジン
function isInsiteSearchForm(form) {
	var keyword = form.keyword;
	var value = keyword.value;
	if (!value || (value.match(/[\w| | ]/) && value.length == 1 ||value == JLJS_InsiteSearch.initValue)) {
		alert("2文字以上（漢字を除く）のキーワードを入力し検索ボタンをクリックしてください");
		keyword.value = '';
		JLJS.classAttr.add(keyword, JLJS_InsiteSearch.CLASS_TXBLA);
		keyword.focus();
		return false;
	} else {
		return true;
	}
}
function JLJS_InsiteSearchKeywordEvent() {
	this.initValue = 'JALサイト内検索';
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