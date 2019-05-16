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
        var params = {
            Bucket: bucketName,
            Key: itemKey
        };

        const {
            type,
            id
        } = event;

        let query = `SELECT * FROM ReportsMetadata WHERE ID = ${id}`;
        sql.connect(config, function(err, pool) {
            if (!err) {
                pool.request().query(query, function(err, res) {
                    if (!err) {
                        const resopnse = res.recordset;
                        params.Key = resopnse.S3Location;

                        s3.getObject(params, function (err, data) {
                            if (!err) {
                                console.log("Successfully got object");

                                const jsonResponse = data.Body.toString();

                                const serizlizer = serizlizerMap[type] || serizlizerMap.json;
                                const response = serizlizer(jsonResponse);

                                callback(null, response);
                            } else {
                                console.log();

                                callback(err);
                            }
                        });
                    } else {
                        console.log('Error fetching data from sql');
                        callback(err);
                    }
                });
            } else {
                console.log('Error creating SQL connection');
                callback(err);
            }
        });
    } catch (error) {
        console.log('Error occured', error);

        callback(error, null);
    }
};
