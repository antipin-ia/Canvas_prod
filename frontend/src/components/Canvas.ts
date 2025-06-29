import { CanvasState, Square } from '../types/canvas';

export class Canvas {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private state: CanvasState = { squares: [], version: 0, lastEventId: '' };
  private isDragging = false;
  private draggedSquare: Square | null = null;
  private dragOffset = { x: 0, y: 0 };
  private onStateChange: (state: CanvasState) => void;
  private onCreateSquare: (x: number, y: number) => void;
  private onMoveSquare: (squareId: string, x: number, y: number) => void;
  private onDeleteSquare: (squareId: string) => void;

  constructor(
    canvas: HTMLCanvasElement,
    onStateChange: (state: CanvasState) => void,
    onCreateSquare: (x: number, y: number) => void,
    onMoveSquare: (squareId: string, x: number, y: number) => void,
    onDeleteSquare: (squareId: string) => void
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.onStateChange = onStateChange;
    this.onCreateSquare = onCreateSquare;
    this.onMoveSquare = onMoveSquare;
    this.onDeleteSquare = onDeleteSquare;

    this.setupEventListeners();
    this.resize();
  }

  private setupEventListeners(): void {
    this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
    this.canvas.addEventListener('contextmenu', this.handleContextMenu.bind(this));
    window.addEventListener('resize', this.resize.bind(this));
  }

  private resize(): void {
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
    this.draw();
  }

  private handleMouseDown(event: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const square = this.findSquareAt(x, y);
    
    if (square) {
      this.isDragging = true;
      this.draggedSquare = square;
      this.dragOffset.x = x - square.x;
      this.dragOffset.y = y - square.y;
      this.canvas.style.cursor = 'grabbing';
    } else {
      this.onCreateSquare(x, y);
    }
  }

  private handleMouseMove(event: MouseEvent): void {
    if (!this.isDragging || !this.draggedSquare) return;

    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    this.draggedSquare.x = x - this.dragOffset.x;
    this.draggedSquare.y = y - this.dragOffset.y;

    this.draw();
  }

  private handleMouseUp(event: MouseEvent): void {
    if (this.isDragging && this.draggedSquare) {
      const rect = this.canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      this.onMoveSquare(this.draggedSquare.id, x - this.dragOffset.x, y - this.dragOffset.y);
    }

    this.isDragging = false;
    this.draggedSquare = null;
    this.canvas.style.cursor = 'default';
  }

  private handleContextMenu(event: MouseEvent): void {
    event.preventDefault();
    
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const square = this.findSquareAt(x, y);
    if (square) {
      this.onDeleteSquare(square.id);
    }
  }

  private findSquareAt(x: number, y: number): Square | null {
    for (let i = this.state.squares.length - 1; i >= 0; i--) {
      const square = this.state.squares[i];
      if (
        x >= square.x &&
        x <= square.x + square.size &&
        y >= square.y &&
        y <= square.y + square.size
      ) {
        return square;
      }
    }
    return null;
  }

  updateState(newState: CanvasState): void {
    this.state = newState;
    this.draw();
    this.onStateChange(newState);
  }

  private draw(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawGrid();
    this.state.squares.forEach(square => {
      this.drawSquare(square);
    });
  }

  private drawGrid(): void {
    const gridSize = 20;
    this.ctx.strokeStyle = '#f0f0f0';
    this.ctx.lineWidth = 1;

    for (let x = 0; x <= this.canvas.width; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();
    }

    for (let y = 0; y <= this.canvas.height; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
      this.ctx.stroke();
    }
  }

  private drawSquare(square: Square): void {
    this.ctx.fillStyle = square.color;
    this.ctx.fillRect(square.x, square.y, square.size, square.size);

    this.ctx.strokeStyle = '#333';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(square.x, square.y, square.size, square.size);

    this.ctx.fillStyle = '#000';
    this.ctx.font = '12px Arial';
    this.ctx.fillText(square.id.slice(0, 8), square.x + 5, square.y + 20);
  }

  destroy(): void {
    this.canvas.removeEventListener('mousedown', this.handleMouseDown.bind(this));
    this.canvas.removeEventListener('mousemove', this.handleMouseMove.bind(this));
    this.canvas.removeEventListener('mouseup', this.handleMouseUp.bind(this));
    this.canvas.removeEventListener('contextmenu', this.handleContextMenu.bind(this));
    window.removeEventListener('resize', this.resize.bind(this));
  }
} 