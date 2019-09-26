// Объект коллекции всех игр, сердце мультиплеера, так же она единственная и главная экспортируемая функция модуля
var NumCheckers = module.exports = function() {
    // Массив id игры = объект игры
    this.games = [];
    // Массив подключённых пользователей = id игры
    this.users = [];
    // Массив пользователей ожидающих оппонентов для начало игры
    this.free = [];
}
// Объект игры, в нём индивидуальные настройки каждой игры
var GameItem = function(user, opponent) {
    // Ячейки игрового поля будут в виде объекта this.board[id игровой ячейки] = чем ходили
    //this.board = [[]];
    // Игроки
    this.user = user; // green
    this.opponent = opponent; // red
}

NumCheckers.prototype.start = function(user, cb) {
    // Ищем свободные игры используем Object.keys чтобы посчитать элементы в объекте
    if(Object.keys(this.free).length > 0) {
        // Если есть ожидающие игры получаем один ID
        var opponent = Object.keys(this.free).shift();
        // Создаём игру между этими игроками
        var game = new GameItem(user, opponent);
        // Создаём уникальный ID игры из ID игроков
        var id = user + opponent;
        // Добавляем игру в список действующих
        this.games[id] = game;
        // Добавляем игрока в общей список играющих
        this.users[user] = id;
        // Добавляем его соперника так же
        this.users[opponent] = id;
        // Используем callback функция для возврата
        cb(true, id, opponent);
    } else {
        // Пока нет, значит будем ждать
        this.free[user] = true;
        // Используем callback функция для возврата
        cb(false);
    }
}

NumCheckers.prototype.end = function(user, cb) {
    // Если пользователь стоял в очереди удаляем его от туда
    delete this.free[user];
    // Если пользователь уже был удалён выходим, значит игры уже нет
    if(this.users[user] === undefined) return;
    // Получаем ID игры в которой находится пользователь
    var gameId = this.users[user];
    // Если игра уже была удалена, выходим
    if(this.games[gameId] === undefined) return;
    // Получаем объект игры по его ID
    var game = this.games[gameId];
    // Получаем соперника из этой игры
    var opponent = (user == game.user ? game.opponent : game.user);
    // Удаляем объект игры
    delete this.games[gameId];
    // Освобождаем память
    game = null;
    // Удаляем пользователя из списка
    delete this.users[user];
    // Возвращаем ID игры и ID соперника в этой игре
    cb(gameId, opponent);
}

// NumCheckers.prototype.toggle = function(gameId, i, j, turn, cb) {
//     this.games[gameId].toggle(i, j, turn, cb);
// }

// GameItem.prototype.toggle = function(i, j, turn, cb) {
//     cb();
// }

// NumCheckers.prototype.doubleJump = function(gameId, data, cb) {
//     this.games[gameId].doubleJump(data, cb);
// }

// GameItem.prototype.doubleJump = function(data, cb) {
//     cb();
// }


NumCheckers.prototype.nextTurn = function(gameId, user, cb) {
    this.games[gameId].nextTurn(user, cb);
}

GameItem.prototype.nextTurn = function(user, cb) {
    
    cb(this.getTurn(user));
}

NumCheckers.prototype.step = function(gameId, user, cb) {
    // Данная функция служит как proxy для обращения к нужно игре из коллекции и передачи параметров в неё
    this.games[gameId].step(user, cb);
}
GameItem.prototype.step = function(user, cb) {
    // Проверяем что в этой клетке ничего нет
   // console.log(coord);
    // var barrier = barrier;
    // //var moves = moves;
    // if(board[coord.x][coord.y] !== 0) return;
    // console.log("remove === " + remove);
    // if(barrier.barrier && barrier.myBarrierCount == 0 && 
    //     barrier.myFigureContent >= barrier.enemyBarrierContent) {
    //     board[barrier.enemyBarrier.x][barrier.enemyBarrier.y] = 0;
    // }
    // Получаем параметры X и Y куда был сделан ход, добавляем в объект ходов на эти координаты кто пошёл
   // this.board = board;
    // Обратный вызов у нас срабатывает после выполнения функции проверки на победителя
    cb(this.getTurn(user));
}
GameItem.prototype.getTurn = function(user) {
    return (user == this.user ? 'green' : 'red');
}

GameItem.prototype.checkWinner = function(board, moves) {
    var player, you, gameOver, check_moving_player, check_moving_you, winner = false;
    check_moving_player = moves.x;
    check_moving_you = moves.y;
    console.log(check_moving_player + " pl you " + check_moving_you);
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