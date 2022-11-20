from sqlalchemy.orm import Session

from . import models, schemas
from fastapi import HTTPException


def get_audio(db: Session, file_name: str):
    return db.query(models.Audio).filter(models.Audio.file_name == file_name).first()


def create_audio(db: Session, audio: schemas.AudioCreate):
    db_audio = models.Audio(file_name=audio.file_name, is_valid=audio.is_valid, generated_text=audio.generated_text)
    db.add(db_audio)
    db.commit()
    db.refresh(db_audio)
    return


def edit_audio(db: Session, validate_data: schemas.ValidateAudio):
    db_audio = get_audio(db, validate_data.file_name)
    if db_audio:
        db_audio.is_valid = validate_data.is_valid
        db_audio.generated_text = validate_data.text
        db.commit()
    if not db_audio:
        raise HTTPException(status_code=400, detail="Audio file name not found.")
    return
