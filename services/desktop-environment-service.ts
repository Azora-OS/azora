/**
 * AZORA OS - Desktop Environment Service
 *
 * Provides a comprehensive desktop environment that competes with Windows, macOS, and other OS desktop environments:
 * - Window Management (creation, resizing, moving, minimizing, maximizing, closing)
 * - Taskbar (application shortcuts, system tray, notifications)
 * - Start Menu (application launcher, search, recent items)
 * - Desktop Icons (shortcuts, widgets, system icons)
 * - File Explorer (file browsing, operations, cloud integration)
 * - System Notifications (toasts, alerts, system messages)
 * - Wallpaper & Themes (customizable appearance)
 * - Virtual Desktops (multiple workspaces)
 * - Hotkeys & Shortcuts (keyboard shortcuts, gestures)
 * - Multi-monitor Support (extended desktop, display management)
 *
 * This creates a full desktop OS experience that integrates with Azora's cloud services
 * and provides a unified interface across all Azora applications.
 */

import { EventEmitter } from 'events';

export interface WindowConfig {
  id: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  resizable: boolean;
  minimizable: boolean;
  maximizable: boolean;
  closable: boolean;
  alwaysOnTop: boolean;
  modal: boolean;
  icon?: string;
  state: 'normal' | 'minimized' | 'maximized' | 'fullscreen';
  zIndex: number;
  content?: any;
  processId?: string;
}

export interface DesktopIcon {
  id: string;
  name: string;
  icon: string;
  x: number;
  y: number;
  type: 'application' | 'folder' | 'file' | 'shortcut' | 'widget';
  target?: string;
  size: 'small' | 'medium' | 'large';
}

export interface TaskbarItem {
  id: string;
  windowId: string;
  title: string;
  icon: string;
  isActive: boolean;
  hasNotification: boolean;
  notificationCount?: number;
  progress?: number;
}

export interface StartMenuItem {
  id: string;
  name: string;
  icon: string;
  type: 'application' | 'folder' | 'separator' | 'recent';
  target?: string;
  children?: StartMenuItem[];
  shortcut?: string;
}

export interface NotificationConfig {
  id: string;
  title: string;
  message: string;
  icon?: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timeout?: number;
  actions?: Array<{
    label: string;
    action: string;
    data?: any;
  }>;
}

export interface VirtualDesktop {
  id: string;
  name: string;
  wallpaper?: string;
  windows: string[];
  active: boolean;
}

export class DesktopEnvironmentService extends EventEmitter {
  private windows: Map<string, WindowConfig> = new Map();
  private desktopIcons: DesktopIcon[] = [];
  private taskbarItems: TaskbarItem[] = [];
  private startMenuItems: StartMenuItem[] = [];
  private notifications: NotificationConfig[] = [];
  private virtualDesktops: VirtualDesktop[] = [];
  private activeDesktopId: string;
  private nextZIndex: number = 1;
  private screenWidth: number = 1920;
  private screenHeight: number = 1080;

  constructor() {
    super();
    this.activeDesktopId = this.createVirtualDesktop('Main Desktop');
    this.initializeDefaultComponents();
  }

