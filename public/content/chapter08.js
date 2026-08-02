// 第8章：CSSクラス
registerChapter({
  number: 8,
  title: "CSSクラス",
  description: "static classesを使ってCSSクラス名をHTML側から注入する方法を学び、見た目の定義をJavaScriptから切り離す設計を身につけます。",
  steps: [
    {
      id: 71,
      title: "static classesとdata-x-xxx-class",
      explanation: `<p>第1章で学んだ<code>classList</code>を使えば、JSからCSSクラスを付け外しして見た目を変えられます。しかしクラス名をJSに直接書くと、デザイン変更のたびにJSを修正することになります。Stimulusには、<strong>CSSクラス名をHTML側から渡す仕組み</strong>が用意されています。それが<strong>CSSクラス（classes）</strong>です。</p>
<p>使い方はtargetsやvaluesとよく似ています。</p>
<pre><code>// JS側：クラスの「論理名」を宣言する
static classes = ["highlight"];</code></pre>
<pre><code>&lt;!-- HTML側：実際のクラス名を属性で渡す --&gt;
&lt;div data-controller="box" data-box-highlight-class="marker"&gt;</code></pre>
<p>属性名の規則は<code>data-[コントローラ名]-[論理名]-class</code>です（最後は単数形の-class）。こうしておくと、JSでは<code>this.highlightClass</code>で「marker」という文字列が取れます。</p>
<pre><code>highlight() {
  this.element.classList.add(this.highlightClass); // "marker"が追加される
}</code></pre>
<table>
<tr><th>仕組み</th><th>宣言</th><th>HTML属性</th></tr>
<tr><td>targets</td><td>static targets = ["output"]</td><td>data-box-target="output"</td></tr>
<tr><td>values</td><td>static values = { count: Number }</td><td>data-box-count-value="0"</td></tr>
<tr><td>classes</td><td>static classes = ["highlight"]</td><td>data-box-highlight-class="marker"</td></tr>
</table>
<p>初期コードはJS側が完成していますが、HTML側に属性がないため動きません。div要素に属性を追加してください。</p>`,
      task: `data-controller="box"のdiv要素にdata-box-highlight-class="marker"属性を追加して、ボタンでハイライトが効くようにしてください。`,
      code: `<style>
  .marker { background: yellow; }
</style>

<!-- TODO: このdivにdata-box-highlight-class="marker"を追加する -->
<div data-controller="box">
  <button data-action="box#highlight">ハイライト</button>
  <p>この部分が黄色くなります</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("box", class extends Controller {
  static classes = ["highlight"];

  highlight() {
    this.element.classList.add(this.highlightClass);
  }
});
<\/script>`,
      solution: `<style>
  .marker { background: yellow; }
</style>

<div data-controller="box" data-box-highlight-class="marker">
  <button data-action="box#highlight">ハイライト</button>
  <p>この部分が黄色くなります</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("box", class extends Controller {
  static classes = ["highlight"];

  highlight() {
    this.element.classList.add(this.highlightClass);
  }
});
<\/script>`,
      hints: [
        `属性名はdata-[コントローラ名]-[論理名]-classです。コントローラ名はbox、論理名はhighlightです`,
        `属性の値には実際のCSSクラス名（marker）を書きます`
      ],
      check: `const box = $("[data-controller=box]");
assert(box, "data-controllerがboxの要素が必要です");
assert(box.getAttribute("data-box-highlight-class") === "marker", "divにdata-box-highlight-class=marker属性を追加してください");
click("button");
await sleep(50);
assert(box.classList.contains("marker"), "ボタンを押すと、属性で指定したmarkerクラスが要素に追加されるはずです");`
    },
    {
      id: 72,
      title: "this.xxxClassでクラス名を参照",
      explanation: `<p><code>static classes = ["color"]</code>と宣言すると、<code>this.colorClass</code>というプロパティが使えるようになります。この値は<strong>HTML属性に書かれた実際のクラス名の文字列</strong>です。</p>
<p>ここで大事なのは、<strong>論理名と実際のクラス名は別物</strong>だという点です。</p>
<table>
<tr><th></th><th>名前</th><th>決める場所</th></tr>
<tr><td>論理名</td><td>color（「色を変えるためのクラス」という役割名）</td><td>JS側</td></tr>
<tr><td>実際のクラス名</td><td>blue-textなど（CSSに存在する名前）</td><td>HTML側</td></tr>
</table>
<p>JSは「colorという役割のクラスを付ける」とだけ書き、それが具体的にどのクラスなのかはHTMLが決めます。この分離により、<strong>JSを一切変更せずに</strong>HTML属性の書き換えだけで見た目を変えられます。</p>
<pre><code>apply() {
  // ×：クラス名のハードコード。CSSの都合でJS修正が必要になる
  this.element.classList.add("red-text");

  // ○：HTMLに書かれたクラス名を参照する
  this.element.classList.add(this.colorClass);
}</code></pre>
<p>初期コードは存在しないクラス名「red-text」をハードコード（コードに直接書き込むこと）しているため、色が変わりません。<code>this.colorClass</code>を使って、HTMLが指定する「blue-text」が付くように直してください。</p>`,
      task: `applyメソッドのハードコードされた"red-text"をthis.colorClassに書き換えて、HTML属性で指定されたblue-textクラスが追加されるようにしてください。`,
      code: `<style>
  .blue-text { color: blue; font-weight: bold; }
</style>

<div data-controller="note" data-note-color-class="blue-text">
  <button data-action="note#apply">色を付ける</button>
  <p>この文章の色が変わります</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("note", class extends Controller {
  static classes = ["color"];

  apply() {
    // TODO: ハードコードをやめてthis.colorClassを使う
    this.element.classList.add("red-text");
  }
});
<\/script>`,
      solution: `<style>
  .blue-text { color: blue; font-weight: bold; }
</style>

<div data-controller="note" data-note-color-class="blue-text">
  <button data-action="note#apply">色を付ける</button>
  <p>この文章の色が変わります</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("note", class extends Controller {
  static classes = ["color"];

  apply() {
    this.element.classList.add(this.colorClass);
  }
});
<\/script>`,
      hints: [
        `論理名がcolorなので、プロパティ名はthis.colorClassです`,
        `this.colorClassの中身はHTML属性の値、つまり文字列"blue-text"です`
      ],
      check: `click("button");
await sleep(50);
const el = $("[data-controller=note]");
assert(el.classList.contains("blue-text"), "HTML側で指定したblue-textクラスが追加されるはずです（this.colorClassを使いましょう）");
assert(!el.classList.contains("red-text"), "クラス名red-textをハードコードせず、this.colorClassで参照してください");`
    },
    {
      id: 73,
      title: "classList.add/removeとの組み合わせ",
      explanation: `<p><code>this.xxxClass</code>はただの文字列なので、第1章で学んだ<code>classList</code>のメソッドすべてと組み合わせられます。</p>
<pre><code>this.element.classList.add(this.onClass);    // 付ける
this.element.classList.remove(this.onClass); // 外す
this.element.classList.toggle(this.onClass); // あれば外し、なければ付ける</code></pre>
<p>今回はランプのUIを作ります。「点灯」ボタンでlitクラスを付け、「消灯」ボタンで外します。論理名は<code>on</code>（点灯用のクラスという役割）、実際のクラス名はHTML属性で<code>lit</code>と指定しています。</p>
<pre><code>&lt;div data-controller="lamp" data-lamp-on-class="lit"&gt;
  &lt;button id="on" data-action="lamp#turnOn"&gt;点灯&lt;/button&gt;
  &lt;button id="off" data-action="lamp#turnOff"&gt;消灯&lt;/button&gt;
&lt;/div&gt;</code></pre>
<p>付けるのも外すのも<strong>同じ<code>this.onClass</code></strong>を参照している点に注目してください。クラス名を2か所にハードコードしていると、片方だけ書き換えて「付くのに外れない」というバグが起きがちですが、参照を1つにしておけばその心配がありません。turnOffメソッドを完成させましょう。</p>`,
      task: `turnOffメソッドを実装して、「消灯」ボタンでlitクラスが外れるようにしてください。クラス名はthis.onClassで参照します。`,
      code: `<style>
  .lit { background: gold; }
</style>

<div data-controller="lamp" data-lamp-on-class="lit">
  <button id="on" data-action="lamp#turnOn">点灯</button>
  <button id="off" data-action="lamp#turnOff">消灯</button>
  <p>ランプ</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("lamp", class extends Controller {
  static classes = ["on"];

  turnOn() {
    this.element.classList.add(this.onClass);
  }

  turnOff() {
    // TODO: classList.removeとthis.onClassでクラスを外す
  }
});
<\/script>`,
      solution: `<style>
  .lit { background: gold; }
</style>

<div data-controller="lamp" data-lamp-on-class="lit">
  <button id="on" data-action="lamp#turnOn">点灯</button>
  <button id="off" data-action="lamp#turnOff">消灯</button>
  <p>ランプ</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("lamp", class extends Controller {
  static classes = ["on"];

  turnOn() {
    this.element.classList.add(this.onClass);
  }

  turnOff() {
    this.element.classList.remove(this.onClass);
  }
});
<\/script>`,
      hints: [
        `turnOnと対になる形で、addをremoveに変えるだけです`,
        `this.element.classList.remove(this.onClass); と書きます`
      ],
      check: `click("#on");
await sleep(50);
assert($("[data-controller=lamp]").classList.contains("lit"), "「点灯」を押すとlitクラスが追加されるはずです");
click("#off");
await sleep(50);
assert(!$("[data-controller=lamp]").classList.contains("lit"), "「消灯」を押すとlitクラスが外れるはずです（classList.removeとthis.onClassを使いましょう）");`
    },
    {
      id: 74,
      title: "hasXxxClass（存在チェック）",
      explanation: `<p>HTML側に<code>data-x-xxx-class</code>属性が書かれていない状態で<code>this.xxxClass</code>にアクセスすると、Stimulusは<strong>エラーを投げます</strong>。「クラスが必要なのに指定されていない」ことを早く気づかせるための仕様ですが、属性が任意（あってもなくてもよい）の場合には困ります。</p>
<p>そこで使うのが<code>this.hasXxxClass</code>です。targetsの<code>hasXxxTarget</code>（第4章）、valuesの<code>hasXxxValue</code>（第6章）と同じ発想で、<strong>属性が存在すればtrue、なければfalse</strong>を返します。こちらはアクセスしてもエラーになりません。</p>
<pre><code>toggle() {
  if (this.hasOpenClass) {
    this.element.classList.toggle(this.openClass);
  } else {
    // 属性が無い場合の代替処理
    this.outputTarget.textContent = "openクラスが設定されていません";
  }
}</code></pre>
<table>
<tr><th>プロパティ</th><th>属性あり</th><th>属性なし</th></tr>
<tr><td>this.openClass</td><td>クラス名の文字列</td><td><strong>エラー</strong></td></tr>
<tr><td>this.hasOpenClass</td><td>true</td><td>false</td></tr>
</table>
<p>初期コードのHTMLには、わざと<code>data-panel-open-class</code>属性がありません。そのままボタンを押すとエラーになります（コンソール欄で確認できます）。hasOpenClassでガードして、属性が無いときはメッセージを表示するように直してください。</p>`,
      task: `toggleメソッドをhasOpenClassでガードし、属性が無い場合はエラーではなく「openクラスが設定されていません」とoutputTargetに表示するようにしてください。`,
      code: `<!-- このdivにはわざとdata-panel-open-class属性がありません -->
<div data-controller="panel">
  <button data-action="panel#toggle">開閉</button>
  <p data-panel-target="output"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("panel", class extends Controller {
  static targets = ["output"];
  static classes = ["open"];

  toggle() {
    // TODO: this.hasOpenClassがtrueのときだけclassList.toggleを行い、
    //       falseのときはoutputTargetに「openクラスが設定されていません」と表示する
    this.element.classList.toggle(this.openClass);
  }
});
<\/script>`,
      solution: `<!-- このdivにはわざとdata-panel-open-class属性がありません -->
<div data-controller="panel">
  <button data-action="panel#toggle">開閉</button>
  <p data-panel-target="output"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("panel", class extends Controller {
  static targets = ["output"];
  static classes = ["open"];

  toggle() {
    if (this.hasOpenClass) {
      this.element.classList.toggle(this.openClass);
    } else {
      this.outputTarget.textContent = "openクラスが設定されていません";
    }
  }
});
<\/script>`,
      hints: [
        `if (this.hasOpenClass) { ... } else { ... } の形にします`,
        `hasOpenClassは属性が無くてもエラーにならず、falseを返します`
      ],
      check: `click("button");
await sleep(50);
assert(text("[data-panel-target=output]") === "openクラスが設定されていません", "属性が無いので、hasOpenClassでガードして「openクラスが設定されていません」と表示するはずです（ガードが無いとエラーになります）");`
    },
    {
      id: 75,
      title: "デフォルトクラスとフォールバック",
      explanation: `<p>hasXxxClassの代表的な使い道が<strong>フォールバック</strong>（本来のものが使えないときの代替）です。「HTMLでクラスが指定されていればそれを使い、なければデフォルトのクラスを使う」というパターンで、次の1行が定番です。</p>
<pre><code>const cls = this.hasThemeClass ? this.themeClass : "simple";
this.element.classList.add(cls);</code></pre>
<p><code>条件 ? A : B</code>は三項演算子といい、条件がtrueならA、falseならBを返します。if文より短く「どちらかの値を選ぶ」処理が書けます。</p>
<p>このパターンの利点は、コントローラの使い勝手が上がることです。</p>
<ul>
<li>こだわりたい場所では属性でクラスを指定してカスタマイズできる</li>
<li>指定を省略した場所でもデフォルトの見た目でちゃんと動く</li>
</ul>
<p>今回は同じcardコントローラを2つの要素に付けています（第2章で学んだとおり、それぞれ独立したインスタンスになります）。card1には<code>data-card-theme-class="fancy"</code>があり、card2には属性がありません。card1はfancy、card2はデフォルトのsimpleで飾られるように、decorateメソッドにフォールバックを実装してください。</p>`,
      task: `decorateメソッドを修正し、hasThemeClassがtrueならthemeClassを、falseならデフォルトの"simple"を追加するようにしてください。`,
      code: `<style>
  .fancy { border: 3px double purple; padding: 8px; }
  .simple { border: 1px dashed gray; padding: 8px; }
</style>

<div id="card1" data-controller="card" data-card-theme-class="fancy">
  <button data-action="card#decorate">飾る</button>
  <span>カード1（fancy指定あり）</span>
</div>

<div id="card2" data-controller="card">
  <button data-action="card#decorate">飾る</button>
  <span>カード2（指定なし）</span>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("card", class extends Controller {
  static classes = ["theme"];

  decorate() {
    // TODO: hasThemeClassで分岐し、属性が無ければ"simple"を使う
    this.element.classList.add(this.themeClass);
  }
});
<\/script>`,
      solution: `<style>
  .fancy { border: 3px double purple; padding: 8px; }
  .simple { border: 1px dashed gray; padding: 8px; }
</style>

<div id="card1" data-controller="card" data-card-theme-class="fancy">
  <button data-action="card#decorate">飾る</button>
  <span>カード1（fancy指定あり）</span>
</div>

<div id="card2" data-controller="card">
  <button data-action="card#decorate">飾る</button>
  <span>カード2（指定なし）</span>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("card", class extends Controller {
  static classes = ["theme"];

  decorate() {
    const cls = this.hasThemeClass ? this.themeClass : "simple";
    this.element.classList.add(cls);
  }
});
<\/script>`,
      hints: [
        `三項演算子を使うと const cls = this.hasThemeClass ? this.themeClass : "simple"; と1行で書けます`,
        `card2で属性なしのままthis.themeClassにアクセスするとエラーになるのがポイントです`
      ],
      check: `click("#card1 button");
await sleep(50);
click("#card2 button");
await sleep(50);
assert($("#card1").classList.contains("fancy"), "card1には属性で指定したfancyクラスが追加されるはずです");
assert($("#card2").classList.contains("simple"), "属性の無いcard2にはフォールバックのsimpleクラスが追加されるはずです（hasThemeClassで分岐しましょう）");`
    },
    {
      id: 76,
      title: "複数クラス（xxxClasses）",
      explanation: `<p>1つの論理名に<strong>複数のCSSクラス</strong>を割り当てたいこともあります。属性の値を<strong>空白区切り</strong>で書くと、複数形の<code>this.xxxClasses</code>で<strong>クラス名の配列</strong>として取り出せます。</p>
<pre><code>&lt;div data-controller="box" data-box-highlight-class="border-on shadow-on"&gt;</code></pre>
<pre><code>this.highlightClasses // ["border-on", "shadow-on"]
this.highlightClass   // "border-on"（単数形は最初の1つだけ）</code></pre>
<p>注意点は2つです。</p>
<ul>
<li>HTML属性名は複数でも<strong>単数形の-classのまま</strong>です（data-box-highlight-class）。JS側のプロパティ名だけが複数形になります</li>
<li>単数形の<code>this.highlightClass</code>は<strong>最初の1つしか返しません</strong>。全部使いたいときは必ず複数形を使います</li>
</ul>
<p>配列をclassListにまとめて渡すには<strong>スプレッド構文</strong><code>...</code>を使います。配列を展開して、要素を1つずつ引数として渡す書き方です。</p>
<pre><code>this.element.classList.add(...this.highlightClasses);
// classList.add("border-on", "shadow-on") と同じ意味</code></pre>
<p>初期コードは単数形を使っているため、border-onしか付きません。複数形とスプレッド構文で、2つのクラスが両方付くように直してください。</p>`,
      task: `decorateメソッドを複数形this.highlightClassesとスプレッド構文に書き換えて、border-onとshadow-onの両方が追加されるようにしてください。`,
      code: `<style>
  .border-on { border: 2px solid red; padding: 8px; }
  .shadow-on { box-shadow: 0 0 8px gray; }
</style>

<div data-controller="box" data-box-highlight-class="border-on shadow-on">
  <button data-action="box#decorate">強調する</button>
  <p>枠線と影の両方が付くはず</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("box", class extends Controller {
  static classes = ["highlight"];

  decorate() {
    // TODO: 単数形では最初の1つしか付かない。
    //       this.highlightClassesとスプレッド構文(...)で全部追加する
    this.element.classList.add(this.highlightClass);
  }
});
<\/script>`,
      solution: `<style>
  .border-on { border: 2px solid red; padding: 8px; }
  .shadow-on { box-shadow: 0 0 8px gray; }
</style>

<div data-controller="box" data-box-highlight-class="border-on shadow-on">
  <button data-action="box#decorate">強調する</button>
  <p>枠線と影の両方が付くはず</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("box", class extends Controller {
  static classes = ["highlight"];

  decorate() {
    this.element.classList.add(...this.highlightClasses);
  }
});
<\/script>`,
      hints: [
        `this.highlightClassesは["border-on", "shadow-on"]という配列です`,
        `classList.add(...配列)で配列の全要素をまとめて追加できます`
      ],
      check: `click("button");
await sleep(50);
const el = $("[data-controller=box]");
assert(el.classList.contains("border-on"), "1つ目のクラスborder-onが追加されるはずです");
assert(el.classList.contains("shadow-on"), "2つ目のクラスshadow-onも追加されるはずです（複数形this.highlightClassesとスプレッド構文を使いましょう）");`
    },
    {
      id: 77,
      title: "トグルパターン（hiddenクラス）",
      explanation: `<p>CSSクラスの最も出番が多い使い方が、<strong>表示・非表示の切り替え（トグル）</strong>です。<code>display: none</code>を持つクラスを用意しておき、<code>classList.toggle</code>で付け外しします。</p>
<pre><code>&lt;style&gt;
  .is-hidden { display: none; }
&lt;/style&gt;</code></pre>
<pre><code>flip() {
  this.panelTarget.classList.toggle(this.hiddenClass);
}</code></pre>
<p><code>toggle</code>は「クラスがあれば外し、なければ付ける」ので、同じボタンで表示と非表示を交互に切り替えられます。第7章のスライドショーでは<code>el.hidden</code>プロパティを使いましたが、CSSクラス方式には次の利点があります。</p>
<table>
<tr><th></th><th>el.hidden</th><th>CSSクラス方式</th></tr>
<tr><td>消え方</td><td>display:noneのみ</td><td>CSS次第（フェードアウト等も可能）</td></tr>
<tr><td>クラス名の変更</td><td>—</td><td>HTML属性だけで差し替え可能</td></tr>
<tr><td>スタイルの調整</td><td>JS修正が必要な場合あり</td><td>CSSだけで完結</td></tr>
</table>
<p>非表示にする対象は、コントローラの要素全体ではなく<code>panel</code>ターゲットです（ボタンまで消えると二度と戻せなくなるため）。flipメソッドを実装してください。</p>`,
      task: `flipメソッドを実装して、ボタンを押すたびにpanelTargetのis-hiddenクラスが付いたり外れたりするようにしてください。`,
      code: `<style>
  .is-hidden { display: none; }
</style>

<div data-controller="toggle" data-toggle-hidden-class="is-hidden">
  <button data-action="toggle#flip">表示/非表示</button>
  <p data-toggle-target="panel">ここが消えたり出たりします</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("toggle", class extends Controller {
  static targets = ["panel"];
  static classes = ["hidden"];

  flip() {
    // TODO: panelTargetのclassListをthis.hiddenClassでtoggleする
  }
});
<\/script>`,
      solution: `<style>
  .is-hidden { display: none; }
</style>

<div data-controller="toggle" data-toggle-hidden-class="is-hidden">
  <button data-action="toggle#flip">表示/非表示</button>
  <p data-toggle-target="panel">ここが消えたり出たりします</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("toggle", class extends Controller {
  static targets = ["panel"];
  static classes = ["hidden"];

  flip() {
    this.panelTarget.classList.toggle(this.hiddenClass);
  }
});
<\/script>`,
      hints: [
        `this.panelTarget.classList.toggle(this.hiddenClass); の1行です`,
        `toggleは「あれば外す、なければ付ける」を自動で行います`
      ],
      check: `const panel = $("[data-toggle-target=panel]");
assert(panel, "panelターゲットが必要です");
assert(!panel.classList.contains("is-hidden"), "最初はパネルが表示されている（is-hiddenが無い）はずです");
click("button");
await sleep(50);
assert(panel.classList.contains("is-hidden"), "1回押すとis-hiddenクラスが付いて非表示になるはずです");
click("button");
await sleep(50);
assert(!panel.classList.contains("is-hidden"), "もう1回押すとis-hiddenクラスが外れて再び表示されるはずです");`
    },
    {
      id: 78,
      title: "状態に応じたクラスの切り替え（activeなど）",
      explanation: `<p>第7章で学んだvaluesと、この章のclassesを組み合わせると、<strong>「状態が変わったらクラスも切り替わる」</strong>UIがきれいに書けます。ON/OFFスイッチを例にします。</p>
<ul>
<li>状態：<code>on</code>というBoolean型のvalue（trueかfalseか）</li>
<li>見た目：<code>active</code>という論理名のクラス（実際のクラス名はHTMLが指定）</li>
</ul>
<pre><code>static values = { on: Boolean };
static classes = ["active"];

flip() {
  this.onValue = !this.onValue; // 状態を反転するだけ
}

onValueChanged() {
  if (this.onValue) {
    this.buttonTarget.classList.add(this.activeClass);
    this.buttonTarget.textContent = "ON";
  } else {
    this.buttonTarget.classList.remove(this.activeClass);
    this.buttonTarget.textContent = "OFF";
  }
}</code></pre>
<p>役割分担に注目してください。アクションは<strong>状態を変えるだけ</strong>、クラスの付け外しとラベルの更新は<strong>onValueChangedに一本化</strong>されています（第7章ステップ64のパターン）。data属性を見れば今ONかOFFか分かり、クラス名はHTMLで差し替え可能。valuesとclassesの合わせ技です。</p>
<p>なお、Boolean型のvalueは属性が無ければfalseから始まり、<code>!</code>（否定演算子）で反転できます。onValueChangedを実装してください。</p>`,
      task: `onValueChangedを実装してください。onValueがtrueならbuttonTargetにactiveクラスを付けてラベルを「ON」に、falseなら外して「OFF」にします。`,
      code: `<style>
  .active-style { background: limegreen; color: white; }
</style>

<div data-controller="switch" data-switch-active-class="active-style">
  <button data-switch-target="button" data-action="switch#flip">OFF</button>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("switch", class extends Controller {
  static targets = ["button"];
  static values = { on: Boolean };
  static classes = ["active"];

  flip() {
    this.onValue = !this.onValue;
  }

  onValueChanged() {
    // TODO: this.onValueがtrueのとき：
    //         buttonTargetにthis.activeClassを追加し、textContentを"ON"にする
    //       falseのとき：
    //         this.activeClassを削除し、textContentを"OFF"にする
  }
});
<\/script>`,
      solution: `<style>
  .active-style { background: limegreen; color: white; }
</style>

<div data-controller="switch" data-switch-active-class="active-style">
  <button data-switch-target="button" data-action="switch#flip">OFF</button>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("switch", class extends Controller {
  static targets = ["button"];
  static values = { on: Boolean };
  static classes = ["active"];

  flip() {
    this.onValue = !this.onValue;
  }

  onValueChanged() {
    if (this.onValue) {
      this.buttonTarget.classList.add(this.activeClass);
      this.buttonTarget.textContent = "ON";
    } else {
      this.buttonTarget.classList.remove(this.activeClass);
      this.buttonTarget.textContent = "OFF";
    }
  }
});
<\/script>`,
      hints: [
        `if (this.onValue) { ... } else { ... } で分岐します`,
        `クラスの付け外しはclassList.add/removeにthis.activeClassを渡します`
      ],
      check: `assert(text("button") === "OFF", "接続直後はOFF表示のはずです（初回のvalueChangedはfalseで呼ばれます）");
click("button");
await sleep(50);
assert(text("button") === "ON", "1回押すとラベルがONになるはずです");
assert($("button").classList.contains("active-style"), "ONのときはactive-styleクラスが付くはずです");
click("button");
await sleep(50);
assert(text("button") === "OFF", "もう1回押すとOFFに戻るはずです");
assert(!$("button").classList.contains("active-style"), "OFFのときはactive-styleクラスが外れるはずです");`
    },
    {
      id: 79,
      title: "CSSクラスをHTML側で差し替えられる利点",
      explanation: `<p>なぜクラス名をわざわざHTMLから渡すのか。最大の利点は、<strong>同じコントローラを、場所ごとに違う見た目で再利用できる</strong>ことです。</p>
<p>通知を表示するalertコントローラを考えます。JSは「メッセージを表示してtone（色調）のクラスを付ける」としか書いていません。</p>
<pre><code>show() {
  this.messageTarget.textContent = "通知が届きました";
  this.messageTarget.classList.add(this.toneClass);
}</code></pre>
<p>これを成功通知として使うかエラー通知として使うかは、<strong>HTML属性だけで決まります</strong>。</p>
<pre><code>&lt;!-- 成功用：緑の文字になる --&gt;
&lt;div data-controller="alert" data-alert-tone-class="tone-success"&gt;

&lt;!-- エラー用：赤の文字になる --&gt;
&lt;div data-controller="alert" data-alert-tone-class="tone-error"&gt;</code></pre>
<ul>
<li>JSファイルは1つのまま、使う場所の数だけ見た目を変えられる</li>
<li>デザイナーやCSS担当者が、JSを触らずにクラスを差し替えられる</li>
<li>Tailwind CSSのようなユーティリティクラスにも、自作クラスにも同じ仕組みで対応できる</li>
</ul>
<p>初期コードでは、2つ目のアラート（alert2）にtoneクラスの属性がまだありません。alert2に<code>data-alert-tone-class="tone-error"</code>を追加して、同じコントローラがエラー用の見た目でも動くことを確かめてください。</p>`,
      task: `alert2のdiv要素にdata-alert-tone-class="tone-error"を追加して、2つのボタンでそれぞれ緑の成功通知と赤のエラー通知が表示されるようにしてください。`,
      code: `<style>
  .tone-success { color: green; font-weight: bold; }
  .tone-error { color: red; font-weight: bold; }
</style>

<div id="alert1" data-controller="alert" data-alert-tone-class="tone-success">
  <button data-action="alert#show">成功を表示</button>
  <p data-alert-target="message"></p>
</div>

<!-- TODO: このdivにdata-alert-tone-class="tone-error"を追加する -->
<div id="alert2" data-controller="alert">
  <button data-action="alert#show">エラーを表示</button>
  <p data-alert-target="message"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("alert", class extends Controller {
  static targets = ["message"];
  static classes = ["tone"];

  show() {
    this.messageTarget.textContent = "通知が届きました";
    this.messageTarget.classList.add(this.toneClass);
  }
});
<\/script>`,
      solution: `<style>
  .tone-success { color: green; font-weight: bold; }
  .tone-error { color: red; font-weight: bold; }
</style>

<div id="alert1" data-controller="alert" data-alert-tone-class="tone-success">
  <button data-action="alert#show">成功を表示</button>
  <p data-alert-target="message"></p>
</div>

<div id="alert2" data-controller="alert" data-alert-tone-class="tone-error">
  <button data-action="alert#show">エラーを表示</button>
  <p data-alert-target="message"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("alert", class extends Controller {
  static targets = ["message"];
  static classes = ["tone"];

  show() {
    this.messageTarget.textContent = "通知が届きました";
    this.messageTarget.classList.add(this.toneClass);
  }
});
<\/script>`,
      hints: [
        `alert1と同じ形式で、値だけtone-errorにした属性をalert2に追加します`,
        `JSは一切変更しません。HTML属性だけで見た目が変わるのがこのステップの主題です`
      ],
      check: `click("#alert1 button");
await sleep(50);
click("#alert2 button");
await sleep(50);
assert($("#alert1 p").classList.contains("tone-success"), "alert1のメッセージにはtone-successクラスが付くはずです");
assert($("#alert2 p").classList.contains("tone-error"), "alert2にdata-alert-tone-class=tone-errorを追加すると、同じコントローラのままエラー用の見た目になります");`
    },
    {
      id: 80,
      title: "総合演習：ダークモード切替",
      explanation: `<p>この章の総まとめとして、ダークモード切替を作ります。第7章の状態管理と第8章のCSSクラス、両方の集大成です。</p>
<table>
<tr><th>部品</th><th>役割</th></tr>
<tr><td>dark（Boolean型value）</td><td>ダークモードかどうかの状態。data属性に記録される</td></tr>
<tr><td>dark（クラスの論理名）</td><td>ダークモード用のCSSクラス。実名はdata-theme-dark-class="dark-mode"</td></tr>
<tr><td>labelターゲット</td><td>現在のモード名を表示する場所</td></tr>
</table>
<p>設計はこれまでのパターンどおりです。</p>
<ol>
<li>アクション<code>toggle</code>は<code>this.darkValue = !this.darkValue;</code>で状態を反転するだけ</li>
<li><code>darkValueChanged</code>がクラスの付け外しとラベル更新をすべて担当する</li>
<li>初回接続時にもdarkValueChangedが呼ばれるので、初期表示も自動で整う</li>
</ol>
<pre><code>darkValueChanged() {
  if (this.darkValue) {
    this.element.classList.add(this.darkClass);
    this.labelTarget.textContent = "現在:ダークモード";
  } else {
    // クラスを外してライトモードの表示にする
  }
}</code></pre>
<p>この作りなら、サーバーが<code>data-theme-dark-value="true"</code>を出力すれば最初からダークモードで表示され（ステップ68の考え方）、ダークモードの見た目を変えたいときはCSSと属性だけ直せば済みます（ステップ79の利点）。darkValueChangedを完成させてください。</p>`,
      task: `darkValueChangedを実装してください。darkValueがtrueなら要素にdark-modeクラスを付けてラベルを「現在:ダークモード」に、falseなら外して「現在:ライトモード」にします。`,
      code: `<style>
  .dark-mode { background: #333; color: #fff; padding: 12px; }
</style>

<div data-controller="theme" data-theme-dark-class="dark-mode" data-theme-dark-value="false">
  <h4>設定パネル</h4>
  <button data-action="theme#toggle">モード切替</button>
  <p data-theme-target="label"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("theme", class extends Controller {
  static targets = ["label"];
  static values = { dark: Boolean };
  static classes = ["dark"];

  toggle() {
    this.darkValue = !this.darkValue;
  }

  darkValueChanged() {
    // TODO: this.darkValueがtrueのとき：
    //         this.elementにthis.darkClassを追加し、
    //         labelTargetに「現在:ダークモード」と表示する
    //       falseのとき：
    //         this.darkClassを削除し、「現在:ライトモード」と表示する
  }
});
<\/script>`,
      solution: `<style>
  .dark-mode { background: #333; color: #fff; padding: 12px; }
</style>

<div data-controller="theme" data-theme-dark-class="dark-mode" data-theme-dark-value="false">
  <h4>設定パネル</h4>
  <button data-action="theme#toggle">モード切替</button>
  <p data-theme-target="label"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("theme", class extends Controller {
  static targets = ["label"];
  static values = { dark: Boolean };
  static classes = ["dark"];

  toggle() {
    this.darkValue = !this.darkValue;
  }

  darkValueChanged() {
    if (this.darkValue) {
      this.element.classList.add(this.darkClass);
      this.labelTarget.textContent = "現在:ダークモード";
    } else {
      this.element.classList.remove(this.darkClass);
      this.labelTarget.textContent = "現在:ライトモード";
    }
  }
});
<\/script>`,
      hints: [
        `ステップ78のonValueChangedとほぼ同じ構造です。対象がthis.element、クラスがthis.darkClassになります`,
        `初回のvalueChangedがfalseで呼ばれるため、最初は「現在:ライトモード」と表示されます`
      ],
      check: `const root = $("[data-controller=theme]");
assert(text("[data-theme-target=label]") === "現在:ライトモード", "接続直後、初回のvalueChangedで「現在:ライトモード」と表示されるはずです");
assert(!root.classList.contains("dark-mode"), "最初はdark-modeクラスは付いていないはずです");
click("button");
await sleep(50);
assert(root.classList.contains("dark-mode"), "切替ボタンを押すとdark-modeクラスが追加されるはずです");
assert(text("[data-theme-target=label]") === "現在:ダークモード", "ダークモード中は「現在:ダークモード」と表示されるはずです");
click("button");
await sleep(50);
assert(!root.classList.contains("dark-mode"), "もう1回押すとdark-modeクラスが外れるはずです");
assert(text("[data-theme-target=label]") === "現在:ライトモード", "ライトモードに戻ると「現在:ライトモード」と表示されるはずです");`
    }
  ]
});
