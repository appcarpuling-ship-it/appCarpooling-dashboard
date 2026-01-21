# 🎨 Banner Management Dashboard - Documentación Completa

## Resumen Ejecutivo

Se ha completado exitosamente el sistema de gestión de banners para el dashboard administrativo. El sistema incluye:

- ✅ **Backend**: Modelo, controlador, rutas y seeder (completado en sesión anterior)
- ✅ **Frontend Dashboard**: Página principal, formulario, lista de banners y estadísticas
- ✅ **Styling**: CSS completo con responsive design para todos los componentes
- ✅ **Funcionalidades**: CRUD completo, reordenamiento arrastrable, toggle de estado, estadísticas

---

## Estructura de Componentes

### 1. **Página Principal: `Banners.jsx`** (280 líneas)

**Ubicación**: `src/pages/Banners.jsx`

**Responsabilidades**:
- Gestión de estado global de banners
- Selector de paquetes (Free, Premium, VIP, Enterprise)
- Sistema de tabs (Lista / Estadísticas)
- Orquestación de operaciones CRUD
- Manejo de alertas de éxito/error
- Modal para el formulario

**Estado Manejado**:
```javascript
- banners: Array[]           // Banners del paquete actual
- selectedPackage: String   // Paquete seleccionado
- loading: Boolean          // Estado de carga
- showForm: Boolean         // Mostrar/ocultar modal del formulario
- editingBanner: Object     // Banner en edición
- stats: Object             // Estadísticas del paquete
- activeTab: String         // 'list' | 'stats'
- error: String             // Mensaje de error
- success: String           // Mensaje de éxito
```

**Métodos Principales**:
- `loadBanners()` - Obtiene banners del paquete actual
- `loadStats()` - Obtiene estadísticas del paquete
- `handleCreateBanner()` - Crea nuevo banner
- `handleUpdateBanner()` - Actualiza banner existente
- `handleToggleStatus()` - Activa/desactiva banner
- `handleDeleteBanner()` - Elimina banner con confirmación
- `handleReorder()` - Reordena banners del paquete
- `handleEditBanner()` - Abre formulario en modo edición
- `handleCloseForm()` - Cierra modal del formulario

---

### 2. **Servicio API: `bannerService.js`** (160 líneas)

**Ubicación**: `src/services/bannerService.js`

**Responsabilidades**:
- Comunicación con API backend
- Manejo de requests/responses
- Gestión de errores HTTP
- Transformación de datos

**Funciones Exportadas**:

```javascript
// Obtener banners por paquete
getBannersByPackage(packageId, isActive = null)
  → GET /api/banners/package/:packageId?isActive=...

// Obtener banner por ID
getBannerById(id)
  → GET /api/banners/:id

// Crear nuevo banner
createBanner(bannerData)
  → POST /api/banners

// Actualizar banner
updateBanner(id, bannerData)
  → PUT /api/banners/:id

// Cambiar estado (activo/inactivo)
toggleBannerStatus(id)
  → PATCH /api/banners/:id/toggle-status

// Reordenar banners
reorderBanners(packageId, banners)
  → PATCH /api/banners/reorder/:packageId

// Obtener estadísticas
getBannerStats(packageId)
  → GET /api/banners/stats/:packageId

// Registrar visualización
registerBannerView(id)
  → POST /api/banners/:id/register-view

// Registrar clic
registerBannerClick(id)
  → POST /api/banners/:id/register-click

// Eliminar banner
deleteBanner(id)
  → DELETE /api/banners/:id
```

---

### 3. **Componente Lista: `BannerList.jsx`** (220 líneas)

**Ubicación**: `src/components/common/BannerList.jsx`

**Responsabilidades**:
- Mostrar lista de banners del paquete seleccionado
- Permitir arrastrar y soltar para reordenar
- Acciones: Editar, Eliminar, Toggle (activo/inactivo)
- Visualización de estadísticas básicas
- Indicador visual de estado

**Características**:
- ✅ Drag & Drop para reordenar
- ✅ Vista de tarjetas con hover effects
- ✅ Imagen con fallback
- ✅ Indicador visual de orden
- ✅ Botones de acción
- ✅ Estado visual (activo/inactivo)
- ✅ Estadísticas básicas (vistas, clics)
- ✅ Responsive design

**Props**:
```javascript
{
  banners: Array,                  // Banners a mostrar
  onToggleStatus: Function,        // Callback para cambiar estado
  onEdit: Function,                // Callback para editar
  onDelete: Function,              // Callback para eliminar
  onReorder: Function              // Callback para reordenar
}
```

---

### 4. **Componente Estadísticas: `BannerStats.jsx`** (250 líneas)

**Ubicación**: `src/components/common/BannerStats.jsx`

