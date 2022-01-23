export class SpawnManager {

  private static get_available_sources(spawn: StructureSpawn) : Source[] {
    let used_sources = new Map();
    for (const name in Game.creeps) {
      let creep = Game.creeps[name];
      used_sources.set(creep.memory.source, true);
    }

    return spawn.room.find(FIND_SOURCES, {
      filter: (i) => !used_sources.has(i.id)
    })
  }

  public static spawn_creeps(spawn: StructureSpawn) {
    if (spawn.room.find(FIND_MY_CREEPS).length < 2) {
      if (spawn.store.getUsedCapacity(RESOURCE_ENERGY) >= 200) {
        let name = `creep_` + Game.time;
        let source = this.get_available_sources(spawn)[0];
        spawn.spawnCreep([WORK, MOVE, CARRY], name, {memory: {working: false, source: source.id}});
        console.log(`Spawning ${name}`);
      }
    }
  }

}
