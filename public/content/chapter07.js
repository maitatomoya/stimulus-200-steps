// 第7章：valueChangedと状態管理
registerChapter({
  number: 7,
  title: "valueChangedと状態管理",
  description: "値の変化を自動で捉えるvalueChangedコールバックを学び、「状態はDOMのdata属性に置く」というStimulusの設計思想を身につけます。",
  steps: [
    {
      id: 61,
      title: "xxxValueChangedコールバックの基本",
      explanation: `<p>第6章では<code>static values</code>で定義した値を<code>this.xxxValue</code>で読み書きする方法を学びました。この章の主役は<strong>バリューチェンジコールバック</strong>です。コントローラに<code>値名 + ValueChanged</code>という名前のメソッドを定義しておくと、<strong>その値が変わるたびにStimulusが自動でそのメソッドを呼んでくれます</strong>。</p>
<table>
<tr><th>valueの定義</th><th>コールバック名</th></tr>
<tr><td><code>message: String</code></td><td><code>messageValueChanged()</code></td></tr>
<tr><td><code>count: Number</code></td><td><code>countValueChanged()</code></td></tr>
</table>
<p>使い方はこうです。アクションの中では値を代入するだけにして、画面の更新はコールバックに任せます。</p>
<pre><code>static values = { message: String };

update() {
  this.messageValue = "こんにちは"; // 代入すると…
}

messageValueChanged() {
  // …自動でここが呼ばれる
  this.outputTarget.textContent = this.messageValue;
}</code></pre>
<p>自分で「値を変えたら表示も更新する」処理をあちこちに書かなくても、<strong>値の変更を1か所で監視できる</strong>のがポイントです。addEventListenerのような登録作業は一切不要で、メソッド名の規約に従うだけで動きます。</p>`,
      task: `messageValueChangedメソッドの中身を実装し、ボタンを押すとメッセージが<p>に表示されるようにしてください。`,
      code: `<div data-controller="greeting">
  <button data-action="click->greeting#update">メッセージを変更</button>
  <p data-greeting-target="output"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("greeting", class extends Controller {
  static targets = ["output"];
  static values = { message: String };

  update() {
    this.messageValue = "こんにちは";
  }

  messageValueChanged() {
    // TODO: outputTargetのtextContentにthis.messageValueを設定する
  }
});
<\/script>`,
      solution: `<div data-controller="greeting">
  <button data-action="click->greeting#update">メッセージを変更</button>
  <p data-greeting-target="output"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("greeting", class extends Controller {
  static targets = ["output"];
  static values = { message: String };

  update() {
    this.messageValue = "こんにちは";
  }

  messageValueChanged() {
    this.outputTarget.textContent = this.messageValue;
  }
});
<\/script>`,
      hints: [
        `messageValueChangedの中ではthis.messageValueで現在の値を読めます`,
        `第4章で学んだthis.outputTarget.textContentへの代入と組み合わせましょう`
      ],
      check: `assert($("[data-controller=greeting]"), "data-controllerがgreetingの要素が必要です");
click("button");
await sleep(50);
assert(text("p") === "こんにちは", "ボタンを押すとmessageValueChangedが呼ばれ、<p>に「こんにちは」と表示されるはずです");`
    },
    {
      id: 62,
      title: "初回接続時にも呼ばれることを観察",
      explanation: `<p>valueChangedコールバックには重要な性質があります。値が「変わったとき」だけでなく、<strong>コントローラが接続された直後にも1回呼ばれる</strong>のです。このときの値は、HTMLの<code>data-*-value</code>属性から読み取った初期値です。</p>
<pre><code>&lt;div data-controller="monitor" data-monitor-status-value="準備完了"&gt;</code></pre>
<p>このHTMLなら、ページ表示直後に<code>statusValueChanged()</code>が<code>this.statusValue === "準備完了"</code>の状態で呼ばれます。ボタンを押していないのに、です。</p>
<p>これが何をうれしくするかというと、<strong>「初期表示」と「変更時の更新」を同じ1つのメソッドで書ける</strong>という点です。もしvalueChangedが変更時にしか呼ばれなかったら、初期表示のためにconnect()にも同じ描画コードを書く必要があり、コードが重複してしまいます。</p>
<table>
<tr><th>タイミング</th><th>valueChangedは呼ばれる？</th></tr>
<tr><td>コントローラ接続直後</td><td>呼ばれる（初期値で）</td></tr>
<tr><td>this.xxxValueに代入したとき</td><td>呼ばれる</td></tr>
<tr><td>data属性が書き換えられたとき</td><td>呼ばれる</td></tr>
</table>
<p>このステップのコードは完成しています。実行して、クリック前から「状態:準備完了」と表示されていること（＝初回接続時にコールバックが動いたこと）と、ボタンで「状態:実行中」に変わることを観察してください。コンソール欄にも呼ばれた回数のログが出ます。</p>`,
      task: `コードは完成しています。実行して、クリックしていないのに初回のvalueChangedで「状態:準備完了」が表示されることを観察してください。`,
      code: `<div data-controller="monitor" data-monitor-status-value="準備完了">
  <button data-action="click->monitor#start">開始</button>
  <p data-monitor-target="output"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("monitor", class extends Controller {
  static targets = ["output"];
  static values = { status: String };

  start() {
    this.statusValue = "実行中";
  }

  statusValueChanged() {
    console.log("statusValueChangedが呼ばれました: " + this.statusValue);
    this.outputTarget.textContent = "状態:" + this.statusValue;
  }
});
<\/script>`,
      solution: `<div data-controller="monitor" data-monitor-status-value="準備完了">
  <button data-action="click->monitor#start">開始</button>
  <p data-monitor-target="output"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("monitor", class extends Controller {
  static targets = ["output"];
  static values = { status: String };

  start() {
    this.statusValue = "実行中";
  }

  statusValueChanged() {
    console.log("statusValueChangedが呼ばれました: " + this.statusValue);
    this.outputTarget.textContent = "状態:" + this.statusValue;
  }
});
<\/script>`,
      hints: [
        `コンソール欄を見ると、クリック前に1回、クリック後にもう1回ログが出ています`,
        `初回の呼び出しではdata-monitor-status-value属性の値が使われます`
      ],
      check: `assert(text("p") === "状態:準備完了", "ページ表示直後（クリック前）に、初回のvalueChangedによって「状態:準備完了」と表示されているはずです");
click("button");
await sleep(50);
assert(text("p") === "状態:実行中", "ボタンを押すとstatusValueChangedが再び呼ばれ、「状態:実行中」に変わるはずです");`
    },
    {
      id: 63,
      title: "oldValueとnewValue（引数2つ）",
      explanation: `<p>valueChangedコールバックは2つの引数を受け取れます。<strong>第1引数が新しい値、第2引数が変更前の値</strong>です。</p>
<pre><code>countValueChanged(newValue, oldValue) {
  console.log(oldValue + "から" + newValue + "に変わった");
}</code></pre>
<p>「前の値」が分かると、増えたのか減ったのか、どこから遷移したのかを判定できます。アニメーションの方向を決めたり、変更履歴を表示したりするときに便利です。</p>
<p>注意点が1つあります。前のステップで学んだとおりvalueChangedは<strong>初回接続時にも呼ばれます</strong>が、そのときはまだ「変更」は起きていません。初回呼び出しでは、Stimulusのバージョンによって<code>oldValue</code>が<code>undefined</code>だったり、現在の値と同じ値だったりします（Stimulus 3.2では現在値と同じ値が渡されます）。前の値を使う処理を書くときは、どちらのケースでも動くように「undefinedか、newValueと同じなら何もしない」とガード（先にチェックしてreturnすること）するのが安全な定番パターンです。</p>
<pre><code>countValueChanged(newValue, oldValue) {
  if (oldValue === undefined || oldValue === newValue) {
    return; // 初回接続時（＝実際の変更ではない）は何もしない
  }
  // 実際に値が変わったときだけ実行される処理
}</code></pre>
<p>今回はカウンタの値が変わるたびに「0→1」のように変化を表示します。初回（実際の変更ではない呼び出し）では何も表示しないようにガードしてください。</p>`,
      task: `countValueChangedを実装してください。初回の呼び出し（oldValueがundefined、またはnewValueと同じとき）は何もせず、実際に値が変わったときだけ「変更前→変更後」の形式（例：0→1）で表示します。`,
      code: `<div data-controller="counter" data-counter-count-value="0">
  <button data-action="click->counter#increment">増やす</button>
  <p data-counter-target="output"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("counter", class extends Controller {
  static targets = ["output"];
  static values = { count: Number };

  increment() {
    this.countValue = this.countValue + 1;
  }

  countValueChanged(newValue, oldValue) {
    // TODO: oldValueがundefined、またはnewValueと同じなら何もしない（return）
    // TODO: それ以外はoutputTargetに「oldValue→newValue」の形式で表示する
    //       （例：「0→1」。矢印は"→"を使う）
  }
});
<\/script>`,
      solution: `<div data-controller="counter" data-counter-count-value="0">
  <button data-action="click->counter#increment">増やす</button>
  <p data-counter-target="output"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("counter", class extends Controller {
  static targets = ["output"];
  static values = { count: Number };

  increment() {
    this.countValue = this.countValue + 1;
  }

  countValueChanged(newValue, oldValue) {
    if (oldValue === undefined || oldValue === newValue) {
      return;
    }
    this.outputTarget.textContent = oldValue + "→" + newValue;
  }
});
<\/script>`,
      hints: [
        `if (oldValue === undefined || oldValue === newValue) { return; } で初回をスキップできます`,
        `文字列連結はoldValue + "→" + newValueのように+演算子で行います`
      ],
      check: `assert(text("p") === "", "初回のvalueChanged（実際の変更ではない呼び出し）では何も表示しないはずです");
click("button");
await sleep(50);
assert(text("p") === "0→1", "1回押すと「0→1」と表示されるはずです（第1引数が新しい値、第2引数が前の値）");
click("button");
await sleep(50);
assert(text("p") === "1→2", "もう1回押すと「1→2」と表示されるはずです");`
    },
    {
      id: 64,
      title: "valueの変更でUIを更新するパターン",
      explanation: `<p>valueChangedを使うと、コントローラの書き方が大きく整理できます。それがこのパターンです。</p>
<ol>
<li>アクションメソッドは<strong>値を変えることだけ</strong>を行う</li>
<li>画面の更新は<strong>valueChangedだけ</strong>が行う</li>
</ol>
<pre><code>increment() {
  this.countValue = this.countValue + 1; // 値を変えるだけ
}

decrement() {
  this.countValue = this.countValue - 1; // 値を変えるだけ
}

countValueChanged() {
  // 表示の更新はここに一本化
  this.outputTarget.textContent = "カウント:" + this.countValue;
}</code></pre>
<p>もしvalueChangedを使わないと、incrementとdecrementの両方に表示更新のコードを書くことになり、更新箇所が増えるほど書き忘れや食い違いが起きやすくなります。このパターンなら<strong>「どこで値を変えても、表示は必ず追従する」</strong>ことが保証されます。</p>
<table>
<tr><th></th><th>アクションで直接DOM更新</th><th>valueChangedに一本化</th></tr>
<tr><td>更新コードの場所</td><td>アクションの数だけ散らばる</td><td>1か所</td></tr>
<tr><td>初期表示</td><td>connect()に別途書く</td><td>初回呼び出しが兼ねる</td></tr>
<tr><td>更新漏れ</td><td>起きやすい</td><td>起きない</td></tr>
</table>
<p>前のステップで学んだ「初回接続時にも呼ばれる」性質のおかげで、初期表示のコードすら不要になる点にも注目してください。</p>`,
      task: `countValueChangedを実装して、＋ボタン・－ボタンのどちらを押しても「カウント:数」の表示が正しく更新されるようにしてください。`,
      code: `<div data-controller="counter" data-counter-count-value="0">
  <button id="plus" data-action="counter#increment">＋</button>
  <button id="minus" data-action="counter#decrement">－</button>
  <p data-counter-target="output"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("counter", class extends Controller {
  static targets = ["output"];
  static values = { count: Number };

  increment() {
    this.countValue = this.countValue + 1;
  }

  decrement() {
    this.countValue = this.countValue - 1;
  }

  countValueChanged() {
    // TODO: outputTargetに「カウント:」+ this.countValue を表示する
  }
});
<\/script>`,
      solution: `<div data-controller="counter" data-counter-count-value="0">
  <button id="plus" data-action="counter#increment">＋</button>
  <button id="minus" data-action="counter#decrement">－</button>
  <p data-counter-target="output"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("counter", class extends Controller {
  static targets = ["output"];
  static values = { count: Number };

  increment() {
    this.countValue = this.countValue + 1;
  }

  decrement() {
    this.countValue = this.countValue - 1;
  }

  countValueChanged() {
    this.outputTarget.textContent = "カウント:" + this.countValue;
  }
});
<\/script>`,
      hints: [
        `表示更新のコードはcountValueChangedの1か所だけに書きます`,
        `初回接続時にも呼ばれるので、最初から「カウント:0」が表示されます`
      ],
      check: `assert(text("p") === "カウント:0", "接続直後、初回のvalueChangedで「カウント:0」と表示されるはずです");
click("#plus");
await sleep(50);
click("#plus");
await sleep(50);
assert(text("p") === "カウント:2", "＋を2回押すと「カウント:2」になるはずです");
click("#minus");
await sleep(50);
assert(text("p") === "カウント:1", "－を押すと「カウント:1」に戻るはずです（どのアクションでも表示が追従します）");`
    },
    {
      id: 65,
      title: "状態はDOM（data属性）に置くという思想",
      explanation: `<p><code>this.countValue = 5</code>と代入したとき、裏側では何が起きているのでしょうか。実は<strong>HTML要素の<code>data-counter-count-value</code>属性が「5」に書き換えられています</strong>。valueの実体はJavaScriptの変数ではなく、<strong>DOM上のdata属性そのもの</strong>なのです。読むときも毎回属性から読み取られます。</p>
<p>これはStimulusの中心的な設計思想です。状態（アプリの今の状況を表すデータ）をHTMLに置くと、次の利点があります。</p>
<ul>
<li>開発者ツールでHTMLを見れば<strong>今の状態が一目で分かる</strong>（JSの変数は見えない）</li>
<li>サーバーがHTMLを生成する時点で初期状態を埋め込める</li>
<li>属性の変更がvalueChangedに通知されるので、状態と表示が自動で同期する</li>
</ul>
<pre><code>&lt;!-- ＋を2回押した後のHTMLはこうなっている --&gt;
&lt;div data-controller="counter" data-counter-count-value="2"&gt;</code></pre>
<p>今回の初期コードは、valueを定義しているのに使わず、<code>this.count</code>という<strong>インスタンス変数</strong>（コントローラ自身が持つただの変数）で数えています。画面表示は動きますが、data属性は「0」のまま置き去りです。this.countValueを使う形に書き換えて、状態がDOMに反映されるようにしてください。</p>`,
      task: `インスタンス変数this.countをやめてthis.countValueを使うように書き換え、data-counter-count-value属性がクリックのたびに更新されるようにしてください。表示はcountValueChangedで行います。`,
      code: `<div id="box" data-controller="counter" data-counter-count-value="0">
  <button data-action="counter#increment">＋</button>
  <p data-counter-target="output"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("counter", class extends Controller {
  static targets = ["output"];
  static values = { count: Number };

  increment() {
    // TODO: インスタンス変数ではなくthis.countValueを1増やす
    this.count = (this.count || 0) + 1;
    this.outputTarget.textContent = "カウント:" + this.count;
  }

  // TODO: countValueChangedを追加して表示を更新する
});
<\/script>`,
      solution: `<div id="box" data-controller="counter" data-counter-count-value="0">
  <button data-action="counter#increment">＋</button>
  <p data-counter-target="output"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("counter", class extends Controller {
  static targets = ["output"];
  static values = { count: Number };

  increment() {
    this.countValue = this.countValue + 1;
  }

  countValueChanged() {
    this.outputTarget.textContent = "カウント:" + this.countValue;
  }
});
<\/script>`,
      hints: [
        `incrementはthis.countValue = this.countValue + 1;の1行だけにします`,
        `this.countValueに代入すると、data-counter-count-value属性が自動で書き換わります`
      ],
      check: `click("button");
await sleep(50);
click("button");
await sleep(50);
assert(text("p") === "カウント:2", "2回押すと「カウント:2」と表示されるはずです");
assert($("#box").getAttribute("data-counter-count-value") === "2", "this.countValueを使っていれば、data-counter-count-value属性も「2」に更新されているはずです（インスタンス変数では属性は変わりません）");`
    },
    {
      id: 66,
      title: "複数valueの連動",
      explanation: `<p>valueが複数あるとき、「どれか1つでも変わったら表示を計算し直したい」という場面はよくあります。定番の書き方は、<strong>それぞれのvalueChangedから共通の描画メソッドを呼ぶ</strong>ことです。</p>
<pre><code>static values = { price: Number, quantity: Number };

priceValueChanged() {
  this.render();
}

quantityValueChanged() {
  this.render();
}

render() {
  var total = this.priceValue * this.quantityValue;
  this.totalTarget.textContent = "合計:" + total + "円";
}</code></pre>
<p>renderのような自作メソッドの中では、<code>this.priceValue</code>も<code>this.quantityValue</code>も<strong>常にDOMの属性から読まれる最新の値</strong>です。そのため、どちらのvalueが先に変わっても、renderを呼んだ時点の計算結果は必ず正しくなります。</p>
<p>初回接続時には各valueのvalueChangedがそれぞれ呼ばれるため、renderも最初から実行され、初期表示も自動で整います。「単価×数量＝合計」のように<strong>複数の状態から導かれる表示</strong>は、このパターンで書くのが安全です。</p>`,
      task: `renderメソッドを実装して、単価×数量の合計を「合計:200円」の形式で表示してください。追加ボタンを押すたびに合計が更新されるようにします。`,
      code: `<div data-controller="item" data-item-price-value="100" data-item-quantity-value="1">
  <p>りんご（1個100円）</p>
  <button data-action="item#add">1個追加</button>
  <p data-item-target="total"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("item", class extends Controller {
  static targets = ["total"];
  static values = { price: Number, quantity: Number };

  add() {
    this.quantityValue = this.quantityValue + 1;
  }

  priceValueChanged() {
    this.render();
  }

  quantityValueChanged() {
    this.render();
  }

  render() {
    // TODO: this.priceValue * this.quantityValue を計算し、
    //       totalTargetに「合計:100円」の形式で表示する
  }
});
<\/script>`,
      solution: `<div data-controller="item" data-item-price-value="100" data-item-quantity-value="1">
  <p>りんご（1個100円）</p>
  <button data-action="item#add">1個追加</button>
  <p data-item-target="total"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("item", class extends Controller {
  static targets = ["total"];
  static values = { price: Number, quantity: Number };

  add() {
    this.quantityValue = this.quantityValue + 1;
  }

  priceValueChanged() {
    this.render();
  }

  quantityValueChanged() {
    this.render();
  }

  render() {
    this.totalTarget.textContent = "合計:" + (this.priceValue * this.quantityValue) + "円";
  }
});
<\/script>`,
      hints: [
        `掛け算の結果を文字列に挟むときは "合計:" + (計算式) + "円" のように括弧で囲むと安全です`,
        `どちらのvalueChangedもrenderを呼ぶので、renderの中は常に最新の値で計算されます`
      ],
      check: `assert(text("[data-item-target=total]") === "合計:100円", "接続直後、初回のvalueChangedからrenderが呼ばれ「合計:100円」と表示されるはずです");
click("button");
await sleep(50);
assert(text("[data-item-target=total]") === "合計:200円", "1個追加すると「合計:200円」になるはずです");
click("button");
await sleep(50);
assert(text("[data-item-target=total]") === "合計:300円", "もう1個追加すると「合計:300円」になるはずです");`
    },
    {
      id: 67,
      title: "valueChangedとtargetの組み合わせ",
      explanation: `<p>valueChangedとターゲットを組み合わせると、少ないコードで本格的なUIが作れます。題材はスライドショーです。「今何枚目か」という状態を<code>indexValue</code>に持たせ、複数の<code>slide</code>ターゲットのうち該当する1枚だけを表示します。</p>
<pre><code>next() {
  this.indexValue = (this.indexValue + 1) % this.slideTargets.length;
}

indexValueChanged() {
  this.slideTargets.forEach((el, i) =&gt; {
    el.hidden = i !== this.indexValue;
  });
}</code></pre>
<p>ポイントを整理します。</p>
<ul>
<li><code>%</code>（剰余演算子）で割った余りを使い、最後のスライドの次は0枚目に戻します（3枚なら0→1→2→0…）</li>
<li><code>el.hidden = true</code>は要素のhiddenプロパティをtrueにする書き方で、その要素が非表示になります（HTMLのhidden属性に対応）</li>
<li>forEachの第2引数<code>i</code>は添字（0始まりの番号）です。<code>i !== this.indexValue</code>がtrueの要素、つまり「今の番号以外」がすべて隠れます</li>
</ul>
<p>next()は番号を変えるだけ、表示の切り替えはindexValueChangedだけ、という役割分担はステップ64のパターンそのものです。初回接続時にもindexValueChangedが呼ばれるため、最初から1枚目だけが表示された状態で始まります。</p>`,
      task: `indexValueChangedを実装して、indexValueと同じ添字のスライドだけが表示され、他がhiddenになるようにしてください。`,
      code: `<div data-controller="slideshow" data-slideshow-index-value="0">
  <button data-action="slideshow#next">次へ</button>
  <p data-slideshow-target="slide">1枚目：こんにちは</p>
  <p data-slideshow-target="slide">2枚目：Stimulusのスライド</p>
  <p data-slideshow-target="slide">3枚目：おしまい</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("slideshow", class extends Controller {
  static targets = ["slide"];
  static values = { index: Number };

  next() {
    this.indexValue = (this.indexValue + 1) % this.slideTargets.length;
  }

  indexValueChanged() {
    // TODO: slideTargetsをforEachで回し、
    //       添字がthis.indexValueと違う要素はel.hidden = trueに、
    //       同じ要素はel.hidden = falseにする
  }
});
<\/script>`,
      solution: `<div data-controller="slideshow" data-slideshow-index-value="0">
  <button data-action="slideshow#next">次へ</button>
  <p data-slideshow-target="slide">1枚目：こんにちは</p>
  <p data-slideshow-target="slide">2枚目：Stimulusのスライド</p>
  <p data-slideshow-target="slide">3枚目：おしまい</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("slideshow", class extends Controller {
  static targets = ["slide"];
  static values = { index: Number };

  next() {
    this.indexValue = (this.indexValue + 1) % this.slideTargets.length;
  }

  indexValueChanged() {
    this.slideTargets.forEach((el, i) => {
      el.hidden = i !== this.indexValue;
    });
  }
});
<\/script>`,
      hints: [
        `forEachのコールバックは(el, i) => { ... }の形で要素と添字を受け取れます`,
        `el.hidden = i !== this.indexValue; と書くと1行で表示・非表示を切り替えられます`
      ],
      check: `const slides = $$("[data-slideshow-target=slide]");
assert(slides.length === 3, "slideターゲットが3つ必要です");
assert(slides[0].hidden === false && slides[1].hidden === true && slides[2].hidden === true, "接続直後は1枚目だけが表示され、2枚目と3枚目はhiddenになるはずです（初回のvalueChangedで切り替えます）");
click("button");
await sleep(50);
assert(slides[0].hidden === true && slides[1].hidden === false && slides[2].hidden === true, "「次へ」を押すと2枚目だけが表示されるはずです");
click("button");
await sleep(50);
click("button");
await sleep(50);
assert(slides[0].hidden === false && slides[1].hidden === true, "3枚目の次は1枚目に戻るはずです（%演算子による循環）");`
    },
    {
      id: 68,
      title: "リロードしても残る状態の考え方（data属性初期値）",
      explanation: `<p>JavaScriptの変数は、ページをリロード（再読み込み）すると消えてしまいます。では、いいねの数のような「消えては困る状態」はどう扱えばよいのでしょうか。</p>
<p>Webアプリの基本形はこうです。本当の状態は<strong>サーバー（データベース）が持ち</strong>、サーバーはHTMLを生成するときに<strong>最新の値をdata属性に埋め込みます</strong>。</p>
<pre><code>&lt;!-- サーバーが生成するHTML。42はデータベースの現在値 --&gt;
&lt;div data-controller="like" data-like-count-value="42"&gt;</code></pre>
<p>コントローラ側は、初回のvalueChangedがその値で呼ばれるので、<strong>「どんな初期値で始まっても正しく表示する」コードにしておくだけ</strong>でよいのです。リロードしてもサーバーが再び最新値を埋め込むため、状態は失われません。これがRailsなどのサーバーサイドフレームワークとStimulusの相性が良い理由のひとつです。</p>
<table>
<tr><th>置き場所</th><th>リロード後</th><th>役割</th></tr>
<tr><td>JSの変数</td><td>消える</td><td>一時的な作業用</td></tr>
<tr><td>data属性（value）</td><td>サーバーが再出力すれば残る</td><td>UIの状態</td></tr>
<tr><td>サーバーのDB</td><td>残る</td><td>本当のデータ</td></tr>
</table>
<p>初期コードはconnect()で「いいね:0件」と決め打ちしていて、HTMLに埋め込まれた42を無視しています。valueChangedを使って、属性の初期値がそのまま表示に反映されるように直してください。</p>`,
      task: `connect()での決め打ち表示をやめ、countValueChangedでthis.countValueを「いいね:42件」の形式で表示するように書き換えてください。ボタンで1ずつ増えることも確認します。`,
      code: `<!-- data-like-count-value="42"はサーバーが埋め込んだ想定の初期値 -->
<div data-controller="like" data-like-count-value="42">
  <button data-action="like#add">いいね</button>
  <p data-like-target="output"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("like", class extends Controller {
  static targets = ["output"];
  static values = { count: Number };

  connect() {
    // TODO: この決め打ちをやめて、countValueChangedで表示する
    this.outputTarget.textContent = "いいね:0件";
  }

  add() {
    this.countValue = this.countValue + 1;
  }
});
<\/script>`,
      solution: `<!-- data-like-count-value="42"はサーバーが埋め込んだ想定の初期値 -->
<div data-controller="like" data-like-count-value="42">
  <button data-action="like#add">いいね</button>
  <p data-like-target="output"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("like", class extends Controller {
  static targets = ["output"];
  static values = { count: Number };

  add() {
    this.countValue = this.countValue + 1;
  }

  countValueChanged() {
    this.outputTarget.textContent = "いいね:" + this.countValue + "件";
  }
});
<\/script>`,
      hints: [
        `connect()ごと削除してかまいません。初回のvalueChangedが初期表示を兼ねます`,
        `countValueChangedの中で "いいね:" + this.countValue + "件" を表示します`
      ],
      check: `assert(text("p") === "いいね:42件", "HTMLに埋め込まれた初期値42が反映され、最初から「いいね:42件」と表示されるはずです（0の決め打ちはやめましょう）");
click("button");
await sleep(50);
assert(text("p") === "いいね:43件", "ボタンを押すと「いいね:43件」になるはずです");`
    },
    {
      id: 69,
      title: "アンチパターン：インスタンス変数に状態を持ちすぎる",
      explanation: `<p>コントローラでは<code>this.count = 0</code>のような<strong>インスタンス変数</strong>も自由に使えます。しかし、UIの状態をインスタンス変数に持たせるのは<strong>アンチパターン</strong>（避けるべき書き方）になりがちです。理由は2つあります。</p>
<ul>
<li><strong>HTMLの初期値を無視してしまう</strong>：サーバーが<code>data-counter-count-value="10"</code>と埋め込んでも、<code>this.count = 0</code>で上書きすれば10は捨てられます</li>
<li><strong>DOMとJSで状態が二重になる</strong>：data属性は古いまま、変数だけが進む、というズレが起きます。開発者ツールで見ても本当の状態が分かりません</li>
</ul>
<p>一方で、インスタンス変数が適切な場面もあります。使い分けの目安はこうです。</p>
<table>
<tr><th>データの種類</th><th>置き場所</th><th>例</th></tr>
<tr><td>UIの状態（表示に影響する）</td><td>value（data属性）</td><td>カウント、選択中のタブ、開閉状態</td></tr>
<tr><td>内部の作業用データ</td><td>インスタンス変数</td><td>タイマーのID（後の章で登場）など</td></tr>
</table>
<p>初期コードは、valueを定義しているのにconnect()で<code>this.count = 0</code>と初期化し、HTMLの「10」を無視しています。valuesとvalueChangedを使う形にリファクタリング（動きを変えずに書き直すこと）してください。</p>`,
      task: `インスタンス変数this.countを廃止し、this.countValueとcountValueChangedを使う形に書き換えてください。HTMLの初期値10が最初から表示されるようになります。`,
      code: `<div data-controller="counter" data-counter-count-value="10">
  <button data-action="counter#increment">＋</button>
  <p data-counter-target="output"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("counter", class extends Controller {
  static targets = ["output"];
  static values = { count: Number };

  // TODO: connectでの初期化をやめる（HTMLの初期値10が無視されている）
  connect() {
    this.count = 0;
    this.outputTarget.textContent = "カウント:" + this.count;
  }

  // TODO: this.countValueを使い、表示はcountValueChangedに任せる
  increment() {
    this.count = this.count + 1;
    this.outputTarget.textContent = "カウント:" + this.count;
  }
});
<\/script>`,
      solution: `<div data-controller="counter" data-counter-count-value="10">
  <button data-action="counter#increment">＋</button>
  <p data-counter-target="output"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("counter", class extends Controller {
  static targets = ["output"];
  static values = { count: Number };

  increment() {
    this.countValue = this.countValue + 1;
  }

  countValueChanged() {
    this.outputTarget.textContent = "カウント:" + this.countValue;
  }
});
<\/script>`,
      hints: [
        `connect()は丸ごと削除できます。初回のvalueChangedが初期表示を行います`,
        `this.countValueはHTMLのdata-counter-count-value="10"から自動で読み込まれます`
      ],
      check: `assert(text("p") === "カウント:10", "HTMLのdata-counter-count-value=10が反映され、最初は「カウント:10」と表示されるはずです（this.count = 0で上書きしてはいけません）");
click("button");
await sleep(50);
assert(text("p") === "カウント:11", "1回押すと「カウント:11」になるはずです");
assert($("[data-controller=counter]").getAttribute("data-counter-count-value") === "11", "状態がdata属性にも反映されているはずです（インスタンス変数ではなくcountValueを使いましょう）");`
    },
    {
      id: 70,
      title: "総合演習：ページネーション状態管理",
      explanation: `<p>この章の総まとめとして、ページネーション（ページ送りUI）を作ります。使う知識はすべて学習済みです。</p>
<ul>
<li><code>pageValue</code>（現在ページ）と<code>totalValue</code>（総ページ数）の2つのvalue。初期値はHTMLのdata属性から（ステップ68）</li>
<li>アクションは値を変えるだけ、表示はvalueChangedに一本化（ステップ64）</li>
<li>valueChangedの中でターゲットを操作（ステップ67）</li>
</ul>
<p>仕様は次のとおりです。</p>
<table>
<tr><th>項目</th><th>内容</th></tr>
<tr><td>表示</td><td>「1/5ページ」の形式でoutputTargetに表示</td></tr>
<tr><td>前へ</td><td>1ページ目より大きいときだけpageValueを1減らす</td></tr>
<tr><td>次へ</td><td>最終ページより小さいときだけpageValueを1増やす</td></tr>
<tr><td>ボタン制御</td><td>1ページ目では「前へ」を、最終ページでは「次へ」をdisabledにする</td></tr>
</table>
<p>ボタンの無効化には<code>disabled</code>プロパティを使います。<code>this.prevTarget.disabled = true</code>でボタンが押せなくなります。比較演算の結果は真偽値なので、次のように1行で書けます。</p>
<pre><code>this.prevTarget.disabled = this.pageValue &lt;= 1;
this.nextTarget.disabled = this.pageValue &gt;= this.totalValue;</code></pre>
<p>移動のたびにボタンの有効・無効も自動で切り替わるのは、表示更新をpageValueChangedに一本化しているからです。</p>`,
      task: `pageValueChangedを実装してください。「1/5ページ」形式の表示と、端のページで「前へ」「次へ」ボタンがdisabledになる制御を行います。`,
      code: `<div data-controller="pagination" data-pagination-page-value="1" data-pagination-total-value="5">
  <button id="prev" data-pagination-target="prev" data-action="pagination#prev">前へ</button>
  <span data-pagination-target="output"></span>
  <button id="next" data-pagination-target="next" data-action="pagination#next">次へ</button>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("pagination", class extends Controller {
  static targets = ["output", "prev", "next"];
  static values = { page: Number, total: Number };

  prev() {
    if (this.pageValue > 1) {
      this.pageValue = this.pageValue - 1;
    }
  }

  next() {
    if (this.pageValue < this.totalValue) {
      this.pageValue = this.pageValue + 1;
    }
  }

  pageValueChanged() {
    // TODO: outputTargetに「1/5ページ」の形式で表示する
    //       （this.pageValue + "/" + this.totalValue + "ページ"）
    // TODO: 1ページ目ならprevTargetをdisabledにする
    // TODO: 最終ページならnextTargetをdisabledにする
  }
});
<\/script>`,
      solution: `<div data-controller="pagination" data-pagination-page-value="1" data-pagination-total-value="5">
  <button id="prev" data-pagination-target="prev" data-action="pagination#prev">前へ</button>
  <span data-pagination-target="output"></span>
  <button id="next" data-pagination-target="next" data-action="pagination#next">次へ</button>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("pagination", class extends Controller {
  static targets = ["output", "prev", "next"];
  static values = { page: Number, total: Number };

  prev() {
    if (this.pageValue > 1) {
      this.pageValue = this.pageValue - 1;
    }
  }

  next() {
    if (this.pageValue < this.totalValue) {
      this.pageValue = this.pageValue + 1;
    }
  }

  pageValueChanged() {
    this.outputTarget.textContent = this.pageValue + "/" + this.totalValue + "ページ";
    this.prevTarget.disabled = this.pageValue <= 1;
    this.nextTarget.disabled = this.pageValue >= this.totalValue;
  }
});
<\/script>`,
      hints: [
        `disabledには比較結果をそのまま代入できます：this.prevTarget.disabled = this.pageValue <= 1;`,
        `初回のvalueChangedで「1/5ページ」の表示と「前へ」の無効化が最初から行われます`
      ],
      check: `assert(text("span") === "1/5ページ", "接続直後に「1/5ページ」と表示されるはずです");
assert($("#prev").disabled === true, "1ページ目では「前へ」ボタンがdisabledになるはずです");
assert($("#next").disabled === false, "1ページ目では「次へ」ボタンは押せるはずです");
click("#next");
await sleep(50);
assert(text("span") === "2/5ページ", "「次へ」を押すと「2/5ページ」になるはずです");
assert($("#prev").disabled === false, "2ページ目では「前へ」ボタンが押せるようになるはずです");
click("#next");
await sleep(50);
click("#next");
await sleep(50);
click("#next");
await sleep(50);
assert(text("span") === "5/5ページ", "「次へ」を4回押すと「5/5ページ」になるはずです");
assert($("#next").disabled === true, "最終ページでは「次へ」ボタンがdisabledになるはずです");`
    }
  ]
});
