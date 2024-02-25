import { Context } from '../graphql/interface'
import { WibeApp } from '../server'
import { HookObject } from './HookObject'

export const defaultBeforeInsertForCreatedAt = async (
	object: HookObject<any>,
) => {
	object.set({ field: 'createdAt', value: new Date() })
	object.set({ field: 'updatedAt', value: new Date() })
}

export const defaultBeforeUpdateForUpdatedAt = async (
	object: HookObject<any>,
) => {
	object.set({ field: 'updatedAt', value: new Date() })
}

export const defaultBeforeInsertForDefaultValue = async (
	object: HookObject<any>,
) => {
	const schemaClass = WibeApp.config.schema.class.find(
		(schema) => schema.name === object.className,
	)

	if (!schemaClass) throw new Error('Class not found in schema')

	const allFields = Object.keys(schemaClass.fields)

	allFields.map((field) => {
		if (
			!object.get(field) &&
			// @ts-expect-error
			schemaClass?.fields[field].defaultValue !== undefined
		)
			object.set({
				field,
				// @ts-expect-error
				value: schemaClass?.fields[field].defaultValue,
			})
	})
}
