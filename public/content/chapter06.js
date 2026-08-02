// 第6章：バリュー
registerChapter({
  number: 6,
  title: "バリュー",
  description: "static valuesを使い、HTMLのdata属性からコントローラへ型付きの設定値（バリュー）を渡す方法を学びます。",
  steps: [
    {
      id: 51,
      title: "static valuesとdata-x-xxx-value",
      explanation: `<p>コントローラに「表示する文言」や「初期値」などの設定を渡したいとき、JavaScriptに直接書き込んでしまうと、文言を変えるたびにJSを修正することになります。Stimulusには<strong>バリュー（values）</strong>という仕組みがあり、<strong>HTMLのdata属性から設定値を渡す</strong>ことができます。</p>
<p>使い方は2段階です。まずコントローラに<code>static values</code>で「名前と型」を宣言します。</p>
<pre><code>application.register("greeting", class extends Controller {
  static values = { message: String };

  connect() {
    console.log(this.messageValue); // 属性の値が読める
  }
});</code></pre>
<p>次にHTML側で、<strong>data-controllerを書いた要素自身に</strong>次の形式の属性を書きます。</p>
<pre><code>&lt;div data-controller="greeting"
     data-greeting-message-value="おはようございます"&gt;</code></pre>
<p>属性名は<code>data-[コントローラ名]-[バリュー名]-value</code>という決まりです。宣言すると<code>this.messageValue</code>のように「バリュー名＋Value」のプロパティが自動で生えます。ターゲットの<code>xxxTarget</code>と同じ命名パターンですね。</p>
<p>注意点は属性を書く場所です。ターゲット用の属性は内側の要素に書きましたが、<strong>バリューの属性はdata-controllerと同じ要素に書きます</strong>。第1章で学んだdatasetでも属性は読めますが、バリューには「型変換」「デフォルト値」「変更の検知（第7章）」という強力な利点があります。</p>`,
      task: `HTML側にdata-greeting-message-value属性を追加して、「おはようございます」が表示されるようにしてください。属性を書く場所に注意しましょう。`,
      code: `<!-- TODO: この要素にdata-greeting-message-value属性で「おはようございます」を渡す -->
<div data-controller="greeting">
  <p data-greeting-target="output"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("greeting", class extends Controller {
  static targets = ["output"];
  static values = { message: String };
  connect() {
    this.outputTarget.textContent = this.messageValue;
  }
});
<\/script>`,
      solution: `<div data-controller="greeting" data-greeting-message-value="おはようございます">
  <p data-greeting-target="output"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("greeting", class extends Controller {
  static targets = ["output"];
  static values = { message: String };
  connect() {
    this.outputTarget.textContent = this.messageValue;
  }
});
<\/script>`,
      hints: [
        `属性名はdata-[コントローラ名]-[バリュー名]-valueです。ここではdata-greeting-message-valueになります`,
        `バリューの属性は、data-controllerを書いた要素自身（divタグ）に書きます`
      ],
      check: `var el = $("[data-controller=greeting]");
assert(el, "data-controller=greetingの要素が必要です");
assert(el.getAttribute("data-greeting-message-value") === "おはようございます", "data-controllerと同じ要素にdata-greeting-message-value=「おはようございます」を書きましょう");
assert(text("p") === "おはようございます", "<p>に「おはようございます」と表示されるはずです");`
    },
    {
      id: 52,
      title: "型（String・Number・Boolean・Array・Object）",
      explanation: `<p>HTMLの属性値は、書いた内容が何であれ<strong>すべて文字列</strong>です。<code>data-point-score-value="50"</code>と書いても、datasetで読めば文字列の"50"であり、<code>"50" + 10</code>は<code>"5010"</code>という文字列連結になってしまいます。数値計算のバグの定番です。</p>
<p>バリューはこの問題を型宣言で解決します。<code>static values</code>で宣言できる型は5種類です。</p>
<table>
<tr><th>型</th><th>属性の書き方の例</th><th>読み取った値</th></tr>
<tr><td><code>String</code></td><td><code>"こんにちは"</code></td><td>文字列のまま</td></tr>
<tr><td><code>Number</code></td><td><code>"50"</code>や<code>"0.5"</code></td><td>数値 50、0.5</td></tr>
<tr><td><code>Boolean</code></td><td><code>"true"</code>／<code>"false"</code></td><td>真偽値</td></tr>
<tr><td><code>Array</code></td><td><code>'["a","b"]'</code></td><td>配列（JSONとして解釈）</td></tr>
<tr><td><code>Object</code></td><td><code>'{"key":"v"}'</code></td><td>オブジェクト（JSONとして解釈）</td></tr>
</table>
<pre><code>static values = { score: Number };
// this.scoreValue は数値の50。50 + 10 = 60と正しく計算できる</code></pre>
<p>宣言した型に合わせてStimulusが自動で変換してくれるので、メソッドの中では変換のことを忘れて本来の処理に集中できます。「HTMLから来る値は文字列」という落とし穴を、宣言1つで塞げるのがバリューの大きな価値です。ArrayとObjectは後のステップで実際に使います。</p>`,
      task: `10点加算ボタンを押すと「スコア：5010」と表示されてしまいます。static valuesの型宣言を直して、正しく「スコア：60」と計算されるようにしてください。`,
      code: `<div data-controller="point" data-point-score-value="50">
  <button data-action="point#add">10点加算</button>
  <p data-point-target="output"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("point", class extends Controller {
  static targets = ["output"];
  // TODO: scoreを数値として扱えるように型を直す
  static values = { score: String };
  add() {
    this.outputTarget.textContent = "スコア：" + (this.scoreValue + 10);
  }
});
<\/script>`,
      solution: `<div data-controller="point" data-point-score-value="50">
  <button data-action="point#add">10点加算</button>
  <p data-point-target="output"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("point", class extends Controller {
  static targets = ["output"];
  static values = { score: Number };
  add() {
    this.outputTarget.textContent = "スコア：" + (this.scoreValue + 10);
  }
});
<\/script>`,
      hints: [
        `String型のままだとthis.scoreValueは文字列"50"なので、+ 10が文字列連結になります`,
        `static values = { score: Number }; と宣言すると数値の50として読み取れます`
      ],
      check: `assert($("[data-controller=point]"), "data-controller=pointの要素が必要です");
click("button");
await sleep(50);
assert(text("p") !== "スコア：5010", "文字列連結になっています。scoreの型をNumberにしましょう");
assert(text("p") === "スコア：60", "ボタンを押すと「スコア：60」と表示されるはずです");`
    },
    {
      id: 53,
      title: "this.xxxValueで読む",
      explanation: `<p>宣言したバリューは<code>this.xxxValue</code>で読み取れます。connect()の中はもちろん、アクションのメソッドの中など、コントローラのどこからでも使えます。複数のバリューを宣言することもできます。</p>
<pre><code>static values = { userName: String, age: Number };

show() {
  console.log(this.userNameValue); // "佐藤"
  console.log(this.ageValue);      // 28
}</code></pre>
<p>ここで注意したいのが<strong>命名の変換規則</strong>です。JavaScript側で<code>userName</code>のようにキャメルケース（単語の区切りを大文字にする記法）で宣言した場合、HTML属性名は<strong>ケバブケース（ハイフン区切り）</strong>になります。</p>
<table>
<tr><th>宣言したバリュー名</th><th>HTML属性名</th><th>プロパティ</th></tr>
<tr><td><code>userName</code></td><td><code>data-profile-user-name-value</code></td><td><code>this.userNameValue</code></td></tr>
<tr><td><code>age</code></td><td><code>data-profile-age-value</code></td><td><code>this.ageValue</code></td></tr>
</table>
<p>これはステップ39で学んだターゲット名の変換規則とまったく同じです。HTML属性は大文字と小文字を区別しないためキャメルケースが使えず、代わりにハイフンで区切る決まりになっています。「JS側はキャメル、HTML側はケバブ」はStimulus全体を貫くルールなので、ここでしっかり体に染み込ませましょう。</p>`,
      task: `showメソッドを実装して、ボタンを押すと「佐藤です。28歳です。」と表示されるようにしてください。userNameとageの2つのバリューを読み取ります。`,
      code: `<div data-controller="profile"
     data-profile-user-name-value="佐藤"
     data-profile-age-value="28">
  <button data-action="profile#show">自己紹介</button>
  <p data-profile-target="output"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("profile", class extends Controller {
  static targets = ["output"];
  static values = { userName: String, age: Number };
  show() {
    // TODO: this.userNameValueとthis.ageValueを使って
    // 「佐藤です。28歳です。」と表示する
  }
});
<\/script>`,
      solution: `<div data-controller="profile"
     data-profile-user-name-value="佐藤"
     data-profile-age-value="28">
  <button data-action="profile#show">自己紹介</button>
  <p data-profile-target="output"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("profile", class extends Controller {
  static targets = ["output"];
  static values = { userName: String, age: Number };
  show() {
    this.outputTarget.textContent = this.userNameValue + "です。" + this.ageValue + "歳です。";
  }
});
<\/script>`,
      hints: [
        `バリュー名userNameのプロパティはthis.userNameValueです`,
        `this.outputTarget.textContent = this.userNameValue + "です。" + this.ageValue + "歳です。"; と組み立てます`
      ],
      check: `assert($("[data-controller=profile]"), "data-controller=profileの要素が必要です");
click("button");
await sleep(50);
assert(text("p") === "佐藤です。28歳です。", "ボタンを押すと「佐藤です。28歳です。」と表示されるはずです。this.userNameValueとthis.ageValueを使いましょう");`
    },
    {
      id: 54,
      title: "xxxValueへの代入とHTMLへの反映",
      explanation: `<p>バリューは読むだけでなく、<strong>代入もできます</strong>。そして代入すると、面白いことが起きます。</p>
<pre><code>this.countValue = this.countValue + 1;
// → 要素のdata-counter-count-value属性が自動で書き換わる！</code></pre>
<p><code>this.countValue</code>に代入すると、Stimulusは<strong>HTML側のdata属性を自動で更新します</strong>。つまりバリューの実体はコントローラの中のメモリではなく、<strong>DOM（HTML属性）そのもの</strong>なのです。読み取りは「属性→型変換して返す」、書き込みは「型に応じて文字列化して属性へ」という双方向の窓口が<code>xxxValue</code>プロパティだと考えてください。</p>
<p>これに対して、<code>this.count</code>のような普通のインスタンス変数に数を持たせた場合、値はJavaScriptの中だけに存在し、HTMLには何も残りません。開発者ツールで要素を調べても状態が見えず、デバッグがしづらくなります。バリューなら要素の属性を見るだけで「今の状態」が分かります。</p>
<p>「状態をDOMに置く」ことはStimulusの中心的な設計思想で、第7章では属性の変化に反応して自動でUIを更新する<code>valueChanged</code>コールバックを学びます。まずは「代入すると属性に反映される」という動きを、getAttributeで属性を覗きながら確認しましょう。</p>`,
      task: `今はインスタンス変数this.countで数えているため、data属性が「0」のまま更新されません。this.countValueを使うように書き換えて、表示と属性の両方が増えるようにしてください。`,
      code: `<div id="box" data-controller="counter" data-counter-count-value="0">
  <button data-action="counter#increment">+1</button>
  <p data-counter-target="output"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("counter", class extends Controller {
  static targets = ["output"];
  static values = { count: Number };
  increment() {
    // TODO: this.countではなくthis.countValueを使うように書き換える
    this.count = (this.count || 0) + 1;
    this.outputTarget.textContent = "count：" + this.count +
      "（属性：" + this.element.getAttribute("data-counter-count-value") + "）";
  }
});
<\/script>`,
      solution: `<div id="box" data-controller="counter" data-counter-count-value="0">
  <button data-action="counter#increment">+1</button>
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
    this.outputTarget.textContent = "count：" + this.countValue +
      "（属性：" + this.element.getAttribute("data-counter-count-value") + "）";
  }
});
<\/script>`,
      hints: [
        `this.countValue = this.countValue + 1; と代入すると、data-counter-count-value属性も自動で書き換わります`,
        `表示部分もthis.countではなくthis.countValueに直すのを忘れずに`
      ],
      check: `assert($("#box"), "id=boxの要素が必要です");
click("button");
await sleep(50);
click("button");
await sleep(50);
assert($("#box").getAttribute("data-counter-count-value") === "2", "2回クリックするとdata-counter-count-value属性が「2」に更新されるはずです。this.countValueに代入しましょう");
assert(text("p") === "count：2（属性：2）", "表示は「count：2（属性：2）」になるはずです");`
    },
    {
      id: 55,
      title: "デフォルト値（{ type, default }）",
      explanation: `<p>HTML側に属性が書かれていなかったとき、バリューはどうなるのでしょうか。エラーにはならず、<strong>型ごとに決まったデフォルト値</strong>が返ります。</p>
<table>
<tr><th>型</th><th>属性がないときの値</th></tr>
<tr><td><code>String</code></td><td><code>""</code>（空文字列）</td></tr>
<tr><td><code>Number</code></td><td><code>0</code></td></tr>
<tr><td><code>Boolean</code></td><td><code>false</code></td></tr>
<tr><td><code>Array</code></td><td><code>[]</code></td></tr>
<tr><td><code>Object</code></td><td><code>{}</code></td></tr>
</table>
<p>しかし「ポモドーロタイマーの作業時間は、指定がなければ25分にしたい」のように、<strong>自分でデフォルト値を決めたい</strong>ことがあります。その場合は型の代わりにオブジェクト形式で宣言します。</p>
<pre><code>static values = {
  minutes: { type: Number, default: 25 }
};</code></pre>
<p><code>type</code>に型、<code>default</code>に属性がないときの値を書きます。属性があればもちろん属性の値が優先されます。この書き方は普通の型宣言と混在できるので、デフォルトが必要なものだけオブジェクト形式にすれば大丈夫です。</p>
<p>デフォルト値をうまく使うと、「何も設定しなくても動く、設定すれば変えられる」という使い勝手のよいコントローラになります。利用側のHTMLは最小限で済み、カスタマイズしたいときだけ属性を足せばよいのです。これは第18章で学ぶ「汎用コントローラ」設計の基礎になります。</p>`,
      task: `minutesバリューにデフォルト値25を設定して、属性のない1つ目のタイマーが「作業時間：25分」と表示されるようにしてください。属性のある2つ目は50分のままです。`,
      code: `<div data-controller="pomodoro">
  <p data-pomodoro-target="output"></p>
</div>
<div data-controller="pomodoro" data-pomodoro-minutes-value="50">
  <p data-pomodoro-target="output"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("pomodoro", class extends Controller {
  static targets = ["output"];
  // TODO: minutesのデフォルト値を25にする（{ type, default }形式）
  static values = { minutes: Number };
  connect() {
    this.outputTarget.textContent = "作業時間：" + this.minutesValue + "分";
  }
});
<\/script>`,
      solution: `<div data-controller="pomodoro">
  <p data-pomodoro-target="output"></p>
</div>
<div data-controller="pomodoro" data-pomodoro-minutes-value="50">
  <p data-pomodoro-target="output"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("pomodoro", class extends Controller {
  static targets = ["output"];
  static values = { minutes: { type: Number, default: 25 } };
  connect() {
    this.outputTarget.textContent = "作業時間：" + this.minutesValue + "分";
  }
});
<\/script>`,
      hints: [
        `型の代わりに { type: Number, default: 25 } というオブジェクトを書きます`,
        `static values = { minutes: { type: Number, default: 25 } }; となります`
      ],
      check: `var outputs = $$("[data-pomodoro-target=output]");
assert(outputs.length === 2, "pomodoroコントローラの出力が2つ必要です");
assert(outputs[0].textContent.trim() === "作業時間：25分", "属性のない1つ目は「作業時間：25分」になるはずです。defaultを設定しましょう");
assert(outputs[1].textContent.trim() === "作業時間：50分", "属性のある2つ目は「作業時間：50分」のままのはずです");`
    },
    {
      id: 56,
      title: "hasXxxValue",
      explanation: `<p>String型のバリューは、属性がないとき空文字列<code>""</code>になります。ここで困った問題が起きます。「属性が書かれていない」のと「属性に空文字列が書かれている」のを、<code>this.nameValue</code>だけでは区別できないのです。</p>
<p>そこで使うのが<code>this.hasXxxValue</code>です。これは<strong>HTML側に属性が存在するかどうか</strong>を真偽値で返します。ステップ34で学んだ<code>hasXxxTarget</code>のバリュー版ですね。</p>
<pre><code>static values = { name: String };

connect() {
  if (this.hasNameValue) {
    // data-hello-name-value属性が書かれている
  } else {
    // 属性そのものがない
  }
}</code></pre>
<p>典型的な使いどころは「設定があればそれを使い、なければ別の振る舞いをする」という分岐です。たとえば名前が設定されていれば「こんにちは、田中さん」、なければ「こんにちは、ゲストさん」と表示する、といった具合です。</p>
<p>前のステップのdefaultとの使い分けも整理しておきましょう。「なければ決まった値で代用できる」ならdefaultが簡潔です。一方「設定の有無そのもので処理を変えたい」（例：設定がなければ表示ごと省略する）ならhasXxxValueの出番です。同じ「未設定対策」でも、defaultは値の補完、hasXxxValueは分岐と覚えてください。</p>`,
      task: `connectメソッドの中でhasNameValueを使って分岐し、名前の属性があれば「こんにちは、（名前）さん」、なければ「こんにちは、ゲストさん」と表示されるようにしてください。`,
      code: `<div data-controller="hello">
  <p data-hello-target="output"></p>
</div>
<div data-controller="hello" data-hello-name-value="田中">
  <p data-hello-target="output"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("hello", class extends Controller {
  static targets = ["output"];
  static values = { name: String };
  connect() {
    // TODO: this.hasNameValueで分岐する。
    // 属性があれば「こんにちは、（名前）さん」、なければ「こんにちは、ゲストさん」
    this.outputTarget.textContent = "こんにちは、" + this.nameValue + "さん";
  }
});
<\/script>`,
      solution: `<div data-controller="hello">
  <p data-hello-target="output"></p>
</div>
<div data-controller="hello" data-hello-name-value="田中">
  <p data-hello-target="output"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("hello", class extends Controller {
  static targets = ["output"];
  static values = { name: String };
  connect() {
    if (this.hasNameValue) {
      this.outputTarget.textContent = "こんにちは、" + this.nameValue + "さん";
    } else {
      this.outputTarget.textContent = "こんにちは、ゲストさん";
    }
  }
});
<\/script>`,
      hints: [
        `this.hasNameValueは、data-hello-name-value属性があるときだけtrueになります`,
        `if (this.hasNameValue) { ... } else { ... } で表示を切り替えます`
      ],
      check: `var outputs = $$("[data-hello-target=output]");
assert(outputs.length === 2, "helloコントローラの出力が2つ必要です");
assert(outputs[0].textContent.trim() === "こんにちは、ゲストさん", "属性のない1つ目は「こんにちは、ゲストさん」になるはずです。hasNameValueで分岐しましょう");
assert(outputs[1].textContent.trim() === "こんにちは、田中さん", "属性のある2つ目は「こんにちは、田中さん」になるはずです");`
    },
    {
      id: 57,
      title: "Number型のvalueで計算",
      explanation: `<p>Number型のバリューを使った実践的な計算をやってみましょう。題材は「税込価格の計算」です。</p>
<pre><code>&lt;div data-controller="price"
     data-price-amount-value="1200"
     data-price-tax-value="0.1"&gt;</code></pre>
<p>Number型は<code>"1200"</code>のような整数だけでなく、<code>"0.1"</code>のような<strong>小数も正しく数値に変換します</strong>。宣言はこうです。</p>
<pre><code>static values = { amount: Number, tax: Number };</code></pre>
<p>税込価格は「金額×(1＋税率)」で計算できます。ここで1つ、JavaScriptの小数計算の注意点を知っておきましょう。コンピュータは小数を2進数で近似して扱うため、<code>1200 * 1.1</code>の結果が<code>1320.0000000000002</code>のようなわずかな誤差を含むことがあります。金額の表示では<code>Math.round()</code>（四捨五入して整数にする関数）を通すのが定番の対処です。</p>
<pre><code>const total = Math.round(this.amountValue * (1 + this.taxValue));</code></pre>
<p>金額や税率をHTML側に置くメリットを想像してみてください。Railsなどのサーバー側テンプレートなら、商品ごとの価格をdata属性として埋め込むだけで、同じコントローラがどの商品にも使い回せます。JavaScriptには計算ロジックだけが残り、データはHTMLが運んでくる。この分担がStimulusらしい設計です。</p>`,
      task: `calcメソッドを実装してください。amountValueとtaxValueから税込価格を計算し、Math.roundで整数にして「税込：1320円」と表示します。`,
      code: `<div data-controller="price"
     data-price-amount-value="1200"
     data-price-tax-value="0.1">
  <p>本体価格1200円（税率10%）</p>
  <button data-action="price#calc">税込価格を計算</button>
  <p data-price-target="output"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("price", class extends Controller {
  static targets = ["output"];
  static values = { amount: Number, tax: Number };
  calc() {
    // TODO: 税込価格 = amountValue × (1 + taxValue) をMath.roundで整数にして
    // 「税込：1320円」の形式で表示する
  }
});
<\/script>`,
      solution: `<div data-controller="price"
     data-price-amount-value="1200"
     data-price-tax-value="0.1">
  <p>本体価格1200円（税率10%）</p>
  <button data-action="price#calc">税込価格を計算</button>
  <p data-price-target="output"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("price", class extends Controller {
  static targets = ["output"];
  static values = { amount: Number, tax: Number };
  calc() {
    const total = Math.round(this.amountValue * (1 + this.taxValue));
    this.outputTarget.textContent = "税込：" + total + "円";
  }
});
<\/script>`,
      hints: [
        `const total = Math.round(this.amountValue * (1 + this.taxValue)); で税込価格を計算できます`,
        `表示は "税込：" + total + "円" と文字列連結します`
      ],
      check: `assert($("[data-controller=price]"), "data-controller=priceの要素が必要です");
click("button");
await sleep(50);
assert(text("[data-price-target=output]") === "税込：1320円", "ボタンを押すと「税込：1320円」と表示されるはずです。Math.roundを忘れずに");`
    },
    {
      id: 58,
      title: "Array型のvalue",
      explanation: `<p>バリューには配列も渡せます。Array型を宣言すると、属性の値を<strong>JSON</strong>（データを文字列で表現する標準形式）として解釈してくれます。</p>
<pre><code>&lt;div data-controller="tags"
     data-tags-list-value='["Rails","Stimulus","Turbo"]'&gt;</code></pre>
<pre><code>static values = { list: Array };
// this.listValue は ["Rails", "Stimulus", "Turbo"] という本物の配列</code></pre>
<p>書き方のコツは<strong>引用符の使い分け</strong>です。JSONの文字列は必ずダブルクォート<code>"</code>で囲む決まりなので、HTML属性の外側はシングルクォート<code>'</code>で囲むと衝突しません。また、JSONとして正しくない文字列（閉じ括弧忘れなど）を書くとコントローラ接続時にエラーになるので注意してください。属性がない場合は空配列<code>[]</code>になります。</p>
<p>読み取った配列は普通の配列なので、<code>forEach</code>や<code>length</code>がそのまま使えます。第1章で学んだ<code>createElement</code>＋<code>appendChild</code>と組み合わせれば、配列の内容をリスト表示できます。</p>
<pre><code>this.listValue.forEach((tag) =&gt; {
  const li = document.createElement("li");
  li.textContent = tag;
  this.outputTarget.appendChild(li);
});</code></pre>
<p>「サーバーが用意したデータの一覧をHTML属性で渡し、JS側で描画する」のは実務でも頻出のパターンです。</p>`,
      task: `renderメソッドのTODOを実装してください。listValueの各要素についてli要素を作り、outputTargetに追加して、タグの一覧が表示されるようにします。`,
      code: `<div data-controller="tags" data-tags-list-value='["Rails","Stimulus","Turbo"]'>
  <button data-action="tags#render">タグを表示</button>
  <ul data-tags-target="output"></ul>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("tags", class extends Controller {
  static targets = ["output"];
  static values = { list: Array };
  render() {
    this.outputTarget.textContent = "";
    // TODO: this.listValueをforEachで回し、各タグについて
    // li要素をcreateElementで作り、textContentを設定して、outputTargetにappendChildする
  }
});
<\/script>`,
      solution: `<div data-controller="tags" data-tags-list-value='["Rails","Stimulus","Turbo"]'>
  <button data-action="tags#render">タグを表示</button>
  <ul data-tags-target="output"></ul>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("tags", class extends Controller {
  static targets = ["output"];
  static values = { list: Array };
  render() {
    this.outputTarget.textContent = "";
    this.listValue.forEach((tag) => {
      const li = document.createElement("li");
      li.textContent = tag;
      this.outputTarget.appendChild(li);
    });
  }
});
<\/script>`,
      hints: [
        `this.listValueは本物の配列なので、forEachがそのまま使えます`,
        `const li = document.createElement("li"); li.textContent = tag; this.outputTarget.appendChild(li); を繰り返します`
      ],
      check: `assert($("[data-controller=tags]"), "data-controller=tagsの要素が必要です");
click("button");
await sleep(50);
var items = $$("li");
assert(items.length === 3, "ボタンを押すと<li>が3つ表示されるはずです（今：" + items.length + "個）");
var texts = items.map(function (li) { return li.textContent.trim(); }).join(",");
assert(texts === "Rails,Stimulus,Turbo", "liの内容はRails、Stimulus、Turboの順になるはずです");`
    },
    {
      id: 59,
      title: "Object型のvalue",
      explanation: `<p>最後の型はObjectです。Array型と同じくJSONとして解釈され、<strong>キーと値のセット</strong>をまとめて渡せます。</p>
<pre><code>&lt;div data-controller="card"
     data-card-user-value='{"name":"高橋","role":"デザイナー","years":5}'&gt;</code></pre>
<pre><code>static values = { user: Object };

show() {
  const u = this.userValue;
  console.log(u.name);  // "高橋"
  console.log(u.years); // 5（数値として扱える）
}</code></pre>
<p>JSONの中の<code>5</code>は数値として、<code>"高橋"</code>は文字列として、それぞれ正しい型で読み取れます。属性がない場合は空オブジェクト<code>{}</code>です。書き方の注意はArray型と同じで、外側をシングルクォート、JSONのキーと文字列値をダブルクォートにします。キーをクォートで囲み忘れるとJSONとして不正になるので気をつけましょう。</p>
<p>Objectバリューが向いているのは、「ユーザー情報」「設定一式」のように<strong>関連する値をひとまとまり</strong>で渡したい場面です。name・role・yearsを別々のバリューとして3つ宣言してもよいのですが、1人のユーザーの情報だと分かっているなら1つのオブジェクトのほうが意図が伝わります。逆に、単独で意味を持つ値（税率、初期値など）まで無理にオブジェクトへ詰め込むと使いづらくなります。データのまとまりに合わせて型を選びましょう。</p>`,
      task: `showメソッドを実装してください。userValueからname・role・yearsを取り出し、「高橋（デザイナー・5年目）」と表示します。`,
      code: `<div data-controller="card" data-card-user-value='{"name":"高橋","role":"デザイナー","years":5}'>
  <button data-action="card#show">プロフィール表示</button>
  <p data-card-target="output"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("card", class extends Controller {
  static targets = ["output"];
  static values = { user: Object };
  show() {
    // TODO: this.userValueのname・role・yearsを使って
    // 「高橋（デザイナー・5年目）」と表示する
  }
});
<\/script>`,
      solution: `<div data-controller="card" data-card-user-value='{"name":"高橋","role":"デザイナー","years":5}'>
  <button data-action="card#show">プロフィール表示</button>
  <p data-card-target="output"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("card", class extends Controller {
  static targets = ["output"];
  static values = { user: Object };
  show() {
    const u = this.userValue;
    this.outputTarget.textContent = u.name + "（" + u.role + "・" + u.years + "年目）";
  }
});
<\/script>`,
      hints: [
        `const u = this.userValue; とすると、u.name、u.role、u.yearsでアクセスできます`,
        `表示は u.name + "（" + u.role + "・" + u.years + "年目）" と組み立てます`
      ],
      check: `assert($("[data-controller=card]"), "data-controller=cardの要素が必要です");
click("button");
await sleep(50);
assert(text("[data-card-target=output]") === "高橋（デザイナー・5年目）", "ボタンを押すと「高橋（デザイナー・5年目）」と表示されるはずです");`
    },
    {
      id: 60,
      title: "総合演習：初期値・増分を設定できるカウンタ",
      explanation: `<p>第6章の総まとめとして、<strong>初期値と増分をHTML側から設定できるカウンタ</strong>を作ります。同じコントローラを2か所に置き、それぞれ違う設定で動かします。</p>
<pre><code>&lt;div data-controller="counter"
     data-counter-start-value="100"
     data-counter-step-value="10"&gt;  ← 100から10ずつ

&lt;div data-controller="counter"
     data-counter-start-value="0"&gt;  ← 0から1ずつ（stepは省略）</code></pre>
<p>使うバリューは3つです。</p>
<table>
<tr><th>バリュー</th><th>役割</th><th>宣言</th></tr>
<tr><td><code>start</code></td><td>初期値</td><td><code>Number</code></td></tr>
<tr><td><code>step</code></td><td>±ボタン1回の増分</td><td><code>{ type: Number, default: 1 }</code></td></tr>
<tr><td><code>count</code></td><td>現在の値（状態）</td><td><code>Number</code></td></tr>
</table>
<p>流れはこうです。connect()で<code>this.countValue = this.startValue</code>と初期化して表示。＋ボタンで<code>countValue</code>に<code>stepValue</code>を足し、−ボタンで引き、そのたびに表示を更新します。ステップ54で学んだとおり、countValueへの代入はdata属性にも反映されるので、要素を調べれば今の値がいつでも確認できます。</p>
<p>完成すると、<strong>JavaScriptを1文字も変えずに</strong>、HTML属性だけで「どこから始まるか」「いくつずつ増えるか」を自由に変えられるカウンタになります。これがバリューの真価です。第7章では、countValueの変化を自動で検知してUIを更新する仕組みへ進化させます。</p>`,
      task: `2つのTODOを完成させてください。（1）stepバリューにデフォルト値1を設定する。（2）incrementとdecrementを実装する（countValueにstepValueを足し引きしてrenderを呼ぶ）。`,
      code: `<div id="a" data-controller="counter" data-counter-start-value="100" data-counter-step-value="10">
  <button data-action="counter#increment">＋</button>
  <button data-action="counter#decrement">−</button>
  <span data-counter-target="output"></span>
</div>
<div id="b" data-controller="counter" data-counter-start-value="0">
  <button data-action="counter#increment">＋</button>
  <button data-action="counter#decrement">−</button>
  <span data-counter-target="output"></span>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("counter", class extends Controller {
  static targets = ["output"];
  // TODO(1): stepのデフォルト値を1にする
  static values = { start: Number, step: Number, count: Number };
  connect() {
    this.countValue = this.startValue;
    this.render();
  }
  increment() {
    // TODO(2): countValueにstepValueを足してrenderを呼ぶ
  }
  decrement() {
    // TODO(2): countValueからstepValueを引いてrenderを呼ぶ
  }
  render() {
    this.outputTarget.textContent = String(this.countValue);
  }
});
<\/script>`,
      solution: `<div id="a" data-controller="counter" data-counter-start-value="100" data-counter-step-value="10">
  <button data-action="counter#increment">＋</button>
  <button data-action="counter#decrement">−</button>
  <span data-counter-target="output"></span>
</div>
<div id="b" data-controller="counter" data-counter-start-value="0">
  <button data-action="counter#increment">＋</button>
  <button data-action="counter#decrement">−</button>
  <span data-counter-target="output"></span>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("counter", class extends Controller {
  static targets = ["output"];
  static values = { start: Number, step: { type: Number, default: 1 }, count: Number };
  connect() {
    this.countValue = this.startValue;
    this.render();
  }
  increment() {
    this.countValue = this.countValue + this.stepValue;
    this.render();
  }
  decrement() {
    this.countValue = this.countValue - this.stepValue;
    this.render();
  }
  render() {
    this.outputTarget.textContent = String(this.countValue);
  }
});
<\/script>`,
      hints: [
        `stepの宣言を step: { type: Number, default: 1 } に変えます`,
        `incrementは this.countValue = this.countValue + this.stepValue; this.render(); の2行です`,
        `decrementは足し算を引き算に変えるだけです`
      ],
      check: `assert($("#a") && $("#b"), "id=aとid=bの2つのカウンタが必要です");
assert(text("#a span") === "100", "1つ目のカウンタは初期値100から始まるはずです");
assert(text("#b span") === "0", "2つ目のカウンタは初期値0から始まるはずです");
click("#a button:first-of-type");
await sleep(50);
assert(text("#a span") === "110", "1つ目の＋ボタンで10増えて110になるはずです。incrementを実装しましょう");
click("#b button:first-of-type");
await sleep(50);
assert(text("#b span") === "1", "2つ目の＋ボタンで1増えて1になるはずです。stepのデフォルト値を1にしましょう");
click("#a button:nth-of-type(2)");
await sleep(50);
click("#a button:nth-of-type(2)");
await sleep(50);
assert(text("#a span") === "90", "1つ目の−ボタンを2回押すと90になるはずです。decrementを実装しましょう");`
    }
  ]
});
