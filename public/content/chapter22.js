// 第22章：よくあるエラー：アクション
registerChapter({
  number: 22,
  title: "よくあるエラー：アクション",
  description: "アクション記述子（data-action）の書き間違いによる典型的な不具合を再現し、コンソールの警告を手がかりに修正する訓練をします。",
  steps: [
    {
      id: 211,
      title: "矢印記法のミス（click=hello#greet）",
      explanation: `<h4>症状</h4>
<p>ボタンを押しても何も起きません。エラーも警告も出ないことが多く、見た目には「ただ無反応」です。</p>
<h4>デバッグの手がかり</h4>
<p>アクション記述子の正しい形をまず思い出しましょう。</p>
<pre><code>data-action="イベント名-&gt;コントローラ名#メソッド名"</code></pre>
<p>イベント名とコントローラ名の間は<strong>矢印（ハイフン＋大なり記号の2文字）</strong>で区切ります。今回のコードは<code>click=hello#greet</code>とイコールで書いています。この場合Stimulusは矢印が無いので「イベント名の指定なし」とみなし、<code>click=hello</code>という名前のコントローラの<code>greet</code>を呼ぼうとします。そんなコントローラは存在しないため、静かに何も起きません。</p>
<p>無反応でアクションを疑うときは、開発者ツールの要素タブでdata-action属性の値を目視し、<strong>矢印の2文字があるか</strong>・<strong>#があるか</strong>を確認するのが最短です。</p>
<h4>原因と修正</h4>
<pre><code>&lt;!-- 誤り --&gt;
&lt;button data-action="click=hello#greet"&gt;

&lt;!-- 正しい --&gt;
&lt;button data-action="click-&gt;hello#greet"&gt;</code></pre>
<p>イコールを矢印に直せば動きます。=や→（全角矢印）などの書き間違いはエディタの補完が効かないHTML属性内で起こりがちです。</p>`,
      task: `data-actionの区切りがイコールになっているため反応しません。正しい矢印記法に直してください。`,
      code: `<div data-controller="hello">
  <!-- TODO: 区切り文字が違うため無反応。正しい矢印記法に直そう -->
  <button data-action="click=hello#greet">あいさつ</button>
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
        `アクション記述子の形は「イベント名->コントローラ名#メソッド名」です`,
        `イコール（=）ではなく、ハイフンと大なり記号の2文字（->）で区切ります`,
        `data-action="click->hello#greet"が正解です`
      ],
      check: `assert($("[data-controller=hello]"), "data-controller=helloの要素が必要です");
const action = $("button").getAttribute("data-action") || "";
assert(action.indexOf("click->hello#greet") !== -1, "data-actionは矢印記法（click->hello#greet）で書きます");
click("button");
await sleep(50);
assert(text("[data-hello-target=output]") === "こんにちは！", "ボタンを押すと「こんにちは！」と表示されるはずです");`
    },
    {
      id: 212,
      title: "メソッド名タイポとコンソール警告の読み方",
      explanation: `<h4>症状</h4>
<p>ボタンを押すと、コンソールに次のようなエラーが出ます（表示されるだけで画面は無反応です）。</p>
<pre><code>Error: Action "click-&gt;hello#gret" references undefined method "gret"</code></pre>
<h4>デバッグの手がかり</h4>
<p>これはStimulusが出してくれる<strong>とても親切なエラー</strong>です。日本語にすると「アクションclick-&gt;hello#gretが、定義されていないメソッドgretを参照している」。つまり次の2つが一度に分かります。</p>
<table>
<tr><th>エラー文の部分</th><th>分かること</th></tr>
<tr><td>Action "click-&gt;hello#gret"</td><td>問題のdata-actionがどれか</td></tr>
<tr><td>undefined method "gret"</td><td>存在しないメソッド名がgretであること</td></tr>
</table>
<p>接続ミス（前章）はエラーが出ないのに対し、<strong>接続には成功していてメソッドだけ見つからない場合はこうして教えてくれます</strong>。エラーが出るぶん、こちらのほうがずっとデバッグしやすい不具合です。コンソールは「開いてから操作する」を習慣にしましょう。押した瞬間に出るエラーは、その操作に紐づく不具合のサインです。</p>
<h4>原因と修正</h4>
<p>HTML側が<code>gret</code>、JS側が<code>greet</code>と食い違っています。正しい綴りはgreetなので、HTML側を<code>click-&gt;hello#greet</code>に直します。#の後ろのメソッド名は、JSのメソッド名と<strong>大文字小文字も含めて完全一致</strong>が必要です。</p>`,
      task: `ボタンを押すとコンソールに「references undefined method」というエラーが出ます。エラー文を読み、data-actionのメソッド名を修正してください。`,
      code: `<div data-controller="hello">
  <!-- TODO: 押すとコンソールにエラーが出る。エラー文が示すメソッド名を確認しよう -->
  <button data-action="click->hello#gret">あいさつ</button>
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
        `エラー文のundefined method "gret"が、存在しないメソッド名を教えてくれています`,
        `JS側で定義されているのはgreetです。HTML側のdata-actionをそれに合わせましょう`,
        `#の後ろのメソッド名はJSのメソッド名と完全一致（大文字小文字も）が必要です`
      ],
      check: `assert($("[data-controller=hello]"), "data-controller=helloの要素が必要です");
const action = $("button").getAttribute("data-action") || "";
assert(action.indexOf("#greet") !== -1, "data-actionのメソッド名をJS側と同じgreetに直します");
click("button");
await sleep(50);
assert(text("[data-hello-target=output]") === "こんにちは！", "ボタンを押すと「こんにちは！」と表示されるはずです");`
    },
    {
      id: 213,
      title: "イベント名のミス（onclickと書いてしまう）",
      explanation: `<h4>症状</h4>
<p>ボタンを押しても無反応です。エラーも警告も出ません。</p>
<h4>デバッグの手がかり</h4>
<p>昔ながらのHTML属性<code>onclick="..."</code>の記憶から、data-actionにも<code>onclick-&gt;</code>と書いてしまうミスです。Stimulusのイベント名は<strong>addEventListenerに渡すイベント名と同じ</strong>で、onは付けません。<code>onclick-&gt;hello#greet</code>と書くと、Stimulusは律儀に「onclickという名前のイベント」を待ち受けます。そんなイベントは発生しないので、永遠に呼ばれません。</p>
<table>
<tr><th>誤り</th><th>正しいイベント名</th></tr>
<tr><td>onclick</td><td>click</td></tr>
<tr><td>oninput</td><td>input</td></tr>
<tr><td>onchange</td><td>change</td></tr>
<tr><td>onsubmit</td><td>submit</td></tr>
<tr><td>onkeydown</td><td>keydown</td></tr>
</table>
<p>「記述子の形は合っているのに無反応」のときは、矢印の左側のイベント名が<strong>実在するイベントか</strong>を疑いましょう。存在しないイベント名を書いてもStimulusはエラーを出さない（カスタムイベントかもしれないため区別できない）ことも覚えておくと、デバッグの当たりが早くなります。</p>
<h4>原因と修正</h4>
<p><code>onclick-&gt;</code>を<code>click-&gt;</code>に直すだけです。ちなみにbuttonの場合はイベント名を省略して<code>data-action="hello#greet"</code>と書くとclickが既定で使われるので、省略形にしてしまうのも1つの手です。</p>`,
      task: `data-actionのイベント名がonclickになっているため反応しません。正しいイベント名に修正してください。`,
      code: `<div data-controller="hello">
  <!-- TODO: イベント名が違うため無反応。onは付けない -->
  <button data-action="onclick->hello#greet">あいさつ</button>
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
        `Stimulusのイベント名はaddEventListenerと同じで、onを付けません`,
        `onclickではなくclickです。data-action="click->hello#greet"に直しましょう`,
        `存在しないイベント名を書いてもエラーは出ず、ただ待ち続けるだけになります`
      ],
      check: `assert($("[data-controller=hello]"), "data-controller=helloの要素が必要です");
const action = $("button").getAttribute("data-action") || "";
assert(action.indexOf("onclick") === -1, "イベント名にonは付けません。onclickではなくclickです");
click("button");
await sleep(50);
assert(text("[data-hello-target=output]") === "こんにちは！", "ボタンを押すと「こんにちは！」と表示されるはずです");`
    },
    {
      id: 214,
      title: ":prevent忘れでフォーム送信の標準動作が走る",
      explanation: `<h4>症状</h4>
<p>フォームの送信ボタンを押すと、一瞬メッセージが出た直後に<strong>ページがリロードされて全部消えます</strong>。実際のブラウザではこれが典型症状です（この学習環境ではサンドボックスが遷移をブロックし、コンソールに送信がブロックされた旨の警告が出ることがあります）。</p>
<h4>デバッグの手がかり</h4>
<p>formのsubmitには「フォームを送信してページを遷移（リロード）する」という<strong>ブラウザの標準動作</strong>があります。JS側の処理が正しく動いていても、標準動作を止めなければ直後にページごと消えてしまうのです。「処理した結果が一瞬で消える」「画面がチラつく」と感じたら、標準動作を疑いましょう。</p>
<h4>原因と修正</h4>
<p>Stimulusではアクションの末尾にオプション<code>:prevent</code>を付けるだけで、<code>event.preventDefault()</code>を自動で呼んでくれます。</p>
<pre><code>&lt;!-- 誤り：標準動作が走ってリロードされる --&gt;
&lt;form data-action="submit-&gt;contact#send"&gt;

&lt;!-- 正しい：標準動作を止める --&gt;
&lt;form data-action="submit-&gt;contact#send:prevent"&gt;</code></pre>
<p>メソッド内で<code>event.preventDefault()</code>を書いても同じ効果ですが、HTMLを見ただけで「標準動作を止めている」と分かる<code>:prevent</code>のほうが読みやすくおすすめです。リンクの<code>click</code>で画面遷移を止めたいときにも同じ形が使えます。</p>`,
      task: `送信イベントの標準動作が止められていないため、実際のブラウザではページがリロードされてしまいます。data-actionに:preventを付けて修正してください。`,
      code: `<!-- TODO: 送信すると標準動作（ページリロード）が走ってしまう -->
<form data-controller="contact" data-action="submit->contact#send">
  <input data-contact-target="input" type="text" placeholder="メッセージ">
  <button type="submit">送信</button>
  <p data-contact-target="output"></p>
</form>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("contact", class extends Controller {
  static targets = ["input", "output"];
  send() {
    this.outputTarget.textContent = "送信しました：" + this.inputTarget.value;
  }
});
<\/script>`,
      solution: `<form data-controller="contact" data-action="submit->contact#send:prevent">
  <input data-contact-target="input" type="text" placeholder="メッセージ">
  <button type="submit">送信</button>
  <p data-contact-target="output"></p>
</form>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("contact", class extends Controller {
  static targets = ["input", "output"];
  send() {
    this.outputTarget.textContent = "送信しました：" + this.inputTarget.value;
  }
});
<\/script>`,
      hints: [
        `submitイベントには「送信してページ遷移する」というブラウザ標準動作があります`,
        `アクションの末尾に:preventを付けると、event.preventDefault()が自動で呼ばれます`,
        `data-action="submit->contact#send:prevent"が正解です`
      ],
      check: `assert($("[data-controller=contact]"), "data-controller=contactのフォームが必要です");
setValue("[data-contact-target=input]", "こんにちは");
const form = $("form");
const ev = new Event("submit", { bubbles: true, cancelable: true });
form.dispatchEvent(ev);
await sleep(50);
assert(ev.defaultPrevented, "送信イベントの標準動作（ページリロード）が止められていません。data-actionに:preventを付けましょう");
assert(text("[data-contact-target=output]") === "送信しました：こんにちは", "送信すると「送信しました：こんにちは」と表示されるはずです");`
    },
    {
      id: 215,
      title: "#の代わりにドットで区切ってしまう",
      explanation: `<h4>症状</h4>
<p>ボタンを押しても無反応です。環境によってはコンソールに記述子を解釈できない旨のエラーが表示されます。</p>
<h4>デバッグの手がかり</h4>
<p>JSでは<code>obj.method()</code>のようにドットでメソッドを呼ぶため、その感覚でdata-actionにも<code>hello.greet</code>と書いてしまうミスです。しかしアクション記述子でコントローラ名とメソッド名を区切るのは<strong>シャープ（#）</strong>です。</p>
<pre><code>&lt;!-- 誤り：JSの感覚でドット --&gt;
&lt;button data-action="click-&gt;hello.greet"&gt;

&lt;!-- 正しい：#で区切る --&gt;
&lt;button data-action="click-&gt;hello#greet"&gt;</code></pre>
<p>#が無いとStimulusは記述子から「どのメソッドを呼ぶか」を読み取れません。記述子の3つの部品と区切り文字をセットで覚えましょう。</p>
<table>
<tr><th>部品</th><th>区切り</th></tr>
<tr><td>イベント名 と コントローラ名</td><td>矢印（-&gt;）</td></tr>
<tr><td>コントローラ名 と メソッド名</td><td>シャープ（#）</td></tr>
<tr><td>末尾のオプション（:preventなど）</td><td>コロン（:）</td></tr>
</table>
<h4>原因と修正</h4>
<p>ドットを#に直すだけです。無反応のときにdata-actionを目視するチェックポイントは「矢印はあるか」「#はあるか」「余計な記号はないか」の3つです。</p>`,
      task: `data-actionのコントローラ名とメソッド名の区切りがドットになっています。正しい区切り文字に修正してください。`,
      code: `<div data-controller="hello">
  <!-- TODO: 区切り文字が違う。コントローラ名とメソッド名の区切りは何だったか -->
  <button data-action="click->hello.greet">あいさつ</button>
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
        `コントローラ名とメソッド名の区切りはドット（.）ではなくシャープ（#）です`,
        `data-action="click->hello#greet"に直しましょう`,
        `JSのobj.method()の感覚で書いてしまいがちな、ありがちなミスです`
      ],
      check: `assert($("[data-controller=hello]"), "data-controller=helloの要素が必要です");
const action = $("button").getAttribute("data-action") || "";
assert(action.indexOf("hello#greet") !== -1, "コントローラ名とメソッド名は#で区切ります（hello#greet）");
click("button");
await sleep(50);
assert(text("[data-hello-target=output]") === "こんにちは！", "ボタンを押すと「こんにちは！」と表示されるはずです");`
    },
    {
      id: 216,
      title: "スコープ外のコントローラのメソッドは呼べない",
      explanation: `<h4>症状</h4>
<p>menuコントローラの中のボタンから、隣にあるpanelコントローラの<code>show</code>を呼ぼうとしていますが、押しても無反応です。エラーは出ません。</p>
<h4>デバッグの手がかり</h4>
<p>data-actionに書いたコントローラ名は、<strong>その要素の祖先をさかのぼって</strong>探されます。ボタンから見て祖先に<code>data-controller="panel"</code>の要素が無ければ、記述子がどれだけ正しくても呼び先が見つかりません。</p>
<pre><code>&lt;div data-controller="menu"&gt;
  &lt;button data-action="click-&gt;panel#show"&gt;
  ↑ボタンの祖先にpanelはいない→呼べない
&lt;/div&gt;
&lt;div data-controller="panel"&gt;…&lt;/div&gt;  ←隣（兄弟）はスコープ外</code></pre>
<p>「別のコントローラのメソッドを呼びたい」と思ったら、まず<strong>そのボタンは相手のスコープの中にあるか？</strong>を確認してください。</p>
<h4>原因と修正</h4>
<p>いちばん簡単な修正は、ボタンを<code>data-controller="panel"</code>の要素の内側に移動することです。ボタンをどうしても外に置きたい設計なら、第14章で学んだカスタムイベント（dispatch）や第15章のoutletsを使ってコントローラ同士を連携させますが、まずは「操作ボタンは相手のスコープ内に置く」というシンプルな構造にできないか考えるのがStimulus流です。</p>`,
      task: `ボタンがpanelコントローラのスコープ外にあるため反応しません。ボタンをpanelのdivの内側に移動してください（menuのdivは削除してかまいません）。`,
      code: `<!-- TODO: このボタンからはpanelのメソッドを呼べない。スコープを考えよう -->
<div data-controller="menu">
  <button data-action="click->panel#show">パネルを開く</button>
</div>

<div data-controller="panel">
  <p data-panel-target="output">閉じています</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("panel", class extends Controller {
  static targets = ["output"];
  show() {
    this.outputTarget.textContent = "開きました";
  }
});
<\/script>`,
      solution: `<div data-controller="panel">
  <button data-action="click->panel#show">パネルを開く</button>
  <p data-panel-target="output">閉じています</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("panel", class extends Controller {
  static targets = ["output"];
  show() {
    this.outputTarget.textContent = "開きました";
  }
});
<\/script>`,
      hints: [
        `data-actionのコントローラ名は、その要素の祖先から探されます。兄弟要素のコントローラは呼べません`,
        `ボタンをdata-controller="panel"のdivの内側に移動しましょう`,
        `menuのdivは今回不要なので削除してかまいません。スコープ外から呼びたい場合はdispatchやoutletsを使います`
      ],
      check: `assert($("[data-controller=panel] button"), "ボタンはdata-controller=panelの要素の内側に置く必要があります");
click("[data-controller=panel] button");
await sleep(50);
assert(text("[data-panel-target=output]") === "開きました", "ボタンを押すと「開きました」と表示されるはずです");`
    },
    {
      id: 217,
      title: "event.paramsの属性名ミス（コントローラ名が抜ける）",
      explanation: `<h4>症状</h4>
<p>「100円入金」を押すと、合計が<strong>NaN</strong>になります。エラーは出ません。</p>
<h4>デバッグの手がかり</h4>
<p>NaN（Not a Number）は「数値でないものと計算した」サインです。今回は<code>event.params.amount</code>が<code>undefined</code>になっていて、<code>0 + undefined</code>の結果がNaNです。paramsが取れないときは、<strong>data属性の名前の規則</strong>を確認します。正しい形は次のとおりです。</p>
<pre><code>data-コントローラ名-パラメータ名-param="値"</code></pre>
<p>今回のコードは<code>data-amount-param</code>と書いており、<strong>コントローラ名（wallet）が抜けています</strong>。paramsはアクションを処理したコントローラ名で絞り込まれるため、コントローラ名の無い属性は無視され、<code>event.params</code>は空のオブジェクトになります。</p>
<p>デバッグの定番は、メソッドの先頭で<code>console.log(event.params)</code>することです。空の<code>{}</code>が表示されたら属性名の規則違反を疑いましょう。</p>
<h4>原因と修正</h4>
<pre><code>&lt;!-- 誤り：コントローラ名が無い --&gt;
&lt;button data-amount-param="100"&gt;

&lt;!-- 正しい：data-wallet-amount-param --&gt;
&lt;button data-wallet-amount-param="100"&gt;</code></pre>
<p>正しく書くと値は自動で型変換され、<code>100</code>は数値として渡ってくるので計算も正しく動きます。</p>`,
      task: `入金ボタンを押すと合計がNaNになります。paramのdata属性名にコントローラ名を入れて、正しく100円ずつ加算されるようにしてください。`,
      code: `<div data-controller="wallet">
  <!-- TODO: param属性の名前が規則違反。data-コントローラ名-パラメータ名-param -->
  <button data-action="click->wallet#add" data-amount-param="100">100円入金</button>
  <p>合計：<span data-wallet-target="total">0</span>円</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("wallet", class extends Controller {
  static targets = ["total"];
  add(event) {
    const current = Number(this.totalTarget.textContent);
    this.totalTarget.textContent = current + event.params.amount;
  }
});
<\/script>`,
      solution: `<div data-controller="wallet">
  <button data-action="click->wallet#add" data-wallet-amount-param="100">100円入金</button>
  <p>合計：<span data-wallet-target="total">0</span>円</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("wallet", class extends Controller {
  static targets = ["total"];
  add(event) {
    const current = Number(this.totalTarget.textContent);
    this.totalTarget.textContent = current + event.params.amount;
  }
});
<\/script>`,
      hints: [
        `paramの属性名の規則はdata-コントローラ名-パラメータ名-paramです`,
        `data-amount-paramにはコントローラ名walletが抜けています。data-wallet-amount-param="100"に直しましょう`,
        `event.paramsが空のときはconsole.log(event.params)で確認し、属性名の規則を見直すのが定番です`
      ],
      check: `assert($("[data-controller=wallet]"), "data-controller=walletの要素が必要です");
assert($("button[data-wallet-amount-param]"), "param属性はdata-wallet-amount-param=\\"100\\"の形にします（コントローラ名が必要）");
click("button");
await sleep(50);
assert(text("[data-wallet-target=total]") === "100", "1回押すと合計が100になるはずです（NaNになるならparamsが取れていません）");
click("button");
await sleep(50);
assert(text("[data-wallet-target=total]") === "200", "2回押すと合計は200になるはずです");`
    },
    {
      id: 218,
      title: "event.targetとevent.currentTargetの取り違え",
      explanation: `<h4>症状</h4>
<p>ボタンの文字部分をクリックすると「undefinedを選びました」と表示されます。ボタンの端の余白をクリックしたときだけ正しく動く、という<strong>押す場所によって挙動が変わる</strong>不思議なバグです。</p>
<h4>デバッグの手がかり</h4>
<p>イベントオブジェクトには似た2つのプロパティがあります。</p>
<table>
<tr><th>プロパティ</th><th>指すもの</th></tr>
<tr><td>event.target</td><td>実際にクリックされた最も内側の要素（spanかもしれない）</td></tr>
<tr><td>event.currentTarget</td><td>リスナーが付いている要素（data-actionを書いた要素）</td></tr>
</table>
<p>ボタンの中に<code>&lt;span&gt;</code>などの子要素があると、文字の上をクリックしたときの<code>event.target</code>はspanになります。spanには<code>data-fruit</code>属性が無いので<code>dataset.fruit</code>はundefinedです。一方、余白をクリックするとtargetはbutton自身になり、たまたま動きます。この「押す場所で結果が変わる」症状が出たら、targetとcurrentTargetの取り違えをまず疑ってください。</p>
<h4>原因と修正</h4>
<p>data-actionを書いた要素（＝属性を持たせた要素）を確実に取りたいのだから、<code>event.currentTarget</code>を使うのが正解です。</p>
<pre><code>choose(event) {
  const fruit = event.currentTarget.dataset.fruit;
}</code></pre>
<p>なおStimulusのparams（前ステップ）はcurrentTarget側の属性から取られるため、この取り違えが起きません。値の受け渡しにはparamsを優先するのも良い設計です。</p>`,
      task: `ボタン内の文字（span）をクリックすると「undefinedを選びました」になります。event.targetをevent.currentTargetに直して、常に正しく動くようにしてください。`,
      code: `<div data-controller="picker">
  <button data-action="click->picker#choose" data-fruit="りんご">
    <span>りんご</span>を選ぶ
  </button>
  <p data-picker-target="output"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("picker", class extends Controller {
  static targets = ["output"];
  choose(event) {
    // TODO: 文字（span）の上をクリックするとundefinedになる。どちらのプロパティを使うべきか
    this.outputTarget.textContent = event.target.dataset.fruit + "を選びました";
  }
});
<\/script>`,
      solution: `<div data-controller="picker">
  <button data-action="click->picker#choose" data-fruit="りんご">
    <span>りんご</span>を選ぶ
  </button>
  <p data-picker-target="output"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("picker", class extends Controller {
  static targets = ["output"];
  choose(event) {
    this.outputTarget.textContent = event.currentTarget.dataset.fruit + "を選びました";
  }
});
<\/script>`,
      hints: [
        `event.targetは「実際にクリックされた最も内側の要素」。spanの上を押すとspanになります`,
        `event.currentTargetは「data-actionを書いた要素」。常にbuttonを指します`,
        `event.target.dataset.fruitをevent.currentTarget.dataset.fruitに直しましょう`
      ],
      check: `assert($("[data-controller=picker]"), "data-controller=pickerの要素が必要です");
click("button span");
await sleep(50);
assert(text("[data-picker-target=output]") === "りんごを選びました", "ボタン内の文字（span）をクリックしても「りんごを選びました」と表示されるはずです。event.currentTargetを使いましょう");`
    },
    {
      id: 219,
      title: "手動addEventListenerでthisが壊れる",
      explanation: `<h4>症状</h4>
<p>ボタンを押すとコンソールに次のようなエラーが出ます。</p>
<pre><code>Uncaught TypeError: Cannot set properties of undefined
(setting 'textContent')</code></pre>
<h4>デバッグの手がかり</h4>
<p>今回のコードは<code>connect()</code>の中で<code>addEventListener("click", this.greet)</code>と手動でイベント登録しています。この書き方をすると、greetが呼ばれたときの<code>this</code>は<strong>コントローラではなくイベントを受けた要素（ボタン）</strong>になります。ボタンに<code>outputTarget</code>というプロパティは無いのでundefinedとなり、そのtextContentに代入しようとしてTypeErrorです。</p>
<p>エラー行がコントローラのメソッド内で、<code>this.xxxTarget</code>や<code>this.xxxValue</code>がundefinedになっていたら、「thisがコントローラ以外にすり替わっていないか」を疑いましょう。<code>console.log(this)</code>をメソッド先頭に入れれば一発で分かります（ボタン要素が表示されるはずです）。</p>
<h4>原因と修正</h4>
<p>Stimulusでは手動登録は不要です。<strong>data-actionに書けば、thisが正しくコントローラを指す形で呼び出され、要素が消えたときの後始末（removeEventListener）も自動</strong>で行われます。</p>
<pre><code>&lt;button data-action="click-&gt;hello#greet"&gt;あいさつ&lt;/button&gt;</code></pre>
<p>connect内のaddEventListenerを削除し、ボタンにdata-actionを書くのが正しい修正です。JSで<code>this.greet.bind(this)</code>とする回避策もありますが、解除忘れの温床になるためStimulusではdata-actionに寄せるのが原則です。</p>`,
      task: `手動のaddEventListenerをやめてdata-actionを使う形に直し、ボタンで「こんにちは！」が表示されるようにしてください（connect内の登録処理は削除します）。`,
      code: `<div data-controller="hello">
  <!-- TODO: このボタンにdata-actionを付け、JS側の手動登録をやめる -->
  <button data-hello-target="button">あいさつ</button>
  <p data-hello-target="output"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("hello", class extends Controller {
  static targets = ["button", "output"];

  connect() {
    // TODO: この手動登録だとgreet内のthisがボタン要素になってしまう
    this.buttonTarget.addEventListener("click", this.greet);
  }

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
        `addEventListener("click", this.greet)の形だと、呼び出し時のthisはボタン要素になります`,
        `ボタンにdata-action="click->hello#greet"を付け、connect内の手動登録を削除しましょう`,
        `data-action経由ならthisは常にコントローラを指し、リスナーの解除も自動で行われます`
      ],
      check: `assert($("[data-controller=hello]"), "data-controller=helloの要素が必要です");
const action = $("button") ? ($("button").getAttribute("data-action") || "") : "";
assert(action.indexOf("hello#greet") !== -1, "ボタンにdata-action=\\"click->hello#greet\\"を付けましょう（手動addEventListenerはやめます）");
click("button");
await sleep(50);
assert(text("[data-hello-target=output]") === "こんにちは！", "ボタンを押すと「こんにちは！」と表示されるはずです。TypeErrorが出る場合はthisが壊れています");`
    },
    {
      id: 220,
      title: "総合演習：アクションのバグをすべて直す",
      explanation: `<h4>症状</h4>
<p>この章の総合演習です。メモを保存・クリアできる小さなフォームに、<strong>アクションまわりの不具合が3つ</strong>仕込まれています。</p>
<ol>
<li>保存してもコンソールに<code>references undefined method</code>のエラーが出る（メソッド名の食い違い）</li>
<li>実際のブラウザだと保存直後にページがリロードされて消える（標準動作を止めていない）</li>
<li>クリアボタンが無反応（イベント名の誤り）</li>
</ol>
<h4>デバッグの進め方</h4>
<p>アクションの不具合調査は、この章で学んだ次の手順で進めます。</p>
<table>
<tr><th>症状</th><th>確認すること</th></tr>
<tr><td>コンソールにreferences undefined method</td><td>#の後ろのメソッド名とJSのメソッド名の一致</td></tr>
<tr><td>処理直後に画面がリロードで消える</td><td>submitやclickの標準動作。:preventの有無</td></tr>
<tr><td>無反応・エラーなし</td><td>イベント名（onは付けない）・矢印と#・スコープ</td></tr>
</table>
<p>まずコンソールを開いてから操作し、<strong>エラーが出る不具合から先に潰す</strong>のが鉄則です。エラーが出ないものは、data-action属性を左から「イベント名→矢印→コントローラ名→#→メソッド名→オプション」の順に目視チェックします。</p>
<h4>ゴール</h4>
<p>保存ボタンで「保存しました：入力内容」と表示され（リロードなし）、クリアボタンで表示が消えれば完成です。</p>`,
      task: `3つの不具合（保存のメソッド名タイポ・:prevent忘れ・クリアのイベント名ミス）をすべて修正して、メモの保存とクリアが正しく動くようにしてください。`,
      code: `<!-- TODO: 保存時のエラー・リロード・クリアの無反応、3つのバグを直そう -->
<form data-controller="memo" data-action="submit->memo#sav">
  <input data-memo-target="input" type="text" placeholder="メモを入力">
  <button type="submit">保存</button>
  <button type="button" data-action="onclick->memo#clear">クリア</button>
  <p data-memo-target="output"></p>
</form>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("memo", class extends Controller {
  static targets = ["input", "output"];

  save() {
    this.outputTarget.textContent = "保存しました：" + this.inputTarget.value;
  }

  clear() {
    this.outputTarget.textContent = "";
    this.inputTarget.value = "";
  }
});
<\/script>`,
      solution: `<form data-controller="memo" data-action="submit->memo#save:prevent">
  <input data-memo-target="input" type="text" placeholder="メモを入力">
  <button type="submit">保存</button>
  <button type="button" data-action="click->memo#clear">クリア</button>
  <p data-memo-target="output"></p>
</form>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("memo", class extends Controller {
  static targets = ["input", "output"];

  save() {
    this.outputTarget.textContent = "保存しました：" + this.inputTarget.value;
  }

  clear() {
    this.outputTarget.textContent = "";
    this.inputTarget.value = "";
  }
});
<\/script>`,
      hints: [
        `formのdata-actionはsubmit->memo#save:preventが正解です（メソッド名saveと:preventの2点を直す）`,
        `クリアボタンのイベント名はonclickではなくclickです`,
        `コンソールのreferences undefined method "sav"というエラーが、メソッド名の食い違いを教えてくれます`
      ],
      check: `assert($("[data-controller=memo]"), "data-controller=memoのフォームが必要です");
setValue("[data-memo-target=input]", "牛乳を買う");
const form = $("form");
const ev = new Event("submit", { bubbles: true, cancelable: true });
form.dispatchEvent(ev);
await sleep(50);
assert(ev.defaultPrevented, "送信の標準動作が止められていません。data-actionに:preventを付けましょう");
assert(text("[data-memo-target=output]") === "保存しました：牛乳を買う", "保存すると「保存しました：牛乳を買う」と表示されるはずです。メソッド名はsaveです");
click("button[type=button]");
await sleep(50);
assert(text("[data-memo-target=output]") === "", "クリアボタンで表示が消えるはずです。イベント名はonclickではなくclickです");`
    }
  ]
});
