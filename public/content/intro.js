// 「はじめに」：Stimulusというフレームワークを知る
registerIntro({
  tocTitle: "はじめに：Stimulusを知る",
  content: `<h2>はじめに：Stimulusというフレームワークを知る</h2>
<p>学習を始める前に、「Stimulusとはどんなフレームワークで、ReactやVueと何が違うのか」を整理しておきましょう。Stimulusは流行の中心にいるフレームワークではありませんが、<strong>「Webアプリの作り方にはSPA以外の道もある」</strong>ことを教えてくれる、思想のはっきりした道具です。</p>

<h3>Stimulusを一言でいうと</h3>
<p>Stimulusは「<strong>サーバーが作ったHTMLに、控えめにJavaScriptの動きを足す</strong>」ためのフレームワークです。Ruby on Railsの開発元である37signals（Basecamp）が作り、Hotwireという技術群の一部として提供されています。HTMLのdata属性に書いた指示（<code>data-controller</code>など）に従って、小さなJavaScriptのコントローラが要素に接続される仕組みです。</p>

<h3>基本プロフィール</h3>
<table>
<tr><th>項目</th><th>内容</th></tr>
<tr><td>登場年</td><td>2018年（Stimulus 1.0）、現行は3系</td></tr>
<tr><td>開発元</td><td>37signals（Ruby on Railsと同じ）</td></tr>
<tr><td>位置づけ</td><td>Hotwire（Turbo＋Stimulus）のJS担当</td></tr>
<tr><td>サイズ</td><td>非常に小さい（学ぶべきAPIはコントローラ・ターゲット・アクション・バリューなど数個だけ）</td></tr>
<tr><td>思想</td><td>HTML主導（HTMLを見れば挙動がわかる。状態もDOMに置く）</td></tr>
<tr><td>相性の良い環境</td><td>Rails、Laravel（信頼できるサーバーサイドHTMLがある環境全般）</td></tr>
</table>

<h3>ReactやVueとの根本的な違い</h3>
<p>ReactやVueは「<strong>画面のHTMLをJavaScriptで作る</strong>」フレームワークです（SPA：シングルページアプリケーション）。一方Stimulusは「<strong>HTMLはサーバーが作り、JavaScriptは味付けだけする</strong>」という役割分担をとります。</p>
<table>
<tr><th></th><th>Stimulus（Hotwire）</th><th>React / Vue（SPA）</th></tr>
<tr><td>HTMLを作るのは</td><td>サーバー</td><td>JavaScript</td></tr>
<tr><td>JSの役割</td><td>既存HTMLへの動きの追加</td><td>画面全体の構築と状態管理</td></tr>
<tr><td>学ぶ量</td><td>少ない</td><td>多い（状態管理・ビルド環境など）</td></tr>
<tr><td>向くもの</td><td>フォーム中心の業務アプリ・CRUDアプリ</td><td>操作の多いリッチなUI（エディタ、ダッシュボード）</td></tr>
</table>

<h3>Stimulusの強み</h3>
<ul>
<li><strong>学習量が少ない</strong>：APIが数個しかなく、この教材を終える頃には公式ドキュメントをほぼ読み切ったのと同じ状態になれる。</li>
<li><strong>HTMLを見れば挙動がわかる</strong>：<code>data-action="click-&gt;menu#toggle"</code>のように、どの要素が何をするかがHTML上に明示される。後から読む人に優しい。</li>
<li><strong>サーバーサイドと相性が良い</strong>：RailsやLaravelで作った画面に、ビルド環境なしで動きを足せる。SPAを作るほどではないアプリに「ちょうどいい」。</li>
<li><strong>壊れにくい設計を促す</strong>：ライフサイクル（connect/disconnect）や状態のDOM管理など、片付けまで考えた書き方が自然と身につく。</li>
<li><strong>素のDOM APIの理解が深まる</strong>：Stimulusは薄いので、学ぶ過程でJavaScriptとDOMの基礎力そのものが鍛えられる（この教材の第1章はあえて素のDOMから始める）。</li>
</ul>

<h3>Stimulusの弱み（正直なところ）</h3>
<ul>
<li><strong>複雑なUIには力不足</strong>：スプレッドシートやグラフィックエディタのような、大量の状態を持つリッチなUIにはReact等のほうが向く。</li>
<li><strong>求人市場では少数派</strong>：ReactやVueに比べ、Stimulus単体を求める求人は少ない。Rails系の現場で価値を発揮するスキルと捉えるのが現実的。</li>
<li><strong>コミュニティが小さい</strong>：情報量・ライブラリ数はReact/Vueに遠く及ばない。</li>
<li><strong>Turboと組み合わせて真価を発揮する</strong>：Stimulus単体は「JSの整理術」であり、SPA風の画面遷移はHotwireのもう1つの柱であるTurboが担う。</li>
</ul>

<h3>技術選定のときの考え方</h3>
<table>
<tr><th>状況</th><th>判断の目安</th></tr>
<tr><td>Rails/LaravelのアプリにJSの動きを足したい</td><td>Stimulus（Hotwire）が第一候補</td></tr>
<tr><td>フォームとCRUDが中心の業務アプリ</td><td>Hotwireで十分なことが多い。SPAはオーバースペックになりがち</td></tr>
<tr><td>操作の多いリッチなUI（エディタ、ダッシュボード）</td><td>React/Vueが向く</td></tr>
<tr><td>フロント専任チームがいる大規模開発</td><td>React/TypeScriptの体制が組みやすい</td></tr>
<tr><td>少人数でサーバーもフロントも面倒を見る</td><td>Hotwireの「JSを最小限にする」思想がチームを守る</td></tr>
</table>
<div class="intro-note">
<p><strong>選定のポイント</strong>：フロントエンドの技術選定は「SPAにするか、サーバーHTML＋αにするか」というアーキテクチャの選択が先にあります。Stimulusを学ぶことは、この選択肢の片方を実感として理解することであり、Reactを学ぶときにも「なぜSPAが必要なのか」を言葉で説明できるようになります。</p>
</div>

<h3>この教材の進め方</h3>
<p>全25章・250ステップ。第1章は素のDOM操作から始め、コントローラ・アクション・ターゲット・バリュー・アウトレットと段階的に学び、後半ではTODOアプリなどの実践コンポーネントを作ります。コードはブラウザ内のサンドボックスで実行され、<strong>プレビューを実際に触って</strong>動きを確かめられます。自動判定がクリックや入力を再現して合否を教えてくれるので、動くまで何度でも試してください。</p>`
});
