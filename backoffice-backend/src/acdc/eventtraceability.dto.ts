import { ApiProperty } from "@nestjs/swagger";

export class EventTraceability {

    constructor(available: boolean, message: string, response?: any) {
        this.available = available;
        this.message = message;
        this.response = response;
        this.updatedOn = (new Date()).toISOString();
    }

    @ApiProperty({
        description: "true if extra Finish Goods Traceability information might be available for this event!"
    })
    readonly available: boolean;

    @ApiProperty({
        description: "Additional explanations about the possible availability Finish Goods Traceability!"
    })
    readonly message: string;

    @ApiProperty({
        description: "Response from the FGT /traceability/create operation. See API documentation for response schema."
    })
    readonly response: any;

    @ApiProperty({
        description: "Timestamp when this traceability information was generated."
    })
    readonly  updatedOn: string;
}
