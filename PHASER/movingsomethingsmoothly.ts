updatePosition(targetX: number, targetY: number, duration: number = 500) {
    this.scene.tweens.add({
      targets: this,
      x: targetX,
      y: targetY,
      duration: duration,
      ease: "Linear",
    });
  }