//will contain our game
var game;
//width of the tunnel
var tunnelWidth= 256;
//will contain colours for title screen background
var bgColors = [0xF16745, 0xFFC65D, 0x7BC8A4, 0x4CC3D9, 0x93648D, 0x7c786a, 0x588c73, 0x8c4646, 0x2a5b84, 0x73503c];

var shipHorizontalSpeed= 100;
var shipMoveDelay = 0;
var shipVerticalSpeed = 15000;
var swipeDistance = 10;
//barriers
var barrierSpeed = 200;
var barrierGap = 120; //pixels

window.onload = function() {	
     console.log("==window  on load event");
	game = new Phaser.Game(640, 960, Phaser.AUTO, "");
    //adding different states to the phaser game
    game.state.add("Boot", boot);
    game.state.add("Preload", preload); 
    game.state.add("TitleScreen", titleScreen);
    game.state.add("PlayGame", playGame);
    game.state.add("GameOverScreen", gameOverScreen);
    //kickstart the game with the Boot stae
    game.state.start("Boot");
    
};

// the boot state is an object with a prototype method and it accepts the game object as an argument
var boot = function(game){};
boot.prototype = {
    //preload function runs before the create function
  	preload: function(){
         console.log("==boot state. Preload method");
        //preloading an asset that will be a preloading bar
         this.game.load.image("loading","assets/sprites/loading.png"); 
	},
    //create function sets up how the gamescreen is positioned
  	create: function(){
         console.log("==boot state. Create method");
		game.scale.pageAlignHorizontally = true;
		game.scale.pageAlignVertically = true;
        //keeps original aspect ratio while maximising size in browser window
         game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		//triggering the next state
        this.game.state.start("Preload");
	}      
};

//preload state
var preload = function(game){};
preload.prototype = {
	preload: function(){
        console.log("==preload Screen state. Preload method");
          var loadingBar = this.add.sprite(game.width / 2, game.height / 2, "loading");
          //change the registration point to the center of graphic
          loadingBar.anchor.setTo(0.5, 0.5);
          game.load.setPreloadSprite(loadingBar);
            
          game.load.image("title", "assets/sprites/title.png");
          game.load.image("playbutton", "assets/sprites/playbutton.png");
          game.load.image("backsplash", "assets/sprites/backsplash.png");
            //tunnel graphics
          game.load.image("tunnelbg", "assets/sprites/tunnelbg.png");
          game.load.image("wall", "assets/sprites/wall.png");
        //Spaceship
        game.load.image("ship", "assets/sprites/ship.png");
        //smoke
        game.load.image("smoke", "assets/sprites/smoke.png");
        //barrier
        game.load.image("barrier", "assets/sprites/barrier.png");
        
	},
  	create: function(){
         console.log("==preload Screen state. Create method");
		this.game.state.start("TitleScreen");
	}
};
    
//titleScreen state    
var titleScreen = function(game){};
titleScreen.prototype = {  
     create: function(){  
         console.log("==title Screen state. Create method");
         
         //creating a tiled background from backsplash tile
         var titleBG = game.add.tileSprite(0, 0, game.width, game.height, "backsplash");
         titleBG.tint = bgColors[game.rnd.between(0, bgColors.length - 1)];
         console.log(titleBG.tint);

         var title = game.add.image(game.width / 2, 210, "title");
          title.anchor.set(0.5);
         
          game.stage.backgroundColor = bgColors[game.rnd.between(0, bgColors.length - 1)];
          var title = game.add.image(game.width / 2, 210, "title");
          title.anchor.set(0.5);
          
          var playButton = game.add.button(game.width / 2, game.height - 150, "playbutton", this.startGame);
          playButton.anchor.set(0.5);
               
         //adding a tween to the button
          var tween = game.add.tween(playButton).to({
               width: 220,
               height:220
          }, 1500, "Linear", true, 0, -1); 
          tween.yoyo(true);
     },
     //will be triggered by button interaction
     startGame: function(){
         console.log("==title Screen state. startGame method");
         game.state.start("PlayGame"); 
     }
};

