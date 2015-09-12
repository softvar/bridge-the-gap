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
	getLocalStorageData: function (isSound) {
		if (!isSound) {
			return utils.pI(atob(localStorage.getItem('BridgeTheGapHighestScore'))) || 0;
		}
		return utils.pI(atob(localStorage.getItem('BridgeTheGapGameSound')));
	},
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
	var score;

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
			play('bonus')
			game.scoreElement.innerHTML = utils.pI(game.scoreElement.innerHTML) + 2;
			game.gameBonusPointElement.className = 'inline-block  game-bonus-point  game-bonus-point-anim';
			setTimeout(function () {
				game.gameBonusPointElement.className = 'game-bonus-point  hidden';
			}, 1500);

			game.updateHighestScore();
			game.moveAhead(true);
		} else {
			// okay
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
		}
	} else {
		var bridgeSecondEndLocation = utils.pI(this.bridge.style.left) - utils.pI(this.bridge.style.height) + 3;

		var firstBuildingLeftOffset = utils.pI(game.firstBuilding.style.left),
			firstBuildingWidth = utils.pI(game.firstBuilding.style.width);

		if (bridgeSecondEndLocation > (firstBuildingLeftOffset + firstBuildingWidth)) {
			//console.log('shorter');
			game.gameOverPosteriors();
		} else if (bridgeSecondEndLocation < firstBuildingLeftOffset) {
			//console.log('bigger');
			game.gameOverPosteriors();
		} else if (bridgeSecondEndLocation > firstBuildingLeftOffset + (firstBuildingWidth / 2) - 3 && bridgeSecondEndLocation < firstBuildingLeftOffset + (firstBuildingWidth / 2) + 3) {
			// bonus
			play('bonus');
			game.scoreElement.innerHTML = utils.pI(game.scoreElement.innerHTML) + 2;
			game.gameBonusPointElement.className = 'inline-block  game-bonus-point  game-bonus-point-anim';
			setTimeout(function () {
				game.gameBonusPointElement.className = 'game-bonus-point  hidden';
			}, 1500);

			game.updateHighestScore();
			game.moveAhead(true);
		} else {
			//console.log('okay')
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
		}

	}
};

