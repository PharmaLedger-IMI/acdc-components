import {ApiProperty} from "@nestjs/swagger";

export class PaginatedMetadata {
    itemsCount: number;
    itemsPerPage: number;
    currentPage: number;
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
