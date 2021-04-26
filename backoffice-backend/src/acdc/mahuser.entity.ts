import {BaseEntity, Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity("mahuser")
export class MahUser extends BaseEntity {

    @PrimaryGeneratedColumn("uuid")
    mahuserid: string;

    @Column()
    mahid: string;

    @Column()
    userid: string;
}