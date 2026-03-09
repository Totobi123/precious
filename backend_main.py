import os
import secrets
import asyncio
import smtplib
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from email.message import EmailMessage
from contextlib import asynccontextmanager

import aiosmtplib
from fastapi import FastAPI, Depends, HTTPException, status, Header, Request, Path, Response
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy import text, create_engine, MetaData, Table, Column, Integer, String, JSON, DateTime, Boolean, ForeignKey, desc, select
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.exc import IntegrityError, ProgrammingError
from pydantic import BaseModel, EmailStr, Field
from passlib.context import CryptContext
import uvicorn

# --- CONFIGURATION ---
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/postgres")
SECRET_KEY = os.getenv("SECRET_KEY", "SUPER_SECRET_KEY_FOR_JWT_12345")
ALGORITHM = "HS256"
PORT = 7777

# Admin Default Credentials
ADMIN_PASS = "Titobilove123@"
VALID_EMAILS = [
    "support@jabooks.shop", "james@jabooks.shop", "admin@jabooks.shop",
    "ceo@genxflow.shop", "ceo@genxflow.site", "ceo@nexus-media-group.xyz",
    "ceo@genxleads.online", "ceo@genxleads.shop"
]

# Password Hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
Base = declarative_base()

# --- DATABASE MODELS ---

class SystemSetting(Base):
    __tablename__ = "system_settings"
    __table_args__ = {"schema": "public"}
    id = Column(Integer, primary_key=True)
    active_smtp_user = Column(String, default="ceo@genxflow.shop")
    smtp_password = Column(String, default="Titobilove123@")
    smtp_host = Column(String, default="mail.privateemail.com")
    smtp_port = Column(Integer, default=465)
    from_name = Column(String, default="GenxFlow DBaaS")
    otp_subject = Column(String, default="Your Verification Code")
    otp_body_template = Column(String, default="Hello, your code is {otp}. Please check your spam folder if you don't see it in your inbox.")
    admin_route = Column(String, default="admin")
    admin_password = Column(String, default="Titobilove123@")
    admin_email = Column(String, default="admin@preciousnails.com")

class User(Base):
    __tablename__ = "users"
    __table_args__ = {"schema": "public"}
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    api_key = Column(String, unique=True, index=True, nullable=False)
    schema_name = Column(String, unique=True, nullable=False)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class OTPRecord(Base):
    __tablename__ = "otp_records"
    __table_args__ = {"schema": "public"}
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, index=True)
    otp = Column(String)
    expires_at = Column(DateTime)

class APILog(Base):
    __tablename__ = "api_logs"
    __table_args__ = {"schema": "public"}
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("public.users.id"))
    method = Column(String)
    endpoint = Column(String)
    status_code = Column(Integer)
    timestamp = Column(DateTime, default=datetime.utcnow)

# --- DATABASE SETUP ---
engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def init_db():
    async with engine.begin() as conn:
        await conn.execute(text("CREATE SCHEMA IF NOT EXISTS public"))
        await conn.run_sync(Base.metadata.create_all)
    
    # Seed Initial Settings
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(SystemSetting))
        if not res.scalar():
            db.add(SystemSetting())
            await db.commit()
    print("Database & System Settings Initialized.")

# --- HELPERS ---
def get_password_hash(password):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

async def check_admin(authorization: str = Header(...)):
    api_key = authorization.replace("Bearer ", "")
    
    async with AsyncSessionLocal() as db:
        settings_res = await db.execute(select(SystemSetting))
        s = settings_res.scalar()
        if api_key == s.admin_password:
            return True
            
        # Also check if it's a valid user key (for some admin stats access)
        user = (await db.execute(select(User).where(User.api_key == api_key))).scalar()
        if user:
            return True

    raise HTTPException(status_code=401, detail="Unauthorized Admin Access")

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

async def send_email(to_email: str, subject: str, otp: str):
    async with AsyncSessionLocal() as db:
        settings_res = await db.execute(select(SystemSetting))
        s = settings_res.scalar()
    
    msg = EmailMessage()
    body = s.otp_body_template.replace("{otp}", otp).replace("{mail}", to_email)
    msg.set_content(body)
    msg["Subject"] = s.otp_subject or subject
    msg["To"] = to_email
    msg["From"] = f"{s.from_name} <{s.active_smtp_user}>"

    try:
        await aiosmtplib.send(
            msg,
            hostname=s.smtp_host,
            port=s.smtp_port,
            username=s.active_smtp_user,
            password=s.smtp_password,
            use_tls=(s.smtp_port == 465)
        )
    except Exception as e:
        print(f"SMTP Error: {e}")

