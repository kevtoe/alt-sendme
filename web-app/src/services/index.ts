/**
 * Service Provider for Updater
 * Provides platform-specific updater service
 */

import { DefaultUpdaterService } from './updater/default'
import type { UpdaterService } from './updater/types'

let updaterService: UpdaterService = new DefaultUpdaterService()

// Initialize with platform-specific implementation
async function initializeUpdaterService() {
  if (IS_TAURI && !updaterService.check.toString().includes('TauriUpdaterService')) {
    try {
      const { TauriUpdaterService } = await import('./updater/tauri')
      updaterService = new TauriUpdaterService()
    } catch (error) {
      console.warn('Failed to load Tauri updater service:', error)
    }
  }
}

// Auto-initialize
initializeUpdaterService()

export function getUpdaterService(): UpdaterService {
  return updaterService
}

