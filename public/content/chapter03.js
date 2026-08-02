// 第3章：アクション
registerChapter({
  number: 3,
  title: "アクション",
  description: "data-action属性を使って、クリックや入力などのイベントとコントローラのメソッドを結び付ける方法を学びます。",
  steps: [
    {
      id: 21,
      title: "data-actionの基本（click->hello#greet）",
      explanation: `<p>第1章では、ボタンのクリックに反応するために<code>addEventListener</code>をJavaScriptで書きました。Stimulusでは、<strong>data-action属性</strong>をHTMLに書くだけで、イベントとコントローラのメソッドを結び付けられます。</p>
<pre><code>&lt;div data-controller="hello"&gt;
  &lt;button data-action="click-&gt;hello#greet"&gt;あいさつ&lt;/button&gt;
&lt;/div&gt;</code></pre>
<p><code>click-&gt;hello#greet</code>は「クリックされたら、helloコントローラのgreetメソッドを呼ぶ」という意味です。この1行を書くだけで、Stimulusが内部で<code>addEventListener</code>の登録を自動的に行ってくれます。要素が消えたときのリスナー解除も自動です。</p>
<p>data-actionの利点は、<strong>HTMLを見るだけで「この要素を操作すると何が起きるか」がわかる</strong>ことです。JavaScriptファイルを開かなくても、ボタンとメソッドの対応が一目でわかります。これがStimulusの「HTML主導」の考え方です。</p>
<p>呼ばれるメソッドは、コントローラのクラスに普通のメソッドとして定義します。</p>
<pre><code>application.register("hello", class extends Controller {
  greet() {
    // ボタンがクリックされると呼ばれる
  }
});</code></pre>
<p>メソッドの中では、第2章で学んだ<code>this.element</code>を使ってコントローラ内の要素にアクセスできます。</p>`,
      task: `ボタンにdata-action="click->hello#greet"を追加して、クリックすると「こんにちは！」と表示されるようにしてください。`,
      code: `<div data-controller="hello">
  <!-- TODO: このボタンに data-action="click->hello#greet" を追加する -->
  <button>あいさつ</button>
  <p id="output"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("hello", class extends Controller {
  greet() {
    this.element.querySelector("#output").textContent = "こんにちは！";
  }
});
<\/script>`,
      solution: `<div data-controller="hello">
  <button data-action="click->hello#greet">あいさつ</button>
  <p id="output"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("hello", class extends Controller {
  greet() {
    this.element.querySelector("#output").textContent = "こんにちは！";
  }
});
<\/script>`,
      hints: [
        `data-actionはbutton要素の属性として書きます。<button data-action="click->hello#greet">のようになります`,
        `記法は「イベント名->コントローラ名#メソッド名」です`
      ],
      check: `assert($("[data-controller=hello]"), "data-controller='hello'の要素が必要です");
const btn = $("button");
assert(btn, "button要素が必要です");
assert((btn.getAttribute("data-action") || "").includes("click->hello#greet"), "buttonにdata-action='click->hello#greet'を追加してください");
click("button");
await sleep(50);
assert(text("#output") === "こんにちは！", "ボタンを押すと#outputに「こんにちは！」と表示されるはずです");`
    },
    {
      id: 22,
      title: "アクション記法の分解（イベント->コントローラ#メソッド）",
      explanation: `<p>data-actionの値は<strong>アクションディスクリプタ</strong>と呼ばれ、3つの部品からできています。</p>
<table>
  <tr><th>部品</th><th>意味</th><th>例</th></tr>
  <tr><td>イベント名</td><td>どのイベントに反応するか</td><td><code>click</code></td></tr>
  <tr><td><code>-&gt;</code></td><td>区切り記号（ハイフン＋大なり）</td><td><code>-&gt;</code></td></tr>
  <tr><td>コントローラ名#メソッド名</td><td>誰の・どのメソッドを呼ぶか</td><td><code>hello#greet</code></td></tr>
</table>
<p>つまり<code>click-&gt;hello#greet</code>は「<code>click</code>イベントが起きたら、<code>hello</code>コントローラの<code>greet</code>メソッドを呼ぶ」と読めます。</p>
<p>書き間違いやすいポイントを押さえておきましょう。</p>
<ul>
  <li>区切りは<code>-&gt;</code>です。<code>=&gt;</code>（アロー関数の記号）ではありません</li>
  <li>コントローラ名とメソッド名の間は<code>#</code>です。<code>.</code>（ドット）ではありません</li>
  <li>コントローラ名は<code>data-controller</code>に書いた識別子と完全に一致させます</li>
  <li>メソッド名はコントローラに定義したメソッド名と完全に一致させます</li>
</ul>
<p>記法を間違えるとStimulusはメソッドを呼び出せず、ブラウザのコンソールに警告が出ることもありますが、画面上は「何も起きない」だけなので気づきにくいです。動かないときはまずdata-actionのつづりを疑いましょう。</p>`,
      task: `data-actionの記法が間違っているため、ボタンを押しても何も起きません。正しい記法「click->sound#play」に直してください。`,
      code: `<div data-controller="sound">
  <!-- TODO: data-actionの記法が間違っている。正しい記法に直す -->
  <button data-action="click->sound.play">鳴らす</button>
  <p id="output"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("sound", class extends Controller {
  play() {
    this.element.querySelector("#output").textContent = "ピアノの音が鳴りました";
  }
});
<\/script>`,
      solution: `<div data-controller="sound">
  <button data-action="click->sound#play">鳴らす</button>
  <p id="output"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("sound", class extends Controller {
  play() {
    this.element.querySelector("#output").textContent = "ピアノの音が鳴りました";
  }
});
<\/script>`,
      hints: [
        `コントローラ名とメソッド名の区切りは「.」ではなく「#」です`,
        `正しい形は「イベント名->コントローラ名#メソッド名」、つまりclick->sound#playです`
      ],
      check: `const btn = $("button");
assert(btn, "button要素が必要です");
assert(btn.getAttribute("data-action") === "click->sound#play", "data-actionは「click->sound#play」の形にしてください（区切りは#です）");
click("button");
await sleep(50);
assert(text("#output") === "ピアノの音が鳴りました", "ボタンを押すと#outputに「ピアノの音が鳴りました」と表示されるはずです");`
    },
    {
      id: 23,
      title: "複数のボタンから同じメソッドを呼ぶ",
      explanation: `<p>同じdata-actionを複数の要素に付ければ、<strong>どの要素からでも同じメソッドを呼べます</strong>。素のDOMなら要素ごとに<code>addEventListener</code>を書くか、ループで登録する必要がありましたが、Stimulusでは属性を付けるだけです。</p>
<pre><code>&lt;div data-controller="counter"&gt;
  &lt;button data-action="click-&gt;counter#increment"&gt;ボタン1&lt;/button&gt;
  &lt;button data-action="click-&gt;counter#increment"&gt;ボタン2&lt;/button&gt;
&lt;/div&gt;</code></pre>
<p>どちらのボタンを押しても、同じ<code>increment</code>メソッドが呼ばれます。</p>
<p>今回はクリック回数を数えるために、<strong>インスタンス変数</strong>を使います。第2章で学んだ<code>connect()</code>はコントローラが要素に接続されたときに1回呼ばれるので、そこで<code>this.count = 0;</code>と初期化しておけば、以降どのメソッドからも<code>this.count</code>で同じ値にアクセスできます。</p>
<pre><code>connect() {
  this.count = 0; // 接続時に初期化
}
increment() {
  this.count = this.count + 1;
}</code></pre>
<p>コントローラは接続中ずっと同じインスタンスが使われるため、メソッドをまたいで値を覚えておけます。なお、状態の持ち方には後の章でより良い方法（values）が出てきますが、まずは基本の形を押さえましょう。</p>`,
      task: `ボタン2とボタン3にもボタン1と同じdata-actionを追加して、3つのどのボタンを押してもカウントが増えるようにしてください。`,
      code: `<div data-controller="counter">
  <button id="b1" data-action="click->counter#increment">ボタン1</button>
  <!-- TODO: ボタン2とボタン3にもボタン1と同じdata-actionを追加する -->
  <button id="b2">ボタン2</button>
  <button id="b3">ボタン3</button>
  <p id="count">0回</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("counter", class extends Controller {
  connect() {
    this.count = 0;
  }
  increment() {
    this.count = this.count + 1;
    this.element.querySelector("#count").textContent = this.count + "回";
  }
});
<\/script>`,
      solution: `<div data-controller="counter">
  <button id="b1" data-action="click->counter#increment">ボタン1</button>
  <button id="b2" data-action="click->counter#increment">ボタン2</button>
  <button id="b3" data-action="click->counter#increment">ボタン3</button>
  <p id="count">0回</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("counter", class extends Controller {
  connect() {
    this.count = 0;
  }
  increment() {
    this.count = this.count + 1;
    this.element.querySelector("#count").textContent = this.count + "回";
  }
});
<\/script>`,
      hints: [
        `ボタン1のdata-action="click->counter#increment"をそのままコピーして、ボタン2とボタン3にも付けます`
      ],
      check: `assert((($("#b2") && $("#b2").getAttribute("data-action")) || "").includes("counter#increment"), "ボタン2（#b2）にもdata-action='click->counter#increment'を追加してください");
assert((($("#b3") && $("#b3").getAttribute("data-action")) || "").includes("counter#increment"), "ボタン3（#b3）にもdata-action='click->counter#increment'を追加してください");
click("#b1");
await sleep(50);
click("#b2");
await sleep(50);
click("#b3");
await sleep(50);
assert(text("#count") === "3回", "3つのボタンを1回ずつ押すと#countに「3回」と表示されるはずです");`
    },
    {
      id: 24,
      title: "異なるメソッドを呼び分ける",
      explanation: `<p>1つのコントローラには<strong>複数のメソッド</strong>を定義できます。ボタンごとに異なるメソッドを指定すれば、操作を呼び分けられます。</p>
<pre><code>application.register("lamp", class extends Controller {
  turnOn() {
    // 「つける」ボタンから呼ばれる
  }
  turnOff() {
    // 「けす」ボタンから呼ばれる
  }
});</code></pre>
<p>HTML側では、data-actionのメソッド名の部分だけを変えます。</p>
<pre><code>&lt;button data-action="click-&gt;lamp#turnOn"&gt;つける&lt;/button&gt;
&lt;button data-action="click-&gt;lamp#turnOff"&gt;けす&lt;/button&gt;</code></pre>
<p>素のDOMで書くと、ボタンごとに<code>addEventListener</code>を登録するコードが増えていきますが、Stimulusなら「コントローラに操作をまとめて定義し、HTML側でどの操作を呼ぶか指定する」という整理された形になります。</p>
<p>コントローラは「その部品に対する操作の置き場所」です。電気のON/OFFのように関連する操作は1つのコントローラにまとめると、コードの見通しが良くなります。メソッド名は<code>turnOn</code>のように「動詞で始まる、何をするかがわかる名前」を付けるのが慣例です。</p>`,
      task: `「けす」ボタンにdata-actionを追加して、lampコントローラのturnOffメソッドが呼ばれるようにしてください。`,
      code: `<div data-controller="lamp">
  <button id="on" data-action="click->lamp#turnOn">つける</button>
  <!-- TODO: このボタンからturnOffメソッドが呼ばれるようにdata-actionを追加する -->
  <button id="off">けす</button>
  <p id="state">OFF</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("lamp", class extends Controller {
  turnOn() {
    this.element.querySelector("#state").textContent = "ON";
  }
  turnOff() {
    this.element.querySelector("#state").textContent = "OFF";
  }
});
<\/script>`,
      solution: `<div data-controller="lamp">
  <button id="on" data-action="click->lamp#turnOn">つける</button>
  <button id="off" data-action="click->lamp#turnOff">けす</button>
  <p id="state">OFF</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("lamp", class extends Controller {
  turnOn() {
    this.element.querySelector("#state").textContent = "ON";
  }
  turnOff() {
    this.element.querySelector("#state").textContent = "OFF";
  }
});
<\/script>`,
      hints: [
        `「つける」ボタンのdata-actionを参考に、メソッド名の部分だけをturnOffに変えます`,
        `data-action="click->lamp#turnOff"となります`
      ],
      check: `click("#on");
await sleep(50);
assert(text("#state") === "ON", "「つける」ボタンを押すと#stateが「ON」になるはずです");
click("#off");
await sleep(50);
assert(text("#state") === "OFF", "「けす」ボタンを押すと#stateが「OFF」に戻るはずです。#offのボタンにdata-action='click->lamp#turnOff'を追加してください");`
    },
    {
      id: 25,
      title: "inputイベント（input->x#update）",
      explanation: `<p>data-actionで使えるのは<code>click</code>だけではありません。<strong>ブラウザのあらゆるDOMイベント</strong>を指定できます。今回は入力欄の<code>input</code>イベントを使います。</p>
<p><code>input</code>イベントは、テキストボックスに<strong>1文字入力（または削除）されるたび</strong>に発生します。リアルタイムに反応するUIの基本です。</p>
<pre><code>&lt;input type="text" data-action="input-&gt;echo#update"&gt;</code></pre>
<p>呼ばれるメソッドは、引数として<strong>イベントオブジェクト</strong>を受け取れます。第1章で学んだ<code>event.target</code>がここでも使えます。<code>event.target</code>はイベントが起きた要素、つまり入力欄そのものなので、<code>event.target.value</code>で現在の入力内容を取り出せます。</p>
<pre><code>update(event) {
  // event.targetは入力されたinput要素
  console.log(event.target.value);
}</code></pre>
<p>引数が不要なメソッド（前ステップまでのgreetなど）では省略していましたが、イベントの情報が欲しいときは第1引数に<code>event</code>を書きます。Stimulusが自動でイベントオブジェクトを渡してくれます。</p>
<p>「入力のたびにメソッドが呼ばれて画面が更新される」という流れは、文字数カウンタやリアルタイム検索など多くのUIで使う重要パターンです。</p>`,
      task: `input要素にdata-actionを追加して、入力するたびにupdateメソッドが呼ばれ、入力内容が#outputにそのまま表示されるようにしてください。`,
      code: `<div data-controller="echo">
  <!-- TODO: 入力のたびにechoコントローラのupdateメソッドが呼ばれるようにする -->
  <input type="text" placeholder="何か入力してください">
  <p id="output"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("echo", class extends Controller {
  update(event) {
    this.element.querySelector("#output").textContent = event.target.value;
  }
});
<\/script>`,
      solution: `<div data-controller="echo">
  <input type="text" placeholder="何か入力してください" data-action="input->echo#update">
  <p id="output"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("echo", class extends Controller {
  update(event) {
    this.element.querySelector("#output").textContent = event.target.value;
  }
});
<\/script>`,
      hints: [
        `イベント名の部分をclickではなくinputにします`,
        `data-action="input->echo#update"をinput要素に追加します`
      ],
      check: `const input = $("input");
assert(input, "input要素が必要です");
assert((input.getAttribute("data-action") || "").includes("input->echo#update"), "input要素にdata-action='input->echo#update'を追加してください");
setValue("input", "やっほー");
await sleep(50);
assert(text("#output") === "やっほー", "入力欄に「やっほー」と入力すると#outputに「やっほー」と表示されるはずです");
setValue("input", "Stimulus");
await sleep(50);
assert(text("#output") === "Stimulus", "入力内容を変えると#outputも変わるはずです");`
    },
    {
      id: 26,
      title: "changeイベントとselect要素",
      explanation: `<p>フォーム関連でもう1つよく使うのが<code>change</code>イベントです。<code>input</code>との違いを整理しましょう。</p>
<table>
  <tr><th>イベント</th><th>発生するタイミング</th><th>主な用途</th></tr>
  <tr><td><code>input</code></td><td>値が変わるたび（1文字ごと）</td><td>テキストのリアルタイム反映</td></tr>
  <tr><td><code>change</code></td><td>値が確定したとき</td><td>select・チェックボックス・ラジオ</td></tr>
</table>
<p><code>select</code>要素（プルダウン）では、選択肢を選んだ瞬間に<code>change</code>イベントが発生します。data-actionの書き方はこれまでと同じで、イベント名を<code>change</code>にするだけです。</p>
<pre><code>&lt;select data-action="change-&gt;picker#choose"&gt;
  &lt;option value="赤"&gt;赤&lt;/option&gt;
  &lt;option value="青"&gt;青&lt;/option&gt;
&lt;/select&gt;</code></pre>
<p>選ばれた値は、input要素のときと同じく<code>event.target.value</code>で取れます。<code>select</code>要素の<code>value</code>は、選択中の<code>option</code>の<code>value</code>属性の値です。</p>
<pre><code>choose(event) {
  console.log(event.target.value); // 例："青"
}</code></pre>
<p>「イベント名を変えるだけで、いろいろな要素・操作に対応できる」というdata-actionの柔軟さを体感してください。</p>`,
      task: `select要素にdata-actionを追加して、色を選ぶとchooseメソッドが呼ばれ、「◯を選びました」と表示されるようにしてください。`,
      code: `<div data-controller="picker">
  <!-- TODO: 選択が変わったらpickerコントローラのchooseメソッドが呼ばれるようにする -->
  <select>
    <option value="">選んでください</option>
    <option value="赤">赤</option>
    <option value="青">青</option>
    <option value="緑">緑</option>
  </select>
  <p id="output"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("picker", class extends Controller {
  choose(event) {
    this.element.querySelector("#output").textContent = event.target.value + "を選びました";
  }
});
<\/script>`,
      solution: `<div data-controller="picker">
  <select data-action="change->picker#choose">
    <option value="">選んでください</option>
    <option value="赤">赤</option>
    <option value="青">青</option>
    <option value="緑">緑</option>
  </select>
  <p id="output"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("picker", class extends Controller {
  choose(event) {
    this.element.querySelector("#output").textContent = event.target.value + "を選びました";
  }
});
<\/script>`,
      hints: [
        `select要素で選択が変わったときに発生するのはchangeイベントです`,
        `data-action="change->picker#choose"をselect要素に追加します`
      ],
      check: `const sel = $("select");
assert(sel, "select要素が必要です");
assert((sel.getAttribute("data-action") || "").includes("change->picker#choose"), "select要素にdata-action='change->picker#choose'を追加してください");
setValue("select", "青");
await sleep(50);
assert(text("#output") === "青を選びました", "「青」を選ぶと#outputに「青を選びました」と表示されるはずです");
setValue("select", "緑");
await sleep(50);
assert(text("#output") === "緑を選びました", "選択を変えると表示も変わるはずです");`
    },
    {
      id: 27,
      title: "submitイベントとpreventDefault（:prevent修飾子）",
      explanation: `<p><code>form</code>要素で送信操作（送信ボタンのクリックやEnterキー）が行われると、<code>submit</code>イベントが発生します。ただしフォームには<strong>「送信するとページを移動（リロード）する」というブラウザ標準の動作</strong>があります。JavaScriptで画面を更新したいのにページが移動してしまっては困ります。</p>
<p>素のDOMでは、イベントオブジェクトの<code>event.preventDefault()</code>を呼んで標準動作をキャンセルします。</p>
<pre><code>send(event) {
  event.preventDefault(); // ページ移動をキャンセル
  // ここで画面を更新する処理
}</code></pre>
<p>Stimulusにはもっと簡単な方法があります。data-actionのメソッド名の後ろに<strong><code>:prevent</code>修飾子</strong>を付けると、メソッドが呼ばれる前にStimulusが自動で<code>preventDefault()</code>を呼んでくれます。</p>
<pre><code>&lt;form data-controller="signup"
      data-action="submit-&gt;signup#send:prevent"&gt;</code></pre>
<p>これでメソッドの中に<code>event.preventDefault()</code>を書く必要がなくなり、「標準動作を止める」という意図がHTMLを見ただけで伝わります。</p>
<p>なお、data-actionは<code>form</code>要素自体に付けます。<code>submit</code>イベントはフォーム全体で発生するイベントだからです。</p>`,
      task: `formのdata-actionに:prevent修飾子を追加して、送信してもページ移動が起きず、「送信しました」と表示されるようにしてください。`,
      code: `<form data-controller="signup" data-action="submit->signup#send">
  <!-- TODO: 上のdata-actionに:prevent修飾子を追加してページ移動を防ぐ -->
  <input type="text" placeholder="お名前">
  <button type="submit">登録</button>
  <p id="status"></p>
</form>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("signup", class extends Controller {
  send() {
    this.element.querySelector("#status").textContent = "送信しました";
  }
});
<\/script>`,
      solution: `<form data-controller="signup" data-action="submit->signup#send:prevent">
  <input type="text" placeholder="お名前">
  <button type="submit">登録</button>
  <p id="status"></p>
</form>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("signup", class extends Controller {
  send() {
    this.element.querySelector("#status").textContent = "送信しました";
  }
});
<\/script>`,
      hints: [
        `修飾子はメソッド名の直後にコロンで付けます`,
        `data-action="submit->signup#send:prevent"となります`
      ],
      check: `const form = $("form");
assert(form, "form要素が必要です");
assert((form.getAttribute("data-action") || "").includes("submit->signup#send:prevent"), "data-actionを「submit->signup#send:prevent」にして:prevent修飾子を付けてください");
const ev = new Event("submit", { bubbles: true, cancelable: true });
form.dispatchEvent(ev);
await sleep(50);
assert(ev.defaultPrevented, ":preventが付いていれば、submitの標準動作（ページ移動）が自動でキャンセルされるはずです");
assert(text("#status") === "送信しました", "送信すると#statusに「送信しました」と表示されるはずです");`
    },
    {
      id: 28,
      title: "デフォルトイベントの省略（buttonはclick）",
      explanation: `<p>実は、data-actionの<strong>イベント名は省略できる</strong>場合があります。Stimulusは要素の種類ごとに「デフォルトイベント」を決めていて、省略するとそのイベントが使われます。</p>
<table>
  <tr><th>要素</th><th>デフォルトイベント</th></tr>
  <tr><td><code>button</code></td><td><code>click</code></td></tr>
  <tr><td><code>a</code></td><td><code>click</code></td></tr>
  <tr><td><code>input</code>・<code>textarea</code></td><td><code>input</code></td></tr>
  <tr><td><code>input type="submit"</code></td><td><code>click</code></td></tr>
  <tr><td><code>select</code></td><td><code>change</code></td></tr>
  <tr><td><code>form</code></td><td><code>submit</code></td></tr>
</table>
<p>たとえばボタンの場合、次の2つは同じ意味です。</p>
<pre><code>&lt;button data-action="click-&gt;message#show"&gt;表示&lt;/button&gt;
&lt;button data-action="message#show"&gt;表示&lt;/button&gt;</code></pre>
<p>省略形の<code>message#show</code>は「コントローラ名#メソッド名」だけの形です。buttonのデフォルトはclickなので、クリック時に呼ばれます。</p>
<p>実際のStimulusのコードでは、この省略形が広く使われています。短く書ける一方、初見では「どのイベントか」が表に基づく暗黙の知識になるため、この対応表は覚えておきましょう。デフォルト以外のイベント（buttonのmouseoverなど）を使いたいときは、これまで通り明示的に書きます。</p>`,
      task: `ボタンのdata-actionを、イベント名を省略した記法「message#show」に書き換えてください。動作は変わらないことを確認しましょう。`,
      code: `<div data-controller="message">
  <!-- TODO: data-actionをイベント名を省略した記法に書き換える -->
  <button data-action="click->message#show">表示</button>
  <p id="output"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("message", class extends Controller {
  show() {
    this.element.querySelector("#output").textContent = "省略記法で呼ばれました";
  }
});
<\/script>`,
      solution: `<div data-controller="message">
  <button data-action="message#show">表示</button>
  <p id="output"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("message", class extends Controller {
  show() {
    this.element.querySelector("#output").textContent = "省略記法で呼ばれました";
  }
});
<\/script>`,
      hints: [
        `「click->」の部分を削除して、data-action="message#show"だけにします`,
        `buttonのデフォルトイベントはclickなので、省略しても同じ動作になります`
      ],
      check: `const btn = $("button");
assert(btn, "button要素が必要です");
const action = btn.getAttribute("data-action") || "";
assert(action.includes("message#show"), "data-actionに「message#show」を指定してください");
assert(!action.includes("->"), "イベント名（click->）を省略した記法にしてください。data-action='message#show'だけでOKです");
click("button");
await sleep(50);
assert(text("#output") === "省略記法で呼ばれました", "省略記法でもクリックでメソッドが呼ばれ、#outputに「省略記法で呼ばれました」と表示されるはずです");`
    },
    {
      id: 29,
      title: "1要素に複数アクション",
      explanation: `<p>1つの要素に<strong>複数のアクションを付ける</strong>こともできます。data-actionの値を<strong>半角スペース区切り</strong>で並べるだけです。</p>
<pre><code>&lt;input data-action="focus-&gt;field#start input-&gt;field#update"&gt;</code></pre>
<p>この例では、同じinput要素に対して次の2つが設定されています。</p>
<ul>
  <li><code>focus</code>イベント（入力欄にカーソルが入った）→<code>start</code>メソッド</li>
  <li><code>input</code>イベント（文字が入力された）→<code>update</code>メソッド</li>
</ul>
<p><code>focus</code>はユーザーが入力欄をクリックしたりTabキーで移動してきたときに発生するイベントです。反対にカーソルが外れたときは<code>blur</code>イベントが発生します。</p>
<p>組み合わせは自由で、次のようなパターンがあります。</p>
<ul>
  <li>異なるイベントで異なるメソッド（今回の例）</li>
  <li>同じイベントで複数のメソッド（書いた順に実行される）</li>
  <li>異なるコントローラのメソッドを並べる（後の章で登場）</li>
</ul>
<p>素のDOMなら<code>addEventListener</code>を2回書くところが、1つの属性にまとまります。「この要素にどんな振る舞いが付いているか」が1か所で読み取れるのがdata-actionの強みです。</p>`,
      task: `input要素のdata-actionに「focus->field#start」を追加して、入力欄にカーソルが入ると#statusが「入力中です」になるようにしてください。既存のinputアクションも残すこと。`,
      code: `<div data-controller="field">
  <!-- TODO: data-actionに「focus->field#start」を追加する（スペース区切りで2つ並べる） -->
  <input type="text" data-action="input->field#update" placeholder="お名前">
  <p id="status">待機中</p>
  <p id="preview"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("field", class extends Controller {
  start() {
    this.element.querySelector("#status").textContent = "入力中です";
  }
  update(event) {
    this.element.querySelector("#preview").textContent = event.target.value;
  }
});
<\/script>`,
      solution: `<div data-controller="field">
  <input type="text" data-action="focus->field#start input->field#update" placeholder="お名前">
  <p id="status">待機中</p>
  <p id="preview"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("field", class extends Controller {
  start() {
    this.element.querySelector("#status").textContent = "入力中です";
  }
  update(event) {
    this.element.querySelector("#preview").textContent = event.target.value;
  }
});
<\/script>`,
      hints: [
        `data-action="focus->field#start input->field#update"のように半角スペースで区切って並べます`
      ],
      check: `const input = $("input");
assert(input, "input要素が必要です");
const action = input.getAttribute("data-action") || "";
assert(action.includes("focus->field#start"), "data-actionに「focus->field#start」を追加してください");
assert(action.includes("input->field#update"), "元の「input->field#update」も残してください（スペース区切りで2つ並べます）");
input.dispatchEvent(new FocusEvent("focus"));
await sleep(50);
assert(text("#status") === "入力中です", "入力欄にフォーカスすると#statusが「入力中です」になるはずです");
setValue("input", "田中");
await sleep(50);
assert(text("#preview") === "田中", "入力すると#previewに入力内容が表示されるはずです");`
    },
    {
      id: 30,
      title: "総合演習：文字数カウンタ",
      explanation: `<p>第3章の総合演習です。この章で学んだアクションの知識を組み合わせて、<strong>文字数カウンタ</strong>を作ります。</p>
<p>完成イメージは次の通りです。</p>
<ul>
  <li>テキストエリアに入力するたび、「◯文字」と現在の文字数が表示される</li>
  <li>「クリア」ボタンを押すと、入力が消えて「0文字」に戻る</li>
</ul>
<p>使う知識を整理しましょう。</p>
<table>
  <tr><th>やること</th><th>使う知識</th><th>学んだステップ</th></tr>
  <tr><td>入力のたびに反応する</td><td><code>input-&gt;counter#update</code></td><td>ステップ25</td></tr>
  <tr><td>クリックに反応する（省略記法）</td><td><code>counter#clear</code></td><td>ステップ21・28</td></tr>
  <tr><td>入力内容を読む</td><td><code>event.target.value</code></td><td>ステップ25</td></tr>
  <tr><td>表示を書き換える</td><td><code>this.element.querySelector</code></td><td>第2章</td></tr>
</table>
<p>文字数は文字列の<code>length</code>プロパティで取れます。<code>"こんにちは".length</code>は<code>5</code>です。表示する文字列は<code>+</code>演算子で連結して作ります（例：<code>5 + "文字"</code>で<code>"5文字"</code>）。</p>
<p>クリア処理では、textarea要素の<code>value</code>に空文字列<code>""</code>を代入します。JavaScriptから<code>value</code>を書き換えても<code>input</code>イベントは発生しないため、カウンタ表示の「0文字」への更新もclearメソッドの中で行う必要がある点に注意してください。</p>`,
      task: `TODO(1)〜(4)を埋めて文字数カウンタを完成させてください。入力すると「◯文字」と表示され、クリアボタンで入力が消えて「0文字」に戻るようにします。`,
      code: `<div data-controller="counter">
  <!-- TODO(1): 入力のたびにupdateメソッドが呼ばれるようにdata-actionを追加 -->
  <textarea placeholder="ここに入力してください"></textarea>
  <p id="count">0文字</p>
  <!-- TODO(2): クリックでclearメソッドが呼ばれるようにdata-actionを追加（イベント名は省略可） -->
  <button>クリア</button>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("counter", class extends Controller {
  update(event) {
    // TODO(3): event.target.value.lengthを使って#countに「◯文字」と表示する
  }
  clear() {
    // TODO(4): textareaのvalueを空にして、#countを「0文字」に戻す
  }
});
<\/script>`,
      solution: `<div data-controller="counter">
  <textarea placeholder="ここに入力してください" data-action="input->counter#update"></textarea>
  <p id="count">0文字</p>
  <button data-action="counter#clear">クリア</button>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("counter", class extends Controller {
  update(event) {
    this.element.querySelector("#count").textContent = event.target.value.length + "文字";
  }
  clear() {
    this.element.querySelector("textarea").value = "";
    this.element.querySelector("#count").textContent = "0文字";
  }
});
<\/script>`,
      hints: [
        `textareaにはdata-action="input->counter#update"、buttonにはdata-action="counter#clear"を付けます`,
        `updateではevent.target.value.length + "文字"を#countのtextContentに設定します。clearではthis.element.querySelector("textarea").value = "";としてから#countを「0文字」に戻します`
      ],
      check: `assert($("textarea"), "textarea要素が必要です");
assert($("button"), "button要素が必要です");
setValue("textarea", "こんにちは");
await sleep(50);
assert(text("#count") === "5文字", "「こんにちは」（5文字）を入力すると#countに「5文字」と表示されるはずです");
setValue("textarea", "やあ");
await sleep(50);
assert(text("#count") === "2文字", "入力を変えると文字数の表示も変わるはずです");
click("button");
await sleep(50);
assert($("textarea").value === "", "クリアボタンを押すとtextareaが空になるはずです");
assert(text("#count") === "0文字", "クリアボタンを押すと#countが「0文字」に戻るはずです");`
    }
  ]
});
