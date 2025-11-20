# 🚀 Guía de Inicio Rápido - Pedidos YEMM

## Instalación en 5 Pasos

### 1️⃣ Clonar e Instalar Dependencias
```bash
git clone https://github.com/chikilin44/proyectohtmlfinal.git
cd proyectohtmlfinal/src
npm install
```

### 2️⃣ Asegurar PostgreSQL Instalado
```bash
# Verificar instalación
psql --version

# Si no está instalado:
# Ubuntu/Debian: sudo apt install postgresql
# macOS: brew install postgresql  
# Windows: Descargar de postgresql.org
```

### 3️⃣ Configurar Credenciales
```bash
cd src
cp .env.example .env
# Editar .env con tu contraseña de PostgreSQL
```

### 4️⃣ Crear Base de Datos
```bash
npm run setup-db
```

### 5️⃣ Iniciar y Usar
```bash
# Terminal 1: Iniciar servidor
npm start

# Terminal 2: Abrir aplicación
# Abrir index.html en tu navegador
# O usar: npx http-server -p 3000
```

## ✅ Verificación Rápida

```bash
# Probar servidor
curl http://localhost:4000/api/health

# Probar base de datos
psql -U postgres -d postgres -c "SELECT COUNT(*) FROM pedido;"
```

## 🎯 Siguiente Paso

1. Abre http://localhost:3000 (o abre index.html directamente)
2. Regístrate como cliente
3. Agrega productos al carrito
4. Ingresa una dirección
5. Confirma el pedido
6. ✅ ¡El pedido se guardó en la base de datos!

## 📚 Documentación Completa

- [README.md](README.md) - Documentación completa
- [DATABASE_SETUP.md](DATABASE_SETUP.md) - Configuración detallada de la base de datos

## ❓ Problemas Comunes

**PostgreSQL no conecta:**
```bash
sudo systemctl start postgresql  # Linux
brew services start postgresql   # macOS
```

**Error de autenticación:**
- Verificar contraseña en `.env`
- Actualizar con: `sudo -u postgres psql` → `ALTER USER postgres PASSWORD 'nueva_contraseña';`

**Tablas no existen:**
```bash
cd src
npm run setup-db
```
