import {ApiProperty} from "@nestjs/swagger";

export class PaginatedMetadata {
    @ApiProperty({ description: "Number of total records."})
    itemsCount: number;

    @ApiProperty({description: "Number of records per page"})
    itemsPerPage: number;

    @ApiProperty()
    currentPage: number;

    @ApiProperty()
    totalPages: number;
}

export class PaginatedDto<TQuery, TData> {
    @ApiProperty({type: () => PaginatedMetadata})
    metadata: PaginatedMetadata;

    @ApiProperty()
    query: TQuery;

    @ApiProperty()
    results: TData[];
}
