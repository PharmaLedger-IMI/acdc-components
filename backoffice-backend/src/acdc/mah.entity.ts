import {BaseEntity, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity("mah")
export class Mah extends BaseEntity {

    @PrimaryGeneratedColumn("uuid", {name: "mahid"})
    mahId: string;

    name: string;
}