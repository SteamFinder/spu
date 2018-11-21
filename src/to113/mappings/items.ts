import { NbtCompound, NbtString, NbtShort, NbtInt, NbtByte, NbtValue } from '../../utils/nbt/nbt'
import { getNbtCompound, completeNamespace } from '../../utils/utils'
import { Number_String } from './mapping'
import Entities from './entities';

export class StdItem1_12 {
    private name: string
    private data: number
    private tag: NbtCompound
    private count: NbtValue | undefined
    private slot: NbtValue | undefined

    public constructor(name: string, data: number, tag: NbtCompound, count?: NbtValue, slot?: NbtValue) {
        name = completeNamespace(name)
        if (data === -1) {
            data = 0
        }
        this.name = name
        this.data = data
        this.tag = tag
        this.count = count
        this.slot = slot
    }

    public getName() {
        return this.name
    }

    public getCount() {
        return this.count
    }

    public getSlot() {
        return this.slot
    }

    public getData() {
        return this.data
    }

    public getTag() {
        return this.tag
    }

    public getNominal() {
        return `${this.name}.${this.data}`
    }
}

export class StdItem1_13 {
    private name: string
    private tag: NbtCompound
    private count: NbtValue | undefined
    private slot: NbtValue | undefined

    public constructor(name: string, nbt: NbtCompound, count?: NbtValue, slot?: NbtValue) {
        name = completeNamespace(name)
        this.name = name
        this.tag = nbt
        this.count = count
        this.slot = slot
    }

    public getName() {
        return this.name
    }

    public getTag() {
        return this.tag
    }

    public getNominal() {
        let nbt = ''
        if (this.hasTag()) {
            nbt = this.tag.toString()
        }
        return `${this.name}${nbt}`
    }

    public getNbt() {
        let nbt = new NbtCompound()

        if (this.name !== 'minecraft:') {
            nbt.set('id', new NbtString(this.name))
        }
        if (this.hasTag()) {
            nbt.set('tag', this.tag)
        }
        if (this.count !== undefined) {
            nbt.set('Count', this.count)
        }
        if (this.slot !== undefined) {
            nbt.set('Slot', this.slot)
        }

        return nbt
    }

    public hasTag() {
        return this.tag.toString() !== '{}'
    }
}

/**
 * Providing a map storing old item IDs and new item IDs.
 */
export default class Items {
    public static std112(id?: number, name?: string, data?: number, tag?: string, nbt?: string) {
        let ansName: string
        let ansData: number
        let ansTag: NbtCompound
        let ansCount: NbtValue | undefined
        let ansSlot: NbtValue | undefined
        if (id && !name && !nbt) {
            ansData = data ? data : 0
            ansTag = getNbtCompound(tag ? tag : '{}')
            const arr = Items.NumericID112_NominalID112.find(v => v[0] === id)
            if (arr) {
                ansName = arr[1]
            } else {
                throw `Unknown item Numeric ID: '${id}'.`
            }
        } else if (name && !id && !nbt) {
            ansData = data ? data : 0
            ansTag = getNbtCompound(tag ? tag : '{}')
            ansName = name
        } else if (!id && !name && !data && !tag && nbt) {
            const nbtC = getNbtCompound(nbt)
            const id = nbtC.get('id')
            const data = nbtC.get('Damage')
            const count = nbtC.get('Count')
            const slot = nbtC.get('Slot')
            let tagC = nbtC.get('tag')

            ansCount = count
            ansSlot = slot

            if (tagC instanceof NbtCompound) {
                ansTag = tagC
            } else {
                ansTag = new NbtCompound()
            }
            if (id instanceof NbtString) {
                ansName = id.get()
            } else {
                ansName = 'minecraft:'
            }
            if (data instanceof NbtInt || data instanceof NbtByte) {
                ansData = data.get()
            } else {
                ansData = 0
            }
        } else {
            throw `Argument Error! Used ${id ? 'id, ' : ''}${name ? 'name, ' : ''}${data ? 'data, ' : ''}${
            tag && tag !== '{}' ? 'tag, ' : ''
            }${nbt && nbt !== '{}' ? 'nbt, ' : ''}.`
        }

        ansName = completeNamespace(ansName)

        return new StdItem1_12(ansName, ansData, ansTag, ansCount, ansSlot)
    }

    public static to113(std: StdItem1_12) {
        let ansName = std.getName()
        let ansCount = std.getCount()
        let ansSlot = std.getSlot()
        let ansTag = std.getTag()
        let data = std.getData()

        if (Items.DamagableItems.indexOf(ansName) !== -1 && data !== 0) {
            ansTag.set('Damage', new NbtShort(data))
        } else if (Items.MapItems.indexOf(ansName) !== -1 && data !== 0) {
            ansTag.set('map', new NbtInt(data))
        } else {
            const arr = Items.Nominal112_NominalID113.find(v => v[0] === std.getNominal())
            if (arr) {
                ansName = arr[1]
            }
        }

        /* EntityTag */ {
            if (ansName === 'minecraft:bat_spawn_egg') {
                const entityTag = ansTag.get('EntityTag')
                if (entityTag instanceof NbtCompound) {
                    const id = entityTag.get('id')
                    if (id instanceof NbtString) {
                        const after = Entities.to113(id.get())
                        // `after` contains `minecraft:` already.
                        if (Items.SpawnEgges.indexOf(`${after}_spawn_egg`) !== -1) {
                            ansName = `${after}_spawn_egg`
                        } else {
                            let display = new NbtCompound()
                            display.set('Name', new NbtString(`{"text":"${after.replace('minecraft:', '')}_spawn_egg","italic":false}`))
                            ansTag.set('display', display)
                        }
                    }
                }
            }
        }

        return new StdItem1_13(ansName, ansTag, ansCount, ansSlot)
    }

    static toNominalColor(input: number, suffix: string) {
        const arr = Items.NumericColor_NominalColor.find(v => v[0] === input.toString())
        if (arr) {
            return `${arr[1]}${suffix}`
        } else {
            throw `Unknown color value: ${input}`
        }
    }

