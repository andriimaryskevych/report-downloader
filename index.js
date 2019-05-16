const AWS = require('aws-sdk');
const jsonxml = require('jsontoxml');
const s3 = new AWS.S3();

const itemKey = 'jsonReports/report_2019_05_13.json';
const bucketName = 'teststoragereports';

exports.handler = (event, context, callback) => {
    try {
        var params = {
            Bucket: bucketName,
            Key: itemKey
        };

        s3.getObject(params, function (err, data) {
            if (!err) {
                console.log("Successfully got object");

                const jsonResponse = data.Body.toString();
                let response;

                if (false) {
                    response = jsonResponse;
                } else {
                    response = jsonxml(JSON.parse(jsonResponse));
                }

                callback(null, response);
            } else {
                console.log(err);

                throw error;
            }
        });

    } catch (error) {
        console.log('Error occured', error);

        callback(error, null);
    }
};
