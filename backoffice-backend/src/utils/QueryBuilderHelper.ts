export class QueryBuilderHelper {
    sqlOperators = {
        // Equal
        EQL(value: string): string {
            return `= '${value.trim()}'`
        },
        // More Than or Equal
        MTE(value: string): string {
            return `>= '${value.trim()}'`
        },
        // Less Than or Equal
        LTE(value: string): string {
            return `<= '${value.trim()}'`
        },
        // In
        IN(values: string[]): string {
            values = Array.isArray(values) ? values : [values]
            const commaList = values.map(value => `'${value.trim()}'`).join(',')
            return `IN (${commaList})`
        }
    }

    commonWhereStatement(dbColumn: string, operator: Operators, values: string[] | string) {
        const operation = this.sqlOperators[Operators[`${operator}`]]
        return `${dbColumn} ${operation(values)}`
    }

    jsonWhereStatement(dbColumn: string, jsonProperty: string, operator: Operators, values: string[] | string): string {
        const operation = this.sqlOperators[Operators[`${operator}`]]
        return `${dbColumn} ->> '${jsonProperty}' ${operation(values)}`
    }

    deepJsonWhereStatement(dbColumn: string, jsonPropertyTree: string[], operator: Operators, values: string[] | string): string {
        const operation = this.sqlOperators[`${operator}`]
        const jsonTreeStatement = this.buildJsonTreeStatement(jsonPropertyTree)
        return `${dbColumn} ${jsonTreeStatement} ${operation(values)}`
    }

    private buildJsonTreeStatement(jsonPropertyTree: string[]): string {
        const lastElement = jsonPropertyTree.length - 1
        if(lastElement == 0) {
            return `->> '${jsonPropertyTree[0]}'`
        } else {
            let statement = ''
            jsonPropertyTree.forEach((value, index, array) => {
                const condition = (index === lastElement) ? `->> '${value}'` : `-> '${value}'`
                statement += condition
            })
            return statement
        }
    }
}

export enum Operators {
    EQL = 'EQL',
    MTE = 'MTE',
    LTE = 'LTE',
    IN = 'IN',
}
