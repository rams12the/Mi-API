
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Envio } from "./Envio.js";
import { Almacen } from "./Almacen.js";

@Entity("paquetes")
export class Paquete {

    @PrimaryGeneratedColumn({ name: "paquete_id" })
    paqueteId!: number;

    @Column({ name: "envio_id", type: "int" })
    envioId!: number;

    @Column({ name: "almacen_id", type: "int" })
    almacenId!: number;

    @Column({ type: "decimal", precision: 10, scale: 2 })
    peso!: number;

    @Column({ type: "decimal", precision: 10, scale: 2 })
    largo!: number;

    @Column({ type: "decimal", precision: 10, scale: 2 })
    ancho!: number;

    @Column({ type: "decimal", precision: 10, scale: 2 })
    alto!: number;

    @Column({ type: "varchar", length: 255, nullable: true })
    contenido!: string | null;

    @ManyToOne(() => Envio, (envio) => envio.paquetes)
    @JoinColumn({ name: "envio_id" })
    envio!: Envio;

    @ManyToOne(() => Almacen, (almacen) => almacen.paquetes)
    @JoinColumn({ name: "almacen_id" })
    almacen!: Almacen;
}
