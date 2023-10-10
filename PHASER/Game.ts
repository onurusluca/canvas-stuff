import Phaser from "phaser";

const PLAYER_SPEED = 15;
const PLAYER_SCALE = 1.5;
let playerX = window.innerWidth / 2;
let playerY = window.innerHeight / 2;

export default class Game extends Phaser.Scene {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private myPlayer!: Phaser.Physics.Arcade.Sprite;
  private fpsText!: Phaser.GameObjects.Text;
  private frameTimes: number[] = [];
  private frameTimeWindow!: number;
  constructor() {
    super("game-scene");
  }

  preload() {}

  create() {
    const map = this.make.tilemap({ key: "main-map" });
    const tileset = map.addTilesetImage("phaser-tiles", "main-tiles", 16, 16); // phaser-tiles is the name of the tileset in Tiled exported JSON

    // ground-layer is the name of the layer in Tiled exported JSON
    const worldLayer = map.createLayer("ground-layer", tileset!);
    const wallsLayer = map.createLayer("walls-layer", tileset!);

    // Collision
    wallsLayer!.setCollisionByProperty({ collides: true }); // Collides is a custom property for the tile map, set in Tiled

    this.myPlayer = this.physics.add.sprite(
      playerX, // x
      playerY, // y
      "character-sprite",
      "walk-down-0"
    ); // walk-down-0 is the name of the frame in the .json file
    this.myPlayer.setScale(PLAYER_SCALE);

    // Walk animation
    const directions = ["down", "up", "left", "right"];
    directions.forEach((direction) => {
      this.anims.create({
        key: `character-walk-${direction}`,
        frames: this.anims.generateFrameNames("character-sprite", {
          prefix: `walk-${direction}-`,
          start: 0,
          end: 3,
        }),
        frameRate: 10,
        repeat: -1,
      });
    });

    // Idle animation
    directions.forEach((direction) => {
      this.anims.create({
        key: `character-idle-${direction}`,
        frames: [
          {
            key: "character-sprite",
            frame: `walk-${direction}-0`,
          },
        ],
      });
    });

    // Movement
    this.cursors = this.input.keyboard!.createCursorKeys();

    // Add collision between player and walls
    this.physics.add.collider(this.myPlayer, wallsLayer!);

    // Camera follows player
    this.cameras.main.startFollow(this.myPlayer, true);
    // this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    // Debug
    if (wallsLayer) {
      const debugGraphics = this.add.graphics().setAlpha(0.75);
      wallsLayer.renderDebug(debugGraphics, {
        tileColor: null, // Color of non-colliding tiles
        collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
        faceColor: new Phaser.Display.Color(40, 39, 37, 255), // Color of colliding face edges
      });
    } else {
      console.warn("The 'walls-layer' could not be found in the tilemap.");
    }

    // FPS
    this.fpsText = this.add.text(10, 10, "FPS: 0", {
      font: "bold 12px Arial ",
      fill: "#000",
    });
  }

  update(time: number, delta: number): void {
    // Movement
    if (!this.cursors) {
      console.warn("Cursors not found.");
      return;
    }

    const speed = PLAYER_SPEED * 10; /* * delta */

    if (this.cursors.left?.isDown) {
      this.myPlayer.setVelocity(-speed, 0);
      this.myPlayer.anims.play("character-walk-left", true);
    } else if (this.cursors.right?.isDown) {
      this.myPlayer.setVelocity(speed, 0);
      this.myPlayer.anims.play("character-walk-right", true);
    } else if (this.cursors.up?.isDown) {
      this.myPlayer.setVelocity(0, -speed);
      this.myPlayer.anims.play("character-walk-up", true);
    } else if (this.cursors.down?.isDown) {
      this.myPlayer.setVelocity(0, speed);
      this.myPlayer.anims.play("character-walk-down", true);
    } else {
      this.myPlayer.setVelocity(0, 0);
      const currentDirection = this.myPlayer.anims.currentAnim?.key;
      if (currentDirection) {
        const direction = currentDirection.split("-")[2];
        this.myPlayer.anims.play(`character-idle-${direction}`, true);
      }
    }

    // Update frameTimes
    this.frameTimes.push(delta);
    if (this.frameTimes.length > this.frameTimeWindow) {
      this.frameTimes.shift();
    }
    // Compute average frame time and convert to FPS
    const averageFrameTime =
      this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
    const fps = 1000 / averageFrameTime;

    // Update FPS text
    this.fpsText.setText(`FPS: ${Math.round(fps)}`);
  }
}

/* NOTES:
The TypeScript error about stuff being null is due to strict null checks in TypeScript configuration. Phaser is written in JavaScript, and when used it with TypeScript, TypeScript's static type checking cause issues with Phaser's JavaScript code.

Phaser is typically synced to the refresh rate of the display it's running on
*/
