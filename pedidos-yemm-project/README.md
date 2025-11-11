# Pedidos YEMM Project

## Descripción
Pedidos YEMM es una aplicación web diseñada para gestionar pedidos de comida. Permite a los usuarios realizar pedidos, y a los repartidores gestionar y entregar esos pedidos. La aplicación está construida utilizando Node.js y Express para el backend, y HTML, CSS y JavaScript para el frontend.

## Estructura del Proyecto
El proyecto está organizado de la siguiente manera:

```
pedidos-yemm-project
├── public
│   ├── index.html          # Documento HTML principal
│   ├── js
│   │   └── main.js         # Código JavaScript del lado del cliente
│   └── styles
│       └── style.css       # Estilos CSS para la aplicación
├── src
│   ├── server.js           # Punto de entrada del servidor
│   ├── routes
│   │   └── api.js          # Rutas de la API
│   ├── controllers
│   │   └── pedidosController.js # Lógica de negocio para pedidos
│   ├── models
│   │   └── pedidoModel.js   # Modelo de datos para pedidos
│   └── db
│       └── index.js        # Conexión a la base de datos
├── sql
│   └── schema.sql          # Esquema SQL para la base de datos
├── .env.example             # Plantilla para variables de entorno
├── .gitignore               # Archivos y directorios a ignorar por Git
├── package.json             # Configuración de npm
└── README.md                # Documentación del proyecto
```

## Instalación
1. Clona el repositorio:
   ```
   git clone <URL_DEL_REPOSITORIO>
   ```
2. Navega al directorio del proyecto:
   ```
   cd pedidos-yemm-project
   ```
3. Instala las dependencias:
   ```
   npm install
   ```
4. Crea un archivo `.env` a partir de `.env.example` y configura las variables de entorno necesarias.

## Uso
1. Inicia el servidor:
   ```
   npm start
   ```
2. Abre tu navegador y visita `http://localhost:3000` para acceder a la aplicación.

## Contribuciones
Las contribuciones son bienvenidas. Si deseas contribuir, por favor abre un issue o envía un pull request.

## Licencia
Este proyecto está bajo la Licencia MIT.