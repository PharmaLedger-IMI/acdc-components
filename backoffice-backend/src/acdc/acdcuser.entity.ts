import {BaseEntity, Column, Entity, JoinColumn, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {MahUser} from "./mahuser.entity";

@Entity("acdcuser")
export class AcdcUser extends BaseEntity {

    @PrimaryGeneratedColumn("uuid")
    userid: string;

    @Column()
    email: string;
}