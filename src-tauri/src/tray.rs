use tauri::menu::{Menu, MenuItem};
use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent};
use tauri::{AppHandle, Emitter, Manager, PhysicalPosition, Runtime};

pub const TRAY_ID: &str = "main-tray";
pub const TRAY_ACTION_EVENT: &str = "tray://action";

const MENU_BAR_OFFSET_PX: f64 = 28.0;
const DEFAULT_POPOVER_WIDTH: f64 = 320.0;

pub fn setup<R: Runtime>(app: &AppHandle<R>) -> tauri::Result<()> {
    let menu = Menu::with_items(
        app,
        &[
            &MenuItem::with_id(app, "toggle", "Start / Pause", true, None::<&str>)?,
            &MenuItem::with_id(app, "reset", "Reset", true, None::<&str>)?,
            &MenuItem::with_id(app, "quit", "Quit Foco", true, None::<&str>)?,
        ],
    )?;

    TrayIconBuilder::with_id(TRAY_ID)
        .title("Foco")
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_menu_event(|app, event| match event.id.as_ref() {
            "toggle" => emit_action(app, "toggle"),
            "reset" => emit_action(app, "reset"),
            "quit" => app.exit(0),
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                position,
                ..
            } = event
            {
                toggle_popover(tray.app_handle(), position.x);
            }
        })
        .build(app)?;

    Ok(())
}

pub fn set_title<R: Runtime>(app: &AppHandle<R>, title: &str) {
    if let Some(tray) = app.tray_by_id(TRAY_ID) {
        let _ = tray.set_title(Some(title));
    }
}

fn emit_action<R: Runtime>(app: &AppHandle<R>, action: &str) {
    let _ = app.emit(TRAY_ACTION_EVENT, action);
}

fn toggle_popover<R: Runtime>(app: &AppHandle<R>, click_x: f64) {
    let Some(window) = app.get_webview_window("main") else {
        return;
    };

    if window.is_visible().unwrap_or(false) {
        let _ = window.hide();
        return;
    }

    let width = window
        .outer_size()
        .map(|s| s.width as f64)
        .unwrap_or(DEFAULT_POPOVER_WIDTH);
    let x = (click_x - width / 2.0).max(0.0);
    let _ = window.set_position(PhysicalPosition::new(x, MENU_BAR_OFFSET_PX));
    let _ = window.show();
    let _ = window.set_focus();
}
