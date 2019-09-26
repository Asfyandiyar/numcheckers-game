var socket;
var tableTemplate = document.querySelector("#table").content;
var tabletrTemplate = document.querySelector("#tabletr").content;
var tableanchorTemplate = document.querySelector("#tableanchor").content;
var tablespanTemplate = document.querySelector("#tablespan").content;
var table;
var random;
var randoms = [];
var messages = document.querySelector(".messages");
var paragraph = messages.querySelector(".messages__paragraph");
var paragraphTurn = document.querySelector(".messages__turn");
var paragraphCountPlayers = document.querySelector(".messages__count-players");
var paragraphCountUnique = document.querySelector(".messages__count-unique");

var modeStorage = 'single';
    //localStorage.setItem('mode', 'single');
    var gameContainer = document.querySelector('.game-container');
    var mode = gameContainer.querySelector(".mode");
    var modeContainer = mode.querySelector(".mode__container");
    var singleModeButton = mode.querySelector(".mode__single");
    var multiplayerButton = mode.querySelector(".mode__multiplayer");
    var twoPlayersButton = mode.querySelector(".mode__twoplayer");
var board;
var td;
var piece_toggled = false;
var my_turn = false;
var player_turn = false;
var dummyBar = false;
var dummy_src, dummy_border;
var double_jump = false;
var check_double_jump = false;
var barrier;
var piece;
var distance;
var comp_double_jump = false;
var comp_move = false;
var game_is_over = false; 
var safe_jump = [];
var safe_from = safe_to = null;
var toggler = null;
var togglers = 0;
var fl = true;

var old;

var count = 0;
var dragCount = 0;
var successMouseUp = 0;
var ram = false;
var ramMy = true;
var moveComp;
var myPieceCounter = 12;
var compCount = 12;
var distanceMoveCount = 0;
var jumpCounter = 0;
var concatenateCounter = 0;
var mouseDownCounter = 0;

var moved = false;
var swaping = false;
var remove = false;
var myFigureContent;
var enemyBarrierContent;

var isStarted = false; 
var startButton = document.querySelector('.mode__start');
var restartButton = document.querySelector('.mode__restart');
var storage = localStorage.getItem('gotit');
//var privacyContainer = document.querySelector('.privacy-container');
//var gotItButton = privacyContainer.querySelector('.privacy-container__button');
var span, draggableAnchor, coords, coordsTable, shiftX, shiftY, spanAfter, limits, newLocation;
var dropElem, dropElemClass, targetClass, currentTargetClass, jumpConcatenate = false;
var check_double_jump = false;
var c_double_jump = false;
var mode = gameContainer.querySelector(".mode");
var isMultiplayer = false;
var dragObject = {};

var messagesTurnParagraph, messagesCountPlayersParagraph;

var hiddenStorage = localStorage.getItem('hidden');

    if(hiddenStorage != null) {
      modeStorage = localStorage.getItem('mode');
      for(var i = 0; i < 3; i++) {
        if(modeContainer.querySelectorAll("p")[i].classList)
          modeContainer.querySelectorAll("p")[i].classList.remove('hidden');
      }
      modeContainer.querySelectorAll("p")[hiddenStorage].classList.add('hidden');
    }
if(modeStorage == 'multiplayer') {
  socket = io.connect();
}

    singleModeButton.addEventListener('click', function(evt) {
      localStorage.setItem('mode', 'single');
      localStorage.setItem('hidden', 0);
    });
    multiplayerButton.addEventListener('click', function(evt) {
      localStorage.setItem('mode', 'multiplayer');
      localStorage.setItem('hidden', 1);
    });
    twoPlayersButton.addEventListener('click', function(evt) {
      localStorage.setItem('mode', 'twoplayers');
      localStorage.setItem('hidden', 2);
    });

// if(storage)
//   privacyContainer.classList.add('hidden');

// gotItButton.addEventListener('click', function(evt) {
//   evt.preventDefault();
//   privacyContainer.classList.add('hidden');
//   localStorage.setItem('gotit', true);
// });

function message(str, element = paragraph) {
  element.textContent = str;
}


