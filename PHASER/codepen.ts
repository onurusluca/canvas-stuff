"use strict";

// LOADER
class PreloaderScene extends Phaser.Scene {
  private tileSetSprite: string;
  private mapJson: TileMap;
  private characterSprite: string;
  constructor(
    tileSetSprite: string,
    mapJson: TileMap,
    characterSprite: string
  ) {
    super("preloader-scene");
  }

  preload() {
    this.load.image(
      "main-tiles",
      "https://rznoqrxsbrfyzlrlfcvj.supabase.co/storage/v1/object/public/space-maps/tileset_nature-map.png"
    );
    this.load.tilemapTiledJSON(
      "main-map",
      "https://rznoqrxsbrfyzlrlfcvj.supabase.co/storage/v1/object/public/space-maps/nature-map.json"
    );

    // character-sprite-frame is same for all characters so it doesn't need to be passed in. Made with: https://asyed94.github.io/sprite-sheet-to-json/
    this.load.atlas(
      "character-sprite",
      "https://rznoqrxsbrfyzlrlfcvj.supabase.co/storage/v1/object/public/space-maps/dog.png?t=2023-05-29T06%3A32%3A23.958Z",
      "https://rznoqrxsbrfyzlrlfcvj.supabase.co/storage/v1/object/public/space-maps/character-sprite-frames.json?t=2023-05-29T06%3A29%3A33.289Z"
    );
  }

  create() {
    this.scene.start("game-scene");
  }

  update() {}
}

// HEALTHBAR
class PlayerHealthBar {
  private scene: Phaser.Scene;
  private health: number;
  private healthBar: Phaser.GameObjects.Graphics;
  private container: Phaser.GameObjects.Container; // added this

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    this.health = 100; // Assuming health is between 0 and 100

    this.healthBar = this.scene.add.graphics();
    this.container = this.scene.add.container(x, y); // added this
    this.container.add(this.healthBar); // added this

    this.draw();
  }

  decrease(amount: number) {
    this.health = Math.max(this.health - amount, 0);
    this.draw();
  }

  increase(amount: number) {
    this.health = Math.min(this.health + amount, 100);
    this.draw();
  }

  draw() {
    this.healthBar.clear();
    // Assuming the health bar is 40 px wide, change as needed
    let width = 40 * (this.health / 100);
    this.healthBar.fillStyle(0xffffff);
    this.healthBar.fillRect(0, 0, width, 5); // changed this
  }

  updatePosition(x: number, y: number) {
    this.container.x = x; // changed this
    this.container.y = y; // changed this
    this.draw();
  }
}

// GAME
export enum Direction {
  Up = "up",
  Down = "down",
  Left = "left",
  Right = "right",
}

export enum ControlKeys {
  W = "W",
  A = "A",
  S = "S",
  D = "D",
}

export const PLAYER_INITIAL_POSITION = { x: 500, y: 500 };
export const PLAYER_SPEED = 30;
export const PLAYER_SCALE = 2;
export const PLAYER_BODY_SIZE = { width: 15, height: 15 };
export const PLAYER_BODY_OFFSET = { x: 1, y: 1 };
export const PLAYER_HUD_OFFSET = 15;

class Game extends Phaser.Scene {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<ControlKeys, Phaser.Input.Keyboard.Key>;
  private myPlayer!: Phaser.Physics.Arcade.Sprite;
  private keysDown: ControlKeys[] = [];
  private playerHealthBar!: PlayerHealthBar;

  constructor() {
    super("game-scene");
  }

  create() {
    const { /* groundLayer */ wallsLayer } = this.createMapLayers();

    this.createPlayer();
    this.createControls();

    // Add collision between player and walls
    this.physics.add.collider(this.myPlayer, wallsLayer!);

    // Camera follows player
    this.cameras.main.startFollow(this.myPlayer, true);

    // Wall collisions
    // Collides is a custom property for the tile map, set in Tiled
    wallsLayer!.setCollisionByProperty({ collides: true });

    // Debug: draw borders and color for collision tiles
  }

  update() {
    if (!this.cursors) {
      console.warn("Cursors not found. Cannot update the game scene.");
      return;
    }

    const speed = PLAYER_SPEED * this.game.loop.delta;
    this.handlePlayerMovement(speed);

    this.playerHealthBar.updatePosition(
      this.myPlayer.x,
      this.myPlayer.y - PLAYER_HUD_OFFSET
    );
  }

  // FUNCTIONS
  private createMapLayers() {
    const map = this.make.tilemap({ key: "main-map" });

    // phaser-tiles is the name of the tileset in Tiled exported JSON
    const tileset = map.addTilesetImage("phaser-tiles", "main-tiles", 16, 16);

    // ground-layer is the name of the layer in Tiled exported JSON
    const groundLayer = map.createLayer("ground-layer", tileset!);
    const wallsLayer = map.createLayer("walls-layer", tileset!);

    // Set world bounds for camera. When close to the edge of the map, the camera will stop scrolling
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    // Set world bounds for physics. When close to the edge of the map, the player will stop moving
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    return { groundLayer, wallsLayer };
  }

