import "dotenv/config";
import { hash } from "@node-rs/argon2";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type GarmentKind } from "../src/generated/prisma/client";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });

const C = {
  graphite: ["Графіт", "#2a2b2e"],
  chalk: ["Крейда", "#ecebe6"],
  olive: ["Олива", "#5d6147"],
  black: ["Чорний", "#18181a"],
  sand: ["Пісок", "#cbbda3"],
  sky: ["Небо", "#9fb3c6"],
  milk: ["Молоко", "#f2f0ea"],
  steel: ["Сталь", "#6c7177"],
  coal: ["Вугілля", "#333438"],
  moss: ["Мох", "#4e5943"],
  concrete: ["Бетон", "#9b9c99"],
  indigo: ["Індиго", "#39426e"],
  melange: ["Сірий меланж", "#b4b5b2"],
  khaki: ["Хакі", "#6a694c"],
  clay: ["Глина", "#9a6a51"],
  camel: ["Верблюжий", "#ad8960"],
} as const;

type Color = (typeof C)[keyof typeof C];

const TOPS = ["XS", "S", "M", "L", "XL", "XXL"];
const BOTTOMS = ["28", "30", "32", "34", "36"];

const categories = [
  { slug: "tees", name: "Футболки й лонгсліви", sortOrder: 1 },
  { slug: "hoodies", name: "Худі та світшоти", sortOrder: 2 },
  { slug: "outerwear", name: "Верхній одяг", sortOrder: 3 },
  { slug: "bottoms", name: "Штани та шорти", sortOrder: 4 },
];

type Seed = {
  slug: string;
  category: string;
  name: string;
  subtitle: string;
  description: string;
  price: number;
  oldPrice?: number;
  kind: GarmentKind;
  colors: Color[];
  sizes?: string[];
  material: string;
  fit: string;
  care?: string;
  isNew?: boolean;
  featured?: boolean;
};

const CARE_COTTON = "Прати за 30 °C навиворіт, не відбілювати, сушити розправленим.";
const CARE_OUTER = "Делікатне прання за 30 °C або хімчистка. Не прасувати мембрану.";

