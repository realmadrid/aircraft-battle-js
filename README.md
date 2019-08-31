## Aircraft Battle (JS)
This JavaScript game is adapted from my [Aircraft Battle (Android version)](https://github.com/realmadrid/aircraft-battle) which was inspired by Raiden, a series of vertical scrolling shooter arcade games. The goal of this game is to get a high score by destroying as many enemy planes as possible.

## Getting Started
This project is based on [p5.js](https://p5js.org/), a JS client-side library for creating graphic and interactive experiences. To run this game, you have to run a [local server](https://github.com/processing/p5.js/wiki/Local-server).

## How to play
* Player could press **LEFT_ARROW**, **RIGHT_ARROW**, **UP_ARROW** and **DOWN_ARROW** to move the player plane, and press **F** to fire bullets.
* There are four kinds of enemy planes: primary plane, medium plane, advanced plane and boss plane, among which advanced plane and boss plane could fire bullets to attack the player. The advanced plane fires one bullet each time and the damage is 1 while the boss fires two bullets with the damage of 2 for each.
* The player plane could only carry 400 bullets at maximum. Player should not press F to keep firing all the way.
* The player plane has 10 HP (health points). Player would loss if hitting by enemy's bullets or colliding with an enemy plane. Note that if the player plane collides with an enemy plane, the one who has lower HP would be destroyed. This means that player could collide with enemies to get points (when the bullets used up).
* The boss plane would appear only if the score has reached 300 or higher. (For the sake of assignment demonstration, game progression is moved forward, otherwise it's hard to see the boss plane)
* Player's HP, bullets remaining and total score are shown on the top of the canvas.
* The leaderboard will show only after game is over. It ranks the 5 highest scores.
* Player can reset the game on the leaderboard page.

## Design Summary
Everything that will be painted on the canvas is based on the class `Sprite`. Sprite encapsulates screen coordinates, image resource and a flag indicating whether the sprite is destroyed (be removed from the canvas).  
There are four types of things: Player, Enemy, Explosion, Bullet. They are distinct subclasses because their state transition across `frameCount` are different.  

|           | Movement       | Movement Direction |   Interactions    | Destruction Cause |  
|--------------|----------------|-----------------|-------------------|------------------|  
| Player  | Player input   | Vary             | Bullet, Enemy      | HP         |  
| Enemy   | Self regulated | Fixed / Vary    | Bullet, Player     | HP, Time   |  
| Explosion    | Follow destroyed object | Fixed  | No collision            | Time       |  
| Bullet       | Self regulated | Fixed           | Player / Enemy| HP, Time   |  


## Future Work
* I am intended to add some power-up awards in the game, such as bullet supplement, bullet power improvement, HP recover and so on. 
* Add various sound resources if I can find free assets that are suitable for the game.
