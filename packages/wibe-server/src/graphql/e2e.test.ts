import { afterAll, beforeAll, describe, expect, it } from 'bun:test'
import { WibeApp } from '../server'
import { gql } from '@elysiajs/apollo'
import { closeTests, getGraphqlClient, setupTests } from '../utils/testHelper'
import { GraphQLClient } from 'graphql-request'

const graphql = {
	user: gql`
		query user($id: String!) {
			user(id: $id) {
				name
				age
			}
		}
	`,
	users: gql`
		query users($where: UserWhereInput) {
			users(where: $where) {
				name
				age
			}
		}
	`,
	createUser: gql`
		mutation createUser($name: String!, $age: Int!) {
			createUser(input: { name: $name, age: $age }) {
				name
				age
			}
		}
	`,
	createUsers: gql`
		mutation createUsers($input: [UserCreateInput]) {
			createUsers(input: $input) {
				name
				age
			}
		}
	`,
	updateUser: gql`
		mutation updateUser($input: UserUpdateInput!) {
			updateUser(input: $input) {
				name
				age
			}
		}
	`,
	updateUsers: gql`
		mutation updateUsers($input: UsersUpdateInput!) {
			updateUsers(input: $input) {
				name
				age
			}
		}
	`,
}

describe('GraphQL Queries', () => {
	let wibe: WibeApp
	let port: number
	let client: GraphQLClient

	beforeAll(async () => {
		const setup = await setupTests()
		wibe = setup.wibe
		port = setup.port
		client = getGraphqlClient(port)

		await client.request<any>(graphql.createUsers, {
			input: [
				{ name: 'Lucas', age: 23 },
				{ name: 'Jeanne', age: 23 },
			],
		})
	})

	afterAll(async () => {
		await closeTests(wibe)
	})

	it('should get an object that not exist', async () => {
		expect(
			await client.request<any>(graphql.user, {
				id: '65356f69ea1fe46431076723',
			}),
		).toEqual({ user: null })
	})

	it('should create an object', async () => {
		const res = await client.request<any>(graphql.createUser, {
			name: 'John',
			age: 23,
		})

		expect(res.createUser).toEqual({
			name: 'John',
			age: 23,
		})

		expect(
			(
				await client.request<any>(graphql.users, {
					where: {
						name: {
							equalTo: 'John',
						},
					},
				})
			).users,
		).toEqual([
			{
				name: 'John',
				age: 23,
			},
		])
	})

	it("should create multiple objects and get them by 'where' query", async () => {
		const res = await client.request<any>(graphql.createUsers, {
			input: [
				{ name: 'Lucas2', age: 24 },
				{ name: 'Jeanne2', age: 24 },
			],
		})

		expect(res.createUsers).toEqual([
			{ name: 'Lucas2', age: 24 },
			{ name: 'Jeanne2', age: 24 },
		])

		const users = await client.request<any>(graphql.users, {
			where: {
				name: {
					equalTo: 'Lucas2',
				},
			},
		})

		expect(users.users).toEqual([{ name: 'Lucas2', age: 24 }])

		const users2 = await client.request<any>(graphql.users, {
			where: {
				age: {
					equalTo: 24,
				},
			},
		})

		expect(users2.users).toEqual([
			{ name: 'Lucas2', age: 24 },
			{ name: 'Jeanne2', age: 24 },
		])
	})

	it.only('should update one object', async () => {
		const { users } = await client.request<any>(graphql.users, {})

		const userToUpdate = users[0]

		console.log(userToUpdate)

		const res = await client.request<any>(graphql.updateUser, {
			input: {
				id: userToUpdate.id,
				fields: {
					name: 'NameAfterUpdate',
				},
			},
		})

		expect(res.updateUser).toEqual({
			name: 'NameAfterUpdate',
			age: userToUpdate.age,
		})

		// const user = await client.request<any>(graphql.user, {
		// 	id: '60f69ea1fe46431076723653',
		// })

		// expect(user.user).toEqual({
		// 	name: 'John2',
		// 	age: 23,
		// })
	})
})
