import Spuses from "./mappings/spuses";
import SpuScript from "../spu_script";
import ArgumentReader from "../utils/argument_reader";
import Checker from "./checker";
import Selector from "./selector";
import { getNbt } from "../utils/utils";
import { NbtCompound, NbtString, NbtList, NbtValue, NbtByte, NbtInt, NbtFloat } from "../utils/nbt/nbt";

export default class Updater {
    /**
        Returns an result map from an 1.12 command and an 1.12 spus.
        @param cmd An 1.12 minecraft command.
        @param spus An 1.12 spus defined in spuses.ts.
        @returns NULLABLE. A map filled with converted value.
        @example {'%n': 'converted value'}.
     */
    public static getResultMap(cmd: string, spus: string) {
        let spusReader = new ArgumentReader(spus)
        let spusArg = spusReader.next()
        let cmdSplited = cmd.split(' ')
        let begin: number = 0
        let end: number = cmdSplited.length
        let cmdArg = cmdSplited.slice(begin, end).join(' ')
        let map = new Map<string, string>()
        let cnt = 0
        while (spusArg !== '' && begin < cmdSplited.length) {
            while (!Checker.isArgumentMatch(cmdArg, spusArg)) {
                if (cmdArg !== '') {
                    end -= 1
                    cmdArg = cmdSplited.slice(begin, end).join(' ')
                } else {
                    // The cmdArg has sliced to ''.
                    // Still can't match.
                    return null
                }
            }

            begin = end
            end = cmdSplited.length

            if (spusArg.charAt(0) === '%') {
                map.set(`%${cnt++}`, Updater.upArgument(cmdArg, spusArg))
            }
            spusArg = spusReader.next()
            cmdArg = cmdSplited.slice(begin, end).join(' ')
        }
        if (cmdArg === '' && spusArg === '') {
            // Match successfully.
            return map
        } else {
            return null
        }
    }

    public static upLine(input: string) {
        if (/^\s*$/.test(input)) {
            return input
        } else {
            return Updater.upCommand(input)
        }
    }

    private static upCommand(input: string) {
        let slash = false

        if (input.slice(0, 1) === '/') {
            input = input.slice(1)
            slash = true
        }

        for (const spusOld of Spuses.pairs.keys()) {
            let map = Updater.getResultMap(input, spusOld)
            if (map) {
                let spusNew = Spuses.pairs.get(spusOld)
                if (spusNew) {
                    let spus = new SpuScript(spusNew)
                    let result = spus.compileWith(map)
                    if (slash) {
                        result = `/${result}`
                    }
                    return result
                }
            }
        }

        throw `Unknown command: ${input}`
    }

    private static upArgument(arg: string, spus: string) {
        switch (spus.slice(1)) {
            case 'block_nbt':
                return Updater.upBlockNbt(arg)
            case 'bool':
                return arg
            case 'command':
                return Updater.upCommand(arg)
            case 'entity':
                return arg
            case 'entity_nbt':
                return Updater.upEntityNbt(arg)
            case 'entity_type':
                return arg
            case 'item_nbt':
                return Updater.upItemNbt(arg)
            case 'item_tag_nbt':
                return Updater.upItemTagNbt(arg)
            case 'json':
                return Updater.upJson(arg)
            case 'literal':
                return arg
            case 'num':
                return arg
            case 'num_or_star':
                return arg
            case 'say_string':
                return arg
            case 'string':
                return arg
            case 'vec_2':
                return arg
            case 'vec_3':
                return arg
            case 'word':
                return arg
            default:
                throw `Unknown arg type: '${spus}'`
        }
    }

    private static upBlockNbt(input: string) {
        const nbt = getNbt(input, 'before 1.12')
        /* SpawnPotentials */ {
            const spawnPotentials = nbt.get('SpawnPotentials')
            if (spawnPotentials instanceof NbtList) {
                spawnPotentials.forEach((potential: NbtValue) => {
                    if (potential instanceof NbtCompound) {
                        let entity = potential.get('Entity')
                        if (entity instanceof NbtCompound) {
                            entity = getNbt(Updater.upEntityNbt(entity.toString()))
                            potential.set('Entity', entity)
                        }
                    }
                })
            }
        }
        /* SpawnData */ {
            let spawnData = nbt.get('SpawnData')
            if (spawnData instanceof NbtCompound) {
                spawnData = getNbt(Updater.upEntityNbt(spawnData.toString()))
                nbt.set('SpawnData', spawnData)
            }
        }
        return nbt.toString()
    }

