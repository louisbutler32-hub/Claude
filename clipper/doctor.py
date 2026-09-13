#!/usr/bin/env python3
"""Check this machine can run the pipeline, and say exactly what to install.

    python doctor.py

Deliberately plain ASCII and no third-party imports, so it runs on a bare
Windows Python before anything else is installed.
"""

import os
import platform
import shutil
import subprocess
import sys

WIN = platform.system() == "Windows"
OK, BAD, WARN = "[ ok ]", "[MISSING]", "[ note ]"


def hint(pkg):
    """Per-platform install line for a system tool."""
    if WIN:
        return (f"winget install {pkg['winget']}"
                if pkg.get("winget") else pkg.get("manual", ""))
    if platform.system() == "Darwin":
        return f"brew install {pkg['brew']}" if pkg.get("brew") else ""
    return f"sudo apt-get install -y {pkg['apt']}" if pkg.get("apt") else ""


def check_binary(name, pkg):
    path = shutil.which(name)
    if path:
        try:
            out = subprocess.run([name, "-version"], capture_output=True,
                                 text=True, timeout=20).stdout
            ver = out.splitlines()[0][:60] if out else ""
        except Exception:
            ver = ""
        print(f"{OK} {name:<16} {ver}")
        return True
    print(f"{BAD} {name:<16} not on PATH")
    line = hint(pkg)
    if line:
        print(f"       install with:  {line}")
    return False


def check_module(mod, pip_name, why, required=True):
    try:
        __import__(mod)
        print(f"{OK} {pip_name:<16} importable")
        return True
    except ImportError:
        mark = BAD if required else WARN
        print(f"{mark} {pip_name:<16} {why}")
        print(f"       install with:  {sys.executable} -m pip install {pip_name}")
        return False


def main():
    here = os.path.dirname(os.path.abspath(__file__))
    print(f"clipper doctor - {platform.system()} {platform.release()}")
    print(f"python {sys.version.split()[0]}  ({sys.executable})\n")

    problems = []

    if sys.version_info < (3, 9):
        print(f"{BAD} python           3.9+ needed, this is "
              f"{sys.version_info.major}.{sys.version_info.minor}")
        problems.append("python")
    else:
        print(f"{OK} {'python':<16} {sys.version.split()[0]}")

    ff = {"winget": "Gyan.FFmpeg", "brew": "ffmpeg", "apt": "ffmpeg",
          "manual": "download from https://ffmpeg.org/download.html "
                    "and add the bin folder to PATH"}
    if not check_binary("ffmpeg", ff):
        problems.append("ffmpeg")
    if not check_binary("ffprobe", ff):
        problems.append("ffprobe")

    if not check_module("PIL", "pillow", "needed for arrows, circles, "
                        "and the thumbnail"):
        problems.append("pillow")
    check_module("faster_whisper", "faster-whisper",
                 "only needed to turn a voiceover into word timings",
                 required=False)

    font = os.path.join(here, "assets", "fonts", "Poppins-Black.ttf")
    if os.path.exists(font):
        print(f"{OK} {'caption font':<16} Poppins-Black.ttf")
    else:
        print(f"{BAD} {'caption font':<16} missing at assets/fonts/")
        problems.append("font")

    # libass has to be compiled into ffmpeg or captions silently do nothing
    if shutil.which("ffmpeg"):
        try:
            cfg = subprocess.run(["ffmpeg", "-hide_banner", "-buildconf"],
                                 capture_output=True, text=True, timeout=20).stdout
            if "libass" in cfg:
                print(f"{OK} {'libass':<16} built into ffmpeg")
            else:
                print(f"{BAD} {'libass':<16} this ffmpeg cannot burn captions")
                print("       get a full build (gyan.dev 'full' or 'essentials')")
                problems.append("libass")
        except Exception:
            print(f"{WARN} {'libass':<16} could not check")

    print()
    if problems:
        print(f"{len(problems)} thing(s) to sort out: {', '.join(problems)}")
        if WIN and ("ffmpeg" in problems or "libass" in problems):
            print("\nOn Windows the one-liner is:")
            print("  winget install Gyan.FFmpeg")
            print("then CLOSE AND REOPEN the terminal so PATH updates.")
        return 1

    print("Everything needed is here. Next:")
    print("  1. put the source video in projects/<slug>/source/")
    print("  2. python scout.py \"path/to/source.mp4\"   (survey it)")
    print("  3. python render.py projects/<slug>/config.json")
    return 0


if __name__ == "__main__":
    sys.exit(main())
