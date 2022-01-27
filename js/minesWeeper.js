"use strict";
const MINE = "💣";
const FLAG = "🏳‍🌈";
const FACE = "🙂";
const WINNINGFACE = "😎";
const LOSSINGFACE = "😖";
const EMPTY = " ";
const LIVES = "🖤";
const HINTSON = "💡";

var gIntervalTimer;
var gBoard;
var gGameOver = false;

var gCell = {
  minesAroundCount: 0,
  isShown: false,
  isMine: false,
  isMarked: false,
};

var gLevel = {
  size: 4,
  mines: 2,
};

var gGame = {
  isOn: false,
  shownCount: 0,
  flagsCount: 0,
  secsPassed: 0,
  lifeCount: 1,
  hintsCount: 3,
};

function init() {
  gBoard = buildBoard(gLevel);
  var elFlagCounter = document.querySelector(".flag");
  elFlagCounter.innerText = `FLAGS COUNT:`;
  renderBoard(gBoard);
  renderLives();
  // renderHints();
  renderBestScore();
  gGameOver = false;
}

function restart(elBtn) {
  gameOver(FACE);
  gGame = {
    isOn: false,
    shownCount: 0,
    flagsCount: 0,
    secsPassed: 0,
    lifeCount: 1,
    hintsCount: 3,
  };
  if (gLevel.size > 4) gGame.lifeCount = 3;
  elBtn = document.querySelector(".restart");
  elBtn.innerText = FACE;
  init();
}

function changeLevel(elBtn) {
  var elBtnInfo = {
    l: +elBtn.dataset.l,
    m: +elBtn.dataset.m,
  };
  gLevel.size = elBtnInfo.l;
  gLevel.mines = elBtnInfo.m;
  restart();
}

// function getHint() {

// }

function buildBoard(gLevel) {
  //fix
  var board = [];
  for (var i = 0; i < gLevel.size; i++) {
    board[i] = [];
    for (var j = 0; j < gLevel.size; j++) {
      var cell = Object.assign({}, gCell);
      board[i].push(cell);
    }
  }
  return board;
}

function renderLives() {
  var livesStr = "";
  for (var i = 0; i < gGame.lifeCount; i++) {
    livesStr += LIVES;
  }
  var elLives = document.querySelector(".lives");
  elLives.innerHTML = livesStr;
}

function renderBestScore() {
  var elBestScore = document.querySelector(".best-score");
  if (gLevel.size === 4)
    elBestScore.innerText = `Level Easy - Best Score:${localStorage.bestScoreEasy}`;
  if (gLevel.size === 8)
    elBestScore.innerText = `Level Medium - Best Score:${localStorage.bestScoreMedium}`;
  if (gLevel.size === 12)
    elBestScore.innerText = `Level Hard - Best Score:${localStorage.bestScoreHard}`;
}

// function renderHints() {
//     var hintsStr = '';
//     for (var i = 0; i < gGame.hintsCount; i++) {
//         hintsStr += HINTSON;
//     }
//     var elHints = document.querySelector('.hints');
//     console.log(elHints);
//     elHints.innerText = hintsStr;

// }

function startGame(elFirstCell) {
  gGame.isOn = true;
  setRandomMines(gLevel, elFirstCell);
  setMinesNegsCount();
  setTimer();
}

function setTimer() {
  var gSec = 0;
  function pad(val) {
    return val > 9 ? val : "0" + val;
  }
  gIntervalTimer = setInterval(function () {
    document.getElementById("seconds").innerHTML = pad(++gSec % 60);
    document.getElementById("minutes").innerHTML = pad(parseInt(gSec / 60, 10));
    gGame.secsPassed = gSec;
  }, 1000);
}

function cellClicked(elCell) {
  var elCellIdx = {
    i: +elCell.dataset.i,
    j: +elCell.dataset.j,
  };
  var currCell = gBoard[elCellIdx.i][elCellIdx.j];
  if (currCell.isShown || currCell.isMarked) return;
  if (gGameOver) return;
  if (!gGame.isOn) {
    currCell.isShown = true;
    startGame(elCellIdx);
    if (currCell.minesAroundCount === 0) showCells(elCellIdx);
    renderBoard(gBoard);
    gGame.shownCount++;
    return;
  }
  if (currCell.isMine && gGame.lifeCount > 0) {
    currCell.isShown = true;
    gGame.lifeCount--;
    gGame.flagsCount++;
    checkWin();
    renderLives();
    renderBoard(gBoard);
    return;
  } else if (currCell.isMine && gGame.lifeCount === 0) {
    showBombs();
    renderBoard(gBoard);
    gameOver(LOSSINGFACE);
  } else {
    currCell.isShown = true;
    gGame.shownCount += 1;
    if (currCell.minesAroundCount === 0) showCells(elCellIdx);
    renderBoard(gBoard);
    checkWin();
  }
}

