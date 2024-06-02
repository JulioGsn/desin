<script lang="ts">
	import { onMount } from 'svelte';

	interface IMessage {
		draw: {
			color: string;
			strokeSize: number;
			pathString: string;
		};
	}

	interface iDesin {
		draw: (x: number, y: number, size: number, color: string) => void;
	}

	let socket: WebSocket;

  let PATH_STRING: string = '';

	let increaseBtn: HTMLButtonElement | undefined = undefined;
	let decreaseBtn: HTMLButtonElement | undefined = undefined;
	let sizeEL: HTMLSpanElement | undefined = undefined;
	let colorEl: HTMLInputElement | undefined = undefined;
	let clearEl: HTMLElement | undefined = undefined;
	let canvasColor: HTMLElement | undefined = undefined;

	let canvas: HTMLCanvasElement | undefined = undefined;
	let ctx: CanvasRenderingContext2D;

	let size = 10;
	let isPressed = false;
	let color = 'black';
	let x: number | undefined;
	let y: number | undefined;

	function sendMessage(message: IMessage): void {
		socket.send(JSON.stringify(message));
	}

	function drawCircle(x: number, y: number, size: number, color: string) {
		if (!ctx) return;

		ctx.beginPath();
		ctx.arc(x, y, size, 0, Math.PI * 2);
		ctx.fillStyle = color;
		ctx.fill();
	}

	function drawLine(x1: number, y1: number, x2: number, y2: number, size: number, color: string) {
		if (!ctx) return;

		ctx.beginPath();
		ctx.moveTo(x1, y1);
		ctx.lineTo(x2, y2);
		ctx.strokeStyle = color;
		ctx.lineWidth = size * 2;
		ctx.stroke();
	}

	function stringtoDraw(drawString: string, size: number, color: string) {
		const coordinates = drawString.split(';');
		coordinates.pop();

		for (const p of coordinates) {
			const parts = p.split('-');
			const cx = parseInt(parts[0]);
			const cy = parseInt(parts[1]);
			desin.draw(cx, cy, size, color);
		}

    x = undefined;
    y = undefined;
	}

	const desin: iDesin = {
		draw: (x2: number, y2: number, size: number, color: string) => {
			drawCircle(x2, y2, size, color);
			drawLine(x as number, y as number, x2, y2, size, color);

			x = x2;
			y = y2;
		}
	};

	onMount(async () => {
		const canvas = document.getElementById('canvas') as HTMLCanvasElement;
		ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

		socket = new WebSocket('ws://localhost:5000/ws');
		socket.onopen = (event: Event) => {
			console.log('Connected to server');
		};

		socket.onmessage = (event: MessageEvent) => {
			console.log("Voltou => ", JSON.parse(event.data));
      const { pathString, strokeSize: size, color} = JSON.parse(event.data); 
      stringtoDraw(pathString, size, color);
		};

		socket.onerror = (event) => {
			console.log('err', event);
		};

		if (canvas === undefined) {
			console.error('Canvas is undefined');
			return;
		}

		canvas.addEventListener('mousedown', (e) => {
			isPressed = true;

			x = e.offsetX;
			y = e.offsetY;
		});

		canvas.addEventListener('mouseup', (e) => {
			isPressed = false;

			x = undefined;
			y = undefined;

      const message: IMessage = {
        draw: {
          color,
          pathString: PATH_STRING,
          strokeSize: size,
        }
      }
      
      console.log("sending message: ", message);
      sendMessage(message);

      PATH_STRING = '';
		});

		canvas.addEventListener('mousemove', (e) => {
			if (isPressed) {
				const x2 = e.offsetX;
				const y2 = e.offsetY;
				desin.draw(x2, y2, size, color);
        PATH_STRING += `${x2}-${y2};`;
			}
		});

		function updateSizeOnScreen() {
			sizeEL.innerText = size;
		}

		increaseBtn?.addEventListener('click', () => {
			size += 5;

			if (size > 50) {
				size = 50;
			}

			updateSizeOnScreen();
		});

		decreaseBtn?.addEventListener('click', () => {
			size -= 5;

			if (size < 5) {
				size = 5;
			}

			updateSizeOnScreen();
		});

		colorEl?.addEventListener('change', (e) => (color = e.target.value));

		// canvasColor.value='#ffffff'
		canvasColor?.addEventListener('change', (e) => (canvas.style.background = e.target.value));

		clearEl?.addEventListener('click', () => ctx.clearRect(0, 0, canvas.width, canvas.height));
	});
</script>

<br />

<div>
	<canvas width="400px" height="250px" id="canvas" bind:this={canvas}></canvas>
	<div class="toolbox">
		<button title="Decrease Size" class="decrease" bind:this={decreaseBtn}> -</button>
		<span title="Size" class="size" bind:this={sizeEL}>{size}</span>
		<button title="Increase Size" class="increase" bind:this={increaseBtn}>+</button>
		<div class="color-changer">
			<label for="color-picker">🖌️</label>
			<input title="Brush Color" type="color" class="color-picker color" bind:this={colorEl} />
		</div>

		<div class="color-changer">
			<label for="canvas-color">🎨</label>
			<input
				title="Canvas color"
				type="color"
				value="#ffffff"
				class="color-picker canvas-color"
				bind:this={canvasColor}
			/>
		</div>
		<button title="Clear Canvas" class="clear" bind:this={clearEl}>X</button>
	</div>
</div>

<br />
<img src="" alt="" id="gimage" />

<style>
	#canvas {
		border: 3px solid #acabab;
		border-bottom: none;
		background-color: #fff;
	}

	.toolbox {
		box-sizing: border-box;
		background-color: #262627;
		border: 2px solid;
		border-color: #acabab;
		/* border-top: none; */
		display: flex;
		width: 405px;
		padding-left: 0.25rem;
		padding-right: 0.25rem;
		color: black;
	}

	.toolbox > * {
		background-color: #464646;
		border: none;
		border-radius: 500px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-size: 1.1rem;
		font-weight: 500;
		height: 1.75rem;
		width: 1.75rem;
		margin: 0.25rem;
		cursor: pointer;
		color: white;
	}

	.toolbox > *:last-child {
		margin-left: auto;
	}
	.size {
		cursor: unset;
	}

	.color-changer {
		width: auto;
		font-size: 0.8rem;
		padding-left: 0.35rem;
		padding-right: 0.25rem;
		border-radius: 500px;
	}
	.color-picker {
		background: none;
		height: 1.75rem;
		width: 1.75rem;
		border: none;
		cursor: crosshair;
	}
	.color-picker::-webkit-color-swatch {
		border: none;
		border-radius: 10px;
		padding: 0;
	}
	.color-picker::-moz-color-swatch {
		border: none;
		border-radius: 10px;
		padding: 0;
	}

	.clear {
		border-radius: 1rem;
		font-size: 1rem;
	}
</style>