var Game = function () {
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

	if (this.isSound) {
		this.soundOffElement.className = 'hidden';
		this.soundOnElement.className = '';
	} else {
		this.soundOnElement.className = 'hidden';
		this.soundOffElement.className = '';
	}

	this.minBuildingWidth = 8;

	this.sceneWidth = 500;
	//this.sceneHeight = 1000;
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
		this.firstBuilding.style.width = firstBuildingWidth + 'px';
		this.firstBuilding.style.height = this.buildingHeight + 'px';
	} else {
		firstBuildingWidth = utils.pI(this.secondBuilding.style.width);
		if (!this.isReversedMode) {
			this.firstBuilding.style.left = 0;
		}
		this.firstBuilding.style.width = firstBuildingWidth + 'px';
		this.firstBuilding.style.height = this.secondBuilding.style.height;
	}


	// Second Building
	var secondBuildingPosition = {},
		secondBuildingWidth;

	if (!this.isReversedMode) {
		secondBuildingPosition.x = utils.getRandomInt(firstBuildingWidth + 5, this.sceneWidth - this.minBuildingWidth);
		this.secondBuilding.style.right = '';
		this.secondBuilding.style.left = secondBuildingPosition.x + 'px';
		secondBuildingWidth = utils.getRandomInt(this.minBuildingWidth, this.sceneWidth - secondBuildingPosition.x);
		// mid-spot
		this.secondBuildingMidSpot.style.left = secondBuildingPosition.x + (secondBuildingWidth / 2) - 3 + 'px';
	} else {
		this.secondBuilding.style.left = '';
		this.secondBuilding.style.right = 0;
		secondBuildingWidth = utils.getRandomInt(this.minBuildingWidth, this.sceneWidth / 2);

		this.firstBuilding.style.left = utils.getRandomInt(this.minBuildingWidth, this.sceneWidth - secondBuildingWidth - 5 - utils.pI(this.firstBuilding.style.width)) + 'px';
		this.firstBuilding.style.width = utils.getRandomInt(this.minBuildingWidth, this.sceneWidth - secondBuildingWidth - 5);
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
	game.highestScoreElement.innerHTML = currentScore
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


function J(){this.B=function(e){for(var f=0;24>f;f++)this[String.fromCharCode(97+f)]=e[f]||0;0.01>this.c&&(this.c=0.01);e=this.b+this.c+this.e;0.18>e&&(e=0.18/e,this.b*=e,this.c*=e,this.e*=e)}}
var W=new function(){this.A=new J;var e,f,d,g,l,z,K,L,M,A,m,N;this.reset=function(){var c=this.A;g=100/(c.f*c.f+0.001);l=100/(c.g*c.g+0.001);z=1-0.01*c.h*c.h*c.h;K=1E-6*-c.i*c.i*c.i;c.a||(m=0.5-c.n/2,N=5E-5*-c.o);L=0<c.l?1-0.9*c.l*c.l:1+10*c.l*c.l;M=0;A=1==c.m?0:2E4*(1-c.m)*(1-c.m)+32};this.D=function(){this.reset();var c=this.A;e=1E5*c.b*c.b;f=1E5*c.c*c.c;d=1E5*c.e*c.e+10;return e+f+d|0};this.C=function(c,O){var a=this.A,P=1!=a.s||a.v,r=0.1*a.v*a.v,Q=1+3E-4*a.w,n=0.1*a.s*a.s*a.s,X=1+1E-4*a.t,Y=1!=
a.s,Z=a.x*a.x,$=a.g,R=a.q||a.r,aa=0.2*a.r*a.r*a.r,D=a.q*a.q*(0>a.q?-1020:1020),S=a.p?(2E4*(1-a.p)*(1-a.p)|0)+32:0,ba=a.d,T=a.j/2,ca=0.01*a.k*a.k,E=a.a,F=e,da=1/e,ea=1/f,fa=1/d,a=5/(1+20*a.u*a.u)*(0.01+n);0.8<a&&(a=0.8);for(var a=1-a,G=!1,U=0,v=0,w=0,B=0,t=0,x,u=0,h,p=0,s,H=0,b,V=0,q,I=0,C=Array(1024),y=Array(32),k=C.length;k--;)C[k]=0;for(k=y.length;k--;)y[k]=2*Math.random()-1;for(k=0;k<O;k++){if(G)return k;S&&++V>=S&&(V=0,this.reset());A&&++M>=A&&(A=0,g*=L);z+=K;g*=z;g>l&&(g=l,0<$&&(G=!0));h=g;0<
T&&(I+=ca,h*=1+Math.sin(I)*T);h|=0;8>h&&(h=8);E||(m+=N,0>m?m=0:0.5<m&&(m=0.5));if(++v>F)switch(v=0,++U){case 1:F=f;break;case 2:F=d}switch(U){case 0:w=v*da;break;case 1:w=1+2*(1-v*ea)*ba;break;case 2:w=1-v*fa;break;case 3:w=0,G=!0}R&&(D+=aa,s=D|0,0>s?s=-s:1023<s&&(s=1023));P&&Q&&(r*=Q,1E-5>r?r=1E-5:0.1<r&&(r=0.1));q=0;for(var ga=8;ga--;){p++;if(p>=h&&(p%=h,3==E))for(x=y.length;x--;)y[x]=2*Math.random()-1;switch(E){case 0:b=p/h<m?0.5:-0.5;break;case 1:b=1-2*(p/h);break;case 2:b=p/h;b=0.5<b?6.28318531*
(b-1):6.28318531*b;b=0>b?1.27323954*b+0.405284735*b*b:1.27323954*b-0.405284735*b*b;b=0>b?0.225*(b*-b-b)+b:0.225*(b*b-b)+b;break;case 3:b=y[Math.abs(32*p/h|0)]}P&&(x=u,n*=X,0>n?n=0:0.1<n&&(n=0.1),Y?(t+=(b-u)*n,t*=a):(u=b,t=0),u+=t,B+=u-x,b=B*=1-r);R&&(C[H%1024]=b,b+=C[(H-s+1024)%1024],H++);q+=b}q=0.125*q*w*Z;c[k]=1<=q?32767:-1>=q?-32768:32767*q|0}return O}};
window.jsfxr=function(e){W.A.B(e);var f=W.D();e=new Uint8Array(4*((f+1)/2|0)+44);var f=2*W.C(new Uint16Array(e.buffer,44),f),d=new Uint32Array(e.buffer,0,44);d[0]=1179011410;d[1]=f+36;d[2]=1163280727;d[3]=544501094;d[4]=16;d[5]=65537;d[6]=44100;d[7]=88200;d[8]=1048578;d[9]=1635017060;d[10]=f;for(var f=f+44,d=0,g="data:audio/wav;base64,";d<f;d+=3)var l=e[d]<<16|e[d+1]<<8|e[d+2],g=g+("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"[l>>18]+"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"[l>>
12&63]+"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"[l>>6&63]+"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"[l&63]);d-=f;return g.slice(0,g.length-d)+"==".slice(0,d)};


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

	settings.forEach(function(s){
		var a = new Audio();
		a.src = jsfxr(s);

		sounds[sid].push(a);
	});
},
play = function(sid) {
	console.log(game.isSound)
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
