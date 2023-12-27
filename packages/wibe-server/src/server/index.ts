import { Elysia } from 'elysia'
import { apollo } from '@elysiajs/apollo'
import { DatabaseConfig } from '../database'
import { DatabaseController } from '../database/controllers/DatabaseController'
import { MongoAdapter } from '../database/adapters/MongoAdapter'
import { Schema, SchemaInterface } from '../schema/Schema'
import { GraphQLObjectType, GraphQLSchema } from 'graphql'
import { WibeGraphlQLSchema } from '../schema/WibeGraphQLSchema'
import { AuthenticationConfig } from '../authentication/interface'
import { googleAuthHandler } from './routes'

interface WibeConfig {
	port: number
	schema: SchemaInterface
	database: DatabaseConfig
	codegen?: boolean
	authentication?: AuthenticationConfig
}

export class WibeApp {
	private server: Elysia

	static config: WibeConfig
	static databaseController: DatabaseController

	constructor({ port, schema, database, codegen = true }: WibeConfig) {
		WibeApp.config = { port, schema, database, codegen }

		this.server = new Elysia().get('/health', (context) => {
			context.set.status = 200
		})

		const databaseAdapter = new MongoAdapter({
			databaseName: database.name,
			databaseUrl: database.url,
		})

		WibeApp.databaseController = new DatabaseController(databaseAdapter)
	}

	async start() {
		await WibeApp.databaseController.connect()

		const wibeSchema = new Schema(WibeApp.config.schema)

		const graphqlSchema = new WibeGraphlQLSchema(wibeSchema)

		const types = graphqlSchema.createSchema()

		const schema = new GraphQLSchema({
			query: new GraphQLObjectType({
				name: 'Query',
				fields: types.queries,
			}),
			mutation: new GraphQLObjectType({
				name: 'Mutation',
				fields: types.mutations,
			}),
			types: [...types.scalars, ...types.enums, ...types.objects],
		})

		this.server.use(
			await apollo({
				schema,
			}),
		)

		if (
			process.env.NODE_ENV !== 'production' &&
			process.env.NODE_ENV !== 'test' &&
			WibeApp.config.codegen
		) {
			// Generate Wibe types
			const wibeTypes = wibeSchema.getTypesFromSchema()

			Bun.write('generated/wibe.ts', wibeTypes)
		}

		/// FOR TESTING

		this.server.get('/auth/test', googleAuthHandler)

		///

		this.server.listen(WibeApp.config.port, () => {
			console.log(`Server running on port ${WibeApp.config.port}`)
		})
	}

	async close() {
		await WibeApp.databaseController.close()
		await this.server.stop()
	}
}
