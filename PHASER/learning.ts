import * as Phaser from "phaser";
import tileset_sprite_url from "./images/tileset.png";
import map_json from "./images/phaser.json";

export class SceneMain extends Phaser.Scene {
  constructor() {
    super("SceneMain");
  }
  preload() {
    this.load.image("tiles", tileset_sprite_url);
    this.load.tilemapTiledJSON("map", map_json);
  }
  create() {
    const map = this.make.tilemap({
      key: "map",
      tileWidth: 16,
      tileHeight: 16,
    });
    const tileset = map.addTilesetImage("phaser-tiles", "tiles");
    const layer = map.createLayer("ground-layer", tileset, 0, 0);
  }
  update() {}
}
export default SceneMain;

// Draw the SceneMain Phaser
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: "#000000",
  audio: {
    disableWebAudio: true,
  },
  parent: "game",
  scene: [SceneMain],
  physics: {
    default: "arcade",
    arcade: {
      debug: true,
    },
  },
};
new Phaser.Game(config);