**Responsabilidades**:
- Mostrar estadísticas de banners
- Cálculos de CTR (Click-Through Rate)
- Top banners por rendimiento
- Indicadores de estado

**Secciones**:

1. **Tarjetas de Resumen** (4 cards):
   - Total de banners (con count de activos)
   - Total de vistas e impresiones
   - Total de clics
   - CTR promedio (%)

2. **Top Banners por Clics** (tabla):
   - Imagen en miniatura
   - Título del banner
   - Tipo de banner
   - Vistas / Clics / Impresiones / CTR

3. **Indicadores de Estado**:
   - Barra de progreso: Banners activos
   - Barra de progreso: Tasa de interacción

**Props**:
```javascript
{
  stats: Object,        // Estadísticas del paquete
  banners: Array        // Banners para cálculos
}
```

---

### 5. **Componente Formulario: `BannerForm.jsx`** (450+ líneas)

**Ubicación**: `src/components/common/BannerForm.jsx`

**Responsabilidades**:
- Crear nuevos banners
- Editar banners existentes
- Validación de formulario
- Previsualización de imagen
- Gestión de tags

**Secciones del Formulario**:

1. **📝 Información Básica**:
   - Título (requerido)
   - Descripción
   - Tipo (banner/advertisement/promotional/featured)

2. **🔗 URLs**:
   - URL de imagen (requerido, con validación)
   - URL de destino (click)
   - Preview de imagen

3. **📐 Dimensiones**:
   - Ancho en píxeles (default: 1080)
   - Altura en píxeles (default: 300)
   - Display de dimensiones

4. **📅 Período de Campaña**:
   - Fecha de inicio (opcional)
   - Fecha de fin (opcional)

5. **👁️ Visibilidad**:
   - Tipo de usuario (Conductor/Pasajero/Ambos)
   - Dispositivos (Móvil/Web/Ambos)

6. **🏷️ Información Adicional**:
   - Nombre de campaña
   - Categoría
   - Etiquetas (tags) con agregar/eliminar
   - Orden

**Validación**:
- Título requerido
- URL de imagen requerida y válida
- URL de destino válida (si se proporciona)
- Validación en tiempo real

**Props**:
```javascript
{
  banner: Object,       // Banner a editar (null para crear)
  onSubmit: Function,   // Callback de envío (recibe id y data para editar)
  onCancel: Function    // Callback de cancelación
}
```

---

## Estilos CSS

### Archivos de Estilo:

1. **`Banners.css`** - Página principal (300+ líneas)
   - Layout y grid
   - Selector de paquetes
   - Sistema de tabs
   - Alertas
   - Modal
   - Responsive design

2. **`BannerList.css`** - Lista de banners (400+ líneas)
   - Grid de banners
   - Drag & drop styling
   - Hover effects
   - Badges y estados
   - Responsive grid

3. **`BannerStats.css`** - Estadísticas (400+ líneas)
   - Tarjetas de resumen con gradientes
   - Tabla de top banners
   - Indicadores con barras de progreso
   - Responsive tables

4. **`BannerForm.css`** - Formulario (500+ líneas)
   - Secciones del formulario
   - Inputs y textareas
   - Preview de imagen
   - Validación visual
   - Manejo de tags
   - Modal styling
   - Responsive design completo

---

## Flujos de Uso

### 1. **Crear Banner**
```
Usuario → Click "Crear Banner" 
  → Se abre modal con BannerForm (vacío)
  → Completa datos
  → Click "Crear"
  → bannerService.createBanner()
  → Actualiza lista
  → Muestra success alert
```

### 2. **Editar Banner**
```
Usuario → Click icono "Editar" en BannerList
  → Se abre modal con BannerForm (precargado)
  → Modifica datos
  → Click "Actualizar"
  → bannerService.updateBanner()
  → Actualiza lista
  → Muestra success alert
```

### 3. **Cambiar Paquete**
```
Usuario → Click en package-btn
  → selectedPackage = new package
  → useEffect dispara loadBanners()
  → Carga banners del nuevo paquete
  → BannerList se actualiza
```

### 4. **Reordenar Banners**
```
Usuario → Arrastra banner en BannerList
  → onDragStart: Guarda banner arrastrado
  → onDrop: Recalcula posiciones
  → Actualiza estado local
  → bannerService.reorderBanners()
  → Sincroniza con backend
```

### 5. **Ver Estadísticas**
```
Usuario → Click en tab "Estadísticas"
  → activeTab = 'stats'
  → useEffect dispara loadStats()
  → bannerService.getBannerStats()
  → Renderiza BannerStats con datos
  → Cálculos de CTR
```

---

## Integración con Backend

### Endpoints Utilizados:

