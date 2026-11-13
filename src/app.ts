
import express from "express";
import envioRoutes from "./routes/envio.routes.js";
import almacenRoutes from "./routes/almacen.routes.js";
import clienteRoutes from "./routes/cliente.routes.js";

const app = express();

app.use(express.json());

app.get("/api/status", (req, res) => {
    res.json({ mensaje: "API funcionando correctamente" });
});

app.use("/api/envios", envioRoutes);
app.use("/api/almacenes", almacenRoutes);
app.use("/api/clientes", clienteRoutes);

export default app;
