import {BaseEntity, Column, Entity, PrimaryGeneratedColumn} from "typeorm";
import {ApiProperty} from "@nestjs/swagger";

@Entity("acdcuser")
export class AcdcUser extends BaseEntity {

    @PrimaryGeneratedColumn("uuid")
    userid: string;

    @Column()
    @ApiProperty({description: "Email user, access right will depend to which entities is the user associated"})
    email: string;

    @Column()
    @ApiProperty({description: "Hashed user password"})
    passhash: string;
}