#!/usr/bin/env python3
"""Push audio files via GitHub API (bypasses git wire protocol HTTP 408)."""
import os, json, base64, subprocess, sys

OWNER = "PokeyPoke"
REPO = "cz"
AUDIO_DIR = "public/audio"
BASE_BRANCH = "main"

def gh_api(method, path, data=None):
    """Call GitHub API via gh CLI."""
    args = ["gh", "api", f"/repos/{OWNER}/{REPO}/{path}", "-X", method]
    if data:
        args.extend(["-f", f"input={data}"])
        # For larger payloads, use stdin
        result = subprocess.run(
            ["gh", "api", f"/repos/{OWNER}/{REPO}/{path}", "-X", method, "--input", "-"],
            input=json.dumps(data).encode(),
            capture_output=True, text=True, timeout=30
        )
    else:
        result = subprocess.run(args, capture_output=True, text=True, timeout=30)
    if result.returncode != 0:
        print(f"API Error: {result.stderr}")
        return None
    return json.loads(result.stdout) if result.stdout else {}

def main():
    # Get base commit SHA
    ref = gh_api("GET", "git/refs/heads/main")
    if not ref:
        print("Failed to get ref")
        return
    base_sha = ref["object"]["sha"]
    print(f"Base commit: {base_sha}")

    # Get base tree SHA
    commit = gh_api("GET", f"git/commits/{base_sha}")
    base_tree = commit["tree"]["sha"]
    print(f"Base tree: {base_tree}")

    # Create blobs for all audio files
    blobs = {}
    for root, dirs, files in os.walk(AUDIO_DIR):
        for fname in files:
            path = os.path.join(root, fname)
            with open(path, "rb") as f:
                content = base64.b64encode(f.read()).decode()
            data = {"content": content, "encoding": "base64"}
            result = gh_api("POST", "git/blobs", data)
            if result and "sha" in result:
                blobs[path] = result["sha"]
                print(f"  blob: {path} -> {result['sha'][:8]}")

    print(f"\nCreated {len(blobs)} blobs")

    # Build tree entries
    tree_entries = []
    for path, sha in blobs.items():
        fname = os.path.basename(path)
        tree_entries.append({
            "path": path,
            "mode": "100644",
            "type": "blob",
            "sha": sha
        })

    # Create tree in batches of 50 (API limit)
    BATCH = 50
    current_tree_sha = base_tree
    for i in range(0, len(tree_entries), BATCH):
        batch = tree_entries[i:i+BATCH]
        data = {
            "base_tree": current_tree_sha,
            "tree": batch
        }
        result = gh_api("POST", "git/trees", data)
        if result and "sha" in result:
            current_tree_sha = result["sha"]
            print(f"Tree batch {i//BATCH + 1}: {current_tree_sha}")
        else:
            print(f"Tree batch failed!")
            return

    # Create commit
    commit_data = {
        "message": "Audio: 93 TTS files for all 8 modules\n\nGenerated via gTTS Czech TTS\nCo-Authored-By: Claude <noreply@anthropic.com>",
        "tree": current_tree_sha,
        "parents": [base_sha]
    }
    result = gh_api("POST", "git/commits", commit_data)
    if not result or "sha" not in result:
        print("Commit failed!")
        return
    new_sha = result["sha"]
    print(f"New commit: {new_sha}")

    # Update branch ref
    ref_data = {"sha": new_sha, "force": False}
    result = gh_api("PATCH", "git/refs/heads/main", ref_data)
    print(f"Branch updated: {result.get('ref')}")

if __name__ == "__main__":
    main()
