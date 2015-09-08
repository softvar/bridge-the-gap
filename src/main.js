'use strict';

// Utility functions

var utils = {
	getRandomInt: function (min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	},
	pI: function (value) {
		return parseInt(value, 10);
	},
	clamp: function (value, min, max) {
		if (typeof min !== 'number') { min = -Infinity; }
		if (typeof max !== 'number') { max = Infinity; }
		return Math.max(min, Math.min(max, value));
	},
	getLocalStorageData: function () {
		return utils.pI(atob(localStorage.getItem('gameBridgerHighestScore'))) || 0;
	},
	setLocalStorageData: function (data) {
		localStorage.setItem('gameBridgerHighestScore', btoa(data));
	}
};

var Bridge = function () {
	this.bridge = document.getElementById('bridge');
	var self = this;
};

Bridge.prototype.startBuilding = function () {
	var height = this.bridge.style.height = 0;
	this.bridge.className = 'inline-block';

	if (!game.isReversedMode) {
		this.bridge.style.left = utils.pI(game.firstBuilding.style.width) - 3 + 'px';
	}
	else {
		this.bridge.style.left = game.sceneWidth - utils.pI(game.secondBuilding.style.width) - 3 + 'px';
	}

	this.bridge.style.bottom = game.buildingHeight + 'px';

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
	clearInterval(this.startBuildingInterval);
	// Rotate the bridge
	if (!game.isReversedMode) {
		this.bridge.className = 'rotate-90';
	}
	else {
		this.bridge.className = 'anti-rotate-90';
	}
	//this.bridge.style.height = utils.clamp(utils.pI(this.bridge.style.height), 0, game.sceneWidth - utils.pI(game.firstBuilding.style.width)) + 'px';

};

Bridge.prototype.checkBridgePlacement = function () {
	if (!game.isReversedMode) {
		var bridgeSecondEndLocation = utils.pI(this.bridge.style.left) + utils.pI(this.bridge.style.height) + 3;

		var secondBuildingLeftOffset = utils.pI(game.secondBuilding.style.left),
			secondBuildingWidth = utils.pI(game.secondBuilding.style.width);

		if (bridgeSecondEndLocation < secondBuildingLeftOffset) {
			//console.log('shorter');
			game.gameOverPosteriors();
		} else if (bridgeSecondEndLocation > (secondBuildingLeftOffset + secondBuildingWidth)) {
			//console.log('bigger');
			game.gameOverPosteriors();
		} else if (bridgeSecondEndLocation > secondBuildingLeftOffset + (secondBuildingWidth / 2) - 3 && bridgeSecondEndLocation < secondBuildingLeftOffset + (secondBuildingWidth / 2) + 3) {
			// bonus
			game.scoreElement.innerHTML = utils.pI(game.scoreElement.innerHTML) + 2;
			game.gameBonusPointElement.className = 'inline-block  game-bonus-point  game-bonus-point-anim';
			setTimeout(function () {
				game.gameBonusPointElement.className = 'game-bonus-point  hidden';
			}, 1500);

			game.updateHighestScore();
			game.moveAhead();
		} else {
			// okay
			game.scoreElement.innerHTML = utils.pI(game.scoreElement.innerHTML) + 1;
			game.updateHighestScore();
			game.moveAhead();
		}
	} else {
		var bridgeSecondEndLocation = utils.pI(this.bridge.style.left) - utils.pI(this.bridge.style.height) + 3;

		var firstBuildingLeftOffset = utils.pI(game.firstBuilding.style.left),
			firstBuildingWidth = utils.pI(game.firstBuilding.style.width);

		console.log(bridgeSecondEndLocation, firstBuildingLeftOffset, firstBuildingWidth);

		if (bridgeSecondEndLocation > (firstBuildingLeftOffset + firstBuildingWidth)) {
			console.log('shorter');
			game.gameOverPosteriors();
		} else if (bridgeSecondEndLocation < firstBuildingLeftOffset) {
			console.log('bigger');
			game.gameOverPosteriors();
		} else if (bridgeSecondEndLocation > firstBuildingLeftOffset + (firstBuildingWidth / 2) - 3 && bridgeSecondEndLocation < firstBuildingLeftOffset + (firstBuildingWidth / 2) + 3) {
			// bonus
			game.scoreElement.innerHTML = utils.pI(game.scoreElement.innerHTML) + 2;
			game.gameBonusPointElement.className = 'inline-block  game-bonus-point  game-bonus-point-anim';
			setTimeout(function () {
				game.gameBonusPointElement.className = 'game-bonus-point  hidden';
			}, 1500);

			game.updateHighestScore();
			game.moveAhead();
		} else {
			// okay
			console.log('okay')
			game.scoreElement.innerHTML = utils.pI(game.scoreElement.innerHTML) + 1;
			game.updateHighestScore();
			game.moveAhead();
		}

	}
};

