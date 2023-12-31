import { emitter } from "@/composables/useEmit";
import type { User } from "@/types/general";
import type { CanvasAppOptions, Camera } from "@/types/canvasTypes";
import {
  loadImage,
  isColliding,
  matchUserFacingToAnimationState,
} from "./utilities";
import { drawWorld, drawPlayerBanner, drawPlayer } from "./draw";
import { updateAnimationFrame } from "./animations";
import { keyDownEventListener, keyUpEventListener } from "./keyboardEvents";
import { rightClickEventListener, wheelEventListener } from "./mouseEvents";
import { isPlayerInRoom } from "./roomDetection";

async function createCanvasApp(options: CanvasAppOptions): Promise<void> {
  const {
    users,
    myPlayerId,
    speed,
    canvas,
    canvasFrameRate,
    spaceMap,
    myCharacterSprite,
    initialSetupCompleted,
  } = options;

  const ctx = canvas.getContext("2d")!;

  const [worldImg, characterImg, characterImgMyPlayer] = await Promise.all([
    loadImage(spaceMap),
    loadImage(myCharacterSprite),
    loadImage(myCharacterSprite),
  ]);

  let camera: Camera = {
    cameraX: 200,
    cameraY: 200,
    zoomFactor: 1,
  };

  let myPlayer: User = {
    id: "",
    userName: "",
    x: 0,
    y: 0,
    characterSprite: "",
    facingTo: "",
    userStatus: "",
  };

  // Tracks the order of movement keys (W, A, S, D) being pressed. It helps determine the character's movement direction when multiple keys are pressed, prioritizing the last valid key pressed.
  let keyPressOrder: string[] = [];
  const pressedKeys: Record<string, boolean> = {
    w: false,
    a: false,
    s: false,
    d: false,
  };

  // Animation related
  let animationState = "walk-down";
  let animationFrame = 0;
  let animationTick = 0;

  // FPS counter
  let lastTime = performance.now();
  let fps = 0;

  // FPS limiting
  let lastUpdateTime = 0;
  const frameDuration = 1000 / canvasFrameRate;

  let mouseX = 0;
  let mouseY = 0;

  const roomLayer: { data: number[] } = {
    data: [],
  };

  // Track mouse position (used for checking if mouse is hovering over a player)
  canvas.addEventListener("mousemove", (e: MouseEvent) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function gameLoop(timestamp: number) {
    // Calculate the elapsed time since the last update
    let elapsedTime = timestamp - lastUpdateTime;

    if (elapsedTime >= frameDuration) {
      // Clear the canvas before drawing to prevent ghosting effect
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Anti-aliasing in browsers smooths images, which can blur pixel art or low-res graphics
      ctx.imageSmoothingEnabled = false;

      myPlayer = users.find((user) => user.id === myPlayerId)!;
      if (myPlayer) {
        // Center camera on my player
        camera.cameraX = myPlayer.x - canvas.width / (2.2 * camera.zoomFactor);
        camera.cameraY = myPlayer.y - canvas.height / (2.2 * camera.zoomFactor);

        drawWorld(ctx, worldImg, camera);

        handlePlayerMovement();

        drawOtherPlayers();

        drawMyPlayer();

        drawAllPlayerNames();

        updateAnimation();

        drawFPS();

        const playerTilePosition = getPlayerTilePosition();

        if (
          playerTilePosition.x >= 13 &&
          playerTilePosition.y <= 20 &&
          playerTilePosition.y <= 6 &&
          playerTilePosition.y >= 2
        ) {
          emitter.emit("playerInRoom", true);
        } else {
          emitter.emit("playerInRoom", false);
        }

        /*   const inRoom = isPlayerInRoom(roomLayer, playerTilePosition, mapWidth); */
      }
      lastUpdateTime = timestamp;
    }

    requestAnimationFrame(gameLoop);
  }

  // HELPER FUNCTIONS

  // Move my player but only if no other key is pressed(prevent diagonal movement). Also, if the user releases the second pressed key, the character should continue moving in the direction of the first pressed key
  function handlePlayerMovement() {
    if (keyPressOrder.length > 0) {
      let newPlayerX = myPlayer.x;
      let newPlayerY = myPlayer.y;
      const lastValidKey = keyPressOrder[keyPressOrder.length - 1];

      // Check if any key is pressed to prevent continuous movement
      if (pressedKeys.w || pressedKeys.a || pressedKeys.s || pressedKeys.d) {
        switch (lastValidKey) {
          case "w":
            newPlayerY -= speed;
            animationState = "walk-up";
            myPlayer.facingTo = "up";
            break;
          case "a":
            newPlayerX -= speed;
            animationState = "walk-left";
            myPlayer.facingTo = "left";
            break;
          case "s":
            newPlayerY += speed;
            animationState = "walk-down";
            myPlayer.facingTo = "down";
            break;
          case "d":
            newPlayerX += speed;
            animationState = "walk-right";
            myPlayer.facingTo = "right";
            break;
        }
      }

      // Check for collisions with other players
      const playerWidth = 48 * camera.zoomFactor;
      const playerHeight = 64 * camera.zoomFactor;
      let collision = false;
      for (const user of users) {
        if (
          user.id !== myPlayerId &&
          isColliding(
            {
              x: newPlayerX,
              y: newPlayerY,
              width: playerWidth,
              height: playerHeight,
            },
            { x: user.x, y: user.y, width: playerWidth, height: playerHeight }
          )
        ) {
          collision = true;
          break;
        }
      }

      if (!collision) {
        myPlayer.x = newPlayerX;
        myPlayer.y = newPlayerY;
      }
    }
  }

  function drawOtherPlayers() {
    users.forEach((user) => {
      if (user.id !== myPlayerId) {
        const playerRect = {
          x: (user.x - camera.cameraX - 8) * camera.zoomFactor,
          y: (user.y - camera.cameraY - 8) * camera.zoomFactor,
          width: 96 * camera.zoomFactor,
          height: 96 * camera.zoomFactor,
        };

        // Check if mouse is over the player
        const isMouseOver = isColliding(
          { x: mouseX, y: mouseY, width: 1, height: 1 },
          playerRect
        );

        drawPlayer(
          ctx,
          characterImg,
          matchUserFacingToAnimationState(user.facingTo),
          1,
          user,
          camera.cameraX,
          camera.cameraY,
          camera.zoomFactor,
          user.userStatus,
          isMouseOver
        );
      }
    });
  }

  function drawMyPlayer() {
    const playerRect = {
      x: (myPlayer.x - camera.cameraX - 8) * camera.zoomFactor,
      y: (myPlayer.y - camera.cameraY - 8) * camera.zoomFactor,
      width: 96 * camera.zoomFactor,
      height: 96 * camera.zoomFactor,
    };
    const isMouseOver = isColliding(
      { x: mouseX, y: mouseY, width: 1, height: 1 },
      playerRect
    );

    drawPlayer(
      ctx,
      characterImgMyPlayer,
      animationState,
      animationFrame,
      myPlayer,
      camera.cameraX,
      camera.cameraY,
      camera.zoomFactor,
      myPlayer.userStatus,
      isMouseOver
    );
  }

  function drawAllPlayerNames() {
    // Draw other players' names
    users.forEach((user) => {
      if (user.id !== myPlayerId) {
        drawPlayerBanner(
          ctx,
          user,
          camera.cameraX,
          camera.cameraY,
          camera.zoomFactor
        );
      }
    });

    // Draw your player's name
    drawPlayerBanner(
      ctx,
      myPlayer,
      camera.cameraX,
      camera.cameraY,
      camera.zoomFactor
    );
  }

  function getPlayerTilePosition(): {
    x: number;
    y: number;
  } {
    const tileWidth = 32; // Set the width of a tile in your map
    const tileHeight = 32; // Set the height of a tile in your map

    return {
      x: Math.floor(myPlayer.x / tileWidth),
      y: Math.floor(myPlayer.y / tileHeight),
    };
  }

  function updateAnimation() {
    [animationFrame, animationTick] = updateAnimationFrame(
      pressedKeys,
      animationState,
      animationFrame,
      animationTick
    );
  }

  function drawFPS() {
    // Calculate FPS
    const currentTime = performance.now();
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;

    // Draw FPS
    fps = Math.round(1000 / deltaTime);
    ctx.fillStyle = "black";
    ctx.font = "bold 16px Poppins";
    ctx.fillText(`FPS: ${fps}`, 10, 20);
  }

  function initGameLoop() {
    if (
      users.length > 0 &&
      myPlayerId !== "" &&
      speed !== 0 &&
      spaceMap !== "" &&
      initialSetupCompleted
    ) {
      requestAnimationFrame(gameLoop);
    } else {
      const checkConditionsBeforeLoop = setInterval(() => {
        if (
          users.length > 0 &&
          myPlayerId !== "" &&
          speed !== 0 &&
          spaceMap !== "" &&
          initialSetupCompleted
        ) {
          requestAnimationFrame(gameLoop);
          clearInterval(checkConditionsBeforeLoop);

          // Emit event to notify Space.vue that the canvas is loaded
          emitter.emit("canvasLoaded");
        }
      }, 0);
    }
  }

  function getCamera(): Camera {
    return {
      cameraX: myPlayer?.x - canvas.width / (2.2 * camera.zoomFactor),
      cameraY: myPlayer.y - canvas.height / (2.2 * camera.zoomFactor),
      zoomFactor: camera.zoomFactor,
    };
  }

  keyDownEventListener(canvas, pressedKeys, keyPressOrder, () => myPlayer);
  keyUpEventListener(canvas, pressedKeys, keyPressOrder, () => myPlayer);
  rightClickEventListener(canvas, getCamera, users, myPlayerId);
  wheelEventListener(canvas, camera);

  // Get right click move position confirmation from Space.vue and move the player
  emitter.on("rightClickPlayerMoveConfirmed", async (user) => {
    myPlayer.x = user.x;
    myPlayer.y = user.y;

    // Canvas loses focus after right click, so we need to focus it again
    canvas.focus();
  });

  // Get joystick move event from Joystick.vue and move the player
  emitter.on("joystickMove", async (direction: string) => {
    if (direction === "up") {
      pressedKeys.w = true;
      keyPressOrder.push("w");
    } else if (direction === "left") {
      pressedKeys.a = true;
      keyPressOrder.push("a");
    } else if (direction === "down") {
      pressedKeys.s = true;
      keyPressOrder.push("s");
    } else if (direction === "right") {
      pressedKeys.d = true;
      keyPressOrder.push("d");
    }

    if (direction === "none") {
      pressedKeys.w = false;
      pressedKeys.a = false;
      pressedKeys.s = false;
      pressedKeys.d = false;
      keyPressOrder = [];

      emitter.emit("playerMove", myPlayer);
    }
  });

  // Start the game loop
  initGameLoop();
}

export { createCanvasApp };
