// 第11章：イベントディスパッチ
registerChapter({
  number: 11,
  title: "イベントディスパッチ",
  description: "this.dispatchでカスタムイベントを発火し、コントローラ同士を疎結合につなぐ方法を学びます。",
  steps: [
    {
      id: 101,
      title: "this.dispatchの基本",
      explanation: `<p>これまでは1つのコントローラの中だけで処理が完結していました。この章では、コントローラから「出来事」を外に知らせる仕組みであるイベントディスパッチを学びます。</p>
<p><code>this.dispatch(イベント名)</code>を呼ぶと、ブラウザ標準のCustomEvent（自分で名前を決められるイベント）が作られ、コントローラの要素（this.element）から発火されます。発火されたイベントは、第1章で学んだaddEventListenerや、この章の後半で学ぶdata-actionで受け取れます。</p>
<pre><code>add() {
  this.dispatch("added");
}</code></pre>
<p>1つ注意があります。実際に発火されるイベントの名前は「added」ではなく、コントローラ名が前に付いた<strong>「cart:added」</strong>になります（この規則は次のステップで詳しく扱います）。そのため受け取る側は次のように書きます。</p>
<pre><code>document.addEventListener("cart:added", function() {
  // イベントが届いたときの処理
});</code></pre>
<p>dispatchの利点は、発火する側が「誰が受け取るか」をまったく知らなくてよいことです。カートは「追加されたよ」と宣言するだけで、それを利用するかどうかは受け取る側の自由です。この性質が、コントローラ同士の疎結合（お互いの内部を知らない、ゆるいつながり）を実現します。</p>`,
      task: `add()の中でthis.dispatchを使い、「added」という名前のイベントを発火させてください。`,
      code: `<div data-controller="cart">
  <button data-action="cart#add">カートに追加</button>
</div>
<p id="log"></p>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("cart", class extends Controller {
  add() {
    // TODO: this.dispatchで「added」という名前のイベントを発火する
  }
});

document.addEventListener("cart:added", function() {
  document.querySelector("#log").textContent = "イベントを受け取りました";
});
<\/script>`,
      solution: `<div data-controller="cart">
  <button data-action="cart#add">カートに追加</button>
</div>
<p id="log"></p>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("cart", class extends Controller {
  add() {
    this.dispatch("added");
  }
});

document.addEventListener("cart:added", function() {
  document.querySelector("#log").textContent = "イベントを受け取りました";
});
<\/script>`,
      hints: [`this.dispatch("added"); の1行だけでイベントを発火できます`, `発火されるイベント名は自動的に「cart:added」になります`],
      check: `assert($("[data-controller=cart]"), "data-controller=cartの要素が必要です");
click("button");
await sleep(50);
assert(text("#log") === "イベントを受け取りました", "ボタンを押すとdispatchが実行され、#logに「イベントを受け取りました」と表示されるはずです。add()の中でthis.dispatchを呼んでいますか？");`
    },
    {
      id: 102,
      title: "イベント名にはコントローラ名のプレフィックスが付く",
      explanation: `<p>前のステップで少し触れたとおり、<code>this.dispatch("added")</code>で発火されるイベントの本当の名前は<strong>「cart:added」</strong>です。Stimulusは自動的に「コントローラ名:イベント名」という形式の名前を付けます。この前半部分をプレフィックス（接頭辞）と呼びます。</p>
<table>
<tr><th>コントローラ名</th><th>dispatchの引数</th><th>実際のイベント名</th></tr>
<tr><td>cart</td><td>"added"</td><td>cart:added</td></tr>
<tr><td>search</td><td>"changed"</td><td>search:changed</td></tr>
<tr><td>my-list</td><td>"updated"</td><td>my-list:updated</td></tr>
</table>
<p>プレフィックスには2つの利点があります。</p>
<ul>
<li><strong>名前の衝突を防げる</strong>：別々のコントローラが同じ「updated」を発火しても、「cart:updated」と「search:updated」として区別できます。</li>
<li><strong>発生源が一目でわかる</strong>：イベント名を見るだけで、どのコントローラの出来事かが読み取れます。</li>
</ul>
<p>逆に言うと、受け取る側がプレフィックスを忘れて「added」だけを待っていると、イベントは永遠に届きません。カスタムイベントが受け取れないときは、まずイベント名にコントローラ名が付いているかを確認しましょう。</p>
<pre><code>// 間違い：この名前のイベントは発火されない
document.addEventListener("added", ...);
// 正しい：コントローラ名のプレフィックス付き
document.addEventListener("cart:added", ...);</code></pre>`,
      task: `addEventListenerが待っているイベント名が間違っているため、イベントが届きません。正しいイベント名に直してください。`,
      code: `<div data-controller="cart">
  <button data-action="cart#add">カートに追加</button>
</div>
<p id="log"></p>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("cart", class extends Controller {
  add() {
    this.dispatch("added");
  }
});

// TODO: イベント名にコントローラ名のプレフィックスを付けて正しい名前にする
document.addEventListener("added", function() {
  document.querySelector("#log").textContent = "cart:addedが届きました";
});
<\/script>`,
      solution: `<div data-controller="cart">
  <button data-action="cart#add">カートに追加</button>
</div>
<p id="log"></p>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("cart", class extends Controller {
  add() {
    this.dispatch("added");
  }
});

document.addEventListener("cart:added", function() {
  document.querySelector("#log").textContent = "cart:addedが届きました";
});
<\/script>`,
      hints: [`イベント名は「コントローラ名:イベント名」の形式です`, `cartコントローラのdispatch("added")なら「cart:added」になります`],
      check: `click("button");
await sleep(50);
assert(text("#log") === "cart:addedが届きました", "ボタンを押すと#logに「cart:addedが届きました」と表示されるはずです。addEventListenerのイベント名を「cart:added」にしましたか？");`
    },
    {
      id: 103,
      title: "detailでデータを渡す",
      explanation: `<p>イベントは「起きたこと」だけでなく、「関連するデータ」も一緒に運べます。それが<strong>detail</strong>です。dispatchの第2引数にオプションのオブジェクトを渡し、その中のdetailプロパティにデータを入れます。</p>
<pre><code>this.dispatch("added", { detail: { name: "りんご", price: 150 } });</code></pre>
<p>受け取る側では、イベントオブジェクトの<code>event.detail</code>からデータを取り出せます。</p>
<pre><code>document.addEventListener("cart:added", function(event) {
  console.log(event.detail.name);  // "りんご"
  console.log(event.detail.price); // 150
});</code></pre>
<p>detailを省略した場合は空のオブジェクト<code>{}</code>になるため、<code>event.detail.name</code>はundefinedになります。「undefinedと表示される」ときは、発火側がdetailを渡し忘れていないかを疑いましょう。</p>
<p>detailに何を入れるかは設計のポイントです。受け取る側が発火側の内部を調べ直さなくて済むように、「その出来事を説明する必要十分な情報」を入れるのがコツです。カートへの追加なら商品名や価格、検索なら検索語、といった具合です。</p>`,
      task: `dispatchの第2引数にdetailを追加し、nameとして「りんご」を渡してください。`,
      code: `<div data-controller="cart">
  <button data-action="cart#add">りんごを追加</button>
</div>
<p id="log"></p>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("cart", class extends Controller {
  add() {
    // TODO: detailに{ name: "りんご" }を付けてdispatchする
    this.dispatch("added");
  }
});

document.addEventListener("cart:added", function(event) {
  document.querySelector("#log").textContent = "追加: " + event.detail.name;
});
<\/script>`,
      solution: `<div data-controller="cart">
  <button data-action="cart#add">りんごを追加</button>
</div>
<p id="log"></p>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("cart", class extends Controller {
  add() {
    this.dispatch("added", { detail: { name: "りんご" } });
  }
});

document.addEventListener("cart:added", function(event) {
  document.querySelector("#log").textContent = "追加: " + event.detail.name;
});
<\/script>`,
      hints: [`this.dispatch("added", { detail: { name: "りんご" } }); の形です`, `detailを渡さないとevent.detail.nameはundefinedになります`],
      check: `click("button");
await sleep(50);
assert(text("#log") === "追加: りんご", "ボタンを押すと#logに「追加: りんご」と表示されるはずです。dispatchの第2引数に{ detail: { name: \\"りんご\\" } }を渡していますか？");`
    },
    {
      id: 104,
      title: "他のコントローラでdata-actionで受ける",
      explanation: `<p>ここまではaddEventListenerでイベントを受け取りましたが、Stimulusらしいやり方は<strong>data-actionで別のコントローラのメソッドにつなぐ</strong>ことです。第3章で学んだアクション記法「イベント名-&gt;コントローラ#メソッド」は、カスタムイベントにもそのまま使えます。</p>
<pre><code>&lt;div data-controller="display" data-action="cart:added-&gt;display#show"&gt;
  ...
&lt;/div&gt;</code></pre>
<p>clickやinputの代わりに「cart:added」というカスタムイベント名を書くだけです。イベントが発火されると、displayコントローラのshowメソッドが呼ばれます。メソッドは通常のアクションと同じく第1引数でイベントオブジェクトを受け取るので、<code>event.detail</code>のデータも使えます。</p>
<pre><code>show(event) {
  this.outputTarget.textContent = event.detail.name + "を受け取りました";
}</code></pre>
<p>1つ大事な条件があります。data-actionを書いた要素にイベントが「届く」必要があるため、受け取る側の要素は<strong>発火元を包む祖先要素</strong>（または発火元と同じ要素）に置くのが基本です。イベントがどこまで届くのかは、次のステップで詳しく確かめます。</p>
<p>これで「cartが知らせる→displayが反応する」という連携を、JavaScriptを1行も足さずにHTMLの属性だけで宣言できました。</p>`,
      task: `data-controller="display"の要素にdata-action属性を追加し、cart:addedイベントでdisplayコントローラのshowメソッドが呼ばれるようにしてください。`,
      code: `<!-- TODO: 下のdisplayの要素に data-action="cart:added->display#show" を追加する -->
<div data-controller="display">
  <div data-controller="cart">
    <button data-action="cart#add">みかんを追加</button>
  </div>
  <p data-display-target="output"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("cart", class extends Controller {
  add() {
    this.dispatch("added", { detail: { name: "みかん" } });
  }
});

application.register("display", class extends Controller {
  static targets = ["output"];
  show(event) {
    this.outputTarget.textContent = event.detail.name + "を受け取りました";
  }
});
<\/script>`,
      solution: `<div data-controller="display" data-action="cart:added->display#show">
  <div data-controller="cart">
    <button data-action="cart#add">みかんを追加</button>
  </div>
  <p data-display-target="output"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("cart", class extends Controller {
  add() {
    this.dispatch("added", { detail: { name: "みかん" } });
  }
});

application.register("display", class extends Controller {
  static targets = ["output"];
  show(event) {
    this.outputTarget.textContent = event.detail.name + "を受け取りました";
  }
});
<\/script>`,
      hints: [`data-action="cart:added->display#show" をdata-controller="display"と同じdivに書きます`, `カスタムイベントもclickと同じアクション記法で受け取れます`],
      check: `assert($("[data-controller=display]"), "data-controller=displayの要素が必要です");
click("button");
await sleep(50);
assert(text("[data-display-target=output]") === "みかんを受け取りました", "ボタンを押すと出力欄に「みかんを受け取りました」と表示されるはずです。displayの要素にdata-action=\\"cart:added->display#show\\"を追加しましたか？");`
    },
    {
      id: 105,
      title: "バブリングとイベントの届く範囲",
      explanation: `<p>dispatchで発火されるイベントは、デフォルトで<strong>bubbles: true</strong>、つまりバブリング（泡のように上へ伝わる性質）が有効です。イベントは発火した要素から、親、そのまた親へと、bodyやwindowまで順番に伝わっていきます。</p>
<pre><code>window
└ body
  └ div（親）        ←ここなら受け取れる
    ├ div（cart）    ←ここで発火。泡は上にのぼる
    └ div（display） ←兄弟には届かない</code></pre>
<p>重要なのは、イベントは<strong>上（祖先方向）にしか伝わらない</strong>ことです。横に並んだ兄弟要素や、子孫要素には届きません。前のステップで「受け取る側は発火元を包む祖先に置く」と説明したのは、この性質のためです。</p>
<p>したがって、data-actionでカスタムイベントを受け取れるのは次の場合です。</p>
<ul>
<li>発火元と同じ要素にdata-actionがある</li>
<li>発火元の祖先要素にdata-actionがある</li>
</ul>
<p>「dispatchしているのに受け取れない」というトラブルの多くは、受け取る側が発火元の兄弟や外側の無関係な場所にあることが原因です。まずHTMLの入れ子関係を確認しましょう。兄弟のままでも受け取れる方法（@window）は、この章の後のステップで学びます。</p>`,
      task: `displayの要素が発火元cartの兄弟になっているため、イベントが届きません。cartのdivをdisplayのdivの内側に移動して、イベントが届くようにしてください。`,
      code: `<!-- TODO: cartのdivをdisplayのdivの内側（発火元が受け手の子孫になる位置）へ移動する -->
<div data-controller="cart">
  <button data-action="cart#add">追加</button>
</div>
<div data-controller="display" data-action="cart:added->display#show">
  <p data-display-target="output">未受信</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("cart", class extends Controller {
  add() {
    this.dispatch("added");
  }
});

application.register("display", class extends Controller {
  static targets = ["output"];
  show() {
    this.outputTarget.textContent = "受信しました";
  }
});
<\/script>`,
      solution: `<div data-controller="display" data-action="cart:added->display#show">
  <div data-controller="cart">
    <button data-action="cart#add">追加</button>
  </div>
  <p data-display-target="output">未受信</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("cart", class extends Controller {
  add() {
    this.dispatch("added");
  }
});

application.register("display", class extends Controller {
  static targets = ["output"];
  show() {
    this.outputTarget.textContent = "受信しました";
  }
});
<\/script>`,
      hints: [`イベントは発火した要素から祖先方向にしか伝わりません`, `displayのdivの中にcartのdivを入れれば、バブリングでdisplayの要素までイベントが届きます`],
      check: `click("button");
await sleep(50);
assert(text("[data-display-target=output]") === "受信しました", "ボタンを押すと「受信しました」と表示されるはずです。cartのdivがdisplayのdivの内側にあれば、バブリングでイベントが届きます");`
    },
    {
      id: 106,
      title: "prefixオプション",
      explanation: `<p>イベント名のプレフィックスは自動で付きますが、dispatchの第2引数の<strong>prefixオプション</strong>で変更できます。</p>
<pre><code>// loaderコントローラの場合
this.dispatch("refresh");                    // イベント名: loader:refresh
this.dispatch("refresh", { prefix: false }); // イベント名: refresh
this.dispatch("refresh", { prefix: "app" }); // イベント名: app:refresh</code></pre>
<table>
<tr><th>指定</th><th>結果</th><th>主な用途</th></tr>
<tr><td>指定なし</td><td>コントローラ名:イベント名</td><td>通常はこれでよい</td></tr>
<tr><td>prefix: false</td><td>イベント名そのまま</td><td>コントローラ名に依存しない汎用イベントにしたいとき</td></tr>
<tr><td>prefix: "文字列"</td><td>文字列:イベント名</td><td>アプリ共通の名前空間でそろえたいとき</td></tr>
</table>
<p>prefix: falseが役立つのは、「どのコントローラが発火したか」を受け取る側に意識させたくない場合です。たとえば複数の異なるコントローラが同じ「refresh」という合図を発火し、受け取る側は発生源を問わず一律に反応する、といった設計ができます。</p>
<p>ただし、プレフィックスを外すと名前の衝突や発生源の分かりにくさというデメリットも戻ってきます。<strong>迷ったらデフォルトのまま</strong>にして、明確な理由があるときだけprefixを変更するのがおすすめです。detailと同じオブジェクトに並べて書ける点も覚えておきましょう。</p>`,
      task: `addEventListenerは「refresh」というプレフィックスなしのイベントを待っています。dispatchにprefix: falseを指定して、イベントが届くようにしてください。`,
      code: `<div data-controller="loader">
  <button data-action="loader#reload">再読み込み</button>
</div>
<p id="log"></p>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("loader", class extends Controller {
  reload() {
    // TODO: prefix: falseを指定して、イベント名が「refresh」だけになるようにする
    this.dispatch("refresh");
  }
});

document.addEventListener("refresh", function() {
  document.querySelector("#log").textContent = "refreshイベントを受け取りました";
});
<\/script>`,
      solution: `<div data-controller="loader">
  <button data-action="loader#reload">再読み込み</button>
</div>
<p id="log"></p>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("loader", class extends Controller {
  reload() {
    this.dispatch("refresh", { prefix: false });
  }
});

document.addEventListener("refresh", function() {
  document.querySelector("#log").textContent = "refreshイベントを受け取りました";
});
<\/script>`,
      hints: [`this.dispatch("refresh", { prefix: false }); と書きます`, `prefixを指定しないとイベント名は「loader:refresh」になり、リスナーには届きません`],
      check: `click("button");
await sleep(50);
assert(text("#log") === "refreshイベントを受け取りました", "ボタンを押すと#logに「refreshイベントを受け取りました」と表示されるはずです。dispatchの第2引数に{ prefix: false }を渡しましたか？");`
    },
    {
      id: 107,
      title: "dispatchの戻り値とcancelable",
      explanation: `<p>this.dispatchは、発火したCustomEventオブジェクトを<strong>戻り値としてそのまま返します</strong>。これを利用すると、「イベントを受け取った誰かが反対しなかったか」を発火側が確認できます。</p>
<p>鍵になるのが<strong>cancelable</strong>オプション（デフォルトで有効）です。cancelableなイベントを受け取った側は、第3章のsubmitで学んだのと同じ<code>event.preventDefault()</code>を呼んで「キャンセルしたい」という意思表示ができます。発火側は戻り値の<code>defaultPrevented</code>プロパティでそれを確認します。</p>
<pre><code>const event = this.dispatch("remove-requested", { cancelable: true });
if (event.defaultPrevented) {
  // 誰かがpreventDefault()した＝キャンセルされた
} else {
  // 誰も反対しなかったので実行する
}</code></pre>
<p>これは「削除してもいいですか？」と周囲に確認してから実行する、協調のためのパターンです。たとえば次のような使い方ができます。</p>
<ul>
<li>削除前に他のコントローラが「保護中なので中止」と拒否する</li>
<li>画面遷移前に「未保存の変更があるので中止」と拒否する</li>
</ul>
<p>dispatchは発火した瞬間にすべてのリスナーを同期的に呼び終えるため、戻り値を受け取った時点でdefaultPreventedの値は確定しています。</p>`,
      task: `remove()を修正し、event.defaultPreventedがtrueなら#logに「削除はキャンセルされました」と表示し、falseのときだけ要素を削除するようにしてください。`,
      code: `<div data-controller="item">
  <p data-item-target="name">大事なファイル</p>
  <button data-action="item#remove">削除</button>
</div>
<p id="log"></p>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("item", class extends Controller {
  static targets = ["name"];
  remove() {
    const event = this.dispatch("remove-requested", { cancelable: true });
    // TODO: event.defaultPreventedがtrueなら#logに「削除はキャンセルされました」と
    // 表示し、falseのときだけthis.element.remove()を実行する
    this.element.remove();
  }
});

// 保護役：削除の要求をすべてキャンセルする
document.addEventListener("item:remove-requested", function(event) {
  event.preventDefault();
});
<\/script>`,
      solution: `<div data-controller="item">
  <p data-item-target="name">大事なファイル</p>
  <button data-action="item#remove">削除</button>
</div>
<p id="log"></p>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("item", class extends Controller {
  static targets = ["name"];
  remove() {
    const event = this.dispatch("remove-requested", { cancelable: true });
    if (event.defaultPrevented) {
      document.querySelector("#log").textContent = "削除はキャンセルされました";
    } else {
      this.element.remove();
    }
  }
});

// 保護役：削除の要求をすべてキャンセルする
document.addEventListener("item:remove-requested", function(event) {
  event.preventDefault();
});
<\/script>`,
      hints: [`dispatchの戻り値を変数に受け取り、event.defaultPreventedをif文で確認します`, `リスナーがpreventDefault()を呼んでいるので、defaultPreventedはtrueになります`],
      check: `click("button");
await sleep(50);
assert($("[data-controller=item]"), "保護役がpreventDefault()しているので、要素は削除されずに残っているはずです。defaultPreventedを確認してから削除していますか？");
assert(text("#log") === "削除はキャンセルされました", "#logに「削除はキャンセルされました」と表示されるはずです");`
    },
    {
      id: 108,
      title: "兄弟コントローラ間の連携パターン",
      explanation: `<p>実際のUIでは、「カート追加パネル」と「ステータス表示パネル」のように、連携したいコントローラ同士が兄弟として並ぶことがよくあります。ステップ105で学んだとおり、イベントは兄弟には届きません。これを解決する定番パターンが、<strong>受け手のコントローラを共通の親に置く</strong>ことです。</p>
<pre><code>&lt;div data-controller="status" data-action="cart:added-&gt;status#update"&gt;
  &lt;div data-controller="cart"&gt;...&lt;/div&gt;  ←発火元
  &lt;div&gt;
    &lt;p data-status-target="output"&gt;&lt;/p&gt;  ←表示先
  &lt;/div&gt;
&lt;/div&gt;</code></pre>
<p>ポイントは2つあります。</p>
<ul>
<li>受け手のコントローラ（status）を、発火元も表示先も包む<strong>共通の親要素</strong>に付ける</li>
<li>data-actionも<strong>その親要素に</strong>書く。cartからのぼってきたイベントは親要素を必ず通過するので、確実に受け取れる</li>
</ul>
<p>data-actionを親の中の別の子要素（表示先のdivなど）に書いてしまうと、そこはイベントの通り道ではないため受け取れません。「data-actionはイベントの通り道（発火元の祖先）に置く」と覚えましょう。</p>
<p>このパターンなら、cartはstatusの存在を知らず、statusもcartの内部を知りません。HTMLの構造だけで連携が完成する、Stimulusらしい設計です。</p>`,
      task: `data-actionが表示先のdiv（イベントの通り道ではない場所）に書かれているため反応しません。data-actionをいちばん外側のdiv（data-controller="status"の要素）に移動してください。`,
      code: `<div data-controller="status">
  <div data-controller="cart">
    <button data-action="cart#add">りんごを追加</button>
  </div>
  <!-- TODO: 下のdata-actionを、いちばん外側のdiv（data-controller="status"）に移動する -->
  <div data-action="cart:added->status#update">
    <p data-status-target="output">まだ追加されていません</p>
  </div>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("cart", class extends Controller {
  add() {
    this.dispatch("added", { detail: { name: "りんご" } });
  }
});

application.register("status", class extends Controller {
  static targets = ["output"];
  update(event) {
    this.outputTarget.textContent = event.detail.name + "が追加されました";
  }
});
<\/script>`,
      solution: `<div data-controller="status" data-action="cart:added->status#update">
  <div data-controller="cart">
    <button data-action="cart#add">りんごを追加</button>
  </div>
  <div>
    <p data-status-target="output">まだ追加されていません</p>
  </div>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("cart", class extends Controller {
  add() {
    this.dispatch("added", { detail: { name: "りんご" } });
  }
});

application.register("status", class extends Controller {
  static targets = ["output"];
  update(event) {
    this.outputTarget.textContent = event.detail.name + "が追加されました";
  }
});
<\/script>`,
      hints: [`イベントはcartのdivから祖先方向にのぼるので、通り道は「外側のdiv」だけです`, `data-action="cart:added->status#update" をdata-controller="status"と同じ要素に書きます`],
      check: `click("button");
await sleep(50);
assert(text("[data-status-target=output]") === "りんごが追加されました", "ボタンを押すと「りんごが追加されました」と表示されるはずです。data-actionは発火元を包む親要素（data-controller=statusのdiv）に書きます");`
    },
    {
      id: 109,
      title: "グローバル通知パターン（@window経由）",
      explanation: `<p>受け手を共通の親に置けない場合もあります。たとえばページ上部の通知エリアと、ページ下部のボタンのように、離れた場所同士を連携させたいときです。そこで役立つのが、第5章で学んだ<strong>@window</strong>です。</p>
<p>dispatchのイベントはバブリングで<strong>windowまで届きます</strong>。そしてdata-actionに@windowを付けると、リスナーは自分の要素ではなくwindowに登録されます。つまり、ページ内のどこで発火されたイベントでも受け取れるようになります。</p>
<pre><code>&lt;div data-controller="toast"
     data-action="cart:added@window-&gt;toast#show"&gt;
  ...
&lt;/div&gt;</code></pre>
<table>
<tr><th>書き方</th><th>リスナーの場所</th><th>受け取れる範囲</th></tr>
<tr><td>cart:added-&gt;toast#show</td><td>自分の要素</td><td>自分と子孫からのイベントのみ</td></tr>
<tr><td>cart:added@window-&gt;toast#show</td><td>window</td><td>ページ内のどこからでも</td></tr>
</table>
<p>これは「アプリ全体へのお知らせ放送」に相当するグローバル通知パターンです。トースト通知、ヘッダーのバッジ更新、ログ収集など、発火元の場所を問わず反応したい受け手に向いています。</p>
<p>ただし何でも@windowにすると、イベントの流れが追いにくくなります。親子関係で済む連携は通常のバブリングで受け、本当にページ全体へ知らせたいものだけ@windowを使う、という使い分けを意識しましょう。</p>`,
      task: `toastの要素はcartの兄弟（しかも前方）にあるため、そのままではイベントが届きません。data-actionに@windowを付けて、どこからでも受け取れるようにしてください。`,
      code: `<!-- 通知エリア（ページ上部にあり、cartの親ではない） -->
<div data-controller="toast" data-action="cart:added->toast#show">
  <p data-toast-target="message">通知はありません</p>
</div>

<div data-controller="cart">
  <button data-action="cart#add">ぶどうを追加</button>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("cart", class extends Controller {
  add() {
    this.dispatch("added", { detail: { name: "ぶどう" } });
  }
});

application.register("toast", class extends Controller {
  static targets = ["message"];
  show(event) {
    this.messageTarget.textContent = event.detail.name + "が追加されました";
  }
});
<\/script>`,
      solution: `<!-- 通知エリア（ページ上部にあり、cartの親ではない） -->
<div data-controller="toast" data-action="cart:added@window->toast#show">
  <p data-toast-target="message">通知はありません</p>
</div>

<div data-controller="cart">
  <button data-action="cart#add">ぶどうを追加</button>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("cart", class extends Controller {
  add() {
    this.dispatch("added", { detail: { name: "ぶどう" } });
  }
});

application.register("toast", class extends Controller {
  static targets = ["message"];
  show(event) {
    this.messageTarget.textContent = event.detail.name + "が追加されました";
  }
});
<\/script>`,
      hints: [`イベント名の直後に@windowを付けて「cart:added@window->toast#show」とします`, `dispatchのイベントはバブリングでwindowまで届くので、windowで待てば必ず受け取れます`],
      check: `click("button");
await sleep(50);
assert(text("[data-toast-target=message]") === "ぶどうが追加されました", "ボタンを押すと通知エリアに「ぶどうが追加されました」と表示されるはずです。data-actionを「cart:added@window->toast#show」にしましたか？");`
    },
    {
      id: 110,
      title: "総合演習：カート追加でヘッダーのバッジを更新",
      explanation: `<p>この章の総まとめとして、ECサイトでよくある「商品をカートに追加すると、ヘッダーのバッジの数が増える」UIを作ります。使う知識は次のとおりです。</p>
<ul>
<li><strong>dispatch＋detail</strong>（ステップ101〜103）：商品側が「added」イベントに商品名を載せて発火する</li>
<li><strong>アクションパラメータ</strong>（第5章）：どの商品かを<code>data-cart-name-param</code>属性から<code>event.params.name</code>で受け取る</li>
<li><strong>@windowでの受信</strong>（ステップ109）：ヘッダーは商品一覧の親ではないので、グローバル通知として受け取る</li>
</ul>
<p>登場するのは2種類のコントローラです。</p>
<table>
<tr><th>コントローラ</th><th>役割</th></tr>
<tr><td>cart（商品ごとに1つ）</td><td>追加ボタンが押されたら商品名付きでdispatchする</td></tr>
<tr><td>badge（ヘッダーに1つ）</td><td>cart:addedを@windowで受け、件数と最新の商品名を表示する</td></tr>
</table>
<p>件数の更新は、countターゲットの現在の表示を<code>Number(...)</code>で数値にして1を足し、書き戻します。cartコントローラは第10章で学んだとおり複数の要素に付いており、それぞれ独立したインスタンスですが、イベントはすべてwindowに集まるためbadgeは1か所で受け取れます。発火側は受け手を知らず、受け手は発火元を知らない、疎結合な連携の完成形です。</p>`,
      task: `cartのadd()で商品名をdetailに載せてdispatchし、badgeのupdate()で件数を1増やして最新の商品名を表示してください。`,
      code: `<header data-controller="badge" data-action="cart:added@window->badge#update">
  カート: <span data-badge-target="count">0</span>個
  <p data-badge-target="last">まだ何も追加されていません</p>
</header>

<div data-controller="cart">
  <p>りんご</p>
  <button id="apple-btn" data-action="cart#add" data-cart-name-param="りんご">追加</button>
</div>
<div data-controller="cart">
  <p>みかん</p>
  <button id="orange-btn" data-action="cart#add" data-cart-name-param="みかん">追加</button>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("cart", class extends Controller {
  add(event) {
    // TODO: 「added」イベントを、detailに{ name: event.params.name }を付けてdispatchする
  }
});

application.register("badge", class extends Controller {
  static targets = ["count", "last"];
  update(event) {
    // TODO: countターゲットの数値を1増やす
    // TODO: lastターゲットに「(商品名)を追加しました」と表示する
  }
});
<\/script>`,
      solution: `<header data-controller="badge" data-action="cart:added@window->badge#update">
  カート: <span data-badge-target="count">0</span>個
  <p data-badge-target="last">まだ何も追加されていません</p>
</header>

<div data-controller="cart">
  <p>りんご</p>
  <button id="apple-btn" data-action="cart#add" data-cart-name-param="りんご">追加</button>
</div>
<div data-controller="cart">
  <p>みかん</p>
  <button id="orange-btn" data-action="cart#add" data-cart-name-param="みかん">追加</button>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const application = Application.start();

application.register("cart", class extends Controller {
  add(event) {
    this.dispatch("added", { detail: { name: event.params.name } });
  }
});

application.register("badge", class extends Controller {
  static targets = ["count", "last"];
  update(event) {
    this.countTarget.textContent = Number(this.countTarget.textContent) + 1;
    this.lastTarget.textContent = event.detail.name + "を追加しました";
  }
});
<\/script>`,
      hints: [`add(): this.dispatch("added", { detail: { name: event.params.name } });`, `update(): this.countTarget.textContent = Number(this.countTarget.textContent) + 1; と this.lastTarget.textContent = event.detail.name + "を追加しました";`],
      check: `assert(text("[data-badge-target=count]") === "0", "初期状態ではカートは0個のはずです");
click("#apple-btn");
await sleep(50);
assert(text("[data-badge-target=count]") === "1", "りんごを追加するとバッジが1になるはずです。dispatchとupdate()の両方を実装しましたか？");
assert(text("[data-badge-target=last]") === "りんごを追加しました", "「りんごを追加しました」と表示されるはずです。detailのnameを使っていますか？");
click("#orange-btn");
await sleep(50);
assert(text("[data-badge-target=count]") === "2", "みかんも追加するとバッジが2になるはずです。Number()で数値にしてから1を足していますか？");
assert(text("[data-badge-target=last]") === "みかんを追加しました", "最新の商品名「みかんを追加しました」に更新されるはずです");`
    }
  ]
});