var Game = function () {
	this.firstBuilding = document.getElementById('first-building');
	this.secondBuilding = document.getElementById('second-building');

	this.secondBuildingMidSpot = document.getElementById('second-building__mid-spot');

	this.scoreElement = document.getElementsByClassName('game-score')[0];
	this.scoreElement.innerHTML = 0;

	this.highestScoreElement = document.getElementsByClassName('game-highest-score')[0];
	this.highestScoreElement.innerHTML = utils.getLocalStorageData();

	this.gameOverElement = document.getElementsByClassName('game-end')[0];

	this.gameRestartElement = document.getElementsByClassName('game-restart')[0];

	this.gameBonusPointElement = document.getElementsByClassName('game-bonus-point')[0];

	this.windoWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
	this.windowHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)

	this.minBuildingWidth = 8;

	this.sceneWidth = 500;
	//this.sceneHeight = 1000;
	this.buildingHeight = this.windowHeight - 65 - this.sceneWidth;

	var self = this;

	this.isReversedMode = true;

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
		this.firstBuilding.style.width = firstBuildingWidth + 'px';
		this.firstBuilding.style.height = this.buildingHeight + 'px';
		if (!this.isReversedMode) {
			this.firstBuilding.style.left = 0;
		}
	} else {
		firstBuildingWidth = utils.pI(this.secondBuilding.style.width);
		this.firstBuilding.style.width = firstBuildingWidth + 'px';
		this.firstBuilding.style.height = this.secondBuilding.style.height;
		if (!this.isReversedMode) {
			this.firstBuilding.style.left = 0;
		}
	}


	// Second Building
	var secondBuildingPosition = {},
		secondBuildingWidth;

	if (!this.isReversedMode) {
		secondBuildingPosition.x = utils.getRandomInt(firstBuildingWidth + 5, this.sceneWidth - this.minBuildingWidth);
		this.secondBuilding.style.left = secondBuildingPosition.x + 'px';
		secondBuildingWidth = utils.getRandomInt(this.minBuildingWidth, this.sceneWidth - secondBuildingPosition.x);
		// mid-spot
		this.secondBuildingMidSpot.style.left = secondBuildingPosition.x + (secondBuildingWidth / 2) - 3 + 'px';
	} else {
		this.secondBuilding.style.right = 0
		secondBuildingWidth = utils.getRandomInt(this.minBuildingWidth, this.sceneWidth / 2);

		console.log(secondBuildingWidth)
		this.firstBuilding.style.width = utils.getRandomInt(this.minBuildingWidth, this.sceneWidth - secondBuildingWidth - 5);
		this.firstBuilding.style.left = utils.getRandomInt(this.minBuildingWidth, this.sceneWidth - secondBuildingWidth - 5 - utils.pI(this.firstBuilding.style.width)) + 'px';
		console.log(this.firstBuilding.style.left, this.minBuildingWidth, this.firstBuilding.style.width)
		// mid-spot
		this.secondBuildingMidSpot.style.left = utils.pI(this.firstBuilding.style.left) + (utils.pI(this.firstBuilding.style.width) / 2) - 3 + 'px';
	}

	this.secondBuilding.style.width = secondBuildingWidth + 'px';
	this.secondBuilding.style.height = this.buildingHeight + 'px';

	this.secondBuildingMidSpot.style.bottom = this.buildingHeight + 'px';
};

Game.prototype.addEventListeners = function () {
	var bridge = new Bridge();
	this.mouseDown = function (e) {
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

Game.prototype.moveAhead = function () {
	// Make second building to be the first now, and create second building randomly
	// keeping the boundaries in mind
	setTimeout(function () {
		self.bridge.className = 'hidden';
		game.addBuildings(true);
		game.addEventListeners();
	}, 500);
};

Game.prototype.gameOverPosteriors = function () {
	game.gameOverElement.style.display = 'inline-block';

	game.updateHighestScore();

	this.removeEventListeners();

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
};

Game.prototype.updateHighestScore = function () {
	var highestScore = utils.getLocalStorageData();
	var currentScore = game.scoreElement.innerHTML;

	if (utils.pI(game.scoreElement.innerHTML) < highestScore) { return; }

	utils.setLocalStorageData(currentScore);
	game.highestScoreElement.innerHTML = currentScore
};

var game;
window.onload = function() {
    game = new Game();
    game.init();

    game.gameRestartElement.addEventListener('click', function () {
		game.gameOverElement.style.display = 'none';
		game = null;

		game = new Game();
		game.init();
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
