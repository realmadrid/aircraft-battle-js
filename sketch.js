/**
 * @author Haotian Shi
 */

var canvas;
var playerImg, playerBulletImg, enemyBulletImg, bossBulletImg, primaryEnemyImg, mediumEnemyImg, advancedEnemyImg, bossImg;
var bg, player, boss;
var totalScore, scores, bulletNum;
var keepFiring;
var playerBullets, enemyBullets;
var readySprites;
var explosion;  // array of explosion effect frames
var gameFont;
var GAME_READY = 0;
var GAME_PLAYING = 1;
var GAME_OVER = 2;
var GAME_STATE;
var newGameBtn;  // button variable for new game and reset game
var leaderTitle = ['1st', '2nd', '3rd', '4th', '5th'];

/**
 * Load image resources and font
 */
function preload() {
    bg = loadImage('assets/bg.jpg');
    playerImg = loadImage('assets/player.png');
    playerBulletImg = loadImage('assets/bullet1.png');
    enemyBulletImg = loadImage('assets/bullet2.png');
    bossBulletImg = loadImage('assets/bullet3.png');
    primaryEnemyImg = loadImage('assets/enemy1.png');
    mediumEnemyImg = loadImage('assets/enemy2.png');
    advancedEnemyImg = loadImage('assets/enemy3.png');
    bossImg = loadImage('assets/enemy4.png');
    explosion = [
        loadImage('assets/explosion_1.png'),
        loadImage('assets/explosion_3.png'),
        loadImage('assets/explosion_5.png'),
        loadImage('assets/explosion_7.png'),
        loadImage('assets/explosion_9.png'),
        loadImage('assets/explosion_11.png'),
        loadImage('assets/explosion_13.png'),
        loadImage('assets/explosion_15.png')
    ];

    gameFont = loadFont('assets/PoetsenOne-Regular.ttf');
}

function setup() {
    canvas = createCanvas(600, windowHeight);
    canvas.position((windowWidth - 600) / 2, 0);
    makeGameBtn('New Game', canvas.x + 230, 590, newGame);
    scores = new Array();

    GAME_STATE = GAME_READY;
    resetVariables();
}

/**
 * Draw the game according to game state
 */
function draw() {
    background(bg);

    if (GAME_STATE == GAME_READY) {
        drawGameReady();
    } else if (GAME_STATE == GAME_PLAYING) {
        drawGamePlaying();
    } else {
        drawGameOver();
    }
}

function newGame() {
    GAME_STATE = GAME_PLAYING;
    newGameBtn.hide();
    newGameBtn = null;
}

function resetGame() {
    // reset the game
    resetVariables();
    newGameBtn.hide();
    newGameBtn = null;
    GAME_STATE = GAME_PLAYING;
}

function resetVariables() {
    player = new Player();
    boss = null;
    totalScore = 0;
    playerBullets = new Array();
    enemyBullets = new Array();
    readySprites = new Array();
    keepFiring = false;
    bulletNum = 400;
}

function drawGameReady() {
    stroke("#DDDDDD");
    strokeWeight(8);
    fill(51, 153, 238);
    textFont(gameFont, 70);
    text("Aircraft Battle", 70, 250);
    textSize(30);
    text("Press F to fire", 220, 450);
    text("Press arrow keys to move", 150, 500);
    text("See the leaderboard after game over", 60, 550);
}

function drawGamePlaying() {
    stroke("#DDDDDD");
    strokeWeight(8);
    fill(51, 153, 238);
    textFont(gameFont, 30);
    text("Hp: " + player.hp, 70, 40);
    text("Bullets: " + bulletNum, 200, 40);
    text("Score: " + totalScore, canvas.width - 180, 40);

    keyboardListener();

    removeDestroyedSprites();
    removeDestroyedBullets();

    player.draw();
    readySprites.forEach(s => {
        checkCollideWithEnemy(s);
        s.draw();
    });

    if (frameCount % 40 == 0) {
        generateEnemy();
    }

    // generate the boss plane when the score reaches 300
    if (totalScore > 300 && boss == null) {
        generateBossEnemy();
    }

    if (keepFiring && bulletNum > 0 && !player.destroyed && frameCount % 8 == 0) {
        player.fire();
    }

    enemyFire();

    player.bullets.forEach(b => b.draw());
    enemyBullets.forEach(b => b.draw());
}

function drawGameOver() {
    stroke("#DDDDDD");
    strokeWeight(8);
    fill(51, 153, 238);
    textFont(gameFont, 70);
    text("Leaderboard", 80, 150);
    textSize(40);
    scores.sort(sortNumber);
    for (var i = 0; i < Math.min(5, scores.length); i++) {
        text(leaderTitle[i] + ': ' + scores[i], 230, 250 + 80 * i);
    }
    if (newGameBtn == null) {
        makeGameBtn('Reset Game', canvas.x + 230, 650, resetGame);
    }
}

/**
 * Setup the css style of buttons
 */
