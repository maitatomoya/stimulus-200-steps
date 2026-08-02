// 第20章：総合演習
registerChapter({
  number: 20,
  title: "総合演習",
  description: "これまでの19章で学んだ知識を総動員して、TODOアプリ・クイズ・ミニカート・フォームウィザード・家計簿という5つのミニアプリを完成させます。骨組みのTODO部分を自分の手で実装しましょう。",
  steps: [
    {
      id: 191,
      title: "TODOアプリ1：追加と表示",
      explanation: `<p>最終章はこれまでの知識を組み合わせる総合演習です。まずは4ステップかけてTODOアプリを作ります。第1回は「入力した項目をリストに追加して表示する」機能です。</p>
<p>使う知識を整理しましょう。</p>
<table>
<tr><th>使う知識</th><th>どの章で学んだか</th></tr>
<tr><td>submitイベントと:prevent修飾子</td><td>第3章27</td></tr>
<tr><td>ターゲットで入力欄とリストを参照</td><td>第4章</td></tr>
<tr><td>trimと空チェックによる検証</td><td>第13章</td></tr>
<tr><td>createElementとappendChildで行を追加</td><td>第14章131</td></tr>
</table>
<p>設計の道筋はこうです。フォームの送信を<code>data-action="submit-&gt;todo#add:prevent"</code>で受け止め（Enterキーでもボタンでも同じ経路になるのがフォームの利点です）、<code>add()</code>の中で次の手順を踏みます。</p>
<ol>
<li>入力値を読み、<code>trim()</code>で前後の空白を落とす</li>
<li>空文字なら何もせずreturnする（ガード節）</li>
<li>li要素を作り、textContentに入力値を入れてリストに追加する</li>
<li>入力欄を空に戻して次の入力に備える</li>
</ol>
<pre><code>const title = this.inputTarget.value.trim();
if (title === "") return;
const li = document.createElement("li");
li.textContent = title;
this.listTarget.appendChild(li);</code></pre>
<p>「読む→検証する→DOMに反映する→後片付けする」という流れは、この後のミニカートや家計簿でも繰り返し登場する基本形です。ここでしっかり手に馴染ませておきましょう。</p>`,
      task: `add()を実装してください。入力値をtrimし、空でなければli要素を作ってlistTargetに追加し、入力欄を空にします。空文字のときは何もしません。`,
      code: `<div data-controller="todo">
  <form data-action="submit->todo#add:prevent">
    <input type="text" data-todo-target="input" placeholder="やること">
    <button>追加</button>
  </form>
  <ul data-todo-target="list"></ul>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("todo", class extends Controller {
  static targets = ["input", "list"];

  add() {
    // TODO: 入力値を取り出してtrim()する
    // TODO: 空文字なら何もせずreturnする
    // TODO: li要素を作り、textContentに入力値を入れてlistTargetにappendChildする
    // TODO: 入力欄（inputTarget.value）を空文字に戻す
  }
});
<\/script>`,
      solution: `<div data-controller="todo">
  <form data-action="submit->todo#add:prevent">
    <input type="text" data-todo-target="input" placeholder="やること">
    <button>追加</button>
  </form>
  <ul data-todo-target="list"></ul>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("todo", class extends Controller {
  static targets = ["input", "list"];

  add() {
    const title = this.inputTarget.value.trim();
    if (title === "") return;
    const li = document.createElement("li");
    li.textContent = title;
    this.listTarget.appendChild(li);
    this.inputTarget.value = "";
  }
});
<\/script>`,
      hints: [
        `入力値はthis.inputTarget.value.trim()で取り出せます`,
        `document.createElement("li")でli要素を作り、textContentに文字列を入れます`,
        `最後にthis.listTarget.appendChild(li)で追加し、this.inputTarget.value = "" で入力欄を空にします`
      ],
      check: `assert($("[data-controller=todo]"), "data-controller=todoの要素が必要です");
setValue("[data-todo-target=input]", "牛乳を買う");
submit("form");
await sleep(50);
assert($$("[data-todo-target=list] li").length === 1, "追加するとリストにliが1つ増えるはずです");
assert(text("[data-todo-target=list] li") === "牛乳を買う", "liには入力した「牛乳を買う」が表示されるはずです");
assert($("[data-todo-target=input]").value === "", "追加後は入力欄が空になるはずです");
setValue("[data-todo-target=input]", "   ");
submit("form");
await sleep(50);
assert($$("[data-todo-target=list] li").length === 1, "空白だけの入力では項目を追加しないはずです");
setValue("[data-todo-target=input]", "部屋の掃除");
submit("form");
await sleep(50);
assert($$("[data-todo-target=list] li").length === 2, "2件目を追加するとliが2つになるはずです");`
    },
    {
      id: 192,
      title: "TODOアプリ2：完了トグルと削除",
      explanation: `<p>TODOアプリ第2回では、各項目に「完了」「削除」ボタンを付けます。前ステップのadd()は拡張済みで、liの中にspan（項目名）と2つのボタンを作り、それぞれに<code>setAttribute("data-action", "todo#toggle")</code>のようにアクションを仕込んでいます。</p>
<p>ここで思い出したいのが第14章136で学んだ「後から追加した要素にもStimulusは反応する」という性質です。MutationObserver（第9章86）がDOMの変化を監視しているので、JSで作ったボタンにdata-action属性を付けるだけで、リスナー登録なしにアクションが動きます。素のDOM（第1章）でaddEventListenerを付け直していた頃と比べると、この楽さが実感できるはずです。</p>
<p>実装するのはtoggle()とremove()の2つです。どちらも「押されたボタンから、それが属する行（li）を特定する」ことが出発点になります。ここで使うのが第14章133で学んだ<code>closest</code>です。</p>
<pre><code>toggle(event) {
  const li = event.target.closest("li");
  li.classList.toggle("done");
}</code></pre>
<p><code>event.target</code>（第1章9・第5章45）は押されたボタンそのもの。そこから<code>closest("li")</code>で一番近い祖先のliを探します。完了状態はdoneクラスとしてli自身に持たせます（第7章65：状態はDOMに置く）。スタイルはCSSの<code>li.done span</code>に任せているので、JSはクラスを付け外しするだけで見た目が変わります（第8章）。削除は<code>li.remove()</code>（第1章8）だけで完了です。</p>`,
      task: `toggle()とremove()を実装してください。どちらもevent.targetからclosest("li")で行を特定し、toggleはdoneクラスをトグル、removeはその行を削除します。`,
      code: `<div data-controller="todo">
  <form data-action="submit->todo#add:prevent">
    <input type="text" data-todo-target="input" placeholder="やること">
    <button>追加</button>
  </form>
  <ul data-todo-target="list"></ul>
</div>

<style>
  li.done span { text-decoration: line-through; color: gray; }
</style>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("todo", class extends Controller {
  static targets = ["input", "list"];

  add() {
    const title = this.inputTarget.value.trim();
    if (title === "") return;
    const li = document.createElement("li");
    const span = document.createElement("span");
    span.textContent = title;
    const doneButton = document.createElement("button");
    doneButton.textContent = "完了";
    doneButton.setAttribute("data-action", "todo#toggle");
    const removeButton = document.createElement("button");
    removeButton.textContent = "削除";
    removeButton.setAttribute("data-action", "todo#remove");
    li.appendChild(span);
    li.appendChild(doneButton);
    li.appendChild(removeButton);
    this.listTarget.appendChild(li);
    this.inputTarget.value = "";
  }

  toggle(event) {
    // TODO: event.targetから一番近いliをclosestで探し、doneクラスをトグルする
  }

  remove(event) {
    // TODO: event.targetから一番近いliをclosestで探し、remove()で削除する
  }
});
<\/script>`,
      solution: `<div data-controller="todo">
  <form data-action="submit->todo#add:prevent">
    <input type="text" data-todo-target="input" placeholder="やること">
    <button>追加</button>
  </form>
  <ul data-todo-target="list"></ul>
</div>

<style>
  li.done span { text-decoration: line-through; color: gray; }
</style>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("todo", class extends Controller {
  static targets = ["input", "list"];

  add() {
    const title = this.inputTarget.value.trim();
    if (title === "") return;
    const li = document.createElement("li");
    const span = document.createElement("span");
    span.textContent = title;
    const doneButton = document.createElement("button");
    doneButton.textContent = "完了";
    doneButton.setAttribute("data-action", "todo#toggle");
    const removeButton = document.createElement("button");
    removeButton.textContent = "削除";
    removeButton.setAttribute("data-action", "todo#remove");
    li.appendChild(span);
    li.appendChild(doneButton);
    li.appendChild(removeButton);
    this.listTarget.appendChild(li);
    this.inputTarget.value = "";
  }

  toggle(event) {
    event.target.closest("li").classList.toggle("done");
  }

  remove(event) {
    event.target.closest("li").remove();
  }
});
<\/script>`,
      hints: [
        `押されたボタンはevent.target、その行はevent.target.closest("li")で取得できます`,
        `完了の切り替えはli.classList.toggle("done")です`,
        `削除はli.remove()を呼ぶだけです`
      ],
      check: `setValue("[data-todo-target=input]", "牛乳を買う");
submit("form");
await sleep(50);
setValue("[data-todo-target=input]", "部屋の掃除");
submit("form");
await sleep(50);
assert($$("[data-todo-target=list] li").length === 2, "2件追加するとliが2つあるはずです");
var firstDone = $$("[data-todo-target=list] li")[0].querySelectorAll("button")[0];
firstDone.click();
await sleep(50);
assert($$("[data-todo-target=list] li")[0].classList.contains("done"), "完了ボタンを押すとそのliにdoneクラスが付くはずです");
firstDone.click();
await sleep(50);
assert(!$$("[data-todo-target=list] li")[0].classList.contains("done"), "もう一度押すとdoneクラスが外れるはずです");
var firstRemove = $$("[data-todo-target=list] li")[0].querySelectorAll("button")[1];
firstRemove.click();
await sleep(50);
assert($$("[data-todo-target=list] li").length === 1, "削除ボタンを押すとその行が消えるはずです");
assert(text("[data-todo-target=list] li span") === "部屋の掃除", "残るのは2件目の「部屋の掃除」のはずです");`
    },
    {
      id: 193,
      title: "TODOアプリ3：フィルタ（すべて・未完了・完了）",
      explanation: `<p>TODOアプリ第3回は「すべて・未完了・完了」の3つのフィルタボタンです。ここでは追加機能をいったん外し、項目が並んだ状態から表示の絞り込みだけに集中します。</p>
<p>設計の核心は「いま選ばれているフィルタ」という状態をどこに置くかです。第6章のバリューを使い、<code>static values = { filter: { type: String, default: "all" } }</code>と宣言します。ボタンには第5章43〜44で学んだアクションパラメータを付けてあります。</p>
<pre><code>&lt;button data-action="todo#filter"
        data-todo-filter-param="active"&gt;未完了&lt;/button&gt;</code></pre>
<p>filter()は<code>this.filterValue = event.params.filter</code>と代入するだけ。すると第7章で学んだ<code>filterValueChanged()</code>が自動で呼ばれ、そこからapplyFilter()が実行される、という流れが骨組みに実装済みです。「状態の変更」と「画面の更新」をvalueChangedで橋渡しするのは第7章64の定番パターンで、どこから状態を変えても表示が必ず追従します。</p>
<p>あなたが実装するのはapplyFilter()です。リストの各liについて、doneクラスの有無（第192ステップの完了状態）と現在のfilterValueを見比べ、<code>li.hidden</code>を切り替えます（第15章で使ったhiddenと同じ発想の、hidden属性のプロパティ版です）。</p>
<table>
<tr><th>filterValue</th><th>表示する項目</th></tr>
<tr><td>all</td><td>すべて表示（hidden = false）</td></tr>
<tr><td>active</td><td>doneでない項目だけ</td></tr>
<tr><td>done</td><td>doneの項目だけ</td></tr>
</table>
<p>toggle()の最後でもapplyFilter()を呼んでいるので、絞り込み中に完了状態を変えた瞬間、その項目が条件から外れて消える動きも自動で実現します。</p>`,
      task: `applyFilter()を実装してください。listTarget内の各liについて、filterValueがactiveなら完了項目を、doneなら未完了項目を隠し、allならすべて表示します。`,
      code: `<div data-controller="todo">
  <p>
    <button data-action="todo#filter" data-todo-filter-param="all">すべて</button>
    <button data-action="todo#filter" data-todo-filter-param="active">未完了</button>
    <button data-action="todo#filter" data-todo-filter-param="done">完了</button>
  </p>
  <ul data-todo-target="list">
    <li><span>牛乳を買う</span><button data-action="todo#toggle">完了</button></li>
    <li class="done"><span>部屋の掃除</span><button data-action="todo#toggle">完了</button></li>
    <li><span>本を返す</span><button data-action="todo#toggle">完了</button></li>
  </ul>
</div>

<style>
  li.done span { text-decoration: line-through; color: gray; }
</style>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("todo", class extends Controller {
  static targets = ["list"];
  static values = { filter: { type: String, default: "all" } };

  filter(event) {
    this.filterValue = event.params.filter;
  }

  filterValueChanged() {
    this.applyFilter();
  }

  toggle(event) {
    event.target.closest("li").classList.toggle("done");
    this.applyFilter();
  }

  applyFilter() {
    // TODO: this.listTarget.querySelectorAll("li")の各liについて
    //       done = li.classList.contains("done") を調べる
    // TODO: this.filterValueが"active"ならli.hidden = done、
    //       "done"ならli.hidden = !done、それ以外ならli.hidden = false にする
  }
});
<\/script>`,
      solution: `<div data-controller="todo">
  <p>
    <button data-action="todo#filter" data-todo-filter-param="all">すべて</button>
    <button data-action="todo#filter" data-todo-filter-param="active">未完了</button>
    <button data-action="todo#filter" data-todo-filter-param="done">完了</button>
  </p>
  <ul data-todo-target="list">
    <li><span>牛乳を買う</span><button data-action="todo#toggle">完了</button></li>
    <li class="done"><span>部屋の掃除</span><button data-action="todo#toggle">完了</button></li>
    <li><span>本を返す</span><button data-action="todo#toggle">完了</button></li>
  </ul>
</div>

<style>
  li.done span { text-decoration: line-through; color: gray; }
</style>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("todo", class extends Controller {
  static targets = ["list"];
  static values = { filter: { type: String, default: "all" } };

  filter(event) {
    this.filterValue = event.params.filter;
  }

  filterValueChanged() {
    this.applyFilter();
  }

  toggle(event) {
    event.target.closest("li").classList.toggle("done");
    this.applyFilter();
  }

  applyFilter() {
    for (const li of this.listTarget.querySelectorAll("li")) {
      const done = li.classList.contains("done");
      if (this.filterValue === "active") {
        li.hidden = done;
      } else if (this.filterValue === "done") {
        li.hidden = !done;
      } else {
        li.hidden = false;
      }
    }
  }
});
<\/script>`,
      hints: [
        `this.listTarget.querySelectorAll("li")をfor...ofで回しましょう`,
        `完了状態はli.classList.contains("done")で調べられます`,
        `「未完了」フィルタでは完了項目を隠すのでli.hidden = done、「完了」フィルタではli.hidden = !doneです`
      ],
      check: `var lis = $$("[data-todo-target=list] li");
assert(lis.length === 3, "リストには3件の項目があるはずです");
click("[data-todo-filter-param=done]");
await sleep(50);
assert(lis[0].hidden === true, "「完了」フィルタでは未完了の項目（1件目）が隠れるはずです");
assert(lis[1].hidden === false, "「完了」フィルタでは完了済みの項目（2件目）は表示されたままのはずです");
assert(lis[2].hidden === true, "「完了」フィルタでは未完了の項目（3件目）が隠れるはずです");
click("[data-todo-filter-param=active]");
await sleep(50);
assert(lis[0].hidden === false, "「未完了」フィルタでは未完了の項目が表示されるはずです");
assert(lis[1].hidden === true, "「未完了」フィルタでは完了済みの項目が隠れるはずです");
lis[0].querySelector("button").click();
await sleep(50);
assert(lis[0].hidden === true, "未完了フィルタ中に完了にした項目は、その場で隠れるはずです");
click("[data-todo-filter-param=all]");
await sleep(50);
assert(lis[0].hidden === false && lis[1].hidden === false && lis[2].hidden === false, "「すべて」ではすべての項目が表示されるはずです");`
    },
    {
      id: 194,
      title: "TODOアプリ4：件数表示とすべて完了",
      explanation: `<p>TODOアプリの仕上げは「残り件数バッジ」と「すべて完了」ボタンです。第14章135で学んだ件数バッジのパターンを、完了状態と組み合わせて発展させます。</p>
<p>まず設計の考え方から。残り件数は「未完了のliの数」であり、これはリストのDOMを数えれば求まります。つまり<strong>件数という状態を別の変数に持つ必要はなく、DOMそのものが唯一の情報源</strong>になります（第7章65）。カウント用の変数とDOMの二重管理をやめると、数え間違いのバグが構造的に起きなくなります。</p>
<p>実装するのは2つです。</p>
<ol>
<li><code>updateCount()</code>：liのうちdoneクラスが付いていないものを数え、countTargetに表示する</li>
<li><code>completeAll()</code>：すべてのliにdoneクラスを付け、最後にupdateCount()を呼ぶ</li>
</ol>
<pre><code>const items = Array.from(this.listTarget.querySelectorAll("li"));
const remaining = items.filter(
  (li) =&gt; !li.classList.contains("done")
).length;</code></pre>
<p><code>querySelectorAll</code>の戻り値はNodeListなので、<code>Array.from</code>で配列に変換してからfilterで絞り込みます（第13章127でtargetsに使ったevery・filterと同じ発想です）。</p>
<p>もうひとつの要点は、骨組みの<code>connect()</code>でupdateCount()を呼んでいることです（第9章82：connectで初期描画）。HTMLの初期表示は「?」ですが、接続した瞬間に正しい件数へ描き替えられるので、初期値のずれが起きません。toggle()の最後でもupdateCount()を呼び、状態が変わるたびに必ず表示を追従させます。</p>`,
      task: `updateCount()とcompleteAll()を実装してください。updateCountはdoneでないliの数をcountTargetに表示し、completeAllは全liにdoneクラスを付けてからupdateCountを呼びます。`,
      code: `<div data-controller="todo">
  <p>残り<span data-todo-target="count">?</span>件</p>
  <button data-action="todo#completeAll">すべて完了</button>
  <ul data-todo-target="list">
    <li><span>牛乳を買う</span><button data-action="todo#toggle">完了</button></li>
    <li><span>部屋の掃除</span><button data-action="todo#toggle">完了</button></li>
    <li class="done"><span>本を返す</span><button data-action="todo#toggle">完了</button></li>
  </ul>
</div>

<style>
  li.done span { text-decoration: line-through; color: gray; }
</style>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("todo", class extends Controller {
  static targets = ["count", "list"];

  connect() {
    this.updateCount();
  }

  toggle(event) {
    event.target.closest("li").classList.toggle("done");
    this.updateCount();
  }

  updateCount() {
    // TODO: listTargetのliのうち、doneクラスが付いていないものの数を数える
    // TODO: その数をcountTargetのtextContentに表示する
  }

  completeAll() {
    // TODO: listTargetのすべてのliにdoneクラスを付ける
    // TODO: 最後にthis.updateCount()を呼んで表示を更新する
  }
});
<\/script>`,
      solution: `<div data-controller="todo">
  <p>残り<span data-todo-target="count">?</span>件</p>
  <button data-action="todo#completeAll">すべて完了</button>
  <ul data-todo-target="list">
    <li><span>牛乳を買う</span><button data-action="todo#toggle">完了</button></li>
    <li><span>部屋の掃除</span><button data-action="todo#toggle">完了</button></li>
    <li class="done"><span>本を返す</span><button data-action="todo#toggle">完了</button></li>
  </ul>
</div>

<style>
  li.done span { text-decoration: line-through; color: gray; }
</style>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("todo", class extends Controller {
  static targets = ["count", "list"];

  connect() {
    this.updateCount();
  }

  toggle(event) {
    event.target.closest("li").classList.toggle("done");
    this.updateCount();
  }

  updateCount() {
    const items = Array.from(this.listTarget.querySelectorAll("li"));
    const remaining = items.filter((li) => !li.classList.contains("done")).length;
    this.countTarget.textContent = remaining;
  }

  completeAll() {
    for (const li of this.listTarget.querySelectorAll("li")) {
      li.classList.add("done");
    }
    this.updateCount();
  }
});
<\/script>`,
      hints: [
        `Array.from(this.listTarget.querySelectorAll("li"))で配列にしてからfilterを使いましょう`,
        `未完了は!li.classList.contains("done")で判定し、.lengthで数えます`,
        `completeAllはfor...ofで全liにclassList.add("done")してから、this.updateCount()を呼びます`
      ],
      check: `assert(text("[data-todo-target=count]") === "2", "接続時、未完了は2件と表示されるはずです（connectでupdateCountが呼ばれます）");
var firstButton = $$("[data-todo-target=list] li")[0].querySelector("button");
firstButton.click();
await sleep(50);
assert(text("[data-todo-target=count]") === "1", "1件を完了にすると残りは1件になるはずです");
firstButton.click();
await sleep(50);
assert(text("[data-todo-target=count]") === "2", "完了を取り消すと残りは2件に戻るはずです");
click("[data-action='todo#completeAll']");
await sleep(50);
assert(text("[data-todo-target=count]") === "0", "すべて完了を押すと残りは0件になるはずです");
assert($$("[data-todo-target=list] li").every((li) => li.classList.contains("done")), "すべてのliにdoneクラスが付いているはずです");`
    },
    {
      id: 195,
      title: "クイズアプリ1：出題と回答判定",
      explanation: `<p>ここからの2ステップでクイズアプリを作ります。第1回は「選択肢を押したら正誤を表示する」という判定の芯の部分です。</p>
<p>設計の鍵は「どのボタンが正解かをどこに書くか」です。JSの中に正解を書いてしまうと、問題を変えるたびにJSを直すことになります。そこで第5章43〜44で学んだアクションパラメータを使い、<strong>正解かどうかをHTML側のボタン自身に持たせます</strong>。</p>
<pre><code>&lt;button data-action="quiz#answer"
        data-quiz-correct-param="true"&gt;data-controller&lt;/button&gt;</code></pre>
<p>ここで大事な仕様がひとつあります。アクションパラメータは<strong>値の見た目に応じて自動で型変換される</strong>ことです。<code>"true"</code>や<code>"false"</code>と書いた値は、<code>event.params.correct</code>で受け取ったときには文字列ではなく真偽値のtrue/falseになっています。数字なら数値に変換されます。この仕様のおかげで<code>if (event.params.correct)</code>とそのまま条件に使えます。</p>
<table>
<tr><th>HTMLに書いた値</th><th>event.paramsでの型</th></tr>
<tr><td>"data-controller"</td><td>String</td></tr>
<tr><td>"true"／"false"</td><td>Boolean</td></tr>
<tr><td>"120"</td><td>Number</td></tr>
</table>
<p>answer()の実装は、correctがtrueならresultTargetに「正解！」、そうでなければ「不正解…」を表示するだけです。条件で表示を出し分ける形は第13章のエラーメッセージ表示と同じ骨格です。三項演算子を使うと1行で書けます。</p>
<pre><code>this.resultTarget.textContent =
  event.params.correct ? "正解！" : "不正解…";</code></pre>`,
      task: `answer(event)を実装してください。event.params.correctがtrueならresultTargetに「正解！」、falseなら「不正解…」と表示します。`,
      code: `<div data-controller="quiz">
  <p>Q. コントローラと要素を結びつけるdata属性はどれ？</p>
  <button data-action="quiz#answer" data-quiz-correct-param="false">data-target</button>
  <button data-action="quiz#answer" data-quiz-correct-param="true">data-controller</button>
  <button data-action="quiz#answer" data-quiz-correct-param="false">data-value</button>
  <p data-quiz-target="result"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("quiz", class extends Controller {
  static targets = ["result"];

  answer(event) {
    // TODO: event.params.correct（自動で真偽値になっている）を調べる
    // TODO: trueならresultTargetに「正解！」、falseなら「不正解…」を表示する
  }
});
<\/script>`,
      solution: `<div data-controller="quiz">
  <p>Q. コントローラと要素を結びつけるdata属性はどれ？</p>
  <button data-action="quiz#answer" data-quiz-correct-param="false">data-target</button>
  <button data-action="quiz#answer" data-quiz-correct-param="true">data-controller</button>
  <button data-action="quiz#answer" data-quiz-correct-param="false">data-value</button>
  <p data-quiz-target="result"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("quiz", class extends Controller {
  static targets = ["result"];

  answer(event) {
    this.resultTarget.textContent = event.params.correct ? "正解！" : "不正解…";
  }
});
<\/script>`,
      hints: [
        `data-quiz-correct-param="true"はevent.params.correctで真偽値trueとして受け取れます`,
        `条件 ? "正解！" : "不正解…" の三項演算子で表示を1行で出し分けられます`,
        `表示先はthis.resultTarget.textContentです`
      ],
      check: `assert(text("[data-quiz-target=result]") === "", "最初は結果表示が空のはずです");
var buttons = $$("button");
buttons[1].click();
await sleep(50);
assert(text("[data-quiz-target=result]") === "正解！", "正しい選択肢（data-controller）を押すと「正解！」と表示されるはずです");
buttons[0].click();
await sleep(50);
assert(text("[data-quiz-target=result]") === "不正解…", "誤った選択肢を押すと「不正解…」と表示されるはずです");
buttons[2].click();
await sleep(50);
assert(text("[data-quiz-target=result]") === "不正解…", "どの誤答でも「不正解…」と表示されるはずです");`
    },
    {
      id: 196,
      title: "クイズアプリ2：スコアと進行管理",
      explanation: `<p>クイズアプリ第2回は、○×形式の問題を順番に出題し、スコアを数えて最後に結果を表示する「進行管理」です。使う知識の中心は第6章58〜59のArray・Object型バリューと、第7章のvalueChangedです。</p>
<p>まず問題データをどこに置くか。JSにハードコードせず、<code>data-quiz-questions-value</code>にJSONの配列として書きます（第18章175：設定はHTML側に寄せる）。各要素は<code>{ "q": 問題文, "a": 正解の真偽値 }</code>というオブジェクトです。</p>
<p>次に進行状態です。「いま何問目か（index）」と「正解数（score）」の2つをNumber型バリューで持ちます。骨組みでは<code>indexValueChanged()</code>がrender()を呼ぶ形が実装済みです。つまり<strong>indexValueを書き換えるだけで、次の問題の表示が自動で行われます</strong>（第7章64のパターン）。render()は、indexが問題数以上になったら終了メッセージとスコアを表示する分岐も持っています。</p>
<p>あなたが実装するanswer()の道筋は次の3手です。</p>
<ol>
<li>終了後の連打対策として、indexValueが問題数以上ならreturnする（ガード節）</li>
<li>現在の問題<code>this.questionsValue[this.indexValue]</code>を取り出し、<code>event.params.choice</code>（○ボタンはtrue、×ボタンはfalse）と<code>a</code>を比べて、一致すればscoreValueを1増やす</li>
<li>indexValueを1増やす（あとはvalueChangedが表示を進めてくれる）</li>
</ol>
<p>「イベント処理は状態を変えるだけ、描画はvalueChangedに任せる」という分業ができると、コードの見通しが一気に良くなります。</p>`,
      task: `answer(event)を実装してください。終了後ならreturnし、現在の問題のaとevent.params.choiceが一致したらscoreValueを1増やし、最後にindexValueを1増やします。`,
      code: `<div data-controller="quiz"
     data-quiz-questions-value='[{"q":"コントローラはdata-controller属性でHTMLに接続する","a":true},{"q":"ターゲットを参照する唯一の方法はquerySelectorである","a":false},{"q":"valueが変わるとxxxValueChangedが呼ばれる","a":true}]'>
  <p data-quiz-target="question"></p>
  <button data-action="quiz#answer" data-quiz-choice-param="true">○</button>
  <button data-action="quiz#answer" data-quiz-choice-param="false">×</button>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("quiz", class extends Controller {
  static targets = ["question"];
  static values = {
    questions: Array,
    index: { type: Number, default: 0 },
    score: { type: Number, default: 0 }
  };

  indexValueChanged() {
    this.render();
  }

  render() {
    if (this.indexValue >= this.questionsValue.length) {
      this.questionTarget.textContent = "終了！ " + this.scoreValue + "問正解でした";
      return;
    }
    const question = this.questionsValue[this.indexValue];
    this.questionTarget.textContent = "Q" + (this.indexValue + 1) + ". " + question.q;
  }

  answer(event) {
    // TODO: this.indexValueが問題数以上なら何もせずreturnする
    // TODO: 現在の問題this.questionsValue[this.indexValue]を取り出し、
    //       event.params.choiceがその問題のaと一致したらthis.scoreValueを1増やす
    // TODO: this.indexValueを1増やす（indexValueChanged経由で次の問題が表示される）
  }
});
<\/script>`,
      solution: `<div data-controller="quiz"
     data-quiz-questions-value='[{"q":"コントローラはdata-controller属性でHTMLに接続する","a":true},{"q":"ターゲットを参照する唯一の方法はquerySelectorである","a":false},{"q":"valueが変わるとxxxValueChangedが呼ばれる","a":true}]'>
  <p data-quiz-target="question"></p>
  <button data-action="quiz#answer" data-quiz-choice-param="true">○</button>
  <button data-action="quiz#answer" data-quiz-choice-param="false">×</button>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("quiz", class extends Controller {
  static targets = ["question"];
  static values = {
    questions: Array,
    index: { type: Number, default: 0 },
    score: { type: Number, default: 0 }
  };

  indexValueChanged() {
    this.render();
  }

  render() {
    if (this.indexValue >= this.questionsValue.length) {
      this.questionTarget.textContent = "終了！ " + this.scoreValue + "問正解でした";
      return;
    }
    const question = this.questionsValue[this.indexValue];
    this.questionTarget.textContent = "Q" + (this.indexValue + 1) + ". " + question.q;
  }

  answer(event) {
    if (this.indexValue >= this.questionsValue.length) return;
    const question = this.questionsValue[this.indexValue];
    if (event.params.choice === question.a) {
      this.scoreValue = this.scoreValue + 1;
    }
    this.indexValue = this.indexValue + 1;
  }
});
<\/script>`,
      hints: [
        `現在の問題はthis.questionsValue[this.indexValue]で取り出せます`,
        `○×の選択はevent.params.choiceに真偽値で入っています。question.aと===で比べましょう`,
        `スコアと進行はthis.scoreValue = this.scoreValue + 1、this.indexValue = this.indexValue + 1のように代入で更新します`
      ],
      check: `assert(text("[data-quiz-target=question]").indexOf("Q1") === 0, "接続時に1問目（Q1）が表示されるはずです");
var maru = $$("button")[0];
maru.click();
await sleep(50);
assert(text("[data-quiz-target=question]").indexOf("Q2") === 0, "回答すると2問目（Q2）に進むはずです");
maru.click();
await sleep(50);
assert(text("[data-quiz-target=question]").indexOf("Q3") === 0, "2問目に回答すると3問目（Q3）に進むはずです");
maru.click();
await sleep(50);
var finalText = text("[data-quiz-target=question]");
assert(finalText.indexOf("終了") !== -1, "全問に回答すると終了メッセージが表示されるはずです");
assert(finalText.indexOf("2問正解") !== -1, "すべて○と答えた場合、正解は2問のはずです（2問目の正解は×）");
maru.click();
await sleep(50);
assert(text("[data-quiz-target=question]").indexOf("2問正解") !== -1, "終了後にボタンを押してもスコアは変わらないはずです");`
    },
    {
      id: 197,
      title: "ミニカート1：商品追加と合計金額",
      explanation: `<p>ここからの2ステップでショッピングカートのミニ版を作ります。第1回は「商品ボタンを押すとカートに行が増え、合計金額が更新される」機能です。</p>
<p>商品の名前と価格は、第5章のアクションパラメータで各ボタンに持たせてあります。<code>data-cart-price-param="120"</code>のように数字の見た目で書いた値は、前々ステップで学んだ自動型変換によって<code>event.params.price</code>がNumber型で届きます。そのまま足し算に使えるので、parseFloatは不要です。</p>
<p>合計金額はNumber型バリュー<code>totalValue</code>で管理します。骨組みには<code>totalValueChanged()</code>で合計表示を書き換える処理が実装済みなので、あなたのadd()は<strong>totalValueに足し込むだけで表示が追従します</strong>（第7章64・第6章57）。初回接続時にもtotalValueChangedが呼ばれるため（第7章62）、最初から「0」が表示されるのもこの仕組みのおかげです。</p>
<p>add()の道筋は3手です。</p>
<ol>
<li>li要素を作り、textContentを「名前（価格円）」の形にする。文字列は<code>event.params.name + "（" + event.params.price + "円）"</code>のように+で連結する</li>
<li>listTargetにappendChildする（第14章131）</li>
<li><code>this.totalValue = this.totalValue + event.params.price</code>で合計を更新する</li>
</ol>
<p>「行の追加」と「合計の更新」を1つのメソッドで行いますが、合計の<em>表示</em>はvalueChangedに任せている点に注目してください。次のステップで数量変更や削除が入っても、この分業が効いてきます。</p>`,
      task: `add(event)を実装してください。「名前（価格円）」というliをlistTargetに追加し、totalValueにevent.params.priceを足します。`,
      code: `<div data-controller="cart">
  <button data-action="cart#add" data-cart-name-param="りんご" data-cart-price-param="120">りんご 120円</button>
  <button data-action="cart#add" data-cart-name-param="パン" data-cart-price-param="250">パン 250円</button>
  <ul data-cart-target="list"></ul>
  <p>合計：<span data-cart-target="total">0</span>円</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("cart", class extends Controller {
  static targets = ["list", "total"];
  static values = { total: { type: Number, default: 0 } };

  totalValueChanged() {
    this.totalTarget.textContent = this.totalValue;
  }

  add(event) {
    // TODO: li要素を作り、textContentを「名前（価格円）」にする
    //       名前はevent.params.name、価格はevent.params.price（Number型）
    // TODO: listTargetにappendChildする
    // TODO: this.totalValueにevent.params.priceを足す
  }
});
<\/script>`,
      solution: `<div data-controller="cart">
  <button data-action="cart#add" data-cart-name-param="りんご" data-cart-price-param="120">りんご 120円</button>
  <button data-action="cart#add" data-cart-name-param="パン" data-cart-price-param="250">パン 250円</button>
  <ul data-cart-target="list"></ul>
  <p>合計：<span data-cart-target="total">0</span>円</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("cart", class extends Controller {
  static targets = ["list", "total"];
  static values = { total: { type: Number, default: 0 } };

  totalValueChanged() {
    this.totalTarget.textContent = this.totalValue;
  }

  add(event) {
    const li = document.createElement("li");
    li.textContent = event.params.name + "（" + event.params.price + "円）";
    this.listTarget.appendChild(li);
    this.totalValue = this.totalValue + event.params.price;
  }
});
<\/script>`,
      hints: [
        `商品名と価格はevent.params.nameとevent.params.priceで受け取れます（priceは自動でNumber型になります）`,
        `表示文字列は event.params.name + "（" + event.params.price + "円）" のように+で連結します`,
        `合計はthis.totalValue = this.totalValue + event.params.price で更新すると、totalValueChangedが表示を書き換えてくれます`
      ],
      check: `assert(text("[data-cart-target=total]") === "0", "最初の合計は0円のはずです");
var buttons = $$("button");
buttons[0].click();
await sleep(50);
assert($$("[data-cart-target=list] li").length === 1, "商品ボタンを押すとカートに1行増えるはずです");
assert(text("[data-cart-target=list] li") === "りんご（120円）", "行には「りんご（120円）」と表示されるはずです");
assert(text("[data-cart-target=total]") === "120", "りんごを追加すると合計は120になるはずです");
buttons[1].click();
await sleep(50);
assert(text("[data-cart-target=total]") === "370", "パンも追加すると合計は370になるはずです（120+250）");
buttons[0].click();
await sleep(50);
assert($$("[data-cart-target=list] li").length === 3, "同じ商品でも押すたびに行が増えるはずです");
assert(text("[data-cart-target=total]") === "490", "りんごをもう1つ追加すると合計は490になるはずです");`
    },
    {
      id: 198,
      title: "ミニカート2：数量変更と削除（dispatch連携）",
      explanation: `<p>ミニカート第2回は、各行に数量の＋−ボタンと削除ボタンを付けます。ここでの主役は<strong>コントローラの分割と連携</strong>です。1行ごとの操作はitemコントローラ、合計の計算はcartコントローラと、第10章95の単一責任の考え方で分けます。</p>
<p>問題は「行の変化を、外側のcartにどう知らせるか」です。第11章で学んだ<code>this.dispatch</code>を使います。itemは自分の数量が変わるたび、また自分が削除されたときにイベントを発火します。ただし削除の場合、<code>this.element.remove()</code>の後では要素がDOMから切り離されており、そこから発火してもバブリングでcartに届きません。そこで第11章109で学んだグローバル通知パターンを使い、<code>this.dispatch("changed", { target: window })</code>と<strong>windowに向けて発火</strong>します。cart側はHTMLに<code>data-action="item:changed@window-&gt;cart#recalc"</code>と書いて受け取ります（イベント名にコントローラ名のプレフィックスが付くのは第11章102の通りです）。</p>
<p>あなたが実装するのは2箇所です。</p>
<ol>
<li>itemのremove()：<code>this.element.remove()</code>してから、windowに向けてchangedを発火する</li>
<li>cartのrecalc()：行を集計して合計を表示する</li>
</ol>
<p>recalc()は差分計算ではなく、<strong>毎回DOMを見て全行を合計し直す</strong>設計にします（第7章65：状態はDOMに置く）。各行は価格を<code>data-item-price-value</code>属性に、数量をquantity表示に持っているので、それを読み取って価格×数量を足し合わせます。全部作り直す方式は一見無駄に見えますが、増減・削除のどのイベントでも同じ1つの処理で正しい合計になる、壊れにくい設計です。</p>`,
      task: `itemのremove()とcartのrecalc()を実装してください。removeは要素を削除してからwindowへdispatchし、recalcは全行の価格×数量を合計してtotalTargetに表示します。`,
      code: `<div data-controller="cart" data-action="item:changed@window->cart#recalc">
  <ul>
    <li data-controller="item" data-item-price-value="120">
      りんご
      <button data-action="item#decrement">-</button>
      <span data-item-target="quantity">1</span>
      <button data-action="item#increment">+</button>
      <button data-action="item#remove">削除</button>
    </li>
    <li data-controller="item" data-item-price-value="250">
      パン
      <button data-action="item#decrement">-</button>
      <span data-item-target="quantity">1</span>
      <button data-action="item#increment">+</button>
      <button data-action="item#remove">削除</button>
    </li>
  </ul>
  <p>合計：<span data-cart-target="total">?</span>円</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("item", class extends Controller {
  static targets = ["quantity"];
  static values = { price: Number, quantity: { type: Number, default: 1 } };

  quantityValueChanged() {
    this.quantityTarget.textContent = this.quantityValue;
    this.dispatch("changed", { target: window });
  }

  increment() {
    this.quantityValue = this.quantityValue + 1;
  }

  decrement() {
    if (this.quantityValue > 1) this.quantityValue = this.quantityValue - 1;
  }

  remove() {
    // TODO: this.element.remove()で行を削除する
    // TODO: その後this.dispatch("changed", { target: window })で変更を通知する
  }
});

application.register("cart", class extends Controller {
  static targets = ["total"];

  connect() {
    this.recalc();
  }

  recalc() {
    // TODO: this.element.querySelectorAll("[data-controller=item]")の各行について、
    //       価格（getAttributeで"data-item-price-value"をNumber変換）×
    //       数量（行内の[data-item-target=quantity]のtextContentをNumber変換）を合計する
    // TODO: 合計をtotalTargetに表示する
  }
});
<\/script>`,
      solution: `<div data-controller="cart" data-action="item:changed@window->cart#recalc">
  <ul>
    <li data-controller="item" data-item-price-value="120">
      りんご
      <button data-action="item#decrement">-</button>
      <span data-item-target="quantity">1</span>
      <button data-action="item#increment">+</button>
      <button data-action="item#remove">削除</button>
    </li>
    <li data-controller="item" data-item-price-value="250">
      パン
      <button data-action="item#decrement">-</button>
      <span data-item-target="quantity">1</span>
      <button data-action="item#increment">+</button>
      <button data-action="item#remove">削除</button>
    </li>
  </ul>
  <p>合計：<span data-cart-target="total">?</span>円</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("item", class extends Controller {
  static targets = ["quantity"];
  static values = { price: Number, quantity: { type: Number, default: 1 } };

  quantityValueChanged() {
    this.quantityTarget.textContent = this.quantityValue;
    this.dispatch("changed", { target: window });
  }

  increment() {
    this.quantityValue = this.quantityValue + 1;
  }

  decrement() {
    if (this.quantityValue > 1) this.quantityValue = this.quantityValue - 1;
  }

  remove() {
    this.element.remove();
    this.dispatch("changed", { target: window });
  }
});

application.register("cart", class extends Controller {
  static targets = ["total"];

  connect() {
    this.recalc();
  }

  recalc() {
    let sum = 0;
    for (const li of this.element.querySelectorAll("[data-controller=item]")) {
      const price = Number(li.getAttribute("data-item-price-value"));
      const quantity = Number(li.querySelector("[data-item-target=quantity]").textContent);
      sum = sum + price * quantity;
    }
    this.totalTarget.textContent = sum;
  }
});
<\/script>`,
      hints: [
        `removeは先にthis.element.remove()し、それからdispatchします。順番が逆でも動きますが、windowに向けて発火しているのはバブリングに頼らないためです`,
        `recalcではlet sum = 0;から始めて、for...ofで各行の価格×数量を足し込みます`,
        `価格はNumber(li.getAttribute("data-item-price-value"))、数量はNumber(li.querySelector("[data-item-target=quantity]").textContent)で読み取れます`
      ],
      check: `await sleep(100);
assert(text("[data-cart-target=total]") === "370", "接続時の合計は370円のはずです（120+250）");
var apple = $$("li")[0];
apple.querySelectorAll("button")[1].click();
await sleep(50);
assert(text("[data-cart-target=total]") === "490", "りんごを2個に増やすと合計は490円になるはずです");
apple.querySelectorAll("button")[0].click();
await sleep(50);
assert(text("[data-cart-target=total]") === "370", "りんごを1個に戻すと合計は370円になるはずです");
apple.querySelectorAll("button")[1].click();
await sleep(50);
var bread = $$("li")[1];
bread.querySelectorAll("button")[2].click();
await sleep(50);
assert($$("li").length === 1, "削除ボタンでその行が消えるはずです");
assert(text("[data-cart-target=total]") === "240", "パンを削除すると合計はりんご2個分の240円になるはずです");`
    },
    {
      id: 199,
      title: "フォームウィザード（複数ステップ切替＋検証）",
      explanation: `<p>入力を何画面かに分けて進める「ウィザード」形式のフォームを作ります。組み合わせるのは、第15章143のタブ切り替え（複数パネルから1つだけ表示）、第6・7章のNumber型バリューとvalueChanged、第13章の入力検証です。</p>
<p>設計の骨格はタブ切り替えとほぼ同じです。「いま何ステップ目か」を<code>indexValue</code>で持ち、<code>indexValueChanged()</code>で全パネルを走査して現在のものだけ表示します。この部分は骨組みに実装済みです。</p>
<pre><code>indexValueChanged() {
  this.panelTargets.forEach((panel, i) =&gt; {
    panel.hidden = (i !== this.indexValue);
  });
}</code></pre>
<p>ウィザードがタブと違うのは、<strong>次へ進む前に現在の入力を検証する</strong>ことです。あなたが実装するnext()の道筋は次の通りです。</p>
<ol>
<li>現在のパネル<code>this.panelTargets[this.indexValue]</code>をquerySelectorで調べ、input要素を探す</li>
<li>inputがあり、値がtrimして空なら、errorTargetにメッセージを出してreturnする（第13章123のエラー表示）</li>
<li>検証を通ったらerrorTargetを空にし、最後のパネルでなければindexValueを1増やす</li>
</ol>
<p>最終パネルにはinputがないので、手順1のinputは<code>null</code>になります。<code>if (input &amp;&amp; ...)</code>と存在チェックを挟むことで「検証すべき入力がないパネルは素通し」にできます。prev()（実装済み）は検証なしで戻れるようにしてあります。入力をやり直すために戻る操作を妨げないのは、ユーザビリティ上の定番の配慮です。</p>`,
      task: `next()を実装してください。現在のパネルのinputが空ならerrorTargetにメッセージを出して進まず、入力済みならエラーを消して次のパネルへ進みます（最後のパネルでは進みません）。`,
      code: `<div data-controller="wizard">
  <div data-wizard-target="panel">
    <p>ステップ1：お名前</p>
    <input type="text" placeholder="名前">
  </div>
  <div data-wizard-target="panel" hidden>
    <p>ステップ2：好きな食べ物</p>
    <input type="text" placeholder="好きな食べ物">
  </div>
  <div data-wizard-target="panel" hidden>
    <p>ステップ3：入力ありがとうございました！</p>
  </div>
  <p data-wizard-target="error" style="color: red;"></p>
  <button data-action="wizard#prev">戻る</button>
  <button data-action="wizard#next">次へ</button>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("wizard", class extends Controller {
  static targets = ["panel", "error"];
  static values = { index: { type: Number, default: 0 } };

  indexValueChanged() {
    this.panelTargets.forEach((panel, i) => {
      panel.hidden = (i !== this.indexValue);
    });
  }

  prev() {
    if (this.indexValue > 0) this.indexValue = this.indexValue - 1;
  }

  next() {
    // TODO: 現在のパネルthis.panelTargets[this.indexValue]からquerySelectorでinputを探す
    // TODO: inputがあり、値をtrimして空なら、errorTargetに
    //       「入力してから次へ進んでください」と表示してreturnする
    // TODO: errorTargetを空文字にする
    // TODO: 最後のパネルでなければthis.indexValueを1増やす
  }
});
<\/script>`,
      solution: `<div data-controller="wizard">
  <div data-wizard-target="panel">
    <p>ステップ1：お名前</p>
    <input type="text" placeholder="名前">
  </div>
  <div data-wizard-target="panel" hidden>
    <p>ステップ2：好きな食べ物</p>
    <input type="text" placeholder="好きな食べ物">
  </div>
  <div data-wizard-target="panel" hidden>
    <p>ステップ3：入力ありがとうございました！</p>
  </div>
  <p data-wizard-target="error" style="color: red;"></p>
  <button data-action="wizard#prev">戻る</button>
  <button data-action="wizard#next">次へ</button>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("wizard", class extends Controller {
  static targets = ["panel", "error"];
  static values = { index: { type: Number, default: 0 } };

  indexValueChanged() {
    this.panelTargets.forEach((panel, i) => {
      panel.hidden = (i !== this.indexValue);
    });
  }

  prev() {
    if (this.indexValue > 0) this.indexValue = this.indexValue - 1;
  }

  next() {
    const panel = this.panelTargets[this.indexValue];
    const input = panel.querySelector("input");
    if (input && input.value.trim() === "") {
      this.errorTarget.textContent = "入力してから次へ進んでください";
      return;
    }
    this.errorTarget.textContent = "";
    if (this.indexValue < this.panelTargets.length - 1) {
      this.indexValue = this.indexValue + 1;
    }
  }
});
<\/script>`,
      hints: [
        `現在のパネルはthis.panelTargets[this.indexValue]、その中のinputはpanel.querySelector("input")で探せます`,
        `if (input && input.value.trim() === "") でエラーを表示してreturnしましょう。inputがないパネルは素通しです`,
        `進めるのはthis.indexValue < this.panelTargets.length - 1のときだけ。代入すればindexValueChangedが表示を切り替えます`
      ],
      check: `var panels = $$("[data-wizard-target=panel]");
assert(panels.length === 3, "パネルは3つあるはずです");
assert(panels[0].hidden === false && panels[1].hidden === true, "最初はステップ1だけが表示されるはずです");
var nextButton = $$("button")[1];
nextButton.click();
await sleep(50);
assert(text("[data-wizard-target=error]") !== "", "未入力のまま次へを押すとエラーメッセージが表示されるはずです");
assert(panels[0].hidden === false, "未入力のときはステップ1に留まるはずです");
$$("input")[0].value = "田中";
nextButton.click();
await sleep(50);
assert(panels[0].hidden === true && panels[1].hidden === false, "入力してから次へを押すとステップ2が表示されるはずです");
assert(text("[data-wizard-target=error]") === "", "進めたときはエラーメッセージが消えるはずです");
var prevButton = $$("button")[0];
prevButton.click();
await sleep(50);
assert(panels[0].hidden === false, "戻るボタンでステップ1に戻れるはずです");
nextButton.click();
await sleep(50);
$$("input")[1].value = "カレー";
nextButton.click();
await sleep(50);
assert(panels[2].hidden === false && panels[1].hidden === true, "ステップ2を入力して次へを押すと最後のステップが表示されるはずです");
nextButton.click();
await sleep(50);
assert(panels[2].hidden === false, "最後のパネルで次へを押しても表示は変わらないはずです");`
    },
    {
      id: 200,
      title: "卒業課題（家計簿UI：入力→リスト追加→カテゴリ別集計表示）",
      explanation: `<p>最終ステップは卒業課題です。「項目名・金額・カテゴリを入力して追加すると、履歴リストに行が増え、カテゴリ別の合計表が更新される」家計簿UIを完成させます。使う知識はこの教材の集大成です。</p>
<table>
<tr><th>部品</th><th>使う知識</th></tr>
<tr><td>フォーム送信と:prevent</td><td>第3章27・第13章126</td></tr>
<tr><td>入力検証（空チェック・parseFloat）</td><td>第13章124〜125（実装済み）</td></tr>
<tr><td>行の追加</td><td>第14章131</td></tr>
<tr><td>行へのデータ保持（dataset）</td><td>第1章6</td></tr>
<tr><td>集計オブジェクトと再計算</td><td>第7章65の思想＋第198ステップの全再計算方式</td></tr>
</table>
<p>設計の要は「集計をどう正しく保つか」です。カテゴリごとの合計を変数で持って足し込むのではなく、<strong>各行に<code>li.dataset.category</code>と<code>li.dataset.amount</code>としてデータを残しておき、updateSummary()で毎回全行を集計し直します</strong>。data-*属性に載せたデータはdatasetで読み書きできる、という第1章の知識がここで効いてきます。</p>
<p>add()の後半（TODO部分）は、liを作って表示文字列を「名前：金額円」にし、datasetにカテゴリ（<code>this.categoryTarget.value</code>：select要素のvalueは第3章26）と金額を入れ、リストに追加して入力欄を空にし、最後にupdateSummary()を呼びます。</p>
<p>updateSummary()は<code>{ food: 0, transport: 0, other: 0 }</code>という集計用オブジェクトを用意し、全行のdataset.categoryをキーに<code>Number(li.dataset.amount)</code>を加算して、3つの表示先ターゲットに書き込みます。</p>
<pre><code>totals[li.dataset.category] =
  totals[li.dataset.category] + Number(li.dataset.amount);</code></pre>
<p>これが完成すれば200ステップ完走です。おつかれさまでした！ここまでの「状態はDOMに置く」「描画はvalueChangedやまとめ役メソッドに寄せる」「設定はHTMLに書く」という設計感覚は、そのまま実務のStimulusコードに通用します。</p>`,
      task: `add()のTODO部分とupdateSummary()を実装してください。行にはdataset.categoryとdataset.amountを持たせ、updateSummaryで全行をカテゴリ別に集計して3つの合計表示を更新します。`,
      code: `<div data-controller="kakeibo">
  <form data-action="submit->kakeibo#add:prevent">
    <input type="text" data-kakeibo-target="name" placeholder="項目名">
    <input type="number" data-kakeibo-target="amount" placeholder="金額">
    <select data-kakeibo-target="category">
      <option value="food">食費</option>
      <option value="transport">交通費</option>
      <option value="other">その他</option>
    </select>
    <button>追加</button>
  </form>
  <p data-kakeibo-target="error" style="color: red;"></p>
  <ul data-kakeibo-target="list"></ul>
  <table>
    <tr><th>食費</th><td><span data-kakeibo-target="foodTotal">0</span>円</td></tr>
    <tr><th>交通費</th><td><span data-kakeibo-target="transportTotal">0</span>円</td></tr>
    <tr><th>その他</th><td><span data-kakeibo-target="otherTotal">0</span>円</td></tr>
  </table>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("kakeibo", class extends Controller {
  static targets = ["name", "amount", "category", "error",
                    "list", "foodTotal", "transportTotal", "otherTotal"];

  add() {
    const name = this.nameTarget.value.trim();
    const amount = parseFloat(this.amountTarget.value);
    if (name === "" || isNaN(amount) || amount <= 0) {
      this.errorTarget.textContent = "項目名と正の金額を入力してください";
      return;
    }
    this.errorTarget.textContent = "";
    // TODO: li要素を作り、textContentを「名前：金額円」にする（+で連結）
    // TODO: li.dataset.categoryにthis.categoryTarget.valueを、
    //       li.dataset.amountにamountを入れる
    // TODO: listTargetにappendChildし、名前と金額の入力欄を空文字に戻す
    // TODO: this.updateSummary()を呼ぶ
  }

  updateSummary() {
    // TODO: 集計用オブジェクト { food: 0, transport: 0, other: 0 } を用意する
    // TODO: listTargetの各liについて、dataset.categoryをキーに
    //       Number(li.dataset.amount)を加算する
    // TODO: foodTotalTarget・transportTotalTarget・otherTotalTargetに
    //       それぞれの合計を表示する
  }
});
<\/script>`,
      solution: `<div data-controller="kakeibo">
  <form data-action="submit->kakeibo#add:prevent">
    <input type="text" data-kakeibo-target="name" placeholder="項目名">
    <input type="number" data-kakeibo-target="amount" placeholder="金額">
    <select data-kakeibo-target="category">
      <option value="food">食費</option>
      <option value="transport">交通費</option>
      <option value="other">その他</option>
    </select>
    <button>追加</button>
  </form>
  <p data-kakeibo-target="error" style="color: red;"></p>
  <ul data-kakeibo-target="list"></ul>
  <table>
    <tr><th>食費</th><td><span data-kakeibo-target="foodTotal">0</span>円</td></tr>
    <tr><th>交通費</th><td><span data-kakeibo-target="transportTotal">0</span>円</td></tr>
    <tr><th>その他</th><td><span data-kakeibo-target="otherTotal">0</span>円</td></tr>
  </table>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("kakeibo", class extends Controller {
  static targets = ["name", "amount", "category", "error",
                    "list", "foodTotal", "transportTotal", "otherTotal"];

  add() {
    const name = this.nameTarget.value.trim();
    const amount = parseFloat(this.amountTarget.value);
    if (name === "" || isNaN(amount) || amount <= 0) {
      this.errorTarget.textContent = "項目名と正の金額を入力してください";
      return;
    }
    this.errorTarget.textContent = "";
    const li = document.createElement("li");
    li.textContent = name + "：" + amount + "円";
    li.dataset.category = this.categoryTarget.value;
    li.dataset.amount = amount;
    this.listTarget.appendChild(li);
    this.nameTarget.value = "";
    this.amountTarget.value = "";
    this.updateSummary();
  }

  updateSummary() {
    const totals = { food: 0, transport: 0, other: 0 };
    for (const li of this.listTarget.querySelectorAll("li")) {
      totals[li.dataset.category] = totals[li.dataset.category] + Number(li.dataset.amount);
    }
    this.foodTotalTarget.textContent = totals.food;
    this.transportTotalTarget.textContent = totals.transport;
    this.otherTotalTarget.textContent = totals.other;
  }
});
<\/script>`,
      hints: [
        `表示文字列は name + "：" + amount + "円" 、行へのデータ保持はli.dataset.categoryとli.dataset.amountへの代入です`,
        `updateSummaryではconst totals = { food: 0, transport: 0, other: 0 }; を用意し、totals[li.dataset.category]に加算します`,
        `最後にthis.foodTotalTarget.textContent = totals.food; のように3つのターゲットへ書き込みます`
      ],
      check: `setValue("[data-kakeibo-target=name]", "スーパー");
setValue("[data-kakeibo-target=amount]", "1200");
submit("form");
await sleep(50);
assert($$("[data-kakeibo-target=list] li").length === 1, "追加するとリストに1行増えるはずです");
assert(text("[data-kakeibo-target=list] li") === "スーパー：1200円", "行には「スーパー：1200円」と表示されるはずです");
assert(text("[data-kakeibo-target=foodTotal]") === "1200", "食費の合計が1200になるはずです");
assert($("[data-kakeibo-target=name]").value === "", "追加後は項目名の入力欄が空になるはずです");
$("[data-kakeibo-target=category]").value = "transport";
setValue("[data-kakeibo-target=name]", "バス");
setValue("[data-kakeibo-target=amount]", "500");
submit("form");
await sleep(50);
assert(text("[data-kakeibo-target=transportTotal]") === "500", "交通費の合計が500になるはずです");
assert(text("[data-kakeibo-target=foodTotal]") === "1200", "食費の合計は1200のままのはずです");
$("[data-kakeibo-target=category]").value = "food";
setValue("[data-kakeibo-target=name]", "カフェ");
setValue("[data-kakeibo-target=amount]", "800");
submit("form");
await sleep(50);
assert(text("[data-kakeibo-target=foodTotal]") === "2000", "食費の合計が2000になるはずです（1200+800）");
setValue("[data-kakeibo-target=name]", "");
setValue("[data-kakeibo-target=amount]", "300");
submit("form");
await sleep(50);
assert($$("[data-kakeibo-target=list] li").length === 3, "項目名が空のときは追加されないはずです");
assert(text("[data-kakeibo-target=error]") !== "", "不正な入力ではエラーメッセージが表示されるはずです");`
    }
  ]
});
