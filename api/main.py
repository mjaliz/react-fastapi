import time
import uuid
import warnings

import uvicorn
import whisper
from fastapi import FastAPI, UploadFile, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from api.dbManager import crud, schemas, models
from api.dbManager.database import SessionLocal, engine

warnings.filterwarnings('ignore')

model_name = "small.en"
print(model_name)
model = whisper.load_model(model_name, device="cuda", in_memory=False)


def whisper_func(audio_file):
    result = model.transcribe(audio_file)
    return result['text']


models.Base.metadata.create_all(bind=engine)

app = FastAPI()
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    print("Duration {} ms".format(round((time.time() - start_time) * 1000)))
    return response


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/test")
async def read_index():
    return {'text': 'hello'}


@app.post("/api/voice")
async def speech_to_text(file: UploadFile, db: Session = Depends(get_db)):
    file_name = f'{str(time.time()).replace(".", "-")}_{str(uuid.uuid4())}'
    audio_name = f'{file_name}.wav'
    with open(f'./audios/{audio_name}', 'wb') as audio_file:
        audio_file.write(file.file.read())

    data = {"file_name": file_name, "is_valid": False}
    audio = schemas.AudioCreate(**data)
    crud.create_audio(db, audio)
    transcribe = whisper_func(f'./audios/{audio_name}')
    print(transcribe)
    return {'text': transcribe, 'file_name': file_name}


@app.post("/api/validate")
async def validate_text(data: schemas.ValidateAudio, db: Session = Depends(get_db)):
    crud.edit_audio(db, data)
    return {'status': True}


if __name__ == '__main__':
    uvicorn.run("main:app", port=8000, host='192.168.1.20', ssl_keyfile="./localhost+2-key.pem",
                ssl_certfile="./localhost+2.pem")
