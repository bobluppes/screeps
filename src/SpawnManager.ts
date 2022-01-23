import { floor } from "lodash";
import { Position } from "source-map";

class ProposedBody {
  parts: BodyPartConstant[];
  cost: number;

  constructor(parts: BodyPartConstant[], cost: number) {
    this.parts = parts;
    this.cost = cost;
  }
}

export class SpawnManager {

  private static upgrader_target_count = 1;

  private static get_available_sources(spawn: StructureSpawn, role: Role) : Source[] {
    let used_sources = new Map();
    for (const name in Game.creeps) {
      let creep = Game.creeps[name];
      if (!used_sources.has(creep.memory.source)) {
        used_sources.set(creep.memory.source, 1);
      } else {
        let old_count = used_sources.get(creep.memory.source);
        used_sources.set(creep.memory.source, old_count + 1);
      }
    }

    let sources = spawn.room.find(FIND_SOURCES, {
      filter: (i) => this.free_spots(i.pos) > used_sources.get(i.id) || !used_sources.has(i.id)
    });

    // Sort by distance to controller if the new creep role is Upgrader
    if (role == Role.Upgrader) {
      sources.sort( (a: Source, b: Source) => {
        let controller = a.room.controller
        if (controller) {
          return a.pos.getRangeTo(controller) - b.pos.getRangeTo(controller);
        } else {
          return 0;
        }
      });
    }

    return sources;
  }

  private static free_spots(pos: RoomPosition) : number {
    let free_spots = 0;

    let terrain_plain: Terrain = "plain";

    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        let adjecent_position = new RoomPosition(pos.x + x, pos.y + y, pos.roomName);
        let terrains = adjecent_position.lookFor(LOOK_TERRAIN);
        let structures = adjecent_position.lookFor(LOOK_STRUCTURES);
        if (terrains.length == 1 && terrains[0] == terrain_plain && structures.length == 0) {
          free_spots++;
        }
      }
    }

    return free_spots;
  }

  private static total_spots(spawn: StructureSpawn) : number {
    let spots = 0;
    spawn.room.find(FIND_SOURCES).forEach( (source) => {
      spots += this.free_spots(source.pos);
    });
    return spots;
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

    let total_spots = this.total_spots(spawn);
    let creeps_count = spawn.room.find(FIND_MY_CREEPS).length;

    if (creeps_count < total_spots) {

      // Determine role
      let role = Role.Worker;
      let upgraders = spawn.room.find(FIND_MY_CREEPS, {
        filter: (creep) => creep.memory.role == Role.Upgrader
      });
      if (upgraders.length < this.upgrader_target_count) {
        role = Role.Upgrader;
      }

      let body = this.compute_max_body(spawn.room.energyCapacityAvailable);
      if (spawn.room.energyAvailable >= body.cost) {
        let name = `creep_` + Game.time;
        let source = this.get_available_sources(spawn, role)[0];
        if (source) {
          spawn.spawnCreep(body.parts, name, {memory: {working: false, source: source.id, role: role}});
          console.log(`Spawning ${name} on source: ${source.id}, ${creeps_count}/${total_spots}`);
        }
      }
    }
  }

}
