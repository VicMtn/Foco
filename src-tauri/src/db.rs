use std::error::Error;
use std::path::PathBuf;

use serde::{Deserialize, Serialize};
use sqlx::sqlite::{SqliteConnectOptions, SqlitePool, SqlitePoolOptions};
use sqlx::Row;
use tauri::{AppHandle, Manager, Runtime, State};

const SCHEMA: &str = r#"
CREATE TABLE IF NOT EXISTS sessions (
  id            INTEGER PRIMARY KEY,
  kind          TEXT NOT NULL,
  planned_secs  INTEGER NOT NULL,
  actual_secs   INTEGER NOT NULL,
  started_at    TEXT NOT NULL,
  ended_at      TEXT NOT NULL,
  completed     INTEGER NOT NULL,
  label         TEXT
);
CREATE INDEX IF NOT EXISTS idx_sessions_started_at ON sessions(started_at);
"#;

pub struct Db(pub SqlitePool);

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SessionInput {
    pub kind: String,
    pub planned_secs: i64,
    pub actual_secs: i64,
    pub started_at: String,
    pub ended_at: String,
    pub completed: bool,
    #[serde(default)]
    pub label: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Session {
    pub id: i64,
    pub kind: String,
    pub planned_secs: i64,
    pub actual_secs: i64,
    pub started_at: String,
    pub ended_at: String,
    pub completed: bool,
    pub label: Option<String>,
}

#[derive(Debug, Default, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SessionsRange {
    #[serde(default)]
    pub from: Option<String>,
    #[serde(default)]
    pub to: Option<String>,
}

pub async fn init<R: Runtime>(
    app: &AppHandle<R>,
) -> Result<SqlitePool, Box<dyn Error + Send + Sync>> {
    let path = db_path(app)?;
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent)?;
    }
    let options = SqliteConnectOptions::new()
        .filename(&path)
        .create_if_missing(true);
    let pool = SqlitePoolOptions::new()
        .max_connections(4)
        .connect_with(options)
        .await?;
    sqlx::query(SCHEMA).execute(&pool).await?;
    Ok(pool)
}

fn db_path<R: Runtime>(app: &AppHandle<R>) -> Result<PathBuf, tauri::Error> {
    let dir = app.path().app_data_dir()?;
    Ok(dir.join("foco.db"))
}

#[tauri::command]
pub async fn record_session(
    db: State<'_, Db>,
    session: SessionInput,
) -> Result<i64, String> {
    let row = sqlx::query(
        "INSERT INTO sessions (kind, planned_secs, actual_secs, started_at, ended_at, completed, label)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
    )
    .bind(&session.kind)
    .bind(session.planned_secs)
    .bind(session.actual_secs)
    .bind(&session.started_at)
    .bind(&session.ended_at)
    .bind(i64::from(session.completed))
    .bind(session.label.as_deref())
    .execute(&db.0)
    .await
    .map_err(stringify)?;

    Ok(row.last_insert_rowid())
}

#[tauri::command]
pub async fn get_sessions(
    db: State<'_, Db>,
    range: Option<SessionsRange>,
) -> Result<Vec<Session>, String> {
    let range = range.unwrap_or_default();
    let rows = sqlx::query(
        "SELECT id, kind, planned_secs, actual_secs, started_at, ended_at, completed, label
         FROM sessions
         WHERE (?1 IS NULL OR started_at >= ?1)
           AND (?2 IS NULL OR started_at <  ?2)
         ORDER BY started_at DESC",
    )
    .bind(range.from)
    .bind(range.to)
    .fetch_all(&db.0)
    .await
    .map_err(stringify)?;

    let sessions = rows
        .into_iter()
        .map(|row| Session {
            id: row.get("id"),
            kind: row.get("kind"),
            planned_secs: row.get("planned_secs"),
            actual_secs: row.get("actual_secs"),
            started_at: row.get("started_at"),
            ended_at: row.get("ended_at"),
            completed: row.get::<i64, _>("completed") != 0,
            label: row.get("label"),
        })
        .collect();

    Ok(sessions)
}

fn stringify<E: std::fmt::Display>(err: E) -> String {
    err.to_string()
}
