import { VersionInfo } from '../types/canvas';

export class VersionHistory {
  private container: HTMLElement;
  private versions: VersionInfo[] = [];
  private onVersionSelect: (version: number) => void;

  constructor(container: HTMLElement, onVersionSelect: (version: number) => void) {
    this.container = container;
    this.onVersionSelect = onVersionSelect;
    this.render();
  }

  updateVersions(versions: VersionInfo[]): void {
    this.versions = versions;
    this.render();
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="version-history">
        <h3>История версий</h3>
        <div class="version-list">
          ${this.versions.length === 0 ? '<p>Нет версий</p>' : ''}
          ${this.versions.map(version => this.renderVersionItem(version)).join('')}
        </div>
      </div>
    `;

    this.container.querySelectorAll('.version-item').forEach((item, index) => {
      item.addEventListener('click', () => {
        this.onVersionSelect(this.versions[index].version);
      });
    });
  }

  private renderVersionItem(version: VersionInfo): string {
    const date = new Date(version.timestamp);
    const timeString = date.toLocaleTimeString();
    const dateString = date.toLocaleDateString();

    return `
      <div class="version-item" data-version="${version.version}">
        <div class="version-header">
          <span class="version-number">Версия ${version.version}</span>
          <span class="version-id">${version.id.slice(0, 8)}...</span>
        </div>
        <div class="version-time">
          <span class="date">${dateString}</span>
          <span class="time">${timeString}</span>
        </div>
      </div>
    `;
  }

  highlightVersion(version: number): void {
    this.container.querySelectorAll('.version-item').forEach(item => {
      item.classList.remove('active');
    });

    const activeItem = this.container.querySelector(`[data-version="${version}"]`);
    if (activeItem) {
      activeItem.classList.add('active');
    }
  }
} 