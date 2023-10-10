import Phaser from "phaser";

export default class Game extends Phaser.Scene {
  constructor() {
    super("game-scene");
  }

  preload() {}

  create() {
    const map = this.make.tilemap({ key: "main-map" });
    const tileset = map.addTilesetImage("phaser-tiles", "main-tiles"); // phaser-tiles is the name of the tileset in Tiled exported JSON

    // ground-layer is the name of the layer in Tiled exported JSON
    const worldLayer = map.createLayer("ground-layer", tileset);
    const wallsLayer = map.createLayer("walls-layer", tileset);

    // Collision
    wallsLayer?.setCollisionByProperty({ collides: true }); // Collides is a custom property for the tile map, set in Tiled

    const myPlayer = this.add.sprite(
      128,
      128,
      "character-sprite",
      "walk-down-0"
    ); // walk-down-0 is the name of the frame in the .json file

    // Create a default animation for the sprite
    this.anims.create({
      key: "character-idle-down",
      frames: [
        {
          key: "character-sprite",
          frame: "walk-down-0",
        },
      ],
    });

    // Walk animation for the sprite
    this.anims.create({
      key: "character-walk-down",
      frames: this.anims.generateFrameNames("character-sprite", {
        prefix: "walk-down-",
        start: 0,
        end: 3,
      }),
      frameRate: 10, // Animation speed
      repeat: -1, // Repeat forever
    });

    // Play the animation
    this.anims.play("character-walk-down", myPlayer);

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
  }

  update() {}
}
