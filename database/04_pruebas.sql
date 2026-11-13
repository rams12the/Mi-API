
USE logiexpress_db;

-- Consultar todas las tablas
SHOW TABLES;

-- Consultar procedimientos
SHOW PROCEDURE STATUS
WHERE Db = 'logiexpress_db';

-- Consultar triggers
SHOW TRIGGERS FROM logiexpress_db;

-- Consultar envios
SELECT * FROM envios;

-- Consultar paquetes
SELECT * FROM paquetes;

-- Consultar historial de rastreo
SELECT * FROM historial_rastreo;

-- Consultar auditoria de costos
SELECT * FROM auditoria_envios;

-- Consultar capacidad de almacenes
SELECT
    a.almacen_id,
    a.nombre,
    a.capacidad_maxima,
    COUNT(p.paquete_id) AS paquetes_actuales
FROM almacenes a
LEFT JOIN paquetes p
    ON a.almacen_id = p.almacen_id
GROUP BY a.almacen_id, a.nombre, a.capacidad_maxima;

-- Probar reporte mensual
CALL sp_reporte_mensual_cliente(1, 11, 2026);

-- Probar hoja de ruta
CALL sp_obtener_hoja_ruta_envio(4);
