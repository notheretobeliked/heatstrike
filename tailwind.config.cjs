/** @type {import('tailwindcss').Config}*/
const config = {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		colors: {
			white: '#ffffff',
			black: '#000000',
			caution: '#e8ff4a',
			extremeCaution: '#ffa05b',
			danger: '#ff521a',
			extremeDanger: '#cd0000'
			
		},
		fontFamily: {
			anton: ['Anton', 'sans-serif'],
			sans: ['Inter', 'sans-serif'],
		},

		extend: {
		}
	},

	plugins: [
		require('tailwindcss-fluid-type')({
			settings: {
				fontSizeMin: 1.125,
				fontSizeMax: 1.25,
				ratioMin: 1.125,
				ratioMax: 1.2,
				screenMin: 20,
				screenMax: 96,
				unit: 'rem',
				prefix: 'fluid-'
			},
			values: {
				'base': [0, {
						lineHeight: 1.2,
						letterSpacing: '-0.1rem',
				}],
				'xl': [13, {
					lineHeight: 1.2,
					letterSpacing: '-0.05rem',
			}],
		}
		})
	]
}

module.exports = config