function makeGameBtn(name, x, y, func) {
    newGameBtn = createButton(name);
    newGameBtn.mousePressed(func);
    newGameBtn.position(x, y);
    newGameBtn.style('background-color', '#008CBA');
    newGameBtn.style('border', 'none');
    newGameBtn.style('color', 'white');
    newGameBtn.style('padding', '15px 32px');
    newGameBtn.style('text-align', 'center');
    newGameBtn.style('display', 'inline-block');
    newGameBtn.style('font-size', '18px');
}

/**
 * Basic sprite class
 */
function Sprite() {
    this.name = "Sprite";
    this.x = 0;
    this.y = 0;
    this.speed = 1;
    this.img = null;
    this.destroyed = false;

    this.draw = function () {
        if (!this.destroyed) {
            this.beforeDraw();
            image(this.img, this.x, this.y, this.img.width, this.img.height);
            this.afterDraw();
        }
    }

    this.beforeDraw = function () { }
    this.afterDraw = function () { }

    this.collideWith = function (other) {
        if (this.x < other.x + other.img.width && this.x + this.img.width > other.x &&
            this.y < other.y + other.img.height && this.y + this.img.height > other.y)
            return true;
        return false;
    }

    this.centerTo = function (x, y) {
        this.x = x - this.img.width / 2;
        this.y = y - this.img.height / 2;
    }
}

function Player() {
    Sprite.call(this);
    this.name = "Player";
    this.img = playerImg;
    this.x = (canvas.width - this.img.width) / 2;
    this.y = windowHeight - 200;
    this.hp = 10;
    this.bullets = new Array();

    this.afterDraw = function () {
        if (!this.destroyed) {
            // detect whether player plane is hit by enemy bullets
            getActiveEnemyBullets().forEach(b => {
                if (this.collideWith(b)) {
                    b.destroyed = true;
                    this.hp -= b.damage;
                }
            });

            // check whether the player plane is died
            if (this.hp <= 0) {
                this.explode();
            }
        }
    }

    this.fire = function () {
        var b = new PlayerBullet(playerBulletImg);
        this.bullets.push(b);
        bulletNum--;
    }

    this.explode = function () {
        // implement explosion animation
        var e = new Explosion(0);
        e.x = this.x + this.img.width / 2;
        e.y = this.y;
        readySprites.push(e);
        this.destroyed = true;
        scores.push(totalScore);
        GAME_STATE = GAME_OVER;
    }
}

function BaseEnemy() {
    Sprite.call(this);
    this.name = "BaseEnemy";
    this.img = primaryEnemyImg;
    this.hp = 2;
    this.score = 10;
    this.speed = 5;

    this.beforeDraw = function () {
        this.y += this.speed;
    }

    this.afterDraw = function () {
        if (this.y > windowHeight || this.y + this.img.height < 0) {
            this.destroyed = true;
            console.log("Base level destroy " + this.name);
        }

        if (!this.destroyed) {
            // detect whether this enemy plane is hit by the player bullets
            var bullets = getActivePlayerBullets();
            for (var i = 0; i < bullets.length; i++) {
                if (this.collideWith(bullets[i])) {
                    bullets[i].destroyed = true;
                    this.hp -= bullets[i].damage;
                }
            }

            if (this.hp <= 0) {
                this.hp = 0;
                this.explode();
            }
        }
    }

    this.explode = function () {
        // implement explosion animation
        var e = new Explosion(this.speed);
        e.x = this.x + (this.img.width - e.img.width) / 2;
        e.y = this.y;
        readySprites.push(e);
        totalScore += this.score;
        this.destroyed = true;
    }

}

function MediumEnemy() {
    BaseEnemy.call(this);
    this.name = "MediumEnemy";
    this.img = mediumEnemyImg;
    this.hp = 3;
    this.score = 30;
    this.speed = 6;
}

function AdvancedEnemy() {
    BaseEnemy.call(this);
    this.name = "AdvancedEnemy";
    this.img = advancedEnemyImg;
    this.hp = 6;
    this.score = 100;
    this.speed = 4;
}

function BossEnemy() {
    BaseEnemy.call(this);
    this.name = "BossEnemy";
    this.img = bossImg;
    this.hp = 100;
    this.score = 2000;
    this.speed = 2;
    this.readyToFire = false;
    this.direction = 1;

    this.beforeDraw = function () {
        if (this.y < this.img.height / 2) {
            this.y += this.speed;
        } else {
            if (!this.readyToFire) {
                this.readyToFire = true;
            }

            if (this.x + this.img.width >= canvas.width || this.x <= 0) {
                this.direction *= -1;
            }

            this.x += this.direction * this.speed;
        }
    }

    this.isReadyToFire = function () {
        return !this.destroyed && this.hp > 0 && this.readyToFire;
    }
}

function Explosion(planeSpeed) {
    Sprite.call(this);
    this.name = "Explosion";
    this.img = explosion[0];
    this.speed = planeSpeed;
    this.frame = 0;
    this.frameIndex = 0;
    this.totalFrames = 8;

    this.beforeDraw = function () {
        this.y += this.speed;
    }

    this.afterDraw = function () {
        this.frame++;
        if (!this.destroyed) {
            // slide to the next explosion image every 4 frames
            if (this.frame % 4 == 0) {
                ++this.frameIndex;
                if (this.frameIndex >= this.totalFrames) {
                    this.destroyed = true;
                } else {
                    this.img = explosion[this.frameIndex];
                }
            }
        }

    }
}

