
import { Router } from "express";
import {
    getAllEnvios,
    createEnvio,
    updateCostoEnvio,
    createRastreoEnvio
} from "../controllers/envio.controller.js";

const router = Router();

router.get("/", getAllEnvios);
router.post("/", createEnvio);
router.put("/:id/costo", updateCostoEnvio);
router.post("/:id/rastreo", createRastreoEnvio);

export default router;
