// 第14章：リスト操作UI
registerChapter({
  number: 14,
  title: "リスト操作UI",
  description: "項目の追加・削除・並べ替え・絞り込みなど、リストを動的に操作するUIの定番パターンをStimulusで実装します。",
  steps: [
    {
      id: 131,
      title: "リストに項目を追加（createElement＋appendChild）",
      explanation: `<p>この章では、TODOリストや買い物リストのような「項目を動的に増やしたり減らしたりするUI」を作ります。まずは基本の「追加」からです。第1章で学んだ<code>document.createElement</code>と<code>appendChild</code>を、Stimulusのターゲット・アクションと組み合わせます。</p>
<pre><code>&lt;div data-controller="list"&gt;
  &lt;input type="text" data-list-target="input"&gt;
  &lt;button data-action="click-&gt;list#add"&gt;追加&lt;/button&gt;
  &lt;ul data-list-target="items"&gt;&lt;/ul&gt;
&lt;/div&gt;</code></pre>
<pre><code>add() {
  const name = this.inputTarget.value.trim();
  if (name === "") return;
  const li = document.createElement("li");
  li.textContent = name;
  this.itemsTarget.appendChild(li);
  this.inputTarget.value = "";
}</code></pre>
<p>処理の流れを整理します。</p>
<ol>
<li>入力値を取得し、空なら何もしない（前章で学んだガード節）</li>
<li><code>createElement("li")</code>で新しいli要素を作る</li>
<li><code>textContent</code>に項目名を設定する</li>
<li><code>appendChild</code>でul（itemsターゲット）の末尾に追加する</li>
<li>入力欄を空に戻して、次の入力に備える</li>
</ol>
<p>最後の「入力欄を空に戻す」は忘れやすいポイントです。連続して項目を追加するときの使い勝手が大きく変わります。</p>`,
      task: `addメソッドのTODOを埋めて、追加ボタンを押すと入力した名前のliがulに追加され、入力欄が空に戻るようにしてください。`,
      code: `<div data-controller="list">
  <input type="text" data-list-target="input" placeholder="項目名">
  <button data-action="click->list#add">追加</button>
  <ul data-list-target="items"></ul>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("list", class extends Controller {
  static targets = ["input", "items"];

  add() {
    const name = this.inputTarget.value.trim();
    if (name === "") return;
    // TODO: li要素をcreateElementで作り、textContentにnameを設定して
    // itemsTargetにappendChildする
    // TODO: 入力欄を空文字に戻す
  }
});
<\/script>`,
      solution: `<div data-controller="list">
  <input type="text" data-list-target="input" placeholder="項目名">
  <button data-action="click->list#add">追加</button>
  <ul data-list-target="items"></ul>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("list", class extends Controller {
  static targets = ["input", "items"];

  add() {
    const name = this.inputTarget.value.trim();
    if (name === "") return;
    const li = document.createElement("li");
    li.textContent = name;
    this.itemsTarget.appendChild(li);
    this.inputTarget.value = "";
  }
});
<\/script>`,
      hints: [
        `document.createElement("li")で要素を作り、this.itemsTarget.appendChild(li)で追加します`,
        `入力欄はthis.inputTarget.value = "";で空に戻します`
      ],
      check: `setValue("input", "牛乳");
await sleep(50);
click("button");
await sleep(50);
assert($$("ul li").length === 1, "追加ボタンを押すとulの中にliが1件増えるはずです");
assert(text("ul li") === "牛乳", "追加されたliには入力した「牛乳」が表示されるはずです");
assert($("input").value === "", "追加後は入力欄が空に戻るはずです");
setValue("input", "パン");
await sleep(50);
click("button");
await sleep(50);
assert($$("ul li").length === 2, "もう一度追加するとliが2件になるはずです");`
    },
    {
      id: 132,
      title: "template要素とcontent.cloneNode",
      explanation: `<p>リストの1行が「名前＋バッジ＋ボタン」のように複雑になると、createElementを何度も呼ぶコードは読みにくくなります。そこで使うのがHTML標準の<code>&lt;template&gt;</code>要素です。template内のHTMLは<strong>画面には表示されず</strong>、JSから複製して使うための「ひな型」になります。</p>
<pre><code>&lt;template data-list-target="template"&gt;
  &lt;li&gt;&lt;span class="name"&gt;&lt;/span&gt; &lt;span class="badge"&gt;NEW&lt;/span&gt;&lt;/li&gt;
&lt;/template&gt;</code></pre>
<p>ひな型の複製は次の2段階で行います。</p>
<pre><code>add() {
  const clone = this.templateTarget.content.cloneNode(true);
  clone.querySelector(".name").textContent = name;
  this.itemsTarget.appendChild(clone);
}</code></pre>
<ul>
<li><code>template.content</code>：template内のHTMLが入った特別な入れ物（DocumentFragment）</li>
<li><code>cloneNode(true)</code>：その中身を丸ごと複製する。引数の<code>true</code>は「子要素も含めて深く複製する」という意味で、<strong>必ずtrueを渡します</strong>（falseだと空の入れ物だけが複製される）</li>
<li>複製した断片に対して<code>querySelector</code>で穴埋めし、<code>appendChild</code>で挿入する</li>
</ul>
<p>行の構造をHTML側のtemplateに置くことで、「見た目はHTML、動きはJS」という役割分担がリスト行にも適用できます。行のデザイン変更にJSの修正が不要になるのが大きな利点です。</p>`,
      task: `addメソッドのTODOを埋めて、templateターゲットの内容を複製し、.nameに入力値を設定してリストに追加されるようにしてください。`,
      code: `<div data-controller="list">
  <input type="text" data-list-target="input" placeholder="項目名">
  <button data-action="click->list#add">追加</button>
  <ul data-list-target="items"></ul>

  <template data-list-target="template">
    <li><span class="name"></span> <span class="badge">NEW</span></li>
  </template>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("list", class extends Controller {
  static targets = ["input", "items", "template"];

  add() {
    const name = this.inputTarget.value.trim();
    if (name === "") return;
    // TODO: this.templateTarget.content.cloneNode(true)で複製を作る
    // TODO: 複製の中の.name要素のtextContentにnameを設定する
    // TODO: itemsTargetにappendChildする
    this.inputTarget.value = "";
  }
});
<\/script>`,
      solution: `<div data-controller="list">
  <input type="text" data-list-target="input" placeholder="項目名">
  <button data-action="click->list#add">追加</button>
  <ul data-list-target="items"></ul>

  <template data-list-target="template">
    <li><span class="name"></span> <span class="badge">NEW</span></li>
  </template>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("list", class extends Controller {
  static targets = ["input", "items", "template"];

  add() {
    const name = this.inputTarget.value.trim();
    if (name === "") return;
    const clone = this.templateTarget.content.cloneNode(true);
    clone.querySelector(".name").textContent = name;
    this.itemsTarget.appendChild(clone);
    this.inputTarget.value = "";
  }
});
<\/script>`,
      hints: [
        `複製はconst clone = this.templateTarget.content.cloneNode(true);です`,
        `複製した断片にはclone.querySelector(".name")でアクセスできます`
      ],
      check: `assert($$("ul li").length === 0, "template内のliは画面に表示されないため、最初はリストが空のはずです");
setValue("input", "たまご");
await sleep(50);
click("button");
await sleep(50);
assert($$("ul li").length === 1, "追加ボタンでliが1件追加されるはずです");
assert(text("ul li .name") === "たまご", "複製したliの.nameに入力した「たまご」が入るはずです");
assert(text("ul li .badge") === "NEW", "templateに書いたNEWバッジも一緒に複製されるはずです");`
    },
    {
      id: 133,
      title: "項目の削除（closestで行を特定）",
      explanation: `<p>各行に削除ボタンを付けるとき、問題になるのは「どの行を消すか」の特定です。ここで便利なのが<code>closest</code>メソッドです。<code>element.closest("li")</code>は、その要素自身から親、そのまた親…と<strong>上に向かって</strong>たどり、最初に見つかったセレクタに一致する要素（この場合はli）を返します。</p>
<pre><code>&lt;ul&gt;
  &lt;li&gt;りんご &lt;button data-action="click-&gt;list#remove"&gt;削除&lt;/button&gt;&lt;/li&gt;
  &lt;li&gt;みかん &lt;button data-action="click-&gt;list#remove"&gt;削除&lt;/button&gt;&lt;/li&gt;
&lt;/ul&gt;</code></pre>
<p>すべての削除ボタンが同じremoveメソッドを呼びますが、第5章で学んだ<code>event.currentTarget</code>で「押されたボタン」が分かるので、そこからclosestで行を特定できます。</p>
<pre><code>remove(event) {
  const li = event.currentTarget.closest("li");
  li.remove();
}</code></pre>
<p>この2行がリスト削除の定番イディオムです。ポイントを整理します。</p>
<ul>
<li><code>event.currentTarget</code>：アクションが設定された要素（＝押された削除ボタン）</li>
<li><code>closest("li")</code>：ボタンを包んでいるliを上方向の探索で見つける</li>
<li><code>remove()</code>：第1章で学んだとおり、要素を自分ごとDOMから取り除く</li>
</ul>
<p>行ごとにidを振って管理する方法もありますが、closestなら「押されたボタンの行」が自然に特定でき、行が何件あっても同じコードで動きます。</p>`,
      task: `removeメソッドのTODOを埋めて、各行の削除ボタンを押すとその行（li）だけが削除されるようにしてください。`,
      code: `<div data-controller="list">
  <ul>
    <li>りんご <button data-action="click->list#remove">削除</button></li>
    <li>みかん <button data-action="click->list#remove">削除</button></li>
    <li>ぶどう <button data-action="click->list#remove">削除</button></li>
  </ul>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("list", class extends Controller {
  remove(event) {
    // TODO: event.currentTargetからclosest("li")で行を特定し、
    // その行をremove()で削除する
  }
});
<\/script>`,
      solution: `<div data-controller="list">
  <ul>
    <li>りんご <button data-action="click->list#remove">削除</button></li>
    <li>みかん <button data-action="click->list#remove">削除</button></li>
    <li>ぶどう <button data-action="click->list#remove">削除</button></li>
  </ul>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("list", class extends Controller {
  remove(event) {
    const li = event.currentTarget.closest("li");
    li.remove();
  }
});
<\/script>`,
      hints: [
        `event.currentTarget.closest("li")で、押されたボタンを包むliが取れます`,
        `取得したliはli.remove()で削除できます`
      ],
      check: `assert($$("li").length === 3, "最初はliが3件あるはずです");
click("li button");
await sleep(50);
assert($$("li").length === 2, "削除ボタンを押すとその行だけが消えて2件になるはずです");
var texts = $$("li").map(function (li) { return li.textContent; }).join("");
assert(!texts.includes("りんご"), "1件目の削除ボタンを押したので「りんご」の行が消えるはずです");
assert(texts.includes("みかん") && texts.includes("ぶどう"), "他の行（みかん・ぶどう）は残っているはずです");`
    },
    {
      id: 134,
      title: "空状態メッセージの表示切替",
      explanation: `<p>リストが空になったとき、何も表示されないと「壊れているのでは？」とユーザーを不安にさせます。「リストは空です」のような<strong>空状態（empty state）メッセージ</strong>を出すのが親切なUIです。</p>
<p>メッセージ要素をHTMLに用意し、項目数に応じてhiddenクラスを付け外しします。ここで便利なのが<code>classList.toggle</code>の<strong>第2引数</strong>です。</p>
<pre><code>// 第2引数がtrueならクラスを付け、falseなら外す
element.classList.toggle("hidden", 条件式)</code></pre>
<p>第1章ではtoggleを「あれば外す・なければ付ける」として学びましたが、第2引数（force引数と呼ばれます）を渡すと「条件式の結果どおりの状態にする」という意味に変わります。if/elseでadd/removeを書き分けるより簡潔です。</p>
<pre><code>update() {
  const hasItems = this.itemsTarget.children.length &gt; 0;
  this.emptyTarget.classList.toggle("hidden", hasItems);
}</code></pre>
<ul>
<li><code>children</code>：要素の子要素の一覧。<code>children.length</code>で件数が分かる</li>
<li>項目が1件でもあれば（hasItemsがtrue）メッセージにhiddenを付けて隠す</li>
<li>0件になったらhiddenが外れてメッセージが現れる</li>
</ul>
<p>削除のたびにupdateを呼べば、表示状態が常に実際の件数と一致します。「状態が変わったら表示を更新する関数を1つ呼ぶ」という整理は、この後のステップでも繰り返し使います。</p>`,
      task: `updateメソッドのTODOを埋めてください。リストに項目が1件でもあれば空メッセージを隠し、0件になったら表示します。`,
      code: `<div data-controller="list">
  <ul data-list-target="items">
    <li>牛乳 <button data-action="click->list#remove">削除</button></li>
    <li>パン <button data-action="click->list#remove">削除</button></li>
  </ul>
  <p data-list-target="empty" class="hidden">リストは空です</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("list", class extends Controller {
  static targets = ["items", "empty"];

  remove(event) {
    event.currentTarget.closest("li").remove();
    this.update();
  }

  update() {
    // TODO: itemsTarget.children.lengthが0より大きいかどうかを調べ、
    // classList.toggle("hidden", 条件式)でemptyTargetの表示を切り替える
  }
});
<\/script>`,
      solution: `<div data-controller="list">
  <ul data-list-target="items">
    <li>牛乳 <button data-action="click->list#remove">削除</button></li>
    <li>パン <button data-action="click->list#remove">削除</button></li>
  </ul>
  <p data-list-target="empty" class="hidden">リストは空です</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("list", class extends Controller {
  static targets = ["items", "empty"];

  remove(event) {
    event.currentTarget.closest("li").remove();
    this.update();
  }

  update() {
    const hasItems = this.itemsTarget.children.length > 0;
    this.emptyTarget.classList.toggle("hidden", hasItems);
  }
});
<\/script>`,
      hints: [
        `this.emptyTarget.classList.toggle("hidden", this.itemsTarget.children.length > 0) の1行で書けます`,
        `toggleの第2引数がtrueならクラスが付き（隠れる）、falseなら外れます（表示される）`
      ],
      check: `var empty = $("[data-list-target=empty]");
assert(empty, "data-list-target=\\"empty\\"を持つ要素が必要です");
assert(empty.classList.contains("hidden"), "項目があるうちは空メッセージが隠れているはずです");
click("li button");
await sleep(50);
assert($$("li").length === 1, "削除ボタンで1件減るはずです");
assert(empty.classList.contains("hidden"), "まだ1件残っているので空メッセージは隠れたままのはずです");
click("li button");
await sleep(50);
assert($$("li").length === 0, "もう一度削除すると0件になるはずです");
assert(!empty.classList.contains("hidden"), "0件になったら「リストは空です」が表示されるはずです");`
    },
    {
      id: 135,
      title: "件数バッジの更新",
      explanation: `<p>「カート（3）」のような件数バッジも、前ステップと同じ「状態が変わったらupdateを呼ぶ」パターンで作れます。件数は<code>children.length</code>から取得し、表示用のターゲットに書き込みます。</p>
<pre><code>update() {
  this.countTarget.textContent = this.itemsTarget.children.length;
}</code></pre>
<p>大事なのは<strong>updateを呼ぶタイミング</strong>です。件数が変わる場面すべてで呼びます。</p>
<ul>
<li><code>connect()</code>：初期表示。HTMLに最初から書かれている項目数を反映する（第9章で学んだライフサイクル）</li>
<li><code>add()</code>：項目を追加した直後</li>
<li><code>remove()</code>：項目を削除した直後</li>
</ul>
<p>もう1つ、このステップにはStimulusらしい見どころがあります。add()の中でJSから作った削除ボタンにも<code>setAttribute</code>でdata-actionを付けている点です。</p>
<pre><code>const button = document.createElement("button");
button.textContent = "削除";
button.setAttribute("data-action", "click-&gt;list#remove");
li.appendChild(button);</code></pre>
<p>第9章で学んだとおり、StimulusはMutationObserverでDOMを監視しているので、<strong>後から追加された要素のdata-actionも自動で有効になります</strong>。addEventListenerを自分で呼ぶ必要はありません。動的なリストとStimulusの相性が良いのはこの仕組みのおかげです。</p>`,
      task: `updateメソッドのTODOを埋めて、接続時・追加時・削除時にリストの件数がcountターゲットに表示されるようにしてください。`,
      code: `<div data-controller="list">
  <p>件数：<span data-list-target="count">?</span></p>
  <input type="text" data-list-target="input" placeholder="項目名">
  <button id="add" data-action="click->list#add">追加</button>
  <ul data-list-target="items">
    <li>牛乳 <button data-action="click->list#remove">削除</button></li>
    <li>パン <button data-action="click->list#remove">削除</button></li>
  </ul>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("list", class extends Controller {
  static targets = ["input", "items", "count"];

  connect() {
    this.update();
  }

  add() {
    const name = this.inputTarget.value.trim();
    if (name === "") return;
    const li = document.createElement("li");
    li.textContent = name + " ";
    const button = document.createElement("button");
    button.textContent = "削除";
    button.setAttribute("data-action", "click->list#remove");
    li.appendChild(button);
    this.itemsTarget.appendChild(li);
    this.inputTarget.value = "";
    this.update();
  }

  remove(event) {
    event.currentTarget.closest("li").remove();
    this.update();
  }

  update() {
    // TODO: itemsTargetの子要素の数をcountTargetに表示する
  }
});
<\/script>`,
      solution: `<div data-controller="list">
  <p>件数：<span data-list-target="count">?</span></p>
  <input type="text" data-list-target="input" placeholder="項目名">
  <button id="add" data-action="click->list#add">追加</button>
  <ul data-list-target="items">
    <li>牛乳 <button data-action="click->list#remove">削除</button></li>
    <li>パン <button data-action="click->list#remove">削除</button></li>
  </ul>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("list", class extends Controller {
  static targets = ["input", "items", "count"];

  connect() {
    this.update();
  }

  add() {
    const name = this.inputTarget.value.trim();
    if (name === "") return;
    const li = document.createElement("li");
    li.textContent = name + " ";
    const button = document.createElement("button");
    button.textContent = "削除";
    button.setAttribute("data-action", "click->list#remove");
    li.appendChild(button);
    this.itemsTarget.appendChild(li);
    this.inputTarget.value = "";
    this.update();
  }

  remove(event) {
    event.currentTarget.closest("li").remove();
    this.update();
  }

  update() {
    this.countTarget.textContent = this.itemsTarget.children.length;
  }
});
<\/script>`,
      hints: [
        `件数はthis.itemsTarget.children.lengthで取得できます`,
        `this.countTarget.textContentに代入すれば表示されます`
      ],
      check: `assert(text("[data-list-target=count]") === "2", "接続時にconnectでupdateが呼ばれ、初期件数の2が表示されるはずです");
setValue("input", "たまご");
await sleep(50);
click("#add");
await sleep(50);
assert($$("ul li").length === 3, "追加でliが3件になるはずです");
assert(text("[data-list-target=count]") === "3", "追加後は件数が3に更新されるはずです");
click("ul li button");
await sleep(50);
assert(text("[data-list-target=count]") === "2", "削除後は件数が2に戻るはずです");`
    },
    {
      id: 136,
      title: "リスト項目にもコントローラを付ける（動的connect）",
      explanation: `<p>リスト全体を管理するコントローラとは別に、<strong>行ごとのふるまいは行専用のコントローラに任せる</strong>という分担ができます。第10章で学んだ「単一責任」の考え方をリストに適用した形です。</p>
<p>templateのひな型に<code>data-controller</code>を書いておくと、複製されて画面に挿入された瞬間、StimulusがMutationObserverで検知して<strong>自動的にconnectします</strong>（第9章で観察した動きです）。JSから「このリスト行にコントローラを付けるぞ」と登録する処理は一切不要です。</p>
<pre><code>&lt;template data-list-target="template"&gt;
  &lt;li data-controller="item"&gt;
    &lt;span class="name"&gt;&lt;/span&gt;
    &lt;button data-action="click-&gt;item#done"&gt;完了&lt;/button&gt;
  &lt;/li&gt;
&lt;/template&gt;</code></pre>
<pre><code>application.register("item", class extends Controller {
  connect() {
    console.log("itemコントローラが接続されました");
  }
  done() {
    this.element.classList.add("done");
  }
});</code></pre>
<p>この構成の利点を整理します。</p>
<ul>
<li>行の中の操作（完了・編集など）は、行のitemコントローラだけで完結する</li>
<li><code>this.element</code>はその行のliを指すので、「自分の行」だけを安全に操作できる（第2章のスコープの話）</li>
<li>listコントローラは追加・削除などリスト全体の関心事に集中できる</li>
</ul>
<p>実行してコンソール欄を見ると、項目を追加するたびに「接続されました」のログが出力され、動的connectが起きていることを確認できます。</p>`,
      task: `template内のliにdata-controller="item"を追加して、追加した行の完了ボタンを押すとその行にdoneクラスが付く（打ち消し線になる）ようにしてください。`,
      code: `<style>
  .done { text-decoration: line-through; color: gray; }
</style>

<div data-controller="list">
  <input type="text" data-list-target="input" placeholder="やること">
  <button id="add" data-action="click->list#add">追加</button>
  <ul data-list-target="items"></ul>

  <template data-list-target="template">
    <!-- TODO: このliにdata-controller="item"を追加する -->
    <li>
      <span class="name"></span>
      <button data-action="click->item#done">完了</button>
    </li>
  </template>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("list", class extends Controller {
  static targets = ["input", "items", "template"];

  add() {
    const name = this.inputTarget.value.trim();
    if (name === "") return;
    const clone = this.templateTarget.content.cloneNode(true);
    clone.querySelector(".name").textContent = name;
    this.itemsTarget.appendChild(clone);
    this.inputTarget.value = "";
  }
});

application.register("item", class extends Controller {
  connect() {
    console.log("itemコントローラが接続されました");
  }

  done() {
    this.element.classList.add("done");
  }
});
<\/script>`,
      solution: `<style>
  .done { text-decoration: line-through; color: gray; }
</style>

<div data-controller="list">
  <input type="text" data-list-target="input" placeholder="やること">
  <button id="add" data-action="click->list#add">追加</button>
  <ul data-list-target="items"></ul>

  <template data-list-target="template">
    <li data-controller="item">
      <span class="name"></span>
      <button data-action="click->item#done">完了</button>
    </li>
  </template>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("list", class extends Controller {
  static targets = ["input", "items", "template"];

  add() {
    const name = this.inputTarget.value.trim();
    if (name === "") return;
    const clone = this.templateTarget.content.cloneNode(true);
    clone.querySelector(".name").textContent = name;
    this.itemsTarget.appendChild(clone);
    this.inputTarget.value = "";
  }
});

application.register("item", class extends Controller {
  connect() {
    console.log("itemコントローラが接続されました");
  }

  done() {
    this.element.classList.add("done");
  }
});
<\/script>`,
      hints: [
        `data-action="click->item#done"が動くのは、liがitemコントローラのスコープ内にあるときだけです`,
        `template内のliに<li data-controller="item">のように属性を追加します`
      ],
      check: `setValue("input", "レポート提出");
await sleep(50);
click("#add");
await sleep(50);
assert($$("ul li").length === 1, "追加ボタンでliが1件追加されるはずです");
click("ul li button");
await sleep(50);
assert($("ul li").classList.contains("done"), "完了ボタンでliにdoneクラスが付くはずです。liにdata-controller=\\"item\\"を追加しましたか？");`
    },
    {
      id: 137,
      title: "並び順の反転・ソート",
      explanation: `<p>リストの並べ替えは「liを配列にする→配列を並べ替える→順番どおりにappendChildし直す」の3段階で実現できます。</p>
<pre><code>reverse() {
  const items = Array.from(this.itemsTarget.children);
  items.reverse();
  items.forEach((li) =&gt; this.itemsTarget.appendChild(li));
}</code></pre>
<p>新しい道具と重要な性質を説明します。</p>
<ul>
<li><code>Array.from(...)</code>：childrenは配列に似た別物（HTMLCollection）なので、reverseやsortを使うために本物の配列へ変換する</li>
<li><code>reverse()</code>：配列の並びを逆順にする</li>
<li><strong>appendChildは「移動」になる</strong>：すでにDOMにある要素をappendChildすると、複製ではなく<strong>いまの場所から末尾へ移動</strong>します。並べ替えた順に全要素をappendChildし直せば、その順序でリストが並び直ります</li>
</ul>
<p>五十音順にするには<code>sort</code>に比較関数を渡します。</p>
<pre><code>items.sort((a, b) =&gt; (a.textContent &gt; b.textContent ? 1 : -1));</code></pre>
<p>比較関数は「aをbより後ろに置くなら正の数、前に置くなら負の数を返す」というルールです。文字列の<code>&gt;</code>比較は文字コード順で、ひらがな同士なら五十音順に並びます。<code>条件 ? 値1 : 値2</code>は三項演算子といい、条件がtrueなら値1、falseなら値2になる簡潔なif/elseです。</p>`,
      task: `sortメソッドのTODOを埋めて、五十音順ボタンでリストがひらがなの五十音順に並ぶようにしてください。reverseメソッドの実装が参考になります。`,
      code: `<div data-controller="list">
  <button id="sort" data-action="click->list#sort">五十音順</button>
  <button id="reverse" data-action="click->list#reverse">反転</button>
  <ul data-list-target="items">
    <li>みかん</li>
    <li>りんご</li>
    <li>ばなな</li>
  </ul>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("list", class extends Controller {
  static targets = ["items"];

  reverse() {
    const items = Array.from(this.itemsTarget.children);
    items.reverse();
    items.forEach((li) => this.itemsTarget.appendChild(li));
  }

  sort() {
    const items = Array.from(this.itemsTarget.children);
    // TODO: items.sort(...)に比較関数を渡して五十音順に並べ替える
    // （a.textContent > b.textContent なら1、そうでなければ-1を返す）
    // TODO: 並べ替えた順にitemsTargetへappendChildし直す
  }
});
<\/script>`,
      solution: `<div data-controller="list">
  <button id="sort" data-action="click->list#sort">五十音順</button>
  <button id="reverse" data-action="click->list#reverse">反転</button>
  <ul data-list-target="items">
    <li>みかん</li>
    <li>りんご</li>
    <li>ばなな</li>
  </ul>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("list", class extends Controller {
  static targets = ["items"];

  reverse() {
    const items = Array.from(this.itemsTarget.children);
    items.reverse();
    items.forEach((li) => this.itemsTarget.appendChild(li));
  }

  sort() {
    const items = Array.from(this.itemsTarget.children);
    items.sort((a, b) => (a.textContent > b.textContent ? 1 : -1));
    items.forEach((li) => this.itemsTarget.appendChild(li));
  }
});
<\/script>`,
      hints: [
        `items.sort((a, b) => (a.textContent > b.textContent ? 1 : -1)); で五十音順になります`,
        `並べ替えた後はreverseと同じくforEachでappendChildし直します`
      ],
      check: `click("#reverse");
await sleep(50);
var afterReverse = $$("li").map(function (li) { return li.textContent.trim(); }).join(",");
assert(afterReverse === "ばなな,りんご,みかん", "反転ボタンで並びが「ばなな、りんご、みかん」の順になるはずです");
click("#sort");
await sleep(50);
var afterSort = $$("li").map(function (li) { return li.textContent.trim(); }).join(",");
assert(afterSort === "ばなな,みかん,りんご", "五十音順ボタンで「ばなな、みかん、りんご」の順になるはずです");`
    },
    {
      id: 138,
      title: "フィルタリング（入力に応じて表示切替）",
      explanation: `<p>検索ボックスに入力すると一致する項目だけが表示される「絞り込みUI」を作ります。ポイントは、<strong>一致しない項目を削除するのではなく、hiddenクラスで隠すだけ</strong>にすることです。削除してしまうと、検索語を消したときに元へ戻せません。</p>
<pre><code>&lt;input type="search" data-action="input-&gt;list#filter"&gt;
&lt;ul data-list-target="items"&gt;
  &lt;li&gt;りんごジュース&lt;/li&gt;
  ...
&lt;/ul&gt;</code></pre>
<pre><code>filter(event) {
  const keyword = event.target.value;
  Array.from(this.itemsTarget.children).forEach((li) =&gt; {
    li.classList.toggle("hidden", !li.textContent.includes(keyword));
  });
}</code></pre>
<p>組み合わせている道具を分解します。</p>
<ul>
<li><code>includes(keyword)</code>：liのテキストに検索語が含まれるかをtrue/falseで返す（第13章の総合演習で登場）</li>
<li><code>!</code>で反転：「含まれ<strong>ない</strong>なら隠す」にする</li>
<li><code>classList.toggle("hidden", 条件)</code>：ステップ134で学んだforce引数。条件どおりの表示状態にする</li>
</ul>
<p>うれしい性質として、検索語が空文字のときは<code>includes("")</code>が常にtrueになるため、特別な処理を書かなくても全件表示に戻ります。inputイベント（1文字ごとに発火）と組み合わせることで、打つそばから結果が絞り込まれる快適なUIになります。</p>`,
      task: `filterメソッドのTODOを埋めて、検索語を含まないliにhiddenクラスが付き、含むliは表示されたままになるようにしてください。`,
      code: `<div data-controller="list">
  <input type="search" data-action="input->list#filter" placeholder="絞り込み">
  <ul data-list-target="items">
    <li>りんごジュース</li>
    <li>りんごパイ</li>
    <li>ぶどうジュース</li>
  </ul>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("list", class extends Controller {
  static targets = ["items"];

  filter(event) {
    const keyword = event.target.value;
    Array.from(this.itemsTarget.children).forEach((li) => {
      // TODO: liのtextContentがkeywordを含まないときだけ
      // hiddenクラスが付くように、classList.toggleの
      // 第2引数を使って切り替える
    });
  }
});
<\/script>`,
      solution: `<div data-controller="list">
  <input type="search" data-action="input->list#filter" placeholder="絞り込み">
  <ul data-list-target="items">
    <li>りんごジュース</li>
    <li>りんごパイ</li>
    <li>ぶどうジュース</li>
  </ul>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("list", class extends Controller {
  static targets = ["items"];

  filter(event) {
    const keyword = event.target.value;
    Array.from(this.itemsTarget.children).forEach((li) => {
      li.classList.toggle("hidden", !li.textContent.includes(keyword));
    });
  }
});
<\/script>`,
      hints: [
        `li.classList.toggle("hidden", !li.textContent.includes(keyword)); の1行です`,
        `「含まれないなら隠す」なので、includesの結果を!で反転します`
      ],
      check: `setValue("input", "りんご");
await sleep(50);
var lis = $$("ul li");
assert(!lis[0].classList.contains("hidden") && !lis[1].classList.contains("hidden"), "「りんご」で絞り込むと、りんごを含む2件は表示されたままのはずです");
assert(lis[2].classList.contains("hidden"), "「りんご」で絞り込むと、ぶどうジュースにhiddenクラスが付くはずです");
setValue("input", "ジュース");
await sleep(50);
assert(lis[1].classList.contains("hidden"), "「ジュース」で絞り込むと、りんごパイが隠れるはずです");
assert(!lis[0].classList.contains("hidden") && !lis[2].classList.contains("hidden"), "「ジュース」を含む2件は表示されるはずです");
setValue("input", "");
await sleep(50);
assert($$("ul li").every(function (li) { return !li.classList.contains("hidden"); }), "検索語を空にしたら全件表示に戻るはずです");`
    },
    {
      id: 139,
      title: "全削除と確認",
      explanation: `<p>「全削除」のような取り返しのつかない操作には、確認のステップを挟むのがUIの鉄則です。ブラウザには<code>window.confirm()</code>という確認ダイアログがありますが、この実行環境のようなsandbox化された画面では動作しないうえ、画面全体をブロックするため近年は敬遠されがちです。代わりに、<strong>2段階クリック</strong>という定番パターンを実装します。</p>
<ol>
<li>1回目のクリック：まだ削除しない。ボタンの文言を「本当に削除する」に変えて確認状態に入る</li>
<li>2回目のクリック：本当に削除し、確認状態を解除する</li>
</ol>
<p>「確認状態かどうか」という状態の管理には、第6章で学んだBoolean型のvalueがぴったりです。</p>
<pre><code>static values = { armed: Boolean };

clearAll() {
  if (!this.armedValue) {
    this.armedValue = true;
    this.buttonTarget.textContent = "本当に削除する";
    return;
  }
  this.itemsTarget.innerHTML = "";
  this.armedValue = false;
  this.buttonTarget.textContent = "全削除";
}</code></pre>
<ul>
<li>armedは「作動準備完了」の意味。valueに保存するので状態がDOMに残り、第7章で学んだ「状態はDOMに置く」の実践になる</li>
<li><code>innerHTML = ""</code>：要素の中身を丸ごと空にする一括削除の書き方。1件ずつremove()するループより簡潔</li>
<li>削除後はarmedをfalseに戻し、文言も元に戻す（後片付けを忘れない）</li>
</ul>`,
      task: `clearAllメソッドのTODOを埋めてください。2回目のクリック（armedValueがtrueのとき）でリストを空にし、armedValueとボタンの文言を元に戻します。`,
      code: `<div data-controller="list" data-list-armed-value="false">
  <button data-list-target="button" data-action="click->list#clearAll">全削除</button>
  <ul data-list-target="items">
    <li>牛乳</li>
    <li>パン</li>
    <li>たまご</li>
  </ul>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("list", class extends Controller {
  static targets = ["items", "button"];
  static values = { armed: Boolean };

  clearAll() {
    if (!this.armedValue) {
      this.armedValue = true;
      this.buttonTarget.textContent = "本当に削除する";
      return;
    }
    // TODO: itemsTargetのinnerHTMLを空文字にして全項目を削除する
    // TODO: armedValueをfalseに戻す
    // TODO: ボタンの文言を「全削除」に戻す
  }
});
<\/script>`,
      solution: `<div data-controller="list" data-list-armed-value="false">
  <button data-list-target="button" data-action="click->list#clearAll">全削除</button>
  <ul data-list-target="items">
    <li>牛乳</li>
    <li>パン</li>
    <li>たまご</li>
  </ul>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("list", class extends Controller {
  static targets = ["items", "button"];
  static values = { armed: Boolean };

  clearAll() {
    if (!this.armedValue) {
      this.armedValue = true;
      this.buttonTarget.textContent = "本当に削除する";
      return;
    }
    this.itemsTarget.innerHTML = "";
    this.armedValue = false;
    this.buttonTarget.textContent = "全削除";
  }
});
<\/script>`,
      hints: [
        `全削除はthis.itemsTarget.innerHTML = "";で書けます`,
        `削除後にthis.armedValue = false;と文言の復元を忘れずに`
      ],
      check: `assert($$("li").length === 3, "最初はliが3件あるはずです");
click("button");
await sleep(50);
assert($$("li").length === 3, "1回目のクリックでは削除せず、確認状態になるだけのはずです");
assert(text("[data-list-target=button]") === "本当に削除する", "1回目のクリックでボタンの文言が「本当に削除する」に変わるはずです");
click("button");
await sleep(50);
assert($$("li").length === 0, "2回目のクリックで全項目が削除されるはずです");
assert(text("[data-list-target=button]") === "全削除", "削除後はボタンの文言が「全削除」に戻るはずです");`
    },
    {
      id: 140,
      title: "総合演習：買い物リスト",
      explanation: `<p>この章の総合演習として、買い物リストを完成させます。使う道具はすべてこの章で学んだものです。</p>
<table>
<tr><th>機能</th><th>使う道具</th><th>学んだステップ</th></tr>
<tr><td>項目の追加</td><td>template＋content.cloneNode(true)</td><td>132</td></tr>
<tr><td>行の削除</td><td>event.currentTarget.closest("li")</td><td>133</td></tr>
<tr><td>空メッセージ</td><td>classList.toggle("hidden", 条件)</td><td>134</td></tr>
<tr><td>件数バッジ</td><td>children.length＋connectで初期化</td><td>135</td></tr>
</table>
<p>設計の要は<code>update()</code>メソッドです。件数表示と空メッセージという「件数から導かれる表示」をここに集約し、件数が変わる場所（connect・add・remove）から必ず呼びます。</p>
<pre><code>update() {
  const count = this.itemsTarget.children.length;
  this.countTarget.textContent = count;
  this.emptyTarget.classList.toggle("hidden", count &gt; 0);
}</code></pre>
<p>この「状態を変える処理」と「表示を揃える処理」を分ける構成には、次の利点があります。</p>
<ul>
<li>追加・削除のコードが本来の仕事（DOMの増減）に集中できる</li>
<li>表示の整合性がupdate1か所で保証され、更新漏れのバグが起きにくい</li>
<li>新しい表示（合計金額など）を足すときもupdateに1行足すだけ</li>
</ul>
<p>今回はaddとremoveの中身を自分の手で組み立てます。templateの複製、closestでの行特定、そしてupdateの呼び出しを忘れずに。</p>`,
      task: `addメソッド（templateを複製して.nameに品名を設定し、リストへ追加）とremoveメソッド（押されたボタンの行を削除）を実装してください。どちらも最後にthis.update()を呼びます。`,
      code: `<div data-controller="shopping">
  <p>買うもの：<span data-shopping-target="count">0</span>件</p>
  <input type="text" data-shopping-target="input" placeholder="品名">
  <button id="add" data-action="click->shopping#add">追加</button>
  <ul data-shopping-target="items"></ul>
  <p data-shopping-target="empty">リストは空です</p>

  <template data-shopping-target="template">
    <li><span class="name"></span> <button data-action="click->shopping#remove">削除</button></li>
  </template>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("shopping", class extends Controller {
  static targets = ["input", "items", "empty", "count", "template"];

  connect() {
    this.update();
  }

  add() {
    const name = this.inputTarget.value.trim();
    if (name === "") return;
    // TODO: templateTargetの内容をcloneNode(true)で複製し、
    // .nameにnameを設定してitemsTargetに追加する
    this.inputTarget.value = "";
    // TODO: this.update()を呼ぶ
  }

  remove(event) {
    // TODO: 押されたボタンからclosest("li")で行を特定して削除し、
    // this.update()を呼ぶ
  }

  update() {
    const count = this.itemsTarget.children.length;
    this.countTarget.textContent = count;
    this.emptyTarget.classList.toggle("hidden", count > 0);
  }
});
<\/script>`,
      solution: `<div data-controller="shopping">
  <p>買うもの：<span data-shopping-target="count">0</span>件</p>
  <input type="text" data-shopping-target="input" placeholder="品名">
  <button id="add" data-action="click->shopping#add">追加</button>
  <ul data-shopping-target="items"></ul>
  <p data-shopping-target="empty">リストは空です</p>

  <template data-shopping-target="template">
    <li><span class="name"></span> <button data-action="click->shopping#remove">削除</button></li>
  </template>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("shopping", class extends Controller {
  static targets = ["input", "items", "empty", "count", "template"];

  connect() {
    this.update();
  }

  add() {
    const name = this.inputTarget.value.trim();
    if (name === "") return;
    const clone = this.templateTarget.content.cloneNode(true);
    clone.querySelector(".name").textContent = name;
    this.itemsTarget.appendChild(clone);
    this.inputTarget.value = "";
    this.update();
  }

  remove(event) {
    event.currentTarget.closest("li").remove();
    this.update();
  }

  update() {
    const count = this.itemsTarget.children.length;
    this.countTarget.textContent = count;
    this.emptyTarget.classList.toggle("hidden", count > 0);
  }
});
<\/script>`,
      hints: [
        `addはステップ132、removeはステップ133と同じ書き方です`,
        `DOMを増減させたら必ずthis.update()を呼ぶのがこの設計のルールです`
      ],
      check: `await sleep(50);
assert(text("[data-shopping-target=count]") === "0", "最初は件数が0のはずです");
assert(!$("[data-shopping-target=empty]").classList.contains("hidden"), "最初は「リストは空です」が表示されているはずです");
setValue("input", "牛乳");
await sleep(50);
click("#add");
await sleep(50);
setValue("input", "パン");
await sleep(50);
click("#add");
await sleep(50);
assert($$("ul li").length === 2, "2回追加するとliが2件になるはずです");
assert(text("ul li .name") === "牛乳", "最初に追加した「牛乳」が1件目に表示されるはずです");
assert(text("[data-shopping-target=count]") === "2", "追加後は件数が2になるはずです");
assert($("[data-shopping-target=empty]").classList.contains("hidden"), "項目があるときは空メッセージが隠れるはずです");
click("ul li button");
await sleep(50);
assert($$("ul li").length === 1, "削除ボタンでその行が消えて1件になるはずです");
assert(text("[data-shopping-target=count]") === "1", "削除後は件数が1になるはずです");
click("ul li button");
await sleep(50);
assert(text("[data-shopping-target=count]") === "0", "全部削除すると件数が0に戻るはずです");
assert(!$("[data-shopping-target=empty]").classList.contains("hidden"), "0件に戻ったら「リストは空です」が再表示されるはずです");`
    }
  ]
});
