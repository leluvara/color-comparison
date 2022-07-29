import './app.css'

import UAParser from 'ua-parser-js'

import Color from 'colorjs.io'

import postcss from 'postcss'
import postcssLabFunction from 'postcss-lab-function'
import postcssOKLabFunction from '@csstools/postcss-oklab-function'

import { html, render } from 'uhtml'

const test = '#29f',
	COUNT = 9,
	variants = new Array(COUNT).fill(0),
	// Lightness formula
	formula = (i) => 40 - 5 * i,
	ua = new UAParser().getResult(),
	items = [
		{
			id: 'postcss-lch',
			package: 'postcss-lab-function',
			ver: '4.2.1',
			func: 'LCh'
		},
		{
			id: 'colorjs-lch',
			package: 'Color.js',
			ver: '0.3.0',
			func: 'LCh'
		},
		{
			// At the time of writing only Safari supports lch()
			id: 'browser-lch',
			package: ua.browser.name,
			ver: ua.browser.version,
			func: 'LCh'
		},
		{
			id: 'postcss-oklch',
			package: 'postcss-oklab-function',
			ver: '1.1.1',
			func: 'OKLCh'
		},
		{
			id: 'colorjs-oklch',
			package: 'Color.js',
			ver: '0.3.0',
			func: 'OKLCh'
		}
	]

document.body.style.setProperty(`--test`, test)
document.body.style.setProperty(`--items`, items.length + 1)

// Generate CSS custom properties
const style = async () => {
	let css = ':root {',
		src = ':root {'

	for (const item of items) {
		const tokens = item.id.split('-')

		for (let i = 0; i < COUNT; i++) {
			// Divide lightness by 100 if OKLCh
			const unit = tokens[1] === 'oklch' ? 100 : 1

			// Create Color.js instance of test
			const color = new Color(test)

			// Set lightness with formula()
			color[tokens[1]]['l'] = formula(i) / unit

			// Gamut
			// color.toGamut({ method: 'clip' })

			let value

			if (tokens[0] === 'colorjs') {
				value = color.toString()
			} else {
				value = color.to(tokens[1]).toString()
			}

			let declaration = `--${item.id}-${i}: ${value};`

			if (tokens[0] === 'postcss') {
				src += declaration
			} else {
				css += declaration
			}
		}
	}

	css += '}'
	src += '}'

	const post = await postcss([
		postcssLabFunction,
		postcssOKLabFunction
	]).process(src, { from: undefined })

	return css + post.css
}

;(async () => {
	const variables = await style()

	render(
		document.body,
		html`
			<style>
				${variables}
			</style>
			<div id="app">
				<div class="test">${test}</div>
				<div></div>
				${items.map((item) => html`<div>${item.package}</div>`)}
				<div class="tab"></div>
				${items.map((item) => html`<div class="tab">${item.ver}</div>`)}
				<div class="end">Lightness</div>
				${items.map((item) => html`<div>${item.func}</div>`)}
				${variants.map(
					(variant, i) => html`<div class="end">${formula(i)}</div>
						${items.map(
							(item) =>
								html`<div
									style="${'background-color: var(--' +
									item.id +
									'-' +
									i +
									')'}"
								></div>`
						)}`
				)}
			</div>
		`
	)
})()
