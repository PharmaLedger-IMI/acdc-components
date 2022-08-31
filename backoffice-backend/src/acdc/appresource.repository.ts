
import { EntityRepository, Repository } from 'typeorm';
import { AppResource } from './appresource.entity';

@EntityRepository(AppResource)
export class AppResourceRepository extends Repository<AppResource>  {
    constructor(
    ) {
        super();
    }

    /**
     * Find a config AppResourceEntity by key.
     * @param arcKey string with key - must exist within AppResource.key with locale=null
     * @returns AppResourceEntity
     */
    async findConfig(arcKey: string): Promise<AppResource> {
        const arcCollection = await AppResource.find({
            where: [
                { key: arcKey, locale: null }
            ], order: { id: "DESC" }
        });
        if (!arcCollection || arcCollection.length == 0) {
            throw ("No AppResource.key="+arcKey+",locale=null");
        }
        return arcCollection[0];
    }


    /**
     * Find a config AppResourceEntity by key.
     * @param arcKey 
     * @returns the object decoded from the JSON.parse(arc.value)
     */
    async findConfigObject(arcKey: string): Promise<any> {
        const arc = await this.findConfig(arcKey);
        return JSON.parse(arc.value);
    }


    /**
     * Find a config AppResourceEntity.value by key.
     * @param arcKey 
     * @returns the arc.value string
     */
     async findConfigString(arcKey: string): Promise<string> {
        const arc = await this.findConfig(arcKey);
        return arc.value;
    }

    /**
     * Update a value for a config AppResourceEntity by key.
     * @param arcKey 
     * @param arcValue
     */
    async updateConfigValue(arcKey: string, arcValue: string) {
        const arc = await this.findConfig(arcKey);
        arc.value = arcValue;
        AppResource.save(arc);
    }
};