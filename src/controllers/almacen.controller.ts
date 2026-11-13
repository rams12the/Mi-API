
import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source.js";
import { Almacen } from "../entity/Almacen.js";
import { Paquete } from "../entity/Paquete.js";

export const createPaqueteAlmacen = async (req: Request, res: Response) => {
    const almacenId = Number(req.params.id);
    const { envioId, peso, largo, ancho, alto, contenido } = req.body;

    if (
        !Number.isInteger(almacenId) ||
        almacenId <= 0 ||
        !Number.isInteger(envioId) ||
        envioId <= 0 ||
        ![peso, largo, ancho, alto].every(
            (valor) => Number.isFinite(valor) && valor > 0
        ) ||
        typeof contenido !== "string" ||
        !contenido.trim()
    ) {
        return res.status(400).json({
            mensaje: "Datos del paquete invalidos"
        });
    }

    try {
        const almacenRepository = AppDataSource.getRepository(Almacen);
        const paqueteRepository = AppDataSource.getRepository(Paquete);

        const almacen = await almacenRepository.findOneBy({ almacenId });

        if (!almacen) {
            return res.status(404).json({
                mensaje: "Almacen no encontrado"
            });
        }

        const paquete = paqueteRepository.create({
            envioId,
            almacenId,
            peso,
            largo,
            ancho,
            alto,
            contenido
        });

        const paqueteGuardado = await paqueteRepository.save(paquete);

        return res.status(201).json({
            mensaje: "Paquete registrado correctamente",
            paquete: paqueteGuardado
        });

    } catch (error) {
        console.error("Error al registrar paquete:", error);

        return res.status(500).json({
            mensaje: "No se pudo registrar el paquete"
        });
    }
};
