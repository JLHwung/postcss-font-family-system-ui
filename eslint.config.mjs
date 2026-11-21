import { FlatCompat } from '@eslint/eslintrc';

// eslint-config-dev only ships an eslintrc config, so load it via FlatCompat
const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

export default [
	...compat.extends('dev'),
	{
		languageOptions: {
			ecmaVersion: 'latest',
		},
	},
];
