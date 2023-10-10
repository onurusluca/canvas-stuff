//index.ts
import * as Phaser from "phaser";
import type { CanvasAppOptions } from "@/types/canvasTypes";
import Preloader from "./Preloader";
import Game from "./Game";
import character_sprite_url from "./images/dog.png";

export async function createGame(options: CanvasAppOptions): Promise<void> {
  const {
    users,
    myPlayerId,
    gameMapJson,
    gameMapTileset,
    initialSetupCompleted,
  } = options;

  const PreloaderScene: Preloader = new Preloader(
    gameMapTileset,
    gameMapJson,
    character_sprite_url
  );

  /* const GameScene: Game = new Game(

  ); */

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
}

// GAME.TS:
import Phaser from "phaser";
import { debugDraw } from "./helpers/debug";
import Player from "./Player";

export default class Game extends Phaser.Scene {
  private myPlayer!: Player;

  constructor() {
    super("game-scene");
  }

  create() {
    const { wallsLayer } = this.createMapLayers();

    // Create player instance
    this.myPlayer = new Player(this);

    // Add collision between player and walls
    this.physics.add.collider(this.myPlayer.getPlayer(), wallsLayer!);

    // Camera follows player
    this.cameras.main.startFollow(this.myPlayer.getPlayer(), true);

    // Wall collisions
    wallsLayer!.setCollisionByProperty({ collides: true });

    // Debug: draw borders and color for collision tiles
    debugDraw(wallsLayer!, this);
  }

  update() {
    this.myPlayer.handlePlayerMovement();
  }

  private createMapLayers() {
    const map = this.make.tilemap({ key: "main-map" });
    const tileset = map.addTilesetImage("phaser-tiles", "main-tiles", 16, 16);
    const groundLayer = map.createLayer("ground-layer", tileset!);
    const wallsLayer = map.createLayer("walls-layer", tileset!);

    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    return { groundLayer, wallsLayer };
  }
}

// Player.ts
import Phaser from "phaser";
import {
  Direction,
  ControlKeys,
  PLAYER_INITIAL_POSITION,
  PLAYER_SPEED,
  PLAYER_SCALE,
  PLAYER_BODY_SIZE,
  PLAYER_BODY_OFFSET,
} from "./helpers/constants";

export default class Player {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<ControlKeys, Phaser.Input.Keyboard.Key>;
  private myPlayer!: Phaser.Physics.Arcade.Sprite;
  private keysDown: ControlKeys[] = [];

  constructor(private scene: Phaser.Scene) {
    this.createPlayer();
    this.createControls();
  }

  createPlayer() {
    // walk-down-0 is the name of the frame in the .json file
    this.myPlayer = this.scene.physics.add.sprite(
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

    // Don't go out of the map
    this.myPlayer.setCollideWorldBounds(true);

    this.createAnimations();
  }

  createAnimations() {
    const directions = Object.values(Direction);
    directions.forEach((direction) => {
      this.createWalkAnimation(direction);
      this.createIdleAnimation(direction);
    });
  }

  createWalkAnimation(direction: Direction) {
    const animationKey = this.getAnimationKey("character", "walk", direction);
    this.scene.anims.create({
      key: animationKey,
      frames: this.scene.anims.generateFrameNames("character-sprite", {
        prefix: `walk-${direction}-`,
        start: 0,
        end: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });
  }

  createIdleAnimation(direction: Direction) {
    const animationKey = this.getAnimationKey("character", "idle", direction);
    this.scene.anims.create({
      key: animationKey,
      frames: [
        {
          key: "character-sprite",
          frame: `walk-${direction}-0`,
        },
      ],
    });
  }

  getAnimationKey(character: string, action: string, direction: Direction) {
    return `${character}-${action}-${direction}`;
  }

  createControls() {
    this.cursors = this.scene.input.keyboard!.createCursorKeys();
    this.wasd = {
      [ControlKeys.W]: this.scene.input.keyboard!.addKey(
        Phaser.Input.Keyboard.KeyCodes.W
      ),
      [ControlKeys.A]: this.scene.input.keyboard!.addKey(
        Phaser.Input.Keyboard.KeyCodes.A
      ),
      [ControlKeys.S]: this.scene.input.keyboard!.addKey(
        Phaser.Input.Keyboard.KeyCodes.S
      ),
      [ControlKeys.D]: this.scene.input.keyboard!.addKey(
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

  handlePlayerMovement() {
    const speed = PLAYER_SPEED * this.scene.game.loop.delta;
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

  movePlayer(xVelocity: number, yVelocity: number, direction: Direction) {
    const animationKey = this.getAnimationKey("character", "walk", direction);
    this.myPlayer.anims.play(animationKey, true);
    this.myPlayer.setVelocity(xVelocity, yVelocity);
  }

  stopPlayer() {
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

  getPlayer() {
    return this.myPlayer;
  }
}
