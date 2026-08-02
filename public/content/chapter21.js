// 第21章：よくあるエラー：接続まわり
registerChapter({
  number: 21,
  title: "よくあるエラー：接続まわり",
  description: "「ボタンを押しても何も起きない」の大半はコントローラの接続ミスが原因です。この章では接続まわりの典型的な不具合を実際に再現し、原因の特定と修正を訓練します。",
  steps: [
    {
      id: 201,
      title: "registerとdata-controllerの名前不一致",
      explanation: `<h4>症状</h4>
<p>ボタンを押しても何も起きません。<strong>コンソールにエラーも警告も出ない</strong>のが、この不具合の厄介なところです。Stimulusは、登録されていない識別子を持つ<code>data-controller</code>を「まだ登録されていないだけかもしれない」として静かに無視するからです。</p>
<h4>デバッグの手がかり</h4>
<p>無反応でエラーも出ないときは、まず<strong>コントローラが接続されているか</strong>を確認します。定番の方法は<code>connect()</code>に<code>console.log("接続OK")</code>を仕込むことです。何も表示されなければ、接続そのものに失敗しています。</p>
<pre><code>connect() {
  console.log("counter接続OK");
}</code></pre>
<p>接続に失敗しているとき、最初に疑うのは<strong>名前の不一致</strong>です。次の2か所を1文字ずつ見比べます。</p>
<table>
<tr><th>場所</th><th>書く名前</th></tr>
<tr><td>HTML</td><td><code>data-controller="counter"</code></td></tr>
<tr><td>JS</td><td><code>application.register("counter", ...)</code></td></tr>
</table>
<h4>原因と修正</h4>
<p>この2つは<strong>完全一致</strong>が必要です。1文字でも違えば別物として扱われ、接続されません。今回のコードはJS側が<code>countr</code>とタイポしています。registerの第1引数を<code>counter</code>に直せば動きます。</p>`,
      task: `ボタンを押してもカウントが増えません。registerの識別子とdata-controllerの名前を見比べて、不一致を修正してください。`,
      code: `<div data-controller="counter">
  <button data-action="click->counter#increment">+1</button>
  <p>カウント：<span data-counter-target="count">0</span></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

// TODO: ボタンが無反応。register名とdata-controllerを見比べて直そう
application.register("countr", class extends Controller {
  static targets = ["count"];
  increment() {
    this.countTarget.textContent = Number(this.countTarget.textContent) + 1;
  }
});
<\/script>`,
      solution: `<div data-controller="counter">
  <button data-action="click->counter#increment">+1</button>
  <p>カウント：<span data-counter-target="count">0</span></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("counter", class extends Controller {
  static targets = ["count"];
  increment() {
    this.countTarget.textContent = Number(this.countTarget.textContent) + 1;
  }
});
<\/script>`,
      hints: [
        `HTMLはdata-controller="counter"、JSはregister("countr", ...)になっています。どちらが正しい綴りでしょうか`,
        `data-action・data-counter-targetはすべてcounter前提なので、register側をcounterに直すのが正解です`,
        `無反応でエラーも出ないときは、まずconnect()にconsole.logを入れて接続確認する習慣をつけましょう`
      ],
      check: `assert($("[data-controller=counter]"), "data-controller=counterの要素が必要です");
click("button");
await sleep(50);
assert(text("[data-counter-target=count]") === "1", "ボタンを1回押すとカウントが1になるはずです。registerの識別子とdata-controllerの名前が完全一致しているか確認しましょう");
click("button");
await sleep(50);
assert(text("[data-counter-target=count]") === "2", "2回押すとカウントは2になるはずです");`
    },
    {
      id: 202,
      title: "registerし忘れ",
      explanation: `<h4>症状</h4>
<p>コントローラクラスをきちんと定義したのに、ボタンが無反応です。これもコンソールには何も出ません。</p>
<h4>デバッグの手がかり</h4>
<p>「クラスは書いた。HTMLの属性も合っている。なのに動かない」というときは、<strong>クラスの定義と登録は別物</strong>であることを思い出してください。JSのクラスは定義しただけでは単なる設計図で、Stimulusはその存在を知りません。</p>
<pre><code>// 1. 定義（設計図を書く）
class HelloController extends Controller { ... }

// 2. 登録（Stimulusに知らせる）←これを忘れがち
application.register("hello", HelloController);</code></pre>
<p>登録して初めて、Stimulusは<code>data-controller="hello"</code>の要素を見つけたときにこのクラスのインスタンスを作って接続します。</p>
<h4>原因と修正</h4>
<p>今回のコードは定義だけして<code>application.register(...)</code>の行が抜けています。1行追加すれば動きます。ファイルを分割してコントローラを書く実務のプロジェクトでも、「新しいコントローラファイルを作ったのに登録（またはビルド設定への追加）を忘れた」は頻出の事故です。無反応のときのチェックリストに「registerしたか？」を入れておきましょう。</p>`,
      task: `HelloControllerは定義済みですが登録されていません。application.registerの1行を追加して、ボタンで「こんにちは！」が表示されるようにしてください。`,
      code: `<div data-controller="hello">
  <button data-action="click->hello#greet">あいさつ</button>
  <p data-hello-target="output"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

// クラスは定義したのに、なぜか動かない…
class HelloController extends Controller {
  static targets = ["output"];
  greet() {
    this.outputTarget.textContent = "こんにちは！";
  }
}
// TODO: このクラスをStimulusに登録する1行が抜けている
<\/script>`,
      solution: `<div data-controller="hello">
  <button data-action="click->hello#greet">あいさつ</button>
  <p data-hello-target="output"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

class HelloController extends Controller {
  static targets = ["output"];
  greet() {
    this.outputTarget.textContent = "こんにちは！";
  }
}

application.register("hello", HelloController);
<\/script>`,
      hints: [
        `クラスの「定義」と「登録」は別の作業です。定義しただけではStimulusはクラスを知りません`,
        `application.register("hello", HelloController); をクラス定義の後に追加します`,
        `第1引数はdata-controllerに書いた名前と同じ"hello"にします`
      ],
      check: `assert($("[data-controller=hello]"), "data-controller=helloの要素が必要です");
click("button");
await sleep(50);
assert(text("[data-hello-target=output]") === "こんにちは！", "ボタンを押すと「こんにちは！」と表示されるはずです。application.registerでクラスを登録しましたか？");`
    },
    {
      id: 203,
      title: "Application.startし忘れ",
      explanation: `<h4>症状</h4>
<p>registerも書いたのにボタンが無反応です。今回もエラーは出ません。</p>
<h4>デバッグの手がかり</h4>
<p>コードをよく見ると、アプリケーションの作り方が<code>new Application()</code>になっています。実はStimulusの<code>Application.start()</code>は、次の2つを一度にやる便利メソッドです。</p>
<table>
<tr><th>処理</th><th>意味</th></tr>
<tr><td>new Application()</td><td>アプリケーションのオブジェクトを作る（だけ）</td></tr>
<tr><td>start()</td><td>DOMの監視を開始し、data-controllerを探して接続を始める</td></tr>
</table>
<p><code>new Application()</code>だけではDOMの監視が始まらないため、いくらregisterしても<strong>接続処理そのものが動きません</strong>。「登録はしたのに1つも接続されない」ときは、起動の行を確認しましょう。</p>
<h4>原因と修正</h4>
<pre><code>// 誤り：作っただけで起動していない
const application = new Application();

// 正しい：作成＋起動
const application = Application.start();</code></pre>
<p>なお起動確認には<code>application.debug = true;</code>も便利です。デバッグモードにすると、接続やアクション実行のたびにログがコンソールに流れるので、「どこまで動いているか」が一目で分かります。</p>`,
      task: `アプリケーションが起動していないため、コントローラが接続されません。Application.start()を使うように修正してください。`,
      code: `<div data-controller="hello">
  <button data-action="click->hello#greet">あいさつ</button>
  <p data-hello-target="output"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

// TODO: アプリケーションを「作っただけ」で起動していない
const application = new Application();

application.register("hello", class extends Controller {
  static targets = ["output"];
  greet() {
    this.outputTarget.textContent = "こんにちは！";
  }
});
<\/script>`,
      solution: `<div data-controller="hello">
  <button data-action="click->hello#greet">あいさつ</button>
  <p data-hello-target="output"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("hello", class extends Controller {
  static targets = ["output"];
  greet() {
    this.outputTarget.textContent = "こんにちは！";
  }
});
<\/script>`,
      hints: [
        `new Application()はオブジェクトを作るだけで、DOMの監視（接続処理）は始まりません`,
        `const application = Application.start(); に書き換えましょう`,
        `Application.start()は「作成」と「起動」を同時に行う定番の書き方です`
      ],
      check: `assert($("[data-controller=hello]"), "data-controller=helloの要素が必要です");
click("button");
await sleep(50);
assert(text("[data-hello-target=output]") === "こんにちは！", "ボタンを押すと「こんにちは！」と表示されるはずです。Application.start()でアプリケーションを起動しましたか？");`
    },
    {
      id: 204,
      title: "ボタンがコントローラのスコープ外にある",
      explanation: `<h4>症状</h4>
<p>register名もアクションの書き方も正しいのに、ボタンが無反応です。エラーも警告も出ません。</p>
<h4>デバッグの手がかり</h4>
<p>コントローラは<code>data-controller</code>を付けた要素と<strong>その内側（子孫要素）だけ</strong>を担当します。この範囲を「スコープ」と呼びました。<code>data-action</code>や<code>data-xxx-target</code>は、スコープの中にあるときだけ機能します。</p>
<pre><code>&lt;div data-controller="hello"&gt;
  ここがhelloのスコープ
&lt;/div&gt;
ここはスコープの外（helloのアクションは効かない）</code></pre>
<p>無反応のときは、開発者ツールの要素タブでHTMLの階層を見て、<strong>反応しない要素がdata-controller要素の内側にあるか</strong>を確認しましょう。閉じタグの位置ミスで意図せず外に出てしまうことがよくあります。</p>
<h4>原因と修正</h4>
<p>今回のボタンは<code>&lt;div data-controller="hello"&gt;</code>の閉じタグの<strong>後ろ</strong>に置かれているため、helloコントローラのスコープ外です。ボタンをdivの内側に移動すれば動きます。どうしても外に置きたい場合は、後の章で学んだ<code>@window</code>やoutletsなどの仕組みが必要になりますが、基本は「操作する要素はスコープの中に置く」です。</p>`,
      task: `あいさつボタンがdata-controller="hello"のdivの外にあるため反応しません。ボタンをdivの内側に移動してください。`,
      code: `<div data-controller="hello">
  <p data-hello-target="output">ここに表示されます</p>
</div>

<!-- TODO: このボタンはスコープの外にあるため反応しない。divの中へ移動しよう -->
<button data-action="click->hello#greet">あいさつ</button>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("hello", class extends Controller {
  static targets = ["output"];
  greet() {
    this.outputTarget.textContent = "こんにちは！";
  }
});
<\/script>`,
      solution: `<div data-controller="hello">
  <p data-hello-target="output">ここに表示されます</p>
  <button data-action="click->hello#greet">あいさつ</button>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("hello", class extends Controller {
  static targets = ["output"];
  greet() {
    this.outputTarget.textContent = "こんにちは！";
  }
});
<\/script>`,
      hints: [
        `data-actionはdata-controller要素の内側（スコープ内）にあるときだけ機能します`,
        `<button>の行をまるごと</div>の前に移動しましょう`,
        `開発者ツールの要素タブで、ボタンがdivの子要素になっているか階層を確認する習慣をつけましょう`
      ],
      check: `assert($("[data-controller=hello] button"), "あいさつボタンはdata-controller=helloの要素の内側に置く必要があります");
click("[data-controller=hello] button");
await sleep(50);
assert(text("[data-hello-target=output]") === "こんにちは！", "ボタンを押すと「こんにちは！」と表示されるはずです");`
    },
    {
      id: 205,
      title: "識別子はケバブケース（my_counterは動かない）",
      explanation: `<h4>症状</h4>
<p>HTML側の名前を<code>my_counter</code>（アンダースコア区切り）と書いたため、コントローラが接続されず無反応です。エラーは出ません。</p>
<h4>デバッグの手がかり</h4>
<p>Stimulusの識別子（data-controllerに書く名前）は<strong>ケバブケース</strong>（ハイフン区切りの小文字）が規約です。Railsなどの実務プロジェクトではファイル名から識別子が自動で決まり、その変換規則は次のとおりです。</p>
<table>
<tr><th>ファイル名</th><th>識別子</th></tr>
<tr><td>hello_controller.js</td><td>hello</td></tr>
<tr><td>my_counter_controller.js</td><td>my-counter</td></tr>
<tr><td>users/list_item_controller.js</td><td>users--list-item</td></tr>
</table>
<p>ポイントは<strong>アンダースコアがハイフンに変換される</strong>ことです。ファイル名の感覚のまま<code>data-controller="my_counter"</code>と書いてしまうと、識別子<code>my-counter</code>とは一致せず接続されません。</p>
<h4>原因と修正</h4>
<p>今回はJS側が<code>register("my-counter", ...)</code>と正しくケバブケースで登録しているのに、HTML側の3か所（data-controller・data-action・ターゲット属性）が<code>my_counter</code>のままです。3か所すべてを<code>my-counter</code>に直します。ターゲット属性は<code>data-my-counter-target</code>という形になることにも注意してください。</p>`,
      task: `HTML側のmy_counterをすべてケバブケースのmy-counterに直して、カウンターが動くようにしてください（data-controller・data-action・ターゲット属性の3か所）。`,
      code: `<!-- TODO: 識別子はケバブケース。my_counterをmy-counterに直そう（3か所） -->
<div data-controller="my_counter">
  <button data-action="click->my_counter#increment">+1</button>
  <p>カウント：<span data-my_counter-target="count">0</span></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("my-counter", class extends Controller {
  static targets = ["count"];
  increment() {
    this.countTarget.textContent = Number(this.countTarget.textContent) + 1;
  }
});
<\/script>`,
      solution: `<div data-controller="my-counter">
  <button data-action="click->my-counter#increment">+1</button>
  <p>カウント：<span data-my-counter-target="count">0</span></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("my-counter", class extends Controller {
  static targets = ["count"];
  increment() {
    this.countTarget.textContent = Number(this.countTarget.textContent) + 1;
  }
});
<\/script>`,
      hints: [
        `JS側はregister("my-counter", ...)と正しく登録されています。HTML側を合わせましょう`,
        `data-controller="my-counter"、data-action="click->my-counter#increment"に直します`,
        `ターゲット属性はdata-my-counter-target="count"です。アンダースコアが残っていないか確認しましょう`
      ],
      check: `assert($("[data-controller=my-counter]"), "data-controllerはケバブケースのmy-counterに直します（アンダースコアはハイフンに）");
assert($("[data-my-counter-target=count]"), "ターゲット属性もdata-my-counter-target=\\"count\\"に直します");
click("button");
await sleep(50);
assert(text("[data-my-counter-target=count]") === "1", "ボタンを押すとカウントが1になるはずです。data-actionのmy_counterも直しましたか？");`
    },
    {
      id: 206,
      title: "script type=\"module\"の付け忘れ",
      explanation: `<h4>症状</h4>
<p>今回は無反応なだけでなく、コンソールに<strong>赤いエラー</strong>が出ます。</p>
<pre><code>Uncaught SyntaxError: Cannot use import statement outside a module</code></pre>
<p>「importはモジュールの外では使えない」という意味です。scriptタグに<code>type="module"</code>が無いと、ブラウザはそのコードを昔ながらの通常スクリプトとして解釈します。<code>import</code>／<code>export</code>はモジュール専用の構文なので、通常スクリプトでは構文エラーになり、<strong>そのscript全体が1行も実行されません</strong>。</p>
<h4>デバッグの手がかり</h4>
<p>SyntaxErrorは「実行して失敗した」のではなく「読み込み時点で解釈に失敗した」エラーです。つまりconsole.logを仕込んでも何も出ません。このエラー文を見たら、真っ先にscriptタグの属性を確認しましょう。</p>
<table>
<tr><th>書き方</th><th>importの可否</th></tr>
<tr><td>&lt;script&gt;</td><td>不可（SyntaxError）</td></tr>
<tr><td>&lt;script type="module"&gt;</td><td>可</td></tr>
</table>
<h4>原因と修正</h4>
<p><code>&lt;script&gt;</code>を<code>&lt;script type="module"&gt;</code>に変えるだけで解決します。モジュールにするとimportが使えるほか、自動でstrictモードになる・トップレベルの変数がグローバルを汚さないという利点もあります。Stimulusを使うコードは常に<code>type="module"</code>と覚えてください。</p>`,
      task: `コンソールに「Cannot use import statement outside a module」というSyntaxErrorが出ています。scriptタグを修正して動くようにしてください。`,
      code: `<div data-controller="hello">
  <button data-action="click->hello#greet">あいさつ</button>
  <p data-hello-target="output"></p>
</div>

<!-- TODO: このscriptタグには大事な属性が抜けている -->
<script>
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("hello", class extends Controller {
  static targets = ["output"];
  greet() {
    this.outputTarget.textContent = "こんにちは！";
  }
});
<\/script>`,
      solution: `<div data-controller="hello">
  <button data-action="click->hello#greet">あいさつ</button>
  <p data-hello-target="output"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("hello", class extends Controller {
  static targets = ["output"];
  greet() {
    this.outputTarget.textContent = "こんにちは！";
  }
});
<\/script>`,
      hints: [
        `import文はモジュールの中でしか使えません。scriptタグの属性を見直しましょう`,
        `<script>を<script type="module">に変更します`,
        `SyntaxErrorが出るとそのscriptは1行も実行されないため、console.logでの調査もできません。まずエラー文を読みましょう`
      ],
      check: `assert($("[data-controller=hello]"), "data-controller=helloの要素が必要です");
click("button");
await sleep(50);
assert(text("[data-hello-target=output]") === "こんにちは！", "ボタンを押すと「こんにちは！」と表示されるはずです。scriptタグにtype=\\"module\\"を付けましたか？");`
    },
    {
      id: 207,
      title: "importの綴りミス（named importの名前）",
      explanation: `<h4>症状</h4>
<p>コンソールに次のようなエラーが出て、無反応になります。</p>
<pre><code>Uncaught SyntaxError: The requested module 'stimulus'
does not provide an export named 'Contoroller'</code></pre>
<p>「stimulusというモジュールはContorollerという名前をエクスポートしていない」という意味です。<code>import { A, B } from "..."</code>という形（named import）は、<strong>相手がエクスポートしている名前と完全一致</strong>していなければなりません。存在しない名前を書くと、モジュールの読み込み自体が失敗し、そのscriptは実行されません。</p>
<h4>デバッグの手がかり</h4>
<p>このエラー文は親切で、<strong>どのモジュールの・どの名前が見つからないか</strong>を教えてくれます。エラー内の名前（今回はContoroller）をコード検索し、正しい綴りと見比べましょう。Stimulusがエクスポートしている主要な名前は次の2つです。</p>
<table>
<tr><th>名前</th><th>役割</th></tr>
<tr><td>Application</td><td>アプリ本体。start()で起動</td></tr>
<tr><td>Controller</td><td>コントローラの基底クラス。extendsして使う</td></tr>
</table>
<h4>原因と修正</h4>
<p>今回は<code>Controller</code>を<code>Contoroller</code>と書いています（日本語話者に多いタイポです）。import行と<code>extends</code>の2か所を<code>Controller</code>に直します。片方だけ直すと今度は「Contoroller is not defined」というReferenceErrorに変わるので、両方直すことを忘れずに。</p>`,
      task: `コンソールに「does not provide an export named 'Contoroller'」というエラーが出ています。綴りを修正して動くようにしてください（import行とextendsの2か所）。`,
      code: `<div data-controller="hello">
  <button data-action="click->hello#greet">あいさつ</button>
  <p data-hello-target="output"></p>
</div>

<script type="module">
// TODO: importしている名前の綴りが間違っている（2か所直す）
import { Application, Contoroller } from "stimulus";

const application = Application.start();

application.register("hello", class extends Contoroller {
  static targets = ["output"];
  greet() {
    this.outputTarget.textContent = "こんにちは！";
  }
});
<\/script>`,
      solution: `<div data-controller="hello">
  <button data-action="click->hello#greet">あいさつ</button>
  <p data-hello-target="output"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("hello", class extends Controller {
  static targets = ["output"];
  greet() {
    this.outputTarget.textContent = "こんにちは！";
  }
});
<\/script>`,
      hints: [
        `正しい名前はControllerです。Contorollerになっている場所を探しましょう`,
        `import行とclass extendsの2か所を両方直す必要があります`,
        `named importはエクスポート側の名前と完全一致が必要です。エラー文に見つからない名前が書いてあります`
      ],
      check: `assert($("[data-controller=hello]"), "data-controller=helloの要素が必要です");
click("button");
await sleep(50);
assert(text("[data-hello-target=output]") === "こんにちは！", "ボタンを押すと「こんにちは！」と表示されるはずです。importの綴りをControllerに直しましたか？");`
    },
    {
      id: 208,
      title: "connectのメソッド名タイポ（呼ばれないだけでエラーなし）",
      explanation: `<h4>症状</h4>
<p>ページ読み込み時に表示が「接続しました」に変わるはずが、初期表示のまま変わりません。<strong>エラーも警告も一切出ません</strong>。</p>
<h4>デバッグの手がかり</h4>
<p>Stimulusのライフサイクルメソッド（<code>initialize</code>・<code>connect</code>・<code>disconnect</code>など）は、<strong>決められた名前のメソッドが定義されていれば呼ぶ</strong>という仕組みです。逆に言うと、名前が1文字でも違えば「そういう名前の普通のメソッドが定義されているだけ」と解釈され、誰からも呼ばれません。存在チェックではなく単なる呼び出しなので、エラーになりようがないのです。</p>
<p>「定義したはずのメソッドが呼ばれない」ときのデバッグ手順は次のとおりです。</p>
<ol>
<li>メソッドの先頭に<code>console.log("connect呼ばれた")</code>を入れる</li>
<li>出なければ「呼ばれていない」と確定する</li>
<li>メソッド名の綴りを正しい名前と1文字ずつ見比べる</li>
</ol>
<h4>原因と修正</h4>
<p>今回は<code>connect</code>を<code>connnect</code>（nが3つ）と書いています。正しい綴りに直せば、接続時に自動で呼ばれて表示が変わります。</p>
<pre><code>// 誤り：ただのメソッドとして無視される
connnect() { ... }

// 正しい：接続時に自動で呼ばれる
connect() { ... }</code></pre>`,
      task: `ページ読み込み時に「接続しました」と表示されるはずが、動いていません。ライフサイクルメソッドの綴りを修正してください。`,
      code: `<div data-controller="status">
  <p data-status-target="output">まだ接続されていません</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("status", class extends Controller {
  static targets = ["output"];

  // TODO: 接続時に呼ばれるはずのメソッドが呼ばれない。綴りを確認しよう
  connnect() {
    this.outputTarget.textContent = "接続しました";
  }
});
<\/script>`,
      solution: `<div data-controller="status">
  <p data-status-target="output">まだ接続されていません</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("status", class extends Controller {
  static targets = ["output"];

  connect() {
    this.outputTarget.textContent = "接続しました";
  }
});
<\/script>`,
      hints: [
        `接続時に自動で呼ばれるメソッドの正しい名前はconnect（nは2つ）です`,
        `名前が違うメソッドは「ただのメソッド」として扱われ、エラーも出ずに無視されます`,
        `呼ばれているか怪しいメソッドには、まずconsole.logを入れて確認しましょう`
      ],
      check: `assert($("[data-controller=status]"), "data-controller=statusの要素が必要です");
assert(text("[data-status-target=output]") === "接続しました", "ページ読み込み直後に「接続しました」と表示されるはずです。ライフサイクルメソッドの綴りはconnectです");`
    },
    {
      id: 209,
      title: "複数コントローラ指定のカンマ区切りミス",
      explanation: `<h4>症状</h4>
<p>1つの要素にgreeterとcounterの2つのコントローラを付けたつもりが、<strong>どちらも動きません</strong>。エラーも出ません。</p>
<h4>デバッグの手がかり</h4>
<p><code>data-controller</code>に複数のコントローラを指定するときの区切りは<strong>半角スペース</strong>です。CSSのclass属性と同じルールだと考えてください。</p>
<pre><code>&lt;!-- 誤り：カンマ区切り --&gt;
&lt;div data-controller="greeter,counter"&gt;

&lt;!-- 正しい：スペース区切り --&gt;
&lt;div data-controller="greeter counter"&gt;</code></pre>
<p>カンマで書くと、Stimulusは全体を<code>greeter,counter</code>という<strong>1つの識別子</strong>として解釈します。そんな名前のコントローラは登録されていないので、greeterもcounterも接続されず、両方とも無反応になります。「2つ付けたら2つとも動かない」という症状が出たら、まず区切り文字を疑いましょう。</p>
<h4>原因と修正</h4>
<p>カンマをスペースに変えるだけです。なお<code>data-action</code>に複数のアクションを書くときも同じくスペース区切りです。HTML属性の中で複数の値を列挙するときは「カンマではなくスペース」がStimulusの一貫したルールだと覚えてください。</p>`,
      task: `data-controllerのカンマ区切りをスペース区切りに直して、あいさつとカウンターの両方が動くようにしてください。`,
      code: `<!-- TODO: 2つのコントローラがどちらも動かない。区切り文字に注目 -->
<div data-controller="greeter,counter">
  <button data-action="click->greeter#greet">あいさつ</button>
  <button data-action="click->counter#increment">+1</button>
  <p data-greeter-target="output"></p>
  <p>カウント：<span data-counter-target="count">0</span></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("greeter", class extends Controller {
  static targets = ["output"];
  greet() {
    this.outputTarget.textContent = "こんにちは！";
  }
});

application.register("counter", class extends Controller {
  static targets = ["count"];
  increment() {
    this.countTarget.textContent = Number(this.countTarget.textContent) + 1;
  }
});
<\/script>`,
      solution: `<div data-controller="greeter counter">
  <button data-action="click->greeter#greet">あいさつ</button>
  <button data-action="click->counter#increment">+1</button>
  <p data-greeter-target="output"></p>
  <p>カウント：<span data-counter-target="count">0</span></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("greeter", class extends Controller {
  static targets = ["output"];
  greet() {
    this.outputTarget.textContent = "こんにちは！";
  }
});

application.register("counter", class extends Controller {
  static targets = ["count"];
  increment() {
    this.countTarget.textContent = Number(this.countTarget.textContent) + 1;
  }
});
<\/script>`,
      hints: [
        `data-controllerの複数指定はCSSのclass属性と同じく半角スペース区切りです`,
        `data-controller="greeter counter"に直しましょう`,
        `カンマで書くと全体が1つの識別子とみなされ、どちらのコントローラも接続されません`
      ],
      check: `assert($("[data-controller~=greeter]") && $("[data-controller~=counter]"), "data-controllerの複数指定は半角スペース区切りです（カンマは使えません）");
click("[data-action='click->greeter#greet']");
await sleep(50);
assert(text("[data-greeter-target=output]") === "こんにちは！", "あいさつボタンで「こんにちは！」と表示されるはずです");
click("[data-action='click->counter#increment']");
await sleep(50);
assert(text("[data-counter-target=count]") === "1", "+1ボタンでカウントが1になるはずです");`
    },
    {
      id: 210,
      title: "総合演習：接続トラブルをすべて直す",
      explanation: `<h4>症状</h4>
<p>この章の総合演習です。あいさつとカウンターの2機能を持つページに、<strong>接続まわりの不具合が3つ</strong>仕込まれています。すべて見つけて修正してください。</p>
<h4>デバッグの進め方</h4>
<p>複数の不具合が重なっているときは、手当たり次第に直すのではなく<strong>順番</strong>が大切です。</p>
<ol>
<li><strong>まずコンソールを開く</strong>。赤いエラー（特にSyntaxError）があれば最優先で直します。scriptが実行されていない状態では、他の修正の効果を確認できないからです。</li>
<li>エラーが消えたら、<strong>接続の確認</strong>。動かないコントローラについて、registerの識別子とdata-controllerの一致を1文字ずつ確認します。</li>
<li>それでも動かない要素は、<strong>スコープの確認</strong>。data-actionを持つ要素がdata-controller要素の内側にあるかをHTMLの階層で確認します。</li>
</ol>
<h4>この章で学んだチェックリスト</h4>
<table>
<tr><th>症状</th><th>疑うポイント</th></tr>
<tr><td>SyntaxErrorが出る</td><td>type="module"忘れ・importの綴り</td></tr>
<tr><td>無反応・エラーなし</td><td>register名の不一致・register忘れ・start忘れ・スコープ外・ケバブケース・カンマ区切り</td></tr>
<tr><td>connectが呼ばれない</td><td>ライフサイクルメソッドの綴り</td></tr>
</table>
<p>このチェックリストは実務でもそのまま使えます。上から順に潰していきましょう。</p>`,
      task: `3つの不具合（scriptタグの属性・registerの識別子・ボタンの位置）をすべて修正して、あいさつとカウンターの両方が動くようにしてください。`,
      code: `<div data-controller="greeter">
  <p data-greeter-target="output">---</p>
</div>
<!-- 不具合その1？：このボタンの位置はこれでよい？ -->
<button data-action="click->greeter#greet">あいさつ</button>

<div data-controller="counter">
  <button data-action="click->counter#increment">+1</button>
  <p>カウント：<span data-counter-target="count">0</span></p>
</div>

<!-- 不具合その2？：このscriptタグはこれでよい？ -->
<script>
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("greeter", class extends Controller {
  static targets = ["output"];
  greet() {
    this.outputTarget.textContent = "こんにちは！";
  }
});

// 不具合その3？：この識別子はHTMLと一致している？
application.register("countr", class extends Controller {
  static targets = ["count"];
  increment() {
    this.countTarget.textContent = Number(this.countTarget.textContent) + 1;
  }
});
<\/script>`,
      solution: `<div data-controller="greeter">
  <p data-greeter-target="output">---</p>
  <button data-action="click->greeter#greet">あいさつ</button>
</div>

<div data-controller="counter">
  <button data-action="click->counter#increment">+1</button>
  <p>カウント：<span data-counter-target="count">0</span></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("greeter", class extends Controller {
  static targets = ["output"];
  greet() {
    this.outputTarget.textContent = "こんにちは！";
  }
});

application.register("counter", class extends Controller {
  static targets = ["count"];
  increment() {
    this.countTarget.textContent = Number(this.countTarget.textContent) + 1;
  }
});
<\/script>`,
      hints: [
        `まずコンソールのSyntaxErrorから。scriptタグにtype="module"が必要です`,
        `register("countr", ...)はHTMLのdata-controller="counter"と一致していません`,
        `あいさつボタンはgreeterのdivの外にあります。スコープの内側に移動しましょう`
      ],
      check: `assert($("[data-controller=greeter] button"), "あいさつボタンはgreeterコントローラのスコープ内（divの内側）に移動します");
click("[data-controller=greeter] button");
await sleep(50);
assert(text("[data-greeter-target=output]") === "こんにちは！", "あいさつボタンで「こんにちは！」と表示されるはずです。scriptタグのtype=\\"module\\"は付けましたか？");
click("[data-controller=counter] button");
await sleep(50);
assert(text("[data-counter-target=count]") === "1", "+1ボタンでカウントが1になるはずです。registerの識別子はcounterに直しましたか？");
click("[data-controller=counter] button");
await sleep(50);
assert(text("[data-counter-target=count]") === "2", "2回押すとカウントは2になるはずです");`
    }
  ]
});
