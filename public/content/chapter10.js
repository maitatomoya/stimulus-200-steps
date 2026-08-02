// 第10章：複数コントローラ
registerChapter({
  number: 10,
  title: "複数コントローラ",
  description: "複数のコントローラを組み合わせる方法を学びます。1要素への複数指定、ネストとスコープ、同名コントローラの独立性、単一責任の分割基準まで。",
  steps: [
    {
      id: 91,
      title: "1要素に複数コントローラ（data-controller=\"a b\"）",
      explanation: `<p>1つの要素には、<strong>スペース区切りで複数のコントローラ</strong>を接続できます。classなどの属性で複数の値をスペース区切りで書くのと同じ感覚です。</p>
<pre><code>&lt;div data-controller="greeter counter"&gt;
  ...
&lt;/div&gt;</code></pre>
<p>こう書くと、この要素にはgreeterコントローラとcounterコントローラの<strong>2つのインスタンスが同時に接続</strong>されます。それぞれのコントローラは独立して動き、お互いの存在を知りません。</p>
<p>ターゲットやアクションの属性には必ずコントローラ名が含まれるので、同じ要素の中に2つのコントローラが同居しても混線しません。</p>
<table>
  <tr><th>属性</th><th>どちらのものか</th></tr>
  <tr><td><code>data-greeter-target="output"</code></td><td>greeterのターゲット</td></tr>
  <tr><td><code>data-counter-target="output"</code></td><td>counterのターゲット</td></tr>
  <tr><td><code>data-action="greeter#hello"</code></td><td>greeterのメソッドを呼ぶ</td></tr>
  <tr><td><code>data-action="counter#up"</code></td><td>counterのメソッドを呼ぶ</td></tr>
</table>
<p>この仕組みのおかげで、「あいさつ機能」と「カウント機能」をそれぞれ小さなコントローラとして作り、必要な場所で自由に組み合わせられます。1つの巨大なコントローラにあれもこれも詰め込むより、ずっと再利用しやすくなります。</p>
<p>今回の初期コードでは<code>data-controller="greeter"</code>しか書かれていないため、counterのボタンを押しても何も起きません。counterを追加して、2つが同居できることを確かめましょう。</p>`,
      task: `data-controller属性にcounterをスペース区切りで追加して、「あいさつ」と「カウント」の両方のボタンが動くようにしてください。`,
      code: `<!-- TODO: data-controllerに counter もスペース区切りで追加する -->
<div data-controller="greeter">
  <button data-action="greeter#hello">あいさつ</button>
  <button data-action="counter#up">カウント</button>
  <p data-greeter-target="output"></p>
  <p>カウント：<span data-counter-target="output">0</span></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("greeter", class extends Controller {
  static targets = ["output"];
  hello() {
    this.outputTarget.textContent = "こんにちは！";
  }
});

application.register("counter", class extends Controller {
  static targets = ["output"];
  static values = { count: Number };
  up() {
    this.countValue = this.countValue + 1;
    this.outputTarget.textContent = String(this.countValue);
  }
});
<\/script>`,
      solution: `<div data-controller="greeter counter">
  <button data-action="greeter#hello">あいさつ</button>
  <button data-action="counter#up">カウント</button>
  <p data-greeter-target="output"></p>
  <p>カウント：<span data-counter-target="output">0</span></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("greeter", class extends Controller {
  static targets = ["output"];
  hello() {
    this.outputTarget.textContent = "こんにちは！";
  }
});

application.register("counter", class extends Controller {
  static targets = ["output"];
  static values = { count: Number };
  up() {
    this.countValue = this.countValue + 1;
    this.outputTarget.textContent = String(this.countValue);
  }
});
<\/script>`,
      hints: [
        `data-controller="greeter counter" のようにスペースで区切って2つ書きます`,
        `ターゲット属性にはコントローラ名が入っているので、同じ「output」という名前でも混ざりません`
      ],
      check: `await sleep(100);
const attr = $("[data-controller]").getAttribute("data-controller");
assert(attr.split(" ").indexOf("greeter") !== -1 && attr.split(" ").indexOf("counter") !== -1, "data-controller属性にgreeterとcounterの両方をスペース区切りで書いてください");
click("[data-action='greeter#hello']");
await sleep(50);
click("[data-action='counter#up']");
await sleep(50);
assert(text("[data-greeter-target=output]") === "こんにちは！", "「あいさつ」を押すと「こんにちは！」と表示されるはずです");
assert(text("[data-counter-target=output]") === "1", "counterも接続されていれば、「カウント」を押すと表示が「1」になるはずです");`
    },
    {
      id: 92,
      title: "ネストしたコントローラとスコープの境界",
      explanation: `<p>コントローラの中に別のコントローラを入れる（<strong>ネストする</strong>）こともできます。このとき大事なのが、第2章で学んだ<strong>スコープ</strong>の考え方です。</p>
<pre><code>&lt;div data-controller="panel"&gt;      ←panelのスコープはこの内側
  &lt;p data-panel-target="status"&gt;...&lt;/p&gt;
  &lt;div data-controller="item"&gt;     ←itemのスコープはさらにこの内側
    &lt;button data-action="item#pick"&gt;選ぶ&lt;/button&gt;
  &lt;/div&gt;
&lt;/div&gt;</code></pre>
<p>各コントローラが反応できるのは、<strong>自分のdata-controller要素とその内側だけ</strong>です。ルールを整理します。</p>
<ul>
  <li>panelのアクションやターゲットは、panelのdiv の内側に書いたときだけ機能する</li>
  <li>itemのアクションは、itemのdivの内側だけで機能する</li>
  <li>スコープの<strong>外側</strong>に置いたボタンにdata-action="panel#..."と書いても、何も起きない（エラーにもならないので気づきにくい）</li>
</ul>
<p>今回の初期コードでは、「パネルを有効化」ボタンがpanelのdivの<strong>外側</strong>に置かれています。属性の書き方は正しいのに、スコープ外なので押しても無反応です。これは実際の開発でも非常によくあるミスで、「アクションが動かないときは、まずボタンがコントローラ要素の内側にあるか確認する」が定番のデバッグ手順です。</p>
<p>ボタンをpanelのdivの内側（ただしitemのdivの外）に移動して、スコープの境界を体感しましょう。</p>`,
      task: `panelのスコープの外にある「パネルを有効化」ボタンを、data-controller="panel"のdivの内側に移動して、クリックでステータスが「有効」になるようにしてください。`,
      code: `<!-- TODO: このボタンはpanelのスコープの外にあるため動かない。
     data-controller="panel" のdivの内側（statusのpの上あたり）に移動する -->
<button data-action="panel#activate">パネルを有効化</button>

<div data-controller="panel">
  <p data-panel-target="status">未有効</p>
  <div data-controller="item">
    <button data-action="item#pick">選ぶ</button>
    <p data-item-target="output"></p>
  </div>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("panel", class extends Controller {
  static targets = ["status"];
  activate() {
    this.statusTarget.textContent = "有効";
  }
});

application.register("item", class extends Controller {
  static targets = ["output"];
  pick() {
    this.outputTarget.textContent = "選びました";
  }
});
<\/script>`,
      solution: `<div data-controller="panel">
  <button data-action="panel#activate">パネルを有効化</button>
  <p data-panel-target="status">未有効</p>
  <div data-controller="item">
    <button data-action="item#pick">選ぶ</button>
    <p data-item-target="output"></p>
  </div>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("panel", class extends Controller {
  static targets = ["status"];
  activate() {
    this.statusTarget.textContent = "有効";
  }
});

application.register("item", class extends Controller {
  static targets = ["output"];
  pick() {
    this.outputTarget.textContent = "選びました";
  }
});
<\/script>`,
      hints: [
        `<button data-action="panel#activate">...</button> の行を、<div data-controller="panel">の直後に移動します`,
        `data-actionの書き方が正しくても、コントローラ要素の外側にあると反応しません`
      ],
      check: `await sleep(100);
click("[data-action='panel#activate']");
await sleep(50);
assert(text("[data-panel-target=status]") === "有効", "ボタンをdata-controller=\\"panel\\"のdivの内側に移動すると、クリックでステータスが「有効」になるはずです。スコープの外では反応しません");
click("[data-action='item#pick']");
await sleep(50);
assert(text("[data-item-target=output]") === "選びました", "ネストしたitemコントローラのボタンは、itemのスコープ内なので「選びました」と表示されるはずです");`
    },
    {
      id: 93,
      title: "親子でターゲット名が衝突しない仕組み",
      explanation: `<p>ネストした親子のコントローラが、どちらも<code>output</code>という同じターゲット名を使ったら衝突しないのでしょうか。結論：<strong>衝突しません</strong>。ターゲットの属性名にはコントローラ名（識別子）が含まれるからです。</p>
<table>
  <tr><th>属性</th><th>誰のターゲットか</th></tr>
  <tr><td><code>data-parent-target="output"</code></td><td>parentコントローラのoutput</td></tr>
  <tr><td><code>data-child-target="output"</code></td><td>childコントローラのoutput</td></tr>
</table>
<p>つまりターゲットの持ち主を決めるのは、要素の置き場所ではなく<strong>属性名の中のコントローラ名</strong>です。ここで1つ注意があります。親のターゲット検索は、ネストした子コントローラの内側まで届きます。子のdivの中に<code>data-parent-target="output"</code>と書いた要素があれば、それは<strong>親のターゲット</strong>として拾われます。</p>
<pre><code>&lt;div data-controller="parent"&gt;
  &lt;p data-parent-target="output"&gt;&lt;/p&gt;      ←親のターゲット
  &lt;div data-controller="child"&gt;
    &lt;p data-parent-target="output"&gt;&lt;/p&gt;    ←これも親のターゲット！
    &lt;p data-child-target="output"&gt;&lt;/p&gt;     ←こちらが子のターゲット
  &lt;/div&gt;
&lt;/div&gt;</code></pre>
<p>今回の初期コードでは、子のdivの中の出力用のpに、誤って<code>data-parent-target</code>が付いています。このままだと子コントローラには<code>output</code>ターゲットが存在しないため、「子に書く」を押すとターゲットが見つからずエラーになります。属性を<code>data-child-target</code>に直して、親子がそれぞれ自分のpに書き込めるようにしましょう。</p>`,
      task: `子のdivの中にある出力用のpの属性を、data-parent-target="output"からdata-child-target="output"に直してください。親と子のボタンがそれぞれ自分のpに書き込めれば成功です。`,
      code: `<div data-controller="parent">
  <button data-action="parent#write">親に書く</button>
  <p data-parent-target="output">（親の出力）</p>

  <div data-controller="child">
    <button data-action="child#write">子に書く</button>
    <!-- TODO: 下のpは子コントローラのターゲットにしたい。
         data-parent-target を data-child-target に直す -->
    <p data-parent-target="output">（子の出力）</p>
  </div>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("parent", class extends Controller {
  static targets = ["output"];
  write() {
    this.outputTarget.textContent = "親が書きました";
  }
});

application.register("child", class extends Controller {
  static targets = ["output"];
  write() {
    this.outputTarget.textContent = "子が書きました";
  }
});
<\/script>`,
      solution: `<div data-controller="parent">
  <button data-action="parent#write">親に書く</button>
  <p data-parent-target="output">（親の出力）</p>

  <div data-controller="child">
    <button data-action="child#write">子に書く</button>
    <p data-child-target="output">（子の出力）</p>
  </div>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("parent", class extends Controller {
  static targets = ["output"];
  write() {
    this.outputTarget.textContent = "親が書きました";
  }
});

application.register("child", class extends Controller {
  static targets = ["output"];
  write() {
    this.outputTarget.textContent = "子が書きました";
  }
});
<\/script>`,
      hints: [
        `ターゲット属性の形は data-コントローラ名-target="ターゲット名" です。子ならdata-child-targetになります`,
        `初期コードのままだと子にはoutputターゲットが1つもないため、「子に書く」でエラーになります（コンソールを見てみましょう）`
      ],
      check: `await sleep(100);
assert($("[data-child-target=output]"), "子の出力用のpにはdata-child-target=\\"output\\"を付けてください。data-parent-targetのままでは子コントローラから見えません");
click("[data-action='parent#write']");
await sleep(50);
click("[data-action='child#write']");
await sleep(50);
assert(text("[data-parent-target=output]") === "親が書きました", "「親に書く」を押すと親のpに「親が書きました」と表示されるはずです");
assert(text("[data-child-target=output]") === "子が書きました", "「子に書く」を押すと子のpに「子が書きました」と表示されるはずです");`
    },
    {
      id: 94,
      title: "同名コントローラの複数インスタンス（それぞれ独立）",
      explanation: `<p>第2章で「同じコントローラを複数の要素に付けられる」ことを学びました。ここでは、それぞれの要素に<strong>独立したインスタンス</strong>が作られ、状態も別々に管理されることを、valuesを使って確かめます。</p>
<pre><code>&lt;div data-controller="counter"&gt;...&lt;/div&gt;  ←インスタンスA
&lt;div data-controller="counter"&gt;...&lt;/div&gt;  ←インスタンスB</code></pre>
<p>counterコントローラは<code>static values = { count: Number }</code>を持ちます。第6章で学んだとおり、valueの実体は<strong>その要素自身の</strong><code>data-counter-count-value</code>属性です。つまり、</p>
<ul>
  <li>インスタンスAのcountValueは、Aのdivの属性に保存される</li>
  <li>インスタンスBのcountValueは、Bのdivの属性に保存される</li>
</ul>
<p>となり、状態の置き場所そのものが分かれています。片方のボタンを何回押しても、もう片方のカウントには一切影響しません。</p>
<p>ターゲットも同様です。各インスタンスのターゲット検索は自分のスコープ（自分のdivの内側）に限られるので、インスタンスAの<code>this.outputTarget</code>がBのspanを拾うことはありません。</p>
<p>この「1つのクラス定義から、要素ごとに独立したインスタンスが生まれる」仕組みが、Stimulusの再利用性の核心です。一覧ページに商品カードが100枚あっても、コントローラは1回registerするだけで、100個の独立したカウンタやトグルが動きます。</p>`,
      task: `2つ目のdivにもdata-controller="counter"を付けてください。1つ目を2回、2つ目を1回押したとき、表示がそれぞれ「2」と「1」になれば成功です。`,
      code: `<div class="box" data-controller="counter">
  <button data-action="counter#up">＋</button>
  <span data-counter-target="output">0</span>
</div>

<!-- TODO: このdivにも data-controller="counter" を付ける -->
<div class="box">
  <button data-action="counter#up">＋</button>
  <span data-counter-target="output">0</span>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("counter", class extends Controller {
  static targets = ["output"];
  static values = { count: Number };

  up() {
    this.countValue = this.countValue + 1;
    this.outputTarget.textContent = String(this.countValue);
  }
});
<\/script>`,
      solution: `<div class="box" data-controller="counter">
  <button data-action="counter#up">＋</button>
  <span data-counter-target="output">0</span>
</div>

<div class="box" data-controller="counter">
  <button data-action="counter#up">＋</button>
  <span data-counter-target="output">0</span>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("counter", class extends Controller {
  static targets = ["output"];
  static values = { count: Number };

  up() {
    this.countValue = this.countValue + 1;
    this.outputTarget.textContent = String(this.countValue);
  }
});
<\/script>`,
      hints: [
        `1つ目のdivと同じように、2つ目のdivにdata-controller="counter"を追加するだけです`,
        `countValueは各divのdata-counter-count-value属性に保存されるので、2つのカウントは混ざりません`
      ],
      check: `await sleep(100);
const buttons = $$("[data-action='counter#up']");
assert(buttons.length === 2, "＋ボタンが2つあるはずです");
buttons[0].click();
await sleep(50);
buttons[0].click();
await sleep(50);
buttons[1].click();
await sleep(50);
const outputs = $$("[data-counter-target=output]");
assert(outputs[0].textContent.trim() === "2", "1つ目のカウンタは2回押したので「2」になるはずです");
assert(outputs[1].textContent.trim() === "1", "2つ目のdivにもdata-controller=\\"counter\\"を付けると独立したインスタンスが作られ、1回押した表示は「1」になるはずです");`
    },
    {
      id: 95,
      title: "コントローラの分割基準（単一責任）",
      explanation: `<p>複数コントローラを組み合わせられるようになると、次の疑問が生まれます。「どこでコントローラを分ければいいのか？」。指針になるのが<strong>単一責任の原則</strong>（1つの部品は1つの仕事だけを受け持つ）です。</p>
<p>たとえば「あいさつもカウントもできるpageコントローラ」を1つ作ると、最初は楽に見えます。しかし、</p>
<ul>
  <li>カウント機能だけを別のページで使い回せない</li>
  <li>あいさつの修正がカウントを壊していないか、毎回気にする必要がある</li>
  <li>メソッドとターゲットが増え続けて見通しが悪くなる</li>
</ul>
<p>という問題が育っていきます。分割の目安を表にまとめます。</p>
<table>
  <tr><th>観点</th><th>質問</th><th>答えがYesなら</th></tr>
  <tr><td>再利用</td><td>この機能は他の場所でも単独で使いたい？</td><td>分ける</td></tr>
  <tr><td>説明</td><td>コントローラの説明に「〜と〜」が入る？</td><td>分ける</td></tr>
  <tr><td>連動</td><td>2つの機能は常に一体で、片方だけでは意味がない？</td><td>1つでよい</td></tr>
</table>
<p>分けた後の組み合わせ方は、ステップ91で学んだ<code>data-controller="greeting counter"</code>です。HTML側で自由に合成できるので、分けることのコストはほとんどありません。</p>
<p>今回はgreetingコントローラだけが登録済みのコードに、<strong>カウント担当のcounterコントローラを自分でregister</strong>して、責任が分かれた形を完成させます。書き方はこれまでの章で何度も見てきた形そのものです。</p>`,
      task: `TODOの位置にcounterコントローラをregisterしてください。static targets = ["output"]、static values = { count: Number }を持ち、up()でcountValueを1増やしてoutputターゲットに表示します。`,
      code: `<div data-controller="greeting counter">
  <button data-action="greeting#hello">あいさつ</button>
  <button data-action="counter#up">カウント</button>
  <p data-greeting-target="output"></p>
  <p>カウント：<span data-counter-target="output">0</span></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

// あいさつ担当：あいさつのことしか知らない
application.register("greeting", class extends Controller {
  static targets = ["output"];
  hello() {
    this.outputTarget.textContent = "こんにちは！";
  }
});

// TODO: カウント担当のcounterコントローラをregisterする
// ・static targets = ["output"]
// ・static values = { count: Number }
// ・up()でcountValueを1増やし、outputTargetにString(this.countValue)を表示
<\/script>`,
      solution: `<div data-controller="greeting counter">
  <button data-action="greeting#hello">あいさつ</button>
  <button data-action="counter#up">カウント</button>
  <p data-greeting-target="output"></p>
  <p>カウント：<span data-counter-target="output">0</span></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

// あいさつ担当：あいさつのことしか知らない
application.register("greeting", class extends Controller {
  static targets = ["output"];
  hello() {
    this.outputTarget.textContent = "こんにちは！";
  }
});

// カウント担当：カウントのことしか知らない
application.register("counter", class extends Controller {
  static targets = ["output"];
  static values = { count: Number };
  up() {
    this.countValue = this.countValue + 1;
    this.outputTarget.textContent = String(this.countValue);
  }
});
<\/script>`,
      hints: [
        `application.register("counter", class extends Controller { ... }); の形は greeting と同じです`,
        `up()の中身は this.countValue = this.countValue + 1; と this.outputTarget.textContent = String(this.countValue); の2行です`
      ],
      check: `await sleep(100);
click("[data-action='greeting#hello']");
await sleep(50);
assert(text("[data-greeting-target=output]") === "こんにちは！", "「あいさつ」を押すと「こんにちは！」と表示されるはずです");
click("[data-action='counter#up']");
await sleep(50);
click("[data-action='counter#up']");
await sleep(50);
assert(text("[data-counter-target=output]") === "2", "counterコントローラを登録すると、「カウント」を2回押した表示が「2」になるはずです");`
    },
    {
      id: 96,
      title: "汎用コントローラ＋values（再利用）",
      explanation: `<p>コントローラを小さく分けたら、次は<strong>汎用化</strong>です。コードの中に固有の文言や数値を書き込まず、<strong>valuesでHTML側から設定できる</strong>ようにすると、1つのコントローラをさまざまな場面で使い回せます。</p>
<p>今回の題材は、ボタンを押すとメッセージを表示するnoticeコントローラです。悪い例と良い例を比べてみましょう。</p>
<pre><code>// 悪い例：文言がコードに焼き付いていて使い回せない
show() {
  this.outputTarget.textContent = "保存しました";
}

// 良い例：文言はHTML側の設定から読む
static values = { message: String };
show() {
  this.outputTarget.textContent = this.messageValue;
}</code></pre>
<p>良い例なら、HTML側の属性を変えるだけで同じコントローラが別のメッセージを表示できます。</p>
<pre><code>&lt;div data-controller="notice" data-notice-message-value="保存しました"&gt;
&lt;div data-controller="notice" data-notice-message-value="削除しました"&gt;</code></pre>
<p>ポイントを整理します。</p>
<ul>
  <li>コントローラは「メッセージを表示する」という<strong>仕組み</strong>だけを持つ</li>
  <li>「何を表示するか」という<strong>データ</strong>はHTML側のvalue属性が持つ</li>
  <li>ステップ94で学んだとおり各インスタンスは独立なので、設定もインスタンスごとに別々</li>
</ul>
<p>この「仕組みはJS、設定はHTML」という分担は、第18章で学ぶ設計パターンの土台になる重要な考え方です。初期コードは2つ目のnoticeに設定属性がなく、押しても空文字が表示されるだけです。属性を追加して完成させましょう。</p>`,
      task: `2つ目のnoticeのdivにdata-notice-message-value="削除しました"を追加して、同じコントローラが場所ごとに違うメッセージを表示できるようにしてください。`,
      code: `<div data-controller="notice" data-notice-message-value="保存しました">
  <button data-action="notice#show">保存</button>
  <p data-notice-target="output"></p>
</div>

<!-- TODO: このdivに data-notice-message-value="削除しました" を追加する -->
<div data-controller="notice">
  <button data-action="notice#show">削除</button>
  <p data-notice-target="output"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("notice", class extends Controller {
  static targets = ["output"];
  static values = { message: String };

  show() {
    this.outputTarget.textContent = this.messageValue;
  }
});
<\/script>`,
      solution: `<div data-controller="notice" data-notice-message-value="保存しました">
  <button data-action="notice#show">保存</button>
  <p data-notice-target="output"></p>
</div>

<div data-controller="notice" data-notice-message-value="削除しました">
  <button data-action="notice#show">削除</button>
  <p data-notice-target="output"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("notice", class extends Controller {
  static targets = ["output"];
  static values = { message: String };

  show() {
    this.outputTarget.textContent = this.messageValue;
  }
});
<\/script>`,
      hints: [
        `value属性の形は data-コントローラ名-バリュー名-value="値" です。1つ目のdivの書き方を参考にしましょう`,
        `コントローラのコードは1文字も変えずに、HTMLの設定だけで表示内容を変えられるのが汎用化の効果です`
      ],
      check: `await sleep(100);
const buttons = $$("[data-action='notice#show']");
assert(buttons.length === 2, "ボタンが2つあるはずです");
buttons[0].click();
await sleep(50);
buttons[1].click();
await sleep(50);
const outputs = $$("[data-notice-target=output]");
assert(outputs[0].textContent.trim() === "保存しました", "1つ目は「保存しました」と表示されるはずです");
assert(outputs[1].textContent.trim() === "削除しました", "2つ目のdivにdata-notice-message-value=\\"削除しました\\"を追加すると、「削除しました」と表示されるはずです");`
    },
    {
      id: 97,
      title: "コントローラの合成（toggleとcounterを組み合わせ）",
      explanation: `<p>小さなコントローラを組み合わせる<strong>合成</strong>の実践です。今回は「詳細の開閉（toggle）」と「開閉回数の記録（counter）」を、同じボタンの1クリックで同時に動かします。</p>
<p>使う道具はすでに全部学んでいます。</p>
<ul>
  <li>1要素に複数コントローラ：<code>data-controller="toggle counter"</code>（ステップ91）</li>
  <li>1要素に複数アクション：<code>data-action</code>にスペース区切りで複数書く（第3章ステップ29）</li>
</ul>
<pre><code>&lt;div data-controller="toggle counter"&gt;
  &lt;button data-action="toggle#flip counter#up"&gt;詳細を開閉&lt;/button&gt;
  ...
&lt;/div&gt;</code></pre>
<p>こう書くと、1回のクリックで<code>toggle#flip</code>と<code>counter#up</code>が<strong>書いた順に両方</strong>呼ばれます。重要なのは、toggleとcounterがお互いを知らないまま協調している点です。</p>
<table>
  <tr><th>コントローラ</th><th>責任</th><th>知らないこと</th></tr>
  <tr><td>toggle</td><td>panelターゲットのhiddenクラスを切り替える</td><td>回数が数えられていること</td></tr>
  <tr><td>counter</td><td>クリック回数を数えて表示する</td><td>何かが開閉されていること</td></tr>
</table>
<p>「開閉のたびに回数を増やす」という結び付きは、JavaScriptのコードではなく<strong>HTMLのdata-action属性</strong>が表現しています。仕様変更で「回数はもう要らない」となったら、HTMLからcounter#upを消すだけです。コードの修正もテストのやり直しも要りません。これが合成の威力です。</p>`,
      task: `ボタンのdata-actionにcounter#upをスペース区切りで追加して、1クリックで開閉とカウントの両方が動くようにしてください。`,
      code: `<style>
  .hidden { display: none; }
</style>

<div data-controller="toggle counter">
  <!-- TODO: data-actionに counter#up もスペース区切りで追加する -->
  <button data-action="toggle#flip">詳細を開閉</button>
  <p data-toggle-target="panel" class="hidden">ここが詳細内容です</p>
  <p>開閉回数：<span data-counter-target="output">0</span></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("toggle", class extends Controller {
  static targets = ["panel"];
  flip() {
    this.panelTarget.classList.toggle("hidden");
  }
});

application.register("counter", class extends Controller {
  static targets = ["output"];
  static values = { count: Number };
  up() {
    this.countValue = this.countValue + 1;
    this.outputTarget.textContent = String(this.countValue);
  }
});
<\/script>`,
      solution: `<style>
  .hidden { display: none; }
</style>

<div data-controller="toggle counter">
  <button data-action="toggle#flip counter#up">詳細を開閉</button>
  <p data-toggle-target="panel" class="hidden">ここが詳細内容です</p>
  <p>開閉回数：<span data-counter-target="output">0</span></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("toggle", class extends Controller {
  static targets = ["panel"];
  flip() {
    this.panelTarget.classList.toggle("hidden");
  }
});

application.register("counter", class extends Controller {
  static targets = ["output"];
  static values = { count: Number };
  up() {
    this.countValue = this.countValue + 1;
    this.outputTarget.textContent = String(this.countValue);
  }
});
<\/script>`,
      hints: [
        `data-action="toggle#flip counter#up" のようにスペースで区切って2つ書きます`,
        `2つのコントローラはお互いを知りません。結び付けているのはHTMLのdata-action属性だけです`
      ],
      check: `await sleep(100);
click("button");
await sleep(50);
assert(!$("[data-toggle-target=panel]").classList.contains("hidden"), "1回押すと詳細が表示される（hiddenが外れる）はずです");
assert(text("[data-counter-target=output]") === "1", "data-actionにcounter#upも書くと、同じクリックで開閉回数が「1」になるはずです");
click("button");
await sleep(50);
assert($("[data-toggle-target=panel]").classList.contains("hidden"), "もう1回押すと詳細が隠れるはずです");
assert(text("[data-counter-target=output]") === "2", "開閉回数は「2」になるはずです");`
    },
    {
      id: 98,
      title: "getControllerForElementAndIdentifier（概要）",
      explanation: `<p>Stimulusの外側にあるコードから、動いているコントローラの<strong>インスタンスを直接取得</strong>したいことがあります。そのための公式APIが<code>application.getControllerForElementAndIdentifier(element, identifier)</code>です。</p>
<pre><code>const element = document.getElementById("box");
const controller =
  application.getControllerForElementAndIdentifier(element, "counter");
controller.up();  // コントローラのメソッドを直接呼べる</code></pre>
<p>引数と戻り値を整理します。</p>
<table>
  <tr><th>引数・戻り値</th><th>内容</th></tr>
  <tr><td>第1引数 element</td><td>data-controllerが付いている要素そのもの</td></tr>
  <tr><td>第2引数 identifier</td><td>コントローラ名の文字列（例："counter"）</td></tr>
  <tr><td>戻り値</td><td>接続中のコントローラインスタンス。<strong>未接続ならnull</strong></td></tr>
</table>
<p>使いどころは、Stimulusで書かれていない既存のスクリプトや外部ライブラリとの連携、コンソールでのデバッグなどです。ただしこれは<strong>非常口のようなAPI</strong>だと考えてください。コントローラ同士の日常的な連携には、この後の章で学ぶイベントディスパッチ（第11章）やアウトレット（第12章）のほうが、結合がゆるく保てて適しています。</p>
<p>注意点として、接続が完了する前に呼ぶとnullが返ります。ページ読み込み直後のトップレベルで即座に呼ぶのではなく、クリック処理の中など、接続が済んだ後のタイミングで使うのが安全です。</p>`,
      task: `「外部のスクリプトから操作」ボタンのクリック処理で、getControllerForElementAndIdentifierを使ってcounterコントローラのインスタンスを取得し、up()を呼んでください。`,
      code: `<div id="box" data-controller="counter">
  <p>カウント：<span data-counter-target="output">0</span></p>
</div>
<button id="external">外部のスクリプトから操作</button>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("counter", class extends Controller {
  static targets = ["output"];
  static values = { count: Number };
  up() {
    this.countValue = this.countValue + 1;
    this.outputTarget.textContent = String(this.countValue);
  }
});

// Stimulusを使わない素のスクリプト
document.getElementById("external").addEventListener("click", function () {
  const element = document.getElementById("box");
  // TODO: application.getControllerForElementAndIdentifier(element, "counter")
  // でインスタンスを取得し、up()を呼ぶ
});
<\/script>`,
      solution: `<div id="box" data-controller="counter">
  <p>カウント：<span data-counter-target="output">0</span></p>
</div>
<button id="external">外部のスクリプトから操作</button>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("counter", class extends Controller {
  static targets = ["output"];
  static values = { count: Number };
  up() {
    this.countValue = this.countValue + 1;
    this.outputTarget.textContent = String(this.countValue);
  }
});

// Stimulusを使わない素のスクリプト
document.getElementById("external").addEventListener("click", function () {
  const element = document.getElementById("box");
  const controller = application.getControllerForElementAndIdentifier(element, "counter");
  controller.up();
});
<\/script>`,
      hints: [
        `const controller = application.getControllerForElementAndIdentifier(element, "counter"); のあと controller.up(); を呼びます`,
        `第2引数はコントローラ名の文字列です。要素が未接続の場合はnullが返る点にも注意しましょう`
      ],
      check: `await sleep(100);
assert(text("[data-counter-target=output]") === "0", "最初の表示は「0」のはずです");
click("#external");
await sleep(50);
click("#external");
await sleep(50);
assert(text("[data-counter-target=output]") === "2", "外部ボタンを2回押すと、取得したインスタンスのup()が2回呼ばれて表示が「2」になるはずです");`
    },
    {
      id: 99,
      title: "アプリ全体の構成例（application.jsの整理）",
      explanation: `<p>この学習環境では1つのscriptにすべて書いていますが、実際のアプリではコントローラを<strong>1ファイル1コントローラ</strong>に分けるのが標準です。Railsなどでよく使われる構成を見てみましょう。</p>
<pre><code>app/javascript/
├── application.js               ←起動と登録だけを行う
└── controllers/
    ├── greeting_controller.js   ←GreetingControllerをexport
    └── counter_controller.js    ←CounterControllerをexport</code></pre>
<p>各コントローラファイルはクラスを定義してexportするだけ、application.jsは起動と登録に専念します。</p>
<pre><code>// application.js のイメージ
import { Application } from "@hotwired/stimulus";
import GreetingController from "./controllers/greeting_controller";
import CounterController from "./controllers/counter_controller";

const application = Application.start();
application.register("greeting", GreetingController);
application.register("counter", CounterController);</code></pre>
<p>ファイル名と識別子には対応規約があります。<code>greeting_controller.js</code>→<code>greeting</code>、<code>my_counter_controller.js</code>→<code>my-counter</code>（スネークケース→ケバブケース）です。stimulus-railsの自動読み込みを使うと、この規約に沿って登録まで自動化できます。</p>
<p>今回はこの構成を1ファイル内で再現します。クラス定義（コントローラファイルに相当）と、最後の起動・登録部分（application.jsに相当）を分けて書いてあるので、TODOのregisterを1行追加して完成させてください。<strong>登録が1か所に集まっていると、アプリにどんなコントローラがあるか一覧できる</strong>のが、この構成の利点です。</p>`,
      task: `application.jsに相当する最後のブロックで、"counter"という識別子でCounterControllerを登録してください。`,
      code: `<div data-controller="greeting">
  <button data-action="greeting#hello">あいさつ</button>
  <p data-greeting-target="output"></p>
</div>
<div data-controller="counter">
  <button data-action="counter#up">カウント</button>
  <span data-counter-target="output">0</span>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

// 実際のアプリでは controllers/greeting_controller.js の中身
class GreetingController extends Controller {
  static targets = ["output"];
  hello() {
    this.outputTarget.textContent = "こんにちは！";
  }
}

// 実際のアプリでは controllers/counter_controller.js の中身
class CounterController extends Controller {
  static targets = ["output"];
  static values = { count: Number };
  up() {
    this.countValue = this.countValue + 1;
    this.outputTarget.textContent = String(this.countValue);
  }
}

// 実際のアプリでは application.js：起動と登録を1か所に集める
const application = Application.start();
application.register("greeting", GreetingController);
// TODO: "counter"という識別子でCounterControllerを登録する
<\/script>`,
      solution: `<div data-controller="greeting">
  <button data-action="greeting#hello">あいさつ</button>
  <p data-greeting-target="output"></p>
</div>
<div data-controller="counter">
  <button data-action="counter#up">カウント</button>
  <span data-counter-target="output">0</span>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

// 実際のアプリでは controllers/greeting_controller.js の中身
class GreetingController extends Controller {
  static targets = ["output"];
  hello() {
    this.outputTarget.textContent = "こんにちは！";
  }
}

// 実際のアプリでは controllers/counter_controller.js の中身
class CounterController extends Controller {
  static targets = ["output"];
  static values = { count: Number };
  up() {
    this.countValue = this.countValue + 1;
    this.outputTarget.textContent = String(this.countValue);
  }
}

// 実際のアプリでは application.js：起動と登録を1か所に集める
const application = Application.start();
application.register("greeting", GreetingController);
application.register("counter", CounterController);
<\/script>`,
      hints: [
        `application.register("counter", CounterController); の1行を追加します`,
        `これまでのようにregisterの中でclassを書く代わりに、名前を付けたクラスを渡しています。中身は同じことです`
      ],
      check: `await sleep(100);
click("[data-action='greeting#hello']");
await sleep(50);
assert(text("[data-greeting-target=output]") === "こんにちは！", "greetingは登録済みなので「こんにちは！」と表示されるはずです");
click("[data-action='counter#up']");
await sleep(50);
assert(text("[data-counter-target=output]") === "1", "CounterControllerを\\"counter\\"として登録すると、「カウント」を押した表示が「1」になるはずです");`
    },
    {
      id: 100,
      title: "総合演習：タブ＋カウンタの合成UI",
      explanation: `<p>第10章の総合演習です。タブ切り替えUIの各パネルの中に、独立した「いいね」カウンタを配置します。この章で学んだ合成の技術を総動員しましょう。</p>
<h4>構成</h4>
<ul>
  <li><strong>tabsコントローラ</strong>：親。タブボタンで、どのパネルを表示するか切り替える</li>
  <li><strong>counterコントローラ</strong>：子。各パネルに1つずつネストし、それぞれ独立に数える（ステップ92・94）</li>
</ul>
<h4>tabs#showの実装</h4>
<p>どのタブが押されたかは、第5章で学んだアクションパラメータで受け取ります。<code>data-tabs-index-param="0"</code>のように書いておくと、<code>event.params.index</code>で数値として取り出せます。あとはpanelターゲット全体をforEachで回し、番号が一致するパネルだけhiddenクラスを外します。</p>
<pre><code>show(event) {
  const index = event.params.index;
  this.panelTargets.forEach(function (panel, i) {
    if (i === index) {
      panel.classList.remove("hidden");
    } else {
      panel.classList.add("hidden");
    }
  });
}</code></pre>
<p>forEachのコールバックの第2引数<code>i</code>が要素の番号（0始まり）である点は、第4章で学んだとおりです。</p>
<h4>チェックポイント</h4>
<ul>
  <li>タブを切り替えても、各パネルのカウントは保持される（インスタンスの独立性）</li>
  <li>tabsとcounterはお互いを知らない。ネストしていても、ターゲット属性にコントローラ名が入っているので混線しない</li>
</ul>
<p>2つ目のパネルのカウンタにはdata-controllerがまだ付いていません。そこも忘れずに仕上げてください。</p>`,
      task: `tabs#showを実装し（パラメータのindexと一致するパネルだけ表示）、2つ目のパネルのカウンタのdivにdata-controller="counter"を付けてください。タブ切り替えと2つの独立したカウンタが動けば完成です。`,
      code: `<style>
  .hidden { display: none; }
</style>

<div data-controller="tabs">
  <button data-action="tabs#show" data-tabs-index-param="0">タブ1</button>
  <button data-action="tabs#show" data-tabs-index-param="1">タブ2</button>

  <div data-tabs-target="panel">
    <p>タブ1の内容</p>
    <div data-controller="counter">
      <button data-action="counter#up">いいね</button>
      <span data-counter-target="output">0</span>
    </div>
  </div>

  <div data-tabs-target="panel" class="hidden">
    <p>タブ2の内容</p>
    <!-- TODO: このdivに data-controller="counter" を付ける -->
    <div>
      <button data-action="counter#up">いいね</button>
      <span data-counter-target="output">0</span>
    </div>
  </div>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("tabs", class extends Controller {
  static targets = ["panel"];

  show(event) {
    const index = event.params.index;
    // TODO: panelTargetsをforEachで回し、番号iがindexと一致するパネルは
    // hiddenクラスを外し、それ以外のパネルにはhiddenクラスを付ける
  }
});

application.register("counter", class extends Controller {
  static targets = ["output"];
  static values = { count: Number };
  up() {
    this.countValue = this.countValue + 1;
    this.outputTarget.textContent = String(this.countValue);
  }
});
<\/script>`,
      solution: `<style>
  .hidden { display: none; }
</style>

<div data-controller="tabs">
  <button data-action="tabs#show" data-tabs-index-param="0">タブ1</button>
  <button data-action="tabs#show" data-tabs-index-param="1">タブ2</button>

  <div data-tabs-target="panel">
    <p>タブ1の内容</p>
    <div data-controller="counter">
      <button data-action="counter#up">いいね</button>
      <span data-counter-target="output">0</span>
    </div>
  </div>

  <div data-tabs-target="panel" class="hidden">
    <p>タブ2の内容</p>
    <div data-controller="counter">
      <button data-action="counter#up">いいね</button>
      <span data-counter-target="output">0</span>
    </div>
  </div>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("tabs", class extends Controller {
  static targets = ["panel"];

  show(event) {
    const index = event.params.index;
    this.panelTargets.forEach(function (panel, i) {
      if (i === index) {
        panel.classList.remove("hidden");
      } else {
        panel.classList.add("hidden");
      }
    });
  }
});

application.register("counter", class extends Controller {
  static targets = ["output"];
  static values = { count: Number };
  up() {
    this.countValue = this.countValue + 1;
    this.outputTarget.textContent = String(this.countValue);
  }
});
<\/script>`,
      hints: [
        `forEachのコールバックは function (panel, i) { ... } の形で、iが0始まりの番号です。iとindexを===で比べます`,
        `data-tabs-index-param="1" はevent.params.indexで数値1として受け取れます（第5章のアクションパラメータ）`
      ],
      check: `await sleep(100);
const panels = $$("[data-tabs-target=panel]");
assert(panels.length === 2, "パネルが2つ必要です");
const likeButtons = $$("[data-action='counter#up']");
assert(likeButtons.length === 2, "「いいね」ボタンが2つあるはずです");
likeButtons[0].click();
await sleep(50);
likeButtons[0].click();
await sleep(50);
const outputs = $$("[data-counter-target=output]");
assert(outputs[0].textContent.trim() === "2", "タブ1の「いいね」を2回押すと「2」になるはずです");
const tabButtons = $$("[data-action='tabs#show']");
tabButtons[1].click();
await sleep(50);
assert(!panels[1].classList.contains("hidden"), "「タブ2」を押すとタブ2のパネルが表示される（hiddenが外れる）はずです。show()を実装しましたか？");
assert(panels[0].classList.contains("hidden"), "「タブ2」を押すとタブ1のパネルは隠れるはずです");
likeButtons[1].click();
await sleep(50);
assert(outputs[1].textContent.trim() === "1", "タブ2のカウンタにもdata-controller=\\"counter\\"を付けると、独立して「1」になるはずです");
assert(outputs[0].textContent.trim() === "2", "タブ1のカウンタは「2」のまま、互いに影響しないはずです");
tabButtons[0].click();
await sleep(50);
assert(!panels[0].classList.contains("hidden"), "「タブ1」に戻るとタブ1のパネルが再び表示されるはずです");
assert(outputs[0].textContent.trim() === "2", "タブを切り替えてもカウントは保持されているはずです");`
    }
  ]
});
