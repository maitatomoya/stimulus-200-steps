// 第23章：よくあるエラー：ターゲットとバリュー
registerChapter({
  number: 23,
  title: "よくあるエラー：ターゲットとバリュー",
  description: "ターゲットとバリューまわりで「動かない」「エラーが出る」典型パターンを10個再現し、コンソールを手がかりに自分の手で修正する訓練をします。",
  steps: [
    {
      id: 221,
      title: "Missing targetエラー（ターゲット属性の付け忘れ）",
      explanation: `<p>この章では、ターゲットとバリューまわりの「動かない」典型パターンを実際に再現し、コンソールを手がかりに修正する訓練をします。最初は最頻出の<strong>Missing targetエラー</strong>です。</p>
<p>下のコードでボタンを押しても画面は変わらず、コンソールには次の赤いエラーが出ます。</p>
<pre><code>Error: Missing target element "output" for "hello" controller</code></pre>
<p>原因はHTML側にあります。JSでは<code>static targets = ["output"]</code>を宣言して<code>this.outputTarget</code>を使っているのに、HTMLのどの要素にも<code>data-hello-target="output"</code>が付いていません。<code>this.outputTarget</code>は「スコープ内から探して、見つからなければエラーを投げる」プロパティなので、<strong>接続時ではなくアクセスした瞬間（＝クリックした瞬間）</strong>にこのエラーが出ます。</p>
<p>デバッグの手がかりはエラーメッセージそのものです。「どのターゲット名が」「どのコントローラで」見つからないかが両方書かれているので、そのコントローラのスコープ内に対応する属性があるかを確認します。</p>
<table>
<tr><th>確認ポイント</th><th>内容</th></tr>
<tr><td>属性の形</td><td>data-hello-target="output"（コントローラ名-target="ターゲット名"）</td></tr>
<tr><td>置き場所</td><td>data-controller="hello"が付いた要素の内側</td></tr>
<tr><td>エラーが出るタイミング</td><td>this.outputTargetを使った瞬間</td></tr>
</table>`,
      task: `コンソールのMissing targetエラーを手がかりに、表示先の要素へ正しいターゲット属性を追加し、ボタンで「こんにちは！」と表示されるようにしてください。`,
      code: `<div data-controller="hello">
  <button data-action="hello#greet">あいさつ</button>
  <!-- TODO: この<p>をoutputターゲットにする属性が抜けている -->
  <p></p>
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
      solution: `<div data-controller="hello">
  <button data-action="hello#greet">あいさつ</button>
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
        `まずボタンを押してコンソールのエラー文を読みましょう。「どのターゲットが」「どのコントローラで」欠けているか書かれています`,
        `ターゲット属性の形はdata-コントローラ名-target="ターゲット名"です`,
        `コントローラ名はhello、ターゲット名はoutputなので、<p>にdata-hello-target="output"を付けます`
      ],
      check: `assert($("[data-controller=hello]"), "data-controller=helloの要素が必要です");
click("button");
await sleep(50);
assert(text("p") === "こんにちは！", "ボタンを押すと<p>に「こんにちは！」と表示されるはずです。コンソールのMissing targetエラーを手がかりに、<p>へdata-hello-target属性を追加しましょう");`
    },
    {
      id: 222,
      title: "static targetsの宣言忘れ（undefinedのTypeError）",
      explanation: `<p>今度はHTML側は正しいのにJS側の宣言を忘れたパターンです。ボタンを押しても画面は変わらず、コンソールには次のようなエラーが出ます。</p>
<pre><code>TypeError: Cannot set properties of undefined (setting 'textContent')</code></pre>
<p>前ステップのMissing targetとはエラーの種類が違うことに注目してください。<code>static targets = ["output"]</code>を宣言していないと、Stimulusは<code>this.outputTarget</code>というプロパティを<strong>そもそも作りません</strong>。存在しないプロパティを読むとJavaScriptの仕様どおり<code>undefined</code>になり、その<code>undefined</code>に対して<code>.textContent</code>を設定しようとしてTypeErrorになります。</p>
<p>2種類のエラーの見分け方を整理します。</p>
<table>
<tr><th>コンソールの表示</th><th>原因</th></tr>
<tr><td>Missing target element ...</td><td>宣言はあるがHTML側に属性が無い</td></tr>
<tr><td>TypeError: ... of undefined</td><td>static targetsの宣言が無い（プロパティ自体が存在しない）</td></tr>
</table>
<p>修正パターンは、コントローラのクラス先頭に<code>static targets = ["ターゲット名"]</code>を書くことです。</p>
<pre><code>application.register("quote", class extends Controller {
  static targets = ["output"];
  ...
});</code></pre>
<p>ターゲットを使うには「JS側の宣言」と「HTML側の属性」の両方が必要、と覚えましょう。</p>`,
      task: `static targetsの宣言を追加して、ボタンを押すと名言が表示されるようにしてください。`,
      code: `<div data-controller="quote">
  <button data-action="quote#show">名言を表示</button>
  <p data-quote-target="output">？</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("quote", class extends Controller {
  // TODO: static targetsの宣言が無いため、this.outputTargetがundefinedになる
  show() {
    this.outputTarget.textContent = "継続は力なり";
  }
});
<\/script>`,
      solution: `<div data-controller="quote">
  <button data-action="quote#show">名言を表示</button>
  <p data-quote-target="output">？</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("quote", class extends Controller {
  static targets = ["output"];
  show() {
    this.outputTarget.textContent = "継続は力なり";
  }
});
<\/script>`,
      hints: [
        `コンソールにTypeError: Cannot set properties of undefinedと出ています。this.outputTargetがundefinedです`,
        `HTML側のdata-quote-target="output"は正しいので、足りないのはJS側の宣言です`,
        `クラスの先頭にstatic targets = ["output"];を追加しましょう`
      ],
      check: `assert($("[data-quote-target=output]"), "data-quote-target=outputの要素が必要です");
click("button");
await sleep(50);
assert(text("[data-quote-target=output]") === "継続は力なり", "ボタンを押すと「継続は力なり」と表示されるはずです。static targets = [\\"output\\"]の宣言を追加しましょう");`
    },
    {
      id: 223,
      title: "ターゲット属性のコントローラ名ミス",
      explanation: `<p>他の画面からHTMLをコピーしてきたときによく起きるバグです。ボタンを押すとコンソールに見覚えのあるエラーが出ます。</p>
<pre><code>Error: Missing target element "name" for "profile" controller</code></pre>
<p>「HTMLに属性は書いてあるのに？」と思ってよく見ると、属性が<code>data-user-target="name"</code>になっています。コントローラは<code>profile</code>なので、Stimulusが探すのは<code>data-profile-target="name"</code>です。<strong>ターゲット属性の前半部分は必ず自分のコントローラ名</strong>でなければならず、別のコントローラ名が入っていると完全に無視されます。</p>
<p>このバグの厄介なところは、属性自体は存在するため「書いたつもり」になりやすい点です。デバッグ手順は次のとおりです。</p>
<ol>
<li>エラー文からコントローラ名（profile）とターゲット名（name）を確認する</li>
<li>HTMLを検索して、data-profile-target="name"が<strong>一字一句この形で</strong>存在するか確認する</li>
<li>data-user-targetのように前半が違う属性が残っていたら書き換える</li>
</ol>
<p>Stimulusの属性は「どのコントローラのものか」を名前に含める設計になっています。これは複数のコントローラが同じ要素の近くに共存しても衝突しないための仕組みで、裏を返すと名前の一致が少しでも崩れると接続されません。</p>`,
      task: `ターゲット属性のコントローラ名部分を修正して、ボタンを押すと名前が表示されるようにしてください。`,
      code: `<div data-controller="profile">
  <button data-action="profile#show">名前を表示</button>
  <!-- TODO: 別の画面からコピーしたためコントローラ名部分がuserのままになっている -->
  <p data-user-target="name">???</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("profile", class extends Controller {
  static targets = ["name"];
  show() {
    this.nameTarget.textContent = "田中さん";
  }
});
<\/script>`,
      solution: `<div data-controller="profile">
  <button data-action="profile#show">名前を表示</button>
  <p data-profile-target="name">???</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("profile", class extends Controller {
  static targets = ["name"];
  show() {
    this.nameTarget.textContent = "田中さん";
  }
});
<\/script>`,
      hints: [
        `エラー文はMissing target element "name" for "profile" controllerです。profileコントローラが探しています`,
        `HTMLの属性はdata-user-target="name"になっています。前半のコントローラ名部分が違います`,
        `data-profile-target="name"に書き換えましょう`
      ],
      check: `assert(!$("[data-user-target]"), "data-user-targetという属性が残っています。コントローラ名はprofileなのでdata-profile-targetに直しましょう");
assert($("[data-profile-target=name]"), "data-profile-target=nameの要素が必要です");
click("button");
await sleep(50);
assert(text("[data-profile-target=name]") === "田中さん", "ボタンを押すと「田中さん」と表示されるはずです");`
    },
    {
      id: 224,
      title: "ターゲット名のキャメルケースはそのまま書く",
      explanation: `<p>複数単語のターゲット名で起きる変換ミスです。ボタンを押すと次のエラーが出ます。</p>
<pre><code>Error: Missing target element "outputText" for "note" controller</code></pre>
<p>JSでは<code>static targets = ["outputText"]</code>とキャメルケースで宣言しています。ここでバリューの習慣（属性名はケバブケースに変換される）を思い出して、HTML側を<code>data-note-target="output-text"</code>と書いてしまうと接続されません。</p>
<p>ルールを整理すると次のようになります。ケバブケースに変換されるのは<strong>属性の名前の部分</strong>だけで、ターゲット名は属性の<strong>値</strong>なので変換されず、宣言した文字列と完全一致で照合されます。</p>
<table>
<tr><th>種類</th><th>JS側の宣言</th><th>HTML側の書き方</th></tr>
<tr><td>ターゲット</td><td>static targets = ["outputText"]</td><td>data-note-target="outputText"（値はそのまま）</td></tr>
<tr><td>バリュー</td><td>static values = { maxCount: Number }</td><td>data-note-max-count-value="5"（属性名はケバブ化）</td></tr>
</table>
<p>「属性名はケバブ、属性値はそのまま」と覚えておくと、この種のミスをすぐ見抜けます。エラー文に表示されるターゲット名（outputText）をそのままHTML内で検索して、見つからなければ書き方を疑いましょう。</p>`,
      task: `ターゲット属性の値をJS側の宣言と一致させて、ボタンでメモが表示されるようにしてください。`,
      code: `<div data-controller="note">
  <button data-action="note#save">保存</button>
  <!-- TODO: ターゲット名はキャメルケースのまま書く必要がある -->
  <p data-note-target="output-text">未保存</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("note", class extends Controller {
  static targets = ["outputText"];
  save() {
    this.outputTextTarget.textContent = "メモを保存しました";
  }
});
<\/script>`,
      solution: `<div data-controller="note">
  <button data-action="note#save">保存</button>
  <p data-note-target="outputText">未保存</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("note", class extends Controller {
  static targets = ["outputText"];
  save() {
    this.outputTextTarget.textContent = "メモを保存しました";
  }
});
<\/script>`,
      hints: [
        `エラー文のターゲット名はoutputTextです。HTML側の値はoutput-textになっていて一致していません`,
        `ターゲット名は属性の「値」なのでケバブケースに変換されません。宣言と同じ文字列を書きます`,
        `data-note-target="outputText"に修正しましょう`
      ],
      check: `assert($('[data-note-target="outputText"]'), "data-note-target=\\"outputText\\"の要素が必要です。ターゲット名は宣言どおりキャメルケースのまま書きます");
click("button");
await sleep(50);
assert(text('[data-note-target="outputText"]') === "メモを保存しました", "ボタンを押すと「メモを保存しました」と表示されるはずです");`
    },
    {
      id: 225,
      title: "hasXxxTargetで存在チェックする",
      explanation: `<p>「あってもなくてもよい」ターゲットの扱いを間違えるパターンです。このコードのdetailターゲット（内訳表示欄）は、ページによっては置かれない任意の要素という設計です。今回のページには置かれていないため、ボタンを押すと次のエラーが出ます。</p>
<pre><code>Error: Missing target element "detail" for "pay" controller</code></pre>
<p>問題はエラーが出ることだけではありません。エラーが出た行で処理が中断するため、<strong>その後に書いてある合計表示まで動かなくなる</strong>のです。1行のミスが機能全体を巻き込むのが、この種のバグの怖いところです。</p>
<p>Stimulusは、各ターゲットに対して存在確認用のプロパティ<code>this.hasXxxTarget</code>（真偽値）を自動で用意しています。任意のターゲットに触るときは必ずこれでガードします。</p>
<pre><code>if (this.hasDetailTarget) {
  this.detailTarget.textContent = "内訳：100円×3";
}
this.totalTarget.textContent = "300円";</code></pre>
<table>
<tr><th>プロパティ</th><th>返り値</th><th>用途</th></tr>
<tr><td>this.detailTarget</td><td>要素（無ければエラー）</td><td>必ず存在する前提で使う</td></tr>
<tr><td>this.hasDetailTarget</td><td>true / false</td><td>存在チェック</td></tr>
<tr><td>this.detailTargets</td><td>配列（無ければ空配列）</td><td>0個以上をまとめて扱う</td></tr>
</table>`,
      task: `detailターゲットへのアクセスをhasDetailTargetのチェックで囲み、detailが無いページでも合計が表示されるようにしてください。`,
      code: `<div data-controller="pay">
  <button data-action="pay#calc">合計を計算</button>
  <p>合計：<span data-pay-target="total">-</span></p>
  <!-- このページには内訳表示（detailターゲット）は置いていない -->
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("pay", class extends Controller {
  static targets = ["total", "detail"];
  calc() {
    // TODO: detailは無いページもあるのに存在チェックせずアクセスしている。
    // ここでエラーになり、下の合計表示まで動かない
    this.detailTarget.textContent = "内訳：100円×3";
    this.totalTarget.textContent = "300円";
  }
});
<\/script>`,
      solution: `<div data-controller="pay">
  <button data-action="pay#calc">合計を計算</button>
  <p>合計：<span data-pay-target="total">-</span></p>
  <!-- このページには内訳表示（detailターゲット）は置いていない -->
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("pay", class extends Controller {
  static targets = ["total", "detail"];
  calc() {
    if (this.hasDetailTarget) {
      this.detailTarget.textContent = "内訳：100円×3";
    }
    this.totalTarget.textContent = "300円";
  }
});
<\/script>`,
      hints: [
        `コンソールにMissing target element "detail"と出て、そこで処理が止まっています`,
        `存在しないかもしれないターゲットはthis.hasDetailTargetでチェックしてから使います`,
        `if (this.hasDetailTarget) { ... } で内訳の行だけを囲みましょう`
      ],
      check: `assert($("[data-pay-target=total]"), "data-pay-target=totalの要素が必要です");
click("button");
await sleep(50);
assert(text("[data-pay-target=total]") === "300円", "detailターゲットが無いページでも、合計に「300円」と表示されるはずです。hasDetailTargetで存在チェックしましょう");`
    },
    {
      id: 226,
      title: "valueの型指定ミスで文字列連結になる",
      explanation: `<p>今度はエラーが出ないのに結果がおかしいパターンです。カウンターのボタンを2回押すと、期待する「2」ではなく「011」と表示されます。コンソールは静かなままなので、エラー頼みのデバッグでは見つけられません。</p>
<p>原因は<code>static values</code>の型指定です。このコードでは<code>count: String</code>と宣言しているため、<code>this.countValue</code>は常に<strong>文字列</strong>として扱われます。JavaScriptで文字列に数値を足すと連結になるので、次のように増えていきます。</p>
<pre><code>"0" + 1  → "01"
"01" + 1 → "011"</code></pre>
<p>Stimulusのバリューは、宣言した型に従ってdata属性の文字列を変換してくれる仕組みでした。HTMLの属性値はすべて文字列なので、<strong>数値として計算したいなら必ずNumberを指定</strong>する必要があります。</p>
<table>
<tr><th>宣言</th><th>this.countValueの中身</th><th>+1した結果</th></tr>
<tr><td>count: String</td><td>"0"（文字列）</td><td>"01"（連結）</td></tr>
<tr><td>count: Number</td><td>0（数値）</td><td>1（加算）</td></tr>
</table>
<p>「数字が横に伸びていく」「計算結果が桁違いに大きい」という症状を見たら、まず型指定を疑いましょう。<code>console.log(typeof this.countValue)</code>で型を確認するのも有効なデバッグ手段です。</p>`,
      task: `countバリューの型指定を修正して、ボタンを押すたびに1ずつ正しく加算されるようにしてください。`,
      code: `<div data-controller="tally" data-tally-count-value="0">
  <button data-action="tally#up">+1</button>
  <p data-tally-target="num">0</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("tally", class extends Controller {
  static targets = ["num"];
  // TODO: 型指定がStringのため+1が文字列連結になってしまう
  static values = { count: String };
  up() {
    this.countValue = this.countValue + 1;
    this.numTarget.textContent = this.countValue;
  }
});
<\/script>`,
      solution: `<div data-controller="tally" data-tally-count-value="0">
  <button data-action="tally#up">+1</button>
  <p data-tally-target="num">0</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("tally", class extends Controller {
  static targets = ["num"];
  static values = { count: Number };
  up() {
    this.countValue = this.countValue + 1;
    this.numTarget.textContent = this.countValue;
  }
});
<\/script>`,
      hints: [
        `2回押すと「011」になります。"0" + 1が文字列連結されている症状です`,
        `static valuesの型指定を見てください。Stringになっています`,
        `count: Numberに変えると、data属性の文字列が数値に変換されてから渡されます`
      ],
      check: `assert($("[data-controller=tally]"), "data-controller=tallyの要素が必要です");
click("button");
await sleep(50);
click("button");
await sleep(50);
assert(text("[data-tally-target=num]") === "2", "2回押したら2になるはずです。01や011のようになる場合は、countValueが文字列のまま連結されています。型指定をNumberにしましょう");`
    },
    {
      id: 227,
      title: "static valuesの宣言忘れでNaN",
      explanation: `<p>在庫カウンターのボタンを押すと、残り個数が「NaN」と表示されてしまいます。NaNはNot a Number（数値でない）の意味で、<strong>数値計算の中にundefinedなどが混ざったときの典型的な症状</strong>です。</p>
<p>原因を追いかけましょう。HTMLには<code>data-stock-limit-value="10"</code>と正しく書いてありますが、JS側に<code>static values</code>の宣言がありません。ターゲットのときと同じで、宣言が無ければStimulusは<code>this.limitValue</code>というプロパティを作らないため、読むと<code>undefined</code>になります。そして</p>
<pre><code>undefined - 1  → NaN</code></pre>
<p>となり、画面にNaNが現れるのです。ターゲットの宣言忘れ（TypeError）と違い、<strong>引き算はエラーにならず静かにNaNを生む</strong>ので、コンソールにエラーが出ない点に注意してください。</p>
<p>デバッグの定石は、NaNを見たら計算に使った材料をconsole.logで1つずつ確認することです。<code>console.log(this.limitValue)</code>がundefinedと出れば、宣言忘れか名前の不一致が確定します。</p>
<p>修正パターンは、クラスに<code>static values = { limit: Number }</code>を追加することです。バリューも「JS側の宣言」と「HTML側の属性」が揃って初めて動きます。</p>`,
      task: `static valuesの宣言を追加して、ボタンを押すと残り個数が10から1ずつ減るようにしてください。`,
      code: `<div data-controller="stock" data-stock-limit-value="10">
  <button data-action="stock#take">1つ取る</button>
  <p>残り<span data-stock-target="left">10</span>個</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("stock", class extends Controller {
  static targets = ["left"];
  // TODO: static valuesの宣言が無いため、this.limitValueがundefinedになる
  connect() {
    this.taken = 0;
  }
  take() {
    this.taken = this.taken + 1;
    this.leftTarget.textContent = this.limitValue - this.taken;
  }
});
<\/script>`,
      solution: `<div data-controller="stock" data-stock-limit-value="10">
  <button data-action="stock#take">1つ取る</button>
  <p>残り<span data-stock-target="left">10</span>個</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("stock", class extends Controller {
  static targets = ["left"];
  static values = { limit: Number };
  connect() {
    this.taken = 0;
  }
  take() {
    this.taken = this.taken + 1;
    this.leftTarget.textContent = this.limitValue - this.taken;
  }
});
<\/script>`,
      hints: [
        `NaNは計算にundefinedが混ざった症状です。console.log(this.limitValue)で確認してみましょう`,
        `HTML側のdata-stock-limit-value="10"は正しいので、足りないのはJS側の宣言です`,
        `static values = { limit: Number };をクラスに追加しましょう`
      ],
      check: `assert($("[data-stock-target=left]"), "data-stock-target=leftの要素が必要です");
click("button");
await sleep(50);
assert(text("[data-stock-target=left]") === "9", "1回取ったら残りは9になるはずです。NaNと表示される場合はstatic valuesの宣言が抜けています");
click("button");
await sleep(50);
assert(text("[data-stock-target=left]") === "8", "2回取ったら残りは8になるはずです");`
    },
    {
      id: 228,
      title: "value属性名のケバブケース変換ミス",
      explanation: `<p>ボタンを何度押してもカウントが0のまま増えません。エラーも出ません。原因はHTMLの属性名にあります。</p>
<p>JSでは<code>static values = { maxCount: Number }</code>とキャメルケースで宣言しています。このとき対応するHTML属性の名前は、<strong>ケバブケースに変換した</strong><code>data-clicker-max-count-value</code>です。ところがこのコードでは<code>data-clicker-maxCount-value</code>と書いています。</p>
<p>さらに落とし穴として、HTMLの属性名は大文字小文字を区別せずすべて小文字として扱われるため、実際には<code>data-clicker-maxcount-value</code>という属性になります。Stimulusが探す<code>data-clicker-max-count-value</code>とは一致しないので、値は見つからず<strong>Number型の既定値である0</strong>が使われます。その結果「0未満なら増やす」の条件が常に不成立となり、カウントが動かないのです。</p>
<table>
<tr><th>JS側の宣言</th><th>正しい属性名</th><th>間違い例</th></tr>
<tr><td>maxCount: Number</td><td>data-clicker-max-count-value</td><td>data-clicker-maxCount-value</td></tr>
</table>
<p>ステップ224と合わせて「属性名はケバブ、属性値（ターゲット名）はそのまま」の対応を再確認しましょう。値が既定値（Numberなら0、Stringなら空文字）になっているときは、まず属性名の変換ミスを疑うのが定石です。</p>`,
      task: `maxCountバリューの属性名を正しいケバブケースに修正して、5回までカウントできるようにしてください。`,
      code: `<!-- TODO: キャメルケースのままではStimulusが属性を見つけられない -->
<div data-controller="clicker" data-clicker-maxCount-value="5">
  <button data-action="clicker#tap">押す</button>
  <p data-clicker-target="log">0</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("clicker", class extends Controller {
  static targets = ["log"];
  static values = { maxCount: Number };
  tap() {
    const n = parseInt(this.logTarget.textContent, 10);
    if (n < this.maxCountValue) {
      this.logTarget.textContent = n + 1;
    }
  }
});
<\/script>`,
      solution: `<div data-controller="clicker" data-clicker-max-count-value="5">
  <button data-action="clicker#tap">押す</button>
  <p data-clicker-target="log">0</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("clicker", class extends Controller {
  static targets = ["log"];
  static values = { maxCount: Number };
  tap() {
    const n = parseInt(this.logTarget.textContent, 10);
    if (n < this.maxCountValue) {
      this.logTarget.textContent = n + 1;
    }
  }
});
<\/script>`,
      hints: [
        `console.log(this.maxCountValue)を入れると0と出ます。属性が見つからず既定値になっています`,
        `キャメルケースのmaxCountは、属性名ではmax-countとケバブケースに変換されます`,
        `data-clicker-max-count-value="5"に修正しましょう`
      ],
      check: `assert($("[data-clicker-max-count-value]"), "属性名はdata-clicker-max-count-valueです。maxCountはケバブケースのmax-countに変換して書きます");
click("button");
await sleep(50);
click("button");
await sleep(50);
click("button");
await sleep(50);
assert(text("[data-clicker-target=log]") === "3", "3回押したら3になるはずです。0のまま動かない場合はmaxCountValueが既定値0になっています");`
    },
    {
      id: 229,
      title: "valueChangedコールバックの名前ミス",
      explanation: `<p>バリューには、値が変わるたびに自動で呼ばれるコールバック（変更検知メソッド）があります。名前の規則は<strong>バリュー名+ValueChanged</strong>で、pointバリューなら<code>pointValueChanged()</code>です。さらに重要な性質として、<strong>接続時に初期値でも1回呼ばれる</strong>ため、初期表示にも使えます。</p>
<p>このコードでは<code>pointChanged()</code>と書いてしまっています。Valueが抜けているだけですが、Stimulusから見ればまったく無関係なただのメソッドなので、<strong>一度も呼ばれず、エラーも警告も出ません</strong>。ボタンを押すとpointValue自体は増えているのに、画面は「まだ」のまま変わらない、という症状になります。</p>
<p>「呼ばれるはずのメソッドが呼ばれない」系のバグは、名前の規則ミスを最初に疑うのが定石です。確認の手順は次のとおりです。</p>
<ol>
<li>メソッドの先頭に<code>console.log("called")</code>を入れて、本当に呼ばれていないことを確かめる</li>
<li>規則（バリュー名+ValueChanged）と一字一句比べる</li>
</ol>
<pre><code>static values = { point: Number };

pointValueChanged() {
  // 接続時に1回＋値が変わるたびに呼ばれる
  this.viewTarget.textContent = this.pointValue + "点";
}</code></pre>`,
      task: `コールバックのメソッド名を正しい規則に直して、接続直後に「0点」、ボタンを押すたびに得点表示が更新されるようにしてください。`,
      code: `<div data-controller="score" data-score-point-value="0">
  <button data-action="score#add">得点する</button>
  <p data-score-target="view">まだ</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("score", class extends Controller {
  static targets = ["view"];
  static values = { point: Number };
  add() {
    this.pointValue = this.pointValue + 1;
  }
  // TODO: 名前が規則と違うため一度も呼ばれない（正しくはバリュー名+ValueChanged）
  pointChanged() {
    this.viewTarget.textContent = this.pointValue + "点";
  }
});
<\/script>`,
      solution: `<div data-controller="score" data-score-point-value="0">
  <button data-action="score#add">得点する</button>
  <p data-score-target="view">まだ</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("score", class extends Controller {
  static targets = ["view"];
  static values = { point: Number };
  add() {
    this.pointValue = this.pointValue + 1;
  }
  pointValueChanged() {
    this.viewTarget.textContent = this.pointValue + "点";
  }
});
<\/script>`,
      hints: [
        `エラーは出ませんが、表示が「まだ」のまま変わりません。コールバックが一度も呼ばれていません`,
        `変更検知コールバックの名前規則は「バリュー名+ValueChanged」です`,
        `pointChangedをpointValueChangedに直しましょう。直すと接続時にも1回呼ばれて初期表示されます`
      ],
      check: `assert($("[data-score-target=view]"), "data-score-target=viewの要素が必要です");
assert(text("[data-score-target=view]") === "0点", "接続直後にpointValueChangedが初期値で呼ばれ、「0点」と表示されるはずです。メソッド名の規則を確認しましょう");
click("button");
await sleep(50);
assert(text("[data-score-target=view]") === "1点", "ボタンを押すと「1点」に更新されるはずです");`
    },
    {
      id: 230,
      title: "総合演習：ターゲットとバリューのバグを全部直す",
      explanation: `<p>この章の総合演習です。目標達成カウンター（現在値/目標値を表示し、ボタンで目標まで進める）に、この章で学んだバグが<strong>3つ</strong>仕込まれています。コンソールと画面の症状を手がかりに、すべて直してください。</p>
<p>期待する完成形の動きは次のとおりです。</p>
<ul>
<li>接続直後に「0/3」と表示される（変更検知コールバックは接続時にも呼ばれる）</li>
<li>ボタンを押すたびに1/3、2/3、3/3と進む</li>
<li>3/3に達したらそれ以上は増えない</li>
</ul>
<p>デバッグの進め方のおさらいです。</p>
<ol>
<li><strong>症状の観察</strong>：初期表示が「-」のまま→表示を担当する処理が動いていない</li>
<li><strong>コンソール確認</strong>：Missing targetエラーが出ていないか、エラー文のコントローラ名と属性を突き合わせる</li>
<li><strong>名前の規則確認</strong>：ターゲット属性の前半は自分のコントローラ名か、コールバック名は「バリュー名+ValueChanged」か</li>
<li><strong>型の確認</strong>：数値計算するバリューがNumberで宣言されているか（Stringだと"01"のような連結になる）</li>
</ol>
<table>
<tr><th>症状</th><th>疑う場所</th></tr>
<tr><td>Missing targetエラー</td><td>ターゲット属性の名前・場所</td></tr>
<tr><td>数字が011のように伸びる</td><td>valueの型指定</td></tr>
<tr><td>コールバックが呼ばれない</td><td>メソッド名の規則</td></tr>
</table>`,
      task: `3つのバグ（ターゲット属性のコントローラ名、valueの型指定、コールバック名）をすべて修正し、0/3から3/3まで正しく進むカウンターにしてください。`,
      code: `<div data-controller="goal"
     data-goal-now-value="0"
     data-goal-max-value="3">
  <button data-action="goal#step">進める</button>
  <!-- バグ1：ターゲット属性のコントローラ名部分が違う -->
  <p data-count-target="view">-</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("goal", class extends Controller {
  static targets = ["view"];
  // バグ2：nowの型指定が違うため加算が文字列連結になる
  static values = { now: String, max: Number };
  step() {
    if (this.nowValue < this.maxValue) {
      this.nowValue = this.nowValue + 1;
    }
  }
  // バグ3：コールバック名が規則と違うため呼ばれない
  nowChanged() {
    this.viewTarget.textContent = this.nowValue + "/" + this.maxValue;
  }
});
<\/script>`,
      solution: `<div data-controller="goal"
     data-goal-now-value="0"
     data-goal-max-value="3">
  <button data-action="goal#step">進める</button>
  <p data-goal-target="view">-</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("goal", class extends Controller {
  static targets = ["view"];
  static values = { now: Number, max: Number };
  step() {
    if (this.nowValue < this.maxValue) {
      this.nowValue = this.nowValue + 1;
    }
  }
  nowValueChanged() {
    this.viewTarget.textContent = this.nowValue + "/" + this.maxValue;
  }
});
<\/script>`,
      hints: [
        `バグ1：コントローラ名はgoalなのに、表示先の属性がdata-count-targetになっています`,
        `バグ2：static valuesでnowがStringになっています。加算するのでNumberにしましょう`,
        `バグ3：変更検知コールバックはnowChangedではなくnowValueChangedです`
      ],
      check: `assert($("[data-goal-target=view]"), "表示先の属性はdata-goal-target=\\"view\\"です。コントローラ名部分を確認しましょう");
assert(text("[data-goal-target=view]") === "0/3", "接続直後に「0/3」と表示されるはずです。nowValueChangedコールバックの名前を確認しましょう");
click("button");
await sleep(50);
click("button");
await sleep(50);
assert(text("[data-goal-target=view]") === "2/3", "2回押したら「2/3」になるはずです。01/3のようになる場合はnowの型指定がStringのままです");
click("button");
await sleep(50);
assert(text("[data-goal-target=view]") === "3/3", "3回押したら「3/3」になるはずです");
click("button");
await sleep(50);
assert(text("[data-goal-target=view]") === "3/3", "目標に達したらそれ以上は増えないはずです");`
    }
  ]
});