  private createPlayer() {
    // walk-down-0 is the name of the frame in the .json file
    this.myPlayer = this.physics.add.sprite(
      PLAYER_INITIAL_POSITION.x,
      PLAYER_INITIAL_POSITION.y,
      "character-sprite",
      "walk-down-0"
    );
    this.myPlayer.setScale(PLAYER_SCALE);

    // Player hitbox
    const { body } = this.myPlayer;
    body!.setSize(PLAYER_BODY_SIZE.width, PLAYER_BODY_SIZE.height);
    body!.setOffset(PLAYER_BODY_OFFSET.x, PLAYER_BODY_OFFSET.y);

    this.playerHealthBar = new PlayerHealthBar(
      this,
      this.myPlayer.x,
      this.myPlayer.y - PLAYER_HUD_OFFSET
    );

    // Don't go out of the map
    this.myPlayer.setCollideWorldBounds(true);

    this.createAnimations();
  }

  private createAnimations() {
    const directions = Object.values(Direction);
    directions.forEach((direction) => {
      this.createWalkAnimation(direction);
      this.createIdleAnimation(direction);
    });
  }

  private createWalkAnimation(direction: Direction) {
    const animationKey = this.getAnimationKey("character", "walk", direction);
    this.anims.create({
      key: animationKey,
      frames: this.anims.generateFrameNames("character-sprite", {
        prefix: `walk-${direction}-`,
        start: 0,
        end: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });
  }

  private createIdleAnimation(direction: Direction) {
    const animationKey = this.getAnimationKey("character", "idle", direction);
    this.anims.create({
      key: animationKey,
      frames: [
        {
          key: "character-sprite",
          frame: `walk-${direction}-0`,
        },
      ],
    });
  }

  private getAnimationKey(
    character: string,
    action: string,
    direction: Direction
  ) {
    return `${character}-${action}-${direction}`;
  }

  private createControls() {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = {
      [ControlKeys.W]: this.input.keyboard!.addKey(
        Phaser.Input.Keyboard.KeyCodes.W
      ),
      [ControlKeys.A]: this.input.keyboard!.addKey(
        Phaser.Input.Keyboard.KeyCodes.A
      ),
      [ControlKeys.S]: this.input.keyboard!.addKey(
        Phaser.Input.Keyboard.KeyCodes.S
      ),
      [ControlKeys.D]: this.input.keyboard!.addKey(
        Phaser.Input.Keyboard.KeyCodes.D
      ),
    };

    Object.entries(this.wasd).forEach(([direction, key]) => {
      key.on("down", () => {
        this.keysDown = this.keysDown.filter((k) => k !== direction);
        this.keysDown.push(direction as ControlKeys);
      });

      key.on("up", () => {
        this.keysDown = this.keysDown.filter((k) => k !== direction);
      });
    });
  }

  private handlePlayerMovement(speed: number) {
    const lastKey = this.keysDown[this.keysDown.length - 1];

    switch (lastKey) {
      case ControlKeys.W:
        this.movePlayer(0, -speed, Direction.Up);
        break;
      case ControlKeys.S:
        this.movePlayer(0, speed, Direction.Down);
        break;
      case ControlKeys.A:
        this.movePlayer(-speed, 0, Direction.Left);
        break;
      case ControlKeys.D:
        this.movePlayer(speed, 0, Direction.Right);
        break;
      default:
        this.stopPlayer();
        break;
    }
  }

  private movePlayer(
    xVelocity: number,
    yVelocity: number,
    direction: Direction
  ) {
    const animationKey = this.getAnimationKey("character", "walk", direction);
    this.myPlayer.anims.play(animationKey, true);
    this.myPlayer.setVelocity(xVelocity, yVelocity);
  }

  private stopPlayer() {
    this.myPlayer.setVelocity(0, 0);
    const currentDirection = this.myPlayer.anims.currentAnim?.key?.split(
      "-"
    )[2] as Direction;
    if (currentDirection) {
      this.myPlayer.anims.play(
        this.getAnimationKey("character", "idle", currentDirection),
        true
      );
    }
  }
}

// INIT
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "phaser-game",
  width: 800,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0, x: 0 },
      debug: true, // Enable debug
      // TODO: Add QuadTree
    },
  },
  audio: {
    disableWebAudio: true,
  },
  scene: [PreloaderScene, Game],
  scale: {
    mode: Phaser.Scale.NONE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    zoom: 2,
  },
  render: {
    roundPixels: true,
    pixelArt: true,
    antialias: false,

    //desynchronized: true,
  },
};
const game = new Phaser.Game(config);
