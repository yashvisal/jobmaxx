import psycopg2
import os
import json
from datetime import datetime

def get_db_connection():
    """Get database connection."""
    return psycopg2.connect(os.getenv("DATABASE_URL"))

def add_message(thread_id: int, role: str, content: str, message_type: str = "text", metadata: dict = None):
    """Add a message to a thread."""
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO messages (thread_id, role, content, message_type, metadata, created_at)
                VALUES (%s, %s, %s, %s, %s, %s)
                """,
                (thread_id, role, content, message_type, json.dumps(metadata) if metadata else None, datetime.now())
            )
            conn.commit()
    finally:
        conn.close()

def update_thread(thread_id: int, company: str = None, role: str = None, status: str = None):
    """Update thread information."""
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            updates = []
            values = []
            
            if company:
                updates.append("company = %s")
                values.append(company)
            if role:
                updates.append("role = %s")
                values.append(role)
            if status:
                updates.append("status = %s")
                values.append(status)
            
            updates.append("updated_at = %s")
            values.append(datetime.now())
            values.append(thread_id)
            
            if updates:
                cur.execute(
                    f"UPDATE threads SET {', '.join(updates)} WHERE id = %s",
                    values
                )
                conn.commit()
    finally:
        conn.close()

