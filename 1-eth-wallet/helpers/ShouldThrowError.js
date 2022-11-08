module.exports = {
    shouldThrowError: async (promise, options) => {
        const { message, onError } = options

        try {
            await promise

            assert(true)
        } catch (error) {
            if (onError) {
                await onError(error)
            }

            return
        }

        assert(false, message)
    }
}
