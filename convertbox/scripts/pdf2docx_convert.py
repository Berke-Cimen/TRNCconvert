import sys
import os
from pdf2docx import Converter

def main():
    if len(sys.argv) != 3:
        sys.exit(1)
    input_path = sys.argv[1]
    output_path = sys.argv[2]
    if not os.path.exists(input_path):
        sys.exit(1)
    try:
        cv = Converter(input_path)
        cv.convert(output_path, start=0, end=None)
        cv.close()
    except Exception:
        if os.path.exists(output_path):
            os.remove(output_path)
        sys.exit(1)
    if (not os.path.exists(output_path)) or os.path.getsize(output_path) == 0:
        if os.path.exists(output_path):
            os.remove(output_path)
        sys.exit(1)

if __name__ == "__main__":
    main()
