from sys import argv
import importlib

def main():
    module_name = argv[1]
    module = importlib.import_module(module_name)
    check = getattr(module, 'check')

    i = 2
    while i + 3 <= len(argv):
        try:
            res = check(int(argv[i]), int(argv[i + 1]), int(argv[i + 2]))
        except:
            res = 'error'

        print(res)
        i += 3

if __name__ == '__main__':
    main()
