import {Entity, PrimaryGeneratedColumn, Column, JoinColumn, BaseEntity, ManyToOne} from "typeorm";
import {Locale} from "./locale.entity";

@Entity("appresource")
export class AppResource extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    key: string;

    @ManyToOne(() => Locale, { eager: true })
    @JoinColumn({ name: "locale", referencedColumnName: "code" })
    locale: Locale;

    @Column()
    value: string;

    @Column()
    help: string;
}
