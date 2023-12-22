import { beforeAll, afterAll, describe, it, expect } from 'bun:test'
import { GraphQLClient, gql } from 'graphql-request'
import { WibeApp } from '../../server'
import {
	closeTests,
	getGraphqlClient,
	setupTests,
} from '../../utils/testHelper'

const graphql = {
	users: gql`
		query users($where: UserWhereInput) {
			users(where: $where) {
				objects{
					id
					name
					age
					isAdmin
					floatValue
				}
			}
		}
	`,
	createUsers: gql`
		mutation createUsers($input: [UserInput]) {
			createUsers(input: $input) {
				objects{
					id
					name
					age
					isAdmin
					floatValue
				}
			}
		}
	`,
}

describe('GraphQL : aggregation', () => {
	let wibe: WibeApp
	let port: number
	let client: GraphQLClient

	const now = new Date()

	beforeAll(async () => {
		const setup = await setupTests()
		wibe = setup.wibe
		port = setup.port
		client = getGraphqlClient(port)

		await client.request<any>(graphql.createUsers, {
			input: [
				{
					name: 'Lucas',
					age: 20,
					isAdmin: true,
					floatValue: 1.5,
					birthDate: now,
					arrayValue: ['a', 'b'],
					email: 'lucas@mail.fr',
				},
				{
					name: 'Jeanne',
					age: 18,
					isAdmin: false,
					floatValue: 2.5,
					birthDate: new Date(Date.now() + 100000),
					arrayValue: ['c', 'd'],
					email: 'jean.doe@mail.fr',
				},
			],
		})
	})

	afterAll(async () => {
		await closeTests(wibe)
	})

	it("should support Array's aggregation", async () => {
		expect(
			await client.request<any>(graphql.users, {
				where: {
					arrayValue: { contains: 'a' },
				},
			}),
		).toEqual({
			users: {
				objects: [
					{
						id: expect.any(String),
						name: 'Lucas',
						age: 20,
						isAdmin: true,
						floatValue: 1.5,
					},
				],
			},
		})

		expect(
			await client.request<any>(graphql.users, {
				where: {
					arrayValue: { notContains: 'a' },
				},
			}),
		).toEqual({
			users: {
				objects: [
					{
						id: expect.any(String),
						name: 'Jeanne',
						age: 18,
						isAdmin: false,
						floatValue: 2.5,
					},
				],
			},
		})

		expect(
			await client.request<any>(graphql.users, {
				where: {
					arrayValue: { equalTo: ['a', 'b'] },
				},
			}),
		).toEqual({
			users: {
				objects: [
					{
						id: expect.any(String),
						name: 'Lucas',
						age: 20,
						isAdmin: true,
						floatValue: 1.5,
					},
				],
			},
		})

		expect(
			await client.request<any>(graphql.users, {
				where: {
					arrayValue: { notEqualTo: ['a', 'b'] },
				},
			}),
		).toEqual({
			users: {
				objects: [
					{
						id: expect.any(String),
						name: 'Jeanne',
						age: 18,
						isAdmin: false,
						floatValue: 2.5,
					},
				],
			},
		})

		expect(
			await client.request<any>(graphql.users, {
				where: {
					arrayValue: { equalTo: ['z', 'w'] },
				},
			}),
		).toEqual({
			users: { objects: [] },
		})

		expect(
			await client.request<any>(graphql.users, {
				where: {
					arrayValue: { contains: 'z' },
				},
			}),
		).toEqual({
			users: { objects: [] },
		})
	})

	it("should support DateScalarType's aggregation", async () => {
		expect(
			await client.request<any>(graphql.users, {
				where: {
					birthDate: { equalTo: now },
				},
			}),
		).toEqual({
			users: {
				objects: [
					{
						id: expect.any(String),
						name: 'Lucas',
						age: 20,
						isAdmin: true,
						floatValue: 1.5,
					},
				],
			},
		})

		expect(
			await client.request<any>(graphql.users, {
				where: {
					birthDate: { notEqualTo: now },
				},
			}),
		).toEqual({
			users: {
				objects: [
					{
						id: expect.any(String),
						name: 'Jeanne',
						age: 18,
						isAdmin: false,
						floatValue: 2.5,
					},
				],
			},
		})

		expect(
			await client.request<any>(graphql.users, {
				where: {
					birthDate: { lessThan: new Date(now.getTime() + 1000) },
				},
			}),
		).toEqual({
			users: {
				objects: [
					{
						id: expect.any(String),
						name: 'Lucas',
						age: 20,
						isAdmin: true,
						floatValue: 1.5,
					},
				],
			},
		})

		expect(
			await client.request<any>(graphql.users, {
				where: {
					birthDate: { lessThanOrEqualTo: now },
				},
			}),
		).toEqual({
			users: {
				objects: [
					{
						id: expect.any(String),
						name: 'Lucas',
						age: 20,
						isAdmin: true,
						floatValue: 1.5,
					},
				],
			},
		})

		expect(
			await client.request<any>(graphql.users, {
				where: {
					birthDate: { greaterThan: now },
				},
			}),
		).toEqual({
			users: {
				objects: [
					{
						id: expect.any(String),
						name: 'Jeanne',
						age: 18,
						isAdmin: false,
						floatValue: 2.5,
					},
				],
			},
		})

		expect(
			await client.request<any>(graphql.users, {
				where: {
					birthDate: { greaterThanOrEqualTo: now },
				},
			}),
		).toEqual({
			users: {
				objects: [
					{
						id: expect.any(String),
						name: 'Lucas',
						age: 20,
						isAdmin: true,
						floatValue: 1.5,
					},
					{
						id: expect.any(String),
						name: 'Jeanne',
						age: 18,
						isAdmin: false,
						floatValue: 2.5,
					},
				],
			},
		})

		expect(
			await client.request<any>(graphql.users, {
				where: {
					birthDate: { in: [now] },
				},
			}),
		).toEqual({
			users: {
				objects: [
					{
						id: expect.any(String),
						name: 'Lucas',
						age: 20,
						isAdmin: true,
						floatValue: 1.5,
					},
				],
			},
		})

		expect(
			await client.request<any>(graphql.users, {
				where: {
					birthDate: { notIn: [now] },
				},
			}),
		).toEqual({
			users: {
				objects: [
					{
						id: expect.any(String),
						name: 'Jeanne',
						age: 18,
						isAdmin: false,
						floatValue: 2.5,
					},
				],
			},
		})
	})

	it("should support EmailScalayType's aggregation", async () => {
		expect(
			await client.request<any>(graphql.users, {
				where: {
					email: { equalTo: 'lucas@mail.fr' },
				},
			}),
		).toEqual({
			users: {
				objects: [
					{
						id: expect.any(String),
						name: 'Lucas',
						age: 20,
						isAdmin: true,
						floatValue: 1.5,
					},
				],
			},
		})

		expect(
			await client.request<any>(graphql.users, {
				where: {
					email: { notEqualTo: 'lucas@mail.fr' },
				},
			}),
		).toEqual({
			users: {
				objects: [
					{
						id: expect.any(String),
						name: 'Jeanne',
						age: 18,
						isAdmin: false,
						floatValue: 2.5,
					},
				],
			},
		})

		expect(
			await client.request<any>(graphql.users, {
				where: {
					email: { in: ['lucas@mail.fr'] },
				},
			}),
		).toEqual({
			users: {
				objects: [
					{
						id: expect.any(String),
						name: 'Lucas',
						age: 20,
						isAdmin: true,
						floatValue: 1.5,
					},
				],
			},
		})

		expect(
			await client.request<any>(graphql.users, {
				where: {
					email: { notIn: ['lucas@mail.fr'] },
				},
			}),
		).toEqual({
			users: {
				objects: [
					{
						id: expect.any(String),
						name: 'Jeanne',
						age: 18,
						isAdmin: false,
						floatValue: 2.5,
					},
				],
			},
		})
	})

	it("should support Int's aggregation", async () => {
		expect(
			await client.request<any>(graphql.users, {
				where: {
					age: { equalTo: 20 },
				},
			}),
		).toEqual({
			users: {
				objects: [
					{
						id: expect.any(String),
						name: 'Lucas',
						age: 20,
						isAdmin: true,
						floatValue: 1.5,
					},
				],
			},
		})

		expect(
			await client.request<any>(graphql.users, {
				where: {
					age: { notEqualTo: 20 },
				},
			}),
		).toEqual({
			users: {
				objects: [
					{
						id: expect.any(String),
						name: 'Jeanne',
						age: 18,
						isAdmin: false,
						floatValue: 2.5,
					},
				],
			},
		})

		expect(
			await client.request<any>(graphql.users, {
				where: {
					age: { lessThan: 20 },
				},
			}),
		).toEqual({
			users: {
				objects: [
					{
						id: expect.any(String),
						name: 'Jeanne',
						age: 18,
						isAdmin: false,
						floatValue: 2.5,
					},
				],
			},
		})

		expect(
			await client.request<any>(graphql.users, {
				where: {
					age: { lessThanOrEqualTo: 20 },
				},
			}),
		).toEqual({
			users: {
				objects: [
					{
						id: expect.any(String),
						name: 'Lucas',
						age: 20,
						isAdmin: true,
						floatValue: 1.5,
					},
					{
						id: expect.any(String),
						name: 'Jeanne',
						age: 18,
						isAdmin: false,
						floatValue: 2.5,
					},
				],
			},
		})

		expect(
			await client.request<any>(graphql.users, {
				where: {
					age: { greaterThan: 18 },
				},
			}),
		).toEqual({
			users: {
				objects: [
					{
						id: expect.any(String),
						name: 'Lucas',
						age: 20,
						isAdmin: true,
						floatValue: 1.5,
					},
				],
			},
		})

		expect(
			await client.request<any>(graphql.users, {
				where: {
					age: { greaterThanOrEqualTo: 18 },
				},
			}),
		).toEqual({
			users: {
				objects: [
					{
						id: expect.any(String),
						name: 'Lucas',
						age: 20,
						isAdmin: true,
						floatValue: 1.5,
					},
					{
						id: expect.any(String),
						name: 'Jeanne',
						age: 18,
						isAdmin: false,
						floatValue: 2.5,
					},
				],
			},
		})

		expect(
			await client.request<any>(graphql.users, {
				where: {
					age: { in: [20] },
				},
			}),
		).toEqual({
			users: {
				objects: [
					{
						id: expect.any(String),
						name: 'Lucas',
						age: 20,
						isAdmin: true,
						floatValue: 1.5,
					},
				],
			},
		})

		expect(
			await client.request<any>(graphql.users, {
				where: {
					age: { notIn: [20] },
				},
			}),
		).toEqual({
			users: {
				objects: [
					{
						id: expect.any(String),
						name: 'Jeanne',
						age: 18,
						isAdmin: false,
						floatValue: 2.5,
					},
				],
			},
		})
	})

	it("should support Boolean's aggregation", async () => {
		expect(
			await client.request<any>(graphql.users, {
				where: {
					isAdmin: { equalTo: true },
				},
			}),
		).toEqual({
			users: {
				objects: [
					{
						id: expect.any(String),
						name: 'Lucas',
						age: 20,
						isAdmin: true,
						floatValue: 1.5,
					},
				],
			},
		})

		expect(
			await client.request<any>(graphql.users, {
				where: {
					isAdmin: { notEqualTo: true },
				},
			}),
		).toEqual({
			users: {
				objects: [
					{
						id: expect.any(String),
						name: 'Jeanne',
						age: 18,
						isAdmin: false,
						floatValue: 2.5,
					},
				],
			},
		})

		expect(
			await client.request<any>(graphql.users, {
				where: {
					isAdmin: { in: [true] },
				},
			}),
		).toEqual({
			users: {
				objects: [
					{
						id: expect.any(String),
						name: 'Lucas',
						age: 20,
						isAdmin: true,
						floatValue: 1.5,
					},
				],
			},
		})

		expect(
			await client.request<any>(graphql.users, {
				where: {
					isAdmin: { notIn: [true] },
				},
			}),
		).toEqual({
			users: {
				objects: [
					{
						id: expect.any(String),
						name: 'Jeanne',
						age: 18,
						isAdmin: false,
						floatValue: 2.5,
					},
				],
			},
		})
	})

	it("should support Float's aggregation", async () => {
		expect(
			await client.request<any>(graphql.users, {
				where: {
					floatValue: { equalTo: 1.5 },
				},
			}),
		).toEqual({
			users: {
				objects: [
					{
						id: expect.any(String),
						name: 'Lucas',
						age: 20,
						isAdmin: true,
						floatValue: 1.5,
					},
				],
			},
		})

		expect(
			await client.request<any>(graphql.users, {
				where: {
					floatValue: { notEqualTo: 1.5 },
				},
			}),
		).toEqual({
			users: {
				objects: [
					{
						id: expect.any(String),
						name: 'Jeanne',
						age: 18,
						isAdmin: false,
						floatValue: 2.5,
					},
				],
			},
		})

		expect(
			await client.request<any>(graphql.users, {
				where: {
					floatValue: { lessThan: 2.5 },
				},
			}),
		).toEqual({
			users: {
				objects: [
					{
						id: expect.any(String),
						name: 'Lucas',
						age: 20,
						isAdmin: true,
						floatValue: 1.5,
					},
				],
			},
		})

		expect(
			await client.request<any>(graphql.users, {
				where: {
					floatValue: { lessThanOrEqualTo: 2.5 },
				},
			}),
		).toEqual({
			users: {
				objects: [
					{
						id: expect.any(String),
						name: 'Lucas',
						age: 20,
						isAdmin: true,
						floatValue: 1.5,
					},
					{
						id: expect.any(String),
						name: 'Jeanne',
						age: 18,
						isAdmin: false,
						floatValue: 2.5,
					},
				],
			},
		})

		expect(
			await client.request<any>(graphql.users, {
				where: {
					floatValue: { greaterThan: 1.5 },
				},
			}),
		).toEqual({
			users: {
				objects: [
					{
						id: expect.any(String),
						name: 'Jeanne',
						age: 18,
						isAdmin: false,
						floatValue: 2.5,
					},
				],
			},
		})

		expect(
			await client.request<any>(graphql.users, {
				where: {
					floatValue: { greaterThanOrEqualTo: 2.5 },
				},
			}),
		).toEqual({
			users: {
				objects: [
					{
						id: expect.any(String),
						name: 'Jeanne',
						age: 18,
						isAdmin: false,
						floatValue: 2.5,
					},
				],
			},
		})

		expect(
			await client.request<any>(graphql.users, {
				where: {
					floatValue: { in: [1.5] },
				},
			}),
		).toEqual({
			users: {
				objects: [
					{
						id: expect.any(String),
						name: 'Lucas',
						age: 20,
						isAdmin: true,
						floatValue: 1.5,
					},
				],
			},
		})

		expect(
			await client.request<any>(graphql.users, {
				where: {
					floatValue: { notIn: [1.5] },
				},
			}),
		).toEqual({
			users: {
				objects: [
					{
						id: expect.any(String),
						name: 'Jeanne',
						age: 18,
						isAdmin: false,
						floatValue: 2.5,
					},
				],
			},
		})
	})

	it("should support String's aggregation", async () => {
		expect(
			await client.request<any>(graphql.users, {
				where: {
					name: { notEqualTo: 'Lucas' },
				},
			}),
		).toEqual({
			users: {
				objects: [
					{
						id: expect.any(String),
						name: 'Jeanne',
						age: 18,
						isAdmin: false,
						floatValue: 2.5,
					},
				],
			},
		})

		expect(
			await client.request<any>(graphql.users, {
				where: {
					name: { equalTo: 'Lucas' },
				},
			}),
		).toEqual({
			users: {
				objects: [
					{
						id: expect.any(String),
						name: 'Lucas',
						age: 20,
						isAdmin: true,
						floatValue: 1.5,
					},
				],
			},
		})

		expect(
			await client.request<any>(graphql.users, {
				where: {
					name: { in: ['Lucas'] },
				},
			}),
		).toEqual({
			users: {
				objects: [
					{
						id: expect.any(String),
						name: 'Lucas',
						age: 20,
						isAdmin: true,
						floatValue: 1.5,
					},
				],
			},
		})

		expect(
			await client.request<any>(graphql.users, {
				where: {
					name: { notIn: ['Lucas'] },
				},
			}),
		).toEqual({
			users: {
				objects: [
					{
						id: expect.any(String),
						name: 'Jeanne',
						age: 18,
						isAdmin: false,
						floatValue: 2.5,
					},
				],
			},
		})
	})

	it('should support OR statement', async () => {
		const { users } = await client.request<any>(graphql.users, {
			where: {
				OR: [{ age: { equalTo: 20 } }, { age: { equalTo: 18 } }],
			},
		})

		expect(users.objects).toEqual([
			{
				id: expect.any(String),
				name: 'Lucas',
				age: 20,
				isAdmin: true,
				floatValue: 1.5,
			},
			{
				id: expect.any(String),
				name: 'Jeanne',
				age: 18,
				isAdmin: false,
				floatValue: 2.5,
			},
		])

		const { users: users2 } = await client.request<any>(graphql.users, {
			where: {
				OR: [{ age: { equalTo: 20 } }, { age: { equalTo: 19 } }],
			},
		})

		expect(users2.objects).toEqual([
			{
				id: expect.any(String),
				name: 'Lucas',
				age: 20,
				isAdmin: true,
				floatValue: 1.5,
			},
		])
	})

	it('should support AND statement', async () => {
		const { users } = await client.request<any>(graphql.users, {
			where: {
				AND: [{ age: { equalTo: 20 } }, { age: { equalTo: 18 } }],
			},
		})

		expect(users.objects).toEqual([])

		const { users: users2 } = await client.request<any>(graphql.users, {
			where: {
				AND: [{ age: { equalTo: 20 } }, { isAdmin: { equalTo: true } }],
			},
		})

		expect(users2.objects).toEqual([
			{
				id: expect.any(String),
				name: 'Lucas',
				age: 20,
				isAdmin: true,
				floatValue: 1.5,
			},
		])
	})
})
