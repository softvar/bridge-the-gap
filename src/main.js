'use strict';

// Utility functions
var utils = {
	/**
	 * Get a random number between the specified values
	 * @param  {Number} min
	 * @param  {Number} max
	 * @return {Number}
	 */
	getRandomInt: function (min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	},
	/**
	 * Shorthand for parseInt with radix 10
	 * @param  {Number} value
	 * @return {Number}
	 */
	pI: function (value) {
		return parseInt(value, 10);
	},
	/**
	 * Clamp value between specified limits
	 * @param  {Number} value - value to be clamped
	 * @param  {Number} min   - min value
	 * @param  {Number} max   - max value
	 * @return {Number}       - desired clamped value
	 */
	clamp: function (value, min, max) {
		if (typeof min !== 'number') { min = -Infinity; }
		if (typeof max !== 'number') { max = Infinity; }
		return Math.max(min, Math.min(max, value));
	},
	/**
	 * Get local storage data decode it before using it
	 * @param  {Boolean} isSound
	 * @return {String}
	 */
	getLocalStorageData: function (isSound) {
		if (!isSound) {
			return utils.pI(atob(localStorage.getItem('BridgeTheGapHighestScore'))) || 0;
		}
		return utils.pI(atob(localStorage.getItem('BridgeTheGapGameSound')));
	},
	/**
	 * Save data to local storage
	 * @param {String/Number}  data
	 * @param {Boolean} isSoundData - for saving sound preferences
	 */
	setLocalStorageData: function (data, isSoundData) {
		if (!isSoundData) {
			localStorage.setItem('BridgeTheGapHighestScore', btoa(data));
		} else {
			localStorage.setItem('BridgeTheGapGameSound', btoa(data))
		}

	}
};

var Bridge = function () {
	this.bridge = document.getElementById('bridge');
	var self = this;
};

Bridge.prototype.startBuilding = function () {
	/**
	 * Set various attributes for the bridge in context
	 */
	var height = this.bridge.style.height = 0;
	this.bridge.className = 'inline-block';

	// Reversed mode preferences
	if (!game.isReversedMode) {
		this.bridge.style.left = utils.pI(game.firstBuilding.style.width) - 3 + 'px';
	}
	else {
		this.bridge.style.left = game.sceneWidth - utils.pI(game.secondBuilding.style.width) - 3 + 'px';
	}

	this.bridge.style.bottom = game.buildingHeight + 'px';

	// Increase height(width after laying) in an interval until user releases mouse/touch
	this.startBuildingInterval = setInterval(function () {
		self.bridge.style.height = height + 'px';
		height += 2;
		if (!game.isReversedMode) {
			self.bridge.style.height = utils.clamp(utils.pI(self.bridge.style.height), 0, game.sceneWidth - utils.pI(game.firstBuilding.style.width)) + 'px';
		} else {
			self.bridge.style.height = utils.clamp(utils.pI(self.bridge.style.height), 0, game.sceneWidth - utils.pI(game.secondBuilding.style.width)) + 'px';
		}
	}, 5);
};

Bridge.prototype.stopBuilding = function () {
	// Stop creating building
	// Clear timeout and animate bridge so that it seems across the buildings
	clearInterval(this.startBuildingInterval);
	// Rotate the bridge
	if (!game.isReversedMode) {
		this.bridge.className = 'rotate-90';
	}
	else {
		this.bridge.className = 'anti-rotate-90';
	}
};

Bridge.prototype.awardBonus = function () {
	play('bonus');
	game.scoreElement.innerHTML = utils.pI(game.scoreElement.innerHTML) + 2;
	game.gameBonusPointElement.className = 'inline-block  game-bonus-point  game-bonus-point-anim';
	setTimeout(function () {
		game.gameBonusPointElement.className = 'game-bonus-point  hidden';
	}, 1500);

	game.updateHighestScore();
	game.moveAhead(true);
};

Bridge.prototype.moveGame = function () {
	var score;
	game.scoreElement.innerHTML = utils.pI(game.scoreElement.innerHTML) + 1;
	game.updateHighestScore();
	score = utils.pI(game.scoreElement.innerHTML);
	if (score % game.randomReversalModeTime === 0) {
		game.isReversedMode = !game.isReversedMode;
		if (game.isReversedMode) {
			game.reversedElement.className = 'reversed blink';
		} else {
			game.reversedElement.className = 'hidden';
		}
		game.randomReversalModeTime = utils.getRandomInt(1, 2);
	}
	game.moveAhead();
};

