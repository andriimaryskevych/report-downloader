exports.handler = (event, context, callback) => {
    try {
        callback(null, [
            {
                id: 1,
                s3_location: 'here'
            }
        ]);
    } catch (error) {
        console.log('Error occured', error);

        callback(error, null);
    }
};
