<script lang="ts">
	import type { AcfTickerNumber, CoreHeading as CoreHeadingType } from  '$lib/graphql/generated'
    import { classNames } from '$lib/utilities/utilities'
	import CoreHeading from '$components/blocks/CoreHeading.svelte'

    export let block: AcfTickerNumber

    console.log('AcfTickerNumber block:', block)
    const incrementBy = block.tickerNumber?.incrementBy ?? 0
    const counter = block.currentCount ?? 1000
    const finalCount = counter + incrementBy
    const textColor = block.attributes?.textColor ?? 'black'
    
    // Function to format number with commas
    function formatNumberWithCommas(num: number): string {
        return num.toLocaleString('en-US')
    }
    
    console.log('Final count:', finalCount)
</script>

<div>
    <h1 class="{classNames('base', textColor, 'center', 'display')} header-title -mt-12">
        {formatNumberWithCommas(finalCount)}
    </h1>
</div>