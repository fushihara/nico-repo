/*
・正規表現やクラス、ラベル文字列のパターンを読み込む
・ローカルストレージのセーブデータを読み込む
・・checkSave [] = {contentId:xxx,checked:true}
・スタイル要素を作る。セーブデータから読み込んだデフォルトを書き出す
・既にあるニコレポに独自のクラス要素をくっつける
・ニコレポが新しく追加された時に独自のクラスをくっつけるイベントリスナを追加する
・トグルエリアを作る。セーブデータから読み込まれたデフォルトをチェック状態に反映する
*/
(function () {
	var localStorageKey = "nicoReportFilter_chromeExtFushihara";
	// cssに付ける接頭語
	var classPrefix = "nicoReportFilter_chromeExtFushihara";
	//切り替え出来る要素
	var contents = [];
	//userType:1=ユーザーが 2=コミュニティが 3=企業のチャンネルが
	var contentsAdd = function ({ contentId, buttonLabel, userType, normalizeText }) {
		// contentIdが重複してる場合はアラートを出す
		let qequalIdContents = contents.filter((content) => {
			return content.contentId === contentId;
		});
		if (0 < qequalIdContents.length) {
			alert(`contentsIdが重複しています ${contentId}`);
		}
		contents.push({
			"contentId": contentId,
			"buttonLabel": buttonLabel,
			"userType": userType,
			"normalizeText": normalizeText
		});
	};
	//追加出来るかどうか
	var init = function () {
		var initState;
		load();
		contentsAdd({ contentId: "user-movie-post", buttonLabel: "動画を投稿", userType: 1, normalizeText: "[LINK USER]さんが動画を投稿しました。" });
		contentsAdd({ contentId: "user-movie-mylist-add", buttonLabel: "動画をマイリスト登録", userType: 1, normalizeText: "[LINK USER]さんが マイリスト[LINK MYLIST]に動画を登録しました。" });
		contentsAdd({ contentId: "user-movie-toriaezu-add", buttonLabel: "動画をとりあえずマイリスト登録", userType: 1, normalizeText: "[LINK USER]さんが とりあえずマイリスト に動画を登録しました。" });
		contentsAdd({ contentId: "user-follow-me", buttonLabel: "あなたをフォローした", userType: 1, normalizeText: "あなたを[LINK USER]さんがフォローしました。" });
		contentsAdd({ contentId: "user-count-view", buttonLabel: "再生数達成", userType: 1, normalizeText: "[LINK USER]さんの動画が[NUMBER]再生を達成しました。" });
		contentsAdd({ contentId: "user-ranking", buttonLabel: "ランキング達成", userType: 1, normalizeText: "[LINK USER]さんの動画が[NUMBER]位を達成しました。" });
		contentsAdd({ contentId: "user-nama-syokai", buttonLabel: "生放送で紹介された", userType: 1, normalizeText: "[LINK USER]さんの動画が 生放送[LINK LIVE]で紹介されました。" });
		contentsAdd({ contentId: "user-senden-video", buttonLabel: "宣伝をした(動画)", userType: 1, normalizeText: "[LINK USER]さんがニコニ広告しました。[LINK NICOAD_VIDEO]" });
		contentsAdd({ contentId: "user-senden-live", buttonLabel: "宣伝をした(配信)", userType: 1, normalizeText: "[LINK USER]さんがニコニ広告しました。[LINK NICOAD_LIVE]" });
		contentsAdd({ contentId: "user-blog-touko", buttonLabel: "ブロマガを投稿", userType: 1, normalizeText: "[LINK USER]さんが記事を投稿しました。" });
		contentsAdd({ contentId: "user-blog-touroku", buttonLabel: "マイリストにブロマガ登録", userType: 1, normalizeText: "[LINK USER]さんが マイリスト[LINK MYLIST]にブロマガを登録しました。" });
		contentsAdd({ contentId: "user-stamp-get", buttonLabel: "スタンプを取得", userType: 1, normalizeText: "[LINK USER]さんがスタンプを取得しました。" });
		contentsAdd({ contentId: "user-post-illust", buttonLabel: "イラストを投稿", userType: 1, normalizeText: "[LINK USER]さんがイラストを投稿しました。" });
		contentsAdd({ contentId: "user-clip-illust", buttonLabel: "イラストをクリップ", userType: 1, normalizeText: "[LINK USER]さんが イラストをクリップしました。" });
		contentsAdd({ contentId: "user-manga-favorite", buttonLabel: "マンガをお気に入り登録", userType: 1, normalizeText: "[LINK USER]さんがマンガをお気に入りしました。" });
		contentsAdd({ contentId: "user-3d-favorite", buttonLabel: "立体をお気に入り登録", userType: 1, normalizeText: "[LINK USER]さんが立体をお気に入り登録しました。" });
		contentsAdd({ contentId: "comm-nama-start", buttonLabel: "生放送を開始", userType: 2, normalizeText: "[LINK USER]さんが コミュニティ[LINK COMMUNITY]で生放送を開始しました。" });
		contentsAdd({ contentId: "comm-nama-yoyaku", buttonLabel: "生放送を予約", userType: 2, normalizeText: "[LINK USER]さんが コミュニティ[LINK COMMUNITY]でに生放送を予約しました。" });
		contentsAdd({ contentId: "comm-add-movie", buttonLabel: "動画を追加", userType: 2, normalizeText: "[LINK USER]さんが コミュニティ[LINK COMMUNITY]に動画を追加しました。" });
		contentsAdd({ contentId: "comm-jikken-nama-start", buttonLabel: "生放送(実験)を開始", userType: 2, normalizeText: "[LINK USER]さんが コミュニティ[LINK COMMUNITY]で生放送（実験放送）を開始しました。" });
		contentsAdd({ contentId: "channel-nama-start", buttonLabel: "生放送を開始", userType: 3, normalizeText: "チャンネル[LINK CHANNEL]で生放送が開始されました。" });
		contentsAdd({ contentId: "channel-nama-yoyaku", buttonLabel: "生放送を予約", userType: 3, normalizeText: "チャンネル[LINK CHANNEL]でに生放送が予約されました。" });
		contentsAdd({ contentId: "channel-movie-post", buttonLabel: "動画を追加", userType: 3, normalizeText: "チャンネル[LINK CHANNEL]に動画が追加されました。" });
		contentsAdd({ contentId: "channel-notice-add", buttonLabel: "お知らせを追加", userType: 3, normalizeText: "チャンネル[LINK CHANNEL]にお知らせが追加されました。" });
		contentsAdd({ contentId: "channel-kiji-add", buttonLabel: "記事を追加", userType: 3, normalizeText: "チャンネル[LINK CHANNEL]に記事が追加されました。" });
		if (document.querySelector("#nicorepo")) {
			addToggleQ();
			initQ();
			setToggleArea(document.querySelector("#nicorepo>h3"));
			addStyle();
		}
	};
	//styleタグを追加。ここにどんどん追加していく
	var thisStyle;
	var addStyle = function () {
		var addElement;
		addElement = document.createElement("style");
		document.body.appendChild(addElement);
		thisStyle = document.styleSheets[document.styleSheets.length - 1];
		//セーブされてるスタイル情報を適用する
		//最初に、定義されているコンテンツ情報を読み込む
		var contentStyles = {};
		for (let content of contents) {
			contentStyles[content.contentId] = true;
		}
		//次に、セーブされているスタイル情報を上書きする
		for (let checkSaveI of checkSave) {
			contentStyles[checkSaveI.contentId] = checkSaveI.checked;
		}
		//最後に、スタイル情報を適用する
		for (let contentId in contentStyles) {
			updateStyle(contentId, contentStyles[contentId]);
		}
	};
	var updateStyle = function (contentId, flag) {
		if (flag == true) {
			thisStyle.insertRule("." + classPrefix + contentId + "{display:block;}", thisStyle.rules.length);
		} else {
			thisStyle.insertRule("." + classPrefix + contentId + "{display:none;}", thisStyle.rules.length);
		}
	};
	//-----各ニコレポにクラス名を追加
	var initQ = function () {
		// ノードが追加された時にイベントを仕込む
		const observeTarget = document.querySelector("#MyPageNicorepoApp") || document.querySelector("#UserPageNicorepoApp");
		(new MutationObserver((mutationRecords, observer) => {
			mutationRecords.forEach((n) => {
				console.log("addedNodes:%o removedNodes:%o", n.addedNodes, n.removedNodes)
				n.addedNodes.forEach((n) => {
					if (n.nodeName !== "SPAN") { return; }
					const baseElement = n.parentNode.parentNode.parentNode;
					initializeOneLog(baseElement);
				});
			});
			//			observer.disconnect();//切断するチャンスは無い
		})).observe(observeTarget, { childList: true, subtree: true });
	};
	var initializeOneLog = function (baseElement) {
		const bodyElement = baseElement.querySelector(".log-body>span");
		if (bodyElement === null) { return; }
		// bodyからリンクを取り除いてノーマライズする
		const bodyNormalizeText = Array.from(bodyElement.childNodes).map((e) => {
			if (e.nodeType === Node.TEXT_NODE) {
				return e.nodeValue.trim();
			} else if (e.nodeType === Node.ELEMENT_NODE) {
				const nodeName = e.nodeName;
				if (nodeName === "STRONG") {
					return e.innerText.trim();
				} else if (nodeName === "SPAN") {
					// <span>チャンネル <a href="http://ch.nicovideo.jp/hoge-ch?zeromypage_nicorepo">xxxxx</a> で <span>17年0月00日 00:00</span> に生放送が予約されました。</span> の時だけなので空文字固定
					return "";
				} else if (nodeName === "A") {
					const linkTarget = new URL(e.href);
					if (linkTarget.hostname === "www.nicovideo.jp" && linkTarget.pathname.indexOf("/user/") === 0) {
						return "[LINK USER]";
					} else if (linkTarget.hostname === "com.nicovideo.jp" && linkTarget.pathname.indexOf("/community/") === 0) {
						// http://com.nicovideo.jp/community/co12345?zeromypage_nicorepo
						return "[LINK COMMUNITY]";
					} else if (linkTarget.hostname === "ch.nicovideo.jp") {
						// http://ch.nicovideo.jp/xxxx?zeromypage_nicorepo
						return "[LINK CHANNEL]";
					} else if (linkTarget.hostname === "www.nicovideo.jp" && linkTarget.pathname.indexOf("/mylist/") === 0) {
						// http://www.nicovideo.jp/mylist/12345?zeromypage_nicorepo
						return "[LINK MYLIST]";
					} else if (linkTarget.hostname === "live.nicovideo.jp" && linkTarget.pathname.indexOf("/watch/") === 0) {
						// http://live.nicovideo.jp/watch/lv12345?zeromypage_nicorepo
						return "[LINK LIVE]";
					} else if (linkTarget.hostname === "uad.nicovideo.jp" && linkTarget.pathname.indexOf("/ads/") === 0) {
						// http://uad.nicovideo.jp/ads/?vid=sm1234
						return "[LINK UAD]";
					} else if (linkTarget.hostname === "nicoad.nicovideo.jp" && linkTarget.pathname.indexOf("/video/publish/") === 0) {
						// http://uad.nicovideo.jp/ads/?vid=sm1234
						return "[LINK NICOAD_VIDEO]";
					} else if (linkTarget.hostname === "nicoad.nicovideo.jp" && linkTarget.pathname.indexOf("/live/publish/") === 0) {
						// http://uad.nicovideo.jp/ads/?vid=sm1234
						return "[LINK NICOAD_LIVE]";
					} else {
						return `[LINK ${linkTarget.href}]`.trim();
					}
				}
			}
			return "";
		}).map((e) => {
			//  10,000 再生 を [NUMBER]再生 に変換
			return e.replace(/\s*[0-9,]+ 再生\s*/g, "[NUMBER]再生");
		}).map((e) => {
			//  実況プレイ動画 24時間 総合 ランキングで 2 位
			return e.replace(/さんの動画が .+? \d+ 位を達成/g, "さんの動画が[NUMBER]位を達成");
		}).join("");
		// userTypeを決定する
		let userType;
		if (bodyNormalizeText.includes("[LINK CHANNEL]")) {
			userType = 3;
		} else if (bodyNormalizeText.includes("[LINK COMMUNITY]")) {
			userType = 2;
		} else {
			userType = 1;
		}
		let matchContents = false;
		for (var i = 0; i < contents.length; i++) {
			const contentsI = contents[i];
			if (contentsI.userType !== userType) { continue; }
			if (contentsI.normalizeText !== bodyNormalizeText) { continue; }
			baseElement.classList.add(classPrefix + contentsI.contentId);
			matchContents = true;
			break;
		}
		if (matchContents === false) {
			console.log("ニコニコ除ニコレポ:新パターン:", { bodyElement: bodyElement.innerHTML, bodyNormalizeText: bodyNormalizeText, userType: userType });
		}
	}
	//ローカルストレージ
	var checkSave = [];
	var saveUpdateTemp = function (contentId, flag) {
		//checkSaveの中身を書きかけるけどセーブはしない
		//checkSave [] = {contentId:xxxxx,checked:true}
		for (let checkSaveI of checkSave) {
			if (checkSaveI.contentId === contentId) {
				checkSaveI.checked = flag;
				return;
			}
		}
		//無かった。新規追加
		checkSave.push({ "contentId": contentId, "checked": flag });
	}
	var save = function () {
		var savePat = JSON.stringify(checkSave);
		localStorage.setItem(localStorageKey, savePat);
	};
	var load = function () {
		var savePat = {};
		savePat = localStorage.getItem(localStorageKey);
		savePat = JSON.parse(savePat);
		if (savePat !== null) {
			checkSave = savePat;
		}
	};
	//トグルボタンで表示されるフィルタリング対象切り替えボタンのエレメントを返す
	var toggleArea;
	var setToggleArea = function (addTarget) {
		toggleArea = document.createElement("div");
		setToggleButtons(toggleArea);
		setToggleSaveButton(toggleArea);
		toggleArea.style.setProperty("display", "none");
		toggleArea.style.setProperty("font-weight", "normal");
		toggleArea.style.setProperty("overflow", "hidden");
		addTarget.appendChild(toggleArea);
	};
	var addElementArea1, addElementArea2, addElementArea3, addElementArea4;
	var setToggleButtons = function (toggleArea) {
		var addElement = "";
		var toggleUserType;
		//ユーザーが…
		addElementArea1 = document.createElement("div");
		addElementArea1.innerHTML = "ユーザーが… or ユーザーが投稿した動画が…";
		addElementArea1.style.setProperty("overflow", "hidden");
		toggleArea.appendChild(addElementArea1);

		toggleUserType = document.createElement("button");
		toggleUserType.style.setProperty("float", "right");
		toggleUserType.innerHTML = "ユーザー全て表示/非表示";
		toggleUserType.addEventListener("click", toggleUserTypeEventCreate(1));
		addElementArea1.appendChild(toggleUserType);

		addElementArea1 = toggleArea.appendChild(document.createElement("div"));
		addElementArea1.style.setProperty("overflow", "hidden");

		//コミュニティに…
		addElementArea2 = document.createElement("div");
		addElementArea2.innerHTML = "コミュニティが…";
		addElementArea2.style.setProperty("overflow", "hidden");
		toggleArea.appendChild(addElementArea2);

		toggleUserType = document.createElement("button");
		toggleUserType.style.setProperty("float", "right");
		toggleUserType.innerHTML = "コミュニティ全て表示/非表示";
		toggleUserType.addEventListener("click", toggleUserTypeEventCreate(2));
		addElementArea2.appendChild(toggleUserType);

		addElementArea2 = toggleArea.appendChild(document.createElement("div"));
		addElementArea2.style.setProperty("overflow", "hidden");

		//公式チャンネルに…
		addElementArea3 = document.createElement("div");
		addElementArea3.innerHTML = "公式チャンネルが…";
		addElementArea3.style.setProperty("overflow", "hidden");
		toggleArea.appendChild(addElementArea3);

		toggleUserType = document.createElement("button");
		toggleUserType.style.setProperty("float", "right");
		toggleUserType.innerHTML = "公式チャンネル全て表示/非表示";
		toggleUserType.addEventListener("click", toggleUserTypeEventCreate(3));
		addElementArea3.appendChild(toggleUserType);

		addElementArea3 = toggleArea.appendChild(document.createElement("div"));
		addElementArea3.style.setProperty("overflow", "hidden");

		//それ以外の…(トグルボタンは無し)
		addElementArea4 = document.createElement("div");
		addElementArea4.innerHTML = "それ以外の…";
		addElementArea4.style.setProperty("overflow", "hidden");
		//		toggleArea.appendChild(addElementArea4);

		addElementArea4 = toggleArea.appendChild(document.createElement("div"));
		addElementArea4.style.setProperty("overflow", "hidden");

		//～が…のチェックボックスを作る
		for (var i = 0; i < contents.length; i++) {
			addElement = document.createElement("label");
			//今のcontentがチェック済みかどうかを調べる
			let isChecked = checkSave.filter((e) => {
				return e.contentId === contents[i].contentId
			}).map((e) => {
				return e.checked;
			});
			isChecked = isChecked.length === 0 ? true : isChecked[0];

			addElement.innerHTML = `<input type=checkbox ${isChecked ? "checked" : ""}>${contents[i].buttonLabel}`;
			labelStyle(addElement, isChecked);
			//userType1～3は通常
			//userType4は非表示/非表示切り替え
			addElement.dataset.userType = contents[i].userType;
			addElement.dataset.contentId = contents[i].contentId;
			addElement.addEventListener("click", (function (key) {
				return function (e) {
					if (e.target.nodeName != "INPUT") { return; }
					var userType = e.target.parentNode.dataset.userType;
					var contentId = e.target.parentNode.dataset.contentId;
					if (e.target.checked == true) {
						saveUpdateTemp(contentId, true);//セーブ時の為の変数を更新する
						updateStyle(contentId, true);
						labelStyle(e.target.parentNode, true);//ラベルの外見を変える
						//						console.log("on %s %s",userType,userClass,thisStyle);
					} else {
						saveUpdateTemp(contentId, false);
						updateStyle(contentId, false);
						labelStyle(e.target.parentNode, false);
						//						console.log("of %s %s",userType,userClass,thisStyle);
					}
					toggleSaveButton.disabled = false;
				};
			})(i));
			if (contents[i].userType == 1) {
				addElementArea1.appendChild(addElement);
			} else if (contents[i].userType == 2) {
				addElementArea2.appendChild(addElement);
			} else if (contents[i].userType == 3) {
				addElementArea3.appendChild(addElement);
			} else if (contents[i].userType == 4) {
				addElementArea4.appendChild(addElement);
			}
		}
	};
	var toggleUserTypeEventCreate = function (userType) {
		//	var addElementArea1,addElementArea2,addElementArea3;
		return function (e) {
			var clickTargets;
			if (false) {
			} else if (userType == 1) {
				clickTargets = addElementArea1;
			} else if (userType == 2) {
				clickTargets = addElementArea2;
			} else if (userType == 3) {
				clickTargets = addElementArea3;
			}
			clickTargets = clickTargets.querySelectorAll("label");
			if (clickTargets.length == 0) { return; }//無いとは思うけど、要素が無い時はそのまま返す
			var nextChecked = !clickTargets[0].querySelector("input").checked;
			for (var i = 0; i < clickTargets.length; i++) {
				//次の状態と今の状態が違う＝クリックする
				if (clickTargets[i].querySelector("input").checked !== nextChecked) {
					//クリエイトイベント
					var customEvent = document.createEvent("MouseEvents");
					customEvent.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
					clickTargets[i].dispatchEvent(customEvent);
				}
			}
			//			console.log(clickTargets);
		};
	};
	var labelStyle = function (target, flag) {
		if (flag == true) {
			target.style.setProperty("background", "-webkit-gradient(linear, 0% 25%, 0% 100%, from(white), to(#1DFFFF))");
		} else {
			target.style.setProperty("background", "-webkit-gradient(linear, left top, left bottom, color-stop(0%,rgba(255, 255, 255, 1)), color-stop(100%,rgba(143, 143, 143, 1)))");
		}
		target.style.setProperty("line-height", "2.0em");
		target.style.setProperty("color", "black");
		target.style.setProperty("padding", "1px 8px 1px 5px");
		target.style.setProperty("border-radius", "10px");
		target.style.setProperty("display", "block");
		target.style.setProperty("float", "left");
		target.style.setProperty("margin", "5px 3px");
		target.style.setProperty("", "");
	};
	var toggleSaveButton;
	var setToggleSaveButton = function (toggleArea) {
		toggleSaveButton = document.createElement("button");
		toggleSaveButton.innerHTML = "設定保存";
		toggleSaveButton.style.setProperty("float", "right");
		toggleSaveButton.addEventListener("click", function () {
			save();
			toggleSaveButton.disabled = true;
		});
		toggleSaveButton.disabled = true;
		toggleArea.appendChild(toggleSaveButton);
	};
	//トグルボタンそのものを作る
	var toggleButton;
	var addToggleQ = function () {
		//updateボタンを表示するかどうか
		let updateButton = `<span style="    display: inline;
    background: rgba(0, 0, 0, 0);
    width: auto;
    font-size: 11px;
    color: #f00;
    background-color: #fff;
    border-radius: 6px;
    padding: 0px 3px;
    font-weight: bold;">更新</span>`;
		toggleButton = document.createElement("a");
		toggleButton.href = "";
		toggleButton.innerHTML = `<span></span>表示フィルタリング切り替え${checkShowUpdate() ? updateButton : ""}`;
		toggleButton.dataset.nowOpen = "no";
		toggleButton.addEventListener("click", (e) => {
			e.preventDefault();
			updateShowUpdate();
			if (toggleButton.dataset.nowOpen == "no") {//今は閉じてる
				toggleArea.style.setProperty("display", "block");
				toggleButton.dataset.nowOpen = "yes";
			} else {//今は開いてる
				toggleArea.style.setProperty("display", "none");
				toggleButton.dataset.nowOpen = "no";
			}
		});
		document.querySelector("#nicorepo>h3").appendChild(toggleButton);
	};
	var nowVersion = 3;
	var checkShowUpdate = function () {
		const version = localStorage.getItem(`${localStorageKey}-last-click-version`) || 1;
		if (version < nowVersion) {
			// 最後にクリックしたバージョンが、今のバージョンより前だったら表示する
			return true;
		} else {
			return false;
		}
	}
	var updateShowUpdate = function () {
		localStorage.setItem(`${localStorageKey}-last-click-version`, nowVersion);
	}
	init();
})();

