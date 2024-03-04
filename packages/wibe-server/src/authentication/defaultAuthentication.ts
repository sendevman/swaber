import { CustomAuthenticationMethods } from './interface'
import {
	emailPasswordOnLogin,
	emailPasswordOnSignUp,
} from './methods/emailPassword'
import { googleOnSignInOrSignUp } from './methods/google'

export const defaultAuthenticationMethods: CustomAuthenticationMethods[] = [
	{
		name: 'emailPassword',
		input: {
			email: {
				type: 'Email',
				required: true,
			},
			password: {
				type: 'Email',
				required: true,
			},
		},
		dataToStore: {
			identifier: {
				type: 'Email',
				required: true,
			},
			password: {
				type: 'String',
				required: true,
			},
			accessToken: {
				type: 'String',
			},
			refreshToken: {
				type: 'String',
			},
		},
		events: {
			onLogin: emailPasswordOnLogin,
			onSignUp: emailPasswordOnSignUp,
		},
	},
	{
		name: 'google',
		input: {
			authorizationCode: {
				type: 'String',
				required: true,
			},
			codeVerifier: {
				type: 'String',
				required: true,
			},
		},
		dataToStore: {
			idToken: {
				type: 'String',
				required: true,
			},
			email: {
				type: 'Email',
				required: true,
			},
			verifiedEmail: {
				type: 'Boolean',
				required: true,
			},
			accessToken: {
				type: 'String',
			},
			refreshToken: {
				type: 'String',
			},
		},
		events: {
			onLogin: googleOnSignInOrSignUp,
			onSignUp: googleOnSignInOrSignUp,
		},
	},
]
