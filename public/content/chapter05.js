// 第5章：アクション応用
registerChapter({
  number: 5,
  title: "アクション応用",
  description: "キーフィルタ・アクションパラメータ・@window/@documentなど、data-actionの応用記法を学び、キーボード対応UIを作れるようになります。",
  steps: [
    {
      id: 41,
      title: "イベント修飾子keydown.enter",
      explanation: `<p>第3章で学んだ<code>data-action</code>は、<code>keydown</code>（キーが押された）や<code>keyup</code>（キーが離された）といったキーボードイベントにも使えます。ただし素朴に<code>keydown-&gt;memo#add</code>と書くと、<strong>どのキーを押してもメソッドが呼ばれてしまいます</strong>。文字を1文字打つたびに「追加」が実行されたら困りますね。</p>
<p>そこでStimulusには<strong>イベント修飾子（キーフィルタ）</strong>が用意されています。イベント名の後ろにドット区切りでキー名を書くと、そのキーが押されたときだけメソッドが呼ばれます。</p>
<pre><code>&lt;input data-action="keydown.enter-&gt;memo#add"&gt;</code></pre>
<p>記法を分解すると次のようになります。</p>
<table>
<tr><th>部分</th><th>意味</th></tr>
<tr><td><code>keydown</code></td><td>イベント名</td></tr>
<tr><td><code>.enter</code></td><td>キーフィルタ（Enterキーのときだけ発火）</td></tr>
<tr><td><code>-&gt;memo#add</code></td><td>memoコントローラのaddメソッドを呼ぶ</td></tr>
</table>
<p>「入力欄でEnterを押したら確定する」はフォームUIの定番パターンです。素のDOMなら<code>addEventListener("keydown", ...)</code>の中で<code>if (event.key === "Enter")</code>と分岐を書く必要がありますが、StimulusならHTML属性に<code>.enter</code>と書くだけで済みます。JavaScript側のメソッドは「何をするか」だけに集中でき、コードがすっきりします。</p>`,
      task: `入力欄でEnterキーを押したときだけ「追加：（入力内容）」と表示されるように、data-actionにキーフィルタを追加してください。今のままではどのキーでも反応してしまいます。`,
      code: `<div data-controller="memo">
  <!-- TODO: Enterキーのときだけaddが呼ばれるようにキーフィルタを追加する -->
  <input data-memo-target="input" data-action="keydown->memo#add" placeholder="買うものを入力してEnter">
  <p data-memo-target="output"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("memo", class extends Controller {
  static targets = ["input", "output"];
  add() {
    this.outputTarget.textContent = "追加：" + this.inputTarget.value;
  }
});
<\/script>`,
      solution: `<div data-controller="memo">
  <input data-memo-target="input" data-action="keydown.enter->memo#add" placeholder="買うものを入力してEnter">
  <p data-memo-target="output"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("memo", class extends Controller {
  static targets = ["input", "output"];
  add() {
    this.outputTarget.textContent = "追加：" + this.inputTarget.value;
  }
});
<\/script>`,
      hints: [
        `イベント名の直後にドット区切りでキー名を書きます：keydown.enter`,
        `data-action="keydown.enter->memo#add" とすれば、Enterキー以外では反応しなくなります`
      ],
      check: `assert($("[data-controller=memo]"), "data-controller=memoの要素が必要です");
setValue("input", "牛乳");
keydown("input", "a");
await sleep(50);
assert(text("p") === "", "Enter以外のキー（例：a）では反応しないはずです。keydownにキーフィルタ（.enter）を付けましょう");
keydown("input", "Enter");
await sleep(50);
assert(text("p") === "追加：牛乳", "Enterキーを押すと<p>に「追加：牛乳」と表示されるはずです");`
    },
    {
      id: 42,
      title: "keydown.escとキーの種類",
      explanation: `<p>キーフィルタに使えるのはenterだけではありません。Stimulus 3.2では次のキー名が使えます。</p>
<table>
<tr><th>フィルタ名</th><th>対応するキー（event.key）</th></tr>
<tr><td><code>enter</code></td><td>Enter</td></tr>
<tr><td><code>esc</code></td><td>Escape</td></tr>
<tr><td><code>space</code></td><td>スペース</td></tr>
<tr><td><code>tab</code></td><td>Tab</td></tr>
<tr><td><code>up</code>／<code>down</code>／<code>left</code>／<code>right</code></td><td>矢印キー</td></tr>
<tr><td><code>home</code>／<code>end</code></td><td>Home／End</td></tr>
<tr><td><code>page_up</code>／<code>page_down</code></td><td>PageUp／PageDown</td></tr>
<tr><td><code>a</code>〜<code>z</code>、<code>0</code>〜<code>9</code></td><td>英字・数字キー</td></tr>
</table>
<p>注意したいのは、フィルタ名<code>esc</code>が実際のキー名<code>Escape</code>に対応している点です。JavaScriptのイベントオブジェクトでは<code>event.key</code>が<code>"Escape"</code>になりますが、data-actionでは短く<code>esc</code>と書きます。</p>
<pre><code>&lt;input data-action="keydown.esc-&gt;form#clear"&gt;</code></pre>
<p>escキーは「キャンセル」「閉じる」「取り消す」といった操作の定番キーです。入力を取り消したり、後の章で学ぶモーダル（画面に重なる小窓）を閉じたりするときに使います。キーボードだけで操作を完結できるUIは、マウスに持ち替える手間が減るだけでなく、アクセシビリティ（多様な利用者への配慮）の面でも重要です。</p>`,
      task: `入力欄でescキーを押すと入力が空になり「入力を取り消しました」と表示されるように、キーフィルタを直してください。今はenterに反応する間違った状態です。`,
      code: `<div data-controller="form">
  <!-- TODO: escキーで取り消せるようにキーフィルタを直す -->
  <input data-form-target="input" data-action="keydown.enter->form#clear" placeholder="escで取り消し">
  <p data-form-target="output"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("form", class extends Controller {
  static targets = ["input", "output"];
  clear() {
    this.inputTarget.value = "";
    this.outputTarget.textContent = "入力を取り消しました";
  }
});
<\/script>`,
      solution: `<div data-controller="form">
  <input data-form-target="input" data-action="keydown.esc->form#clear" placeholder="escで取り消し">
  <p data-form-target="output"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("form", class extends Controller {
  static targets = ["input", "output"];
  clear() {
    this.inputTarget.value = "";
    this.outputTarget.textContent = "入力を取り消しました";
  }
});
<\/script>`,
      hints: [
        `Escapeキーのフィルタ名はescです（escapeではありません）`,
        `data-action="keydown.esc->form#clear" と書きます`
      ],
      check: `assert($("[data-controller=form]"), "data-controller=formの要素が必要です");
setValue("input", "書きかけの文章");
keydown("input", "Escape");
await sleep(50);
assert($("input").value === "", "escキーを押すと入力欄が空になるはずです。キーフィルタをkeydown.escにしましょう");
assert(text("p") === "入力を取り消しました", "escキーを押すと「入力を取り消しました」と表示されるはずです");`
    },
    {
      id: 43,
      title: "アクションパラメータ（data-x-name-param）",
      explanation: `<p>「りんご」「バナナ」「ぶどう」の3つのボタンから同じメソッドを呼びつつ、<strong>どのボタンが押されたかによって違う値を渡したい</strong>。こんなとき便利なのが<strong>アクションパラメータ</strong>です。</p>
<p>アクションが付いた要素に、次の形式のdata属性を書きます。</p>
<pre><code>data-[コントローラ名]-[パラメータ名]-param="値"</code></pre>
<p>たとえばpickerコントローラにnameというパラメータを渡すなら、こう書きます。</p>
<pre><code>&lt;button data-action="picker#choose"
        data-picker-name-param="りんご"&gt;りんご&lt;/button&gt;</code></pre>
<p>メソッド側では<code>event.params.name</code>で受け取れます（受け取り方の詳細は次のステップで扱います）。属性名にコントローラ名（picker）が入っているのがポイントで、これによって「このパラメータはpickerコントローラ宛て」と明示されます。複数のコントローラが同じ要素にあっても混ざりません。</p>
<p>第1章で学んだ<code>data-*</code>属性＋<code>dataset</code>でも似たことはできますが、アクションパラメータには「コントローラ宛てだと明確」「型変換される（次ステップ）」という利点があります。なおパラメータ名をJavaScript側でitemNameのようにキャメルケースで使う場合、属性名は<code>data-picker-item-name-param</code>とケバブケースで書きます。ターゲット名（ステップ39）と同じ変換規則です。</p>`,
      task: `2つ目と3つ目のボタンにもアクションパラメータを追加して、それぞれ「バナナを選びました」「ぶどうを選びました」と表示されるようにしてください。`,
      code: `<div data-controller="picker">
  <button data-action="picker#choose" data-picker-name-param="りんご">りんご</button>
  <!-- TODO: バナナのパラメータを追加する -->
  <button data-action="picker#choose">バナナ</button>
  <!-- TODO: ぶどうのパラメータを追加する -->
  <button data-action="picker#choose">ぶどう</button>
  <p data-picker-target="output"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("picker", class extends Controller {
  static targets = ["output"];
  choose(event) {
    this.outputTarget.textContent = event.params.name + "を選びました";
  }
});
<\/script>`,
      solution: `<div data-controller="picker">
  <button data-action="picker#choose" data-picker-name-param="りんご">りんご</button>
  <button data-action="picker#choose" data-picker-name-param="バナナ">バナナ</button>
  <button data-action="picker#choose" data-picker-name-param="ぶどう">ぶどう</button>
  <p data-picker-target="output"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("picker", class extends Controller {
  static targets = ["output"];
  choose(event) {
    this.outputTarget.textContent = event.params.name + "を選びました";
  }
});
<\/script>`,
      hints: [
        `1つ目のボタンと同じ形式で、data-picker-name-param属性を追加します`,
        `属性名はdata-[コントローラ名]-[パラメータ名]-paramです。コントローラ名pickerとパラメータ名nameを当てはめましょう`
      ],
      check: `assert($("[data-controller=picker]"), "data-controller=pickerの要素が必要です");
click("button:nth-of-type(1)");
await sleep(50);
assert(text("p") === "りんごを選びました", "1つ目のボタンで「りんごを選びました」と表示されるはずです");
click("button:nth-of-type(2)");
await sleep(50);
assert(text("p") === "バナナを選びました", "2つ目のボタンにdata-picker-name-param=\\"バナナ\\"を追加しましょう");
click("button:nth-of-type(3)");
await sleep(50);
assert(text("p") === "ぶどうを選びました", "3つ目のボタンにdata-picker-name-param=\\"ぶどう\\"を追加しましょう");`
    },
    {
      id: 44,
      title: "event.paramsで受け取る",
      explanation: `<p>前のステップでHTML側にパラメータを書きました。今度は受け取る側、<code>event.params</code>をくわしく見てみましょう。アクションのメソッドが受け取るイベントオブジェクトには、Stimulusが<code>params</code>というプロパティを追加してくれます。その要素に付いた自分のコントローラ宛てのパラメータが、まとめて1つのオブジェクトになっています。</p>
<pre><code>&lt;button data-action="cart#add"
        data-cart-name-param="りんご"
        data-cart-price-param="120"&gt;りんご&lt;/button&gt;</code></pre>
<pre><code>add(event) {
  console.log(event.params); // { name: "りんご", price: 120 }
}</code></pre>
<p>注目してほしいのは<code>price</code>が<strong>数値の120</strong>になっている点です。HTML属性はすべて文字列ですが、Stimulusは値をJSONとして解釈して型変換してくれます。</p>
<table>
<tr><th>属性に書いた値</th><th>event.paramsでの型</th></tr>
<tr><td><code>"120"</code></td><td>数値 120</td></tr>
<tr><td><code>"true"</code></td><td>真偽値 true</td></tr>
<tr><td><code>"[1,2,3]"</code></td><td>配列</td></tr>
<tr><td><code>"りんご"</code></td><td>文字列（JSONとして解釈できないため）</td></tr>
</table>
<p>もし型変換がなければ、<code>"120" + "80"</code>は文字列連結で<code>"12080"</code>になってしまいます。数値として渡るからこそ、そのまま足し算できるのです。</p>`,
      task: `addメソッドを実装してください。event.paramsから商品名と価格を取り出し、合計金額に加算して「りんごを追加（合計120円）」の形式で表示します。`,
      code: `<div data-controller="cart">
  <button data-action="cart#add" data-cart-name-param="りんご" data-cart-price-param="120">りんご 120円</button>
  <button data-action="cart#add" data-cart-name-param="バナナ" data-cart-price-param="80">バナナ 80円</button>
  <p data-cart-target="output"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("cart", class extends Controller {
  static targets = ["output"];
  add(event) {
    // TODO: event.params.name と event.params.price を使う
    // 1. this.total に価格を加算する（最初はundefinedなので (this.total || 0) から始める）
    // 2. 「（商品名）を追加（合計（金額）円）」とoutputTargetに表示する
  }
});
<\/script>`,
      solution: `<div data-controller="cart">
  <button data-action="cart#add" data-cart-name-param="りんご" data-cart-price-param="120">りんご 120円</button>
  <button data-action="cart#add" data-cart-name-param="バナナ" data-cart-price-param="80">バナナ 80円</button>
  <p data-cart-target="output"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("cart", class extends Controller {
  static targets = ["output"];
  add(event) {
    this.total = (this.total || 0) + event.params.price;
    this.outputTarget.textContent = event.params.name + "を追加（合計" + this.total + "円）";
  }
});
<\/script>`,
      hints: [
        `event.params.priceは数値なので、そのまま足し算できます`,
        `this.total = (this.total || 0) + event.params.price; で合計を保持できます`,
        `表示はevent.params.name + "を追加（合計" + this.total + "円）"のように文字列連結で組み立てます`
      ],
      check: `assert($("[data-controller=cart]"), "data-controller=cartの要素が必要です");
click("button:nth-of-type(1)");
await sleep(50);
assert(text("p") === "りんごを追加（合計120円）", "りんごのボタンを押すと「りんごを追加（合計120円）」と表示されるはずです");
click("button:nth-of-type(2)");
await sleep(50);
assert(text("p") === "バナナを追加（合計200円）", "続けてバナナを押すと合計が200円になるはずです。priceが文字列連結（12080）になっていないか確認しましょう");`
    },
    {
      id: 45,
      title: "event.currentTargetとevent.target",
      explanation: `<p>第1章のステップ9で<code>event.target</code>（実際にクリックされた要素）を学びました。イベントオブジェクトにはもう1つ、よく似た<code>event.currentTarget</code>があります。違いを整理しましょう。</p>
<table>
<tr><th>プロパティ</th><th>指すもの</th></tr>
<tr><td><code>event.target</code></td><td>実際にイベントが起きた、いちばん内側の要素</td></tr>
<tr><td><code>event.currentTarget</code></td><td>イベントリスナーが付いている要素（Stimulusでは<strong>data-actionを書いた要素</strong>）</td></tr>
</table>
<p>ボタンの中に<code>&lt;strong&gt;</code>や<code>&lt;span&gt;</code>などの子要素があるケースを考えます。</p>
<pre><code>&lt;button data-action="click-&gt;picker#choose" data-plan="Aセット"&gt;
  &lt;strong&gt;A&lt;/strong&gt;セット
&lt;/button&gt;</code></pre>
<p>利用者が太字の「A」の部分をクリックすると、<code>event.target</code>は内側の<code>&lt;strong&gt;</code>要素になります。<code>event.target.dataset.plan</code>を読もうとしても、strong要素にはdata-plan属性がないので<code>undefined</code>です。一方<code>event.currentTarget</code>は常にdata-actionを書いたbutton要素なので、確実に<code>data-plan</code>を読めます。</p>
<p><strong>アクションのメソッドで「アクションを付けた要素自身」を扱いたいときは、event.currentTargetを使う</strong>と覚えてください。なお前ステップのアクションパラメータは、内部でcurrentTarget相当の要素から読み取られるため、子要素をクリックしても正しく渡ります。</p>`,
      task: `ボタン内の太字部分をクリックすると「undefinedを選択」と表示されてしまうバグがあります。event.targetをevent.currentTargetに直して、どこをクリックしても正しくプラン名が表示されるようにしてください。`,
      code: `<div data-controller="picker">
  <button data-action="click->picker#choose" data-plan="Aセット"><strong>A</strong>セット</button>
  <button data-action="click->picker#choose" data-plan="Bセット"><strong>B</strong>セット</button>
  <p data-picker-target="output"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("picker", class extends Controller {
  static targets = ["output"];
  choose(event) {
    // TODO: 太字部分をクリックするとevent.targetは<strong>要素になってしまう。
    // data-actionを書いたbutton要素を確実に指すプロパティに直す
    this.outputTarget.textContent = event.target.dataset.plan + "を選択";
  }
});
<\/script>`,
      solution: `<div data-controller="picker">
  <button data-action="click->picker#choose" data-plan="Aセット"><strong>A</strong>セット</button>
  <button data-action="click->picker#choose" data-plan="Bセット"><strong>B</strong>セット</button>
  <p data-picker-target="output"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("picker", class extends Controller {
  static targets = ["output"];
  choose(event) {
    this.outputTarget.textContent = event.currentTarget.dataset.plan + "を選択";
  }
});
<\/script>`,
      hints: [
        `event.targetは「実際にクリックされた要素」なので、太字部分では<strong>になります`,
        `event.currentTargetは常にdata-actionを書いた要素（ここではbutton）を指します`
      ],
      check: `assert($("[data-controller=picker]"), "data-controller=pickerの要素が必要です");
click("button:nth-of-type(1) strong");
await sleep(50);
assert(text("p") === "Aセットを選択", "ボタン内の太字部分をクリックしても「Aセットを選択」と表示されるはずです。event.currentTargetを使いましょう");
click("button:nth-of-type(2) strong");
await sleep(50);
assert(text("p") === "Bセットを選択", "2つ目のボタンの太字部分でも「Bセットを選択」と表示されるはずです");`
    },
    {
      id: 46,
      title: ":stopと:prevent修飾子",
      explanation: `<p>ステップ27でフォームの<code>submit</code>に<code>:prevent</code>を付けました。これは<strong>アクションオプション</strong>と呼ばれる仕組みで、メソッド名の後ろにコロン区切りで付けます。代表的なものを整理しましょう。</p>
<table>
<tr><th>オプション</th><th>効果</th></tr>
<tr><td><code>:prevent</code></td><td>event.preventDefault()を自動で呼ぶ（デフォルト動作の抑止）</td></tr>
<tr><td><code>:stop</code></td><td>event.stopPropagation()を自動で呼ぶ（バブリングの停止）</td></tr>
<tr><td><code>:self</code></td><td>event.targetがその要素自身のときだけ発火</td></tr>
<tr><td><code>:once</code></td><td>最初の1回だけ発火</td></tr>
</table>
<p><strong>バブリング</strong>とは、内側の要素で起きたイベントが親要素へ順に伝わっていく仕組みです。親のdivと子のbuttonの両方にクリックのアクションがあると、buttonをクリックしたとき<strong>両方のメソッドが呼ばれます</strong>（子→親の順）。</p>
<pre><code>&lt;div data-action="click-&gt;menu#outside"&gt;
  &lt;button data-action="click-&gt;menu#pick:stop"&gt;項目&lt;/button&gt;
&lt;/div&gt;</code></pre>
<p>子のアクションに<code>:stop</code>を付けると、イベントが親へ伝わらなくなり、pickだけが実行されます。素のDOMで<code>event.stopPropagation()</code>を書くのと同じ効果を、HTML属性だけで実現できるわけです。「メニューの外側をクリックしたら閉じるが、項目のクリックでは閉じない」といったUIで活躍します。</p>`,
      task: `「項目」ボタンをクリックすると[項目][枠]と両方のメソッドが実行されてしまいます。ボタンのアクションに:stopを付けて、[項目]だけが記録されるようにしてください。`,
      code: `<div data-controller="menu" data-action="click->menu#outside">
  <p>この枠のどこかをクリックすると[枠]が記録されます</p>
  <!-- TODO: ボタンのクリックが枠に伝わらないようにアクションオプションを付ける -->
  <button data-action="click->menu#pick">項目</button>
  <p>記録：<span data-menu-target="log"></span></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("menu", class extends Controller {
  static targets = ["log"];
  outside() {
    this.logTarget.textContent = this.logTarget.textContent + "[枠]";
  }
  pick() {
    this.logTarget.textContent = this.logTarget.textContent + "[項目]";
  }
});
<\/script>`,
      solution: `<div data-controller="menu" data-action="click->menu#outside">
  <p>この枠のどこかをクリックすると[枠]が記録されます</p>
  <button data-action="click->menu#pick:stop">項目</button>
  <p>記録：<span data-menu-target="log"></span></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("menu", class extends Controller {
  static targets = ["log"];
  outside() {
    this.logTarget.textContent = this.logTarget.textContent + "[枠]";
  }
  pick() {
    this.logTarget.textContent = this.logTarget.textContent + "[項目]";
  }
});
<\/script>`,
      hints: [
        `アクションオプションはメソッド名の後ろにコロン区切りで付けます`,
        `data-action="click->menu#pick:stop" とすると、クリックが親要素へ伝わらなくなります`
      ],
      check: `assert($("[data-controller=menu]"), "data-controller=menuの要素が必要です");
click("button");
await sleep(50);
assert(text("[data-menu-target=log]") !== "[項目][枠]", "ボタンのクリックが枠まで伝わっています。ボタンのアクションに:stopを付けましょう");
assert(text("[data-menu-target=log]") === "[項目]", "ボタンをクリックすると[項目]だけが記録されるはずです");`
    },
    {
      id: 47,
      title: "windowとdocumentのイベント（@window）",
      explanation: `<p>これまでのアクションは「data-actionを書いた要素の上で起きたイベント」に反応していました。これがステップ16で学んだコントローラのスコープの考え方に沿った、Stimulusの基本動作です。</p>
<p>しかし「ページの<strong>どこ</strong>をクリックしても反応したい」「画面全体のスクロールやリサイズを監視したい」という場面もあります。そのために、イベント名の後ろに<code>@window</code>または<code>@document</code>を付ける記法があります。</p>
<pre><code>&lt;p data-action="click@window-&gt;watcher#record"&gt;...&lt;/p&gt;</code></pre>
<p>こう書くと、リスナーはp要素ではなく<strong>windowに登録されます</strong>。ページ内のどこでクリックが起きても（コントローラの要素の外側でも）recordメソッドが呼ばれるようになります。クリックなどのイベントはバブリングによって最終的にdocument、windowまで届くため、window側で待ち構えれば全部を拾えるという仕組みです。</p>
<p>重要なのは、<strong>リスナーの登録先がwindowでも、呼ばれるメソッドは自分のコントローラのもの</strong>だという点です。またコントローラが切断されるとStimulusがリスナーを自動で解除してくれるため、素のDOMで<code>window.addEventListener</code>を使うときにありがちな「解除し忘れ」の心配がありません。代表的な使いどころは「ドロップダウンメニューの外側クリックで閉じる」処理で、第15章で実際に作ります。</p>`,
      task: `コントローラの外側にあるボタンをクリックしても回数が数えられるように、data-actionに@windowを追加してください。`,
      code: `<button id="outside">コントローラの外のボタン</button>

<div data-controller="watcher">
  <!-- TODO: ページ内のどこのクリックにも反応するように@windowを付ける -->
  <p data-action="click->watcher#record" data-watcher-target="output">まだクリックされていません</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("watcher", class extends Controller {
  static targets = ["output"];
  record() {
    this.count = (this.count || 0) + 1;
    this.outputTarget.textContent = "ページ内クリック" + this.count + "回目";
  }
});
<\/script>`,
      solution: `<button id="outside">コントローラの外のボタン</button>

<div data-controller="watcher">
  <p data-action="click@window->watcher#record" data-watcher-target="output">まだクリックされていません</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("watcher", class extends Controller {
  static targets = ["output"];
  record() {
    this.count = (this.count || 0) + 1;
    this.outputTarget.textContent = "ページ内クリック" + this.count + "回目";
  }
});
<\/script>`,
      hints: [
        `イベント名の後ろに@windowを付けます：click@window`,
        `data-action="click@window->watcher#record" とすると、リスナーがwindowに登録されます`
      ],
      check: `assert($("[data-controller=watcher]"), "data-controller=watcherの要素が必要です");
click("#outside");
await sleep(50);
assert(text("[data-watcher-target=output]") === "ページ内クリック1回目", "コントローラの外のボタンをクリックしても数えられるはずです。click@windowにしましょう");
click("#outside");
await sleep(50);
assert(text("[data-watcher-target=output]") === "ページ内クリック2回目", "2回クリックすると「ページ内クリック2回目」になるはずです");`
    },
    {
      id: 48,
      title: "resize@windowやkeydown@document",
      explanation: `<p><code>@window</code>と<code>@document</code>が特に役立つ、実践的なイベントを見てみましょう。</p>
<table>
<tr><th>記法</th><th>用途</th></tr>
<tr><td><code>resize@window</code></td><td>ウィンドウサイズの変化に反応（画面幅に応じた表示切替など）</td></tr>
<tr><td><code>scroll@window</code></td><td>ページ全体のスクロールに反応（トップへ戻るボタンの表示など）</td></tr>
<tr><td><code>keydown@document</code></td><td>どこにフォーカスがあってもキー入力に反応（キーボードショートカット）</td></tr>
</table>
<p><code>resize</code>や<code>scroll</code>はそもそもwindowで発生するイベントなので、<code>@window</code>を付けないと受け取れません。またキーボードイベントは「フォーカスされている要素」で発生するため、入力欄の外でのキー操作を拾いたいなら<code>@document</code>（または<code>@window</code>）で待ち構える必要があります。</p>
<p>さらに、キーフィルタとの組み合わせもできます。</p>
<pre><code>&lt;div data-controller="shortcut"
     data-action="keydown.h@document-&gt;shortcut#open
                  keydown.esc@document-&gt;shortcut#close"&gt;</code></pre>
<p>「イベント名.キーフィルタ@登録先-&gt;コントローラ#メソッド」という順序で組み立てます。ステップ29で学んだとおり、data-actionにはスペース区切りで複数のアクションを書けるので、「hで開く」「escで閉じる」を1つの属性にまとめられます。GmailやGitHubのようなキーボードショートカット付きUIの土台になる記法です。</p>`,
      task: `どこにフォーカスがあってもhキーでヘルプが開き、escキーで閉じるように、2つのアクションに@documentを追加してください。`,
      code: `<div data-controller="shortcut"
     data-action="keydown.h->shortcut#open keydown.esc->shortcut#close">
  <!-- TODO: 上の2つのアクションに@documentを付けて、ページ全体のキー入力を拾えるようにする -->
  <p>hキー：ヘルプを表示／escキー：閉じる</p>
  <div data-shortcut-target="panel" class="hidden">ヘルプ：ここに操作説明が入ります</div>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("shortcut", class extends Controller {
  static targets = ["panel"];
  open() {
    this.panelTarget.classList.remove("hidden");
  }
  close() {
    this.panelTarget.classList.add("hidden");
  }
});
<\/script>`,
      solution: `<div data-controller="shortcut"
     data-action="keydown.h@document->shortcut#open keydown.esc@document->shortcut#close">
  <p>hキー：ヘルプを表示／escキー：閉じる</p>
  <div data-shortcut-target="panel" class="hidden">ヘルプ：ここに操作説明が入ります</div>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("shortcut", class extends Controller {
  static targets = ["panel"];
  open() {
    this.panelTarget.classList.remove("hidden");
  }
  close() {
    this.panelTarget.classList.add("hidden");
  }
});
<\/script>`,
      hints: [
        `キーフィルタの後ろに@documentを付けます：keydown.h@document`,
        `2つのアクション両方に付けるのを忘れずに：keydown.h@document->shortcut#open keydown.esc@document->shortcut#close`
      ],
      check: `assert($("[data-controller=shortcut]"), "data-controller=shortcutの要素が必要です");
var panel = $("[data-shortcut-target=panel]");
assert(panel, "data-shortcut-target=panelの要素が必要です");
assert(panel.classList.contains("hidden"), "最初はヘルプパネルが隠れている（hiddenクラスが付いている）はずです");
keydown("body", "h");
await sleep(50);
assert(!panel.classList.contains("hidden"), "ページのどこでhキーを押してもヘルプが開くはずです。keydown.h@documentにしましょう");
keydown("body", "Escape");
await sleep(50);
assert(panel.classList.contains("hidden"), "escキーでヘルプが閉じる（hiddenクラスが付く）はずです");`
    },
    {
      id: 49,
      title: "アクションの動的な付け外し（disabled属性）",
      explanation: `<p>「一度押したらもう押せないボタン」を作るにはどうすればよいでしょうか。ボタン要素には<code>disabled</code>という属性（プロパティ）があり、これをtrueにすると<strong>ボタンは無効化され、クリックイベント自体が発生しなくなります</strong>。data-actionが付いたままでも、イベントが起きないのでメソッドは呼ばれません。</p>
<pre><code>claim() {
  // 処理をしたあと、ボタンを無効化する
  this.buttonTarget.disabled = true;
}</code></pre>
<p>disabledにされたボタンはブラウザが自動で薄い表示にし、マウスカーソルも変わるため、「もう押せない」ことが利用者にも伝わります。二重送信の防止（同じ注文を2回送ってしまう事故を防ぐ）はWebアプリの重要パターンで、第17章の非同期処理でも再登場します。</p>
<p>もう1つ知っておきたいのは、Stimulusが<strong>DOMの変化を常に監視している</strong>ことです。JavaScriptで<code>data-action</code>属性そのものを書き換えたり削除したりすると、Stimulusは即座にリスナーを付け直し・解除します。つまりアクションは「ページ読み込み時に固定」ではなく、<strong>HTMLの今の状態に常に追従する</strong>のです。この性質は後の章（ライフサイクル、リスト操作）で深く関わってきます。まずは手軽で分かりやすいdisabledによる制御を身につけましょう。</p>`,
      task: `クーポンを何度も受け取れてしまうバグを直します。claimメソッドの最後でボタンをdisabledにして、1回しか押せないようにしてください。`,
      code: `<div data-controller="coupon">
  <button data-coupon-target="button" data-action="click->coupon#claim">クーポンを受け取る</button>
  <p data-coupon-target="output"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("coupon", class extends Controller {
  static targets = ["button", "output"];
  claim() {
    this.count = (this.count || 0) + 1;
    this.outputTarget.textContent = "受け取り回数：" + this.count;
    // TODO: ボタンを無効化して、2回目以降は押せないようにする
  }
});
<\/script>`,
      solution: `<div data-controller="coupon">
  <button data-coupon-target="button" data-action="click->coupon#claim">クーポンを受け取る</button>
  <p data-coupon-target="output"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("coupon", class extends Controller {
  static targets = ["button", "output"];
  claim() {
    this.count = (this.count || 0) + 1;
    this.outputTarget.textContent = "受け取り回数：" + this.count;
    this.buttonTarget.disabled = true;
  }
});
<\/script>`,
      hints: [
        `ボタンはdata-coupon-target="button"なので、this.buttonTargetで参照できます`,
        `this.buttonTarget.disabled = true; でボタンを無効化できます`
      ],
      check: `assert($("[data-controller=coupon]"), "data-controller=couponの要素が必要です");
click("button");
await sleep(50);
assert(text("p") === "受け取り回数：1", "1回目のクリックで「受け取り回数：1」と表示されるはずです");
assert($("button").disabled === true, "受け取り後はボタンがdisabledになっているはずです");
click("button");
await sleep(50);
assert(text("p") === "受け取り回数：1", "2回目のクリックでは回数が増えないはずです。ボタンをdisabledにしましょう");`
    },
    {
      id: 50,
      title: "総合演習：キーボード対応の電卓ボタン",
      explanation: `<p>第5章の総まとめとして、マウスでもキーボードでも入力できる電卓の数字ボタンを作ります。使う知識を整理しましょう。</p>
<table>
<tr><th>知識</th><th>この演習での使い方</th></tr>
<tr><td>アクションパラメータ（43・44）</td><td>各ボタンにdata-calc-digit-paramで数字を持たせ、event.params.digitで受け取る</td></tr>
<tr><td>キーフィルタ（41・42）</td><td>keydown.1のように数字キーだけに反応させる</td></tr>
<tr><td>@document（47・48）</td><td>フォーカスがどこにあってもキー入力を拾う</td></tr>
<tr><td>複数アクション（29）</td><td>1つのdata-actionにスペース区切りで3つのキーを並べる</td></tr>
</table>
<p>設計のポイントは、クリック用の<code>press</code>とキーボード用の<code>key</code>という2つの入口メソッドを用意しつつ、<strong>実際の処理は共通の<code>append</code>メソッドに集約する</strong>ことです（ステップ19で学んだメソッド整理の考え方）。</p>
<pre><code>press(event) { this.append(String(event.params.digit)); }
key(event)   { this.append(event.key); }</code></pre>
<p>pressではパラメータが数値に型変換されているため<code>String()</code>で文字列に戻し、keyでは<code>event.key</code>（押されたキーの文字）をそのまま使います。入口が違っても最終的な振る舞いは1か所で管理する。これは実務のコントローラ設計でも大切な習慣です。</p>`,
      task: `2か所のTODOを完成させてください。（1）pressメソッドでevent.params.digitを使ってappendを呼ぶ。（2）div のdata-actionの3つのキーアクションに@documentを付ける。`,
      code: `<div data-controller="calc"
     data-action="keydown.1->calc#key keydown.2->calc#key keydown.3->calc#key">
  <!-- TODO(2): 上の3つのアクションに@documentを付けて、ページ全体のキー入力に反応させる -->
  <p>ディスプレイ：<span data-calc-target="display">0</span></p>
  <button data-action="calc#press" data-calc-digit-param="1">1</button>
  <button data-action="calc#press" data-calc-digit-param="2">2</button>
  <button data-action="calc#press" data-calc-digit-param="3">3</button>
  <button data-action="calc#clear">C</button>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("calc", class extends Controller {
  static targets = ["display"];
  press(event) {
    // TODO(1): event.params.digitをString()で文字列にしてappendに渡す
  }
  key(event) {
    this.append(event.key);
  }
  clear() {
    this.displayTarget.textContent = "0";
  }
  append(digit) {
    const current = this.displayTarget.textContent;
    this.displayTarget.textContent = current === "0" ? digit : current + digit;
  }
});
<\/script>`,
      solution: `<div data-controller="calc"
     data-action="keydown.1@document->calc#key keydown.2@document->calc#key keydown.3@document->calc#key">
  <p>ディスプレイ：<span data-calc-target="display">0</span></p>
  <button data-action="calc#press" data-calc-digit-param="1">1</button>
  <button data-action="calc#press" data-calc-digit-param="2">2</button>
  <button data-action="calc#press" data-calc-digit-param="3">3</button>
  <button data-action="calc#clear">C</button>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("calc", class extends Controller {
  static targets = ["display"];
  press(event) {
    this.append(String(event.params.digit));
  }
  key(event) {
    this.append(event.key);
  }
  clear() {
    this.displayTarget.textContent = "0";
  }
  append(digit) {
    const current = this.displayTarget.textContent;
    this.displayTarget.textContent = current === "0" ? digit : current + digit;
  }
});
<\/script>`,
      hints: [
        `pressの中身は this.append(String(event.params.digit)); の1行です`,
        `event.params.digitは数値に型変換されているので、String()で文字列に戻してからappendに渡します`,
        `キーアクションは keydown.1@document->calc#key のように、キーフィルタの後ろに@documentを付けます`
      ],
      check: `assert($("[data-controller=calc]"), "data-controller=calcの要素が必要です");
click("[data-calc-digit-param='1']");
await sleep(50);
assert(text("[data-calc-target=display]") === "1", "ボタン1を押すとディスプレイが「1」になるはずです。pressメソッドを実装しましょう");
click("[data-calc-digit-param='2']");
await sleep(50);
assert(text("[data-calc-target=display]") === "12", "続けてボタン2を押すと「12」になるはずです");
keydown("body", "3");
await sleep(50);
assert(text("[data-calc-target=display]") === "123", "キーボードの3を押すと「123」になるはずです。キーアクションに@documentを付けましょう");
click("[data-action='calc#clear']");
await sleep(50);
assert(text("[data-calc-target=display]") === "0", "Cボタンでディスプレイが「0」に戻るはずです");`
    }
  ]
});
