import {
	afterAll,
	afterEach,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
} from 'bun:test'
import { WibeApp } from '../../server'
import { gql } from '@elysiajs/apollo'
import {
	closeTests,
	getGraphqlClient,
	setupTests,
} from '../../utils/testHelper'
import { GraphQLClient } from 'graphql-request'

const graphql = {
	customQuery: gql`
		query customQuery($name: String!) {
			customQuery(name: $name)
		}
	`,
	customMutation: gql`
		mutation customMutation($a: Int!, $b: Int!) {
			customMutation(a: $a, b: $b)
		}
	`,
	findOneUser: gql`
		query findOneUser($id: ID!) {
			findOneUser(id: $id) {
				id
				name
				age
			}
		}
	`,
	findManyUser: gql`
		query findManyUser($where: UserWhereInput, $offset: Int, $limit: Int) {
			findManyUser(where: $where, offset: $offset, limit: $limit) {
				objects{
					id
					name
					age
				}
			}
		}
	`,
	createOneUser: gql`
		mutation createOneUser($input: UserCreateInput!) {
			createOneUser(input: $input) {
				id
				name
				age
			}
		}
	`,
	createManyUser: gql`
		mutation createManyUser($input: UsersCreateInput!) {
			createManyUser(input: $input) {
				objects{
					name
					age
				}
			}
		}
	`,
	updateOneUser: gql`
		mutation updateOneUser($input: UserUpdateInput!) {
			updateOneUser(input: $input) {
				name
				age
			}
		}
	`,
	updateManyUser: gql`
		mutation updateManyUser($input: UsersUpdateInput!) {
			updateManyUser(input: $input) {
				objects{
					name
					age
				}
			}
		}
	`,
	deleteOneUser: gql`
		mutation deleteOneUser($input: UserDeleteInput!) {
			deleteOneUser(input: $input) {
				name
				age
			}
		}
	`,
	deleteManyUser: gql`
		mutation deleteManyUser($input: UsersDeleteInput!) {
			deleteManyUser(input: $input) {
				objects{
					name
					age
				}
			}
		}
	`,
}

const cleanUsers = async (client: GraphQLClient) => {
	const { findManyUser } = await client.request<any>(graphql.findManyUser, {})
	await Promise.all(
		findManyUser.objects.map((user: any) =>
			client.request<any>(graphql.deleteOneUser, {
				input: { id: user.id },
			}),
		),
	)
}

