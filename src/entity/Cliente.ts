
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Direccion } from "./Direccion.js";
import { Envio } from "./Envio.js";

@Entity("clientes")
export class Cliente {

    @PrimaryGeneratedColumn({ name: "cliente_id" })
    clienteId!: number;

    @Column({ type: "varchar", length: 100 })
    nombre!: string;

    @Column({ type: "varchar", length: 150, unique: true })
    email!: string;

    @Column({ type: "varchar", length: 20, nullable: true })
    telefono!: string | null;

    @Column({
        type: "enum",
        enum: ["ACTIVO", "INACTIVO"],
        default: "ACTIVO"
    })
    estado!: string;

    @Column({ type: "decimal", precision: 12, scale: 2, default: 0 })
    limiteCredito!: number;

    @OneToMany(() => Direccion, (direccion) => direccion.cliente)
    direcciones!: Direccion[];

    @OneToMany(() => Envio, (envio) => envio.remitente)
    enviosEnviados!: Envio[];

    @OneToMany(() => Envio, (envio) => envio.destinatario)
    enviosRecibidos!: Envio[];
}
