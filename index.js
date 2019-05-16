exports.handler = (event, context, callback) => {
    try {
        callback(null, 'Downloader');
    } catch (error) {
        console.log('Error occured', error);

        callback(error, null);
    }
};
