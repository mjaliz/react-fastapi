from sqlalchemy import Boolean, Column, Integer, String
from api.dbManager.database import Base


class Audio(Base):
    __tablename__ = 'audios'

    id = Column(Integer, primary_key=True, index=True)
    file_name = Column(String)
    is_valid = Column(Boolean)
    generated_text = Column(String)