    static NumericID112_NominalID112: Number_String[] = [
        [0, 'minecraft:air'],
        [1, 'minecraft:stone'],
        [2, 'minecraft:grass'],
        [3, 'minecraft:dirt'],
        [4, 'minecraft:cobblestone'],
        [5, 'minecraft:planks'],
        [6, 'minecraft:sapling'],
        [7, 'minecraft:bedrock'],
        [8, 'minecraft:flowing_water'],
        [9, 'minecraft:water'],
        [10, 'minecraft:flowing_lava'],
        [11, 'minecraft:lava'],
        [12, 'minecraft:sand'],
        [13, 'minecraft:gravel'],
        [14, 'minecraft:gold_ore'],
        [15, 'minecraft:iron_ore'],
        [16, 'minecraft:coal_ore'],
        [17, 'minecraft:log'],
        [18, 'minecraft:leaves'],
        [19, 'minecraft:sponge'],
        [20, 'minecraft:glass'],
        [21, 'minecraft:lapis_ore'],
        [22, 'minecraft:lapis_block'],
        [23, 'minecraft:dispenser'],
        [24, 'minecraft:sandstone'],
        [25, 'minecraft:noteblock'],
        [26, 'minecraft:bed'],
        [27, 'minecraft:golden_rail'],
        [28, 'minecraft:detector_rail'],
        [29, 'minecraft:sticky_piston'],
        [30, 'minecraft:web'],
        [31, 'minecraft:tallgrass'],
        [32, 'minecraft:deadbush'],
        [33, 'minecraft:piston'],
        [34, 'minecraft:piston_head'],
        [35, 'minecraft:wool'],
        [36, 'minecraft:piston_extension'],
        [37, 'minecraft:yellow_flower'],
        [38, 'minecraft:red_flower'],
        [39, 'minecraft:brown_mushroom'],
        [40, 'minecraft:red_mushroom'],
        [41, 'minecraft:gold_block'],
        [42, 'minecraft:iron_block'],
        [43, 'minecraft:double_stone_slab'],
        [44, 'minecraft:stone_slab'],
        [45, 'minecraft:brick_block'],
        [46, 'minecraft:tnt'],
        [47, 'minecraft:bookshelf'],
        [48, 'minecraft:mossy_cobblestone'],
        [49, 'minecraft:obsidian'],
        [50, 'minecraft:torch'],
        [51, 'minecraft:fire'],
        [52, 'minecraft:mob_spawner'],
        [53, 'minecraft:oak_stairs'],
        [54, 'minecraft:chest'],
        [55, 'minecraft:redstone_wire'],
        [56, 'minecraft:diamond_ore'],
        [57, 'minecraft:diamond_block'],
        [58, 'minecraft:crafting_table'],
        [59, 'minecraft:wheat'],
        [60, 'minecraft:farmland'],
        [61, 'minecraft:furnace'],
        [62, 'minecraft:lit_furnace'],
        [63, 'minecraft:standing_sign'],
        [64, 'minecraft:wooden_door'],
        [65, 'minecraft:ladder'],
        [66, 'minecraft:rail'],
        [67, 'minecraft:stone_stairs'],
        [68, 'minecraft:wall_sign'],
        [69, 'minecraft:lever'],
        [70, 'minecraft:stone_pressure_plate'],
        [71, 'minecraft:iron_door'],
        [72, 'minecraft:wooden_pressure_plate'],
        [73, 'minecraft:redstone_ore'],
        [74, 'minecraft:lit_redstone_ore'],
        [75, 'minecraft:unlit_redstone_torch'],
        [76, 'minecraft:redstone_torch'],
        [77, 'minecraft:stone_button'],
        [78, 'minecraft:snow_layer'],
        [79, 'minecraft:ice'],
        [80, 'minecraft:snow'],
        [81, 'minecraft:cactus'],
        [82, 'minecraft:clay'],
        [83, 'minecraft:reeds'],
        [84, 'minecraft:jukebox'],
        [85, 'minecraft:fence'],
        [86, 'minecraft:pumpkin'],
        [87, 'minecraft:netherrack'],
        [88, 'minecraft:soul_sand'],
        [89, 'minecraft:glowstone'],
        [90, 'minecraft:portal'],
        [91, 'minecraft:lit_pumpkin'],
        [92, 'minecraft:cake'],
        [93, 'minecraft:unpowered_repeater'],
        [94, 'minecraft:powered_repeater'],
        [95, 'minecraft:stained_glass'],
        [96, 'minecraft:trapdoor'],
        [97, 'minecraft:monster_egg'],
        [98, 'minecraft:stonebrick'],
        [99, 'minecraft:brown_mushroom_block'],
        [100, 'minecraft:red_mushroom_block'],
        [101, 'minecraft:iron_bars'],
        [102, 'minecraft:glass_pane'],
        [103, 'minecraft:melon_block'],
        [104, 'minecraft:pumpkin_stem'],
        [105, 'minecraft:melon_stem'],
        [106, 'minecraft:vine'],
        [107, 'minecraft:fence_gate'],
        [108, 'minecraft:brick_stairs'],
        [109, 'minecraft:stone_brick_stairs'],
        [110, 'minecraft:mycelium'],
        [111, 'minecraft:waterlily'],
        [112, 'minecraft:nether_brick'],
        [113, 'minecraft:nether_brick_fence'],
        [114, 'minecraft:nether_brick_stairs'],
        [115, 'minecraft:nether_wart'],
        [116, 'minecraft:enchanting_table'],
        [117, 'minecraft:brewing_stand'],
        [118, 'minecraft:cauldron'],
        [119, 'minecraft:end_portal'],
        [120, 'minecraft:end_portal_frame'],
        [121, 'minecraft:end_stone'],
        [122, 'minecraft:dragon_egg'],
        [123, 'minecraft:redstone_lamp'],
        [124, 'minecraft:lit_redstone_lamp'],
        [125, 'minecraft:double_wooden_slab'],
        [126, 'minecraft:wooden_slab'],
        [127, 'minecraft:cocoa'],
        [128, 'minecraft:sandstone_stairs'],
        [129, 'minecraft:emerald_ore'],
        [130, 'minecraft:ender_chest'],
        [131, 'minecraft:tripwire_hook'],
        [132, 'minecraft:tripwire'],
        [133, 'minecraft:emerald_block'],
        [134, 'minecraft:spruce_stairs'],
        [135, 'minecraft:birch_stairs'],
        [136, 'minecraft:jungle_stairs'],
        [137, 'minecraft:command_block'],
        [138, 'minecraft:beacon'],
        [139, 'minecraft:cobblestone_wall'],
        [140, 'minecraft:flower_pot'],
        [141, 'minecraft:carrots'],
        [142, 'minecraft:potatoes'],
        [143, 'minecraft:wooden_button'],
        [144, 'minecraft:skull'],
        [145, 'minecraft:anvil'],
        [146, 'minecraft:trapped_chest'],
        [147, 'minecraft:light_weighted_pressure_plate'],
        [148, 'minecraft:heavy_weighted_pressure_plate'],
        [149, 'minecraft:unpowered_comparator'],
        [150, 'minecraft:powered_comparator'],
        [151, 'minecraft:daylight_detector'],
        [152, 'minecraft:redstone_block'],
        [153, 'minecraft:quartz_ore'],
        [154, 'minecraft:hopper'],
        [155, 'minecraft:quartz_block'],
        [156, 'minecraft:quartz_stairs'],
        [157, 'minecraft:activator_rail'],
        [158, 'minecraft:dropper'],
        [159, 'minecraft:stained_hardened_clay'],
        [160, 'minecraft:stained_glass_pane'],
        [161, 'minecraft:leaves2'],
        [162, 'minecraft:log2'],
        [163, 'minecraft:acacia_stairs'],
        [164, 'minecraft:dark_oak_stairs'],
        [165, 'minecraft:slime'],
        [166, 'minecraft:barrier'],
        [167, 'minecraft:iron_trapdoor'],
        [168, 'minecraft:prismarine'],
        [169, 'minecraft:sea_lantern'],
        [170, 'minecraft:hay_block'],
        [171, 'minecraft:carpet'],
        [172, 'minecraft:hardened_clay'],
        [173, 'minecraft:coal_block'],
        [174, 'minecraft:packed_ice'],
        [175, 'minecraft:double_plant'],
        [176, 'minecraft:standing_banner'],
        [177, 'minecraft:wall_banner'],
        [178, 'minecraft:daylight_detector_inverted'],
        [179, 'minecraft:red_sandstone'],
        [180, 'minecraft:red_sandstone_stairs'],
        [181, 'minecraft:double_stone_slab2'],
        [182, 'minecraft:stone_slab2'],
        [183, 'minecraft:spruce_fence_gate'],
        [184, 'minecraft:birch_fence_gate'],
        [185, 'minecraft:jungle_fence_gate'],
        [186, 'minecraft:dark_oak_fence_gate'],
        [187, 'minecraft:acacia_fence_gate'],
        [188, 'minecraft:spruce_fence'],
        [189, 'minecraft:birch_fence'],
        [190, 'minecraft:jungle_fence'],
        [191, 'minecraft:dark_oak_fence'],
        [192, 'minecraft:acacia_fence'],
        [193, 'minecraft:spruce_door'],
        [194, 'minecraft:birch_door'],
        [195, 'minecraft:jungle_door'],
        [196, 'minecraft:acacia_door'],
        [197, 'minecraft:dark_oak_door'],
        [198, 'minecraft:end_rod'],
        [199, 'minecraft:chorus_plant'],
        [200, 'minecraft:chorus_flower'],
        [201, 'minecraft:purpur_block'],
        [202, 'minecraft:purpur_pillar'],
        [203, 'minecraft:purpur_stairs'],
        [204, 'minecraft:purpur_double_slab'],
        [205, 'minecraft:purpur_slab'],
        [206, 'minecraft:end_bricks'],
        [207, 'minecraft:beetroots'],
        [208, 'minecraft:grass_path'],
        [209, 'minecraft:end_gateway'],
        [210, 'minecraft:repeating_command_block'],
        [211, 'minecraft:chain_command_block'],
        [212, 'minecraft:frosted_ice'],
        [213, 'minecraft:magma'],
        [214, 'minecraft:nether_wart_block'],
        [215, 'minecraft:red_nether_brick'],
        [216, 'minecraft:bone_block'],
        [217, 'minecraft:structure_void'],
        [218, 'minecraft:observer'],
        [219, 'minecraft:white_shulker_box'],
        [220, 'minecraft:orange_shulker_box'],
        [221, 'minecraft:magenta_shulker_box'],
        [222, 'minecraft:light_blue_shulker_box'],
        [223, 'minecraft:yellow_shulker_box'],
        [224, 'minecraft:lime_shulker_box'],
        [225, 'minecraft:pink_shulker_box'],
        [226, 'minecraft:gray_shulker_box'],
        [227, 'minecraft:silver_shulker_box'],
        [228, 'minecraft:cyan_shulker_box'],
        [229, 'minecraft:purple_shulker_box'],
        [230, 'minecraft:blue_shulker_box'],
        [231, 'minecraft:brown_shulker_box'],
        [232, 'minecraft:green_shulker_box'],
        [233, 'minecraft:red_shulker_box'],
        [234, 'minecraft:black_shulker_box'],
        [235, 'minecraft:white_glazed_terracotta'],
        [236, 'minecraft:orange_glazed_terracotta'],
        [237, 'minecraft:magenta_glazed_terracotta'],
        [238, 'minecraft:light_blue_glazed_terracotta'],
        [239, 'minecraft:yellow_glazed_terracotta'],
        [240, 'minecraft:lime_glazed_terracotta'],
        [241, 'minecraft:pink_glazed_terracotta'],
        [242, 'minecraft:gray_glazed_terracotta'],
        [243, 'minecraft:silver_glazed_terracotta'],
        [244, 'minecraft:cyan_glazed_terracotta'],
        [245, 'minecraft:purple_glazed_terracotta'],
        [246, 'minecraft:blue_glazed_terracotta'],
        [247, 'minecraft:brown_glazed_terracotta'],
        [248, 'minecraft:green_glazed_terracotta'],
        [249, 'minecraft:red_glazed_terracotta'],
        [250, 'minecraft:black_glazed_terracotta'],
        [251, 'minecraft:concrete'],
        [252, 'minecraft:concrete_powder'],
        [255, 'minecraft:structure_block'],
        [256, 'minecraft:iron_shovel'],
        [257, 'minecraft:iron_pickaxe'],
        [258, 'minecraft:iron_axe'],
        [259, 'minecraft:flint_and_steel'],
        [260, 'minecraft:apple'],
        [261, 'minecraft:bow'],
        [262, 'minecraft:arrow'],
        [263, 'minecraft:coal'],
        [264, 'minecraft:diamond'],
        [265, 'minecraft:iron_ingot'],
        [266, 'minecraft:gold_ingot'],
        [267, 'minecraft:iron_sword'],
        [268, 'minecraft:wooden_sword'],
        [269, 'minecraft:wooden_shovel'],
        [270, 'minecraft:wooden_pickaxe'],
        [271, 'minecraft:wooden_axe'],
        [272, 'minecraft:stone_sword'],
        [273, 'minecraft:stone_shovel'],
        [274, 'minecraft:stone_pickaxe'],
        [275, 'minecraft:stone_axe'],
        [276, 'minecraft:diamond_sword'],
        [277, 'minecraft:diamond_shovel'],
        [278, 'minecraft:diamond_pickaxe'],
        [279, 'minecraft:diamond_axe'],
        [280, 'minecraft:stick'],
        [281, 'minecraft:bowl'],
        [282, 'minecraft:mushroom_stew'],
        [283, 'minecraft:golden_sword'],
        [284, 'minecraft:golden_shovel'],
        [285, 'minecraft:golden_pickaxe'],
        [286, 'minecraft:golden_axe'],
        [287, 'minecraft:string'],
        [288, 'minecraft:feather'],
        [289, 'minecraft:gunpowder'],
        [290, 'minecraft:wooden_hoe'],
        [291, 'minecraft:stone_hoe'],
        [292, 'minecraft:iron_hoe'],
        [293, 'minecraft:diamond_hoe'],
        [294, 'minecraft:golden_hoe'],
        [295, 'minecraft:wheat_seeds'],
        [296, 'minecraft:wheat'],
        [297, 'minecraft:bread'],
        [298, 'minecraft:leather_helmet'],
        [299, 'minecraft:leather_chestplate'],
        [300, 'minecraft:leather_leggings'],
        [301, 'minecraft:leather_boots'],
        [302, 'minecraft:chainmail_helmet'],
        [303, 'minecraft:chainmail_chestplate'],
        [304, 'minecraft:chainmail_leggings'],
        [305, 'minecraft:chainmail_boots'],
        [306, 'minecraft:iron_helmet'],
        [307, 'minecraft:iron_chestplate'],
        [308, 'minecraft:iron_leggings'],
        [309, 'minecraft:iron_boots'],
        [310, 'minecraft:diamond_helmet'],
        [311, 'minecraft:diamond_chestplate'],
        [312, 'minecraft:diamond_leggings'],
        [313, 'minecraft:diamond_boots'],
        [314, 'minecraft:golden_helmet'],
        [315, 'minecraft:golden_chestplate'],
        [316, 'minecraft:golden_leggings'],
        [317, 'minecraft:golden_boots'],
        [318, 'minecraft:flint'],
        [319, 'minecraft:porkchop'],
        [320, 'minecraft:cooked_porkchop'],
        [321, 'minecraft:painting'],
        [322, 'minecraft:golden_apple'],
        [323, 'minecraft:sign'],
        [324, 'minecraft:wooden_door'],
        [325, 'minecraft:bucket'],
        [326, 'minecraft:water_bucket'],
        [327, 'minecraft:lava_bucket'],
        [328, 'minecraft:minecart'],
        [329, 'minecraft:saddle'],
        [330, 'minecraft:iron_door'],
        [331, 'minecraft:redstone'],
        [332, 'minecraft:snowball'],
        [333, 'minecraft:boat'],
        [334, 'minecraft:leather'],
        [335, 'minecraft:milk_bucket'],
        [336, 'minecraft:brick'],
        [337, 'minecraft:clay_ball'],
        [338, 'minecraft:reeds'],
        [339, 'minecraft:paper'],
        [340, 'minecraft:book'],
        [341, 'minecraft:slime_ball'],
        [342, 'minecraft:chest_minecart'],
        [343, 'minecraft:furnace_minecart'],
        [344, 'minecraft:egg'],
        [345, 'minecraft:compass'],
        [346, 'minecraft:fishing_rod'],
        [347, 'minecraft:clock'],
        [348, 'minecraft:glowstone_dust'],
        [349, 'minecraft:fish'],
        [350, 'minecraft:cooked_fish'],
        [351, 'minecraft:dye'],
        [352, 'minecraft:bone'],
        [353, 'minecraft:sugar'],
        [354, 'minecraft:cake'],
        [355, 'minecraft:bed'],
        [356, 'minecraft:repeater'],
        [357, 'minecraft:cookie'],
        [358, 'minecraft:filled_map'],
        [359, 'minecraft:shears'],
        [360, 'minecraft:melon'],
        [361, 'minecraft:pumpkin_seeds'],
        [362, 'minecraft:melon_seeds'],
        [363, 'minecraft:beef'],
        [364, 'minecraft:cooked_beef'],
        [365, 'minecraft:chicken'],
        [366, 'minecraft:cooked_chicken'],
        [367, 'minecraft:rotten_flesh'],
        [368, 'minecraft:ender_pearl'],
        [369, 'minecraft:blaze_rod'],
        [370, 'minecraft:ghast_tear'],
        [371, 'minecraft:gold_nugget'],
        [372, 'minecraft:nether_wart'],
        [373, 'minecraft:potion'],
        [374, 'minecraft:glass_bottle'],
        [375, 'minecraft:spider_eye'],
        [376, 'minecraft:fermented_spider_eye'],
        [377, 'minecraft:blaze_powder'],
        [378, 'minecraft:magma_cream'],
        [379, 'minecraft:brewing_stand'],
        [380, 'minecraft:cauldron'],
        [381, 'minecraft:ender_eye'],
        [382, 'minecraft:speckled_melon'],
        [383, 'minecraft:spawn_egg'],
        [384, 'minecraft:experience_bottle'],
        [385, 'minecraft:fire_charge'],
        [386, 'minecraft:writable_book'],
        [387, 'minecraft:written_book'],
        [388, 'minecraft:emerald'],
        [389, 'minecraft:item_frame'],
        [390, 'minecraft:flower_pot'],
        [391, 'minecraft:carrot'],
        [392, 'minecraft:potato'],
        [393, 'minecraft:baked_potato'],
        [394, 'minecraft:poisonous_potato'],
        [395, 'minecraft:map'],
        [396, 'minecraft:golden_carrot'],
        [397, 'minecraft:skull'],
        [398, 'minecraft:carrot_on_a_stick'],
        [399, 'minecraft:nether_star'],
        [400, 'minecraft:pumpkin_pie'],
        [401, 'minecraft:fireworks'],
        [402, 'minecraft:firework_charge'],
        [403, 'minecraft:enchanted_book'],
        [404, 'minecraft:comparator'],
        [405, 'minecraft:netherbrick'],
        [406, 'minecraft:quartz'],
        [407, 'minecraft:tnt_minecart'],
        [408, 'minecraft:hopper_minecart'],
        [409, 'minecraft:prismarine_shard'],
        [410, 'minecraft:prismarine_crystals'],
        [411, 'minecraft:rabbit'],
        [412, 'minecraft:cooked_rabbit'],
        [413, 'minecraft:rabbit_stew'],
        [414, 'minecraft:rabbit_foot'],
        [415, 'minecraft:rabbit_hide'],
        [416, 'minecraft:armor_stand'],
        [417, 'minecraft:iron_horse_armor'],
        [418, 'minecraft:golden_horse_armor'],
        [419, 'minecraft:diamond_horse_armor'],
        [420, 'minecraft:lead'],
        [421, 'minecraft:name_tag'],
        [422, 'minecraft:command_block_minecart'],
        [423, 'minecraft:mutton'],
        [424, 'minecraft:cooked_mutton'],
        [425, 'minecraft:banner'],
        [426, 'minecraft:end_crystal'],
        [427, 'minecraft:spruce_door'],
        [428, 'minecraft:birch_door'],
        [429, 'minecraft:jungle_door'],
        [430, 'minecraft:acacia_door'],
        [431, 'minecraft:dark_oak_door'],
        [432, 'minecraft:chorus_fruit'],
        [433, 'minecraft:chorus_fruit_popped'],
        [434, 'minecraft:beetroot'],
        [435, 'minecraft:beetroot_seeds'],
        [436, 'minecraft:beetroot_soup'],
        [437, 'minecraft:dragon_breath'],
        [438, 'minecraft:splash_potion'],
        [439, 'minecraft:spectral_arrow'],
        [440, 'minecraft:tipped_arrow'],
        [441, 'minecraft:lingering_potion'],
        [442, 'minecraft:shield'],
        [443, 'minecraft:elytra'],
        [444, 'minecraft:spruce_boat'],
        [445, 'minecraft:birch_boat'],
        [446, 'minecraft:jungle_boat'],
        [447, 'minecraft:acacia_boat'],
        [448, 'minecraft:dark_oak_boat'],
        [449, 'minecraft:totem_of_undying'],
        [450, 'minecraft:shulker_shell'],
        [452, 'minecraft:iron_nugget'],
        [453, 'minecraft:knowledge_book'],
        [2256, 'minecraft:record_13'],
        [2257, 'minecraft:record_cat'],
        [2258, 'minecraft:record_blocks'],
        [2259, 'minecraft:record_chirp'],
        [2260, 'minecraft:record_far'],
        [2261, 'minecraft:record_mall'],
        [2262, 'minecraft:record_mellohi'],
        [2263, 'minecraft:record_stal'],
        [2264, 'minecraft:record_strad'],
        [2265, 'minecraft:record_ward'],
        [2266, 'minecraft:record_11'],
        [2267, 'minecraft:record_wait']
    ]