function Bullet() {
    Sprite.call(this);
    this.name = "Bullet";
    this.damage = 1;

    this.beforeDraw = function () {
        this.y += this.speed;
    }

    this.afterDraw = function () {
        if (this.y > windowHeight || this.y < -5) {
            this.destroyed = true;
        }
    }
}

function PlayerBullet() {
    Bullet.call(this);
    this.name = "PlayerBullet";
    this.img = playerBulletImg;
    this.speed = -12;
    this.damage = 1;
    this.x = player.x + player.img.width / 2 - 5;
    this.y = player.y - 15;
}

function EnemyBullet() {
    Bullet.call(this);
    this.name = "EnemyBullet";
    this.img = enemyBulletImg;
    this.speed = 12;
    this.damage = 1;
}

function BossBullet() {
    EnemyBullet.call(this);
    this.name = "BossBullet";
    this.img = bossBulletImg;
    this.speed = 5;
    this.damage = 2;
}

function generateEnemy() {
    var enemy;
    var type = Math.floor(Math.random() * 20);  // returns a random integer from 0 to 19
    if (type < 12) {
        // generate primary level enemy
        enemy = new BaseEnemy();
    }
    else if (type < 18) {
        // generate medium level enemy
        enemy = new MediumEnemy();
    } else {
        // generate advanced level enemy
        enemy = new AdvancedEnemy();
    }
    enemy.x = Math.floor(Math.random() * (canvas.width - enemy.img.width));
    enemy.y = -enemy.img.height;
    readySprites.push(enemy);
}

function generateBossEnemy() {
    boss = new BossEnemy();
    boss.x = (canvas.width - boss.img.width) / 2;
    boss.y = -boss.img.height;
    readySprites.push(boss);
}

function getActivePlayerBullets() {
    var b = new Array();
    for (var i = 0; i < player.bullets.length; i++) {
        if (player.bullets[i].name == "PlayerBullet" && !player.bullets[i].destroyed) {
            b.push(player.bullets[i]);
        }
    }
    return b;
}

function getActiveEnemyBullets() {
    var bs = new Array();
    enemyBullets.forEach(b => {
        if (!b.destroyed) {
            bs.push(b);
        }
    });
    return bs;
}

function removeDestroyedSprites() {
    // remove destroyed sprites from readySprites
    var rs = readySprites.slice();
    readySprites = new Array();
    rs.forEach(s => {
        if (!s.destroyed) {
            readySprites.push(s);
        }
    });
}

function removeDestroyedBullets() {
    // remove destroyed player bullets
    var pb = player.bullets.slice();
    player.bullets = new Array();
    pb.forEach(b => {
        if (!b.destroyed) {
            player.bullets.push(b);
        }
    });

    // remove destroyed enemy bullets
    var eb = enemyBullets.slice();
    enemyBullets = new Array();
    eb.forEach(b => {
        if (!b.destroyed) {
            enemyBullets.push(b);
        }
    });
}

function checkCollideWithEnemy(s) {
    if (s.name.endsWith("Enemy") && player.collideWith(s)) {
        var hp = Math.min(player.hp, s.hp);
        player.hp -= hp;
        s.hp -= hp;
    }
}

function enemyFire() {
    if (boss != null && boss.isReadyToFire() && frameCount % 50 == 0) {
        var unitX = boss.img.width / 6;
        var bulletY = boss.y + boss.img.height;
        var left = new BossBullet();
        var right = new BossBullet();
        left.centerTo(boss.x + unitX, bulletY);
        right.centerTo(boss.x + boss.img.width - unitX, bulletY);
        enemyBullets.push(left);
        enemyBullets.push(right);
    }

    if (frameCount % 55 == 0) {
        readySprites.forEach(s => {
            if (s.name == "AdvancedEnemy" && !s.destroyed) {
                var b = new EnemyBullet();
                b.x = s.x + s.img.width / 2 - 3;
                b.y = s.y + s.img.height;
                enemyBullets.push(b);
            }
        });
        // readySprites.push(...eb);
    }

}

function sortNumber(a, b) {
    return b - a;
}

// for info on handling key presses, see the FAQ:
// https://cs.anu.edu.au/courses/comp1720/assignments/03-simple-arcade-game/#handling-keypresses

function mousePressed() {
    // your "mouse pressed" code goes here
}

// reference https://p5js.org/reference/#/p5/keyIsDown
function keyboardListener() {
    if (keyIsDown(LEFT_ARROW)) {
        player.x -= 7.5;
    }
    if (keyIsDown(RIGHT_ARROW)) {
        player.x += 7.5;
    }
    if (keyIsDown(UP_ARROW)) {
        player.y -= 7;
    }
    if (keyIsDown(DOWN_ARROW)) {
        player.y += 7;
    }
    if (keyIsDown(70)) {  // key F
        keepFiring = true;
    }
}

function keyReleased() {
  if (keyCode == 70) {  // key F released
      keepFiring = false;
  }
}
