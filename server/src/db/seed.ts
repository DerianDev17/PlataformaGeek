import { v4 as uuidv4 } from 'uuid';
import { getDb, closeDb } from './index.js';
import { initializeDatabase } from './schema.js';
import { hashPassword } from '../lib/password.js';
import { generateSlug } from '../lib/slug.js';

async function seed() {
  initializeDatabase();
  const db = getDb();

  console.log('🌱 Iniciando seed de datos...');

  // Check if already seeded
  const existingUsers = (db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }).count;
  if (existingUsers > 0) {
    console.log('⚠️  La base de datos ya contiene datos. Si quieres reiniciar, elimina nexogeek.db primero.');
    closeDb();
    return;
  }

  // ── Users ──
  const userAvatars: Record<string, string> = {
    admin: 'https://placehold.co/200x200/6366F1/FFFFFF?text=AN',
    moderator: 'https://placehold.co/200x200/22C55E/FFFFFF?text=MN',
    contributor: 'https://placehold.co/200x200/FBBF24/111827?text=CG',
    user: 'https://placehold.co/200x200/94A3B8/111827?text=UG',
  };

  const users = [
    { id: uuidv4(), username: 'admin', email: 'admin@nexogeek.test', password: 'Admin123!', displayName: 'Admin NexoGeek', role: 'admin', xp: 5000, level: 10 },
    { id: uuidv4(), username: 'moderator', email: 'moderator@nexogeek.test', password: 'Mod12345!', displayName: 'Mod NexoGeek', role: 'moderator', xp: 2500, level: 7 },
    { id: uuidv4(), username: 'contributor', email: 'contributor@nexogeek.test', password: 'Cont12345!', displayName: 'Contributor Geek', role: 'contributor', xp: 800, level: 4 },
    { id: uuidv4(), username: 'user', email: 'user@nexogeek.test', password: 'User12345!', displayName: 'Usuario Geek', role: 'user', xp: 200, level: 2 },
  ];

  const insertUser = db.prepare(`
    INSERT INTO users (id, username, email, password_hash, display_name, role, xp, level, avatar_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const u of users) {
    const passwordHash = await hashPassword(u.password);
    insertUser.run(u.id, u.username, u.email, passwordHash, u.displayName, u.role, u.xp, u.level, userAvatars[u.username]);
  }
  console.log(`✅ ${users.length} usuarios creados`);

  // ── Categories ──
  const categoryData = [
    { name: 'Anime', description: 'Contenido relacionado con anime' },
    { name: 'Películas', description: 'Películas y sagas cinematográficas' },
    { name: 'Series', description: 'Series de TV y streaming' },
    { name: 'Videojuegos', description: 'Videojuegos y franquicias' },
    { name: 'Cómics', description: 'Cómics y novelas gráficas' },
    { name: 'Personajes', description: 'Perfiles de personajes' },
    { name: 'Lugares', description: 'Ubicaciones y escenarios' },
    { name: 'Objetos', description: 'Artefactos y objetos importantes' },
    { name: 'Poderes', description: 'Habilidades y sistemas de poder' },
    { name: 'Timelines', description: 'Líneas temporales y cronologías' },
    { name: 'Teorías', description: 'Teorías de fans' },
    { name: 'Guías', description: 'Guías y tutoriales' },
  ];

  const categories: { id: string; name: string }[] = [];
  const insertCat = db.prepare('INSERT INTO categories (id, name, slug, description) VALUES (?, ?, ?, ?)');
  for (const c of categoryData) {
    const id = uuidv4();
    insertCat.run(id, c.name, generateSlug(c.name), c.description);
    categories.push({ id, name: c.name });
  }
  console.log(`✅ ${categories.length} categorías creadas`);

  // ── Tags ──
  const tagNames = ['shonen', 'marvel', 'dc', 'magia', 'ciencia-ficcion', 'fantasia',
    'multiverso', 'villanos', 'heroes', 'anime', 'videojuegos', 'lore', 'teoria', 'timeline'];

  const tags: { id: string; name: string }[] = [];
  const insertTag = db.prepare('INSERT INTO tags (id, name, slug) VALUES (?, ?, ?)');
  for (const name of tagNames) {
    const id = uuidv4();
    insertTag.run(id, name, generateSlug(name));
    tags.push({ id, name });
  }
  console.log(`✅ ${tags.length} tags creados`);

  // ── Universes ──
  const universeImages: Record<string, { cover: string; banner: string }> = {
    Marvel: {
      cover: 'https://placehold.co/600x400/ED1D24/FFFFFF?text=Marvel',
      banner: 'https://placehold.co/1200x400/0F111A/ED1D24?text=Marvel+Universe',
    },
    DC: {
      cover: 'https://placehold.co/600x400/0076BE/FFFFFF?text=DC',
      banner: 'https://placehold.co/1200x400/0F111A/0076BE?text=DC+Universe',
    },
    'Dragon Ball': {
      cover: 'https://placehold.co/600x400/F68B1F/FFFFFF?text=Dragon+Ball',
      banner: 'https://placehold.co/1200x400/0F111A/F68B1F?text=Dragon+Ball+Universe',
    },
    'One Piece': {
      cover: 'https://placehold.co/600x400/D4A843/111827?text=One+Piece',
      banner: 'https://placehold.co/1200x400/0F111A/D4A843?text=One+Piece+Universe',
    },
    Naruto: {
      cover: 'https://placehold.co/600x400/FF6B35/FFFFFF?text=Naruto',
      banner: 'https://placehold.co/1200x400/0F111A/FF6B35?text=Naruto+Universe',
    },
    'Star Wars': {
      cover: 'https://placehold.co/600x400/1A1A1A/FFE81F?text=Star+Wars',
      banner: 'https://placehold.co/1200x400/0F111A/FFE81F?text=Star+Wars+Universe',
    },
    'Harry Potter': {
      cover: 'https://placehold.co/600x400/740001/D4AF37?text=Harry+Potter',
      banner: 'https://placehold.co/1200x400/0F111A/D4AF37?text=Harry+Potter+Universe',
    },
    'The Witcher': {
      cover: 'https://placehold.co/600x400/2C2C2C/B0B5B9?text=The+Witcher',
      banner: 'https://placehold.co/1200x400/0F111A/B0B5B9?text=The+Witcher+Universe',
    },
    Zelda: {
      cover: 'https://placehold.co/600x400/3A9D23/FFD700?text=Zelda',
      banner: 'https://placehold.co/1200x400/0F111A/3A9D23?text=Zelda+Universe',
    },
    'Elden Ring': {
      cover: 'https://placehold.co/600x400/C5A572/111827?text=Elden+Ring',
      banner: 'https://placehold.co/1200x400/0F111A/C5A572?text=Elden+Ring+Universe',
    },
  };

  const universeData = [
    { name: 'Marvel', description: 'El universo cinematográfico y de cómics de Marvel. Hogar de los Vengadores, Spider-Man, X-Men y más.' },
    { name: 'DC', description: 'El universo de DC Comics. Desde Batman y Superman hasta la Liga de la Justicia.' },
    { name: 'Dragon Ball', description: 'El universo creado por Akira Toriyama. Las aventuras de Goku y las esferas del dragón.' },
    { name: 'One Piece', description: 'El mundo de los piratas creado por Eiichiro Oda. La búsqueda del tesoro legendario.' },
    { name: 'Naruto', description: 'El mundo de los ninjas. Desde la Aldea Oculta de la Hoja hasta la Gran Guerra Ninja.' },
    { name: 'Star Wars', description: 'Una galaxia muy, muy lejana. Jedi, Sith y la Fuerza.' },
    { name: 'Harry Potter', description: 'El mundo mágico de J.K. Rowling. Hogwarts, hechizos y criaturas fantásticas.' },
    { name: 'The Witcher', description: 'El continente donde Geralt de Rivia caza monstruos. Basado en los libros de Andrzej Sapkowski.' },
    { name: 'Zelda', description: 'El reino de Hyrule y las leyendas de la Trifuerza, Link y la Princesa Zelda.' },
    { name: 'Elden Ring', description: 'Las Tierras Intermedias creadas por FromSoftware y George R.R. Martin. El Anillo de Elden y los semidioses.' },
  ];

  const universes: { id: string; name: string; slug: string }[] = [];
  const insertUniverse = db.prepare(`
    INSERT INTO universes (id, name, slug, description, cover_image, banner_image, status, created_by)
    VALUES (?, ?, ?, ?, ?, ?, 'published', ?)
  `);
  for (const u of universeData) {
    const id = uuidv4();
    const imgs = universeImages[u.name] || { cover: null, banner: null };
    insertUniverse.run(id, u.name, generateSlug(u.name), u.description, imgs.cover, imgs.banner, users[0].id);
    universes.push({ id, name: u.name, slug: generateSlug(u.name) });
  }
  console.log(`✅ ${universes.length} universos creados`);

  // ── Articles ──
  const articleData: { title: string; summary: string; content: string; universe: string; categories: string[]; tags: string[] }[] = [
    {
      title: '¿Quién es Doctor Doom?',
      summary: 'La historia completa de Victor Von Doom, uno de los villanos más complejos de Marvel.',
      content: '<p>Victor Von Doom es el monarca de Latveria y uno de los antagonistas más formidables del universo Marvel. Brillante científico y hechicero, Doom combina tecnología avanzada con artes místicas.</p><p>Su icónica máscara y armadura son el resultado de un experimento fallido que le dejó el rostro marcado. Aunque es conocido principalmente como enemigo de los 4 Fantásticos, ha sido una amenaza para todo el universo Marvel.</p>',
      universe: 'Marvel',
      categories: ['Personajes', 'Cómics'],
      tags: ['marvel', 'villanos'],
    },
    {
      title: 'Cronología básica del UCM',
      summary: 'Una guía para entender el orden temporal del Universo Cinematográfico de Marvel.',
      content: '<p>El Universo Cinematográfico de Marvel (UCM) abarca múltiples fases y décadas de historias interconectadas. Desde Iron Man (2008) hasta las sagas más recientes.</p><p>La Saga del Infinito culminó con Avengers: Endgame, mientras que la Saga del Multiverso explora nuevas realidades y amenazas cósmicas.</p>',
      universe: 'Marvel',
      categories: ['Películas', 'Timelines'],
      tags: ['marvel', 'timeline'],
    },
    {
      title: 'Las gemas del infinito explicadas',
      summary: 'Qué son, dónde aparecieron y qué poder tiene cada gema del infinito.',
      content: '<p>Las Gemas del Infinito son seis artefactos de poder inconmensurable: Espacio, Tiempo, Realidad, Mente, Alma y Poder. Juntas, otorgan a su portador control absoluto sobre el universo.</p><p>Cada gema apareció en diferentes películas del UCM, desde El Cubo Cósmico (Espacio) en Capitán América hasta la Gema de la Mente en el cetro de Loki.</p>',
      universe: 'Marvel',
      categories: ['Objetos', 'Guías'],
      tags: ['marvel', 'lore'],
    },
    {
      title: 'Los Vengadores: guía completa del equipo',
      summary: 'Historia, miembros principales y momentos clave del equipo de superhéroes más poderoso de la Tierra.',
      content: '<p>Los Vengadores son el equipo de superhéroes más emblemático del universo Marvel. Formados originalmente por Iron Man, Thor, Hulk, Ant-Man y Wasp, han crecido hasta incluir docenas de héroes.</p><p>Desde su primera misión contra Loki hasta la batalla final contra Thanos, los Vengadores han protegido la Tierra de amenazas cósmicas, dimensionales y terrestres.</p>',
      universe: 'Marvel',
      categories: ['Personajes', 'Guías'],
      tags: ['marvel', 'heroes'],
    },
    {
      title: 'Spider-Man: historia y legado del trepamuros',
      summary: 'La evolución de Peter Parker desde un adolescente mordido por una araña hasta uno de los héroes más queridos.',
      content: '<p>Peter Parker era un estudiante de secundaria común hasta que la mordedura de una araña radiactiva le otorgó habilidades arácnidas. Con grandes poderes vienen grandes responsabilidades.</p><p>Spider-Man ha enfrentado a villanos icónicos como el Duende Verde, Doctor Octopus y Venom. Su historia es una de las más humanas del universo Marvel.</p>',
      universe: 'Marvel',
      categories: ['Personajes', 'Cómics'],
      tags: ['marvel', 'heroes'],
    },
    {
      title: 'El multiverso Marvel explicado',
      summary: 'Cómo funciona el multiverso en Marvel: Tierras alternativas, realidades paralelas y variantes.',
      content: '<p>El multiverso Marvel es un concepto que abarca infinitas realidades alternativas. La Tierra-616 es la línea principal de los cómics, mientras que la Tierra-199999 corresponde al UCM.</p><p>Eventos como Secret Wars y la Saga del Multiverso han explorado las consecuencias de las realidades paralelas colisionando entre sí.</p>',
      universe: 'Marvel',
      categories: ['Guías', 'Teorías'],
      tags: ['marvel', 'multiverso', 'lore'],
    },
    {
      title: 'Thanos: el Titán Loco y su plan maestro',
      summary: 'Análisis del villano más temido del universo Marvel y su obsesión con las Gemas del Infinito.',
      content: '<p>Thanos es un Titán eterno obsesionado con la muerte y el equilibrio universal. Su plan de eliminar la mitad de la vida en el universo con las Gemas del Infinito es uno de los arcos más impactantes de Marvel.</p><p>En los cómics, sus motivaciones son diferentes: busca impresionar a la Muerte misma. En el UCM, su motivación es la supervivencia de los recursos universales.</p>',
      universe: 'Marvel',
      categories: ['Personajes', 'Teorías'],
      tags: ['marvel', 'villanos', 'lore'],
    },
    {
      title: 'Transformaciones de Goku',
      summary: 'Todas las transformaciones de Goku desde el SSJ1 hasta el Ultra Instinto.',
      content: '<p>Goku ha pasado por numerosas transformaciones a lo largo de Dragon Ball, Dragon Ball Z, Dragon Ball GT y Dragon Ball Super. Cada una representa un salto de poder significativo.</p><p>Desde el legendario Super Saiyajin hasta el divino Ultra Instinto, cada transformación tiene condiciones únicas y multiplicadores de poder específicos.</p>',
      universe: 'Dragon Ball',
      categories: ['Poderes', 'Personajes'],
      tags: ['anime', 'shonen'],
    },
    {
      title: '¿Qué es el Ultra Instinto?',
      summary: 'La técnica definitiva de los ángeles, dominada por Goku en Dragon Ball Super.',
      content: '<p>El Ultra Instinto es una técnica divina que permite al cuerpo reaccionar por sí mismo, sin necesidad de pensamiento consciente. Originalmente utilizada por los ángeles como Whis.</p><p>Goku logró acceder a esta forma durante el Torneo de Poder, primero como Ultra Instinto -Señal- y luego en su forma completa, plateada.</p>',
      universe: 'Dragon Ball',
      categories: ['Poderes', 'Teorías'],
      tags: ['anime', 'shonen'],
    },
    {
      title: 'Línea temporal de Dragon Ball Z',
      summary: 'Cronología completa de los eventos de Dragon Ball Z.',
      content: '<p>Dragon Ball Z comienza cinco años después de la 23ª edición del Torneo de Artes Marciales. Goku presenta a su hijo Gohan, y la llegada de Raditz desencadena la saga de los Saiyajin.</p><p>Las sagas principales: Saiyajin, Freezer, Cell, y Majin Buu abarcan aproximadamente 12 años de historia en el universo.</p>',
      universe: 'Dragon Ball',
      categories: ['Timelines', 'Guías'],
      tags: ['anime', 'timeline', 'shonen'],
    },
    {
      title: '¿Qué son las frutas del diablo?',
      summary: 'El sistema de poder más importante del mundo de One Piece.',
      content: '<p>Las Frutas del Diablo son frutas misteriosas que otorgan poderes sobrenaturales a quien las consume, a cambio de la incapacidad de nadar. Se dividen en tres tipos: Paramecia, Zoan y Logia.</p><p>Las Paramecia otorgan habilidades sobrehumanas, las Zoan permiten transformarse en animales, y las Logia permiten convertirse en elementos naturales.</p>',
      universe: 'One Piece',
      categories: ['Objetos', 'Poderes'],
      tags: ['anime', 'shonen', 'lore'],
    },
    {
      title: 'Los Yonko explicados',
      summary: 'Los cuatro emperadores del mar en One Piece y su influencia en el Nuevo Mundo.',
      content: '<p>Los Yonko son los cuatro piratas más poderosos que gobiernan el Nuevo Mundo. Sus tripulaciones y territorios definen el equilibrio de poder en los mares.</p><p>A lo largo de la serie, la composición de los Yonko ha cambiado: Barbablanca, Shanks, Kaido, Big Mom, y más recientemente Luffy y Buggy.</p>',
      universe: 'One Piece',
      categories: ['Personajes', 'Guías'],
      tags: ['anime', 'shonen'],
    },
    {
      title: 'Historia del siglo vacío',
      summary: 'El misterio más grande del mundo de One Piece: los 100 años perdidos.',
      content: '<p>El Siglo Vacío es un período de 100 años del que no existen registros históricos. Este misterio está conectado con el Gobierno Mundial, los Poneglyphs y el tesoro One Piece.</p><p>El clan de Ohara fue destruido por investigar este período, y los Poneglyphs son la única fuente de información sobre lo que realmente ocurrió.</p>',
      universe: 'One Piece',
      categories: ['Teorías', 'Lore'],
      tags: ['anime', 'teoria', 'lore'],
    },
    {
      title: 'Qué es la Fuerza',
      summary: 'El campo de energía místico que conecta toda la galaxia de Star Wars.',
      content: '<p>La Fuerza es un campo de energía creado por todos los seres vivos que rodea y penetra todo, uniendo la galaxia. Los Jedi usan el Lado Luminoso y los Sith el Lado Oscuro.</p><p>Midi-chlorians, sensibilidad a la Fuerza, y el equilibrio son conceptos clave para entender este poder fundamental del universo Star Wars.</p>',
      universe: 'Star Wars',
      categories: ['Poderes', 'Guías'],
      tags: ['ciencia-ficcion', 'lore'],
    },
    {
      title: 'Orden cronológico de Star Wars',
      summary: 'Cómo ver todas las películas y series de Star Wars en orden.',
      content: '<p>Star Wars tiene múltiples formas de ser vista: orden de estreno, orden cronológico, o la "orden machete". Cada una ofrece una experiencia diferente.</p><p>La línea principal incluye las trilogías original, precuelas y secuelas, mientras que las series como The Mandalorian y The Clone Wars expanden el universo.</p>',
      universe: 'Star Wars',
      categories: ['Timelines', 'Guías'],
      tags: ['ciencia-ficcion', 'timeline'],
    },
    {
      title: 'Diferencias entre Jedi y Sith',
      summary: 'Las filosofías opuestas que definen el conflicto central de Star Wars.',
      content: '<p>Los Jedi siguen el Lado Luminoso de la Fuerza, basado en la paz, el conocimiento y la defensa. Los Sith abrazan el Lado Oscuro, impulsado por la pasión, el poder y el miedo.</p><p>La Regla de Dos de los Sith, el Código Jedi, y las diferentes técnicas de combate con sable de luz definen sus diferencias prácticas y filosóficas.</p>',
      universe: 'Star Wars',
      categories: ['Personajes', 'Guías'],
      tags: ['ciencia-ficcion'],
    },
    {
      title: 'Qué es el Anillo de Elden',
      summary: 'El concepto central del mundo creado por FromSoftware y George R.R. Martin.',
      content: '<p>El Anillo de Elden es el concepto fundamental que da forma a las Tierras Intermedias. Fragmentado tras su destrucción, dio origen a los Grandes Runas que poseen los semidioses.</p><p>El Árbol Áureo, la Reina Marika, y los fragmentos de orden que componían el Anillo son elementos esenciales para entender la historia del juego.</p>',
      universe: 'Elden Ring',
      categories: ['Lore', 'Guías'],
      tags: ['videojuegos', 'lore'],
    },
    {
      title: 'Los semidioses explicados',
      summary: 'Cada uno de los jefes principales de Elden Ring y su historia.',
      content: '<p>Los semidioses son los hijos de la Reina Marika, cada uno portador de un fragmento del Anillo de Elden. Godrick, Radahn, Rykard, Morgott, Malenia y más.</p><p>Cada uno representa un aspecto diferente del orden roto: la corrupción, la locura, la ambición desmedida, la podredumbre, y otros temas profundos.</p>',
      universe: 'Elden Ring',
      categories: ['Personajes', 'Guías'],
      tags: ['videojuegos', 'lore'],
    },
    {
      title: 'Guía de las Tierras Intermedias',
      summary: 'Mapa completo y zonas principales de Elden Ring.',
      content: '<p>Las Tierras Intermedias se dividen en múltiples regiones: Necrolimbo, Liurnia, Caelid, Altus, las Montañas de los Gigantes, y más. Cada zona tiene sus propios enemigos, jefes y secretos.</p><p>Esta guía cubre las rutas principales, mazmorras ocultas, y recomendaciones de nivel para cada área del juego.</p>',
      universe: 'Elden Ring',
      categories: ['Guías', 'Lugares'],
      tags: ['videojuegos'],
    },
  ];

  const insertArticle = db.prepare(`
    INSERT INTO articles (id, universe_id, author_id, title, slug, summary, content, cover_image, status, published_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'published', datetime('now'))
  `);
  const linkCategory = db.prepare('INSERT OR IGNORE INTO article_categories (article_id, category_id) VALUES (?, ?)');
  const linkTag = db.prepare('INSERT OR IGNORE INTO article_tags (article_id, tag_id) VALUES (?, ?)');

  const articleUniverseColors: Record<string, string> = {
    Marvel: 'ED1D24',
    DC: '0076BE',
    'Dragon Ball': 'F68B1F',
    'One Piece': 'D4A843',
    Naruto: 'FF6B35',
    'Star Wars': 'FFE81F',
    'Elden Ring': 'C5A572',
  };

  const articles: { id: string; title: string; slug: string }[] = [];

  for (let i = 0; i < articleData.length; i++) {
    const a = articleData[i];
    const id = uuidv4();
    const universe = universes.find((u) => u.name === a.universe)!;
    const slug = generateSlug(a.title);
    const color = articleUniverseColors[a.universe] || '6366F1';
    const coverImage = `https://placehold.co/800x450/${color}/FFFFFF?text=${encodeURIComponent(a.title.substring(0, 25))}`;

    insertArticle.run(id, universe.id, users[0].id, a.title, slug, a.summary, a.content, coverImage);

    for (const catName of a.categories) {
      const cat = categories.find((c) => c.name === catName);
      if (cat) linkCategory.run(id, cat.id);
    }
    for (const tagName of a.tags) {
      const tag = tags.find((t) => t.name === tagName);
      if (tag) linkTag.run(id, tag.id);
    }

    articles.push({ id, title: a.title, slug });
    console.log(`  📄 ${a.title}`);
  }
  console.log(`✅ ${articles.length} artículos creados`);

  // ── Characters ──
  const characterData: { name: string; alias: string; description: string; universe: string }[] = [
    { name: 'Goku', alias: 'Kakarot', description: 'El guerrero Saiyajin criado en la Tierra. Protagonista de Dragon Ball.', universe: 'Dragon Ball' },
    { name: 'Vegeta', alias: 'Príncipe de los Saiyajin', description: 'El orgulloso príncipe de la raza Saiyajin y rival eterno de Goku.', universe: 'Dragon Ball' },
    { name: 'Monkey D. Luffy', alias: 'Sombrero de Paja', description: 'Capitán de los Piratas del Sombrero de Paja. Aspira a ser el Rey de los Piratas.', universe: 'One Piece' },
    { name: 'Roronoa Zoro', alias: 'Cazador de Piratas', description: 'El espadachín de la tripulación de Luffy. Aspira a ser el mejor espadachín del mundo.', universe: 'One Piece' },
    { name: 'Naruto Uzumaki', alias: 'El Ninja Impredecible', description: 'El jinchuriki del Nueve Colas que aspira a ser Hokage.', universe: 'Naruto' },
    { name: 'Sasuke Uchiha', alias: 'El Último Uchiha', description: 'El último sobreviviente del clan Uchiha y rival de Naruto.', universe: 'Naruto' },
    { name: 'Darth Vader', alias: 'Anakin Skywalker', description: 'El Lord Sith más temido de la galaxia. Antaño el Jedi elegido.', universe: 'Star Wars' },
    { name: 'Luke Skywalker', alias: 'El Último Jedi', description: 'Héroe de la Alianza Rebelde y maestro Jedi que redimió a su padre.', universe: 'Star Wars' },
    { name: 'Geralt de Rivia', alias: 'El Lobo Blanco', description: 'Un brujo mutante que caza monstruos por contrato en el Continente.', universe: 'The Witcher' },
    { name: 'Link', alias: 'Héroe del Tiempo', description: 'El héroe elegido para proteger Hyrule y portador de la Espada Maestra.', universe: 'Zelda' },
    { name: 'Princesa Zelda', alias: 'Portadora de la Trifuerza', description: 'La princesa de Hyrule que posee la Trifuerza de la Sabiduría.', universe: 'Zelda' },
    { name: 'Doctor Doom', alias: 'Victor Von Doom', description: 'El monarca de Latveria y genio científico. Uno de los villanos más peligrosos.', universe: 'Marvel' },
    { name: 'Spider-Man', alias: 'Peter Parker', description: 'El trepamuros de Nueva York. Con grandes poderes vienen grandes responsabilidades.', universe: 'Marvel' },
    { name: 'Iron Man', alias: 'Tony Stark', description: 'Genio, multimillonario, playboy, filántropo. El corazón tecnológico de los Vengadores.', universe: 'Marvel' },
    { name: 'Thor', alias: 'Dios del Trueno', description: 'El príncipe de Asgard y dios del trueno. Portador del martillo Mjolnir.', universe: 'Marvel' },
    { name: 'Capitán América', alias: 'Steve Rogers', description: 'El supersoldado de la Segunda Guerra Mundial. El líder moral de los Vengadores.', universe: 'Marvel' },
    { name: 'Batman', alias: 'Bruce Wayne', description: 'El Caballero Oscuro de Gotham. Un humano que se enfrenta a dioses con preparación y voluntad.', universe: 'DC' },
    { name: 'Superman', alias: 'Clark Kent / Kal-El', description: 'El último hijo de Krypton. El héroe más poderoso de la Tierra.', universe: 'DC' },
  ];

  const characterUniverseColors: Record<string, string> = {
    'Dragon Ball': 'F68B1F',
    'One Piece': 'D4A843',
    Naruto: 'FF6B35',
    'Star Wars': 'FFE81F',
    'The Witcher': 'B0B5B9',
    Zelda: '3A9D23',
    Marvel: 'ED1D24',
    DC: '0076BE',
  };

  const characters: { id: string; name: string; slug: string; universeId: string }[] = [];
  const insertChar = db.prepare(`
    INSERT INTO characters (id, universe_id, name, slug, alias, description, image_url)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  for (const ch of characterData) {
    const id = uuidv4();
    const universe = universes.find((u) => u.name === ch.universe)!;
    const color = characterUniverseColors[ch.universe] || '6366F1';
    const imageUrl = `https://placehold.co/400x500/${color}/FFFFFF?text=${encodeURIComponent(ch.name)}`;
    insertChar.run(id, universe.id, ch.name, generateSlug(ch.name), ch.alias, ch.description, imageUrl);
    characters.push({ id, name: ch.name, slug: generateSlug(ch.name), universeId: universe.id });
    console.log(`  🦸 ${ch.name}`);
  }
  console.log(`✅ ${characters.length} personajes creados`);

  // ── Character Relations ──
  const insertRelation = db.prepare(`
    INSERT OR IGNORE INTO character_relations (id, character_id, related_character_id, relation_type, description)
    VALUES (?, ?, ?, ?, ?)
  `);

  const relations = [
    { a: 'Goku', b: 'Vegeta', type: 'rival', desc: 'Rivales legendarios que se han convertido en aliados' },
    { a: 'Naruto Uzumaki', b: 'Sasuke Uchiha', type: 'rival', desc: 'Amigos, rivales y hermanos de alma' },
    { a: 'Darth Vader', b: 'Luke Skywalker', type: 'family', desc: 'Padre e hijo, en bandos opuestos de la Fuerza' },
    { a: 'Batman', b: 'Superman', type: 'ally', desc: 'Los dos pilares de la Liga de la Justicia' },
  ];

  for (const r of relations) {
    const charA = characters.find((c) => c.name === r.a)!;
    const charB = characters.find((c) => c.name === r.b)!;
    insertRelation.run(uuidv4(), charA.id, charB.id, r.type, r.desc);
  }
  console.log(`✅ ${relations.length} relaciones entre personajes creadas`);

  // ── Theories ──
  const theoryData = [
    { title: '¿Quién será el próximo gran villano del UCM?', content: 'Análisis de posibles candidatos para ser la próxima gran amenaza tras Kang. Doctor Doom, Galactus y más.', universe: 'Marvel' },
    { title: 'Goku vs Superman: ¿Quién ganaría?', content: 'Un debate eterno. Analizando poderes, transformaciones y hazañas de ambos guerreros.', universe: 'Dragon Ball' },
    { title: 'El verdadero sueño de Luffy', content: 'Teoría sobre cuál es el sueño de Luffy que comparte con Roger. ¿Qué dijo realmente?', universe: 'One Piece' },
    { title: 'Radahn y Miquella: la batalla definitiva', content: 'Análisis de la conexión entre Radahn y Miquella en Elden Ring.', universe: 'Elden Ring' },
  ];

  const insertTheory = db.prepare(`
    INSERT INTO theories (id, title, slug, content, universe_id, author_id, status, votes)
    VALUES (?, ?, ?, ?, ?, ?, 'open', 0)
  `);

  for (const t of theoryData) {
    const id = uuidv4();
    const universe = universes.find((u) => u.name === t.universe)!;
    insertTheory.run(id, t.title, generateSlug(t.title), t.content, universe.id, users[2].id);
    console.log(`  💭 ${t.title}`);
  }
  console.log(`✅ ${theoryData.length} teorías creadas`);

  // ── Badges ──
  const badgeData = [
    { name: 'Primer Artículo', description: 'Publicaste tu primer artículo' },
    { name: 'Escritor', description: 'Publicaste 5 artículos' },
    { name: 'Autor Prolífico', description: 'Publicaste 20 artículos' },
    { name: 'Comentarista', description: 'Publicaste 10 comentarios' },
    { name: 'Teórico', description: 'Publicaste 3 teorías' },
    { name: 'Votante', description: 'Votaste en 10 teorías' },
    { name: 'Explorador', description: 'Visitaste 50 páginas' },
    { name: 'Veterano', description: 'Cuenta con más de 1 año' },
  ];

  const insertBadge = db.prepare('INSERT INTO badges (id, name, slug, description) VALUES (?, ?, ?, ?)');
  for (const b of badgeData) {
    insertBadge.run(uuidv4(), b.name, generateSlug(b.name), b.description);
  }
  console.log(`✅ ${badgeData.length} insignias creadas`);

  console.log('\n🎉 Seed completado exitosamente!');
  console.log('📧 Usuarios de prueba:');
  console.log('   admin@nexogeek.test / Admin123!');
  console.log('   moderator@nexogeek.test / Mod12345!');
  console.log('   contributor@nexogeek.test / Cont12345!');
  console.log('   user@nexogeek.test / User12345!');

  closeDb();
}

seed().catch((err) => {
  console.error('❌ Error en seed:', err);
  closeDb();
  process.exit(1);
});
