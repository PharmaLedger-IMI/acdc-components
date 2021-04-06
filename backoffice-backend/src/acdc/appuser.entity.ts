import {Entity, PrimaryGeneratedColumn, Column, JoinColumn, BaseEntity, ManyToOne} from "typeorm";
import { ApiProperty } from '@nestjs/swagger';

@Entity("appuser")
export class AppUser extends BaseEntity {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ApiProperty()
    @Column()
    username: string;

    @ApiProperty()
    @Column({name: "passhash"})
    passHash: string;
}
