#!/usr/bin/env python3
import os
import subprocess

MASTER_LOGO = "public/vanjari-jodi-official-logo.png"

if not os.path.exists(MASTER_LOGO):
    print(f"Error: {MASTER_LOGO} not found!")
    exit(1)

print(f"Using master logo: {MASTER_LOGO}")

# Ensure directories exist
os.makedirs("public/icons", exist_ok=True)
os.makedirs("public", exist_ok=True)

# 1. Generate Web / PWA icons
web_icons = [
    ("public/favicon-16x16.png", 16, 16),
    ("public/favicon-32x32.png", 32, 32),
    ("public/favicon.png", 64, 64),
    ("public/apple-touch-icon.png", 180, 180),
    ("public/icon-192.png", 192, 192),
    ("public/icon-512.png", 512, 512),
    ("public/playstore-icon-512.png", 512, 512),
    ("public/notification-icon.png", 96, 96),
    ("public/logo.png", 512, 512),
    # PWA icons folder
    ("public/icons/icon-48x48.png", 48, 48),
    ("public/icons/icon-72x72.png", 72, 72),
    ("public/icons/icon-96x96.png", 96, 96),
    ("public/icons/icon-128x128.png", 128, 128),
    ("public/icons/icon-144x144.png", 144, 144),
    ("public/icons/icon-152x152.png", 152, 152),
    ("public/icons/icon-192x192.png", 192, 192),
    ("public/icons/icon-384x384.png", 384, 384),
    ("public/icons/icon-512x512.png", 512, 512),
]

for out_path, w, h in web_icons:
    cmd = ["convert", MASTER_LOGO, "-resize", f"{w}x{h}!", "-quality", "100", out_path]
    subprocess.run(cmd, check=True)

# Generate favicon.ico
cmd_ico = ["convert", MASTER_LOGO, "-resize", "256x256", "-define", "icon:auto-resize=64,48,32,16", "public/favicon.ico"]
subprocess.run(cmd_ico, check=True)

# Generate Maskable icon (full edge-to-edge)
cmd_maskable = [
    "convert", MASTER_LOGO,
    "-resize", "512x512!",
    "public/icon-maskable-512.png"
]
subprocess.run(cmd_maskable, check=True)
subprocess.run(["cp", "public/icon-maskable-512.png", "public/icons/icon-maskable-512x512.png"], check=True)

# 2. Android Mipmap launcher icons (FULL BLEED / LARGE SCALE)
mipmap_specs = [
    ("mdpi", 48, 108),
    ("hdpi", 72, 162),
    ("xhdpi", 96, 216),
    ("xxhdpi", 144, 324),
    ("xxxhdpi", 192, 432),
]

for density, icon_sz, fg_canvas_sz in mipmap_specs:
    dir_path = f"android/app/src/main/res/mipmap-{density}"
    os.makedirs(dir_path, exist_ok=True)
    
    # 1. Standard ic_launcher.png (Full resolution fill)
    ic_path = f"{dir_path}/ic_launcher.png"
    subprocess.run(["convert", MASTER_LOGO, "-resize", f"{icon_sz}x{icon_sz}!", ic_path], check=True)
    
    # 2. Round ic_launcher_round.png
    ic_round_path = f"{dir_path}/ic_launcher_round.png"
    subprocess.run(["convert", MASTER_LOGO, "-resize", f"{icon_sz}x{icon_sz}!", ic_round_path], check=True)
    
    # 3. Adaptive ic_launcher_foreground.png (Maximized 90% fill so icon looks much larger)
    fg_logo_sz = int(fg_canvas_sz * 0.88)
    fg_path = f"{dir_path}/ic_launcher_foreground.png"
    subprocess.run([
        "convert", MASTER_LOGO,
        "-resize", f"{fg_logo_sz}x{fg_logo_sz}!",
        "-gravity", "center",
        "-background", "none",
        "-extent", f"{fg_canvas_sz}x{fg_canvas_sz}",
        fg_path
    ], check=True)

# Copy to android assets
os.makedirs("android/app/src/main/assets/public", exist_ok=True)
subprocess.run(["cp", "-r", "public/.", "android/app/src/main/assets/public/"], check=True)

print("🎉 ALL icons re-generated with maximized edge-to-edge resolution!")