**Público**:
- `GET /api/banners/package/:packageId` - Obtener banners por paquete
- `GET /api/banners/:id` - Obtener banner específico
- `POST /api/banners/:id/register-view` - Registrar visualización
- `POST /api/banners/:id/register-click` - Registrar clic

**Admin Autenticado**:
- `POST /api/banners` - Crear banner
- `PUT /api/banners/:id` - Actualizar banner
- `PATCH /api/banners/:id/toggle-status` - Cambiar estado
- `PATCH /api/banners/reorder/:packageId` - Reordenar
- `DELETE /api/banners/:id` - Eliminar banner
- `GET /api/banners/stats/:packageId` - Obtener estadísticas

---

## Datos del Banner

### Estructura Completa:

```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  imageUrl: String,
  clickUrl: String,
  order: Number,
  isActive: Boolean,
  type: String, // 'banner' | 'advertisement' | 'promotional' | 'featured'
  
  // Dimensiones
  dimensions: {
    width: Number,   // en pixels
    height: Number
  },
  
  // Período de campaña
  campaignPeriod: {
    startDate: Date,
    endDate: Date
  },
  
  // Visibilidad
  visibility: {
    countries: [String],
    userTypes: String, // 'driver' | 'passenger' | 'both'
    devices: String    // 'mobile' | 'web' | 'both'
  },
  
  // Estadísticas
  statistics: {
    views: Number,
    clicks: Number,
    impressions: Number,
    // CTR es calculado: (clicks / impressions) * 100
  },
  
  // Metadata
  metadata: {
    campaignName: String,
    category: String,
    tags: [String],
    advertiser: String
  },
  
  // Auditoría
  createdAt: Date,
  updatedAt: Date,
  createdBy: ObjectId,
  updatedBy: ObjectId,
  packageId: String
}
```

---

## Características Implementadas

### ✅ CRUD Completo
- [x] Crear banners
- [x] Leer/Listar banners
- [x] Actualizar banners
- [x] Eliminar banners

### ✅ Gestión Avanzada
- [x] Cambiar estado (activo/inactivo)
- [x] Reordenamiento con drag & drop
- [x] Filtrado por paquete
- [x] Visualización de estadísticas

### ✅ Formulario Completo
- [x] Validación de campos
- [x] Preview de imagen
- [x] Manejo de tags
- [x] Modo crear/editar

### ✅ Estadísticas
- [x] Total de banners y activos
- [x] Vistas e impresiones
- [x] Clics y CTR
- [x] Top banners por rendimiento
- [x] Indicadores visuales

### ✅ UX/UI
- [x] Responsive design
- [x] Alertas de éxito/error
- [x] Loading states
- [x] Modal para formulario
- [x] Hover effects
- [x] Estados visuales
- [x] Iconos descriptivos

---

## Archivos Creados/Modificados

### Nuevos Archivos:
```
Dashboard/
├── src/
│   ├── components/common/
│   │   ├── BannerForm.jsx           (450+ líneas)
│   │   ├── BannerList.jsx           (220 líneas)
│   │   └── BannerStats.jsx          (250 líneas)
│   ├── pages/
│   │   └── Banners.jsx              (280 líneas)
│   ├── services/
│   │   └── bannerService.js         (160 líneas)
│   └── styles/
│       ├── components/
│       │   ├── BannerForm.css       (500+ líneas)
│       │   ├── BannerList.css       (400+ líneas)
│       │   └── BannerStats.css      (400+ líneas)
│       └── pages/
│           └── Banners.css          (300+ líneas)
```

### Total de Código:
- **JavaScript/JSX**: ~1,360 líneas
- **CSS**: ~1,600 líneas
- **Total**: ~2,960 líneas

---

## Próximos Pasos Sugeridos

1. **Integración**: Conectar la página a la navegación del dashboard
2. **Permisos**: Asegurar que solo admins pueden acceder
3. **Testing**: Probar flujos completos en navegador
4. **Optimización**: Agregar paginación si hay muchos banners
5. **Análisis**: Expandir gráficos de estadísticas
6. **Exportación**: Agregar exportar datos de banners a CSV/Excel

---

## Commits Realizados

```bash
# Backend (sesión anterior)
feat: add banner system with package management, ordering and statistics

# Dashboard (esta sesión)
feat: add complete banner management dashboard with list, stats and form components
```

---

## Notas de Desarrollo

- Todos los componentes son reutilizables y modulares
- El sistema es completamente responsive (mobile-first)
- Validación en cliente y validación esperada en servidor
- Manejo robusto de errores con mensajes claros
- Estilos CSS moderno sin dependencias externas
- Compatible con React Hooks
- Soporta drag & drop nativo del navegador

---

**Última actualización**: [Fecha actual]
**Estado**: ✅ COMPLETADO
**Rama**: main
