
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Paquete } from "./Paquete.js";

@Entity("almacenes")
export class Almacen {

    @PrimaryGeneratedColumn({ name: "almacen_id" })
    almacenId!: number;

    @Column({ type: "varchar", length: 100 })
    nombre!: string;

    @Column({ type: "varchar", length: 200 })
    ubicacion!: string;

    @Column({ name: "capacidad_maxima", type: "int" })
    capacidadMaxima!: number;

    @OneToMany(() => Paquete, (paquete) => paquete.almacen)
    paquetes!: Paquete[];
}
