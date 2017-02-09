var bgColors = [0xF16745, 0xFFC65D, 0x7BC8A4];

var tunnelWidth = 256;
var game;
var swipeDistance = 10;
//barriers
var barrierSpeed = 200;
var barrierGap = 120; //pixels
var wheel, rewind;
var cursors;
var colors;
var i = 0;
var p = null;
var score = 0;
var scoreText, text;
var counter;
var tween;
var bounceSound, changeColor, coinCollect, mainSong;
var collect, hit, bounce;
var starExists = true;
var velocBlue, velocGreen, velocPurple, velocYell;
var emitter;
var currentBall;
var blocks = [];

var savedData;
var localStorageName = "phaserCA3";

//new
var colors = [0xfffc00, 0x7200ff, 0x7200ff, 0x00ccff];
var i = ["yellowBall", "greenBall", "purpleBall","blueBall"];

window.onload = function() {	
	game = new Phaser.Game(405, 900, Phaser.AUTO, "");
    game.state.add("Boot", boot);
    game.state.add("Preload", preload); 
    game.state.add("TitleScreen", titleScreen);
    game.state.add("PlayGame", playGame);
    game.state.add("GameOverScreen", gameOverScreen);
    game.state.start("Boot");
}

var boot = function(game){};
boot.prototype = {
  	preload: function(){
		console.log("===Boot state preload function");
        this.game.load.image("loading", "assets/sprites/loading.png");
	},
    
    create: function(){
		console.log("==boot state. create function");
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.game.state.start("Preload");
	}
}

var preload = function(game){};
preload.prototype = {
    preload: function() {
        console.log("==preload state. preload function");
            
        //color wheel image
        game.load.image("wheel", "assets/sprites/wheel2.png");
        //Star image
        game.load.image('star', 'assets/sprites/star.png');
        //Rewind button
        game.load.image('rewind', 'assets/sprites/arrows32.png');
        //gameOver
        game.load.image('gameOver', 'assets/sprites/gameOver.png');
        //Emitter
        game.load.image("emitter", "assets/sprites/emitter.png", 32, 32); 
        //Trophy
        game.load.image('trophy', "assets/sprites/cup.png");
        //ball images
        game.load.image("blueBall", "assets/sprites/blueBall.png"); 
        game.load.image('greenBall', 'assets/sprites/greenBall.png'); 
        game.load.image('yellowBall', 'assets/sprites/yellowBall.png'); 
        game.load.image('purpleBall', 'assets/sprites/purpleBall.png'); 
        //block images
        game.load.image('yellowBlock', 'assets/sprites/yellowBlock.png');
        game.load.image('purpleBlock', 'assets/sprites/purpleBlock.png');
        game.load.image('greenBlock', 'assets/sprites/greenBlock.png');
        game.load.image('blueBlock', 'assets/sprites/blueBlock.png');
        //Titlescreen images
        game.load.image('logo', 'assets/sprites/logo4.png');
        game.load.image('press3', 'assets/sprites/press3.png');
        game.load.image('hit', 'assets/sprites/hit.png');
        game.load.image('bounce', 'assets/sprites/bounce.png');
        game.load.image('collect', 'assets/sprites/collect.png');
        
        //Sounds
        game.load.audio('jumping', 'assets/sounds/jumping.wav');
        game.load.audio('changeColor', 'assets/sounds/changeColor.mp3');
        game.load.audio('coinCollect', 'assets/sounds/coin.wav');
        game.load.audio('mainSong', 'assets/sounds/mainSong.wav');
        
    },
    
    create: function() {
        this.game.state.start("TitleScreen");
        console.log("===preload state. create function");
    }
}

