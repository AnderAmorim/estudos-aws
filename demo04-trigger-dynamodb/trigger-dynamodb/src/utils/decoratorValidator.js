const decoratorValidator = (fn, schema, argsType) => {
    return async function(event) {
        console.log('event', event);
        console.log('schema', schema);
        console.log('argsType', argsType);

        const data = JSON.parse(event['argsType']);
        const {error, value} = await schema.validat(
            data, {abortEarly:true}
        )

        event[argsType] = value

        if(!error) return fn.apply(this, arguments);

        return {
            statusCode:422,
            body: error.message
        }
    }
}

module.exports = decoratorValidator