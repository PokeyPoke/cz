#!/usr/bin/env python3
"""Generate TTS audio files for all Czech phrases in module JSON files.
Uses gTTS (Google Text-to-Speech) with Czech language support.
Only generates files that don't already exist (preserves real FSI audio).
"""

import json
import os
import sys
import time
from pathlib import Path

# gTTS import
from gtts import gTTS

PROJECT_ROOT = Path(__file__).parent.parent
MODULES_DIR = PROJECT_ROOT / "src" / "data" / "modules"
AUDIO_DIR = PROJECT_ROOT / "public" / "audio"

# Skip these patterns (real FSI audio already exists)
SKIP_IF_EXISTS = True

def generate_audio(text: str, output_path: Path) -> bool:
    """Generate Czech TTS audio for a single phrase."""
    if SKIP_IF_EXISTS and output_path.exists():
        return True  # Already exists, skip

    output_path.parent.mkdir(parents=True, exist_ok=True)

    try:
        tts = gTTS(text=text, lang='cs', slow=False)
        tts.save(str(output_path))
        print(f"  ✓ {output_path.name}: \"{text}\"")
        return True
    except Exception as e:
        print(f"  ✗ {output_path.name}: {e}")
        return False


def process_module(module_path: Path) -> int:
    """Process one module JSON and generate audio for all referenced phrases."""
    with open(module_path, 'r', encoding='utf-8') as f:
        module = json.load(f)

    module_id = module['id']
    generated = 0

    for lesson in module.get('lessons', []):
        lesson_id = lesson['order']
        lesson_dir = AUDIO_DIR / module_id / f"lesson-{lesson_id:02d}"

        for segment in lesson.get('segments', []):
            seg_type = segment.get('type')

            if seg_type == 'phrases':
                for phrase in segment.get('phrases', []):
                    if phrase.get('audioSrc'):
                        out = lesson_dir / f"{phrase['id']}.mp3"
                        if generate_audio(phrase['czech'], out):
                            generated += 1

            elif seg_type == 'shadowing':
                for phrase in segment.get('phrases', []):
                    if phrase.get('audioSrc'):
                        out = lesson_dir / f"{phrase['id']}.mp3"
                        if generate_audio(phrase['czech'], out):
                            generated += 1

            elif seg_type == 'pronunciation':
                for tip in segment.get('tips', []):
                    if tip.get('audioSrc'):
                        # For pronunciation, say the example words
                        examples = ' . '.join(tip.get('czechExamples', []))
                        text = f"{tip.get('focus', '')}. {examples}"
                        out = lesson_dir / f"pron-{tip['focus']}.mp3"
                        if generate_audio(text, out):
                            generated += 1

            elif seg_type == 'flashcards':
                for card in segment.get('cards', []):
                    if card.get('audioSrc'):
                        out = lesson_dir / f"{card['id']}.mp3"
                        if generate_audio(card.get('front', ''), out):
                            generated += 1

    return generated


def main():
    if not MODULES_DIR.exists():
        print(f"Modules directory not found: {MODULES_DIR}")
        sys.exit(1)

    total = 0
    module_files = sorted(MODULES_DIR.glob("*.json"))

    print(f"Generating audio for {len(module_files)} modules...")
    print(f"Output directory: {AUDIO_DIR}")
    print(f"Skip existing: {SKIP_IF_EXISTS}")
    print()

    for mf in module_files:
        module_name = mf.stem
        print(f"[{module_name}]")
        count = process_module(mf)
        total += count
        print(f"  Generated {count} files")
        # Small delay between phrases to avoid rate limiting
        time.sleep(0.3)

    print(f"\nTotal: {total} audio files generated")


if __name__ == '__main__':
    main()