function showCells(elCellIdx) {
  for (var i = elCellIdx.i - 1; i <= elCellIdx.i + 1; i++) {
    if (i < 0 || i >= gLevel.size) continue;
    for (var j = elCellIdx.j - 1; j <= elCellIdx.j + 1; j++) {
      if (i === elCellIdx.i && j === elCellIdx.j) continue;
      if (j < 0 || j >= gLevel.size) continue;
      if (gBoard[i][j].isMine || gBoard[i][j].isMarked) {
        continue;
      } else {
        if (!gBoard[i][j].isShown) {
          gBoard[i][j].isShown = true;
          gGame.shownCount += 1;
          if (gBoard[i][j].minesAroundCount === 0) {
            elCellIdx = {
              i: i,
              j: j,
            };
            showCells(elCellIdx);
          }
        }
      }
    }
  }
  checkWin();
}

function showBombs() {
  for (var i = 0; i < gLevel.size; i++) {
    for (var j = 0; j < gLevel.size; j++) {
      if (gBoard[i][j].isMine) gBoard[i][j].isShown = true;
    }
  }
}

function markFlags(ev) {
  // finish
  ev.preventDefault();
  var elFlagCounter = document.querySelector(".flag");
  var elCellIdx = {
    i: ev.path[0].dataset.i,
    j: ev.path[0].dataset.j,
  };
  var currCell = gBoard[elCellIdx.i][elCellIdx.j];
  if (currCell.isShown) return;
  if (!currCell.isMarked) {
    currCell.isMarked = true;
    gGame.flagsCount += 1;
    console.log(gGame.flagsCount);
    var flagSTtr = `FLAG COUNT:${gGame.flagsCount}`;
    elFlagCounter.innerText = flagSTtr;
  } else {
    currCell.isMarked = false;
    currCell.isShown = false;
    gGame.flagsCount += -1;
    flagSTtr = `FLAGS COUNT:${gGame.flagsCount}`;
    elFlagCounter.innerText = flagSTtr;
  }
  renderBoard(gBoard);
  checkWin();
}

function checkWin() {
  var shownCellNum = gLevel.size ** 2 - gLevel.mines;
  if (gGame.flagsCount === gLevel.mines && gGame.shownCount === shownCellNum) {
    console.log("cell", shownCellNum, gGame.shownCount, gGame.flagsCount);
    gameOver(WINNINGFACE);
  }
}

function gameOver(mode) {
  clearInterval(gIntervalTimer);
  var resetBtn = document.querySelector(".restart");
  resetBtn.innerText = mode;
  gGameOver = true;
  if (mode === WINNINGFACE) bestScore();
  console.log(mode);
}

function bestScore() {
  if (!localStorage.bestScoreEasy) localStorage.setItem("bestScoreEasy", "");
  if (!localStorage.bestScoreMedium)
    localStorage.setItem("bestScoreMedium", "");
  if (!localStorage.bestScoreHard) localStorage.setItem("bestScoreHard", "");
  if (gLevel.size === 4 && +localStorage.bestScoreEasy === 0) {
    localStorage.setItem("bestScoreEasy", gGame.secsPassed);
  } else if (
    gLevel.size === 4 &&
    +localStorage.bestScoreEasy > gGame.secsPassed
  ) {
    localStorage.setItem("bestScoreEasy", gGame.secsPassed);
  }
  if (gLevel.size === 8 && +localStorage.bestScoreMedium === 0) {
    localStorage.setItem("bestScoreMedium", gGame.secsPassed);
  } else if (
    gLevel.size === 8 &&
    +localStorage.bestScoreMedium > gGame.secsPassed
  ) {
    localStorage.setItem("bestScoreMedium", gGame.secsPassed);
  }
  if (gLevel.size === 12 && +localStorage.bestScoreHard === 0) {
    localStorage.setItem("bestScoreHard", gGame.secsPassed);
  } else if (
    gLevel.size === 12 &&
    +localStorage.bestScoreHard > gGame.secsPassed
  ) {
    localStorage.setItem("bestScoreHard", gGame.secsPassed);
  }
  renderBestScore();
}

function reSetScores() {
  localStorage.setItem("bestScoreEasy", "");
  localStorage.setItem("bestScoreMedium", "");
  localStorage.setItem("bestScoreHard", "");
}

//add hints.
//add safe click and redo.
