function checkCollisionWithMap(
  x: number,
  y: number,
  collisionData: CollisionData,
  tileMap: TileMap
) {
  // Adjust the input x and y to account for the camera offset
  const tileWidth = tileMap.tilewidth;
  const tileHeight = tileMap.tileheight;
  const offsetX =
    (-camera.cameraX - (tileMap.width * tileWidth) / 2) * camera.zoomFactor;
  const offsetY =
    (-camera.cameraY - (tileMap.height * tileHeight) / 2) * camera.zoomFactor;
  console.log(
    `playerLeft: ${playerLeft}, playerRight: ${playerRight}, playerTop: ${playerTop}, playerBottom: ${playerBottom}`
  );

  console.log(
    `tileLeft: ${tileLeft}, tileRight: ${tileRight}, tileTop: ${tileTop}, tileBottom: ${tileBottom}`
  );

  // Check if the x and y are within the tileMap bounds
  /*    if (
      adjustedX < 0 ||
      adjustedY < 0 ||
      adjustedX >= tileMap.width ||
      adjustedY >= tileMap.height
    ) {
      return true;
    } */

  for (let y = 0; y < collisionData.height; y++) {
    for (let x = 0; x < collisionData.width; x++) {
      if (collisionData.data[y][x] !== 0) {
        console.log(
          x * tileWidth * camera.zoomFactor + offsetX,
          y * tileHeight * camera.zoomFactor + offsetY,
          tileWidth * camera.zoomFactor,
          tileHeight * camera.zoomFactor
        );
      }
    }
  }
}