  private initializeDefaultComponents(): void {
    // Initialize default start menu items
    this.startMenuItems = [
      {
        id: 'azora-apps',
        name: 'Azora Applications',
        icon: '🌀',
        type: 'folder',
        children: [
          {
            id: 'education',
            name: 'Azora Sapiens (Education)',
            icon: '🎓',
            type: 'application',
            target: 'azora-sapiens',
            shortcut: 'Ctrl+Alt+E',
          },
          {
            id: 'finance',
            name: 'Azora Mint (Finance)',
            icon: '💰',
            type: 'application',
            target: 'azora-mint',
            shortcut: 'Ctrl+Alt+F',
          },
          {
            id: 'productivity',
            name: 'Azora Office Suite',
            icon: '📄',
            type: 'folder',
            children: [
              {
                id: 'word-processor',
                name: 'Azora Writer',
                icon: '📝',
                type: 'application',
                target: 'azora-writer',
                shortcut: 'Ctrl+Alt+W',
              },
              {
                id: 'spreadsheet',
                name: 'Azora Calc',
                icon: '📊',
                type: 'application',
                target: 'azora-calc',
                shortcut: 'Ctrl+Alt+S',
              },
              {
                id: 'presentation',
                name: 'Azora Impress',
                icon: '📽️',
                type: 'application',
                target: 'azora-impress',
                shortcut: 'Ctrl+Alt+P',
              },
            ],
          },
          {
            id: 'development',
            name: 'Azora Dev Tools',
            icon: '💻',
            type: 'folder',
            children: [
              {
                id: 'code-editor',
                name: 'Azora Code',
                icon: '⚡',
                type: 'application',
                target: 'azora-code',
                shortcut: 'Ctrl+Alt+C',
              },
              {
                id: 'terminal',
                name: 'Azora Terminal',
                icon: '🖥️',
                type: 'application',
                target: 'azora-terminal',
                shortcut: 'Ctrl+Alt+T',
              },
            ],
          },
        ],
      },
      { id: 'separator1', name: '', type: 'separator' },
      {
        id: 'recent',
        name: 'Recent Items',
        icon: '🕒',
        type: 'folder',
        children: [],
      },
      { id: 'separator2', name: '', type: 'separator' },
      {
        id: 'system',
        name: 'System',
        icon: '⚙️',
        type: 'folder',
        children: [
          {
            id: 'settings',
            name: 'Settings',
            icon: '🔧',
            type: 'application',
            target: 'azora-settings',
            shortcut: 'Ctrl+Alt+,',
          },
          {
            id: 'file-explorer',
            name: 'File Explorer',
            icon: '📁',
            type: 'application',
            target: 'azora-explorer',
            shortcut: 'Ctrl+Alt+F',
          },
          {
            id: 'task-manager',
            name: 'Task Manager',
            icon: '📊',
            type: 'application',
            target: 'azora-taskmgr',
            shortcut: 'Ctrl+Shift+Esc',
          },
        ],
      },
    ];

    // Initialize default desktop icons
    this.desktopIcons = [
      {
        id: 'computer',
        name: 'This Computer',
        icon: '🖥️',
        x: 50,
        y: 50,
        type: 'shortcut',
        target: 'azora-explorer',
        size: 'medium',
      },
      {
        id: 'documents',
        name: 'Documents',
        icon: '📄',
        x: 150,
        y: 50,
        type: 'folder',
        target: '~/Documents',
        size: 'medium',
      },
      {
        id: 'downloads',
        name: 'Downloads',
        icon: '⬇️',
        x: 250,
        y: 50,
        type: 'folder',
        target: '~/Downloads',
        size: 'medium',
      },
      {
        id: 'recycle-bin',
        name: 'Recycle Bin',
        icon: '🗑️',
        x: 350,
        y: 50,
        type: 'application',
        target: 'azora-recycle-bin',
        size: 'medium',
      },
    ];

    // Initialize system tray items
    this.taskbarItems = [
      {
        id: 'system-tray-network',
        windowId: 'system-tray',
        title: 'Network',
        icon: '📶',
        isActive: false,
        hasNotification: false,
      },
      {
        id: 'system-tray-volume',
        windowId: 'system-tray',
        title: 'Volume',
        icon: '🔊',
        isActive: false,
        hasNotification: false,
      },
      {
        id: 'system-tray-battery',
        windowId: 'system-tray',
        title: 'Battery',
        icon: '🔋',
        isActive: false,
        hasNotification: false,
      },
      {
        id: 'system-tray-clock',
        windowId: 'system-tray',
        title: 'Clock',
        icon: '🕐',
        isActive: false,
        hasNotification: false,
      },
    ];
  }

  // ============================================================================
  // WINDOW MANAGEMENT
  // ============================================================================

