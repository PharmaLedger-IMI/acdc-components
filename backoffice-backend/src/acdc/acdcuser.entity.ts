import {BaseEntity, Column, Entity, PrimaryGeneratedColumn} from "typeorm";
import {ApiProperty} from "@nestjs/swagger";

@Entity("acdcuser")
export class AcdcUser extends BaseEntity {

    @PrimaryGeneratedColumn("uuid", {name: "userid"})
    userId: string;

    @Column()
    @ApiProperty({description: "Email user, access right will depend to which entities is the user associated"})
    email: string;

    @Column({name: "passhash"})
    @ApiProperty({description: "Hashed user password"})
    passHash: string;
}