    static Nominal112_NominalID113 = [
        ['minecraft:stone.0', 'minecraft:stone'],
        ['minecraft:stone.1', 'minecraft:granite'],
        ['minecraft:stone.2', 'minecraft:polished_granite'],
        ['minecraft:stone.3', 'minecraft:diorite'],
        ['minecraft:stone.4', 'minecraft:polished_diorite'],
        ['minecraft:stone.5', 'minecraft:andesite'],
        ['minecraft:stone.6', 'minecraft:polished_andesite'],
        ['minecraft:dirt.0', 'minecraft:dirt'],
        ['minecraft:dirt.1', 'minecraft:coarse_dirt'],
        ['minecraft:dirt.2', 'minecraft:podzol'],
        ['minecraft:leaves.0', 'minecraft:oak_leaves'],
        ['minecraft:leaves.1', 'minecraft:spruce_leaves'],
        ['minecraft:leaves.2', 'minecraft:birch_leaves'],
        ['minecraft:leaves.3', 'minecraft:jungle_leaves'],
        ['minecraft:leaves2.0', 'minecraft:acacia_leaves'],
        ['minecraft:leaves2.1', 'minecraft:dark_oak_leaves'],
        ['minecraft:log.0', 'minecraft:oak_log'],
        ['minecraft:log.1', 'minecraft:spruce_log'],
        ['minecraft:log.2', 'minecraft:birch_log'],
        ['minecraft:log.3', 'minecraft:jungle_log'],
        ['minecraft:log2.0', 'minecraft:acacia_log'],
        ['minecraft:log2.1', 'minecraft:dark_oak_log'],
        ['minecraft:sapling.0', 'minecraft:oak_sapling'],
        ['minecraft:sapling.1', 'minecraft:spruce_sapling'],
        ['minecraft:sapling.2', 'minecraft:birch_sapling'],
        ['minecraft:sapling.3', 'minecraft:jungle_sapling'],
        ['minecraft:sapling.4', 'minecraft:acacia_sapling'],
        ['minecraft:sapling.5', 'minecraft:dark_oak_sapling'],
        ['minecraft:planks.0', 'minecraft:oak_planks'],
        ['minecraft:planks.1', 'minecraft:spruce_planks'],
        ['minecraft:planks.2', 'minecraft:birch_planks'],
        ['minecraft:planks.3', 'minecraft:jungle_planks'],
        ['minecraft:planks.4', 'minecraft:acacia_planks'],
        ['minecraft:planks.5', 'minecraft:dark_oak_planks'],
        ['minecraft:sand.0', 'minecraft:sand'],
        ['minecraft:sand.1', 'minecraft:red_sand'],
        ['minecraft:quartz_block.0', 'minecraft:quartz_block'],
        ['minecraft:quartz_block.1', 'minecraft:chiseled_quartz_block'],
        ['minecraft:quartz_block.2', 'minecraft:quartz_pillar'],
        ['minecraft:anvil.0', 'minecraft:anvil'],
        ['minecraft:anvil.1', 'minecraft:chipped_anvil'],
        ['minecraft:anvil.2', 'minecraft:damaged_anvil'],
        ['minecraft:wool.0', 'minecraft:white_wool'],
        ['minecraft:wool.1', 'minecraft:orange_wool'],
        ['minecraft:wool.2', 'minecraft:magenta_wool'],
        ['minecraft:wool.3', 'minecraft:light_blue_wool'],
        ['minecraft:wool.4', 'minecraft:yellow_wool'],
        ['minecraft:wool.5', 'minecraft:lime_wool'],
        ['minecraft:wool.6', 'minecraft:pink_wool'],
        ['minecraft:wool.7', 'minecraft:gray_wool'],
        ['minecraft:wool.8', 'minecraft:light_gray_wool'],
        ['minecraft:wool.9', 'minecraft:cyan_wool'],
        ['minecraft:wool.10', 'minecraft:purple_wool'],
        ['minecraft:wool.11', 'minecraft:blue_wool'],
        ['minecraft:wool.12', 'minecraft:brown_wool'],
        ['minecraft:wool.13', 'minecraft:green_wool'],
        ['minecraft:wool.14', 'minecraft:red_wool'],
        ['minecraft:wool.15', 'minecraft:black_wool'],
        ['minecraft:carpet.0', 'minecraft:white_carpet'],
        ['minecraft:carpet.1', 'minecraft:orange_carpet'],
        ['minecraft:carpet.2', 'minecraft:magenta_carpet'],
        ['minecraft:carpet.3', 'minecraft:light_blue_carpet'],
        ['minecraft:carpet.4', 'minecraft:yellow_carpet'],
        ['minecraft:carpet.5', 'minecraft:lime_carpet'],
        ['minecraft:carpet.6', 'minecraft:pink_carpet'],
        ['minecraft:carpet.7', 'minecraft:gray_carpet'],
        ['minecraft:carpet.8', 'minecraft:light_gray_carpet'],
        ['minecraft:carpet.9', 'minecraft:cyan_carpet'],
        ['minecraft:carpet.10', 'minecraft:purple_carpet'],
        ['minecraft:carpet.11', 'minecraft:blue_carpet'],
        ['minecraft:carpet.12', 'minecraft:brown_carpet'],
        ['minecraft:carpet.13', 'minecraft:green_carpet'],
        ['minecraft:carpet.14', 'minecraft:red_carpet'],
        ['minecraft:carpet.15', 'minecraft:black_carpet'],
        ['minecraft:stained_hardened_clay.0', 'minecraft:white_terracotta'],
        ['minecraft:stained_hardened_clay.1', 'minecraft:orange_terracotta'],
        ['minecraft:stained_hardened_clay.2', 'minecraft:magenta_terracotta'],
        ['minecraft:stained_hardened_clay.3', 'minecraft:light_blue_terracotta'],
        ['minecraft:stained_hardened_clay.4', 'minecraft:yellow_terracotta'],
        ['minecraft:stained_hardened_clay.5', 'minecraft:lime_terracotta'],
        ['minecraft:stained_hardened_clay.6', 'minecraft:pink_terracotta'],
        ['minecraft:stained_hardened_clay.7', 'minecraft:gray_terracotta'],
        ['minecraft:stained_hardened_clay.8', 'minecraft:light_gray_terracotta'],
        ['minecraft:stained_hardened_clay.9', 'minecraft:cyan_terracotta'],
        ['minecraft:stained_hardened_clay.10', 'minecraft:purple_terracotta'],
        ['minecraft:stained_hardened_clay.11', 'minecraft:blue_terracotta'],
        ['minecraft:stained_hardened_clay.12', 'minecraft:brown_terracotta'],
        ['minecraft:stained_hardened_clay.13', 'minecraft:green_terracotta'],
        ['minecraft:stained_hardened_clay.14', 'minecraft:red_terracotta'],
        ['minecraft:stained_hardened_clay.15', 'minecraft:black_terracotta'],
        ['minecraft:silver_glazed_terracotta.0', 'minecraft:light_gray_glazed_terracotta'],
        ['minecraft:stained_glass.0', 'minecraft:white_stained_glass'],
        ['minecraft:stained_glass.1', 'minecraft:orange_stained_glass'],
        ['minecraft:stained_glass.2', 'minecraft:magenta_stained_glass'],
        ['minecraft:stained_glass.3', 'minecraft:light_blue_stained_glass'],
        ['minecraft:stained_glass.4', 'minecraft:yellow_stained_glass'],
        ['minecraft:stained_glass.5', 'minecraft:lime_stained_glass'],
        ['minecraft:stained_glass.6', 'minecraft:pink_stained_glass'],
        ['minecraft:stained_glass.7', 'minecraft:gray_stained_glass'],
        ['minecraft:stained_glass.8', 'minecraft:light_gray_stained_glass'],
        ['minecraft:stained_glass.9', 'minecraft:cyan_stained_glass'],
        ['minecraft:stained_glass.10', 'minecraft:purple_stained_glass'],
        ['minecraft:stained_glass.11', 'minecraft:blue_stained_glass'],
        ['minecraft:stained_glass.12', 'minecraft:brown_stained_glass'],
        ['minecraft:stained_glass.13', 'minecraft:green_stained_glass'],
        ['minecraft:stained_glass.14', 'minecraft:red_stained_glass'],
        ['minecraft:stained_glass.15', 'minecraft:black_stained_glass'],
        ['minecraft:stained_glass_pane.0', 'minecraft:white_stained_glass_pane'],
        ['minecraft:stained_glass_pane.1', 'minecraft:orange_stained_glass_pane'],
        ['minecraft:stained_glass_pane.2', 'minecraft:magenta_stained_glass_pane'],
        ['minecraft:stained_glass_pane.3', 'minecraft:light_blue_stained_glass_pane'],
        ['minecraft:stained_glass_pane.4', 'minecraft:yellow_stained_glass_pane'],
        ['minecraft:stained_glass_pane.5', 'minecraft:lime_stained_glass_pane'],
        ['minecraft:stained_glass_pane.6', 'minecraft:pink_stained_glass_pane'],
        ['minecraft:stained_glass_pane.7', 'minecraft:gray_stained_glass_pane'],
        ['minecraft:stained_glass_pane.8', 'minecraft:light_gray_stained_glass_pane'],
        ['minecraft:stained_glass_pane.9', 'minecraft:cyan_stained_glass_pane'],
        ['minecraft:stained_glass_pane.10', 'minecraft:purple_stained_glass_pane'],
        ['minecraft:stained_glass_pane.11', 'minecraft:blue_stained_glass_pane'],
        ['minecraft:stained_glass_pane.12', 'minecraft:brown_stained_glass_pane'],
        ['minecraft:stained_glass_pane.13', 'minecraft:green_stained_glass_pane'],
        ['minecraft:stained_glass_pane.14', 'minecraft:red_stained_glass_pane'],
        ['minecraft:stained_glass_pane.15', 'minecraft:black_stained_glass_pane'],
        ['minecraft:prismarine.0', 'minecraft:prismarine'],
        ['minecraft:prismarine.1', 'minecraft:prismarine_bricks'],
        ['minecraft:prismarine.2', 'minecraft:dark_prismarine'],
        ['minecraft:concrete.0', 'minecraft:white_concrete'],
        ['minecraft:concrete.1', 'minecraft:orange_concrete'],
        ['minecraft:concrete.2', 'minecraft:magenta_concrete'],
        ['minecraft:concrete.3', 'minecraft:light_blue_concrete'],
        ['minecraft:concrete.4', 'minecraft:yellow_concrete'],
        ['minecraft:concrete.5', 'minecraft:lime_concrete'],
        ['minecraft:concrete.6', 'minecraft:pink_concrete'],
        ['minecraft:concrete.7', 'minecraft:gray_concrete'],
        ['minecraft:concrete.8', 'minecraft:light_gray_concrete'],
        ['minecraft:concrete.9', 'minecraft:cyan_concrete'],
        ['minecraft:concrete.10', 'minecraft:purple_concrete'],
        ['minecraft:concrete.11', 'minecraft:blue_concrete'],
        ['minecraft:concrete.12', 'minecraft:brown_concrete'],
        ['minecraft:concrete.13', 'minecraft:green_concrete'],
        ['minecraft:concrete.14', 'minecraft:red_concrete'],
        ['minecraft:concrete.15', 'minecraft:black_concrete'],
        ['minecraft:concrete_powder.0', 'minecraft:white_concrete_powder'],
        ['minecraft:concrete_powder.1', 'minecraft:orange_concrete_powder'],
        ['minecraft:concrete_powder.2', 'minecraft:magenta_concrete_powder'],
        ['minecraft:concrete_powder.3', 'minecraft:light_blue_concrete_powder'],
        ['minecraft:concrete_powder.4', 'minecraft:yellow_concrete_powder'],
        ['minecraft:concrete_powder.5', 'minecraft:lime_concrete_powder'],
        ['minecraft:concrete_powder.6', 'minecraft:pink_concrete_powder'],
        ['minecraft:concrete_powder.7', 'minecraft:gray_concrete_powder'],
        ['minecraft:concrete_powder.8', 'minecraft:light_gray_concrete_powder'],
        ['minecraft:concrete_powder.9', 'minecraft:cyan_concrete_powder'],
        ['minecraft:concrete_powder.10', 'minecraft:purple_concrete_powder'],
        ['minecraft:concrete_powder.11', 'minecraft:blue_concrete_powder'],
        ['minecraft:concrete_powder.12', 'minecraft:brown_concrete_powder'],
        ['minecraft:concrete_powder.13', 'minecraft:green_concrete_powder'],
        ['minecraft:concrete_powder.14', 'minecraft:red_concrete_powder'],
        ['minecraft:concrete_powder.15', 'minecraft:black_concrete_powder'],
        ['minecraft:cobblestone_wall.0', 'minecraft:cobblestone_wall'],
        ['minecraft:cobblestone_wall.1', 'minecraft:mossy_cobblestone_wall'],
        ['minecraft:sandstone.0', 'minecraft:sandstone'],
        ['minecraft:sandstone.1', 'minecraft:chiseled_sandstone'],
        ['minecraft:sandstone.2', 'minecraft:cut_sandstone'],
        ['minecraft:red_sandstone.0', 'minecraft:red_sandstone'],
        ['minecraft:red_sandstone.1', 'minecraft:chiseled_red_sandstone'],
        ['minecraft:red_sandstone.2', 'minecraft:cut_red_sandstone'],
        ['minecraft:stonebrick.0', 'minecraft:stone_bricks'],
        ['minecraft:stonebrick.1', 'minecraft:mossy_stone_bricks'],
        ['minecraft:stonebrick.2', 'minecraft:cracked_stone_bricks'],
        ['minecraft:stonebrick.3', 'minecraft:chiseled_stone_bricks'],
        ['minecraft:monster_egg.0', 'minecraft:infested_stone'],
        ['minecraft:monster_egg.1', 'minecraft:infested_cobblestone'],
        ['minecraft:monster_egg.2', 'minecraft:infested_stone_bricks'],
        ['minecraft:monster_egg.3', 'minecraft:infested_mossy_stone_bricks'],
        ['minecraft:monster_egg.4', 'minecraft:infested_cracked_stone_bricks'],
        ['minecraft:monster_egg.5', 'minecraft:infested_chiseled_stone_bricks'],
        ['minecraft:yellow_flower.0', 'minecraft:dandelion'],
        ['minecraft:red_flower.0', 'minecraft:poppy'],
        ['minecraft:red_flower.1', 'minecraft:blue_orchid'],
        ['minecraft:red_flower.2', 'minecraft:allium'],
        ['minecraft:red_flower.3', 'minecraft:azure_bluet'],
        ['minecraft:red_flower.4', 'minecraft:red_tulip'],
        ['minecraft:red_flower.5', 'minecraft:orange_tulip'],
        ['minecraft:red_flower.6', 'minecraft:white_tulip'],
        ['minecraft:red_flower.7', 'minecraft:pink_tulip'],
        ['minecraft:red_flower.8', 'minecraft:oxeye_daisy'],
        ['minecraft:double_plant.0', 'minecraft:sunflower'],
        ['minecraft:double_plant.1', 'minecraft:lilac'],
        ['minecraft:double_plant.2', 'minecraft:tall_grass'],
        ['minecraft:double_plant.3', 'minecraft:large_fern'],
        ['minecraft:double_plant.4', 'minecraft:rose_bush'],
        ['minecraft:double_plant.5', 'minecraft:peony'],
        ['minecraft:deadbush.0', 'minecraft:dead_bush'],
        ['minecraft:tallgrass.0', 'minecraft:dead_bush'],
        ['minecraft:tallgrass.1', 'minecraft:grass'],
        ['minecraft:tallgrass.2', 'minecraft:fern'],
        ['minecraft:sponge.0', 'minecraft:sponge'],
        ['minecraft:sponge.1', 'minecraft:wet_sponge'],
        ['minecraft:purpur_slab.0', 'minecraft:purpur_slab'],
        ['minecraft:stone_slab.0', 'minecraft:stone_slab'],
        ['minecraft:stone_slab.1', 'minecraft:sandstone_slab'],
        ['minecraft:stone_slab.2', 'minecraft:petrified_oak_slab'],
        ['minecraft:stone_slab.3', 'minecraft:cobblestone_slab'],
        ['minecraft:stone_slab.4', 'minecraft:brick_slab'],
        ['minecraft:stone_slab.5', 'minecraft:stone_brick_slab'],
        ['minecraft:stone_slab.6', 'minecraft:nether_brick_slab'],
        ['minecraft:stone_slab.7', 'minecraft:quartz_slab'],
        ['minecraft:stone_slab2.0', 'minecraft:red_sandstone_slab'],
        ['minecraft:wooden_slab.0', 'minecraft:oak_slab'],
        ['minecraft:wooden_slab.1', 'minecraft:spruce_slab'],
        ['minecraft:wooden_slab.2', 'minecraft:birch_slab'],
        ['minecraft:wooden_slab.3', 'minecraft:jungle_slab'],
        ['minecraft:wooden_slab.4', 'minecraft:acacia_slab'],
        ['minecraft:wooden_slab.5', 'minecraft:dark_oak_slab'],
        ['minecraft:coal.0', 'minecraft:coal'],
        ['minecraft:coal.1', 'minecraft:charcoal'],
        ['minecraft:fish.0', 'minecraft:cod'],
        ['minecraft:fish.1', 'minecraft:salmon'],
        ['minecraft:fish.2', 'minecraft:tropical_fish'],
        ['minecraft:fish.3', 'minecraft:pufferfish'],
        ['minecraft:cooked_fish.0', 'minecraft:cooked_cod'],
        ['minecraft:cooked_fish.1', 'minecraft:cooked_salmon'],
        ['minecraft:skull.0', 'minecraft:skeleton_skull'],
        ['minecraft:skull.1', 'minecraft:wither_skeleton_skull'],
        ['minecraft:skull.2', 'minecraft:zombie_head'],
        ['minecraft:skull.3', 'minecraft:player_head'],
        ['minecraft:skull.4', 'minecraft:creeper_head'],
        ['minecraft:skull.5', 'minecraft:dragon_head'],
        ['minecraft:golden_apple.0', 'minecraft:golden_apple'],
        ['minecraft:golden_apple.1', 'minecraft:enchanted_golden_apple'],
        ['minecraft:fireworks.0', 'minecraft:firework_rocket'],
        ['minecraft:firework_charge.0', 'minecraft:firework_star'],
        ['minecraft:dye.0', 'minecraft:ink_sac'],
        ['minecraft:dye.1', 'minecraft:rose_red'],
        ['minecraft:dye.2', 'minecraft:cactus_green'],
        ['minecraft:dye.3', 'minecraft:cocoa_beans'],
        ['minecraft:dye.4', 'minecraft:lapis_lazuli'],
        ['minecraft:dye.5', 'minecraft:purple_dye'],
        ['minecraft:dye.6', 'minecraft:cyan_dye'],
        ['minecraft:dye.7', 'minecraft:light_gray_dye'],
        ['minecraft:dye.8', 'minecraft:gray_dye'],
        ['minecraft:dye.9', 'minecraft:pink_dye'],
        ['minecraft:dye.10', 'minecraft:lime_dye'],
        ['minecraft:dye.11', 'minecraft:dandelion_yellow'],
        ['minecraft:dye.12', 'minecraft:light_blue_dye'],
        ['minecraft:dye.13', 'minecraft:magenta_dye'],
        ['minecraft:dye.14', 'minecraft:orange_dye'],
        ['minecraft:dye.15', 'minecraft:bone_meal'],
        ['minecraft:silver_shulker_box.0', 'minecraft:light_gray_shulker_box'],
        ['minecraft:fence.0', 'minecraft:oak_fence'],
        ['minecraft:fence_gate.0', 'minecraft:oak_fence_gate'],
        ['minecraft:wooden_door.0', 'minecraft:oak_door'],
        ['minecraft:boat.0', 'minecraft:oak_boat'],
        ['minecraft:lit_pumpkin.0', 'minecraft:jack_o_lantern'],
        ['minecraft:pumpkin.0', 'minecraft:carved_pumpkin'],
        ['minecraft:trapdoor.0', 'minecraft:oak_trapdoor'],
        ['minecraft:nether_brick.0', 'minecraft:nether_bricks'],
        ['minecraft:red_nether_brick.0', 'minecraft:red_nether_bricks'],
        ['minecraft:netherbrick.0', 'minecraft:nether_brick'],
        ['minecraft:wooden_button.0', 'minecraft:oak_button'],
        ['minecraft:wooden_pressure_plate.0', 'minecraft:oak_pressure_plate'],
        ['minecraft:noteblock.0', 'minecraft:note_block'],
        ['minecraft:bed.0', 'minecraft:white_bed'],
        ['minecraft:bed.1', 'minecraft:orange_bed'],
        ['minecraft:bed.2', 'minecraft:magenta_bed'],
        ['minecraft:bed.3', 'minecraft:light_blue_bed'],
        ['minecraft:bed.4', 'minecraft:yellow_bed'],
        ['minecraft:bed.5', 'minecraft:lime_bed'],
        ['minecraft:bed.6', 'minecraft:pink_bed'],
        ['minecraft:bed.7', 'minecraft:gray_bed'],
        ['minecraft:bed.8', 'minecraft:light_gray_bed'],
        ['minecraft:bed.9', 'minecraft:cyan_bed'],
        ['minecraft:bed.10', 'minecraft:purple_bed'],
        ['minecraft:bed.11', 'minecraft:blue_bed'],
        ['minecraft:bed.12', 'minecraft:brown_bed'],
        ['minecraft:bed.13', 'minecraft:green_bed'],
        ['minecraft:bed.14', 'minecraft:red_bed'],
        ['minecraft:bed.15', 'minecraft:black_bed'],
        ['minecraft:banner.15', 'minecraft:white_banner'],
        ['minecraft:banner.14', 'minecraft:orange_banner'],
        ['minecraft:banner.13', 'minecraft:magenta_banner'],
        ['minecraft:banner.12', 'minecraft:light_blue_banner'],
        ['minecraft:banner.11', 'minecraft:yellow_banner'],
        ['minecraft:banner.10', 'minecraft:lime_banner'],
        ['minecraft:banner.9', 'minecraft:pink_banner'],
        ['minecraft:banner.8', 'minecraft:gray_banner'],
        ['minecraft:banner.7', 'minecraft:light_gray_banner'],
        ['minecraft:banner.6', 'minecraft:cyan_banner'],
        ['minecraft:banner.5', 'minecraft:purple_banner'],
        ['minecraft:banner.4', 'minecraft:blue_banner'],
        ['minecraft:banner.3', 'minecraft:brown_banner'],
        ['minecraft:banner.2', 'minecraft:green_banner'],
        ['minecraft:banner.1', 'minecraft:red_banner'],
        ['minecraft:banner.0', 'minecraft:black_banner'],
        ['minecraft:grass.0', 'minecraft:grass_block'],
        ['minecraft:brick_block.0', 'minecraft:bricks'],
        ['minecraft:end_bricks.0', 'minecraft:end_stone_bricks'],
        ['minecraft:golden_rail.0', 'minecraft:powered_rail'],
        ['minecraft:magma.0', 'minecraft:magma_block'],
        ['minecraft:quartz_ore.0', 'minecraft:nether_quartz_ore'],
        ['minecraft:reeds.0', 'minecraft:sugar_cane'],
        ['minecraft:slime.0', 'minecraft:slime_block'],
        ['minecraft:stone_stairs.0', 'minecraft:cobblestone_stairs'],
        ['minecraft:waterlily.0', 'minecraft:lily_pad'],
        ['minecraft:web.0', 'minecraft:cobweb'],
        ['minecraft:snow.0', 'minecraft:snow_block'],
        ['minecraft:snow_layer.0', 'minecraft:snow'],
        ['minecraft:spawn_egg.0', 'minecraft:bat_spawn_egg'],
        ['minecraft:record_11.0', 'minecraft:music_disc_11'],
        ['minecraft:record_13.0', 'minecraft:music_disc_13'],
        ['minecraft:record_blocks.0', 'minecraft:music_disc_blocks'],
        ['minecraft:record_cat.0', 'minecraft:music_disc_cat'],
        ['minecraft:record_chirp.0', 'minecraft:music_disc_chirp'],
        ['minecraft:record_far.0', 'minecraft:music_disc_far'],
        ['minecraft:record_mall.0', 'minecraft:music_disc_mall'],
        ['minecraft:record_mellohi.0', 'minecraft:music_disc_mellohi'],
        ['minecraft:record_stal.0', 'minecraft:music_disc_stal'],
        ['minecraft:record_strad.0', 'minecraft:music_disc_strad'],
        ['minecraft:record_wait.0', 'minecraft:music_disc_wait'],
        ['minecraft:record_ward.0', 'minecraft:music_disc_ward'],
        ['chorus_fruit_popped.0', 'popped_chorus_fruit']
    ]

