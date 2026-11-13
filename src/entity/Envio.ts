
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    JoinColumn
} from "typeorm";

import { Cliente } from "./Cliente.js";
import { Direccion } from "./Direccion.js";
import { Paquete } from "./Paquete.js";
import { HistorialRastreo } from "./HistorialRastreo.js";
import { AuditoriaEnvio } from "./AuditoriaEnvio.js";

@Entity("envios")
export class Envio {

    @PrimaryGeneratedColumn({ name: "envio_id" })
    envioId!: number;

    @Column({ name: "remitente_id", type: "int" })
    remitenteId!: number;

    @Column({ name: "destinatario_id", type: "int" })
    destinatarioId!: number;

    @Column({ name: "direccion_origen_id", type: "int" })
    direccionOrigenId!: number;

    @Column({ name: "direccion_destino_id", type: "int" })
    direccionDestinoId!: number;

    @Column({ name: "costo_total", type: "decimal", precision: 12, scale: 2 })
    costoTotal!: number;

    @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
    fecha!: Date;

    @Column({
        type: "enum",
        enum: ["REGISTRADO", "EN_TRANSITO", "ENTREGADO", "CANCELADO"],
        default: "REGISTRADO"
    })
    estado!: string;

    @ManyToOne(() => Cliente, (cliente) => cliente.enviosEnviados)
    @JoinColumn({ name: "remitente_id" })
    remitente!: Cliente;

    @ManyToOne(() => Cliente, (cliente) => cliente.enviosRecibidos)
    @JoinColumn({ name: "destinatario_id" })
    destinatario!: Cliente;

    @ManyToOne(() => Direccion, (direccion) => direccion.enviosOrigen)
    @JoinColumn({ name: "direccion_origen_id" })
    direccionOrigen!: Direccion;

    @ManyToOne(() => Direccion, (direccion) => direccion.enviosDestino)
    @JoinColumn({ name: "direccion_destino_id" })
    direccionDestino!: Direccion;

    @OneToMany(() => Paquete, (paquete) => paquete.envio)
    paquetes!: Paquete[];

    @OneToMany(() => HistorialRastreo, (rastreo) => rastreo.envio)
    historialRastreo!: HistorialRastreo[];

    @OneToMany(() => AuditoriaEnvio, (auditoria) => auditoria.envio)
    auditorias!: AuditoriaEnvio[];
}
