import {
	describe,
	expect,
	it,
	beforeAll,
	beforeEach,
	mock,
	spyOn,
} from 'bun:test'
import {
	_getPermissionPropertiesOfAClass,
	_checkPermissions,
} from './permissions'
import { WibeApp } from '../..'
import { HookObject } from './HookObject'
import { BeforeOperationType, OperationType } from '.'
import type { Context } from '../graphql/interface'
import * as permissions from './permissions'

describe('Permissions', () => {
	const mockGetObject = mock(() => {})

	beforeAll(() => {
		// @ts-expect-error
		WibeApp.config = {
			schema: {
				class: [
					{
						name: 'TestClass',
						fields: {
							field1: { type: 'String' },
						},
						permissions: {
							read: {
								requireAuthentication: true,
								authorizedRoles: ['Admin'],
							},
						},
					},
					{
						name: 'TestClass2',
						fields: {
							field2: { type: 'String' },
						},
					},
				],
			},
		}

		WibeApp.databaseController = {
			// @ts-expect-error
			getObject: mockGetObject,
		}
	})

	beforeEach(() => {
		mockGetObject.mockClear()
	})

	it('should get the permission for a given className', async () => {
		const permission = await _getPermissionPropertiesOfAClass({
			className: 'TestClass',
			operation: 'read',
		})

		expect(permission).toEqual({
			requireAuthentication: true,
			authorizedRoles: ['Admin'],
		})

		const permission2 = await _getPermissionPropertiesOfAClass({
			className: 'TestClass2',
			operation: 'read',
		})

		expect(permission2).toBeUndefined()
	})

	it('should throw permission denied if no session id is provided but class require authentication', async () => {
		const context: Context = {
			sessionId: '',
			// @ts-expect-error
			user: {},
			isRoot: false,
		}

		const obj = new HookObject({
			// @ts-expect-error
			className: 'TestClass',
			context,
			// @ts-expect-error
			object: {},
			operationType: OperationType.BeforeRead,
		})

		expect(
			_checkPermissions(obj, BeforeOperationType.BeforeRead),
		).rejects.toThrow('Permission denied to read class TestClass')
	})

	it('should throw permission denied if role is not an authorized role', async () => {
		mockGetObject.mockResolvedValue({
			id: 'sessionId',
			user: { id: 'userId' },
		} as never)

		const context: Context = {
			sessionId: 'sessionId',
			user: {
				id: 'userId',
				role: {
					id: 'roleId',
					name: 'Role',
				},
			},
			isRoot: false,
		}

		const obj = new HookObject({
			// @ts-expect-error
			className: 'TestClass',
			context,
			// @ts-expect-error
			object: {},
			operationType: OperationType.BeforeRead,
		})

		expect(
			_checkPermissions(obj, BeforeOperationType.BeforeRead),
		).rejects.toThrow('Permission denied to read class TestClass')
	})

	it('should not throw permission denied if valid session id is provided', async () => {
		mockGetObject.mockResolvedValue({
			id: 'sessionId',
			user: { id: 'userId' },
		} as never)

		const context: Context = {
			sessionId: 'sessionId',
			user: {
				id: 'userId',
				role: {
					id: 'roleId',
					name: 'Admin',
				},
			},
			isRoot: false,
		}

		const obj = new HookObject({
			// @ts-expect-error
			className: 'TestClass',
			context,
			// @ts-expect-error
			object: {},
			operationType: OperationType.BeforeRead,
		})

		expect(_checkPermissions(obj, BeforeOperationType.BeforeRead)).resolves
	})

	it('should not throw permission denied if client is root', async () => {
		const context: Context = {
			sessionId: '',
			user: {
				id: '',
			},
			isRoot: true,
		}

		const obj = new HookObject({
			// @ts-expect-error
			className: 'TestClass',
			context,
			// @ts-expect-error
			object: {},
			operationType: OperationType.BeforeRead,
		})

		expect(_checkPermissions(obj, BeforeOperationType.BeforeRead)).resolves
	})

	it('should call _checkPermission on beforeRead', async () => {
		const spyBeforeRead = spyOn(
			permissions,
			'defaultCheckPermissionOnRead',
		).mockResolvedValue()

		permissions.defaultCheckPermissionOnRead({} as never)

		expect(spyBeforeRead).toHaveBeenCalledTimes(1)
		expect(spyBeforeRead).toHaveBeenCalledWith({})

		spyBeforeRead.mockRestore()
	})

	it('should call _checkPermission on beforeCreate', async () => {
		const spyBeforeCreate = spyOn(
			permissions,
			'defaultCheckPermissionOnCreate',
		).mockResolvedValue()

		permissions.defaultCheckPermissionOnCreate({
			sessionId: 'sessionId',
			user: { id: 'userId' },
		} as never)

		expect(spyBeforeCreate).toHaveBeenCalledTimes(1)
		expect(spyBeforeCreate).toHaveBeenCalledWith({
			sessionId: 'sessionId',
			user: { id: 'userId' },
		})

		spyBeforeCreate.mockRestore()
	})

	it('should call _checkPermission on beforeUpdate', async () => {
		const spyBeforeUpdate = spyOn(
			permissions,
			'defaultCheckPermissionOnUpdate',
		).mockResolvedValue()

		permissions.defaultCheckPermissionOnUpdate({
			sessionId: 'sessionId',
			user: { id: 'userId' },
		} as never)

		expect(spyBeforeUpdate).toHaveBeenCalledTimes(1)
		expect(spyBeforeUpdate).toHaveBeenCalledWith({
			sessionId: 'sessionId',
			user: { id: 'userId' },
		})

		spyBeforeUpdate.mockRestore()
	})

	it('should call _checkPermission on beforeDelete', async () => {
		const spyBeforeDelete = spyOn(
			permissions,
			'defaultCheckPermissionOnDelete',
		).mockResolvedValue()

		permissions.defaultCheckPermissionOnDelete({
			sessionId: 'sessionId',
			user: { id: 'userId' },
		} as never)

		expect(spyBeforeDelete).toHaveBeenCalledTimes(1)
		expect(spyBeforeDelete).toHaveBeenCalledWith({
			sessionId: 'sessionId',
			user: { id: 'userId' },
		})

		spyBeforeDelete.mockRestore()
	})
})
