import { createStateManager } from "./state-manager.js";

const rooms = new Map();

export function createRoom(id) {
  if (!rooms.has(id)) {
    rooms.set(id, createStateManager());
  }
  return rooms.get(id);
}
