import shutil
import os
import sys

src = "temp_vite"
dst = "."

if not os.path.exists(src):
    print("Source directory doesn't exist")
    sys.exit(1)

for item in os.listdir(src):
    s = os.path.join(src, item)
    d = os.path.join(dst, item)
    try:
        if os.path.isdir(s):
            # Merge directory
            if os.path.exists(d):
                shutil.copytree(s, d, dirs_exist_ok=True)
                shutil.rmtree(s)
            else:
                shutil.move(s, d)
        else:
            # File
            if os.path.exists(d):
                os.remove(d) 
            shutil.move(s, d)
        print(f"Moved {item}")
    except Exception as e:
        print(f"Error moving {item}: {e}")

try:
    os.rmdir(src)
except:
    pass
print("Files moved successfully.")