const products: Seed[] = [
  {
    slug: "tee-baza",
    category: "tees",
    name: "Футболка «База»",
    subtitle: "Щоденна футболка прямого крою",
    description:
      "Та сама футболка, яку береш першою зранку. Гладкий кулір 180 г/м², рівний рукав, комір-резинка, що не розтягується після прання.",
    price: 890,
    kind: "TEE",
    colors: [C.graphite, C.chalk, C.olive],
    material: "100% бавовна, кулір 180 г/м²",
    fit: "Прямий",
    care: CARE_COTTON,
  },
  {
    slug: "tee-vazhka",
    category: "tees",
    name: "Футболка «Важка»",
    subtitle: "Щільна футболка 240 г/м² зі спущеним плечем",
    description:
      "Щільне полотно тримає форму й не просвічує. Спущене плече й трохи вкорочений низ: виглядає охайно навіть без заправки.",
    price: 1290,
    kind: "TEE",
    colors: [C.black, C.sand, C.sky],
    material: "100% бавовна пеньє, 240 г/м²",
    fit: "Вільний",
    care: CARE_COTTON,
    isNew: true,
  },
  {
    slug: "longsleeve-shov",
    category: "tees",
    name: "Лонгслів «Шов»",
    subtitle: "Лонгслів із декоративним плечовим швом",
    description: "Тонкий лонгслів для міжсезоння: носиться сам по собі або під сорочку. Плечовий шов винесено назовні.",
    price: 1490,
    kind: "LONGSLEEVE",
    colors: [C.milk, C.steel],
    material: "95% бавовна, 5% еластан",
    fit: "Прямий",
    care: CARE_COTTON,
  },
  {
    slug: "longsleeve-termo",
    category: "tees",
    name: "Лонгслів «Термо»",
    subtitle: "Вафельний лонгслів, що гріє в холод",
    description: "Вафельне плетіння затримує тепле повітря біля тіла. Перший шар під худі чи куртку на холодні ранки.",
    price: 1690,
    oldPrice: 1990,
    kind: "LONGSLEEVE",
    colors: [C.coal, C.moss],
    material: "80% бавовна, 20% поліестер, вафельне плетіння",
    fit: "Облягаючий",
    care: CARE_COTTON,
  },
  {
    slug: "hoodie-vector",
    category: "hoodies",
    name: "Худі «Вектор»",
    subtitle: "Худі з тринитки з подвійним капюшоном",
    description:
      "Тринитка з начосом 360 г/м², подвійний капюшон без шнурків, що тримає форму, та кишеня-кенгуру з прихованою кишенею для телефону.",
    price: 2890,
    kind: "HOODIE",
    colors: [C.concrete, C.graphite, C.chalk],
    material: "80% бавовна, 20% поліестер, тринитка 360 г/м²",
    fit: "Вільний",
    care: CARE_COTTON,
    isNew: true,
    featured: true,
  },
  {
    slug: "hoodie-oversize",
    category: "hoodies",
    name: "Худі «Простір»",
    subtitle: "Оверсайз-худі зі спущеним плечем",
    description: "Об'ємний силует, довгі манжети й широкий пояс. Розмір беріть свій: запас уже закладено в лекала.",
    price: 3290,
    kind: "HOODIE",
    colors: [C.black, C.indigo],
    material: "100% бавовна, футер з начосом 400 г/м²",
    fit: "Оверсайз",
    care: CARE_COTTON,
  },
  {
    slug: "sweatshirt-kyiv",
    category: "hoodies",
    name: "Світшот «Поділ»",
    subtitle: "Класичний світшот із рібаною вставкою",
    description: "Класика з V-вставкою під горлом і щільними манжетами. Не скочується і не втрачає колір після десятків прань.",
    price: 2490,
    kind: "SWEATSHIRT",
    colors: [C.melange, C.sand],
    material: "70% бавовна, 30% поліестер, футер 320 г/м²",
    fit: "Прямий",
    care: CARE_COTTON,
  },
  {
    slug: "sweatshirt-tysha",
    category: "hoodies",
    name: "Світшот «Тиша»",
    subtitle: "Легкий світшот без начосу",
    description: "Петельний футер без начосу: тепло, але не жарко. Для офісу, дороги й вечора на балконі.",
    price: 2290,
    oldPrice: 2790,
    kind: "SWEATSHIRT",
    colors: [C.olive, C.milk],
    material: "100% бавовна, петельний футер 280 г/м²",
    fit: "Прямий",
    care: CARE_COTTON,
  },
  {
    slug: "bomber-dnipro",
    category: "outerwear",
    name: "Бомбер «Дніпро»",
    subtitle: "Утеплений бомбер із водовідштовхувальним верхом",
    description:
      "Верх із щільного нейлону з DWR-просоченням, утеплювач 100 г/м² і трикотажні манжети. Внутрішня кишеня на блискавці для документів.",
    price: 4590,
    kind: "BOMBER",
    colors: [C.black, C.khaki],
    material: "Верх: 100% нейлон з DWR. Утеплювач: 100 г/м²",
    fit: "Прямий",
    care: CARE_OUTER,
    isNew: true,
    featured: true,
  },
  {
    slug: "bomber-nylon",
    category: "outerwear",
    name: "Бомбер «Вітер»",
    subtitle: "Легкий бомбер на весну",
    description: "Без утеплювача, з сітчастою підкладкою. Складається в кишеню рюкзака і рятує від вітру на набережній.",
    price: 3990,
    kind: "BOMBER",
    colors: [C.steel, C.clay],
    material: "100% нейлон, сітчаста підкладка",
    fit: "Вільний",
    care: CARE_OUTER,
  },
  {
    slug: "coat-misto",
    category: "outerwear",
    name: "Пальто «Місто»",
    subtitle: "Вовняне пальто нижче коліна",
    description: "Вовна з кашеміром, прихована застібка й глибокі кишені. Довжина нижче коліна закриває від вітру навіть на зупинці.",
    price: 6990,
    kind: "COAT",
    colors: [C.coal, C.camel],
    material: "70% вовна, 10% кашемір, 20% поліамід",
    fit: "Прямий",
    care: "Лише хімчистка.",
  },
  {
    slug: "trench-zlyva",
    category: "outerwear",
    name: "Тренч «Злива»",
    subtitle: "Тренч із мембранної бавовни",
    description: "Бавовна з мембраною, що пропускає повітря й не пропускає дощ. Пояс, кокетка на спині, хлястики на рукавах.",
    price: 5890,
    oldPrice: 6890,
    kind: "COAT",
    colors: [C.sand, C.olive],
    material: "Бавовна з мембраною 5000 мм",
    fit: "Прямий",
    care: CARE_OUTER,
  },
  {
    slug: "cargo-marshrut",
    category: "bottoms",
    name: "Карго «Маршрут»",
    subtitle: "Штани карго з об'ємними кишенями",
    description:
      "Ріп-стоп, що не рветься, шість кишень і манжети на кулісці: їх можна затягнути над кросівками. Пояс на гумці з поворотною пряжкою.",
    price: 2590,
    kind: "PANTS",
    colors: [C.black, C.khaki, C.concrete],
    sizes: BOTTOMS,
    material: "100% бавовна, ріп-стоп",
    fit: "Вільний",
    care: CARE_COTTON,
    featured: true,
  },
  {
    slug: "joggers-ranok",
    category: "bottoms",
    name: "Джогери «Ранок»",
    subtitle: "Джогери з футеру на манжетах",
    description: "М'який футер із начосом, кишеня на блискавці для ключів і звужений низ. Для бігу, дому й дороги.",
    price: 1990,
    kind: "PANTS",
    colors: [C.graphite, C.melange],
    sizes: BOTTOMS,
    material: "80% бавовна, 20% поліестер, футер з начосом",
    fit: "Звужений",
    care: CARE_COTTON,
  },
  {
    slug: "shorts-lito",
    category: "bottoms",
    name: "Шорти «Літо»",
    subtitle: "Лляні шорти вище коліна",
    description: "Льон із бавовною: не липне до тіла в спеку. Пояс на гумці зі шнурком і дві глибокі кишені.",
    price: 1390,
    kind: "SHORTS",
    colors: [C.sand, C.black],
    sizes: BOTTOMS,
    material: "55% льон, 45% бавовна",
    fit: "Прямий",
    care: CARE_COTTON,
    isNew: true,
  },
  {
    slug: "shorts-sport",
    category: "bottoms",
    name: "Шорти «Темп»",
    subtitle: "Спортивні шорти з підкладкою",
    description: "Легка тканина, що швидко сохне, вбудована сітчаста підкладка й світловідбивна смуга для вечірніх пробіжок.",
    price: 1190,
    kind: "SHORTS",
    colors: [C.indigo, C.graphite],
    sizes: BOTTOMS,
    material: "100% поліестер, швидковисихаюча тканина",
    fit: "Прямий",
    care: CARE_COTTON,
  },
];

