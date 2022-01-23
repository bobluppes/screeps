import { floor } from "lodash";

class ProposedBody {
  parts: BodyPartConstant[];
  cost: number;

  constructor(parts: BodyPartConstant[], cost: number) {
    this.parts = parts;
    this.cost = cost;
  }
}

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

  private static compute_max_body(capacity: number) : ProposedBody {
    let body: BodyPartConstant[] = [];
    let cost = 0;

    let basic_cost = 200;

    for (let i = 0; i < floor(capacity/basic_cost); i++) {
      body.push(WORK);
      body.push(MOVE);
      body.push(CARRY);
      cost += basic_cost;
    }

    body.sort();

    return new ProposedBody(body, cost);
  }

  public static spawn_creeps(spawn: StructureSpawn) {
    if (spawn.room.find(FIND_MY_CREEPS).length < 2) {
      let body = this.compute_max_body(spawn.room.energyCapacityAvailable);
      if (spawn.room.energyAvailable >= body.cost) {
        let name = `creep_` + Game.time;
        let source = this.get_available_sources(spawn)[0];
        spawn.spawnCreep(body.parts, name, {memory: {working: false, source: source.id}});
        console.log(`Spawning ${name}`);
      }
    }
  }

}
