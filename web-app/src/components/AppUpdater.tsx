/**
 * App Updater Component
 * Shows update notification with platform-specific actions
 */

import { useAppUpdater } from '@/hooks/useAppUpdater'
import { motion, AnimatePresence } from 'framer-motion'

export const AppUpdater = () => {
  const {
    updateState,
    downloadAndInstallUpdate,
    openGitHubReleases,
    setRemindMeLater,
  } = useAppUpdater()

  // Don't show if remind me later was clicked
  if (updateState.remindMeLater) return null
  if (!updateState.isUpdateAvailable) return null

  const handleUpdate = () => {
    if (typeof IS_MACOS !== 'undefined' && IS_MACOS) {
      openGitHubReleases()
    } else {
      downloadAndInstallUpdate()
    }
  }

  const isMacOS = typeof IS_MACOS !== 'undefined' && IS_MACOS

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed z-50 w-[400px] bottom-4 right-4 select-none glass-card rounded-lg shadow-lg"
        style={{ color: 'var(--app-main-view-fg)' }}
      >
        <div className="p-4">
          <div className="mb-3">
            <div className="text-base font-semibold mb-1">
              New version {updateState.updateInfo?.version} available
            </div>
            <div className="text-sm opacity-70">
              {isMacOS
                ? 'Download the latest version from GitHub'
                : 'A new update is ready to install'}
            </div>
          </div>

          {updateState.isDownloading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-3"
            >
              <div className="flex justify-between text-sm mb-2">
                <span>Downloading...</span>
                <span>{Math.round(updateState.downloadProgress * 100)}%</span>
              </div>
              <div
                className="w-full rounded-full h-1.5 overflow-hidden"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: 'var(--app-primary)' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${updateState.downloadProgress * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>
          )}

          {!updateState.isDownloading && updateState.downloadProgress === 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-3 text-sm"
              style={{ color: 'var(--app-primary)' }}
            >
              ✓ Update downloaded. Restarting app...
            </motion.div>
          )}

          <div className="flex items-center justify-between gap-2">
            <button
              onClick={openGitHubReleases}
              className="text-xs opacity-60 hover:opacity-100 transition-opacity underline"
              style={{ color: 'var(--app-main-view-fg)' }}
            >
              View release notes →
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setRemindMeLater(true)}
                disabled={updateState.isDownloading}
                className="px-3 py-1.5 text-sm rounded-md opacity-70 hover:opacity-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                style={{
                  color: 'var(--app-main-view-fg)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                }}
              >
                Later
              </button>
              <button
                onClick={handleUpdate}
                disabled={updateState.isDownloading}
                className="px-4 py-1.5 text-sm rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:opacity-90"
                style={{
                  backgroundColor: 'var(--app-primary)',
                  color: 'var(--app-primary-fg)',
                }}
              >
                {updateState.isDownloading
                  ? 'Downloading...'
                  : isMacOS
                  ? 'Download'
                  : 'Update now'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