# --- SCHEMAS ---
class UserSignup(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class OTPVerify(BaseModel):
    email: EmailStr
    otp: str

class AdminSettingsUpdate(BaseModel):
    active_smtp_user: str
    from_name: str
    otp_subject: str
    otp_body_template: str
    smtp_host: Optional[str] = "mail.privateemail.com"
    admin_email: Optional[str] = None
    admin_password: Optional[str] = None
    admin_route: Optional[str] = None

# --- FASTAPI APP WITH LIFESPAN ---

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    os.makedirs("templates", exist_ok=True)
    yield

app = FastAPI(title="Superbase DBaaS", lifespan=lifespan)
templates = Jinja2Templates(directory="templates")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- ADMIN PANEL ENDPOINTS ---

@app.get("/api/admin/stats")
async def get_admin_stats(authorization: str = Header(...), db: AsyncSession = Depends(get_db)):
    # Simple admin check: if key is admin_password or in VALID_EMAILS logic
    api_key = authorization.replace("Bearer ", "")
    
    settings_res = await db.execute(select(SystemSetting))
    s = settings_res.scalar()

    if api_key != s.admin_password:
        # Check if it's a valid user key
        user = (await db.execute(select(User).where(User.api_key == api_key))).scalar()
        if not user: raise HTTPException(status_code=401)
        
        # User-specific stats
        log_count = (await db.execute(select(text("count(*)")) .select_from(APILog).where(APILog.user_id == user.id))).scalar()
        # Count tables in user schema
        tables_res = await db.execute(text(f"SELECT count(*) FROM information_schema.tables WHERE table_schema = '{user.schema_name}'"))
        table_count = tables_res.scalar()
        return {"tables": table_count, "logs": log_count, "schema": user.schema_name}

    # Global stats for true admin
    user_count = (await db.execute(select(text("count(*)")).select_from(User))).scalar()
    log_count = (await db.execute(select(text("count(*)")).select_from(APILog))).scalar()
    return {"users": user_count, "logs": log_count, "schema": "all (admin)"}

@app.get("/api/admin/logs")
async def get_admin_logs(authorization: str = Header(...), db: AsyncSession = Depends(get_db)):
    api_key = authorization.replace("Bearer ", "")
    user = (await db.execute(select(User).where(User.api_key == api_key))).scalar()
    
    settings_res = await db.execute(select(SystemSetting))
    s = settings_res.scalar()

    query = select(APILog).order_by(desc(APILog.timestamp)).limit(50)
    if api_key != s.admin_password:
        if not user: raise HTTPException(status_code=401)
        query = query.where(APILog.user_id == user.id)
    
    res = await db.execute(query)
    return [dict(r._mapping["APILog"].__dict__) for r in res.fetchall() if "_sa_instance_state" not in r]

@app.get("/api/admin/users")
async def list_users(admin: bool = Depends(check_admin), db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(User))
    return [{"id": u.id, "email": u.email, "schema": u.schema_name, "is_verified": u.is_verified, "created_at": u.created_at} for u in res.scalars()]

@app.get("/api/admin/user/{user_id}/tables")
async def list_user_tables(user_id: int, admin: bool = Depends(check_admin), db: AsyncSession = Depends(get_db)):
    user = (await db.execute(select(User).where(User.id == user_id))).scalar()
    if not user: raise HTTPException(status_code=404)
    
    res = await db.execute(text(f"SELECT table_name FROM information_schema.tables WHERE table_schema = '{user.schema_name}' AND table_type = 'BASE TABLE'"))
    return [r[0] for r in res.fetchall()]

@app.get("/api/admin/user/{user_id}/data/{table_name}")
async def get_user_table_data(user_id: int, table_name: str, admin: bool = Depends(check_admin), db: AsyncSession = Depends(get_db)):
    user = (await db.execute(select(User).where(User.id == user_id))).scalar()
    if not user: raise HTTPException(status_code=404)
    
    res = await db.execute(text(f"SELECT * FROM {user.schema_name}.\"{table_name}\" ORDER BY id DESC"))
    return [dict(r._mapping) for r in res.fetchall()]

@app.post("/api/admin/user/{user_id}/data/{table_name}/{row_id}")
async def update_user_table_data(user_id: int, table_name: str, row_id: int, payload: Dict[str, Any], admin: bool = Depends(check_admin), db: AsyncSession = Depends(get_db)):
    user = (await db.execute(select(User).where(User.id == user_id))).scalar()
    if not user: raise HTTPException(status_code=404)
    
    set_clause = ", ".join([f"\"{k}\" = :{k}" for k in payload.keys()])
    payload["row_id"] = row_id
    await db.execute(text(f"UPDATE {user.schema_name}.\"{table_name}\" SET {set_clause} WHERE id = :row_id"), payload)
    await db.commit()
    return {"message": "Updated successfully"}

@app.post("/api/admin/send-mail")
async def admin_send_mail(data: Dict[str, Any], admin: bool = Depends(check_admin), db: AsyncSession = Depends(get_db)):
    # data: { "to": "...", "subject": "...", "body": "..." }
    to_email = data.get("to")
    subject = data.get("subject", "Message from Support")
    body_content = data.get("body", "")

    settings_res = await db.execute(select(SystemSetting))
    s = settings_res.scalar()
    
    msg = EmailMessage()
    msg.set_content(body_content)
    msg["Subject"] = subject
    msg["To"] = to_email
    msg["From"] = f"{s.from_name} <{s.active_smtp_user}>"

    try:
        await aiosmtplib.send(
            msg,
            hostname=s.smtp_host,
            port=s.smtp_port,
            username=s.active_smtp_user,
            password=s.smtp_password,
            use_tls=(s.smtp_port == 465)
        )
        return {"message": "Email sent"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/admin/settings")
async def get_admin_settings(db: AsyncSession = Depends(get_db)):
    res = await db.execute(text("SELECT * FROM public.system_settings LIMIT 1"))
    row = res.fetchone()
    if not row: return {}
    return dict(row._mapping)

@app.post("/api/admin/settings")
async def update_admin_settings(data: AdminSettingsUpdate, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(SystemSetting))
    s = res.scalar()
    s.active_smtp_user = data.active_smtp_user
    s.from_name = data.from_name
    s.otp_subject = data.otp_subject
    s.otp_body_template = data.otp_body_template
    s.smtp_host = data.smtp_host
    if data.admin_email: s.admin_email = data.admin_email
    if data.admin_password: s.admin_password = data.admin_password
    if data.admin_route: s.admin_route = data.admin_route
    await db.commit()
    return {"message": "Settings updated successfully"}

# --- AUTH & CRUD ---

@app.post("/auth/signup")
async def signup(user_data: UserSignup, db: AsyncSession = Depends(get_db)):
    result = await db.execute(text("SELECT id FROM public.users WHERE email = :email"), {"email": user_data.email})
    if result.fetchone(): raise HTTPException(status_code=400, detail="Email already registered")
    
    schema_name = f"tenant_{secrets.token_hex(4)}"
    api_key = f"db_{secrets.token_urlsafe(32)}"
    new_user = User(email=user_data.email, hashed_password=get_password_hash(user_data.password), api_key=api_key, schema_name=schema_name)
    db.add(new_user)
    await db.commit()
    
    await db.execute(text(f"CREATE SCHEMA IF NOT EXISTS {schema_name}"))
    await db.commit()
    
    otp = "".join([str(secrets.randbelow(10)) for _ in range(6)])
    db.add(OTPRecord(email=user_data.email, otp=otp, expires_at=datetime.utcnow() + timedelta(minutes=10)))
    await db.commit()
    
    await send_email(user_data.email, "Verify Your Account", otp)
    return {"message": "User registered. Check your email (and spam) for OTP.", "schema": schema_name}

@app.post("/auth/verify-otp")
async def verify_otp(data: OTPVerify, db: AsyncSession = Depends(get_db)):
    result = await db.execute(text("SELECT * FROM public.otp_records WHERE email = :email AND otp = :otp AND expires_at > :now"), {"email": data.email, "otp": data.otp, "now": datetime.utcnow()})
    if not result.fetchone(): raise HTTPException(status_code=400, detail="Invalid/Expired OTP")
    await db.execute(text("UPDATE public.users SET is_verified = TRUE WHERE email = :email"), {"email": data.email})
    await db.execute(text("DELETE FROM public.otp_records WHERE email = :email"), {"email": data.email})
    await db.commit()
    return {"message": "Verified"}

@app.post("/auth/login")
async def login(data: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(text("SELECT * FROM public.users WHERE email = :email"), {"email": data.email})
    user = result.fetchone()
    if not user or not verify_password(data.password, user.hashed_password): raise HTTPException(status_code=401)
    return {"api_key": user.api_key}

# --- UNIVERSAL DATA API (FOR PRODUCTS, ORDERS, ETC) ---

import json

@app.post("/v1/data/{table_name}")
async def insert_data(table_name: str, payload: Dict[str, Any], authorization: str = Header(...), db: AsyncSession = Depends(get_db)):
    api_key = authorization.replace("Bearer ", "")
    user = (await db.execute(text("SELECT schema_name FROM public.users WHERE api_key = :key"), {"key": api_key})).fetchone()
    if not user: raise HTTPException(status_code=401)
    
    # Pre-process payload to ensure it's clean
    clean_payload = {}
    for k, v in payload.items():
        if k == "id" or k == "created_at": continue
        clean_payload[k] = v

    # Auto-generate table if it doesn't exist
    cols = []
    for k, v in clean_payload.items():
        t = "TEXT"
        if isinstance(v, int): t = "INTEGER"
        elif isinstance(v, float): t = "FLOAT"
        elif isinstance(v, bool): t = "BOOLEAN"
        elif isinstance(v, (dict, list)): 
            t = "JSONB"
            clean_payload[k] = json.dumps(v)
        cols.append(f"\"{k}\" {t}")
    
    await db.execute(text(f"CREATE TABLE IF NOT EXISTS {user.schema_name}.\"{table_name}\" (id SERIAL PRIMARY KEY, {', '.join(cols)}, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)"))
    
    keys, ph = [f"\"{k}\"" for k in clean_payload.keys()], [f":{k}" for k in clean_payload.keys()]
    query = f"INSERT INTO {user.schema_name}.\"{table_name}\" ({', '.join(keys)}) VALUES ({', '.join(ph)}) RETURNING id"
    res = await db.execute(text(query), clean_payload)
    await db.commit()
    return {"id": res.fetchone()[0], "message": f"Data saved to {table_name}"}

@app.get("/v1/data/{table_name}")
async def fetch_data(request: Request, table_name: str, authorization: str = Header(...), db: AsyncSession = Depends(get_db)):
    api_key = authorization.replace("Bearer ", "")
    user = (await db.execute(text("SELECT schema_name FROM public.users WHERE api_key = :key"), {"key": api_key})).fetchone()
    if not user: raise HTTPException(status_code=401)
    
    p = dict(request.query_params)
    q = f"SELECT * FROM {user.schema_name}.\"{table_name}\""
    if p: q += " WHERE " + " AND ".join([f"\"{k}\" = :{k}" for k in p.keys()])
    q += " ORDER BY id DESC"
    
    try:
        res = await db.execute(text(q), p)
        # Parse JSONB strings back to objects
        rows = []
        for r in res.fetchall():
            d = dict(r._mapping)
            for k, v in d.items():
                if isinstance(v, str):
                    try:
                        parsed = json.loads(v)
                        if isinstance(parsed, (dict, list)):
                            d[k] = parsed
                    except:
                        pass
            rows.append(d)
        return rows
    except Exception:
        return []

@app.patch("/v1/data/{table_name}/{id}")
async def update_data(table_name: str, id: int, payload: Dict[str, Any], authorization: str = Header(...), db: AsyncSession = Depends(get_db)):
    api_key = authorization.replace("Bearer ", "")
    user = (await db.execute(text("SELECT schema_name FROM public.users WHERE api_key = :key"), {"key": api_key})).fetchone()
    if not user: raise HTTPException(status_code=401)
    
    set_clause = []
    for k, v in payload.items():
        if isinstance(v, (dict, list)):
            payload[k] = json.dumps(v)
        set_clause.append(f"\"{k}\" = :{k}")
        
    payload["id_param"] = id
    query = f"UPDATE {user.schema_name}.\"{table_name}\" SET {', '.join(set_clause)} WHERE id = :id_param"
    
    try:
        await db.execute(text(query), payload)
        await db.commit()
        return {"message": "Updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/v1/data/{table_name}/{id}")
async def delete_data(table_name: str, id: int, authorization: str = Header(...), db: AsyncSession = Depends(get_db)):
    api_key = authorization.replace("Bearer ", "")
    user = (await db.execute(text("SELECT schema_name FROM public.users WHERE api_key = :key"), {"key": api_key})).fetchone()
    if not user: raise HTTPException(status_code=401)
    
    try:
        query = f"DELETE FROM {user.schema_name}.\"{table_name}\" WHERE id = :id"
        await db.execute(text(query), {"id": id})
        await db.commit()
        return {"message": "Deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- DASHBOARD & UI ---

@app.get("/admin", response_class=HTMLResponse)
async def serve_admin(request: Request):
    return templates.TemplateResponse("admin.html", {"request": request})

@app.get("/dashboard", response_class=HTMLResponse)
async def serve_dashboard(request: Request):
    return templates.TemplateResponse("dashboard.html", {"request": request})

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=PORT)
