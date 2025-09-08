import os, sys
APP_DIR = '/home/solaropt/solarapi'
if APP_DIR not in sys.path:
    sys.path.insert(0, APP_DIR)
os.chdir(APP_DIR)

from src.app import app as application  