/**
 * Stimulus 200 Steps フロントエンド
 *
 * 基本構成は他言語版と同じだが、実行はサーバーではなく
 * ブラウザ内のsandbox付きiframe（runner.js）で行う。
 * 自動判定は各ステップのcheckスクリプト（iframe内でDOMを検証）による。
 */
(function () {
  "use strict";

  var STORAGE_KEY = "stimulus200.state.v1";
  var chapters = (window.RUST_TUTOR_CHAPTERS || []).slice().sort(function (a, b) {
    return a.number - b.number;
  });

  var steps = [];
  chapters.forEach(function (ch) {
    (ch.steps || []).forEach(function (s) {
      s.chapter = ch;
      steps.push(s);
    });
  });
  steps.sort(function (a, b) { return a.id - b.id; });

  var stepById = {};
  steps.forEach(function (s) { stepById[s.id] = s; });

  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* 壊れた保存データは無視して初期化する */ }
    return { done: {}, codes: {}, lastStep: null };
  }
  var state = loadState();

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) { /* 保存失敗は致命的ではないので無視 */ }
  }

  var $ = function (id) { return document.getElementById(id); };
  var elToc = $("toc");
  var elWelcome = $("welcome");
  var elStepView = $("step-view");
  var elHintsBox = $("hints-box");
  var elSolutionBox = $("solution-box");
  var elOutputSection = $("output-section");
  var elOutputStatus = $("output-status");
  var elConsoleBlock = $("console-block");
  var elConsoleOutput = $("console-output");
  var elPreviewFrame = $("preview-frame");
  var elChkDone = $("chk-done");
  var elBtnRun = $("btn-run");

  var currentStep = null;
  var hintIndex = 0;

  var introShown = false;

  /** 「はじめに」ページ（言語紹介）を表示する */
  function showIntro() {
    var intro = window.RUST_TUTOR_INTRO;
    if (!intro) return;
    introShown = true;
    currentStep = null;
    elStepView.hidden = true;
    elWelcome.hidden = false;
    elWelcome.innerHTML = "";
    var page = document.createElement("div");
    page.className = "intro-page";
    page.innerHTML = intro.content;
    var btn = document.createElement("button");
    btn.className = "primary";
    btn.textContent = "学習を始める（ステップ1へ）";
    btn.addEventListener("click", function () { location.hash = "#step-1"; });
    page.appendChild(btn);
    elWelcome.appendChild(page);
    renderToc();
    window.scrollTo(0, 0);
    $("main").scrollTop = 0;
  }

  // ---- エディタ ----
  var textarea = $("code-editor");
  var cm = null;
  if (window.CodeMirror) {
    cm = CodeMirror.fromTextArea(textarea, {
      mode: "htmlmixed",
      theme: "material-darker",
      lineNumbers: true,
      indentUnit: 2,
      tabSize: 2,
      indentWithTabs: false,
      viewportMargin: Infinity,
      extraKeys: {
        "Cmd-Enter": function () { runCode(); },
        "Ctrl-Enter": function () { runCode(); },
      },
    });
    cm.on("change", function () {
      if (currentStep) {
        state.codes[currentStep.id] = cm.getValue();
        saveState();
      }
    });
  } else {
    textarea.addEventListener("input", function () {
      if (currentStep) {
        state.codes[currentStep.id] = textarea.value;
        saveState();
      }
    });
  }

  function getCode() { return cm ? cm.getValue() : textarea.value; }
  function setCode(code) {
    if (cm) { cm.setValue(code); } else { textarea.value = code; }
  }

  // ---- サイドバー ----
  function doneCount() {
    return steps.filter(function (s) { return state.done[s.id]; }).length;
  }

  function renderProgress() {
    var n = doneCount();
    $("progress-label").textContent = n + " / " + steps.length;
    $("progress-fill").style.width =
      (steps.length ? (n / steps.length) * 100 : 0) + "%";
  }

  function renderToc() {
    elToc.innerHTML = "";
    var intro = window.RUST_TUTOR_INTRO;
    if (intro) {
      var introLink = document.createElement("a");
      introLink.href = "#intro";
      introLink.className = "toc-intro" + (introShown ? " active" : "");
      introLink.textContent = intro.tocTitle || "はじめに";
      elToc.appendChild(introLink);
    }
    chapters.forEach(function (ch) {
      var chDone = (ch.steps || []).every(function (s) { return state.done[s.id]; });

      var details = document.createElement("details");
      details.className = "toc-chapter";
      if (currentStep && currentStep.chapter === ch) details.open = true;

      var summary = document.createElement("summary");
      summary.textContent = "第" + ch.number + "章 " + ch.title + (chDone ? " ✓" : "");
      if (chDone) summary.classList.add("done");
      details.appendChild(summary);

      var ul = document.createElement("ul");
      (ch.steps || []).forEach(function (s) {
        var li = document.createElement("li");
        var a = document.createElement("a");
        a.href = "#step-" + s.id;
        a.textContent = s.id + ". " + s.title;
        a.className = "toc-step";
        if (state.done[s.id]) a.classList.add("done");
        if (currentStep && currentStep.id === s.id) a.classList.add("active");
        li.appendChild(a);
        ul.appendChild(li);
      });
      details.appendChild(ul);
      elToc.appendChild(details);
    });
  }

  // ---- ステップ表示 ----
  function showStep(id) {
    var step = stepById[id];
    if (!step) return;
    currentStep = step;
    introShown = false;
    hintIndex = 0;
    state.lastStep = id;
    saveState();

    elWelcome.hidden = true;
    elStepView.hidden = false;

    $("btn-hint").textContent = "ヒント";
    $("step-breadcrumb").textContent =
      "第" + step.chapter.number + "章 " + step.chapter.title +
      "｜ステップ " + step.id + " / " + steps.length;
    $("step-title").textContent = step.title;
    // 教材データは自作の信頼できるコンテンツなのでinnerHTMLで描画する
    $("explanation").innerHTML = step.explanation || "";
    $("task-text").innerHTML = step.task || "";

    setCode(state.codes[step.id] != null ? state.codes[step.id] : step.code || "");

    elHintsBox.hidden = true;
    elHintsBox.innerHTML = "";
    elSolutionBox.hidden = true;
    $("solution-code").textContent = step.solution || "";
    elOutputSection.hidden = true;
    elPreviewFrame.srcdoc = "";
    elChkDone.checked = Boolean(state.done[step.id]);

    renderToc();
    renderProgress();
    window.scrollTo(0, 0);
    $("main").scrollTop = 0;
    if (cm) cm.refresh();
  }

  // ---- 実行 ----
  function setRunning(running) {
    elBtnRun.disabled = running;
    elBtnRun.textContent = running ? "実行中..." : "実行する";
  }

  function runCode() {
    if (!currentStep || elBtnRun.disabled) return;
    setRunning(true);
    elOutputSection.hidden = false;
    elOutputStatus.textContent = "実行中です...";
    elOutputStatus.className = "status-running";
    elConsoleBlock.hidden = true;
    elConsoleOutput.textContent = "";

    var consoleLines = [];

    StimulusRunner.run(elPreviewFrame, getCode(), currentStep.check || "", {
      onConsole: function (level, text) {
        consoleLines.push((level === "log" ? "" : "[" + level + "] ") + text);
        elConsoleBlock.hidden = false;
        elConsoleOutput.textContent = consoleLines.join("\n");
      },
      onResult: function (pass, message) {
        setRunning(false);
        if (pass) {
          elOutputStatus.textContent = message || "クリア！";
          elOutputStatus.className = "status-ok";
          if (!state.done[currentStep.id]) {
            state.done[currentStep.id] = true;
            elChkDone.checked = true;
            saveState();
            renderToc();
            renderProgress();
          }
        } else {
          elOutputStatus.textContent = "まだクリアではありません：" + message;
          elOutputStatus.className = "status-warn";
        }
      },
    });

    elOutputSection.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  // ---- イベント ----
  elBtnRun.addEventListener("click", runCode);

  $("btn-reset").addEventListener("click", function () {
    if (!currentStep) return;
    setCode(currentStep.code || "");
    delete state.codes[currentStep.id];
    saveState();
  });

  $("btn-hint").addEventListener("click", function () {
    if (!currentStep) return;
    var hints = currentStep.hints || [];
    if (hints.length === 0) return;
    elHintsBox.hidden = false;
    if (hintIndex < hints.length) {
      var p = document.createElement("p");
      p.textContent = "ヒント" + (hintIndex + 1) + "：" + hints[hintIndex];
      elHintsBox.appendChild(p);
      hintIndex++;
    }
    if (hintIndex >= hints.length) {
      $("btn-hint").textContent = "ヒント（すべて表示済み）";
    }
  });

  $("btn-solution").addEventListener("click", function () {
    elSolutionBox.hidden = !elSolutionBox.hidden;
  });

  $("btn-apply-solution").addEventListener("click", function () {
    if (!currentStep) return;
    setCode(currentStep.solution || "");
  });

  $("btn-prev").addEventListener("click", function () {
    if (currentStep && stepById[currentStep.id - 1]) {
      location.hash = "#step-" + (currentStep.id - 1);
    }
  });

  $("btn-next").addEventListener("click", function () {
    if (currentStep && stepById[currentStep.id + 1]) {
      location.hash = "#step-" + (currentStep.id + 1);
    }
  });

  elChkDone.addEventListener("change", function () {
    if (!currentStep) return;
    if (elChkDone.checked) {
      state.done[currentStep.id] = true;
    } else {
      delete state.done[currentStep.id];
    }
    saveState();
    renderToc();
    renderProgress();
  });

  document.addEventListener("keydown", function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      runCode();
    }
  });

  window.addEventListener("hashchange", function () {
    var m = location.hash.match(/^#step-(\d+)$/);
    if (m) {
      showStep(Number(m[1]));
    } else if (location.hash === "#intro") {
      showIntro();
    }
  });

  // ---- 初期表示 ----
  if (steps.length === 0) {
    elWelcome.innerHTML =
      "<h2>教材データが見つかりません</h2><p>public/content/にchapterNN.jsを配置してください。</p>";
  } else {
    renderToc();
    renderProgress();
    var m = location.hash.match(/^#step-(\d+)$/);
    if (!m && window.RUST_TUTOR_INTRO && (location.hash === "#intro" || !state.lastStep)) {
      // 初めての利用時は「はじめに」（言語紹介）を表示する
      showIntro();
      location.hash = "#intro";
    } else {
      var initial = m ? Number(m[1]) : state.lastStep || steps[0].id;
      if (!stepById[initial]) initial = steps[0].id;
      showStep(initial);
      location.hash = "#step-" + initial;
    }
  }
})();
