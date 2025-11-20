import { pool } from './connectionPostgreSQL.js';

// mapa ampliado de sucursales -> id_tienda
const tiendaMap = {
  // Valle del Cauca
  'La Burger Cali Centro': 100,
  'La Burger Cali Norte': 101,
  'La Burger Tuluá': 102,
  'La Burger Palmira': 103,
  'La Burger Buga': 104,
  'Oliva Pizza Garden Cali': 110,
  'Oliva Pizza Garden Palmira': 111,
  'Drive Pizza Buga': 120,
  'Drive Pizza Cali': 121,
  // Cundinamarca / Bogotá
  'ATA Burger Bogotá Centro': 200,
  'ATA Burger Bogotá Norte': 201,
  'The Pizza Company Bogotá': 210,
  // Antioquia
  'Smash Burger Medellín Centro': 300,
  'Smash Burger Envigado': 301,
  'La Burger Medellín': 302,
  'Drive Pizza Rionegro': 310,
  // Atlántico
  'Drive Pizza Barranquilla': 400,
  'Oliva Pizza Barranquilla': 401,
  // Bolivar
  'The Pizza Company Cartagena': 500,
  'Drive Pizza Cartagena Centro': 501,
  // Santander
  'La Burger Bucaramanga': 600,
  'Drive Pizza Bucaramanga': 601,
  // Otros
  'ATA Burger Cúcuta': 700,
  'La Burger Ibagué': 800,
  'Drive Pizza Pasto': 900,
  'La Burger Soacha': 1000,
  'Oliva Pizza Santa Marta': 1100,
  'Smash Burger Bello': 1200,
  'Drive Pizza Pereira': 1300,
  'The Pizza Company Tunja': 1400,
  'Oliva Pizza Manizales': 1500,
  'La Burger Villavicencio': 1600,
  'Drive Pizza Yopal': 1700,
  'Smash Burger Montería': 1800,
  'La Burger Sincelejo': 1900
};

// mapear cada sucursal a un municipio (nombre tal como está en tabla municipio)
const branchToMunicipio = {
  'La Burger Cali Centro': 'Cali',
  'La Burger Cali Norte': 'Cali',
  'La Burger Tuluá': 'Tuluá',
  'La Burger Palmira': 'Palmira',
  'La Burger Buga': 'Buga',
  'Oliva Pizza Garden Cali': 'Cali',
  'Oliva Pizza Garden Palmira': 'Palmira',
  'Drive Pizza Buga': 'Buga',
  'Drive Pizza Cali': 'Cali',
  'ATA Burger Bogotá Centro': 'Bogotá',
  'ATA Burger Bogotá Norte': 'Bogotá',
  'The Pizza Company Bogotá': 'Bogotá',
  'Smash Burger Medellín Centro': 'Medellín',
  'Smash Burger Envigado': 'Envigado',
  'La Burger Medellín': 'Medellín',
  'Drive Pizza Rionegro': 'Rionegro',
  'Drive Pizza Barranquilla': 'Barranquilla',
  'Oliva Pizza Barranquilla': 'Barranquilla',
  'The Pizza Company Cartagena': 'Cartagena',
  'Drive Pizza Cartagena Centro': 'Cartagena',
  'La Burger Bucaramanga': 'Bucaramanga',
  'Drive Pizza Bucaramanga': 'Bucaramanga',
  'ATA Burger Cúcuta': 'Cúcuta',
  'La Burger Ibagué': 'Ibagué',
  'Drive Pizza Pasto': 'Pasto',
  'La Burger Soacha': 'Soacha',
  'Oliva Pizza Santa Marta': 'Santa Marta',
  'Smash Burger Bello': 'Bello',
  'Drive Pizza Pereira': 'Pereira',
  'The Pizza Company Tunja': 'Tunja',
  'Oliva Pizza Manizales': 'Manizales',
  'La Burger Villavicencio': 'Villavicencio',
  'Drive Pizza Yopal': 'Yopal',
  'Smash Burger Montería': 'Montería',
  'La Burger Sincelejo': 'Sincelejo'
};

