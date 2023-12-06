export type ArrayValueType = 'String' | 'Int' | 'Float' | 'Boolean'

export enum WibeSchemaType {
	String = 'String',
	Int = 'Int',
	Float = 'Float',
	Boolean = 'Boolean',
	Date = 'Date',
}

type TypeFieldBase<T, K extends WibeSchemaType> = {
	type: K
	required?: boolean
	defaultValue?: T
}

export type TypeField =
	| TypeFieldBase<string, WibeSchemaType.String>
	| TypeFieldBase<number, WibeSchemaType.Int>
	| TypeFieldBase<number, WibeSchemaType.Float>
	| TypeFieldBase<boolean, WibeSchemaType.Boolean>
	| TypeFieldBase<Date, WibeSchemaType.Date>

export type SchemaFields = Record<string, TypeField>

export interface SchemaInterface {
	name: string
	fields: SchemaFields
}

const wibeTypToTypeScriptType: Record<WibeSchemaType, string> = {
	[WibeSchemaType.String]: 'string',
	[WibeSchemaType.Int]: 'number',
	[WibeSchemaType.Float]: 'number',
	[WibeSchemaType.Boolean]: 'boolean',
	[WibeSchemaType.Date]: 'Date',
}

export class Schema {
	public schema: SchemaInterface[]

	constructor(schema: SchemaInterface[]) {
		this.schema = schema
	}

	getTypesFromSchema() {
		const wibeTypes = this.schema.map((schema) => {
			const fields = Object.keys(schema.fields)

			const firstTypeScriptType =
				wibeTypToTypeScriptType[schema.fields[fields[0]].type]

			if (!firstTypeScriptType)
				throw new Error(
					`Invalid type: ${schema.fields[fields[0]].type}`,
				)

			const res = fields.reduce(
				(prev, current) => {
					const WibeSchemaType = schema.fields[current].type
					const typeScriptType =
						wibeTypToTypeScriptType[WibeSchemaType]

					if (!typeScriptType)
						throw new Error(`Invalid type: ${WibeSchemaType}`)

					return {
						...prev,
						[current]: wibeTypToTypeScriptType[WibeSchemaType],
					}
				},
				{
					[fields[0]]: firstTypeScriptType,
				},
			)

			const type = `export type ${schema.name} = ${JSON.stringify(
				res,
				null,
				2,
			)}`

			return type.replaceAll('"', '')
		})

		const allNames = this.schema.map((schema) => schema.name)
		const globalWibeType = allNames.reduce(
			(prev, current) => {
				return { ...prev, [current]: current }
			},
			{ [allNames[0]]: allNames[0] },
		)

		const globalWibeTypeString = `export type WibeTypes = ${JSON.stringify(
			globalWibeType,
			null,
			2,
		)}`

		return [...wibeTypes, globalWibeTypeString.replaceAll('"', '')].join(
			'\n',
		)
	}
}
