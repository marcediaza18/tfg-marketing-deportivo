# TFG — Sistema de Información para Agencias de Marketing Deportivo

> Trabajo Final de Grado · Grado en Ingeniería Informática · Facultad de Ciencias Sociales de Talavera (UCLM)
> **Autor:** Marcelino Díaz Alba · **Tutor:** Roberto Sánchez Reolid
> **Curso:** 2025/26 · **Tecnología específica:** Sistemas de Información

Sistema de Información integral, seguro y escalable basado en el stack **MERN** (MongoDB, Express.js, React, Node.js) y arquitectura cliente-servidor, orientado a optimizar la gestión operativa y el análisis estratégico en agencias de marketing deportivo.

## Funcionalidad principal

1. **Autenticación y control de acceso** — Login basado en JWT con gestión de roles (ojeador, gestor de productos, dirección).
2. **Gestión de base de datos centralizada** — MongoDB orientada a documentos con entidades clave: deportistas, clientes, eventos, patrocinios.
3. **Módulo de rutas de captación (scouting)** — Registro, trazado y análisis de las rutas de captación de nuevos talentos.
4. **Análisis de productos y servicios** — CRUD para la cartera de servicios de la agencia y medición de impacto.
5. **Panel de control interactivo (Dashboards)** — Visualización de métricas en tiempo real mediante una SPA en React con Recharts.

## Arquitectura

```
TFG/
├── backend/      Node.js + Express + TypeScript + Mongoose · API RESTful
└── frontend/     React + Vite + TypeScript + MUI + Recharts · SPA
```

La comunicación entre cliente y servidor se realiza mediante una **API RESTful**. La autenticación se gestiona con **JSON Web Tokens (JWT)** y los permisos por rol mediante middleware.

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18, TypeScript, Vite, Material UI, Recharts, React Router, Axios |
| Backend | Node.js 22, Express, TypeScript, Mongoose, JWT, bcrypt, Zod |
| Base de datos | MongoDB (MongoDB Atlas en la nube) |
| Herramientas | ESLint, Prettier, Nodemon, ts-node |

## Puesta en marcha

### Requisitos
- Node.js ≥ 20
- npm ≥ 10
- Una cuenta de [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (gratis)

### Configuración
1. Clona el repositorio.
2. Copia `backend/.env.example` a `backend/.env` y rellena la cadena de conexión de MongoDB Atlas y un secreto JWT.
3. Instala dependencias:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```
4. (Opcional) Genera datos de ejemplo:
   ```bash
   cd backend && npm run seed
   ```
5. Arranca ambos servicios:
   ```bash
   # Terminal 1
   cd backend && npm run dev
   # Terminal 2
   cd frontend && npm run dev
   ```

## Estado del proyecto

Este repositorio está en desarrollo activo como parte del TFG. Ver `docs/` (próximamente) para la memoria y diagramas.
