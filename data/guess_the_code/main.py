from sys import argv
import importlib

def main():
    module_name = argv[1]
    module = importlib.import_module(module_name)
    check = getattr(module, 'check')

    try:
        res = check(int(argv[2]), int(argv[3]), int(argv[4]))
    except:
        res = 'error'

    print(res, end='')

if __name__ == '__main__':
    main()
