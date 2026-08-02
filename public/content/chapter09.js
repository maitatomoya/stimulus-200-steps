// 第9章：ライフサイクル
registerChapter({
  number: 9,
  title: "ライフサイクル",
  description: "コントローラが生まれてから消えるまでの流れ（initialize・connect・disconnect）と、ターゲットの接続コールバックを学びます。",
  steps: [
    {
      id: 81,
      title: "initialize・connect・disconnectの順序",
      explanation: `<p>Stimulusのコントローラには、決まったタイミングで自動的に呼ばれる<strong>ライフサイクルメソッド</strong>があります。ライフサイクルとは「生まれてから消えるまでの一生」のことです。代表的な3つを表にまとめます。</p>
<table>
  <tr><th>メソッド</th><th>呼ばれるタイミング</th><th>回数</th></tr>
  <tr><td><code>initialize()</code></td><td>コントローラのインスタンスが最初に作られたとき</td><td>1回だけ</td></tr>
  <tr><td><code>connect()</code></td><td>コントローラが要素に接続されるたび</td><td>何度でも</td></tr>
  <tr><td><code>disconnect()</code></td><td>要素がDOMから外れて切断されるたび</td><td>何度でも</td></tr>
</table>
<p>ページ読み込み時には<code>initialize()</code>→<code>connect()</code>の順で呼ばれます。要素がDOMから取り除かれると<code>disconnect()</code>が呼ばれます。定義のしかたは普通のメソッドと同じで、名前を正しく書くだけでStimulusが自動的に呼んでくれます。</p>
<pre><code>application.register("life", class extends Controller {
  initialize() {
    console.log("initialize：最初に1回だけ");
  }
  connect() {
    console.log("connect：接続のたびに");
  }
  disconnect() {
    console.log("disconnect：切断のたびに");
  }
});</code></pre>
<p>今回はconsole.logの代わりに、ページ上の<code>&lt;ul id="log"&gt;</code>に行を追加して順序を目で確かめます。ログ用の<code>&lt;ul&gt;</code>はコントローラの外に置いてあるので、コントローラの要素が消えてもログは残ります。</p>`,
      task: `initialize()とdisconnect()を定義して、それぞれthis.log("initialize")、this.log("disconnect")を呼んでください。読み込み直後にinitialize→connectの順でログが並べば成功です。`,
      code: `<div data-controller="life">
  <p>ライフサイクルを観察する要素</p>
</div>
<ul id="log"></ul>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("life", class extends Controller {
  // TODO: initialize()を定義して this.log("initialize") を呼ぶ

  connect() {
    this.log("connect");
  }

  // TODO: disconnect()を定義して this.log("disconnect") を呼ぶ

  log(name) {
    const li = document.createElement("li");
    li.textContent = name;
    document.getElementById("log").appendChild(li);
  }
});
<\/script>`,
      solution: `<div data-controller="life">
  <p>ライフサイクルを観察する要素</p>
</div>
<ul id="log"></ul>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("life", class extends Controller {
  initialize() {
    this.log("initialize");
  }

  connect() {
    this.log("connect");
  }

  disconnect() {
    this.log("disconnect");
  }

  log(name) {
    const li = document.createElement("li");
    li.textContent = name;
    document.getElementById("log").appendChild(li);
  }
});
<\/script>`,
      hints: [
        `connect()と同じ書き方で、メソッド名だけをinitialize、disconnectに変えれば自動的に呼ばれます`,
        `disconnect()が呼ばれるのは要素がDOMから外れたときです。判定スクリプトが要素を取り除いて確認します`
      ],
      check: `await sleep(100);
let items = $$("#log li").map(function (li) { return li.textContent.trim(); });
assert(items.length >= 2, "読み込み直後、#logに2行（initializeとconnect）が記録されるはずです。initialize()を定義しましたか？");
assert(items[0] === "initialize", "ログの1行目は「initialize」のはずです。initialize()はconnect()より先に呼ばれます");
assert(items[1] === "connect", "ログの2行目は「connect」のはずです");
$("[data-controller=life]").remove();
await sleep(100);
items = $$("#log li").map(function (li) { return li.textContent.trim(); });
assert(items[items.length - 1] === "disconnect", "コントローラの要素をDOMから取り除くとdisconnect()が呼ばれ、ログの最後に「disconnect」が記録されるはずです");`
    },
    {
      id: 82,
      title: "connectで初期描画する",
      explanation: `<p><code>connect()</code>のいちばん基本的な使い道は、<strong>接続された瞬間に画面の初期状態を作る</strong>ことです。ボタンを押されるのを待つのではなく、コントローラが動き出したらすぐに表示を整えます。</p>
<p>たとえばHTML側には「読み込み中...」と書いておき、connect()で本来の表示に置き換えると、JavaScriptが動く前後の状態がはっきり分かれます。valuesと組み合わせれば、初期表示の内容もHTML側から設定できます。</p>
<pre><code>&lt;div data-controller="status" data-status-name-value="さくら"&gt;
  &lt;p data-status-target="output"&gt;読み込み中...&lt;/p&gt;
&lt;/div&gt;</code></pre>
<pre><code>application.register("status", class extends Controller {
  static targets = ["output"];
  static values = { name: String };

  connect() {
    this.outputTarget.textContent = this.nameValue + "さん、ようこそ";
  }
});</code></pre>
<p>connect()が呼ばれる時点では、ターゲットもvaluesもすでに使える状態になっています。だから<code>this.outputTarget</code>や<code>this.nameValue</code>を安心して参照できます。</p>
<p>「クリックで動く」だけでなく「現れた瞬間に動く」処理を書けるようになると、部品としての完成度が一気に上がります。後の章で学ぶタイマーの開始や外部状態の読み込みも、すべてconnect()が入り口になります。</p>`,
      task: `connect()の中を実装して、読み込み直後にoutputターゲットへ「さくらさん、ようこそ」と表示してください（名前はnameValueから取ります）。`,
      code: `<div data-controller="status" data-status-name-value="さくら">
  <p data-status-target="output">読み込み中...</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("status", class extends Controller {
  static targets = ["output"];
  static values = { name: String };

  connect() {
    // TODO: outputTargetのtextContentを「◯◯さん、ようこそ」にする
    // ◯◯の部分はthis.nameValueを使い、文字列は + で連結する
  }
});
<\/script>`,
      solution: `<div data-controller="status" data-status-name-value="さくら">
  <p data-status-target="output">読み込み中...</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("status", class extends Controller {
  static targets = ["output"];
  static values = { name: String };

  connect() {
    this.outputTarget.textContent = this.nameValue + "さん、ようこそ";
  }
});
<\/script>`,
      hints: [
        `this.outputTarget.textContent = this.nameValue + "さん、ようこそ"; のように書きます`,
        `connect()はクリックなしで、接続された瞬間に自動で呼ばれます`
      ],
      check: `await sleep(100);
assert($("[data-controller=status]"), "data-controller=\\"status\\"の要素が必要です");
assert(text("[data-status-target=output]") === "さくらさん、ようこそ", "読み込み直後（クリックなし）に、outputターゲットへ「さくらさん、ようこそ」と表示されるはずです。connect()の中で描画していますか？");`
    },
    {
      id: 83,
      title: "disconnectで後始末する",
      explanation: `<p><code>connect()</code>で何かを「始めた」ら、<code>disconnect()</code>で「片付ける」のがセットです。この片付けを<strong>後始末（クリーンアップ）</strong>と呼びます。</p>
<p>今回の例では、connect()でコントローラの外側にお知らせ要素を作って追加します。もしdisconnect()で消さないと、コントローラの要素がDOMから消えたのに、お知らせだけが画面に残り続けてしまいます。</p>
<pre><code>connect() {
  this.notice = document.createElement("p");
  this.notice.textContent = "ウィジェット動作中";
  document.getElementById("notice-area").appendChild(this.notice);
}

disconnect() {
  this.notice.remove();
}</code></pre>
<p>ポイントは、connect()で作った要素を<code>this.notice</code>のような<strong>インスタンス変数</strong>に覚えておくことです。こうするとdisconnect()から同じ要素を参照して取り除けます。第7章で「状態はDOMに置く」と学びましたが、後始末のために覚えておく参照はインスタンス変数の正しい使い道です。</p>
<p>後始末が必要になる典型例は次のとおりです。</p>
<ul>
  <li>コントローラの外側に追加した要素を取り除く</li>
  <li>タイマーを止める（第16章で学びます）</li>
  <li>windowやdocumentに手動で登録したイベントリスナーを外す</li>
</ul>
<p>後始末を怠ると、要素の削除や画面の切り替えのたびにゴミが積み重なっていきます。「始めたものは自分で片付ける」を習慣にしましょう。</p>`,
      task: `disconnect()を実装して、connect()で追加したお知らせ要素（this.notice）を取り除いてください。コントローラの要素が消えたら、お知らせも一緒に消えれば成功です。`,
      code: `<div data-controller="widget">
  <p>ウィジェット本体</p>
</div>
<div id="notice-area"></div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("widget", class extends Controller {
  connect() {
    this.notice = document.createElement("p");
    this.notice.id = "notice";
    this.notice.textContent = "ウィジェット動作中";
    document.getElementById("notice-area").appendChild(this.notice);
  }

  disconnect() {
    // TODO: connect()で作った this.notice を取り除く
  }
});
<\/script>`,
      solution: `<div data-controller="widget">
  <p>ウィジェット本体</p>
</div>
<div id="notice-area"></div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("widget", class extends Controller {
  connect() {
    this.notice = document.createElement("p");
    this.notice.id = "notice";
    this.notice.textContent = "ウィジェット動作中";
    document.getElementById("notice-area").appendChild(this.notice);
  }

  disconnect() {
    this.notice.remove();
  }
});
<\/script>`,
      hints: [
        `this.notice.remove(); の1行で取り除けます（remove()は第1章で学びました）`,
        `connect()でインスタンス変数に覚えておいたからこそ、disconnect()で同じ要素を参照できます`
      ],
      check: `await sleep(100);
assert(text("#notice") === "ウィジェット動作中", "接続時に#notice-areaへ「ウィジェット動作中」のお知らせが追加されるはずです");
$("[data-controller=widget]").remove();
await sleep(100);
assert(!$("#notice"), "コントローラの要素を取り除いたら、disconnect()でお知らせ（#notice）も取り除かれるはずです");`
    },
    {
      id: 84,
      title: "要素の追加・削除でconnect/disconnectが起きることを観察",
      explanation: `<p>connect/disconnectは<strong>ページの読み込み時だけのもの</strong>ではありません。あとから要素をDOMに追加すればconnectが、取り除けばdisconnectが、そのたびに呼ばれます。Stimulusが常にDOMを監視しているからです。</p>
<p>今回のコードには、Stimulusを使わない素のスクリプトで作った2つのボタンがあります。</p>
<ul>
  <li>「取り外す」：<code>box.remove()</code>でコントローラ付きの要素をDOMから外す</li>
  <li>「付け直す」：<code>appendChild(box)</code>で同じ要素をDOMに戻す</li>
</ul>
<pre><code>const box = document.getElementById("box");
document.getElementById("detach").addEventListener("click", function () {
  box.remove();
});
document.getElementById("attach").addEventListener("click", function () {
  document.getElementById("area").appendChild(box);
});</code></pre>
<p><code>remove()</code>してもJavaScriptの変数<code>box</code>が要素を覚えているので、あとから同じ要素を付け直せる、というのは第1章で学んだ素のDOMの知識です。</p>
<p>取り外すたびにdisconnect、付け直すたびにconnectがログに追加されるのを観察してください。この性質があるおかげで、あとから動的に追加されたHTMLでも、data-controller属性さえ付いていれば自動的に動き出します。「初期化コードを自分で呼び直す」必要がないのがStimulusの大きな強みです。</p>`,
      task: `disconnect()を定義してaddLog("disconnect")を呼んでください。そのうえで「取り外す」「付け直す」を押し、ログにdisconnect→connectが順に追加されることを確認しましょう。`,
      code: `<button id="detach">取り外す</button>
<button id="attach">付け直す</button>
<div id="area">
  <div id="box" data-controller="probe">プローブ要素</div>
</div>
<ul id="log"></ul>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("probe", class extends Controller {
  connect() {
    addLog("connect");
  }

  // TODO: disconnect()を定義して addLog("disconnect") を呼ぶ
});

function addLog(name) {
  const li = document.createElement("li");
  li.textContent = name;
  document.getElementById("log").appendChild(li);
}

// ここから下はStimulusを使わない素のスクリプト（第1章の知識）
const box = document.getElementById("box");
document.getElementById("detach").addEventListener("click", function () {
  box.remove();
});
document.getElementById("attach").addEventListener("click", function () {
  document.getElementById("area").appendChild(box);
});
<\/script>`,
      solution: `<button id="detach">取り外す</button>
<button id="attach">付け直す</button>
<div id="area">
  <div id="box" data-controller="probe">プローブ要素</div>
</div>
<ul id="log"></ul>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("probe", class extends Controller {
  connect() {
    addLog("connect");
  }

  disconnect() {
    addLog("disconnect");
  }
});

function addLog(name) {
  const li = document.createElement("li");
  li.textContent = name;
  document.getElementById("log").appendChild(li);
}

// ここから下はStimulusを使わない素のスクリプト（第1章の知識）
const box = document.getElementById("box");
document.getElementById("detach").addEventListener("click", function () {
  box.remove();
});
document.getElementById("attach").addEventListener("click", function () {
  document.getElementById("area").appendChild(box);
});
<\/script>`,
      hints: [
        `connect()と同じ形で disconnect() { addLog("disconnect"); } を追加します`,
        `要素をDOMに戻すと、同じ要素でもconnect()がもう一度呼ばれます`
      ],
      check: `await sleep(100);
let items = $$("#log li").map(function (li) { return li.textContent.trim(); });
assert(items.length >= 1 && items[0] === "connect", "読み込み直後にまず「connect」が記録されるはずです");
click("#detach");
await sleep(100);
items = $$("#log li").map(function (li) { return li.textContent.trim(); });
assert(items[items.length - 1] === "disconnect", "「取り外す」を押すと要素がDOMから外れ、disconnect()が呼ばれて「disconnect」が記録されるはずです");
click("#attach");
await sleep(100);
items = $$("#log li").map(function (li) { return li.textContent.trim(); });
assert(items[items.length - 1] === "connect", "「付け直す」を押すと再接続され、もう一度「connect」が記録されるはずです");`
    },
    {
      id: 85,
      title: "targetConnected・targetDisconnected",
      explanation: `<p>コントローラ本体だけでなく、<strong>ターゲットにもライフサイクルコールバック</strong>があります。ターゲット名が<code>item</code>なら、次の2つのメソッドを定義できます。</p>
<table>
  <tr><th>メソッド</th><th>呼ばれるタイミング</th></tr>
  <tr><td><code>itemTargetConnected(element)</code></td><td>itemターゲットがスコープ内に現れたとき（接続時に既にある分も含む）</td></tr>
  <tr><td><code>itemTargetDisconnected(element)</code></td><td>itemターゲットがスコープから消えたとき</td></tr>
</table>
<p>引数<code>element</code>には対象のターゲット要素そのものが渡されます。名前の付け方は「ターゲット名＋TargetConnected／TargetDisconnected」です。</p>
<pre><code>static targets = ["item", "count", "box"];

itemTargetConnected() {
  this.refresh();
}

itemTargetDisconnected() {
  this.refresh();
}

refresh() {
  this.countTarget.textContent = String(this.itemTargets.length);
}</code></pre>
<p>これが便利なのは、項目を追加するコードのあちこちに「件数を更新する処理」を書かなくてよくなる点です。<strong>どこで増減しても、増減したという事実に反応して</strong>refresh()が呼ばれます。追加ボタン経由でも、外部のスクリプトがliを消しても、同じように件数が合います。</p>
<p>なお、コントローラの接続時に最初から置いてあるターゲットに対しても、1つずつ<code>itemTargetConnected</code>が呼ばれます。だから初期表示の件数合わせにも使えます。</p>`,
      task: `itemTargetConnected()とitemTargetDisconnected()を定義し、どちらもthis.refresh()を呼んでください。項目の増減に合わせて件数表示が自動で更新されれば成功です。`,
      code: `<div data-controller="list">
  <button data-action="list#add">項目を追加</button>
  <p>件数：<span data-list-target="count">0</span></p>
  <ul data-list-target="box">
    <li data-list-target="item">最初の項目</li>
  </ul>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("list", class extends Controller {
  static targets = ["item", "count", "box"];

  add() {
    const li = document.createElement("li");
    li.textContent = "追加された項目";
    li.setAttribute("data-list-target", "item");
    this.boxTarget.appendChild(li);
  }

  // TODO: itemTargetConnected()を定義して this.refresh() を呼ぶ

  // TODO: itemTargetDisconnected()を定義して this.refresh() を呼ぶ

  refresh() {
    this.countTarget.textContent = String(this.itemTargets.length);
  }
});
<\/script>`,
      solution: `<div data-controller="list">
  <button data-action="list#add">項目を追加</button>
  <p>件数：<span data-list-target="count">0</span></p>
  <ul data-list-target="box">
    <li data-list-target="item">最初の項目</li>
  </ul>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("list", class extends Controller {
  static targets = ["item", "count", "box"];

  add() {
    const li = document.createElement("li");
    li.textContent = "追加された項目";
    li.setAttribute("data-list-target", "item");
    this.boxTarget.appendChild(li);
  }

  itemTargetConnected() {
    this.refresh();
  }

  itemTargetDisconnected() {
    this.refresh();
  }

  refresh() {
    this.countTarget.textContent = String(this.itemTargets.length);
  }
});
<\/script>`,
      hints: [
        `メソッド名は「ターゲット名＋TargetConnected」です。itemなら itemTargetConnected() になります`,
        `最初から置いてあるliに対しても、接続時にitemTargetConnectedが1回呼ばれます`
      ],
      check: `await sleep(100);
assert(text("[data-list-target=count]") === "1", "最初から項目が1つあるので、接続時にitemTargetConnectedが呼ばれて件数が「1」になるはずです");
click("[data-action='list#add']");
await sleep(100);
click("[data-action='list#add']");
await sleep(100);
assert(text("[data-list-target=count]") === "3", "2回追加すると件数は「3」になるはずです");
$$("[data-list-target=item]")[0].remove();
await sleep(100);
assert(text("[data-list-target=count]") === "2", "項目をDOMから取り除くとitemTargetDisconnectedが呼ばれ、件数は「2」になるはずです");`
    },
    {
      id: 86,
      title: "MutationObserverが裏にいる（仕組みの解説）",
      explanation: `<p>ここまで「要素を追加するとconnectが呼ばれる」と学びましたが、Stimulusはどうやって気づいているのでしょうか。答えは、ブラウザ標準の<strong>MutationObserver</strong>というAPIです。MutationObserverは「DOMの変更（mutation）を監視（observe）する仕組み」で、要素の追加・削除や属性の変更が起きると通知してくれます。</p>
<p><code>Application.start()</code>を呼ぶと、Stimulusはdocument全体にMutationObserverを仕掛け、次のような変化を見張ります。</p>
<ul>
  <li><code>data-controller</code>属性を持つ要素の追加・削除→connect／disconnect</li>
  <li><code>data-controller</code>属性そのものの追加・削除・書き換え→接続・切断</li>
  <li>ターゲットやアクションの属性の変化→ターゲット登録やイベント割り当ての更新</li>
</ul>
<p>つまり、<strong>すでにある要素に後から属性を付けるだけでも</strong>コントローラは接続されます。今回はそれを実験します。</p>
<pre><code>// Stimulusを使わない素のスクリプトから属性を付ける
const box = document.getElementById("box");
box.setAttribute("data-controller", "hello");
// →MutationObserverが検知し、helloコントローラのconnect()が呼ばれる</code></pre>
<p>MutationObserverの通知はごくわずかに非同期（変更の直後にまとめて届く）なので、属性を付けた「次の瞬間」にconnectが走ると考えてください。この仕組みを知っておくと、「登録し直しの処理をどこにも書いていないのに動く」というStimulusの魔法の正体がわかり、第14章で学ぶ動的なリスト操作も安心して書けるようになります。</p>`,
      task: `「コントローラを有効化」ボタンのクリック処理で、#boxにsetAttributeを使ってdata-controller="hello"属性を追加してください。属性が付いた瞬間にconnect()が走り、メッセージが表示されれば成功です。`,
      code: `<button id="activate">コントローラを有効化</button>
<div id="box">
  <p id="msg"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("hello", class extends Controller {
  connect() {
    document.getElementById("msg").textContent = "接続されました";
  }
});

// Stimulusを使わない素のスクリプト
document.getElementById("activate").addEventListener("click", function () {
  const box = document.getElementById("box");
  // TODO: boxにsetAttributeで data-controller="hello" 属性を追加する
});
<\/script>`,
      solution: `<button id="activate">コントローラを有効化</button>
<div id="box">
  <p id="msg"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("hello", class extends Controller {
  connect() {
    document.getElementById("msg").textContent = "接続されました";
  }
});

// Stimulusを使わない素のスクリプト
document.getElementById("activate").addEventListener("click", function () {
  const box = document.getElementById("box");
  box.setAttribute("data-controller", "hello");
});
<\/script>`,
      hints: [
        `box.setAttribute("data-controller", "hello"); と書きます（setAttributeは第1章のdata属性の回で登場しました）`,
        `属性を付けるだけで、connect()を自分で呼ぶ必要はありません。MutationObserverが検知してくれます`
      ],
      check: `await sleep(100);
assert(text("#msg") === "", "ボタンを押す前は#msgは空のはずです");
click("#activate");
await sleep(100);
assert($("#box").getAttribute("data-controller") === "hello", "ボタンのクリックで#boxにdata-controller=\\"hello\\"属性が追加されるはずです。setAttributeを使いましたか？");
assert(text("#msg") === "接続されました", "属性が付くとStimulusが自動で検知してconnect()を呼び、#msgに「接続されました」と表示されるはずです");`
    },
    {
      id: 87,
      title: "controllerプロパティの寿命",
      explanation: `<p>コントローラのインスタンス（<code>this</code>）はいつ作られ、いつまで生きているのでしょうか。重要なルールは次の2つです。</p>
<ul>
  <li>インスタンスは<strong>要素とコントローラ名の組み合わせごとに1つ</strong>作られ、そのとき<code>initialize()</code>が1回だけ呼ばれる</li>
  <li>要素を取り外して付け直しても、<strong>同じインスタンスが再利用される</strong>。呼ばれるのはdisconnect()とconnect()だけで、initialize()は再実行されない</li>
</ul>
<p>つまり、<code>this.count</code>のようなインスタンスプロパティは、切断されても消えず、再接続後もそのまま残っています。これを確かめるのが今回の実験です。</p>
<pre><code>initialize() {
  this.count = 0;  // インスタンス誕生時に1回だけ
}

connect() {
  this.count = this.count + 1;  // 接続のたびに増える
  this.outputTarget.textContent = this.count + "回目の接続";
}</code></pre>
<p>取り外して付け直すと表示が「2回目の接続」になります。initialize()が再実行されるならcountは0に戻って「1回目」のままのはずなので、インスタンスが生き続けている証拠になります。</p>
<p>第7章で「アプリの状態はインスタンス変数でなくDOM（values）に置く」と学びました。その方針は変わりませんが、<strong>接続回数の記録や後始末用の参照</strong>（ステップ83のthis.notice）のような内部的な道具は、インスタンスプロパティの正しい使いどころです。寿命を理解して使い分けましょう。</p>`,
      task: `initialize()でthis.countを0に初期化し、connect()でthis.countを1増やして「◯回目の接続」とoutputターゲットに表示してください。取り外して付け直すと「2回目の接続」になれば成功です。`,
      code: `<button id="detach">取り外す</button>
<button id="attach">付け直す</button>
<div id="area">
  <div id="box" data-controller="probe">
    <span data-probe-target="output"></span>
  </div>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("probe", class extends Controller {
  static targets = ["output"];

  initialize() {
    // TODO: this.count を 0 で初期化する
  }

  connect() {
    // TODO: this.count を1増やし、outputTargetに「◯回目の接続」と表示する
    // （◯はthis.count。文字列は + で連結する）
  }
});

// 取り外し・付け直し用の素のスクリプト
const box = document.getElementById("box");
document.getElementById("detach").addEventListener("click", function () {
  box.remove();
});
document.getElementById("attach").addEventListener("click", function () {
  document.getElementById("area").appendChild(box);
});
<\/script>`,
      solution: `<button id="detach">取り外す</button>
<button id="attach">付け直す</button>
<div id="area">
  <div id="box" data-controller="probe">
    <span data-probe-target="output"></span>
  </div>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("probe", class extends Controller {
  static targets = ["output"];

  initialize() {
    this.count = 0;
  }

  connect() {
    this.count = this.count + 1;
    this.outputTarget.textContent = this.count + "回目の接続";
  }
});

// 取り外し・付け直し用の素のスクリプト
const box = document.getElementById("box");
document.getElementById("detach").addEventListener("click", function () {
  box.remove();
});
document.getElementById("attach").addEventListener("click", function () {
  document.getElementById("area").appendChild(box);
});
<\/script>`,
      hints: [
        `connect()の中は this.count = this.count + 1; のあと this.outputTarget.textContent = this.count + "回目の接続"; です`,
        `付け直したときに呼ばれるのはconnect()だけです。initialize()は最初の1回しか呼ばれません`
      ],
      check: `await sleep(100);
assert(text("[data-probe-target=output]") === "1回目の接続", "読み込み直後は「1回目の接続」と表示されるはずです。initialize()で0にし、connect()で1増やしていますか？");
click("#detach");
await sleep(100);
click("#attach");
await sleep(100);
assert(text("[data-probe-target=output]") === "2回目の接続", "付け直すとconnect()だけが再度呼ばれます。initialize()は再実行されないのでthis.countは保持され、「2回目の接続」になるはずです");`
    },
    {
      id: 88,
      title: "connectで外部の状態を読み込む",
      explanation: `<p>connect()のもう1つの定番の仕事は、<strong>コントローラの外にある情報を読み込んで、自分の表示に反映する</strong>ことです。実際のアプリでは、サーバーがHTMLに埋め込んだ設定やユーザー情報を、ページ内のdata-*属性から読み取る場面がよくあります。</p>
<p>今回は、ページのどこかに置かれた設定要素からdata-*属性を読み取ります。第1章で学んだ<code>dataset</code>の出番です。</p>
<pre><code>&lt;div id="config" data-user-name="さくら" data-plan="premium"&gt;&lt;/div&gt;</code></pre>
<pre><code>connect() {
  const config = document.getElementById("config");
  this.outputTarget.textContent =
    config.dataset.userName + "さん（" + config.dataset.plan + "プラン）";
}</code></pre>
<p><code>data-user-name</code>は<code>dataset.userName</code>とキャメルケースで読む、というルールも第1章の復習です。</p>
<p>「valuesと何が違うの？」と思うかもしれません。使い分けの目安はこうです。</p>
<table>
  <tr><th>手段</th><th>向いている情報</th></tr>
  <tr><td>values</td><td>そのコントローラ自身の設定（自分の要素に書ける）</td></tr>
  <tr><td>外部要素のdata-*</td><td>ページ全体で共有される情報（複数のコントローラが参照する）</td></tr>
</table>
<p>どちらも「状態はDOMに置く」という第7章の思想の延長線上にあります。connect()は、DOMに置かれた状態を自分の画面に反映させる合流地点なのです。</p>`,
      task: `connect()の中で#configのdataset（userNameとplan）を読み取り、outputターゲットに「さくらさん（premiumプラン）」と表示してください。`,
      code: `<div id="config" data-user-name="さくら" data-plan="premium"></div>

<div data-controller="profile">
  <p data-profile-target="output"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("profile", class extends Controller {
  static targets = ["output"];

  connect() {
    const config = document.getElementById("config");
    // TODO: config.dataset.userName と config.dataset.plan を使って
    // outputTargetに「さくらさん（premiumプラン）」と表示する
  }
});
<\/script>`,
      solution: `<div id="config" data-user-name="さくら" data-plan="premium"></div>

<div data-controller="profile">
  <p data-profile-target="output"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("profile", class extends Controller {
  static targets = ["output"];

  connect() {
    const config = document.getElementById("config");
    this.outputTarget.textContent =
      config.dataset.userName + "さん（" + config.dataset.plan + "プラン）";
  }
});
<\/script>`,
      hints: [
        `data-user-name はキャメルケースで config.dataset.userName になります`,
        `this.outputTarget.textContent = config.dataset.userName + "さん（" + config.dataset.plan + "プラン）"; のように連結します`
      ],
      check: `await sleep(100);
assert($("#config"), "#configの設定要素が必要です");
assert(text("[data-profile-target=output]") === "さくらさん（premiumプラン）", "connect()で#configのdata属性を読み取り、「さくらさん（premiumプラン）」と表示されるはずです");`
    },
    {
      id: 89,
      title: "再接続に強いコントローラの書き方",
      explanation: `<p>ステップ84と87で見たとおり、コントローラは何度も接続・切断されます。そこで気をつけたいのが、<strong>connect()が2回以上呼ばれても壊れないか</strong>という視点です。</p>
<p>次のコードには落とし穴があります。connect()のたびに★の飾りを追加するので、取り外して付け直すたびに★が増殖してしまいます。</p>
<pre><code>connect() {
  this.star = document.createElement("span");
  this.star.textContent = "★";
  this.element.appendChild(this.star);
}
// disconnect()がない→付け直すたびに★が増える！</code></pre>
<p>対策の基本は<strong>「connectで作ったものはdisconnectで片付ける」対称の形</strong>にすることです。</p>
<pre><code>disconnect() {
  this.star.remove();
}</code></pre>
<p>こうすると「接続中は★が1つだけ存在する」という状態が何度再接続しても保たれます。connect()とdisconnect()が対になっている状態を、再接続に強い（べき等に近い）設計と呼びます。</p>
<p>なぜここまで再接続を気にするかというと、実際のHotwireアプリではTurboというライブラリがページの一部を頻繁に差し替え、そのたびにdisconnect→connectが起きるからです（第18章で概要を扱います）。「1ページ1回きり」という思い込みを捨てて、<strong>何度呼ばれても正しい状態になる</strong>connect/disconnectを書く習慣を付けましょう。</p>`,
      task: `disconnect()を定義してthis.starを取り除き、取り外し→付け直しをくり返しても★が1つのままになるように直してください。`,
      code: `<button id="detach">取り外す</button>
<button id="attach">付け直す</button>
<div id="area">
  <div id="box" data-controller="badge">
    <span>メニュー</span>
  </div>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("badge", class extends Controller {
  connect() {
    this.star = document.createElement("span");
    this.star.className = "star";
    this.star.textContent = "★";
    this.element.appendChild(this.star);
  }

  // TODO: disconnect()を定義して this.star を取り除く
  // （このままでは付け直すたびに★が増えてしまう）
});

// 取り外し・付け直し用の素のスクリプト
const box = document.getElementById("box");
document.getElementById("detach").addEventListener("click", function () {
  box.remove();
});
document.getElementById("attach").addEventListener("click", function () {
  document.getElementById("area").appendChild(box);
});
<\/script>`,
      solution: `<button id="detach">取り外す</button>
<button id="attach">付け直す</button>
<div id="area">
  <div id="box" data-controller="badge">
    <span>メニュー</span>
  </div>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("badge", class extends Controller {
  connect() {
    this.star = document.createElement("span");
    this.star.className = "star";
    this.star.textContent = "★";
    this.element.appendChild(this.star);
  }

  disconnect() {
    this.star.remove();
  }
});

// 取り外し・付け直し用の素のスクリプト
const box = document.getElementById("box");
document.getElementById("detach").addEventListener("click", function () {
  box.remove();
});
document.getElementById("attach").addEventListener("click", function () {
  document.getElementById("area").appendChild(box);
});
<\/script>`,
      hints: [
        `ステップ83と同じパターンです。disconnect() { this.star.remove(); } を追加します`,
        `★はthis.element（#box）の中に追加されるので、片付けないまま再接続すると2つ目が追加されてしまいます`
      ],
      check: `await sleep(100);
assert($$(".star").length === 1, "接続時に★が1つ付くはずです");
click("#detach");
await sleep(100);
click("#attach");
await sleep(100);
assert($$(".star").length === 1, "取り外して付け直しても★は1つのままのはずです。disconnect()で★を取り除く後始末をしていますか？");
click("#detach");
await sleep(100);
click("#attach");
await sleep(100);
assert($$(".star").length === 1, "何度付け直しても★は1つのままのはずです");`
    },
    {
      id: 90,
      title: "総合演習：動的リストの監視",
      explanation: `<p>第9章の総合演習です。項目の追加・削除ができるウォッチリストを作り、この章で学んだ<strong>ターゲットのライフサイクルコールバック</strong>で件数表示と空メッセージを自動管理します。</p>
<h4>仕様</h4>
<ul>
  <li>「追加」ボタンで項目（li）をリストに追加する。各項目には「削除」ボタンが付く</li>
  <li>件数表示は常に実際の項目数と一致する</li>
  <li>0件のときだけ「リストは空です」を表示する（hiddenクラスで切り替え）</li>
</ul>
<h4>設計のポイント</h4>
<p>追加処理や削除処理の中で件数を数え直すのではなく、<code>itemTargetConnected</code>／<code>itemTargetDisconnected</code>だけでrefresh()を呼びます。増減の「原因」がどこにあっても表示が合う、この章の集大成の形です。</p>
<pre><code>itemTargetConnected() {
  this.refresh();
}

itemTargetDisconnected() {
  this.refresh();
}</code></pre>
<p>refresh()では件数の表示と、空メッセージの切り替えを行います。切り替えは第8章で学んだclassListとhiddenクラスを使います。</p>
<pre><code>refresh() {
  const count = this.itemTargets.length;
  this.countTarget.textContent = String(count);
  if (count === 0) {
    this.emptyTarget.classList.remove("hidden");
  } else {
    this.emptyTarget.classList.add("hidden");
  }
}</code></pre>
<p>削除ボタンは<code>event.currentTarget.parentElement</code>（ボタンの親のli）を取り除きます。liが消えればitemTargetDisconnectedが発火し、あとは自動で表示が整います。</p>`,
      task: `itemTargetConnected()とitemTargetDisconnected()を定義してthis.refresh()を呼び、refresh()の中身（件数表示と空メッセージのhidden切り替え）を実装してください。`,
      code: `<style>
  .hidden { display: none; }
</style>

<div data-controller="watchlist">
  <button data-action="watchlist#add">追加</button>
  <p>件数：<span data-watchlist-target="count">0</span></p>
  <p data-watchlist-target="empty">リストは空です</p>
  <ul data-watchlist-target="box"></ul>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("watchlist", class extends Controller {
  static targets = ["item", "count", "empty", "box"];

  add() {
    const li = document.createElement("li");
    li.setAttribute("data-watchlist-target", "item");
    const label = document.createElement("span");
    label.textContent = "ウォッチ項目";
    const button = document.createElement("button");
    button.textContent = "削除";
    button.setAttribute("data-action", "watchlist#remove");
    li.appendChild(label);
    li.appendChild(button);
    this.boxTarget.appendChild(li);
  }

  remove(event) {
    event.currentTarget.parentElement.remove();
  }

  // TODO: itemTargetConnected()を定義して this.refresh() を呼ぶ

  // TODO: itemTargetDisconnected()を定義して this.refresh() を呼ぶ

  refresh() {
    // TODO: countターゲットに this.itemTargets.length を表示する
    // TODO: 0件ならemptyターゲットのhiddenクラスを外し、1件以上なら付ける
  }
});
<\/script>`,
      solution: `<style>
  .hidden { display: none; }
</style>

<div data-controller="watchlist">
  <button data-action="watchlist#add">追加</button>
  <p>件数：<span data-watchlist-target="count">0</span></p>
  <p data-watchlist-target="empty">リストは空です</p>
  <ul data-watchlist-target="box"></ul>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("watchlist", class extends Controller {
  static targets = ["item", "count", "empty", "box"];

  add() {
    const li = document.createElement("li");
    li.setAttribute("data-watchlist-target", "item");
    const label = document.createElement("span");
    label.textContent = "ウォッチ項目";
    const button = document.createElement("button");
    button.textContent = "削除";
    button.setAttribute("data-action", "watchlist#remove");
    li.appendChild(label);
    li.appendChild(button);
    this.boxTarget.appendChild(li);
  }

  remove(event) {
    event.currentTarget.parentElement.remove();
  }

  itemTargetConnected() {
    this.refresh();
  }

  itemTargetDisconnected() {
    this.refresh();
  }

  refresh() {
    const count = this.itemTargets.length;
    this.countTarget.textContent = String(count);
    if (count === 0) {
      this.emptyTarget.classList.remove("hidden");
    } else {
      this.emptyTarget.classList.add("hidden");
    }
  }
});
<\/script>`,
      hints: [
        `2つのコールバックはどちらも中身1行、this.refresh(); だけです`,
        `refresh()では this.itemTargets.length を件数として使い、0ならclassList.remove("hidden")、それ以外ならclassList.add("hidden")です`
      ],
      check: `await sleep(100);
assert(text("[data-watchlist-target=count]") === "0", "最初は0件のはずです");
assert(!$("[data-watchlist-target=empty]").classList.contains("hidden"), "最初は「リストは空です」が表示されている（hiddenが付いていない）はずです");
click("[data-action='watchlist#add']");
await sleep(100);
click("[data-action='watchlist#add']");
await sleep(100);
assert(text("[data-watchlist-target=count]") === "2", "2回追加すると件数は「2」になるはずです。itemTargetConnectedでrefresh()を呼んでいますか？");
assert($("[data-watchlist-target=empty]").classList.contains("hidden"), "項目があるあいだは「リストは空です」にhiddenクラスが付くはずです");
const removeButtons = $$("[data-action='watchlist#remove']");
assert(removeButtons.length === 2, "各項目に「削除」ボタンが付いているはずです");
removeButtons[0].click();
await sleep(100);
assert(text("[data-watchlist-target=count]") === "1", "1件削除するとitemTargetDisconnectedが呼ばれ、件数は「1」になるはずです");
$$("[data-action='watchlist#remove']")[0].click();
await sleep(100);
assert(text("[data-watchlist-target=count]") === "0", "すべて削除すると件数は「0」になるはずです");
assert(!$("[data-watchlist-target=empty]").classList.contains("hidden"), "0件になったら「リストは空です」が再び表示される（hiddenが外れる）はずです");`
    }
  ]
});
