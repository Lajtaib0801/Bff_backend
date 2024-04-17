const tryCatchWrapper = (fn) => {
    return async (...args) => {
        try {
            return await fn(...args)
        } catch (error) {
            if (process.env.NODE_ENV == 'development') {
                console.log(error)
            }
            if (typeof args[args.length - 1] == 'function') {
                args[args.length - 1](error)
            }
        }
    }
}

module.exports = tryCatchWrapper
