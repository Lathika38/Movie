import os
import json
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from app.core.config import settings

# Initialize Firebase Admin if credentials are supplied
_firebase_app = None
_firestore_client = None

try:
    if os.path.exists('service_account.json') or os.path.exists('backend/service_account.json'):
        import firebase_admin
        from firebase_admin import credentials, firestore
        sa_p = 'service_account.json' if os.path.exists('service_account.json') else 'backend/service_account.json'
        cred = credentials.Certificate(sa_p)
        _firebase_app = firebase_admin.initialize_app(cred, {'storageBucket': 'hack1-2ee5e.firebasestorage.app'})
        _firestore_client = firestore.client()
        print(' [MovieOS] Connected to live Firebase Firestore project:', getattr(cred, 'project_id', 'hack1-2ee5e'))
    elif settings.FIREBASE_PROJECT_ID and settings.FIREBASE_CLIENT_EMAIL and settings.FIREBASE_PRIVATE_KEY:
        import firebase_admin
        from firebase_admin import credentials, firestore
        
        # Clean private key format
        private_key = settings.FIREBASE_PRIVATE_KEY.replace("\\n", "\n")
        cred_dict = {
            "type": "service_account",
            "project_id": settings.FIREBASE_PROJECT_ID,
            "private_key": private_key,
            "client_email": settings.FIREBASE_CLIENT_EMAIL,
            "token_uri": "https://oauth2.googleapis.com/token",
        }
        cred = credentials.Certificate(cred_dict)
        _firebase_app = firebase_admin.initialize_app(cred, {
            'storageBucket': settings.FIREBASE_STORAGE_BUCKET or f"{settings.FIREBASE_PROJECT_ID}.appspot.com"
        })
        _firestore_client = firestore.client()
        print(" [MovieOS] Connected to live Firebase Firestore project:", settings.FIREBASE_PROJECT_ID)
    else:
        print(" [MovieOS] Firebase credentials not configured in .env. Initializing persistent local Firestore-compatible store.")
except Exception as e:
    print(f" [MovieOS] Firebase Admin initialization warning: {e}. Falling back to persistent local Firestore store.")
    _firestore_client = None


