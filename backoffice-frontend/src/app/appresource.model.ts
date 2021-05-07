import { Locale } from './acdc/locale.model';

export interface AppResource {

    id: number;

    key: string;

    locale?: Locale;

    value: string;

    help: string;
}
