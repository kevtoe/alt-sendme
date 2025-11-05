/**
 * App Updater Hook
 * Handles update checking, downloading, and installation
 * Platform-specific behavior: Windows/Linux auto-update, macOS opens GitHub
 */

import { useState, useCallback } from 'react'
import type { UpdateInfo } from '@/services/updater/types'
import { getUpdaterService } from '@/services'
import { invoke } from '@tauri-apps/api/core'

export interface UpdateState {
  isUpdateAvailable: boolean
  updateInfo: UpdateInfo | null
  isDownloading: boolean
  downloadProgress: number
  downloadedBytes: number
  totalBytes: number
  remindMeLater: boolean
}

const isDev = () => {
  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
}

export const useAppUpdater = () => {
  const [updateState, setUpdateState] = useState<UpdateState>({
    isUpdateAvailable: false,
    updateInfo: null,
    isDownloading: false,
    downloadProgress: 0,
    downloadedBytes: 0,
    totalBytes: 0,
    remindMeLater: false,
  })

  const checkForUpdate = useCallback(
    async (resetRemindMeLater = false) => {
      if (typeof AUTO_UPDATER_DISABLED !== 'undefined' && AUTO_UPDATER_DISABLED) {
        console.log('Auto updater is disabled')
        return null
      }

      try {
        if (resetRemindMeLater) {
          setUpdateState((prev) => ({
            ...prev,
            remindMeLater: false,
          }))
        }

        if (!isDev()) {
          const update = await getUpdaterService().check()

          if (update) {
            setUpdateState((prev) => ({
              ...prev,
              isUpdateAvailable: true,
              remindMeLater: false,
              updateInfo: update,
            }))
            console.log('Update available:', update.version)
            return update
          } else {
            setUpdateState((prev) => ({
              ...prev,
              isUpdateAvailable: false,
              updateInfo: null,
            }))
            return null
          }
        } else {
          setUpdateState((prev) => ({
            ...prev,
            isUpdateAvailable: false,
            updateInfo: null,
          }))
          return null
        }
      } catch (error) {
        console.error('Error checking for updates:', error)
        setUpdateState((prev) => ({
          ...prev,
          isUpdateAvailable: false,
          updateInfo: null,
        }))
        return null
      }
    },
    []
  )

  const setRemindMeLater = useCallback((remind: boolean) => {
    setUpdateState((prev) => ({
      ...prev,
      remindMeLater: remind,
    }))
  }, [])

  const openGitHubReleases = useCallback(async () => {
    try {
      // Use shell plugin to open URL in browser
      await invoke('plugin:shell|open', {
        path: 'https://github.com/tonyantony300/alt-sendme/releases/latest',
      })
      setRemindMeLater(true)
    } catch (error) {
      console.error('Error opening GitHub releases:', error)
      // Fallback to window.open if invoke fails
      if (typeof window !== 'undefined') {
        window.open('https://github.com/tonyantony300/alt-sendme/releases/latest', '_blank')
      }
    }
  }, [setRemindMeLater])

  const downloadAndInstallUpdate = useCallback(async () => {
    if (typeof AUTO_UPDATER_DISABLED !== 'undefined' && AUTO_UPDATER_DISABLED) {
      console.log('Auto updater is disabled')
      return
    }

    // macOS users should use GitHub releases
    if (typeof IS_MACOS !== 'undefined' && IS_MACOS) {
      await openGitHubReleases()
      return
    }

    if (!updateState.updateInfo) return

    try {
      setUpdateState((prev) => ({
        ...prev,
        isDownloading: true,
      }))

      let downloaded = 0
      let contentLength = 0

      await getUpdaterService().downloadAndInstallWithProgress((event) => {
        switch (event.event) {
          case 'Started':
            contentLength = event.data?.contentLength || 0
            setUpdateState((prev) => ({
              ...prev,
              totalBytes: contentLength,
            }))
            console.log(`Started downloading ${contentLength} bytes`)
            break
          case 'Progress': {
            downloaded += event.data?.chunkLength || 0
            const progress = contentLength > 0 ? downloaded / contentLength : 0
            setUpdateState((prev) => ({
              ...prev,
              downloadProgress: progress,
              downloadedBytes: downloaded,
            }))
            console.log(`Downloaded ${downloaded} from ${contentLength}`)
            break
          }
          case 'Finished':
            console.log('Download finished')
            setUpdateState((prev) => ({
              ...prev,
              isDownloading: false,
              downloadProgress: 1,
            }))
            break
        }
      })

      console.log('Update installed')
    } catch (error) {
      console.error('Error downloading update:', error)
      setUpdateState((prev) => ({
        ...prev,
        isDownloading: false,
      }))
    }
  }, [updateState.updateInfo, openGitHubReleases])

  return {
    updateState,
    checkForUpdate,
    downloadAndInstallUpdate,
    openGitHubReleases,
    setRemindMeLater,
  }
}