var titleScreen = function(game){};
titleScreen.prototype = { 
    create: function() {
        console.log("==title Screen state. create function");
        
        //Draw images to screen
        var image = game.add.image(40, 100, 'logo');
        var start = game.add.image(60, 500, 'press3');

        // Change the background color of the game to black
        game.stage.backgroundColor = '#000000'; 

        //Draw the images to the canvas and give them a width
        this.yellowBlock = game.add.sprite(0, 350, 'yellowBlock');
        this.yellowBlock.width = 135;
        this.greenBlock = game.add.sprite(135, 350, 'greenBlock');
        this.greenBlock.width = 135;
        this.purpleBlock = game.add.sprite(270, 350, 'purpleBlock');
        this.purpleBlock.width = 135;
        this.blueBlock = game.add.sprite(405, 350, 'blueBlock');
        this.blueBlock.width = 135;

        //Add arcade physics to blocks
        game.physics.arcade.enable(this.yellowBlock);
        game.physics.arcade.enable(this.greenBlock);
        game.physics.arcade.enable(this.purpleBlock);
        game.physics.arcade.enable(this.blueBlock);

        // Move the blocks across the screen 
        this.yellowBlock.body.velocity.x = -150;
        this.greenBlock.body.velocity.x = -150;
        this.purpleBlock.body.velocity.x = -150;
        this.blueBlock.body.velocity.x = -150;
        
        //Set score to 0
        score = 0;
        highscore = score;
        
        // Call the 'jump' function when the spacekey is hit
        var spacekey = game.input.keyboard.addKey(
                    Phaser.Keyboard.SPACEBAR);
        spacekey.onDown.add(this.startGame, this);   
        
        //Main background music
        //mainSong = game.add.audio('mainSong');
        //mainSong.play();      
    },
    
    startGame: function() {
        console.log("button pressed");
        this.game.state.start("PlayGame");
    },

    update: function() {
        //Blocks wrap the screen 
        game.world.wrap(this.yellowBlock, 0, true);
        game.world.wrap(this.greenBlock, 0, true);
        game.world.wrap(this.blueBlock, 0, true);
        game.world.wrap(this.purpleBlock, 0, true);
    },
}

