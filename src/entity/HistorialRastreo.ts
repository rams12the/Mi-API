
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Envio } from "./Envio.js";

@Entity("historial_rastreo")
export class HistorialRastreo {

    @PrimaryGeneratedColumn({ name: "rastreo_id" })
    rastreoId!: number;

    @Column({ name: "envio_id", type: "int" })
    envioId!: number;

    @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
    fecha!: Date;

    @Column({ name: "ubicacion_actual", type: "varchar", length: 200 })
    ubicacionActual!: string;

    @Column({
        name: "estado_evento",
        type: "enum",
        enum: ["REGISTRADO", "EN_TRANSITO", "ENTREGADO", "CANCELADO"]
    })
    estadoEvento!: string;

    @Column({ type: "varchar", length: 255, nullable: true })
    observaciones!: string | null;

    @ManyToOne(() => Envio, (envio) => envio.historialRastreo)
    @JoinColumn({ name: "envio_id" })
    envio!: Envio;
}
