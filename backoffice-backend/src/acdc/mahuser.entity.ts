import {BaseEntity, Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity("mahuser")
export class MahUser extends BaseEntity {

    @PrimaryGeneratedColumn("uuid")
    mahUserId: string;

    @Column()
    mahId: string;

    @Column()
    userId: string;
}