// 第13章：フォーム
registerChapter({
  number: 13,
  title: "フォーム",
  description: "入力値の取得からリアルタイムバリデーション、submitの制御、送信ボタンの活性制御まで、Stimulusでフォームを扱う定番パターンを学びます。",
  steps: [
    {
      id: 121,
      title: "入力値の取得（inputターゲット）",
      explanation: `<p>この章では、Stimulusでフォームを扱う定番パターンを学びます。最初のテーマは「入力値の取得」です。第4章で学んだターゲットを使えば、input要素をコントローラのプロパティとして参照でき、<code>value</code>プロパティで入力内容を読み取れます。</p>
<pre><code>&lt;div data-controller="greeting"&gt;
  &lt;input type="text" data-greeting-target="input"&gt;
  &lt;button data-action="click-&gt;greeting#show"&gt;表示&lt;/button&gt;
  &lt;p data-greeting-target="output"&gt;&lt;/p&gt;
&lt;/div&gt;</code></pre>
<p>コントローラ側では次のように読み取ります。</p>
<pre><code>show() {
  const name = this.inputTarget.value;
  this.outputTarget.textContent = "こんにちは、" + name + "さん";
}</code></pre>
<p>ポイントを整理します。</p>
<ul>
<li><code>this.inputTarget.value</code>：input要素の現在の入力内容（文字列）を返す</li>
<li>querySelectorで探すのに比べ、ターゲットならHTML側の構造変更に強く、タイプミスも起きにくい</li>
<li>取得した値は文字列なので、表示にはそのまま<code>textContent</code>に設定できる</li>
</ul>
<p>フォーム処理の基本は「入力値を読む→検証する→結果を表示する」の3段階です。このステップではまず「読む→表示する」を確実にできるようにしましょう。</p>`,
      task: `表示ボタンを押したら、入力欄の値を読み取って「こんにちは、○○さん」と<p>に表示されるようにTODOを埋めてください。`,
      code: `<div data-controller="greeting">
  <label>名前：<input type="text" data-greeting-target="input"></label>
  <button data-action="click->greeting#show">表示</button>
  <p data-greeting-target="output"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("greeting", class extends Controller {
  static targets = ["input", "output"];

  show() {
    // TODO: this.inputTarget.value を読み取り、
    // 「こんにちは、○○さん」の形でoutputTargetに表示する
  }
});
<\/script>`,
      solution: `<div data-controller="greeting">
  <label>名前：<input type="text" data-greeting-target="input"></label>
  <button data-action="click->greeting#show">表示</button>
  <p data-greeting-target="output"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("greeting", class extends Controller {
  static targets = ["input", "output"];

  show() {
    const name = this.inputTarget.value;
    this.outputTarget.textContent = "こんにちは、" + name + "さん";
  }
});
<\/script>`,
      hints: [
        `入力値はthis.inputTarget.valueで取得できます`,
        `文字列の連結は "こんにちは、" + name + "さん" のように+で書きます`
      ],
      check: `assert($("[data-greeting-target=input]"), "data-greeting-target=\\"input\\"を持つinput要素が必要です");
setValue("input", "田中");
await sleep(50);
click("button");
await sleep(50);
assert(text("[data-greeting-target=output]") === "こんにちは、田中さん", "「田中」と入力して表示ボタンを押すと、<p>に「こんにちは、田中さん」と表示されるはずです");`
    },
    {
      id: 122,
      title: "リアルタイムバリデーション（inputイベント）",
      explanation: `<p>ボタンを押してから検証するのではなく、入力のたびに検証結果を表示すると、ユーザーはその場で間違いに気づけます。これを「リアルタイムバリデーション」と呼びます。第3章で学んだ<code>input</code>イベントを使えば簡単に実現できます。</p>
<pre><code>&lt;input type="text" data-action="input-&gt;check#validate"&gt;
&lt;p data-check-target="message"&gt;&lt;/p&gt;</code></pre>
<p><code>input</code>イベントは、キー入力・貼り付けなど入力内容が変わるたびに発火します。アクションメソッドでは、第5章で学んだ<code>event.target</code>からイベントが起きたinput要素を取得し、その<code>value</code>を検証します。</p>
<pre><code>validate(event) {
  const value = event.target.value;
  if (value.length &gt;= 3) {
    this.messageTarget.textContent = "OK";
  } else {
    this.messageTarget.textContent = "3文字以上で入力してください";
  }
}</code></pre>
<p>イベントの使い分けを整理しておきましょう。</p>
<table>
<tr><th>イベント</th><th>発火タイミング</th><th>用途</th></tr>
<tr><td>input</td><td>入力内容が変わるたび</td><td>リアルタイム検証・文字数カウント</td></tr>
<tr><td>change</td><td>確定時（フォーカスが外れた時など）</td><td>select要素・確定後の処理</td></tr>
<tr><td>submit</td><td>フォーム送信時</td><td>最終検証・送信処理</td></tr>
</table>
<p>今回はHTML側にdata-actionを追加して、入力のたびに検証が走るようにします。</p>`,
      task: `input要素にdata-actionを追加して、入力するたびにvalidateメソッドが呼ばれ、3文字未満なら「3文字以上で入力してください」、3文字以上なら「OK」と表示されるようにしてください。`,
      code: `<div data-controller="check">
  <!-- TODO: このinputに、inputイベントでcheckコントローラの
       validateメソッドを呼ぶdata-actionを追加する -->
  <input type="text" placeholder="ユーザー名（3文字以上）">
  <p data-check-target="message"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("check", class extends Controller {
  static targets = ["message"];

  validate(event) {
    const value = event.target.value;
    if (value.length >= 3) {
      this.messageTarget.textContent = "OK";
    } else {
      this.messageTarget.textContent = "3文字以上で入力してください";
    }
  }
});
<\/script>`,
      solution: `<div data-controller="check">
  <input type="text" data-action="input->check#validate" placeholder="ユーザー名（3文字以上）">
  <p data-check-target="message"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("check", class extends Controller {
  static targets = ["message"];

  validate(event) {
    const value = event.target.value;
    if (value.length >= 3) {
      this.messageTarget.textContent = "OK";
    } else {
      this.messageTarget.textContent = "3文字以上で入力してください";
    }
  }
});
<\/script>`,
      hints: [
        `data-action="input->check#validate" をinput要素に付けます`,
        `inputイベントは入力内容が変わるたびに発火します`
      ],
      check: `setValue("input", "ab");
await sleep(50);
assert(text("[data-check-target=message]") === "3文字以上で入力してください", "2文字の入力では「3文字以上で入力してください」と表示されるはずです。inputにdata-actionを追加しましたか？");
setValue("input", "abcd");
await sleep(50);
assert(text("[data-check-target=message]") === "OK", "3文字以上を入力したら「OK」と表示されるはずです");`
    },
    {
      id: 123,
      title: "エラーメッセージの表示・非表示",
      explanation: `<p>エラーメッセージは「必要なときだけ見せる」のが基本です。メッセージ用の要素をHTMLにあらかじめ書いておき、CSSクラスで表示・非表示を切り替えるパターンがよく使われます。この実行環境には<code>.hidden { display: none; }</code>というCSSが用意されているので、これを利用します。</p>
<pre><code>&lt;input type="text" data-action="input-&gt;check#validate"&gt;
&lt;p data-check-target="error" class="hidden"&gt;メールアドレスを入力してください&lt;/p&gt;</code></pre>
<p>最初は<code>hidden</code>クラスが付いているので見えません。検証で問題を見つけたらクラスを外して表示し、問題がなければ再び付けて隠します。第1章で学んだ<code>classList</code>の出番です。</p>
<pre><code>validate(event) {
  if (event.target.value.trim() === "") {
    this.errorTarget.classList.remove("hidden");
  } else {
    this.errorTarget.classList.add("hidden");
  }
}</code></pre>
<p><code>trim()</code>は文字列の前後の空白を取り除くメソッドです。スペースだけの入力を「未入力」として扱うために、フォーム検証では定番の書き方です。</p>
<p>この方式の利点は次のとおりです。</p>
<ul>
<li>メッセージの文言がHTML側にあるので、JSを触らずに文言を変更できる</li>
<li>textContentを書き換える方式と違い、表示・非表示の状態がクラスの有無として明確に残る</li>
<li>CSSでエラーの見た目（色など）をまとめて管理できる</li>
</ul>`,
      task: `入力が空（空白だけを含む）のときはエラーメッセージを表示し、入力があるときは隠すようにvalidateメソッドのTODOを埋めてください。`,
      code: `<div data-controller="check">
  <input type="text" data-action="input->check#validate" placeholder="メールアドレス">
  <p data-check-target="error" class="hidden">メールアドレスを入力してください</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("check", class extends Controller {
  static targets = ["error"];

  validate(event) {
    if (event.target.value.trim() === "") {
      // TODO: errorTargetのhiddenクラスを外して表示する
    } else {
      // TODO: errorTargetにhiddenクラスを付けて隠す
    }
  }
});
<\/script>`,
      solution: `<div data-controller="check">
  <input type="text" data-action="input->check#validate" placeholder="メールアドレス">
  <p data-check-target="error" class="hidden">メールアドレスを入力してください</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("check", class extends Controller {
  static targets = ["error"];

  validate(event) {
    if (event.target.value.trim() === "") {
      this.errorTarget.classList.remove("hidden");
    } else {
      this.errorTarget.classList.add("hidden");
    }
  }
});
<\/script>`,
      hints: [
        `表示するにはclassList.remove("hidden")、隠すにはclassList.add("hidden")です`,
        `この実行環境では.hiddenクラスにdisplay: noneが定義されています`
      ],
      check: `var err = $("[data-check-target=error]");
assert(err, "data-check-target=\\"error\\"を持つ要素が必要です");
setValue("input", "");
await sleep(50);
assert(!err.classList.contains("hidden"), "空のまま入力イベントが起きたら、hiddenクラスを外してエラーを表示するはずです");
setValue("input", "test@example.com");
await sleep(50);
assert(err.classList.contains("hidden"), "入力があるときは、hiddenクラスを付けてエラーを隠すはずです");`
    },
    {
      id: 124,
      title: "必須チェックと文字数チェック",
      explanation: `<p>実際のフォームでは、1つの入力欄に複数の検証ルールを適用することがよくあります。代表的なのは「必須チェック」（空でないこと）と「文字数チェック」（長すぎ・短すぎでないこと）です。ルールを順番に調べて、最初に引っかかったエラーを表示するのが定番の書き方です。</p>
<pre><code>validate(event) {
  const value = event.target.value;
  if (value.trim() === "") {
    this.messageTarget.textContent = "必須項目です";
  } else if (value.length &gt; 10) {
    this.messageTarget.textContent = "10文字以内で入力してください";
  } else {
    this.messageTarget.textContent = "OK";
  }
}</code></pre>
<p>ポイントは検証の「順序」です。<code>if / else if / else</code>で並べると、上のルールほど優先されます。必須チェックを最初に置くのは、空の入力に対して「10文字以内で…」と表示しても意味がないからです。</p>
<table>
<tr><th>チェック</th><th>条件式</th><th>典型的なメッセージ</th></tr>
<tr><td>必須</td><td><code>value.trim() === ""</code></td><td>必須項目です</td></tr>
<tr><td>最大文字数</td><td><code>value.length &gt; 10</code></td><td>10文字以内で入力してください</td></tr>
<tr><td>最小文字数</td><td><code>value.length &lt; 3</code></td><td>3文字以上で入力してください</td></tr>
</table>
<p><code>value.length</code>は文字列の長さです。trim()は必須チェックのときだけ使い、文字数チェックでは入力そのままの長さを見るのが一般的です。</p>`,
      task: `ニックネーム欄の検証を実装してください。空（空白のみ含む）なら「必須項目です」、10文字を超えたら「10文字以内で入力してください」、それ以外は「OK」と表示します。`,
      code: `<div data-controller="check">
  <label>ニックネーム：<input type="text" data-action="input->check#validate"></label>
  <p data-check-target="message"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("check", class extends Controller {
  static targets = ["message"];

  validate(event) {
    const value = event.target.value;
    // TODO: 次の順でチェックして、messageTargetに結果を表示する
    // 1. value.trim()が空文字なら「必須項目です」
    // 2. 10文字を超えていたら「10文字以内で入力してください」
    // 3. それ以外は「OK」
  }
});
<\/script>`,
      solution: `<div data-controller="check">
  <label>ニックネーム：<input type="text" data-action="input->check#validate"></label>
  <p data-check-target="message"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("check", class extends Controller {
  static targets = ["message"];

  validate(event) {
    const value = event.target.value;
    if (value.trim() === "") {
      this.messageTarget.textContent = "必須項目です";
    } else if (value.length > 10) {
      this.messageTarget.textContent = "10文字以内で入力してください";
    } else {
      this.messageTarget.textContent = "OK";
    }
  }
});
<\/script>`,
      hints: [
        `if / else if / else の3分岐で書きます。必須チェックを最初に置きましょう`,
        `文字数はvalue.lengthで調べられます`
      ],
      check: `setValue("input", "");
await sleep(50);
assert(text("[data-check-target=message]") === "必須項目です", "空のときは「必須項目です」と表示されるはずです");
setValue("input", "12345678901");
await sleep(50);
assert(text("[data-check-target=message]") === "10文字以内で入力してください", "11文字のときは「10文字以内で入力してください」と表示されるはずです");
setValue("input", "たなか");
await sleep(50);
assert(text("[data-check-target=message]") === "OK", "3文字の入力なら「OK」と表示されるはずです");`
    },
    {
      id: 125,
      title: "数値チェックとparseFloat",
      explanation: `<p>金額や数量の入力欄では、入力値を数値として扱う必要があります。<code>input.value</code>は常に文字列なので、計算する前に数値へ変換します。代表的な変換関数が<code>parseFloat</code>です。</p>
<pre><code>parseFloat("100")   // 100
parseFloat("19.8")  // 19.8
parseFloat("abc")   // NaN（数値にできない）
parseFloat("")      // NaN</code></pre>
<p><code>NaN</code>（Not-a-Number）は「数値にできなかった」ことを表す特別な値です。NaNかどうかの判定には<code>Number.isNaN()</code>を使います。<code>NaN === NaN</code>は<code>false</code>になるという奇妙な仕様があるため、<code>=== NaN</code>という比較では判定できない点に注意してください。</p>
<pre><code>calculate() {
  const price = parseFloat(this.inputTarget.value);
  if (Number.isNaN(price)) {
    this.outputTarget.textContent = "数値を入力してください";
    return;
  }
  this.outputTarget.textContent = "税込 " + Math.round(price * 1.1) + "円";
}</code></pre>
<p>早めに<code>return</code>して異常系を抜ける書き方は「ガード節」と呼ばれ、ネストを浅く保てます。<code>Math.round()</code>は四捨五入です。JavaScriptの小数計算には誤差があるため（例：100×1.1は110.00000000000001になる）、金額表示では丸め処理を挟むのが安全です。</p>`,
      task: `計算ボタンを押したら、入力値をparseFloatで数値に変換し、数値にできなければ「数値を入力してください」、できれば「税込 ○○円」（1.1倍して四捨五入）と表示されるようにTODOを埋めてください。`,
      code: `<div data-controller="tax">
  <label>税抜価格：<input type="text" data-tax-target="input"></label>
  <button data-action="click->tax#calculate">計算</button>
  <p data-tax-target="output"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("tax", class extends Controller {
  static targets = ["input", "output"];

  calculate() {
    const price = parseFloat(this.inputTarget.value);
    // TODO: priceがNaNなら「数値を入力してください」と表示してreturnする
    // TODO: 数値なら「税込 ○○円」を表示する（price * 1.1 を Math.round で四捨五入）
  }
});
<\/script>`,
      solution: `<div data-controller="tax">
  <label>税抜価格：<input type="text" data-tax-target="input"></label>
  <button data-action="click->tax#calculate">計算</button>
  <p data-tax-target="output"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("tax", class extends Controller {
  static targets = ["input", "output"];

  calculate() {
    const price = parseFloat(this.inputTarget.value);
    if (Number.isNaN(price)) {
      this.outputTarget.textContent = "数値を入力してください";
      return;
    }
    this.outputTarget.textContent = "税込 " + Math.round(price * 1.1) + "円";
  }
});
<\/script>`,
      hints: [
        `NaNの判定はNumber.isNaN(price)です。price === NaNでは判定できません`,
        `税込価格は Math.round(price * 1.1) で計算します`
      ],
      check: `setValue("input", "abc");
await sleep(50);
click("button");
await sleep(50);
assert(text("[data-tax-target=output]") === "数値を入力してください", "数値にできない入力では「数値を入力してください」と表示されるはずです");
setValue("input", "100");
await sleep(50);
click("button");
await sleep(50);
assert(text("[data-tax-target=output]") === "税込 110円", "100を入力すると「税込 110円」と表示されるはずです");`
    },
    {
      id: 126,
      title: "submitの制御（:prevent＋検証後に処理）",
      explanation: `<p>フォーム送信の検証は、送信ボタンのclickではなく<strong>formのsubmitイベント</strong>で行うのが正解です。submitイベントなら、ボタンクリックだけでなく入力欄でEnterキーを押した送信もまとめて捕まえられるからです。</p>
<p>第3章・第5章で学んだ<code>:prevent</code>修飾子を使うと、ブラウザ標準の送信（ページ遷移）を止めた上で自分の処理を実行できます。</p>
<pre><code>&lt;form data-controller="entry"
      data-action="submit-&gt;entry#send:prevent"&gt;
  &lt;input type="text" data-entry-target="name"&gt;
  &lt;button type="submit"&gt;送信&lt;/button&gt;
  &lt;p data-entry-target="result"&gt;&lt;/p&gt;
&lt;/form&gt;</code></pre>
<p>送信処理では「検証→NGなら中断→OKなら本処理」という流れを作ります。</p>
<pre><code>send() {
  const name = this.nameTarget.value.trim();
  if (name === "") {
    this.resultTarget.textContent = "お名前を入力してください";
    return;
  }
  this.resultTarget.textContent = name + "さんの応募を受け付けました";
}</code></pre>
<ul>
<li><code>:prevent</code>はメソッド名の後ろに付ける（<code>submit-&gt;entry#send:prevent</code>）</li>
<li>検証NGのときはガード節で<code>return</code>し、本処理に進ませない</li>
<li>buttonの<code>type="submit"</code>（form内のbuttonの既定値）がsubmitイベントを起こす</li>
</ul>`,
      task: `submitイベントで呼ばれるsendメソッドを実装してください。名前が空（空白のみ含む）なら「お名前を入力してください」、入力があれば「○○さんの応募を受け付けました」と表示します。`,
      code: `<form data-controller="entry" data-action="submit->entry#send:prevent">
  <label>お名前：<input type="text" data-entry-target="name"></label>
  <button type="submit">送信</button>
  <p data-entry-target="result"></p>
</form>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("entry", class extends Controller {
  static targets = ["name", "result"];

  send() {
    // TODO: this.nameTarget.value.trim()が空なら
    // 「お名前を入力してください」と表示してreturnする
    // TODO: 入力があれば「○○さんの応募を受け付けました」と表示する
  }
});
<\/script>`,
      solution: `<form data-controller="entry" data-action="submit->entry#send:prevent">
  <label>お名前：<input type="text" data-entry-target="name"></label>
  <button type="submit">送信</button>
  <p data-entry-target="result"></p>
</form>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("entry", class extends Controller {
  static targets = ["name", "result"];

  send() {
    const name = this.nameTarget.value.trim();
    if (name === "") {
      this.resultTarget.textContent = "お名前を入力してください";
      return;
    }
    this.resultTarget.textContent = name + "さんの応募を受け付けました";
  }
});
<\/script>`,
      hints: [
        `空チェックはif (name === "") { ...; return; }のガード節で書きます`,
        `:prevent修飾子がページ遷移を止めてくれるので、sendの中では検証と表示に集中できます`
      ],
      check: `submit("form");
await sleep(50);
assert(text("[data-entry-target=result]") === "お名前を入力してください", "空のまま送信すると「お名前を入力してください」と表示されるはずです");
setValue("[data-entry-target=name]", "佐藤");
await sleep(50);
submit("form");
await sleep(50);
assert(text("[data-entry-target=result]") === "佐藤さんの応募を受け付けました", "名前を入れて送信すると「佐藤さんの応募を受け付けました」と表示されるはずです");`
    },
    {
      id: 127,
      title: "複数フィールドの一括検証（targetsのevery）",
      explanation: `<p>フィールドが増えるたびにif文を書き足すのは大変です。第4章で学んだ複数ターゲット（<code>xxxTargets</code>）と、配列メソッドの<code>every</code>を組み合わせると、何個フィールドがあっても1行で「全部埋まっているか」を検証できます。</p>
<p><code>every</code>は「配列の全要素が条件を満たすか」を調べるメソッドで、1つでも条件を満たさない要素があると<code>false</code>を返します。</p>
<pre><code>[1, 2, 3].every((n) =&gt; n &gt; 0)  // true
[1, 0, 3].every((n) =&gt; n &gt; 0)  // false</code></pre>
<p>すべての入力欄に同じターゲット名を付ければ、<code>this.fieldTargets</code>が入力欄の配列になります。</p>
<pre><code>&lt;input data-survey-target="field"&gt;
&lt;input data-survey-target="field"&gt;
&lt;input data-survey-target="field"&gt;</code></pre>
<pre><code>validate() {
  const allFilled = this.fieldTargets.every(
    (field) =&gt; field.value.trim() !== ""
  );
  if (allFilled) {
    this.messageTarget.textContent = "送信しました";
  } else {
    this.messageTarget.textContent = "未入力の項目があります";
  }
}</code></pre>
<p>この書き方なら、HTML側にフィールドを1つ追加するだけで検証対象も自動的に増えます。「HTMLに書けばJSが追従する」というStimulusらしい設計です。類似のメソッドに<code>some</code>（1つでも条件を満たせばtrue）があり、「エラーが1つでもあるか」の判定に使えます。</p>`,
      task: `3つの入力欄がすべて埋まっているかをfieldTargetsとeveryで検証し、全部埋まっていれば「送信しました」、1つでも空なら「未入力の項目があります」と表示されるようにTODOを埋めてください。`,
      code: `<form data-controller="survey" data-action="submit->survey#validate:prevent">
  <p><label>氏名：<input id="f1" type="text" data-survey-target="field"></label></p>
  <p><label>部署：<input id="f2" type="text" data-survey-target="field"></label></p>
  <p><label>感想：<input id="f3" type="text" data-survey-target="field"></label></p>
  <button type="submit">送信</button>
  <p data-survey-target="message"></p>
</form>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("survey", class extends Controller {
  static targets = ["field", "message"];

  validate() {
    // TODO: this.fieldTargets.every(...)で全フィールドが
    // 空でない（value.trim() !== ""）ことを確認し、
    // 全部埋まっていれば「送信しました」、
    // そうでなければ「未入力の項目があります」と表示する
  }
});
<\/script>`,
      solution: `<form data-controller="survey" data-action="submit->survey#validate:prevent">
  <p><label>氏名：<input id="f1" type="text" data-survey-target="field"></label></p>
  <p><label>部署：<input id="f2" type="text" data-survey-target="field"></label></p>
  <p><label>感想：<input id="f3" type="text" data-survey-target="field"></label></p>
  <button type="submit">送信</button>
  <p data-survey-target="message"></p>
</form>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("survey", class extends Controller {
  static targets = ["field", "message"];

  validate() {
    const allFilled = this.fieldTargets.every(
      (field) => field.value.trim() !== ""
    );
    if (allFilled) {
      this.messageTarget.textContent = "送信しました";
    } else {
      this.messageTarget.textContent = "未入力の項目があります";
    }
  }
});
<\/script>`,
      hints: [
        `this.fieldTargets.every((field) => field.value.trim() !== "") で全欄チェックできます`,
        `everyは全要素が条件を満たすときだけtrueを返します`
      ],
      check: `submit("form");
await sleep(50);
assert(text("[data-survey-target=message]") === "未入力の項目があります", "全欄が空のまま送信すると「未入力の項目があります」と表示されるはずです");
setValue("#f1", "田中");
setValue("#f2", "開発部");
await sleep(50);
submit("form");
await sleep(50);
assert(text("[data-survey-target=message]") === "未入力の項目があります", "1つでも空欄が残っていれば「未入力の項目があります」と表示されるはずです");
setValue("#f3", "楽しかったです");
await sleep(50);
submit("form");
await sleep(50);
assert(text("[data-survey-target=message]") === "送信しました", "全欄を埋めて送信すると「送信しました」と表示されるはずです");`
    },
    {
      id: 128,
      title: "送信ボタンのdisabled制御",
      explanation: `<p>「必須項目が埋まるまで送信ボタンを押せなくする」のは、フォームUIの定番です。button要素の<code>disabled</code>プロパティに<code>true</code>を設定すると押せなくなり、<code>false</code>で押せるようになります。</p>
<p>HTML側では、初期状態を<code>disabled</code>属性で表現しておきます。</p>
<pre><code>&lt;input data-form-target="field"
       data-action="input-&gt;form#update"&gt;
&lt;input data-form-target="field"
       data-action="input-&gt;form#update"&gt;
&lt;button type="submit" data-form-target="button" disabled&gt;送信&lt;/button&gt;</code></pre>
<p>各入力欄のinputイベントのたびに全欄をチェックし、結果をdisabledに反映します。前ステップのeveryがここでも活躍します。</p>
<pre><code>update() {
  const allFilled = this.fieldTargets.every(
    (field) =&gt; field.value.trim() !== ""
  );
  this.buttonTarget.disabled = !allFilled;
}</code></pre>
<p><code>!allFilled</code>の<code>!</code>は真偽値の反転です。「全部埋まっている（true）」なら「disabledはfalse」にしたいので、反転して代入する1行で済みます。if文で書くよりも「状態の対応関係」が読み取りやすくなります。</p>
<p>注意点として、disabledはあくまで利便性のための制御です。ブラウザの開発者ツールで属性を外せば押せてしまうので、本番のアプリでは送信時（submit）とサーバー側の検証を必ず併用します。</p>`,
      task: `updateメソッドを実装して、2つの入力欄が両方埋まったら送信ボタンのdisabledがfalseに、どちらかが空ならtrueになるようにしてください。`,
      code: `<form data-controller="form">
  <p><label>名前：<input id="name" type="text" data-form-target="field" data-action="input->form#update"></label></p>
  <p><label>メール：<input id="email" type="text" data-form-target="field" data-action="input->form#update"></label></p>
  <button type="submit" data-form-target="button" disabled>送信</button>
</form>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("form", class extends Controller {
  static targets = ["field", "button"];

  update() {
    // TODO: fieldTargetsが全部埋まっているかをeveryで調べ、
    // this.buttonTarget.disabled に反映する
    // （全部埋まっていたらfalse、空欄があればtrue）
  }
});
<\/script>`,
      solution: `<form data-controller="form">
  <p><label>名前：<input id="name" type="text" data-form-target="field" data-action="input->form#update"></label></p>
  <p><label>メール：<input id="email" type="text" data-form-target="field" data-action="input->form#update"></label></p>
  <button type="submit" data-form-target="button" disabled>送信</button>
</form>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("form", class extends Controller {
  static targets = ["field", "button"];

  update() {
    const allFilled = this.fieldTargets.every(
      (field) => field.value.trim() !== ""
    );
    this.buttonTarget.disabled = !allFilled;
  }
});
<\/script>`,
      hints: [
        `this.buttonTarget.disabled = !allFilled; の1行で反映できます`,
        `!は真偽値の反転です。「全部埋まっている」ならdisabledは「false」です`
      ],
      check: `assert($("[data-form-target=button]").disabled === true, "最初は送信ボタンがdisabled（押せない状態）のはずです");
setValue("#name", "田中");
setValue("#email", "tanaka@example.com");
await sleep(50);
assert($("[data-form-target=button]").disabled === false, "両方の欄を埋めたら送信ボタンが押せるようになるはずです");
setValue("#name", "");
await sleep(50);
assert($("[data-form-target=button]").disabled === true, "欄を空に戻したら再びdisabledになるはずです");`
    },
    {
      id: 129,
      title: "フォームのリセット",
      explanation: `<p>form要素には<code>reset()</code>という組み込みメソッドがあり、呼び出すとフォーム内のすべての入力欄が初期値（HTMLに書かれたvalue属性の値。なければ空）に戻ります。入力欄を1つずつ<code>value = ""</code>で消して回る必要はありません。</p>
<p>コントローラをform要素自体に付けておけば、第2章で学んだ<code>this.element</code>がそのformを指すので、次のように書けます。</p>
<pre><code>clear() {
  this.element.reset();
  this.messageTarget.textContent = "";
}</code></pre>
<p>注意すべき点が2つあります。</p>
<ul>
<li><strong>クリアボタンには<code>type="button"</code>を付ける</strong>。form内のbuttonは既定でtype="submit"になるため、付け忘れると送信が発動してしまいます。なお<code>type="reset"</code>というHTML標準のリセットボタンもありますが、JSで制御すれば「メッセージも一緒に消す」などリセット以外の後片付けも同時にできます。</li>
<li><strong>reset()が戻すのは入力欄だけ</strong>。JSで書き換えたメッセージ表示などは対象外なので、自分で初期状態に戻す処理を書きます。</li>
</ul>
<p>「送信結果の表示」と「入力欄」の両方を初期状態に戻して、はじめて完全なリセットになります。</p>`,
      task: `クリアボタンで呼ばれるclearメソッドを実装してください。this.element.reset()で入力欄を空に戻し、メッセージ表示も空文字にします。`,
      code: `<form data-controller="entry" data-action="submit->entry#send:prevent">
  <label>お名前：<input type="text" data-entry-target="name"></label>
  <button type="submit">送信</button>
  <button type="button" id="clear" data-action="click->entry#clear">クリア</button>
  <p data-entry-target="message"></p>
</form>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("entry", class extends Controller {
  static targets = ["name", "message"];

  send() {
    this.messageTarget.textContent = "送信内容：" + this.nameTarget.value;
  }

  clear() {
    // TODO: this.element.reset()でフォームを初期状態に戻す
    // TODO: messageTargetの表示も空文字にする
  }
});
<\/script>`,
      solution: `<form data-controller="entry" data-action="submit->entry#send:prevent">
  <label>お名前：<input type="text" data-entry-target="name"></label>
  <button type="submit">送信</button>
  <button type="button" id="clear" data-action="click->entry#clear">クリア</button>
  <p data-entry-target="message"></p>
</form>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("entry", class extends Controller {
  static targets = ["name", "message"];

  send() {
    this.messageTarget.textContent = "送信内容：" + this.nameTarget.value;
  }

  clear() {
    this.element.reset();
    this.messageTarget.textContent = "";
  }
});
<\/script>`,
      hints: [
        `コントローラはform要素に付いているので、this.elementがformです`,
        `form.reset()は入力欄しか戻しません。メッセージは自分で空にします`
      ],
      check: `setValue("[data-entry-target=name]", "田中");
await sleep(50);
submit("form");
await sleep(50);
assert(text("[data-entry-target=message]") === "送信内容：田中", "送信すると「送信内容：田中」と表示されるはずです");
click("#clear");
await sleep(50);
assert($("[data-entry-target=name]").value === "", "クリアボタンで入力欄が空に戻るはずです");
assert(text("[data-entry-target=message]") === "", "クリアボタンでメッセージ表示も消えるはずです");`
    },
    {
      id: 130,
      title: "総合演習：会員登録フォームの検証",
      explanation: `<p>この章の総合演習です。会員登録フォームに次の3つの検証ルールを実装します。</p>
<table>
<tr><th>フィールド</th><th>ルール</th><th>エラーメッセージ</th></tr>
<tr><td>名前</td><td>必須（空白のみは不可）</td><td>名前は必須です</td></tr>
<tr><td>メール</td><td>@を含む</td><td>メールアドレスの形式が正しくありません</td></tr>
<tr><td>パスワード</td><td>8文字以上</td><td>パスワードは8文字以上にしてください</td></tr>
</table>
<p>複数のエラーを扱うときは、エラーメッセージを配列に集めてから表示するパターンが便利です。</p>
<pre><code>register() {
  const errors = [];
  if (this.nameTarget.value.trim() === "") {
    errors.push("名前は必須です");
  }
  // ...他のルールも同様にpush...
  if (errors.length &gt; 0) {
    this.messageTarget.textContent = errors.join("、");
    return;
  }
  this.messageTarget.textContent = "登録が完了しました";
}</code></pre>
<p>新しく使う道具の説明です。</p>
<ul>
<li><code>errors.push(...)</code>：配列の末尾に要素を追加する</li>
<li><code>value.includes("@")</code>：文字列に「@」が含まれているかをtrue/falseで返す。<code>!</code>と組み合わせて「含まれていなければエラー」と書ける</li>
<li><code>errors.join("、")</code>：配列の要素を「、」でつないだ1つの文字列にする</li>
</ul>
<p>この方式なら、if文を通過するたびにエラーが積み上がり、最後に「エラーがあるか（errors.length）」で送信可否を判断できます。ルールが増えてもifを1つ足すだけです。submitイベント＋:prevent、trim、length、ガード節と、この章で学んだ道具の総まとめです。</p>`,
      task: `registerメソッドを実装してください。3つのルールに違反したエラーメッセージをerrors配列に集め、エラーがあれば「、」で連結して表示、なければ「登録が完了しました」と表示します。`,
      code: `<form data-controller="signup" data-action="submit->signup#register:prevent">
  <p><label>名前：<input id="name" type="text" data-signup-target="name"></label></p>
  <p><label>メール：<input id="email" type="text" data-signup-target="email"></label></p>
  <p><label>パスワード：<input id="password" type="password" data-signup-target="password"></label></p>
  <button type="submit">登録</button>
  <p data-signup-target="message"></p>
</form>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("signup", class extends Controller {
  static targets = ["name", "email", "password", "message"];

  register() {
    const errors = [];
    // TODO: 名前が空（trimして空文字）なら「名前は必須です」をpush
    // TODO: メールに"@"が含まれていなければ
    //       「メールアドレスの形式が正しくありません」をpush
    // TODO: パスワードが8文字未満なら
    //       「パスワードは8文字以上にしてください」をpush
    // TODO: エラーがあればjoin("、")で表示してreturn、
    //       なければ「登録が完了しました」と表示する
  }
});
<\/script>`,
      solution: `<form data-controller="signup" data-action="submit->signup#register:prevent">
  <p><label>名前：<input id="name" type="text" data-signup-target="name"></label></p>
  <p><label>メール：<input id="email" type="text" data-signup-target="email"></label></p>
  <p><label>パスワード：<input id="password" type="password" data-signup-target="password"></label></p>
  <button type="submit">登録</button>
  <p data-signup-target="message"></p>
</form>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("signup", class extends Controller {
  static targets = ["name", "email", "password", "message"];

  register() {
    const errors = [];
    if (this.nameTarget.value.trim() === "") {
      errors.push("名前は必須です");
    }
    if (!this.emailTarget.value.includes("@")) {
      errors.push("メールアドレスの形式が正しくありません");
    }
    if (this.passwordTarget.value.length < 8) {
      errors.push("パスワードは8文字以上にしてください");
    }
    if (errors.length > 0) {
      this.messageTarget.textContent = errors.join("、");
      return;
    }
    this.messageTarget.textContent = "登録が完了しました";
  }
});
<\/script>`,
      hints: [
        `3つのif文でerrors.push(...)し、最後にerrors.lengthで分岐します`,
        `「@を含まない」は !this.emailTarget.value.includes("@") と書けます`
      ],
      check: `submit("form");
await sleep(50);
var msg = text("[data-signup-target=message]");
assert(msg && msg.includes("名前は必須です"), "全欄が空のまま登録すると「名前は必須です」を含むエラーが表示されるはずです");
assert(msg.includes("パスワードは8文字以上にしてください"), "全欄が空のときはパスワードのエラーも同時に表示されるはずです");
setValue("#name", "田中");
setValue("#email", "tanaka");
setValue("#password", "pass1234");
await sleep(50);
submit("form");
await sleep(50);
var msg2 = text("[data-signup-target=message]");
assert(msg2.includes("メールアドレスの形式が正しくありません"), "@のないメールでは「メールアドレスの形式が正しくありません」と表示されるはずです");
assert(!msg2.includes("名前は必須です"), "名前を入力済みなら名前のエラーは表示されないはずです");
setValue("#email", "tanaka@example.com");
await sleep(50);
submit("form");
await sleep(50);
assert(text("[data-signup-target=message]") === "登録が完了しました", "すべて正しく入力して登録すると「登録が完了しました」と表示されるはずです");`
    }
  ]
});
