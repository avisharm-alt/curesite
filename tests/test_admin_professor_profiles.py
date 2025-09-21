import pytest
from datetime import datetime, timezone

from backend import server
from backend.server import (
    AdminProfessorNetworkProfile,
    User,
    admin_create_professor,
    admin_update_professor,
)


class FakeCursor:
    def __init__(self, results):
        self._results = results

    async def to_list(self, length):
        if length is None or length <= 0:
            return [item.copy() for item in self._results]
        return [item.copy() for item in self._results[:length]]


def _matches(document, query):
    for key, value in query.items():
        if isinstance(value, dict) and "$in" in value:
            if document.get(key) not in value["$in"]:
                return False
        elif document.get(key) != value:
            return False
    return True


class FakeCollection:
    def __init__(self, initial=None):
        self.items = list(initial or [])

    async def find_one(self, query):
        for item in self.items:
            if _matches(item, query):
                return item
        return None

    async def insert_one(self, document):
        stored = document.copy()
        self.items.append(stored)
        return type("InsertOneResult", (), {"inserted_id": stored.get("id")})()

    async def update_one(self, query, update):
        matched = 0
        for item in self.items:
            if _matches(item, query):
                matched = 1
                if "$set" in update:
                    item.update(update["$set"])
        return type("UpdateResult", (), {"matched_count": matched})()

    def find(self, query):
        if not query:
            results = self.items
        else:
            results = [item for item in self.items if _matches(item, query)]
        return FakeCursor(results)


class FakeDB:
    def __init__(self):
        self.users = FakeCollection()
        self.professor_network = FakeCollection()


@pytest.fixture
def fake_db(monkeypatch):
    fake = FakeDB()
    monkeypatch.setattr(server, "db", fake)
    return fake


@pytest.fixture
def anyio_backend():
    return "asyncio"


@pytest.mark.anyio("asyncio")
async def test_admin_create_professor_preserves_admin_role(fake_db):
    admin_record = {
        "id": "admin-1",
        "email": "curejournal@gmail.com",
        "name": "CURE Admin",
        "user_type": "admin",
        "verified": False,
    }
    fake_db.users.items.append(admin_record)

    current_user = User(**admin_record)
    payload = AdminProfessorNetworkProfile(
        user_name="Dr. Admin",
        user_university="CURE University",
        department="Neurology",
        research_areas=["Brain Health"],
        lab_description="Investigating neural pathways.",
        accepting_students=True,
        contact_email="curejournal@gmail.com",
        website=None,
    )

    created_profile = await admin_create_professor(payload, current_user=current_user)

    assert created_profile.user_id == admin_record["id"]
    assert admin_record["user_type"] == "admin"
    assert admin_record["verified"] is True
    assert fake_db.professor_network.items[0]["contact_email"] == "curejournal@gmail.com"


@pytest.mark.anyio("asyncio")
async def test_admin_update_professor_keeps_admin_role(fake_db):
    admin_record = {
        "id": "admin-2",
        "email": "curejournal@gmail.com",
        "name": "CURE Admin",
        "user_type": "admin",
        "verified": False,
    }
    fake_db.users.items.append(admin_record)

    existing_profile = {
        "id": "prof-1",
        "user_id": admin_record["id"],
        "department": "Immunology",
        "research_areas": ["Vaccines"],
        "lab_description": "Studying immune response.",
        "accepting_students": True,
        "contact_email": "curejournal@gmail.com",
        "website": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    fake_db.professor_network.items.append(existing_profile)

    current_user = User(**admin_record)
    update_payload = AdminProfessorNetworkProfile(
        user_name="Dr. Admin Updated",
        user_university="CURE University",
        department="Cardiology",
        research_areas=["Heart Health"],
        lab_description="Exploring cardiovascular systems.",
        accepting_students=False,
        contact_email="curejournal@gmail.com",
        website="https://cure.example.com",
    )

    updated_profile = await admin_update_professor(
        existing_profile["id"], update_payload, current_user=current_user
    )

    assert updated_profile.user_id == admin_record["id"]
    assert admin_record["user_type"] == "admin"
    assert admin_record["verified"] is True
    stored_profile = fake_db.professor_network.items[0]
    assert stored_profile["department"] == "Cardiology"
    assert stored_profile["accepting_students"] is False
    assert stored_profile["contact_email"] == "curejournal@gmail.com"


@pytest.mark.anyio("asyncio")
async def test_admin_create_promotes_student_to_professor(fake_db):
    student_record = {
        "id": "student-1",
        "email": "student@example.com",
        "name": "Research Student",
        "user_type": "student",
        "verified": False,
    }
    fake_db.users.items.append(student_record)

    current_user = User(**{
        "id": "admin-controller",
        "email": "curejournal@gmail.com",
        "name": "CURE Admin",
        "user_type": "admin",
        "verified": True,
    })

    payload = AdminProfessorNetworkProfile(
        user_name="Dr. Mentor",
        user_university="Mentor University",
        department="Oncology",
        research_areas=["Cancer Research"],
        lab_description="Leading clinical trials.",
        accepting_students=True,
        contact_email="student@example.com",
        website=None,
    )

    await admin_create_professor(payload, current_user=current_user)

    assert student_record["user_type"] == "professor"
    assert student_record["verified"] is True
    assert fake_db.professor_network.items[0]["user_id"] == student_record["id"]
