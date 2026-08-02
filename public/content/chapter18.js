// 第18章：設計パターン
registerChapter({
  number: 18,
  title: "設計パターン",
  description: "単一責任・汎用化・命名規約・プライベートメソッド・ロジック分離など、保守しやすく再利用できるStimulusコントローラの設計手法を学びます。",
  steps: [
    {
      id: 171,
      title: "単一責任のコントローラ設計",
      explanation: `<p>ここからは「動くコード」を「良い設計のコード」に育てる章です。最初の原則は<strong>単一責任の原則</strong>（Single Responsibility Principle）。<strong>1つのコントローラには1つの役割だけを持たせる</strong>という考え方です。</p>
<p>たとえば「パネルの表示切替」と「クリック数のカウント」を1つのwidgetコントローラに詰め込むと、次の問題が起きます。</p>
<ul>
<li>別のページで「表示切替だけ」使いたくても、カウント機能ごと持っていくことになる</li>
<li>カウントの修正が表示切替のバグを生む（役割が絡み合う）</li>
<li>コントローラ名から何をするものか分からなくなる</li>
</ul>
<p>Stimulusでは第10章で学んだとおり、<strong>1つの要素に複数のコントローラを付けられる</strong>ので、役割ごとに小さく分けて合成するのが簡単です。</p>
<pre><code>&lt;div data-controller="toggle counter"&gt;
  &lt;button data-action="click-&gt;toggle#toggle"&gt;表示切替&lt;/button&gt;
  &lt;button data-action="click-&gt;counter#increment"&gt;カウント&lt;/button&gt;
&lt;/div&gt;</code></pre>
<p>toggleは表示のことだけ、counterは数のことだけを知っていればよい。小さなコントローラは名前が付けやすく、テストしやすく、他のページでも再利用できます。「このコントローラを一言で説明できるか」が分割の目安です。</p>`,
      task: `役割ごとに分割されたtoggleコントローラとcounterコントローラのTODOをそれぞれ実装し、2つの小さなコントローラの合成でUIを完成させてください。`,
      code: `<div data-controller="toggle counter">
  <button id="toggle-btn" data-action="click->toggle#toggle">表示切替</button>
  <button id="count-btn" data-action="click->counter#increment">カウント</button>
  <p data-toggle-target="panel">パネルの中身</p>
  <p>クリック数：<span data-counter-target="count">0</span></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

// 表示切替だけを担当するコントローラ
application.register("toggle", class extends Controller {
  static targets = ["panel"];
  toggle() {
    // TODO: panelTargetのclassListで"hidden"クラスをtoggleする
  }
});

// カウントだけを担当するコントローラ
application.register("counter", class extends Controller {
  static targets = ["count"];
  increment() {
    // TODO: countTargetの数値を1増やして表示し直す
  }
});
<\/script>`,
      solution: `<div data-controller="toggle counter">
  <button id="toggle-btn" data-action="click->toggle#toggle">表示切替</button>
  <button id="count-btn" data-action="click->counter#increment">カウント</button>
  <p data-toggle-target="panel">パネルの中身</p>
  <p>クリック数：<span data-counter-target="count">0</span></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

// 表示切替だけを担当するコントローラ
application.register("toggle", class extends Controller {
  static targets = ["panel"];
  toggle() {
    this.panelTarget.classList.toggle("hidden");
  }
});

// カウントだけを担当するコントローラ
application.register("counter", class extends Controller {
  static targets = ["count"];
  increment() {
    this.countTarget.textContent = String(Number(this.countTarget.textContent) + 1);
  }
});
<\/script>`,
      hints: [
        `toggleは this.panelTarget.classList.toggle("hidden"); の1行です`,
        `incrementは Number(this.countTarget.textContent) + 1 を計算してtextContentに戻します`
      ],
      check: `click("#toggle-btn");
await sleep(50);
assert($("[data-toggle-target=panel]").classList.contains("hidden"), "表示切替ボタンを押すとパネルにhiddenクラスが付くはずです");
click("#count-btn");
click("#count-btn");
await sleep(50);
assert(text("[data-counter-target=count]") === "2", "カウントボタンを2回押すとクリック数が2になるはずです");
assert($("[data-toggle-target=panel]").classList.contains("hidden"), "カウント操作は表示切替に影響しないはずです（役割の分離）");`
    },
    {
      id: 172,
      title: "汎用トグルコントローラ（classesで設定可能に）",
      explanation: `<p>単一責任にしたコントローラを、さらに<strong>どのページでも使い回せる汎用部品</strong>に育てましょう。鍵になるのが第8章で学んだ<code>static classes</code>です。</p>
<p>次のコードには再利用を妨げる問題があります。</p>
<pre><code>toggle() {
  this.panelTarget.classList.toggle("hidden"); // クラス名を直書き
}</code></pre>
<p>クラス名<code>"hidden"</code>がJavaScriptに固定されているため、「フェードアウト用の<code>closed</code>クラスを使いたい」場面ではコントローラを書き換える（またはコピーする）しかありません。そこでクラス名を<strong>HTML側から注入</strong>します。</p>
<pre><code>static classes = ["hidden"];

toggle() {
  this.panelTarget.classList.toggle(this.hiddenClass);
}</code></pre>
<pre><code>&lt;div data-controller="toggle" data-toggle-hidden-class="hidden"&gt;...&lt;/div&gt;
&lt;div data-controller="toggle" data-toggle-hidden-class="closed"&gt;...&lt;/div&gt;</code></pre>
<p>同じコントローラのまま、1つ目の要素は<code>hidden</code>を、2つ目は<code>closed</code>を切り替えるようになります。<strong>「JSは振る舞いだけを持ち、見た目の決定はHTMLとCSSに任せる」</strong>のがStimulus流の汎用化です。今回は2つのインスタンスに別々のクラス名を設定して、直書きをやめる効果を確かめます。</p>`,
      task: `static classesで"hidden"を宣言し、toggle()の直書き"hidden"をthis.hiddenClassに置き換えて、2つ目のインスタンスがclosedクラスで動くようにしてください。`,
      code: `<style>
  .closed { opacity: 0.2; }
</style>
<div data-controller="toggle" data-toggle-hidden-class="hidden">
  <button id="btn1" data-action="click->toggle#toggle">お知らせを切替</button>
  <p id="panel1" data-toggle-target="panel">お知らせ：本日は晴れです</p>
</div>
<div data-controller="toggle" data-toggle-hidden-class="closed">
  <button id="btn2" data-action="click->toggle#toggle">ヘルプを切替</button>
  <p id="panel2" data-toggle-target="panel">ヘルプ：困ったらここを読む</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("toggle", class extends Controller {
  static targets = ["panel"];
  // TODO: static classes = ["hidden"] を宣言する
  toggle() {
    // TODO: "hidden"の直書きをやめて、this.hiddenClassを使う
    this.panelTarget.classList.toggle("hidden");
  }
});
<\/script>`,
      solution: `<style>
  .closed { opacity: 0.2; }
</style>
<div data-controller="toggle" data-toggle-hidden-class="hidden">
  <button id="btn1" data-action="click->toggle#toggle">お知らせを切替</button>
  <p id="panel1" data-toggle-target="panel">お知らせ：本日は晴れです</p>
</div>
<div data-controller="toggle" data-toggle-hidden-class="closed">
  <button id="btn2" data-action="click->toggle#toggle">ヘルプを切替</button>
  <p id="panel2" data-toggle-target="panel">ヘルプ：困ったらここを読む</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("toggle", class extends Controller {
  static targets = ["panel"];
  static classes = ["hidden"];
  toggle() {
    this.panelTarget.classList.toggle(this.hiddenClass);
  }
});
<\/script>`,
      hints: [
        `static targetsの下に static classes = ["hidden"]; を追加します`,
        `this.hiddenClassには、その要素のdata-toggle-hidden-class属性の値（hiddenやclosed）が入ります`
      ],
      check: `click("#btn1");
await sleep(50);
assert($("#panel1").classList.contains("hidden"), "1つ目のパネルには、HTMLで指定したhiddenクラスが付くはずです");
click("#btn2");
await sleep(50);
assert(!$("#panel2").classList.contains("hidden"), "2つ目のパネルにhiddenクラスを付けてはいけません。クラス名の直書きをやめてthis.hiddenClassを使いましょう");
assert($("#panel2").classList.contains("closed"), "2つ目のパネルには、HTMLで指定したclosedクラスが付くはずです");`
    },
    {
      id: 173,
      title: "汎用カウンタコントローラ（valuesで設定可能に）",
      explanation: `<p>汎用化の道具はclassesだけではありません。<strong>数値や文字列の設定はstatic values</strong>（第6章）でHTML側から注入できます。汎用カウンタを例に、初期値と増分を設定可能にしてみましょう。</p>
<pre><code>static values = {
  count: Number,
  step: { type: Number, default: 1 }  // 増分。省略時は1
};

increment() {
  this.countValue = this.countValue + this.stepValue;
}

countValueChanged() {
  this.displayTarget.textContent = String(this.countValue);
}</code></pre>
<p>使う側のHTMLはこうです。</p>
<pre><code>&lt;!-- ふつうのカウンタ（0から1ずつ） --&gt;
&lt;div data-controller="counter"&gt;...&lt;/div&gt;

&lt;!-- ポイントカウンタ（100から5ずつ） --&gt;
&lt;div data-controller="counter"
     data-counter-count-value="100"
     data-counter-step-value="5"&gt;...&lt;/div&gt;</code></pre>
<p>設計のポイントは2つあります。まず<code>default</code>を用意して、<strong>何も設定しなくても動く</strong>ようにすること（使う側の負担が減ります）。次に、表示の更新は第7章で学んだ<code>countValueChanged</code>に集約すること。値を変えれば表示が追従するので、incrementは「値を進める」ことだけに専念できます。1つのクラス定義から、設定の違う複数のインスタンスが独立して動くことを確かめましょう。</p>`,
      task: `increment()の「+ 1」の直書きをやめてthis.stepValueを使い、2つ目のカウンタがdata-counter-step-value="5"の設定どおり5ずつ増えるようにしてください。`,
      code: `<div data-controller="counter">
  <button id="add1" data-action="click->counter#increment">+1</button>
  <span id="disp1" data-counter-target="display">0</span>
</div>
<div data-controller="counter" data-counter-count-value="100" data-counter-step-value="5">
  <button id="add5" data-action="click->counter#increment">+5</button>
  <span id="disp2" data-counter-target="display">100</span>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("counter", class extends Controller {
  static targets = ["display"];
  static values = {
    count: Number,
    step: { type: Number, default: 1 }
  };
  increment() {
    // TODO: 1の直書きをやめて、this.stepValueの分だけ増やす
    this.countValue = this.countValue + 1;
  }
  countValueChanged() {
    this.displayTarget.textContent = String(this.countValue);
  }
});
<\/script>`,
      solution: `<div data-controller="counter">
  <button id="add1" data-action="click->counter#increment">+1</button>
  <span id="disp1" data-counter-target="display">0</span>
</div>
<div data-controller="counter" data-counter-count-value="100" data-counter-step-value="5">
  <button id="add5" data-action="click->counter#increment">+5</button>
  <span id="disp2" data-counter-target="display">100</span>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("counter", class extends Controller {
  static targets = ["display"];
  static values = {
    count: Number,
    step: { type: Number, default: 1 }
  };
  increment() {
    this.countValue = this.countValue + this.stepValue;
  }
  countValueChanged() {
    this.displayTarget.textContent = String(this.countValue);
  }
});
<\/script>`,
      hints: [
        `this.stepValueには、data-counter-step-value属性の数値（なければdefaultの1）が入ります`,
        `this.countValue = this.countValue + this.stepValue; と書けば、どちらのインスタンスも設定どおり動きます`
      ],
      check: `click("#add1");
await sleep(50);
assert(text("#disp1") === "1", "1つ目のカウンタはstep未設定なのでdefaultの1ずつ増え、1になるはずです");
click("#add5");
await sleep(50);
assert(text("#disp2") === "105", "2つ目のカウンタはdata-counter-step-value=5なので、100から105になるはずです（増分の直書きをやめてthis.stepValueを使う）");`
    },
    {
      id: 174,
      title: "コントローラの命名規約",
      explanation: `<p>コントローラの数が増えてくると、名前の付け方のルール（命名規約）が効いてきます。Stimulusの公式な慣習を整理しましょう。</p>
<table>
<tr><th>対象</th><th>規約</th><th>例</th></tr>
<tr><td>コントローラ識別子</td><td>ケバブケース（小文字＋ハイフン）</td><td><code>user-card</code></td></tr>
<tr><td>ファイル名（Rails等の慣習）</td><td>スネークケース＋_controller</td><td><code>user_card_controller.js</code></td></tr>
<tr><td>メソッド名</td><td>キャメルケース</td><td><code>showProfile</code></td></tr>
<tr><td>ターゲット・value名（JS側）</td><td>キャメルケース</td><td><code>userName</code></td></tr>
<tr><td>同（HTML属性側）</td><td>ケバブケース</td><td><code>data-user-card-target</code></td></tr>
</table>
<p>特に重要なのが、<strong>HTML属性の中のコントローラ名はすべてケバブケース</strong>という点です。2語以上の名前で間違えやすいので注意してください。</p>
<pre><code>&lt;!-- 正しい書き方 --&gt;
&lt;div data-controller="user-card"&gt;
  &lt;button data-action="click-&gt;user-card#show"&gt;表示&lt;/button&gt;
  &lt;p data-user-card-target="name"&gt;&lt;/p&gt;
&lt;/div&gt;</code></pre>
<p><code>data-controller="userCard"</code>のようにキャメルケースで書くと、登録名<code>user-card</code>と一致せず<strong>コントローラは接続されません</strong>。しかもエラーは出ず、ただ黙って動かないだけなので気づきにくいのです。さらにHTMLの属性名は大文字小文字が区別されない（<code>data-userCard-target</code>は<code>data-usercard-target</code>として扱われる）ため、属性側でキャメルケースを使う書き方はそもそも成立しません。「動かないときはまず名前の食い違いを疑う」を合言葉にしましょう。</p>`,
      task: `JS側はuser-cardという名前で正しく登録されています。HTML側の3箇所（data-controller・data-action・ターゲット属性）のコントローラ名をケバブケースに直して、動くようにしてください。`,
      code: `<!-- TODO: コントローラ名の部分をすべてケバブケース（user-card）に直す -->
<div data-controller="userCard">
  <button data-action="click->userCard#show">プロフィールを表示</button>
  <p data-userCard-target="name"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

// 2語以上のコントローラはケバブケースで登録する
application.register("user-card", class extends Controller {
  static targets = ["name"];
  show() {
    this.nameTarget.textContent = "やまだたろう";
  }
});
<\/script>`,
      solution: `<div data-controller="user-card">
  <button data-action="click->user-card#show">プロフィールを表示</button>
  <p data-user-card-target="name"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

// 2語以上のコントローラはケバブケースで登録する
application.register("user-card", class extends Controller {
  static targets = ["name"];
  show() {
    this.nameTarget.textContent = "やまだたろう";
  }
});
<\/script>`,
      hints: [
        `直すのは3箇所です：data-controller="user-card"、data-action="click->user-card#show"、data-user-card-target="name"`,
        `ターゲット名のnameはそのままでかまいません。ケバブケースにするのは属性内の「コントローラ名」の部分だけです`
      ],
      check: `assert($("[data-controller=user-card]"), "data-controllerの値はケバブケースのuser-cardにします（userCardでは登録名と一致せず接続されません）");
click("button");
await sleep(50);
assert(text("[data-user-card-target=name]") === "やまだたろう", "ボタンを押すと名前が表示されるはずです。data-actionのclick->user-card#showと、data-user-card-target=nameの2箇所も直しましょう");`
    },
    {
      id: 175,
      title: "HTML側に設定を寄せる（values活用の徹底）",
      explanation: `<p>設計の質を上げる合言葉が<strong>「設定はHTMLへ、振る舞いはJSへ」</strong>です。JavaScriptの中に埋め込まれた<code>10</code>のような数値は<strong>マジックナンバー</strong>と呼ばれ、次の問題を抱えます。</p>
<ul>
<li>値を変えるたびにJSの修正（とテスト）が必要になる</li>
<li>同じコントローラを別の設定で2箇所に置けない</li>
<li>Railsなどのサーバー側テンプレートから値を渡せない</li>
</ul>
<p>文字数上限チェックを例に見てみましょう。上限をvaluesにすると、同じコントローラが場所ごとに違う上限で動きます。</p>
<pre><code>static values = { max: Number };

update() {
  const rest = this.maxValue - this.inputTarget.value.length;
  this.outputTarget.textContent = "残り" + rest + "文字";
}</code></pre>
<pre><code>&lt;div data-controller="limit" data-limit-max-value="10"&gt;...&lt;/div&gt;
&lt;div data-controller="limit" data-limit-max-value="5"&gt;...&lt;/div&gt;</code></pre>
<p>サーバー側で<code>data-limit-max-value="&lt;%= setting.max %&gt;"</code>のように動的に埋め込めるのも大きな利点です。設定変更がHTML（テンプレート）の修正だけで完結し、JSは一切触らずに済みます。<strong>JSに具体的な数値や文字列を書きそうになったら「これはvaluesにできないか？」と考える</strong>癖をつけましょう。</p>`,
      task: `static valuesでmax（Number型）を宣言し、update()の10の直書きをthis.maxValueに置き換えて、2つの入力欄がそれぞれの上限で動くようにしてください。`,
      code: `<div data-controller="limit" data-limit-max-value="10">
  <p>ニックネーム（10文字まで）</p>
  <input id="nickname" data-limit-target="input" data-action="input->limit#update">
  <span id="nickname-rest" data-limit-target="output">残り10文字</span>
</div>
<div data-controller="limit" data-limit-max-value="5">
  <p>合言葉（5文字まで）</p>
  <input id="code" data-limit-target="input" data-action="input->limit#update">
  <span id="code-rest" data-limit-target="output">残り5文字</span>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("limit", class extends Controller {
  static targets = ["input", "output"];
  // TODO: static values = { max: Number } を宣言する
  update() {
    // TODO: 10の直書きをやめて、this.maxValueを使う
    const rest = 10 - this.inputTarget.value.length;
    this.outputTarget.textContent = "残り" + rest + "文字";
  }
});
<\/script>`,
      solution: `<div data-controller="limit" data-limit-max-value="10">
  <p>ニックネーム（10文字まで）</p>
  <input id="nickname" data-limit-target="input" data-action="input->limit#update">
  <span id="nickname-rest" data-limit-target="output">残り10文字</span>
</div>
<div data-controller="limit" data-limit-max-value="5">
  <p>合言葉（5文字まで）</p>
  <input id="code" data-limit-target="input" data-action="input->limit#update">
  <span id="code-rest" data-limit-target="output">残り5文字</span>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("limit", class extends Controller {
  static targets = ["input", "output"];
  static values = { max: Number };
  update() {
    const rest = this.maxValue - this.inputTarget.value.length;
    this.outputTarget.textContent = "残り" + rest + "文字";
  }
});
<\/script>`,
      hints: [
        `static values = { max: Number }; を宣言すると、data-limit-max-value属性の数値がthis.maxValueで読めます`,
        `const rest = this.maxValue - this.inputTarget.value.length; に書き換えます`
      ],
      check: `setValue("#nickname", "あいう");
await sleep(50);
assert(text("#nickname-rest") === "残り7文字", "上限10のニックネーム欄に3文字入れると「残り7文字」になるはずです");
setValue("#code", "あいう");
await sleep(50);
assert(text("#code-rest") === "残り2文字", "上限5の合言葉欄に3文字入れると「残り2文字」になるはずです。上限はHTMLのdata-limit-max-valueから読みましょう（10を直書きしない）");`
    },
    {
      id: 176,
      title: "privateメソッド（#記法）で整理する",
      explanation: `<p>コントローラのメソッドには2種類あります。</p>
<ul>
<li><strong>アクションメソッド</strong>：<code>data-action</code>からHTMLに呼ばれる公開メソッド（increment、toggleなど）</li>
<li><strong>内部処理メソッド</strong>：コントローラの中だけで使う下請けメソッド（表示更新、整形など）</li>
</ul>
<p>JavaScriptのクラスでは、メソッド名の先頭に<code>#</code>を付けると<strong>プライベートメソッド</strong>になります（ES2022の標準機能）。クラスの外からは呼べなくなり、「これはHTMLから呼ぶものではない」という意図がコードに表れます。</p>
<pre><code>increment() {
  this.count = this.count + 1;
  this.#render();          // 呼ぶときも#付き
}

#render() {                // クラスの中からしか呼べない
  this.displayTarget.textContent = this.count + "回";
}</code></pre>
<p>この整理には2つの効果があります。1つ目は<strong>重複の排除</strong>。connect・increment・decrementの3箇所に同じ表示コードをコピーする代わりに、<code>#render()</code>1箇所に集約すれば、表示形式の変更が1行の修正で済みます。2つ目は<strong>誤用の防止</strong>。<code>data-action="click-&gt;counter#render"</code>のように内部メソッドをうっかりHTMLから呼ぶ事故を、言語レベルで防げます。「アクションは薄く、実処理は#付きの下請けへ」が整理の型です。</p>`,
      task: `#render()プライベートメソッドを作って表示処理を1箇所に集約し、connect・increment・decrementのすべてから呼んでください。表示は「N回」の形式です。`,
      code: `<div data-controller="counter">
  <button id="plus" data-action="click->counter#increment">＋</button>
  <button id="minus" data-action="click->counter#decrement">−</button>
  <span data-counter-target="display"></span>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("counter", class extends Controller {
  static targets = ["display"];
  connect() {
    this.count = 0;
    // TODO: this.#render()を呼んで初期表示する
  }
  increment() {
    this.count = this.count + 1;
    this.displayTarget.textContent = this.count + "回";
  }
  decrement() {
    this.count = this.count - 1;
    // TODO: 表示処理をここに書かず、this.#render()を呼ぶ
  }
  // TODO: #render()プライベートメソッドを作り、displayTargetに this.count + "回" を表示する
  //       incrementの表示処理も#render()の呼び出しに置き換える
});
<\/script>`,
      solution: `<div data-controller="counter">
  <button id="plus" data-action="click->counter#increment">＋</button>
  <button id="minus" data-action="click->counter#decrement">−</button>
  <span data-counter-target="display"></span>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("counter", class extends Controller {
  static targets = ["display"];
  connect() {
    this.count = 0;
    this.#render();
  }
  increment() {
    this.count = this.count + 1;
    this.#render();
  }
  decrement() {
    this.count = this.count - 1;
    this.#render();
  }
  #render() {
    this.displayTarget.textContent = this.count + "回";
  }
});
<\/script>`,
      hints: [
        `メソッド定義は #render() { ... }、呼び出しは this.#render(); と書きます（どちらも#が必要）`,
        `connect・increment・decrementの3箇所すべてで表示コードを書かず、this.#render()を呼びます`
      ],
      check: `assert(text("[data-counter-target=display]") === "0回", "接続直後にconnectから#render()が呼ばれ、「0回」と表示されるはずです");
click("#minus");
await sleep(50);
assert(text("[data-counter-target=display]") === "-1回", "−ボタンでも#render()経由で「-1回」と表示されるはずです（表示形式が3箇所で揃う）");
click("#plus");
click("#plus");
await sleep(50);
assert(text("[data-counter-target=display]") === "1回", "＋を2回押すと-1から1に戻り、「1回」と表示されるはずです");`
    },
    {
      id: 177,
      title: "ヘルパー関数の切り出し（モジュール内関数）",
      explanation: `<p>前のステップの<code>#render()</code>は「コントローラのthisが必要な内部処理」の置き場でした。では、<strong>thisを一切使わない処理</strong>はどこに置くべきでしょうか。答えは<strong>クラスの外、モジュール内のふつうの関数</strong>です。</p>
<pre><code>// クラスの外に置いたヘルパー関数
function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const padded = seconds &lt; 10 ? "0" + seconds : String(seconds);
  return minutes + "分" + padded + "秒";
}

application.register("playlist", class extends Controller {
  connect() {
    this.timeATarget.textContent = formatTime(90); // 1分30秒
  }
});</code></pre>
<p>秒数を「M分SS秒」に整形する処理は、コントローラの状態にもDOMにも依存しません。こうした純粋な変換処理をクラスの外に出すと、次の利点があります。</p>
<ul>
<li><strong>コントローラが薄くなる</strong>：クラスにはStimulusらしい仕事（イベント→状態→表示）だけが残る</li>
<li><strong>共有できる</strong>：同じファイル内の複数のコントローラから使える。将来は別ファイルに切り出してimportもできる</li>
<li><strong>試しやすい</strong>：<code>console.log(formatTime(605))</code>のように単体で動作確認できる</li>
</ul>
<p>「thisを使っていないメソッドはクラスの外に出せるサイン」と覚えておくと、切り出す場所の判断が速くなります。</p>`,
      task: `formatTime()を完成させてください。秒数を「M分SS秒」形式（秒は2桁ゼロ埋め）に整形して返します。例：90→「1分30秒」、605→「10分05秒」。`,
      code: `<div data-controller="playlist">
  <p>オープニング：<span data-playlist-target="timeA"></span></p>
  <p>本編：<span data-playlist-target="timeB"></span></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

// モジュール内ヘルパー関数：thisに依存しないので、クラスの外に置く
function formatTime(totalSeconds) {
  // TODO: 「M分SS秒」の形式に整形して返す（例：90 → 1分30秒、605 → 10分05秒）
  //       分はMath.floor(totalSeconds / 60)、秒はtotalSeconds % 60で求め、秒は2桁にゼロ埋めする
  return String(totalSeconds);
}

const application = Application.start();

application.register("playlist", class extends Controller {
  static targets = ["timeA", "timeB"];
  connect() {
    this.timeATarget.textContent = formatTime(90);
    this.timeBTarget.textContent = formatTime(605);
  }
});
<\/script>`,
      solution: `<div data-controller="playlist">
  <p>オープニング：<span data-playlist-target="timeA"></span></p>
  <p>本編：<span data-playlist-target="timeB"></span></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

// モジュール内ヘルパー関数：thisに依存しないので、クラスの外に置く
function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const padded = seconds < 10 ? "0" + seconds : String(seconds);
  return minutes + "分" + padded + "秒";
}

const application = Application.start();

application.register("playlist", class extends Controller {
  static targets = ["timeA", "timeB"];
  connect() {
    this.timeATarget.textContent = formatTime(90);
    this.timeBTarget.textContent = formatTime(605);
  }
});
<\/script>`,
      hints: [
        `分はMath.floor(totalSeconds / 60)、余りの秒はtotalSeconds % 60で計算できます（第16章の復習）`,
        `ゼロ埋めは seconds < 10 ? "0" + seconds : String(seconds) のように三項演算子で書けます`
      ],
      check: `await sleep(200);
assert(text("[data-playlist-target=timeA]") === "1分30秒", "90秒は「1分30秒」と整形されるはずです");
assert(text("[data-playlist-target=timeB]") === "10分05秒", "605秒は「10分05秒」と整形されるはずです（秒は2桁にゼロ埋め）");`
    },
    {
      id: 178,
      title: "テストしやすい設計（DOM依存を薄く）",
      explanation: `<p>前のステップの考え方をさらに一歩進めます。コントローラの仕事を分解すると、テストのしやすさがまったく違う2種類に分かれます。</p>
<table>
<tr><th>種類</th><th>例</th><th>テスト</th></tr>
<tr><td>計算・判定ロジック</td><td>合計金額の計算、入力の検証</td><td>関数を呼んで戻り値を見るだけ</td></tr>
<tr><td>DOM操作</td><td>入力欄から読む、結果を表示する</td><td>HTMLを組み立てて操作が必要で大変</td></tr>
</table>
<p>そこで<strong>ロジックをDOMに依存しない純粋関数として切り出し、コントローラは「読む→計算を頼む→書く」だけの薄い接着層にする</strong>のが、テストしやすい設計の基本形です。</p>
<pre><code>// 純粋関数：同じ入力なら必ず同じ出力。DOMもthisも不要
function calcTotal(price, quantity) {
  return Math.floor(price * quantity * 1.1);
}

calculate() {
  const price = Number(this.priceTarget.value);      // 読む
  const quantity = Number(this.quantityTarget.value);
  this.totalTarget.textContent = calcTotal(price, quantity) + "円"; // 計算を頼んで書く
}</code></pre>
<p>純粋関数ならブラウザもStimulusも起動せずに検証できます。今回のコードでは、テストの代わりに<code>console.log("calcTotal(100, 3) === 330 →", ...)</code>という簡易チェックを仕込んであります。コンソールにtrueが出れば、DOMを1度も触らずにロジックの正しさを確認できたことになります。これがVitestなどのテストフレームワークを使う際の考え方の土台です。</p>`,
      task: `純粋関数calcTotal()を完成させてください。税込10%の合計（price×quantity×1.1の切り捨て）を返します。コンソールの簡易チェックがtrueになることも確認しましょう。`,
      code: `<div data-controller="order">
  <p>単価：<input id="price" data-order-target="price" value="100"></p>
  <p>数量：<input id="quantity" data-order-target="quantity" value="1"></p>
  <button data-action="click->order#calculate">計算</button>
  <p>合計（税込10%）：<span data-order-target="total"></span></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

// 純粋な計算ロジック：DOMに触らないので単体で検証できる
function calcTotal(price, quantity) {
  // TODO: 税込合計（price × quantity × 1.1 の切り捨て）を返す
  return 0;
}

// 簡易チェック：期待どおりならtrueと表示される
console.log("calcTotal(100, 3) === 330 →", calcTotal(100, 3) === 330);

const application = Application.start();

application.register("order", class extends Controller {
  static targets = ["price", "quantity", "total"];
  calculate() {
    const price = Number(this.priceTarget.value);
    const quantity = Number(this.quantityTarget.value);
    this.totalTarget.textContent = calcTotal(price, quantity) + "円";
  }
});
<\/script>`,
      solution: `<div data-controller="order">
  <p>単価：<input id="price" data-order-target="price" value="100"></p>
  <p>数量：<input id="quantity" data-order-target="quantity" value="1"></p>
  <button data-action="click->order#calculate">計算</button>
  <p>合計（税込10%）：<span data-order-target="total"></span></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

// 純粋な計算ロジック：DOMに触らないので単体で検証できる
function calcTotal(price, quantity) {
  return Math.floor(price * quantity * 1.1);
}

// 簡易チェック：期待どおりならtrueと表示される
console.log("calcTotal(100, 3) === 330 →", calcTotal(100, 3) === 330);

const application = Application.start();

application.register("order", class extends Controller {
  static targets = ["price", "quantity", "total"];
  calculate() {
    const price = Number(this.priceTarget.value);
    const quantity = Number(this.quantityTarget.value);
    this.totalTarget.textContent = calcTotal(price, quantity) + "円";
  }
});
<\/script>`,
      hints: [
        `return Math.floor(price * quantity * 1.1); の1行です`,
        `コントローラ側は完成済みです。純粋関数の中身だけを直せばUIも正しく動きます（分離の効果）`
      ],
      check: `setValue("#price", "100");
setValue("#quantity", "3");
click("button");
await sleep(50);
assert(text("[data-order-target=total]") === "330円", "単価100×数量3の税込合計は330円になるはずです（1.1倍して切り捨て）");
setValue("#quantity", "7");
click("button");
await sleep(50);
assert(text("[data-order-target=total]") === "770円", "単価100×数量7なら770円になるはずです");`
    },
    {
      id: 179,
      title: "Turboとの関係（なぜdisconnectが大事か）",
      explanation: `<p>StimulusはHotwireというフレームワーク群の一員で、相棒に<strong>Turbo</strong>がいます。Turbo Driveはリンククリック時にページ全体を再読み込みせず、<strong>bodyの中身だけを新しいHTMLに差し替えて</strong>高速に画面遷移させます。JavaScriptの実行環境はそのまま生き続けるのがポイントです。</p>
<p>これがStimulusの設計に大きく関わります。第9章で学んだとおり、Stimulusは要素の出現でconnect、消滅でdisconnectを呼びます。Turboの画面遷移は「要素の一斉入れ替え」なので、<strong>遷移のたびに古いページのコントローラすべてでdisconnectが呼ばれる</strong>のです。</p>
<pre><code>connect() {
  this.timer = setInterval(() =&gt; { ... }, 100);
}
disconnect() {
  clearInterval(this.timer);  // これがないとTurbo遷移のたびにタイマーが残り続ける
}</code></pre>
<p>もしdisconnectで後始末をしないと、遷移するたびに古いタイマーやイベントリスナーが積み重なり（メモリリーク）、消えた要素を触ろうとしてエラーを吐き続けます。ページ全体をリロードする従来型サイトでは隠れていた問題が、Turbo環境では確実に表面化します。<strong>「connectで始めたものはdisconnectで必ず止める」</strong>はTurbo時代の絶対ルールです。今回はTurboの遷移を「要素の中身を丸ごと差し替えるボタン」で擬似的に再現し、disconnectの後始末を確かめます。</p>`,
      task: `clockコントローラにdisconnect()を追加してください。clearIntervalでタイマーを止め、#logに「disconnectでタイマーを止めました」と表示します。`,
      code: `<div id="page">
  <div data-controller="clock">カウント：<span data-clock-target="display">0</span></div>
</div>
<button id="visit">ページ遷移をシミュレート（中身を差し替え）</button>
<p id="log"></p>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("clock", class extends Controller {
  static targets = ["display"];
  connect() {
    this.seconds = 0;
    this.timer = setInterval(() => {
      this.seconds = this.seconds + 1;
      this.displayTarget.textContent = String(this.seconds);
    }, 100);
  }
  // TODO: disconnect()を追加する
  //  - clearInterval(this.timer)でタイマーを止める
  //  - document.querySelector("#log")に「disconnectでタイマーを止めました」と表示する
});

// Turboのページ差し替えを擬似的に再現：#pageの中身を丸ごと入れ替える
document.querySelector("#visit").addEventListener("click", function () {
  document.querySelector("#page").innerHTML = "<p>新しいページの内容</p>";
});
<\/script>`,
      solution: `<div id="page">
  <div data-controller="clock">カウント：<span data-clock-target="display">0</span></div>
</div>
<button id="visit">ページ遷移をシミュレート（中身を差し替え）</button>
<p id="log"></p>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("clock", class extends Controller {
  static targets = ["display"];
  connect() {
    this.seconds = 0;
    this.timer = setInterval(() => {
      this.seconds = this.seconds + 1;
      this.displayTarget.textContent = String(this.seconds);
    }, 100);
  }
  disconnect() {
    clearInterval(this.timer);
    document.querySelector("#log").textContent = "disconnectでタイマーを止めました";
  }
});

// Turboのページ差し替えを擬似的に再現：#pageの中身を丸ごと入れ替える
document.querySelector("#visit").addEventListener("click", function () {
  document.querySelector("#page").innerHTML = "<p>新しいページの内容</p>";
});
<\/script>`,
      hints: [
        `disconnect() { clearInterval(this.timer); ... } をconnectの下に追加します`,
        `ログ表示は document.querySelector("#log").textContent = "disconnectでタイマーを止めました"; です。disconnect時点でコントローラの要素は消えているので、ターゲットではなくdocumentから探します`
      ],
      check: `await sleep(250);
assert(Number(text("[data-clock-target=display]")) >= 1, "接続中はタイマーでカウントが進んでいるはずです");
click("#visit");
await sleep(150);
assert(text("#log") === "disconnectでタイマーを止めました", "要素が差し替えられるとdisconnectが呼ばれ、clearIntervalで後始末してログを表示するはずです（Turbo遷移で毎回起きることの再現）");`
    },
    {
      id: 180,
      title: "総合演習：汎用開閉コントローラのライブラリ化",
      explanation: `<p>この章の総仕上げに、この章の道具をすべて注ぎ込んだ<strong>「どのプロジェクトでも使える開閉コントローラ」</strong>を完成させます。仕様は次のとおりです。</p>
<table>
<tr><th>設定</th><th>属性</th><th>デフォルト</th></tr>
<tr><td>初期状態</td><td>data-reveal-open-value</td><td>false（閉）</td></tr>
<tr><td>開いているときのボタン表示</td><td>data-reveal-open-label-value</td><td>閉じる</td></tr>
<tr><td>閉じているときのボタン表示</td><td>data-reveal-closed-label-value</td><td>開く</td></tr>
<tr><td>非表示クラス</td><td>data-reveal-hidden-class</td><td>hidden（フォールバック）</td></tr>
</table>
<p>設計の核は第7章のパターンです。<code>toggle()</code>は<code>openValue</code>を反転するだけにして、<strong>表示の更新はすべてvalueChangedコールバックに集約</strong>します。すると初期表示（接続時にも呼ばれる）とクリック時の更新が同じ1つのコードで済みます。</p>
<pre><code>toggle() {
  this.openValue = !this.openValue;   // 状態を変えるだけ
}

openValueChanged() {
  // openValueに合わせてクラスとラベルを更新する（接続時にも呼ばれる）
}</code></pre>
<p>クラス名は<code>this.hasHiddenClass ? this.hiddenClass : "hidden"</code>と書き、指定がなければ<code>"hidden"</code>にフォールバックさせます（第8章）。すべての設定にデフォルトがあるので、最小の使い方は<code>data-controller="reveal"</code>とターゲット2つだけ。それでいてFAQ・利用規約の折りたたみ・ネタバレ隠しまで、HTMLの属性を書き換えるだけで応用できます。これが「ライブラリ化」の完成形です。</p>`,
      task: `openValueChanged()を実装してください。openValueがtrueならパネルの非表示クラスを外してボタンにopenLabelValueを、falseなら非表示クラスを付けてclosedLabelValueを表示します。`,
      code: `<div id="faq1" data-controller="reveal">
  <button data-reveal-target="button" data-action="click->reveal#toggle"></button>
  <p data-reveal-target="panel">StimulusはHTML主導のフレームワークです。</p>
</div>
<div id="faq2" data-controller="reveal" data-reveal-open-value="true">
  <button data-reveal-target="button" data-action="click->reveal#toggle"></button>
  <p data-reveal-target="panel">最初から開いておきたい項目はopen-valueをtrueにします。</p>
</div>
<div id="faq3" data-controller="reveal"
  data-reveal-open-label-value="回答を隠す"
  data-reveal-closed-label-value="回答を見る">
  <button data-reveal-target="button" data-action="click->reveal#toggle"></button>
  <p data-reveal-target="panel">ラベルもHTML側から自由に変えられます。</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("reveal", class extends Controller {
  static targets = ["panel", "button"];
  static classes = ["hidden"];
  static values = {
    open: { type: Boolean, default: false },
    openLabel: { type: String, default: "閉じる" },
    closedLabel: { type: String, default: "開く" }
  };
  toggle() {
    this.openValue = !this.openValue;
  }
  openValueChanged() {
    // TODO: 非表示クラスを const hiddenClass = this.hasHiddenClass ? this.hiddenClass : "hidden"; で決める
    // TODO: this.openValueがtrueなら、panelTargetからhiddenClassを外し、buttonTargetにopenLabelValueを表示
    // TODO: falseなら、panelTargetにhiddenClassを付け、buttonTargetにclosedLabelValueを表示
  }
});
<\/script>`,
      solution: `<div id="faq1" data-controller="reveal">
  <button data-reveal-target="button" data-action="click->reveal#toggle"></button>
  <p data-reveal-target="panel">StimulusはHTML主導のフレームワークです。</p>
</div>
<div id="faq2" data-controller="reveal" data-reveal-open-value="true">
  <button data-reveal-target="button" data-action="click->reveal#toggle"></button>
  <p data-reveal-target="panel">最初から開いておきたい項目はopen-valueをtrueにします。</p>
</div>
<div id="faq3" data-controller="reveal"
  data-reveal-open-label-value="回答を隠す"
  data-reveal-closed-label-value="回答を見る">
  <button data-reveal-target="button" data-action="click->reveal#toggle"></button>
  <p data-reveal-target="panel">ラベルもHTML側から自由に変えられます。</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("reveal", class extends Controller {
  static targets = ["panel", "button"];
  static classes = ["hidden"];
  static values = {
    open: { type: Boolean, default: false },
    openLabel: { type: String, default: "閉じる" },
    closedLabel: { type: String, default: "開く" }
  };
  toggle() {
    this.openValue = !this.openValue;
  }
  openValueChanged() {
    const hiddenClass = this.hasHiddenClass ? this.hiddenClass : "hidden";
    if (this.openValue) {
      this.panelTarget.classList.remove(hiddenClass);
      this.buttonTarget.textContent = this.openLabelValue;
    } else {
      this.panelTarget.classList.add(hiddenClass);
      this.buttonTarget.textContent = this.closedLabelValue;
    }
  }
});
<\/script>`,
      hints: [
        `openValueChangedは接続時にも呼ばれるので、ボタンの初期ラベルもここで設定されます（HTML側のボタンは空でOK）`,
        `if (this.openValue) { remove＋openLabelValue } else { add＋closedLabelValue } の2分岐で書けます`
      ],
      check: `await sleep(100);
const panel1 = $("#faq1 [data-reveal-target=panel]");
assert(panel1.classList.contains("hidden"), "初期状態（open-value未指定＝false）では1つ目のパネルにhiddenクラスが付いて閉じているはずです");
assert(text("#faq1 [data-reveal-target=button]") === "開く", "閉じているときのボタンラベルはデフォルトの「開く」のはずです（openValueChangedは接続時にも呼ばれます）");
click("#faq1 [data-reveal-target=button]");
await sleep(50);
assert(!panel1.classList.contains("hidden"), "ボタンを押すとパネルが開く（hiddenクラスが外れる）はずです");
assert(text("#faq1 [data-reveal-target=button]") === "閉じる", "開いているときのラベルは「閉じる」に変わるはずです");
assert(!$("#faq2 [data-reveal-target=panel]").classList.contains("hidden"), "data-reveal-open-value=trueの項目は最初から開いているはずです");
assert(text("#faq3 [data-reveal-target=button]") === "回答を見る", "ラベルのvaluesを指定した項目は「回答を見る」と表示されるはずです");`
    }
  ]
});
