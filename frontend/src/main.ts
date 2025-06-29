import { SocketService } from './services/socket.service';
import { Canvas } from './components/Canvas';
import { VersionHistory } from './components/VersionHistory';
import { CanvasState, VersionInfo } from './types/canvas';

class App {
  private socketService: SocketService;
  private canvas: Canvas;
  private versionHistory: VersionHistory;
  private currentState: CanvasState = { squares: [], version: 0, lastEventId: '' };
  private selectedVersion: number | null = null;

  // DOM elements
  private statusIndicator: HTMLElement;
  private statusText: HTMLElement;
  private currentVersionEl: HTMLElement;
  private squaresCountEl: HTMLElement;
  private lastEventIdEl: HTMLElement;
  private refreshBtn: HTMLButtonElement;
  private clearBtn: HTMLButtonElement;

  constructor() {
    this.socketService = new SocketService();
    this.initializeDOM();
    this.initializeComponents();
    this.setupEventListeners();
    this.connect();
  }

  private initializeDOM(): void {
    this.statusIndicator = document.getElementById('statusIndicator')!;
    this.statusText = document.getElementById('statusText')!;
    this.currentVersionEl = document.getElementById('currentVersion')!;
    this.squaresCountEl = document.getElementById('squaresCount')!;
    this.lastEventIdEl = document.getElementById('lastEventId')!;
    this.refreshBtn = document.getElementById('refreshBtn') as HTMLButtonElement;
    this.clearBtn = document.getElementById('clearBtn') as HTMLButtonElement;
  }

  private initializeComponents(): void {
    const canvasElement = document.getElementById('canvas') as HTMLCanvasElement;
    const versionPanel = document.getElementById('versionPanel')!;

    this.canvas = new Canvas(
      canvasElement,
      this.handleStateChange.bind(this),
      this.handleCreateSquare.bind(this),
      this.handleMoveSquare.bind(this),
      this.handleDeleteSquare.bind(this)
    );

    this.versionHistory = new VersionHistory(
      versionPanel,
      this.handleVersionSelect.bind(this)
    );
  }

  private setupEventListeners(): void {
    this.refreshBtn.addEventListener('click', this.handleRefresh.bind(this));
    this.clearBtn.addEventListener('click', this.handleClear.bind(this));

    // Socket event listeners
    this.socketService.onStateUpdate(this.handleStateUpdate.bind(this));
    this.socketService.onError(this.handleError.bind(this));
  }

  private async connect(): Promise<void> {
    try {
      await this.socketService.connect();
      this.updateConnectionStatus(true);
      await this.loadInitialData();
    } catch (error) {
      console.error('Failed to connect:', error);
      this.updateConnectionStatus(false);
      this.showError('Ошибка подключения к серверу');
    }
  }

  private async loadInitialData(): Promise<void> {
    try {
      const [state, versions] = await Promise.all([
        this.socketService.getState(),
        this.socketService.getVersions()
      ]);

      this.updateState(state);
      this.versionHistory.updateVersions(versions);
    } catch (error) {
      console.error('Failed to load initial data:', error);
      this.showError('Ошибка загрузки данных');
    }
  }

  private updateConnectionStatus(connected: boolean): void {
    if (connected) {
      this.statusIndicator.classList.add('connected');
      this.statusText.textContent = 'Подключено';
    } else {
      this.statusIndicator.classList.remove('connected');
      this.statusText.textContent = 'Отключено';
    }
  }

  private updateState(state: CanvasState): void {
    this.currentState = state;
    this.canvas.updateState(state);
    this.updateUI();
  }

  private updateUI(): void {
    this.currentVersionEl.textContent = this.currentState.version.toString();
    this.squaresCountEl.textContent = this.currentState.squares.length.toString();
    this.lastEventIdEl.textContent = this.currentState.lastEventId.slice(0, 8) + '...';
  }

  private handleStateChange(state: CanvasState): void {
    this.currentState = state;
    this.updateUI();
  }

  private handleStateUpdate(state: CanvasState): void {
    this.updateState(state);
    this.selectedVersion = null;
    this.versionHistory.highlightVersion(state.version);
  }

  private async handleCreateSquare(x: number, y: number): Promise<void> {
    try {
      const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      
      await this.socketService.createSquare(x, y, 50, randomColor, this.currentState.version);
    } catch (error) {
      console.error('Failed to create square:', error);
      this.showError('Ошибка создания квадрата');
    }
  }

  private async handleMoveSquare(squareId: string, x: number, y: number): Promise<void> {
    try {
      await this.socketService.moveSquare(squareId, x, y, this.currentState.version);
    } catch (error) {
      console.error('Failed to move square:', error);
      this.showError('Ошибка перемещения квадрата');
    }
  }

  private async handleDeleteSquare(squareId: string): Promise<void> {
    try {
      await this.socketService.deleteSquare(squareId, this.currentState.version);
    } catch (error) {
      console.error('Failed to delete square:', error);
      this.showError('Ошибка удаления квадрата');
    }
  }

  private async handleVersionSelect(version: number): Promise<void> {
    try {
      this.selectedVersion = version;
      const state = await this.socketService.getState(version);
      this.updateState(state);
      this.versionHistory.highlightVersion(version);
    } catch (error) {
      console.error('Failed to load version:', error);
      this.showError('Ошибка загрузки версии');
    }
  }

  private async handleRefresh(): Promise<void> {
    try {
      await this.loadInitialData();
      this.selectedVersion = null;
    } catch (error) {
      console.error('Failed to refresh:', error);
      this.showError('Ошибка обновления');
    }
  }

  private async handleClear(): Promise<void> {
    if (confirm('Вы уверены, что хотите очистить все квадраты?')) {
      try {
        // Delete all squares
        const squaresToDelete = [...this.currentState.squares];
        for (const square of squaresToDelete) {
          await this.socketService.deleteSquare(square.id, this.currentState.version);
        }
      } catch (error) {
        console.error('Failed to clear squares:', error);
        this.showError('Ошибка очистки');
      }
    }
  }

  private handleError(error: any): void {
    console.error('Socket error:', error);
    this.showError(error.message || 'Ошибка соединения');
  }

  private showError(message: string): void {
    // Simple error notification
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #dc3545;
      color: white;
      padding: 1rem;
      border-radius: 6px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
      z-index: 1000;
      max-width: 300px;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 5000);
  }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new App();
}); 