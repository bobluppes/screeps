import { ErrorMapper } from "utils/ErrorMapper";

declare global {
  /*
    Example types, expand on these or remove them and add your own.
    Note: Values, properties defined here do no fully *exist* by this type definiton alone.
          You must also give them an implemention if you would like to use them. (ex. actually setting a `role` property in a Creeps memory)

    Types added in this `global` block are in an ambient, global context. This is needed because `main.ts` is a module file (uses import or export).
    Interfaces matching on name from @types/screeps will be merged. This is how you can extend the 'built-in' interfaces from @types/screeps.
  */
  // Memory extension samples
  interface Memory {
    uuid: number;
    log: any;
  }

  interface CreepMemory {
    // role: string;
    // room: string;
    working: boolean;
  }

  // Syntax for adding proprties to `global` (ex "global.log")
  namespace NodeJS {
    interface Global {
      log: any;
    }
  }
}

function get_storage_targets(spawn: StructureSpawn) : Structure<StructureConstant>[] {
  let target = spawn.room.find(FIND_MY_STRUCTURES, {
    filter: (i) => (i.structureType == STRUCTURE_SPAWN || i.structureType == STRUCTURE_EXTENSION) && i.store.getFreeCapacity(RESOURCE_ENERGY) > 0
  });

  return target;
}

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {

  // Automatically delete memory of missing creeps
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
    }
  }

  let spawn = Game.spawns[`Spawn1`];
  let controller = spawn.room.controller;
  let construction_sites = spawn.room.find(FIND_CONSTRUCTION_SITES);
  let storage_targets = get_storage_targets(spawn);

  if (spawn.room.find(FIND_MY_CREEPS).length < 2) {
    let name = `creep_` + Game.time;
    spawn.spawnCreep([WORK, MOVE, CARRY], name, {memory: {working: false}});
    console.log(`Spawning ${name}`);
  }

  for (const name in Game.creeps) {
    let creep = Game.creeps[name];

    if (creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0 && !creep.memory.working) {
      creep.say(`⚒️ Harvest`);
      let target = creep.room.find(FIND_SOURCES)[0];
      if (creep.harvest(target) == ERR_NOT_IN_RANGE) {
        creep.moveTo(target);
      }
    } else if (storage_targets.length > 0) {
      creep.say(`🔶 Dumping`);
      let target = storage_targets[0];
      if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        creep.moveTo(target);
      }
    } else if (construction_sites.length > 0) {
      creep.say(`⚒️ Build`);
      creep.memory.working = true;
      let target = construction_sites[0];
      if (creep.build(target) == ERR_NOT_IN_RANGE) {
        creep.moveTo(target);
      }
    } else {
      creep.say(`⬆️ Upgrade`);
      creep.memory.working = true;
      if (controller) {
        if (creep.upgradeController(controller) == ERR_NOT_IN_RANGE) {
          creep.moveTo(controller);
        }
      }
    }

    if (creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0) {
      creep.memory.working = false;
    }
  }
});
