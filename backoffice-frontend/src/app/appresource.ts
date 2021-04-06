import { Locale } from './locale';

export interface AppResource {

    id: number;

    key: string;

    locale?: Locale;

    value: string;

    help: string;
}
