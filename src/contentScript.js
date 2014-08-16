/*
・正規表現やクラス、ラベル文字列のパターンを読み込む
・ローカルストレージのセーブデータを読み込む
・・checkSave [] = {userType:1,myClass:hoge,checked:true}
・スタイル要素を作る。セーブデータから読み込んだデフォルトを書き出す
・既にあるニコレポに独自のクラス要素をくっつける
・ニコレポが新しく追加された時に独自のクラスをくっつけるイベントリスナを追加する
・トグルエリアを作る。セーブデータから読み込まれたデフォルトをチェック状態に反映する
*/
(function(){
	var nicorepFilter={};
	var version=0;//1=原宿 2=ゼロ＆Ｑ
	var localStorageKey="nicoReportFilter_chromeExtFushihara";
	var classPrefix="nicoReportFilter_chromeExtFushihara";
	var checkToDisplay="-check-display";
	var checkToHidden ="-check-hidden";
	//切り替え出来る要素
	var contents=[];
	//userType:1=ユーザーが 2=コミュニティが 3=企業のチャンネルが
	var contentsAdd=function(label,userType,userClass,harajuku,q){
		contents.push({
			"label":label,
			"userType":userType,
			"userClass":userClass,
			"harajuku":harajuku,
			"q":q
		});
	};
	var contentsSearch=function(userType,userClass){
		var r=null,i;
		for(var i=0;i<contents.length;i++){
			if(contents[i].type!="pat"){return false;}
			if(contents[i].userClass!=userClass){return false;}
			if(contents[i].userType!=userType){return false;}
			return i;
		}
		return -1;
	};
	//追加出来るかどうか
	var init=function(){
		var initState;
		load();
		contentsAdd("動画を投稿"    ,1,"movie-post",[/動画を投稿しました/],["log-user-video-upload"]);
		contentsAdd("イラストを投稿",1,"illust-post",[/イラストを投稿しました/],["log-user-seiga-image-upload"]);
		contentsAdd("マンガを投稿",1,"manga-post",[/マンガ.*?の.*?を投稿しました/],["log-user-manga-episode-upload"]);
		contentsAdd("動画追加"    ,2,"movie-post",[/動画が追加されました/],["log-community-video-upload"]);
		contentsAdd("動画追加"    ,3,"movie-post",[/動画が追加されました/],["log-community-video-upload"]);
		contentsAdd("生放送を予約"  ,1,"nama-yoyaku",[/で生放送をから予約しました/],["log-user-live-reserve"]);
		contentsAdd("生放送を予約"  ,2,"nama-yoyaku",[/さんがに生放送を予約しました/],["log-community-live-reserve"]);
		contentsAdd("生放送を予約"  ,3,"nama-yoyaku",[/さんがに生放送を予約しました。/],["log-community-live-reserve"]);
		contentsAdd("生放送を開始"  ,1,"nama-start",[/で生放送を開始しました/],["log-user-live-broadcast"]);
		contentsAdd("生放送を開始"  ,2,"nama-start",[/さんが生放送を開始しました。/],["log-community-live-broadcast"]);
		contentsAdd("生放送を開始"  ,3,"nama-start",[/生放送を開始しました/],["log-community-live-broadcast"]);
		contentsAdd("ブロマガを投稿",1,"blog-post",[/ブロマガを投稿しました/],["log-user-register-chblog"]);
		contentsAdd("ブロマガを投稿",3,"blog-post",[/記事が追加されました/],["log-community-register-chblog"]);
		contentsAdd("アプリ開始",1,"app-start",[/ニコニコアプリを遊びはじめました/],["log-user-app-install"]);
		contentsAdd("ブロマガをマイリスト登録",1,"blog-fav",[/ブロマガをマイリスト登録しました/],["log-user-mylist-add-blomaga"]);
		contentsAdd("ニコニ広告で宣伝",1,"ad",[/動画をニコニ広告で宣伝しました/],["log-user-uad-advertise"]);
		contentsAdd("動画をマイリスト登録",1,"add-mylist",[/動画をマイリスト登録しました/],["log-user-mylist-add"]);
		contentsAdd("～回再生数達成"  ,1,"count-view",[/動画が再生を達成しました/],["log-user-video-round-number-of-view-counter"]);
		contentsAdd("生放送で動画が紹介"    ,1,"syoukai",[/動画が生放送で紹介されました/],["log-user-live-video-introduced"]);//～さんの動画が生放送～で紹介されました
		contentsAdd("スタンプ取得",1,"stamp-get",[/スタンプを取得しました/],["log-user-action-stamp"]);
		contentsAdd("お知らせ追加",2,"info-post",[/お知らせが追加されました/],["log-community-action-info"]);
		contentsAdd("お知らせ追加",3,"info-post",[/お知らせが追加されました/],["log-community-action-info"]);
		contentsAdd("イラストクリップ",1,"illust-clip",[/イラストをクリップしました/],["log-user-seiga-image-clip"]);
		contentsAdd("動画レビューを投稿",1,"video-review",[/動画に動画レビューを書きました/],["log-user-video-review"]);
		contentsAdd("マンガをマイリスト",1,"manga-add-mylist",[/マンガのをマイリスト登録しました/],["log-user-mylist-add-manga-episode"]);
		contentsAdd("コメント欄",4,"commentArea",null,null);
//		contentsAdd(""  ,1,"",[],[]);
		if(location.pathname!="/my/top" && !location.pathname.match(/^\/my\/top\/[a-z0-9]+/i) && !location.pathname.match(/^\/user\/\d+/)){
//			console.log("ニコニコ除ニコレポ:ニコニコ動画のバージョン(原宿とかQ)判定に失敗しました");
			return;
		}else if(document.querySelector("#myContHead") && document.getElementById("SYS_THREADS")){//原宿
			console.log("ニコニコ除ニコレポ:原宿モード");
			version=1;
			addToggleHarajuku();
			initHarajuku();
			setToggleArea(document.querySelector("#myContHead"));
		}else if(document.querySelector("#nicorepo") && document. querySelector (".nicorepo")){//ゼロ＆Ｑ
			console.log("ニコニコ除ニコレポ:Ｑモード");
			version=2;
			addToggleQ();
			initQ();
			setToggleArea(document.querySelector("#nicorepo>h3"));
		}else{
			console.log("ニコニコ除ニコレポ:ニコニコ動画のバージョン(原宿とかQ)判定に失敗しました");
			return;
		}
		addStyle();
	};
	//styleタグを追加。ここにどんどん追加していく
	var thisStyle;
	var addStyle=function(){
		var addElement;
		addElement=document.createElement("style");
		document.body.appendChild(addElement);
		thisStyle=document.styleSheets[document.styleSheets.length-1];
		//セーブされてるスタイル情報を適用する
		//最初に、定義されているコンテンツ情報を読み込む
		var contentStyles={};
		for(var i=0;i<contents.length;i++){
			contentStyles[ contents[i].userClass + "-" + contents[i].userType ]={"userClass":contents[i].userClass , "userType":contents[i].userType , "flag":true};
		}
		//次に、セーブされているスタイル情報を上書きする
		for(var i=0;i<checkSave.length;i++){
			contentStyles[ checkSave[i].myClass + "-" + checkSave[i].userType ]={"userClass":checkSave[i].myClass , "userType":checkSave[i].userType , "flag":checkSave[i].checked};
		}
		//最後に、スタイル情報を適用する
		for(var i in contentStyles){
			updateStyle(contentStyles[i].userClass,contentStyles[i].userType,contentStyles[i].flag);
		}
	};
	var updateStyle=function(userClass,userType,flag){
		var userClassString=getUserClassString(userClass,userType);
		if(flag==true){
//			thisStyle.insertRule("."+userClassString+"{background-color:pink;}",thisStyle.rules.length);
			thisStyle.insertRule("."+userClassString+checkToDisplay+"{display:block;}",thisStyle.rules.length);
			thisStyle.insertRule("."+userClassString+checkToDisplay+"-inline{display:inline;}",thisStyle.rules.length);
			thisStyle.insertRule("."+userClassString+checkToHidden +"{display:none;}",thisStyle.rules.length);
			thisStyle.insertRule("."+userClassString+checkToHidden +"-inline{display:none;}",thisStyle.rules.length);
		}else{
//			thisStyle.insertRule("."+userClassString+"{background-color:cyan;}",thisStyle.rules.length);
			thisStyle.insertRule("."+userClassString+checkToDisplay+"{display:none;}",thisStyle.rules.length);
			thisStyle.insertRule("."+userClassString+checkToDisplay+"-inline{display:none;}",thisStyle.rules.length);
			thisStyle.insertRule("."+userClassString+checkToHidden +"{display:block;}",thisStyle.rules.length);
			thisStyle.insertRule("."+userClassString+checkToHidden +"-inline{display:inline;}",thisStyle.rules.length);
		}
//		console.log(thisStyle);
//		thisStyle.insertRule("."+userClassString+"{display:none;}",thisStyle.rules.length);
	};
	var getUserClassString=function(userClass,userType){
		var ret="";
		ret+=classPrefix+"-"+userType+"-"+userClass;
		return ret;
	}
	//-----各ニコレポにクラス名を追加
	//---原宿用
	//初期化。ノード追加時のイベントを設定し、最初からあるノードにクラス名を付ける
	var initHarajuku=function(){
		document.getElementById("SYS_THREADS").addEventListener("DOMNodeInserted",function(e){
			if(e.target.nodeName!=="LI"){return false;}
			addClassHarajuku(e.target);
			addClassHarajukuComment(e.target);
		});
		var all=document. querySelectorAll("#SYS_THREADS>li");
		for(var i=0;i<all.length;i++){
			addClassHarajuku(all[i]);
			addClassHarajukuComment(all[i]);
		}
	};
	//li要素にQ型式のクラス名を追加する
	var addClassHarajuku=function(target){
		var authorHref=target.querySelector(".userThumb>a").href,userType=0;
		if(authorHref.match(/\/user\/\d+/)){
			userType=1;
		}else if(authorHref.match(/\/community\/./)){
			userType=2;
		}else if(authorHref.match(/\/channel\/./)){
			userType=3;
		}else{
			console.log("ニコニコ除ニコレポ:新パターン:ユーザー:原宿:",target);
			return;
		}
		var targetHtml=target.querySelector(".report>h4");
		var html=targetHtml.innerHTML;
		html=html.replace(/\r|\n/g,"");
		html=html.replace(/<span class="time">.+?<\/span>/g,"");
		html=html.replace(/<a .+?>.+?<\/a>/g,"");
		html=html.replace(/お知らせ (.+?) が追加されました/g,"お知らせが追加されました");
		html=html.replace(/<.+?>/g,"");
		html=html.replace(/ |　|\t|&nbsp;/g,"");
		html=html.replace(/([0-9\/:]+)に生放送を予約しました。/g,"に生放送を予約しました。");
		html=html.replace(/生放送を([0-9\/:]+)から予約しました/g,"生放送をから予約しました");
		html=html.replace(/動画が([0-9,]+)再生を/g,"動画が再生を");
		html=html.replace(/^.+?さんが動画をニコニ広告で宣伝しました/g,"さんが動画をニコニ広告で宣伝しました");
		for(var i=0;i<contents.length;i++){
			if(userType!=contents[i].userType){continue;}
			for(var j=0;j<contents[i].harajuku.length;j++){
				if(html.match(contents[i].harajuku[j])){
					target.classList.add(getUserClassString(contents[i].userClass,contents[i].userType)+checkToDisplay);
					return;
				}
			}
		}
		//デバッグ用。存在しないパターンが出てきた
//		target.style.setProperty("background-color","gray");
		console.log("ニコニコ除ニコレポ:新パターン:原宿:",userType,html,target);
		target.dataset.html=html;
	};
	//コメント欄
	var addClassHarajukuComment=function(target){
		var t;
		//レスが存在するかの判定。無かったらreturn false
		if( target.querySelector(".report>.noRes") ){return false;}//これだけで判定出来てしまった
		//コメントの件数を取得。表示されている件数＋他n件のコメントを見る
		var commentCount=0;
		if( t=target.querySelector(".report>.comment>.res>.more>span>a") ){
			t=t.innerText.match(/他(\d+)件のコメントを見る/);
			commentCount+=t[1]-0;
		}
		if( t=target.querySelectorAll(".report>.comment>.res>ul>li") ){
			commentCount+=t.length;
		}
		if(commentCount==0){return false;}
		//コメントのidを取得。urlを作るのに使う
		var commentUrl="";
		if( t=target.querySelector(".report>.comment>.res>ul") ){
			t=t.id;
			if(t=t.match(/res_list_(\d+)_1_(\d+)/)){
				commentUrl="http://www.nicovideo.jp/nicorepo/1/"+t[1]+"/"+t[2];
			}
		}
		if(commentUrl==""){return false;}
		//<a href="" target=_blank>n件のコメント</a> を作る
		var link;
		if( !(t=target.querySelector(".report>h4>a.time")) ){return;}
		link=document.createElement("a");
		link.innerHTML=commentCount+"件のコメント";
		link.setAttribute("href",commentUrl);
		link.setAttribute("target","_blank");
		link.classList.add(classPrefix+"-4-commentArea"+checkToHidden +"-inline");
		t.parentNode. appendChild (link);
		//クラスを追加する
		target.querySelector(".report>.comment").classList.add(classPrefix+"-4-commentArea"+checkToDisplay);
//		target.style.setProperty("background-color","cyan");//デバッグ
	};
	//---Ｑ用
	var initQ=function(){
		document. querySelector (".nicorepo").addEventListener("DOMNodeInserted",function(e){
			if(e.target.nodeName=="#text"){return false;}
			if(e.target.classList.contains("nicorepo-page")===false){return false;}
			var addNodes=e.target.querySelectorAll(".timeline>div");
			for(var i=0;i< addNodes.length;i++){
				addClassQ(addNodes[i]);
				addClassQComment(addNodes[i]);
			}
		});
		var all=document. querySelectorAll(".nicorepo .nicorepo-page .timeline>div");
		for(var i=0;i<all.length;i++){
			addClassQ(all[i]);
			addClassQComment(all[i]);
		}
	};
	var addClassQ=function(target){
		var userType=0,authorHref=target.querySelector(".log-author>a").href,className;
		if(authorHref.match(/\/user\/\d+/)){
			userType=1;
		}else if(authorHref.match(/\/community\/./)){
			userType=2;
		}else if(authorHref.match(/\/channel\/./)){
			userType=3;
		}else{
			console.log("ニコニコ除ニコレポ:新パターン:ユーザー:Q:",target);
			return;
		}
		className=target.classList.toString().split(" ").filter(function(v){return v.match(/^log-/);})[0];
		for(var i=0;i<contents.length;i++){
			if(contents[i].userType!=userType){continue;}
			if(!contents[i].q.some(function(v){return v==className;})){continue;}
			var newClassName=getUserClassString(contents[i].userClass,contents[i].userType);
			target.classList.add(newClassName+checkToDisplay);
			return;
		}
		//デバッグ用。存在しないパターンが出てきた
//		target.style.setProperty("background-color","Gainsboro");
		console.log("ニコニコ除ニコレポ:新パターン:Q:",userType,className,target);
	};
	//コメント欄
	var addClassQComment=function(target){
		var t;
		//レスが存在するかの判定。無かったらreturn false
		if( target.querySelector(".log-content>.log-reslist-empty") ){return false;}//これだけで判定出来てしまった
		//コメントの件数を取得。表示されている件数＋他n件のコメントを見る
		var commentCount=0;
		if( t=target.querySelector(".log-content>.log-reslist>.log-res-more>a") ){
			t=t.innerText.match(/他(\d+)件を見る/);
			commentCount+=t[1]-0;
		}
		if( t=target.querySelectorAll(".log-content>.log-reslist>.log-res") ){
			if(commentCount==0){
				commentCount+=t.length;
			}else{
				commentCount+=t.length;
				commentCount--;
			}
			commentCount--;
		}
		if(commentCount==0){return false;}
		//コメントのidを取得。urlを作るのに使う
		var commentUrl="";
		if( t=target.querySelector(".log-content>.log-footer>.log-footer-date") ){
			commentUrl=t.href;
		}
		if(commentUrl==""){return false;}
		//<a href="" target=_blank>n件のコメント</a> を作る
		var link;
		if( !(t=target.querySelector(".log-content>.log-footer>.log-res-open-link")) ){return;}
		link=document.createElement("a");
		link.innerHTML=commentCount+"件のコメント";
		link.setAttribute("href",commentUrl);
		link.setAttribute("target","_blank");
		link.classList.add(classPrefix+"-4-commentArea"+checkToHidden +"-inline");
		t.parentNode. insertBefore (link,t);
		//非表示のクラスを追加する
		target.querySelector(".log-content>.log-footer>.log-res-open-link").classList.add(classPrefix+"-4-commentArea"+checkToDisplay+"-inline");
		target.querySelector(".log-content>.log-reslist").classList.add(classPrefix+"-4-commentArea"+checkToDisplay);
//		target.style.setProperty("background-color","cyan");//デバッグ
	};
	//ローカルストレージ
	var checkSave=[];
	var saveUpdateTemp=function(userClass,userType,flag){
		//checkSaveの中身を書きかけるけどセーブはしない
		//checkSave [] = {userType:1,myClass:hoge,checked:true}
		for(var i=0;i<checkSave.length;i++){
			if(checkSave[i].userType!=userType){continue;}
			if(checkSave[i].myClass !=userClass){continue;}
			checkSave[i].checked=flag;
			return;
		}
		//無かった。新規追加
		checkSave.push({"userType":userType,"myClass":userClass,"checked":flag});
	}
	var loadSearch=function(userType,userClass){
		for(var i=0;i<checkSave.length;i++){
			if(checkSave[i].userType!=userType){continue;}
			if(checkSave[i].myClass !=userClass){continue;}
			return checkSave[i].checked;
		}
		return true;
	};
	var save=function(){
		var savePat=JSON.stringify(checkSave);
		localStorage.setItem(localStorageKey,savePat);
	};
	var load=function(){
		var savePat={};
		savePat=localStorage.getItem(localStorageKey);
		savePat=JSON.parse(savePat);
		if(savePat!==null){
			checkSave=savePat;
		}
	};
	//トグルボタンで表示されるフィルタリング対象切り替えボタンのエレメントを返す
	var toggleArea;
	var setToggleArea=function(addTarget){
		toggleArea=document.createElement("div");
		setToggleButtons(toggleArea);
		setToggleSaveButton(toggleArea);
		toggleArea.style.setProperty("display","none");
		toggleArea.style.setProperty("font-weight","normal");
		toggleArea.style.setProperty("overflow","hidden");
		addTarget.appendChild(toggleArea);
	};
	var addElementArea1,addElementArea2,addElementArea3,addElementArea4;
	var setToggleButtons=function(toggleArea){
		var addElement="";
		var toggleUserType;
		//ユーザーが…
		addElementArea1=document.createElement("div");
		addElementArea1.innerHTML="ユーザーが…";
		addElementArea1.style.setProperty("overflow","hidden");
		toggleArea.appendChild(addElementArea1);
		
		toggleUserType=document.createElement("button");
		toggleUserType.style.setProperty("float","right");
		toggleUserType.innerHTML="ユーザー全て表示/非表示";
		toggleUserType.addEventListener("click",toggleUserTypeEventCreate(1));
		addElementArea1.appendChild(toggleUserType);

		addElementArea1=toggleArea.appendChild(document.createElement("div"));
		addElementArea1.style.setProperty("overflow","hidden");

		//コミュニティに…
		addElementArea2=document.createElement("div");
		addElementArea2.innerHTML="コミュニティが…";
		addElementArea2.style.setProperty("overflow","hidden");
		toggleArea.appendChild(addElementArea2);

		toggleUserType=document.createElement("button");
		toggleUserType.style.setProperty("float","right");
		toggleUserType.innerHTML="コミュニティ全て表示/非表示";
		toggleUserType.addEventListener("click",toggleUserTypeEventCreate(2));
		addElementArea2.appendChild(toggleUserType);

		addElementArea2=toggleArea.appendChild(document.createElement("div"));
		addElementArea2.style.setProperty("overflow","hidden");

		//公式チャンネルに…
		addElementArea3=document.createElement("div");
		addElementArea3.innerHTML="公式チャンネルが…";
		addElementArea3.style.setProperty("overflow","hidden");
		toggleArea.appendChild(addElementArea3);

		toggleUserType=document.createElement("button");
		toggleUserType.style.setProperty("float","right");
		toggleUserType.innerHTML="公式チャンネル全て表示/非表示";
		toggleUserType.addEventListener("click",toggleUserTypeEventCreate(3));
		addElementArea3.appendChild(toggleUserType);

		addElementArea3=toggleArea.appendChild(document.createElement("div"));
		addElementArea3.style.setProperty("overflow","hidden");

		//それ以外の…(トグルボタンは無し)
		addElementArea4=document.createElement("div");
		addElementArea4.innerHTML="それ以外の…";
		addElementArea4.style.setProperty("overflow","hidden");
		toggleArea.appendChild(addElementArea4);

		addElementArea4=toggleArea.appendChild(document.createElement("div"));
		addElementArea4.style.setProperty("overflow","hidden");

		//～が…のチェックボックスを作る
		for(var i=0;i<contents.length;i++){
			addElement=document.createElement("label");
			if(loadSearch(contents[i].userType,contents[i].userClass)==false ){
				addElement.innerHTML="<input type=checkbox>"+contents[i].label;
				labelStyle(addElement,false);
			}else{
				addElement.innerHTML="<input type=checkbox checked>"+contents[i].label;
				labelStyle(addElement,true);
			}
			//userType1～3は通常
			//userType4は非表示/非表示切り替え
			addElement.dataset.userType =contents[i].userType;
			addElement.dataset.userClass=contents[i].userClass;
			addElement.addEventListener("click",(function(key){
				return function(e){
					if(e.target.nodeName!="INPUT"){return;}
					var userType=e.target.parentNode. dataset.userType;
					var userClass=e.target.parentNode.dataset.userClass;
					if(e.target.checked==true){
						saveUpdateTemp(userClass,userType,true);//セーブ時の為の変数を更新する
						updateStyle(userClass,userType,true);
						labelStyle(e.target.parentNode,true);//ラベルの外見を変える
//						console.log("on %s %s",userType,userClass,thisStyle);
					}else{
						saveUpdateTemp(userClass,userType,false);
						updateStyle(userClass,userType,false);
						labelStyle(e.target.parentNode,false);
//						console.log("of %s %s",userType,userClass,thisStyle);
					}
					toggleSaveButton.disabled=false;
				};
			})(i));
			if(contents[i].userType==1){
				addElementArea1.appendChild(addElement);
			}else if(contents[i].userType==2){
				addElementArea2.appendChild(addElement);
			}else if(contents[i].userType==3){
				addElementArea3.appendChild(addElement);
			}else if(contents[i].userType==4){
				addElementArea4.appendChild(addElement);
			}
		}
	};
	var toggleUserTypeEventCreate=function(userType){
//	var addElementArea1,addElementArea2,addElementArea3;
		return function(e){
			var clickTargets;
			if(false){
			}else if(userType==1){
				clickTargets=addElementArea1;
			}else if(userType==2){
				clickTargets=addElementArea2;
			}else if(userType==3){
				clickTargets=addElementArea3;
			}
			clickTargets=clickTargets.querySelectorAll("label");
			if(clickTargets.length==0){return;}//無いとは思うけど、要素が無い時はそのまま返す
			var nextChecked=!clickTargets[0].querySelector("input").checked;
			for(var i=0;i<clickTargets.length;i++){
				//次の状態と今の状態が違う＝クリックする
				if(clickTargets[i].querySelector("input").checked!==nextChecked){
					//クリエイトイベント
					var customEvent = document.createEvent("MouseEvents");
					customEvent.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
					clickTargets[i].dispatchEvent(customEvent);
				}
			}
//			console.log(clickTargets);
		};
	};
	var labelStyle=function(target,flag){
		if(flag==true){
			target.style.setProperty("background","-webkit-gradient(linear, 0% 25%, 0% 100%, from(white), to(#1DFFFF))");
		}else{
			target.style.setProperty("background","-webkit-gradient(linear, left top, left bottom, color-stop(0%,rgba(255, 255, 255, 1)), color-stop(100%,rgba(143, 143, 143, 1)))");
		}
		target.style.setProperty("line-height","2.0em");
		target.style.setProperty("color","black");
		target.style.setProperty("padding","1px 8px 1px 5px");
		target.style.setProperty("border-radius","10px");
		target.style.setProperty("display","block");
		target.style.setProperty("float","left");
		target.style.setProperty("margin","5px 3px");
		target.style.setProperty("","");
	};
	var toggleSaveButton;
	var setToggleSaveButton=function(toggleArea){
		toggleSaveButton=document.createElement("button");
		toggleSaveButton.innerHTML="設定保存";
		toggleSaveButton.style.setProperty("float","right");
		toggleSaveButton.addEventListener("click",function(){
			save();
			toggleSaveButton.disabled=true;
		});
		toggleSaveButton.disabled=true;
		toggleArea.appendChild(toggleSaveButton);
	};
	//トグルボタンそのものを作る
	var toggleButton;
	var addToggleHarajuku=function(){
		toggleButton=document.createElement("a");
		toggleButton.href="";
		toggleButton.innerHTML="表示フィルタリング切り替え";
		toggleButton.dataset.nowOpen="no";
		toggleButton.addEventListener("click",clickToggle);
		document.querySelector("#myContHead").appendChild(toggleButton);
//		console.log("トグルボタン原宿:",toggleButton);
	};
	var addToggleQ=function(){
		toggleButton=document.createElement("a");
		toggleButton.href="";
		toggleButton.innerHTML="<span></span>表示フィルタリング切り替え";
		toggleButton.dataset.nowOpen="no";
		toggleButton.addEventListener("click",clickToggle);
		document.querySelector("#nicorepo>h3").appendChild(toggleButton);
//		console.log("トグルボタンQ:",toggleButton);
	};
	//トグルボタンをクリックした時のイベント
	var clickToggle=function(e){
		e.preventDefault();
		if(toggleButton.dataset.nowOpen=="no"){//今は閉じてる
			toggleArea.style.setProperty("display","block");
			toggleButton.dataset.nowOpen="yes";
		}else{//今は開いてる
			toggleArea.style.setProperty("display","none");
			toggleButton.dataset.nowOpen="no";
		}
	};
	init();
	window.nicorepFilter=nicorepFilter;
})();

