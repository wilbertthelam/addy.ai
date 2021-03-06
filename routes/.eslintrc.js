module.exports = {
    'extends': 'airbnb',
    'plugins': [
        'react'
    ],
    'rules': {
    	'no-console': 0,
    	'indent': 0,
    	'object-shorthand': 0,
    	'prefer-es6-class': 0,
    	'func-names': 0,
    	'comma-dangle': 0,
    	'prefer-arrow-callback': 0,
    	'react/prop-types': 0,
    	'react/prefer-es6-class': 0,
    	'react/jsx-indent': [1, 'tab'],
    	'react/jsx-indent-props': [1, 'tab'],
    	'react/no-multi-comp': 0,
    	'react/prefer-stateless-function': 0,
        'no-underscore-dangle': [2, { "allowAfterThis": true }],
        'prefer-template': 0,
        'no-var': 0,
        'vars-on-top': 0,
        'dot-notation': 0,
        'no-param-reassign': 0,
        'consistent-return': 0,
        'new-cap': 0,
        'block-scoped-var': 0,
        'eqeqeq': 0,


    },
    'env': {
        'browser': true,
        'node': true
    },
    'parserOptions': {
	    'ecmaFeatures': {
	      'jsx': true,
	    }
	},
};