Bridge.prototype.checkBridgePlacement = function () {

	// Check whether the bridge falls across the buildings or is hanging badly

	if (!game.isReversedMode) {
		var bridgeSecondEndLocation = utils.pI(this.bridge.style.left) + utils.pI(this.bridge.style.height) + 3;

		var secondBuildingLeftOffset = utils.pI(game.secondBuilding.style.left),
			secondBuildingWidth = utils.pI(game.secondBuilding.style.width);

		// Bridge is shorter
		if (bridgeSecondEndLocation < secondBuildingLeftOffset) {
			game.gameOverPosteriors();
		}
		// Bridge is bigger
		else if (bridgeSecondEndLocation > (secondBuildingLeftOffset + secondBuildingWidth)) {
			game.gameOverPosteriors();
		}
		// Bridge lies on mid-point
		else if (bridgeSecondEndLocation > secondBuildingLeftOffset + (secondBuildingWidth / 2) - 3 && bridgeSecondEndLocation < secondBuildingLeftOffset + (secondBuildingWidth / 2) + 3) {
			// bonus
			this.awardBonus();
		}
		// Bridge lies across the buildings
		else {
			this.moveGame();
		}
	} else {
		var bridgeSecondEndLocation = utils.pI(this.bridge.style.left) - utils.pI(this.bridge.style.height) + 3;

		var firstBuildingLeftOffset = utils.pI(game.firstBuilding.style.left),
			firstBuildingWidth = utils.pI(game.firstBuilding.style.width);

		// Bridge is shorter
		if (bridgeSecondEndLocation > (firstBuildingLeftOffset + firstBuildingWidth)) {
			game.gameOverPosteriors();
		}
		// Bridge is bigger
		else if (bridgeSecondEndLocation < firstBuildingLeftOffset) {
			game.gameOverPosteriors();
		}
		// Bridge lies on mid-point
		else if (bridgeSecondEndLocation > firstBuildingLeftOffset + (firstBuildingWidth / 2) - 3 && bridgeSecondEndLocation < firstBuildingLeftOffset + (firstBuildingWidth / 2) + 3) {
			// bonus
			this.awardBonus();
		}
		// Bridge lies across the buildings
		else {
			this.moveGame();
		}

	}
};

// Game class
var Game = function () {
	// Set some initial variables needed for game play
	var self = this;
	this.firstBuilding = document.getElementById('first-building');
	this.secondBuilding = document.getElementById('second-building');

	this.secondBuildingMidSpot = document.getElementById('second-building__mid-spot');
	this.secondBuildingMidSpot.className = '';

	this.scoreElement = document.getElementsByClassName('game-score')[0];
	this.scoreElement.innerHTML = 0;

	this.highestScoreElement = document.getElementsByClassName('game-highest-score')[0];
	this.highestScoreElement.innerHTML = utils.getLocalStorageData();

	this.highestScoreBoard = document.getElementsByClassName('highest-score-board')[0];

	this.gameOverElement = document.getElementsByClassName('game-end')[0];

	this.gameRestartElement = document.getElementsByClassName('game-restart')[0];

	this.gameBonusPointElement = document.getElementsByClassName('game-bonus-point')[0];

	this.reversedElement = document.getElementById('reversed');
	this.randomReversalModeTime = utils.getRandomInt(1, 2);

	this.windoWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
	this.windowHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

	this.highestScore = utils.getLocalStorageData();

	this.soundOffElement = document.getElementById('sound-off');
	this.soundOnElement = document.getElementById('sound-on');
	this.isSound = utils.getLocalStorageData(true);
	if (isNaN(this.isSound)) {
		this.isSound = 1;
	}

	if (this.isSound) {
		this.soundOffElement.className = 'hidden';
		this.soundOnElement.className = '';
	} else {
		this.soundOnElement.className = 'hidden';
		this.soundOffElement.className = '';
	}

	this.minBuildingWidth = 8;
	this.sceneWidth = 500;
	this.buildingHeight = this.windowHeight - 65 - this.sceneWidth;

	document.getElementsByClassName('buildings')[0].style.height = this.windowHeight - 65 + 'px';
};

Game.prototype.init = function () {
	this.addBuildings();
	this.addEventListeners();
};

