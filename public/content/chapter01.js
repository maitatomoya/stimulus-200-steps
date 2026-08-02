// 第1章：準備：DOMとdata属性
registerChapter({
  number: 1,
  title: "準備：DOMとdata属性",
  description: "Stimulusを学ぶ前に、素のJavaScriptでDOMを操作する基礎を固めます。要素の取得、イベント、クラス操作、data属性まで、この後の章で必ず使う道具をそろえます。",
  steps: [
    {
      id: 1,
      title: "HTMLとJSの関係（querySelector＋textContent）",
      explanation: `<p>Webページは<strong>HTML</strong>（構造）と<strong>JavaScript</strong>（動き）の組み合わせでできています。ブラウザはHTMLを読み込むと、タグの1つ1つを「要素（element）」というオブジェクトに変換してメモリ上に木構造として持ちます。これを<strong>DOM</strong>（Document Object Model）と呼びます。JavaScriptからDOMを操作すると、画面の表示をあとから書き換えられます。</p>
<p>要素を取得する基本の道具が<code>document.querySelector(セレクタ)</code>です。CSSで使うセレクタ（<code>.クラス名</code>や<code>#id名</code>など）をそのまま渡すと、<strong>最初に一致した要素を1つ</strong>返します。</p>
<pre><code>const message = document.querySelector(".message");
message.textContent = "書き換えたい文字";</code></pre>
<p>取得した要素の<code>textContent</code>プロパティに文字列を代入すると、その要素の中の文字が丸ごと置き換わります。読み取りにも使えて、<code>message.textContent</code>と書けば今表示されている文字が取れます。</p>
<ul>
<li><code>document</code>：ページ全体を表すオブジェクト。DOM操作の入口</li>
<li><code>querySelector</code>：CSSセレクタで要素を1つ取得（見つからなければ<code>null</code>）</li>
<li><code>textContent</code>：要素の中のテキストを読み書きするプロパティ</li>
</ul>
<p>この「取得して、書き換える」という2拍子が、DOM操作のすべての基本です。まずはこの流れを体に覚えさせましょう。</p>`,
      task: `querySelectorで取得したmessage要素のtextContentを「JSからこんにちは」に書き換えてください。`,
      code: `<h3>はじめてのDOM操作</h3>
<p class="message">ここはまだ書き換わっていません</p>

<script>
// querySelectorはCSSセレクタで要素を1つ取得する
const message = document.querySelector(".message");

// TODO: messageのtextContentを「JSからこんにちは」に書き換える
<\/script>`,
      solution: `<h3>はじめてのDOM操作</h3>
<p class="message">ここはまだ書き換わっていません</p>

<script>
// querySelectorはCSSセレクタで要素を1つ取得する
const message = document.querySelector(".message");

message.textContent = "JSからこんにちは";
<\/script>`,
      hints: [`message.textContent = "文字列"; の形で代入します`, `文字列は「JSからこんにちは」と1字も違わないように書きましょう`],
      check: `assert($(".message"), "class属性がmessageの<p>要素が必要です");
assert(text(".message") === "JSからこんにちは", "<p>の文字が「JSからこんにちは」に書き換わっているはずです。message.textContentに代入しましょう");`
    },
    {
      id: 2,
      title: "getElementByIdとquerySelectorの違い",
      explanation: `<p>要素を取得する方法はもう1つ、<code>document.getElementById(id名)</code>があります。名前の通り<strong>id属性</strong>で要素を探す専用の関数です。2つの違いを整理しましょう。</p>
<table>
<tr><th></th><th>getElementById</th><th>querySelector</th></tr>
<tr><td>渡すもの</td><td>id名そのもの（<code>"first"</code>）</td><td>CSSセレクタ（<code>"#first"</code>や<code>".second"</code>）</td></tr>
<tr><td>探せる対象</td><td>idだけ</td><td>id・クラス・タグ名など何でも</td></tr>
<tr><td>速度</td><td>速い</td><td>柔軟だがやや遅い</td></tr>
</table>
<p>いちばん多い間違いは、<code>getElementById("#first")</code>のように<strong>#を付けてしまう</strong>ことです。#はCSSセレクタの記法なので、getElementByIdには付けません。逆にquerySelectorでidを探すときは<code>"#first"</code>と#が必要です。</p>
<pre><code>// idで取得（#は付けない）
const a = document.getElementById("first");

// CSSセレクタで取得（クラスは.を付ける）
const b = document.querySelector(".second");</code></pre>
<p>実務では「idが分かっているならgetElementById、それ以外はquerySelector」という使い分けが一般的です。どちらも見つからないときは<code>null</code>を返すので、その後のプロパティ操作でエラーになったら「取得に失敗していないか」をまず疑いましょう。</p>`,
      task: `getElementByIdでid="first"の要素を、querySelectorでclass="second"の要素を取得し、それぞれtextContentを「idで取得しました」「クラスで取得しました」に書き換えてください。`,
      code: `<p id="first">1つ目の段落（idはfirst）</p>
<p class="second">2つ目の段落（クラスはsecond）</p>

<script>
// TODO(1): getElementByIdでid="first"の要素を取得し、textContentを「idで取得しました」にする
// ヒント：getElementByIdに#は付けない

// TODO(2): querySelectorでclass="second"の要素を取得し、textContentを「クラスで取得しました」にする
// ヒント：クラスをセレクタで書くときは先頭に.を付ける
<\/script>`,
      solution: `<p id="first">1つ目の段落（idはfirst）</p>
<p class="second">2つ目の段落（クラスはsecond）</p>

<script>
const first = document.getElementById("first");
first.textContent = "idで取得しました";

const second = document.querySelector(".second");
second.textContent = "クラスで取得しました";
<\/script>`,
      hints: [`getElementById("first")のように、idの名前だけを渡します`, `querySelector(".second")のように、クラスは.付きのセレクタで渡します`],
      check: `assert($("#first"), "id属性がfirstの<p>要素が必要です");
assert(text("#first") === "idで取得しました", "id=firstの<p>は「idで取得しました」に書き換わっているはずです。getElementByIdには#を付けません");
assert(text(".second") === "クラスで取得しました", "class=secondの<p>は「クラスで取得しました」に書き換わっているはずです。querySelectorには\\".second\\"のように.付きで渡します");`
    },
    {
      id: 3,
      title: "addEventListenerでクリックに反応",
      explanation: `<p>ここまでのコードはページを開いた瞬間に1回だけ実行されました。今度は「ユーザーがボタンを押したとき」に実行されるようにします。ユーザーの操作（クリック、入力、キー押下など）は<strong>イベント</strong>と呼ばれ、要素の<code>addEventListener</code>メソッドで「このイベントが起きたらこの関数を実行して」と登録できます。</p>
<pre><code>btn.addEventListener("click", () =&gt; {
  // ボタンが押されるたびにここが実行される
  output.textContent = "押されました";
});</code></pre>
<p>引数は2つです。</p>
<ul>
<li>第1引数：イベント名の文字列。クリックなら<code>"click"</code></li>
<li>第2引数：イベントが起きたときに実行される関数（<strong>リスナー</strong>と呼びます）。<code>() =&gt; { ... }</code>はアロー関数という関数の書き方です</li>
</ul>
<p>ポイントは、addEventListenerは<strong>登録するだけ</strong>で、その場では関数を実行しないことです。実行されるのはあくまでイベントが起きた瞬間です。また、同じ要素に何度でもリスナーを登録できます。</p>
<p>実はこの「どの要素の・どのイベントで・何をするか」をJS側で1つ1つ登録する作業こそ、後の章で学ぶStimulusが肩代わりしてくれる部分です。まずは素の書き方をしっかり押さえておくと、Stimulusのありがたみがよく分かります。</p>`,
      task: `btnにclickイベントのリスナーを登録し、クリックされたらoutputの文字を「ボタンが押されました！」に書き換えてください。`,
      code: `<button id="btn">押してね</button>
<p id="output">まだ押されていません</p>

<script>
const btn = document.getElementById("btn");
const output = document.getElementById("output");

// TODO: btnにclickイベントのリスナーを登録し、
//       outputのtextContentを「ボタンが押されました！」に変える
<\/script>`,
      solution: `<button id="btn">押してね</button>
<p id="output">まだ押されていません</p>

<script>
const btn = document.getElementById("btn");
const output = document.getElementById("output");

btn.addEventListener("click", () => {
  output.textContent = "ボタンが押されました！";
});
<\/script>`,
      hints: [`btn.addEventListener("click", () => { ... }); の形で登録します`, `関数の中でoutput.textContentに代入します`],
      check: `assert($("#btn"), "id=btnのボタンが必要です");
assert(text("#output") === "まだ押されていません", "ボタンを押す前は文字が変わらないはずです。リスナーの外でtextContentを書き換えていませんか");
click("#btn");
await sleep(50);
assert(text("#output") === "ボタンが押されました！", "ボタンをクリックすると#outputに「ボタンが押されました！」と表示されるはずです");`
    },
    {
      id: 4,
      title: "input要素のvalueを読む",
      explanation: `<p>テキスト入力欄（<code>&lt;input type="text"&gt;</code>）にユーザーが入力した文字は、<code>textContent</code>ではなく<strong><code>value</code>プロパティ</strong>で読み取ります。ここはよく混同されるので整理しておきましょう。</p>
<table>
<tr><th>プロパティ</th><th>使う相手</th><th>中身</th></tr>
<tr><td><code>textContent</code></td><td><code>&lt;p&gt;</code>や<code>&lt;div&gt;</code>などの一般要素</td><td>タグに挟まれたテキスト</td></tr>
<tr><td><code>value</code></td><td><code>&lt;input&gt;</code>や<code>&lt;textarea&gt;</code>などのフォーム部品</td><td>ユーザーが入力した値</td></tr>
</table>
<pre><code>const input = document.getElementById("name-input");
console.log(input.value); // 入力欄の今の文字列</code></pre>
<p>valueは読むたびに「その時点の入力内容」を返します。つまり、ボタンが押された瞬間にリスナーの中でvalueを読めば、最新の入力が手に入ります。逆に、スクリプト読み込み時に一度だけ読んでも空文字が返るだけです。<strong>「いつ読むか」が大事</strong>だという感覚を持ってください。</p>
<p>文字列の連結には<code>+</code>演算子を使います。<code>"こんにちは、" + input.value + "さん"</code>のように、固定の文字列と変数をつなげて1つの文にできます。今回はボタンを押したら入力された名前であいさつ文を組み立てて表示してみましょう。</p>`,
      task: `あいさつボタンが押されたら、入力欄のvalueを読み取り、「こんにちは、〇〇さん」（〇〇は入力された名前）とgreetingに表示してください。`,
      code: `<input id="name-input" type="text" placeholder="名前を入力">
<button id="show-btn">あいさつ</button>
<p id="greeting"></p>

<script>
const input = document.getElementById("name-input");
const btn = document.getElementById("show-btn");
const greeting = document.getElementById("greeting");

btn.addEventListener("click", () => {
  // TODO: input.valueを読み取り、「こんにちは、〇〇さん」とgreetingに表示する
  //       文字列の連結には + を使う
});
<\/script>`,
      solution: `<input id="name-input" type="text" placeholder="名前を入力">
<button id="show-btn">あいさつ</button>
<p id="greeting"></p>

<script>
const input = document.getElementById("name-input");
const btn = document.getElementById("show-btn");
const greeting = document.getElementById("greeting");

btn.addEventListener("click", () => {
  greeting.textContent = "こんにちは、" + input.value + "さん";
});
<\/script>`,
      hints: [`入力値はinput.valueで読み取れます`, `greeting.textContent = "こんにちは、" + input.value + "さん"; のように連結します`],
      check: `assert($("#name-input"), "id=name-inputの入力欄が必要です");
setValue("#name-input", "花子");
click("#show-btn");
await sleep(50);
assert(text("#greeting") === "こんにちは、花子さん", "「花子」と入力してボタンを押すと「こんにちは、花子さん」と表示されるはずです。input.valueを+で連結しましょう");
setValue("#name-input", "次郎");
click("#show-btn");
await sleep(50);
assert(text("#greeting") === "こんにちは、次郎さん", "入力を変えてもう一度押すと、新しい名前であいさつされるはずです。valueはボタンが押されたときに読み取りましょう");`
    },
    {
      id: 5,
      title: "classList（add・remove・toggle）",
      explanation: `<p>見た目の変更は、スタイルを直接いじるよりも「CSSクラスを付け外しする」のが定石です。要素の<code>classList</code>プロパティには、クラス操作用のメソッドがそろっています。</p>
<table>
<tr><th>メソッド</th><th>働き</th></tr>
<tr><td><code>classList.add("active")</code></td><td>activeクラスを付ける（既にあれば何もしない）</td></tr>
<tr><td><code>classList.remove("active")</code></td><td>activeクラスを外す（なければ何もしない）</td></tr>
<tr><td><code>classList.toggle("active")</code></td><td>あれば外し、なければ付ける</td></tr>
<tr><td><code>classList.contains("active")</code></td><td>付いているかをtrue/falseで返す</td></tr>
</table>
<pre><code>const box = document.getElementById("box");
box.classList.toggle("active"); // 押すたびにON/OFFが切り替わる</code></pre>
<p>「クリックするたびにON/OFFを切り替える」ような場面では、if文でcontainsを調べてadd/removeを呼び分けるより、<code>toggle</code>1つで書けてしまいます。</p>
<p>この方式の利点は、<strong>見た目の定義（CSS）とロジック(JS)を分離できる</strong>ことです。JSは「activeというクラスを付けた」ことしか知らず、activeがどんな色なのかはCSSだけが知っています。デザイン変更のときにJSを触らなくて済むわけです。この考え方は、Stimulusの第8章「CSSクラス」でそのまま発展します。</p>`,
      task: `切り替えボタンが押されるたびに、boxのactiveクラスがtoggleで付いたり外れたりするようにしてください。`,
      code: `<style>
  .box { padding: 16px; border: 2px solid #94a3b8; }
  .active { background: #fde047; border-color: #ca8a04; }
</style>
<div id="box" class="box">クリックで色が変わる箱</div>
<button id="toggle-btn">切り替え</button>

<script>
const box = document.getElementById("box");
const btn = document.getElementById("toggle-btn");

btn.addEventListener("click", () => {
  // TODO: boxのclassListを使ってactiveクラスをtoggleする
});
<\/script>`,
      solution: `<style>
  .box { padding: 16px; border: 2px solid #94a3b8; }
  .active { background: #fde047; border-color: #ca8a04; }
</style>
<div id="box" class="box">クリックで色が変わる箱</div>
<button id="toggle-btn">切り替え</button>

<script>
const box = document.getElementById("box");
const btn = document.getElementById("toggle-btn");

btn.addEventListener("click", () => {
  box.classList.toggle("active");
});
<\/script>`,
      hints: [`box.classList.toggle("active"); の1行で付け外しできます`],
      check: `assert($("#box"), "id=boxの要素が必要です");
assert(!$("#box").classList.contains("active"), "ボタンを押す前はactiveクラスが付いていないはずです");
click("#toggle-btn");
await sleep(50);
assert($("#box").classList.contains("active"), "1回押すとboxにactiveクラスが付くはずです。classList.toggleを使いましょう");
click("#toggle-btn");
await sleep(50);
assert(!$("#box").classList.contains("active"), "もう1回押すとactiveクラスが外れるはずです。addではなくtoggleを使いましょう");`
    },
    {
      id: 6,
      title: "data-*属性とdataset",
      explanation: `<p>HTMLの要素には、<code>data-</code>で始まる名前の属性を自由に追加できます。これを<strong>data属性（カスタムデータ属性）</strong>と呼びます。「この要素に関するちょっとしたデータをHTML側に持たせておく」ための正式な仕組みです。</p>
<pre><code>&lt;p id="apple" data-name="りんご" data-price="150"&gt;商品カード&lt;/p&gt;</code></pre>
<p>JavaScriptからは、要素の<code>dataset</code>プロパティを通じて読み書きできます。<code>data-</code>の後ろの名前がそのままプロパティ名になります。</p>
<pre><code>const apple = document.getElementById("apple");
apple.dataset.name;  // "りんご"
apple.dataset.price; // "150"（文字列として返る点に注意）</code></pre>
<p>注意点は2つあります。</p>
<ul>
<li>datasetの値は<strong>常に文字列</strong>。数値として計算したいときは<code>Number()</code>などで変換が必要</li>
<li><code>data-user-name</code>のようにハイフンを含む名前は、<code>dataset.userName</code>と<strong>キャメルケース</strong>に変換される</li>
</ul>
<p>このdata属性こそ、Stimulusの心臓部です。<code>data-controller</code>も<code>data-action</code>も、すべてここで学んだdata属性の応用にすぎません。「HTMLに情報を書いておき、JSがそれを読む」という流れを、ここでしっかり体験しておきましょう。</p>`,
      task: `apple要素のdata-price属性をdatasetで読み取り、resultに「りんごは150円です」と表示してください（商品名はすでに読み取ってあるnameを使います）。`,
      code: `<p id="apple" data-name="りんご" data-price="150">商品カード</p>
<p id="result"></p>

<script>
const apple = document.getElementById("apple");
const result = document.getElementById("result");

// data-name属性はdataset.nameで読める
const name = apple.dataset.name;

// TODO: data-price属性をdatasetから読み取り、
//       resultに「りんごは150円です」と表示する（nameと+で連結する）
<\/script>`,
      solution: `<p id="apple" data-name="りんご" data-price="150">商品カード</p>
<p id="result"></p>

<script>
const apple = document.getElementById("apple");
const result = document.getElementById("result");

// data-name属性はdataset.nameで読める
const name = apple.dataset.name;

const price = apple.dataset.price;
result.textContent = name + "は" + price + "円です";
<\/script>`,
      hints: [`data-price属性はapple.dataset.priceで読み取れます`, `result.textContent = name + "は" + price + "円です"; のように連結します`],
      check: `assert($("#apple"), "id=appleの要素が必要です");
assert($("#apple").dataset.price === "150", "apple要素にはdata-price=\\"150\\"が付いているはずです。属性を書き換えずにdatasetで読み取りましょう");
assert(text("#result") === "りんごは150円です", "#resultに「りんごは150円です」と表示されるはずです。dataset.priceで値を読み取り+で連結しましょう");`
    },
    {
      id: 7,
      title: "createElementとappendChild",
      explanation: `<p>これまでは「すでにある要素」を書き換えてきました。今度は<strong>要素そのものをJSで新しく作って</strong>ページに追加します。手順は3段階です。</p>
<ol>
<li><code>document.createElement("li")</code>で新しい要素を作る（この時点ではまだ画面に出ない）</li>
<li>作った要素の<code>textContent</code>などを設定する</li>
<li>親にしたい要素の<code>appendChild(新要素)</code>で、親の<strong>末尾の子</strong>として差し込む</li>
</ol>
<pre><code>const li = document.createElement("li");
li.textContent = "新しい項目";
list.appendChild(li); // ここで初めて画面に現れる</code></pre>
<p>createElementで作った直後の要素は、DOMツリーのどこにもつながっていない「浮いた」状態です。appendChildで親につないだ瞬間に描画されます。この「作る→設定する→つなぐ」の順序を覚えてください。</p>
<p>また、クリックのたびに新しい要素を作れば、リストは押した回数だけ増えていきます。変数<code>count</code>を用意して番号を振れば「項目1」「項目2」と連番の項目が作れます。動的にUIが増えるパターンは、TODOリストやコメント欄など実務のあらゆる場面で登場します。第14章「リスト操作UI」でStimulus版をじっくり作るので、ここで素のDOM版を体験しておきましょう。</p>`,
      task: `追加ボタンが押されるたびに、li要素を新しく作り、textContentを「項目1」「項目2」…（countを連結）にして、listに追加してください。`,
      code: `<button id="add-btn">項目を追加</button>
<ul id="list"></ul>

<script>
const btn = document.getElementById("add-btn");
const list = document.getElementById("list");
let count = 0;

btn.addEventListener("click", () => {
  count = count + 1;
  // TODO(1): document.createElementでli要素を作る
  // TODO(2): liのtextContentを「項目」+ count にする
  // TODO(3): list.appendChildでliを追加する
});
<\/script>`,
      solution: `<button id="add-btn">項目を追加</button>
<ul id="list"></ul>

<script>
const btn = document.getElementById("add-btn");
const list = document.getElementById("list");
let count = 0;

btn.addEventListener("click", () => {
  count = count + 1;
  const li = document.createElement("li");
  li.textContent = "項目" + count;
  list.appendChild(li);
});
<\/script>`,
      hints: [`const li = document.createElement("li"); で要素を作ります`, `作ったliはlist.appendChild(li); で画面に追加されます`],
      check: `assert($("#list"), "id=listの<ul>要素が必要です");
assert($$("#list li").length === 0, "ボタンを押す前はリストが空のはずです");
click("#add-btn");
await sleep(50);
click("#add-btn");
await sleep(50);
const items = $$("#list li");
assert(items.length === 2, "ボタンを2回押すと<li>が2つ追加されるはずです。createElementとappendChildを使いましょう");
assert(items[0].textContent.trim() === "項目1", "1つ目の<li>は「項目1」のはずです。「項目」+ countで文字を作りましょう");
assert(items[1].textContent.trim() === "項目2", "2つ目の<li>は「項目2」のはずです。countは押すたびに増えています");`
    },
    {
      id: 8,
      title: "remove()で要素を消す",
      explanation: `<p>要素の追加の次は削除です。要素自身の<code>remove()</code>メソッドを呼ぶと、その要素はDOMツリーから切り離され、画面から消えます。</p>
<pre><code>const notice = document.getElementById("notice");
notice.remove(); // noticeが画面から消える</code></pre>
<p>使い方はこれだけですが、知っておきたいポイントがいくつかあります。</p>
<ul>
<li>removeすると<strong>その要素の中身（子要素）もまとめて消える</strong>。お知らせ枠をremoveすれば、中の閉じるボタンも一緒に消える</li>
<li>消えた後に<code>document.querySelector("#notice")</code>で探すと<code>null</code>が返る。「消えた＝DOMに存在しない」ということ</li>
<li>変数に入れた参照自体は残るが、画面には表示されない</li>
</ul>
<p>今回のような「×ボタンで自分の属する枠ごと閉じる」UIは、通知バナーやモーダルなど実務で頻出のパターンです。</p>
<p>もう1つ大事な視点があります。要素が消えるとき、その要素に登録していたイベントリスナーの後始末はどうなるのか──素のDOMではこうした管理をすべて自分で意識する必要があります。Stimulusでは要素の出現・消滅を自動で検知して接続・切断してくれる仕組み（第9章「ライフサイクル」）があり、この面倒を大きく減らしてくれます。</p>`,
      task: `閉じるボタンが押されたら、notice要素をremove()で削除してください。`,
      code: `<div id="notice">
  お知らせ：本日はセール中です
  <button id="close-btn">×閉じる</button>
</div>

<script>
const notice = document.getElementById("notice");
const btn = document.getElementById("close-btn");

btn.addEventListener("click", () => {
  // TODO: notice要素をremove()で削除する
});
<\/script>`,
      solution: `<div id="notice">
  お知らせ：本日はセール中です
  <button id="close-btn">×閉じる</button>
</div>

<script>
const notice = document.getElementById("notice");
const btn = document.getElementById("close-btn");

btn.addEventListener("click", () => {
  notice.remove();
});
<\/script>`,
      hints: [`notice.remove(); の1行で要素ごと削除できます`],
      check: `assert($("#notice"), "ボタンを押す前はid=noticeのお知らせが表示されているはずです");
click("#close-btn");
await sleep(50);
assert($("#notice") === null, "閉じるボタンを押すと#noticeがDOMから消えるはずです。notice.remove()を呼びましょう");`
    },
    {
      id: 9,
      title: "イベントオブジェクト（event.target）",
      explanation: `<p>イベントリスナーの関数は、実行されるときに<strong>イベントオブジェクト</strong>を引数として受け取れます。慣習的に<code>event</code>や<code>e</code>という名前を付けます。この中には「どんなイベントが・どこで起きたか」の情報が詰まっています。</p>
<pre><code>parent.addEventListener("click", (event) =&gt; {
  console.log(event.target); // 実際にクリックされた要素
});</code></pre>
<p>特に重要なのが<code>event.target</code>で、<strong>実際にイベントが発生した要素</strong>を指します。ここで面白いのは、クリックイベントは発生した要素から親へ親へと<strong>伝わっていく</strong>（バブリングと呼びます）ことです。つまり親要素に1つだけリスナーを付けておけば、その中のどのボタンがクリックされても捕まえられて、event.targetを見れば「どのボタンだったか」が分かります。</p>
<p>この書き方の利点を、ボタン3つの例で比べてみましょう。</p>
<table>
<tr><th>方式</th><th>リスナーの数</th><th>ボタンが増えたら</th></tr>
<tr><td>各ボタンに登録</td><td>3個</td><td>登録コードも増やす必要がある</td></tr>
<tr><td>親に1つ登録＋event.target</td><td>1個</td><td>そのまま動く</td></tr>
</table>
<p><code>event.target.textContent</code>とすれば、押されたボタンの表示文字が取れます。今回はこれを使って「どのフルーツが選ばれたか」を表示してみましょう。</p>`,
      task: `fruitsの中のボタンがクリックされたら、event.targetを使って「みかんが選ばれました」のように、押されたボタンの文字＋「が選ばれました」をpickedに表示してください。`,
      code: `<div id="fruits">
  <button>りんご</button>
  <button>みかん</button>
  <button>ぶどう</button>
</div>
<p id="picked">まだ選ばれていません</p>

<script>
const fruits = document.getElementById("fruits");
const picked = document.getElementById("picked");

fruits.addEventListener("click", (event) => {
  // TODO: event.targetのtextContentを使って
  //       「〇〇が選ばれました」とpickedに表示する
});
<\/script>`,
      solution: `<div id="fruits">
  <button>りんご</button>
  <button>みかん</button>
  <button>ぶどう</button>
</div>
<p id="picked">まだ選ばれていません</p>

<script>
const fruits = document.getElementById("fruits");
const picked = document.getElementById("picked");

fruits.addEventListener("click", (event) => {
  picked.textContent = event.target.textContent + "が選ばれました";
});
<\/script>`,
      hints: [`押されたボタンはevent.targetで取れます`, `picked.textContent = event.target.textContent + "が選ばれました"; と書きます`],
      check: `assert($$("#fruits button").length === 3, "fruitsの中にボタンが3つ必要です");
click("#fruits button:nth-of-type(2)");
await sleep(50);
assert(text("#picked") === "みかんが選ばれました", "「みかん」ボタンを押すと「みかんが選ばれました」と表示されるはずです。event.target.textContentを使いましょう");
click("#fruits button:nth-of-type(3)");
await sleep(50);
assert(text("#picked") === "ぶどうが選ばれました", "「ぶどう」ボタンを押すと「ぶどうが選ばれました」と表示されるはずです。押されたボタンごとに表示が変わるのがevent.targetの力です");`
    },
    {
      id: 10,
      title: "総合演習：クリックカウンタを素のDOMで作る",
      explanation: `<p>第1章の総仕上げとして、<strong>クリックカウンタ</strong>を作ります。仕様は次の通りです。</p>
<ul>
<li>「カウント」ボタンを押すたびに数が1増え、「3回」のように表示される</li>
<li>「リセット」ボタンを押すと0に戻り、「0回」と表示される</li>
</ul>
<p>使う道具はすべてこの章で学んだものです。</p>
<table>
<tr><th>やること</th><th>使う道具</th><th>学んだステップ</th></tr>
<tr><td>要素の取得</td><td><code>getElementById</code></td><td>2</td></tr>
<tr><td>クリックに反応</td><td><code>addEventListener("click", ...)</code></td><td>3</td></tr>
<tr><td>表示の書き換え</td><td><code>textContent</code>と文字列連結</td><td>1、4</td></tr>
</table>
<p>設計のポイントは、<strong>現在の値を変数<code>count</code>に持ち、表示はcountから毎回作り直す</strong>ことです。</p>
<pre><code>count = count + 1;
display.textContent = count + "回";</code></pre>
<p>表示文字列を直接いじって「数字部分を取り出して足す」ような書き方もできますが、壊れやすくおすすめしません。「状態（count）が真実で、画面は状態を映すだけ」という考え方は、Stimulusでも(そしてReactなどでも)一貫して通用する大原則です。リセットはcountを0に戻してから同じ方法で表示を更新するだけです。2つのリスナーを落ち着いて書いていきましょう。</p>`,
      task: `カウントボタンで数が1ずつ増えて「〇回」と表示され、リセットボタンで0に戻って「0回」と表示されるようにしてください。`,
      code: `<h3>クリックカウンタ</h3>
<button id="count-btn">カウント</button>
<button id="reset-btn">リセット</button>
<p id="count-display">0回</p>

<script>
let count = 0;
const countBtn = document.getElementById("count-btn");
const resetBtn = document.getElementById("reset-btn");
const display = document.getElementById("count-display");

// TODO(1): countBtnのクリックでcountを1増やし、「〇回」と表示する

// TODO(2): resetBtnのクリックでcountを0に戻し、「0回」と表示する
<\/script>`,
      solution: `<h3>クリックカウンタ</h3>
<button id="count-btn">カウント</button>
<button id="reset-btn">リセット</button>
<p id="count-display">0回</p>

<script>
let count = 0;
const countBtn = document.getElementById("count-btn");
const resetBtn = document.getElementById("reset-btn");
const display = document.getElementById("count-display");

countBtn.addEventListener("click", () => {
  count = count + 1;
  display.textContent = count + "回";
});

resetBtn.addEventListener("click", () => {
  count = 0;
  display.textContent = count + "回";
});
<\/script>`,
      hints: [`リスナーは2つ書きます。countBtn用とresetBtn用です`, `表示の更新はどちらも display.textContent = count + "回"; で共通です`],
      check: `assert(text("#count-display") === "0回", "最初の表示は「0回」のはずです");
click("#count-btn");
await sleep(50);
click("#count-btn");
await sleep(50);
click("#count-btn");
await sleep(50);
assert(text("#count-display") === "3回", "カウントボタンを3回押すと「3回」と表示されるはずです。countを1増やしてから表示を更新しましょう");
click("#reset-btn");
await sleep(50);
assert(text("#count-display") === "0回", "リセットボタンを押すと「0回」に戻るはずです。countを0にしてから表示を更新しましょう");
click("#count-btn");
await sleep(50);
assert(text("#count-display") === "1回", "リセット後にカウントすると「1回」になるはずです。変数countそのものを0に戻しましたか");`
    }
  ]
});
