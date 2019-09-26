if(modeStorage == 'multiplayer') {

message('Click the "Start game" button to start multiplayer.');

var NumCheckers = {
  gameId: null,
  turn: null,
  my_turn: false,
  gameContinue: true,
  init: function() {
    // socket.on('connect', function() {
    //   message('Click the "Start game" button to start.');
    // });
    socket.on('reconnect', function () {
      message('Reconnect, keep going.');    
    });
    socket.on('reconnecting', function () {
      message('Server connection terminated, reconnect...');
    });
    socket.on('error', function (e) {
      message('Error: ' + (e ? e : 'unknown error'));
    });
    socket.on('wait', function(){
      message('... Waiting for an opponent ...');
    });
    socket.on("create board", function(data) {
      randoms = data.randoms;
      Board(0,1,0,1,0,1,0,1,
            1,0,1,0,1,0,1,0,
            0,1,0,1,0,1,0,1,
            0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,
            -1,0,-1,0,-1,0,-1,0,
            0,-1,0,-1,0,-1,0,-1,
            -1,0,-1,0,-1,0,-1,0);
      if(gameContainer.querySelector('.table') != null) {
        gameContainer.removeChild(gameContainer.querySelector('.table'));
      }
      renderBoard();
      table = document.querySelector('.table');
      td = table.querySelectorAll(".table__td");
    });
    socket.on('exit', function() {
      message('Opponent out of the game. Click the restart button to start a new game.');
      restartButton.parentNode.classList.remove('hidden');
    });
    socket.on('ready', function(gameId, turn) {
      message('Opponent was connected to game. The game started!'+ (turn == 'green'?' You may begin! Select a figure to move.':"It's not your turn yet. Hang on a sec!"));
      NumCheckers.startGame(gameId, turn);
      isMultiplayer = true;
      var messageSpanElement = document.createElement('span');
      messageSpanElement.textContent = (turn == 'green')?'green':'red';
      messageSpanElement.style.color = 'white';
      messageSpanElement.style.display = 'inline-block';
      messageSpanElement.style.padding = '5px';
      messageSpanElement.style.backgroundColor = (turn == 'green')?'rgb(100, 174, 86)':'rgb(194, 51, 35)';
      messageSpanElement.style.borderRadius = '7px';
      paragraphTurn.textContent = 'Your figure: ';
      paragraphTurn.appendChild(messageSpanElement);
    });

    socket.on('stats', function(data) {
      message('Players online: ' + data.countPlayers, paragraphCountPlayers);
      paragraphCountPlayers.setAttribute('id', data.countUnique);
    });
  },
  startGame: function (gameId, turn) {
    this.gameId = gameId;
    this.turn = turn;
    this.my_turn = (turn == 'green');
  }, 
  endGame: function () {
    this.my_turn = false;
    this.gameContinue = false;
    socket.emit('endgame', this.gameId);
  }
}

startButton.addEventListener('click', function(evt){
  evt.preventDefault();
  startButton.parentNode.classList.add('hidden');
  socket.emit('start');
});
restartButton.addEventListener('click', function(evt) {
  evt.preventDefault();
  window.location.reload();
});
NumCheckers.init();
function Board() {
 board = new Array();
 for (var i=0;i<8; i++) {
  board[i] = new Array();
  for (var j=0;j<8;j++)
   board[i][j] = Board.arguments[8*j+i];
 }
 board[-2] = new Array(); // prevents errors
 board[-1] = new Array(); // prevents errors
 board[8] = new Array(); // prevents errors
 board[9] = new Array(); // prevents errors
}

function Coord(x,y) {
 this.x = x;
 this.y = y;
}

function coord(x,y) {
 c = new Coord(x,y);
 return c;
}

function clicked(i,j) {
  if (NumCheckers.my_turn) { 
  var c = coord(i,j);
  jumpConcatenate = false;
  if ((NumCheckers.turn == 'green' && integ(board[i][j]) == 1 ||
    NumCheckers.turn == 'red' && integ(board[i][j]) == -1) && (!dropElem && !old)) {
    socket.emit('toggle', NumCheckers.gameId, i, j, NumCheckers.turn);
  } 
  else if (piece_toggled) {
    bar = barrierFromTo(selected,c,NumCheckers.turn);
    var legalMove = check_move(selected, c, NumCheckers.turn);
    if(legalMove) {
      socket.emit('step', NumCheckers.gameId, selected, c, barrier, swaping, remove, c_double_jump);
    }
   
  } 
  else message(NumCheckers.turn == 'green'?"First click one of your green figures, then click where you want to move it":
    "First click one of your red figures, then click where you want to move it");
  } else if(!NumCheckers.gameContinue) {
    message('Game over.');
  }
   else {
    if(isMultiplayer)
      message("It's not your turn yet. Hang on a sec!");
  }
}

function onDragStart() {
  return false;
}

function onMouseDown(e,j,i) {
if(NumCheckers.my_turn) {
  if(((board[j][i] == 1 || board[j][i] == 1.1) && NumCheckers.turn == 'green') ||
      ((board[j][i] == -1 || board[j][i] == -1.1) && NumCheckers.turn == 'red')) {
    if(e.which != 1) {
      return;
    }
    span = e.target;
    draggableAnchor = e.currentTarget;
    dragObject.elem = draggableAnchor;
    coords = getCoords(draggableAnchor);
    coordsTable = getCoords(table);
    socket.emit('onmousedown', NumCheckers.gameId, j, i, e.pageX, e.pageY, coords, coordsTable);
    
  document.onmousemove = function(e) {
    if(!dragObject.elem) return;
      socket.emit('onmousemove', NumCheckers.gameId, j, i, e.pageX, e.pageY, shiftX, shiftY);
  }

  document.onmouseup = function(e) {
    if(dragObject.elem) {
      dropElem = findDroppable(e);
    }
    dragObject = {};
    if(dropElem) {
      dropElemClass = dropElem.classList[1];
    } else {
      dropElemClass = false;
    }
    socket.emit('onmouseup', NumCheckers.gameId, j, i, dropElemClass);
  }
  }
}
}
function findDroppable(event) {
  draggableAnchor.hidden = true;
  var elem = document.elementFromPoint(event.clientX, event.clientY);
  draggableAnchor.hidden = false;

  if (elem == null) {
    return null;
  }

  var dropCoords = getCoords(elem);
  var dropShiftX = event.pageX - dropCoords.left;
  var dropShiftY = event.pageY - dropCoords.top;
  var shiftXFromCenter = shiftX - 26;
  var shiftYFromCenter = shiftY - 26;
  var dropShiftXFromCenter = dropShiftX - 26; 
  var dropShiftYFromCenter = dropShiftY - 26;
  var centerX = dragObject.downX - shiftXFromCenter;
  var centerY = dragObject.downY - shiftYFromCenter;
  var dropCenterX = event.pageX - dropShiftXFromCenter;
  var dropCenterY = event.pageY - dropShiftYFromCenter;
  var centerS = Math.sqrt(abs(Math.pow((centerX - dropCenterX), 2)+Math.pow((centerY - dropCenterY), 2)));
  if (elem.parentNode.getAttribute("class") != "table__anchor droppable" || 
          elem.style.backgroundColor == "rgba(174, 167, 86, 0.43)" || elem.style.backgroundColor == "black" || ((elem.style.backgroundColor == "rgb(194, 51, 35)" || 
          elem.style.backgroundColor == "rgb(174, 86, 86)")&&NumCheckers.turn=='green') ||
          ((elem.style.backgroundColor == "rgb(100, 174, 86)" || elem.style.backgroundColor == "rgb(35, 194, 91)")&&
            NumCheckers.turn=='red') || centerS > 75) {
    return false;
  }
  if(NumCheckers.my_turn) {
    return elem;
  } else return false;
 }

function getCoords(elem) {  
  var box = elem.getBoundingClientRect();
  return {
    top: box.top + pageYOffset,
    left: box.left + pageXOffset
  };
}

socket.on('onmousedown', function(j, i, pageX, pageY, coords, coordsTable) {
  span = document.querySelector(".space"+j+i);
  draggableAnchor = span.parentNode;
  anchorElement = tableanchorTemplate.cloneNode(true);
  anchorElement.querySelector(".table__anchor").classList.add("droppable");
  anchorElement.querySelector(".table__anchor").setAttribute("onclick", "event.preventDefault(); clicked("+j+","+i+")");
  anchorElement.querySelector(".table__anchor").setAttribute("onmousedown", "event.preventDefault(); onMouseDown(event,"+j+","+i+")");
  anchorElement.querySelector(".table__anchor").setAttribute("ondragstart", "event.preventDefault(); onDragStart()");
  spanElement = tablespanTemplate.cloneNode(true);
  spanElement.querySelector(".table__span").classList.add("space"+j+""+i);
  spanElement.querySelector(".table__span").style.backgroundColor = "#aea7566e";
  spanElement.querySelector(".table__span").style.border = '1px solid #aea7566e';
  anchorElement.querySelector(".table__anchor").appendChild(spanElement);

  shiftX = pageX - coords.left + coordsTable.left;
  shiftY = pageY - coords.top + coordsTable.top;

  dragObject.downX = pageX + coordsTable.left;
  dragObject.downY = pageY + coordsTable.top;

  limits = {
    top: table.offsetTop,
    right: table.offsetWidth + table.offsetLeft,
    bottom: table.offsetHeight + table.offsetTop,
    left: table.offsetLeft
  };

  spanAfter = td[i].querySelector(".space"+(j+1)+i);
});

socket.on('onmousemove', function(j, i, pageX, pageY, shiftX, shiftY) {
  draggableAnchor.style.position = 'absolute';
  td[i].insertBefore(anchorElement, spanAfter);
  old = {
  parent: td[i],
  nextSibling: draggableAnchor.nextSibling,
  oldSibling: td[i].querySelectorAll(".space"+j+i)[1],
  position: draggableAnchor.position || '',
  left: draggableAnchor.left || '',
  top: draggableAnchor.top || '',
  zIndex: draggableAnchor.zIndex || ''
  };

  newLocation = {
    x: limits.left,
    y: limits.top
  };

  if(pageX > limits.right) {
    newLocation.x = limits.right;
  } else if(pageX > limits.left) {
    newLocation.x = pageX;
  }
  if(pageY > limits.bottom) {
    newLocation.y = limits.bottom;
  } else if(pageY > limits.top) {
    newLocation.y = pageY;
  } 
    
  draggableAnchor.style.left = newLocation.x - shiftX + 'px';
  draggableAnchor.style.top = newLocation.y - shiftY + 'px';
});

socket.on('onmouseup', function(j, i, dropElemClass) {
  if(successMouseUp > 0) {
    dropElem = false;
  }
  else if(dropElemClass){
    dropElem = document.querySelector('.'+dropElemClass);
  }
  else {
    dropElem = false;
      //old = null;
  }

  if(dropElem) {
    dropElem.textContent = parseInt(dropElem.textContent) + parseInt(span.textContent);
    td[i].removeChild(draggableAnchor);
    board[j][i] = 0;
    piece_toggled = false;
    if(double_jump) {
      piece_toggled = true;
      jumpConcatenate = true;
      var trueArray = [];
      for(var o = 0; o < dropElemClass.length; o++)
        trueArray[o] = dropElemClass[o];
      var ik = parseInt(trueArray[5]);
      var jk = parseInt(trueArray[6]);
      if(selected.x != ik && selected.y != jk) {
        socket.emit('toggle', NumCheckers.gameId, j, i, NumCheckers.turn);
      } 
    }
    successMouseUp++;
    myPieceCounter--;
  } else {
    if(old) {
      td[i].removeChild(old.oldSibling.parentNode);
      old.parent.insertBefore(draggableAnchor, old.nextSibling);
      draggableAnchor.style.position = old.position;
      draggableAnchor.style.left = old.left;
      draggableAnchor.style.top = old.top;
      draggableAnchor.style.zIndex = old.zIndex
    }
  }
  old = null;  
 });

function renderBoard() {
  var tableElement, trElement;
  var count1, count2;
  count1 = 0;
  count2 = randoms.length-1;
  tableElement = tableTemplate.cloneNode(true);

  for(var i = 0; i < 8; i++) {
    trElement = tabletrTemplate.cloneNode(true);
    for(var j = 0; j < 8; j++) {
      anchorElement = tableanchorTemplate.cloneNode(true);
      spanElement = tablespanTemplate.cloneNode(true);
      spanElement.querySelector(".table__span").classList.add("space"+j+""+i);
      if (board[j][i]==1) {
        spanElement.querySelector(".table__span").style.backgroundColor = "rgb(100, 174, 86)";
        spanElement.querySelector(".table__span").textContent = randoms[count1];
        count1++;
      }
      else if (board[j][i]==-1) {
        spanElement.querySelector(".table__span").style.backgroundColor = "rgb(194, 51, 35)";
        spanElement.querySelector(".table__span").textContent = randoms[count2];
        count2--;
      }
      else if (moveable_space(i,j)) {
        spanElement.querySelector(".table__span").style.backgroundColor = "black";
      }
      else {
        anchorElement.querySelector(".table__anchor").classList.add("droppable");
        spanElement.querySelector(".table__span").style.backgroundColor = "rgba(174, 167, 86, 0.43)";
        spanElement.querySelector(".table__span").style.border = '1px solid rgba(174, 167, 86, 0.43)';
      }
      if (moveable_space(i, j)) {
        trElement.querySelector(".table__td").appendChild(spanElement);
      } 
      else {
        anchorElement.querySelector(".table__anchor").classList.add("droppable");
         anchorElement.querySelector(".table__anchor").setAttribute("onclick", "event.preventDefault(); clicked("+j+","+i+")");
         anchorElement.querySelector(".table__anchor").setAttribute("onmousedown", "event.preventDefault(); onMouseDown(event,"+j+","+i+")");
         anchorElement.querySelector(".table__anchor").setAttribute("ondragstart", "event.preventDefault(); onDragStart()"); 
        anchorElement.querySelector(".table__anchor").appendChild(spanElement);
        trElement.querySelector(".table__td").appendChild(anchorElement);
      }
    }
    tableElement.querySelector(".table").appendChild(trElement);

  }
  gameContainer.appendChild(tableElement);
}



socket.on('toggle', function(i, j, turn) {
  toggle(i,j,turn);
});

socket.on('step', function(selected, coords, barrier, swaping, remove, c_double_jump, turn) {
  moved = move(selected, coords, barrier, swaping, remove, c_double_jump, turn);

  var check_moving_player = check_moving('red');
  var check_moving_you = check_moving('green');
  var check_moving_players = coord(check_moving_player, check_moving_you);

  win = checkWinner(check_moving_players);

  if(moved && !game_over(win, turn) && !double_jump) {
    message("");
    NumCheckers.my_turn = (turn != NumCheckers.turn);
    if(NumCheckers.my_turn) {
      message("Okay, it's your turn!");
    }
  }
});


function checkWinner(moves) {
  var player, you, gameOver, check_moving_player, check_moving_you, winner = false;
  check_moving_player = moves.x;
  check_moving_you = moves.y;
  player = you = false;
  for(var i=0;i<8;i++) {
    for(var j=0;j<8;j++) {
      if(integ(board[i][j]) == -1 && check_moving_player != 0) player = true;
      if(integ(board[i][j]) == 1 && check_moving_you != 0) you = true;
    }
  }
  gameOver = (!player||!you)
  if(gameOver) {
      if(!player) winner = 'green';
      else if(!you) winner = 'red';
  }
  return winner;
}

function integ(num) {
 if (num != null)
  return Math.round(num);
 else
  return null;
}

function moveable_space(i,j) {
 // calculates whether it is a gray (moveable)
 // or black (non-moveable) space
 return (((j%2)+i)%2 == 0);
}

function toggle(x,y,turn) {
  if (piece_toggled && !jumpConcatenate) {
    if(turn == 'green') {
      draw(selected.x,selected.y, (board[selected.x][selected.y]==1.1)?"rgb(35, 194, 91)":"rgb(100, 174, 86)");
    } 
    else if(turn == 'red'){
      draw(selected.x,selected.y, (board[selected.x][selected.y]==-1.1)?"rgb(174, 86, 86)":"rgb(194, 51, 35)");
    }
  }

  if (piece_toggled && (selected.x == x) && (selected.y == y)) {
    piece_toggled = false;
    if (double_jump) { 
      NumCheckers.my_turn = (turn != NumCheckers.turn);
      double_jump = false; 
      check_double_jump = false;
      message("");
      if(NumCheckers.my_turn) {
        message("Okay, it's your turn!");
      }
    } 
  } else { 
    if(!double_jump && !jumpConcatenate) {
      piece_toggled = true;
      if(turn == 'green')
        draw(x,y,"#aeab56");
      else if(turn == 'red')
        draw(x,y,"#c22365");
    }
  }
  selected = coord(x,y);
}

function draw(x,y,name, notext=false) {
 document.querySelector(".space"+x+""+y).style.backgroundColor = name;
 if(notext) {
  document.querySelector(".space"+x+""+y).textContent = "";
  document.querySelector(".space"+x+""+y).style.borderColor = name;
 }
}

function abs(num) {
 return Math.abs(num);
}

function sign(num) {
 if (num < 0) return -1;
 else if(num > 0) return 1;
}

function legal_move(from,to, turn) {
  if (((to.x < 0) || (to.y < 0) || (to.x > 7) || (to.y > 7))) return false;
  piece = board[from.x][from.y];
  distance = coord(to.x-from.x,to.y-from.y);
 
  if(NumCheckers.my_turn && abs(distance.x) >= 2 && ((bar.barrier && bar.myFigureContent < bar.enemyBarrierContent) ||
  (bar.enemyBarrierCount > 1) || bar.myBarrierCount > 1) ) {
    return false;
  } 

  if ((distance.x == 0) || (distance.y == 0)) {
    return false;
  } 

  if (abs(distance.x) != abs(distance.y)) {
    return false;
  }

  if (abs(distance.x) > 2 && (integ(piece) == piece)) {
    return false;
  }

  if ((abs(distance.x) == 1) && double_jump) {
    return false;
  }

  if ((board[to.x][to.y] != 0) || (piece == 0)) {
    return false;
  }

  if ((abs(distance.x) == 2) && (integ(piece) == piece) &&
        (integ(piece) != -integ(board[from.x+sign(distance.x)][from.y+sign(distance.y)]))) {
    return false;
  }

  if((abs(distance.x) >= 2) && (bar.enemyBarrierCount != 1) && (check_double_jump)) {
    return false;
  } 

  if((abs(distance.x) >= 2) && integ(piece) != piece && bar.myBarrierCount != 0) {
    return false;
  }

  if ((integ(piece) == piece) && (sign(piece) != sign(distance.y)) &&
      (abs(distance.x) != 2)) {
    return false;
  }
return true;
}

function check_move(from, to, turn) {
  if (legal_move(from,to, turn)) {
    piece = board[from.x][from.y];
    distance = coord(to.x-from.x,to.y-from.y); 
    barrier = barrierFromTo(from,to,turn);
    dummyBar = bar;
    if (((abs(distance.x) == 1) || ((abs(distance.x) >= 2) && integ(piece) != piece && !barrier.barrier)) && ((board[to.x][to.y] == 0)) ) {
      swaping = true;
      remove = false;
    } 
    else if (((abs(distance.x) == 2) || ((abs(distance.x) >= 2) && integ(piece) != piece)) && barrier.enemyBarrierCount == 1 &&
      barrier.myBarrierCount == 0 ) {
      myFigureContent = barrier.myFigureContent;
      enemyBarrierContent = barrier.enemyBarrierContent;
      if(myFigureContent >= enemyBarrierContent) {
        swaping = true;
        remove = true;
        board[to.x][to.y] = board[from.x][from.y];
        if(doubleJumping(to, distance, turn)) {
          c_double_jump = true;
        }
        else c_double_jump = false;
        board[to.x][to.y] = 0;
      }
    }
    else {
      swaping = remove = false;
    }
    return true;  
  }
  return false;
}

function move(from, to, barrier, swaping, remove, c_double_jump, turn) {  
  if (legal_move(from,to, turn)) {
    c_double_jump = c_double_jump;
    swaping = swaping;
    remove = remove;
    successMouseUp = 0;
    piece = board[from.x][from.y]; 
    distance = coord(to.x-from.x,to.y-from.y);

    if (swaping && !remove) {
      swap(from,to); 
    } 

    else if (swaping && remove) {
      double_jump = false;
      myFigureContent = barrier.myFigureContent;
      enemyBarrierContent = barrier.enemyBarrierContent;
      document.querySelector(".space"+from.x+from.y).textContent = myFigureContent+enemyBarrierContent;
      swap(from,to);
      toRemove(barrier.enemyBarrier.x, barrier.enemyBarrier.y);

      if(c_double_jump) {
        double_jump = true;
        if(NumCheckers.my_turn)
          message("You may complete the double jump or click on your figure to stay still.");
      }
    }
    if ((board[to.x][to.y] == 1) && (to.y == 7) && turn == 'green' ||
      (board[to.x][to.y] == -1) && (to.y == 0) && turn == 'red') king_me(to.x,to.y);
    selected = to;
    if (!double_jump ) {
      toggle(to.x, to.y, turn);

      double_jump = false;
      check_double_jump=false;
      return true;
    }
  }
  return false;
}

function barrierFromTo(from, to, turn) {
  var dist = coord(to.x-from.x,to.y-from.y); 
  var my; var enemy; var barrier = false;
  var enemyBarrierCount = 0; var myBarrierCount = 0;
  var enemyBarrierContent = false; 
  var myFigureContent;
  for(var i = 1; i < abs(dist.x); i++) {
    if(turn == 'green') {
      if(integ(board[from.x+i*sign(dist.x)][from.y + i*sign(dist.y)]) != 0) {
        if(integ(board[from.x+i*sign(dist.x)][from.y + i*sign(dist.y)]) == 1) {
          my = coord((from.x+i*sign(dist.x)), (from.y + i*sign(dist.y)));
          myBarrierCount++;
        }
        else if(integ(board[from.x+i*sign(dist.x)][from.y + i*sign(dist.y)]) == -1) {
          enemy = coord((from.x+i*sign(dist.x)), (from.y + i*sign(dist.y)));
          enemyBarrierCount++;
        }
        barrier = true;
      }
    } else if(turn == 'red') {
      if(integ(board[from.x+i*sign(dist.x)][from.y + i*sign(dist.y)]) != 0) {
        if(integ(board[from.x+i*sign(dist.x)][from.y + i*sign(dist.y)]) == 1) {
          enemy = coord((from.x+i*sign(dist.x)), (from.y + i*sign(dist.y)));
          enemyBarrierCount++;
        }
        else if(integ(board[from.x+i*sign(dist.x)][from.y + i*sign(dist.y)]) == -1) {
          my = coord((from.x+i*sign(dist.x)), (from.y + i*sign(dist.y)));
          myBarrierCount++;
        }
        barrier = true;
      }
    }
  }
  myFigureContent = parseInt(document.querySelector(".space"+from.x+from.y).textContent);
  if(barrier && myBarrierCount == 0 && enemyBarrierCount != 0)
    enemyBarrierContent = parseInt(document.querySelector(".space"+enemy.x+enemy.y).textContent);
  return {barrier:barrier, 
          myBarrier:my, 
          enemyBarrier:enemy, 
          enemyBarrierCount:enemyBarrierCount, 
          myBarrierCount:myBarrierCount,
          enemyBarrierContent:enemyBarrierContent,
          myFigureContent:myFigureContent};
}

function doubleJumping(to, distance, turn) {
  check_double_jump = true;
  var checkCoord;
  var piece;
  if(turn == 'green')
    piece = -1;
  else if(turn == 'red')
    piece = 1;
  for(var i = 1; i < 8; i++) {
    checkCoord = coord((to.x+i*sign(distance.x)+sign(distance.x)),(to.y+i*sign(distance.y)+sign(distance.y)));
    if(checkCoord.x>=0 && checkCoord.y>=0 && checkCoord.x<=7 && checkCoord.y<=7) {
      if(integ(board[to.x+i*sign(distance.x)][to.y + i*sign(distance.y)]) == piece) {
        bar = barrierFromTo(to, coord((to.x+i*sign(distance.x)+sign(distance.x)),(to.y + i*sign(distance.y) + sign(distance.y))),NumCheckers.turn);
        if(legal_move(to, coord((to.x+i*sign(distance.x)+sign(distance.x)),(to.y + i*sign(distance.y) + sign(distance.y))),turn)){
          return true;
        } else {
          bar = dummyBar;
        }
      }
    }
    checkCoord = coord((to.x+i*sign(distance.x)+sign(distance.x)),(to.y-i*sign(distance.y)-sign(distance.y)));
    if(checkCoord.x>=0 && checkCoord.y>=0 && checkCoord.x<=7 && checkCoord.y<=7) {
      if(integ(board[to.x+i*sign(distance.x)][to.y - i*sign(distance.y)]) == piece) {
        bar = barrierFromTo(to, coord((to.x+i*sign(distance.x)+sign(distance.x)),(to.y - i*sign(distance.y) - sign(distance.y))), NumCheckers.turn);
        if(legal_move(to, coord((to.x+i*sign(distance.x)+sign(distance.x)),(to.y - i*sign(distance.y) - sign(distance.y))), turn)){
          return true;
        } else {
          bar = dummyBar;
        }
      }
    }
    checkCoord = coord((to.x-i*sign(distance.x)-sign(distance.x)),(to.y+i*sign(distance.y)+sign(distance.y)));
    if(checkCoord.x>=0 && checkCoord.y>=0 && checkCoord.x<=7 && checkCoord.y<=7) {
      if(integ(board[to.x-i*sign(distance.x)][to.y + i*sign(distance.y)]) == piece) {
        bar = barrierFromTo(to, coord((to.x-i*sign(distance.x)-sign(distance.x)),(to.y + i*sign(distance.y) + sign(distance.y))), NumCheckers.turn);
        if(legal_move(to, coord((to.x-i*sign(distance.x)-sign(distance.x)),(to.y + i*sign(distance.y) + sign(distance.y))), turn)){
          return true;
        } else {
          bar = dummyBar;
        }
      }
    }
  }

  check_double_jump=false;
  return false;
}

function king_me(x,y) {
 if (board[x][y] == 1) {
  board[x][y] = 1.1; // king you
  draw(x,y,"rgb(35, 194, 91)");
 } else if (board[x][y] == -1) {
  board[x][y] = -1.1; // king me
  draw(x,y,"rgb(174, 86, 86)");
 }
}

function swap(from,to) {
  var numb = document.querySelector(".space"+from.x+""+from.y).textContent;
  var dummy_src = document.querySelector(".space"+to.x+""+to.y).style.backgroundColor;
  var dummy_border = document.querySelector(".space"+to.x+""+to.y).style.borderColor;
  var from_src = document.querySelector(".space"+from.x+""+from.y).style.backgroundColor;
  var from_border = document.querySelector(".space"+from.x+""+from.y).style.borderColor;
  var dummy_from_num = board[from.x][from.y];
  var dummy_to_num = board[to.x][to.y];
  document.querySelector(".space"+to.x+""+to.y).style.backgroundColor = from_src;
  document.querySelector(".space"+to.x+""+to.y).style.borderColor = from_border;
  document.querySelector(".space"+to.x+""+to.y).textContent=numb;
  document.querySelector(".space"+from.x+""+from.y).style.backgroundColor = dummy_src;
  document.querySelector(".space"+from.x+""+from.y).style.borderColor = dummy_border;
  document.querySelector(".space"+from.x+""+from.y).textContent = "";
  board[from.x][from.y] = dummy_to_num;
  board[to.x][to.y] = dummy_from_num;
}

function toRemove(x,y) {
 if (NumCheckers.my_turn || !NumCheckers.my_turn)
  draw(x,y,"rgba(174, 167, 86, 0.43)", true);
 if(integ(board[x][y]) == 1)
  myPieceCounter--;
 if(integ(board[x][y]) == -1)
  compCount--;
 board[x][y] = 0;
}

function Result(val) {
 this.high = val;
 this.dir = new Array();
}

function toFindMaxPiece(x, y, turn) {
  var index = [];
  var max = 0;
  var maxPiece;
  var k = -1; var j = 1;

  for(var i = 0; i < 4; i++) {
    k = (-1) * k;
    j = j * k;
    var compPiece = document.querySelector(".space" + (x-k*1) + (y-j*1));
    if(compPiece) {
      if((compPiece.style.backgroundColor == ((turn=='red')?'rgb(194, 51, 35)':'rgb(100, 174, 86)')) ||
        (compPiece.style.backgroundColor == ((turn=='red')?'rgb(174, 86, 86)':'rgb(35, 194, 91)'))) { //rgb(35, 194, 91)
        var content = parseInt(compPiece.textContent);
        if(content>max) {
          max = content;
          maxPiece = compPiece;
          index[0] = x-k*1;
          index[1] = y-j*1;
        }
      }
    }
  }
  return {max: max, index: index, maxPiece: maxPiece};
}

function check_moving(turn) {
  var myFigureContent, enemyBarrierContent, maxFig;
  var moving = 0;
  var movingSimple = 0;
  var movingKing = 0;
  var piece = (turn == 'green')?1:-1; 
  for(var i = 0; i < 8; i++) {
    for(var j = 0; j < 8; j++) {
      if(integ(board[i][j]) == piece) {
        maxFig = toFindMaxPiece(i, j, turn);
        if(maxFig.max != 0) {
          movingSimple++;
          movingKing++;
        }
        if(board[i+1][j+1*piece] == 0 || board[i-1][j+1*piece] == 0) {
          movingSimple++;
          movingKing++;
        }
        if(board[i+2][j+2*piece] == 0) {
          myFigureContent = barrierFromTo(coord(i,j),coord(i+2,j+2*piece),turn).myFigureContent;
          enemyBarrierContent = barrierFromTo(coord(i,j),coord(i+2,j+2*piece),turn).enemyBarrierContent;
          if(myFigureContent >= enemyBarrierContent) {
            movingSimple++;
            movingKing++;
          }
        }
        if(board[i-2][j+2*piece] == 0) {
          myFigureContent = barrierFromTo(coord(i,j),coord(i-2,j+2*piece),turn).myFigureContent;
          enemyBarrierContent = barrierFromTo(coord(i,j),coord(i-2,j+2*piece),turn).enemyBarrierContent;
          if(myFigureContent >= enemyBarrierContent) {
            movingSimple++;
            movingKing++;
          }
        }
      }
      if(board[i][j] == piece*1.1) {
        if(board[i+1][j-1] == 0 || board[i-1][j-1] == 0)
          movingKing++;
        if(board[i+2][j-2*piece] == 0) {
          myFigureContent = barrierFromTo(coord(i,j),coord(i+2,j-2*piece),turn).myFigureContent;
          enemyBarrierContent = barrierFromTo(coord(i,j),coord(i+2,j-2*piece),turn).enemyBarrierContent;
          if(myFigureContent >= enemyBarrierContent) {
            movingKing++;
          }
        }
        if(board[i-2][j-2*piece] == 0) {
          myFigureContent = barrierFromTo(coord(i,j),coord(i-2,j-2*piece),turn).myFigureContent;
          enemyBarrierContent = barrierFromTo(coord(i,j),coord(i-2,j-2*piece),turn).enemyBarrierContent;
          if(myFigureContent >= enemyBarrierContent) {
            movingKing++;
          }
        }
    }
    }
  }
  moving = movingSimple + movingKing;
  return moving;
}

function game_over(win, turn) { // make sure game is not over (return false if game is over)
 if(win) {
  if(NumCheckers.my_turn) {
    if(win == NumCheckers.turn)
      message("Congratulations! You won.");
    else if(win != NumCheckers.turn)
      message("Opponent won.");
  }
  else if(!NumCheckers.my_turn) {
    if(win == NumCheckers.turn)
      message("Congratulations! You won.");
    else if(win != NumCheckers.turn)
      message("Opponent won.");
  }
  NumCheckers.endGame();
  return true;
  }
 
 return false;
}

// multiplayerButton.addEventListener('click', function(evt) {
//   evt.preventDefault();
// });
}
//});