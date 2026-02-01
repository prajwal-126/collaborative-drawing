export function createStateManager() {
  return {
    strokes: [],
    removeLastStrokeByUser(userId) {
      for (let i = this.strokes.length - 1; i >= 0; i--) {
        if (this.strokes[i].userId === userId) {
          this.strokes.splice(i, 1);
          break;
        }
      }
    }
  };
}
