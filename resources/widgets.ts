import * as aws from 'aws-sdk';
const s3 = new aws.S3();
const bucketName = process.env.BUCKET;

export async function main(event: any, _context: any) {
    try {
        var method = event.httpMethod;
        if (method === 'GET') {
            if (event.path === '/') {
                const data = await s3.listObjectsV2({Bucket: bucketName!}).promise();
                var body = {
                    widgets: data.Contents?.map(e => e.Key) || ''
                }
                return {
                    statusCode: 200,
                    headers: {},
                    body: JSON.stringify(body)
                }
            }
        }
        return {
            statusCode: 400,
            headers:{},
            body: 'Invalid operation'
        }
    } catch (error) {
        var errorBody = error.stack || JSON.stringify(error, null, 2);
        return {
            statusCode: 500,
            headers:{},
            body: JSON.stringify(errorBody)
        }
    }
}