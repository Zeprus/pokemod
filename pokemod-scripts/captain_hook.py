#!/usr/bin/env python3
"""
Captain Hook

Main script for interfacing with Frida Server.
"""

__author__ = "Accepting suggestions of names for our group."
__version__ = "0.1.1"
__license__ = "MIT"

import argparse
import os
import sys

import frida
from logzero import logger


def on_message(message, data):
    """ Callback function to receive and log messages received from the server """
    if message['type'] == 'send':
        logger.info(message['payload'])
    elif message['type'] == 'error':
        logger.info(message['stack'])

    if data:
        logger.info(data)


def main(args):
    """ Main entry point of the app """
    logger.setLevel(args.verbose + 1)

    # Sets the device from USB though it works with
    # devices connected via adb tcpip as wells
    device = frida.get_usb_device()
    logger.debug('Got device %s', device)

    # Attaches frida to device
    session = device.attach(args.process)
    logger.debug('Created session %s, using process %s', session, args.process)

    # Loads and creates the session script
    with open(args.payload, "r") as file:
        try:
            # Creates script from file
            script = session.create_script(file.read(), runtime="v8")

            # Attaches the callback function to the script
            script.on('message', on_message)
        except Exception as e:
            logger.critical('Something went wrong! This is what I got:\n%s', e)
            exit(1)
        else:
            logger.debug('Created script %s', script)

    # Injects the script into the process
    try:
        script.load()
    except Exception as e:
        logger.critical('Something went wrong! This is what I got:\n%s', e)
        exit(1)
    else:
        logger.info('Injected into the application! Sweet :)')

    # Listens indefinitely for messages:
    logger.debug('Listening for messages...')
    sys.stdin.read()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()

    # TODO: add nargs='+', allow empty, and make selector for payloads that reside on the same directory
    parser.add_argument('payload', help='JS payload (script) to inject.')

    parser.add_argument("-p", "--process", action="store_true",
                        default='com.nianticlabs.pokemongo',
                        help="[Optional] process name to inject into. Defaults to PoGo's.") # yapf: disable

    parser.add_argument("-v", "--verbose", action="count",
                        default=0, help="Verbosity (-v | -vv)")                             # yapf: disable

    parser.add_argument("--version",
                        action="version",
                        version="%(prog)s (version {version})".format(version=__version__)) # yapf: disable

    args = parser.parse_args()
    main(args)
