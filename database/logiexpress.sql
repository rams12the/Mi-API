CREATE DATABASE IF NOT EXISTS logiexpress_db;

USE logiexpress_db;


CREATE TABLE IF NOT EXISTS clientes (
    cliente_id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    telefono VARCHAR(20),
    estado ENUM('ACTIVO', 'INACTIVO') NOT NULL DEFAULT 'ACTIVO',
    limite_credito DECIMAL(12,2) NOT NULL DEFAULT 0.00
) ENGINE=InnoDB;


CREATE TABLE IF NOT EXISTS direcciones (
    direccion_id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    calle VARCHAR(150) NOT NULL,
    ciudad VARCHAR(100) NOT NULL,
    estado VARCHAR(100) NOT NULL,
    codigo_postal VARCHAR(10) NOT NULL,

    CONSTRAINT fk_direcciones_clientes
        FOREIGN KEY (cliente_id)
        REFERENCES clientes(cliente_id)
) ENGINE=InnoDB;


CREATE TABLE IF NOT EXISTS logiexpress_db.almacenes (
    almacen_id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    ubicacion VARCHAR(200) NOT NULL,
    capacidad_maxima INT NOT NULL
) ENGINE=InnoDB;


CREATE TABLE IF NOT EXISTS logiexpress_db.envios (
    envio_id INT AUTO_INCREMENT PRIMARY KEY,
    remitente_id INT NOT NULL,
    destinatario_id INT NOT NULL,
    direccion_origen_id INT NOT NULL,
    direccion_destino_id INT NOT NULL,
    costo_total DECIMAL(12,2) NOT NULL,
    fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('REGISTRADO', 'EN_TRANSITO', 'ENTREGADO', 'CANCELADO')
        NOT NULL DEFAULT 'REGISTRADO',

    CONSTRAINT fk_envios_remitente
        FOREIGN KEY (remitente_id)
        REFERENCES logiexpress_db.clientes(cliente_id),

    CONSTRAINT fk_envios_destinatario
        FOREIGN KEY (destinatario_id)
        REFERENCES logiexpress_db.clientes(cliente_id),

    CONSTRAINT fk_envios_origen
        FOREIGN KEY (direccion_origen_id)
        REFERENCES logiexpress_db.direcciones(direccion_id),

    CONSTRAINT fk_envios_destino
        FOREIGN KEY (direccion_destino_id)
        REFERENCES logiexpress_db.direcciones(direccion_id)
) ENGINE=InnoDB;


CREATE TABLE IF NOT EXISTS logiexpress_db.paquetes (
    paquete_id INT AUTO_INCREMENT PRIMARY KEY,
    envio_id INT NOT NULL,
    almacen_id INT NOT NULL,
    peso DECIMAL(10,2) NOT NULL,
    largo DECIMAL(10,2) NOT NULL,
    ancho DECIMAL(10,2) NOT NULL,
    alto DECIMAL(10,2) NOT NULL,
    contenido VARCHAR(255),

    CONSTRAINT fk_paquetes_envios
        FOREIGN KEY (envio_id)
        REFERENCES logiexpress_db.envios(envio_id),

    CONSTRAINT fk_paquetes_almacenes
        FOREIGN KEY (almacen_id)
        REFERENCES logiexpress_db.almacenes(almacen_id)
) ENGINE=InnoDB;


CREATE TABLE IF NOT EXISTS logiexpress_db.historial_rastreo (
    rastreo_id INT AUTO_INCREMENT PRIMARY KEY,
    envio_id INT NOT NULL,
    fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ubicacion_actual VARCHAR(200) NOT NULL,
    estado_evento ENUM('REGISTRADO', 'EN_TRANSITO', 'ENTREGADO', 'CANCELADO') NOT NULL,
    observaciones VARCHAR(255),

    CONSTRAINT fk_historial_envios
        FOREIGN KEY (envio_id)
        REFERENCES logiexpress_db.envios(envio_id)
) ENGINE=InnoDB;


CREATE TABLE IF NOT EXISTS logiexpress_db.auditoria_envios (
    auditoria_id INT AUTO_INCREMENT PRIMARY KEY,
    envio_id INT NOT NULL,
    costo_anterior DECIMAL(12,2) NOT NULL,
    costo_nuevo DECIMAL(12,2) NOT NULL,
    usuario VARCHAR(100) NOT NULL,
    fecha_modificacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_auditoria_envios
        FOREIGN KEY (envio_id)
        REFERENCES logiexpress_db.envios(envio_id)
) ENGINE=InnoDB;



-- =========================================
-- PROCEDIMIENTOS ALMACENADOS
-- =========================================

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

DELIMITER ;



DELIMITER $$

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




-- =========================================
-- TRIGGERS
-- =========================================

DELIMITER $$

CREATE TRIGGER after_update_envio_costo
AFTER UPDATE ON envios
FOR EACH ROW
BEGIN
    IF OLD.costo_total <> NEW.costo_total THEN
        INSERT INTO auditoria_envios (
            envio_id,
            costo_anterior,
            costo_nuevo,
            usuario
        )
        VALUES (
            NEW.envio_id,
            OLD.costo_total,
            NEW.costo_total,
            USER()
        );
    END IF;
END $$

DELIMITER ;




DELIMITER $$

CREATE TRIGGER before_insert_paquete_almacen
BEFORE INSERT ON paquetes
FOR EACH ROW
BEGIN
    DECLARE cantidad_actual INT;
    DECLARE capacidad INT;

    SELECT capacidad_maxima
    INTO capacidad
    FROM almacenes
    WHERE almacen_id = NEW.almacen_id;

    SELECT COUNT(*)
    INTO cantidad_actual
    FROM paquetes
    WHERE almacen_id = NEW.almacen_id;

    IF cantidad_actual >= capacidad THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'El almacen ha alcanzado su capacidad maxima';
    END IF;
END $$

DELIMITER ;



DELIMITER $$

CREATE TRIGGER after_insert_historial_rastreo
AFTER INSERT ON historial_rastreo
FOR EACH ROW
BEGIN
    IF NEW.estado_evento = 'ENTREGADO' THEN
        UPDATE envios
        SET estado = 'ENTREGADO'
        WHERE envio_id = NEW.envio_id;
    END IF;
END $$

DELIMITER ;
