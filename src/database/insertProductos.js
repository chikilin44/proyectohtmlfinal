import { pool } from './connectionPostgreSQL.js';

const tiendaMap = {
  'La Burger': 12,
  'ATA Burger': 11,
  'Smash Burger': 13,
  'Oliva Pizza Garden': 21,
  'Drive Pizza': 22,
  'The Pizza Company': 23
};

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

// nueva función: contar ingredientes a partir de la descripción
function contarIngredientes(descripcion) {
  if (!descripcion) return null;
  // normalizar conectores y signos
  let s = descripcion
    .replace(/[()]/g, '')
    .replace(/\s+y\s+|\s+and\s+|&|\+/gi, ',')
    .replace(/;|\//g, ',');
  // separar por comas, limpiar y filtrar tokens triviales
  const stopwords = ['con','de','la','el','los','las','y','en','sin','base','salsa'];
  const partes = s.split(',')
    .map(t => t.trim().toLowerCase())
    .filter(t => t && t.length > 1 && !stopwords.includes(t));
  // si quedan tokens cortos, intentar contar palabras significativas dentro de cada token
  return partes.length > 0 ? partes.length : null;
}

async function generarTamanoAleatorio(tipoBebida) {
  // tamaños comunes en ml
  const tamanos = { agua: [330, 500], gaseosa: [350, 500], jugo: [250, 500], batido: [400, 600], cafe: [150, 250], cerveza: [330, 500] };
  const rango = tamanos[tipoBebida] || [250, 500];
  const tamanob = Math.floor(Math.random() * (rango[1] - rango[0] + 1)) + rango[0];
  return `${tamanob}ml`;
}

// Nueva función: asegurar categoría de pizza y devolver id_catep
async function ensureCategoriaPizza(client, nombrePizza) {
  // normalizar búsqueda por nombre
  const qname = nombrePizza.trim();
  // buscar existente
  const sel = await client.query('SELECT id_catep FROM categoria_pizza WHERE nombre_pizza ILIKE $1 LIMIT 1', [qname]);
  if (sel.rowCount > 0) return sel.rows[0].id_catep;
  // insertar nueva categoría (estado_p por defecto true)
  const ins = await client.query(
    `INSERT INTO categoria_pizza (nombre_pizza, estado_p)
     VALUES ($1, TRUE)
     RETURNING id_catep`,
    [qname]
  );
  return ins.rows[0].id_catep;
}

async function insertarProductos() {
  const client = await pool.connect();
  let insertCount = 0;
  try {
    for (const p of productosCatalogo) {
      const tiendaId = p.tienda ? (tiendaMap[p.tienda] || null) : null;

      // Asegurar tienda (evita FK)
      if (tiendaId) {
        try {
          await client.query(
            `INSERT INTO tienda (id_tienda, nombre_tienda) VALUES ($1, $2)
             ON CONFLICT (id_tienda) DO NOTHING`,
            [tiendaId, p.tienda]
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

        // si ya existe, actualizar tablas específicas si faltan datos
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
          // asegurar categoría_pizza y actualizar pizza.id_catep y num_ingredientes si faltan
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
        // asegurar categoría_pizza y usar id
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
    await client.query('ROLLBACK');
    console.error('Error insertando productos:', err.message || err);
  } finally {
    client.release();
    await pool.end();
  }
}

insertarProductos();