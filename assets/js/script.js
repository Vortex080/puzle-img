window.addEventListener('load', function () {

  const canvas = document.querySelector("#canvas");
  const stage = canvas.getContext("2d");

  const img = new Image();

  let dificulty = 4;
  let pieces;
  let puzzleWidth;
  let puzzleHeight;
  let pieceWidth;
  let pieceHeight;
  let currentPiece;
  let currentDropPiece;

  let mouse;
  // Instancia la imagen
  img.addEventListener('load', onImage, false);
  img.src = "assets/img/patricio.png";



  function onImage(e) {
    // Calcula la cantidad de puezas para el puzle por altura y anchura 
    //(4 porque seran 4 de altura y 4 de anchura )
    pieceWidth = Math.floor(img.width / dificulty);
    pieceHeight = Math.floor(img.height / dificulty);
    puzzleHeight = pieceHeight * dificulty;
    puzzleWidth = pieceWidth * dificulty;
    setCanvas();
    initPuzzle();
  }

  // Settea el canvas con la anchura y altura dependiendo la cantidad de partes
  function setCanvas() {
    canvas.width = puzzleWidth;
    canvas.height = puzzleHeight;
  }

  function initPuzzle() {
    pieces = [];
    mouse = { x: 0, y: 0 };
    currentPiece = null;
    currentDropPiece = null;
    stage.drawImage(img, 0, 0, puzzleWidth, puzzleHeight, 0, 0, puzzleWidth, puzzleHeight);
    buildPieces();
  }

  function buildPieces() {
    let i;
    let piece;
    let xPos = 0;
    let yPos = 0;
    for (i = 0; i < dificulty * dificulty; i++) {
      piece = {};
      // calcula la posicion de la pieza
      piece.sx = xPos;
      piece.sy = yPos;
      pieces.push(piece);
      xPos += pieceWidth;
      if (xPos >= puzzleWidth) {
        xPos = 0;
        yPos += pieceHeight;
      }
    }
    // onclick
    document.onpointerdown = sufflePuzzle;
  }

  // Sufle tutorial https://code.tutsplus.com/quick-tip-how-to-randomly-shuffle-an-array-in-as3--active-8776t
  function sufflePuzzle() {
    pieces = suffleArray(pieces);
    stage.clearRect(0, 0, puzzleWidth, puzzleHeight);
    let xPos = 0;
    let yPos = 0;
    for (const piece of pieces) {
      piece.xPos = xPos;
      piece.yPos = yPos;
      stage.drawImage(img, piece.sx, piece.sy, pieceWidth, pieceHeight, xPos, pieceWidth, pieceHeight);
      stage.strokeRect(xPos, yPos, pieceWidth, pieceHeight);
      xPos += pieceWidth;
      if (xPos >= puzzleWidth) {
        xPos = 0;
        yPos += pieceHeight;
      }
    }
    document.onpointerdown = onPuzzleClick;
  }

  function shuffleArray(o) {
    for (let j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
  }

  function onPuzzleClick(e) {
    if (e.layerX || e.layerX === 0) {
      mouse.x = e.layerX - canvas.offsetLeft;
      mouse.y = e.layerY - canvas.offsetTop;
    } else if (e.offsetX || e.offsetX === 0) {
      mouse.x = e.offsetX - canvas.offsetLeft;
      mouse.y = e.offsetY - canvas.offsetTop;
    }

    currentPiece = checkPieceClicked();
    if (currentPiece !== null) {
      stage.clearRect(currentPiece.xPos, currentPiece.yPos, pieceWidth, pieceHeight);
      stage.save();
      stage.globalAlpha = 0.9;
      stage.drawImage(
        img,
        currentPiece.sx,
        currentPiece.sy,
        pieceWidth,
        pieceHeight,
        mouse.x - pieceWidth / 2,
        mouse.y - pieceHeight / 2, pieceWidth,
        pieceHeight
      );
      stage.restore();
      // Se dispara cuando el puntero cambia las coordenadas y no ha sido cancelado
      document.onpointermove = updatePuzzle;
      // Se dispara cuando el puntero ya no etsa actvo (es posible obtener un pointercancel)
      document.onpointerup = pieceDropped;
    }
  }

  function checkPieceClicked() {
    for (const piece of pieces) {
      if (
        mouse.x < piece.xPos ||
        mouse.x > piece.xPos + pieceWidth ||
        mouse.y < piece.yPos ||
        mouse.y > piece.yPos + pieceHeight
      ) {
        console.log('pieza fuera de rango')
      } else {
        return piece;
      }
    }
    return null;
  }

  function updatePuzzle() {
    currentDropPiece = null;
    if (e.layerX || e.layerX === 0) {
      mouse.x = e.layerX - canvas.offsetLeft;
      mouse.y = e.layerY - canvas.offsetTop;
    } else if (e.offsetX || e.offsetY === 0) {
      mouse.x = e.offsetX - canvas.offsetLeft;
      mouse.y = e.offsetY - canvas.offsetTop;
    }
    stage.clearRect(0, 0, puzzleWidth, puzzleHeight);
    for (const piece of pieces) {
      if (piece === currentPiece) {
        continue;
      }
      stage.drawImage(
        img,
        piece.sx,
        piece.sy,
        pieceWidth,
        pieceHeight,
        piece.xPos,
        piece.yPos,
        pieceWidth,
        pieceHeight
      );
      stage.strokeRect(piece.xPos, piece.yPos, pieceWidth, pieceHeight);
      if (currentDropPiece === null) {
        if (
          mouse.x < piece.xPos ||
          mouse.x > piece.xPos + pieceWidth ||
          mouse.y < piece.yPos ||
          mouse.y > piece.yPos + pieceHeight
        ) {
          // not over
        } else {
          currentDropPiece = piece;
          stage.save();
          stage.globalAlpha = 0.4;
          stage.fillStyle = PUZZLE_HOVER_TINT;
          stage.filRect(
            currentDropPiece.xPos,
            currentDropPiece.yPos,
            pieceWidth,
            pieceHeight
          );
          stage.restore();
        }
      }
    }
    stage.save();
    stage.globalAlpha = 0.6;
    stage.drawImage(
      img,
      currentPiece.sx,
      currentPiece.sy,
      pieceWidth,
      pieceHeight,
      mouse.x - pieceWidth / 2,
      mouse.y - pieceHeight / 2,
      pieceWidth,
      pieceHeight
    );
    stage.restore();
    stage.strokeRect(
      mouse.x - pieceWidth / 2,
      mouse.y - pieceHeight / 2,
      pieceWidth,
      pieceHeight
    );
  }

  function pieceDropped(e) {
    document.onpointermove = null;
    document.onpointerup = null;
    if (currentDropPiece !== null) {
      let tmp = { xPos: currentPiece.xPos, yPos: currentPiece.yPos };
      currentPiece.xPos = currentDropPiece.xPos;
      currentPiece.yPos = currentDropPiece.yPos;
      currentDropPiece.xPos = tmp.xPos;
      currentDropPiece.yPos = tmp.yPos;
    }
    resetPuzzleAndCheckWin();
  }

  function resetPuzzleAndCheckWin() {
    stage.clearRect(0, 0, puzzleWidth, puzzleHeight);
    let gameWin = true;
    for (piece in pieces) {
      stage.drawImage(
        img,
        piece.sx,
        piece.sy,
        pieceWidth,
        pieceHeight,
        piece.xPos,
        piece.yPos,
        pieceWidth,
        pieceHeight
      );
      stage.strokeRect(piece.xPos, piece.yPos, pieceWidth, pieceHeight);
      if (piece.xPos != piece.sx || piece.yPos != piece.sy) {
        gameWin = false;
      }
    }
    if (gameWin) {
      setTimeout(gameOver, 500);
    }
  }

  function gameOver() {
    document.onpointerdown = null;
    document.onpointermove = null;
    document.onpointerup = null;
    initPuzzle();
  }

  function gameOver() {
    document.onpointerdown = null;
    document.onpointermove = null;
    document.onpointerup = null;
    initPuzzle();
  }

  // https://webdesign.tutsplus.com/es/create-an-html5-canvas-tile-swapping-puzzle--active-10747t

})