    static DamagableItems = [
        'minecraft:bow',
        'minecraft:carrot_on_a_stick',
        'minecraft:chainmail_boots',
        'minecraft:chainmail_chestplate',
        'minecraft:chainmail_helmet',
        'minecraft:chainmail_leggings',
        'minecraft:diamond_axe',
        'minecraft:diamond_boots',
        'minecraft:diamond_chestplate',
        'minecraft:diamond_helmet',
        'minecraft:diamond_hoe',
        'minecraft:diamond_leggings',
        'minecraft:diamond_pickaxe',
        'minecraft:diamond_shovel',
        'minecraft:diamond_sword',
        'minecraft:elytra',
        'minecraft:fishing_rod',
        'minecraft:flint_and_steel',
        'minecraft:golden_axe',
        'minecraft:golden_boots',
        'minecraft:golden_chestplate',
        'minecraft:golden_helmet',
        'minecraft:golden_hoe',
        'minecraft:golden_leggings',
        'minecraft:golden_pickaxe',
        'minecraft:golden_shovel',
        'minecraft:golden_sword',
        'minecraft:iron_axe',
        'minecraft:iron_boots',
        'minecraft:iron_chestplate',
        'minecraft:iron_helmet',
        'minecraft:iron_hoe',
        'minecraft:iron_leggings',
        'minecraft:iron_pickaxe',
        'minecraft:iron_shovel',
        'minecraft:iron_sword',
        'minecraft:leather_boots',
        'minecraft:leather_chestplate',
        'minecraft:leather_helmet',
        'minecraft:leather_leggings',
        'minecraft:shears',
        'minecraft:shield',
        'minecraft:stone_axe',
        'minecraft:stone_hoe',
        'minecraft:stone_pickaxe',
        'minecraft:stone_shovel',
        'minecraft:stone_sword',
        'minecraft:wooden_axe',
        'minecraft:wooden_hoe',
        'minecraft:wooden_pickaxe',
        'minecraft:wooden_shovel',
        'minecraft:wooden_sword'
    ]

