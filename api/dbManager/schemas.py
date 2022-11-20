from pydantic import BaseModel


class ValidateAudio(BaseModel):
    file_name: str
    is_valid: bool
    text: str | None = "no thing"


class AudioBase(BaseModel):
    file_name: str
    generated_text: str


class AudioCreate(AudioBase):
    is_valid: bool = False
    generated_text: str | None = None


class Audio(AudioCreate):
    class Config:
        orm_mode = True