describe('GraphQL : E2E', () => {
	let wibe: WibeApp
	let port: number
	let client: GraphQLClient

	beforeAll(async () => {
		const setup = await setupTests()
		wibe = setup.wibe
		port = setup.port
		client = getGraphqlClient(port)
	})

	beforeEach(async () => {
		await client.request<any>(graphql.createManyUser, {
			input: {
				fields: [
					{ name: 'Lucas', age: 23 },
					{ name: 'Jeanne', age: 23 },
				],
			},
		})
	})

	afterEach(async () => {
		await cleanUsers(client)
	})

	afterAll(async () => {
		await closeTests(wibe)
	})

	it("should use pagination with 'offset' and 'limit' arguments", async () => {
		await cleanUsers(client)

		const res = await client.request<any>(graphql.createManyUser, {
			input: {
				fields: [
					{
						name: 'Toto1',
					},
					{ name: 'Toto2' },
					{ name: 'Toto3' },
					{ name: 'Toto4' },
					{ name: 'Toto5' },
					{ name: 'Toto6' },
					{ name: 'Toto7' },
					{ name: 'Toto8' },
					{ name: 'Toto9' },
					{ name: 'Toto10' },
				],
				offset: 0,
				limit: 5,
			},
		})

		expect(res.createManyUser.objects.length).toEqual(5)

		const { findManyUser } = await client.request<any>(
			graphql.findManyUser,
			{
				offset: 5,
				limit: 2,
			},
		)

		expect(findManyUser.objects.length).toEqual(2)
		expect(findManyUser.objects[0].name).toEqual('Toto6')
	})

	it('should create user with custom object in schema', async () => {
		await client.request<any>(graphql.createManyUser, {
			input: {
				fields: [
					{
						name: 'Jean',
						address: {
							address1: '1 rue de la paix',
							address2: '2 rue de la paix',
							postalCode: 75000,
							city: 'Paris',
							country: 'France',
						},
					},
					{ name: 'Jeanne', age: 23 },
				],
			},
		})

		const { findManyUser } = await client.request<any>(
			graphql.findManyUser,
			{
				where: {
					address: {
						address1: {
							equalTo: '1 rue de la paix',
						},
					},
				},
			},
		)

		expect(findManyUser.objects.length).toEqual(1)
		expect(findManyUser.objects[0].name).toEqual('Jean')

		const { findManyUser: users2 } = await client.request<any>(
			graphql.findManyUser,
			{
				where: {
					address: {
						postalCode: {
							equalTo: 75000,
						},
					},
				},
			},
		)

		expect(users2.objects.length).toEqual(1)
		expect(users2.objects[0].name).toEqual('Jean')

		const { findManyUser: users3 } = await client.request<any>(
			graphql.findManyUser,
			{
				where: {
					address: {
						address1: {
							notEqualTo: '1 rue de la paix',
						},
					},
				},
			},
		)

		expect(users3.objects.length).toEqual(3)
	})

	it('should create user with object of object in schema', async () => {
		await client.request<any>(graphql.createManyUser, {
			input: {
				fields: [
					{
						name: 'Jean',
						object: {
							objectOfObject: {
								name: 'object',
							},
						},
					},
				],
			},
		})

		const { findManyUser } = await client.request<any>(
			graphql.findManyUser,
			{
				where: {
					object: {
						objectOfObject: {
							name: { equalTo: 'object' },
						},
					},
				},
			},
		)

		expect(findManyUser.objects.length).toEqual(1)
		expect(findManyUser.objects[0].name).toEqual('Jean')

		const { findManyUser: users2 } = await client.request<any>(
			graphql.findManyUser,
			{
				where: {
					object: {
						objectOfObject: {
							name: { equalTo: 'object2' },
						},
					},
				},
			},
		)

		expect(users2.objects.length).toEqual(0)

		const { findManyUser: users3 } = await client.request<any>(
			graphql.findManyUser,
			{
				where: {
					object: {
						objectOfObject: {
							name: { notEqualTo: 'object' },
						},
					},
				},
			},
		)

		expect(users3.objects.length).toEqual(2)
	})

	it('should create user with custom enum (Role)', async () => {
		await client.request<any>(graphql.createManyUser, {
			input: { fields: [{ name: 'Jack', role: 'Admin' }] },
		})

		const { findManyUser } = await client.request<any>(
			graphql.findManyUser,
			{
				where: {
					role: {
						equalTo: 'Admin',
					},
				},
			},
		)

		expect(findManyUser.objects.length).toEqual(1)
		expect(findManyUser.objects[0].name).toEqual('Jack')

		const { findManyUser: users2 } = await client.request<any>(
			graphql.findManyUser,
			{
				where: {
					role: {
						notEqualTo: 'Admin',
					},
				},
			},
		)

		expect(users2.objects.length).toEqual(2)
		expect(users2.objects).toEqual([
			{
				id: expect.anything(),
				name: 'Lucas',
				age: 23,
			},
			{
				id: expect.anything(),
				name: 'Jeanne',
				age: 23,
			},
		])
	})

	it('should create user with a custom scalar (phone)', async () => {
		await client.request<any>(graphql.createManyUser, {
			input: { fields: [{ name: 'Jack', phone: '+33577223355' }] },
		})

		const { findManyUser } = await client.request<any>(
			graphql.findManyUser,
			{
				where: {
					phone: {
						equalTo: '+33577223355',
					},
				},
			},
		)

		expect(findManyUser.objects.length).toEqual(1)
		expect(findManyUser.objects[0].name).toEqual('Jack')

		const { findManyUser: users2 } = await client.request<any>(
			graphql.findManyUser,
			{
				where: {
					phone: {
						notEqualTo: '+33577223355',
					},
				},
			},
		)

		expect(users2.objects.length).toEqual(2)
		expect(users2.objects).toEqual([
			{
				id: expect.anything(),
				name: 'Lucas',
				age: 23,
			},
			{
				id: expect.anything(),
				name: 'Jeanne',
				age: 23,
			},
		])
	})

	it('should create custom query successfully', async () => {
		// Test required field
		expect(client.request<any>(graphql.customQuery, {})).rejects.toThrow()

		// Test String param is correctly passed
		expect(
			client.request<any>(graphql.customMutation, {
				name: 1.5,
			}),
		).rejects.toThrow()

		const res = await client.request<any>(graphql.customQuery, {
			name: 'Lucas',
		})

		expect(res.customQuery).toEqual('Successfull')
	})

	it('should create custom mutation successfully', async () => {
		// Test required field
		expect(
			client.request<any>(graphql.customMutation, {}),
		).rejects.toThrow()

		// Test Int param is correctly passed
		expect(
			client.request<any>(graphql.customMutation, {
				a: 1.5,
				b: 1.5,
			}),
		).rejects.toThrow()

		const res = await client.request<any>(graphql.customMutation, {
			a: 1,
			b: 1,
		})

		expect(res.customMutation).toEqual(2)
	})

	it('should throw an error if a field is required and not provided', async () => {
		expect(
			client.request<any>(graphql.createManyUser, {
				input: { fields: [{ age: 23 }] },
			}),
		).rejects.toThrow()
	})

	it('should get an object that not exist', async () => {
		expect(
			await client.request<any>(graphql.findOneUser, {
				id: '65356f69ea1fe46431076723',
			}),
		).toEqual({ findOneUser: null })
	})

	it('should get an object', async () => {
		const res = await client.request<any>(graphql.createOneUser, {
			input: {
				fields: {
					name: 'CurrentUser',
					age: 99,
				},
			},
		})

		const { findOneUser } = await client.request<any>(graphql.findOneUser, {
			id: res.createOneUser.id,
		})

		expect(findOneUser).toEqual({
			id: res.createOneUser.id,
			name: 'CurrentUser',
			age: 99,
		})
	})

	it('should get multiple objects', async () => {
		const res = await client.request<any>(graphql.findManyUser, {
			input: {
				where: {
					name: {
						equalTo: 'Lucas',
					},
				},
			},
		})

		expect(res.findManyUser.objects).toEqual([
			{
				id: expect.anything(),
				name: 'Lucas',
				age: 23,
			},
			{
				id: expect.anything(),
				name: 'Jeanne',
				age: 23,
			},
		])
	})

	it('should create an object', async () => {
		const res = await client.request<any>(graphql.createOneUser, {
			input: {
				fields: {
					name: 'John',
					age: 23,
				},
			},
		})

		expect(res.createOneUser).toEqual({
			id: expect.anything(),
			name: 'John',
			age: 23,
		})

		expect(
			(
				await client.request<any>(graphql.findManyUser, {
					where: {
						name: {
							equalTo: 'John',
						},
					},
				})
			).findManyUser.objects,
		).toEqual([
			{
				id: expect.anything(),
				name: 'John',
				age: 23,
			},
		])
	})

	it('should create multiple objects', async () => {
		const res = await client.request<any>(graphql.createManyUser, {
			input: {
				fields: [
					{ name: 'Lucas2', age: 24 },
					{ name: 'Jeanne2', age: 24 },
				],
			},
		})

		expect(res.createManyUser.objects).toEqual([
			{ name: 'Lucas2', age: 24 },
			{ name: 'Jeanne2', age: 24 },
		])

		const findManyUser = await client.request<any>(graphql.findManyUser, {
			where: {
				name: {
					equalTo: 'Lucas2',
				},
			},
		})

		expect(findManyUser.findManyUser.objects).toEqual([
			{ id: expect.anything(), name: 'Lucas2', age: 24 },
		])

		const users2 = await client.request<any>(graphql.findManyUser, {
			where: {
				age: {
					equalTo: 24,
				},
			},
		})

		expect(users2.findManyUser.objects).toEqual([
			{ id: expect.anything(), name: 'Lucas2', age: 24 },
			{ id: expect.anything(), name: 'Jeanne2', age: 24 },
		])
	})

	it('should update one object', async () => {
		const { findManyUser } = await client.request<any>(
			graphql.findManyUser,
			{},
		)

		const userToUpdate = findManyUser.objects[0]

		const res = await client.request<any>(graphql.updateOneUser, {
			input: {
				id: userToUpdate.id,
				fields: {
					name: 'NameAfterUpdate',
				},
			},
		})

		expect(res.updateOneUser).toEqual({
			name: 'NameAfterUpdate',
			age: userToUpdate.age,
		})
	})

	it('should update multiple objects', async () => {
		const res = await client.request<any>(graphql.updateManyUser, {
			input: {
				fields: {
					name: 'Tata',
				},
				where: {
					name: {
						equalTo: 'Lucas',
					},
				},
			},
		})

		expect(res.updateManyUser.objects).toEqual([
			{
				name: 'Tata',
				age: 23,
			},
		])
	})

	it('should delete one object', async () => {
		const { findManyUser } = await client.request<any>(
			graphql.findManyUser,
			{},
		)

		const userToDelete = findManyUser.objects[0]

		expect(findManyUser.objects.length).toEqual(2)

		const res = await client.request<any>(graphql.deleteOneUser, {
			input: {
				id: userToDelete.id,
			},
		})

		expect(res.deleteOneUser).toEqual({
			name: userToDelete.name,
			age: userToDelete.age,
		})

		const { findManyUser: users2 } = await client.request<any>(
			graphql.findManyUser,
			{},
		)

		expect(users2.objects.length).toEqual(1)
	})

	it('should delete multiple objects', async () => {
		const res = await client.request<any>(graphql.deleteManyUser, {
			input: {
				where: {
					age: {
						equalTo: 23,
					},
				},
			},
		})

		expect(res.deleteManyUser.objects).toEqual([
			{
				name: 'Lucas',
				age: 23,
			},
			{
				name: 'Jeanne',
				age: 23,
			},
		])

		const { findManyUser } = await client.request<any>(
			graphql.findManyUser,
			{},
		)

		expect(findManyUser.objects.length).toEqual(0)
	})
})
