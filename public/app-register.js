/**
 * 教材データ登録用のグローバル関数。
 * 各content/chapterNN.jsがregisterChapter()を呼んで章データを登録する。
 * content/intro.jsはregisterIntro()で「はじめに」ページを登録する。
 * app.jsより先に読み込まれる必要がある。
 */
window.RUST_TUTOR_CHAPTERS = [];
window.RUST_TUTOR_INTRO = null;

function registerChapter(chapter) {
  window.RUST_TUTOR_CHAPTERS.push(chapter);
}

function registerIntro(intro) {
  window.RUST_TUTOR_INTRO = intro;
}
