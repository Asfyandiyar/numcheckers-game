if(modeStorage == 'single') {

message('Click the "Start game" button to start a singleplayer.');

startButton.addEventListener('click', function(evt) {
  evt.preventDefault();
  startButton.parentNode.classList.add('hidden');
  if(!isStarted) {
    renderBoard();
    my_turn = true;
    table = gameContainer.querySelector(".table");
    td = table.querySelectorAll(".table__td");
    message("You may begin! Select a green figure to move.");
  }
  isStarted = true;
});

restartButton.addEventListener('click', function(evt) {
  evt.preventDefault();
  restartButton.parentNode.classList.add('hidden');
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
  my_turn = true;
  comp = you = false;
  game_is_over = false;
  ram = false;
  ramMy = true;
  concatenateCounter = 0;
  table = gameContainer.querySelector(".table");
  td = table.querySelectorAll(".table__td");
  message("You may begin! Select a green figure to move.");
});
  
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
var board;
Board(0,1,0,1,0,1,0,1,
      1,0,1,0,1,0,1,0,
      0,1,0,1,0,1,0,1,
      0,0,0,0,0,0,0,0,
      0,0,0,0,0,0,0,0,
      -1,0,-1,0,-1,0,-1,0,
      0,-1,0,-1,0,-1,0,-1,
      -1,0,-1,0,-1,0,-1,0);

function renderBoard() {
  var tableElement, trElement;
  tableElement = tableTemplate.cloneNode(true);
  
  for(var i = 0; i < 8; i++) {
    trElement = tabletrTemplate.cloneNode(true);
    for(var j = 0; j < 8; j++) {
      anchorElement = tableanchorTemplate.cloneNode(true);
      spanElement = tablespanTemplate.cloneNode(true);
      random = integ(Math.random()*10+1);
      spanElement.querySelector(".table__span").classList.add("space"+j+""+i);
      if (board[j][i]==1) {
        spanElement.querySelector(".table__span").style.backgroundColor = "rgb(100, 174, 86)";
        spanElement.querySelector(".table__span").textContent = random;
        randoms.push(random);
      }
      else if (board[j][i]==-1) {
        count=randoms.length-1;
        spanElement.querySelector(".table__span").style.backgroundColor = "rgb(194, 51, 35)";
        spanElement.querySelector(".table__span").textContent = randoms[count];
        randoms.splice(count,1);
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
        anchorElement.querySelector(".table__anchor").setAttribute("ondragstart", "event.preventDefault(); function(){return false;}"); 
        anchorElement.querySelector(".table__anchor").appendChild(spanElement);
        trElement.querySelector(".table__td").appendChild(anchorElement);
      }
    }
    tableElement.querySelector(".table").appendChild(trElement);
  }

  gameContainer.appendChild(tableElement);
}

var dragObject = {};

function onMouseDown(e,j,i) {

  if((board[j][i] == 1 || board[j][i] == 1.1) && isStarted && !game_is_over) {
    if(e.which != 1) {
      return;
    }
    anchorElement = tableanchorTemplate.cloneNode(true);
    anchorElement.querySelector(".table__anchor").classList.add("droppable");
         anchorElement.querySelector(".table__anchor").setAttribute("onclick", "event.preventDefault(); clicked("+j+","+i+")");
    anchorElement.querySelector(".table__anchor").setAttribute("onmousedown", "event.preventDefault(); onMouseDown(event,"+j+","+i+")");
         anchorElement.querySelector(".table__anchor").setAttribute("ondragstart", "event.preventDefault(); function(){return false;}");
    spanElement = tablespanTemplate.cloneNode(true);
    spanElement.querySelector(".table__span").classList.add("space"+j+""+i);
    spanElement.querySelector(".table__span").style.backgroundColor = "#aea7566e";
    spanElement.querySelector(".table__span").style.border = '1px solid #aea7566e';
    anchorElement.querySelector(".table__anchor").appendChild(spanElement);
    span = e.target;
    draggableAnchor = e.currentTarget;

    dragObject.elem = draggableAnchor;
    coords = getCoords(draggableAnchor);
    coordsTable = getCoords(table);
    shiftX = e.pageX - coords.left + coordsTable.left;
    shiftY = e.pageY - coords.top + coordsTable.top;

    dragObject.downX = e.pageX + coordsTable.left;
    dragObject.downY = e.pageY + coordsTable.top;

    var limits = {
      top: table.offsetTop,
      right: table.offsetWidth + table.offsetLeft,
      bottom: table.offsetHeight + table.offsetTop,
      left: table.offsetLeft
    };

    moveAt(e);

    function moveAt(e) {
      var newLocation = {
        x: limits.left,
        y: limits.top
      };

      if(e.pageX > limits.right) {
        newLocation.x = limits.right;
      } else if(e.pageX > limits.left) {
        newLocation.x = e.pageX;
      } 
      if(e.pageY > limits.bottom) {
        newLocation.y = limits.bottom;
      } else if(e.pageY > limits.top) {
        newLocation.y = e.pageY;
      } 

      draggableAnchor.style.left = newLocation.x - shiftX + 'px';
      draggableAnchor.style.top = newLocation.y - shiftY + 'px';
    }

    var spanAfter = td[i].querySelector(".space"+(j+1)+i);

    document.onmousemove = function(e) {
      if(!dragObject.elem) return;
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
      moveAt(e);
    }

    document.onmouseup = function(e) {
      if(successMouseUp > 0) 
        dropElem = false;
      else if(dragObject.elem)
        dropElem = findDroppable(e);

      if(dropElem) {
        dropElem.textContent = parseInt(dropElem.textContent) + parseInt(span.textContent);
        dropElemClass = dropElem.classList[1];
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
          if(my_turn && selected.x != ik && selected.y != jk) {
            toggle(j,i);
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
      dragObject = {};
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
      elem.style.backgroundColor == "rgba(174, 167, 86, 0.43)" || elem.style.backgroundColor == "rgb(194, 51, 35)" || 
      elem.style.backgroundColor == "rgb(174, 86, 86)" || centerS > 75 
      ) {
      return false;
    }
    return elem;
  }
}

function getCoords(elem) { 
  var box = elem.getBoundingClientRect();
  return {
    top: box.top + pageYOffset,
    left: box.left + pageXOffset
  };
}

function clicked(i,j) { 
  if (my_turn && !game_is_over) {
    jumpConcatenate = false;
    if (integ(board[i][j])==1) toggle(i,j); 
    else if (piece_toggled) move(selected,coord(i,j));
    else message("First click one of your green figures, then click where you want to move it");
  } else if(game_is_over) {
    message('Game over. Click the "Restart" button to start a new game.');
  } else {
    if(isStarted)
      message("It's not your turn yet. Hang on a sec!");
  }
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

// function message(str) {
//   if (!game_is_over) {
//     paragraph.textContent = str;
//   }
// }

function Coord(x,y) {
 this.x = x;
 this.y = y;
}

function coord(x,y) {
 c = new Coord(x,y);
 return c;
}

function toggle(x,y) {
  if (my_turn) {
    if (piece_toggled && !jumpConcatenate) {
      draw(selected.x,selected.y, (board[selected.x][selected.y]==1.1)?"rgb(35, 194, 91)":"rgb(100, 174, 86)");
    }
  
    if (piece_toggled && (selected.x == x) && (selected.y == y)) {
      piece_toggled = false;
      if (double_jump) { 
        my_turn = double_jump = check_double_jump = false;
        message(""); 
        computer(); 
      }
    } else {
      if(!double_jump && !jumpConcatenate) {
        piece_toggled = true;
        draw(x,y,"#aeab56");
      }
    }
    selected = coord(x,y); 
  } else { 
    if ((piece_toggled) && (integ(board[selected_c.x][selected_c.y])==-1)) //если компьютер выбрал ход, в обшем, всё то же самое
      draw(selected_c.x,selected_c.y,(board[selected_c.x][selected_c.y]==-1.1)?"rgb(174, 86, 86)":"rgb(194, 51, 35)");
    if (piece_toggled && (selected_c.x == x) && (selected_c.y == y)) {
      piece_toggled = false;
    } else {
      piece_toggled = true;
      draw(x,y,"#c22365");
    }
    selected_c = coord(x,y);
  }
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

function legal_move(from,to) {
  if (((to.x < 0) || (to.y < 0) || (to.x > 7) || (to.y > 7))) return false;
  piece = board[from.x][from.y];
  distance = coord(to.x-from.x,to.y-from.y);
  barrier = barrierFromTo(from,to);

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

  if((abs(distance.x) >= 2) && (barrier.enemyBarrierCount != 1) && check_double_jump) {
    return false;
  }

  if ((integ(piece) == piece) && (sign(piece) != sign(distance.y)) &&
      (abs(distance.x) != 2)) {
    return false;
  }

  if(!my_turn && (abs(distance.x) >= 2) && barrier.enemyBarrierCount != 0) {
    return false;
  }

  if(safe_jump.length > 0 && comp_move && (abs(distance.x) >= 2)) {
    for(var i = 0; i < safe_jump.length; i++) {
      if(to.x==safe_jump[i].x && to.y==safe_jump[i].y) {
        return false;
      }
    }
  }
  
  return true;
}

function move(from,to) {
  my_turn = true;
  concatenateCounter = 0;
  if (legal_move(from,to)) {
    safe_jump = [];
    distanceMoveCount = 0;
    jumpCounter = 0;
    successMouseUp = 0;
    piece = board[from.x][from.y]; // текущее  место
    distance = coord(to.x-from.x,to.y-from.y); //место, куда надо переместиться
    barrier = barrierFromTo(from,to);
    if (((abs(distance.x) == 1) || ((abs(distance.x) >= 2) && integ(piece) != piece && !barrier.barrier)) && ((board[to.x][to.y] == 0)) ) {  //если перемещение происходит без уничтожения противника
      swap(from,to); 
    } 
    else if (((abs(distance.x) == 2) || ((abs(distance.x) >= 2) && integ(piece) != piece)) && barrier.enemyBarrierCount == 1 &&
            barrier.myBarrierCount == 0 ) {
      var myFigure = document.querySelector(".space"+from.x+from.y);
      var myFigureContent = parseInt(myFigure.textContent);
      var enemyBarrier = document.querySelector(".space"+barrier.enemyBarrier.x+barrier.enemyBarrier.y);
      var enemyBarrierContent = parseInt(enemyBarrier.textContent);
      if(myFigureContent >= enemyBarrierContent) {
        double_jump = false; 
        check_double_jump = false;
        myFigure.textContent = myFigureContent+enemyBarrierContent;
        swap(from,to);
        remove(barrier.enemyBarrier.x, barrier.enemyBarrier.y);
        if(doubleJumping(to, distance, -1)) {
          double_jump = true;
          message("You may complete the double jump or click on your figure to stay still.");
        }
      } else {
        to.x = null; to.y = null;
      }
    } else {
      to.x = null; to.y = null;
    }

    if(to.x != null && to.y != null) {
      if ((board[to.x][to.y] == 1) && (to.y == 7)) king_me(to.x,to.y);
      selected = to;
      if (game_over() && !double_jump) {
        toggle(to.x, to.y);
        check_double_jump = false;
        my_turn = double_jump = false;
        setTimeout("computer();",100);
      }
    }
  }

  return true;
}

function barrierFromTo(from, to) {
  var dist = coord(to.x-from.x,to.y-from.y); 
  var my; var enemy; var barrier = false;
  var enemyBarrierCount = 0; var myBarrierCount = 0;
  for(var i = 1; i < abs(dist.x); i++) {
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
  }
  return {barrier:barrier, 
          myBarrier:my, 
          enemyBarrier:enemy, 
          enemyBarrierCount:enemyBarrierCount, 
          myBarrierCount:myBarrierCount};
}

function doubleJumping(to, distance, p) {
  check_double_jump = true;
  var checkCoord;
  var piece = p;
  for(var i = 1; i < 8; i++) {
    checkCoord = coord((to.x+i*sign(distance.x)+sign(distance.x)),(to.y+i*sign(distance.y)+sign(distance.y)));
    if(checkCoord.x>=0 && checkCoord.y>=0 && checkCoord.x<=7 && checkCoord.y<=7) {
      if(integ(board[to.x+i*sign(distance.x)][to.y + i*sign(distance.y)]) == piece) {
        if(legal_move(to, coord((to.x+i*sign(distance.x)+sign(distance.x)),(to.y + i*sign(distance.y) + sign(distance.y))))){
          return true;
        }
      }
    }
    checkCoord = coord((to.x+i*sign(distance.x)+sign(distance.x)),(to.y-i*sign(distance.y)-sign(distance.y)));
    if(checkCoord.x>=0 && checkCoord.y>=0 && checkCoord.x<=7 && checkCoord.y<=7) {
      if(integ(board[to.x+i*sign(distance.x)][to.y - i*sign(distance.y)]) == piece) {
        if(legal_move(to, coord((to.x+i*sign(distance.x)+sign(distance.x)),(to.y - i*sign(distance.y) - sign(distance.y))))){
          return true;
        }
      }
    }
    checkCoord = coord((to.x-i*sign(distance.x)-sign(distance.x)),(to.y+i*sign(distance.y)+sign(distance.y)));
    if(checkCoord.x>=0 && checkCoord.y>=0 && checkCoord.x<=7 && checkCoord.y<=7) {
      if(integ(board[to.x-i*sign(distance.x)][to.y + i*sign(distance.y)]) == piece) {
        if(legal_move(to, coord((to.x-i*sign(distance.x)-sign(distance.x)),(to.y + i*sign(distance.y) + sign(distance.y))))){
          return true;
        }
      }
    }
  }
  check_double_jump = false;
  return false;
}

function king_me(x,y) {
  if (board[x][y] == 1) {
    board[x][y] = 1.1;
    draw(x,y,"rgb(35, 194, 91)");
  } else if (board[x][y] == -1) {
    board[x][y] = -1.1; 
    draw(x,y,"rgb(174, 86, 86)");
  }
}

function swap(from,to) {
  if (my_turn || comp_move) { 
    var numb = document.querySelector(".space"+from.x+""+from.y).textContent;
    dummy_src = document.querySelector(".space"+to.x+""+to.y).style.backgroundColor;
    dummy_border = document.querySelector(".space"+to.x+""+to.y).style.borderColor;
    document.querySelector(".space"+to.x+""+to.y).style.backgroundColor = document.querySelector(".space"+from.x+""+from.y).style.backgroundColor;
    document.querySelector(".space"+to.x+""+to.y).style.borderColor = document.querySelector(".space"+from.x+""+from.y).style.borderColor;
    document.querySelector(".space"+to.x+""+to.y).textContent=numb;
    document.querySelector(".space"+from.x+""+from.y).style.backgroundColor = dummy_src;
    document.querySelector(".space"+from.x+""+from.y).style.borderColor = dummy_border;
    document.querySelector(".space"+from.x+""+from.y).textContent = "";
  }
  dummy_num = board[from.x][from.y];
  board[from.x][from.y] = board[to.x][to.y];
  board[to.x][to.y] = dummy_num;
}

function remove(x,y) {
  if (my_turn || comp_move)
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

function move_comp(from,to) {
  var maxPiece;
  comp_move = true;
  ram = false;
  piece = board[from.x][from.y];
  distance = coord(to.x-from.x,to.y-from.y);
  barrier = barrierFromTo(from,to);

  if(abs(from.x-to.x) < 2) {
    toggle(from.x,from.y);
    swap(from,to);
    jumpCounter++;
  }
  else if((abs(distance.x) >= 2) && (integ(piece) != piece) && !barrier.barrier && distanceMoveCount < 1) {
    toggle(from.x,from.y);
    swap(from,to);
    distanceMoveCount++;
    jumpCounter++;
  }
  else if (((abs(distance.x) == 2) || ((abs(distance.x) >= 2) && (integ(piece) != piece))) && barrier.enemyBarrierCount == 0 &&
            barrier.myBarrierCount == 1) {

    var myFigure = document.querySelector(".space"+barrier.myBarrier.x+barrier.myBarrier.y);
    var myFigureContent = parseInt(myFigure.textContent);
    var enemyBarrier = document.querySelector(".space"+from.x+from.y);
    var enemyBarrierContent = parseInt(enemyBarrier.textContent);

    if(enemyBarrierContent >= myFigureContent) {
      toggle(from.x,from.y);
      enemyBarrier.textContent = enemyBarrierContent + myFigureContent;
      swap(from,to);
      remove(barrier.myBarrier.x, barrier.myBarrier.y);
      distanceMoveCount++;
    } 
    else if(enemyBarrierContent < myFigureContent) {
      maxPiece = toFindMaxPiece(from.x, from.y, 'red');
      if((maxPiece.max + enemyBarrierContent >= myFigureContent) && concatenateCounter < 1) {
        enemyBarrier.textContent = maxPiece.max + enemyBarrierContent;
        concatenateCounter++;
        toggle(from.x,from.y);
        enemyBarrier.textContent = enemyBarrierContent + myFigureContent;
        swap(from,to);
        remove(barrier.myBarrier.x, barrier.myBarrier.y);
        if(maxPiece.index.length > 0)
          remove(maxPiece.index[0], maxPiece.index[1]);
        distanceMoveCount++;
      } else {
        safe_jump.push(coord(to.x, to.y));
        to.x = null; to.y = null;
        if(maxPiece.maxPiece && concatenateCounter < 1) {   
          maxPiece.maxPiece.textContent = maxPiece.max + enemyBarrierContent;
          concatenateCounter++;
          remove(from.x, from.y);
        } 
        ram = true;
        if(distanceMoveCount == 0)
          computer();
      }
    } 
  }

  if(check_moving('green') < 1) {
    ramMy = false;
  }

  if(to.x != null && to.y != null) { 
    if ((board[to.x][to.y] == -1) && (to.y == 0)) king_me(to.x,to.y);
    selected_c = to;
    piece_toggled = true;
    setTimeout("my_turn = false; toggle("+to.x+","+to.y+");comp_move = false;",100);

    if (game_over()) {
      setTimeout("my_turn = true;togglers=0;",600);
      setTimeout(message("Ok. It's your turn. You may make your move."), 1000);
    }
  }

 return true;
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
        maxFig = toFindMaxPiece(i, j, 'green');
        if(maxFig.max != 0) {
          movingSimple++;
          movingKing++;
        }
        if(board[i+1][j+1*piece] == 0 || board[i-1][j+1*piece] == 0) {
          movingSimple++;
          movingKing++;
        }
        if(board[i+2][j+2*piece] == 0) {
          myFigureContent = barrierFromTo(coord(i,j),coord(i+2,j+2*piece)).myFigureContent;
          enemyBarrierContent = barrierFromTo(coord(i,j),coord(i+2,j+2*piece)).enemyBarrierContent;
          if(myFigureContent >= enemyBarrierContent) {
            movingSimple++;
            movingKing++;
          }
        }
        if(board[i-2][j+2*piece] == 0) {
          myFigureContent = barrierFromTo(coord(i,j),coord(i-2,j+2*piece)).myFigureContent;
          enemyBarrierContent = barrierFromTo(coord(i,j),coord(i-2,j+2*piece)).enemyBarrierContent;
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
          myFigureContent = barrierFromTo(coord(i,j),coord(i+2,j-2*piece)).myFigureContent;
          enemyBarrierContent = barrierFromTo(coord(i,j),coord(i+2,j-2*piece)).enemyBarrierContent;
          if(myFigureContent >= enemyBarrierContent) {
            movingKing++;
          }
        }
        if(board[i-2][j-2*piece] == 0) {
          myFigureContent = barrierFromTo(coord(i,j),coord(i-2,j-2*piece)).myFigureContent;
          enemyBarrierContent = barrierFromTo(coord(i,j),coord(i-2,j-2*piece)).enemyBarrierContent;
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

function game_over() { 
  comp = you = false;
  for(var i=0;i<8;i++) {
    for(var j=0;j<8;j++) {
      if(integ(board[i][j]) == -1) comp = true;
      if(integ(board[i][j]) == 1 && ramMy) you = true;
    }
  }
  if (!comp) {
    message('Congratulations! You won. Click the "Restart" button to start a new game.');
    restartButton.parentNode.classList.remove('hidden');
  }
  if (!you) {
    message('Computer won. Click the "Restart" button to start a new game.'); 
    restartButton.parentNode.classList.remove('hidden');
  }
  game_is_over = (!comp || !you)
  return (!game_is_over);
}

function computer() {
  if(moveComp)
    moveComp = false;
  if(!ram) {
    for(var j=0;j<8;j++) {
      for(var i=0;i<8;i++) {
        if (integ(board[i][j]) == 1) {
          if ((legal_move(coord(i,j),coord(i+2,j+2))) && (prevent(coord(i+2,j+2),coord(i+1,j+1)))) {
            return true;
          } if ((legal_move(coord(i,j),coord(i-2,j+2))) && (prevent(coord(i-2,j+2),coord(i-1,j+1)))) {
            return true;
          }
        } 
        if (board[i][j] == 1.1) {
          if ((legal_move(coord(i,j),coord(i-2,j-2))) && (prevent(coord(i-2,j-2),coord(i-1,j-1)))) {
            return true;
          } if ((legal_move(coord(i,j),coord(i+2,j-2))) && (prevent(coord(i+2,j-2),coord(i+1,j-1)))) {
            return true;
          }
        }
      }
    }
  }
  
  for(var j=7;j>=0;j--) {
    for(var i=0;i<8;i++) {
      if (jump(i,j)) {
        return true;
      }
    }
  }

  safe_from = null;
 
  for(var j=0;j<8;j++) {
    for(var i=0;i<8;i++) {
      if (single(i,j))
        return true;
    }
  }

  if (safe_from != null) {
    moveComp = move_comp(safe_from,safe_to);
  } else if((safe_from == null) || (ram && compCount < 2 && distanceMoveCount!=0)) {
    message('Congratulations! You won. Click the "Restart" button to start a new game.');
    game_is_over = true;
    restartButton.parentNode.classList.remove('hidden');
  }
  safe_from = safe_to = null;
  return false;
}

function jump(i,j) {
  if(i!=null&&j!=null&&jumpCounter < 1) {
    if (board[i][j] == -1.1) {
      var checkCoord1;
      var help;

      for(var k = 2; k < 8; k++) {
        checkCoord1 = coord((i+k), (j+k));
        if((checkCoord1.x>=0 && checkCoord1.y>=0 && checkCoord1.x<=7 && checkCoord1.y<=7)) {
          if (legal_move(coord(i,j), checkCoord1)) {
            continue;
          } else {
            help = coord(checkCoord1.x+1,checkCoord1.y+1);
            barrier = barrierFromTo(coord(i,j),help);
            if(barrier.enemyBarrierCount == 0 && barrier.myBarrierCount == 1) {
              if(legal_move(coord(i,j),help)) {
                move_comp(coord(i,j), help);
                setTimeout("jump("+help.x+","+help.y+");",500);
                return true;
              }
            }
          }
        }
      }

      for(var k = 1; k < 8; k++) {
        checkCoord1 = coord((i-k), (j+k));
        if((checkCoord1.x>=0 && checkCoord1.y>=0 && checkCoord1.x<=7 && checkCoord1.y<=7)) {
          if (legal_move(coord(i,j), checkCoord1)) {
            continue;
          } else {
            help = coord(checkCoord1.x-1,checkCoord1.y+1);
            barrier = barrierFromTo(coord(i,j),help);
            if(barrier.enemyBarrierCount == 0 && barrier.myBarrierCount == 1) {
              if(legal_move(coord(i,j),help)) {
                move_comp(coord(i,j), help);
                setTimeout("jump("+help.x+","+help.y+");",500);
                return true;
              }
            }
          }
        }
      }

      for(var k = 1; k < 8; k++) {
        checkCoord1 = coord((i-k), (j-k));
        if((checkCoord1.x>=0 && checkCoord1.y>=0 && checkCoord1.x<=7 && checkCoord1.y<=7)) {
          if (legal_move(coord(i,j), checkCoord1)) {
            continue;
          } else {
            help = coord(checkCoord1.x-1,checkCoord1.y-1);
            barrier = barrierFromTo(coord(i,j),help);
            if(barrier.enemyBarrierCount == 0 && barrier.myBarrierCount == 1) {
              if(legal_move(coord(i,j),help)) {
                move_comp(coord(i,j), help);
                setTimeout("jump("+help.x+","+help.y+");",500);
                return true;
              }
            }
          }
        }
      }

      for(var k = 1; k < 8; k++) {
        checkCoord1 = coord((i+k), (j-k));
        if((checkCoord1.x>=0 && checkCoord1.y>=0 && checkCoord1.x<=7 && checkCoord1.y<=7)) {
          if (legal_move(coord(i,j), checkCoord1)) {
            continue;
          } else {
            help = coord(checkCoord1.x+1,checkCoord1.y-1);
            barrier = barrierFromTo(coord(i,j),help);
            if(barrier.enemyBarrierCount == 0 &&
              barrier.myBarrierCount == 1) {
              if(legal_move(coord(i,j),help)) {
                move_comp(coord(i,j), help);
                setTimeout("jump("+help.x+","+help.y+");",500);
                return true;
              }
            }
          }
        }
      }
    }

    
    if (integ(board[i][j]) == -1) {
      if (legal_move(coord(i,j),coord(i-2,j-2))) {
        moveComp = move_comp(coord(i,j),coord(i-2,j-2));
        setTimeout("jump("+(i-2)+","+(j-2)+");",500);
        return true;
      } if (legal_move(coord(i,j),coord(i+2,j-2))) {
        moveComp = move_comp(coord(i,j),coord(i+2,j-2));
        setTimeout("jump("+(i+2)+","+(j-2)+");",500);
        return true;
      }
      if (legal_move(coord(i,j),coord(i+2,j+2))) {
        moveComp = move_comp(coord(i,j),coord(i+2,j+2));
        setTimeout("jump("+(i+2)+","+(j+2)+");",500);
        return true;
      } if (legal_move(coord(i,j),coord(i-2,j+2))) {
        moveComp = move_comp(coord(i,j),coord(i-2,j+2));
        setTimeout("jump("+(i-2)+","+(j+2)+");",500);
        return true;
      }
    }
  }

  return false;
}

function single(i,j) {
  
  if (board[i][j] == -1.1) {
    if (legal_move(coord(i,j),coord(i+1,j+1))) {
      safe_from = coord(i,j);
      safe_to = coord(i+1,j+1);
      if (wise(coord(i,j),coord(i+1,j+1))) {
        moveComp = move_comp(coord(i,j),coord(i+1,j+1));
        return true;
      }
    } 
    if (legal_move(coord(i,j),coord(i-1,j+1))) {
      safe_from = coord(i,j);
      safe_to = coord(i-1,j+1);
      if (wise(coord(i,j),coord(i-1,j+1))) {
        moveComp = move_comp(coord(i,j),coord(i-1,j+1));
        return true;
      }
    }
  } 

  if (integ(board[i][j]) == -1) {
    if (legal_move(coord(i,j),coord(i+1,j-1))) {
      safe_from = coord(i,j);
      safe_to = coord(i+1,j-1);
      if (wise(coord(i,j),coord(i+1,j-1))) {
        moveComp = move_comp(coord(i,j),coord(i+1,j-1));
        return true;
      }
    } 
    if (legal_move(coord(i,j),coord(i-1,j-1))) {
      safe_from = coord(i,j);
      safe_to = coord(i-1,j-1);
      if (wise(coord(i,j),coord(i-1,j-1))) {
        moveComp = move_comp(coord(i,j),coord(i-1,j-1));
        return true;
      }
    }
  }

 return false;
}

function possibilities(x,y) {
  if (!jump(x,y))
    if (!single(x,y))
      return true;
    else
      return false;
  else
    return false;
}

function prevent(end,s) {
  i = end.x;
  j = end.y;
  if (!possibilities(s.x,s.y))
    return true;
  else if ((integ(board[i-1][j+1])==-1) && (legal_move(coord(i-1,j+1),coord(i,j)))) {
    return move_comp(coord(i-1,j+1),coord(i,j));
  } else if ((integ(board[i+1][j+1])==-1) && (legal_move(coord(i+1,j+1),coord(i,j)))) {
    return move_comp(coord(i+1,j+1),coord(i,j));
  } else if ((board[i-1][j-1]==-1.1) && (legal_move(coord(i-1,j-1),coord(i,j)))) {
    return move_comp(coord(i-1,j-1),coord(i,j));
  } else if ((board[i+1][j-1]==-1.1) && (legal_move(coord(i+1,j-1),coord(i,j)))) {
    return move_comp(coord(i+1,j-1),coord(i,j));
  } else {
    return false;
  }
}

function wise(from,to) {
  var n, s, e, w, ne, nw, se, sw, i, j;
  i = to.x;
  j = to.y;
  n = (j>0);
  s = (j<7);
  e = (i<7);
  w = (i>0);
  if (n&&e) ne = board[i+1][j-1]; else ne = null;
  if (n&&w) nw = board[i-1][j-1]; else nw = null;
  if (s&&e) se = board[i+1][j+1]; else se = null;
  if (s&&w) sw = board[i-1][j+1]; else sw = null;
  eval(((j-from.y != 1)?"s":"n")+((i-from.x != 1)?"e":"w")+"=0;");
  if ((sw==0) && (integ(ne)==1)) return false;
  if ((se==0) && (integ(nw)==1)) return false;
  if ((nw==0) && (se==1.1)) return false;
  if ((ne==0) && (sw==1.1)) return false;
  return true;
}
}