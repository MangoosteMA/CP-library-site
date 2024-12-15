from sys import argv
import re
from sys import stdin, stderr
import importlib
import random


def get_evaluator(module_name):
    module = importlib.import_module(module_name)
    return getattr(module, 'check')


# TODO: add logging
def main():
    random.seed(42)
    user_func = get_evaluator(argv[1])
    main_func = get_evaluator(argv[2])
    tests = list(map(str.strip, stdin.readlines()))
    for test in tests:
        var = test.split()
        if var[0] != 'Random':
            # TODO: another modes
            continue
        runs_count = int(var[1])
        ranges = []
        pattern = re.compile('\[(\d+):(\d+)\]')
        for rng in var[2:]:
            l, r = map(int, pattern.findall(rng)[0])
            ranges.append((l, r))
        for _ in range(runs_count):
            args = [random.randint(l, r) for (l, r) in ranges]
            if not test_one(user_func, main_func, *args):
                print(f'Not equal on {args}', file=stderr)
                exit(1)


def test_one(f1, f2, *args):
    return f1(*args) == f2(*args)


if __name__ == '__main__':
    main()
