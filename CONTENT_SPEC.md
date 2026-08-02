# Stimulus教材データ作成仕様書（必読・厳守）

Stimulus学習Webサービス「Stimulus 200 Steps」の教材データファイルを作成するための仕様。
Stimulus 3.2.2（Hotwire）を対象とする。

## ファイル形式

各章は `public/content/chapterNN.js`（NNは2桁ゼロ埋め）として作成する。
ファイル全体は次の形式の**1つの関数呼び出しのみ**で構成する：

```js
// 第N章：章タイトル
registerChapter({
  number: N,
  title: "章タイトル",
  description: "章の概要を1〜2文で。",
  steps: [
    {
      id: 1,
      title: "ステップタイトル",
      explanation: `HTML解説`,
      task: `課題の指示。1〜3文。`,
      code: `実行コード（HTML断片＋script）`,
      solution: `模範解答コード`,
      hints: [`ヒント1`, `ヒント2`],
      check: `自動判定スクリプト（後述）`
    }
    // ... 1章につき必ず10ステップ
  ]
});
```

## 実行環境（ランナー）の仕組み

- codeはsandbox付きiframeのsrcdocの**body内**にそのまま挿入されて実行される
- iframeのheadにはimportmapが注入済み：`import { Application, Controller } from "stimulus";` がそのまま使える
- 学習者のコードは次の形を基本とする：

```
<div data-controller="hello">
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
</script>
```

- console.log等はアプリのコンソール欄にキャプチャされる
- **fetch・外部URL読込・localStorageは使用禁止**（sandbox制約とオフライン耐性のため。CDNはimportmapのstimulusのみ）
- 第1章（DOM基礎）のみStimulusを使わない素のDOM＋scriptでよい

## check（自動判定）のルール【最重要】

- checkは**必須**。iframe内でcode実行の約300ms後にasync関数として実行されるJSコード（関数本体のみを書く。function宣言で囲まない）
- 使えるヘルパー（引数として渡される）：
  - `$(sel)`：querySelector
  - `$$(sel)`：querySelectorAllの配列
  - `text(sel)`：要素のtextContent.trim()（要素がなければnull）
  - `click(sel)`：要素をクリック（なければ例外）
  - `setValue(sel, v)`：入力欄に値を設定しinput/changeイベント発火
  - `keydown(sel, key)`：keydownイベント発火
  - `submit(sel)`：submitイベント発火
  - `sleep(ms)`：待機（Stimulusの反応待ちに50ms程度使う）
  - `assert(cond, msg)`：condが偽ならmsgで失敗
- 例外が投げられなければ合格。assertのmsgは**学習者が読んで直せる日本語**にする（例：「ボタンをクリックした後、#outputに『こんにちは！』と表示されるはずです」）
- 例：

```js
assert($("[data-controller=hello]"), "data-controller属性を持つ要素が必要です");
click("button");
await sleep(50);
assert(text("p") === "こんにちは！", "ボタンを押すと<p>に「こんにちは！」と表示されるはずです");
```

- checkは**solutionで必ず合格し、初期codeのままでは不合格**になるように設計する（初期codeが完成形の観察ステップの場合は初期codeでも合格してよい）
- クリックやsetValueの後は必ずawait sleep(50)を挟む（Stimulusの処理待ち）

## 絶対的な構文ルール

1. テンプレートリテラル内では**バッククォート記号を絶対に使わない**（教材のJSコード内でもテンプレートリテラル・${}を使わず文字列連結+で書く）
2. `${`を絶対に書かない
3. code/solution/check内に`</script>`という文字列を直接書くとHTMLが壊れるため、**scriptの閉じタグは`<\/script>`とエスケープして書く**（テンプレートリテラル内で有効）
4. ファイルは作成後に必ず`node --check`で構文チェックする
5. `id`は全体の通し番号（第N章はステップ(N-1)*10+1〜N*10）

## explanation（解説）のルール

- **HTMLで記述**。使ってよいタグ：`<p> <ul> <ol> <li> <table> <tr> <th> <td> <strong> <em> <code> <pre> <h4>`
- 分量の目安：日本語400〜800字＋コード例1〜2個
- **HTML内のコード例では`<`を`&lt;`に、`&`を`&amp;`にエスケープする**（`&lt;div data-controller="hello"&gt;`のように。data-action="click-&gt;hello#greet"の`>`も`&gt;`推奨）
- 用語の初出時は短い説明を添える。比較・一覧は`<table>`を活用
- 日本語と英単語の間に不要な半角スペースを入れない。絵文字禁止

## code（初期コード）のルール

- 1から書かせず、**動く例の部分修正・穴埋め**を中心にする（TODOコメントで指示）
- HTMLとscriptを合わせて10〜40行程度に収める
- コメントは日本語

## solution（模範解答）のルール

- checkに必ず合格する完全なコード
- 全ステップで机上検算し、Stimulusの実際の挙動（targets・values・classes・outlets・actionの構文）に忠実であること

## カリキュラム上の制約

- 各ステップは**それ以前のステップで学んだ知識のみ**を前提にする
- 章の最後の1〜2ステップはその章の総合演習
