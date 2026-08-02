// 第4章：ターゲット
registerChapter({
  number: 4,
  title: "ターゲット",
  description: "static targetsとdata-x-target属性で、コントローラ内の重要な要素に名前を付けて参照する方法を学びます。",
  steps: [
    {
      id: 31,
      title: "static targetsとdata-x-target",
      explanation: `<p>ここまでは、コントローラ内の要素を<code>this.element.querySelector("#output")</code>のように取得してきました。この方法には弱点があります。セレクタが文字列なので、HTMLのidやクラス名を変えると<strong>気づかないうちに壊れる</strong>のです。</p>
<p>Stimulusにはこの問題を解決する仕組み、<strong>ターゲット</strong>があります。「このコントローラにとって重要な要素」に名前を付けて登録する仕組みです。設定は2か所に書きます。</p>
<p>まず、コントローラ側で<code>static targets</code>にターゲット名の配列を宣言します。</p>
<pre><code>application.register("hello", class extends Controller {
  static targets = ["output"];
});</code></pre>
<p>次に、HTML側で対象の要素に<code>data-コントローラ名-target="ターゲット名"</code>という属性を付けます。</p>
<pre><code>&lt;div data-controller="hello"&gt;
  &lt;p data-hello-target="output"&gt;&lt;/p&gt;
&lt;/div&gt;</code></pre>
<p>属性名にコントローラ名（hello）が入っている点に注目してください。これにより「どのコントローラのターゲットか」が明確になります。ターゲットの探索範囲は、data-controllerを付けた要素の内側だけです（第2章で学んだスコープと同じです）。</p>
<p>2か所の宣言がそろうと、コントローラの中で<code>this.outputTarget</code>という形で要素を参照できるようになります。詳しくは次のステップで学びます。</p>`,
      task: `p要素にdata-hello-target="output"を追加して、コントローラのoutputターゲットとして登録してください。接続時に「ターゲットと接続できました」と表示されれば成功です。`,
      code: `<div data-controller="hello">
  <!-- TODO: このp要素にdata-hello-target="output"を追加する -->
  <p></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("hello", class extends Controller {
  static targets = ["output"];
  connect() {
    this.outputTarget.textContent = "ターゲットと接続できました";
  }
});
<\/script>`,
      solution: `<div data-controller="hello">
  <p data-hello-target="output"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("hello", class extends Controller {
  static targets = ["output"];
  connect() {
    this.outputTarget.textContent = "ターゲットと接続できました";
  }
});
<\/script>`,
      hints: [
        `属性名は「data-コントローラ名-target」、値は「ターゲット名」です`,
        `<p data-hello-target="output"></p>となります`
      ],
      check: `assert($("[data-hello-target=output]"), "p要素にdata-hello-target='output'を追加してください");
await sleep(50);
assert(text("p") === "ターゲットと接続できました", "属性を正しく付けると、接続時に<p>へ「ターゲットと接続できました」と表示されるはずです");`
    },
    {
      id: 32,
      title: "this.xxxTargetで参照する",
      explanation: `<p><code>static targets = ["message"]</code>と宣言すると、Stimulusはコントローラに<strong><code>this.messageTarget</code>というプロパティを自動で生成</strong>します。命名規則は「ターゲット名＋Target」です。</p>
<table>
  <tr><th>宣言</th><th>生成されるプロパティ</th><th>返すもの</th></tr>
  <tr><td><code>static targets = ["message"]</code></td><td><code>this.messageTarget</code></td><td>最初に見つかった要素</td></tr>
  <tr><td><code>static targets = ["output"]</code></td><td><code>this.outputTarget</code></td><td>最初に見つかった要素</td></tr>
</table>
<p><code>this.messageTarget</code>が返すのは普通のDOM要素なので、第1章で学んだ<code>textContent</code>などのプロパティがそのまま使えます。</p>
<pre><code>greet() {
  this.messageTarget.textContent = "ようこそ！";
}</code></pre>
<p><code>this.element.querySelector("#message")</code>と比べたときの利点を押さえましょう。</p>
<ul>
  <li>idやクラス名に依存しないので、HTMLの見た目の変更に強い</li>
  <li>「このコントローラが使う要素」であることがHTML属性から一目でわかる</li>
  <li>該当する要素がないときは明確なエラーになるので、壊れたことにすぐ気づける</li>
</ul>
<p>注意点として、ターゲットの要素が存在しない状態で<code>this.messageTarget</code>にアクセスすると「Missing target element」というエラーが発生します。存在しない可能性がある場合の対処はステップ34で学びます。</p>`,
      task: `greetメソッドの中身を書いて、ボタンを押すとmessageターゲットに「ようこそ！」と表示されるようにしてください。`,
      code: `<div data-controller="welcome">
  <button data-action="welcome#greet">入室する</button>
  <p data-welcome-target="message"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("welcome", class extends Controller {
  static targets = ["message"];
  greet() {
    // TODO: this.messageTargetのtextContentを「ようこそ！」にする
  }
});
<\/script>`,
      solution: `<div data-controller="welcome">
  <button data-action="welcome#greet">入室する</button>
  <p data-welcome-target="message"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("welcome", class extends Controller {
  static targets = ["message"];
  greet() {
    this.messageTarget.textContent = "ようこそ！";
  }
});
<\/script>`,
      hints: [
        `ターゲット名がmessageなら、this.messageTargetで要素を参照できます`,
        `this.messageTarget.textContent = "ようこそ！";と書きます`
      ],
      check: `assert($("[data-welcome-target=message]"), "data-welcome-target='message'の要素が必要です");
click("button");
await sleep(50);
assert(text("[data-welcome-target=message]") === "ようこそ！", "ボタンを押すとmessageターゲットに「ようこそ！」と表示されるはずです");`
    },
    {
      id: 33,
      title: "複数ターゲット（xxxTargets）",
      explanation: `<p>同じターゲット名を<strong>複数の要素</strong>に付けることもできます。リストの項目などでよく使うパターンです。</p>
<pre><code>&lt;ul&gt;
  &lt;li data-list-target="item"&gt;りんご&lt;/li&gt;
  &lt;li data-list-target="item"&gt;みかん&lt;/li&gt;
  &lt;li data-list-target="item"&gt;バナナ&lt;/li&gt;
&lt;/ul&gt;</code></pre>
<p>このとき使うのが<strong>複数形のプロパティ<code>this.itemTargets</code></strong>です。単数形との違いを整理しましょう。</p>
<table>
  <tr><th>プロパティ</th><th>返すもの</th><th>要素が0個のとき</th></tr>
  <tr><td><code>this.itemTarget</code></td><td>最初の1つの要素</td><td>エラーになる</td></tr>
  <tr><td><code>this.itemTargets</code></td><td>該当する全要素の配列</td><td>空の配列<code>[]</code></td></tr>
</table>
<p><code>this.itemTargets</code>は普通のJavaScript配列なので、<code>length</code>で個数を数えられます。</p>
<pre><code>count() {
  console.log(this.itemTargets.length); // 3
}</code></pre>
<p>1つのstatic targets宣言で単数形・複数形の両方のプロパティが生成されるため、宣言は<code>static targets = ["item"]</code>のままで構いません。なお、ターゲット名は複数あっても単数形（item）で宣言するのがStimulusの慣例です。プロパティ名の側で単数・複数を使い分けます。</p>`,
      task: `countメソッドの中身を書いて、ボタンを押すとitemターゲットの個数が「◯個の項目があります」とtotalターゲットに表示されるようにしてください。`,
      code: `<div data-controller="list">
  <ul>
    <li data-list-target="item">りんご</li>
    <li data-list-target="item">みかん</li>
    <li data-list-target="item">バナナ</li>
  </ul>
  <button data-action="list#count">数える</button>
  <p data-list-target="total"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("list", class extends Controller {
  static targets = ["item", "total"];
  count() {
    // TODO: this.itemTargets.lengthを使って
    // totalターゲットに「◯個の項目があります」と表示する
  }
});
<\/script>`,
      solution: `<div data-controller="list">
  <ul>
    <li data-list-target="item">りんご</li>
    <li data-list-target="item">みかん</li>
    <li data-list-target="item">バナナ</li>
  </ul>
  <button data-action="list#count">数える</button>
  <p data-list-target="total"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("list", class extends Controller {
  static targets = ["item", "total"];
  count() {
    this.totalTarget.textContent = this.itemTargets.length + "個の項目があります";
  }
});
<\/script>`,
      hints: [
        `複数形のthis.itemTargetsは配列なので、.lengthで個数が取れます`,
        `this.totalTarget.textContent = this.itemTargets.length + "個の項目があります";と書きます`
      ],
      check: `assert($$("[data-list-target=item]").length === 3, "data-list-target='item'のli要素が3つ必要です");
click("button");
await sleep(50);
assert(text("[data-list-target=total]") === "3個の項目があります", "ボタンを押すとtotalターゲットに「3個の項目があります」と表示されるはずです");`
    },
    {
      id: 34,
      title: "hasXxxTarget（存在チェック）",
      explanation: `<p>ステップ32で触れた通り、ターゲットの要素が存在しないのに<code>this.noteTarget</code>のような単数形プロパティへアクセスすると、<strong>「Missing target element」エラー</strong>が発生して処理が止まってしまいます。</p>
<p>「あるかもしれないし、ないかもしれない」要素を安全に扱うために、Stimulusは<strong><code>this.hasXxxTarget</code></strong>というプロパティも自動生成しています。ターゲットが存在すれば<code>true</code>、なければ<code>false</code>を返します。</p>
<pre><code>show() {
  if (this.hasNoteTarget) {
    // noteターゲットがあるときだけ使う
    console.log(this.noteTarget.textContent);
  } else {
    console.log("メモはありません");
  }
}</code></pre>
<p>1つのターゲット名から生成されるプロパティを整理すると、次の3点セットになります。</p>
<table>
  <tr><th>プロパティ</th><th>内容</th></tr>
  <tr><td><code>this.noteTarget</code></td><td>最初の1つ（ないとエラー）</td></tr>
  <tr><td><code>this.noteTargets</code></td><td>全要素の配列（ないと空配列）</td></tr>
  <tr><td><code>this.hasNoteTarget</code></td><td>存在すればtrue</td></tr>
</table>
<p>同じコントローラをいろいろなHTMLで再利用する場合、「この画面ではメモ欄がない」といった構成の違いはよく起こります。単数形ターゲットを使う前に<code>hasXxxTarget</code>で確認する習慣を付けると、壊れにくいコントローラになります。</p>`,
      task: `showメソッドを修正して、noteターゲットがあればその内容を、なければ「メモはありません」をstatusターゲットに表示するようにしてください。このHTMLにはnoteターゲットがないので、ボタンを押すと「メモはありません」と表示されれば成功です。`,
      code: `<div data-controller="profile">
  <p>名前：山田太郎</p>
  <button data-action="profile#show">メモを表示</button>
  <p data-profile-target="status"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("profile", class extends Controller {
  static targets = ["note", "status"];
  show() {
    // TODO: this.hasNoteTargetで存在を確認してから使うように直す
    // ない場合はstatusターゲットに「メモはありません」と表示する
    this.statusTarget.textContent = this.noteTarget.textContent;
  }
});
<\/script>`,
      solution: `<div data-controller="profile">
  <p>名前：山田太郎</p>
  <button data-action="profile#show">メモを表示</button>
  <p data-profile-target="status"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("profile", class extends Controller {
  static targets = ["note", "status"];
  show() {
    if (this.hasNoteTarget) {
      this.statusTarget.textContent = this.noteTarget.textContent;
    } else {
      this.statusTarget.textContent = "メモはありません";
    }
  }
});
<\/script>`,
      hints: [
        `if (this.hasNoteTarget) { ... } else { ... }の形で分岐します`,
        `elseの側でthis.statusTarget.textContent = "メモはありません";とします`
      ],
      check: `assert($("[data-profile-target=status]"), "data-profile-target='status'の要素が必要です");
click("button");
await sleep(50);
assert(text("[data-profile-target=status]") === "メモはありません", "noteターゲットがないHTMLなので、ボタンを押すと「メモはありません」と表示されるはずです。hasNoteTargetで存在チェックしてから使いましょう");`
    },
    {
      id: 35,
      title: "ターゲットのvalueを読む（フォーム入力）",
      explanation: `<p>ターゲットが返すのは普通のDOM要素なので、input要素をターゲットにすれば<strong><code>.value</code>で入力内容を読めます</strong>。第1章で学んだ「input要素のvalue」と、この章のターゲットの組み合わせです。</p>
<pre><code>&lt;div data-controller="greeting"&gt;
  &lt;input type="text" data-greeting-target="name"&gt;
  &lt;button data-action="greeting#greet"&gt;あいさつ&lt;/button&gt;
&lt;/div&gt;</code></pre>
<pre><code>greet() {
  console.log(this.nameTarget.value); // 入力欄の現在の内容
}</code></pre>
<p>第3章では<code>input</code>イベントの<code>event.target.value</code>で入力値を読みました。今回の方法との使い分けを整理しましょう。</p>
<table>
  <tr><th>方法</th><th>向いている場面</th></tr>
  <tr><td><code>event.target.value</code></td><td>入力欄自身のイベント（inputなど）に反応するとき</td></tr>
  <tr><td><code>this.nameTarget.value</code></td><td>別の要素（ボタンなど）のイベントから入力値を読むとき</td></tr>
</table>
<p>今回のように「ボタンを押した瞬間に入力欄の値を読む」場合、イベントが起きたのはボタンなので<code>event.target</code>はボタンを指してしまい、入力値は取れません。こういうときこそターゲットの出番です。ボタンのメソッドから<code>this.nameTarget.value</code>で入力欄に直接アクセスできます。</p>`,
      task: `greetメソッドの中身を書いて、ボタンを押すと「こんにちは、◯◯さん！」（◯◯は入力された名前）とoutputターゲットに表示されるようにしてください。`,
      code: `<div data-controller="greeting">
  <input type="text" data-greeting-target="name" placeholder="名前を入力">
  <button data-action="greeting#greet">あいさつ</button>
  <p data-greeting-target="output"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("greeting", class extends Controller {
  static targets = ["name", "output"];
  greet() {
    // TODO: this.nameTarget.valueを使って
    // outputターゲットに「こんにちは、◯◯さん！」と表示する
  }
});
<\/script>`,
      solution: `<div data-controller="greeting">
  <input type="text" data-greeting-target="name" placeholder="名前を入力">
  <button data-action="greeting#greet">あいさつ</button>
  <p data-greeting-target="output"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("greeting", class extends Controller {
  static targets = ["name", "output"];
  greet() {
    this.outputTarget.textContent = "こんにちは、" + this.nameTarget.value + "さん！";
  }
});
<\/script>`,
      hints: [
        `入力値はthis.nameTarget.valueで読めます`,
        `"こんにちは、" + this.nameTarget.value + "さん！"のように+で文字列を連結します`
      ],
      check: `assert($("[data-greeting-target=name]"), "input要素にdata-greeting-target='name'が必要です");
setValue("[data-greeting-target=name]", "花子");
await sleep(50);
click("button");
await sleep(50);
assert(text("[data-greeting-target=output]") === "こんにちは、花子さん！", "「花子」と入力してボタンを押すと「こんにちは、花子さん！」と表示されるはずです");
setValue("[data-greeting-target=name]", "太郎");
await sleep(50);
click("button");
await sleep(50);
assert(text("[data-greeting-target=output]") === "こんにちは、太郎さん！", "入力した名前がそのまま表示に使われるはずです");`
    },
    {
      id: 36,
      title: "ターゲットのtextContentを書き換える",
      explanation: `<p>ターゲットは<strong>読むことも書くこともできます</strong>。今回は「表示されている値を読んで、計算して、書き戻す」というパターンを練習します。</p>
<p>題材はクリックカウンタです。現在のカウントはspan要素の中に表示されています。</p>
<pre><code>&lt;p&gt;押した回数：&lt;span data-counter-target="count"&gt;0&lt;/span&gt;&lt;/p&gt;</code></pre>
<p>ボタンが押されたら、次の3段階で処理します。</p>
<ol>
  <li><code>this.countTarget.textContent</code>で現在の表示（文字列）を読む</li>
  <li><code>Number()</code>で数値に変換して1を足す</li>
  <li>結果を<code>this.countTarget.textContent</code>に書き戻す</li>
</ol>
<pre><code>increment() {
  const now = Number(this.countTarget.textContent);
  this.countTarget.textContent = now + 1;
}</code></pre>
<p><code>textContent</code>で読んだ値は常に<strong>文字列</strong>である点に注意してください。<code>"0" + 1</code>は文字列連結になって<code>"01"</code>になってしまいます。<code>Number("0") + 1</code>なら数値の計算で<code>1</code>になります。</p>
<p>ステップ23ではカウントをインスタンス変数（this.count）に持ちましたが、今回は<strong>DOM自体が現在値を持っています</strong>。画面に見えている値と内部の値がズレる心配がない、というのがこの方式の利点です。この「状態はDOMに置く」という考え方は、後の章（values）でさらに発展します。</p>`,
      task: `incrementメソッドの中身を書いて、ボタンを押すたびにcountターゲットの数字が1ずつ増えるようにしてください。`,
      code: `<div data-controller="counter">
  <p>押した回数：<span data-counter-target="count">0</span></p>
  <button data-action="counter#increment">カウント</button>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("counter", class extends Controller {
  static targets = ["count"];
  increment() {
    // TODO: countターゲットの現在値をNumber()で数値にして、
    // 1を足した結果をtextContentに書き戻す
  }
});
<\/script>`,
      solution: `<div data-controller="counter">
  <p>押した回数：<span data-counter-target="count">0</span></p>
  <button data-action="counter#increment">カウント</button>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("counter", class extends Controller {
  static targets = ["count"];
  increment() {
    const now = Number(this.countTarget.textContent);
    this.countTarget.textContent = now + 1;
  }
});
<\/script>`,
      hints: [
        `const now = Number(this.countTarget.textContent);で現在値を数値として取り出します`,
        `this.countTarget.textContent = now + 1;で書き戻します`
      ],
      check: `assert($("[data-counter-target=count]"), "span要素にdata-counter-target='count'が必要です");
click("button");
await sleep(50);
assert(text("[data-counter-target=count]") === "1", "ボタンを1回押すと表示が「1」になるはずです。「01」になる場合はNumber()での変換を忘れていませんか");
click("button");
await sleep(50);
assert(text("[data-counter-target=count]") === "2", "ボタンを2回押すと表示が「2」になるはずです");`
    },
    {
      id: 37,
      title: "複数ターゲットの一括操作（xxxTargetsのforEach）",
      explanation: `<p>ステップ33で学んだ複数形の<code>this.itemTargets</code>は普通のJavaScript配列なので、<strong>配列メソッドがすべて使えます</strong>。中でも一番よく使うのが、全要素に同じ処理を行う<code>forEach</code>です。</p>
<pre><code>completeAll() {
  this.itemTargets.forEach((item) =&gt; {
    item.textContent = item.textContent + "（完了）";
  });
}</code></pre>
<p><code>forEach</code>は「配列の各要素を順番に取り出して、関数に渡して実行する」メソッドです。<code>(item) =&gt; { ... }</code>はアロー関数で、<code>item</code>に各ターゲット要素（DOM要素）が1つずつ入ってきます。</p>
<p>素のDOMで同じことをする場合と比べてみましょう。</p>
<table>
  <tr><th>方法</th><th>書き方</th></tr>
  <tr><td>素のDOM</td><td><code>this.element.querySelectorAll("li")</code>で集めてループ</td></tr>
  <tr><td>Stimulus</td><td><code>this.itemTargets.forEach(...)</code></td></tr>
</table>
<p>querySelectorAllは「li要素すべて」のようにタグやクラスで選ぶため、後から関係ないli要素が追加されると誤って巻き込みます。ターゲットなら<code>data-tasks-target="item"</code>を付けた要素だけが対象なので、<strong>操作したい要素を明示的に選べる</strong>のが利点です。</p>
<p><code>forEach</code>のほかにも、<code>filter</code>（条件を満たす要素だけ集める）や<code>every</code>（全要素が条件を満たすか調べる）などの配列メソッドが同じように使えます。これらは後の章のフォーム検証などで活躍します。</p>`,
      task: `completeAllメソッドの中身を書いて、「すべて完了」ボタンを押すと全項目の末尾に「（完了）」が付くようにしてください。`,
      code: `<div data-controller="tasks">
  <ul>
    <li data-tasks-target="item">洗濯</li>
    <li data-tasks-target="item">掃除</li>
    <li data-tasks-target="item">買い物</li>
  </ul>
  <button data-action="tasks#completeAll">すべて完了</button>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("tasks", class extends Controller {
  static targets = ["item"];
  completeAll() {
    // TODO: this.itemTargets.forEachを使って、
    // 各項目のtextContentの末尾に「（完了）」を付ける
  }
});
<\/script>`,
      solution: `<div data-controller="tasks">
  <ul>
    <li data-tasks-target="item">洗濯</li>
    <li data-tasks-target="item">掃除</li>
    <li data-tasks-target="item">買い物</li>
  </ul>
  <button data-action="tasks#completeAll">すべて完了</button>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("tasks", class extends Controller {
  static targets = ["item"];
  completeAll() {
    this.itemTargets.forEach((item) => {
      item.textContent = item.textContent + "（完了）";
    });
  }
});
<\/script>`,
      hints: [
        `this.itemTargets.forEach((item) => { ... });の形で全要素を順に処理します`,
        `各要素にはitem.textContent = item.textContent + "（完了）";で末尾に追記します`
      ],
      check: `const items = $$("[data-tasks-target=item]");
assert(items.length === 3, "data-tasks-target='item'のli要素が3つ必要です");
click("button");
await sleep(50);
assert(text("[data-tasks-target=item]") === "洗濯（完了）", "ボタンを押すと1つ目の項目が「洗濯（完了）」になるはずです");
assert(items.every((item) => item.textContent.trim().endsWith("（完了）")), "ボタンを押すとすべての項目の末尾に「（完了）」が付くはずです。forEachで全要素を処理しましょう");`
    },
    {
      id: 38,
      title: "ターゲットとquerySelectorの使い分け",
      explanation: `<p>ターゲットを学んだ今、「じゃあquerySelectorはもう不要？」という疑問が出てきます。答えは「役割が違うので使い分ける」です。指針を整理しましょう。</p>
<table>
  <tr><th>観点</th><th>ターゲット</th><th>querySelector</th></tr>
  <tr><td>対象</td><td>コントローラの構造上重要な要素</td><td>任意のセレクタで柔軟に検索</td></tr>
  <tr><td>HTML変更への強さ</td><td>強い（id・クラスに依存しない）</td><td>弱い（セレクタ変更で壊れる）</td></tr>
  <tr><td>意図の見えやすさ</td><td>属性を見れば「JSが使う要素」とわかる</td><td>JSを読まないとわからない</td></tr>
  <tr><td>要素がないとき</td><td>hasXxxTargetで安全に確認できる</td><td>nullが返り、気づきにくい</td></tr>
</table>
<p>基本方針は次の通りです。</p>
<ul>
  <li><strong>コントローラが継続的に読み書きする要素→ターゲット</strong>（出力欄・入力欄・リスト項目など）</li>
  <li>一時的・例外的な検索、動的に生成した要素の内部検索など→querySelector</li>
</ul>
<p>特に重要なのは「意図の見えやすさ」です。<code>data-quiz-target="result"</code>という属性が付いていれば、HTMLを編集する人は「この要素はJavaScriptから使われている。うかつに消せない」と気づけます。<code>id="result"</code>ではその意図は伝わりません。</p>
<p>今回は、第3章まで使ってきたquerySelector方式のコードをターゲット方式に書き換える練習をします。実務のリファクタリングでもよくある作業です。</p>`,
      task: `querySelectorで#resultを取得しているコードを、ターゲット方式に書き換えてください。static targetsの宣言、HTMLへのdata-quiz-target属性の追加、this.resultTargetへの置き換えの3点セットです。`,
      code: `<div data-controller="quiz">
  <p>問題：人生・宇宙・すべての答えは？</p>
  <button data-action="quiz#answer">答えを見る</button>
  <!-- TODO(2): このp要素にdata-quiz-target="result"を追加する -->
  <p id="result"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("quiz", class extends Controller {
  // TODO(1): static targets = ["result"]; を宣言する
  answer() {
    // TODO(3): querySelectorをthis.resultTargetに置き換える
    this.element.querySelector("#result").textContent = "答えは42です";
  }
});
<\/script>`,
      solution: `<div data-controller="quiz">
  <p>問題：人生・宇宙・すべての答えは？</p>
  <button data-action="quiz#answer">答えを見る</button>
  <p data-quiz-target="result"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("quiz", class extends Controller {
  static targets = ["result"];
  answer() {
    this.resultTarget.textContent = "答えは42です";
  }
});
<\/script>`,
      hints: [
        `クラスの先頭にstatic targets = ["result"];を宣言し、p要素にdata-quiz-target="result"を追加します`,
        `answerメソッドではthis.resultTarget.textContent = "答えは42です";とします`
      ],
      check: `assert($("[data-quiz-target=result]"), "p要素にdata-quiz-target='result'を追加してターゲットとして登録してください");
click("button");
await sleep(50);
assert(text("[data-quiz-target=result]") === "答えは42です", "ボタンを押すとresultターゲットに「答えは42です」と表示されるはずです");`
    },
    {
      id: 39,
      title: "ターゲット名の命名（キャメルケースとケバブ）",
      explanation: `<p>2語以上のターゲット名を付けるとき、<strong>どこをキャメルケースにし、どこをケバブケースにするか</strong>を正しく理解しておく必要があります。</p>
<p>ルールはこうです。</p>
<ul>
  <li><strong>コントローラ名</strong>：ケバブケース（例：<code>user-card</code>）。第2章で学んだ通りです</li>
  <li><strong>ターゲット名</strong>：キャメルケース（例：<code>fullName</code>）。<strong>HTML属性の値でもキャメルケースのまま</strong>書きます</li>
</ul>
<p>具体例で確認しましょう。</p>
<table>
  <tr><th>場所</th><th>書き方</th></tr>
  <tr><td>JS：宣言</td><td><code>static targets = ["fullName"]</code></td></tr>
  <tr><td>HTML：属性</td><td><code>data-user-card-target="fullName"</code></td></tr>
  <tr><td>JS：参照</td><td><code>this.fullNameTarget</code></td></tr>
</table>
<p>間違いやすいのは、HTML側で<code>data-user-card-target="full-name"</code>のように<strong>属性の値までケバブケースにしてしまう</strong>ことです。属性の「名前」の部分（data-user-card-target）はコントローラ名由来なのでケバブケースですが、属性の「値」（fullName）はJSの宣言と文字単位で一致させる必要があります。</p>
<p>値が一致しないとStimulusはターゲットを見つけられず、<code>this.fullNameTarget</code>へのアクセスは「Missing target element」エラーになります。動かないときは、JSの宣言・HTMLの属性値・プロパティ名の3か所のつづりを見比べてください。</p>`,
      task: `HTMLのターゲット属性の値が間違っているため、ボタンを押すとエラーになります。JS側の宣言と一致するように直して、名前が表示されるようにしてください。`,
      code: `<div data-controller="user-card">
  <button data-action="user-card#show">名前を表示</button>
  <!-- TODO: ターゲット名をJS側の宣言と同じ表記に直す -->
  <p data-user-card-target="full-name"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("user-card", class extends Controller {
  static targets = ["fullName"];
  show() {
    this.fullNameTarget.textContent = "山田太郎";
  }
});
<\/script>`,
      solution: `<div data-controller="user-card">
  <button data-action="user-card#show">名前を表示</button>
  <p data-user-card-target="fullName"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("user-card", class extends Controller {
  static targets = ["fullName"];
  show() {
    this.fullNameTarget.textContent = "山田太郎";
  }
});
<\/script>`,
      hints: [
        `ターゲット名は属性の値でもキャメルケースのまま書きます`,
        `data-user-card-target="fullName"に直します`
      ],
      check: `assert($("[data-user-card-target=fullName]"), "ターゲット名はJS側の宣言と同じキャメルケース（fullName）で書きます。data-user-card-target='fullName'に直してください");
click("button");
await sleep(50);
assert(text("[data-user-card-target=fullName]") === "山田太郎", "ボタンを押すと「山田太郎」と表示されるはずです");`
    },
    {
      id: 40,
      title: "総合演習：BMI計算フォーム",
      explanation: `<p>第4章の総合演習です。ターゲットを活用して<strong>BMI計算フォーム</strong>を作ります。</p>
<p>完成イメージ：身長（cm）と体重（kg）を入力して「計算」ボタンを押すと、「BMIは◯◯です」と表示されます。</p>
<p>BMI（体格指数）の計算式は次の通りです。</p>
<pre><code>BMI = 体重(kg) ÷ (身長(m) × 身長(m))</code></pre>
<p>入力はcm単位なので、<strong>100で割ってm単位に直してから</strong>計算します。使う知識を整理しましょう。</p>
<table>
  <tr><th>やること</th><th>使う知識</th><th>学んだステップ</th></tr>
  <tr><td>入力欄・出力欄に名前を付ける</td><td><code>static targets</code>とdata属性</td><td>ステップ31</td></tr>
  <tr><td>ボタンから入力値を読む</td><td><code>this.heightTarget.value</code></td><td>ステップ35</td></tr>
  <tr><td>文字列を数値に変換</td><td><code>Number()</code></td><td>ステップ36</td></tr>
  <tr><td>結果を表示する</td><td><code>this.resultTarget.textContent</code></td><td>ステップ32</td></tr>
</table>
<p>計算結果は小数が長く続くことがあるため、<code>toFixed(1)</code>で小数第1位までに整形します。<code>toFixed</code>は数値を指定した桁数の文字列にするメソッドです（例：<code>(21.972).toFixed(1)</code>は<code>"22.0"</code>）。</p>
<pre><code>const bmi = weight / (height * height);
this.resultTarget.textContent = "BMIは" + bmi.toFixed(1) + "です";</code></pre>
<p>3つのターゲット（height・weight・result）とアクションを組み合わせる、この章の集大成です。</p>`,
      task: `calculateメソッドのTODO(1)〜(3)を埋めて、BMI計算フォームを完成させてください。身長160cm・体重51.2kgで「BMIは20.0です」と表示されれば成功です。`,
      code: `<div data-controller="bmi">
  <p>身長：<input type="number" data-bmi-target="height"> cm</p>
  <p>体重：<input type="number" data-bmi-target="weight"> kg</p>
  <button data-action="bmi#calculate">計算</button>
  <p data-bmi-target="result"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("bmi", class extends Controller {
  static targets = ["height", "weight", "result"];
  calculate() {
    // TODO(1): heightターゲットのvalueをNumber()で数値にして100で割り、m単位にする
    // TODO(2): weightターゲットのvalueを数値にして、BMI = 体重 ÷ (身長 × 身長) を計算する
    // TODO(3): resultターゲットに「BMIは◯◯です」と表示する（toFixed(1)で整形）
  }
});
<\/script>`,
      solution: `<div data-controller="bmi">
  <p>身長：<input type="number" data-bmi-target="height"> cm</p>
  <p>体重：<input type="number" data-bmi-target="weight"> kg</p>
  <button data-action="bmi#calculate">計算</button>
  <p data-bmi-target="result"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("bmi", class extends Controller {
  static targets = ["height", "weight", "result"];
  calculate() {
    const height = Number(this.heightTarget.value) / 100;
    const weight = Number(this.weightTarget.value);
    const bmi = weight / (height * height);
    this.resultTarget.textContent = "BMIは" + bmi.toFixed(1) + "です";
  }
});
<\/script>`,
      hints: [
        `const height = Number(this.heightTarget.value) / 100; const weight = Number(this.weightTarget.value);で数値を取り出します`,
        `const bmi = weight / (height * height);で計算し、"BMIは" + bmi.toFixed(1) + "です"を表示します`
      ],
      check: `assert($("[data-bmi-target=height]"), "data-bmi-target='height'のinput要素が必要です");
assert($("[data-bmi-target=weight]"), "data-bmi-target='weight'のinput要素が必要です");
setValue("[data-bmi-target=height]", "160");
setValue("[data-bmi-target=weight]", "51.2");
await sleep(50);
click("button");
await sleep(50);
assert(text("[data-bmi-target=result]") === "BMIは20.0です", "身長160cm・体重51.2kgなら「BMIは20.0です」と表示されるはずです。身長は100で割ってm単位にしましたか");
setValue("[data-bmi-target=height]", "170");
setValue("[data-bmi-target=weight]", "65");
await sleep(50);
click("button");
await sleep(50);
assert(text("[data-bmi-target=result]") === "BMIは22.5です", "身長170cm・体重65kgなら「BMIは22.5です」と表示されるはずです");`
    }
  ]
});