async function main() {
  const categoryIds = new Map<string, string>();
  for (const c of categories) {
    const row = await db.category.upsert({ where: { slug: c.slug }, create: c, update: c });
    categoryIds.set(c.slug, row.id);
  }

  for (const [i, p] of products.entries()) {
    const data = {
      name: p.name,
      subtitle: p.subtitle,
      description: p.description,
      priceCents: p.price * 100,
      oldPriceCents: p.oldPrice ? p.oldPrice * 100 : null,
      kind: p.kind,
      colorNames: p.colors.map((c) => c[0]),
      colorHexes: p.colors.map((c) => c[1]),
      sizes: p.sizes ?? TOPS,
      material: p.material,
      fit: p.fit,
      care: p.care ?? "",
      isNew: p.isNew ?? false,
      featured: p.featured ?? false,
      sortOrder: i,
      categoryId: categoryIds.get(p.category)!,
    };
    await db.product.upsert({ where: { slug: p.slug }, create: { slug: p.slug, ...data }, update: data });
  }

  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (email && password) {
    const exists = await db.user.findUnique({ where: { email } });
    if (!exists) {
      await db.user.create({
        data: {
          email,
          name: "Адміністратор",
          role: "ADMIN",
          passwordHash: await hash(password, { memoryCost: 19456, timeCost: 2, parallelism: 1 }),
        },
      });
      console.log(`Admin created: ${email}`);
    }
  }

  console.log(`Seeded ${categories.length} categories and ${products.length} products.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
