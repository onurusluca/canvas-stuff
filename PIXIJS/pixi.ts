import {
  Application,
  BaseTexture,
  Container,
  SCALE_MODES,
  Sprite,
  Texture,
  AnimatedSprite,
  Rectangle,
} from "pixi.js";
import character_sprite_url from "@/canvas/images/dog.png";
import world_image_url from "@/canvas/images/newworld.png";
import Stats from "stats.js";

const keysPressed: Record<string, boolean> = {
  w: false,
  a: false,
  s: false,
  d: false,
};

const speed = 3;
const keysOrder: string[] = [];
const directions: Record<string, [string, () => void]> = {
  w: ["walk-up", () => (worldMapSprite.y += speed)],
  a: ["walk-left", () => (worldMapSprite.x += speed)],
  s: ["walk-down", () => (worldMapSprite.y -= speed)],
  d: ["walk-right", () => (worldMapSprite.x -= speed)],
};
let worldMapSprite: Sprite;
let characterSpriteAnimation: AnimatedSprite;
let walkFrames: Record<string, Texture[]> = {};

async function createCanvasApp(canvas: HTMLCanvasElement) {
  BaseTexture.defaultOptions.scaleMode = SCALE_MODES.NEAREST;
  const app = createApp(canvas);
  worldMapSprite = createWorldMap();
  characterSpriteAnimation = createCharacterSprite();
  const worldContainer = new Container();
  worldContainer.addChild(worldMapSprite);
  worldContainer.addChild(characterSpriteAnimation);
  app.stage.addChild(worldContainer);
  attachKeyHandlers();
  app.ticker.add(gameLoop);
  displayStats(app);
}

function createApp(canvas: HTMLCanvasElement): Application {
  return new Application({
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: "transparent",
    antialias: true,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
    view: canvas,
  });
}

function createWorldMap(): Sprite {
  const worldMap = Texture.from(world_image_url);
  const worldMapSprite = new Sprite(worldMap);
  worldMapSprite.scale.set(3, 3);

  // Set initial position of map sprite(aka. character position)
  worldMapSprite.position.set(-2000, -2000);
  return worldMapSprite;
}

function createCharacterSprite(): AnimatedSprite {
  const walkDirections = createWalkDirections();
  walkFrames = createWalkFrames(walkDirections);
  const characterSpriteAnimation = new AnimatedSprite(
    walkFrames["walk-down"],
    true
  );
  characterSpriteAnimation.scale.set(4, 4);
  characterSpriteAnimation.animationSpeed = 0.2;
  characterSpriteAnimation.position.set(
    window.innerWidth / 2.1,
    window.innerHeight / 2.3
  );
  return characterSpriteAnimation;
}

function createWalkDirections(): Record<string, [number, number][]> {
  return {
    "walk-down": [
      [0, 0],
      [0, 16],
      [0, 32],
      [0, 48],
    ],
    "walk-up": [
      [16, 0],
      [16, 16],
      [16, 32],
      [16, 48],
    ],
    "walk-left": [
      [32, 0],
      [32, 16],
      [32, 32],
      [32, 48],
    ],
    "walk-right": [
      [48, 0],
      [48, 16],
      [48, 32],
      [48, 48],
    ],
  };
}

function createWalkFrames(
  walkDirections: Record<string, [number, number][]>
): Record<string, Texture[]> {
  const characterSprite = BaseTexture.from(character_sprite_url);
  for (const direction in walkDirections) {
    walkFrames[direction] = walkDirections[direction].map(
      ([x, y]) => new Texture(characterSprite, new Rectangle(x, y, 16, 16))
    );
  }
  return walkFrames;
}

function attachKeyHandlers(): void {
  window.addEventListener("keydown", (event) => handleKeyDown(event));
  window.addEventListener("keyup", (event) => handleKeyUp(event));
}

function handleKeyDown(event: KeyboardEvent): void {
  if (event.key in keysPressed) {
    keysPressed[event.key] = true;
    updateKeysOrder(event.key);
    updateCharacterAnimation();
  }
}

function handleKeyUp(event: KeyboardEvent): void {
  if (event.key in keysPressed) {
    keysPressed[event.key] = false;
    keysOrder.splice(keysOrder.indexOf(event.key), 1);
    if (keysOrder.length > 0) {
      updateCharacterAnimation();
    } else {
      characterSpriteAnimation.gotoAndStop(0);
    }
  }
}

function updateKeysOrder(key: string): void {
  const index = keysOrder.indexOf(key);
  if (index > -1) {
    keysOrder.splice(index, 1);
  }
  keysOrder.push(key);
}

function updateCharacterAnimation(): void {
  const lastKey = keysOrder[keysOrder.length - 1];
  const direction = directions[lastKey][0];
  if (
    !characterSpriteAnimation.playing ||
    characterSpriteAnimation.textures !== walkFrames[direction]
  ) {
    characterSpriteAnimation.textures = walkFrames[direction];
    characterSpriteAnimation.gotoAndPlay(1); // Skip the first frame to show the animation asap
  }
}

// Game loop
function gameLoop(): void {
  if (keysOrder.length > 0) {
    const lastKey = keysOrder[keysOrder.length - 1];
    const [, movement] = directions[lastKey];
    movement();
  }
}

// Stats - FPS, MS, MB...
function displayStats(app: Application): void {
  const stats = new Stats();
  stats.showPanel(0);
  stats.dom.style.position = "absolute";
  stats.dom.style.left = "1.4rem";
  stats.dom.style.top = ".8rem";
  stats.dom.style.transform = "scale(1.5)";
  document.body.appendChild(stats.dom);
  app.ticker.add(() => stats.update());
}

export { createCanvasApp };
