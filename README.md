# 🧠 CoreTrack — Base de Strapi con Sistema de Auditorías

**CoreTrack** es un núcleo base desarrollado con **Strapi**, diseñado para servir como cimiento de futuros sistemas modulares.  
Actualmente implementa un **módulo de auditoría**, encargado de registrar automáticamente las operaciones realizadas en las tablas del sistema y los llamados a la API.

---

## 📑 Tabla de Contenido

- [📦 Tabla de Comandos](#-tabla-de-comandos)
- [⚙️ Requisitos](#️-requisitos)
- [🔐 Variables de Entorno](#-variables-de-entorno)
- [🧩 Script de Auditorías](#-script-de-auditorías)
- [🚀 Features](#-features)
- [📚 Estructura del Proyecto](#-estructura-del-proyecto)
- [🤝 Futuras Extensiones](#-futuras-extensiones)
- [📝 Licencia](#-licencia)

---

## 📦 Tabla de Comandos

| Comando | Descripción |
|----------|-------------|
| `npm run develop` | Inicia el servidor Strapi en modo desarrollo. |
| `npm run build` | Compila el panel de administración para producción. |
| `npm run start` | Inicia el servidor en modo producción. |
| `npm run lint` | Analiza el código en busca de errores o malas prácticas. |
| `npm run seed` | (Opcional) Permite ejecutar scripts de inicialización de datos. |

---

## ⚙️ Requisitos

Para ejecutar **CoreTrack**, asegúrate de cumplir con los siguientes requisitos mínimos:

| Recurso | Versión recomendada |
|----------|--------------------|
| **Node.js** | ≥ 18.x |
| **npm** | ≥ 9.x |
| **Base de datos** | PostgreSQL 14 o superior |

---

## 🔐 Variables de Entorno

Copia el siguiente bloque en tu archivo `.env` en la raíz del proyecto y modifica los valores marcados como `tobemodified` según tu configuración.

```bash
# Server
HOST=0.0.0.0
PORT=1337

# Secrets
APP_KEYS="toBeModified1,toBeModified2"
API_TOKEN_SALT=tobemodified
ADMIN_JWT_SECRET=tobemodified
TRANSFER_TOKEN_SALT=tobemodified
JWT_SECRET=tobemodified
ENCRYPTION_KEY=tobemodified

# Database
DATABASE_CLIENT=tobemodified
DATABASE_HOST=tobemodified.0.0.1
DATABASE_PORT=tobemodified
DATABASE_NAME=tobemodified
DATABASE_USERNAME=tobemodified
DATABASE_PASSWORD=tobemodified
DATABASE_SSL=tobemodified
DATABASE_FILENAME=tobemodified

# Additional
VITE_AUDIT_TOKEN=tobemodified
```

| Variable | Descripción |
|-----------|-------------|
| `HOST` | Dirección en la que se ejecutará el servidor. |
| `PORT` | Puerto de escucha de la aplicación. |
| `APP_KEYS` | Claves internas utilizadas por Strapi para cifrar datos. |
| `API_TOKEN_SALT` | Salt para generación de tokens de API. |
| `ADMIN_JWT_SECRET` | Clave para firmar los JWT del panel administrativo. |
| `TRANSFER_TOKEN_SALT` | Salt usado para transferencias de datos entre entornos. |
| `JWT_SECRET` | Clave usada para autenticación de usuarios. |
| `ENCRYPTION_KEY` | Clave general para cifrado de datos. |
| `DATABASE_*` | Configuración de conexión a PostgreSQL. |
| `VITE_AUDIT_TOKEN` | Token utilizado por el panel de administración para consultar auditorías. |

---

## 🧩 Script de Auditorías

CoreTrack incluye un **script automático** que registra los eventos de inserción, actualización y eliminación en las tablas del sistema, así como las llamadas a la API.

El script se ejecuta de forma interna mediante **Strapi Lifecycles**, sin requerir configuración adicional.  
Cada vez que una entidad se modifica, se crea una entrada en la tabla `audits` con la siguiente estructura:

| Campo | Descripción |
|--------|-------------|
| `id` | Identificador del evento. |
| `table_name` | Nombre de la tabla afectada. |
| `username` | Usuario que realizó la acción. |
| `action` | Tipo de operación (`POST`, `PUT`, `DELETE`). |
| `description` | Resumen del cambio. |
| `createdAt` | Fecha y hora del evento. |


Además, existe una **interfaz de administración** moderna (React + Strapi Design System) que permite:
- Filtrar por fecha y hora.
- Paginar resultados.
- Visualizar detalles de cada acción registrada.

---

## 🚀 Features

Inspirado en las capacidades de Strapi, **CoreTrack** incluye y hereda las siguientes características clave:

- 🔧 **Panel administrativo personalizable**  
  Administra contenido y módulos mediante una interfaz intuitiva.
- ⚙️ **API REST y GraphQL**  
  Crea endpoints automáticos para tus modelos de datos.
- 🧱 **Sistema modular**  
  Soporte para futuros módulos a través de plugins o forks.
- 🔒 **Autenticación basada en roles**  
  Control de acceso mediante JWT y roles de usuario.
- 🧾 **Auditoría integrada**  
  Registra automáticamente todos los cambios de datos en la base.

---

## 📚 Estructura del Proyecto

La estructura del proyecto **CoreTrack** está organizada para mantener claridad, escalabilidad y facilidad de mantenimiento.  
Cada módulo puede desarrollarse de forma independiente, permitiendo que el sistema crezca de manera modular.

coretrack/
├── src/
│ ├── admin/ # Código del panel administrativo (React + Strapi Design System)
│ ├── api/
│ │ └── audit/ # Módulo principal de auditorías (controladores, servicios, rutas)
│ ├── extensions/ # Extensiones o personalizaciones de Strapi
│ └── index.ts # Punto de entrada principal del servidor Strapi
├── .env # Variables de entorno del entorno local
├── package.json # Dependencias y scripts de ejecución
├── tsconfig.json # Configuración de TypeScript
└── README.md # Documentación del proyecto


---

## 🤝 Futuras Extensiones

El enfoque de **CoreTrack** es servir como un **núcleo modular y escalable**.  
Los módulos adicionales (por ejemplo, contabilidad, usuarios, notificaciones, o facturación) podrán agregarse como **plugins o forks** del proyecto principal, sin afectar la estabilidad del core.

Cada nuevo módulo deberá:
- Implementar su propio esquema de base de datos.
- Registrar sus acciones en la tabla `audits`.
- Mantener compatibilidad con el sistema de autenticación y permisos de Strapi.

---

## 📝 Licencia

Este proyecto está licenciado bajo **MIT**, lo que significa que puedes:
- Usarlo libremente en proyectos personales o comerciales.  
- Modificar y redistribuir el código.  
- Mantener la atribución original al autor.

---

### 💬 Autor

Desarrollado por **Alejandro Díaz**,  
como núcleo base para sistemas modulares y escalables sobre **Strapi**.  
🧠 _“Diseñado para crecer, construido para auditar.”_

