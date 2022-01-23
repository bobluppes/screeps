import { ErrorMapper } from "utils/ErrorMapper";
import { SpawnManager } from "SpawnManager";
import { CreepManager } from "CreepManager";


// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {

  // Automatically delete memory of missing creeps
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
    }
  }

  for (const name in Game.spawns) {
    let spawn = Game.spawns[name];
    SpawnManager.spawn_creeps(spawn);
  }

  for (const name in Game.creeps) {
    let creep = Game.creeps[name];
    CreepManager.do_work(creep);
  }

});