Game.prototype.addBuildings = function (isGameInProgress) {
	var firstBuildingWidth;
	if (!isGameInProgress) {
		// First Building
		firstBuildingWidth = utils.getRandomInt(this.minBuildingWidth, this.sceneWidth / 2);
		if (!this.isReversedMode) {
			this.firstBuilding.style.left = 0;
		}
		this.firstBuilding.style.height = this.buildingHeight + 'px';
	} else {
		firstBuildingWidth = utils.pI(this.secondBuilding.style.width);
		if (!this.isReversedMode) {
			this.firstBuilding.style.left = 0;
		}
		this.firstBuilding.style.height = this.secondBuilding.style.height;
	}
	this.firstBuilding.style.width = firstBuildingWidth + 'px';

	// Second Building
	var secondBuildingPosition = {},
		secondBuildingWidth;

	if (!this.isReversedMode) {
		secondBuildingPosition.x = utils.getRandomInt(firstBuildingWidth + 5, this.sceneWidth - this.minBuildingWidth);
		secondBuildingWidth = utils.getRandomInt(this.minBuildingWidth, this.sceneWidth - secondBuildingPosition.x);

		this.secondBuilding.style.left = secondBuildingPosition.x + 'px';
		this.secondBuilding.style.right = '';

		this.secondBuilding.style.width = secondBuildingWidth + 'px';
		this.secondBuilding.style.height = this.buildingHeight + 'px';
		// mid-spot
		this.secondBuildingMidSpot.style.left = secondBuildingPosition.x + (secondBuildingWidth / 2) - 3 + 'px';
	} else {
		secondBuildingWidth = utils.getRandomInt(this.minBuildingWidth, Math.min(this.sceneWidth / 2, this.sceneWidth - utils.pI(this.firstBuilding.style.width) - this.minBuildingWidth));
		this.secondBuilding.style.width = secondBuildingWidth + 'px';
		this.secondBuilding.style.height = this.buildingHeight + 'px';

		this.secondBuilding.style.left = '';
		this.secondBuilding.style.right = 0;


		this.firstBuilding.style.width = utils.getRandomInt(this.minBuildingWidth, this.sceneWidth - secondBuildingWidth - 5) + 'px';
		this.firstBuilding.style.left = utils.getRandomInt(this.minBuildingWidth, this.sceneWidth - secondBuildingWidth - 5 - utils.pI(this.firstBuilding.style.width)) + 'px';
		// mid-spot
		this.secondBuildingMidSpot.style.left = utils.pI(this.firstBuilding.style.left) + (utils.pI(this.firstBuilding.style.width) / 2) - 3 + 'px';
	}

	this.secondBuildingMidSpot.style.bottom = this.buildingHeight + 'px';
};

Game.prototype.addEventListeners = function () {
	var bridge = new Bridge();
	this.mouseDown = function (e) {
		if (e.button === 2) { return; }

		self.isMouseDown = true;
		if (!self.isIntroHidden) {
			document.getElementsByClassName('intro')[0].className = 'intro  anim';
			setTimeout(function () {
				document.getElementsByClassName('intro')[0].className = 'intro hidden';
				self.isIntroHidden = true;
			}, 1500);
		}

		bridge.startBuilding();
	};

	this.mouseUp = function (e) {
		if (e.button === 2) { return; }

		if (self.isMouseDown) {
			bridge.stopBuilding();
			game.removeEventListeners();
			// Check if bridge second end lies on building
			bridge.checkBridgePlacement();
			self.isMouseDown = false;
		}
	};

	var buildingsArea = document.getElementsByClassName('buildings')[0];
	buildingsArea.addEventListener('mousedown', this.mouseDown);
	buildingsArea.addEventListener('mouseup', this.mouseUp);
};

Game.prototype.removeEventListeners = function () {
	var buildingsArea =  document.getElementsByClassName('buildings')[0];
	buildingsArea.removeEventListener('mousedown', game.mouseDown, false);
	buildingsArea.removeEventListener('mouseup', game.mouseUp, false);
};

Game.prototype.moveAhead = function (isBonus) {
	// Make second building to be the first now, and create second building randomly
	// keeping the boundaries in mind
	if (!isBonus && !this.isMoveAheadSoundOff) {
		play('moveAhead');
	}
	this.isMoveAheadSoundOff = false;
	setTimeout(function () {
		self.bridge.className = 'hidden';
		game.addBuildings(true);
		game.addEventListeners();
	}, 500);
};

