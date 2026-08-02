// 第25章：よくあるエラー：実践デバッグ
registerChapter({
  number: 25,
  title: "よくあるエラー：実践デバッグ",
  description: "実務のデバッグで頻出する「エラーが出ないのに動かない」バグを再現コードで体験し、原因の特定から修正までを訓練します。最後はバグだらけのTODOアプリを完全修復して卒業です。",
  steps: [
    {
      id: 241,
      title: "valueとtextContentの混同で入力が取れない",
      explanation: `<h4>何が起きるか</h4>
<p>名前を入力してボタンを押しても「こんにちは、さん！」と表示され、入力した名前だけが抜け落ちます。コンソールにエラーは一切出ません。この「エラーなしで一部だけおかしい」パターンは、実務でもっとも時間を溶かすタイプのバグです。</p>
<h4>デバッグの手がかり</h4>
<p>まず疑わしい値をログに出します。<code>console.log(this.nameTarget.textContent)</code>とすると空文字が出力され、「入力値が取れていない」ことが確定します。</p>
<h4>なぜ起きるか</h4>
<p><code>&lt;input&gt;</code>や<code>&lt;textarea&gt;</code>に入力された値は<strong>valueプロパティ</strong>で取り出します。<code>textContent</code>は「開始タグと終了タグの間のテキスト」を返すプロパティで、<code>&lt;input&gt;</code>は中身を持たない空要素のため常に空文字になります。逆に、<code>&lt;p&gt;</code>や<code>&lt;span&gt;</code>の表示テキストを<code>value</code>で取ろうとすると<code>undefined</code>になります。</p>
<table>
<tr><th>要素</th><th>使うプロパティ</th></tr>
<tr><td>input / textarea / select</td><td><code>value</code></td></tr>
<tr><td>p / span / div などの表示テキスト</td><td><code>textContent</code></td></tr>
</table>
<h4>修正パターン</h4>
<pre><code>hello() {
  const name = this.nameTarget.value;
  this.outputTarget.textContent = "こんにちは、" + name + "さん！";
}</code></pre>
<p>「フォーム部品はvalue、表示要素はtextContent」と覚えておくと、この種のバグは一瞬で見抜けるようになります。</p>`,
      task: `名前を入力して「あいさつ」を押しても名前が表示されません。入力値の取り出し方を修正して、「こんにちは、太郎さん！」のように表示されるようにしてください。`,
      code: `<div data-controller="greet">
  <input data-greet-target="name" type="text" placeholder="名前を入力">
  <button data-action="click->greet#hello">あいさつ</button>
  <p data-greet-target="output"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("greet", class extends Controller {
  static targets = ["name", "output"];

  hello() {
    // 入力された名前を取り出す（このままでは取れない）
    const name = this.nameTarget.textContent;
    this.outputTarget.textContent = "こんにちは、" + name + "さん！";
  }
});
<\/script>`,
      solution: `<div data-controller="greet">
  <input data-greet-target="name" type="text" placeholder="名前を入力">
  <button data-action="click->greet#hello">あいさつ</button>
  <p data-greet-target="output"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("greet", class extends Controller {
  static targets = ["name", "output"];

  hello() {
    // 入力欄の値はvalueプロパティで取り出す
    const name = this.nameTarget.value;
    this.outputTarget.textContent = "こんにちは、" + name + "さん！";
  }
});
<\/script>`,
      hints: [
        `console.log(this.nameTarget.textContent)を仕込むと、空文字しか取れていないことが分かります`,
        `input要素は中身を持たない空要素なので、textContentは常に空文字です`,
        `入力欄の値はthis.nameTarget.valueで取り出します`
      ],
      check: `assert($("[data-controller=greet]"), "data-controller=greetの要素が必要です");
setValue("[data-greet-target=name]", "太郎");
click("button");
await sleep(50);
assert(text("[data-greet-target=output]") === "こんにちは、太郎さん！", "「太郎」と入力してボタンを押すと「こんにちは、太郎さん！」と表示されるはずです。入力欄の値はvalueプロパティで取り出しましょう");`
    },
    {
      id: 242,
      title: "parseFloat忘れでNaN（数量×単価）",
      explanation: `<h4>何が起きるか</h4>
<p>数量を入れて「計算」を押すと、合計欄に<strong>NaN円</strong>と表示されます。NaNは「Not a Number（数値ではない）」という特殊な値で、数値にできないものを計算しようとした印です。</p>
<h4>デバッグの手がかり</h4>
<p>NaNを見たら「計算のどこかに数値でないものが混ざった」と考え、材料を1つずつログに出します。<code>console.log(this.priceTarget.textContent)</code>とすると「120円」という<strong>単位付きの文字列</strong>が出てきます。JavaScriptは掛け算のとき文字列を数値へ自動変換しようとしますが、"120円"は変換できずNaNになります。そしてNaNは<strong>どんな計算に混ぜても結果がNaNのまま伝染する</strong>ため、最終表示までNaNが届きます。</p>
<h4>修正パターン</h4>
<p><code>parseFloat()</code>は文字列の<strong>先頭から読める数値部分だけ</strong>を取り出す関数です。"120円"のような単位付き文字列から120を取り出せます。似た関数<code>Number()</code>との違いを押さえておきましょう。</p>
<table>
<tr><th>入力</th><th>Number()</th><th>parseFloat()</th></tr>
<tr><td>"120"</td><td>120</td><td>120</td></tr>
<tr><td>"120円"</td><td>NaN</td><td>120</td></tr>
<tr><td>"3.5"</td><td>3.5</td><td>3.5</td></tr>
<tr><td>""（空文字）</td><td>0</td><td>NaN</td></tr>
</table>
<pre><code>const price = parseFloat(this.priceTarget.textContent);
const qty = parseFloat(this.qtyTarget.value);
this.totalTarget.textContent = (price * qty) + "円";</code></pre>
<p>なお入力欄の<code>value</code>も常に文字列です（type="number"でも同じ）。計算に使う前に数値へ変換する習慣を付けましょう。</p>`,
      task: `数量を入れて「計算」を押すと合計がNaN円になります。文字列を数値に変換してから掛け算するように修正し、正しい合計金額を表示してください。`,
      code: `<div data-controller="cart">
  <p>単価：<span data-cart-target="price">120円</span></p>
  <p>数量：<input data-cart-target="qty" type="number" value="1"></p>
  <button data-action="click->cart#calc">計算</button>
  <p>合計：<span data-cart-target="total">-</span></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("cart", class extends Controller {
  static targets = ["price", "qty", "total"];

  calc() {
    // 単価と数量を取り出して掛け算する（このままではNaNになる）
    const price = this.priceTarget.textContent;
    const qty = this.qtyTarget.value;
    this.totalTarget.textContent = (price * qty) + "円";
  }
});
<\/script>`,
      solution: `<div data-controller="cart">
  <p>単価：<span data-cart-target="price">120円</span></p>
  <p>数量：<input data-cart-target="qty" type="number" value="1"></p>
  <button data-action="click->cart#calc">計算</button>
  <p>合計：<span data-cart-target="total">-</span></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("cart", class extends Controller {
  static targets = ["price", "qty", "total"];

  calc() {
    // parseFloatで先頭の数値部分だけを取り出してから計算する
    const price = parseFloat(this.priceTarget.textContent);
    const qty = parseFloat(this.qtyTarget.value);
    this.totalTarget.textContent = (price * qty) + "円";
  }
});
<\/script>`,
      hints: [
        `console.logで単価を出力すると「120円」という単位付きの文字列であることが分かります`,
        `"120円" * 3 はNaNになります。parseFloat("120円")なら先頭の120を取り出せます`,
        `priceとqtyの両方をparseFloat()で数値に変換してから掛け算しましょう`
      ],
      check: `assert($("[data-controller=cart]"), "data-controller=cartの要素が必要です");
setValue("[data-cart-target=qty]", "3");
click("button");
await sleep(50);
assert(text("[data-cart-target=total]") === "360円", "数量3のとき合計は「360円」になるはずです（120×3）。NaNになる場合は「120円」という文字列のまま計算していないか確認しましょう");`
    },
    {
      id: 243,
      title: "classListのクラス名にドットを付ける罠",
      explanation: `<h4>何が起きるか</h4>
<p>「強調する」を押してもお知らせが黄色くなりません。コンソールにエラーは出ず、コードも一見正しそうに見えます。</p>
<h4>デバッグの手がかり</h4>
<p>クラスの付け外しが効かないときは、開発者ツールで要素のclass属性を直接見るのが近道です。今回の場合、ボタンを押した後の要素は<code>class=".active"</code>になっています。つまり<strong>「.active」というドット付きの名前のクラス</strong>が付いてしまっているのです。CSSの<code>.active</code>セレクタは「activeというクラス名」にしか一致しないため、スタイルは適用されません。しかもドット入りのクラス名は文法違反ではないので、<strong>エラーも警告も出ません</strong>。</p>
<h4>なぜ起きるか</h4>
<p>CSSセレクタとクラス名の書き分けを混同したのが原因です。ドット（.）は「これはクラスですよ」というセレクタ側の記号であって、クラス名の一部ではありません。</p>
<table>
<tr><th>場面</th><th>書き方</th></tr>
<tr><td>CSSやquerySelectorのセレクタ</td><td><code>querySelector(".active")</code>（ドットあり）</td></tr>
<tr><td>classListに渡すクラス名</td><td><code>classList.add("active")</code>（ドットなし）</td></tr>
</table>
<h4>修正パターン</h4>
<pre><code>on() {
  this.boxTarget.classList.add("active");
}</code></pre>
<p>なおStimulusには第8章で学んだclasses機能（<code>static classes</code>と<code>data-x-yyy-class</code>）もあり、こちらでもクラス名はドットなしで書きます。</p>`,
      task: `「強調する」を押してもお知らせが黄色くなりません。classListに渡しているクラス名を修正して、activeクラスが正しく付くようにしてください。`,
      code: `<div data-controller="highlight">
  <button data-action="click->highlight#on">強調する</button>
  <p data-highlight-target="box">お知らせ：本日セール開催中です</p>
</div>

<style>
  .active { background: yellow; font-weight: bold; }
</style>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("highlight", class extends Controller {
  static targets = ["box"];

  on() {
    // お知らせにactiveクラスを付ける（このままではスタイルが効かない）
    this.boxTarget.classList.add(".active");
  }
});
<\/script>`,
      solution: `<div data-controller="highlight">
  <button data-action="click->highlight#on">強調する</button>
  <p data-highlight-target="box">お知らせ：本日セール開催中です</p>
</div>

<style>
  .active { background: yellow; font-weight: bold; }
</style>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("highlight", class extends Controller {
  static targets = ["box"];

  on() {
    // classListに渡すのはクラス名そのもの（ドットは付けない）
    this.boxTarget.classList.add("active");
  }
});
<\/script>`,
      hints: [
        `ボタンを押した後、開発者ツールで<p>要素を見るとclass=".active"になっています`,
        `ドット（.）はCSSセレクタで使う記号で、クラス名そのものには含めません`,
        `classList.add("active")のようにドットなしで書きます`
      ],
      check: `assert($("[data-controller=highlight]"), "data-controller=highlightの要素が必要です");
click("button");
await sleep(50);
var box = $("[data-highlight-target=box]");
assert(!box.classList.contains(".active"), "「.active」というドット付きの名前のクラスが付いています。classListにはドットなしのクラス名を渡しましょう");
assert(box.classList.contains("active"), "ボタンを押すとお知らせにactiveクラス（ドットなし）が付くはずです");`
    },
    {
      id: 244,
      title: "template複製でid重複（targetに切り替える）",
      explanation: `<h4>何が起きるか</h4>
<p>「追加」を押すたびに行は増えますが、<strong>2件目以降の文字が空のまま</strong>で、しかも1件目の文字が毎回上書きされます。エラーは出ません。</p>
<h4>なぜ起きるか</h4>
<p>idは<strong>文書内で一意（1つだけ）</strong>が原則です。ところがtemplateを複製すると、同じ<code>id="item-label"</code>を持つ要素がどんどん増えます。<code>document.getElementById()</code>は重複したidに対して<strong>常に最初の1つだけ</strong>を返すため、何度追加しても書き込み先が1件目のspanに固定されてしまうのです。ブラウザはid重複を黙って受け入れるので、警告も出ません。</p>
<h4>修正パターン：idをやめてターゲットに切り替える</h4>
<p>Stimulusのターゲットは<strong>同じ名前を複数の要素に付けてよい</strong>設計で、複数形の<code>xxxTargets</code>で全部をまとめて取得できます。しかもコントローラのスコープ内だけを探すので、ページ内の他の部分と衝突しません。</p>
<pre><code>&lt;template data-addlist-target="tpl"&gt;
  &lt;li&gt;&lt;span data-addlist-target="label"&gt;&lt;/span&gt;&lt;/li&gt;
&lt;/template&gt;</code></pre>
<pre><code>add() {
  const clone = this.tplTarget.content.cloneNode(true);
  this.listTarget.appendChild(clone);
  const labels = this.labelTargets;
  labels[labels.length - 1].textContent = this.inputTarget.value;
}</code></pre>
<p>template内の要素は複製されてDOMに挿入された時点でターゲットとして扱われるため、追加直後に<code>this.labelTargets</code>の最後の要素が「いま追加したspan」になります。<code>static targets</code>への追加も忘れずに。「複製するHTMLにidを書かない」はStimulusに限らない実務の鉄則です。</p>`,
      task: `2回以上追加すると、1件目が上書きされ2件目以降が空になります。template内のidをdata-addlist-target="label"に切り替え、追加した行それぞれに入力内容が表示されるように修正してください。`,
      code: `<div data-controller="addlist">
  <input data-addlist-target="input" type="text" placeholder="項目名">
  <button data-action="click->addlist#add">追加</button>
  <ul data-addlist-target="list"></ul>
  <template data-addlist-target="tpl">
    <li><span id="item-label"></span></li>
  </template>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("addlist", class extends Controller {
  static targets = ["input", "list", "tpl"];

  add() {
    const clone = this.tplTarget.content.cloneNode(true);
    this.listTarget.appendChild(clone);
    // 追加した行のspanに入力内容を書き込む（idが重複して1件目しか更新されない）
    document.getElementById("item-label").textContent = this.inputTarget.value;
    this.inputTarget.value = "";
  }
});
<\/script>`,
      solution: `<div data-controller="addlist">
  <input data-addlist-target="input" type="text" placeholder="項目名">
  <button data-action="click->addlist#add">追加</button>
  <ul data-addlist-target="list"></ul>
  <template data-addlist-target="tpl">
    <li><span data-addlist-target="label"></span></li>
  </template>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("addlist", class extends Controller {
  static targets = ["input", "list", "tpl", "label"];

  add() {
    const clone = this.tplTarget.content.cloneNode(true);
    this.listTarget.appendChild(clone);
    // ターゲットなら同名複数OK。最後の要素＝いま追加したspan
    const labels = this.labelTargets;
    labels[labels.length - 1].textContent = this.inputTarget.value;
    this.inputTarget.value = "";
  }
});
<\/script>`,
      hints: [
        `getElementByIdは、idが重複していると常に最初の1つだけを返します`,
        `template内のspanをid="item-label"からdata-addlist-target="label"に変え、static targetsに"label"を追加します`,
        `追加直後はthis.labelTargets[this.labelTargets.length - 1]が「いま追加したspan」です`
      ],
      check: `assert($("[data-controller=addlist]"), "data-controller=addlistの要素が必要です");
setValue("[data-addlist-target=input]", "りんご");
click("button");
await sleep(50);
setValue("[data-addlist-target=input]", "みかん");
click("button");
await sleep(50);
var items = $$("[data-addlist-target=list] li");
assert(items.length === 2, "2回追加したらliが2つになるはずです");
assert(items[0].textContent.trim() === "りんご", "1件目のliには「りんご」と表示されるはずです。idが重複して1件目が上書きされていないか確認しましょう");
assert(items[1].textContent.trim() === "みかん", "2件目のliには「みかん」と表示されるはずです。getElementByIdでは追加した行に書き込めません");`
    },
    {
      id: 245,
      title: "リスト削除でボタン自身だけをremoveしてしまう",
      explanation: `<h4>何が起きるか</h4>
<p>「削除」を押すと<strong>ボタンだけが消えて、果物の名前は残ったまま</strong>になります。削除機能としては明らかに壊れていますが、エラーは出ません。</p>
<h4>なぜ起きるか</h4>
<p>第22章で学んだとおり、<code>event.currentTarget</code>は「data-actionを書いた要素」＝削除ボタン自身です。そのまま<code>remove()</code>を呼ぶと、消えるのはボタンだけ。本当に消したいのは、ボタンを包んでいる行（<code>&lt;li&gt;</code>）全体です。</p>
<h4>修正パターン：closestで祖先を辿る</h4>
<p><code>closest(セレクタ)</code>は、<strong>その要素自身から親方向へ向かって</strong>、セレクタに一致する最も近い要素を返すメソッドです。見つからなければnullを返します。</p>
<pre><code>remove(event) {
  event.currentTarget.closest("li").remove();
}</code></pre>
<p>この「ボタン→closestで行を特定→行ごと削除」は、リストUIの削除処理の定番パターンです。querySelectorが「子孫方向」へ探すのに対し、closestは「祖先方向」へ探す、と対で覚えておきましょう。</p>
<table>
<tr><th>メソッド</th><th>探す方向</th></tr>
<tr><td><code>querySelector</code></td><td>自分の内側（子孫）</td></tr>
<tr><td><code>closest</code></td><td>自分自身と外側（祖先）</td></tr>
</table>
<p>なお、行ごとに別のコントローラを割り当てる設計なら<code>this.element.remove()</code>でも同じことができますが、1つのコントローラでリスト全体を管理する今回の形ではclosestが最短です。</p>`,
      task: `「削除」を押すとボタンだけが消えて名前が残ってしまいます。closestを使って、ボタンを含む行（li）ごと削除されるように修正してください。`,
      code: `<ul data-controller="list">
  <li>りんご <button data-action="click->list#remove">削除</button></li>
  <li>みかん <button data-action="click->list#remove">削除</button></li>
  <li>ぶどう <button data-action="click->list#remove">削除</button></li>
</ul>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("list", class extends Controller {
  remove(event) {
    // 行を削除する（このままではボタンだけが消える）
    event.currentTarget.remove();
  }
});
<\/script>`,
      solution: `<ul data-controller="list">
  <li>りんご <button data-action="click->list#remove">削除</button></li>
  <li>みかん <button data-action="click->list#remove">削除</button></li>
  <li>ぶどう <button data-action="click->list#remove">削除</button></li>
</ul>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("list", class extends Controller {
  remove(event) {
    // closestで祖先方向に最も近いliを探し、行ごと削除する
    event.currentTarget.closest("li").remove();
  }
});
<\/script>`,
      hints: [
        `event.currentTargetは削除ボタン自身なので、remove()するとボタンだけが消えます`,
        `closest("li")は、その要素から親方向に辿って最も近いliを返します`,
        `event.currentTarget.closest("li").remove()と書きます`
      ],
      check: `assert($("[data-controller=list]"), "data-controller=listの要素が必要です");
click("li:first-child button");
await sleep(50);
var items = $$("li");
assert(items.length === 2, "削除ボタンを押したら行（li）ごと消えて、liは2つになるはずです。ボタンだけ消えていませんか？");
assert(items[0].textContent.indexOf("みかん") !== -1, "1行目を削除したので、先頭の行は「みかん」になるはずです");`
    },
    {
      id: 246,
      title: "状態をJS変数だけに持ちDOMとズレる",
      explanation: `<h4>何が起きるか</h4>
<p>画面には最初から「いいね：5件」と表示されています（サーバーが描画した初期値のつもりです）。ところが+1を押すと<strong>6ではなく1</strong>になります。エラーは出ません。</p>
<h4>なぜ起きるか</h4>
<p>「本当の状態」が2か所に分かれているのが原因です。HTMLは5と言っているのに、JS側は<code>connect()</code>で<code>this.count = 0</code>と勝手に0から数え始めています。2つの置き場は自動では同期しないので、最初のクリックで「JSの数字（0+1=1）」が「HTMLの数字（5）」を上書きし、ズレが表面化します。</p>
<h4>修正パターン：valuesを唯一の状態置き場にする</h4>
<p>第6章で学んだvaluesは、まさにこの問題のための仕組みです。状態を<code>data-counter-count-value="5"</code>としてHTMLのdata属性に置けば、サーバーが描画した初期値をそのまま引き継げます。そして<code>countValueChanged()</code>コールバックで表示を更新すれば、「値が変わる→表示が追従する」という一方向の流れになり、ズレようがありません。</p>
<pre><code>static values = { count: Number };

increment() {
  this.countValue = this.countValue + 1;
}

countValueChanged() {
  this.displayTarget.textContent = this.countValue;
}</code></pre>
<table>
<tr><th>設計</th><th>初期値</th><th>ズレ</th></tr>
<tr><td>JS変数に持つ</td><td>JSが勝手に決める</td><td>HTMLと食い違う</td></tr>
<tr><td>valueに持つ</td><td>HTMLのdata属性から読む</td><td>Changedコールバックで常に同期</td></tr>
</table>
<p>valueChangedは接続時にも1回呼ばれるため、初期表示も同じコードで描画されるのがポイントです。</p>`,
      task: `表示は5件なのに+1を押すと1件になってしまいます。カウントをJS変数ではなくvalue（data-counter-count-value）で管理し、5から6に増えるように修正してください。`,
      code: `<div data-controller="counter" data-counter-count-value="5">
  <p>いいね：<span data-counter-target="display">5</span>件</p>
  <button data-action="click->counter#increment">+1</button>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("counter", class extends Controller {
  static targets = ["display"];

  connect() {
    // カウントをJS変数で管理する（HTMLの「5件」と食い違ってしまう）
    this.count = 0;
  }

  increment() {
    this.count = this.count + 1;
    this.displayTarget.textContent = this.count;
  }
});
<\/script>`,
      solution: `<div data-controller="counter" data-counter-count-value="5">
  <p>いいね：<span data-counter-target="display">5</span>件</p>
  <button data-action="click->counter#increment">+1</button>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("counter", class extends Controller {
  static targets = ["display"];
  static values = { count: Number };

  increment() {
    this.countValue = this.countValue + 1;
  }

  countValueChanged() {
    // 値が変わるたび（接続時も含む）に表示を同期する
    this.displayTarget.textContent = this.countValue;
  }
});
<\/script>`,
      hints: [
        `HTMLにはすでにdata-counter-count-value="5"が書かれていますが、JSが無視して0から数えています`,
        `static values = { count: Number } を宣言し、this.countValueを増やしましょう`,
        `表示の更新はcountValueChanged()コールバックにまとめると、初期表示も同じコードで描画されます`
      ],
      check: `assert($("[data-controller=counter]"), "data-controller=counterの要素が必要です");
assert(text("[data-counter-target=display]") === "5", "初期表示は5件のはずです");
click("button");
await sleep(50);
assert(text("[data-counter-target=display]") === "6", "5件の状態で+1を押したら6件になるはずです。JS変数が0から数え始めていませんか？HTMLのdata-counter-count-valueを初期値として使いましょう");`
    },
    {
      id: 247,
      title: "連打で非同期処理が二重実行される",
      explanation: `<h4>何が起きるか</h4>
<p>「保存」を押すと少し時間のかかる保存処理（ここではsetTimeoutで擬似的に再現）が走ります。ところが処理が終わる前にもう一度押せてしまうため、<strong>連打した回数だけ保存が実行され</strong>、保存回数が2、3と増えていきます。実務ではフォームの二重送信・二重課金など重大事故につながる定番バグです。</p>
<h4>デバッグの手がかり</h4>
<p>「たまに2回登録される」という報告を受けたら、まず連打を疑います。ボタンを素早く2回押して回数表示を見れば再現できます。非同期処理（あとで結果が返ってくる処理）の「待ち時間の間もUIは生きている」ことがバグの土壌です。</p>
<h4>修正パターン：処理中はボタンをdisabledにする</h4>
<p>もっとも簡単で効果的なのが、<strong>処理を始めた瞬間にボタンを無効化し、終わったら戻す</strong>方法です。disabledなボタンはクリックイベント自体が発生しなくなり、見た目も灰色になるので「処理中である」ことがユーザーにも伝わります。</p>
<pre><code>save() {
  this.buttonTarget.disabled = true;
  this.statusTarget.textContent = "保存中...";
  setTimeout(() =&gt; {
    this.countTarget.textContent = parseInt(this.countTarget.textContent, 10) + 1;
    this.statusTarget.textContent = "保存しました";
    this.buttonTarget.disabled = false;
  }, 80);
}</code></pre>
<p>ボタンをターゲットにしておけば<code>this.buttonTarget.disabled</code>で切り替えられます。setTimeoutの中でアロー関数を使っているのは、thisをコントローラのまま保つためです（第22章219の復習）。</p>`,
      task: `保存ボタンを連打すると保存回数が押した分だけ増えてしまいます。処理開始時にボタンをdisabledにし、処理完了時に戻すことで、二重実行を防いでください。`,
      code: `<div data-controller="save">
  <button data-save-target="button" data-action="click->save#save">保存</button>
  <p>保存回数：<span data-save-target="count">0</span>回</p>
  <p data-save-target="status">-</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("save", class extends Controller {
  static targets = ["button", "count", "status"];

  save() {
    // 時間のかかる保存処理（連打すると回数分だけ実行されてしまう）
    this.statusTarget.textContent = "保存中...";
    setTimeout(() => {
      this.countTarget.textContent = parseInt(this.countTarget.textContent, 10) + 1;
      this.statusTarget.textContent = "保存しました";
    }, 80);
  }
});
<\/script>`,
      solution: `<div data-controller="save">
  <button data-save-target="button" data-action="click->save#save">保存</button>
  <p>保存回数：<span data-save-target="count">0</span>回</p>
  <p data-save-target="status">-</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("save", class extends Controller {
  static targets = ["button", "count", "status"];

  save() {
    // 処理中はボタンを無効化して連打による二重実行を防ぐ
    this.buttonTarget.disabled = true;
    this.statusTarget.textContent = "保存中...";
    setTimeout(() => {
      this.countTarget.textContent = parseInt(this.countTarget.textContent, 10) + 1;
      this.statusTarget.textContent = "保存しました";
      this.buttonTarget.disabled = false;
    }, 80);
  }
});
<\/script>`,
      hints: [
        `保存処理が終わるまでの間もボタンは押せるので、押した回数だけsetTimeoutが積まれます`,
        `save()の先頭でthis.buttonTarget.disabled = true;にします`,
        `setTimeoutの完了処理の中でthis.buttonTarget.disabled = false;に戻します`
      ],
      check: `assert($("[data-controller=save]"), "data-controller=saveの要素が必要です");
click("[data-save-target=button]");
assert($("[data-save-target=button]").disabled === true, "保存を開始した瞬間にボタンがdisabledになるはずです（連打防止）");
click("[data-save-target=button]");
await sleep(300);
assert(text("[data-save-target=count]") === "1", "素早く2回押しても保存は1回だけ実行されるはずです");
assert($("[data-save-target=button]").disabled === false, "保存が終わったらボタンは再び押せる状態に戻るはずです");
assert(text("[data-save-target=status]") === "保存しました", "保存完了後は「保存しました」と表示されるはずです");`
    },
    {
      id: 248,
      title: "実行中フラグの戻し忘れ（finallyで戻す）",
      explanation: `<h4>何が起きるか</h4>
<p>今回はbusyフラグで二重実行を防いでいますが、別のバグがあります。空のまま送信するとエラー表示になるのは正しいのですが、そのあと<strong>正しい本文を入れて押しても二度と送信できません</strong>。いわゆる「死にボタン」です。</p>
<h4>なぜ起きるか</h4>
<p>送信開始で<code>this.busy = true</code>にし、成功ルートの最後でfalseに戻しています。しかし<strong>エラーでreturnするルートでは戻し忘れて</strong>います。一度エラーを通るとbusyがtrueのまま残り、以後は先頭のガード<code>if (this.busy) return;</code>で全部弾かれてしまうのです。「たまに動かなくなるが、リロードすると直る」という報告はこのパターンをよく疑います。</p>
<h4>修正パターン：try/finallyで必ず戻す</h4>
<p>後始末は「どのルートを通っても必ず実行される場所」に書くのが鉄則です。JavaScriptでは<code>try { } finally { }</code>がそれで、<strong>finallyブロックはreturnで抜けても例外が投げられても必ず実行されます</strong>。</p>
<pre><code>setTimeout(() =&gt; {
  try {
    if (body === "") {
      this.statusTarget.textContent = "エラー：本文が空です";
      return;
    }
    this.statusTarget.textContent = "送信しました：" + body;
  } finally {
    this.busy = false;
  }
}, 80);</code></pre>
<p>前ステップのdisabled方式でも同じ罠があります（エラー時にdisabledを戻し忘れると死にボタンになる）。「フラグを立てたら、戻す処理はfinallyに」と覚えておくと、分岐が増えても戻し忘れが起きません。</p>`,
      task: `一度空のまま送信してエラーになると、その後正しい本文でも送信できなくなります。try/finallyを使って、どのルートを通ってもbusyフラグが必ずfalseに戻るように修正してください。`,
      code: `<div data-controller="post">
  <input data-post-target="input" type="text" placeholder="本文">
  <button data-action="click->post#send">送信</button>
  <p data-post-target="status">未送信</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("post", class extends Controller {
  static targets = ["input", "status"];

  send() {
    if (this.busy) return;
    this.busy = true;
    this.statusTarget.textContent = "送信中...";
    const body = this.inputTarget.value;
    setTimeout(() => {
      if (body === "") {
        // エラーで抜けるルート（busyがtrueのまま残ってしまう）
        this.statusTarget.textContent = "エラー：本文が空です";
        return;
      }
      this.statusTarget.textContent = "送信しました：" + body;
      this.busy = false;
    }, 80);
  }
});
<\/script>`,
      solution: `<div data-controller="post">
  <input data-post-target="input" type="text" placeholder="本文">
  <button data-action="click->post#send">送信</button>
  <p data-post-target="status">未送信</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("post", class extends Controller {
  static targets = ["input", "status"];

  send() {
    if (this.busy) return;
    this.busy = true;
    this.statusTarget.textContent = "送信中...";
    const body = this.inputTarget.value;
    setTimeout(() => {
      try {
        if (body === "") {
          this.statusTarget.textContent = "エラー：本文が空です";
          return;
        }
        this.statusTarget.textContent = "送信しました：" + body;
      } finally {
        // returnで抜けてもfinallyは必ず実行される
        this.busy = false;
      }
    }, 80);
  }
});
<\/script>`,
      hints: [
        `空欄で送信した後にconsole.logでthis.busyを見ると、trueのまま残っています`,
        `エラーでreturnするルートではthis.busy = false;を通っていません`,
        `処理本体をtryで囲み、finallyブロックの中でthis.busy = false;に戻します`
      ],
      check: `assert($("[data-controller=post]"), "data-controller=postの要素が必要です");
click("button");
await sleep(200);
assert(text("[data-post-target=status]") === "エラー：本文が空です", "空のまま送信するとエラー表示になるはずです");
setValue("[data-post-target=input]", "こんにちは");
click("button");
await sleep(200);
assert(text("[data-post-target=status]") === "送信しました：こんにちは", "エラーになった後でも、正しい本文なら再送信できるはずです。busyフラグがtrueのまま残っていませんか？finallyで必ず戻しましょう");`
    },
    {
      id: 249,
      title: "イベントバブリングで親のアクションも発火する",
      explanation: `<h4>何が起きるか</h4>
<p>通知カードのどこかをクリックすると詳細が開き、カード内の「閉じる」ボタンでカードを閉じる、というよくあるUIです。ところが「閉じる」を押すと、状態表示が一瞬「カードを閉じました」になった直後に<strong>「詳細を開きました」で上書き</strong>されます。閉じたいのに開いてしまうわけです。</p>
<h4>なぜ起きるか</h4>
<p>クリックイベントは、クリックされた要素から<strong>親要素へ向かって順に伝わっていきます</strong>。これを<strong>バブリング</strong>（泡が浮かぶ様子の比喩）と呼びます。「閉じる」ボタンをクリックすると、まずボタンの<code>dismiss</code>が実行され、その後イベントが親のカードまで泡のように昇っていき、カードの<code>open</code>も実行されてしまうのです。あとから実行された親の処理が表示を上書きします。</p>
<h4>修正パターン：:stopモディファイア</h4>
<p>Stimulusでは、data-actionに<code>:stop</code>を付けると、メソッド実行時に<code>event.stopPropagation()</code>が呼ばれ、<strong>イベントがそこから上に伝わらなくなります</strong>。</p>
<pre><code>&lt;button data-action="click-&gt;card#dismiss:stop"&gt;閉じる&lt;/button&gt;</code></pre>
<p>第22章で学んだ<code>:prevent</code>との使い分けを整理しておきましょう。</p>
<table>
<tr><th>モディファイア</th><th>呼ばれるもの</th><th>止めるもの</th></tr>
<tr><td><code>:stop</code></td><td>stopPropagation()</td><td>親要素への伝播（バブリング）</td></tr>
<tr><td><code>:prevent</code></td><td>preventDefault()</td><td>ブラウザの既定動作（送信・リンク遷移など）</td></tr>
</table>
<p>「入れ子のクリック領域では、内側のアクションに:stop」が定石です。なお:stopを付けても、カード本体を直接クリックしたときのopenは今までどおり動きます。</p>`,
      task: `「閉じる」ボタンを押すと、親カードのopenまで発火して表示が「詳細を開きました」に上書きされます。:stopモディファイアでバブリングを止め、「カードを閉じました」と表示されるように修正してください。`,
      code: `<div data-controller="card">
  <div data-action="click->card#open" style="border: 1px solid #999; padding: 12px;">
    <span>新着メッセージが1件あります</span>
    <button data-action="click->card#dismiss">閉じる</button>
  </div>
  <p>状態：<span data-card-target="status">-</span></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("card", class extends Controller {
  static targets = ["status"];

  open() {
    this.statusTarget.textContent = "詳細を開きました";
  }

  dismiss() {
    this.statusTarget.textContent = "カードを閉じました";
  }
});
<\/script>`,
      solution: `<div data-controller="card">
  <div data-action="click->card#open" style="border: 1px solid #999; padding: 12px;">
    <span>新着メッセージが1件あります</span>
    <button data-action="click->card#dismiss:stop">閉じる</button>
  </div>
  <p>状態：<span data-card-target="status">-</span></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("card", class extends Controller {
  static targets = ["status"];

  open() {
    this.statusTarget.textContent = "詳細を開きました";
  }

  dismiss() {
    // :stopによりバブリングが止まるので、親のopenは発火しない
    this.statusTarget.textContent = "カードを閉じました";
  }
});
<\/script>`,
      hints: [
        `クリックイベントはボタンから親のカードへ伝わる（バブリング）ため、dismissの後にopenも実行されています`,
        `内側のボタンのdata-actionに:stopモディファイアを付けます`,
        `data-action="click->card#dismiss:stop"と書きます`
      ],
      check: `assert($("[data-controller=card]"), "data-controller=cardの要素が必要です");
click("button");
await sleep(50);
assert(text("[data-card-target=status]") === "カードを閉じました", "「閉じる」を押したら状態は「カードを閉じました」になるはずです。バブリングで親のopenが後から発火していませんか？:stopで止めましょう");
click("span");
await sleep(50);
assert(text("[data-card-target=status]") === "詳細を開きました", "カード本体（文字部分）をクリックしたときは、今までどおり「詳細を開きました」になるはずです");`
    },
    {
      id: 250,
      title: "卒業課題：バグだらけのTODOアプリを完全修復する",
      explanation: `<h4>最終ミッション</h4>
<p>いよいよ卒業課題です。このTODOアプリには<strong>6個のバグ</strong>が仕込まれています。エラー章で学んだデバッグの腕をすべて使って、完全に動く状態へ修復してください。</p>
<h4>本来の仕様</h4>
<ul>
<li>入力してから「追加」で、リストに項目（文字＋削除ボタン）が増える</li>
<li>行の文字部分をクリックすると、<strong>行全体（li）</strong>にdoneクラスが付き、打ち消し線になる。もう一度クリックで戻る</li>
<li>「削除」で<strong>行ごと</strong>消え、状態表示が「削除しました」になる（他の表示に上書きされない）</li>
<li>「未完了：N件」には、doneでないliの数が常に正しく表示される</li>
</ul>
<h4>観察される症状</h4>
<table>
<tr><th>症状</th><th>復習ステップ</th></tr>
<tr><td>追加しても項目の文字が空</td><td>241</td></tr>
<tr><td>未完了件数がNaNになる</td><td>242・246</td></tr>
<tr><td>文字をクリックしても打ち消し線が付かない</td><td>218・243</td></tr>
<tr><td>削除でボタンだけ消えて文字が残る</td><td>245</td></tr>
<tr><td>削除すると状態表示がすぐ別の文言に変わる</td><td>249</td></tr>
</table>
<h4>デバッグの進め方</h4>
<p>一度に全部直そうとせず、<strong>1つの操作→期待とのズレを確認→console.logで値を確かめる→修正→再実行</strong>のサイクルを回しましょう。開発者ツールで要素のclass属性を直接見るのも有効です。1つの症状の裏に複数のバグが重なっていることもあります（例：打ち消し線が付かない症状は「クリックされた子要素を操作している」と「クラス名の書き方」の2つが原因）。</p>
<p>すべて直せたら、あなたは「エラーが出ないバグ」を自力で追い詰める力を身に付けています。卒業おめでとうございます。</p>`,
      task: `このTODOアプリには6個のバグがあります。追加・完了切り替え・削除・未完了件数のすべてが仕様どおり動くように、すべてのバグを修正してください。`,
      code: `<div data-controller="todo">
  <input data-todo-target="input" type="text" placeholder="やること">
  <button id="add-btn" data-action="click->todo#add">追加</button>
  <p>未完了：<span data-todo-target="count">0</span>件</p>
  <p>状態：<span data-todo-target="status">-</span></p>
  <ul data-todo-target="list"></ul>
</div>

<style>
  .done { text-decoration: line-through; color: gray; }
</style>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("todo", class extends Controller {
  static targets = ["input", "count", "status", "list"];

  add() {
    // 入力内容を1行としてリストに追加する
    const title = this.inputTarget.textContent;
    const li = document.createElement("li");
    li.setAttribute("data-action", "click->todo#toggle");
    const span = document.createElement("span");
    span.textContent = title;
    const btn = document.createElement("button");
    btn.textContent = "削除";
    btn.setAttribute("data-action", "click->todo#remove");
    li.appendChild(span);
    li.appendChild(btn);
    this.listTarget.appendChild(li);
    this.inputTarget.value = "";
    this.updateCount();
  }

  toggle(event) {
    // 行全体の完了状態を切り替える
    event.target.classList.toggle(".done");
    this.updateCount();
  }

  remove(event) {
    // 行を削除して状態表示を更新する
    event.currentTarget.remove();
    this.statusTarget.textContent = "削除しました";
    this.updateCount();
  }

  updateCount() {
    // 未完了（doneでないli）の数を表示する
    const total = this.listTarget.querySelectorAll("li").length;
    const remaining = total - this.doneCount;
    this.countTarget.textContent = remaining;
  }
});
<\/script>`,
      solution: `<div data-controller="todo">
  <input data-todo-target="input" type="text" placeholder="やること">
  <button id="add-btn" data-action="click->todo#add">追加</button>
  <p>未完了：<span data-todo-target="count">0</span>件</p>
  <p>状態：<span data-todo-target="status">-</span></p>
  <ul data-todo-target="list"></ul>
</div>

<style>
  .done { text-decoration: line-through; color: gray; }
</style>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("todo", class extends Controller {
  static targets = ["input", "count", "status", "list"];

  add() {
    // 修正1：入力欄の値はvalueで取り出す（241）
    const title = this.inputTarget.value;
    const li = document.createElement("li");
    li.setAttribute("data-action", "click->todo#toggle");
    const span = document.createElement("span");
    span.textContent = title;
    const btn = document.createElement("button");
    btn.textContent = "削除";
    // 修正2：:stopで親liのtoggleへのバブリングを止める（249）
    btn.setAttribute("data-action", "click->todo#remove:stop");
    li.appendChild(span);
    li.appendChild(btn);
    this.listTarget.appendChild(li);
    this.inputTarget.value = "";
    this.updateCount();
  }

  toggle(event) {
    // 修正3：event.targetではなくアクションを書いたli＝currentTargetを操作する（218）
    // 修正4：クラス名にドットを付けない（243）
    event.currentTarget.classList.toggle("done");
    this.updateCount();
  }

  remove(event) {
    // 修正5：closestで行（li）ごと削除する（245）
    event.currentTarget.closest("li").remove();
    this.statusTarget.textContent = "削除しました";
    this.updateCount();
  }

  updateCount() {
    // 修正6：JS変数に頼らず、DOMの実際の状態から数える（242・246）
    const total = this.listTarget.querySelectorAll("li").length;
    const done = this.listTarget.querySelectorAll("li.done").length;
    this.countTarget.textContent = total - done;
  }
});
<\/script>`,
      hints: [
        `追加した項目が空になるのは入力の読み取り方（value/textContent）、件数のNaNはthis.doneCountがどこで値を持つか（undefinedとの引き算）を疑いましょう`,
        `打ち消し線はli全体に付けたいのでevent.currentTargetを使い、classListに渡すクラス名はドットなしの"done"です。完了数はli.doneをquerySelectorAllで数え直すのが確実です`,
        `削除はevent.currentTarget.closest("li").remove()で行ごと消し、削除ボタンのdata-actionには:stopを付けて親liのtoggleが発火しないようにします`
      ],
      check: `assert($("[data-controller=todo]"), "data-controller=todoの要素が必要です");
setValue("[data-todo-target=input]", "牛乳を買う");
click("#add-btn");
await sleep(80);
var items = $$("[data-todo-target=list] li");
assert(items.length === 1, "追加ボタンで行（li）が1つ増えるはずです");
assert(items[0].querySelector("span").textContent === "牛乳を買う", "追加した行に入力した「牛乳を買う」が表示されるはずです。入力欄の読み取り方（value/textContent）を確認しましょう");
setValue("[data-todo-target=input]", "掃除をする");
click("#add-btn");
await sleep(80);
items = $$("[data-todo-target=list] li");
assert(items.length === 2, "2回追加したら行は2つになるはずです");
assert(text("[data-todo-target=count]") === "2", "未完了は「2」件と表示されるはずです。NaNになる場合はundefinedとの引き算を疑いましょう");
click("[data-todo-target=list] li:first-child span");
await sleep(80);
items = $$("[data-todo-target=list] li");
assert(items[0].classList.contains("done"), "行の文字をクリックしたら、li自体にdoneクラス（ドットなし）が付くはずです。event.targetとevent.currentTargetの違いも確認しましょう");
assert(text("[data-todo-target=count]") === "1", "1件完了にしたら未完了は「1」件になるはずです");
click("[data-todo-target=list] li:first-child button");
await sleep(80);
items = $$("[data-todo-target=list] li");
assert(items.length === 1, "削除ボタンで行（li）ごと消えるはずです。ボタンだけ消えていませんか？");
assert(items[0].querySelector("span").textContent === "掃除をする", "1行目を削除したので、残った行は「掃除をする」のはずです");
assert(text("[data-todo-target=status]") === "削除しました", "削除後の状態表示は「削除しました」のままのはずです。クリックが親liのtoggleまで伝わっていませんか？");
assert(text("[data-todo-target=count]") === "1", "削除後の未完了は「1」件のはずです");`
    }
  ]
});
