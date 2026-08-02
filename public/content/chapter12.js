// 第12章：アウトレット
registerChapter({
  number: 12,
  title: "アウトレット",
  description: "static outletsで他のコントローラのインスタンスを直接参照し、メソッド呼び出しで連携する方法を学びます。",
  steps: [
    {
      id: 111,
      title: "static outletsとdata-x-y-outlet",
      explanation: `<p>アウトレットは、あるコントローラから<strong>別のコントローラのインスタンスを直接参照する</strong>ための仕組みです。前章のイベントディスパッチが「不特定多数への放送」だとすれば、アウトレットは「相手を指名した直通電話」です。</p>
<p>使い方は3点セットです。</p>
<ol>
<li>自分のコントローラに<code>static outlets = ["status"]</code>と宣言する。配列に書くのは<strong>相手のコントローラ名</strong></li>
<li>自分の要素に<code>data-panel-status-outlet="#status"</code>のような属性を書く。属性名の規則は<strong>data-自分のコントローラ名-相手のコントローラ名-outlet</strong>で、値は相手の要素を指す<strong>CSSセレクタ</strong></li>
<li>相手の要素はそのセレクタに一致し、かつ<code>data-controller="status"</code>を持っている必要がある</li>
</ol>
<pre><code>&lt;div data-controller="panel" data-panel-status-outlet="#status"&gt;...&lt;/div&gt;
&lt;div id="status" data-controller="status"&gt;...&lt;/div&gt;</code></pre>
<p>宣言すると次のプロパティが使えます。相手の名前がケバブケース（例：result-list）の場合は、this.resultListOutletのようにキャメルケースへ変換されます。</p>
<table>
<tr><th>プロパティ</th><th>内容</th></tr>
<tr><td><code>this.statusOutlet</code></td><td>相手コントローラのインスタンス</td></tr>
<tr><td><code>this.statusOutlets</code></td><td>一致した全インスタンスの配列</td></tr>
<tr><td><code>this.statusOutletElement</code></td><td>相手の要素（HTML要素）</td></tr>
<tr><td><code>this.hasStatusOutlet</code></td><td>相手が存在するかどうか</td></tr>
</table>
<p>このステップではまずthis.statusOutletElementで相手の要素に触れて、接続できたことを確認します。</p>`,
      task: `panelの要素にアウトレット属性data-panel-status-outlet="#status"を追加して、ボタンで接続確認ができるようにしてください。`,
      code: `<!-- TODO: data-controller="panel"のdivに data-panel-status-outlet="#status" を追加する -->
<div data-controller="panel">
  <button data-action="panel#ping">接続を確認</button>
</div>

<div id="status" data-controller="status">未接続</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("status", class extends Controller {
});

application.register("panel", class extends Controller {
  static outlets = ["status"];
  ping() {
    this.statusOutletElement.textContent = "接続OK";
  }
});
<\/script>`,
      solution: `<div data-controller="panel" data-panel-status-outlet="#status">
  <button data-action="panel#ping">接続を確認</button>
</div>

<div id="status" data-controller="status">未接続</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("status", class extends Controller {
});

application.register("panel", class extends Controller {
  static outlets = ["status"];
  ping() {
    this.statusOutletElement.textContent = "接続OK";
  }
});
<\/script>`,
      hints: [`属性名は「data-自分のコントローラ名-相手のコントローラ名-outlet」です。自分はpanel、相手はstatusです`, `属性の値はCSSセレクタなので、id指定なら「#status」と書きます`],
      check: `assert($("[data-controller=panel]"), "data-controller=panelの要素が必要です");
click("button");
await sleep(50);
assert(text("#status") === "接続OK", "ボタンを押すと#statusが「接続OK」になるはずです。panelのdivにdata-panel-status-outlet=\\"#status\\"を追加しましたか？");`
    },
    {
      id: 112,
      title: "this.yOutletで相手のメソッドを呼ぶ",
      explanation: `<p>アウトレットの真価は、<code>this.statusOutlet</code>のように<strong>相手コントローラのインスタンスそのもの</strong>を取得できることです。インスタンスが手に入るということは、相手が持つメソッドを直接呼び出せるということです。</p>
<pre><code>// remoteコントローラ側
static outlets = ["lamp"];
turnOn() {
  this.lampOutlet.turnOn();  // lampコントローラのメソッドを呼ぶ
}

// lampコントローラ側
turnOn() {
  this.element.textContent = "点灯中";
}</code></pre>
<p>前章のdispatchとの違いに注目してください。dispatchでは「イベントを発火して、誰かが受け取ってくれるのを待つ」という間接的な連携でした。アウトレットでは「相手を捕まえて、直接お願いする」という直接的な連携になります。</p>
<ul>
<li>呼び出しは通常のメソッド呼び出しなので、<strong>引数も渡せる</strong>し、<strong>戻り値も受け取れる</strong></li>
<li>相手側には受け取るためのdata-actionもaddEventListenerも不要</li>
</ul>
<p>ただし、呼び出す側は「相手にturnOn()というメソッドがある」ことを知っている必要があります。つまりdispatchより結合が強い（お互いをよく知っている）連携です。この強さをどう扱うかは、この章の後半で考えます。</p>`,
      task: `remoteコントローラのturnOn()の中で、this.lampOutletを使ってlampコントローラのturnOn()を呼び出してください。`,
      code: `<div data-controller="remote" data-remote-lamp-outlet="#lamp">
  <button data-action="remote#turnOn">点灯</button>
</div>

<div id="lamp" data-controller="lamp">消灯中</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("lamp", class extends Controller {
  turnOn() {
    this.element.textContent = "点灯中";
  }
});

application.register("remote", class extends Controller {
  static outlets = ["lamp"];
  turnOn() {
    // TODO: lampアウトレットのturnOn()を呼び出す
  }
});
<\/script>`,
      solution: `<div data-controller="remote" data-remote-lamp-outlet="#lamp">
  <button data-action="remote#turnOn">点灯</button>
</div>

<div id="lamp" data-controller="lamp">消灯中</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("lamp", class extends Controller {
  turnOn() {
    this.element.textContent = "点灯中";
  }
});

application.register("remote", class extends Controller {
  static outlets = ["lamp"];
  turnOn() {
    this.lampOutlet.turnOn();
  }
});
<\/script>`,
      hints: [`this.lampOutlet で相手のインスタンスが手に入ります`, `this.lampOutlet.turnOn(); の1行です`],
      check: `click("button");
await sleep(50);
assert(text("#lamp") === "点灯中", "ボタンを押すと#lampが「点灯中」になるはずです。this.lampOutlet.turnOn()を呼びましたか？");`
    },
    {
      id: 113,
      title: "複数アウトレット（yOutlets）",
      explanation: `<p>アウトレット属性の値はCSSセレクタなので、クラスセレクタを使えば<strong>複数の要素に同時に一致</strong>させられます。一致したすべてのコントローラインスタンスは、複数形の<code>this.cardOutlets</code>（配列）で取得できます。</p>
<pre><code>&lt;div data-controller="master" data-master-card-outlet=".card"&gt;...&lt;/div&gt;
&lt;div class="card" data-controller="card"&gt;...&lt;/div&gt;
&lt;div class="card" data-controller="card"&gt;...&lt;/div&gt;</code></pre>
<pre><code>selectAll() {
  this.cardOutlets.forEach(function(card) {
    card.select();  // 各インスタンスのメソッドを順に呼ぶ
  });
}</code></pre>
<p>第4章の複数ターゲット（xxxTargets）とよく似た関係です。</p>
<table>
<tr><th>単数形</th><th>複数形</th></tr>
<tr><td>this.cardOutlet（最初の1つ。無ければエラー）</td><td>this.cardOutlets(全部の配列。無ければ空配列)</td></tr>
<tr><td>this.cardOutletElement</td><td>this.cardOutletElements</td></tr>
</table>
<p>単数形のthis.cardOutletは「一致した中の最初の1つ」を返すことに注意してください。複数あるのに単数形を使うと、先頭にしか作用しないバグになりがちです。「全部に作用させたいのに1つしか反応しない」ときは、単数形と複数形を取り違えていないか確認しましょう。</p>`,
      task: `selectAll()が単数形のthis.cardOutletを使っているため、最初のカードしか選択されません。this.cardOutletsを使ってすべてのカードのselect()を呼んでください。`,
      code: `<div data-controller="master" data-master-card-outlet=".card">
  <button data-action="master#selectAll">すべて選択</button>
</div>

<div class="card" data-controller="card">未選択</div>
<div class="card" data-controller="card">未選択</div>
<div class="card" data-controller="card">未選択</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("card", class extends Controller {
  select() {
    this.element.textContent = "選択中";
  }
});

application.register("master", class extends Controller {
  static outlets = ["card"];
  selectAll() {
    // TODO: this.cardOutletsを使って、すべてのカードのselect()を呼ぶ
    this.cardOutlet.select();
  }
});
<\/script>`,
      solution: `<div data-controller="master" data-master-card-outlet=".card">
  <button data-action="master#selectAll">すべて選択</button>
</div>

<div class="card" data-controller="card">未選択</div>
<div class="card" data-controller="card">未選択</div>
<div class="card" data-controller="card">未選択</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("card", class extends Controller {
  select() {
    this.element.textContent = "選択中";
  }
});

application.register("master", class extends Controller {
  static outlets = ["card"];
  selectAll() {
    this.cardOutlets.forEach(function(card) {
      card.select();
    });
  }
});
<\/script>`,
      hints: [`複数形this.cardOutletsは、一致したすべてのインスタンスの配列です`, `this.cardOutlets.forEach(function(card) { card.select(); }); と書きます`],
      check: `click("button");
await sleep(50);
const cards = $$(".card");
assert(cards.length === 3, "カードの要素は3つあるはずです");
assert(cards[0].textContent.trim() === "選択中", "1つ目のカードが「選択中」になるはずです");
assert(cards[1].textContent.trim() === "選択中", "2つ目のカードも「選択中」になるはずです。単数形のcardOutletでは最初の1つにしか作用しません。複数形cardOutletsを使いましたか？");
assert(cards[2].textContent.trim() === "選択中", "3つ目のカードも「選択中」になるはずです");`
    },
    {
      id: 114,
      title: "hasYOutlet（存在チェック）",
      explanation: `<p>アウトレットの相手が見つからない状態で単数形の<code>this.statusOutlet</code>にアクセスすると、Stimulusは<strong>「Missing outlet element」というエラーを投げます</strong>。エラーが起きるとそのメソッドの残りの処理は実行されず、UIが中途半端な状態になってしまいます。</p>
<p>これを防ぐのが、第4章のhasXxxTargetと同じ発想の<code>this.hasStatusOutlet</code>です。相手が存在すればtrue、しなければfalseを返すだけで、エラーにはなりません。</p>
<pre><code>send() {
  if (this.hasStatusOutlet) {
    this.statusOutlet.show("新着あり");  // 相手がいるときだけ
  }
  this.resultTarget.textContent = "通知処理が完了しました";  // ここは必ず実行される
}</code></pre>
<p>「相手がいない」状況は珍しくありません。</p>
<ul>
<li>同じコントローラを、表示エリアがあるページと無いページの両方で使い回す</li>
<li>相手の要素が後から動的に追加される（まだ存在しない時間帯がある）</li>
</ul>
<p>アウトレットはあくまで「オプションの連携先」と考えて、<strong>単数形アウトレットに触る前にはhasでガードする</strong>癖をつけると、使い回しに強いコントローラになります。なお複数形のthis.statusOutletsは相手がいなくても空配列を返すだけなので、forEachで回す分にはガード不要です。</p>`,
      task: `このページにはstatusコントローラの要素がありません。hasStatusOutletで存在を確認するifガードを追加し、エラーを起こさずに完了メッセージが表示されるようにしてください。`,
      code: `<div data-controller="notifier">
  <button data-action="notifier#send">通知する</button>
  <p data-notifier-target="result"></p>
</div>
<!-- このページにはstatusコントローラの要素が1つもない -->

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("status", class extends Controller {
  show(message) {
    this.element.textContent = message;
  }
});

application.register("notifier", class extends Controller {
  static outlets = ["status"];
  static targets = ["result"];
  send() {
    // TODO: this.hasStatusOutletがtrueのときだけshowを呼ぶようにifで囲む
    this.statusOutlet.show("新着あり");
    this.resultTarget.textContent = "通知処理が完了しました";
  }
});
<\/script>`,
      solution: `<div data-controller="notifier">
  <button data-action="notifier#send">通知する</button>
  <p data-notifier-target="result"></p>
</div>
<!-- このページにはstatusコントローラの要素が1つもない -->

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("status", class extends Controller {
  show(message) {
    this.element.textContent = message;
  }
});

application.register("notifier", class extends Controller {
  static outlets = ["status"];
  static targets = ["result"];
  send() {
    if (this.hasStatusOutlet) {
      this.statusOutlet.show("新着あり");
    }
    this.resultTarget.textContent = "通知処理が完了しました";
  }
});
<\/script>`,
      hints: [`if (this.hasStatusOutlet) { ... } でアウトレットの利用部分だけを囲みます`, `相手がいないままthis.statusOutletに触るとエラーになり、後続の行が実行されません`],
      check: `click("button");
await sleep(50);
assert(text("[data-notifier-target=result]") === "通知処理が完了しました", "相手がいなくてもエラーにならず、「通知処理が完了しました」と表示されるはずです。hasStatusOutletのifガードを追加しましたか？");`
    },
    {
      id: 115,
      title: "outletConnected・outletDisconnected",
      explanation: `<p>アウトレットの相手は、ページの読み込み時だけでなく<strong>あとから現れたり消えたりする</strong>ことがあります。その瞬間を捕まえるのが、次の2つのコールバックです（第9章のtargetConnected/targetDisconnectedのアウトレット版です）。</p>
<pre><code>// メソッド名は「アウトレット名+OutletConnected/OutletDisconnected」
sensorOutletConnected(outlet, element) {
  // 相手が接続された瞬間に呼ばれる
}
sensorOutletDisconnected(outlet, element) {
  // 相手が切断（削除など）された瞬間に呼ばれる
}</code></pre>
<p>引数は2つで、<code>outlet</code>が相手のコントローラインスタンス、<code>element</code>が相手の要素です。ページ読み込み時にすでに相手が存在する場合も、接続時にoutletConnectedが1回呼ばれます。</p>
<table>
<tr><th>タイミング</th><th>呼ばれるもの</th></tr>
<tr><td>相手の要素が現れた・条件を満たした</td><td>xxxOutletConnected</td></tr>
<tr><td>相手の要素が削除された・条件を外れた</td><td>xxxOutletDisconnected</td></tr>
</table>
<p>典型的な用途は、「相手が来たら初期データを渡す」「相手がいなくなったら表示を待機状態に戻す」といった、接続状態に応じたUIの同期です。Stimulusが裏でDOMの変化を監視してくれるので、自分でMutationObserverを書く必要はありません。</p>`,
      task: `sensorOutletDisconnectedコールバックを定義して、センサーが取り外されたときにlogターゲットへ「切断: センサーA」と表示されるようにしてください。`,
      code: `<div data-controller="monitor" data-monitor-sensor-outlet=".sensor">
  <p data-monitor-target="log">待機中</p>
</div>
<div class="sensor" data-controller="sensor">センサーA</div>
<button id="remove-btn">センサーを取り外す</button>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("sensor", class extends Controller {
});

application.register("monitor", class extends Controller {
  static outlets = ["sensor"];
  static targets = ["log"];
  sensorOutletConnected(outlet, element) {
    this.logTarget.textContent = "接続: " + element.textContent;
  }
  // TODO: sensorOutletDisconnected(outlet, element)を定義して
  // logターゲットに「切断: 」+ element.textContent と表示する
});

document.querySelector("#remove-btn").addEventListener("click", function() {
  document.querySelector(".sensor").remove();
});
<\/script>`,
      solution: `<div data-controller="monitor" data-monitor-sensor-outlet=".sensor">
  <p data-monitor-target="log">待機中</p>
</div>
<div class="sensor" data-controller="sensor">センサーA</div>
<button id="remove-btn">センサーを取り外す</button>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("sensor", class extends Controller {
});

application.register("monitor", class extends Controller {
  static outlets = ["sensor"];
  static targets = ["log"];
  sensorOutletConnected(outlet, element) {
    this.logTarget.textContent = "接続: " + element.textContent;
  }
  sensorOutletDisconnected(outlet, element) {
    this.logTarget.textContent = "切断: " + element.textContent;
  }
});

document.querySelector("#remove-btn").addEventListener("click", function() {
  document.querySelector(".sensor").remove();
});
<\/script>`,
      hints: [`メソッド名は「sensorOutletDisconnected」です（アウトレット名sensor+OutletDisconnected）`, `第2引数elementは削除された相手の要素なので、element.textContentで「センサーA」が取れます`],
      check: `assert(text("[data-monitor-target=log]") === "接続: センサーA", "読み込み直後はoutletConnectedにより「接続: センサーA」と表示されているはずです");
click("#remove-btn");
await sleep(100);
assert(text("[data-monitor-target=log]") === "切断: センサーA", "センサーを取り外すと「切断: センサーA」と表示されるはずです。sensorOutletDisconnectedを定義しましたか？");`
    },
    {
      id: 116,
      title: "アウトレットとdispatchの使い分け",
      explanation: `<p>コントローラ間の連携手段が2つそろいました。どちらを使うべきかは、<strong>「知らせたい」のか「操作したい」のか</strong>で判断します。</p>
<table>
<tr><th>観点</th><th>dispatch（イベント）</th><th>アウトレット</th></tr>
<tr><td>向き</td><td>発火側は相手を知らない</td><td>呼ぶ側が相手を指名する</td></tr>
<tr><td>相手の数</td><td>0人でも大勢でもよい</td><td>セレクタで決めた相手だけ</td></tr>
<tr><td>できること</td><td>通知とdetailの受け渡し</td><td>メソッド呼び出し（引数・戻り値あり）</td></tr>
<tr><td>結合度</td><td>弱い（疎結合）</td><td>比較的強い</td></tr>
<tr><td>向く場面</td><td>「追加されたよ」と知らせる</td><td>「この内容で表示を更新して」と頼む</td></tr>
</table>
<p>目安は次のとおりです。</p>
<ul>
<li><strong>dispatch</strong>：出来事の通知。受け手が何人いても、いなくてもよい。ヘッダーのバッジ更新やトースト通知など</li>
<li><strong>アウトレット</strong>：特定の相手への指示。エディタが決まったプレビュー画面を更新する、リモコンが特定のランプを点ける、など相手が明確な場合</li>
</ul>
<p>今回の課題は「エディタの入力を、決まったプレビューに反映する」というケースです。相手は1つに決まっていて、値を渡して更新を頼みたいので、アウトレットが自然な選択になります。逆に「入力が変わったことを誰かに知らせたいだけ」ならdispatchが合います。</p>`,
      task: `editorコントローラのupdate()で、previewアウトレットのrender()に入力値（event.target.value）を渡して呼び出してください。`,
      code: `<div data-controller="editor" data-editor-preview-outlet="#preview">
  <input data-action="input->editor#update" placeholder="ここに入力">
</div>

<div id="preview" data-controller="preview">
  <p data-preview-target="output">ここにプレビューが表示されます</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("preview", class extends Controller {
  static targets = ["output"];
  render(content) {
    this.outputTarget.textContent = content;
  }
});

application.register("editor", class extends Controller {
  static outlets = ["preview"];
  update(event) {
    // TODO: previewアウトレットのrender()に入力値を渡す
  }
});
<\/script>`,
      solution: `<div data-controller="editor" data-editor-preview-outlet="#preview">
  <input data-action="input->editor#update" placeholder="ここに入力">
</div>

<div id="preview" data-controller="preview">
  <p data-preview-target="output">ここにプレビューが表示されます</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("preview", class extends Controller {
  static targets = ["output"];
  render(content) {
    this.outputTarget.textContent = content;
  }
});

application.register("editor", class extends Controller {
  static outlets = ["preview"];
  update(event) {
    this.previewOutlet.render(event.target.value);
  }
});
<\/script>`,
      hints: [`this.previewOutlet.render(event.target.value); と書きます`, `アウトレットのメソッド呼び出しは普通の関数と同じように引数を渡せます`],
      check: `setValue("input", "こんにちは");
await sleep(50);
assert(text("[data-preview-target=output]") === "こんにちは", "入力すると即座にプレビューへ反映されるはずです。this.previewOutlet.render(event.target.value)を呼びましたか？");`
    },
    {
      id: 117,
      title: "相手のtargetに直接触らない（カプセル化）",
      explanation: `<p>アウトレットで相手のインスタンスが手に入ると、実は相手の<strong>ターゲットにも触れてしまいます</strong>。次のコードは動きますが、良くない書き方です。</p>
<pre><code>// 悪い例：相手の内部（ターゲット）に直接手を突っ込む
send() {
  this.displayOutlet.outputTarget.textContent = "こんにちは";
}</code></pre>
<p>何が問題なのでしょうか。displayコントローラが将来「outputターゲットをやめてmessageターゲットに変える」「表示前に加工処理を挟む」といった変更をすると、<strong>外から触っていたremote側も壊れます</strong>。相手の内部構造に依存した分だけ、変更に弱くなるのです。</p>
<p>そこで、相手には<strong>公開メソッドという窓口</strong>を用意し、外からはそれだけを呼ぶようにします。</p>
<pre><code>// 良い例：公開メソッド経由で頼む
send() {
  this.displayOutlet.showMessage("こんにちは");
}

// display側：内部でどのターゲットを使うかは自分だけが知っている
showMessage(message) {
  this.outputTarget.textContent = message;
}</code></pre>
<p>「内部の実装を隠して、窓口だけを公開する」という考え方をカプセル化と呼びます。display側は窓口（showMessageの名前と引数）さえ変えなければ、内部を自由に改良できます。アウトレットを使うときは「相手のターゲット・値には触らず、メソッドを呼ぶ」を鉄則にしましょう。</p>`,
      task: `displayコントローラの窓口となるshowMessage()を実装し、受け取ったmessageを自分のoutputターゲットに表示するようにしてください。`,
      code: `<div data-controller="remote" data-remote-display-outlet="#display">
  <button data-action="remote#send">メッセージを送る</button>
</div>

<div id="display" data-controller="display">
  <p data-display-target="output">メッセージ待ち</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("display", class extends Controller {
  static targets = ["output"];
  showMessage(message) {
    // TODO: 自分のoutputターゲットのtextContentにmessageを設定する
  }
});

application.register("remote", class extends Controller {
  static outlets = ["display"];
  send() {
    // 相手のターゲットには触らず、公開メソッドだけを呼ぶ
    this.displayOutlet.showMessage("こんにちは");
  }
});
<\/script>`,
      solution: `<div data-controller="remote" data-remote-display-outlet="#display">
  <button data-action="remote#send">メッセージを送る</button>
</div>

<div id="display" data-controller="display">
  <p data-display-target="output">メッセージ待ち</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("display", class extends Controller {
  static targets = ["output"];
  showMessage(message) {
    this.outputTarget.textContent = message;
  }
});

application.register("remote", class extends Controller {
  static outlets = ["display"];
  send() {
    // 相手のターゲットには触らず、公開メソッドだけを呼ぶ
    this.displayOutlet.showMessage("こんにちは");
  }
});
<\/script>`,
      hints: [`showMessage()の中では自分のターゲットなので、this.outputTarget.textContent = message; と普通に書けます`, `remote側はすでに窓口showMessage()を呼んでいます。display側の実装を埋めるだけです`],
      check: `click("button");
await sleep(50);
assert(text("[data-display-target=output]") === "こんにちは", "ボタンを押すと「こんにちは」と表示されるはずです。showMessage()の中でthis.outputTarget.textContentにmessageを設定しましたか？");`
    },
    {
      id: 118,
      title: "セレクタの設計（idかクラスか）",
      explanation: `<p>アウトレット属性の値はCSSセレクタです。どんなセレクタを書くかは設計判断であり、主な選択肢は2つです。</p>
<table>
<tr><th>セレクタ</th><th>例</th><th>向いている場合</th></tr>
<tr><td>id</td><td>#main-preview</td><td>相手がページに必ず1つだけのとき</td></tr>
<tr><td>クラス</td><td>.lamp</td><td>相手が複数あり得る・数が変わるとき</td></tr>
</table>
<p>idセレクタは「この1つ」という意図が明確ですが、一致するのは最大1つです。あとから相手を増やしたくなったとき、id指定のままでは対応できません。一方クラスセレクタなら、要素が3つでも10個でも<code>this.lampOutlets</code>にすべて入りますし、<strong>あとから追加・削除された要素も自動で反映されます</strong>（Stimulusがセレクタへの一致を監視し続けるためです）。</p>
<pre><code>// idだと1つに固定される
data-dimmer-lamp-outlet="#lamp1"
// クラスなら現在と将来のすべての.lampが対象になる
data-dimmer-lamp-outlet=".lamp"</code></pre>
<p>セレクタはdocument全体から検索されることも覚えておきましょう。コントローラのスコープ（要素の内側）とは違い、ページのどこにある相手でも接続できます。その分、意図しない要素まで一致しないよう、アウトレット用のクラス名は「.lamp」のように役割がはっきりした名前にするのがおすすめです。</p>`,
      task: `アウトレットのセレクタが「#lamp1」なので1つ目のランプしか点きません。セレクタを「.lamp」に変えて、3つすべてが点くようにしてください。`,
      code: `<!-- TODO: アウトレットのセレクタを「#lamp1」から「.lamp」に変える -->
<div data-controller="dimmer" data-dimmer-lamp-outlet="#lamp1">
  <button data-action="dimmer#allOn">全部点ける</button>
</div>

<div id="lamp1" class="lamp" data-controller="lamp">消灯</div>
<div id="lamp2" class="lamp" data-controller="lamp">消灯</div>
<div id="lamp3" class="lamp" data-controller="lamp">消灯</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("lamp", class extends Controller {
  turnOn() {
    this.element.textContent = "点灯";
  }
});

application.register("dimmer", class extends Controller {
  static outlets = ["lamp"];
  allOn() {
    this.lampOutlets.forEach(function(lamp) {
      lamp.turnOn();
    });
  }
});
<\/script>`,
      solution: `<div data-controller="dimmer" data-dimmer-lamp-outlet=".lamp">
  <button data-action="dimmer#allOn">全部点ける</button>
</div>

<div id="lamp1" class="lamp" data-controller="lamp">消灯</div>
<div id="lamp2" class="lamp" data-controller="lamp">消灯</div>
<div id="lamp3" class="lamp" data-controller="lamp">消灯</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("lamp", class extends Controller {
  turnOn() {
    this.element.textContent = "点灯";
  }
});

application.register("dimmer", class extends Controller {
  static outlets = ["lamp"];
  allOn() {
    this.lampOutlets.forEach(function(lamp) {
      lamp.turnOn();
    });
  }
});
<\/script>`,
      hints: [`data-dimmer-lamp-outlet=".lamp" にすると、classがlampの要素すべてが対象になります`, `JavaScript側はすでに複数形lampOutletsでforEachしているので、変えるのはHTMLの属性値だけです`],
      check: `click("button");
await sleep(50);
assert(text("#lamp1") === "点灯", "1つ目のランプが点灯するはずです");
assert(text("#lamp2") === "点灯", "2つ目のランプも点灯するはずです。セレクタを「.lamp」に変えましたか？");
assert(text("#lamp3") === "点灯", "3つ目のランプも点灯するはずです");`
    },
    {
      id: 119,
      title: "疎結合を保つコツ",
      explanation: `<p>アウトレットは便利な反面、使いすぎるとコントローラ同士が互いに依存し合う「密結合」に陥ります。疎結合を保つためのコツを整理します。</p>
<ol>
<li><strong>相手がいなくても壊れない</strong>：単数形アウトレットはhasでガードし、自分の仕事は必ず最後までやり切る</li>
<li><strong>窓口は小さく</strong>：相手に公開するメソッドは少数に絞り、ターゲットや内部状態には触らせない（ステップ117）</li>
<li><strong>一方通行にする</strong>：AがBのアウトレットを持ち、BもAのアウトレットを持つ相互参照は避ける。逆方向の連絡が必要ならdispatchで返す</li>
<li><strong>通知で済むならdispatch</strong>：アウトレットは「特定の相手を操作したい」ときの道具。迷ったらまずdispatchを検討する（ステップ116）</li>
</ol>
<p>特に1つ目は実践的です。次のような書き方だと、相手がいないページではエラーで止まり、自分のカウント表示すら更新されません。</p>
<pre><code>// 悪い例：相手がいないとエラーで全部止まる
like() {
  this.counterOutlet.increment();
  this.countTarget.textContent = ...;  // ここに到達しない
}</code></pre>
<p>hasガードを入れれば、「連携相手がいれば連携する、いなければ自分の仕事だけする」という柔軟なコントローラになります。連携はあくまでおまけで、<strong>自分の責務は自分だけで完結させる</strong>。これが疎結合の基本姿勢です。</p>`,
      task: `このページにはcounterコントローラの要素がありません。hasCounterOutletのガードを追加して、相手がいなくても自分のカウント表示が更新されるようにしてください。`,
      code: `<div data-controller="liker">
  <button data-action="liker#like">いいね</button>
  <span data-liker-target="count">0</span>件
</div>
<!-- counterコントローラの要素は、このページには置かれていない -->

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("counter", class extends Controller {
  increment() {
    this.element.textContent = "集計+1";
  }
});

application.register("liker", class extends Controller {
  static outlets = ["counter"];
  static targets = ["count"];
  like() {
    // TODO: hasCounterOutletでガードして、相手がいないページでも動くようにする
    this.counterOutlet.increment();
    this.countTarget.textContent = Number(this.countTarget.textContent) + 1;
  }
});
<\/script>`,
      solution: `<div data-controller="liker">
  <button data-action="liker#like">いいね</button>
  <span data-liker-target="count">0</span>件
</div>
<!-- counterコントローラの要素は、このページには置かれていない -->

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("counter", class extends Controller {
  increment() {
    this.element.textContent = "集計+1";
  }
});

application.register("liker", class extends Controller {
  static outlets = ["counter"];
  static targets = ["count"];
  like() {
    if (this.hasCounterOutlet) {
      this.counterOutlet.increment();
    }
    this.countTarget.textContent = Number(this.countTarget.textContent) + 1;
  }
});
<\/script>`,
      hints: [`if (this.hasCounterOutlet) { this.counterOutlet.increment(); } と囲みます`, `ガードが無いと1行目でエラーになり、自分のカウント更新まで止まってしまいます`],
      check: `click("button");
await sleep(50);
assert(text("[data-liker-target=count]") === "1", "相手がいなくてもエラーにならず、いいね数が1になるはずです。hasCounterOutletのガードを追加しましたか？");
click("button");
await sleep(50);
assert(text("[data-liker-target=count]") === "2", "もう一度押すと2になるはずです");`
    },
    {
      id: 120,
      title: "総合演習：検索ボックスと結果リストの連携",
      explanation: `<p>この章の総まとめとして、「検索ボックスに入力すると、離れた場所にある結果リストが絞り込まれる」UIを作ります。使う知識は次のとおりです。</p>
<ul>
<li><strong>static outletsとアウトレット属性</strong>（ステップ111）：searchコントローラからresultsコントローラへの接続。属性名は<strong>data-search-results-outlet</strong>（自分search、相手results）</li>
<li><strong>アウトレット経由のメソッド呼び出し</strong>（ステップ112・116）：入力のたびにthis.resultsOutlet.filter(入力値)を呼ぶ</li>
<li><strong>カプセル化</strong>（ステップ117）：search側はリストの中身（itemターゲットなど）に触らず、公開メソッドfilter()だけを呼ぶ</li>
</ul>
<p>results側のfilter(keyword)はすでに実装済みです。各項目のテキストがキーワードを含むかを調べ、含まない項目には<code>hidden</code>（要素を非表示にするHTML標準のプロパティ）を設定し、最後に表示中の件数を更新します。</p>
<pre><code>役割分担
search  ：入力を受け取り、filterを呼ぶだけ（リストの構造を知らない）
results ：絞り込みと件数表示（検索ボックスの存在を知らない）</code></pre>
<p>searchはresultsの窓口だけを知り、resultsはsearchを一切知りません。どちらも単独で再利用できる、アウトレットらしい設計です。仕上げとして、接続の属性と呼び出しの1行を自分の手で書いてみましょう。</p>`,
      task: `searchの要素にアウトレット属性data-search-results-outlet="#list"を追加し、update()の中でthis.resultsOutlet.filter()に入力値を渡してください。`,
      code: `<!-- TODO: 下のsearchの要素に data-search-results-outlet="#list" を追加する -->
<div data-controller="search">
  <input data-action="input->search#update" placeholder="果物の名前で検索">
</div>

<div id="list" data-controller="results">
  <ul>
    <li data-results-target="item">りんご</li>
    <li data-results-target="item">みかん</li>
    <li data-results-target="item">りんごジュース</li>
  </ul>
  <p data-results-target="count">3件</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("results", class extends Controller {
  static targets = ["item", "count"];
  filter(keyword) {
    let visible = 0;
    this.itemTargets.forEach(function(item) {
      const hit = item.textContent.includes(keyword);
      item.hidden = !hit;
      if (hit) {
        visible = visible + 1;
      }
    });
    this.countTarget.textContent = visible + "件";
  }
});

application.register("search", class extends Controller {
  static outlets = ["results"];
  update(event) {
    // TODO: resultsアウトレットのfilter()に入力値（event.target.value）を渡す
  }
});
<\/script>`,
      solution: `<div data-controller="search" data-search-results-outlet="#list">
  <input data-action="input->search#update" placeholder="果物の名前で検索">
</div>

<div id="list" data-controller="results">
  <ul>
    <li data-results-target="item">りんご</li>
    <li data-results-target="item">みかん</li>
    <li data-results-target="item">りんごジュース</li>
  </ul>
  <p data-results-target="count">3件</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("results", class extends Controller {
  static targets = ["item", "count"];
  filter(keyword) {
    let visible = 0;
    this.itemTargets.forEach(function(item) {
      const hit = item.textContent.includes(keyword);
      item.hidden = !hit;
      if (hit) {
        visible = visible + 1;
      }
    });
    this.countTarget.textContent = visible + "件";
  }
});

application.register("search", class extends Controller {
  static outlets = ["results"];
  update(event) {
    this.resultsOutlet.filter(event.target.value);
  }
});
<\/script>`,
      hints: [`属性名は「data-自分-相手-outlet」なので、data-search-results-outlet="#list" です`, `update()の中は this.resultsOutlet.filter(event.target.value); の1行です`],
      check: `setValue("input", "りんご");
await sleep(50);
const items = $$("li");
assert(items.length === 3, "リスト項目は3つあるはずです");
assert(items[0].hidden === false, "「りんご」で検索すると、1つ目の「りんご」は表示されたままのはずです");
assert(items[1].hidden === true, "「りんご」を含まない「みかん」は非表示になるはずです。アウトレット属性とfilter()の呼び出しを実装しましたか？");
assert(items[2].hidden === false, "「りんごジュース」は「りんご」を含むので表示されたままのはずです");
assert(text("[data-results-target=count]") === "2件", "件数表示が「2件」に更新されるはずです");`
    }
  ]
});
