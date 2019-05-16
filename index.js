const AWS = require('aws-sdk');
const jsonxml = require('jsontoxml');
const s3 = new AWS.S3();

var sql = require("mssql");

var config = {
    user: 'nodejsteam2',
    password: 'HelloWorld!',
    server: 'reports-db.cfgf8dz2qitj.eu-central-1.rds.amazonaws.com',
    database: 'dbo.reports-db'
};

const itemKey = 'jsonReports/report_2019_05_13.json';
const bucketName = 'teststoragereports';

const JSONserializer = JSONresponse => JSONresponse;
const XMLserializer = JSONresponse => jsonxml(JSON.parse(JSONresponse));

const serizlizerMap = {
    'json': JSONserializer,
    'xml': XMLserializer
};

exports.handler = (event, context, callback) => {
    try {
        const sendErrorResponse = error => {
            sql.close();

            callback(error);
        };

        var params = {
            Bucket: bucketName,
            Key: itemKey
        };

        const {
            type,
            id
        } = event;

        if (isNaN(Number(id))) {
            sendErrorResponse(new Error('Failed parsing id'));
        }

        let query = `SELECT * FROM ReportsMetadata WHERE ID = ${Number(id)}`;

        console.log('Query', query);

        sql.connect(config, function(err) {
            if (!err) {
                new sql.Request().query(query, function(err, res) {
                    if (!err) {
                        const response = res.recordset;

                        console.log('Response', response);

                        if (response.length === 0) {
                            console.log('Report not found');
                            sendErrorResponse(new Error('Report not found'));
                        }

                        const report = response[0];

                        params.Key = report.S3Location;

                        s3.getObject(params, function (err, data) {
                            if (!err) {
                                console.log("Successfully got object");

                                const jsonResponse = data.Body.toString();

                                const serizlizer = serizlizerMap[type] || serizlizerMap.json;
                                const serviceResponse = serizlizer(jsonResponse);

                                sql.close();

                                callback(null, serviceResponse);
                            } else {
                                console.log();

                                sendErrorResponse(err);
                            }
                        });
                    } else {
                        console.log('Error fetching data from sql');
                        sendErrorResponse(err);
                    }
                });
            } else {
                console.log('Error creating SQL connection');
                sendErrorResponse(err);
            }
        });
    } catch (error) {
        console.log('Error occured', error);

        callback(error, null);
    }
};