var playGame = function(game){};
playGame.prototype = {
    create: function() {
        console.log("==playGame state. Create method");

        var highScore = localStorage.getItem('highscore');

        //emitter
        emitter = game.add.emitter(0, 0, 100);
        emitter.gravity = 200;
        
        //Change the background color of the game to black
        game.stage.backgroundColor = '#000000';
        
        //Draw images to the screen
        this.bounce = game.add.image(70, 560, 'bounce');
        this.hit = game.add.image(10, 630, 'hit');
        this.collect = game.add.image(60, 700, 'collect');
        
        //Set the physics system
        game.physics.startSystem(Phaser.Physics.ARCADE);

        //Display the ball
        this.blueBall = game.add.sprite(game.world.width/2, 475 , 'blueBall');
        this.currentBall = this.blueBall;
        
        //Draw the blocks to the screen with a set width
        this.yellowBlock = game.add.sprite(0, 350, 'yellowBlock');
        this.yellowBlock.width = 135;
        this.greenBlock = game.add.sprite(135, 350, 'greenBlock');
        this.greenBlock.width = 135;
        this.purpleBlock = game.add.sprite(270, 350, 'purpleBlock');
        this.purpleBlock.width = 135;
        this.blueBlock = game.add.sprite(405, 350, 'blueBlock');
        this.blueBlock.width = 135;
        
        //GameOver collision sprite
        this.gameOver = game.add.sprite(0, 800, 'gameOver');
        
        //Draw the wheel to the screen
        this.wheel = game.add.sprite(game.world.width/2+10, 0, 'wheel');
        //Add a tween to the wheel to make it drop into the game
        tween = game.add.tween(this.wheel).to( { y: 125}, 1000, Phaser.Easing.Bounce.Out, true);
        //Add on anchor to the wheel to rotate it
        this.wheel.anchor.setTo(0.5, 0.5);

        //soundFX
        bounceSound = game.add.audio('jumping');
        changeSound = game.add.audio('changeColor');
        coinCollect = game.add.audio('coinCollect');
        //mainSong = game.add.audio('mainSong');
        
        // Add physics to the ball and blocks
        // Needed for: movements, gravity, collisions, etc.
        game.physics.arcade.enable(this.blueBall);
        game.physics.arcade.enable(this.wheel);
        game.physics.arcade.enable(this.yellowBlock);
        game.physics.arcade.enable(this.greenBlock);
        game.physics.arcade.enable(this.purpleBlock);
        game.physics.arcade.enable(this.blueBlock);
        game.physics.arcade.enable(this.gameOver);
        
        //Run the stars function to make a star appear at the start of the game
        this.stars();

        // Add gravity to the ball to make it fall
        this.blueBall.body.gravity.y = 1000; 
     
        // Move the blocks across the screen 
        velocYell = this.yellowBlock.body.velocity.x=-150;
        velocGreen = this.greenBlock.body.velocity.x=-150;
        velocPurple = this.purpleBlock.body.velocity.x=-150;
        velocBlue = this.blueBlock.body.velocity.x=-150;

        //Call the 'jump' function when the spacekey is hit
        var spaceKey = game.input.keyboard.addKey(
                        Phaser.Keyboard.SPACEBAR);
        spaceKey.onDown.add(this.jump, this);    

        //Every 10seconds the rewind icon will appear
        //this.timer = game.time.events.loop(10000, this.rewinds, this); 

        //Score counter
        scoreText = game.add.text(60, 16, ' 0', { fontSize: '28px', fill: '#ffffff' });
        this.scoreStar = game.add.sprite(15, 15, 'star');
        this.scoreStar.width = 30;
        this.scoreStar.height = 30;    

        savedData = localStorage.getItem(localStorageName)==null?{score:0}:JSON.parse(localStorage.getItem(localStorageName));
        console.log(savedData);
        //Highscore
        highscore = game.add.text(360, 18, ' 0', { fontSize: '28px', fill: '#ffffff' });
        this.trophy = game.add.sprite(320, 18, 'trophy');
        this.trophy.width = 30;
        this.trophy.height = 30;        
    },
       
    update: function() {
        // If the ball is out of the screen (too high or too low)
        // Call the 'restartGame' function
        if (this.currentBall.y < 0 || this.currentBall.y > 800){
            this.restartGame();
        }  
   
        
        //Collision for blue ball
        game.physics.arcade.overlap(
        this.blueBall, this.yellowBlock, this.restartGame, null, this);

        game.physics.arcade.overlap(
        this.blueBall, this.greenBlock, this.restartGame, null, this);

        game.physics.arcade.overlap(
        this.blueBall, this.purpleBlock, this.restartGame, null, this);

        game.physics.arcade.overlap(
        this.blueBall, this.wheel, this.change, null, this);

        game.physics.arcade.overlap(
        this.blueBall, this.blueBlock, this.increaseSpeed, null, this);  

        game.physics.arcade.overlap(
        this.blueBall, this.star, this.killStar, null, this);
        
        
        
        //Collision for purple ball
        game.physics.arcade.overlap(
        this.purpleBall, this.yellowBlock, this.restartGame, null, this);

        game.physics.arcade.overlap(
        this.purpleBall, this.greenBlock, this.restartGame, null, this);

        game.physics.arcade.overlap(
        this.purpleBall, this.blueBlock, this.restartGame, null, this);

        game.physics.arcade.overlap(
        this.purpleBall, this.wheel, this.change2, null, this);

        game.physics.arcade.overlap(
        this.purpleBall, this.purpleBlock, this.increaseSpeed, null, this);

        game.physics.arcade.overlap(
        this.purpleBall, this.star, this.killStar, null, this);
        
        game.physics.arcade.overlap(
        this.purpleBall, this.gameOver, this.restartGame, null, this);
        


        //Collision for yellow ball
        game.physics.arcade.overlap(
        this.yellowBall, this.blueBlock, this.restartGame, null, this);

        game.physics.arcade.overlap(
        this.yellowBall, this.greenBlock, this.restartGame, null, this);

        game.physics.arcade.overlap(
        this.yellowBall, this.purpleBlock, this.restartGame, null, this);

        game.physics.arcade.overlap(
        this.yellowBall, this.wheel, this.change3, null, this);

        game.physics.arcade.overlap(
        this.yellowBall, this.yellowBlock, this.increaseSpeed, null, this);

        game.physics.arcade.overlap(
        this.yellowBall, this.star, this.killStar, null, this);
        
        game.physics.arcade.overlap(
        this.yellowBall, this.gameOver, this.restartGame, null, this);
        
        

        //Collision for green ball
        game.physics.arcade.overlap(
        this.greenBall, this.yellowBlock, this.restartGame, null, this);

        game.physics.arcade.overlap(
        this.greenBall, this.purpleBlock, this.restartGame, null, this);

        game.physics.arcade.overlap(
        this.greenBall, this.blueBlock, this.restartGame, null, this);

        game.physics.arcade.overlap(
        this.greenBall, this.wheel, this.change4, null, this);

        game.physics.arcade.overlap(
        this.greenBall, this.greenBlock, this.increaseSpeed, null, this);

        game.physics.arcade.overlap(
        this.greenBall, this.star, this.killStar, null, this);
        
        game.physics.arcade.overlap(
        this.greenBall, this.gameOver, this.restartGame, null, this);
        

        
        //Rotate the wheel
        this.wheel.angle += 1.5;

        for (var slowDown = 0; score == 6 + slowDown; slowDown+=6){
            this.yellowBlock.body.velocity.x = velocYell;
            this.greenBlock.body.velocity.x = velocGreen;
            this.purpleBlock.body.velocity.x = velocPurple;
            this.blueBlock.body.velocity.x = velocBlue;
        }

        //game.world.wrap(this.pipe, 0, true);
        game.world.wrap(this.yellowBlock, 0, true);
        game.world.wrap(this.greenBlock, 0, true);
        game.world.wrap(this.blueBlock, 0, true);
        game.world.wrap(this.purpleBlock, 0, true); 
    },

    // Make the ball jump 
    jump: function() {
        // Add a vertical velocity to the ball
        bounceSound.play();
        this.blueBall.body.velocity.y = -350;
        this.purpleBall.body.velocity.y = -350;
        this.yellowBall.body.velocity.y = -350;
        this.greenBall.body.velocity.y = -350;   
    },

    //Change the ball to purple
    change: function() {
        if(starExists ==false){
            this.stars();
         }
        this.purpleBall = game.add.sprite(this.blueBall.x, this.blueBall.y, 'purpleBall');
        game.physics.arcade.enable(this.purpleBall);
        this.purpleBall.body.gravity.y = 1000; 
        this.blueBall.kill();
        changeSound.play();
        this.killText();

    },

    //Change the ball to yellow
    change2: function() {
        
        if(starExists ==false){
            this.stars();
         }
        this.yellowBall = game.add.sprite(this.purpleBall.x, this.purpleBall.y, 'yellowBall');
        game.physics.arcade.enable(this.yellowBall);
        this.yellowBall.body.gravity.y = 1000; 
        this.purpleBall.kill();
        changeSound.play();
    },

    //Change the ball to green
    change3: function() {
        
        if(starExists ==false){
            this.stars();
         }
        this.greenBall = game.add.sprite(this.yellowBall.x, this.yellowBall.y, 'greenBall');
        game.physics.arcade.enable(this.greenBall);
        this.greenBall.body.gravity.y = 1000; 
        this.yellowBall.kill(); 
        changeSound.play();
    },

    //Change the ball to blue
    change4: function() {

        if(starExists == false){
            this.stars();
         }
        this.blueBall = game.add.sprite(this.greenBall.x, this.greenBall.y, 'blueBall');
        game.physics.arcade.enable(this.blueBall);
        this.blueBall.body.gravity.y = 1000; 
        this.greenBall.kill();
        changeSound.play();
    },

    //Icrease the speed of the blocks
    increaseSpeed: function() {
        // Move the blocks across the screen 
        this.yellowBlock.body.velocity.x -= 5;
        this.greenBlock.body.velocity.x -= 5;
        this.purpleBlock.body.velocity.x -= 5;
        this.blueBlock.body.velocity.x -= 5;
    },
       

       
    //Set the blocks to their original speed 
    slowDown: function() {
        this.yellowBlock.body.velocity.x = velocYell;
        this.greenBlock.body.velocity.x = velocGreen;
        this.purpleBlock.body.velocity.x = velocPurple;
        this.blueBlock.body.velocity.x = velocBlue;
    },

    //Draw stars on the screen 
    stars: function(){
        //Draw star to the screen
        this.star = game.add.sprite(game.world.width/2 - 10, 430, 'star');
        game.physics.arcade.enable(this.star);
        starExists=true;
    },
        
    //rewinds: function(){
        //Draw rewind icon to the screen
      //  this.rewind = game.add.sprite(game.world.width/2-10, 500, 'rewind');
       // game.physics.arcade.enable(this.rewind);
   // },

    //Delete the star from the screen
    killStar: function(){
        //  Add and update the score
        score = score + 1;
        scoreText.text = score;
        //highscore = score;
        this.star.kill();
        starExists = false;
        coinCollect.play();

    },
       
    //Delete the text from the screen 
    killText: function(){
        this.bounce.kill();
        this.collect.kill();
        this.hit.kill();
    },

    expolsion: function() {
   
        this.currentBall.kill();
        timer = game.time.create(false);
        timer.add(1000, this.restartGame, this);
        timer.start();
    },

    // Restart the game
    restartGame: function() {
        // Start the 'main' state, which restarts the game
        highscore = scoreText.text;
        game.state.start('TitleScreen');
        
    },

    particleBurst: function() {

        emitter.x = this.currentBall.x;
        emitter.y = this.currentBall.y;
        emitter.makeParticles('emitter',[0, 1, 2, 3, 4, 5]);
        emitter.start(true, 4000, null, 10);

    },
    
    destroyEmitter: function() {

        this.emitter.destroy();
    },

 };  


var gameOverScreen = function(game) {}
    gameOverScreen.prototype = {
        create: function() {
            console.log("==gameOverScreen state. Create method");
            highscore;
        }
}

