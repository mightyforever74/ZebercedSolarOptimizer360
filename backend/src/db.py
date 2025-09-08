import os, psycopg2
from dotenv import load_dotenv
from psycopg2.extras import RealDictCursor

load_dotenv()

def get_db():
    url = os.getenv("DATABASE_URL")
    if not url:
        raise RuntimeError("DATABASE_URL environment variable is not set")
    return psycopg2.connect(url)

conn = get_db()
with conn.cursor(cursor_factory=RealDictCursor) as cur:
    cur.execute("SELECT 1")
    rows = cur.fetchall()
conn.commit()
