# 🚗 Carpooling Argentina - Dashboard Administrativo

Dashboard modular para la administración de la plataforma Carpooling Argentina. Construido con React, Vite, Tailwind CSS y una arquitectura completamente modular.

## 🚀 Características

- **Dashboard en tiempo real** con estadísticas de la plataforma
- **Gestión de usuarios** con controles administrativos
- **Monitoreo de viajes** y reservas
- **Sistema de pagos y comisiones**
- **Chat y notificaciones** en tiempo real
- **Analytics y métricas** avanzadas
- **Arquitectura modular** y escalable
- **Diseño responsive** con Tailwind CSS
- **Autenticación segura** con JWT

## 🛠️ Tecnologías

- **React 19** - Framework frontend
- **Vite 7** - Build tool y dev server
- **Tailwind CSS 4** - Framework de estilos
- **React Router DOM 7** - Routing
- **TanStack Query** - State management y caching
- **Zustand** - Store de autenticación
- **React Hook Form** - Manejo de formularios
- **Recharts** - Gráficos y visualizaciones
- **Lucide React** - Íconos
- **Axios** - Cliente HTTP

## 📦 Instalación

1. **Clonar o navegar al directorio del dashboard:**
   ```bash
   cd dashboard
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**
   ```bash
   cp .env.example .env
   ```

   Editar `.env` con la configuración correcta:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Ejecutar en modo desarrollo:**
   ```bash
   npm run dev
   ```

   El dashboard estará disponible en `http://localhost:3001`

## 🔧 Comandos Disponibles

```bash
# Desarrollo
npm run dev

# Construcción para producción
npm run build

# Vista previa de la build
npm run preview

# Linting
npm run lint
```

## 🏗️ Estructura del Proyecto

```
dashboard/
├── src/
│   ├── components/          # Componentes reutilizables
│   │   ├── common/          # Componentes base (Button, Card, etc.)
│   │   ├── layout/          # Layout y ProtectedRoute
│   │   └── modules/         # Componentes específicos por módulo
│   ├── context/             # Context stores (Zustand)
│   ├── hooks/               # Custom hooks
│   ├── pages/               # Páginas/rutas
│   ├── services/            # Servicios API modulares
│   ├── styles/              # Estilos CSS
│   └── utils/               # Utilidades
├── public/                  # Archivos estáticos
├── index.html              # Template HTML
├── package.json            # Dependencias
├── tailwind.config.js      # Configuración Tailwind
├── vite.config.js          # Configuración Vite
└── README.md               # Este archivo
```

## 🔐 Autenticación

El dashboard requiere credenciales de administrador para acceder. Utiliza el sistema de autenticación del backend principal.

### Login por defecto:
- **Email:** Usar credenciales de admin del backend
- **Contraseña:** Definida en el backend

## 📊 Módulos Disponibles

### 1. Dashboard Principal
- Estadísticas en tiempo real de la plataforma
- Métricas de usuarios, viajes, pagos
- Actividad reciente
- Acciones rápidas

### 2. Gestión de Usuarios
- Lista y búsqueda de usuarios
- Detalles de perfil
- Activación/desactivación
- Verificación manual

### 3. Gestión de Viajes
- Monitoreo de viajes activos
- Historial completo
- Cancelación administrativa
- Detalles y estadísticas

### 4. Gestión de Reservas
- Vista de todas las reservas
- Estados y seguimiento
- Cancelaciones administrativas

### 5. Pagos y Comisiones
- Transacciones de la plataforma
- Sistema de comisiones
- Reportes financieros
- Pagos pendientes

### 6. Chat y Notificaciones
- Monitoreo de conversaciones
- Sistema de notificaciones
- Moderación de contenido

### 7. Analytics
- Métricas avanzadas
- Gráficos y visualizaciones
- Reportes personalizados
- KPIs de negocio

## 🔗 Integración con Backend

El dashboard se conecta automáticamente con el backend principal en `http://localhost:5000/api`.

### Endpoints utilizados:
- `/api/admin/*` - Funciones administrativas
- `/api/auth/*` - Autenticación
- `/api/users/*` - Gestión de usuarios
- `/api/trips/*` - Gestión de viajes
- `/api/bookings/*` - Gestión de reservas
- `/api/payments/*` - Sistema de pagos
- `/api/commissions/*` - Comisiones
- Y más...

## 🎨 Personalización

### Colores y Temas
Modifica `tailwind.config.js` para personalizar la paleta de colores:

```js
theme: {
  extend: {
    colors: {
      primary: {
        50: '#eff6ff',
        500: '#3b82f6',
        // ... más colores
      }
    }
  }
}
```

### Componentes
Todos los componentes están en `src/components/` y son completamente modulares y reutilizables.

## 🚀 Deployment

### Build para producción:
```bash
npm run build
```

Los archivos estáticos se generarán en `dist/` y pueden servirse desde cualquier servidor web.

### Variables de entorno para producción:
```env
VITE_API_URL=https://api.tu-dominio.com/api
NODE_ENV=production
```

## 🔧 Desarrollo

### Agregar nuevos módulos:
1. Crear componentes en `src/components/modules/`
2. Crear servicios en `src/services/`
3. Agregar páginas en `src/pages/`
4. Actualizar rutas en `src/App.jsx`
5. Agregar navegación en `src/components/layout/Layout.jsx`

### Estructura de un módulo típico:
```
src/components/modules/users/
├── UsersList.jsx
├── UserDetail.jsx
├── UserForm.jsx
└── index.js
```

## 📱 Responsive Design

El dashboard está completamente optimizado para:
- **Desktop** (1024px+)
- **Tablet** (768px - 1023px)
- **Mobile** (< 768px)

## 🛡️ Seguridad

- Autenticación JWT obligatoria
- Rutas protegidas por roles
- Validación en frontend y backend
- Sanitización de datos

## 🤝 Contribución

1. Fork del repositorio
2. Crear branch para feature
3. Commit con mensajes descriptivos
4. Push al branch
5. Crear Pull Request

## 📄 Licencia

Copyright © 2024 Carpooling Argentina. Todos los derechos reservados.

## 🆘 Soporte

Para soporte técnico o consultas:
- **Email:** soporte@carpooling.com.ar
- **Documentación:** Ver `/API_DOCUMENTATION.md`

---

*Dashboard desarrollado con ❤️ para Carpooling Argentina*