// direcciones para cada sucursal (ajusta textos si quieres)
const tiendaAddresses = {
  'La Burger Cali Centro': 'Av. 1 #10-20, Cali',
  'La Burger Cali Norte': 'Calle 50 #20-30, Cali',
  'La Burger Tuluá': 'Carrera 5 #8-45, Tuluá',
  'La Burger Palmira': 'Cll 14 #6-22, Palmira',
  'La Burger Buga': 'Calle 2 #3-15, Buga',
  'Oliva Pizza Garden Cali': 'Av. 3N #12-34, Cali',
  'Oliva Pizza Garden Palmira': 'Calle 7 #10-50, Palmira',
  'Drive Pizza Buga': 'Av. La Plata #5-18, Buga',
  'Drive Pizza Cali': 'Calle 9 #23-67, Cali',
  'ATA Burger Bogotá Centro': 'Cra 7 #12-34, Bogotá',
  'ATA Burger Bogotá Norte': 'Cll 170 #15-20, Bogotá',
  'The Pizza Company Bogotá': 'Av. Boyacá #80-21, Bogotá',
  'Smash Burger Medellín Centro': 'Cll 44 #52-21, Medellín',
  'Smash Burger Envigado': 'Cra 43A #32-50, Envigado',
  'La Burger Medellín': 'Cll 10 #30-45, Medellín',
  'Drive Pizza Rionegro': 'Cll 60 #59-10, Rionegro',
  'Drive Pizza Barranquilla': 'Cll 84 #51-70, Barranquilla',
  'Oliva Pizza Barranquilla': 'Av. 1 #25-40, Barranquilla',
  'The Pizza Company Cartagena': 'Cll 30 #7-55, Cartagena',
  'Drive Pizza Cartagena Centro': 'Calle Real #20-12, Cartagena',
  'La Burger Bucaramanga': 'Cra 19 #34-12, Bucaramanga',
  'Drive Pizza Bucaramanga': 'Av. 9 #17-10, Bucaramanga',
  'ATA Burger Cúcuta': 'Cll 10 #8-60, Cúcuta',
  'La Burger Ibagué': 'Cll 14 #6-22, Ibagué',
  'Drive Pizza Pasto': 'Cra 5 #8-40, Pasto',
  'La Burger Soacha': 'Cll 8 #2-10, Soacha',
  'Oliva Pizza Santa Marta': 'Av. del Río #6-30, Santa Marta',
  'Smash Burger Bello': 'Cll 51 #45-20, Bello',
  'Drive Pizza Pereira': 'Cll 23 #14-50, Pereira',
  'The Pizza Company Tunja': 'Cra 4 #9-30, Tunja',
  'Oliva Pizza Manizales': 'Cll 23 #20-10, Manizales',
  'La Burger Villavicencio': 'Av. 40 #15-12, Villavicencio',
  'Drive Pizza Yopal': 'Cll 20 #12-5, Yopal',
  'Smash Burger Montería': 'Cll 30 #7-12, Montería',
  'La Burger Sincelejo': 'Cra 7 #11-22, Sincelejo'
};

// helper: resolver tienda por nombre dado en productosCatalogo (mantener función existente)
function resolveTiendaEntry(tiendaName) {
  if (!tiendaName) return { id: null, name: tiendaName };
  if (tiendaMap[tiendaName]) return { id: tiendaMap[tiendaName], name: tiendaName };
  const key = Object.keys(tiendaMap).find(k => k.toLowerCase().startsWith(tiendaName.toLowerCase()));
  if (key) return { id: tiendaMap[key], name: key };
  const partial = Object.keys(tiendaMap).find(k => k.toLowerCase().includes(tiendaName.toLowerCase()));
  if (partial) return { id: tiendaMap[partial], name: partial };
  return { id: null, name: tiendaName };
}

