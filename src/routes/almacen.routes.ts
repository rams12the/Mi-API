
import { Router } from "express";
import { createPaqueteAlmacen } from "../controllers/almacen.controller.js";

const router = Router();

router.post("/:id/paquetes", createPaqueteAlmacen);

export default router;