var playGame = function(game) {}
    playGame.prototype = {
     create: function(){
          console.log("==playGame state. Create method");
        
         var tintColor = bgColors[game.rnd.between(0, bgColors.length - 1)]
         //tunnel
         var tunnelBG = game.add.tileSprite(0, 0, game.width, game.height, "tunnelbg");
         tunnelBG.tint = tintColor;
         //leftWall
         var leftWallBG = game.add.tileSprite(- tunnelWidth / 2, 0, game.width /2, game.height, "wall");
         leftWallBG.tint = tintColor;
         //right Wall
         var rightWallBG = game.add.tileSprite((game.width + tunnelWidth) / 2, 0, game.width / 2, game.height, "wall");
         rightWallBG.tint = tintColor;
         rightWallBG.tileScale.x = -1;
         
         
        // array of shipPosition, 2 members   
        this.shipPositions = [(game.width - tunnelWidth) / 2 + 32, (game.width + tunnelWidth) / 2 - 32];
        this.ship = game.add.sprite(this.shipPositions[0], 860, "ship");
        this.ship.side = 0;
        //boolean to check that ship can Move
        this.ship.canMove = true;
        this.ship.canSwipe = false;
         
         this.ship.anchor.set(0.5);
         //enable physice
        this.game.physics.enable(this.ship, Phaser.Physics.ARCADE);
        //react to tap or click
         game.input.onDown.add(this.moveShip, this);
         game.input.onUp.add(function() {
            this.ship.canSwipe = false;
         }, this);
         
         //smoke emitter
         this.smokeEmitter = game.add.emitter(this.ship.x, this.ship.y +10, 20);
         this.smokeEmitter.makeParticles("smoke");
         this.smokeEmitter.setXSpeed(-30,30);
         this.smokeEmitter.setYSpeed(50, 100);
         this.smokeEmitter.setAlpha(0.5,1);
         this.smokeEmitter.start(false, 1000,40);
         
         //ship rises over 15 seconds
         this.verticalTween = game.add.tween(this.ship).to({
             y:0
         }, shipVerticalSpeed, Phaser.Easing.Linear.None, true);
      
         
         //barrier Group
         this.barrierGroup = game.add.group();
         this.addBarrier(this.barrierGroup, tintColor);
         //adds a new Barrier instance to the game
     },
        
    moveShip: function(){
        this.ship.canSwipe = true;
        
        if(this.ship.canMove){
            this.ship.canMove = false;
            this.ship.side = 1 - this.ship.side; //toggles between 0 and 1.
            //add a tween to this.ship.side
            var horizontalTween = game.add.tween(this.ship).to({
            x: this.shipPositions[this.ship.side]
            }, shipHorizontalSpeed, Phaser.Easing.Linear.None, true);
            //on complete event
            horizontalTween.onComplete.add(function(){
                //add a delay
                game.time.events.add(shipMoveDelay, function(){
                    this.ship.canMove = true;
                }, this);
            }, this);
            
            
            //ghost ship effect
            var ghostShip = game.add.sprite(this.ship.x, this.ship.y, "ship");
            ghostShip.alpha = 0.5;
            ghostShip.anchor.set (0.5);
            //tween transparancy to 0 over 350 ms
           var ghostTween =  game.add.tween(ghostShip).to({
                alpha: 0                
            }, 350, Phaser.Easing.Linear.None, true);
            //destroy the ghostShip sprite
            ghostTween.onComplete.add(function() {
                ghostShip.destroy();
            });
  
        }
    },
    //emitter gets updated and follows the ship.
        
    update: function(){
        
        this.smokeEmitter.x = this.ship.x;
          this.smokeEmitter.y = this.ship.y;
        //check for swipe event 
        if (this.ship.canSwipe) {
              console.log("swipe")
            if (Phaser.Point.distance(game.input.activePointer.positionDown, game.input.activePointer.position) > swipeDistance) {
              
                this.restartShip();
            }
         }
        
        //collision detection
        game.physics.arcade.collide(this.ship, this.barrierGroup, function(s,b) {
            game.state.start("GameOverScreen");
        })
    },
        
    restartShip: function() {
        this.ship.canSwipe = false;
        this.verticalTween.stop();
        this.verticalTween = game.add.tween(this.ship).to({
            y: 860
        }, 100, Phaser.Easing.Linear.None, true);
        this.verticalTween.onComplete.add(function() {
            this.verticalTween = game.add.tween(this.ship).to({
              y:0
            }, shipVerticalSpeed, Phaser.Easing.Linear.None, true);
        }, this)
        
    },
        
    addBarrier: function(group, tintColor) {
        var barrier = new Barrier(game, barrierSpeed, tintColor);
        game.add.existing(barrier);
         //add it to the barrier group
        group.add(barrier);
    }
        
        
};


var gameOverScreen = function(game) {}
    gameOverScreen.prototype = {
        create: function() {
            console.log("==gameOverScreen state. Create method");
        }
}

//Barrier class that the spaceship has to avoid
Barrier = function (game, speed, tintColor) {
    
     var positions = [(game.width - tunnelWidth) / 2, (game.width + tunnelWidth) / 2];
     var position = game.rnd.between(0, 1);
	 //invokes creation of sprite object
     Phaser.Sprite.call(this, game, positions[position], -100, "barrier");
     //crop the barrier sprite according to the size of tunnelwidth 
     //1st create a crop Rectangle
     var cropRect = new Phaser.Rectangle(0, 0, tunnelWidth / 2, 24);
     //2nd enable crop the sprite with the rectangle 
     this.crop(cropRect);
	//enable ARCADE physics.
    game.physics.enable(this, Phaser.Physics.ARCADE);
     this.anchor.set(position, 0.5);
     this.tint = tintColor;     
    //assign a velocity to ARCADE bodies 
    this.body.velocity.y = speed;
    
    
    //swich to check if a new barrier should be placed
    this.placeBarrier = true;
};

//Barrier prototype inherits from Phaser.Sprite.prototype
Barrier.prototype = Object.create(Phaser.Sprite.prototype);
//the constructor  is the Barrier function;
Barrier.prototype.constructor = Barrier;

Barrier.prototype.update = function(){
  
  if (this.placeBarrier && this.y > barrierGap) {
        this.placeBarrier = false;
        //run addBarrier function, pass the parent in (the group) as 1st argument.
        playGame.prototype.addBarrier(this.parent, this.tint);
    }
    
    //checks if Barrier's position is below the canvas and destroys it. 
    if(this.y > game.height){
          this.destroy();
     }
}