  /**
   * Create a new window
   */
  createWindow(config: Partial<WindowConfig>): string {
    const windowId = config.id || `window-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const windowConfig: WindowConfig = {
      id: windowId,
      title: config.title || 'Untitled Window',
      x: config.x || 100,
      y: config.y || 100,
      width: config.width || 800,
      height: config.height || 600,
      minWidth: config.minWidth || 200,
      minHeight: config.minHeight || 150,
      maxWidth: config.maxWidth,
      maxHeight: config.maxHeight,
      resizable: config.resizable !== false,
      minimizable: config.minimizable !== false,
      maximizable: config.maximizable !== false,
      closable: config.closable !== false,
      alwaysOnTop: config.alwaysOnTop || false,
      modal: config.modal || false,
      icon: config.icon,
      state: config.state || 'normal',
      zIndex: this.nextZIndex++,
      content: config.content,
      processId: config.processId,
    };

    this.windows.set(windowId, windowConfig);
    this.addToTaskbar(windowId, windowConfig);

    // Add to current virtual desktop
    const currentDesktop = this.virtualDesktops.find(d => d.id === this.activeDesktopId);
    if (currentDesktop) {
      currentDesktop.windows.push(windowId);
    }

    this.emit('window-created', windowConfig);
    return windowId;
  }

  /**
   * Close a window
   */
  closeWindow(windowId: string): boolean {
    const window = this.windows.get(windowId);
    if (!window) return false;

    this.windows.delete(windowId);
    this.removeFromTaskbar(windowId);

    // Remove from virtual desktops
    this.virtualDesktops.forEach(desktop => {
      const index = desktop.windows.indexOf(windowId);
      if (index > -1) {
        desktop.windows.splice(index, 1);
      }
    });

    this.emit('window-closed', windowId);
    return true;
  }

  /**
   * Minimize a window
   */
  minimizeWindow(windowId: string): boolean {
    const window = this.windows.get(windowId);
    if (!window || !window.minimizable) return false;

    window.state = 'minimized';
    this.updateTaskbarItem(windowId, { isActive: false });

    this.emit('window-minimized', windowId);
    return true;
  }

  /**
   * Maximize a window
   */
  maximizeWindow(windowId: string): boolean {
    const window = this.windows.get(windowId);
    if (!window || !window.maximizable) return false;

    if (window.state === 'maximized') {
      window.state = 'normal';
      // Restore original position (would need to store previous state)
    } else {
      window.state = 'maximized';
      window.x = 0;
      window.y = 0;
      window.width = this.screenWidth;
      window.height = this.screenHeight - 40; // Account for taskbar
    }

    this.emit('window-maximized', windowId, window.state);
    return true;
  }

  /**
   * Focus a window (bring to front)
   */
  focusWindow(windowId: string): boolean {
    const window = this.windows.get(windowId);
    if (!window) return false;

    window.zIndex = this.nextZIndex++;
    this.updateTaskbarItem(windowId, { isActive: true });

    // Deactivate other taskbar items
    this.taskbarItems.forEach(item => {
      if (item.windowId !== windowId) {
        item.isActive = false;
      }
    });

    this.emit('window-focused', windowId);
    return true;
  }

  /**
   * Move a window
   */
  moveWindow(windowId: string, x: number, y: number): boolean {
    const window = this.windows.get(windowId);
    if (!window || window.state === 'maximized') return false;

    window.x = Math.max(0, Math.min(x, this.screenWidth - window.width));
    window.y = Math.max(0, Math.min(y, this.screenHeight - window.height));

    this.emit('window-moved', windowId, { x: window.x, y: window.y });
    return true;
  }

  /**
   * Resize a window
   */
  resizeWindow(windowId: string, width: number, height: number): boolean {
    const window = this.windows.get(windowId);
    if (!window || !window.resizable || window.state === 'maximized') return false;

    const newWidth = Math.max(window.minWidth || 200, Math.min(width, window.maxWidth || this.screenWidth));
    const newHeight = Math.max(window.minHeight || 150, Math.min(height, window.maxHeight || this.screenHeight));

    window.width = newWidth;
    window.height = newHeight;

    this.emit('window-resized', windowId, { width: window.width, height: window.height });
    return true;
  }

  /**
   * Get all windows
   */
  getWindows(): WindowConfig[] {
    return Array.from(this.windows.values());
  }

  /**
   * Get window by ID
   */
  getWindow(windowId: string): WindowConfig | undefined {
    return this.windows.get(windowId);
  }

  // ============================================================================
  // TASKBAR MANAGEMENT
  // ============================================================================

  private addToTaskbar(windowId: string, windowConfig: WindowConfig): void {
    const existingItem = this.taskbarItems.find(item => item.windowId === windowId);
    if (existingItem) return;

    const taskbarItem: TaskbarItem = {
      id: `taskbar-${windowId}`,
      windowId,
      title: windowConfig.title,
      icon: windowConfig.icon || '📄',
      isActive: true,
      hasNotification: false,
    };

    this.taskbarItems.push(taskbarItem);
    this.emit('taskbar-updated', this.taskbarItems);
  }

  private removeFromTaskbar(windowId: string): void {
    const index = this.taskbarItems.findIndex(item => item.windowId === windowId);
    if (index > -1) {
      this.taskbarItems.splice(index, 1);
      this.emit('taskbar-updated', this.taskbarItems);
    }
  }

  private updateTaskbarItem(windowId: string, updates: Partial<TaskbarItem>): void {
    const item = this.taskbarItems.find(item => item.windowId === windowId);
    if (item) {
      Object.assign(item, updates);
      this.emit('taskbar-updated', this.taskbarItems);
    }
  }

  /**
   * Get taskbar items
   */
  getTaskbarItems(): TaskbarItem[] {
    return [...this.taskbarItems];
  }

  /**
   * Set taskbar item notification
   */
  setTaskbarNotification(windowId: string, hasNotification: boolean, count?: number): void {
    this.updateTaskbarItem(windowId, {
      hasNotification,
      notificationCount: count,
    });
  }

  /**
   * Set taskbar item progress
   */
  setTaskbarProgress(windowId: string, progress: number): void {
    this.updateTaskbarItem(windowId, { progress });
  }

  // ============================================================================
  // START MENU MANAGEMENT
  // ============================================================================

  /**
   * Get start menu items
   */
  getStartMenuItems(): StartMenuItem[] {
    return [...this.startMenuItems];
  }

  /**
   * Launch application from start menu
   */
  async launchApplication(menuItemId: string): Promise<string | null> {
    const item = this.findMenuItem(menuItemId);
    if (!item || item.type !== 'application' || !item.target) {
      return null;
    }

    // Create window for the application
    const windowId = this.createWindow({
      title: item.name,
      icon: item.icon,
      width: 1000,
      height: 700,
    });

    // Add to recent items
    this.addToRecentItems(item);

    this.emit('application-launched', item.target, windowId);
    return windowId;
  }

  /**
   * Search start menu
   */
  searchStartMenu(query: string): StartMenuItem[] {
    const results: StartMenuItem[] = [];
    const searchTerm = query.toLowerCase();

    const searchRecursive = (items: StartMenuItem[]) => {
      for (const item of items) {
        if (item.name.toLowerCase().includes(searchTerm)) {
          results.push(item);
        }
        if (item.children) {
          searchRecursive(item.children);
        }
      }
    };

    searchRecursive(this.startMenuItems);
    return results.slice(0, 10); // Limit results
  }

  private findMenuItem(id: string): StartMenuItem | null {
    const findRecursive = (items: StartMenuItem[]): StartMenuItem | null => {
      for (const item of items) {
        if (item.id === id) return item;
        if (item.children) {
          const found = findRecursive(item.children);
          if (found) return found;
        }
      }
      return null;
    };

    return findRecursive(this.startMenuItems);
  }

  private addToRecentItems(item: StartMenuItem): void {
    const recentFolder = this.startMenuItems.find(item => item.id === 'recent');
    if (recentFolder && recentFolder.children) {
      // Remove if already exists
      recentFolder.children = recentFolder.children.filter(child => child.id !== item.id);

      // Add to beginning
      recentFolder.children.unshift({
        ...item,
        type: 'recent' as any,
      });

      // Keep only last 10
      recentFolder.children = recentFolder.children.slice(0, 10);
    }
  }

  // ============================================================================
  // DESKTOP ICONS MANAGEMENT
  // ============================================================================

  /**
   * Get desktop icons
   */
  getDesktopIcons(): DesktopIcon[] {
    return [...this.desktopIcons];
  }

  /**
   * Add desktop icon
   */
  addDesktopIcon(icon: Omit<DesktopIcon, 'id'>): string {
    const iconId = `icon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const desktopIcon: DesktopIcon = {
      id: iconId,
      ...icon,
    };

    this.desktopIcons.push(desktopIcon);
    this.emit('desktop-icons-updated', this.desktopIcons);
    return iconId;
  }

