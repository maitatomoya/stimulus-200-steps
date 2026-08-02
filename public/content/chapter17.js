// 第17章：非同期との組み合わせ
registerChapter({
  number: 17,
  title: "非同期との組み合わせ",
  description: "setTimeoutとPromiseで作る擬似APIを使い、非同期処理とStimulusを組み合わせる方法（ローディング表示・エラー処理・デバウンス検索・キャンセル）を学びます。",
  steps: [
    {
      id: 161,
      title: "Promiseの復習と擬似API関数",
      explanation: `<p>この章では「サーバーと通信して結果を受け取る」タイプのUIをStimulusで作る練習をします。ただしこの学習環境ではネットワーク通信（fetch）は使えないため、<strong>setTimeoutとPromiseでサーバーの応答を擬似的に再現した関数（擬似API）</strong>を使います。時間がかかる点も、あとから結果が届く点も本物の通信とそっくりなので、学んだ書き方はそのままfetchにも応用できます。</p>
<p><code>Promise</code>は「あとで結果が届く箱」です。<code>new Promise()</code>に渡した関数の中で、結果が用意できたタイミングで<code>resolve(値)</code>を呼ぶと、その箱に値が入ります。値を受け取る側は<code>.then()</code>にコールバック関数を渡します。</p>
<pre><code>// 100ms後に文字列が届く擬似API
function fetchGreeting() {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve("サーバーからの応答です");
    }, 100);
  });
}

fetchGreeting().then(function (message) {
  console.log(message); // 100ms後に表示される
});</code></pre>
<p>Stimulusのアクションメソッドの中でも同じように使えます。注意点は<code>then</code>の中で<code>this</code>を使いたい場合です。<code>function</code>で書くと<code>this</code>がコントローラでなくなるため、<strong>アロー関数</strong>で書くのが定番です。</p>
<pre><code>load() {
  fetchGreeting().then((message) =&gt; {
    this.outputTarget.textContent = message; // アロー関数ならthisはコントローラのまま
  });
}</code></pre>`,
      task: `load()メソッドの中でfetchGreeting()を呼び、thenで受け取ったメッセージをoutputTargetに表示してください。`,
      code: `<div data-controller="api">
  <button data-action="click->api#load">データを取得</button>
  <p data-api-target="output"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

// 擬似API：100ms後に文字列を返すPromise（サーバー通信の代わり）
function fetchGreeting() {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve("サーバーからの応答です");
    }, 100);
  });
}

const application = Application.start();

application.register("api", class extends Controller {
  static targets = ["output"];
  load() {
    // TODO: fetchGreeting()のthenで受け取ったメッセージをoutputTargetに表示する
  }
});
<\/script>`,
      solution: `<div data-controller="api">
  <button data-action="click->api#load">データを取得</button>
  <p data-api-target="output"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

// 擬似API：100ms後に文字列を返すPromise（サーバー通信の代わり）
function fetchGreeting() {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve("サーバーからの応答です");
    }, 100);
  });
}

const application = Application.start();

application.register("api", class extends Controller {
  static targets = ["output"];
  load() {
    fetchGreeting().then((message) => {
      this.outputTarget.textContent = message;
    });
  }
});
<\/script>`,
      hints: [
        `fetchGreeting()はPromiseを返すので、fetchGreeting().then((message) => { ... })の形で結果を受け取れます`,
        `thenのコールバックはアロー関数で書くと、thisがコントローラのままになりthis.outputTargetが使えます`
      ],
      check: `assert($("[data-controller=api]"), "data-controller属性がapiの要素が必要です");
click("button");
await sleep(300);
assert(text("[data-api-target=output]") === "サーバーからの応答です", "ボタンを押して約100ms後に、outputターゲットへ「サーバーからの応答です」と表示されるはずです。thenの中でthis.outputTarget.textContentに代入しましょう");`
    },
    {
      id: 162,
      title: "async/awaitをアクションメソッドで使う",
      explanation: `<p>前のステップの<code>.then()</code>は、処理が増えるとネストが深くなりがちです。そこで現代のJavaScriptでは<strong>async/await</strong>という書き方が主流です。</p>
<ul>
<li>メソッドの前に<code>async</code>を付けると、そのメソッドの中で<code>await</code>が使える</li>
<li><code>await Promise</code>と書くと、Promiseに値が届くまで待ってから、その値を返してくれる</li>
</ul>
<pre><code>// thenを使った書き方
load() {
  fetchMessage().then((message) =&gt; {
    this.outputTarget.textContent = message;
  });
}

// async/awaitを使った書き方（上と同じ意味）
async load() {
  const message = await fetchMessage();
  this.outputTarget.textContent = message;
}</code></pre>
<p>まるで同期処理のように上から下へ読めるのが利点です。Stimulusの<strong>アクションメソッドにもasyncはそのまま付けられます</strong>。Stimulusはメソッドの戻り値を特に使わないため、asyncにしても問題ありません。</p>
<p>よくある失敗が<strong>awaitの付け忘れ</strong>です。<code>const message = fetchMessage();</code>と書くと、messageには結果の文字列ではなく<strong>Promiseオブジェクトそのもの</strong>が入ります。これを画面に表示すると「[object Promise]」という謎の文字が出ます。この表示を見たら「awaitを忘れている」と疑うのがコツです。</p>`,
      task: `load()メソッドをasyncにして、fetchMessage()の結果をawaitで受け取ってから表示するように直してください。`,
      code: `<div data-controller="api">
  <button data-action="click->api#load">メッセージを取得</button>
  <p data-api-target="output"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

// 擬似API：100ms後に文字列を返す
function fetchMessage() {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve("非同期処理が完了しました");
    }, 100);
  });
}

const application = Application.start();

application.register("api", class extends Controller {
  static targets = ["output"];
  load() {
    // TODO: このメソッドをasyncにして、awaitで結果を受け取る
    const message = fetchMessage();
    this.outputTarget.textContent = message;
  }
});
<\/script>`,
      solution: `<div data-controller="api">
  <button data-action="click->api#load">メッセージを取得</button>
  <p data-api-target="output"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

// 擬似API：100ms後に文字列を返す
function fetchMessage() {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve("非同期処理が完了しました");
    }, 100);
  });
}

const application = Application.start();

application.register("api", class extends Controller {
  static targets = ["output"];
  async load() {
    const message = await fetchMessage();
    this.outputTarget.textContent = message;
  }
});
<\/script>`,
      hints: [
        `メソッド名の前にasyncを付けます：async load() { ... }`,
        `const message = await fetchMessage(); と書くと、結果の文字列が届くまで待ってからmessageに入ります`
      ],
      check: `click("button");
await sleep(300);
assert(text("[data-api-target=output]") !== "[object Promise]", "「[object Promise]」と表示されるのはawaitを忘れているサインです。async load()にしてawait fetchMessage()と書きましょう");
assert(text("[data-api-target=output]") === "非同期処理が完了しました", "ボタンを押すと「非同期処理が完了しました」と表示されるはずです");`
    },
    {
      id: 163,
      title: "ローディング状態の表示",
      explanation: `<p>非同期処理には「待ち時間」があります。その間に画面が無反応だと、ユーザーは「押せていないのかな」と不安になり、何度もボタンを押してしまいます。そこで<strong>処理中であることを画面に表示し、ボタンを無効化する</strong>のが定番のパターンです。</p>
<p>手順は3段階です。</p>
<ol>
<li><strong>開始時</strong>：ボタンを<code>disabled = true</code>で無効化し、「読み込み中...」と表示する</li>
<li><strong>await</strong>で結果を待つ</li>
<li><strong>完了時</strong>：結果を表示し、ボタンを<code>disabled = false</code>で元に戻す</li>
</ol>
<pre><code>async load() {
  this.buttonTarget.disabled = true;        // 1. 無効化
  this.statusTarget.textContent = "読み込み中...";
  const data = await fetchData();           // 2. 待つ
  this.statusTarget.textContent = data;     // 3. 結果表示
  this.buttonTarget.disabled = false;       //    元に戻す
}</code></pre>
<p>ポイントは、<code>await</code>の行より前に書いたコードは<strong>クリックした瞬間に実行される</strong>ことです。だから「読み込み中...」は待ち時間の間ずっと表示され、結果が届いた瞬間に置き換わります。ボタンを<code>disabled</code>にしておけば、処理中の二重クリックをブラウザの機能だけで防げます。ここではボタン自身もターゲットにして、コントローラから操作できるようにしています。</p>`,
      task: `load()に「開始時：ボタン無効化＋『読み込み中...』表示」と「完了時：ボタンを元に戻す」の処理を追加してください。`,
      code: `<div data-controller="loader">
  <button data-loader-target="button" data-action="click->loader#load">読み込む</button>
  <p data-loader-target="status">待機中</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

// 擬似API：150ms後に完了メッセージを返す
function fetchData() {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve("読み込みが完了しました");
    }, 150);
  });
}

const application = Application.start();

application.register("loader", class extends Controller {
  static targets = ["button", "status"];
  async load() {
    // TODO: ボタンをdisabledにして、statusTargetに「読み込み中...」と表示する
    const data = await fetchData();
    this.statusTarget.textContent = data;
    // TODO: ボタンを再び押せるように戻す
  }
});
<\/script>`,
      solution: `<div data-controller="loader">
  <button data-loader-target="button" data-action="click->loader#load">読み込む</button>
  <p data-loader-target="status">待機中</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

// 擬似API：150ms後に完了メッセージを返す
function fetchData() {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve("読み込みが完了しました");
    }, 150);
  });
}

const application = Application.start();

application.register("loader", class extends Controller {
  static targets = ["button", "status"];
  async load() {
    this.buttonTarget.disabled = true;
    this.statusTarget.textContent = "読み込み中...";
    const data = await fetchData();
    this.statusTarget.textContent = data;
    this.buttonTarget.disabled = false;
  }
});
<\/script>`,
      hints: [
        `awaitの前に this.buttonTarget.disabled = true; と this.statusTarget.textContent = "読み込み中..."; を書きます`,
        `awaitの後（結果表示の後）に this.buttonTarget.disabled = false; でボタンを戻します`
      ],
      check: `click("[data-loader-target=button]");
await sleep(50);
assert(text("[data-loader-target=status]") === "読み込み中...", "読み込み開始直後は「読み込み中...」と表示されるはずです（awaitより前に書いた処理はクリックの瞬間に実行されます）");
assert($("[data-loader-target=button]").disabled === true, "読み込み中はボタンがdisabledになっているはずです");
await sleep(300);
assert(text("[data-loader-target=status]") === "読み込みが完了しました", "読み込みが終わると「読み込みが完了しました」と表示されるはずです");
assert($("[data-loader-target=button]").disabled === false, "読み込みが終わったらボタンを再び押せるように戻すはずです");`
    },
    {
      id: 164,
      title: "成功・失敗の表示分岐",
      explanation: `<p>本物の通信は必ず成功するとは限りません。サーバーが混んでいたり、ネットワークが切れたりして<strong>失敗</strong>することがあります。Promiseでは失敗を<code>reject(エラー)</code>で表します。擬似APIにも失敗パターンを持たせてみましょう。</p>
<pre><code>function requestData(ok) {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      if (ok) {
        resolve("取得に成功しました");
      } else {
        reject(new Error("サーバーエラーが発生しました"));
      }
    }, 100);
  });
}</code></pre>
<p><code>await</code>しているPromiseが<code>reject</code>されると、その場所で<strong>例外（エラー）が投げられます</strong>。そのままだと処理が中断されてコンソールにエラーが出るだけなので、<code>try/catch</code>で受け止めて、ユーザーに分かる形で画面に表示します。</p>
<pre><code>async loadFailure() {
  try {
    this.outputTarget.textContent = await requestData(false);
  } catch (e) {
    // rejectに渡したErrorがeに入る。e.messageでメッセージを取り出せる
    this.outputTarget.textContent = "エラー: " + e.message;
  }
}</code></pre>
<p>「成功したら結果を表示、失敗したらエラーメッセージを表示」という分岐は、通信を扱うUIの基本形です。catchを書かないと失敗が握りつぶされ、ユーザーには何も起きていないように見えてしまいます。</p>`,
      task: `loadFailure()をtry/catchで書き直し、失敗したときは「エラー: 」に続けてe.messageをoutputTargetに表示してください。`,
      code: `<div data-controller="api">
  <button id="success-btn" data-action="click->api#loadSuccess">成功する通信</button>
  <button id="fail-btn" data-action="click->api#loadFailure">失敗する通信</button>
  <p data-api-target="output"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

// 擬似API：okがtrueなら成功、falseなら失敗する
function requestData(ok) {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      if (ok) {
        resolve("取得に成功しました");
      } else {
        reject(new Error("サーバーエラーが発生しました"));
      }
    }, 100);
  });
}

const application = Application.start();

application.register("api", class extends Controller {
  static targets = ["output"];
  async loadSuccess() {
    this.outputTarget.textContent = await requestData(true);
  }
  async loadFailure() {
    // TODO: try/catchで囲み、失敗時は「エラー: 」+ e.message を表示する
    this.outputTarget.textContent = await requestData(false);
  }
});
<\/script>`,
      solution: `<div data-controller="api">
  <button id="success-btn" data-action="click->api#loadSuccess">成功する通信</button>
  <button id="fail-btn" data-action="click->api#loadFailure">失敗する通信</button>
  <p data-api-target="output"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

// 擬似API：okがtrueなら成功、falseなら失敗する
function requestData(ok) {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      if (ok) {
        resolve("取得に成功しました");
      } else {
        reject(new Error("サーバーエラーが発生しました"));
      }
    }, 100);
  });
}

const application = Application.start();

application.register("api", class extends Controller {
  static targets = ["output"];
  async loadSuccess() {
    this.outputTarget.textContent = await requestData(true);
  }
  async loadFailure() {
    try {
      this.outputTarget.textContent = await requestData(false);
    } catch (e) {
      this.outputTarget.textContent = "エラー: " + e.message;
    }
  }
});
<\/script>`,
      hints: [
        `try { ... } catch (e) { ... } の形で、awaitの行をtryの中に入れます`,
        `catchの中では this.outputTarget.textContent = "エラー: " + e.message; と書きます`
      ],
      check: `click("#success-btn");
await sleep(300);
assert(text("[data-api-target=output]") === "取得に成功しました", "成功する通信では「取得に成功しました」と表示されるはずです");
click("#fail-btn");
await sleep(300);
assert(text("[data-api-target=output]") === "エラー: サーバーエラーが発生しました", "失敗する通信ではtry/catchでエラーを受け止め、「エラー: サーバーエラーが発生しました」と表示するはずです");`
    },
    {
      id: 165,
      title: "try/catch/finallyでUIを確実に戻す",
      explanation: `<p>ステップ163のローディング表示と、164のエラー処理を組み合わせると、落とし穴が見えてきます。次のコードは、通信が<strong>失敗するとボタンが無効のまま</strong>になってしまいます。</p>
<pre><code>async load() {
  this.buttonTarget.disabled = true;
  const result = await unstableRequest(); // ここで例外が投げられると…
  this.buttonTarget.disabled = false;     // この行は実行されない！
}</code></pre>
<p>awaitで例外が発生すると、それ以降の行は実行されずにメソッドが中断されるからです。ユーザーは二度とボタンを押せなくなります。これを防ぐのが<code>finally</code>です。</p>
<pre><code>try {
  // 成功したときの処理
} catch (e) {
  // 失敗したときの処理
} finally {
  // 成功でも失敗でも「必ず」実行される処理
}</code></pre>
<p><strong>「ボタンを元に戻す」「ローディング表示を消す」といったUIの後始末はfinallyに書く</strong>のが鉄則です。成功パスと失敗パスの両方に同じ後始末コードをコピーする必要がなくなり、書き忘れも防げます。この形は実務のfetch処理でもそのまま使う、非同期UIの完成形テンプレートです。</p>`,
      task: `load()のawait以降をtry/catch/finallyで書き直してください。失敗時は「失敗: 」+ e.messageを表示し、finallyでボタンを必ず元に戻します。`,
      code: `<div data-controller="loader">
  <button data-loader-target="button" data-action="click->loader#load">送信</button>
  <p data-loader-target="status">待機中</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

// 擬似API：100ms後に必ず失敗する
function unstableRequest() {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      reject(new Error("接続できませんでした"));
    }, 100);
  });
}

const application = Application.start();

application.register("loader", class extends Controller {
  static targets = ["button", "status"];
  async load() {
    this.buttonTarget.disabled = true;
    this.statusTarget.textContent = "通信中...";
    // TODO: 以下をtry/catch/finallyで書き直す
    //  - 失敗時は「失敗: 」+ e.message をstatusTargetに表示
    //  - finallyでボタンのdisabledを必ずfalseに戻す
    const result = await unstableRequest();
    this.statusTarget.textContent = result;
    this.buttonTarget.disabled = false;
  }
});
<\/script>`,
      solution: `<div data-controller="loader">
  <button data-loader-target="button" data-action="click->loader#load">送信</button>
  <p data-loader-target="status">待機中</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

// 擬似API：100ms後に必ず失敗する
function unstableRequest() {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      reject(new Error("接続できませんでした"));
    }, 100);
  });
}

const application = Application.start();

application.register("loader", class extends Controller {
  static targets = ["button", "status"];
  async load() {
    this.buttonTarget.disabled = true;
    this.statusTarget.textContent = "通信中...";
    try {
      const result = await unstableRequest();
      this.statusTarget.textContent = result;
    } catch (e) {
      this.statusTarget.textContent = "失敗: " + e.message;
    } finally {
      this.buttonTarget.disabled = false;
    }
  }
});
<\/script>`,
      hints: [
        `try { await... } catch (e) { 失敗表示 } finally { ボタンを戻す } の3ブロック構成にします`,
        `finallyの中の this.buttonTarget.disabled = false; は、成功しても失敗しても必ず実行されます`
      ],
      check: `click("[data-loader-target=button]");
await sleep(300);
assert(text("[data-loader-target=status]") === "失敗: 接続できませんでした", "通信が失敗したら「失敗: 接続できませんでした」と表示されるはずです（catchで受け止める）");
assert($("[data-loader-target=button]").disabled === false, "失敗してもfinallyでボタンが必ず元に戻る（disabledがfalse）はずです");`
    },
    {
      id: 166,
      title: "連続クリックの防止（実行中フラグ）",
      explanation: `<p>ボタンのdisabled化（ステップ163）はUIとして分かりやすい方法ですが、それとは別に<strong>コントローラの内部でも「今実行中かどうか」を覚えておいて多重実行を防ぐ</strong>のが堅牢な作り方です。この目印を<strong>実行中フラグ</strong>と呼びます。</p>
<pre><code>async load() {
  if (this.loading) {
    return;             // 実行中なら何もしない（ガード節）
  }
  this.loading = true;  // 開始の印
  await slowTask();
  this.loading = false; // 終了の印
}</code></pre>
<p>先頭の<code>if</code>で「すでに実行中なら即return」するので、処理中に何度クリックされてもAPIは1回しか呼ばれません。処理が終わってフラグをfalseに戻せば、また実行できるようになります。</p>
<p>第7章で「UIの状態はインスタンス変数でなくvalue（DOM）に置く」という原則を学びましたが、この<code>this.loading</code>のような<strong>実行中だけ意味を持つ一時的な内部フラグは、インスタンス変数の正しい使いどころ</strong>です。HTMLに書き出して再現したい状態ではなく、処理の進行に紐づく揮発的な情報だからです。第16章のタイマーIDと同じ分類だと考えてください。</p>
<p>今回のコードには、APIが何回呼ばれたかを数えるカウンタを付けてあります。フラグなしで連打すると回数が増えてしまうことを確かめましょう。</p>`,
      task: `load()に実行中フラグ（this.loading）によるガードを追加し、処理中に連続クリックされてもAPIが1回しか呼ばれないようにしてください。`,
      code: `<div data-controller="guard">
  <button data-action="click->guard#load">実行</button>
  <p>API呼び出し回数：<span data-guard-target="count">0</span>回</p>
  <p data-guard-target="status">待機中</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

// 擬似API：150ms後に「完了」を返す
function slowTask() {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve("完了");
    }, 150);
  });
}

const application = Application.start();

application.register("guard", class extends Controller {
  static targets = ["count", "status"];
  async load() {
    // TODO: this.loadingがtrueなら何もせずreturnする
    // TODO: 処理の開始時にthis.loadingをtrue、終了後にfalseにする
    this.countTarget.textContent = String(Number(this.countTarget.textContent) + 1);
    this.statusTarget.textContent = "実行中...";
    this.statusTarget.textContent = await slowTask();
  }
});
<\/script>`,
      solution: `<div data-controller="guard">
  <button data-action="click->guard#load">実行</button>
  <p>API呼び出し回数：<span data-guard-target="count">0</span>回</p>
  <p data-guard-target="status">待機中</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

// 擬似API：150ms後に「完了」を返す
function slowTask() {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve("完了");
    }, 150);
  });
}

const application = Application.start();

application.register("guard", class extends Controller {
  static targets = ["count", "status"];
  async load() {
    if (this.loading) {
      return;
    }
    this.loading = true;
    this.countTarget.textContent = String(Number(this.countTarget.textContent) + 1);
    this.statusTarget.textContent = "実行中...";
    this.statusTarget.textContent = await slowTask();
    this.loading = false;
  }
});
<\/script>`,
      hints: [
        `メソッドの先頭に if (this.loading) { return; } を書きます（ガード節）`,
        `ガードの直後に this.loading = true;、awaitが終わった後に this.loading = false; を書きます`
      ],
      check: `click("button");
click("button");
click("button");
await sleep(400);
assert(text("[data-guard-target=count]") === "1", "実行中に3回連続でクリックしても、実行中フラグのガードによりAPIは1回しか呼ばれないはずです");
assert(text("[data-guard-target=status]") === "完了", "処理が終わると「完了」と表示されるはずです");
click("button");
await sleep(400);
assert(text("[data-guard-target=count]") === "2", "処理が終わってフラグを戻した後は、もう一度クリックで実行できるはずです（this.loading = falseを忘れずに）");`
    },
    {
      id: 167,
      title: "結果のリスト描画（配列を返す擬似API）",
      explanation: `<p>実際のAPIは文字列1つではなく、<strong>一覧データ（配列）</strong>を返すことがほとんどです。「商品一覧」「検索結果」「コメント一覧」などですね。ここでは配列を返す擬似APIの結果を、第14章で学んだDOM操作でリスト描画します。</p>
<pre><code>// 擬似API：100ms後に果物の配列を返す
function fetchFruits() {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve(["りんご", "バナナ", "みかん"]);
    }, 100);
  });
}</code></pre>
<p>描画の手順は決まっています。</p>
<ol>
<li><code>await</code>で配列を受け取る</li>
<li><strong>先にリストを空にする</strong>（<code>innerHTML = ""</code>）</li>
<li>配列を<code>forEach</code>で回し、1件ずつ<code>createElement("li")</code>で要素を作って<code>appendChild</code>する</li>
</ol>
<pre><code>async load() {
  const items = await fetchFruits();
  this.listTarget.innerHTML = "";      // 前回の結果を消す
  items.forEach((name) =&gt; {
    const li = document.createElement("li");
    li.textContent = name;
    this.listTarget.appendChild(li);
  });
}</code></pre>
<p>手順2を忘れると、ボタンを押すたびに同じ項目がどんどん増えていきます。「描画の前に必ずクリアする」は、取得のたびに全件を描き直すタイプのUIの基本ルールです。</p>`,
      task: `load()にforEachでのリスト描画処理を追加してください。何度取得しても項目が重複しないことも確認しましょう。`,
      code: `<div data-controller="fruits">
  <button data-action="click->fruits#load">一覧を取得</button>
  <ul data-fruits-target="list"></ul>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

// 擬似API：100ms後に果物の配列を返す
function fetchFruits() {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve(["りんご", "バナナ", "みかん"]);
    }, 100);
  });
}

const application = Application.start();

application.register("fruits", class extends Controller {
  static targets = ["list"];
  async load() {
    const items = await fetchFruits();
    this.listTarget.innerHTML = "";
    // TODO: itemsをforEachで回し、liを作ってtextContentに名前を入れ、listTargetに追加する
  }
});
<\/script>`,
      solution: `<div data-controller="fruits">
  <button data-action="click->fruits#load">一覧を取得</button>
  <ul data-fruits-target="list"></ul>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

// 擬似API：100ms後に果物の配列を返す
function fetchFruits() {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve(["りんご", "バナナ", "みかん"]);
    }, 100);
  });
}

const application = Application.start();

application.register("fruits", class extends Controller {
  static targets = ["list"];
  async load() {
    const items = await fetchFruits();
    this.listTarget.innerHTML = "";
    items.forEach((name) => {
      const li = document.createElement("li");
      li.textContent = name;
      this.listTarget.appendChild(li);
    });
  }
});
<\/script>`,
      hints: [
        `items.forEach((name) => { ... }) の中で document.createElement("li") を使います`,
        `作ったliはli.textContent = name;で文字を入れてからthis.listTarget.appendChild(li);で追加します`
      ],
      check: `click("button");
await sleep(300);
const items = $$("[data-fruits-target=list] li");
assert(items.length === 3, "一覧を取得すると3件のliが描画されるはずです");
assert(items[0].textContent.trim() === "りんご" && items[1].textContent.trim() === "バナナ" && items[2].textContent.trim() === "みかん", "配列の内容（りんご・バナナ・みかん）が順番どおりに表示されるはずです");
click("button");
await sleep(300);
assert($$("[data-fruits-target=list] li").length === 3, "もう一度取得しても件数は3件のままのはずです（描画前にinnerHTMLを空にしてクリアする）");`
    },
    {
      id: 168,
      title: "遅延検索（デバウンス＋擬似API）",
      explanation: `<p>検索ボックスで<strong>入力のたびにAPIを呼ぶ</strong>と、「りんご」と打つだけで「り」「りん」「りんご」の3回もリクエストが飛びます。サーバーに無駄な負荷がかかるうえ、通信量も増えます。そこで第16章で学んだ<strong>デバウンス</strong>の出番です。「入力が止まって一定時間たってから1回だけAPIを呼ぶ」ようにします。</p>
<pre><code>input() {
  clearTimeout(this.timer);          // 前回の予約をキャンセル
  this.timer = setTimeout(() =&gt; {
    this.run();                      // 200ms入力がなければ実行
  }, 200);
}

async run() {
  const keyword = this.inputTarget.value;
  this.resultTarget.textContent = await searchApi(keyword);
}</code></pre>
<p>仕組みの復習です。inputイベントのたびに「200ms後に検索を実行する予約」を入れ直します。連続入力中は予約が次々キャンセルされるので、<strong>最後の入力から200ms経ったときだけ</strong><code>run()</code>が実行されます。デバウンス（間引き）とAPI呼び出しの組み合わせは、インクリメンタルサーチ・郵便番号検索・入力補完など、実務で最も出番の多いパターンのひとつです。</p>
<p>今回のコードにはAPI呼び出し回数のカウンタを付けてあります。素早く3回入力しても回数が1回になれば成功です。</p>`,
      task: `input()にデバウンスを実装してください。clearTimeoutとsetTimeoutを使い、入力が止まって200ms後にthis.run()を1回だけ呼びます。`,
      code: `<div data-controller="search">
  <input data-search-target="input" data-action="input->search#input" placeholder="キーワード">
  <p data-search-target="result"></p>
  <p>API呼び出し回数：<span data-search-target="count">0</span>回</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

// 擬似API：100ms後に検索結果の文字列を返す
function searchApi(keyword) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve("「" + keyword + "」を検索しました");
    }, 100);
  });
}

const application = Application.start();

application.register("search", class extends Controller {
  static targets = ["input", "result", "count"];
  input() {
    // TODO: clearTimeoutとsetTimeoutで200msのデバウンスをかけ、this.run()を呼ぶ
    this.run();
  }
  async run() {
    this.countTarget.textContent = String(Number(this.countTarget.textContent) + 1);
    this.resultTarget.textContent = await searchApi(this.inputTarget.value);
  }
});
<\/script>`,
      solution: `<div data-controller="search">
  <input data-search-target="input" data-action="input->search#input" placeholder="キーワード">
  <p data-search-target="result"></p>
  <p>API呼び出し回数：<span data-search-target="count">0</span>回</p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

// 擬似API：100ms後に検索結果の文字列を返す
function searchApi(keyword) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve("「" + keyword + "」を検索しました");
    }, 100);
  });
}

const application = Application.start();

application.register("search", class extends Controller {
  static targets = ["input", "result", "count"];
  input() {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.run();
    }, 200);
  }
  async run() {
    this.countTarget.textContent = String(Number(this.countTarget.textContent) + 1);
    this.resultTarget.textContent = await searchApi(this.inputTarget.value);
  }
});
<\/script>`,
      hints: [
        `input()の先頭で clearTimeout(this.timer); を呼んで前回の予約をキャンセルします`,
        `this.timer = setTimeout(() => { this.run(); }, 200); で新しい予約を入れます`
      ],
      check: `setValue("[data-search-target=input]", "り");
await sleep(50);
setValue("[data-search-target=input]", "りん");
await sleep(50);
setValue("[data-search-target=input]", "りんご");
await sleep(600);
assert(text("[data-search-target=result]") === "「りんご」を検索しました", "入力が止まった後、最後のキーワード「りんご」の検索結果が表示されるはずです");
assert(text("[data-search-target=count]") === "1", "素早く3回入力しても、デバウンスによりAPIは1回だけ呼ばれるはずです（clearTimeoutで前回の予約をキャンセルする）");`
    },
    {
      id: 169,
      title: "キャンセルの考え方（世代カウンタ）",
      explanation: `<p>非同期処理には順番の落とし穴があります。<strong>先に送ったリクエストの応答が、後から送ったリクエストの応答より遅れて届く</strong>ことがあるのです。たとえば検索キーワードを打ち直したとき、古い検索（遅い）の結果が新しい検索（速い）の結果を上書きしてしまうと、画面には古い情報が残ります。これを<strong>競合状態（レースコンディション）</strong>と呼びます。</p>
<p>対策の定番が<strong>世代カウンタ</strong>です。リクエストを送るたびに番号を1増やし、自分の番号を手元に控えておきます。応答が届いたとき、<strong>控えた番号が最新でなければ結果を捨てる</strong>だけです。</p>
<pre><code>async search(event) {
  this.generation = this.generation + 1;
  const current = this.generation;        // 自分の世代を控える
  const result = await delayedResult(event.params.label, event.params.delay);
  if (current !== this.generation) {
    return;                               // 自分より新しい検索が始まっていたら捨てる
  }
  this.resultTarget.textContent = result;
}</code></pre>
<p>新しいリクエストが始まると<code>this.generation</code>が進むので、古いリクエストの<code>current</code>と一致しなくなります。通信そのものを止めるわけではなく「<strong>届いた結果を採用しない</strong>」という考え方です（本物のfetchではAbortControllerで通信自体を中断する方法もあります）。今回は応答が150msかかる「遅い検索」と50msで返る「速い検索」を続けて実行し、最後に実行した速い検索の結果が残ることを確認します。</p>`,
      task: `search()に世代カウンタを実装してください。await後に世代が進んでいたら、古い結果を表示せずに捨てます。`,
      code: `<div data-controller="race">
  <button id="slow-btn" data-action="click->race#search"
    data-race-label-param="遅い検索の結果" data-race-delay-param="150">遅い検索</button>
  <button id="fast-btn" data-action="click->race#search"
    data-race-label-param="速い検索の結果" data-race-delay-param="50">速い検索</button>
  <p data-race-target="result"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

// 擬似API：指定した時間の後にラベル文字列を返す
function delayedResult(label, ms) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve(label);
    }, ms);
  });
}

const application = Application.start();

application.register("race", class extends Controller {
  static targets = ["result"];
  connect() {
    this.generation = 0;
  }
  async search(event) {
    // TODO: this.generationを1増やし、その値をcurrentに控える
    const result = await delayedResult(event.params.label, event.params.delay);
    // TODO: currentがthis.generationと一致しなければreturnで結果を捨てる
    this.resultTarget.textContent = result;
  }
});
<\/script>`,
      solution: `<div data-controller="race">
  <button id="slow-btn" data-action="click->race#search"
    data-race-label-param="遅い検索の結果" data-race-delay-param="150">遅い検索</button>
  <button id="fast-btn" data-action="click->race#search"
    data-race-label-param="速い検索の結果" data-race-delay-param="50">速い検索</button>
  <p data-race-target="result"></p>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

// 擬似API：指定した時間の後にラベル文字列を返す
function delayedResult(label, ms) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve(label);
    }, ms);
  });
}

const application = Application.start();

application.register("race", class extends Controller {
  static targets = ["result"];
  connect() {
    this.generation = 0;
  }
  async search(event) {
    this.generation = this.generation + 1;
    const current = this.generation;
    const result = await delayedResult(event.params.label, event.params.delay);
    if (current !== this.generation) {
      return;
    }
    this.resultTarget.textContent = result;
  }
});
<\/script>`,
      hints: [
        `awaitの前に this.generation = this.generation + 1; const current = this.generation; を書きます`,
        `awaitの後に if (current !== this.generation) { return; } を書くと、古い応答だけが捨てられます`
      ],
      check: `click("#slow-btn");
click("#fast-btn");
await sleep(400);
assert(text("[data-race-target=result]") === "速い検索の結果", "遅い検索→速い検索の順に実行したら、最後に実行した「速い検索の結果」が表示されたままになるはずです。遅い検索の古い応答が後から届いても、世代カウンタで捨てましょう");`
    },
    {
      id: 170,
      title: "総合演習：擬似APIで商品検索UI",
      explanation: `<p>この章の総仕上げとして、実務さながらの<strong>商品検索UI</strong>を完成させます。使う道具はすべて学習済みです。</p>
<table>
<tr><th>部品</th><th>学んだステップ</th></tr>
<tr><td>デバウンス付きの入力ハンドラ</td><td>168</td></tr>
<tr><td>async/awaitで擬似APIを呼ぶ</td><td>162</td></tr>
<tr><td>検索中のステータス表示</td><td>163</td></tr>
<tr><td>配列結果のリスト描画（先にクリア）</td><td>167</td></tr>
<tr><td>0件のときの空状態メッセージ</td><td>第14章</td></tr>
</table>
<p>処理の流れはこうです。入力が止まって200ms後に<code>search()</code>が動き、「検索中...」を表示してAPIを待ちます。結果が届いたらリストを描き直し、ステータスを「N件見つかりました」または「該当なし」に更新します。</p>
<pre><code>this.statusTarget.textContent = "検索中...";
const items = await searchProducts(this.inputTarget.value);
// リストをクリアして描画し、件数に応じてステータスを出し分ける
if (items.length === 0) {
  this.statusTarget.textContent = "該当なし";
} else {
  this.statusTarget.textContent = items.length + "件見つかりました";
}</code></pre>
<p>検索APIは商品名の部分一致（<code>includes</code>）で絞り込んだ配列を返します。0件のときにリストが空になり、メッセージで理由が伝わることまで含めて「検索UIの完成」です。</p>`,
      task: `search()のTODOを実装してください。リストをクリアしてから結果をliで描画し、ステータスに件数（0件なら「該当なし」）を表示します。`,
      code: `<div data-controller="shop">
  <input data-shop-target="input" data-action="input->shop#input" placeholder="商品名で検索">
  <p data-shop-target="status">キーワードを入力してください</p>
  <ul data-shop-target="list"></ul>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const PRODUCTS = ["りんご", "りんごジュース", "バナナ", "ぶどう"];

// 擬似API：100ms後に、部分一致した商品名の配列を返す
function searchProducts(keyword) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve(PRODUCTS.filter(function (name) {
        return name.includes(keyword);
      }));
    }, 100);
  });
}

const application = Application.start();

application.register("shop", class extends Controller {
  static targets = ["input", "status", "list"];
  input() {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.search();
    }, 200);
  }
  async search() {
    this.statusTarget.textContent = "検索中...";
    const items = await searchProducts(this.inputTarget.value);
    // TODO: listTargetを空にしてから、itemsをliで描画する
    // TODO: statusTargetに、0件なら「該当なし」、あれば items.length + "件見つかりました" を表示する
  }
});
<\/script>`,
      solution: `<div data-controller="shop">
  <input data-shop-target="input" data-action="input->shop#input" placeholder="商品名で検索">
  <p data-shop-target="status">キーワードを入力してください</p>
  <ul data-shop-target="list"></ul>
</div>

<script type="module">
import { Application, Controller } from "stimulus";

const PRODUCTS = ["りんご", "りんごジュース", "バナナ", "ぶどう"];

// 擬似API：100ms後に、部分一致した商品名の配列を返す
function searchProducts(keyword) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve(PRODUCTS.filter(function (name) {
        return name.includes(keyword);
      }));
    }, 100);
  });
}

const application = Application.start();

application.register("shop", class extends Controller {
  static targets = ["input", "status", "list"];
  input() {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.search();
    }, 200);
  }
  async search() {
    this.statusTarget.textContent = "検索中...";
    const items = await searchProducts(this.inputTarget.value);
    this.listTarget.innerHTML = "";
    items.forEach((name) => {
      const li = document.createElement("li");
      li.textContent = name;
      this.listTarget.appendChild(li);
    });
    if (items.length === 0) {
      this.statusTarget.textContent = "該当なし";
    } else {
      this.statusTarget.textContent = items.length + "件見つかりました";
    }
  }
});
<\/script>`,
      hints: [
        `リスト描画はステップ167と同じ形です：innerHTMLを空にしてからforEachでliを作って追加します`,
        `件数の出し分けは if (items.length === 0) { ... } else { ... } で書けます`
      ],
      check: `setValue("[data-shop-target=input]", "りんご");
await sleep(1000);
assert($$("[data-shop-target=list] li").length === 2, "「りんご」で検索すると2件（りんご・りんごジュース）が表示されるはずです");
assert(text("[data-shop-target=status]") === "2件見つかりました", "検索結果がある場合は「2件見つかりました」と表示されるはずです");
setValue("[data-shop-target=input]", "メロン");
await sleep(1000);
assert($$("[data-shop-target=list] li").length === 0, "「メロン」で検索したらリストは空になるはずです（描画前のクリアを忘れずに）");
assert(text("[data-shop-target=status]") === "該当なし", "0件のときは「該当なし」と表示されるはずです");`
    }
  ]
});
