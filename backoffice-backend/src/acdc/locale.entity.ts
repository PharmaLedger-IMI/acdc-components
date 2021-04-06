import {Entity, PrimaryColumn, Column, BaseEntity} from "typeorm";

@Entity()
export class Locale extends BaseEntity {

    @PrimaryColumn()
    code: string;

    @Column()
    description: string
}
