/**
 * Stimulus教材のブラウザ内実行ランナー
 *
 * 学習者のコード（HTML断片＋script type="module"）をsandbox付きiframeの
 * srcdocとして実行する。iframeには以下を注入する：
 * - importmap（"stimulus"→CDNのStimulus 3.2.2）
 * - consoleキャプチャ（親ウィンドウへpostMessage）
 * - ステップ定義のcheckスクリプト（DOM操作ヘルパー付きの自動判定）
 */
(function () {
  "use strict";

  var STIMULUS_URL = "https://unpkg.com/@hotwired/stimulus@3.2.2/dist/stimulus.js";
  var CHECK_DELAY_MS = 300;
  var RESULT_TIMEOUT_MS = 8000;

  /** iframe内に注入するブートストラップスクリプトを組み立てる */
  function buildBootstrap() {
    return [
      "(function(){",
      "  function send(msg){ parent.postMessage(msg, '*'); }",
      "  function fmt(args){",
      "    return Array.prototype.map.call(args, function(a){",
      "      if (typeof a === 'object' && a !== null) {",
      "        try { return JSON.stringify(a); } catch (e) { return String(a); }",
      "      }",
      "      return String(a);",
      "    }).join(' ');",
      "  }",
      "  ['log','info','warn','error'].forEach(function(level){",
      "    var orig = console[level].bind(console);",
      "    console[level] = function(){",
      "      send({ type: 'console', level: level, text: fmt(arguments) });",
      "      orig.apply(null, arguments);",
      "    };",
      "  });",
      "  window.addEventListener('error', function(e){",
      "    send({ type: 'console', level: 'error', text: 'エラー: ' + e.message });",
      "    send({ type: 'runtime-error', message: e.message });",
      "  });",
      "  window.addEventListener('unhandledrejection', function(e){",
      "    var m = e.reason && e.reason.message ? e.reason.message : String(e.reason);",
      "    send({ type: 'console', level: 'error', text: 'Promiseエラー: ' + m });",
      "  });",
      "})();",
    ].join("\n");
  }

  /** check実行スクリプトを組み立てる（checkSourceはJSON文字列化して埋め込む） */
  function buildCheckRunner(checkSource, delayMs) {
    return [
      "setTimeout(async function(){",
      "  function send(msg){ parent.postMessage(msg, '*'); }",
      "  var helpers = {",
      "    $: function(sel){ return document.querySelector(sel); },",
      "    $$: function(sel){ return Array.prototype.slice.call(document.querySelectorAll(sel)); },",
      "    text: function(sel){ var el = document.querySelector(sel); return el ? el.textContent.trim() : null; },",
      "    click: function(sel){ var el = document.querySelector(sel); if(!el) throw new Error('要素が見つかりません: ' + sel); el.click(); },",
      "    setValue: function(sel, v){ var el = document.querySelector(sel); if(!el) throw new Error('要素が見つかりません: ' + sel); el.value = v; el.dispatchEvent(new Event('input', {bubbles:true})); el.dispatchEvent(new Event('change', {bubbles:true})); },",
      "    keydown: function(sel, key){ var el = document.querySelector(sel); if(!el) throw new Error('要素が見つかりません: ' + sel); el.dispatchEvent(new KeyboardEvent('keydown', {key:key, bubbles:true})); },",
      "    submit: function(sel){ var el = document.querySelector(sel); if(!el) throw new Error('要素が見つかりません: ' + sel); el.dispatchEvent(new Event('submit', {bubbles:true, cancelable:true})); },",
      "    sleep: function(ms){ return new Promise(function(r){ setTimeout(r, ms); }); },",
      "    assert: function(cond, msg){ if(!cond) throw new Error(msg || '検証に失敗しました'); }",
      "  };",
      "  try {",
      "    var AsyncFn = Object.getPrototypeOf(async function(){}).constructor;",
      "    var src = " + JSON.stringify(checkSource || "") + ";",
      "    if (src.trim() === '') { send({ type: 'check', pass: true, message: '実行しました' }); return; }",
      "    var fn = new AsyncFn('$', '$$', 'text', 'click', 'setValue', 'keydown', 'submit', 'sleep', 'assert', src);",
      "    await fn(helpers.$, helpers.$$, helpers.text, helpers.click, helpers.setValue, helpers.keydown, helpers.submit, helpers.sleep, helpers.assert);",
      "    send({ type: 'check', pass: true, message: 'クリア！すべてのチェックに合格しました' });",
      "  } catch (e) {",
      "    send({ type: 'check', pass: false, message: e && e.message ? e.message : String(e) });",
      "  }",
      "}, " + delayMs + ");",
    ].join("\n");
  }

  /** srcdoc用のHTML全体を組み立てる */
  function buildSrcdoc(code, checkSource) {
    return [
      "<!DOCTYPE html>",
      '<html lang="ja">',
      "<head>",
      '<meta charset="UTF-8">',
      '<script type="importmap">' +
        JSON.stringify({ imports: { stimulus: STIMULUS_URL } }) +
        "<\/script>",
      "<style>",
      "  body { font-family: -apple-system, 'Hiragino Sans', sans-serif; padding: 14px; margin: 0; font-size: 15px; line-height: 1.7; }",
      "  button { font-size: 14px; padding: 6px 12px; margin: 2px; cursor: pointer; }",
      "  input, textarea, select { font-size: 14px; padding: 6px; margin: 2px; }",
      "  .hidden { display: none; }",
      "</style>",
      "<script>" + buildBootstrap() + "<\/script>",
      "</head>",
      "<body>",
      code,
      '<script type="module">' + buildCheckRunner(checkSource, CHECK_DELAY_MS) + "<\/script>",
      "</body>",
      "</html>",
    ].join("\n");
  }

  var currentHandler = null;
  var currentTimer = null;

  /**
   * コードをiframeで実行する。
   * callbacks: { onConsole(level, text), onResult(pass, message) }
   * onResultは1回だけ呼ばれる（タイムアウト時はpass=false）。
   */
  function run(iframe, code, checkSource, callbacks) {
    // 前回実行のリスナーを掃除する
    if (currentHandler) window.removeEventListener("message", currentHandler);
    if (currentTimer) clearTimeout(currentTimer);

    var settled = false;
    function settle(pass, message) {
      if (settled) return;
      settled = true;
      clearTimeout(currentTimer);
      callbacks.onResult(pass, message);
    }

    currentHandler = function (e) {
      if (e.source !== iframe.contentWindow) return;
      var msg = e.data || {};
      if (msg.type === "console") {
        callbacks.onConsole(msg.level, msg.text);
      } else if (msg.type === "check") {
        settle(Boolean(msg.pass), msg.message || "");
      }
    };
    window.addEventListener("message", currentHandler);

    currentTimer = setTimeout(function () {
      settle(
        false,
        "判定がタイムアウトしました。コードのエラー、または無限ループ・ネットワーク（Stimulus CDN）を確認してください。"
      );
    }, RESULT_TIMEOUT_MS);

    iframe.srcdoc = buildSrcdoc(code, checkSource);
  }

  window.StimulusRunner = { run: run, buildSrcdoc: buildSrcdoc };
})();
