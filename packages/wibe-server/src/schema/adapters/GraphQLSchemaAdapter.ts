import {
	nonNull,
	objectType,
	extendType,
	arg,
	inputObjectType,
	list,
} from 'nexus'
import { Schema } from '../Schema'
import { SchemaFields } from '../interface'
import { getWhereInputFromType } from '../../graphql'
import {
	AllNexusOutputTypeDefs,
	NexusMetaType,
	NexusObjectTypeDef,
} from 'nexus/dist/core'
import { NexusGenObjects } from '../../../generated/nexus-typegen'
import { NexusGenScalars } from '../../../generated/nexusTypegen'

export class GraphQLSchemaAdapter {
	private schema: Schema[]

	constructor(schema: Schema[]) {
		this.schema = schema
	}

	private getTypesFromFields({
		fields,
		fieldsKeys,
		t,
	}: {
		fields: SchemaFields
		fieldsKeys: string[]
		t: any
	}) {
		return fieldsKeys.map((fieldName) => {
			const typeField = fields[fieldName]

			if (typeField.type === 'array')
				return t.list.field(fieldName, {
					type: typeField.valueType,
				})

			return t.field(fieldName, {
				type: typeField.required
					? nonNull(typeField.type)
					: typeField.type,
			})
		})
	}

	createSchema() {
		if (!this.schema) throw new Error('Schema not found')

		const arrayOfType = this.schema
			.map((schema) => {
				const fields = schema.getFields()
				const name = schema.getName().replace(' ', '')
				const nameWithFirstLetterUpperCase = `${name[0].toUpperCase()}${name.slice(
					1,
				)}`

				const fieldsKeys = Object.keys(fields)

				const object = objectType({
					name: nameWithFirstLetterUpperCase,
					definition: (t) => {
						this.getTypesFromFields({ fields, fieldsKeys, t })
					},
				})

				const query = extendType({
					type: 'Query',
					definition: (t) => {
						t.field(name, {
							type: nameWithFirstLetterUpperCase,
							args: { id: nonNull('String') },
							resolve: (root, args) => {},
						})

						t.list.field(`${name}s`, {
							type: nameWithFirstLetterUpperCase,
							resolve: (root, args) => {},
						})
					},
				})

				const typeInput = inputObjectType({
					name: `${nameWithFirstLetterUpperCase}Input`,
					definition: (t) => {
						this.getTypesFromFields({ fields, fieldsKeys, t })
					},
				})

				const typeUpdateInput = inputObjectType({
					name: `Update${nameWithFirstLetterUpperCase}Input`,
					definition: (t) => {
						t.nonNull.id('id')
						t.field('fields', { type: typeInput })
					},
				})

				const typeUpdatesInput = inputObjectType({
					name: `Update${nameWithFirstLetterUpperCase}sInput`,
					definition: (t) => {
						fieldsKeys.map((fieldName) => {
							t.field(fieldName, {
								type: getWhereInputFromType({
									typeField: schema.getFields()[fieldName],
									name: `${fieldName[0].toUpperCase()}${fieldName.slice(
										1,
									)}`,
								}),
							})
						})
					},
				})

				const typeDeleteInput = inputObjectType({
					name: `Delete${nameWithFirstLetterUpperCase}Input`,
					definition: (t) => {
						t.nonNull.id('id')
					},
				})

				const mutations = extendType({
					type: 'Mutation',
					definition: (t) => {
						t.field(`create${nameWithFirstLetterUpperCase}`, {
							type: nameWithFirstLetterUpperCase,
							args: { input: typeInput },
							resolve: (root, args) => {},
						})

						t.field(`create${nameWithFirstLetterUpperCase}s`, {
							type: nonNull(list(nameWithFirstLetterUpperCase)),
							args: { input: typeInput },
							resolve: (root, args) => {},
						})

						t.field(`update${nameWithFirstLetterUpperCase}`, {
							type: nameWithFirstLetterUpperCase,
							args: {
								input: typeUpdateInput,
							},
							resolve: (root, args) => {},
						})

						t.list.field(`update${nameWithFirstLetterUpperCase}s`, {
							type: nameWithFirstLetterUpperCase,
							args: {
								where: typeUpdatesInput,
							},
							resolve: (root, args) => {},
						})

						t.field(`delete${nameWithFirstLetterUpperCase}`, {
							type: nameWithFirstLetterUpperCase,
							args: { typeDeleteInput },
							resolve: (root, args) => {},
						})
					},
				})

				return [object, query, mutations]
			})
			.flat()

		return arrayOfType
	}
}
