import {ArgumentMetadata, BadRequestException, Injectable, PipeTransform} from "@nestjs/common";
import {plainToClass} from "class-transformer";
import {validate} from "class-validator";
import {EventInputDataDto} from "../acdc/eventinput.dto";

@Injectable()
export class ScanValidator implements PipeTransform<EventInputDataDto> {
    async transform(value: object, metadata: ArgumentMetadata): Promise<EventInputDataDto> {
        console.log('scan.validator.transform raw=', value)
        const scan = plainToClass(metadata.metatype, value)
        const errors = await validate(scan, {whitelist: true, transform: true})
        if (errors.length > 0) {
            const message = Object.values(errors[0].constraints).join(". ").trim()
            throw new BadRequestException(message)
        }
        console.log('scan.validator.transform return=', scan)
        return scan
    }
}
