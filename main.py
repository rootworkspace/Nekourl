import secrets, uvicorn
from datetime import datetime, timezone
from typing import Optional
from fastapi import FastAPI, HTTPException, Depends, Body
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
import starlette.status as status
from sqlalchemy import create_engine, String, Text, DateTime, Boolean, event
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, sessionmaker, Session
import validators
from pathlib import Path

Path("database").mkdir(parents=True, exist_ok=True)
engine = create_engine("sqlite:///./database/nekourl.db", connect_args={"check_same_thread": False})

# Database
@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_con, con_record):
    cursor = dbapi_con.cursor()
    cursor.execute("PRAGMA journal_mode=WAL")
    cursor.execute("PRAGMA synchronous=NORMAL")
    cursor.close()

SessionLocal = sessionmaker(bind=engine)
class Base(DeclarativeBase): pass

class URL(Base):
    __tablename__ = "urls"
    id: Mapped[str] = mapped_column(String, primary_key=True, index=True)
    url: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

Base.metadata.create_all(bind=engine)

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()

# Backend
@app.post("/u/")
async def create_paste(url: str, db: Session = Depends(get_db)):
    if not validators.url(url):
        raise HTTPException(400, "Invalid URL")
    pid = secrets.token_urlsafe(6)
    db.add(URL(id=pid, url=url))
    db.commit()
    return {"id": pid}

@app.get("/u/{pid}")
async def get_paste(pid: str, db: Session = Depends(get_db)):
    p = db.query(URL).filter(URL.id == pid).first()
    if not p: raise HTTPException(404)
    return RedirectResponse(url=p.url, status_code=status.HTTP_302_FOUND)

# Frontend
app.mount("/", StaticFiles(directory="web/dist", html=True), name="dist")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)