    static MapItems = ['minecraft:map', 'minecraft:filled_map']

    static SpawnEgges = [
        'minecraft:bat_spawn_egg',
        'minecraft:blaze_spawn_egg',
        'minecraft:cave_spider_spawn_egg',
        'minecraft:chicken_spawn_egg',
        'minecraft:cow_spawn_egg',
        'minecraft:creeper_spawn_egg',
        'minecraft:donkey_spawn_egg',
        'minecraft:elder_guardian_spawn_egg',
        'minecraft:enderman_spawn_egg',
        'minecraft:endermite_spawn_egg',
        'minecraft:evoker_spawn_egg',
        'minecraft:ghast_spawn_egg',
        'minecraft:guardian_spawn_egg',
        'minecraft:horse_spawn_egg',
        'minecraft:husk_spawn_egg',
        'minecraft:llama_spawn_egg',
        'minecraft:magma_cube_spawn_egg',
        'minecraft:mooshroom_spawn_egg',
        'minecraft:mule_spawn_egg',
        'minecraft:ocelot_spawn_egg',
        'minecraft:parrot_spawn_egg',
        'minecraft:pig_spawn_egg',
        'minecraft:polar_bear_spawn_egg',
        'minecraft:rabbit_spawn_egg',
        'minecraft:sheep_spawn_egg',
        'minecraft:shulker_spawn_egg',
        'minecraft:silverfish_spawn_egg',
        'minecraft:skeleton_spawn_egg',
        'minecraft:skeleton_horse_spawn_egg',
        'minecraft:slime_spawn_egg',
        'minecraft:spider_spawn_egg',
        'minecraft:squid_spawn_egg',
        'minecraft:stray_spawn_egg',
        'minecraft:vex_spawn_egg',
        'minecraft:villager_spawn_egg',
        'minecraft:vindicator_spawn_egg',
        'minecraft:witch_spawn_egg',
        'minecraft:wither_skeleton_spawn_egg',
        'minecraft:wolf_spawn_egg',
        'minecraft:zombie_spawn_egg',
        'minecraft:zombie_horse_spawn_egg',
        'minecraft:zombie_pigman_spawn_egg',
        'minecraft:zombie_villager_spawn_egg']

    static NumericColor_NominalColor = [
        ['0', 'minecraft:white_'],
        ['1', 'minecraft:orange_'],
        ['2', 'minecraft:magenta_'],
        ['3', 'minecraft:light_blue_'],
        ['4', 'minecraft:yellow_'],
        ['5', 'minecraft:lime_'],
        ['6', 'minecraft:pink_'],
        ['7', 'minecraft:gray_'],
        ['8', 'minecraft:light_gray_'],
        ['9', 'minecraft:cyan_'],
        ['10', 'minecraft:purple_'],
        ['11', 'minecraft:blue_'],
        ['12', 'minecraft:brown_'],
        ['13', 'minecraft:green_'],
        ['14', 'minecraft:red_'],
        ['15', 'minecraft:black_']
    ]
}
