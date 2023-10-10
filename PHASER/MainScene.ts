import Phaser from "phaser";
import { Rectangle, TileMap } from "@/types/canvasTypes";

export default class MainScene extends Phaser.Scene {
  private tilesetSpriteUrl: string;
  private mapJson: TileMap;
  private rectangle: Rectangle;
  private speed: number;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private fpsText: Phaser.GameObjects.Text;
  private frameTimes: number[] = [];
  private frameTimeWindow: number;

  constructor(tilesetSpriteUrl: string, mapJson: TileMap) {
    super("main-scene");
    this.tilesetSpriteUrl = tilesetSpriteUrl;
    this.mapJson = mapJson;
    this.rectangle = { x: 0, y: 0, width: 0, height: 0 };
    this.speed = 500;
    this.fpsText = {} as Phaser.GameObjects.Text;
    this.frameTimes = [];
    this.frameTimeWindow = 100;
  }

  preload() {
    this.load.image("tiles", this.tilesetSpriteUrl);
    this.load.tilemapTiledJSON("map", this.mapJson);
  }

  create() {
    const map = this.make.tilemap({
      key: "map",
      tileWidth: 16,
      tileHeight: 16,
    });
    const tileset = map.addTilesetImage("phaser-tiles", "tiles");
    const layer = map.createLayer("ground-layer", tileset, 0, 0);
    const { width, height } = this.sys.game.canvas;
    this.rectangle = this.add.rectangle(
      width / 2,
      height / 2,
      50,
      50,
      0xff0000
    );

    // Enable cursor keys for WASD movement
    this.cursors = this.input.keyboard.addKeys("W,S,A,D");

    // Create the FPS counter text and initialize it with "FPS: 0"
    // Phaser is typically synced to the refresh rate of the display it's running on
    this.fpsText = this.add.text(10, 10, "FPS: 0", {
      font: "bold 16px Arial ",
      fill: "#000",
    });
  }

  update(time: number, delta: number) {
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

    // Handle movement
    this.handleMovement(delta);
  }

  handleMovement(delta: number) {
    // Games can run at different speeds on different machines if they don't take into account the time passed between frames, which is known as "delta time". So we need to multiply our speed by delta time to ensure that the movement speed is consistent across different machines.
    const deltaSpeed = (this.speed * delta) / 1000; // Now speed is in units per second

    if (this.cursors.W.isDown) {
      this.rectangle.y -= deltaSpeed;
    }
    if (this.cursors.S.isDown) {
      this.rectangle.y += deltaSpeed;
    }
    if (this.cursors.A.isDown) {
      this.rectangle.x -= deltaSpeed;
    }
    if (this.cursors.D.isDown) {
      this.rectangle.x += deltaSpeed;
    }
  }
}
