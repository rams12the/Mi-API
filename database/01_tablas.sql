
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

CREATE TABLE IF NOT EXISTS almacenes (
    almacen_id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    ubicacion VARCHAR(200) NOT NULL,
    capacidad_maxima INT NOT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS envios (
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
        FOREIGN KEY (remitente_id) REFERENCES clientes(cliente_id),

    CONSTRAINT fk_envios_destinatario
        FOREIGN KEY (destinatario_id) REFERENCES clientes(cliente_id),

    CONSTRAINT fk_envios_origen
        FOREIGN KEY (direccion_origen_id) REFERENCES direcciones(direccion_id),

    CONSTRAINT fk_envios_destino
        FOREIGN KEY (direccion_destino_id) REFERENCES direcciones(direccion_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS paquetes (
    paquete_id INT AUTO_INCREMENT PRIMARY KEY,
    envio_id INT NOT NULL,
    almacen_id INT NOT NULL,
    peso DECIMAL(10,2) NOT NULL,
    largo DECIMAL(10,2) NOT NULL,
    ancho DECIMAL(10,2) NOT NULL,
    alto DECIMAL(10,2) NOT NULL,
    contenido VARCHAR(255),

    CONSTRAINT fk_paquetes_envios
        FOREIGN KEY (envio_id) REFERENCES envios(envio_id),

    CONSTRAINT fk_paquetes_almacenes
        FOREIGN KEY (almacen_id) REFERENCES almacenes(almacen_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS historial_rastreo (
    rastreo_id INT AUTO_INCREMENT PRIMARY KEY,
    envio_id INT NOT NULL,
    fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ubicacion_actual VARCHAR(200) NOT NULL,
    estado_evento ENUM('REGISTRADO', 'EN_TRANSITO', 'ENTREGADO', 'CANCELADO') NOT NULL,
    observaciones VARCHAR(255),

    CONSTRAINT fk_historial_envios
        FOREIGN KEY (envio_id) REFERENCES envios(envio_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS auditoria_envios (
    auditoria_id INT AUTO_INCREMENT PRIMARY KEY,
    envio_id INT NOT NULL,
    costo_anterior DECIMAL(12,2) NOT NULL,
    costo_nuevo DECIMAL(12,2) NOT NULL,
    usuario VARCHAR(100) NOT NULL,
    fecha_modificacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_auditoria_envios
        FOREIGN KEY (envio_id) REFERENCES envios(envio_id)
) ENGINE=InnoDB;
