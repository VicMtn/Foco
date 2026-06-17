use tauri::{AppHandle, Runtime};

use crate::tray;

#[tauri::command]
pub fn set_tray_title<R: Runtime>(app: AppHandle<R>, title: String) {
    tray::set_title(&app, &title);
}
