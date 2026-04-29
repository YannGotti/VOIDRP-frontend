const NAMES = {
  // Уголь и топливо
  COAL: 'Уголь',
  CHARCOAL: 'Древесный уголь',
  COAL_ORE: 'Угольная руда',
  DEEPSLATE_COAL_ORE: 'Глубинная угольная руда',
  COAL_BLOCK: 'Угольный блок',

  // Железо
  IRON_INGOT: 'Железный слиток',
  RAW_IRON: 'Необработанное железо',
  IRON_ORE: 'Железная руда',
  DEEPSLATE_IRON_ORE: 'Глубинная железная руда',
  IRON_BLOCK: 'Железный блок',
  IRON_NUGGET: 'Железный самородок',

  // Золото
  GOLD_INGOT: 'Золотой слиток',
  RAW_GOLD: 'Необработанное золото',
  GOLD_ORE: 'Золотая руда',
  DEEPSLATE_GOLD_ORE: 'Глубинная золотая руда',
  NETHER_GOLD_ORE: 'Золотая руда незера',
  GOLD_BLOCK: 'Золотой блок',
  GOLD_NUGGET: 'Золотой самородок',

  // Алмаз
  DIAMOND: 'Алмаз',
  DIAMOND_ORE: 'Алмазная руда',
  DEEPSLATE_DIAMOND_ORE: 'Глубинная алмазная руда',
  DIAMOND_BLOCK: 'Алмазный блок',

  // Изумруд
  EMERALD: 'Изумруд',
  EMERALD_ORE: 'Изумрудная руда',
  DEEPSLATE_EMERALD_ORE: 'Глубинная изумрудная руда',
  EMERALD_BLOCK: 'Изумрудный блок',

  // Лазурит
  LAPIS_LAZULI: 'Лазурит',
  LAPIS_ORE: 'Руда лазурита',
  DEEPSLATE_LAPIS_ORE: 'Глубинная руда лазурита',
  LAPIS_BLOCK: 'Блок лазурита',

  // Красный камень
  REDSTONE: 'Красный камень',
  REDSTONE_ORE: 'Руда красного камня',
  DEEPSLATE_REDSTONE_ORE: 'Глубинная руда красного камня',
  REDSTONE_BLOCK: 'Блок красного камня',

  // Медь
  COPPER_INGOT: 'Медный слиток',
  RAW_COPPER: 'Необработанная медь',
  COPPER_ORE: 'Медная руда',
  DEEPSLATE_COPPER_ORE: 'Глубинная медная руда',
  COPPER_BLOCK: 'Медный блок',

  // Незерит
  NETHERITE_INGOT: 'Слиток незерита',
  NETHERITE_SCRAP: 'Незеритовый лом',
  NETHERITE_BLOCK: 'Блок незерита',

  // Кварц
  QUARTZ: 'Кварц незера',
  NETHER_QUARTZ_ORE: 'Кварцевая руда незера',
  QUARTZ_BLOCK: 'Блок кварца',

  // Аметист
  AMETHYST_SHARD: 'Осколок аметиста',
  AMETHYST_BLOCK: 'Блок аметиста',

  // Древесина (брёвна)
  OAK_LOG: 'Дубовое бревно',
  BIRCH_LOG: 'Берёзовое бревно',
  SPRUCE_LOG: 'Еловое бревно',
  JUNGLE_LOG: 'Бревно джунглей',
  ACACIA_LOG: 'Акациевое бревно',
  DARK_OAK_LOG: 'Бревно тёмного дуба',
  MANGROVE_LOG: 'Мангровое бревно',
  CHERRY_LOG: 'Вишнёвое бревно',
  CRIMSON_STEM: 'Ствол багрянца',
  WARPED_STEM: 'Искажённый ствол',

  // Доски
  OAK_PLANKS: 'Дубовые доски',
  BIRCH_PLANKS: 'Берёзовые доски',
  SPRUCE_PLANKS: 'Еловые доски',
  JUNGLE_PLANKS: 'Доски джунглей',
  ACACIA_PLANKS: 'Акациевые доски',
  DARK_OAK_PLANKS: 'Доски тёмного дуба',
  MANGROVE_PLANKS: 'Мангровые доски',
  CHERRY_PLANKS: 'Вишнёвые доски',
  CRIMSON_PLANKS: 'Багряные доски',
  WARPED_PLANKS: 'Искажённые доски',

  STICK: 'Палка',

  // Камень и земля
  COBBLESTONE: 'Булыжник',
  STONE: 'Камень',
  GRANITE: 'Гранит',
  DIORITE: 'Диорит',
  ANDESITE: 'Андезит',
  DIRT: 'Земля',
  COARSE_DIRT: 'Грубая земля',
  GRASS_BLOCK: 'Блок травы',
  PODZOL: 'Подзол',
  MYCELIUM: 'Мицелий',
  SAND: 'Песок',
  RED_SAND: 'Красный песок',
  GRAVEL: 'Гравий',
  CLAY: 'Блок глины',
  CLAY_BALL: 'Глина',

  // Стекло
  GLASS: 'Стекло',
  GLASS_PANE: 'Стеклянная панель',
  TINTED_GLASS: 'Тонированное стекло',

  // Кирпичи
  BRICK: 'Кирпич',
  BRICKS: 'Кирпичи',
  NETHER_BRICK: 'Незерный кирпич',
  NETHER_BRICKS: 'Незерные кирпичи',

  // Незер/Эндер
  NETHERRACK: 'Незерак',
  SOUL_SAND: 'Душевой песок',
  SOUL_SOIL: 'Душевая земля',
  GLOWSTONE: 'Светокамень',
  GLOWSTONE_DUST: 'Порошок светокамня',
  MAGMA_BLOCK: 'Магматический блок',
  MAGMA_CREAM: 'Огненный крем',
  BLACKSTONE: 'Чёрный камень',
  BASALT: 'Базальт',
  NETHER_WART: 'Незерная бородавка',
  NETHER_WART_BLOCK: 'Блок незерной бородавки',
  BLAZE_ROD: 'Стержень призрака',
  BLAZE_POWDER: 'Порошок призрака',
  GHAST_TEAR: 'Слеза гаста',
  WITHER_SKELETON_SKULL: 'Череп иссушителя-скелета',
  END_STONE: 'Камень края',
  PURPUR_BLOCK: 'Пурпурный блок',
  OBSIDIAN: 'Обсидиан',
  CRYING_OBSIDIAN: 'Плачущий обсидиан',
  ENDER_PEARL: 'Эндер-жемчуг',
  EYE_OF_ENDER: 'Глаз Эндера',
  SHULKER_SHELL: 'Панцирь шалкера',
  CHORUS_FRUIT: 'Плод хора',
  POPPED_CHORUS_FRUIT: 'Жареный плод хора',
  DRAGON_BREATH: 'Дыхание дракона',
  ELYTRA: 'Элитры',

  // Снег и лёд
  SNOWBALL: 'Снежок',
  SNOW_BLOCK: 'Блок снега',
  ICE: 'Лёд',
  PACKED_ICE: 'Плотный лёд',
  BLUE_ICE: 'Синий лёд',

  // Вода/море
  PRISMARINE_CRYSTALS: 'Призмариновые кристаллы',
  PRISMARINE_SHARD: 'Осколок призмарина',
  NAUTILUS_SHELL: 'Раковина наутилуса',
  HEART_OF_THE_SEA: 'Сердце моря',
  INK_SAC: 'Чернильный мешочек',
  GLOW_INK_SAC: 'Светящийся чернильный мешочек',
  KELP: 'Морские водоросли',
  SEA_PICKLE: 'Морской огурец',
  LILY_PAD: 'Кувшинка',
  SPONGE: 'Губка',
  WET_SPONGE: 'Мокрая губка',
  COD: 'Сырая треска',
  COOKED_COD: 'Жареная треска',
  SALMON: 'Сырой лосось',
  COOKED_SALMON: 'Жареный лосось',
  PUFFERFISH: 'Рыба-шар',
  TROPICAL_FISH: 'Тропическая рыба',

  // Еда
  WHEAT: 'Пшеница',
  WHEAT_SEEDS: 'Семена пшеницы',
  BREAD: 'Хлеб',
  APPLE: 'Яблоко',
  GOLDEN_APPLE: 'Золотое яблоко',
  ENCHANTED_GOLDEN_APPLE: 'Зачарованное золотое яблоко',
  CARROT: 'Морковь',
  GOLDEN_CARROT: 'Золотая морковь',
  POTATO: 'Картофель',
  BAKED_POTATO: 'Печёный картофель',
  POISONOUS_POTATO: 'Ядовитый картофель',
  BEETROOT: 'Свёкла',
  BEETROOT_SEEDS: 'Семена свёклы',
  PUMPKIN: 'Тыква',
  PUMPKIN_SEEDS: 'Семена тыквы',
  MELON: 'Арбуз',
  MELON_SLICE: 'Кусок арбуза',
  MELON_SEEDS: 'Семена арбуза',
  SUGAR_CANE: 'Сахарный тростник',
  SUGAR: 'Сахар',
  COOKIE: 'Печенье',
  CAKE: 'Торт',
  PUMPKIN_PIE: 'Тыквенный пирог',
  MUSHROOM_STEW: 'Грибной суп',
  RABBIT_STEW: 'Кроличье рагу',
  BEETROOT_SOUP: 'Свекольный суп',
  SWEET_BERRIES: 'Сладкие ягоды',
  GLOW_BERRIES: 'Светящиеся ягоды',
  BROWN_MUSHROOM: 'Коричневый гриб',
  RED_MUSHROOM: 'Красный гриб',
  BEEF: 'Сырая говядина',
  COOKED_BEEF: 'Жареная говядина',
  PORKCHOP: 'Сырая свинина',
  COOKED_PORKCHOP: 'Жареная свинина',
  CHICKEN: 'Сырая курица',
  COOKED_CHICKEN: 'Жареная курица',
  MUTTON: 'Сырая баранина',
  COOKED_MUTTON: 'Жареная баранина',
  RABBIT: 'Сырой кролик',
  COOKED_RABBIT: 'Жареный кролик',
  RABBIT_FOOT: 'Заячья лапка',
  RABBIT_HIDE: 'Заячья шкурка',
  ROTTEN_FLESH: 'Гнилая плоть',

  // Материалы с мобов
  STRING: 'Нитка',
  FEATHER: 'Перо',
  LEATHER: 'Кожа',
  BONE: 'Кость',
  BONE_MEAL: 'Костная мука',
  SPIDER_EYE: 'Паучий глаз',
  FERMENTED_SPIDER_EYE: 'Сброженный паучий глаз',
  GUNPOWDER: 'Порох',
  SLIMEBALL: 'Слизь',
  PHANTOM_MEMBRANE: 'Мембрана фантома',
  TURTLE_SCUTE: 'Черепашья чешуйка',
  TOTEM_OF_UNDYING: 'Тотем бессмертия',

  // Шерсть
  WHITE_WOOL: 'Белая шерсть',
  ORANGE_WOOL: 'Оранжевая шерсть',
  MAGENTA_WOOL: 'Пурпурная шерсть',
  LIGHT_BLUE_WOOL: 'Голубая шерсть',
  YELLOW_WOOL: 'Жёлтая шерсть',
  LIME_WOOL: 'Лаймовая шерсть',
  PINK_WOOL: 'Розовая шерсть',
  GRAY_WOOL: 'Серая шерсть',
  LIGHT_GRAY_WOOL: 'Светло-серая шерсть',
  CYAN_WOOL: 'Бирюзовая шерсть',
  PURPLE_WOOL: 'Фиолетовая шерсть',
  BLUE_WOOL: 'Синяя шерсть',
  BROWN_WOOL: 'Коричневая шерсть',
  GREEN_WOOL: 'Зелёная шерсть',
  RED_WOOL: 'Красная шерсть',
  BLACK_WOOL: 'Чёрная шерсть',

  // Красители
  WHITE_DYE: 'Белый краситель',
  ORANGE_DYE: 'Оранжевый краситель',
  MAGENTA_DYE: 'Пурпурный краситель',
  LIGHT_BLUE_DYE: 'Голубой краситель',
  YELLOW_DYE: 'Жёлтый краситель',
  LIME_DYE: 'Лаймовый краситель',
  PINK_DYE: 'Розовый краситель',
  GRAY_DYE: 'Серый краситель',
  LIGHT_GRAY_DYE: 'Светло-серый краситель',
  CYAN_DYE: 'Бирюзовый краситель',
  PURPLE_DYE: 'Фиолетовый краситель',
  BLUE_DYE: 'Синий краситель',
  BROWN_DYE: 'Коричневый краситель',
  GREEN_DYE: 'Зелёный краситель',
  RED_DYE: 'Красный краситель',
  BLACK_DYE: 'Чёрный краситель',
  COCOA_BEANS: 'Зёрна какао',
  CACTUS: 'Кактус',
  VINE: 'Лоза',
  BAMBOO: 'Бамбук',

  // Зелья / книги
  GLASS_BOTTLE: 'Стеклянная бутылка',
  EXPERIENCE_BOTTLE: 'Бутылочка опыта',
  ENCHANTED_BOOK: 'Зачарованная книга',
  BOOK: 'Книга',
  PAPER: 'Бумага',
  WRITABLE_BOOK: 'Книга и перо',

  // Инструменты
  FLINT: 'Кремень',
  FLINT_AND_STEEL: 'Огниво',
  FISHING_ROD: 'Удочка',
  COMPASS: 'Компас',
  CLOCK: 'Часы',
  BUCKET: 'Ведро',
  WATER_BUCKET: 'Ведро воды',
  LAVA_BUCKET: 'Ведро лавы',
  SHEARS: 'Ножницы',
  IRON_PICKAXE: 'Железная кирка',
  DIAMOND_PICKAXE: 'Алмазная кирка',
  NETHERITE_PICKAXE: 'Незеритовая кирка',
  IRON_AXE: 'Железный топор',
  DIAMOND_AXE: 'Алмазный топор',
  IRON_SHOVEL: 'Железная лопата',
  IRON_HOE: 'Железная мотыга',

  // Оружие
  IRON_SWORD: 'Железный меч',
  DIAMOND_SWORD: 'Алмазный меч',
  NETHERITE_SWORD: 'Незеритовый меч',
  BOW: 'Лук',
  ARROW: 'Стрела',
  SPECTRAL_ARROW: 'Призрачная стрела',
  TIPPED_ARROW: 'Стрела с эффектом',
  CROSSBOW: 'Арбалет',
  TRIDENT: 'Трезубец',
  SHIELD: 'Щит',

  // Бронь
  LEATHER_HELMET: 'Кожаный шлем',
  LEATHER_CHESTPLATE: 'Кожаный нагрудник',
  LEATHER_LEGGINGS: 'Кожаные поножи',
  LEATHER_BOOTS: 'Кожаные ботинки',
  IRON_HELMET: 'Железный шлем',
  IRON_CHESTPLATE: 'Железный нагрудник',
  IRON_LEGGINGS: 'Железные поножи',
  IRON_BOOTS: 'Железные ботинки',
  DIAMOND_HELMET: 'Алмазный шлем',
  DIAMOND_CHESTPLATE: 'Алмазный нагрудник',
  DIAMOND_LEGGINGS: 'Алмазные поножи',
  DIAMOND_BOOTS: 'Алмазные ботинки',
  NETHERITE_HELMET: 'Незеритовый шлем',
  NETHERITE_CHESTPLATE: 'Незеритовый нагрудник',
  NETHERITE_LEGGINGS: 'Незеритовые поножи',
  NETHERITE_BOOTS: 'Незеритовые ботинки',
  TURTLE_HELMET: 'Черепаший шлем',

  // Блоки / декор
  TORCH: 'Факел',
  LANTERN: 'Фонарь',
  SOUL_LANTERN: 'Душевой фонарь',
  CAMPFIRE: 'Костёр',
  SOUL_CAMPFIRE: 'Душевой костёр',
  CHEST: 'Сундук',
  ENDER_CHEST: 'Эндер-сундук',
  SHULKER_BOX: 'Шалкерный ящик',
  TNT: 'ТНТ',
  IRON_BARS: 'Железные прутья',
  CHAIN: 'Цепь',
  LEAD: 'Поводок',
  SADDLE: 'Седло',
  NAMETAG: 'Бирка с именем',
  HONEYCOMB: 'Соты',
  HONEY_BOTTLE: 'Бутылка мёда',
  HONEY_BLOCK: 'Блок мёда',
  HONEYCOMB_BLOCK: 'Блок сот',
  FIREWORK_ROCKET: 'Фейерверк',
}

export function getMaterialName(material) {
  if (!material) return 'Предмет'
  const key = String(material).toUpperCase().trim()
  return NAMES[key] || _fallback(key)
}

export function getRussianMaterialName(material) {
  if (!material) return null
  const key = String(material).toUpperCase().trim()
  return NAMES[key] || null
}

function _fallback(key) {
  return key
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b[а-яa-z]/g, (c) => c.toUpperCase())
}
