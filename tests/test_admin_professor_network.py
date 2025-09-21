import pytest
from types import SimpleNamespace

from backend import server


class FakeCollection:
    def __init__(self):
        self.docs = []

    async def find_one(self, query):
        for doc in self.docs:
            if all(doc.get(key) == value for key, value in query.items()):
                # Return a shallow copy to mimic Motor's behaviour without sharing state
                return dict(doc)
        return None

    async def insert_one(self, document):
        self.docs.append(dict(document))
        return SimpleNamespace(inserted_id=document.get("id"))

    async def update_one(self, query, update):
        matched = 0
        for doc in self.docs:
            if all(doc.get(key) == value for key, value in query.items()):
                matched = 1
                for update_key, update_value in update.get("$set", {}).items():
                    doc[update_key] = update_value
        return SimpleNamespace(matched_count=matched)


class FakeDB:
    def __init__(self):
        self.users = FakeCollection()
        self.professor_network = FakeCollection()


@pytest.fixture
def fake_db(monkeypatch):
    original_db = server.db
    fake_database = FakeDB()
    monkeypatch.setattr(server, "db", fake_database)
    try:
        yield fake_database
    finally:
        monkeypatch.setattr(server, "db", original_db)


@pytest.fixture
def anyio_backend():
    return "asyncio"


@pytest.mark.anyio
async def test_admin_create_professor_handles_users_without_id(fake_db):
    # Simulate a legacy user document that predates the explicit `id` field
    fake_db.users.docs.append({
        "_id": "mongo-legacy",  # Mongo's internal identifier
        "email": "professor@example.com",
        "name": "Legacy Professor",
        "user_type": "student",
        "verified": False,
    })

    profile = server.AdminProfessorNetworkProfile(
        user_name="Prof. Ada Lovelace",
        user_university="Legacy University",
        department="Computer Science",
        research_areas=["Computing", "Mathematics"],
        lab_description="Focus on analytical engines and computation theory.",
        accepting_students=True,
        contact_email="professor@example.com",
        website=None,
    )

    admin_user = server.User(
        id="admin-id",
        email="admin@example.com",
        name="Admin User",
        user_type="admin",
        verified=True,
    )

    result = await server.admin_create_professor(profile, current_user=admin_user)

    # Ensure a professor network record was created and linked to a generated user id
    assert result.user_id, "Expected the created profile to have an associated user id"
    assert fake_db.professor_network.docs, "Professor profile should be stored in the collection"
    stored_profile = fake_db.professor_network.docs[0]
    assert stored_profile["user_id"] == result.user_id
    assert stored_profile["contact_email"] == "professor@example.com"

    # Verify the legacy user document was updated instead of causing an exception
    stored_user = fake_db.users.docs[0]
    assert stored_user["id"] == result.user_id
    assert stored_user["name"] == "Prof. Ada Lovelace"
    assert stored_user["user_type"] == "professor"
    assert stored_user["verified"] is True
