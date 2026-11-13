
import "reflect-metadata";
import { DataSource } from "typeorm";

import { Cliente } from "../entity/Cliente.js";
import { Direccion } from "../entity/Direccion.js";
import { Envio } from "../entity/Envio.js";
import { Almacen } from "../entity/Almacen.js";
import { Paquete } from "../entity/Paquete.js";
import { HistorialRastreo } from "../entity/HistorialRastreo.js";
import { AuditoriaEnvio } from "../entity/AuditoriaEnvio.js";

export const AppDataSource = new DataSource({
    type: "mysql",
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "logiexpress_db",
    synchronize: false,
    logging: true,
    entities: [
        Cliente,
        Direccion,
        Envio,
        Almacen,
        Paquete,
        HistorialRastreo,
        AuditoriaEnvio
    ],
    subscribers: [],
    migrations: [],
});
