
import "dotenv/config";
import app from "./app.js";
import { AppDataSource } from "./config/data-source.js";

const PORT = process.env.PORT || 3000;

AppDataSource.initialize()
    .then(() => {
        console.log(`¡Conexión exitosa a la base de datos ${AppDataSource.options.database}!`);

        app.listen(PORT, () => {
            console.log(`Servidor corriendo en http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Error al conectar con la base de datos:", error);
    });
