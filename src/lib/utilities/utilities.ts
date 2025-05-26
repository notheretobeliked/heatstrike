import type { ImageSize } from '$lib/types/wp-types'

export interface HierarchicalOptions {
	idKey?: string
	parentKey?: string
	childrenKey?: string
}

export function flatListToHierarchical<T extends Record<string, any>>(
	data: T[] = [],
	{
		idKey = 'clientId',
		parentKey = 'parentClientId',
		childrenKey = 'children'
	}: HierarchicalOptions = {}
): T[] {
	console.log('Initial data:', JSON.stringify(data.filter(block => block.name === 'acf/signup-form'), null, 2))
	const tree: T[] = []
	const childrenOf: Record<string, T[]> = {}

	data.forEach((item) => {
		const newItem: T = { ...item }
		const parentId: string = newItem[parentKey] == null ? '0' : newItem[parentKey]

		childrenOf[newItem[idKey]] = childrenOf[newItem[idKey]] || []
		newItem[childrenKey] = childrenOf[newItem[idKey]]

		if (parentId !== '0') {
			childrenOf[parentId] = childrenOf[parentId] || []
			childrenOf[parentId].push(newItem)
		} else {
			tree.push(newItem)
		}
	})

	console.log('Before normalization:', JSON.stringify(tree.filter(block => block.name === 'acf/signup-form'), null, 2))
	const normalizedTree = tree.map(normalizeEditorBlock)
	console.log('After normalization:', JSON.stringify(normalizedTree.filter(block => block.name === 'acf/signup-form'), null, 2))
	return normalizedTree
}

export function normalizeEditorBlock(block: any) {
	if (block.name === 'acf/signup-form') {
		console.log('Normalizing signup form block:', JSON.stringify(block, null, 2))
	}

	// Create a copy of the block to preserve all original data
	const normalizedBlock = { ...block }

	// Ensure attributes exists before attempting to access it
	if (!normalizedBlock.attributes) {
		normalizedBlock.attributes = {} // Initialize with an empty object if it doesn't exist
	}

	if (normalizedBlock.name.startsWith('acf/')) {
		console.log('Found ACF block:', normalizedBlock.name)
		if ('alignment' in normalizedBlock.attributes) {
			// Prefer 'alignment' over 'align', but don't overwrite if 'align' already exists
			normalizedBlock.attributes.align = normalizedBlock.attributes.align || normalizedBlock.attributes.alignment
			// Remove the 'alignment' attribute to avoid confusion
			delete normalizedBlock.attributes.alignment
		}

		// For ACF blocks, preserve all non-standard properties
		const standardProps = ['name', 'attributes', 'children', 'innerBlocks', 'clientId', 'parentClientId']
		Object.keys(block).forEach(key => {
			if (!standardProps.includes(key)) {
				normalizedBlock[key] = JSON.parse(JSON.stringify(block[key])) // Deep copy
				if (key === 'signupForm') {
					console.log('Preserved signupForm data:', normalizedBlock[key])
				}
			}
		})
	}

	// Ensure the 'align' attribute is not null or an empty string
	if (!normalizedBlock.attributes.align) {
		normalizedBlock.attributes.align = '' // Set a default value for 'align'
	}

	// Check if 'style' attribute exists and is a string
	if (typeof normalizedBlock.attributes.style === 'string') {
		try {
			// Parse the 'style' string as JSON
			normalizedBlock.attributes.style = JSON.parse(normalizedBlock.attributes.style.replace(/var:preset\|/g, ''))

			// Check and transform the color within 'elements.link' after parsing
			if (
				normalizedBlock.attributes.style.elements &&
				normalizedBlock.attributes.style.elements.link &&
				normalizedBlock.attributes.style.elements.link.color &&
				normalizedBlock.attributes.style.elements.link.color.text
			) {
				// Extracting color value after '|'
				const colorValue = normalizedBlock.attributes.style.elements.link.color.text.split('|')[1]
				// Assigning the extracted color value to a new property
				normalizedBlock.attributes.textColor = colorValue
			}
		} catch (error) {
			console.error('Error parsing style attribute:', error)
			normalizedBlock.attributes.style = null // Example error handling
		}
	}

	if (typeof normalizedBlock.attributes.layout === 'string') {
		try {
			normalizedBlock.attributes.layout = JSON.parse(normalizedBlock.attributes.layout)
		} catch (error) {
			console.error('Error parsing layout attribute:', error)
			normalizedBlock.attributes.layout = null // Or handle the error as needed
		}
	}

	// Normalize child blocks recursively
	if (normalizedBlock.children) {
		normalizedBlock.children = normalizedBlock.children.map(normalizeEditorBlock)
	}

	// Move any innerBlocks into a children object instead to align with other recursive blocks
	if (normalizedBlock.innerBlocks) {
		normalizedBlock.children = normalizedBlock.innerBlocks.map(normalizeEditorBlock)
	}

	if (block.name === 'acf/signup-form') {
		console.log('Final normalized signup form block:', JSON.stringify(normalizedBlock, null, 2))
	}
	return normalizedBlock
}

export const findImageSizeData = (
	property: keyof ImageSize,
	sizes: ImageSize[],
	name: string
): string => {
	const size = sizes.find((size) => size.name === name)
	if (size && property in size) {
		return String(size[property])
	}
	return ''
}

export const getSrcSet = (sizes: ImageSize[]): string => {
	return sizes.map(({ sourceUrl, width }) => `${sourceUrl} ${width}w`).join(', ')
}
