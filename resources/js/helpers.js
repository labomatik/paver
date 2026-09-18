const helpers = {
    dispatchToFrame(frame, name, data) {
        frame.contentWindow.postMessage({ type: 'paver' + '.' + name, message: data }, '*');
    },

    dispatchToParent(name, data = null) {
        window.parent.postMessage({ type: 'paver' + '.' + name, message: data }, '*');
    },

    // Set by an editor whose canvas is a page of its own: only that frame, on this
    // origin, may then speak. Returns the window of the frame.
    trustedFrame: null,

    listenFromFrame(name, callback) {
        window.addEventListener('message', (event) => {
            if (this.trustedFrame && (event.origin !== window.location.origin || event.source !== this.trustedFrame())) {
                return;
            }

            if (event.data?.type === 'paver' + '.' + name) {
                callback(event.data.message);
            }
        });
    },

    log(...args) {
        let type = 'log';

        if (typeof args[args.length - 1] === 'string' && ['log', 'info', 'warn', 'error'].includes(args[args.length - 1])) {
            type = args.pop();
        }

        console[type]('[PAVER]', ...args);
    }
}

export default helpers;
