import {BaseEntity, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity("mah")
export class Mah extends BaseEntity {

    @PrimaryGeneratedColumn("uuid")
    mahid: string;
}