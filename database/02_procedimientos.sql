
USE logiexpress_db;

DELIMITER $$

CREATE PROCEDURE sp_reporte_mensual_cliente(
    IN p_cliente_id INT,
    IN p_mes INT,
    IN p_anio INT
)
BEGIN
    SELECT
        COUNT(*) AS total_envios,
        COALESCE(SUM(e.costo_total), 0) AS total_facturado,
        SUM(CASE WHEN e.estado = 'ENTREGADO' THEN 1 ELSE 0 END) AS envios_entregados,
        AVG(
            CASE
                WHEN e.estado = 'ENTREGADO' THEN
                    TIMESTAMPDIFF(
                        HOUR,
                        e.fecha,
                        (
                            SELECT MIN(h.fecha)
                            FROM historial_rastreo h
                            WHERE h.envio_id = e.envio_id
                              AND h.estado_evento = 'ENTREGADO'
                        )
                    )
                ELSE NULL
            END
        ) AS promedio_horas_entrega
    FROM envios e
    WHERE e.remitente_id = p_cliente_id
      AND MONTH(e.fecha) = p_mes
      AND YEAR(e.fecha) = p_anio;
END $$

CREATE PROCEDURE sp_obtener_hoja_ruta_envio(
    IN p_envio_id INT
)
BEGIN
    SELECT
        e.envio_id,
        e.fecha,
        e.estado,
        r.nombre AS remitente,
        d.nombre AS destinatario,
        p.paquete_id,
        p.peso,
        p.contenido,
        a.nombre AS almacen
    FROM envios e
    INNER JOIN clientes r
        ON e.remitente_id = r.cliente_id
    INNER JOIN clientes d
        ON e.destinatario_id = d.cliente_id
    LEFT JOIN paquetes p
        ON e.envio_id = p.envio_id
    LEFT JOIN almacenes a
        ON p.almacen_id = a.almacen_id
    WHERE e.envio_id = p_envio_id;

    SELECT
        rastreo_id,
        fecha,
        ubicacion_actual,
        estado_evento,
        observaciones
    FROM historial_rastreo
    WHERE envio_id = p_envio_id
    ORDER BY fecha ASC, rastreo_id ASC;
END $$

DELIMITER ;
