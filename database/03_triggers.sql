
USE logiexpress_db;

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
