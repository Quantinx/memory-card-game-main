//Element Declaration

const gameContainerEl = document.querySelector("#gameContainer");
const startContainerEl = document.querySelector("#startContainer");
const nameInputEl = document.querySelector("#nameInput");
const startButtonEl = document.querySelector("#startButton");
const formEl = document.querySelector("#form");
const endScreenEl = document.querySelector("#endScreen");

//File Declaration
const flipSound = new Audio("./sounds/Flip.mp3");
const loseSound = new Audio("./sounds/Lose.mp3");
const successSound = new Audio("./sounds/Success.mp3");
const timeLowSound = new Audio("./sounds/TimeLow.mp3");
const unFlipSound = new Audio("./sounds/UnFlip.mp3");
const winSound = new Audio("./sounds/Win.mp3");

let userName = "";

//game settings
const maxTime = 20;
const endTimeout = 10000;

//Game flags to be tracked across all listeners
let timer = maxTime;
let gameActive = false;
let correctGuesses = 0;
let neededGuesses = 0;

let cardsArray = [];

let scoreData = [];
loadPlayerData();

//Card generator Function
function createCards() {
  //Generate the HTML
  for (let i = 0; i < cardsArray.length; i++) {
    let card = document.createElement("div");
    let face = document.createElement("img");
    let back = document.createElement("div");
    card.classList = "card";
    face.classList = "face";
    back.classList = "back";
    //Attach the info to the cards
    face.src = cardsArray[i].url;
    card.setAttribute("name", cardsArray[i].name);
    //Attch the cards to the gameContainer
    gameContainerEl.appendChild(card);
    card.appendChild(face);
    card.appendChild(back);

    card.addEventListener("click", function (e) {
      toggleCard(card);
      compareCards(e);
    });
  }
}

function shuffleCards() {
  cardsArray = cardsArray.concat(cardsArray);
  cardsArray.sort(() => Math.random() - 0.5);
}

//Check cards
function compareCards(e) {
  let clickedCard = e.target;
  selectCard(clickedCard);

  let selectedCards = document.querySelectorAll(".selected");

  //Logic
  if (selectedCards.length !== 2) {
    return;
  }

  if (checkEqualCards(selectedCards[0], selectedCards[1])) {
    playSound("success");
    winCondition();
    disablePointerEvents(selectedCards[0]);
    disablePointerEvents(selectedCards[1]);
  } else {
    setTimeout(function () {
      if (gameActive === false) {
        return;
      }
      toggleCard(selectedCards[0]);
      toggleCard(selectedCards[1]);
      playSound("unflip");
    }, 1000);
  }

  unselectCard(selectedCards[0]);
  unselectCard(selectedCards[1]);
}

function winCondition() {
  correctGuesses += 1;
  if (correctGuesses >= neededGuesses) {
    gameActive = false;
    storePlayerData();
    endScreenEl.innerHTML = "You Win!";
    endScreenEl.classList.add("end-screen-shown");
    playSound("win");
    setTimeout(resetGame, endTimeout);
  }
}

window.setInterval(gameTimer, 1000);

function disablePointerEvents(card) {
  card.style.pointerEvents = "none";
}

function selectCard(card) {
  card.classList.add("selected");
  playSound("flip");
}

function unselectCard(card) {
  card.classList.remove("selected");
}

function toggleCard(card) {
  card.classList.toggle("toggleCard");
}

function addToggleCard(card) {
  card.classList.add("toggleCard");
}

function checkEqualCards(card1, card2) {
  return card1.getAttribute("name") === card2.getAttribute("name");
}

function gameTimer() {
  if (gameActive === false) {
    return;
  }
  timer -= 1;

  let timerEl = document.querySelector("#gameTimer");
  timerEl.innerHTML = "Timer: " + timeConvert(timer);
  if (timer > 12) {
    timerEl.classList.remove("game-timer-low");
  }
  if (timer === 13) {
    timerEl.classList.add("game-timer-low");
    playSound("timelow");
  }

  if (timer <= 0) {
    endGame();
  }
}

function endGame() {
  gameActive = false;
  let cardEl = document.querySelectorAll(".card");
  for (let i = 0; i < cardEl.length; i++) {
    addToggleCard(cardEl[i]);
  }
  endScreenEl.innerHTML = "You Lose!";
  endScreenEl.classList.add("end-screen-shown");
  playSound("lose");
  setTimeout(resetGame, endTimeout);
}

function timeConvert(timer) {
  let minutes = Math.floor(timer / 60);
  let seconds = timer - minutes * 60;
  if (seconds < 10) {
    seconds = "0" + seconds;
  }
  return minutes + ":" + seconds;
}

function storePlayerData() {
  let timeUsed = maxTime - timer;
  const maxScoreEntries = 10;
  scoreData.push({ time: timeUsed, name: userName });
  scoreData.sort((b, a) => b.time - a.time);
  if (scoreData.length > maxScoreEntries) {
    scoreData.length = maxScoreEntries;
  }
  localStorage.setItem("scores", JSON.stringify(scoreData));
  createScoreBoard();
}

function loadPlayerData() {
  scoreData = JSON.parse(localStorage.getItem("scores")) || [];
  createScoreBoard();
}

function createScoreBoard() {
  clearScoreBoard();
  let scoreBoardEl = document.querySelector("#scoreBoard");
  for (let i = 0; i < scoreData.length; i++) {
    let userScoreEl = document.createElement("div");
    userScoreEl.classList.add("score");
    userScoreEl.innerHTML =
      i + 1 + ". " + scoreData[i].name + " " + timeConvert(scoreData[i].time);
    scoreBoardEl.append(userScoreEl);
  }
}

function clearScoreBoard() {
  let scores = document.querySelectorAll(".score");
  for (let i = 0; i < scores.length; i++) {
    scores[i].remove();
  }
}

async function getData() {
  let apiUrl = "./api/meme.json";
  try {
    let response = await fetch(apiUrl);
    let result = await response.json();
    cardsArray = result;
    createDeck();
    neededGuesses = cardsArray.length;
    startGame();
  } catch {
    console.log("API error");
  }
}

function resetGame() {
  endScreenEl.classList.remove("end-screen-shown");

  let timerEl = document.querySelector("#gameTimer");
  timerEl.style.visibility = "hidden";
  let card = document.querySelectorAll(".card");
  for (let i = 0; i < card.length; i++) {
    card[i].remove();
  }
  timer = maxTime;
  startContainerEl.classList.remove("start-container-hidden");
}

function startGame() {
  gameActive = true;
  correctGuesses = 0;
  shuffleCards();
  createCards();
  let timerEl = document.querySelector("#gameTimer");
  timerEl.style.visibility = "visible";
}

formEl.addEventListener("submit", function (e) {
  e.preventDefault();
  userName = nameInputEl.value;
  getData();
  startContainerEl.classList.add("start-container-hidden");
});

function createDeck() {
  //Funtion would be call immediately after api fetch
  cardsArray.sort(() => Math.random() - 0.5);
  cardsArray = cardsArray.slice(-10);
}

function playSound(sound) {
  switch (sound) {
    case "flip":
      flipSound.load();
      flipSound.play();
      break;
    case "lose":
      loseSound.load();
      loseSound.play();
      break;
    case "success":
      successSound.load();
      successSound.play();
      break;
    case "timelow":
      timeLowSound.load();
      timeLowSound.play();
      break;
    case "unflip":
      unFlipSound.load();
      unFlipSound.play();
      break;
    case "win":
      timeLowSound.load();
      winSound.load();
      winSound.play();
      break;
  }
}
