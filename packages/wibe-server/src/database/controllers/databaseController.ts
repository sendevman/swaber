import { WibeSchemaTypes } from '../../../generated/wibe'
import { HookTrigger } from '../../hooks'
import { HookObject } from '../../hooks/HookObject'
import { WibeApp } from '../../server'
import {
    CreateObjectOptions,
    CreateObjectsOptions,
    DatabaseAdapter,
    DeleteObjectOptions,
    DeleteObjectsOptions,
    GetObjectOptions,
    GetObjectsOptions,
    UpdateObjectOptions,
    UpdateObjectsOptions,
} from '../adapters/adaptersInterface'

export const _findHooksByPriority = async <T extends keyof WibeSchemaTypes>({
    className,
    hookTrigger,
    priority,
}: {
    hookTrigger: HookTrigger
    className: T
    priority: number
}) =>
    WibeApp.config.hooks?.filter(
        (hook) =>
            hook.trigger === hookTrigger &&
            hook.priority === priority &&
            (className === hook.className || !hook.className),
    ) || []

export const _findHooksAndExecute = async <
    T extends keyof WibeSchemaTypes,
    K extends keyof WibeSchemaTypes[T],
>({
    className,
    data,
    hookTrigger,
}: {
    hookTrigger: HookTrigger
    className: T
    data: Record<K, WibeSchemaTypes[T][K]>
}) => {
    const hookObject = new HookObject({
        className,
        data,
    })

    const listOfPriorities =
        WibeApp.config.hooks
            ?.reduce((acc, hook) => {
                if (!acc.includes(hook.priority)) acc.push(hook.priority)

                return acc
            }, [] as number[])
            .sort((a, b) => a - b) || []

    // We need reduce here to keep the order of the hooks
    // Priority 0, then 1 etc...
    await listOfPriorities.reduce(async (_, priority) => {
        const hooksToCompute = await _findHooksByPriority({
            className,
            hookTrigger,
            priority,
        })

        await Promise.all(
            hooksToCompute.map((hook) => hook.callback(hookObject)),
        )
    }, Promise.resolve())

    return hookObject.getData()
}

export class DatabaseController {
    public adapter: DatabaseAdapter

    constructor(adapter: DatabaseAdapter) {
        this.adapter = adapter
    }

    async connect() {
        return this.adapter.connect()
    }

    async close() {
        return this.adapter.close()
    }

    async createClass(className: string) {
        return this.adapter.createClass(className)
    }

    async getObject<
        T extends keyof WibeSchemaTypes,
        K extends keyof WibeSchemaTypes[T],
    >(params: GetObjectOptions<T, K>) {
        return this.adapter.getObject(params)
    }

    async getObjects<
        T extends keyof WibeSchemaTypes,
        K extends keyof WibeSchemaTypes[T],
    >(params: GetObjectsOptions<T, K>) {
        return this.adapter.getObjects(params)
    }

    async createObject<
        T extends keyof WibeSchemaTypes,
        K extends keyof WibeSchemaTypes[T],
    >(params: CreateObjectOptions<T, K>) {
        const hookObjectData = await _findHooksAndExecute({
            hookTrigger: HookTrigger.BeforeInsert,
            className: params.className,
            data: params.data,
        })

        const insertedObject = await this.adapter.createObject({
            ...params,
            data: hookObjectData,
        })

        await _findHooksAndExecute({
            hookTrigger: HookTrigger.AfterInsert,
            className: params.className,
            data: hookObjectData,
        })

        return insertedObject
    }

    async createObjects<
        T extends keyof WibeSchemaTypes,
        K extends keyof WibeSchemaTypes[T],
    >(params: CreateObjectsOptions<T, K>) {
        return this.adapter.createObjects(params)
    }

    async updateObject<
        T extends keyof WibeSchemaTypes,
        K extends keyof WibeSchemaTypes[T],
    >(params: UpdateObjectOptions<T, K>) {
        const hookObjectData = await _findHooksAndExecute({
            hookTrigger: HookTrigger.BeforeUpdate,
            className: params.className,
            data: params.data,
        })

        const updatedObject = await this.adapter.updateObject(params)

        await _findHooksAndExecute({
            hookTrigger: HookTrigger.AfterUpdate,
            className: params.className,
            data: hookObjectData,
        })

        return updatedObject
    }

    async updateObjects<
        T extends keyof WibeSchemaTypes,
        K extends keyof WibeSchemaTypes[T],
    >(params: UpdateObjectsOptions<T, K>) {
        return this.adapter.updateObjects(params)
    }

    async deleteObject<
        T extends keyof WibeSchemaTypes,
        K extends keyof WibeSchemaTypes[T],
    >(params: DeleteObjectOptions<T, K>) {
        const hookObjectData = await _findHooksAndExecute({
            hookTrigger: HookTrigger.BeforeDelete,
            className: params.className,
            data: {},
        })

        const deletedObject = await this.adapter.deleteObject(params)

        await _findHooksAndExecute({
            hookTrigger: HookTrigger.AfterDelete,
            className: params.className,
            data: hookObjectData,
        })

        return deletedObject
    }

    async deleteObjects<
        T extends keyof WibeSchemaTypes,
        K extends keyof WibeSchemaTypes[T],
    >(params: DeleteObjectsOptions<T, K>) {
        return this.adapter.deleteObjects(params)
    }
}