const productosCatalogo = [
  // hamburguesas
  { nombre: 'Classic Burger', precio: 15900, categoria: 'hamburguesas', img: 'images/Hamburguesa.jpg', descripcion: 'Carne, lechuga, tomate y salsa especial.', tienda: 'La Burger' },
  { nombre: 'Bacon Burger', precio: 17900, categoria: 'hamburguesas', img: 'images/Ham_Ata.jpg', descripcion: 'Con bacon crocante y queso.', tienda: 'ATA Burger' },
  { nombre: 'Cheese Burger', precio: 16900, categoria: 'hamburguesas', img: 'images/Ham_Smash.jpg', descripcion: 'Doble queso fundido.', tienda: 'Smash Burger' },
  { nombre: 'Chicken Burger', precio: 27000, categoria: 'hamburguesas', img: 'images/Ham_Chicken.png', descripcion: 'Pollo empanado, lechuga y mayonesa.', tienda: 'La Burger' },
  { nombre: 'Veggie Burger', precio: 13900, categoria: 'hamburguesas', img: 'images/Ham_Veggie.png', descripcion: 'Hamburguesa vegetal con aguacate.', tienda: 'La Burger' },
  { nombre: 'Double Meat', precio: 19900, categoria: 'hamburguesas', img: 'images/Ham_Double.png', descripcion: 'Doble carne, doble queso.', tienda: 'ATA Burger' },
  { nombre: 'Spicy Burger', precio: 16900, categoria: 'hamburguesas', img: 'images/Ham_Spicy.png', descripcion: 'Salsa picante y jalapeños.', tienda: 'Smash Burger' },
  { nombre: 'Mushroom Burger', precio: 16900, categoria: 'hamburguesas', img: 'images/Ham_Mushroom.png', descripcion: 'Champiñones salteados y queso suizo.', tienda: 'Oliva Pizza Garden' },
  { nombre: 'Blue Cheese', precio: 17900, categoria: 'hamburguesas', img: 'images/Ham_Blue.png', descripcion: 'Queso azul y cebolla caramelizada.', tienda: 'La Burger' },
  { nombre: 'BBQ Deluxe', precio: 18900, categoria: 'hamburguesas', img: 'images/Ham_BBQ.png', descripcion: 'Salsa BBQ, onion rings y bacon.', tienda: 'Drive Pizza' },
  { nombre: 'Guacamole Burger', precio: 17900, categoria: 'hamburguesas', img: 'images/Ham_Guac.png', descripcion: 'Carne jugosa con guacamole fresco y totopos crujientes.', tienda: 'ATA Burger' },
  { nombre: 'Tex-Mex Burger', precio: 18900, categoria: 'hamburguesas', img: 'images/Ham_Tex.png', descripcion: 'Salsa mexicana, jalapeños y queso cheddar fundido.', tienda: 'Smash Burger' },
  { nombre: 'Hawaiian Burger', precio: 16900, categoria: 'hamburguesas', img: 'images/Ham_Hawaii.png', descripcion: 'Piña asada, jamón y salsa teriyaki.', tienda: 'Oliva Pizza Garden' },
  { nombre: 'Truffle Burger', precio: 21900, categoria: 'hamburguesas', img: 'images/Ham_Trufa.png', descripcion: 'Queso gouda y mayonesa de trufa negra.', tienda: 'La Burger' },
  { nombre: 'Egg & Cheese Burger', precio: 17900, categoria: 'hamburguesas', img: 'images/Ham_Egg.png', descripcion: 'Huevo frito, queso cheddar y tocino.', tienda: 'Smash Burger' },
  { nombre: 'Smoky Burger', precio: 19900, categoria: 'hamburguesas', img: 'images/Ham_Smoke.png', descripcion: 'Sabor ahumado con salsa BBQ artesanal.', tienda: 'Drive Pizza' },
  { nombre: 'Crispy Onion Burger', precio: 17900, categoria: 'hamburguesas', img: 'images/Ham_Onion.png', descripcion: 'Crujientes aros de cebolla y queso americano.', tienda: 'La Burger' },
  { nombre: 'Buffalo Chicken Burger', precio: 16900, categoria: 'hamburguesas', img: 'images/Ham_Buffalo.png', descripcion: 'Pollo en salsa buffalo con aderezo ranch.', tienda: 'ATA Burger' },
  { nombre: 'Italian Burger', precio: 18900, categoria: 'hamburguesas', img: 'images/Ham_Italian.png', descripcion: 'Queso mozzarella, tomate seco y pesto de albahaca.', tienda: 'Oliva Pizza Garden' },

  // pizzas
  { nombre: 'Margarita', precio: 24900, categoria: 'pizzas', img: 'images/Pizza.jpeg', descripcion: 'Salsa de tomate, mozzarella y albahaca.', tienda: 'Oliva Pizza Garden' },
  { nombre: 'Pepperoni', precio: 26900, categoria: 'pizzas', img: 'images/promo1.png', descripcion: 'Extra pepperoni y queso.', tienda: 'Drive Pizza' },
  { nombre: 'Hawaiana', precio: 25900, categoria: 'pizzas', img: 'images/Pizza_Hawai.png', descripcion: 'Jamón y piña.', tienda: 'The Pizza Company' },
  { nombre: 'Cuatro Quesos', precio: 27900, categoria: 'pizzas', img: 'images/Pizza_Drive.jpg', descripcion: 'Mozzarella, gorgonzola, parmesano y cheddar.', tienda: 'Drive Pizza' },
  { nombre: 'BBQ Chicken', precio: 28900, categoria: 'pizzas', img: 'images/Pizza_BBQ.png', descripcion: 'Pollo, salsa BBQ y cilantro.', tienda: 'La Burger' },
  { nombre: 'Vegetariana', precio: 23900, categoria: 'pizzas', img: 'images/Pizza.jpeg', descripcion: 'Pimientos, champiñones y aceitunas.', tienda: 'Oliva Pizza Garden' },
  { nombre: 'Mexicana', precio: 26900, categoria: 'pizzas', img: 'images/Pizza_Mexicana.png', descripcion: 'Carne, jalapeños y salsa picante.', tienda: 'ATA Burger' },
  { nombre: 'Prosciutto', precio: 29900, categoria: 'pizzas', img: 'images/Pizza_Pro.png', descripcion: 'Jamón serrano y rúcula.', tienda: 'Oliva Pizza Garden' },
  { nombre: 'Marinera', precio: 29900, categoria: 'pizzas', img: 'images/Pizza_Toscana.png', descripcion: 'Mariscos y ajo.', tienda: 'Drive Pizza' },
  { nombre: 'Especial de la Casa', precio: 31900, categoria: 'pizzas', img: 'images/Pizza_Garden.jpg', descripcion: 'Ingredientes premium y salsa secreta.', tienda: 'Oliva Pizza Garden' },
  { nombre: 'Carbonara', precio: 28900, categoria: 'pizzas', img: 'images/Pizza_Carbonara.png', descripcion: 'Salsa blanca, panceta, huevo y queso parmesano.', tienda: 'The Pizza Company' },
  { nombre: 'Trufada', precio: 32900, categoria: 'pizzas', img: 'images/Pizza_Trufa.png', descripcion: 'Crema de trufa, champiñones y queso gouda.', tienda: 'La Burger' },
  { nombre: 'Mediterránea', precio: 27900, categoria: 'pizzas', img: 'images/Pizza_Mediterranea.png', descripcion: 'Aceitunas negras, tomate seco y queso feta.', tienda: 'Oliva Pizza Garden' },
  { nombre: 'Pollo y Champiñones', precio: 26900, categoria: 'pizzas', img: 'images/Pizza_Pollo.png', descripcion: 'Pollo asado, champiñones y crema de ajo.', tienda: 'Drive Pizza' },
  { nombre: 'Napolitana', precio: 25900, categoria: 'pizzas', img: 'images/Pizza_Napolitana.png', descripcion: 'Salsa de tomate natural, mozzarella y orégano.', tienda: 'The Pizza Company' },
  { nombre: 'Toscana', precio: 29900, categoria: 'pizzas', img: 'images/Pizza_Toscana.png', descripcion: 'Salchicha italiana, pimientos y cebolla morada.', tienda: 'Drive Pizza' },
  { nombre: 'Suprema', precio: 31900, categoria: 'pizzas', img: 'images/Pizza_Suprema.png', descripcion: 'Carne, pepperoni, champiñones y pimientos.', tienda: 'The Pizza Company' },
  { nombre: 'Campesina', precio: 24900, categoria: 'pizzas', img: 'images/Pizza_Campesina.png', descripcion: 'Maíz tierno, tocineta y cebolla blanca.', tienda: 'Oliva Pizza Garden' },
  { nombre: 'Del Mar', precio: 33900, categoria: 'pizzas', img: 'images/Pizza_Mar.png', descripcion: 'Camarones, calamar y toque de limón.', tienda: 'Drive Pizza' },
  { nombre: 'Vegana', precio: 27900, categoria: 'pizzas', img: 'images/Pizza_Vegana.png', descripcion: 'Base de tomate natural con vegetales frescos y queso vegano.', tienda: 'Oliva Pizza Garden' },

  // bebidas
  { nombre: 'Gaseosa 500ml', precio: 3900, categoria: 'bebidas', img: 'images/Gaseosa.jpg', descripcion: 'Coca Cola o similar.' },
  { nombre: 'Jugo Natural', precio: 4900, categoria: 'bebidas', img: 'images/Jugo_Natural.jpg', descripcion: 'Jugo del día.' },
  { nombre: 'Agua 600ml', precio: 2500, categoria: 'bebidas', img: 'images/Agua_600ml.jpg', descripcion: 'Agua sin gas.' },
  { nombre: 'Limonada', precio: 4500, categoria: 'bebidas', img: 'images/Limonada.jpg', descripcion: 'Limonada fresca.' },
  { nombre: 'Té Helado', precio: 4200, categoria: 'bebidas', img: 'images/Té_Helado.jpg', descripcion: 'Té frío con limón.' },
  { nombre: 'Malteada Vainilla', precio: 7900, categoria: 'bebidas', img: 'images/Malteada_Vainilla.jpg', descripcion: 'Malteada cremosa de vainilla.' },
  { nombre: 'Malteada Chocolate', precio: 7900, categoria: 'bebidas', img: 'images/Malteada_Chocolate.jpg', descripcion: 'Chocolate intenso.' },
  { nombre: 'Cerveza 330ml', precio: 6900, categoria: 'bebidas', img: 'images/Cerveza_330ml.jpg', descripcion: 'Cerveza nacional.' },
  { nombre: 'Cóctel sin Alcohol', precio: 8500, categoria: 'bebidas', img: 'images/Cóctel_sin_Alcohol.jpg', descripcion: 'Mezcla de frutas refrescante.' },
  { nombre: 'Smoothie Energético', precio: 9200, categoria: 'bebidas', img: 'images/Smoothie_Energético.jpg', descripcion: 'Frutas y proteína.' },
  { nombre: 'Café Americano', precio: 3900, categoria: 'bebidas', img: 'images/Café_Americano.jpg', descripcion: 'Café negro recién preparado.' },
  { nombre: 'Cappuccino', precio: 5900, categoria: 'bebidas', img: 'images/Cappuccino.png', descripcion: 'Café con espuma de leche y toque de canela.' },
  { nombre: 'Chocolate Caliente', precio: 5200, categoria: 'bebidas', img: 'images/Chocolate_Caliente.png', descripcion: 'Bebida espesa de cacao artesanal.' },
  { nombre: 'Agua con Gas', precio: 2700, categoria: 'bebidas', img: 'images/Agua_con_Gas.jpg', descripcion: 'Agua mineral gasificada.' },
  { nombre: 'Limonada de Coco', precio: 5500, categoria: 'bebidas', img: 'images/Limonada_de_Coco.jpg', descripcion: 'Limonada cremosa con coco natural.' },
  { nombre: 'Jugo de Mango', precio: 4900, categoria: 'bebidas', img: 'images/Jugo_de_Mango.jpg', descripcion: 'Jugo natural de mango maduro.' },
  { nombre: 'Batido de Fresa', precio: 7400, categoria: 'bebidas', img: 'images/Batido_de_Fresa.jpg', descripcion: 'Fresas frescas con leche fría.' },
  { nombre: 'Té Verde Frío', precio: 4300, categoria: 'bebidas', img: 'images/Té_Verde_Frío.jpg', descripcion: 'Té verde con toque de miel y limón.' },
  { nombre: 'Mojito sin Alcohol', precio: 8700, categoria: 'bebidas', img: 'images/Mojito_sin_Alcohol.jpg', descripcion: 'Menta fresca, limón y soda.' },
  { nombre: 'Jugo de Frutas Mixtas', precio: 5200, categoria: 'bebidas', img: 'images/Jugo_de_Frutas_Mixtas.jpg', descripcion: 'Mezcla de frutas tropicales.' }
];

