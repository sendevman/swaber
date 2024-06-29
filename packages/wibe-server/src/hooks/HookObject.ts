import type { OperationType, TypedNewData } from '.'
import type { WibeSchemaTypes } from '../generated/wibe'
import type { Context } from '../graphql/interface'

export class HookObject<T extends keyof WibeSchemaTypes> {
	public className: T
	private newData: TypedNewData<T>
	private operationType: OperationType
	public context: Context
	public object: Record<keyof WibeSchemaTypes[T], any>

	constructor({
		newData,
		className,
		operationType,
		context,
		object,
	}: {
		className: T
		newData: TypedNewData<T>
		operationType: OperationType
		context: Context
		object: Record<keyof WibeSchemaTypes[T], any>
	}) {
		this.newData = newData
		this.className = className
		this.operationType = operationType
		this.context = context
		this.object = object
	}

	getUser() {
		return this.context.user
	}

	isFieldUpdate(field: keyof WibeSchemaTypes[T]) {
		return this.newData && !!this.newData[field]
	}

	upsertNewData(field: keyof WibeSchemaTypes[T], value: any) {
		if (!this.newData) return

		if (!this.operationType.includes('before'))
			throw new Error(
				'Cannot set data in a hook that is not a before hook',
			)

		this.newData[field] = value
	}

	getNewData(): Record<keyof WibeSchemaTypes[T], any> {
		return this.newData || ({} as any)
	}
}