    private static upEntityNbt(input_nbt: string) {
        let nbt = getNbt(input_nbt, 'before 1.12')
        let id = nbt.get('id')
        /* Riding */ {
            const riding = nbt.get('Riding')
            nbt.del('Riding')
            if (riding instanceof NbtCompound) {
                const passengers = new NbtList()
                const passenger = riding
                passengers.add(passenger)
                nbt.set('Passengers', passengers)
            }
        }
        /* Healf */ {
            const healF = nbt.get('HealF')
            nbt.del('HealF')
            if (healF instanceof NbtFloat || healF instanceof NbtInt) {
                const health = new NbtInt(healF.get())
                nbt.set('Health', health)
            }
        }
        /* DropChances */ {
            const dropChances = nbt.get('DropChances')
            nbt.del('DropChances')
            if (dropChances instanceof NbtList) {
                const armorDropChances = new NbtList()
                const handDropChances = new NbtList()
                armorDropChances.set(0, dropChances.get(0))
                armorDropChances.set(1, dropChances.get(1))
                armorDropChances.set(2, dropChances.get(2))
                armorDropChances.set(3, dropChances.get(3))
                handDropChances.set(0, dropChances.get(5))
                handDropChances.set(1, new NbtFloat(0))
                nbt.set('ArmorDropChances', armorDropChances)
                nbt.set('HandDropChances', handDropChances)
            }
        }
        /* Equipment */ {
            const equipment = nbt.get('Equipment')
            nbt.del('Equipment')
            if (equipment instanceof NbtList) {
                const armorItems = new NbtList()
                const handItems = new NbtList()
                armorItems.set(0, getNbt(Updater.upItemNbt(equipment.get(0).toString())))
                armorItems.set(1, getNbt(Updater.upItemNbt(equipment.get(1).toString())))
                armorItems.set(2, getNbt(Updater.upItemNbt(equipment.get(2).toString())))
                armorItems.set(3, getNbt(Updater.upItemNbt(equipment.get(3).toString())))
                handItems.set(0, getNbt(Updater.upItemNbt(equipment.get(4).toString())))
                handItems.set(1, new NbtCompound())
                nbt.set('ArmorItems', armorItems)
                nbt.set('HandItems', handItems)
            }
        }
        /* Properties (Type) */ {
            const properties = nbt.get('Properties')
            nbt.del('Properties')
            if (properties instanceof NbtCompound) {
                const type = nbt.get('Type')
                nbt.del('Type')
                const spawnData = properties
                if (type instanceof NbtString) {
                    spawnData.set('id', type)
                }
                nbt.set('SpawnData', spawnData)
            }
        }
        /* Type */ {
            const type = nbt.get('Type')
            nbt.del('Type')
            if (type instanceof NbtString) {
                const spawnData = new NbtCompound()
                spawnData.set('id', type)
                nbt.set('SpawnData', spawnData)
            }
        }
        return nbt.toString()
    }

    private static upItemNbt(input: string) {
        const nbt = getNbt(input, 'before 1.12')
        /* tag */ {
            let tag = nbt.get('tag')
            if (tag instanceof NbtCompound) {
                tag = getNbt(Updater.upItemTagNbt(tag.toString()))
                nbt.set('tag', tag)
            }
        }
        return nbt.toString()
    }

    private static upItemTagNbt(input: string) {
        const nbt = getNbt(input, 'before 1.12')
        /* EntityTag */ {
            let entityTag = nbt.get('EntityTag')
            if (entityTag instanceof NbtCompound) {
                entityTag = getNbt(Updater.upEntityNbt(entityTag.toString()))
                nbt.set('EntityTag', entityTag)
            }
        }
        /* BlockEntityTag */ {
            let blockEntityTag = nbt.get('BlockEntityTag')
            if (blockEntityTag instanceof NbtCompound) {
                blockEntityTag = getNbt(Updater.upBlockNbt(blockEntityTag.toString()))
                nbt.set('BlockEntityTag', blockEntityTag)
            }
        }
        return nbt.toString()
    }

    private static upJson(input: string) {
        if (input.slice(0, 1) === '"') {
            return input
        } else if (input.slice(0, 1) === '[') {
            let json = JSON.parse(getNbt(input, 'before 1.12').toJson())
            let result: string[] = []
            for (const i of json) {
                result.push(Updater.upJson(JSON.stringify(i)))
            }
            return `[${result.join()}]`
        } else {
            let json = JSON.parse(getNbt(input, 'before 1.12').toJson())
            if (json.selector) {
                let sel = new Selector()
                sel.parse(json.selector)
                json.selector = sel.to111()
            }

            if (
                json.clickEvent &&
                json.clickEvent.action &&
                (json.clickEvent.action === 'run_command' || json.clickEvent.action === 'suggest_command') &&
                json.clickEvent.value
            ) {
                json.clickEvent.value = Updater.upCommand(json.clickEvent.value)
            }

            if (json.extra) {
                json.extra = JSON.parse(Updater.upJson(JSON.stringify(json.extra)))
            }

            return JSON.stringify(json).replace(/§/g, '\\u00a7')
        }
    }
}