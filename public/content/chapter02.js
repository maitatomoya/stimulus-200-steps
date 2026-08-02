// 第2章：Stimulusの第一歩
registerChapter({
  number: 2,
  title: "Stimulusの第一歩",
  description: "いよいよStimulusの登場です。アプリの起動、コントローラの登録、data-controllerによる接続という基本の流れを学び、HTML主導という考え方を体験します。",
  steps: [
    {
      id: 11,
      title: "なぜStimulusか（素のDOMのつらさ）",
      explanation: `<p>第1章の書き方には、規模が大きくなると効いてくる弱点があります。</p>
<ul>
<li>HTML側のidと、JS側のセレクタ文字列が<strong>離れた場所で対応</strong>している。片方を直し忘れるとサイレントに壊れる</li>
<li>HTMLを見ても<strong>どんな動きが付いているか分からない</strong>。JSを全部読まないと挙動が把握できない</li>
<li>あとから追加された要素にはリスナーが付かないため、追加のたびに登録処理が必要</li>
</ul>
<p><strong>Stimulus</strong>（Hotwireファミリーの1つ）は、この問題を「HTML主導」という発想で解決するJavaScriptフレームワークです。動きの割り当てをJSの中ではなく、<strong>HTMLのdata属性に直接書きます</strong>。</p>
<pre><code>&lt;div data-controller="hello"&gt;
  &lt;button data-action="click-&gt;hello#greet"&gt;あいさつ&lt;/button&gt;
&lt;/div&gt;</code></pre>
<p>HTMLを読むだけで「この範囲はhelloコントローラが担当し、ボタンを押すとgreetが動く」と分かります。要素の取得もリスナー登録もStimulusが自動で行い、あとから追加された要素にも自動で接続されます（ステップ6のdata属性が基盤です）。</p>
<p>この便利さを実感するために、まずは素のDOMの「壊れやすさ」を体験しましょう。下のコードはHTMLのidとJSのセレクタがずれていて動きません。第1章の知識で直してみてください。</p>`,
      task: `HTML側のid（greet-btn）とJS側のgetElementByIdに渡している名前がずれていて動きません。JS側のセレクタを直して、ボタンで「こんにちは！」と表示されるようにしてください。`,
      code: `<!-- 素のDOMでは、HTMLのidとJSのセレクタが少しずれるだけで動かなくなります -->
<button id="greet-btn">あいさつ</button>
<p id="output"></p>

<script>
// TODO: HTML側のidと見比べて、セレクタの誤りを直す
const btn = document.getElementById("greeting-btn");
const output = document.getElementById("output");

btn.addEventListener("click", () => {
  output.textContent = "こんにちは！";
});
<\/script>`,
      solution: `<!-- 素のDOMでは、HTMLのidとJSのセレクタが少しずれるだけで動かなくなります -->
<button id="greet-btn">あいさつ</button>
<p id="output"></p>

<script>
const btn = document.getElementById("greet-btn");
const output = document.getElementById("output");

btn.addEventListener("click", () => {
  output.textContent = "こんにちは！";
});
<\/script>`,
      hints: [`HTMLのボタンのidは「greet-btn」ですが、JSは「greeting-btn」を探しています`, `getElementByIdがnullを返すと、その後のaddEventListenerでエラーになりコード全体が止まります`],
      check: `assert($("#greet-btn"), "id=greet-btnのボタンが必要です（HTML側は変更しません）");
click("#greet-btn");
await sleep(50);
assert(text("#output") === "こんにちは！", "ボタンを押すと「こんにちは！」と表示されるはずです。getElementByIdに渡す名前をHTMLのid（greet-btn）に合わせましょう");`
    },
    {
      id: 12,
      title: "Application.startとregister",
      explanation: `<p>ここからStimulusを使います。Stimulusアプリは、次の2つの手順で動き始めます。</p>
<ol>
<li><code>Application.start()</code>：Stimulusアプリ本体を起動し、ページの監視を開始する。戻り値のapplicationオブジェクトを変数に取っておく</li>
<li><code>application.register("名前", コントローラクラス)</code>：「この名前のコントローラはこのクラスです」と登録する</li>
</ol>
<pre><code>import { Application, Controller } from "stimulus";

const application = Application.start();

class HelloController extends Controller {
  // ここにコントローラの処理を書く
}
application.register("hello", HelloController);</code></pre>
<p>登場人物を整理しましょう。</p>
<table>
<tr><th>名前</th><th>役割</th></tr>
<tr><td><code>Application</code></td><td>Stimulusアプリ全体を管理する司令塔</td></tr>
<tr><td><code>Controller</code></td><td>すべてのコントローラの親クラス。<code>extends Controller</code>で継承して使う</td></tr>
<tr><td><code>register</code></td><td>名前とクラスを結びつけて登録するメソッド</td></tr>
</table>
<p>コントローラクラスに書いてある<code>connect()</code>は、コントローラがHTMLと接続された瞬間に自動で呼ばれる特別なメソッドです（詳しくはステップ14で扱います）。今回は「起動と登録が正しくできると、connectが動いて画面が変わる」ことを確認の手がかりにします。startとregisterのどちらが欠けても、Stimulusは一切動きません。</p>`,
      task: `Application.start()でアプリを起動してapplication変数に入れ、application.registerで"hello"という名前でHelloControllerを登録してください。`,
      code: `<div data-controller="hello">
  <p id="status">未接続</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

class HelloController extends Controller {
  // connect()は、コントローラがHTMLと接続されたときに自動で呼ばれる（詳細はステップ14）
  connect() {
    document.getElementById("status").textContent = "接続しました";
  }
}

// TODO(1): Application.start()の戻り値をapplicationという変数に入れる

// TODO(2): application.register("hello", HelloController)で登録する
<\/script>`,
      solution: `<div data-controller="hello">
  <p id="status">未接続</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

class HelloController extends Controller {
  // connect()は、コントローラがHTMLと接続されたときに自動で呼ばれる（詳細はステップ14）
  connect() {
    document.getElementById("status").textContent = "接続しました";
  }
}

const application = Application.start();
application.register("hello", HelloController);
<\/script>`,
      hints: [`const application = Application.start(); と書きます`, `続けて application.register("hello", HelloController); を呼びます。名前は文字列で渡します`],
      check: `assert($("[data-controller=hello]"), "data-controller=\\"hello\\"を持つdivが必要です（HTML側は変更しません）");
assert(text("#status") === "接続しました", "起動と登録が正しくできると、connect()が動いて#statusが「接続しました」に変わるはずです。Application.start()とapplication.register()の両方が必要です");`
    },
    {
      id: 13,
      title: "data-controllerで接続する",
      explanation: `<p>前のステップでは、JS側の準備（起動と登録）を行いました。しかし登録しただけではコントローラはまだ動きません。<strong>HTML側から「ここで使います」と宣言</strong>して初めて動き出します。その宣言が<code>data-controller</code>属性です。</p>
<pre><code>&lt;div data-controller="message"&gt;
  この中がmessageコントローラの担当範囲
&lt;/div&gt;</code></pre>
<p>Stimulusのapplicationはページを監視していて、<code>data-controller="message"</code>という属性を持つ要素を見つけると、registerで登録された"message"のクラスから<strong>インスタンス（実体）を作って接続</strong>します。この瞬間にconnect()が呼ばれます。</p>
<p>つまりStimulusが動く条件は3点セットです。</p>
<ol>
<li>JS：<code>Application.start()</code>で起動している</li>
<li>JS：<code>register("message", クラス)</code>で登録している</li>
<li>HTML：要素に<code>data-controller="message"</code>が付いている</li>
</ol>
<p>注目してほしいのは、3つ目が<strong>HTML側の仕事</strong>だということです。第1章の素のDOMでは「JSがHTMLを探しに行く」形でしたが、Stimulusでは「HTMLが名乗り、JSが応える」形になります。名前は文字列として完全一致が必要で、1文字でも違うと接続されません（何のエラーも出ずにただ動かないので注意）。今回はHTML側にdata-controllerを書いて、接続を成立させましょう。</p>`,
      task: `divにdata-controller="message"を追加して、messageコントローラと接続してください（JS側は完成しています）。`,
      code: `<!-- TODO: このdivにdata-controller="message"を追加する -->
<div>
  <p id="status">未接続</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("message", class extends Controller {
  connect() {
    document.getElementById("status").textContent = "messageコントローラが接続されました";
  }
});
<\/script>`,
      solution: `<div data-controller="message">
  <p id="status">未接続</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("message", class extends Controller {
  connect() {
    document.getElementById("status").textContent = "messageコントローラが接続されました";
  }
});
<\/script>`,
      hints: [`<div data-controller="message"> のように属性を書きます`, `registerした名前とdata-controllerの値は完全一致が必要です`],
      check: `assert($('[data-controller="message"]'), "data-controller=\\"message\\"を持つ要素が必要です。divの開始タグに属性を追加しましょう");
assert(text("#status") === "messageコントローラが接続されました", "接続に成功すると#statusの文字が変わるはずです。data-controllerの値がregisterした名前と一致しているか確認しましょう");`
    },
    {
      id: 14,
      title: "connect()が呼ばれることを観察する",
      explanation: `<p>ここまで何度か登場した<code>connect()</code>を正面から扱います。connectは<strong>ライフサイクルコールバック</strong>と呼ばれる特別なメソッドの1つで、自分で呼び出さなくても、<strong>コントローラが要素に接続された瞬間にStimulusが自動で呼んでくれます</strong>。</p>
<pre><code>application.register("logger", class extends Controller {
  connect() {
    console.log("connectが呼ばれました");
  }
});</code></pre>
<p>「接続された瞬間」とは具体的には次のようなタイミングです。</p>
<ul>
<li>ページが読み込まれ、<code>data-controller</code>付きの要素が見つかったとき</li>
<li>あとからJSで<code>data-controller</code>付きの要素がDOMに追加されたとき（第9章で詳しく扱います）</li>
</ul>
<p>connectには「このコントローラの初期化処理」を書くのが定番です。初期表示を整えたり、必要なデータを準備したりする場所になります。</p>
<p>動きを観察する道具として<code>console.log</code>を使いましょう。渡した値をコンソール欄に出力する関数で、「本当にこのコードは実行されたのか？」を確かめるデバッグの基本道具です。このアプリでは画面下のコンソール欄に出力が表示されます。今回はconnectの中でconsole.logと画面書き換えの両方を行い、「登録しただけで、呼んでいないのに動く」ことを自分の目で確かめてください。</p>`,
      task: `loggerコントローラのconnect()の中で、console.logで「connectが呼ばれました」と出力し、さらにid=logの要素に同じ文字を表示してください。実行してコンソール欄も確認しましょう。`,
      code: `<div data-controller="logger">
  <p>この要素にloggerコントローラが接続されます</p>
</div>
<p id="log">connect待ち</p>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("logger", class extends Controller {
  connect() {
    // TODO(1): console.logで「connectが呼ばれました」と出力する
    // TODO(2): id=logの要素のtextContentを「connectが呼ばれました」に変える
  }
});
<\/script>`,
      solution: `<div data-controller="logger">
  <p>この要素にloggerコントローラが接続されます</p>
</div>
<p id="log">connect待ち</p>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("logger", class extends Controller {
  connect() {
    console.log("connectが呼ばれました");
    document.getElementById("log").textContent = "connectが呼ばれました";
  }
});
<\/script>`,
      hints: [`console.log("connectが呼ばれました"); と書くとコンソール欄に出力されます`, `画面への表示は第1章と同じくdocument.getElementById("log").textContentへの代入です`],
      check: `assert($("[data-controller=logger]"), "data-controller=\\"logger\\"を持つ要素が必要です");
assert(text("#log") === "connectが呼ばれました", "接続と同時にconnect()が自動で呼ばれ、#logが「connectが呼ばれました」に変わるはずです。connectの中に処理を書きましょう");`
    },
    {
      id: 15,
      title: "コントローラ名とケバブケース",
      explanation: `<p>コントローラの名前が2語以上になるとき、Stimulusには決まった命名規約があります。HTMLに書く識別子は<strong>ケバブケース</strong>（小文字をハイフンでつなぐ）を使います。</p>
<table>
<tr><th>記法</th><th>例</th><th>使う場所</th></tr>
<tr><td>ケバブケース</td><td><code>my-counter</code></td><td>HTMLの<code>data-controller</code>とregisterの名前</td></tr>
<tr><td>キャメルケース</td><td><code>myCounter</code></td><td>JSの変数名など（識別子には使わない）</td></tr>
<tr><td>パスカルケース</td><td><code>MyCounterController</code></td><td>JSのクラス名</td></tr>
</table>
<p>なぜHTML側はケバブケースなのでしょうか。HTMLの属性値は<strong>大文字と小文字が区別されない文脈が多く</strong>、慣習としてすべて小文字＋ハイフンで書くためです。ステップ6で見た「data-user-nameがdataset.userNameになる」変換と同じ発想で、StimulusもHTML側はケバブ、JS側はキャメル・パスカルと世界ごとに記法を切り替えます。</p>
<pre><code>// JS側：登録名はケバブケース
application.register("my-counter", MyCounterController);</code></pre>
<pre><code>&lt;!-- HTML側：登録名とまったく同じ文字列 --&gt;
&lt;div data-controller="my-counter"&gt;...&lt;/div&gt;</code></pre>
<p>registerに渡した名前とdata-controllerの値がずれると、エラーも出ずにただ接続されません。「動かないときは、まず名前の完全一致を疑う」はStimulusデバッグの鉄則です。今回はHTML側の名前が誤ってキャメルケースになっているコードを直します。</p>`,
      task: `HTML側のdata-controllerの値が誤ってキャメルケース（myCounter）になっています。registerされている正しい名前（my-counter）に直して接続させてください。`,
      code: `<!-- TODO: data-controllerの値をregisterされている名前に合わせて直す -->
<div data-controller="myCounter">
  <p id="status">未接続</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("my-counter", class extends Controller {
  connect() {
    document.getElementById("status").textContent = "my-counterが接続されました";
  }
});
<\/script>`,
      solution: `<div data-controller="my-counter">
  <p id="status">未接続</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("my-counter", class extends Controller {
  connect() {
    document.getElementById("status").textContent = "my-counterが接続されました";
  }
});
<\/script>`,
      hints: [`registerの第1引数は"my-counter"です。HTML側もまったく同じ文字列にします`, `大文字のCをハイフン＋小文字に直します（myCounter→my-counter）`],
      check: `assert($('[data-controller="my-counter"]'), "data-controller=\\"my-counter\\"（ケバブケース）を持つ要素が必要です");
assert($('[data-controller="myCounter"]') === null, "キャメルケースのmyCounterが残っています。my-counterに書き換えましょう");
assert(text("#status") === "my-counterが接続されました", "名前が一致すると接続され、#statusの文字が変わるはずです");`
    },
    {
      id: 16,
      title: "コントローラのスコープ（要素の内側だけ）",
      explanation: `<p><code>data-controller</code>を付けた要素と<strong>その内側全体</strong>を、そのコントローラの<strong>スコープ</strong>（担当範囲）と呼びます。Stimulusの部品（後の章で学ぶアクションやターゲット）は、原則としてこのスコープの内側でだけ機能します。逆に、スコープの外にある要素には手を出さないのが基本姿勢です。</p>
<pre><code>&lt;div data-controller="panel"&gt;  ←ここから
  &lt;p&gt;見出し&lt;/p&gt;
  &lt;div&gt;
    &lt;p&gt;本文（入れ子の奥でもスコープ内）&lt;/p&gt;
  &lt;/div&gt;
&lt;/div&gt;                         ←ここまでがpanelの担当</code></pre>
<p>大事なポイントを2つ押さえましょう。</p>
<ul>
<li><code>data-controller</code>付きの要素<strong>1つにつき、コントローラのインスタンスが1つ</strong>作られる（そのたびにconnectが呼ばれる）</li>
<li>スコープはその要素の子孫すべてに及ぶので、内側の要素にもう一度同じ<code>data-controller</code>を付ける必要はない。付けると<strong>別のインスタンスがもう1つ</strong>でき、connectが2回呼ばれてしまう</li>
</ul>
<p>今回のコードは、外側のdivと内側のdivの両方に<code>data-controller="panel"</code>が付いているため、接続数の表示が「2」になっています。パネル全体を1つのコントローラに担当させたいだけなら、外側の1つで十分です。余分な方を削除して、インスタンスが1つだけ作られることを確認しましょう。</p>`,
      task: `内側のdivに付いている余分なdata-controller="panel"を削除して、パネル全体を外側の1つのコントローラだけが担当するようにしてください（接続数の表示が1になれば成功です）。`,
      code: `<div data-controller="panel">
  <p>パネルの見出し</p>
  <!-- TODO: 下のdivから余分なdata-controllerを削除する（外側のdivがスコープ全体を担当できる） -->
  <div data-controller="panel">
    <p>パネルの本文</p>
  </div>
</div>
<p id="status"></p>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

let connectCount = 0;

application.register("panel", class extends Controller {
  connect() {
    connectCount = connectCount + 1;
    document.getElementById("status").textContent = "接続されたコントローラの数:" + connectCount;
  }
});
<\/script>`,
      solution: `<div data-controller="panel">
  <p>パネルの見出し</p>
  <div>
    <p>パネルの本文</p>
  </div>
</div>
<p id="status"></p>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

let connectCount = 0;

application.register("panel", class extends Controller {
  connect() {
    connectCount = connectCount + 1;
    document.getElementById("status").textContent = "接続されたコントローラの数:" + connectCount;
  }
});
<\/script>`,
      hints: [`内側の<div data-controller="panel">を<div>に変えます`, `外側のdivのスコープは入れ子の奥まで届くので、内側に同じ宣言は不要です`],
      check: `assert($$('[data-controller="panel"]').length === 1, "data-controller=\\"panel\\"は外側のdivの1つだけにします。内側のdivからは属性を削除しましょう");
assert(text("#status") === "接続されたコントローラの数:1", "コントローラのインスタンスが1つだけ作られ、接続数の表示が1になるはずです");`
    },
    {
      id: 17,
      title: "同じコントローラを複数の要素に付ける",
      explanation: `<p>前のステップでは「1つの範囲に二重に付けるのは余分」という話をしました。一方で、<strong>別々の要素に同じコントローラを付ける</strong>のはStimulusの正しい使い方であり、最大の強みの1つです。</p>
<pre><code>&lt;div data-controller="card"&gt;カード1&lt;/div&gt;
&lt;div data-controller="card"&gt;カード2&lt;/div&gt;
&lt;div data-controller="card"&gt;カード3&lt;/div&gt;</code></pre>
<p>このように書くと、Stimulusは<strong>要素ごとに独立したインスタンス</strong>を3つ作り、それぞれに対してconnectを呼びます。つまり「cardコントローラのコードは1回だけ書き、使い回しはHTMLに任せる」ことができます。</p>
<p>素のDOMと比べてみましょう。第1章のやり方でカードを3枚動かすには、querySelectorAllで集めてループでリスナーを付ける、といったJS側の作業が必要でした。カードが増えるたびにJSの対応も気にする必要があります。Stimulusなら<strong>HTMLに属性を書き足すだけ</strong>で、JSは一切変わりません。</p>
<ul>
<li>コントローラのクラス＝設計図（1つだけ書く）</li>
<li>インスタンス＝設計図から作られた実体（data-controllerを付けた数だけできる）</li>
</ul>
<p>この「設計図と実体」の関係をここで体感しておくと、後の章（値やターゲットが要素ごとに独立する話）がすっと理解できます。今回は3枚のカードのうち1枚にしか属性が付いていないので、残り2枚にも付けて、3つのインスタンスが起動することを確認しましょう。</p>`,
      task: `カード2とカード3のdivにもdata-controller="card"を付けて、3つのカードすべてでコントローラが起動するようにしてください（表示が「起動したカード:3」になれば成功です）。`,
      code: `<div data-controller="card"><p>カード1</p></div>
<!-- TODO: 下の2つのdivにもdata-controller="card"を付ける -->
<div><p>カード2</p></div>
<div><p>カード3</p></div>
<p id="status">起動したカード:0</p>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

let cardCount = 0;

application.register("card", class extends Controller {
  connect() {
    cardCount = cardCount + 1;
    document.getElementById("status").textContent = "起動したカード:" + cardCount;
  }
});
<\/script>`,
      solution: `<div data-controller="card"><p>カード1</p></div>
<div data-controller="card"><p>カード2</p></div>
<div data-controller="card"><p>カード3</p></div>
<p id="status">起動したカード:0</p>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

let cardCount = 0;

application.register("card", class extends Controller {
  connect() {
    cardCount = cardCount + 1;
    document.getElementById("status").textContent = "起動したカード:" + cardCount;
  }
});
<\/script>`,
      hints: [`カード1のdivとまったく同じように、data-controller="card"を属性として書き足します`, `JS側は1文字も変更する必要がありません`],
      check: `assert($$('[data-controller="card"]').length === 3, "data-controller=\\"card\\"を持つdivが3つ必要です。カード2とカード3にも属性を付けましょう");
assert(text("#status") === "起動したカード:3", "3つの要素それぞれでconnectが呼ばれ、「起動したカード:3」と表示されるはずです");`
    },
    {
      id: 18,
      title: "this.element",
      explanation: `<p>前のステップで「インスタンスは要素ごとに独立している」と学びました。では、コントローラのコードの中から<strong>自分が接続されている要素</strong>を触るにはどうすればよいでしょうか。答えが<code>this.element</code>です。</p>
<pre><code>application.register("stamp", class extends Controller {
  connect() {
    // this.element＝data-controller="stamp"が付いているその要素
    this.element.textContent = "接続済み";
  }
});</code></pre>
<p><code>this</code>はJSのクラスで「このインスタンス自身」を指すキーワードです。そして<code>this.element</code>は、Controllerクラスから継承したプロパティで、<strong>自分のdata-controller要素そのもの</strong>を返します。中身は第1章で扱ってきた普通のDOM要素なので、<code>textContent</code>や<code>classList</code>や<code>dataset</code>がそのまま使えます。</p>
<p>ここで重要なのは、同じコントローラを複数の要素に付けた場合、<strong>各インスタンスのthis.elementはそれぞれ自分の要素だけ</strong>を指すことです。<code>document.getElementById</code>のようにページ全体から探すのではなく、「自分の担当範囲の根本」が最初から手元にある──これがスコープ（ステップ16）を実際のコードで支える仕組みです。</p>
<p>今回は2つの要素に同じコントローラを付け、connectの中でthis.elementを書き換えます。1つのクラス定義だけで、2つの要素がそれぞれ自分自身を書き換えることを確認しましょう。</p>`,
      task: `stampコントローラのconnect()の中で、this.elementのtextContentを「接続済み」に書き換えてください。2つの要素の両方が書き換われば成功です。`,
      code: `<div data-controller="stamp">1枚目のカード</div>
<div data-controller="stamp">2枚目のカード</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("stamp", class extends Controller {
  connect() {
    // TODO: this.elementのtextContentを「接続済み」に書き換える
    //       （getElementByIdは使わない。自分の要素はthis.elementで取れる）
  }
});
<\/script>`,
      solution: `<div data-controller="stamp">1枚目のカード</div>
<div data-controller="stamp">2枚目のカード</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("stamp", class extends Controller {
  connect() {
    this.element.textContent = "接続済み";
  }
});
<\/script>`,
      hints: [`this.element.textContent = "接続済み"; の1行です`, `インスタンスごとにthis.elementは別の要素を指すので、1行で2つとも書き換わります`],
      check: `const stamps = $$('[data-controller="stamp"]');
assert(stamps.length === 2, "data-controller=\\"stamp\\"を持つ要素が2つ必要です（HTML側は変更しません）");
assert(stamps[0].textContent.trim() === "接続済み", "1枚目のカードが「接続済み」に書き換わるはずです。connectの中でthis.element.textContentに代入しましょう");
assert(stamps[1].textContent.trim() === "接続済み", "2枚目のカードも「接続済み」に書き換わるはずです。this.elementは各インスタンスで自分の要素を指します");`
    },
    {
      id: 19,
      title: "コントローラのメソッドを整理する",
      explanation: `<p>コントローラはクラスなので、connect以外にも<strong>自分で好きな名前のメソッドを追加</strong>できます。同じクラス内のメソッドは<code>this.メソッド名()</code>で呼び出せます。</p>
<pre><code>application.register("profile", class extends Controller {
  connect() {
    this.render(); // 同じクラスのメソッドをthisで呼ぶ
  }

  render() {
    this.element.textContent = this.buildMessage();
  }

  buildMessage() {
    return this.element.dataset.name + "の紹介";
  }
});</code></pre>
<p>connectに処理をすべて詰め込むこともできますが、役割ごとにメソッドを分けると読みやすくなります。目安となる分け方は次の通りです。</p>
<table>
<tr><th>メソッド</th><th>役割</th></tr>
<tr><td><code>connect()</code></td><td>入口。タイミングの管理だけを行い、中身は他メソッドに任せる</td></tr>
<tr><td><code>render()</code>など</td><td>画面への反映（DOM操作）を担当</td></tr>
<tr><td><code>buildMessage()</code>など</td><td>表示内容の計算・組み立てを担当（DOMを触らない）</td></tr>
</table>
<p>「connectは薄く、仕事は専門のメソッドへ」という形にしておくと、第3章でアクション（ボタンから直接メソッドを呼ぶ仕組み）を学んだとき、同じrenderを別の入口からも呼び回せるようになります。なお、コード例に出てくる<code>dataset</code>はステップ6で学んだdata属性の読み取りです。this.elementは普通のDOM要素なので、datasetもそのまま使えます。</p>`,
      task: `profileコントローラのconnect()からthis.render()を呼び出して、用意されているメソッドたちが動くようにしてください。`,
      code: `<div data-controller="profile" data-name="Stimulus" data-role="フレームワーク">読み込み中</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("profile", class extends Controller {
  connect() {
    // TODO: this.render()を呼び出す（connectは入口として薄く保つ）
  }

  render() {
    // 画面への反映を担当
    this.element.textContent = this.buildMessage();
  }

  buildMessage() {
    // 表示内容の組み立てを担当（data属性から読み取る）
    const name = this.element.dataset.name;
    const role = this.element.dataset.role;
    return name + "は" + role + "です";
  }
});
<\/script>`,
      solution: `<div data-controller="profile" data-name="Stimulus" data-role="フレームワーク">読み込み中</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("profile", class extends Controller {
  connect() {
    this.render();
  }

  render() {
    // 画面への反映を担当
    this.element.textContent = this.buildMessage();
  }

  buildMessage() {
    // 表示内容の組み立てを担当（data属性から読み取る）
    const name = this.element.dataset.name;
    const role = this.element.dataset.role;
    return name + "は" + role + "です";
  }
});
<\/script>`,
      hints: [`connectの中に this.render(); と書くだけです`, `同じクラスのメソッドを呼ぶときは必ずthis.を付けます`],
      check: `assert($('[data-controller="profile"]'), "data-controller=\\"profile\\"を持つ要素が必要です");
assert(text('[data-controller="profile"]') === "Stimulusはフレームワークです", "connectからrenderが呼ばれると、表示が「Stimulusはフレームワークです」になるはずです。this.render()の呼び出しを追加しましょう");`
    },
    {
      id: 20,
      title: "総合演習：あいさつコントローラ",
      explanation: `<p>第2章の総仕上げです。<strong>接続されると、自分のdata-name属性を読んであいさつ文を表示する</strong>greetingコントローラを完成させます。仕様は次の通りです。</p>
<ul>
<li>各greeting要素は<code>data-name</code>属性に名前を持つ</li>
<li>接続されたら、要素内の<code>&lt;p class="greet-output"&gt;</code>に「こんにちは、太郎さん！」の形式で表示する</li>
<li>同じコントローラを2つの要素に付け、それぞれが自分の名前であいさつする</li>
</ul>
<p>使う道具の整理です。</p>
<table>
<tr><th>やること</th><th>使う道具</th><th>学んだステップ</th></tr>
<tr><td>接続時に処理する</td><td><code>connect()</code></td><td>14</td></tr>
<tr><td>自分の要素を取る</td><td><code>this.element</code></td><td>18</td></tr>
<tr><td>data属性を読む</td><td><code>dataset</code></td><td>6</td></tr>
<tr><td>出力先の要素を探す</td><td><code>querySelector</code></td><td>1</td></tr>
</table>
<p>1つだけ新しい組み合わせがあります。querySelectorは<code>document</code>だけでなく<strong>任意の要素からも呼べ</strong>、その場合は<strong>その要素の内側だけ</strong>を探します。</p>
<pre><code>this.element.querySelector(".greet-output")
// →自分のスコープ内のgreet-outputだけが見つかる</code></pre>
<p>同じクラスの要素がページに2つあっても、this.elementから探せば必ず「自分の中の1つ」が取れます。これはまさにステップ16のスコープの考え方です（第4章では、これをもっと宣言的にするターゲットという仕組みを学びます）。それでは、TODOを3つ埋めて完成させましょう。</p>`,
      task: `greetingコントローラのconnect()を完成させてください。this.elementのdata-nameを読み取り、自分の中の.greet-output要素に「こんにちは、〇〇さん！」と表示します。2つの要素がそれぞれの名前であいさつすれば成功です。`,
      code: `<div data-controller="greeting" data-name="太郎">
  <p class="greet-output"></p>
</div>
<div data-controller="greeting" data-name="花子">
  <p class="greet-output"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("greeting", class extends Controller {
  connect() {
    // TODO(1): this.element.dataset.nameで名前を読み取る
    // TODO(2): this.element.querySelector(".greet-output")で出力先を取得する
    // TODO(3): 出力先に「こんにちは、〇〇さん！」と表示する（+で連結）
  }
});
<\/script>`,
      solution: `<div data-controller="greeting" data-name="太郎">
  <p class="greet-output"></p>
</div>
<div data-controller="greeting" data-name="花子">
  <p class="greet-output"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("greeting", class extends Controller {
  connect() {
    const name = this.element.dataset.name;
    const output = this.element.querySelector(".greet-output");
    output.textContent = "こんにちは、" + name + "さん！";
  }
});
<\/script>`,
      hints: [`const name = this.element.dataset.name; で名前が取れます`, `出力はoutput.textContent = "こんにちは、" + name + "さん！"; です。「！」まで忘れずに`],
      check: `const outputs = $$(".greet-output");
assert(outputs.length === 2, "class=greet-outputの<p>要素が2つ必要です（HTML側は変更しません）");
assert(outputs[0].textContent.trim() === "こんにちは、太郎さん！", "1つ目の要素には「こんにちは、太郎さん！」と表示されるはずです。dataset.nameを読み取り+で連結しましょう");
assert(outputs[1].textContent.trim() === "こんにちは、花子さん！", "2つ目の要素には「こんにちは、花子さん！」と表示されるはずです。this.elementから探せば自分のスコープ内のgreet-outputが取れます");`
    }
  ]
});
