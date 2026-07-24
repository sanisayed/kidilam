import os
import dulwich.repo
import dulwich.porcelain

repo_path = os.path.abspath(os.path.dirname(__file__))

print("Initializing Git repository with dulwich...")
if not os.path.exists(os.path.join(repo_path, ".git")):
    repo = dulwich.repo.Repo.init(repo_path)
    print("Git repository initialized!")
else:
    repo = dulwich.repo.Repo(repo_path)
    print("Git repository already exists.")

print("Staging files for initial commit...")
dulwich.porcelain.add(repo_path)

try:
    status = dulwich.porcelain.status(repo_path)
    print(f"Staged changes: {len(status.staged['add'])} added, {len(status.staged['modify'])} modified.")
except Exception as e:
    print(f"Status check note: {e}")

try:
    commit_id = dulwich.porcelain.commit(
        repo_path,
        message=b"feat: initial project setup for Supabase DB & Render cloud hosting",
        author=b"Saidali <saidali@kidilam.local>",
        committer=b"Saidali <saidali@kidilam.local>"
    )
    print(f"Initial commit created successfully! Hash: {commit_id.decode('ascii') if isinstance(commit_id, bytes) else commit_id}")
except Exception as err:
    print(f"Commit note: {err}")