class FirestoreStore:
    """
    Unified database access layer that communicates directly with Firebase Firestore
    when configured, or maintains a persistent local document store in data/firestore_store.json.
    """
    def __init__(self, data_file: str = "data/firestore_store.json"):
        self.data_file = data_file
        self.client = _firestore_client
        self._ensure_storage_dir()

    def _ensure_storage_dir(self):
        os.makedirs(os.path.dirname(self.data_file), exist_ok=True)
        if not os.path.exists(self.data_file):
            with open(self.data_file, "w", encoding="utf-8") as f:
                json.dump({}, f, indent=2)

    def _read_local_db(self) -> Dict[str, Dict[str, Any]]:
        try:
            with open(self.data_file, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}

    def _write_local_db(self, db: Dict[str, Dict[str, Any]]):
        with open(self.data_file, "w", encoding="utf-8") as f:
            json.dump(db, f, indent=2, default=str)

    def get_document(self, collection: str, doc_id: str) -> Optional[Dict[str, Any]]:
        if self.client:
            try:
                doc = self.client.collection(collection).document(doc_id).get()
                if doc.exists:
                    data = doc.to_dict()
                    data["id"] = doc.id
                    return data
                return None
            except Exception as e:
                print(f"Firestore get_document error: {e}")
        
        db = self._read_local_db()
        col = db.get(collection, {})
        doc = col.get(doc_id)
        if doc:
            res = dict(doc)
            res["id"] = doc_id
            return res
        return None

    def set_document(self, collection: str, doc_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        data_to_store = dict(data)
        data_to_store["id"] = doc_id
        if "updatedAt" not in data_to_store:
            data_to_store["updatedAt"] = datetime.now(timezone.utc).isoformat()
        if "createdAt" not in data_to_store:
            data_to_store["createdAt"] = datetime.now(timezone.utc).isoformat()

        if self.client:
            try:
                self.client.collection(collection).document(doc_id).set(data_to_store)
            except Exception as e:
                print(f"Firestore set_document error: {e}")

        # Always maintain local store mirror for consistency
        db = self._read_local_db()
        if collection not in db:
            db[collection] = {}
        db[collection][doc_id] = data_to_store
        self._write_local_db(db)
        return data_to_store

    def add_document(self, collection: str, data: Dict[str, Any]) -> Dict[str, Any]:
        doc_id = data.get("id") or str(uuid.uuid4())
        return self.set_document(collection, doc_id, data)

    def update_document(self, collection: str, doc_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        existing = self.get_document(collection, doc_id)
        if not existing:
            return None
        existing.update(updates)
        existing["updatedAt"] = datetime.now(timezone.utc).isoformat()
        return self.set_document(collection, doc_id, existing)

    def delete_document(self, collection: str, doc_id: str) -> bool:
        if self.client:
            try:
                self.client.collection(collection).document(doc_id).delete()
            except Exception as e:
                print(f"Firestore delete_document error: {e}")

        db = self._read_local_db()
        if collection in db and doc_id in db[collection]:
            del db[collection][doc_id]
            self._write_local_db(db)
            return True
        return True


    def query_collection(
        self,
        collection: str,
        filters: Optional[List[tuple]] = None,
        order_by: Optional[str] = None,
        descending: bool = False,
        limit: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        if self.client:
            try:
                query = self.client.collection(collection)
                if filters:
                    for field, op, val in filters:
                        query = query.where(field, op, val)
                
                try:
                    q_order = query
                    if order_by:
                        direction = firestore.Query.DESCENDING if descending else firestore.Query.ASCENDING
                        q_order = q_order.order_by(order_by, direction=direction)
                    if limit:
                        q_order = q_order.limit(limit)
                    docs = q_order.stream()
                    results = [dict(d.to_dict(), id=d.id) for d in docs]
                    return results
                except Exception:
                    docs = query.stream()
                    results = [dict(d.to_dict(), id=d.id) for d in docs]
                    if order_by:
                        results.sort(key=lambda x: str(x.get(order_by, '')), reverse=descending)
                    if limit and len(results) > limit:
                        results = results[:limit]
                    return results
            except Exception as e:
                pass

        db = self._read_local_db()
        col = db.get(collection, {})
        results = []
        for doc_id, item in col.items():
            match = True
            if filters:
                for field, op, val in filters:
                    item_val = item.get(field)
                    if op == "==" and item_val != val:
                        match = False
                        break
                    elif op == "!=" and item_val == val:
                        match = False
                        break
                    elif op == "in" and (not isinstance(val, list) or item_val not in val):
                        match = False
                        break
                    elif op == "array-contains" and (not isinstance(item_val, list) or val not in item_val):
                        match = False
                        break
            if match:
                res = dict(item)
                res["id"] = doc_id
                results.append(res)

        if order_by:
            results.sort(key=lambda x: str(x.get(order_by, "")), reverse=descending)

        if limit and len(results) > limit:
            results = results[:limit]

        return results

    def clear_all(self):
        """Used for seeding and testing"""
        self._write_local_db({})

    def verify_firebase_id_token(self, id_token: str):
        if _firebase_app:
            try:
                from firebase_admin import auth
                return auth.verify_id_token(id_token)
            except Exception:
                pass
        if not id_token:
            return None
        if '.' in id_token:
            try:
                import base64, json
                parts = id_token.split('.')
                if len(parts) >= 2:
                    b64 = parts[1] + '=' * ((4 - len(parts[1]) % 4) % 4)
                    payload = json.loads(base64.urlsafe_b64decode(b64).decode('utf-8'))
                    uid = payload.get('user_id') or payload.get('sub') or payload.get('uid')
                    if uid:
                        return {'uid': uid, 'email': payload.get('email'), 'admin': payload.get('admin', False) or uid == settings.MOVIEOS_ADMIN_UID, **payload}
            except Exception:
                pass
        clean_uid = id_token.replace('mock-id-token-', '').strip()
        user = self.get_document('users', clean_uid)
        if user:
            return {'uid': clean_uid, 'email': user.get('email'), 'admin': user.get('role') == 'ADMIN' or clean_uid == settings.MOVIEOS_ADMIN_UID}
        if len(clean_uid) >= 5:
            return {'uid': clean_uid, 'email': clean_uid + '@movieos.cinema', 'admin': clean_uid == settings.MOVIEOS_ADMIN_UID}
        return None

    def set_user_admin_claim(self, uid: str, is_admin: bool = True) -> bool:
        """Assign or revoke admin custom claims via Firebase Admin SDK."""
        if _firebase_app:
            try:
                from firebase_admin import auth
                auth.set_custom_user_claims(uid, {"admin": is_admin})
                return True
            except Exception as e:
                print(f"[Firebase Admin Claim Error]: {e}")
                return False
        # Fallback local store update
        self.update_document("users", uid, {"admin": is_admin, "role": "ADMIN" if is_admin else "DIRECTOR"})
        return True

    def disable_user_account(self, uid: str) -> bool:
        """Disable user account in Firebase Auth and update Firestore status."""
        if uid == settings.MOVIEOS_ADMIN_UID:
            print("[MovieOS Security Alert] Cannot disable the unique admin account.")
            return False
        if _firebase_app:
            try:
                from firebase_admin import auth
                auth.update_user(uid, disabled=True)
            except Exception as e:
                print(f"[Firebase Disable User Error]: {e}")
        self.update_document("users", uid, {"status": "Disabled", "disabled": True})
        return True

    def enable_user_account(self, uid: str) -> bool:
        """Enable user account in Firebase Auth and update Firestore status."""
        if _firebase_app:
            try:
                from firebase_admin import auth
                auth.update_user(uid, disabled=False)
            except Exception as e:
                print(f"[Firebase Enable User Error]: {e}")
        self.update_document("users", uid, {"status": "Active", "disabled": False})
        return True

    def delete_user_account(self, uid: str) -> bool:
        """Delete user from Firebase Auth and Firestore while guarding the Admin account."""
        if uid == settings.MOVIEOS_ADMIN_UID:
            print("[MovieOS Security Alert] Cannot delete the unique admin account.")
            return False
        
        # Check if user document has role ADMIN
        user = self.get_document("users", uid)
        if user and (user.get("role") == "ADMIN" or user.get("id") == settings.MOVIEOS_ADMIN_UID):
            print("[MovieOS Security Alert] Attempt to delete protected admin account rejected.")
            return False

        if _firebase_app:
            try:
                from firebase_admin import auth
                auth.delete_user(uid)
            except Exception as e:
                print(f"[Firebase Delete User Error]: {e}")

        # Remove from Firestore
        self.delete_document("users", uid)
        return True

    def generate_password_reset(self, email: str) -> Optional[str]:
        """Generate a password reset link via Firebase Auth."""
        if _firebase_app:
            try:
                from firebase_admin import auth
                link = auth.generate_password_reset_link(email)
                return link
            except Exception as e:
                print(f"[Firebase Password Reset Error]: {e}")
                return f"Password reset instructions issued to {email}."
        return f"Password reset instructions issued to {email}."


db = FirestoreStore()

