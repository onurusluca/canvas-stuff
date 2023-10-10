    drawTileMap: This function is going through every tile on the map for every frame, which can be quite expensive, especially for larger maps. Instead of drawing every single tile every time, consider implementing a spatial partitioning system, where you only draw the tiles that are currently visible on the screen. You can calculate the range of tiles that should be visible based on the current camera position and only loop over and draw these tiles.

    drawCharacter & drawPlayer: These methods are mostly optimized. You might consider whether it's necessary to redraw the entire character every frame, especially if they're not moving. You could consider keeping track of whether each character has moved since the last frame and only redraw characters that have moved.

    handlePlayerMovement: This method could potentially be made more efficient. Currently, you're checking for collision with every other user every time a movement key is pressed. If there are many users, this could be expensive. One way to improve this might be to keep a spatial partitioning data structure that keeps track of which users are near each other, so you only have to check for collisions with nearby users.

    checkPlayerInRoom: Similar to the drawMap function, you could consider only checking whether the player is in a room when they move, rather than every frame. This would be more efficient if movement happens less frequently than frames are drawn. Also, instead of looping over all rooms, you could use a spatial partitioning data structure to quickly look up which room the player might be in based on their position.

    General optimization strategies:
        One way to reduce CPU usage in your game loop is to consider whether all calculations need to be performed every frame. For example, some calculations might be performed less frequently without affecting game play.
        Be aware of garbage collection. High-frequency, short-lived allocations can cause the garbage collector to kick in more frequently, which can cause noticeable pauses in your game.
        Use the performance profiling tools in your browser's developer tools to identify the functions that are taking up the most CPU time.
        If you have many objects in your game, consider using a spatial partitioning data structure (like a grid or quadtree) to reduce the number of checks you need to make for things like collisions or drawing.
        Avoid complex calculations inside loops, particularly nested loops.
        If you are frequently reading or writing to the DOM, this can cause reflows/repaints that can be CPU-intensive.
        You can also consider using web workers for offloading some of the computational intensive work to another thread. This can allow for better use of multi-core systems and improving performance on the main thread.

Remember, always measure before and after making optimizations to ensure that they're having the desired effect. And avoid premature optimization: focus on the parts of your code that are actually causing slowdowns.





Sure, let's go through these one by one:

1. **Dirty Rectangles**: This technique involves keeping track of which parts of the screen need to be updated (the "dirty" rectangles), and then only redrawing those parts. You would need to modify your `drawMap()`, `drawOtherPlayers()`, `drawMyPlayer()` functions to take into consideration the dirty rectangles. Here's a basic example:

    ```javascript
    let dirtyRects = [];

    function markRectAsDirty(rect) {
      dirtyRects.push(rect);
    }

    function clearDirtyRects() {
      dirtyRects.forEach((rect) => {
        ctx.clearRect(rect.x, rect.y, rect.width, rect.height);
      });
    }

    function drawDirtyRects() {
      dirtyRects.forEach((rect) => {
        // Your drawing logic here...
      });
    }

    function gameLoop() {
      clearDirtyRects();
      drawDirtyRects();
      dirtyRects = []; // Reset dirty rects after drawing
    }
    ```

    Whenever an object moves, you would call `markRectAsDirty(rect)` with the area that needs to be redrawn. Then `gameLoop()` would only redraw those areas.

2. **Quadtree**: A Quadtree is a tree data structure where each internal node has exactly four children: north-west, north-east, south-west and south-east. Quadtrees are used to partition a two-dimensional space by recursively subdividing it into four quadrants. There are several libraries available for quadtrees in JavaScript, such as [quadtree-lib](https://www.npmjs.com/package/quadtree-lib).

3. **FPS Calculation**: Here is how you could modify your existing code to update FPS every 2 seconds:

    ```javascript
    let fpsUpdateInterval = 2000; // Update every 2 seconds
    let nextFpsUpdate = performance.now() + fpsUpdateInterval;

    function gameLoop() {
      const now = Date.now();

      if (now > nextFpsUpdate) {
        averageFps = framesThisSecond / 2; // We're calculating over 2 seconds
        framesThisSecond = 0;
        nextFpsUpdate = now + fpsUpdateInterval;
      }
      // ... rest of your code ...
    }
    ```

4. **Optimize playerRect calculation**: You can store `playerRect` as a property of each player, and only recalculate it when the player's position or the camera position changes:

    ```javascript
    // Inside the drawOtherPlayers() function
    user.playerRect = user.playerRect || {
      x: (user.x - camera.cameraX) * camera.zoomFactor,
      y: (user.y - camera.cameraY) * camera.zoomFactor,
      width: PLAYER_SIZE * camera.zoomFactor,
      height: PLAYER_SIZE * camera.zoomFactor,
    };

    // Do the same for the drawMyPlayer() function

    // And then in the handlePlayerMovement() function, after updating the player's position:
    myPlayer.playerRect = null;
    ```

5. **Avoid creating new objects inside a loop**: In the `handlePlayerMovement()` function, you're creating a new `tempPlayerPosition` object on every frame:

    ```javascript
    // Instead of this...
    let tempPlayerPosition: { x: number; y: number } = { x: 0, y: 0 };

    // ... declare the object once outside of the loop ...
    let tempPlayerPosition = { x: 0, y: 0 };

    // ... and then just update its properties inside the loop.
    tempPlayerPosition.x = myPlayer.x;
    temp