function detectTipoBebida(nombre) {
  const low = nombre.toLowerCase();
  if (low.includes('gaseosa')) return 'gaseosa';
  if (low.includes('jugo')) return 'jugo';
  if (low.includes('agua')) return 'agua';
  if (low.includes('malteada') || low.includes('batido') || low.includes('smoothie')) return 'batido';
  if (low.includes('café') || low.includes('cappuccino') || low.includes('chocolate')) return 'cafe';
  if (low.includes('cerveza')) return 'cerveza';
  return 'otro';
}

function detectarTamano(nombre) {
  const m = nombre.match(/(\d+)\s?ml/i) || nombre.match(/(\d+)\s?mL/i);
  if (m) return `${m[1]}ml`;
  const m2 = nombre.match(/(\d+)\s?g/i);
  if (m2) return `${m2[1]}g`;
  return null;
}

function detectarTemperatura(tipoBebida) {
  if (tipoBebida === 'cafe' || tipoBebida === 'otro') return 'caliente';
  return 'fria';
}

function randomBool(prob = 0.25) {
  return Math.random() < prob;
}

// contar ingredientes desde descripción
function contarIngredientes(descripcion) {
  if (!descripcion) return null;
  let s = descripcion
    .replace(/[()]/g, '')
    .replace(/\s+y\s+|\s+and\s+|&|\+/gi, ',')
    .replace(/;|\//g, ',');
  const stopwords = ['con','de','la','el','los','las','y','en','sin','base','salsa'];
  const partes = s.split(',')
    .map(t => t.trim().toLowerCase())
    .filter(t => t && t.length > 1 && !stopwords.includes(t));
  return partes.length > 0 ? partes.length : null;
}

// generar tamaño aleatorio coherente (síncrono)
function generarTamanoAleatorio(tipoBebida) {
  const opciones = {
    gaseosa: ['330ml', '500ml', '600ml'],
    jugo: ['250ml', '300ml', '500ml'],
    agua: ['500ml', '600ml', '750ml'],
    batido: ['350ml', '400ml', '500ml'],
    cafe: ['200ml', '300ml', '350ml'],
    cerveza: ['330ml', '355ml'],
    otro: ['350ml', '500ml']
  };
  const lista = opciones[tipoBebida] || opciones['otro'];
  return lista[Math.floor(Math.random() * lista.length)];
}

async function ensureCategoriaPizza(client, nombrePizza) {
  const qname = nombrePizza.trim();
  const sel = await client.query('SELECT id_catep FROM categoria_pizza WHERE nombre_pizza ILIKE $1 LIMIT 1', [qname]);
  if (sel.rowCount > 0) return sel.rows[0].id_catep;
  const ins = await client.query(
    `INSERT INTO categoria_pizza (nombre_pizza, estado_p)
     VALUES ($1, TRUE)
     RETURNING id_catep`,
    [qname]
  );
  return ins.rows[0].id_catep;
}

async function obtenerOCrearMunicipio(client, nom_mun) {
  if (!nom_mun) return null;
  const sel = await client.query('SELECT id_mun FROM municipio WHERE lower(nom_mun) = lower($1) LIMIT 1', [nom_mun.trim()]);
  if (sel.rowCount > 0) return sel.rows[0].id_mun;
  const ins = await client.query('INSERT INTO municipio (nom_mun) VALUES ($1) RETURNING id_mun', [nom_mun.trim()]);
  return ins.rows[0].id_mun;
}

// Inserta/asegura todas las sucursales definidas en tiendaMap (id_tienda, nombre y id_mun si aplica)
async function seedTiendas(client) {
  for (const [nomTienda, idTienda] of Object.entries(tiendaMap)) {
    const municipioName = branchToMunicipio[nomTienda] || null;
    const direccion = tiendaAddresses[nomTienda] || null;
    let id_mun = null;
    try {
      if (municipioName) {
        id_mun = await obtenerOCrearMunicipio(client, municipioName);
      }
    } catch (err) {
      id_mun = null;
    }

    try {
      await client.query(
        `INSERT INTO tienda (id_tienda, nom_tienda, direccion, id_mun)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (id_tienda) DO UPDATE
           SET nom_tienda = EXCLUDED.nom_tienda,
               direccion = COALESCE(tienda.direccion, EXCLUDED.direccion),
               id_mun = COALESCE(tienda.id_mun, EXCLUDED.id_mun)`,
        [idTienda, nomTienda, direccion, id_mun]
      );
    } catch (err) {
      // Ignorar errores no críticos (esquema distinto, permisos, etc.)
    }
  }
}

async function insertarProductos() {
  const client = await pool.connect();
  let insertCount = 0;
  try {
    // Asegurar/sembrar todas las tiendas antes de insertar productos
    await seedTiendas(client);

    for (const p of productosCatalogo) {
      // resolver tienda / sucursal
      const tiendaEntry = resolveTiendaEntry(p.tienda);
      const tiendaId = tiendaEntry.id;
      const tiendaNombreParaGuardar = tiendaEntry.name || p.tienda || null;

      // intentar obtener id_mun según sucursal (branchToMunicipio)
      const municipioName = branchToMunicipio[tiendaNombreParaGuardar] || null;
      let tiendaIdMun = null;
      if (municipioName) {
        try {
          tiendaIdMun = await obtenerOCrearMunicipio(client, municipioName);
        } catch (e) {
          // si falla, dejar null
          tiendaIdMun = null;
        }
      }

      // Asegurar tienda en tabla tienda incluyendo id_mun si existe
      if (tiendaId) {
        try {
          await client.query(
            `INSERT INTO tienda (id_tienda, nom_tienda, direccion, id_mun)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (id_tienda) DO UPDATE
               SET nom_tienda = EXCLUDED.nom_tienda,
                   id_mun = COALESCE(tienda.id_mun, EXCLUDED.id_mun)`,
            [tiendaId, tiendaNombreParaGuardar, null, tiendaIdMun]
          );
        } catch (err) {
          // ignorar si columnas/tabla distintas
        }
      }

      // comprobar existencia en producto
      const exist = await client.query(
        'SELECT id_producto FROM producto WHERE nom_producto = $1 AND COALESCE(id_tienda,0) = COALESCE($2,0) LIMIT 1',
        [p.nombre, tiendaId]
      );

      if (exist.rowCount > 0) {
        const existingId = exist.rows[0].id_producto;

        // actualizar según categoría si faltan datos
        if (p.categoria === 'bebidas') {
          const tipo_bebida = detectTipoBebida(p.nombre);
          const tamanob = detectarTamano(p.nombre) || generarTamanoAleatorio(tipo_bebida);
          const temperatura = detectarTemperatura(tipo_bebida);
          await client.query(
            `UPDATE bebidas
             SET tipo_bebida = COALESCE(tipo_bebida, $1),
                 tamanob = COALESCE(tamanob, $2),
                 temperatura = COALESCE(temperatura, $3)
             WHERE id_producto = $4`,
            [tipo_bebida, tamanob, temperatura, existingId]
          );
        } else if (p.categoria === 'hamburguesas') {
          const incluye_auto = p.descripcion && /papas|acompañamiento|totopos|aros|onion/i.test(p.descripcion);
          const incluye_acomp = incluye_auto || randomBool(0.30);
          const combo_auto = /combo/i.test(p.nombre.toLowerCase());
          const combo = combo_auto || randomBool(0.12);
          await client.query(
            `UPDATE hamburguesa
             SET incluye_acomp = COALESCE(incluye_acomp, $1),
                 combo = COALESCE(combo, $2)
             WHERE id_producto = $3`,
            [incluye_acomp, combo, existingId]
          );
        } else if (p.categoria === 'pizzas') {
          const id_catep = await ensureCategoriaPizza(client, p.nombre);
          const numIng = contarIngredientes(p.descripcion);
          await client.query(
            `UPDATE pizza
             SET id_catep = COALESCE(id_catep, $1),
                 num_ingredientes = COALESCE(num_ingredientes, $2)
             WHERE id_producto = $3`,
            [id_catep, numIng, existingId]
          );
        }

        console.log(`Omitido/actualizado existente: ${p.nombre} (id=${existingId})`);
        continue;
      }

      // nuevo producto
      await client.query('BEGIN');

      const prodRes = await client.query(
        `INSERT INTO producto (nom_producto, descripcion, id_tienda, precio)
         VALUES ($1, $2, $3, $4) RETURNING id_producto`,
        [p.nombre, p.descripcion || '', tiendaId, p.precio]
      );
      const id_producto = prodRes.rows[0].id_producto;

      if (p.categoria === 'pizzas') {
        const id_catep = await ensureCategoriaPizza(client, p.nombre);
        const numIng = contarIngredientes(p.descripcion);
        await client.query(
          `INSERT INTO pizza (id_producto, id_catep, tamano, num_ingredientes)
           VALUES ($1, $2, $3, $4)`,
          [id_producto, id_catep, 'mediana', numIng]
        );
      } else if (p.categoria === 'hamburguesas') {
        const tipo_carne = p.descripcion && p.descripcion.toLowerCase().includes('pollo') ? 'pollo' : 'res';
        const incluye_auto = p.descripcion && /papas|acompañamiento|totopos|aros|onion/i.test(p.descripcion);
        const incluye_acomp = incluye_auto || randomBool(0.30);
        const doble_carne = /doble|double/i.test(p.descripcion) ? true : false;
        const combo_auto = /combo/i.test(p.nombre.toLowerCase());
        const combo = combo_auto || randomBool(0.12);
        await client.query(
          `INSERT INTO hamburguesa (id_producto, tipo_carne, incluye_acomp, doble_carne, combo)
           VALUES ($1, $2, $3, $4, $5)`,
          [id_producto, tipo_carne, incluye_acomp, doble_carne, combo]
        );
      } else if (p.categoria === 'bebidas') {
        const tipo_bebida = detectTipoBebida(p.nombre);
        const tamanob = detectarTamano(p.nombre) || generarTamanoAleatorio(tipo_bebida);
        const temperatura = detectarTemperatura(tipo_bebida);
        await client.query(
          `INSERT INTO bebidas (id_producto, tipo_bebida, tamanob, temperatura)
           VALUES ($1, $2, $3, $4)`,
          [id_producto, tipo_bebida, tamanob, temperatura]
        );
      }

      await client.query('COMMIT');
      insertCount++;
      console.log(`Insertado: ${p.nombre} (id_producto=${id_producto})`);
    }

    console.log(`Inserción finalizada. Productos añadidos: ${insertCount}`);
  } catch (err) {
    await client.query('ROLLBACK').catch(()=>{});
    console.error('Error insertando productos:', err.message || err);
  } finally {
    client.release();
    await pool.end();
  }
}

insertarProductos();