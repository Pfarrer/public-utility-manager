<script lang="ts">
	/**
	 * Custom SVG line chart for 24-h curves (demand) with an optional
	 * horizontal capacity line; hours above capacity get red segments.
	 */
	let {
		curve,
		capacity = 0,
		width = 320,
		height = 140,
		title = ''
	}: {
		curve: number[];
		capacity?: number;
		width?: number;
		height?: number;
		title?: string;
	} = $props();

	const PAD = { top: 10, right: 10, bottom: 18, left: 34 };

	const maxY = $derived(Math.max(1, ...curve, capacity) * 1.1);
	const x = (i: number) => PAD.left + (i / 23) * (width - PAD.left - PAD.right);
	const y = (v: number) => height - PAD.bottom - (v / maxY) * (height - PAD.top - PAD.bottom);

	/** Path over the hour points; deficit points marked separately. */
	const points = $derived(curve.map((v, i) => ({ x: x(i), y: y(v), v, hour: i })));
	const linePath = $derived(
		points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
	);
	/** Deficit hours: demand above capacity → red overlay segments. */
	const deficitHours = $derived(
		capacity > 0
			? points
					.filter((p) => p.v > capacity)
					.map((p) => ({ ...p, yCap: y(capacity) }))
			: []
	);
	const yTicks = $derived([0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(maxY * f)));
</script>

<svg viewBox="0 0 {width} {height}" role="img" aria-label={title}>
	{#if title}<text x={PAD.left} y={12} font-size="10" fill="#888">{title}</text>{/if}
	<!-- grid + y ticks -->
	{#each yTicks as tick (tick)}
		<line x1={PAD.left} x2={width - PAD.right} y1={y(tick)} y2={y(tick)} stroke="#e2e8f0" />
		<text x={PAD.left - 4} y={y(tick) + 3} font-size="8" fill="#888" text-anchor="end">{tick}</text>
	{/each}
	<!-- x axis hours 0,6,12,18 -->
	{#each [0, 6, 12, 18, 23] as h (h)}
		<text x={x(h)} y={height - 5} font-size="8" fill="#888" text-anchor="middle">{h}</text>
	{/each}
	<!-- capacity line -->
	{#if capacity > 0}
		<line
			x1={PAD.left}
			x2={width - PAD.right}
			y1={y(capacity)}
			y2={y(capacity)}
			stroke="#7c3aed"
			stroke-dasharray="4 3"
			data-testid="capacity-line"
		/>
	{/if}
	<!-- demand line -->
	<path d={linePath} fill="none" stroke="#0369a1" stroke-width="2" data-testid="demand-line" />
	<!-- deficit segments: hour slices where demand > capacity -->
	{#each deficitHours as p (p.hour)}
		<rect
			x={p.x - 3}
			y={p.yCap}
			width="6"
			height={Math.max(0, p.y - p.yCap)}
			fill="#dc2626"
			opacity="0.55"
			data-testid="deficit-hour"
		/>
	{/each}
</svg>
