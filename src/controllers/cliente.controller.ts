
import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source.js";
import { Cliente } from "../entity/Cliente.js";
import { Envio } from "../entity/Envio.js";

export const getEnviosCliente = async (req: Request, res: Response) => {
    const clienteId = Number(req.params.id);

    if (!Number.isInteger(clienteId) || clienteId <= 0) {
        return res.status(400).json({
            mensaje: "ID de cliente invalido"
        });
    }

    try {
        const clienteRepository = AppDataSource.getRepository(Cliente);
        const envioRepository = AppDataSource.getRepository(Envio);

        const cliente = await clienteRepository.findOneBy({
            clienteId
        });

        if (!cliente) {
            return res.status(404).json({
                mensaje: "Cliente no encontrado"
            });
        }

        const envios = await envioRepository.find({
            where: {
                remitenteId: clienteId
            },
            relations: {
                destinatario: true,
                paquetes: true
            }
        });

        return res.json({
            cliente,
            totalEnvios: envios.length,
            envios
        });

    } catch (error) {
        console.error("Error al obtener envios del cliente:", error);

        return res.status(500).json({
            mensaje: "No se pudieron obtener los envios del cliente"
        });
    }
};
