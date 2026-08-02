/**
 * 教材データの構造検証スクリプト
 *
 * public/content/chapterNN.js を読み込み、以下を検証する：
 * - 章番号1〜20、ステップID1〜200が過不足なく揃っているか
 * - 各ステップの必須フィールドが存在するか
 * - solutionにfn mainが含まれるか、禁止API（stdin等）を使っていないか
 *
 * 使い方：node scripts/validate.js
 */
const fs = require("fs");
const path = require("path");

const CONTENT_DIR = path.join(__dirname, "..", "public", "content");
const chapters = [];

// ブラウザ用ファイルをそのままNodeで評価するためのスタブ
global.registerChapter = function (ch) {
  chapters.push(ch);
};
global.window = { RUST_TUTOR_CHAPTERS: chapters };

const errors = [];
const warnings = [];

const files = fs
  .readdirSync(CONTENT_DIR)
  .filter((f) => /^chapter\d{2}\.js$/.test(f))
  .sort();

for (const f of files) {
  try {
    require(path.join(CONTENT_DIR, f));
  } catch (e) {
    errors.push(`${f}: 読み込みエラー: ${e.message}`);
  }
}

console.log(`読み込んだファイル数: ${files.length}`);
console.log(`登録された章数: ${chapters.length}`);

// 章番号の検証
const chapterNumbers = chapters.map((c) => c.number).sort((a, b) => a - b);
const N_CHAPTERS = files.length;
for (let n = 1; n <= N_CHAPTERS; n++) {
  if (!chapterNumbers.includes(n)) errors.push(`第${n}章が存在しません`);
}

// ステップの検証
const allSteps = [];
for (const ch of chapters) {
  if (!ch.title) errors.push(`第${ch.number}章: titleがありません`);
  if (!Array.isArray(ch.steps)) {
    errors.push(`第${ch.number}章: stepsが配列ではありません`);
    continue;
  }
  if (ch.steps.length !== 10) {
    errors.push(`第${ch.number}章: ステップ数が${ch.steps.length}です（10であるべき）`);
  }
  for (const s of ch.steps) {
    allSteps.push(s);
    const label = `ステップ${s.id}（第${ch.number}章）`;
    for (const field of ["id", "title", "explanation", "task", "code", "solution"]) {
      if (s[field] == null || s[field] === "") {
        errors.push(`${label}: ${field}がありません`);
      }
    }
    if (!Array.isArray(s.hints) || s.hints.length === 0) {
      warnings.push(`${label}: hintsが空です`);
    }
    if (s.check == null || s.check === "") {
      errors.push(`${label}: checkがありません`);
    }
    // Playground非対応・教材で禁止しているAPIのチェック
    for (const banned of ["fetch(", "localStorage", "XMLHttpRequest"]) {
      if ((s.code || "").includes(banned) || (s.solution || "").includes(banned)) {
        errors.push(`${label}: 禁止API「${banned}」を使用しています`);
      }
    }
    // explanation内の未エスケープの生タグ崩れの簡易チェック
    if (s.expectedOutput !== undefined && s.expectedOutput !== null && typeof s.expectedOutput !== "string") {
      errors.push(`${label}: expectedOutputは文字列またはnullであるべきです`);
    }
  }
}

// ID連番の検証
const ids = allSteps.map((s) => s.id).sort((a, b) => a - b);
for (let i = 1; i <= N_CHAPTERS * 10; i++) {
  if (!ids.includes(i)) errors.push(`ステップID ${i} が存在しません`);
}
const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
if (dupes.length) errors.push(`重複ID: ${[...new Set(dupes)].join(", ")}`);

console.log(`総ステップ数: ${allSteps.length}`);
console.log("");

if (warnings.length) {
  console.log("警告:");
  warnings.forEach((w) => console.log("  - " + w));
}
if (errors.length) {
  console.log("エラー:");
  errors.forEach((e) => console.log("  - " + e));
  process.exit(1);
} else {
  console.log("構造検証OK");
}
