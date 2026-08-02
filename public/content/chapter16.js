// 第16章：タイマーと後始末
registerChapter({
  number: 16,
  title: "タイマーと後始末",
  description: "setInterval・setTimeoutをStimulusのライフサイクルと正しく組み合わせ、disconnectでの後始末やデバウンス・スロットリングまでを習得します。",
  steps: [
    {
      id: 151,
      title: "setIntervalとconnect",
      explanation: `<p>この章では時間を扱うUIを作ります。まずはブラウザ標準の<code>setInterval</code>です。第1引数の関数を、第2引数のミリ秒間隔で繰り返し実行します。</p>
<pre><code>const id = setInterval(() =&gt; {
  console.log("0.1秒ごとに実行");
}, 100);</code></pre>
<p>戻り値の<code>id</code>はタイマーの識別番号で、後で止めるときに使います（次のステップで扱います）。</p>
<p>Stimulusで「表示された瞬間から動き出す時計」のようなものを作るには、第9章で学んだ<code>connect()</code>でsetIntervalを開始するのが定石です。コールバックにアロー関数を使えば、<code>this</code>はコントローラのままなので、中で<code>this.outputTarget</code>などがそのまま使えます。</p>
<pre><code>connect() {
  this.count = 0;
  this.timer = setInterval(() =&gt; {
    this.count = this.count + 1;
    this.outputTarget.textContent = this.count;
  }, 100);
}</code></pre>
<p>タイマーのIDを<code>this.timer</code>としてインスタンス変数に保存している点に注目してください。この教材では動作確認しやすいよう、間隔は100ミリ秒（0.1秒）にしています。実際の時計なら1000ミリ秒にするだけです。</p>`,
      task: `connectの中でsetIntervalを開始し、0.1秒ごとにカウントが1ずつ増えて表示されるようにTODOを埋めてください。`,
      code: `<div data-controller="ticker">
  <p>カウント: <span id="count" data-ticker-target="output">0</span></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("ticker", class extends Controller {
  static targets = ["output"];
  connect() {
    this.count = 0;
    // TODO: setIntervalで100ミリ秒ごとにthis.countを1増やし、
    // outputTargetに表示する。戻り値はthis.timerに保存する
  }
});
<\/script>`,
      solution: `<div data-controller="ticker">
  <p>カウント: <span id="count" data-ticker-target="output">0</span></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("ticker", class extends Controller {
  static targets = ["output"];
  connect() {
    this.count = 0;
    this.timer = setInterval(() => {
      this.count = this.count + 1;
      this.outputTarget.textContent = this.count;
    }, 100);
  }
});
<\/script>`,
      hints: [
        `this.timer = setInterval(() => { ... }, 100); の形です`,
        `アロー関数の中ではthisがコントローラのままなので、this.countやthis.outputTargetが使えます`
      ],
      check: `const before = Number(text("#count"));
assert(!Number.isNaN(before), "#countには数値が表示されているはずです");
await sleep(250);
const after = Number(text("#count"));
assert(after > before, "0.1秒ごとにカウントが増え続けるはずです。connectでsetIntervalを開始しましたか？");`
    },
    {
      id: 152,
      title: "disconnectでclearInterval（リークの防止）",
      explanation: `<p>setIntervalで開始したタイマーは、<strong>要素が消えても自動では止まりません</strong>。コントローラの要素がDOMから削除されるとdisconnectは呼ばれますが、タイマーはブラウザに登録されたまま動き続け、もう存在しない要素を更新しようとし続けます。これがタイマーのリーク（漏れ）で、メモリの無駄遣いや思わぬバグの原因になります。</p>
<p>止めるには<code>clearInterval(id)</code>を使います。setIntervalの戻り値を<code>this.timer</code>に保存しておいたのはこのためです。開始と対になる場所、つまり<code>disconnect()</code>で呼ぶのが鉄則です。</p>
<pre><code>connect() {
  this.timer = setInterval(() =&gt; { ... }, 100);
}
disconnect() {
  clearInterval(this.timer);
}</code></pre>
<p>今回のコードでは、リークが目に見えるように、タイマーがコントローラの外にある「拍動」の数字をあえて増やし続けます。ボタンで要素ごと削除したあとも拍動が増え続けたら、それがリークです。「connectで始めたものはdisconnectで止める」は、この章で一番大事な習慣です。第18章で学ぶTurboと組み合わせる際も、この後始末が効いてきます。</p>`,
      task: `ボタンでコントローラの要素を削除したあと、拍動が増え続けないように、disconnectでタイマーを止めてください。`,
      code: `<p>拍動: <span id="beat">0</span></p>

<div data-controller="ticker">
  <p>このコントローラは0.1秒ごとに上の拍動を増やします。</p>
  <button id="remove" data-action="click->ticker#removeSelf">要素ごと削除する</button>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("ticker", class extends Controller {
  connect() {
    this.timer = setInterval(() => {
      const beat = document.getElementById("beat");
      beat.textContent = Number(beat.textContent) + 1;
    }, 100);
  }
  removeSelf() {
    this.element.remove();
  }
  disconnect() {
    // TODO: clearIntervalでthis.timerを止める
  }
});
<\/script>`,
      solution: `<p>拍動: <span id="beat">0</span></p>

<div data-controller="ticker">
  <p>このコントローラは0.1秒ごとに上の拍動を増やします。</p>
  <button id="remove" data-action="click->ticker#removeSelf">要素ごと削除する</button>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("ticker", class extends Controller {
  connect() {
    this.timer = setInterval(() => {
      const beat = document.getElementById("beat");
      beat.textContent = Number(beat.textContent) + 1;
    }, 100);
  }
  removeSelf() {
    this.element.remove();
  }
  disconnect() {
    clearInterval(this.timer);
  }
});
<\/script>`,
      hints: [
        `disconnect() { clearInterval(this.timer); } の1行です`,
        `要素が削除されるとStimulusがdisconnectを呼んでくれるので、そこで止めれば漏れません`
      ],
      check: `assert(Number(text("#beat")) > 0, "接続直後からタイマーが動いて拍動が増えているはずです");
click("#remove");
await sleep(150);
const a = Number(text("#beat"));
await sleep(250);
const b = Number(text("#beat"));
assert(b === a, "要素を削除したあとも拍動が増え続けています。disconnect()でclearInterval(this.timer)を呼んでタイマーを止めてください");`
    },
    {
      id: 153,
      title: "カウントダウンタイマー",
      explanation: `<p>残り秒数を減らしていき、0になったら「終了！」と表示するカウントダウンを作ります。ここでは第6章・第7章で学んだvaluesとvalueChangedを組み合わせます。役割分担は次の通りです。</p>
<table>
<tr><th>担当</th><th>やること</th></tr>
<tr><td>setIntervalのコールバック</td><td><code>secondsValue</code>を1ずつ減らす。0以下になったらclearInterval</td></tr>
<tr><td><code>secondsValueChanged</code></td><td>値に応じて表示を更新（0以下なら「終了！」）</td></tr>
</table>
<p>「値を変える処理」と「表示する処理」を分けておくと、表示のルールを変えたいときにvalueChangedだけ直せばよくなります。0になった瞬間にタイマー自身を止めるのを忘れないでください。止めないと残り秒数がマイナスへ進み続けます。</p>
<pre><code>start() {
  this.timer = setInterval(() =&gt; {
    this.secondsValue = this.secondsValue - 1;
    if (this.secondsValue &lt;= 0) {
      clearInterval(this.timer);
    }
  }, 100);
}</code></pre>
<p>初期値はHTMLの<code>data-countdown-seconds-value="3"</code>から来ています。実際のタイマーなら間隔は1000ミリ秒ですが、教材では確認しやすいよう100ミリ秒＝0.1秒を1秒とみなして早回ししています。</p>`,
      task: `スタートで0.1秒ごとに残り秒数が減り、0になったら「終了！」と表示されてタイマーが止まるように、startメソッドを実装してください。`,
      code: `<div data-controller="countdown" data-countdown-seconds-value="3">
  <p id="display" data-countdown-target="output"></p>
  <button id="start" data-action="click->countdown#start">スタート</button>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("countdown", class extends Controller {
  static targets = ["output"];
  static values = { seconds: Number };
  secondsValueChanged() {
    if (this.secondsValue <= 0) {
      this.outputTarget.textContent = "終了！";
    } else {
      this.outputTarget.textContent = "残り" + this.secondsValue + "秒";
    }
  }
  start() {
    // TODO: setInterval（100ミリ秒間隔）でsecondsValueを1ずつ減らし、
    // 0以下になったらclearIntervalで止める
  }
  disconnect() {
    clearInterval(this.timer);
  }
});
<\/script>`,
      solution: `<div data-controller="countdown" data-countdown-seconds-value="3">
  <p id="display" data-countdown-target="output"></p>
  <button id="start" data-action="click->countdown#start">スタート</button>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("countdown", class extends Controller {
  static targets = ["output"];
  static values = { seconds: Number };
  secondsValueChanged() {
    if (this.secondsValue <= 0) {
      this.outputTarget.textContent = "終了！";
    } else {
      this.outputTarget.textContent = "残り" + this.secondsValue + "秒";
    }
  }
  start() {
    this.timer = setInterval(() => {
      this.secondsValue = this.secondsValue - 1;
      if (this.secondsValue <= 0) {
        clearInterval(this.timer);
      }
    }, 100);
  }
  disconnect() {
    clearInterval(this.timer);
  }
});
<\/script>`,
      hints: [
        `コールバックの中でthis.secondsValue = this.secondsValue - 1; とすれば、表示はvalueChangedが自動で更新します`,
        `if (this.secondsValue <= 0) { clearInterval(this.timer); } を忘れるとマイナスに進み続けます`
      ],
      check: `assert(text("#display") === "残り3秒", "最初は初期値に合わせて「残り3秒」と表示されているはずです");
click("#start");
await sleep(150);
assert(text("#display") !== "残り3秒", "スタート後は0.1秒ごとに残り秒数が減っていくはずです");
await sleep(350);
assert(text("#display") === "終了！", "残りが0になったら「終了！」と表示されるはずです");`
    },
    {
      id: 154,
      title: "経過時間の表示（秒→分:秒整形）",
      explanation: `<p>経過時間を秒数のまま「125」と表示しても分かりにくいので、「2:05」のような分:秒の形式に整形します。必要な計算は2つだけです。</p>
<table>
<tr><th>求めるもの</th><th>計算</th><th>125秒の例</th></tr>
<tr><td>分</td><td><code>Math.floor(total / 60)</code>（60で割って切り捨て）</td><td>2</td></tr>
<tr><td>残りの秒</td><td><code>total % 60</code>（60で割った余り）</td><td>5</td></tr>
</table>
<p>秒の部分は「05」のように常に2桁で表示したいところです。ここで便利なのが文字列の<code>padStart(桁数, 埋める文字)</code>メソッドで、足りない分を先頭に埋めてくれます。</p>
<pre><code>format(total) {
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return minutes + ":" + String(seconds).padStart(2, "0");
}</code></pre>
<p><code>seconds</code>は数値なので、いったん<code>String()</code>で文字列にしてからpadStartを呼ぶ点に注意してください。整形ロジックを<code>format</code>という独立したメソッドに切り出しているのは、valueChangedからもボタンからも同じ整形を使うためです。表示の元になる合計秒数はvaluesで管理し、変わるたびにvalueChangedがformatを通して表示します。</p>`,
      task: `formatメソッドを完成させて、合計秒数が「分:秒」（秒は2桁）で表示されるようにしてください。65秒なら「1:05」です。`,
      code: `<div data-controller="stopwatch" data-stopwatch-total-value="65">
  <p id="display" data-stopwatch-target="output"></p>
  <button id="plus" data-action="click->stopwatch#add">+1秒</button>
  <button id="start" data-action="click->stopwatch#start">早回し再生</button>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("stopwatch", class extends Controller {
  static targets = ["output"];
  static values = { total: Number };
  format(total) {
    // TODO: 分（60で割って切り捨て）と秒（60の余り）に分け、
    // 「分:秒」の文字列を返す。秒はpadStartで2桁にする
    return total + "秒";
  }
  totalValueChanged() {
    this.outputTarget.textContent = this.format(this.totalValue);
  }
  add() {
    this.totalValue = this.totalValue + 1;
  }
  start() {
    if (this.timer) {
      return;
    }
    this.timer = setInterval(() => {
      this.totalValue = this.totalValue + 1;
    }, 100);
  }
  disconnect() {
    clearInterval(this.timer);
  }
});
<\/script>`,
      solution: `<div data-controller="stopwatch" data-stopwatch-total-value="65">
  <p id="display" data-stopwatch-target="output"></p>
  <button id="plus" data-action="click->stopwatch#add">+1秒</button>
  <button id="start" data-action="click->stopwatch#start">早回し再生</button>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("stopwatch", class extends Controller {
  static targets = ["output"];
  static values = { total: Number };
  format(total) {
    const minutes = Math.floor(total / 60);
    const seconds = total % 60;
    return minutes + ":" + String(seconds).padStart(2, "0");
  }
  totalValueChanged() {
    this.outputTarget.textContent = this.format(this.totalValue);
  }
  add() {
    this.totalValue = this.totalValue + 1;
  }
  start() {
    if (this.timer) {
      return;
    }
    this.timer = setInterval(() => {
      this.totalValue = this.totalValue + 1;
    }, 100);
  }
  disconnect() {
    clearInterval(this.timer);
  }
});
<\/script>`,
      hints: [
        `const minutes = Math.floor(total / 60); const seconds = total % 60; の2つに分けます`,
        `return minutes + ":" + String(seconds).padStart(2, "0"); で秒が2桁になります`
      ],
      check: `assert(text("#display") === "1:05", "65秒は「1:05」と表示されるはずです（秒は2桁）");
click("#plus");
await sleep(50);
assert(text("#display") === "1:06", "+1秒を押すと「1:06」になるはずです");
click("#start");
await sleep(250);
const t = text("#display");
const parts = t.split(":");
assert(parts.length === 2 && parts[1].length === 2, "早回し中も「分:秒」の形式（秒は2桁）で表示され続けるはずです");
assert(t !== "1:06", "早回し再生中は表示が進んでいくはずです");`
    },
    {
      id: 155,
      title: "一時停止と再開",
      explanation: `<p>タイマーには一時停止がつきものです。実は「一時停止」に特別な命令はなく、<strong>clearIntervalで止めて、再開時にまたsetIntervalで始め直す</strong>だけです。経過カウント自体はインスタンス変数に残っているので、止めても値は失われません。</p>
<p>このとき2つの落とし穴があります。</p>
<ol>
<li><strong>スタート連打で二重にタイマーが動く</strong>：すでに動いているのに再度setIntervalすると、2つのタイマーが同時に走ってカウントが2倍速になります。「動いていなければ始める」というガードが必要です。</li>
<li><strong>止めたことを記録しない</strong>：clearIntervalしてもthis.timerには古いIDが残ったままです。<code>this.timer = null</code>と明示的に戻すことで、「今は止まっている」と判定できるようになります。</li>
</ol>
<pre><code>start() {
  if (this.timer !== null) {
    return; // すでに動いているなら何もしない
  }
  this.timer = setInterval(() =&gt; { ... }, 100);
}
pause() {
  clearInterval(this.timer);
  this.timer = null;
}</code></pre>
<p>「this.timerがnullなら停止中、そうでなければ動作中」という約束を決めておくのがこのパターンの核心です。</p>`,
      task: `pauseメソッドを実装して、一時停止中はカウントが進まず、もう一度スタートを押すと続きから再開されるようにしてください。`,
      code: `<div data-controller="pausable">
  <p>カウント: <span id="count" data-pausable-target="output">0</span></p>
  <button id="start" data-action="click->pausable#start">スタート</button>
  <button id="pause" data-action="click->pausable#pause">一時停止</button>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("pausable", class extends Controller {
  static targets = ["output"];
  connect() {
    this.count = 0;
    this.timer = null;
  }
  start() {
    if (this.timer !== null) {
      return;
    }
    this.timer = setInterval(() => {
      this.count = this.count + 1;
      this.outputTarget.textContent = this.count;
    }, 100);
  }
  pause() {
    // TODO: clearIntervalでタイマーを止め、this.timerをnullに戻す
  }
  disconnect() {
    if (this.timer !== null) {
      clearInterval(this.timer);
    }
  }
});
<\/script>`,
      solution: `<div data-controller="pausable">
  <p>カウント: <span id="count" data-pausable-target="output">0</span></p>
  <button id="start" data-action="click->pausable#start">スタート</button>
  <button id="pause" data-action="click->pausable#pause">一時停止</button>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("pausable", class extends Controller {
  static targets = ["output"];
  connect() {
    this.count = 0;
    this.timer = null;
  }
  start() {
    if (this.timer !== null) {
      return;
    }
    this.timer = setInterval(() => {
      this.count = this.count + 1;
      this.outputTarget.textContent = this.count;
    }, 100);
  }
  pause() {
    clearInterval(this.timer);
    this.timer = null;
  }
  disconnect() {
    if (this.timer !== null) {
      clearInterval(this.timer);
    }
  }
});
<\/script>`,
      hints: [
        `pause() { clearInterval(this.timer); this.timer = null; } の2行です`,
        `this.timerをnullに戻さないと、startの「すでに動いている」ガードに引っかかって再開できません`
      ],
      check: `click("#start");
await sleep(250);
const a = Number(text("#count"));
assert(a > 0, "スタートを押すとカウントが進み始めるはずです");
click("#pause");
await sleep(80);
const b = Number(text("#count"));
await sleep(250);
const c = Number(text("#count"));
assert(c === b, "一時停止中はカウントが進まないはずです。clearIntervalでタイマーを止めましたか？");
click("#start");
await sleep(250);
assert(Number(text("#count")) > c, "再びスタートを押すと続きからカウントが進むはずです。pauseでthis.timerをnullに戻しましたか？");`
    },
    {
      id: 156,
      title: "setTimeoutで遅延実行（自動非表示の通知）",
      explanation: `<p><code>setTimeout</code>はsetIntervalの兄弟で、指定時間後に<strong>1回だけ</strong>関数を実行します。「保存しました」のような通知を数秒後に自動で消す、という定番UIにぴったりです。</p>
<pre><code>show() {
  this.messageTarget.classList.remove("hidden");
  clearTimeout(this.timer);
  this.timer = setTimeout(() =&gt; {
    this.messageTarget.classList.add("hidden");
  }, 300);
}</code></pre>
<p>ポイントは、新しいsetTimeoutを予約する前に<code>clearTimeout</code>で前回の予約を取り消していることです。ボタンが連打された場合を考えてみてください。取り消さないと、1回目のクリックで予約された「消す処理」が、2回目の表示中に発動してしまい、表示した直後に通知が消えるという不可解な動きになります。取り消していれば、連打するたびに消えるまでの時間が延長される自然な挙動になります。</p>
<p>なお、clearTimeoutはIDがnullやundefinedでも安全に呼べる（何も起きない）ので、初回のクリックでも問題ありません。教材では確認しやすいよう300ミリ秒で消していますが、実際の通知なら3000ミリ秒程度が一般的です。disconnectでclearTimeoutする後始末も、setIntervalのときと同じ習慣です。</p>`,
      task: `保存ボタンで通知が表示され、0.3秒後に自動で消えるようにTODOを埋めてください。連打したときは表示時間が延長されるようにします。`,
      code: `<style>.hidden { display: none; }</style>

<div data-controller="notice">
  <button id="save" data-action="click->notice#show">保存する</button>
  <p id="message" data-notice-target="message" class="hidden">保存しました</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("notice", class extends Controller {
  static targets = ["message"];
  show() {
    this.messageTarget.classList.remove("hidden");
    clearTimeout(this.timer);
    // TODO: setTimeoutで300ミリ秒後にmessageTargetへhiddenを付け直す。
    // 戻り値はthis.timerに保存する
  }
  disconnect() {
    clearTimeout(this.timer);
  }
});
<\/script>`,
      solution: `<style>.hidden { display: none; }</style>

<div data-controller="notice">
  <button id="save" data-action="click->notice#show">保存する</button>
  <p id="message" data-notice-target="message" class="hidden">保存しました</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("notice", class extends Controller {
  static targets = ["message"];
  show() {
    this.messageTarget.classList.remove("hidden");
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.messageTarget.classList.add("hidden");
    }, 300);
  }
  disconnect() {
    clearTimeout(this.timer);
  }
});
<\/script>`,
      hints: [
        `this.timer = setTimeout(() => { this.messageTarget.classList.add("hidden"); }, 300); です`,
        `setIntervalと違い、setTimeoutは1回実行したら終わりです`
      ],
      check: `assert($("#message").classList.contains("hidden"), "最初は通知が非表示のはずです");
click("#save");
await sleep(150);
assert(!$("#message").classList.contains("hidden"), "保存ボタンを押すと通知が表示されるはずです");
click("#save");
await sleep(150);
assert(!$("#message").classList.contains("hidden"), "連打したときは表示時間が延長されるはずです（clearTimeoutで前回の予約を取り消していますか？）");
await sleep(450);
assert($("#message").classList.contains("hidden"), "最後のクリックから0.3秒たったら通知が自動で消えるはずです");`
    },
    {
      id: 157,
      title: "デバウンス（入力が止まってから処理）",
      explanation: `<p>検索ボックスで1文字打つたびに検索処理を実行すると無駄が多すぎます。「stimulus」と打てば8回も実行されてしまいます。そこで使うのが<strong>デバウンス</strong>という技法です。「入力のたびに処理を予約し直し、入力が一定時間止まったときだけ実際に実行する」という考え方で、実は前のステップの「clearTimeout＋setTimeout」そのものです。</p>
<pre><code>queue(event) {
  clearTimeout(this.timer);
  this.timer = setTimeout(() =&gt; {
    this.run(event.target.value);
  }, 300);
}</code></pre>
<p>動きを順に追ってみましょう。</p>
<ol>
<li>「s」を入力→300ミリ秒後にrunを予約</li>
<li>100ミリ秒後「st」を入力→前の予約を取り消し、新たに予約</li>
<li>さらに入力が続く間は、予約の取り消しと再予約が繰り返される</li>
<li>入力が300ミリ秒止まる→ようやくrunが1回だけ実行される</li>
</ol>
<p>結果として、何文字打っても実行は「打ち終わったあとに1回」になります。inputイベント（第3章）と組み合わせるのが定番で、検索のほかリアルタイムバリデーションや自動保存でも多用されます。第17章では、このデバウンスを擬似APIと組み合わせます。</p>`,
      task: `queueメソッドをデバウンスに書き換えて、入力が0.3秒止まったときだけ検索が実行される（実行回数が増える）ようにしてください。`,
      code: `<div data-controller="search">
  <input id="query" data-action="input->search#queue" placeholder="キーワード">
  <p>検索実行: <span id="result" data-search-target="result">まだ</span></p>
  <p>実行回数: <span id="count" data-search-target="count">0</span></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("search", class extends Controller {
  static targets = ["result", "count"];
  connect() {
    this.runs = 0;
    this.timer = null;
  }
  queue(event) {
    // TODO: すぐ実行するのではなく、clearTimeoutで前回の予約を取り消してから
    // 300ミリ秒後にthis.run(event.target.value)を予約する
    this.run(event.target.value);
  }
  run(query) {
    this.runs = this.runs + 1;
    this.resultTarget.textContent = query;
    this.countTarget.textContent = this.runs;
  }
  disconnect() {
    clearTimeout(this.timer);
  }
});
<\/script>`,
      solution: `<div data-controller="search">
  <input id="query" data-action="input->search#queue" placeholder="キーワード">
  <p>検索実行: <span id="result" data-search-target="result">まだ</span></p>
  <p>実行回数: <span id="count" data-search-target="count">0</span></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("search", class extends Controller {
  static targets = ["result", "count"];
  connect() {
    this.runs = 0;
    this.timer = null;
  }
  queue(event) {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.run(event.target.value);
    }, 300);
  }
  run(query) {
    this.runs = this.runs + 1;
    this.resultTarget.textContent = query;
    this.countTarget.textContent = this.runs;
  }
  disconnect() {
    clearTimeout(this.timer);
  }
});
<\/script>`,
      hints: [
        `前のステップの通知と同じ形です。clearTimeout(this.timer)してからsetTimeoutで予約します`,
        `this.timer = setTimeout(() => { this.run(event.target.value); }, 300);`
      ],
      check: `setValue("#query", "s");
await sleep(80);
setValue("#query", "st");
await sleep(80);
setValue("#query", "stimulus");
await sleep(100);
assert(text("#count") === "0", "入力してすぐには実行されないはずです（0.3秒待ってから実行）");
await sleep(400);
assert(text("#result") === "stimulus", "実行時には最後に入力した値で検索されるはずです");
assert(text("#count") === "1", "3回入力しても、入力が止まってから1回だけ実行されるはずです");`
    },
    {
      id: 158,
      title: "スロットリング（概要と簡易実装）",
      explanation: `<p>デバウンスと並んで有名なのが<strong>スロットリング</strong>です。どちらも「実行回数を減らす」技法ですが、性格が違います。</p>
<table>
<tr><th>技法</th><th>動き</th><th>向いている場面</th></tr>
<tr><td>デバウンス</td><td>止まってから1回実行</td><td>検索入力・自動保存</td></tr>
<tr><td>スロットリング</td><td>一定時間に最大1回実行</td><td>スクロール・リサイズ・連打の抑制</td></tr>
</table>
<p>デバウンスは操作が続く限り一度も実行されませんが、スロットリングは「最初の1回はすぐ実行し、その後しばらく受け付けない」ので、連続操作の最中でも一定ペースで処理が走ります。</p>
<p>簡易実装は「待機中フラグ」で作れます。</p>
<pre><code>request() {
  if (this.waiting) {
    return; // 待機中は無視
  }
  this.waiting = true;
  // ここで本来の処理を実行
  this.timer = setTimeout(() =&gt; {
    this.waiting = false; // 一定時間後に受付再開
  }, 300);
}</code></pre>
<p>1回実行したら<code>this.waiting</code>をtrueにし、setTimeoutで300ミリ秒後に受付を再開します。フラグの初期化はconnectで行います。インスタンス変数の使い方として、タイマーIDとフラグの2つを管理する練習にもなります。</p>`,
      task: `requestメソッドにスロットリングを実装して、0.3秒以内の連打では1回しか実行されないようにしてください。`,
      code: `<div data-controller="throttle">
  <button id="btn" data-action="click->throttle#request">連打してみる</button>
  <p>実行回数: <span id="count" data-throttle-target="count">0</span></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("throttle", class extends Controller {
  static targets = ["count"];
  connect() {
    this.waiting = false;
    this.runs = 0;
    this.timer = null;
  }
  request() {
    // TODO: this.waitingがtrueなら何もせずreturnする。
    // 実行したらwaitingをtrueにし、setTimeoutで300ミリ秒後にfalseへ戻す
    this.runs = this.runs + 1;
    this.countTarget.textContent = this.runs;
  }
  disconnect() {
    clearTimeout(this.timer);
  }
});
<\/script>`,
      solution: `<div data-controller="throttle">
  <button id="btn" data-action="click->throttle#request">連打してみる</button>
  <p>実行回数: <span id="count" data-throttle-target="count">0</span></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("throttle", class extends Controller {
  static targets = ["count"];
  connect() {
    this.waiting = false;
    this.runs = 0;
    this.timer = null;
  }
  request() {
    if (this.waiting) {
      return;
    }
    this.waiting = true;
    this.runs = this.runs + 1;
    this.countTarget.textContent = this.runs;
    this.timer = setTimeout(() => {
      this.waiting = false;
    }, 300);
  }
  disconnect() {
    clearTimeout(this.timer);
  }
});
<\/script>`,
      hints: [
        `メソッドの先頭に if (this.waiting) { return; } を置きます`,
        `実行の最後に this.waiting = true; と、300ミリ秒後にfalseへ戻すsetTimeoutを追加します`
      ],
      check: `for (let i = 0; i < 5; i++) {
  click("#btn");
  await sleep(20);
}
await sleep(50);
assert(text("#count") === "1", "0.3秒以内に5連打しても、実行されるのは1回だけのはずです");
await sleep(350);
click("#btn");
await sleep(50);
assert(text("#count") === "2", "待機時間が過ぎたら、次のクリックでまた実行されるはずです");`
    },
    {
      id: 159,
      title: "タイマーIDの管理（インスタンス変数の正しい使い方）",
      explanation: `<p>第7章のステップ69では「表示に関わる状態をインスタンス変数に持ちすぎるな」と学びました。一方、タイマーIDのような<strong>画面には現れない内部的な管理情報</strong>は、インスタンス変数に持つのが正解です。ただし、規律を持って管理しないとバグの温床になります。守るべきルールは4つです。</p>
<ol>
<li><strong>connectでnullに初期化する</strong>：「timerがnullなら停止中」という約束を最初に成立させる</li>
<li><strong>上書きする前に必ず止める</strong>：動いているタイマーのIDを上書きすると、古いタイマーのIDが失われ、<strong>二度と止められなくなる</strong></li>
<li><strong>止めたらnullに戻す</strong>：状態の判定を正しく保つ</li>
<li><strong>disconnectで必ず止める</strong>：リーク防止（ステップ152）</li>
</ol>
<p>今回のコードにはルール2違反のバグが仕込まれています。スタートを2回押すと、1回目のタイマーIDが2回目のIDで上書きされ、迷子になった1回目のタイマーはストップを押しても止まりません。</p>
<pre><code>start() {
  if (this.timer !== null) {
    clearInterval(this.timer); // 既存のタイマーを止めてから
  }
  this.timer = setInterval(() =&gt; { ... }, 100);
}</code></pre>
<p>このように「止めてから始める」形にすれば、何度スタートを押しても動くタイマーは常に1つだけになります。</p>`,
      task: `スタートを2回押してからストップを押すと止まらなくなるバグを修正してください。startで既存タイマーを止めてから開始し、connectとdisconnectも整えます。`,
      code: `<div data-controller="runner">
  <p>カウント: <span id="count" data-runner-target="output">0</span></p>
  <button id="start" data-action="click->runner#start">スタート</button>
  <button id="stop" data-action="click->runner#stop">ストップ</button>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("runner", class extends Controller {
  static targets = ["output"];
  connect() {
    this.count = 0;
    // TODO: this.timerをnullに初期化する
  }
  start() {
    // TODO: すでにタイマーが動いていたらclearIntervalで止めてから開始する
    this.timer = setInterval(() => {
      this.count = this.count + 1;
      this.outputTarget.textContent = this.count;
    }, 100);
  }
  stop() {
    clearInterval(this.timer);
    this.timer = null;
  }
  disconnect() {
    // TODO: タイマーが動いていたら止める
  }
});
<\/script>`,
      solution: `<div data-controller="runner">
  <p>カウント: <span id="count" data-runner-target="output">0</span></p>
  <button id="start" data-action="click->runner#start">スタート</button>
  <button id="stop" data-action="click->runner#stop">ストップ</button>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("runner", class extends Controller {
  static targets = ["output"];
  connect() {
    this.count = 0;
    this.timer = null;
  }
  start() {
    if (this.timer !== null) {
      clearInterval(this.timer);
    }
    this.timer = setInterval(() => {
      this.count = this.count + 1;
      this.outputTarget.textContent = this.count;
    }, 100);
  }
  stop() {
    clearInterval(this.timer);
    this.timer = null;
  }
  disconnect() {
    if (this.timer !== null) {
      clearInterval(this.timer);
    }
  }
});
<\/script>`,
      hints: [
        `startの先頭に if (this.timer !== null) { clearInterval(this.timer); } を追加します`,
        `古いIDを上書きで失うと、そのタイマーは誰にも止められなくなります`
      ],
      check: `click("#start");
await sleep(250);
click("#start");
await sleep(150);
click("#stop");
await sleep(50);
const a = Number(text("#count"));
assert(a > 0, "スタートを押すとカウントが進むはずです");
await sleep(300);
const b = Number(text("#count"));
assert(b === a, "ストップ後もカウントが進み続けています。スタートを2回押したとき、1つ目のタイマーのIDが上書きされて止められなくなっていませんか？startの先頭で既存タイマーを止めましょう");`
    },
    {
      id: 160,
      title: "総合演習（ポモドーロタイマー簡易版）",
      explanation: `<p>章の総仕上げに、ポモドーロタイマーの簡易版を作ります。ポモドーロは「作業→休憩→作業→…」を繰り返す時間管理法です。この章と第6章・第7章の知識を総動員します。</p>
<ul>
<li><strong>values</strong>：現在のモード（<code>mode</code>：workまたはbreak）と残り秒数（<code>seconds</code>）を管理</li>
<li><strong>valueChanged</strong>：モードと残り秒数の表示を自動更新</li>
<li><strong>setInterval＋clearInterval</strong>：時間を進める・止める</li>
<li><strong>タイマーID管理の4ルール</strong>（前ステップ）：null初期化・二重起動ガード・null戻し・disconnect</li>
</ul>
<p>心臓部は、残りが0になったときのモード切り替えです。</p>
<pre><code>if (this.secondsValue &lt;= 0) {
  if (this.modeValue === "work") {
    this.modeValue = "break";
    this.secondsValue = 5;
  } else {
    this.modeValue = "work";
    this.secondsValue = 3;
  }
}</code></pre>
<p>カウントダウン（ステップ153）と違い、0になっても止まらずに次のモードへ移って繰り返すのがポイントです。教材では早回しのため作業3秒・休憩5秒（0.1秒＝1秒換算）にしています。実際は作業25分・休憩5分ですが、秒数の定数を変えるだけで同じコードが使えます。</p>`,
      task: `残りが0になったらモードが切り替わる処理と、stopメソッドを実装してください。スタートで作業→休憩と自動で進み、ストップで止まれば合格です。`,
      code: `<div data-controller="pomodoro" data-pomodoro-mode-value="work" data-pomodoro-seconds-value="3">
  <p id="mode" data-pomodoro-target="mode"></p>
  <p id="time" data-pomodoro-target="time"></p>
  <button id="start" data-action="click->pomodoro#start">スタート</button>
  <button id="stop" data-action="click->pomodoro#stop">ストップ</button>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("pomodoro", class extends Controller {
  static targets = ["mode", "time"];
  static values = { mode: String, seconds: Number };
  connect() {
    this.timer = null;
  }
  modeValueChanged() {
    if (this.modeValue === "work") {
      this.modeTarget.textContent = "作業中";
    } else {
      this.modeTarget.textContent = "休憩中";
    }
  }
  secondsValueChanged() {
    this.timeTarget.textContent = "残り" + this.secondsValue;
  }
  start() {
    if (this.timer !== null) {
      return;
    }
    this.timer = setInterval(() => {
      this.secondsValue = this.secondsValue - 1;
      if (this.secondsValue <= 0) {
        // TODO: modeValueがworkならbreakにしてsecondsValueを5に、
        // breakならworkにしてsecondsValueを3にする
      }
    }, 100);
  }
  stop() {
    // TODO: タイマーを止めてthis.timerをnullに戻す
  }
  disconnect() {
    if (this.timer !== null) {
      clearInterval(this.timer);
    }
  }
});
<\/script>`,
      solution: `<div data-controller="pomodoro" data-pomodoro-mode-value="work" data-pomodoro-seconds-value="3">
  <p id="mode" data-pomodoro-target="mode"></p>
  <p id="time" data-pomodoro-target="time"></p>
  <button id="start" data-action="click->pomodoro#start">スタート</button>
  <button id="stop" data-action="click->pomodoro#stop">ストップ</button>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("pomodoro", class extends Controller {
  static targets = ["mode", "time"];
  static values = { mode: String, seconds: Number };
  connect() {
    this.timer = null;
  }
  modeValueChanged() {
    if (this.modeValue === "work") {
      this.modeTarget.textContent = "作業中";
    } else {
      this.modeTarget.textContent = "休憩中";
    }
  }
  secondsValueChanged() {
    this.timeTarget.textContent = "残り" + this.secondsValue;
  }
  start() {
    if (this.timer !== null) {
      return;
    }
    this.timer = setInterval(() => {
      this.secondsValue = this.secondsValue - 1;
      if (this.secondsValue <= 0) {
        if (this.modeValue === "work") {
          this.modeValue = "break";
          this.secondsValue = 5;
        } else {
          this.modeValue = "work";
          this.secondsValue = 3;
        }
      }
    }, 100);
  }
  stop() {
    clearInterval(this.timer);
    this.timer = null;
  }
  disconnect() {
    if (this.timer !== null) {
      clearInterval(this.timer);
    }
  }
});
<\/script>`,
      hints: [
        `切り替えはif (this.modeValue === "work") { ... } else { ... } で、modeValueとsecondsValueの両方を書き換えます`,
        `stopは一時停止（ステップ155）と同じで、clearIntervalしてthis.timerをnullに戻します`
      ],
      check: `assert(text("#mode") === "作業中", "最初はモードが「作業中」のはずです");
assert(text("#time") === "残り3", "最初は「残り3」と表示されているはずです");
click("#start");
await sleep(150);
assert(text("#time") !== "残り3", "スタート後は残りが減っていくはずです");
await sleep(350);
assert(text("#mode") === "休憩中", "作業時間が0になったら「休憩中」に切り替わるはずです");
click("#stop");
await sleep(120);
const a = text("#time");
await sleep(250);
assert(text("#time") === a, "ストップを押したらカウントが止まるはずです");`
    }
  ]
});
