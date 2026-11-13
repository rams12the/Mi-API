
import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source.js";
import { Envio } from "../entity/Envio.js";
import { HistorialRastreo } from "../entity/HistorialRastreo.js";

const envioRepository = AppDataSource.getRepository(Envio);

//para obtener todos los envios
export const getAllEnvios = async (req: Request, res: Response) => {
    try {
        const envios = await envioRepository.find({
            relations: {
                remitente: true,
                destinatario: true,
                paquetes: true
            }
        });

        return res.json(envios);
    } catch (error) {
        console.error("Error al obtener envios:", error);

        return res.status(500).json({
            mensaje: "Error al obtener los envios"
        });
    }
};

//crear el metodo para crear envios
export const createEnvio = async (req: Request, res: Response) => {
    const {
        remitenteId,
        destinatarioId,
        direccionOrigenId,
        direccionDestinoId,
        costoTotal,
        paquetes
    } = req.body;

    if (
        !remitenteId ||
        !destinatarioId ||
        !direccionOrigenId ||
        !direccionDestinoId ||
        costoTotal == null ||
        !Array.isArray(paquetes) ||
        paquetes.length === 0
    ) {
        return res.status(400).json({
            mensaje: "Faltan datos del envio o paquetes"
        });
    }

    try {
        const nuevoEnvio = await AppDataSource.transaction(
            async (manager) => {
                const envio = manager.create(Envio, {
                    remitenteId,
                    destinatarioId,
                    direccionOrigenId,
                    direccionDestinoId,
                    costoTotal,
                    estado: "REGISTRADO"
                });

                const envioGuardado = await manager.save(envio);

                const paquetesNuevos = paquetes.map((p: any) => ({
                    envioId: envioGuardado.envioId,
                    almacenId: p.almacenId,
                    peso: p.peso,
                    largo: p.largo,
                    ancho: p.ancho,
                    alto: p.alto,
                    contenido: p.contenido
                }));

                
        await manager
            .createQueryBuilder()
            .insert()
            .into("paquetes")
            .values(
                paquetesNuevos.map((p: any) => ({
                envioId: p.envioId,
                almacenId: p.almacenId,
                peso: p.peso,
                largo: p.largo,
                ancho: p.ancho,
                alto: p.alto,
                contenido: p.contenido
            }))
        )
        .execute();


                return envioGuardado;
            }
        );

        return res.status(201).json({
            mensaje: "Envio registrado correctamente",
            envio: nuevoEnvio
        });
    } catch (error) {
        console.error("Error al crear envio:", error);

        return res.status(500).json({
            mensaje: "No se pudo registrar el envio"
        });
    }
};


//crear el update
export const updateCostoEnvio = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const { costoTotal } = req.body;

    if (!Number.isInteger(id) || id <= 0 || costoTotal == null || !Number.isFinite(Number(costoTotal)) || Number(costoTotal) < 0) {
        return res.status(400).json({
            mensaje: "ID o costo invalido"
        });
    }

    try {
        const envio = await envioRepository.findOneBy({
            envioId: id
        });

        if (!envio) {
            return res.status(404).json({
                mensaje: "Envio no encontrado"
            });
        }

        await envioRepository.update(id, {
            costoTotal: Number(costoTotal)
        });

        return res.json({
            mensaje: "Costo actualizado correctamente",
            envioId: id,
            costoAnterior: envio.costoTotal,
            costoNuevo: Number(costoTotal)
        });

    } catch (error) {
        console.error("Error al actualizar costo:", error);

        return res.status(500).json({
            mensaje: "No se pudo actualizar el costo"
        });
    }
};


//creamos el rastreo del envio

export const createRastreoEnvio = async (req: Request, res: Response) => {
    const envioId = Number(req.params.id);

    const {
        ubicacionActual,
        estadoEvento,
        observaciones
    } = req.body;

    if (
        !Number.isInteger(envioId) ||
        envioId <= 0 ||
        !ubicacionActual ||
        !estadoEvento
    ) {
        return res.status(400).json({
            mensaje: "Datos del rastreo invalidos"
        });
    }

    try {
        const envio = await envioRepository.findOneBy({
            envioId
        });

        if (!envio) {
            return res.status(404).json({
                mensaje: "Envio no encontrado"
            });
        }

        const rastreoRepository =
            AppDataSource.getRepository(HistorialRastreo);

        const rastreo = rastreoRepository.create({
            envioId,
            ubicacionActual,
            estadoEvento,
            observaciones
        });

        const rastreoGuardado =
            await rastreoRepository.save(rastreo);

        return res.status(201).json({
            mensaje: "Rastreo registrado correctamente",
            rastreo: rastreoGuardado
        });

    } catch (error) {
        console.error("Error al registrar rastreo:", error);

        return res.status(500).json({
            mensaje: "No se pudo registrar el rastreo"
        });
    }
};

