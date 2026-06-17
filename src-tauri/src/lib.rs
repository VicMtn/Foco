use tauri::{Manager, WindowEvent};

mod commands;
mod db;
mod tray;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            None,
        ))
        .invoke_handler(tauri::generate_handler![
            commands::set_tray_title,
            db::record_session,
            db::get_sessions,
            db::get_stats_summary,
            db::get_focus_per_day,
        ])
        .setup(|app| {
            #[cfg(target_os = "macos")]
            app.set_activation_policy(tauri::ActivationPolicy::Accessory);

            let pool = tauri::async_runtime::block_on(db::init(app.handle()))
                .map_err(|e| -> Box<dyn std::error::Error> { e.to_string().into() })?;
            app.manage(db::Db(pool));

            if let Some(window) = app.get_webview_window("main") {
                let hidden = window.clone();
                window.on_window_event(move |event| {
                    if let WindowEvent::Focused(false) = event {
                        let _ = hidden.hide();
                    }
                });
            }

            tray::setup(app.handle())?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
