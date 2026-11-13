
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { Cliente } from "./Cliente.js";
import { Envio } from "./Envio.js";

@Entity("direcciones")
export class Direccion {

    @PrimaryGeneratedColumn({ name: "direccion_id" })
    direccionId!: number;

    @Column({ name: "cliente_id", type: "int" })
    clienteId!: number;

    @Column({ type: "varchar", length: 150 })
    calle!: string;

    @Column({ type: "varchar", length: 100 })
    ciudad!: string;

    @Column({ type: "varchar", length: 100 })
    estado!: string;

    @Column({ name: "codigo_postal", type: "varchar", length: 10 })
    codigoPostal!: string;

    @ManyToOne(() => Cliente, (cliente) => cliente.direcciones)
    @JoinColumn({ name: "cliente_id" })
    cliente!: Cliente;

    @OneToMany(() => Envio, (envio) => envio.direccionOrigen)
    enviosOrigen!: Envio[];

    @OneToMany(() => Envio, (envio) => envio.direccionDestino)
    enviosDestino!: Envio[];
}