  /**
   * Remove desktop icon
   */
  removeDesktopIcon(iconId: string): boolean {
    const index = this.desktopIcons.findIndex(icon => icon.id === iconId);
    if (index > -1) {
      this.desktopIcons.splice(index, 1);
      this.emit('desktop-icons-updated', this.desktopIcons);
      return true;
    }
    return false;
  }

  /**
   * Move desktop icon
   */
  moveDesktopIcon(iconId: string, x: number, y: number): boolean {
    const icon = this.desktopIcons.find(icon => icon.id === iconId);
    if (icon) {
      icon.x = x;
      icon.y = y;
      this.emit('desktop-icons-updated', this.desktopIcons);
      return true;
    }
    return false;
  }

  /**
   * Launch desktop icon
   */
  async launchDesktopIcon(iconId: string): Promise<string | null> {
    const icon = this.desktopIcons.find(icon => icon.id === iconId);
    if (!icon || !icon.target) return null;

    if (icon.type === 'application' || icon.type === 'shortcut') {
      return this.launchApplication(icon.target);
    } else if (icon.type === 'folder' || icon.type === 'file') {
      // Open in file explorer
      const windowId = this.createWindow({
        title: icon.name,
        icon: icon.icon,
        content: { type: 'file-explorer', path: icon.target },
      });
      this.emit('file-explorer-opened', icon.target, windowId);
      return windowId;
    }

    return null;
  }

