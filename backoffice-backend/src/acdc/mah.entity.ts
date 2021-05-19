import {BaseEntity, Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity("mah")
export class Mah extends BaseEntity {

    @PrimaryGeneratedColumn("uuid", {name: "mahid"})
    mahId: string;

    @Column()
    name: string;
}