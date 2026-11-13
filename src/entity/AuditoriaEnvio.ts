
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Envio } from "./Envio.js";

@Entity("auditoria_envios")
export class AuditoriaEnvio {

    @PrimaryGeneratedColumn({ name: "auditoria_id" })
    auditoriaId!: number;

    @Column({ name: "envio_id", type: "int" })
    envioId!: number;

    @Column({ name: "costo_anterior", type: "decimal", precision: 12, scale: 2 })
    costoAnterior!: number;

    @Column({ name: "costo_nuevo", type: "decimal", precision: 12, scale: 2 })
    costoNuevo!: number;

    @Column({ type: "varchar", length: 100 })
    usuario!: string;

    @Column({
        name: "fecha_modificacion",
        type: "datetime",
        default: () => "CURRENT_TIMESTAMP"
    })
    fechaModificacion!: Date;

    @ManyToOne(() => Envio, (envio) => envio.auditorias)
    @JoinColumn({ name: "envio_id" })
    envio!: Envio;
}