Game.prototype.gameOverPosteriors = function () {
	game.gameOverElement.style.display = 'inline';

	game.updateHighestScore(true);

	this.removeEventListeners();

	var self = this;
	self.firstBuilding.className = 'shake';
	self.secondBuilding.className = 'shake';
	self.gameOverElement.className = 'game-end shake';
	document.getElementById('ocean').className = 'shake';
	document.getElementsByClassName('game-title')[0].className = 'game-title  shimmer';

	setTimeout( function () {
		this.bridge.style.height = utils.clamp(utils.pI(this.bridge.style.height), 0, game.buildingHeight - 1) + 'px';

		if (!game.isReversedMode) {
			this.bridge.className = 'rotate-180';
		} else {
			this.bridge.className = 'anti-rotate-180';
		}
	}, 500);

	setTimeout( function () {
		this.bridge.className = 'hidden';
	}, 600);

	setTimeout( function () {
		self.firstBuilding.className = '';
		self.secondBuilding.className = '';
		self.gameOverElement.className = 'game-end';
		document.getElementById('ocean').className = '';
	}, 500);
};

Game.prototype.updateHighestScore = function (isGameOver) {
	var highestScore = utils.getLocalStorageData();
	var currentScore = game.scoreElement.innerHTML;

	if (!this.isHighestScoreSoundPlayed && currentScore > this.highestScore) {
		play('highestScore');
		this.highestScoreBoard.className = 'game-score-board highest-score-board blink';
		this.isHighestScoreSoundPlayed = true;
		this.isMoveAheadSoundOff = true;
	} else if (isGameOver) {
		play('gameOver');
	} else {
		this.highestScoreBoard.className = 'game-score-board highest-score-board';
	}

	if (utils.pI(game.scoreElement.innerHTML) < highestScore) { return; }

	utils.setLocalStorageData(currentScore);
	game.highestScoreElement.innerHTML = currentScore;
};

var game;
window.onload = function() {
    game = new Game();
    game.init();

    game.gameRestartElement.addEventListener('click', function () {
		game.gameOverElement.style.display = 'none';
		game.reversedElement.className = 'hidden';
		document.getElementsByClassName('game-title')[0].className = 'game-title';
		game.isHighestScoreSoundPlayed = false;
		game = null;

		game = new Game();
		game.init();
	});

	game.soundOnElement.addEventListener('click', function () {
		game.soundOnElement.className = 'hidden';
		game.soundOffElement.className = '';
		game.isSound = 0;
		utils.setLocalStorageData(0, true);
	});

	game.soundOffElement.addEventListener('click', function () {
		game.soundOffElement.className = 'hidden';
		game.soundOnElement.className = '';
		game.isSound = 1;
		utils.setLocalStorageData(1, true);
	});

	// make some waves.
	var ocean = document.getElementById("ocean"),
	    waveWidth = 10,
	    waveCount = Math.floor(500 / waveWidth),
	    docFrag = document.createDocumentFragment();

	for(var i = 0; i < waveCount; i++){
	  var wave = document.createElement("div");
	  wave.className += " wave";
	  docFrag.appendChild(wave);
	  wave.style.left = i * waveWidth + "px";
	  wave.style.webkitAnimationDelay = (i/100) + "s";
	}

	ocean.appendChild(docFrag);
};

// For sound Effects
function rd(a, b){
    if(!b){
        b = a;
        a = 0;
    }
	return Math.random() * (b - a) + a;
};

function rp(a){
    return a[~~rd(a.length)];
}

var sounds = {},
soundEffect = function(sid, settings){
	sounds[sid] = [];

	settings.forEach(function(sound){
		var audio = new Audio();
		audio.src = jsfxr(sound);

		sounds[sid].push(audio);
	});
},
play = function(sid) {
	if (!game.isSound) {
		return;
	}
	sounds[sid] && rp(sounds[sid]).play();
};


soundEffect('gameOver', [
	[2,0.2,0.01,,0.83,0.24,,,,0.62,0.6,,,0.1248,0.4522,,,,0.4,,,,,1]
]);
soundEffect('moveAhead', [
	[2,,0.2,,0.1753,0.64,,-0.5261,,,,,,0.5522,-0.564,,,,1,,,,,1]
]);
soundEffect('highestScore', [
	[0,,0.016,0.4953,0.3278,0.6502,,,,,,0.4439,0.6322,,,,,,1,,,,,1]
]);
soundEffect('bonus', [
	[0,,0.01,0.4911,0.4105,0.5077,,,,,,0.2117,0.6579,,,,,,1,,,,,1]
]);
