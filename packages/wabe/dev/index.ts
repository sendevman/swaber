import { runDatabase } from 'wabe-mongodb-launcher'
import { DatabaseEnum, Wabe } from '../src'
import type {
	WabeSchemaEnums,
	WabeSchemaScalars,
	WabeSchemaTypes,
} from '../generated/wabe'

const run2 = async () => {
	await runDatabase()

	const wabe = new Wabe({
		rootKey:
			'0uwFvUxM$ceFuF1aEtTtZMa7DUN2NZudqgY5ve5W*QCyb58cwMj9JeoaV@d#%29v&aJzswuudVU1%nAT+rxS0Bh&OkgBYc0PH18*',
		database: {
			type: DatabaseEnum.Mongo,
			url: 'mongodb://127.0.0.1:27045',
			name: 'Wabe',
		},
		port: 3000,
		authentication: {
			successRedirectPath: 'https://myapp.com/dashboard',
			failureRedirectPath: 'https://myapp.com/login',
		},
		file: {
			adapter: async (file) => {
				// ... Upload the file on a bucket
				// return the url of the file for example

				return 'http://bucket.storage/123456/logo.png'
			},
		},
		schema: {
			classes: [
				{
					name: 'Company',
					fields: {
						name: {
							type: 'String',
						},
						contactPhone: {
							type: 'Phone',
						},
					},
				},
			],
			scalars: [
				{
					name: 'Phone',
					description: 'Phone scalar',
					parseValue(value: any) {
						if (typeof value !== 'string')
							throw new Error('Invalid phone')

						if (
							!value.match(
								/^(?:(?:\+33|0033)[\s.-]?)?[1-9](?:[\s.-]?\d{2}){4}$/,
							)
						)
							throw new Error('Invalid phone')

						return value
					},
				},
			],
		},
	})

	await wabe.start()
}

const run = async () => {
	await runDatabase()

	const wabe = new Wabe<{
		types: WabeSchemaTypes
		scalars: WabeSchemaScalars
		enums: WabeSchemaEnums
	}>({
		codegen: {
			enabled: true,
			path: `${import.meta.dirname}/../generated/`,
		},
		rootKey:
			'0uwFvUxM$ceFuF1aEtTtZMa7DUN2NZudqgY5ve5W*QCyb58cwMj9JeoaV@d#%29v&aJzswuudVU1%nAT+rxS0Bh&OkgBYc0PH18*',
		authentication: {
			session: {
				cookieSession: true,
			},
			roles: ['Admin', 'Client'],
			successRedirectPath:
				'http://localhost:3000/auth/oauth?provider=google',
			failureRedirectPath:
				'http://localhost:3000/auth/oauth?provider=google',
			providers: {
				x: {
					clientId: 'SVFhTWpONVM4S09TWVB6dF9CZjc6MTpjaQ',
					clientSecret:
						'V95bDcUgQgYNqweVRO8RFrqWJxr_yckd_b5Npp-MmEBxMr6KuR',
				},
				google: {
					clientId:
						'296431040556-4jh84e5s264rmrgnh8bmegb0kl550teg.apps.googleusercontent.com',
					clientSecret: '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',
				},
			},
			customAuthenticationMethods: [
				{
					name: 'otp',
					input: {
						code: {
							type: 'String',
						},
					},
					provider: {} as any,
					isSecondaryFactor: true,
				},
			],
		},
		database: {
			type: DatabaseEnum.Mongo,
			url: 'mongodb://127.0.0.1:27045',
			name: 'Wabe',
		},
		port: 3000,
		schema: {
			classes: [
				{
					name: 'User',
					description: 'User class',
					fields: {
						name: {
							type: 'String',
						},
						age: {
							type: 'Int',
						},
					},
				},
				{
					name: 'Post',
					fields: {
						name: { type: 'String', required: true },
						test: { type: 'File' },
					},
					permissions: {
						create: {
							requireAuthentication: true,
							authorizedRoles: ['Admin'],
						},
					},
				},
			],
			scalars: [
				{
					name: 'Phone',
					description: 'Phone custom scalar type',
				},
			],
			resolvers: {
				queries: {
					helloWorld: {
						type: 'String',
						description: 'Hello world description',
						args: {
							name: {
								type: 'String',
								required: true,
							},
						},
						resolve: () => 'Hello World',
					},
				},
				mutations: {
					createMutation: {
						type: 'Boolean',
						required: true,
						args: {
							input: {
								name: {
									type: 'Int',
									required: true,
								},
							},
						},
						resolve: () => true,
					},
					customMutation: {
						type: 'Int',
						args: {
							input: {
								a: {
									type: 'Int',
									required: true,
								},
								b: {
									type: 'Int',
									required: true,
								},
							},
						},
						resolve: (_: any, args: any) =>
							args.input.a + args.input.b,
					},
					secondCustomMutation: {
						type: 'Int',
						args: {
							input: {
								sum: {
									type: 'Object',
									object: {
										name: 'Sum',
										fields: {
											a: {
												type: 'Int',
												required: true,
											},
											b: {
												type: 'Int',
												required: true,
											},
										},
									},
								},
							},
						},
						resolve: (_: any, args: any) =>
							args.input.sum.a + args.input.sum.b,
					},
				},
			},
		},
	})

	await wabe.start()
}

run().catch((err) => {
	console.error(err)
})