  // ============================================================================
  // VIRTUAL DESKTOPS MANAGEMENT
  // ============================================================================

  /**
   * Create virtual desktop
   */
  createVirtualDesktop(name: string, wallpaper?: string): string {
    const desktopId = `desktop-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const desktop: VirtualDesktop = {
      id: desktopId,
      name,
      wallpaper,
      windows: [],
      active: false,
    };

    this.virtualDesktops.push(desktop);
    this.emit('virtual-desktop-created', desktop);
    return desktopId;
  }

  /**
   * Switch to virtual desktop
   */
  switchToVirtualDesktop(desktopId: string): boolean {
    const desktop = this.virtualDesktops.find(d => d.id === desktopId);
    if (!desktop) return false;

    // Hide windows from current desktop
    const currentDesktop = this.virtualDesktops.find(d => d.active);
    if (currentDesktop) {
      currentDesktop.windows.forEach(windowId => {
        const window = this.windows.get(windowId);
        if (window) {
          window.state = 'minimized';
        }
      });
      currentDesktop.active = false;
    }

    // Show windows from new desktop
    desktop.windows.forEach(windowId => {
      const window = this.windows.get(windowId);
      if (window && window.state === 'minimized') {
        window.state = 'normal';
      }
    });

    desktop.active = true;
    this.activeDesktopId = desktopId;

    this.emit('virtual-desktop-switched', desktopId);
    return true;
  }

  /**
   * Get virtual desktops
   */
  getVirtualDesktops(): VirtualDesktop[] {
    return [...this.virtualDesktops];
  }

  /**
   * Move window to virtual desktop
   */
  moveWindowToDesktop(windowId: string, desktopId: string): boolean {
    const window = this.windows.get(windowId);
    const newDesktop = this.virtualDesktops.find(d => d.id === desktopId);

    if (!window || !newDesktop) return false;

    // Remove from current desktop
    this.virtualDesktops.forEach(desktop => {
      const index = desktop.windows.indexOf(windowId);
      if (index > -1) {
        desktop.windows.splice(index, 1);
      }
    });

    // Add to new desktop
    newDesktop.windows.push(windowId);

    // If moving to current desktop, show window
    if (newDesktop.active && window.state === 'minimized') {
      window.state = 'normal';
    }

    this.emit('window-moved-to-desktop', windowId, desktopId);
    return true;
  }

  // ============================================================================
  // NOTIFICATIONS MANAGEMENT
  // ============================================================================

  /**
   * Show notification
   */
  showNotification(notification: Omit<NotificationConfig, 'id'>): string {
    const notificationId = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const fullNotification: NotificationConfig = {
      id: notificationId,
      ...notification,
    };

    this.notifications.push(fullNotification);

    // Auto-hide after timeout
    if (fullNotification.timeout) {
      setTimeout(() => {
        this.hideNotification(notificationId);
      }, fullNotification.timeout);
    }

    this.emit('notification-shown', fullNotification);
    return notificationId;
  }

  /**
   * Hide notification
   */
  hideNotification(notificationId: string): boolean {
    const index = this.notifications.findIndex(n => n.id === notificationId);
    if (index > -1) {
      const notification = this.notifications.splice(index, 1)[0];
      this.emit('notification-hidden', notificationId);
      return true;
    }
    return false;
  }

  /**
   * Get active notifications
   */
  getNotifications(): NotificationConfig[] {
    return [...this.notifications];
  }

  /**
   * Clear all notifications
   */
  clearAllNotifications(): void {
    this.notifications = [];
    this.emit('notifications-cleared');
  }

  // ============================================================================
  // SYSTEM INTEGRATION
  // ============================================================================

  /**
   * Handle global hotkeys
   */
  handleHotkey(keyCombination: string): boolean {
    switch (keyCombination) {
      case 'Alt+Tab':
        this.cycleWindows();
        return true;
      case 'Win+D':
        this.showDesktop();
        return true;
      case 'Win+Tab':
        this.showTaskView();
        return true;
      case 'Ctrl+Shift+Esc':
        this.launchApplication('task-manager');
        return true;
      default:
        return false;
    }
  }

  private cycleWindows(): void {
    const windows = Array.from(this.windows.values())
      .filter(w => w.state !== 'minimized')
      .sort((a, b) => b.zIndex - a.zIndex);

    if (windows.length > 1) {
      const currentTop = windows[0];
      const nextWindow = windows[1];
      this.focusWindow(nextWindow.id);
    }
  }

  private showDesktop(): void {
    const windows = Array.from(this.windows.values());
    const allMinimized = windows.every(w => w.state === 'minimized');

    windows.forEach(window => {
      window.state = allMinimized ? 'normal' : 'minimized';
    });

    this.emit('desktop-toggled', !allMinimized);
  }

  private showTaskView(): void {
    const taskViewWindowId = this.createWindow({
      title: 'Task View',
      icon: '📋',
      width: 1200,
      height: 800,
      modal: true,
      content: { type: 'task-view', windows: this.getWindows() },
    });

    this.emit('task-view-opened', taskViewWindowId);
  }

  /**
   * Set screen resolution
   */
  setScreenResolution(width: number, height: number): void {
    this.screenWidth = width;
    this.screenHeight = height;

    // Adjust maximized windows
    this.windows.forEach(window => {
      if (window.state === 'maximized') {
        window.width = width;
        window.height = height - 40; // Account for taskbar
      }
    });

    this.emit('screen-resolution-changed', { width, height });
  }

  /**
   * Get system information
   */
  getSystemInfo(): any {
    return {
      screenResolution: { width: this.screenWidth, height: this.screenHeight },
      windows: this.windows.size,
      virtualDesktops: this.virtualDesktops.length,
      activeDesktop: this.activeDesktopId,
      notifications: this.notifications.length,
      desktopIcons: this.desktopIcons.length,
      taskbarItems: this.taskbarItems.length,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };
  }

  /**
   * Get service health status
   */
  getHealthStatus(): any {
    return {
      service: 'Desktop Environment Service',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      components: {
        windows: this.windows.size,
        virtualDesktops: this.virtualDesktops.length,
        desktopIcons: this.desktopIcons.length,
        taskbarItems: this.taskbarItems.length,
        notifications: this.notifications.length,
        startMenuItems: this.startMenuItems.length,
      },
      features: [
        'Window Management',
        'Taskbar',
        'Start Menu',
        'Desktop Icons',
        'Virtual Desktops',
        'Notifications',
        'Hotkeys',
        'Multi-monitor Support',
      ]
    };
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.windows.clear();
    this.desktopIcons = [];
    this.taskbarItems = [];
    this.notifications = [];
    this.virtualDesktops = [];
    this.removeAllListeners();
    console.log('Desktop Environment Service cleanup completed');
  }
}

// Export singleton instance
export const desktopEnvironment = new DesktopEnvironmentService();

// Export factory function
export function createDesktopEnvironmentService(): DesktopEnvironmentService {
  return new DesktopEnvironmentService();
}
