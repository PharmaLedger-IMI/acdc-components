import { Locale } from './locale.model';

export interface AppResource {

    id: number;

    key: string;

    locale?: Locale;

    value: string;

    help: string;
}
