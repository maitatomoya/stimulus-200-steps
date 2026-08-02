// 第15章：表示制御パターン
registerChapter({
  number: 15,
  title: "表示制御パターン",
  description: "hiddenクラスの付け外しを軸に、トグル・アコーディオン・タブ・モーダル・ドロップダウンなど実務で頻出する表示制御UIのパターンを習得します。",
  steps: [
    {
      id: 141,
      title: "トグル（hiddenクラス）",
      explanation: `<p>この章では、これまで学んだアクション・ターゲット・クラス操作を組み合わせて、実務で頻出する「表示制御」のUIパターンを1つずつ作っていきます。最初は最も基本となるトグル（表示と非表示の切り替え）です。</p>
<p>作り方はシンプルです。CSSに<code>display: none;</code>を持つ<code>hidden</code>クラスを用意しておき、JavaScriptからは第1章と第8章で学んだ<code>classList.toggle()</code>でそのクラスを付け外しします。要素そのものをDOMから削除するのではなく、クラスで見た目だけを切り替えるのがポイントです。要素が残っているので中の状態は壊れず、何度でも表示に戻せます。</p>
<pre><code>&lt;style&gt;.hidden { display: none; }&lt;/style&gt;</code></pre>
<pre><code>toggle() {
  this.contentTarget.classList.toggle("hidden");
}</code></pre>
<p>この「hiddenクラス方式」は、この後のアコーディオン・タブ・モーダルなどすべてのパターンの土台になります。なお、クラス名をHTML側から差し替えたい場合は第8章で学んだ<code>static classes</code>を使う設計もできますが、この章では話を簡単にするため<code>hidden</code>という固定のクラス名を使います。</p>`,
      task: `ボタンをクリックするたびに、段落の表示と非表示が切り替わるようにTODOを埋めてください。`,
      code: `<style>.hidden { display: none; }</style>

<div data-controller="toggle">
  <button data-action="click->toggle#toggle">表示/非表示</button>
  <p id="content" data-toggle-target="content">この段落の表示が切り替わります。</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("toggle", class extends Controller {
  static targets = ["content"];
  toggle() {
    // TODO: contentTargetのclassListでhiddenクラスをトグルする
  }
});
<\/script>`,
      solution: `<style>.hidden { display: none; }</style>

<div data-controller="toggle">
  <button data-action="click->toggle#toggle">表示/非表示</button>
  <p id="content" data-toggle-target="content">この段落の表示が切り替わります。</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("toggle", class extends Controller {
  static targets = ["content"];
  toggle() {
    this.contentTarget.classList.toggle("hidden");
  }
});
<\/script>`,
      hints: [
        `classList.toggle("hidden")は、クラスがあれば外し、なければ付けます`,
        `this.contentTarget.classList.toggle("hidden"); の1行で完成です`
      ],
      check: `const content = $("#content");
assert(content, "id=contentの要素が必要です");
assert(!content.classList.contains("hidden"), "最初は段落が表示されている（hiddenクラスなし）はずです");
click("button");
await sleep(50);
assert(content.classList.contains("hidden"), "1回クリックすると段落にhiddenクラスが付いて非表示になるはずです");
click("button");
await sleep(50);
assert(!content.classList.contains("hidden"), "もう1回クリックするとhiddenクラスが外れて再び表示されるはずです");`
    },
    {
      id: 142,
      title: "アコーディオン（1つだけ開く）",
      explanation: `<p>アコーディオンは、複数の見出しのうちクリックされた1つだけを開き、他は閉じるUIです。FAQページなどでよく使われます。</p>
<p>実装の鍵は2つあります。1つ目は第5章で学んだアクションパラメータです。各見出しボタンに<code>data-accordion-index-param="0"</code>のように番号を持たせ、メソッド側で<code>event.params.index</code>として受け取ります。数字だけの値は自動で数値型に変換されるのでした。</p>
<p>2つ目は<code>classList.toggle()</code>の第2引数です。第2引数に真偽値を渡すと、「トグル」ではなく「trueなら必ず付ける、falseなら必ず外す」という動きになります。</p>
<pre><code>open(event) {
  const index = event.params.index;
  this.panelTargets.forEach((panel, i) =&gt; {
    panel.classList.toggle("hidden", i !== index);
  });
}</code></pre>
<p><code>i !== index</code>は「クリックされた番号以外か」という条件なので、クリックされたパネルだけhiddenが外れ、他のパネルには必ずhiddenが付きます。forEachで全パネルを一括処理することで、「1つだけ開く」という排他制御がたった3行で書けるのがこのパターンの美しいところです。</p>`,
      task: `見出しをクリックすると、そのパネルだけが開き、他のパネルは閉じるようにTODOを埋めてください。`,
      code: `<style>.hidden { display: none; }</style>

<div data-controller="accordion">
  <button id="head-0" data-action="click->accordion#open" data-accordion-index-param="0">第1章とは</button>
  <p id="panel-0" data-accordion-target="panel" class="hidden">第1章の本文です。</p>
  <button id="head-1" data-action="click->accordion#open" data-accordion-index-param="1">第2章とは</button>
  <p id="panel-1" data-accordion-target="panel" class="hidden">第2章の本文です。</p>
  <button id="head-2" data-action="click->accordion#open" data-accordion-index-param="2">第3章とは</button>
  <p id="panel-2" data-accordion-target="panel" class="hidden">第3章の本文です。</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("accordion", class extends Controller {
  static targets = ["panel"];
  open(event) {
    const index = event.params.index;
    // TODO: panelTargetsをforEachで回し、番号がindexと同じパネルだけ表示し、
    // それ以外にはhiddenを付ける（classList.toggleの第2引数を使う）
    this.panelTargets[index].classList.remove("hidden");
  }
});
<\/script>`,
      solution: `<style>.hidden { display: none; }</style>

<div data-controller="accordion">
  <button id="head-0" data-action="click->accordion#open" data-accordion-index-param="0">第1章とは</button>
  <p id="panel-0" data-accordion-target="panel" class="hidden">第1章の本文です。</p>
  <button id="head-1" data-action="click->accordion#open" data-accordion-index-param="1">第2章とは</button>
  <p id="panel-1" data-accordion-target="panel" class="hidden">第2章の本文です。</p>
  <button id="head-2" data-action="click->accordion#open" data-accordion-index-param="2">第3章とは</button>
  <p id="panel-2" data-accordion-target="panel" class="hidden">第3章の本文です。</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("accordion", class extends Controller {
  static targets = ["panel"];
  open(event) {
    const index = event.params.index;
    this.panelTargets.forEach((panel, i) => {
      panel.classList.toggle("hidden", i !== index);
    });
  }
});
<\/script>`,
      hints: [
        `classList.toggle("hidden", 条件)は、条件がtrueならhiddenを付け、falseなら外します`,
        `this.panelTargets.forEach((panel, i) => { panel.classList.toggle("hidden", i !== index); });`
      ],
      check: `click("#head-0");
await sleep(50);
assert(!$("#panel-0").classList.contains("hidden"), "第1章の見出しをクリックすると第1章のパネルが開くはずです");
click("#head-1");
await sleep(50);
assert(!$("#panel-1").classList.contains("hidden"), "第2章の見出しをクリックすると第2章のパネルが開くはずです");
assert($("#panel-0").classList.contains("hidden"), "第2章を開いたとき、第1章のパネルは閉じるはずです（開くのは常に1つだけ）");
assert($("#panel-2").classList.contains("hidden"), "クリックしていない第3章のパネルは閉じたままのはずです");`
    },
    {
      id: 143,
      title: "タブ切り替え",
      explanation: `<p>タブUIは、アコーディオンの発展形です。パネルの排他表示に加えて、「今どのタブが選ばれているか」をタブボタン自身の見た目でも示す必要があります。つまり2種類のターゲット配列を同時に操作します。</p>
<table>
<tr><th>対象</th><th>ターゲット</th><th>操作するクラス</th></tr>
<tr><td>タブボタン</td><td><code>tabTargets</code></td><td><code>active</code>（選択中に付ける）</td></tr>
<tr><td>パネル</td><td><code>panelTargets</code></td><td><code>hidden</code>（非選択に付ける）</td></tr>
</table>
<p>どちらも前のステップで学んだ「forEach＋toggleの第2引数」で書けます。条件の向きに注意してください。activeは「選択されたものに付ける」ので<code>i === index</code>、hiddenは「選択されなかったものに付ける」ので<code>i !== index</code>です。</p>
<pre><code>select(event) {
  const index = event.params.index;
  this.tabTargets.forEach((tab, i) =&gt; {
    tab.classList.toggle("active", i === index);
  });
  this.panelTargets.forEach((panel, i) =&gt; {
    panel.classList.toggle("hidden", i !== index);
  });
}</code></pre>
<p>タブとパネルはHTML上の並び順で対応づけています。ターゲット配列は文書内の出現順に並ぶため、番号のパラメータと組み合わせるだけで対応が取れます。</p>`,
      task: `タブをクリックすると対応するパネルが表示され、クリックしたタブだけにactiveクラスが付くようにTODOを埋めてください。`,
      code: `<style>
.hidden { display: none; }
.active { font-weight: bold; border-bottom: 2px solid #3b82f6; }
</style>

<div data-controller="tabs">
  <button id="tab-0" class="active" data-tabs-target="tab" data-action="click->tabs#select" data-tabs-index-param="0">概要</button>
  <button id="tab-1" data-tabs-target="tab" data-action="click->tabs#select" data-tabs-index-param="1">仕様</button>
  <button id="tab-2" data-tabs-target="tab" data-action="click->tabs#select" data-tabs-index-param="2">レビュー</button>
  <div id="panel-0" data-tabs-target="panel">商品の概要です。</div>
  <div id="panel-1" data-tabs-target="panel" class="hidden">商品の仕様です。</div>
  <div id="panel-2" data-tabs-target="panel" class="hidden">レビューの一覧です。</div>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("tabs", class extends Controller {
  static targets = ["tab", "panel"];
  select(event) {
    const index = event.params.index;
    this.panelTargets.forEach((panel, i) => {
      panel.classList.toggle("hidden", i !== index);
    });
    // TODO: tabTargetsもforEachで回し、番号がindexと同じタブだけに
    // activeクラスを付ける（他のタブからは外す）
  }
});
<\/script>`,
      solution: `<style>
.hidden { display: none; }
.active { font-weight: bold; border-bottom: 2px solid #3b82f6; }
</style>

<div data-controller="tabs">
  <button id="tab-0" class="active" data-tabs-target="tab" data-action="click->tabs#select" data-tabs-index-param="0">概要</button>
  <button id="tab-1" data-tabs-target="tab" data-action="click->tabs#select" data-tabs-index-param="1">仕様</button>
  <button id="tab-2" data-tabs-target="tab" data-action="click->tabs#select" data-tabs-index-param="2">レビュー</button>
  <div id="panel-0" data-tabs-target="panel">商品の概要です。</div>
  <div id="panel-1" data-tabs-target="panel" class="hidden">商品の仕様です。</div>
  <div id="panel-2" data-tabs-target="panel" class="hidden">レビューの一覧です。</div>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("tabs", class extends Controller {
  static targets = ["tab", "panel"];
  select(event) {
    const index = event.params.index;
    this.panelTargets.forEach((panel, i) => {
      panel.classList.toggle("hidden", i !== index);
    });
    this.tabTargets.forEach((tab, i) => {
      tab.classList.toggle("active", i === index);
    });
  }
});
<\/script>`,
      hints: [
        `activeクラスは「選択されたタブに付ける」ので、条件はi === indexです`,
        `this.tabTargets.forEach((tab, i) => { tab.classList.toggle("active", i === index); });`
      ],
      check: `assert(!$("#panel-0").classList.contains("hidden"), "最初は概要パネルが表示されているはずです");
click("#tab-2");
await sleep(50);
assert(!$("#panel-2").classList.contains("hidden"), "レビュータブをクリックするとレビューパネルが表示されるはずです");
assert($("#panel-0").classList.contains("hidden"), "レビュータブを選んだら概要パネルは隠れるはずです");
assert($("#tab-2").classList.contains("active"), "クリックしたタブにはactiveクラスが付くはずです");
assert(!$("#tab-0").classList.contains("active"), "選択されなくなったタブからはactiveクラスが外れるはずです");`
    },
    {
      id: 144,
      title: "モーダルの開閉",
      explanation: `<p>モーダルは、ページの上に重ねて表示するダイアログです。本格的なモーダルは背景を暗くするオーバーレイやフォーカス管理も伴いますが、表示制御の本質は「開くボタンでhiddenを外し、閉じるボタンでhiddenを付ける」だけです。まずはこの骨格を作ります。</p>
<p>トグルと違い、モーダルには「開く」と「閉じる」という明確に別の操作があります。1つのtoggleメソッドで済ませず、<code>open()</code>と<code>close()</code>という2つのメソッドに分けるのがポイントです。</p>
<pre><code>open() {
  this.dialogTarget.classList.remove("hidden");
}
close() {
  this.dialogTarget.classList.add("hidden");
}</code></pre>
<p>メソッドを分けておくと、次のステップで「Escapeキーでも閉じる」「背景クリックでも閉じる」のように閉じる手段を増やすとき、HTMLに<code>data-action</code>を1つ追加して同じ<code>close</code>を呼ぶだけで済みます。閉じる処理が1か所に集まっているので、挙動の食い違いも起きません。「操作の意味ごとにメソッドを分ける」のは第2章から続く整理術の応用です。</p>`,
      task: `「モーダルを開く」ボタンでダイアログが表示され、「閉じる」ボタンで非表示になるように、openとcloseの2つのメソッドを実装してください。`,
      code: `<style>
.hidden { display: none; }
#dialog { border: 1px solid #999; padding: 12px; background: #f8fafc; }
</style>

<div data-controller="modal">
  <button id="open" data-action="click->modal#open">モーダルを開く</button>
  <div id="dialog" data-modal-target="dialog" class="hidden">
    <p>ここがモーダルの内容です。</p>
    <button id="close" data-action="click->modal#close">閉じる</button>
  </div>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("modal", class extends Controller {
  static targets = ["dialog"];
  open() {
    // TODO: dialogTargetからhiddenクラスを外す
  }
  close() {
    // TODO: dialogTargetにhiddenクラスを付ける
  }
});
<\/script>`,
      solution: `<style>
.hidden { display: none; }
#dialog { border: 1px solid #999; padding: 12px; background: #f8fafc; }
</style>

<div data-controller="modal">
  <button id="open" data-action="click->modal#open">モーダルを開く</button>
  <div id="dialog" data-modal-target="dialog" class="hidden">
    <p>ここがモーダルの内容です。</p>
    <button id="close" data-action="click->modal#close">閉じる</button>
  </div>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("modal", class extends Controller {
  static targets = ["dialog"];
  open() {
    this.dialogTarget.classList.remove("hidden");
  }
  close() {
    this.dialogTarget.classList.add("hidden");
  }
});
<\/script>`,
      hints: [
        `開くときはclassList.remove("hidden")、閉じるときはclassList.add("hidden")です`,
        `toggleではなくremoveとaddを使い分けると、何度押しても正しい状態になります`
      ],
      check: `assert($("#dialog").classList.contains("hidden"), "最初はダイアログが非表示（hiddenクラス付き）のはずです");
click("#open");
await sleep(50);
assert(!$("#dialog").classList.contains("hidden"), "「モーダルを開く」を押すとダイアログが表示されるはずです");
click("#close");
await sleep(50);
assert($("#dialog").classList.contains("hidden"), "「閉じる」を押すとダイアログが非表示に戻るはずです");`
    },
    {
      id: 145,
      title: "escキーでモーダルを閉じる（keydown.esc@document）",
      explanation: `<p>使いやすいモーダルは、Escapeキーでも閉じられます。第5章で学んだ2つの仕組みを組み合わせるだけで実現できます。</p>
<ul>
<li><strong>キー修飾子</strong>：<code>keydown.esc</code>のように書くと、特定のキーのときだけメソッドが呼ばれる</li>
<li><strong>@document</strong>：<code>イベント名@document</code>と書くと、コントローラの要素ではなくdocument全体でイベントを待ち受ける</li>
</ul>
<p>キー入力はフォーカスされている要素で発生します。モーダル内のボタンにフォーカスがあるとは限らないので、コントローラの要素上でkeydownを待っても拾えないことがあります。そこで<code>@document</code>を付けて、ページ上のどこでキーが押されてもdocumentまでバブリングしてきたイベントを受け取るのです。</p>
<pre><code>&lt;div data-controller="modal"
     data-action="keydown.esc@document-&gt;modal#close"&gt;</code></pre>
<p>前のステップで閉じる処理を<code>close()</code>という独立したメソッドにしておいたおかげで、JavaScriptは1行も変えずにHTMLへ<code>data-action</code>を1つ足すだけで済みます。「閉じる手段が増えても呼ぶメソッドは同じ」という設計の効果をここで体感してください。</p>`,
      task: `ルートのdiv要素にdata-actionを追加して、Escapeキーを押したらモーダルが閉じるようにしてください。JavaScriptは変更不要です。`,
      code: `<style>
.hidden { display: none; }
#dialog { border: 1px solid #999; padding: 12px; background: #f8fafc; }
</style>

<!-- TODO: 下のdivに、documentでkeydown.escを待ち受けてcloseを呼ぶdata-actionを追加する -->
<div data-controller="modal">
  <button id="open" data-action="click->modal#open">モーダルを開く</button>
  <div id="dialog" data-modal-target="dialog" class="hidden">
    <p>Escapeキーでも閉じられるモーダルです。</p>
    <button id="close" data-action="click->modal#close">閉じる</button>
  </div>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("modal", class extends Controller {
  static targets = ["dialog"];
  open() {
    this.dialogTarget.classList.remove("hidden");
  }
  close() {
    this.dialogTarget.classList.add("hidden");
  }
});
<\/script>`,
      solution: `<style>
.hidden { display: none; }
#dialog { border: 1px solid #999; padding: 12px; background: #f8fafc; }
</style>

<div data-controller="modal" data-action="keydown.esc@document->modal#close">
  <button id="open" data-action="click->modal#open">モーダルを開く</button>
  <div id="dialog" data-modal-target="dialog" class="hidden">
    <p>Escapeキーでも閉じられるモーダルです。</p>
    <button id="close" data-action="click->modal#close">閉じる</button>
  </div>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("modal", class extends Controller {
  static targets = ["dialog"];
  open() {
    this.dialogTarget.classList.remove("hidden");
  }
  close() {
    this.dialogTarget.classList.add("hidden");
  }
});
<\/script>`,
      hints: [
        `書式は「イベント名.キー@場所->コントローラ名#メソッド名」です`,
        `data-action="keydown.esc@document->modal#close" をdata-controllerと同じdivに追加します`
      ],
      check: `click("#open");
await sleep(50);
assert(!$("#dialog").classList.contains("hidden"), "「モーダルを開く」を押すとダイアログが表示されるはずです");
keydown("body", "Escape");
await sleep(50);
assert($("#dialog").classList.contains("hidden"), "Escapeキーを押すとモーダルが閉じるはずです。keydown.esc@documentのdata-actionを追加しましたか？");`
    },
    {
      id: 146,
      title: "ドロップダウン（外側クリックで閉じる：click@window）",
      explanation: `<p>ドロップダウンメニューは「ボタンで開閉し、メニューの外側をクリックすると閉じる」UIです。「外側のクリック」は自分の要素の外で起きるイベントなので、通常のアクションでは拾えません。そこで<code>click@window</code>を使い、ページ上のどこかでクリックが起きたら閉じるようにします。</p>
<pre><code>&lt;div data-controller="dropdown"
     data-action="click@window-&gt;dropdown#hide"&gt;
  &lt;button data-action="click-&gt;dropdown#toggle:stop"&gt;メニュー&lt;/button&gt;
  ...</code></pre>
<p>ここで重要なのがボタン側の<code>:stop</code>修飾子（第5章）です。もし付けないと、ボタンのクリックもバブリングしてwindowまで届くため、<code>toggle</code>で開いた直後に<code>hide</code>が実行されて、メニューが一瞬も開かないことになります。<code>:stop</code>は<code>event.stopPropagation()</code>を呼んでバブリングを止めるので、ボタンのクリックはwindowに届かず、外側のクリックだけが<code>hide</code>を発動させます。</p>
<table>
<tr><th>クリック場所</th><th>toggle</th><th>hide</th></tr>
<tr><td>メニューボタン</td><td>実行される</td><td>:stopにより実行されない</td></tr>
<tr><td>それ以外の場所</td><td>実行されない</td><td>実行される</td></tr>
</table>`,
      task: `ルートのdivにdata-actionを追加して、メニューの外側をクリックしたらメニューが閉じるようにしてください。`,
      code: `<style>.hidden { display: none; }</style>

<!-- TODO: 下のdivに、windowのclickでhideを呼ぶdata-actionを追加する -->
<div data-controller="dropdown">
  <button id="menu-button" data-action="click->dropdown#toggle:stop">メニュー</button>
  <ul id="menu" data-dropdown-target="menu" class="hidden">
    <li>プロフィール</li>
    <li>設定</li>
    <li>ログアウト</li>
  </ul>
</div>
<p id="outside">ここはメニューの外側です。</p>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("dropdown", class extends Controller {
  static targets = ["menu"];
  toggle() {
    this.menuTarget.classList.toggle("hidden");
  }
  hide() {
    this.menuTarget.classList.add("hidden");
  }
});
<\/script>`,
      solution: `<style>.hidden { display: none; }</style>

<div data-controller="dropdown" data-action="click@window->dropdown#hide">
  <button id="menu-button" data-action="click->dropdown#toggle:stop">メニュー</button>
  <ul id="menu" data-dropdown-target="menu" class="hidden">
    <li>プロフィール</li>
    <li>設定</li>
    <li>ログアウト</li>
  </ul>
</div>
<p id="outside">ここはメニューの外側です。</p>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("dropdown", class extends Controller {
  static targets = ["menu"];
  toggle() {
    this.menuTarget.classList.toggle("hidden");
  }
  hide() {
    this.menuTarget.classList.add("hidden");
  }
});
<\/script>`,
      hints: [
        `data-action="click@window->dropdown#hide" をdata-controllerのdivに追加します`,
        `ボタン側の:stopがあるおかげで、ボタン自身のクリックではhideが呼ばれません`
      ],
      check: `click("#menu-button");
await sleep(50);
assert(!$("#menu").classList.contains("hidden"), "メニューボタンをクリックするとメニューが開くはずです（ボタンの:stopは残っていますか？）");
click("#outside");
await sleep(50);
assert($("#menu").classList.contains("hidden"), "メニューの外側をクリックするとメニューが閉じるはずです。click@windowのdata-actionを追加しましたか？");`
    },
    {
      id: 147,
      title: "ツールチップ（mouseenter/mouseleave）",
      explanation: `<p>ツールチップは、マウスを乗せたときだけ補足説明を表示するUIです。ここでは2つの新しいイベントを使います。</p>
<table>
<tr><th>イベント</th><th>発生タイミング</th></tr>
<tr><td><code>mouseenter</code></td><td>マウスポインタが要素の上に入ったとき</td></tr>
<tr><td><code>mouseleave</code></td><td>マウスポインタが要素の外に出たとき</td></tr>
</table>
<p>第3章で学んだ通り、buttonの<code>data-action</code>ではイベント名を省略するとclickになります。今回はマウスの出入りに反応したいので、イベント名を明示します。1つの要素に2つのアクションを書くのは第3章のステップ29でやった通り、スペース区切りです。</p>
<pre><code>&lt;span data-action="mouseenter-&gt;tooltip#show
                   mouseleave-&gt;tooltip#hide"&gt;
  専門用語
&lt;/span&gt;</code></pre>
<p>なお、似たイベントにmouseover/mouseoutがありますが、こちらは子要素との間の移動でも発生してしまうため、ツールチップにはmouseenter/mouseleaveが向いています（この2つは要素の内側での移動では再発生しません。またバブリングしません）。表示・非表示の処理自体はこれまでと同じhiddenクラスの付け外しです。</p>`,
      task: `「専門用語」にマウスが乗ったら説明が表示され、離れたら消えるように、showとhideを実装してください。`,
      code: `<style>
.hidden { display: none; }
#tip { background: #333; color: #fff; padding: 2px 8px; border-radius: 4px; }
</style>

<div data-controller="tooltip">
  <span id="trigger" data-action="mouseenter->tooltip#show mouseleave->tooltip#hide">専門用語</span>
  <span id="tip" data-tooltip-target="tip" class="hidden">マウスを乗せると出る説明です</span>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("tooltip", class extends Controller {
  static targets = ["tip"];
  show() {
    // TODO: tipTargetからhiddenを外す
  }
  hide() {
    // TODO: tipTargetにhiddenを付ける
  }
});
<\/script>`,
      solution: `<style>
.hidden { display: none; }
#tip { background: #333; color: #fff; padding: 2px 8px; border-radius: 4px; }
</style>

<div data-controller="tooltip">
  <span id="trigger" data-action="mouseenter->tooltip#show mouseleave->tooltip#hide">専門用語</span>
  <span id="tip" data-tooltip-target="tip" class="hidden">マウスを乗せると出る説明です</span>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("tooltip", class extends Controller {
  static targets = ["tip"];
  show() {
    this.tipTarget.classList.remove("hidden");
  }
  hide() {
    this.tipTarget.classList.add("hidden");
  }
});
<\/script>`,
      hints: [
        `モーダルのopen/closeと同じで、remove("hidden")とadd("hidden")の使い分けです`,
        `判定ではmouseenter/mouseleaveイベントを擬似的に発生させて確認しています`
      ],
      check: `assert($("#tip").classList.contains("hidden"), "最初はツールチップが非表示のはずです");
$("#trigger").dispatchEvent(new Event("mouseenter"));
await sleep(50);
assert(!$("#tip").classList.contains("hidden"), "マウスが乗ったらツールチップが表示されるはずです");
$("#trigger").dispatchEvent(new Event("mouseleave"));
await sleep(50);
assert($("#tip").classList.contains("hidden"), "マウスが離れたらツールチップが消えるはずです");`
    },
    {
      id: 148,
      title: "「もっと見る」（一部を隠して展開）",
      explanation: `<p>長い文章の続きを隠しておき、「もっと見る」で展開するUIです。単なるトグルとの違いは、<strong>ボタンの文言も状態に合わせて変える</strong>ことです。展開中は「閉じる」、折りたたみ中は「もっと見る」と表示することで、次に何が起きるかをユーザーに伝えます。</p>
<p>ここで便利なのが<code>classList.toggle()</code>の戻り値です。toggleは操作した結果クラスが「付いた」ならtrue、「外れた」ならfalseを返します。戻り値を変数に受ければ、切り替え後の状態を自分で調べ直す必要がありません。</p>
<pre><code>toggle() {
  const nowHidden = this.contentTarget.classList.toggle("hidden");
  if (nowHidden) {
    this.buttonTarget.textContent = "もっと見る";
  } else {
    this.buttonTarget.textContent = "閉じる";
  }
}</code></pre>
<p>「表示状態」と「ボタンの文言」という2つのUIを、1回のクリックで矛盾なく同時に更新するのがこのステップの練習ポイントです。片方だけ更新して文言と実際の状態がずれるのは、実務でもよくあるバグです。</p>`,
      task: `ボタンをクリックすると続きの文章が展開され、ボタンの文言が「閉じる」に変わるように（もう一度押すと元に戻るように）TODOを埋めてください。`,
      code: `<style>.hidden { display: none; }</style>

<div data-controller="more">
  <p>ここは最初から見えている要約文です。</p>
  <p id="detail" data-more-target="content" class="hidden">ここが隠れていた続きの文章です。詳しい説明が書かれています。</p>
  <button id="more-button" data-more-target="button" data-action="click->more#toggle">もっと見る</button>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("more", class extends Controller {
  static targets = ["content", "button"];
  toggle() {
    this.contentTarget.classList.toggle("hidden");
    // TODO: toggleの戻り値を使って、隠れているときはボタンを「もっと見る」、
    // 表示中は「閉じる」に書き換える
  }
});
<\/script>`,
      solution: `<style>.hidden { display: none; }</style>

<div data-controller="more">
  <p>ここは最初から見えている要約文です。</p>
  <p id="detail" data-more-target="content" class="hidden">ここが隠れていた続きの文章です。詳しい説明が書かれています。</p>
  <button id="more-button" data-more-target="button" data-action="click->more#toggle">もっと見る</button>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("more", class extends Controller {
  static targets = ["content", "button"];
  toggle() {
    const nowHidden = this.contentTarget.classList.toggle("hidden");
    if (nowHidden) {
      this.buttonTarget.textContent = "もっと見る";
    } else {
      this.buttonTarget.textContent = "閉じる";
    }
  }
});
<\/script>`,
      hints: [
        `const nowHidden = this.contentTarget.classList.toggle("hidden"); で切り替え後の状態が取れます`,
        `nowHiddenがtrueなら「もっと見る」、falseなら「閉じる」をbuttonTarget.textContentに設定します`
      ],
      check: `assert($("#detail").classList.contains("hidden"), "最初は続きの文章が隠れているはずです");
assert(text("#more-button") === "もっと見る", "最初のボタンの文言は「もっと見る」のはずです");
click("#more-button");
await sleep(50);
assert(!$("#detail").classList.contains("hidden"), "クリックすると続きの文章が表示されるはずです");
assert(text("#more-button") === "閉じる", "展開中はボタンの文言が「閉じる」に変わるはずです");
click("#more-button");
await sleep(50);
assert($("#detail").classList.contains("hidden"), "もう一度押すと続きの文章が隠れるはずです");
assert(text("#more-button") === "もっと見る", "折りたたんだらボタンの文言が「もっと見る」に戻るはずです");`
    },
    {
      id: 149,
      title: "プログレスバー（widthのstyle操作）",
      explanation: `<p>進捗を帯の長さで表すプログレスバーを作ります。これまでの表示制御はクラスの付け外しでしたが、「30%の幅」のような連続的な値はクラスでは表現しきれません。そこで要素の<code>style</code>プロパティを直接操作します。</p>
<pre><code>this.barTarget.style.width = this.percentValue + "%";</code></pre>
<p><code>style.width</code>には<code>"30%"</code>のような単位付きの文字列を設定します。数値と<code>"%"</code>を+で連結する点に注意してください。</p>
<p>進捗の数値は第6章・第7章で学んだvaluesで管理するのが定石です。<code>percentValue</code>を書き換えるだけで<code>percentValueChanged</code>が呼ばれ、バーの幅とラベルが自動で更新されます。valueChangedは接続直後にも呼ばれるので、HTMLに書いた初期値<code>data-progress-percent-value="30"</code>がそのまま初期表示になります。</p>
<pre><code>increase() {
  this.percentValue = Math.min(100, this.percentValue + 10);
}</code></pre>
<p><code>Math.min(100, ...)</code>は「2つのうち小さい方」を返す関数で、進捗が100%を超えないように上限を設ける定番の書き方です。</p>`,
      task: `percentValueChangedの中でバーの幅を「percentValue + "%"」に設定し、+10ボタンで進捗が増える（ただし100を超えない）ようにしてください。`,
      code: `<div data-controller="progress" data-progress-percent-value="30">
  <div style="background: #e5e7eb; width: 200px;">
    <div id="bar" data-progress-target="bar" style="background: #3b82f6; height: 16px; width: 0;"></div>
  </div>
  <p id="label" data-progress-target="label"></p>
  <button id="plus" data-action="click->progress#increase">+10</button>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("progress", class extends Controller {
  static targets = ["bar", "label"];
  static values = { percent: Number };
  percentValueChanged() {
    this.labelTarget.textContent = this.percentValue + "%";
    // TODO: barTargetのstyle.widthをpercentValueに応じた「〜%」の文字列にする
  }
  increase() {
    // TODO: percentValueを10増やす（Math.minで100を上限にする）
  }
});
<\/script>`,
      solution: `<div data-controller="progress" data-progress-percent-value="30">
  <div style="background: #e5e7eb; width: 200px;">
    <div id="bar" data-progress-target="bar" style="background: #3b82f6; height: 16px; width: 0;"></div>
  </div>
  <p id="label" data-progress-target="label"></p>
  <button id="plus" data-action="click->progress#increase">+10</button>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("progress", class extends Controller {
  static targets = ["bar", "label"];
  static values = { percent: Number };
  percentValueChanged() {
    this.labelTarget.textContent = this.percentValue + "%";
    this.barTarget.style.width = this.percentValue + "%";
  }
  increase() {
    this.percentValue = Math.min(100, this.percentValue + 10);
  }
});
<\/script>`,
      hints: [
        `this.barTarget.style.width = this.percentValue + "%"; のように単位付き文字列を設定します`,
        `this.percentValue = Math.min(100, this.percentValue + 10); で上限付きの加算になります`
      ],
      check: `assert($("#bar").style.width === "30%", "初期値30に合わせて、最初からバーの幅が30%になっているはずです（percentValueChangedは接続時にも呼ばれます）");
assert(text("#label") === "30%", "ラベルには「30%」と表示されているはずです");
click("#plus");
await sleep(50);
assert($("#bar").style.width === "40%", "+10を押すとバーの幅が40%になるはずです");
assert(text("#label") === "40%", "+10を押すとラベルが「40%」になるはずです");
for (let i = 0; i < 10; i++) {
  click("#plus");
  await sleep(20);
}
assert($("#bar").style.width === "100%", "何度押しても100%を超えないはずです（Math.minを使っていますか？）");`
    },
    {
      id: 150,
      title: "総合演習（設定パネルUI）",
      explanation: `<p>この章の総仕上げとして、設定パネルUIを作ります。使うのはすべてこの章で学んだパターンです。</p>
<ul>
<li><strong>モーダルの開閉</strong>（ステップ144）：openでパネルを表示、closeで非表示</li>
<li><strong>Escapeキーで閉じる</strong>（ステップ145）：<code>keydown.esc@document</code>でcloseを呼ぶ（HTMLに設定済み）</li>
<li><strong>タブ切り替え</strong>（ステップ142〜143）：「表示」「通知」のセクションをパラメータ＋forEachで排他表示</li>
</ul>
<p>複数のパターンを組み合わせるときも、1つ1つのメソッドは今まで書いてきたものと同じです。むしろ大事なのは役割の整理で、このコントローラは次の3つのメソッドだけでできています。</p>
<table>
<tr><th>メソッド</th><th>役割</th><th>呼び出し元</th></tr>
<tr><td><code>open</code></td><td>パネルを表示</td><td>「設定を開く」ボタン</td></tr>
<tr><td><code>close</code></td><td>パネルを非表示</td><td>「閉じる」ボタンとEscapeキー</td></tr>
<tr><td><code>show</code></td><td>セクションの排他表示</td><td>2つのタブボタン</td></tr>
</table>
<p>closeが2か所から呼ばれている点に注目してください。閉じる処理を1つのメソッドにまとめたことで、閉じ方が何通りあっても動きは常に同じになります。</p>`,
      task: `closeメソッドと、showメソッドの排他表示を完成させてください。パネルの開閉・Escapeキー・タブ切り替えがすべて動けば合格です。`,
      code: `<style>
.hidden { display: none; }
#panel { border: 1px solid #999; padding: 12px; background: #f8fafc; }
</style>

<div data-controller="settings" data-action="keydown.esc@document->settings#close">
  <button id="open" data-action="click->settings#open">設定を開く</button>
  <div id="panel" data-settings-target="panel" class="hidden">
    <button id="tab-0" data-action="click->settings#show" data-settings-index-param="0">表示</button>
    <button id="tab-1" data-action="click->settings#show" data-settings-index-param="1">通知</button>
    <section id="section-0" data-settings-target="section">表示に関する設定です。</section>
    <section id="section-1" data-settings-target="section" class="hidden">通知に関する設定です。</section>
    <button id="close" data-action="click->settings#close">閉じる</button>
  </div>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("settings", class extends Controller {
  static targets = ["panel", "section"];
  open() {
    this.panelTarget.classList.remove("hidden");
  }
  close() {
    // TODO: panelTargetにhiddenを付けて閉じる
  }
  show(event) {
    const index = event.params.index;
    // TODO: sectionTargetsをforEachで回し、indexのセクションだけ表示して
    // 他にはhiddenを付ける（常に1つだけ表示）
    this.sectionTargets[index].classList.remove("hidden");
  }
});
<\/script>`,
      solution: `<style>
.hidden { display: none; }
#panel { border: 1px solid #999; padding: 12px; background: #f8fafc; }
</style>

<div data-controller="settings" data-action="keydown.esc@document->settings#close">
  <button id="open" data-action="click->settings#open">設定を開く</button>
  <div id="panel" data-settings-target="panel" class="hidden">
    <button id="tab-0" data-action="click->settings#show" data-settings-index-param="0">表示</button>
    <button id="tab-1" data-action="click->settings#show" data-settings-index-param="1">通知</button>
    <section id="section-0" data-settings-target="section">表示に関する設定です。</section>
    <section id="section-1" data-settings-target="section" class="hidden">通知に関する設定です。</section>
    <button id="close" data-action="click->settings#close">閉じる</button>
  </div>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("settings", class extends Controller {
  static targets = ["panel", "section"];
  open() {
    this.panelTarget.classList.remove("hidden");
  }
  close() {
    this.panelTarget.classList.add("hidden");
  }
  show(event) {
    const index = event.params.index;
    this.sectionTargets.forEach((section, i) => {
      section.classList.toggle("hidden", i !== index);
    });
  }
});
<\/script>`,
      hints: [
        `closeはモーダル（ステップ144）と同じで、classList.add("hidden")の1行です`,
        `showはアコーディオン（ステップ142）と同じで、forEachとtoggleの第2引数（i !== index）を使います`
      ],
      check: `assert($("#panel").classList.contains("hidden"), "最初は設定パネルが非表示のはずです");
click("#open");
await sleep(50);
assert(!$("#panel").classList.contains("hidden"), "「設定を開く」でパネルが表示されるはずです");
click("#tab-1");
await sleep(50);
assert(!$("#section-1").classList.contains("hidden"), "「通知」タブを押すと通知セクションが表示されるはずです");
assert($("#section-0").classList.contains("hidden"), "「通知」タブを押したら表示セクションは隠れるはずです（常に1つだけ表示）");
click("#close");
await sleep(50);
assert($("#panel").classList.contains("hidden"), "「閉じる」ボタンでパネルが閉じるはずです");
click("#open");
await sleep(50);
keydown("body", "Escape");
await sleep(50);
assert($("#panel").classList.contains("hidden"), "Escapeキーでもパネルが閉じるはずです");`
    }
  ]
});
