// 第19章：実践コンポーネント集
registerChapter({
  number: 19,
  title: "実践コンポーネント集",
  description: "これまでに学んだターゲット・バリュー・クラス・アクションを総動員して、実務でよく作る小さなUIコンポーネントを10個作ります。",
  steps: [
    {
      id: 181,
      title: "文字数カウンタ（残り文字数と超過警告）",
      explanation: `<p>SNSの投稿欄などでおなじみの「残り文字数カウンタ」を作ります。使う知識は第3章のinputイベント、第4章のターゲット、第6章のバリュー、第8章のCSSクラスです。</p>
<p>設計はこうです。上限の文字数はHTML側に<code>data-chars-max-value="20"</code>として置き（第6章：設定はHTMLに寄せる）、警告用のクラス名も<code>data-chars-over-class="over"</code>で渡します（第8章：クラス名をHTMLで差し替え可能にする）。JS側は入力のたびに残り文字数を計算して表示するだけです。</p>
<pre><code>update() {
  const remaining = this.maxValue - this.inputTarget.value.length;
  this.countTarget.textContent = remaining;
}</code></pre>
<p>残りがマイナスになったら超過なので、カウント表示に<code>this.overClass</code>を付けて赤くします。マイナスでなければ外します。この「条件によってクラスを付け外しする」形は第8章78で学んだ定番パターンです。</p>
<p>もうひとつ大事なのが<code>connect()</code>で一度<code>update()</code>を呼ぶことです（第9章82：connectで初期描画）。こうすると、最初から表示が正しい状態になり、初期値がHTMLの記述とずれる事故を防げます。</p>
<table>
<tr><th>部品</th><th>役割</th></tr>
<tr><td>maxValue</td><td>上限文字数（HTMLから設定）</td></tr>
<tr><td>inputTarget</td><td>textarea（入力元）</td></tr>
<tr><td>countTarget</td><td>残り文字数の表示先</td></tr>
<tr><td>overClass</td><td>超過時に付ける警告クラス</td></tr>
</table>`,
      task: `update()を実装してください。残り文字数（maxValue-入力の長さ）をcountTargetに表示し、マイナスのときだけcountTargetにoverClassを付けます。`,
      code: `<div data-controller="chars"
     data-chars-max-value="20"
     data-chars-over-class="over">
  <textarea data-chars-target="input"
            data-action="input->chars#update"
            rows="3" cols="30"></textarea>
  <p>残り<span data-chars-target="count">20</span>文字</p>
</div>

<style>
  .over { color: red; font-weight: bold; }
</style>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("chars", class extends Controller {
  static targets = ["input", "count"];
  static values = { max: Number };
  static classes = ["over"];

  connect() {
    this.update();
  }

  update() {
    // TODO: 残り文字数（this.maxValue - 入力の長さ）をcountTargetに表示する
    // TODO: 残りがマイナスならcountTargetにthis.overClassを付け、そうでなければ外す
  }
});
<\/script>`,
      solution: `<div data-controller="chars"
     data-chars-max-value="20"
     data-chars-over-class="over">
  <textarea data-chars-target="input"
            data-action="input->chars#update"
            rows="3" cols="30"></textarea>
  <p>残り<span data-chars-target="count">20</span>文字</p>
</div>

<style>
  .over { color: red; font-weight: bold; }
</style>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("chars", class extends Controller {
  static targets = ["input", "count"];
  static values = { max: Number };
  static classes = ["over"];

  connect() {
    this.update();
  }

  update() {
    const remaining = this.maxValue - this.inputTarget.value.length;
    this.countTarget.textContent = remaining;
    if (remaining < 0) {
      this.countTarget.classList.add(this.overClass);
    } else {
      this.countTarget.classList.remove(this.overClass);
    }
  }
});
<\/script>`,
      hints: [
        `残り文字数はthis.maxValue - this.inputTarget.value.lengthで計算できます`,
        `クラスの付け外しはthis.countTarget.classList.add(this.overClass)とremove(this.overClass)です`,
        `if (remaining < 0) { 付ける } else { 外す } の形にしましょう`
      ],
      check: `assert($("[data-controller=chars]"), "data-controller=charsの要素が必要です");
setValue("textarea", "こんにちは");
await sleep(50);
assert(text("[data-chars-target=count]") === "15", "5文字入力したら残りは15と表示されるはずです（20-5=15）");
setValue("textarea", "a".repeat(25));
await sleep(50);
assert(text("[data-chars-target=count]") === "-5", "25文字入力したら残りは-5と表示されるはずです");
assert($("[data-chars-target=count]").classList.contains("over"), "文字数を超過したらカウント表示にoverクラスが付くはずです");
setValue("textarea", "OK");
await sleep(50);
assert(!$("[data-chars-target=count]").classList.contains("over"), "超過が解消されたらoverクラスは外れるはずです");`
    },
    {
      id: 182,
      title: "パスワード表示切替",
      explanation: `<p>ログインフォームでよく見る「パスワードを表示」ボタンを作ります。仕組みはとても単純で、input要素の<code>type</code>属性を<code>password</code>と<code>text</code>で切り替えるだけです。</p>
<p><code>type="password"</code>の入力欄は中身が黒丸で隠れますが、JSからは<code>this.inputTarget.type = "text"</code>のように<strong>typeプロパティを書き換える</strong>ことができます。書き換えた瞬間に表示が切り替わります。</p>
<pre><code>toggle() {
  if (this.inputTarget.type === "password") {
    this.inputTarget.type = "text";
  } else {
    this.inputTarget.type = "password";
  }
}</code></pre>
<p>使う知識は第4章のターゲット（inputとボタンの2つ）と、第3章28で学んだ「buttonのdata-actionはclickを省略できる」ルールだけです。<code>data-action="password#toggle"</code>と書けば、クリック時にtoggleが呼ばれます。</p>
<p>ユーザビリティ上のポイントとして、<strong>ボタンのラベルも状態に合わせて変える</strong>ことが大切です。表示中は「隠す」、非表示中は「表示」と出ていれば、いま押すと何が起きるのかが一目で分かります。状態（typeの値）と表示（ラベル）を常にセットで更新する、という考え方は第7章の状態管理で学んだ通りです。</p>
<p>なお、現在の状態は<code>this.inputTarget.type</code>を見れば分かるので、インスタンス変数でフラグを持つ必要はありません（第7章65：状態はDOMに置く）。</p>`,
      task: `toggle()を実装してください。inputのtypeがpasswordならtextに変えてボタンのラベルを「隠す」に、そうでなければpasswordに戻してラベルを「表示」にします。`,
      code: `<div data-controller="password">
  <input type="password" value="himitsu123" data-password-target="input">
  <button data-action="password#toggle" data-password-target="button">表示</button>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("password", class extends Controller {
  static targets = ["input", "button"];

  toggle() {
    // TODO: this.inputTarget.typeが"password"なら"text"に変え、
    //       ボタンのラベルを「隠す」にする
    // TODO: そうでなければ"password"に戻し、ラベルを「表示」にする
  }
});
<\/script>`,
      solution: `<div data-controller="password">
  <input type="password" value="himitsu123" data-password-target="input">
  <button data-action="password#toggle" data-password-target="button">表示</button>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("password", class extends Controller {
  static targets = ["input", "button"];

  toggle() {
    if (this.inputTarget.type === "password") {
      this.inputTarget.type = "text";
      this.buttonTarget.textContent = "隠す";
    } else {
      this.inputTarget.type = "password";
      this.buttonTarget.textContent = "表示";
    }
  }
});
<\/script>`,
      hints: [
        `現在の状態はthis.inputTarget.typeで調べられます`,
        `this.inputTarget.type = "text" のように代入すれば切り替わります`,
        `ラベルはthis.buttonTarget.textContentで変更します`
      ],
      check: `assert($("input").type === "password", "最初のinputはtype=passwordのはずです");
click("button");
await sleep(50);
assert($("input").type === "text", "ボタンを押すとinputのtypeがtextに変わるはずです");
assert(text("button") === "隠す", "表示中はボタンのラベルが「隠す」になるはずです");
click("button");
await sleep(50);
assert($("input").type === "password", "もう一度押すとtypeがpasswordに戻るはずです");
assert(text("button") === "表示", "非表示に戻したらラベルは「表示」に戻るはずです");`
    },
    {
      id: 183,
      title: "コピーボタン（selectとフィードバック表示）",
      explanation: `<p>招待URLなどの横に置く「コピーボタン」を作ります。本来はクリップボードAPI（navigator.clipboard）を使いますが、<strong>この学習環境のサンドボックスでは使えない</strong>ため、実務でも古くから使われてきた代替パターンで作ります。</p>
<p>代替パターンの中心は、textarea/inputの<code>select()</code>メソッドです。<code>this.sourceTarget.select()</code>を呼ぶと中のテキストが<strong>全選択</strong>されます。全選択されていれば、ユーザーはCtrl+C（Macはcommand+C）を押すだけでコピーできます。「選択の手間を肩代わりする」わけです。</p>
<p>もうひとつの重要な要素が<strong>フィードバック表示</strong>です。ボタンを押しても見た目に何も起きないと、ユーザーは成功したのか分かりません。そこでボタンのラベルを「選択しました！」に変え、少し経ったら<code>setTimeout</code>（第16章156）で元に戻します。</p>
<pre><code>select() {
  this.sourceTarget.select();
  this.buttonTarget.textContent = "選択しました！";
  setTimeout(() =&gt; {
    this.buttonTarget.textContent = "全選択する";
  }, 1500);
}</code></pre>
<p>この「操作→即座に見た目でフィードバック→自動で元に戻す」という流れは、クリップボードAPIを使う場合でもまったく同じ形で書きます。将来<code>navigator.clipboard.writeText()</code>を使うときも、この骨格に1行足すだけです。</p>`,
      task: `select()を実装してください。sourceTargetのテキストを全選択し、ボタンのラベルを「選択しました！」に変え、1500ミリ秒後にラベルを「全選択する」に戻します。`,
      code: `<div data-controller="copy">
  <textarea data-copy-target="source" rows="2" cols="30">https://example.com/invite/abc123</textarea>
  <button data-action="copy#select" data-copy-target="button">全選択する</button>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("copy", class extends Controller {
  static targets = ["source", "button"];

  select() {
    // TODO: this.sourceTarget.select()で全選択する
    // TODO: ボタンのラベルを「選択しました！」に変える
    // TODO: setTimeoutで1500ミリ秒後にラベルを「全選択する」に戻す
  }
});
<\/script>`,
      solution: `<div data-controller="copy">
  <textarea data-copy-target="source" rows="2" cols="30">https://example.com/invite/abc123</textarea>
  <button data-action="copy#select" data-copy-target="button">全選択する</button>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("copy", class extends Controller {
  static targets = ["source", "button"];

  select() {
    this.sourceTarget.select();
    this.buttonTarget.textContent = "選択しました！";
    setTimeout(() => {
      this.buttonTarget.textContent = "全選択する";
    }, 1500);
  }
});
<\/script>`,
      hints: [
        `textareaの全選択はthis.sourceTarget.select()の1行です`,
        `setTimeout(() => { ... }, 1500) で1.5秒後に処理を実行できます（第16章156）`,
        `アロー関数を使えばsetTimeoutの中でもthisがコントローラを指します`
      ],
      check: `const ta = $("textarea");
assert(ta, "textareaが必要です");
click("button");
await sleep(50);
assert(ta.selectionStart === 0 && ta.selectionEnd === ta.value.length, "ボタンを押すとtextareaの内容が全選択されるはずです（select()を呼びましたか？）");
assert(text("button") === "選択しました！", "ボタンを押すとラベルが「選択しました！」に変わるはずです");
await sleep(1600);
assert(text("button") === "全選択する", "1.5秒後にはラベルが「全選択する」に戻るはずです");`
    },
    {
      id: 184,
      title: "星評価ウィジェット",
      explanation: `<p>レビュー投稿でおなじみの星評価（5段階）を作ります。使う知識は第5章のアクションパラメータと、第7章のvalueChangedです。</p>
<p>設計の要点は「<strong>点数という状態を1つのvalueに集約し、見た目はvalueChangedだけが描く</strong>」ことです。5つのボタンはそれぞれ<code>data-rating-score-param="1"</code>〜<code>"5"</code>を持ち、クリックされたら<code>event.params.score</code>を<code>this.scoreValue</code>に代入するだけ。数字だけのparamは自動で数値型になるので（第5章44）、そのまま計算に使えます。</p>
<pre><code>set(event) {
  this.scoreValue = event.params.score;
}</code></pre>
<p>描画はvalueChangedに一本化します。<code>starTargets</code>を順番に見て、「自分の並び順（index）が点数より小さければ★、そうでなければ☆」にします。indexは0始まりなので、点数3のとき★になるのはindex 0・1・2の3個です。</p>
<pre><code>scoreValueChanged() {
  this.starTargets.forEach((star, index) =&gt; {
    star.textContent = index &lt; this.scoreValue ? "★" : "☆";
  });
  this.outputTarget.textContent = this.scoreValue;
}</code></pre>
<p>この作りにすると、クリック処理はどこにも描画コードを持ちません。valueChangedは接続時にも呼ばれるので（第7章62）、初期表示も同じコードでまかなえます。状態の入口は1つ、描画の出口も1つ。これが第7章で学んだ状態管理の型です。</p>`,
      task: `scoreValueChanged()を実装してください。starTargetsのうちindexがscoreValue未満のものを「★」、それ以外を「☆」にし、outputTargetに点数を表示します。`,
      code: `<div data-controller="rating" data-rating-score-value="0">
  <button data-action="rating#set" data-rating-score-param="1" data-rating-target="star">☆</button>
  <button data-action="rating#set" data-rating-score-param="2" data-rating-target="star">☆</button>
  <button data-action="rating#set" data-rating-score-param="3" data-rating-target="star">☆</button>
  <button data-action="rating#set" data-rating-score-param="4" data-rating-target="star">☆</button>
  <button data-action="rating#set" data-rating-score-param="5" data-rating-target="star">☆</button>
  <p>評価：<span data-rating-target="output">0</span>点</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("rating", class extends Controller {
  static targets = ["star", "output"];
  static values = { score: Number };

  set(event) {
    this.scoreValue = event.params.score;
  }

  scoreValueChanged() {
    // TODO: this.starTargetsをforEachで回し、
    //       indexがthis.scoreValue未満なら「★」、それ以外は「☆」にする
    // TODO: this.outputTargetに点数を表示する
  }
});
<\/script>`,
      solution: `<div data-controller="rating" data-rating-score-value="0">
  <button data-action="rating#set" data-rating-score-param="1" data-rating-target="star">☆</button>
  <button data-action="rating#set" data-rating-score-param="2" data-rating-target="star">☆</button>
  <button data-action="rating#set" data-rating-score-param="3" data-rating-target="star">☆</button>
  <button data-action="rating#set" data-rating-score-param="4" data-rating-target="star">☆</button>
  <button data-action="rating#set" data-rating-score-param="5" data-rating-target="star">☆</button>
  <p>評価：<span data-rating-target="output">0</span>点</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("rating", class extends Controller {
  static targets = ["star", "output"];
  static values = { score: Number };

  set(event) {
    this.scoreValue = event.params.score;
  }

  scoreValueChanged() {
    this.starTargets.forEach((star, index) => {
      star.textContent = index < this.scoreValue ? "★" : "☆";
    });
    this.outputTarget.textContent = this.scoreValue;
  }
});
<\/script>`,
      hints: [
        `forEachの第2引数でindex（0始まり）を受け取れます：forEach((star, index) => { ... })`,
        `index < this.scoreValue が真なら「★」、偽なら「☆」です`,
        `点数表示はthis.outputTarget.textContent = this.scoreValue です`
      ],
      check: `assert($$("[data-rating-target=star]").length === 5, "星ボタンが5つ必要です");
click("[data-rating-score-param='4']");
await sleep(50);
var stars = $$("[data-rating-target=star]").map(function (b) { return b.textContent; });
assert(stars.join("") === "★★★★☆", "4を押したら左から4つが★、最後の1つが☆になるはずです");
assert(text("[data-rating-target=output]") === "4", "評価の数字が4になるはずです");
click("[data-rating-score-param='2']");
await sleep(50);
stars = $$("[data-rating-target=star]").map(function (b) { return b.textContent; });
assert(stars.join("") === "★★☆☆☆", "2を押し直したら★は左の2つだけになるはずです");
assert(text("[data-rating-target=output]") === "2", "評価の数字が2に更新されるはずです");`
    },
    {
      id: 185,
      title: "数量ステッパー（＋−ボタン）",
      explanation: `<p>ECサイトの数量選択でよく見る、＋と−で数を増減する「ステッパー」を作ります。第6章のNumber型value、第7章のvalueChanged、そして第5章49で触れた<code>disabled</code>属性の制御を組み合わせます。</p>
<p>仕様は次の通りです。</p>
<ul>
<li>現在値・最小値・最大値をすべてHTMLのvalueで設定する（count=1、min=1、max=5）</li>
<li>＋で1増える。ただし最大値を超えない</li>
<li>−で1減る。ただし最小値を下回らない</li>
<li>最小値のときは−ボタンを、最大値のときは＋ボタンを<code>disabled</code>にする</li>
</ul>
<p>範囲に収める処理には<code>Math.min</code>と<code>Math.max</code>が便利です。</p>
<pre><code>increment() {
  this.countValue = Math.min(this.countValue + 1, this.maxValue);
}
decrement() {
  this.countValue = Math.max(this.countValue - 1, this.minValue);
}</code></pre>
<p>ボタンの無効化はvalueChangedで行います。<code>this.downTarget.disabled = this.countValue &lt;= this.minValue;</code>のように、<strong>比較式の結果（true/false）をそのままdisabledに代入する</strong>と、if文なしで簡潔に書けます。disabledなボタンはクリックしてもイベントが発生しないため、範囲外への操作を二重に防げます。valueChangedは接続時にも呼ばれるので、初期状態（count=1で−が無効）も自動で正しくなります。</p>`,
      task: `countValueChanged()に、−ボタン（downTarget）と＋ボタン（upTarget）のdisabled制御を追加し、increment/decrementが最小値・最大値の範囲を超えないように修正してください。`,
      code: `<div data-controller="stepper"
     data-stepper-count-value="1"
     data-stepper-min-value="1"
     data-stepper-max-value="5">
  <button data-action="stepper#decrement" data-stepper-target="down">-</button>
  <span data-stepper-target="count">1</span>
  <button data-action="stepper#increment" data-stepper-target="up">+</button>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("stepper", class extends Controller {
  static targets = ["down", "count", "up"];
  static values = { count: Number, min: Number, max: Number };

  increment() {
    // TODO: this.maxValueを超えないように1増やす（Math.minを使う）
    this.countValue = this.countValue + 1;
  }

  decrement() {
    // TODO: this.minValueを下回らないように1減らす（Math.maxを使う）
    this.countValue = this.countValue - 1;
  }

  countValueChanged() {
    this.countTarget.textContent = this.countValue;
    // TODO: 最小値ならdownTargetを、最大値ならupTargetをdisabledにする
    //（そうでないときはdisabledを解除する）
  }
});
<\/script>`,
      solution: `<div data-controller="stepper"
     data-stepper-count-value="1"
     data-stepper-min-value="1"
     data-stepper-max-value="5">
  <button data-action="stepper#decrement" data-stepper-target="down">-</button>
  <span data-stepper-target="count">1</span>
  <button data-action="stepper#increment" data-stepper-target="up">+</button>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("stepper", class extends Controller {
  static targets = ["down", "count", "up"];
  static values = { count: Number, min: Number, max: Number };

  increment() {
    this.countValue = Math.min(this.countValue + 1, this.maxValue);
  }

  decrement() {
    this.countValue = Math.max(this.countValue - 1, this.minValue);
  }

  countValueChanged() {
    this.countTarget.textContent = this.countValue;
    this.downTarget.disabled = this.countValue <= this.minValue;
    this.upTarget.disabled = this.countValue >= this.maxValue;
  }
});
<\/script>`,
      hints: [
        `Math.min(this.countValue + 1, this.maxValue) で「増やしても上限まで」にできます`,
        `this.downTarget.disabled = this.countValue <= this.minValue のように比較結果をそのまま代入できます`,
        `disabledの解除も同じ1行でまかなえます（比較がfalseになれば解除されます）`
      ],
      check: `assert(text("[data-stepper-target=count]") === "1", "最初の数量は1のはずです");
assert($("[data-stepper-target=down]").disabled === true, "最小値のときは-ボタンが無効（disabled）になるはずです");
for (let i = 0; i < 5; i++) {
  click("[data-stepper-target=up]");
  await sleep(30);
}
assert(text("[data-stepper-target=count]") === "5", "最大値5を超えて増えてはいけません");
assert($("[data-stepper-target=up]").disabled === true, "最大値のときは+ボタンが無効になるはずです");
click("[data-stepper-target=down]");
await sleep(50);
assert(text("[data-stepper-target=count]") === "4", "-ボタンで1減るはずです");
assert($("[data-stepper-target=up]").disabled === false, "最大値でなくなったら+ボタンは押せるはずです");`
    },
    {
      id: 186,
      title: "検索フィルタ付きリスト",
      explanation: `<p>入力欄に文字を打つと、リストが絞り込まれていく「インクリメンタルサーチ」風のフィルタを作ります。第14章138で学んだフィルタリングを、実務で使う形に整理し直す回です。</p>
<p>設計の考え方は「<strong>データを消さない。表示だけを切り替える</strong>」です。一致しない項目をremove()で消してしまうと、検索語を消したときに復元できません。そこで各項目の<code>hidden</code>プロパティ（HTMLのhidden属性に対応し、trueで非表示になる）を切り替えます。</p>
<pre><code>update() {
  const query = this.inputTarget.value.trim();
  this.itemTargets.forEach((item) =&gt; {
    item.hidden = !item.textContent.includes(query);
  });
}</code></pre>
<p>ポイントを整理します。</p>
<ul>
<li><code>includes(query)</code>は部分一致の判定です。「り」なら「りんご」に一致します</li>
<li>queryが空文字のとき、<code>includes("")</code>は常にtrueなので全件表示に自然に戻ります。空文字を特別扱いするif文は不要です</li>
<li><code>trim()</code>で前後の空白を除いておくと、うっかりスペースが入っても意図通りに動きます（第13章の入力値の扱い）</li>
<li>「一致したら表示」なので、hiddenに入れるのは<strong>否定</strong>（<code>!includes(...)</code>）です。ここを逆にすると一致した項目だけが消えます</li>
</ul>
<p>リストが1000件を超えるような場合は第16章157のデバウンスを組み合わせますが、この規模なら毎回のinputイベントで十分軽快に動きます。</p>`,
      task: `update()を実装してください。入力値をtrim()し、各itemTargetについて「textContentに入力値が含まれないものだけ」hiddenをtrueにします。`,
      code: `<div data-controller="filter">
  <input type="text" placeholder="なまえで検索"
         data-filter-target="input"
         data-action="input->filter#update">
  <ul>
    <li data-filter-target="item">りんご</li>
    <li data-filter-target="item">バナナ</li>
    <li data-filter-target="item">ぶどう</li>
    <li data-filter-target="item">みかん</li>
    <li data-filter-target="item">メロン</li>
  </ul>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("filter", class extends Controller {
  static targets = ["input", "item"];

  update() {
    // TODO: 入力値をtrim()してqueryに入れる
    // TODO: this.itemTargetsをforEachで回し、
    //       textContentにqueryが含まれない項目のhiddenをtrueにする
    //（含まれる項目はhiddenをfalseに戻すこと）
  }
});
<\/script>`,
      solution: `<div data-controller="filter">
  <input type="text" placeholder="なまえで検索"
         data-filter-target="input"
         data-action="input->filter#update">
  <ul>
    <li data-filter-target="item">りんご</li>
    <li data-filter-target="item">バナナ</li>
    <li data-filter-target="item">ぶどう</li>
    <li data-filter-target="item">みかん</li>
    <li data-filter-target="item">メロン</li>
  </ul>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("filter", class extends Controller {
  static targets = ["input", "item"];

  update() {
    const query = this.inputTarget.value.trim();
    this.itemTargets.forEach((item) => {
      item.hidden = !item.textContent.includes(query);
    });
  }
});
<\/script>`,
      hints: [
        `文字列の部分一致はitem.textContent.includes(query)で判定できます`,
        `item.hidden = !item.textContent.includes(query) の1行で表示と非表示の両方をまかなえます`,
        `includes("")は常にtrueなので、入力が空なら自動的に全件表示に戻ります`
      ],
      check: `setValue("input", "り");
await sleep(50);
var visible = $$("li").filter(function (li) { return !li.hidden; });
assert(visible.length === 1, "「り」で検索すると表示は1件になるはずです");
assert(visible[0].textContent === "りんご", "「り」に一致するのは「りんご」のはずです");
setValue("input", "ん");
await sleep(50);
visible = $$("li").filter(function (li) { return !li.hidden; });
assert(visible.length === 2, "「ん」で検索すると「りんご」「みかん」の2件が表示されるはずです");
setValue("input", "");
await sleep(50);
visible = $$("li").filter(function (li) { return !li.hidden; });
assert(visible.length === 5, "検索語を消したら全5件が表示に戻るはずです");`
    },
    {
      id: 187,
      title: "ソート可能テーブル（列ヘッダクリック）",
      explanation: `<p>列の見出しをクリックすると行が並べ替わるテーブルを作ります。第5章のアクションパラメータ、第1章のdata属性とdataset、そして配列のsortを組み合わせます。</p>
<p>設計のポイントは2つあります。</p>
<p><strong>1つ目：ソートに使う値はdata属性に持たせる。</strong>セルの表示文字列（「300円」など）から値を取り出すのは壊れやすいので、行（tr）に<code>data-name="apple" data-price="300"</code>のように機械可読な値を持たせ、<code>row.dataset.price</code>で読みます。表示と、プログラムが使うデータを分離する考え方です。</p>
<p><strong>2つ目：どの列で並べ替えるかはparamで渡す。</strong>各見出しボタンに<code>data-sort-key-param="name"</code>のように付けておけば、メソッドは1つで済みます（第3章24で「メソッドを呼び分ける」を学びましたが、同じ処理のバリエーションならparamの方が簡潔です）。</p>
<p>並べ替えの手順はこうです。</p>
<ol>
<li><code>Array.from(this.bodyTarget.children)</code>で行を配列にする</li>
<li><code>sort()</code>で並べ替える。数値は引き算、文字列は大小比較で-1/1を返す</li>
<li>並べ替えた順に<code>appendChild</code>し直す。<strong>すでにDOMにある要素をappendChildすると移動になる</strong>ため、これだけで行が並び替わります</li>
</ol>
<pre><code>rows.sort((a, b) =&gt; {
  return Number(a.dataset.price) - Number(b.dataset.price);
});
rows.forEach((row) =&gt; this.bodyTarget.appendChild(row));</code></pre>`,
      task: `sortBy()の比較関数を実装してください。keyが"price"ならdataset.priceの数値の昇順、それ以外はdataset.nameの文字列の昇順（小さいとき-1、大きいとき1）で並べ替えます。`,
      code: `<table data-controller="sort">
  <thead>
    <tr>
      <th><button data-action="sort#sortBy" data-sort-key-param="name">商品名</button></th>
      <th><button data-action="sort#sortBy" data-sort-key-param="price">価格</button></th>
    </tr>
  </thead>
  <tbody data-sort-target="body">
    <tr data-name="melon" data-price="500"><td>melon</td><td>500円</td></tr>
    <tr data-name="apple" data-price="300"><td>apple</td><td>300円</td></tr>
    <tr data-name="banana" data-price="100"><td>banana</td><td>100円</td></tr>
  </tbody>
</table>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("sort", class extends Controller {
  static targets = ["body"];

  sortBy(event) {
    const key = event.params.key;
    const rows = Array.from(this.bodyTarget.children);
    rows.sort((a, b) => {
      // TODO: keyが"price"ならNumber(a.dataset.price)とNumber(b.dataset.price)の引き算を返す
      // TODO: それ以外はa.dataset.nameとb.dataset.nameを比較して-1か1を返す
      return 0;
    });
    rows.forEach((row) => this.bodyTarget.appendChild(row));
  }
});
<\/script>`,
      solution: `<table data-controller="sort">
  <thead>
    <tr>
      <th><button data-action="sort#sortBy" data-sort-key-param="name">商品名</button></th>
      <th><button data-action="sort#sortBy" data-sort-key-param="price">価格</button></th>
    </tr>
  </thead>
  <tbody data-sort-target="body">
    <tr data-name="melon" data-price="500"><td>melon</td><td>500円</td></tr>
    <tr data-name="apple" data-price="300"><td>apple</td><td>300円</td></tr>
    <tr data-name="banana" data-price="100"><td>banana</td><td>100円</td></tr>
  </tbody>
</table>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("sort", class extends Controller {
  static targets = ["body"];

  sortBy(event) {
    const key = event.params.key;
    const rows = Array.from(this.bodyTarget.children);
    rows.sort((a, b) => {
      if (key === "price") {
        return Number(a.dataset.price) - Number(b.dataset.price);
      }
      if (a.dataset.name < b.dataset.name) return -1;
      if (a.dataset.name > b.dataset.name) return 1;
      return 0;
    });
    rows.forEach((row) => this.bodyTarget.appendChild(row));
  }
});
<\/script>`,
      hints: [
        `数値の昇順はreturn Number(a.dataset.price) - Number(b.dataset.price) です`,
        `文字列はif (a.dataset.name < b.dataset.name) return -1; のように比較します`,
        `data-price属性はrow.dataset.priceで読めます（文字列なのでNumber()で数値化）`
      ],
      check: `click("[data-sort-key-param=name]");
await sleep(50);
var names = $$("tbody tr td:first-child").map(function (td) { return td.textContent; });
assert(names.join(",") === "apple,banana,melon", "商品名をクリックすると名前の昇順（apple,banana,melon）になるはずです");
click("[data-sort-key-param=price]");
await sleep(50);
names = $$("tbody tr td:first-child").map(function (td) { return td.textContent; });
assert(names.join(",") === "banana,apple,melon", "価格をクリックすると価格の昇順（banana,apple,melon）になるはずです");`
    },
    {
      id: 188,
      title: "テキストカルーセル（前へ・次へ）",
      explanation: `<p>スライドを順番に表示するカルーセルを、画像なしのテキスト版で作ります。第6章のNumber型value、第7章のvalueChanged、第4章の複数ターゲットの組み合わせです。</p>
<p>状態は「いま何枚目か」を表す<code>indexValue</code>ただ1つです。next/prevはindexValueを動かすだけ、表示の更新はすべて<code>indexValueChanged</code>が担当します。星評価（184）と同じ「状態の入口1つ・描画の出口1つ」の型です。</p>
<p>この課題の山場は<strong>端の処理（ラップアラウンド）</strong>です。最後のスライドで「次へ」を押したら先頭に戻したい。ここで活躍するのが剰余演算子<code>%</code>です。</p>
<pre><code>// 次へ：2の次は (2+1)%3 = 0 で先頭に戻る
this.indexValue = (this.indexValue + 1) % this.slideTargets.length;

// 前へ：0の前は (0-1+3)%3 = 2 で末尾に回る
this.indexValue = (this.indexValue - 1 + this.slideTargets.length) % this.slideTargets.length;</code></pre>
<p>「前へ」で<code>+ length</code>を足しているのは、JSの<code>%</code>は負の数に対して負の結果を返すためです（-1 % 3は-1）。先にlengthを足して正の数にしてから割ると、必ず0〜length-1に収まります。</p>
<p>indexValueChangedでは、各スライドの<code>hidden</code>を「自分のindexが現在値と違うならtrue」にし、インジケータに「2 / 3」のような現在位置を表示します。枚数を<code>this.slideTargets.length</code>から取っているので、HTMLにスライドを足すだけで自動的に対応します。</p>`,
      task: `next()とprev()を実装してください。剰余演算子%を使い、末尾の次は先頭へ、先頭の前は末尾へ循環するようにindexValueを更新します。`,
      code: `<div data-controller="carousel" data-carousel-index-value="0">
  <p data-carousel-target="slide">1枚目：春はあけぼの</p>
  <p data-carousel-target="slide" hidden>2枚目：夏は夜</p>
  <p data-carousel-target="slide" hidden>3枚目：秋は夕暮れ</p>
  <button data-action="carousel#prev">前へ</button>
  <span data-carousel-target="indicator">1 / 3</span>
  <button data-action="carousel#next">次へ</button>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("carousel", class extends Controller {
  static targets = ["slide", "indicator"];
  static values = { index: Number };

  next() {
    // TODO: (今のindex + 1) % スライド枚数 をindexValueに入れる
  }

  prev() {
    // TODO: (今のindex - 1 + スライド枚数) % スライド枚数 をindexValueに入れる
  }

  indexValueChanged() {
    this.slideTargets.forEach((slide, index) => {
      slide.hidden = index !== this.indexValue;
    });
    this.indicatorTarget.textContent =
      (this.indexValue + 1) + " / " + this.slideTargets.length;
  }
});
<\/script>`,
      solution: `<div data-controller="carousel" data-carousel-index-value="0">
  <p data-carousel-target="slide">1枚目：春はあけぼの</p>
  <p data-carousel-target="slide" hidden>2枚目：夏は夜</p>
  <p data-carousel-target="slide" hidden>3枚目：秋は夕暮れ</p>
  <button data-action="carousel#prev">前へ</button>
  <span data-carousel-target="indicator">1 / 3</span>
  <button data-action="carousel#next">次へ</button>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("carousel", class extends Controller {
  static targets = ["slide", "indicator"];
  static values = { index: Number };

  next() {
    this.indexValue = (this.indexValue + 1) % this.slideTargets.length;
  }

  prev() {
    this.indexValue =
      (this.indexValue - 1 + this.slideTargets.length) % this.slideTargets.length;
  }

  indexValueChanged() {
    this.slideTargets.forEach((slide, index) => {
      slide.hidden = index !== this.indexValue;
    });
    this.indicatorTarget.textContent =
      (this.indexValue + 1) + " / " + this.slideTargets.length;
  }
});
<\/script>`,
      hints: [
        `スライドの枚数はthis.slideTargets.lengthで取れます`,
        `次へ：this.indexValue = (this.indexValue + 1) % this.slideTargets.length`,
        `前へはマイナスにならないよう、先に枚数を足してから%を取ります`
      ],
      check: `assert(text("[data-carousel-target=indicator]") === "1 / 3", "最初のインジケータは「1 / 3」のはずです");
var nextBtn = $$("button")[1];
var prevBtn = $$("button")[0];
nextBtn.click();
await sleep(50);
assert(text("[data-carousel-target=indicator]") === "2 / 3", "次へを1回押すと「2 / 3」になるはずです");
var shown = $$("[data-carousel-target=slide]").filter(function (s) { return !s.hidden; });
assert(shown.length === 1 && shown[0].textContent.indexOf("2枚目") === 0, "2枚目のスライドだけが表示されるはずです");
nextBtn.click();
await sleep(30);
nextBtn.click();
await sleep(50);
assert(text("[data-carousel-target=indicator]") === "1 / 3", "最後のスライドで次へを押すと先頭（1 / 3）に戻るはずです");
prevBtn.click();
await sleep(50);
assert(text("[data-carousel-target=indicator]") === "3 / 3", "先頭で前へを押すと末尾（3 / 3）に回るはずです");`
    },
    {
      id: 189,
      title: "入力プレビュー（Markdown風の簡易整形）",
      explanation: `<p>textareaに書いた内容を、隣にリアルタイムで整形表示する「ライブプレビュー」を作ります。Markdownエディタの超簡易版です。整形ルールは3つだけにします。</p>
<table>
<tr><th>行の書き出し</th><th>変換結果</th></tr>
<tr><td><code># </code>で始まる</td><td>見出し（<code>&lt;h4&gt;</code>）</td></tr>
<tr><td><code>- </code>で始まる</td><td>箇条書き（<code>&lt;li&gt;</code>）</td></tr>
<tr><td>その他（空行以外）</td><td>段落（<code>&lt;p&gt;</code>）</td></tr>
</table>
<p>処理の流れは「行に分割→1行ずつHTML片に変換→連結してinnerHTMLへ」です。行への分割は<code>split("\\n")</code>、行頭の判定は<code>startsWith("# ")</code>、記号の除去は<code>slice(2)</code>（先頭2文字を除いた残り）でできます。</p>
<p>ここで<strong>絶対に守るべき安全上のルール</strong>があります。ユーザー入力をinnerHTMLに入れるときは、必ずエスケープすることです。もし素通しにすると、入力欄に書かれたタグがそのままHTMLとして動いてしまいます（XSSといい、実務では重大な脆弱性です）。今回はモジュール内のヘルパー関数（第18章177）として用意しました。</p>
<pre><code>function escapeHtml(s) {
  return s.replace(/&amp;/g, "&amp;amp;").replace(/&lt;/g, "&amp;lt;");
}</code></pre>
<p><code>&amp;</code>を先に変換するのは、後から作った<code>&amp;lt;</code>の<code>&amp;</code>まで二重変換しないためです。変換後の文字列は「タグに見える文字」ではなくなるので、innerHTMLに入れても文字として表示されるだけになります。</p>`,
      task: `update()に「# 」で始まる行をh4に、「- 」で始まる行をliに変換する分岐を追加してください。中身のテキストは必ずescapeHtml()を通します。`,
      code: `<div data-controller="preview">
  <textarea data-preview-target="input"
            data-action="input->preview#update"
            rows="6" cols="30"># 今日の日記
- 朝ごはんを食べた
おいしかった</textarea>
  <div data-preview-target="output" style="border: 1px solid #ccc; padding: 8px;"></div>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

// HTMLエスケープ（&を先に変換するのがポイント）
function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
}

const application = Application.start();

application.register("preview", class extends Controller {
  static targets = ["input", "output"];

  connect() {
    this.update();
  }

  update() {
    const lines = this.inputTarget.value.split("\\n");
    let html = "";
    for (const line of lines) {
      // TODO: 「# 」で始まる行は "<h4>" + escapeHtml(line.slice(2)) + "</h4>" を足す
      // TODO: 「- 」で始まる行は "<li>" + escapeHtml(line.slice(2)) + "</li>" を足す
      if (line.trim() !== "") {
        html = html + "<p>" + escapeHtml(line) + "</p>";
      }
    }
    this.outputTarget.innerHTML = html;
  }
});
<\/script>`,
      solution: `<div data-controller="preview">
  <textarea data-preview-target="input"
            data-action="input->preview#update"
            rows="6" cols="30"># 今日の日記
- 朝ごはんを食べた
おいしかった</textarea>
  <div data-preview-target="output" style="border: 1px solid #ccc; padding: 8px;"></div>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

// HTMLエスケープ（&を先に変換するのがポイント）
function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
}

const application = Application.start();

application.register("preview", class extends Controller {
  static targets = ["input", "output"];

  connect() {
    this.update();
  }

  update() {
    const lines = this.inputTarget.value.split("\\n");
    let html = "";
    for (const line of lines) {
      if (line.startsWith("# ")) {
        html = html + "<h4>" + escapeHtml(line.slice(2)) + "</h4>";
      } else if (line.startsWith("- ")) {
        html = html + "<li>" + escapeHtml(line.slice(2)) + "</li>";
      } else if (line.trim() !== "") {
        html = html + "<p>" + escapeHtml(line) + "</p>";
      }
    }
    this.outputTarget.innerHTML = html;
  }
});
<\/script>`,
      hints: [
        `行頭の判定はline.startsWith("# ")、記号の除去はline.slice(2)です`,
        `if / else if / else if の3分岐にします（普通の行の処理は既にあります）`,
        `どの分岐でも中身のテキストはescapeHtml()を通してから連結します`
      ],
      check: `setValue("textarea", "# タイトル\\n- 項目A\\n- 項目B\\nこれは本文です");
await sleep(50);
assert(text("[data-preview-target=output] h4") === "タイトル", "「# 」で始まる行はh4見出しになるはずです");
assert($$("[data-preview-target=output] li").length === 2, "「- 」で始まる2行はliになるはずです");
assert(text("[data-preview-target=output] p") === "これは本文です", "ふつうの行はpになるはずです");
setValue("textarea", "<b>タグ</b>");
await sleep(50);
assert(!$("[data-preview-target=output] b"), "入力したタグが実際の要素になってはいけません（エスケープしていますか？）");
assert(text("[data-preview-target=output] p") === "<b>タグ</b>", "タグは文字としてそのまま表示されるはずです");`
    },
    {
      id: 190,
      title: "総合演習：商品カードUI",
      explanation: `<p>この章の総仕上げとして、ECサイトの「商品カード」を1枚作ります。数量ステッパー（185）と小計計算、お気に入りトグル（第8章）を1つのコントローラにまとめます。</p>
<p>部品と使う知識の対応を整理します。</p>
<table>
<tr><th>機能</th><th>使う知識</th></tr>
<tr><td>単価・数量の管理</td><td>第6章 Number型value（priceValue・quantityValue）</td></tr>
<tr><td>数量の増減と範囲制限</td><td>185のステッパー（Math.min／Math.max）</td></tr>
<tr><td>小計の自動計算</td><td>第7章 valueChanged（数量が変わったら単価×数量）</td></tr>
<tr><td>お気に入りの切り替え</td><td>第8章 classes＋classList.toggle</td></tr>
</table>
<p>小計の更新を<code>quantityValueChanged</code>に置くのがこの設計の核心です。increment/decrementは数量を変えるだけで、表示のことを知りません。「増やしたときに小計更新を書き忘れる」類のバグが構造的に起きなくなります。</p>
<p>お気に入りボタンでは<code>classList.toggle()</code>の便利な性質を使います。<strong>toggleは、クラスを付けたらtrue、外したらfalseを返します</strong>。この戻り値を受け取れば、ラベルの切り替えをifで書けます。</p>
<pre><code>toggleFavorite() {
  const on = this.favoriteTarget.classList.toggle(this.onClass);
  this.favoriteTarget.textContent = on ? "★ お気に入り済み" : "☆ お気に入り";
}</code></pre>
<p>1つのコントローラに機能を2つ入れましたが、どちらも「商品カード」という1つの関心事の中の話なので単一責任（第18章171）には反しません。もしお気に入りが他のページでも使われるなら、第10章97のように別コントローラへ切り出します。</p>`,
      task: `quantityValueChanged()に小計（priceValue×quantityValue）の表示を追加し、toggleFavorite()を実装してください。お気に入りON時はonClassを付けてラベルを「★ お気に入り済み」に、OFF時は外して「☆ お気に入り」にします。`,
      code: `<div data-controller="card"
     data-card-price-value="1200"
     data-card-quantity-value="1"
     data-card-on-class="favorite-on">
  <h4>コーヒー豆（200g） 1200円</h4>
  <p>
    <button data-action="card#decrement">-</button>
    <span data-card-target="quantity">1</span>
    <button data-action="card#increment">+</button>
  </p>
  <p>小計：<span data-card-target="total">1200</span>円</p>
  <button data-action="card#toggleFavorite" data-card-target="favorite">☆ お気に入り</button>
</div>

<style>
  .favorite-on { background: gold; }
</style>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("card", class extends Controller {
  static targets = ["quantity", "total", "favorite"];
  static values = { price: Number, quantity: Number };
  static classes = ["on"];

  increment() {
    this.quantityValue = Math.min(this.quantityValue + 1, 9);
  }

  decrement() {
    this.quantityValue = Math.max(this.quantityValue - 1, 1);
  }

  quantityValueChanged() {
    this.quantityTarget.textContent = this.quantityValue;
    // TODO: 小計（this.priceValue * this.quantityValue）をtotalTargetに表示する
  }

  toggleFavorite() {
    // TODO: favoriteTargetのclassListでthis.onClassをtoggleし、
    //       戻り値がtrueなら「★ お気に入り済み」、falseなら「☆ お気に入り」にする
  }
});
<\/script>`,
      solution: `<div data-controller="card"
     data-card-price-value="1200"
     data-card-quantity-value="1"
     data-card-on-class="favorite-on">
  <h4>コーヒー豆（200g） 1200円</h4>
  <p>
    <button data-action="card#decrement">-</button>
    <span data-card-target="quantity">1</span>
    <button data-action="card#increment">+</button>
  </p>
  <p>小計：<span data-card-target="total">1200</span>円</p>
  <button data-action="card#toggleFavorite" data-card-target="favorite">☆ お気に入り</button>
</div>

<style>
  .favorite-on { background: gold; }
</style>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("card", class extends Controller {
  static targets = ["quantity", "total", "favorite"];
  static values = { price: Number, quantity: Number };
  static classes = ["on"];

  increment() {
    this.quantityValue = Math.min(this.quantityValue + 1, 9);
  }

  decrement() {
    this.quantityValue = Math.max(this.quantityValue - 1, 1);
  }

  quantityValueChanged() {
    this.quantityTarget.textContent = this.quantityValue;
    this.totalTarget.textContent = this.priceValue * this.quantityValue;
  }

  toggleFavorite() {
    const on = this.favoriteTarget.classList.toggle(this.onClass);
    this.favoriteTarget.textContent = on ? "★ お気に入り済み" : "☆ お気に入り";
  }
});
<\/script>`,
      hints: [
        `小計はthis.totalTarget.textContent = this.priceValue * this.quantityValue です`,
        `classList.toggle(クラス名)は付けたときtrue、外したときfalseを返します`,
        `const on = this.favoriteTarget.classList.toggle(this.onClass); と受け取って三項演算子でラベルを決めましょう`
      ],
      check: `var minus = $$("button")[0];
var plus = $$("button")[1];
var fav = $$("button")[2];
plus.click();
await sleep(30);
plus.click();
await sleep(50);
assert(text("[data-card-target=quantity]") === "3", "+を2回押すと数量は3になるはずです");
assert(text("[data-card-target=total]") === "3600", "小計は単価1200×数量3=3600になるはずです");
minus.click();
await sleep(50);
assert(text("[data-card-target=total]") === "2400", "-を押すと小計は2400に戻るはずです");
minus.click();
await sleep(30);
minus.click();
await sleep(50);
assert(text("[data-card-target=quantity]") === "1", "数量は1未満にならないはずです");
fav.click();
await sleep(50);
assert($("[data-card-target=favorite]").classList.contains("favorite-on"), "お気に入りボタンを押すとfavorite-onクラスが付くはずです");
assert(text("[data-card-target=favorite]").indexOf("★") === 0, "お気に入り中はラベルが★で始まるはずです");
fav.click();
await sleep(50);
assert(!$("[data-card-target=favorite]").classList.contains("favorite-on"), "もう一度押すとfavorite-onクラスが外れるはずです");`
    }
  ]
});
