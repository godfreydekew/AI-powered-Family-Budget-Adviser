from sqlmodel import Field, SQLModel


class CategoryBase(SQLModel):
    key: str = Field(unique=True, index=True, max_length=50)
    label_en: str = Field(max_length=100)
    label_de: str | None = Field(default=None, max_length=100)
    label_fr: str | None = Field(default=None, max_length=100)
    label_pl: str | None = Field(default=None, max_length=100)
    label_es: str | None = Field(default=None, max_length=100)
    icon: str | None = Field(default=None, max_length=10)
    display_order: int = Field(default=0)
    is_active: bool = True


class Category(CategoryBase, table=True):
    id: int | None = Field(default=None, primary_key=True)


class CategoryCreate(CategoryBase):
    pass


class CategoryPublic(CategoryBase):
    id: int
