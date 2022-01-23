export class CreepManager {

  private static get_storage_targets(creep: Creep) : Structure<StructureConstant>[] {
    let target = creep.room.find(FIND_MY_STRUCTURES, {
      filter: (i) => (i.structureType == STRUCTURE_SPAWN || i.structureType == STRUCTURE_EXTENSION) && i.store.getFreeCapacity(RESOURCE_ENERGY) > 0
    });

    return target;
  }

  public static do_work(creep: Creep) {

    let controller = creep.room.controller;
    let construction_sites = creep.room.find(FIND_CONSTRUCTION_SITES);
    let storage_targets = this.get_storage_targets(creep);

    if (creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0 && !creep.memory.working) {

      creep.say(`⚒️ Harvest`);
      let target = Game.getObjectById(creep.memory.source);
      if (target) {
        if (creep.harvest(target) == ERR_NOT_IN_RANGE) {
          creep.moveTo(target);
        }
      } else {
        throw Error('Creep has no valid source target.');
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

}
