"""
AegisX SOC - SQLite Database Layer
Persistent state for incidents, telemetry, agent metrics, SOAR actions, and cryptographic audit trail.
"""
import sqlite3
import json
import hashlib
import time
from datetime import datetime, timezone
from pathlib import Path
from backend.config import DB_PATH, HMAC_SECRET

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL;")
    return conn

def init_db():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    with get_db() as conn:
        cursor = conn.cursor()

        # 1. Incidents Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS incidents (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            threat_type TEXT NOT NULL,
            severity TEXT NOT NULL,
            asset TEXT NOT NULL,
            asset_category TEXT NOT NULL,
            source TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            risk_score INTEGER NOT NULL,
            confidence_score INTEGER NOT NULL,
            assigned_agent TEXT NOT NULL,
            status TEXT NOT NULL,
            summary TEXT,
            affected_systems TEXT,
            potential_impact TEXT,
            timeline_json TEXT,
            evidence_json TEXT,
            decision_trace_json TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        # 2. Threat Events Stream
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS threat_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            source_ip TEXT NOT NULL,
            threat_type TEXT NOT NULL,
            severity TEXT NOT NULL,
            target_asset TEXT NOT NULL,
            classification TEXT NOT NULL,
            status TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        # 3. Autonomous Agents State
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS agents (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            role TEXT NOT NULL,
            status TEXT NOT NULL,
            confidence INTEGER NOT NULL,
            accuracy TEXT NOT NULL,
            latency TEXT NOT NULL,
            tasks_completed INTEGER NOT NULL,
            current_task TEXT NOT NULL,
            last_action TEXT NOT NULL,
            autonomy_level TEXT NOT NULL,
            description TEXT,
            avatar_bg TEXT,
            avatar_color TEXT,
            initials TEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        # 4. SOAR Playbook Recommendations & Approvals
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS soar_recommendations (
            id TEXT PRIMARY KEY,
            incident_id TEXT NOT NULL,
            threat_name TEXT NOT NULL,
            risk_level TEXT NOT NULL,
            ai_confidence TEXT NOT NULL,
            reason TEXT NOT NULL,
            pipeline_json TEXT NOT NULL,
            requires_human_approval BOOLEAN NOT NULL,
            approval_title TEXT NOT NULL,
            approval_details TEXT NOT NULL,
            status TEXT DEFAULT 'pending',
            execution_timestamp TEXT,
            verification_hash TEXT
        );
        """)

        # 5. Threat Intelligence IOCs
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS threat_intel (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ioc_type TEXT NOT NULL,
            value TEXT UNIQUE NOT NULL,
            provider TEXT,
            country TEXT,
            confidence INTEGER NOT NULL,
            sightings INTEGER DEFAULT 0,
            threat_actor TEXT,
            category TEXT,
            status TEXT DEFAULT 'active'
        );
        """)

        # 6. Immutable Cryptographic Audit Log
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            actor TEXT NOT NULL,
            action TEXT NOT NULL,
            target_asset TEXT NOT NULL,
            details TEXT,
            hash_signature TEXT NOT NULL
        );
        """)

        conn.commit()

def log_audit_entry(actor: str, action: str, target_asset: str, details: str = "") -> str:
    """Generates an HMAC-SHA256 tamper-evident log entry"""
    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    raw_payload = f"{timestamp}|{actor}|{action}|{target_asset}|{details}|{HMAC_SECRET}"
    signature = "sha256:" + hashlib.sha256(raw_payload.encode('utf-8')).hexdigest()

    with get_db() as conn:
        conn.execute("""
            INSERT INTO audit_logs (timestamp, actor, action, target_asset, details, hash_signature)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (timestamp, actor, action, target_asset, details, signature))
        conn.commit()

    return signature
