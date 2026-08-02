// 第24章：よくあるエラー：ライフサイクルと連携
registerChapter({
  number: 24,
  title: "よくあるエラー：ライフサイクルと連携",
  description: "ライフサイクル（initialize/connect/disconnect）とコントローラ間連携（dispatch・outlet・動的追加）で起きる典型バグを10個再現し、修正する訓練をします。",
  steps: [
    {
      id: 231,
      title: "disconnectでタイマーを解除し忘れる",
      explanation: `<p>この章では、ライフサイクルとコントローラ間連携のバグを再現して修正します。最初はタイマーの解除忘れです。</p>
<p>下のコードは、tickerコントローラが<code>connect()</code>で<code>setInterval</code>を開始し、150ミリ秒ごとにカウントを進めます。panelコントローラの停止ボタンはtickerの要素から<code>data-controller</code>属性を外します。属性が外れるとStimulusは<code>disconnect()</code>を呼ぶので、ここでタイマーを止めるのが正しい設計です。</p>
<p>ところがこのコードのdisconnectは空っぽです。すると次の2つの不具合が起きます。</p>
<ul>
<li><strong>停止しても動き続ける</strong>：コントローラは切断されたのに、setIntervalはJavaScript側で生き続けてカウントが増え続ける</li>
<li><strong>再開すると2倍速になる</strong>：再接続でconnectが再度呼ばれ、古いタイマーが残ったまま2本目のタイマーが走る（多重実行）</li>
</ul>
<p>エラーは一切出ないため気づきにくく、放置するとタイマーが増え続けてメモリと処理を浪費します。修正パターンは「connectで始めたものはdisconnectで必ず後始末する」です。</p>
<pre><code>connect() {
  this.timer = setInterval(() =&gt; { ... }, 150);
}
disconnect() {
  clearInterval(this.timer);
}</code></pre>
<p>setIntervalの戻り値（タイマーID）を<code>this.timer</code>に保存しておき、clearIntervalに渡すのがポイントです。イベントリスナーの手動登録なども同じ考え方で後始末します。</p>`,
      task: `disconnect()でclearInterval(this.timer)を呼び、停止ボタンでカウントが止まり、再開しても多重実行にならないようにしてください。`,
      code: `<div data-controller="panel">
  <button id="stop" data-action="panel#stop">停止</button>
  <button id="go" data-action="panel#go">再開</button>
  <p data-panel-target="box" data-controller="ticker">
    経過：<span data-ticker-target="count">0</span>
  </p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("ticker", class extends Controller {
  static targets = ["count"];
  connect() {
    this.count = 0;
    this.countTarget.textContent = this.count;
    this.timer = setInterval(() => {
      this.count = this.count + 1;
      this.countTarget.textContent = this.count;
    }, 150);
  }
  disconnect() {
    // TODO: ここでタイマーを解除しないと、停止後も動き続け、再開で多重実行になる
  }
});

application.register("panel", class extends Controller {
  static targets = ["box"];
  stop() {
    this.boxTarget.removeAttribute("data-controller");
  }
  go() {
    this.boxTarget.setAttribute("data-controller", "ticker");
  }
});
<\/script>`,
      solution: `<div data-controller="panel">
  <button id="stop" data-action="panel#stop">停止</button>
  <button id="go" data-action="panel#go">再開</button>
  <p data-panel-target="box" data-controller="ticker">
    経過：<span data-ticker-target="count">0</span>
  </p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("ticker", class extends Controller {
  static targets = ["count"];
  connect() {
    this.count = 0;
    this.countTarget.textContent = this.count;
    this.timer = setInterval(() => {
      this.count = this.count + 1;
      this.countTarget.textContent = this.count;
    }, 150);
  }
  disconnect() {
    clearInterval(this.timer);
  }
});

application.register("panel", class extends Controller {
  static targets = ["box"];
  stop() {
    this.boxTarget.removeAttribute("data-controller");
  }
  go() {
    this.boxTarget.setAttribute("data-controller", "ticker");
  }
});
<\/script>`,
      hints: [
        `停止ボタンを押してもカウントが増え続けることを確認しましょう。disconnectは呼ばれていますが中身が空です`,
        `setIntervalの戻り値はconnectでthis.timerに保存済みです`,
        `disconnect() { clearInterval(this.timer); } と書きます`
      ],
      check: `await sleep(200);
click("#stop");
await sleep(100);
const stopped = parseInt(text("[data-ticker-target=count]"), 10);
assert(stopped >= 1, "停止前にタイマーが動いてカウントが進んでいるはずです");
await sleep(450);
const after = parseInt(text("[data-ticker-target=count]"), 10);
assert(stopped === after, "停止ボタンの後はカウントが増えないはずです。disconnectでclearInterval(this.timer)を呼びましょう");
click("#go");
await sleep(400);
const restarted = parseInt(text("[data-ticker-target=count]"), 10);
assert(restarted >= 1, "再開ボタンで再びカウントが進むはずです");`
    },
    {
      id: 232,
      title: "dispatchのイベント名にはプレフィックスが付く",
      explanation: `<p>コントローラ間連携の基本、<code>this.dispatch()</code>のつまずきポイントです。ボタンを押しても受信側の表示が「未受信」のまま変わらず、エラーも出ません。</p>
<p>原因はイベント名です。<code>this.dispatch("ping")</code>と書くと、実際に発火するイベントの名前は<code>"ping"</code>ではなく、<strong>コントローラ名がプレフィックスとして付いた</strong><code>"beacon:ping"</code>になります。これは、複数のコントローラが同じ名前のイベントを出しても衝突しないようにするStimulusの仕様です。</p>
<p>受信側の<code>data-action="ping-&gt;listener#receive"</code>は、素の<code>"ping"</code>という名前のイベントを待っているため、<code>"beacon:ping"</code>は素通りしてしまいます。待ち合わせ場所がすれ違っているイメージです。</p>
<table>
<tr><th>書いたコード</th><th>実際のイベント名</th></tr>
<tr><td>this.dispatch("ping")（beaconコントローラ内）</td><td>beacon:ping</td></tr>
<tr><td>this.dispatch("saved")（formコントローラ内）</td><td>form:saved</td></tr>
</table>
<p>修正パターンは、受信側のdata-actionを<strong>コントローラ名:イベント名</strong>の形にすることです。</p>
<pre><code>&lt;div data-controller="listener"
     data-action="beacon:ping-&gt;listener#receive"&gt;</code></pre>
<p>デバッグの手がかりとしては、送信側で<code>console.log(this.dispatch("ping").type)</code>とすると実際のイベント名を確認できます（dispatchは発火したイベントを返します）。なお、dispatchしたイベントは既定でバブリング（親要素へ伝わる）するため、受信側の要素が送信側を包んでいれば届きます。</p>`,
      task: `受信側のdata-actionのイベント名を実際のイベント名（プレフィックス付き）に修正して、ボタンで「受信しました！」と表示されるようにしてください。`,
      code: `<!-- TODO: dispatch("ping")の実際のイベント名はbeacon:ping -->
<div data-controller="listener" data-action="ping->listener#receive">
  <div data-controller="beacon">
    <button data-action="beacon#send">ピンを送る</button>
  </div>
  <p data-listener-target="log">未受信</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("beacon", class extends Controller {
  send() {
    this.dispatch("ping");
  }
});

application.register("listener", class extends Controller {
  static targets = ["log"];
  receive() {
    this.logTarget.textContent = "受信しました！";
  }
});
<\/script>`,
      solution: `<div data-controller="listener" data-action="beacon:ping->listener#receive">
  <div data-controller="beacon">
    <button data-action="beacon#send">ピンを送る</button>
  </div>
  <p data-listener-target="log">未受信</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("beacon", class extends Controller {
  send() {
    this.dispatch("ping");
  }
});

application.register("listener", class extends Controller {
  static targets = ["log"];
  receive() {
    this.logTarget.textContent = "受信しました！";
  }
});
<\/script>`,
      hints: [
        `dispatch("ping")が発火するイベントの名前は、コントローラ名が付いたbeacon:pingです`,
        `受信側のdata-actionは素のpingを待っているのですれ違っています`,
        `data-action="beacon:ping->listener#receive"に修正しましょう`
      ],
      check: `assert($("[data-listener-target=log]"), "data-listener-target=logの要素が必要です");
click("button");
await sleep(50);
assert(text("[data-listener-target=log]") === "受信しました！", "ボタンを押すと「受信しました！」と表示されるはずです。dispatchのイベント名はbeacon:pingになる点に注意しましょう");`
    },
    {
      id: 233,
      title: "受信側data-actionのコロン記法ミス",
      explanation: `<p>前ステップでプレフィックスの存在は知っていても、<strong>区切り記号</strong>を間違えるパターンです。カートの追加ボタンを押しても合計バッジが0のまま更新されず、エラーも出ません。</p>
<p>受信側を見ると<code>data-action="cart-updated-&gt;badge#refresh"</code>と、コントローラ名とイベント名を<strong>ハイフン</strong>でつないでいます。Stimulusのdispatchが発火するイベント名は<code>cart:updated</code>と<strong>コロン区切り</strong>なので、<code>cart-updated</code>という別名のイベントを待っていることになり、永遠に受信できません。data-actionのイベント名部分は文字列として完全一致で照合されるだけなので、警告も出ないのです。</p>
<p>data-actionの構文を分解して確認しましょう。</p>
<pre><code>cart:updated-&gt;badge#refresh
└────┬────┘  └─┬─┘ └──┬──┘
 イベント名    受け手   メソッド
（コロン区切り）</code></pre>
<table>
<tr><th>記号</th><th>役割</th></tr>
<tr><td>:（コロン）</td><td>コントローラ名とイベント名の区切り（dispatchの命名）</td></tr>
<tr><td>-&gt;（矢印）</td><td>イベントと処理先の区切り</td></tr>
<tr><td>#（シャープ）</td><td>コントローラ名とメソッド名の区切り</td></tr>
</table>
<p>このコードのdispatchは<code>detail</code>で合計数も渡しています。受信側は<code>event.detail.total</code>で取り出せます。記号を1つ直すだけで、データ付きの連携が動き出します。</p>`,
      task: `受信側data-actionの区切り記号を修正して、追加ボタンを押すたびにバッジの数が更新されるようにしてください。`,
      code: `<!-- TODO: イベント名の区切りはハイフンではない -->
<div data-controller="badge" data-action="cart-updated->badge#refresh">
  <p>合計<span data-badge-target="count">0</span>点</p>
  <div data-controller="cart">
    <button data-action="cart#add">カートに追加</button>
  </div>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("cart", class extends Controller {
  connect() {
    this.total = 0;
  }
  add() {
    this.total = this.total + 1;
    this.dispatch("updated", { detail: { total: this.total } });
  }
});

application.register("badge", class extends Controller {
  static targets = ["count"];
  refresh(event) {
    this.countTarget.textContent = event.detail.total;
  }
});
<\/script>`,
      solution: `<div data-controller="badge" data-action="cart:updated->badge#refresh">
  <p>合計<span data-badge-target="count">0</span>点</p>
  <div data-controller="cart">
    <button data-action="cart#add">カートに追加</button>
  </div>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("cart", class extends Controller {
  connect() {
    this.total = 0;
  }
  add() {
    this.total = this.total + 1;
    this.dispatch("updated", { detail: { total: this.total } });
  }
});

application.register("badge", class extends Controller {
  static targets = ["count"];
  refresh(event) {
    this.countTarget.textContent = event.detail.total;
  }
});
<\/script>`,
      hints: [
        `dispatch("updated")の実際のイベント名はcart:updatedです。区切りはコロンです`,
        `受信側はcart-updatedとハイフン区切りで書いているため、別名のイベントを待っています`,
        `data-action="cart:updated->badge#refresh"に修正しましょう`
      ],
      check: `assert($("[data-badge-target=count]"), "data-badge-target=countの要素が必要です");
click("button");
await sleep(50);
click("button");
await sleep(50);
assert(text("[data-badge-target=count]") === "2", "2回追加するとバッジが2になるはずです。イベント名の区切りはcart:updatedのようにコロンです");`
    },
    {
      id: 234,
      title: "outlet属性はdata-自分-相手-outlet",
      explanation: `<p>outlet（他のコントローラのインスタンスを参照する仕組み）の属性名ミスです。有効化ボタンを押すとコンソールに次のようなエラーが出て、ステータス表示が変わりません。</p>
<pre><code>Missing outlet element "status" for host controller "panel"</code></pre>
<p>outletの属性名の規則は<strong>data-自分のコントローラ名-相手のコントローラ名-outlet="セレクタ"</strong>です。このコードでは<code>data-status-outlet</code>と、<strong>自分（panel）の名前が抜けた</strong>形で書いてしまっています。Stimulusが探すのは<code>data-panel-status-outlet</code>という属性なので、宣言だけあって接続先が見つからない状態になり、<code>this.statusOutlet</code>へアクセスした瞬間にMissing outletエラーが投げられます。</p>
<p>ターゲット属性（data-コントローラ名-target）より1つ要素が多いので混同しやすいところです。整理して覚えましょう。</p>
<table>
<tr><th>仕組み</th><th>属性の形</th><th>例</th></tr>
<tr><td>ターゲット</td><td>data-自分-target="名前"</td><td>data-panel-target="label"</td></tr>
<tr><td>outlet</td><td>data-自分-相手-outlet="セレクタ"</td><td>data-panel-status-outlet="#status"</td></tr>
</table>
<p>「自分がstatusという名前のoutletを持つ」ことをJS側で<code>static outlets = ["status"]</code>と宣言し、HTML側で「その実体はセレクタ#statusに一致する要素のstatusコントローラ」と指定する、という対応関係です。属性はoutletを<strong>使う側（自分）の要素</strong>に付ける点にも注意してください。</p>`,
      task: `outlet属性の名前を正しい規則（data-自分-相手-outlet）に修正して、有効化ボタンでステータスが「稼働中」になるようにしてください。`,
      code: `<!-- TODO: 属性名に自分のコントローラ名（panel）が抜けている -->
<div data-controller="panel" data-status-outlet="#status">
  <button data-action="panel#activate">有効化</button>
</div>

<p id="status" data-controller="status">
  状態：<span data-status-target="label">待機中</span>
</p>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("status", class extends Controller {
  static targets = ["label"];
  show() {
    this.labelTarget.textContent = "稼働中";
  }
});

application.register("panel", class extends Controller {
  static outlets = ["status"];
  activate() {
    this.statusOutlet.show();
  }
});
<\/script>`,
      solution: `<div data-controller="panel" data-panel-status-outlet="#status">
  <button data-action="panel#activate">有効化</button>
</div>

<p id="status" data-controller="status">
  状態：<span data-status-target="label">待機中</span>
</p>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("status", class extends Controller {
  static targets = ["label"];
  show() {
    this.labelTarget.textContent = "稼働中";
  }
});

application.register("panel", class extends Controller {
  static outlets = ["status"];
  activate() {
    this.statusOutlet.show();
  }
});
<\/script>`,
      hints: [
        `ボタンを押すとコンソールにMissing outlet element "status"のエラーが出ています`,
        `outlet属性の規則はdata-自分のコントローラ名-相手のコントローラ名-outletです`,
        `data-panel-status-outlet="#status"に修正しましょう`
      ],
      check: `assert($("[data-panel-status-outlet]"), "属性名はdata-panel-status-outletです。自分（panel）と相手（status）の両方の名前が必要です");
click("button");
await sleep(50);
assert(text("[data-status-target=label]") === "稼働中", "有効化ボタンでステータスが「稼働中」になるはずです");`
    },
    {
      id: 235,
      title: "outletセレクタが要素に一致しない",
      explanation: `<p>今度はoutlet属性の名前は正しいのに、<strong>値のセレクタ</strong>が間違っているパターンです。通報ボタンを押すと、前ステップと同じ系統のエラーが出ます。</p>
<pre><code>Missing outlet element "monitor" for host controller "alerts"</code></pre>
<p>outlet属性の値はCSSセレクタで、Stimulusはこのセレクタに一致する要素を探して接続します。このコードでは<code>#monitor-panel</code>と指定していますが、実際の要素のidは<code>monitor</code>なので一致する要素がなく、outletは空のままです。</p>
<p>同じエラー文でも原因が複数あり得るのがoutletのデバッグの難所です。チェックリストとして覚えましょう。</p>
<ol>
<li><strong>属性名</strong>は正しいか（data-自分-相手-outlet。前ステップ）</li>
<li><strong>セレクタ</strong>に一致する要素が実在するか（このステップ。コンソールでdocument.querySelectorを試すと確実）</li>
<li>一致した要素に<strong>data-controller="相手"</strong>が付いているか（outletの接続先は「要素」ではなく「その要素のコントローラ」なので、相手側のdata-controllerが必須）</li>
<li>相手のコントローラが<strong>register済み</strong>か</li>
</ol>
<p>特に3は見落としがちです。セレクタが合っていても、相手の要素からdata-controller属性が抜けていれば接続されません。「セレクタで場所を指し、data-controllerで実体を得る」という2段構えを意識しましょう。今回は2のセレクタ間違いなので、実際のidに合わせて修正します。</p>`,
      task: `outlet属性のセレクタを実際の要素に一致するよう修正して、通報ボタンで監視パネルに「異常を検知！」と表示されるようにしてください。`,
      code: `<!-- TODO: セレクタ#monitor-panelに一致する要素がページ内に無い -->
<div data-controller="alerts" data-alerts-monitor-outlet="#monitor-panel">
  <button data-action="alerts#notify">異常を通報</button>
</div>

<p id="monitor" data-controller="monitor">
  監視：<span data-monitor-target="log">異常なし</span>
</p>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("monitor", class extends Controller {
  static targets = ["log"];
  warn() {
    this.logTarget.textContent = "異常を検知！";
  }
});

application.register("alerts", class extends Controller {
  static outlets = ["monitor"];
  notify() {
    this.monitorOutlet.warn();
  }
});
<\/script>`,
      solution: `<div data-controller="alerts" data-alerts-monitor-outlet="#monitor">
  <button data-action="alerts#notify">異常を通報</button>
</div>

<p id="monitor" data-controller="monitor">
  監視：<span data-monitor-target="log">異常なし</span>
</p>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("monitor", class extends Controller {
  static targets = ["log"];
  warn() {
    this.logTarget.textContent = "異常を検知！";
  }
});

application.register("alerts", class extends Controller {
  static outlets = ["monitor"];
  notify() {
    this.monitorOutlet.warn();
  }
});
<\/script>`,
      hints: [
        `属性名data-alerts-monitor-outletは正しい形です。今回は値のセレクタが問題です`,
        `セレクタは#monitor-panelですが、実際の要素のidはmonitorです`,
        `data-alerts-monitor-outlet="#monitor"に修正しましょう`
      ],
      check: `const attr = $("[data-alerts-monitor-outlet]");
assert(attr, "data-alerts-monitor-outlet属性を持つ要素が必要です");
assert($(attr.getAttribute("data-alerts-monitor-outlet")), "outlet属性のセレクタに一致する要素がページ内にありません。実際のid（monitor）に合わせましょう");
click("button");
await sleep(50);
assert(text("[data-monitor-target=log]") === "異常を検知！", "通報ボタンで監視パネルに「異常を検知！」と表示されるはずです");`
    },
    {
      id: 236,
      title: "initializeとconnectの取り違え",
      explanation: `<p>ライフサイクルメソッドの使い分けを誤るバグです。最初は正しく「稼働中」と表示されるのに、停止→再開すると「停止中」のまま戻らなくなります。<strong>最初の1回だけ動いて、2回目から動かない</strong>という症状が特徴です。</p>
<p>原因はinitializeとconnectの役割の違いにあります。</p>
<table>
<tr><th>メソッド</th><th>呼ばれるタイミング</th><th>用途</th></tr>
<tr><td>initialize()</td><td>インスタンス生成時に<strong>一生に1回だけ</strong></td><td>一度きりの初期化（設定の読み込みなど）</td></tr>
<tr><td>connect()</td><td>DOMに接続される<strong>たびに毎回</strong></td><td>表示の初期化、タイマー開始など</td></tr>
<tr><td>disconnect()</td><td>DOMから切断されるたびに毎回</td><td>後始末</td></tr>
</table>
<p>重要なのは、data-controller属性を外して付け直しても、同じ要素なら<strong>同じコントローラインスタンスが再利用される</strong>という点です。つまりinitializeは再接続では呼ばれず、connectだけがもう一度呼ばれます。このコードは「稼働中」の表示をinitializeに書いてしまったため、再接続時には誰も表示を戻してくれないのです。</p>
<p>修正パターンは、<strong>接続のたびに必要な処理はconnectに書く</strong>ことです。迷ったらconnectに書くのが安全で、initializeを使うのは「本当に一度きりでよい」と確信できる処理だけにしましょう。Turboでページを行き来するRailsアプリでは要素の接続・切断が頻繁に起きるため、この使い分けは実務でも重要です。</p>`,
      task: `「稼働中」の表示処理をinitializeからconnectに移して、停止→再開の後も「稼働中」に戻るようにしてください。`,
      code: `<div data-controller="app">
  <button id="off" data-action="app#off">停止</button>
  <button id="on" data-action="app#on">再開</button>
  <p data-app-target="widget" data-controller="widget"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("widget", class extends Controller {
  // TODO: initializeは最初の1回しか呼ばれない。再接続のたびに表示を戻すにはconnectを使う
  initialize() {
    this.element.textContent = "稼働中";
  }
  disconnect() {
    this.element.textContent = "停止中";
  }
});

application.register("app", class extends Controller {
  static targets = ["widget"];
  off() {
    this.widgetTarget.removeAttribute("data-controller");
  }
  on() {
    this.widgetTarget.setAttribute("data-controller", "widget");
  }
});
<\/script>`,
      solution: `<div data-controller="app">
  <button id="off" data-action="app#off">停止</button>
  <button id="on" data-action="app#on">再開</button>
  <p data-app-target="widget" data-controller="widget"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("widget", class extends Controller {
  connect() {
    this.element.textContent = "稼働中";
  }
  disconnect() {
    this.element.textContent = "停止中";
  }
});

application.register("app", class extends Controller {
  static targets = ["widget"];
  off() {
    this.widgetTarget.removeAttribute("data-controller");
  }
  on() {
    this.widgetTarget.setAttribute("data-controller", "widget");
  }
});
<\/script>`,
      hints: [
        `停止→再開の操作をすると「停止中」のまま戻らないことを確認しましょう`,
        `initializeはインスタンス生成時の1回だけ、connectは接続のたびに毎回呼ばれます`,
        `initializeをconnectに書き換えれば、再接続のたびに「稼働中」が表示されます`
      ],
      check: `assert(text("[data-app-target=widget]") === "稼働中", "接続直後は「稼働中」と表示されるはずです");
click("#off");
await sleep(50);
assert(text("[data-app-target=widget]") === "停止中", "停止ボタンでdisconnectが呼ばれ「停止中」になるはずです");
click("#on");
await sleep(50);
assert(text("[data-app-target=widget]") === "稼働中", "再開後は「稼働中」に戻るはずです。initializeは再接続では呼ばれません。connectに移しましょう");`
    },
    {
      id: 237,
      title: "動的に追加した要素にdata-controllerを付け忘れ",
      explanation: `<p>JSで後から挿入したHTMLが動かないパターンです。「記事を追加」でカードは表示されるのに、カードの中の「いいね」ボタンを押しても何も起きず、エラーも出ません。</p>
<p>挿入しているHTMLをよく見ると、ボタンに<code>data-action="card#like"</code>、数字に<code>data-card-target="num"</code>は付いているのに、<strong>肝心のカードのdivに<code>data-controller="card"</code>がありません</strong>。data-actionやターゲットは、祖先にあるdata-controller要素のスコープに属して初めて機能します。スコープの外にあるdata-actionはただの飾りです。</p>
<p>ここで思い出してほしいのがStimulusの強みです。StimulusはMutationObserver（DOMの変化を監視する仕組み）で常にページを見張っているので、<strong>後から挿入された要素でもdata-controller属性さえ付いていれば自動で接続されます</strong>。「動的に追加した要素にはイベントを付け直す」といった古いjQuery時代の作業は不要で、必要なのは属性を正しく書くことだけです。</p>
<pre><code>this.listTarget.insertAdjacentHTML("beforeend",
  '&lt;div data-controller="card"&gt;' +
  '&lt;button data-action="card#like"&gt;いいね&lt;/button&gt;' +
  ...</code></pre>
<p>動的挿入したUIが無反応のときのチェックポイントは、開発者ツールで挿入後のHTMLを実際に見て、（1）data-controllerがあるか、（2）data-actionやターゲットがそのスコープ内にあるか、を確認することです。</p>`,
      task: `挿入するHTMLのdivにdata-controller="card"を追加して、追加したカードのいいねボタンが動くようにしてください。`,
      code: `<div data-controller="board">
  <button id="add" data-action="board#add">記事を追加</button>
  <div data-board-target="list"></div>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("board", class extends Controller {
  static targets = ["list"];
  add() {
    // TODO: 追加するHTMLのdivにdata-controller="card"が無いため、
    // 中のdata-actionがどのコントローラにも属さず、押しても何も起きない
    this.listTarget.insertAdjacentHTML("beforeend",
      '<div>' +
      '<button data-action="card#like">いいね</button>' +
      ' <span data-card-target="num">0</span>' +
      '</div>');
  }
});

application.register("card", class extends Controller {
  static targets = ["num"];
  like() {
    this.numTarget.textContent = parseInt(this.numTarget.textContent, 10) + 1;
  }
});
<\/script>`,
      solution: `<div data-controller="board">
  <button id="add" data-action="board#add">記事を追加</button>
  <div data-board-target="list"></div>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("board", class extends Controller {
  static targets = ["list"];
  add() {
    this.listTarget.insertAdjacentHTML("beforeend",
      '<div data-controller="card">' +
      '<button data-action="card#like">いいね</button>' +
      ' <span data-card-target="num">0</span>' +
      '</div>');
  }
});

application.register("card", class extends Controller {
  static targets = ["num"];
  like() {
    this.numTarget.textContent = parseInt(this.numTarget.textContent, 10) + 1;
  }
});
<\/script>`,
      hints: [
        `開発者ツールで追加後のHTMLを見ると、カードのdivにdata-controllerがありません`,
        `data-actionはdata-controllerのスコープ内でしか機能しません`,
        `挿入する文字列のdivをdata-controller="card"付きに直せば、Stimulusが自動で接続してくれます`
      ],
      check: `click("#add");
await sleep(100);
assert($("[data-board-target=list] button"), "追加ボタンでいいねボタン付きのカードが追加されるはずです");
click("[data-board-target=list] button");
await sleep(50);
assert(text("[data-card-target=num]") === "1", "追加したカードのいいねボタンを押すと1になるはずです。カードのdivにdata-controller=\\"card\\"が付いているか確認しましょう");`
    },
    {
      id: 238,
      title: "targetConnectedの引数は要素そのもの",
      explanation: `<p>ターゲットの接続・切断を検知するコールバック<code>xxxTargetConnected</code>のつまずきポイントです。メンバーを追加してもリストの文字が緑色にならず、コンソールには次のようなエラーが出ます。</p>
<pre><code>TypeError: Cannot read properties of undefined (reading 'classList')</code></pre>
<p>このコールバックはアクションと形が似ているため、第1引数をイベントオブジェクトだと思い込んで<code>event.target</code>と書いてしまいがちです。しかし実際の仕様は違います。</p>
<table>
<tr><th>メソッド</th><th>第1引数</th><th>取り出し方</th></tr>
<tr><td>アクション（likeなど）</td><td>イベント</td><td>event.targetで要素を得る</td></tr>
<tr><td>memberTargetConnected</td><td><strong>接続された要素そのもの</strong></td><td>引数をそのまま使う</td></tr>
<tr><td>memberTargetDisconnected</td><td>切断された要素そのもの</td><td>引数をそのまま使う</td></tr>
</table>
<p>要素に<code>.target</code>というプロパティは無いのでundefinedになり、その<code>.classList</code>を読もうとしてTypeErrorになる、というのがエラーの正体です。修正は引数を要素として素直に使うだけです。</p>
<pre><code>memberTargetConnected(element) {
  element.classList.add("new");
}</code></pre>
<p>もう1つ大事な仕様として、このコールバックは<strong>コントローラ接続時に既存のターゲットに対しても1回ずつ呼ばれます</strong>。つまり最初からHTMLに書いてあるliにも発火するので、初期表示の装飾にも使えます。動的に増減するリストの「追加されたら装飾する」「削除されたら集計し直す」といった処理の定番の置き場所です。</p>`,
      task: `memberTargetConnectedの引数を要素として正しく扱い、最初のliにも追加したliにもnewクラスが付くようにしてください。`,
      code: `<style>
  .new { color: green; font-weight: bold; }
</style>

<div data-controller="roster">
  <button id="add" data-action="roster#add">メンバー追加</button>
  <ul data-roster-target="list">
    <li data-roster-target="member">最初のメンバー</li>
  </ul>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("roster", class extends Controller {
  static targets = ["list", "member"];
  // TODO: 第1引数はイベントではなく「接続された要素そのもの」
  memberTargetConnected(event) {
    event.target.classList.add("new");
  }
  add() {
    this.listTarget.insertAdjacentHTML("beforeend",
      '<li data-roster-target="member">新しいメンバー</li>');
  }
});
<\/script>`,
      solution: `<style>
  .new { color: green; font-weight: bold; }
</style>

<div data-controller="roster">
  <button id="add" data-action="roster#add">メンバー追加</button>
  <ul data-roster-target="list">
    <li data-roster-target="member">最初のメンバー</li>
  </ul>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("roster", class extends Controller {
  static targets = ["list", "member"];
  memberTargetConnected(element) {
    element.classList.add("new");
  }
  add() {
    this.listTarget.insertAdjacentHTML("beforeend",
      '<li data-roster-target="member">新しいメンバー</li>');
  }
});
<\/script>`,
      hints: [
        `コンソールにTypeError: Cannot read properties of undefined (reading 'classList')と出ています`,
        `memberTargetConnectedの第1引数はイベントではなく、接続されたli要素そのものです`,
        `引数名をelementにして、element.classList.add("new")と直接使いましょう`
      ],
      check: `await sleep(50);
assert($$("li").length === 1, "最初はメンバーが1人のはずです");
assert($("li").classList.contains("new"), "コントローラ接続時に既存のliにもmemberTargetConnectedが呼ばれ、newクラスが付くはずです。引数の扱いを確認しましょう");
click("#add");
await sleep(100);
assert($$("li").length === 2, "追加ボタンでliが2つになるはずです");
assert($$("li")[1].classList.contains("new"), "追加されたliにもnewクラスが付くはずです");`
    },
    {
      id: 239,
      title: "直接呼び出しをdispatchに直す",
      explanation: `<p>コントローラ間連携の設計ミスです。カートの追加ボタンを押すと、コンソールに次のようなエラーが出て通知バッジが増えません。</p>
<pre><code>TypeError: document.querySelector(...).bump is not a function</code></pre>
<p>このコードは、cartコントローラからbadgeコントローラのメソッドを直接呼ぼうとして、<code>document.querySelector</code>で要素を取得し<code>.bump()</code>を呼んでいます。しかしquerySelectorが返すのは<strong>ただのDOM要素</strong>で、コントローラのインスタンスではありません。要素はbumpというメソッドを持っていないため、TypeErrorになります。<strong>要素とコントローラは別物</strong>、というのがStimulusを理解する上での重要ポイントです。</p>
<p>仮に何らかの方法でインスタンスを取得して直接呼べたとしても、この設計にはcartがbadgeの存在とメソッド名を知っていなければならないという密結合の問題が残ります。badgeを画面から外しただけでcartが壊れる、といった連鎖が起きやすいのです。</p>
<p>Stimulusらしい修正パターンは<strong>dispatchによる疎結合な連携</strong>です。送信側は「追加したよ」と叫ぶだけで、誰が聞いているかを知りません。</p>
<pre><code>// 送信側（cart）
this.dispatch("added");

// 受信側（badgeの要素）
data-action="cart:added@window-&gt;badge#bump"</code></pre>
<p>今回badgeはcartの親ではなく<strong>隣（兄弟要素）</strong>なので、バブリングしてきたイベントを自分の要素では受け取れません。そこで<code>@window</code>を付けて、windowまで昇ってきたイベントを待ち受けます。これで両者は互いを知らないまま連携できます。</p>`,
      task: `cartの直接呼び出しをthis.dispatch("added")に書き換え、badge側にdata-action="cart:added@window->badge#bump"を追加して連携させてください。`,
      code: `<div data-controller="badge">
  通知：<span data-badge-target="count">0</span>件
</div>

<div data-controller="cart">
  <button data-action="cart#add">カートに入れる</button>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("badge", class extends Controller {
  static targets = ["count"];
  bump() {
    this.countTarget.textContent = parseInt(this.countTarget.textContent, 10) + 1;
  }
});

application.register("cart", class extends Controller {
  add() {
    // TODO: querySelectorで取れるのはただのDOM要素で、bumpメソッドは持っていない。
    // dispatchで通知し、badge側のdata-actionで受け取る形に直す
    document.querySelector("[data-controller=badge]").bump();
  }
});
<\/script>`,
      solution: `<div data-controller="badge" data-action="cart:added@window->badge#bump">
  通知：<span data-badge-target="count">0</span>件
</div>

<div data-controller="cart">
  <button data-action="cart#add">カートに入れる</button>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("badge", class extends Controller {
  static targets = ["count"];
  bump() {
    this.countTarget.textContent = parseInt(this.countTarget.textContent, 10) + 1;
  }
});

application.register("cart", class extends Controller {
  add() {
    this.dispatch("added");
  }
});
<\/script>`,
      hints: [
        `querySelectorが返すのはDOM要素であってコントローラではないので、bumpは呼べません`,
        `送信側はthis.dispatch("added")だけにします。イベント名はcart:addedになります`,
        `badgeはcartの親ではないので、data-action="cart:added@window->badge#bump"と@windowで受けます`
      ],
      check: `assert($("[data-badge-target=count]"), "data-badge-target=countの要素が必要です");
click("[data-controller=cart] button");
await sleep(50);
click("[data-controller=cart] button");
await sleep(50);
assert(text("[data-badge-target=count]") === "2", "2回追加すると通知バッジが2になるはずです。dispatchと@window付きのdata-actionで連携させましょう");`
    },
    {
      id: 240,
      title: "総合演習：連携のバグを全部直す",
      explanation: `<p>この章の総合演習です。ミニカート（追加ボタン→バッジの個数が増え、ステータス欄にメッセージが出る）に、この章で学んだ連携バグが<strong>3つ</strong>仕込まれています。1つ直すごとに動く範囲が広がるので、症状を観察しながら1つずつ潰していきましょう。</p>
<p>期待する完成形の動きは次のとおりです。</p>
<ul>
<li>追加ボタンを押すとバッジの個数が1ずつ増える（dispatchをbadgeが受信）</li>
<li>同時にステータス欄が「商品を追加しました」になる（outlet経由でstatusを呼ぶ）</li>
</ul>
<p>デバッグの手順のおさらいです。</p>
<ol>
<li><strong>バッジが増えない</strong>：dispatchの実際のイベント名は「コントローラ名:イベント名」。受信側のdata-actionがその名前と完全一致しているか確認する</li>
<li><strong>コンソールにMissing outletエラー</strong>：outlet属性の名前がdata-自分-相手-outletの形になっているか確認する</li>
<li><strong>名前を直してもまだMissing outlet</strong>：属性の値（セレクタ）に一致する要素が実在するか、開発者ツールで確認する</li>
</ol>
<table>
<tr><th>症状</th><th>疑う場所</th></tr>
<tr><td>受信側が無反応（エラーなし）</td><td>イベント名のプレフィックスと区切り記号</td></tr>
<tr><td>Missing outlet element ...</td><td>outlet属性の名前→次にセレクタ→次に相手のdata-controller</td></tr>
</table>
<p>outletのエラーは1つ直すと次の原因が見えてくる「多段のバグ」になりがちです。エラー文が消えるまで、チェックリストを上から順にたどる習慣をつけましょう。</p>`,
      task: `3つのバグ（受信側のイベント名、outlet属性の名前、outletセレクタ）をすべて修正し、追加ボタンでバッジとステータスの両方が更新されるようにしてください。`,
      code: `<!-- バグ1：dispatchの実際のイベント名はcart:added -->
<div data-controller="badge" data-action="added->badge#bump">
  カート：<span data-badge-target="count">0</span>個
  <!-- バグ2：outlet属性名に自分（cart）の名前が抜けている -->
  <!-- バグ3：セレクタが実際のid（statusbox）と一致していない -->
  <div data-controller="cart" data-status-outlet="#status-box">
    <button data-action="cart#add">商品を追加</button>
  </div>
</div>

<p id="statusbox" data-controller="status">
  <span data-status-target="label">操作なし</span>
</p>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("badge", class extends Controller {
  static targets = ["count"];
  bump() {
    this.countTarget.textContent = parseInt(this.countTarget.textContent, 10) + 1;
  }
});

application.register("status", class extends Controller {
  static targets = ["label"];
  show(message) {
    this.labelTarget.textContent = message;
  }
});

application.register("cart", class extends Controller {
  static outlets = ["status"];
  add() {
    this.dispatch("added");
    this.statusOutlet.show("商品を追加しました");
  }
});
<\/script>`,
      solution: `<div data-controller="badge" data-action="cart:added->badge#bump">
  カート：<span data-badge-target="count">0</span>個
  <div data-controller="cart" data-cart-status-outlet="#statusbox">
    <button data-action="cart#add">商品を追加</button>
  </div>
</div>

<p id="statusbox" data-controller="status">
  <span data-status-target="label">操作なし</span>
</p>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("badge", class extends Controller {
  static targets = ["count"];
  bump() {
    this.countTarget.textContent = parseInt(this.countTarget.textContent, 10) + 1;
  }
});

application.register("status", class extends Controller {
  static targets = ["label"];
  show(message) {
    this.labelTarget.textContent = message;
  }
});

application.register("cart", class extends Controller {
  static outlets = ["status"];
  add() {
    this.dispatch("added");
    this.statusOutlet.show("商品を追加しました");
  }
});
<\/script>`,
      hints: [
        `バグ1：badgeのdata-actionはaddedを待っていますが、実際のイベント名はcart:addedです`,
        `バグ2：outlet属性はdata-cart-status-outletの形です（自分-相手-outlet）`,
        `バグ3：属性名を直してもMissing outletが出ます。セレクタは実際のidに合わせて#statusboxです`
      ],
      check: `click("[data-controller=cart] button");
await sleep(50);
assert(text("[data-badge-target=count]") === "1", "1回追加するとバッジが1になるはずです。dispatchの実際のイベント名はcart:addedです");
assert(text("[data-status-target=label]") === "商品を追加しました", "ステータス欄が「商品を追加しました」になるはずです。outlet属性の名前とセレクタを確認しましょう");
click("[data-controller=cart] button");
await sleep(50);
assert(text("[data-badge-target=count]") === "2", "2回追加するとバッジが2になるはずです");`
    }
  ]
});
