import * as aws from 'aws-sdk';
const s3 = new aws.S3();
const bucketName = process.env.BUCKET;

export async function main(event: any, _context: any) {

    var badRequest = {statusCode: 400, headers: {}, body: 'Bad request'};

    var notFound = {statusCode: 404, headers:{}, body: 'Not found'};

    const serverError = (error: any) => { return {statusCode: 500, headers:{}, body: JSON.stringify(error.stack || JSON.stringify(error))}; }

    const ok = (data: any) => { return {statusCode: 200, headers:{}, body: JSON.stringify(data)}; }

    const created = (data: any) => { return {statusCode: 201, headers:{}, body: JSON.stringify(data)}; }

    var noContent = {statusCode: 204, headers:{}};

    try {
        var method = event.httpMethod;
        var widgetName = event.path.startsWith('/') ? event.path.substring(1) : event.path;

        if (method === 'GET' && event.path === '/') {
            const data = await s3.listObjectsV2({Bucket: bucketName!}).promise();
            return ok(data.Contents?.map(e => e.Key) || '');
        }

        if (method === 'GET' && widgetName) {
            const data = await s3.getObject({Bucket: bucketName!, Key: widgetName}).promise();
            if (data) return ok(data);
            return notFound;
        }

        if (method === 'POST' && event.path === '/') {
            if (!event.body) return badRequest;
            if (!event.body.name) return badRequest;
            event.body.createdAt = new Date().toUTCString();
            const base64data = new Buffer(event, 'binary');
            await s3.putObject({
                Bucket: bucketName!,
                Key: event.body.name,
                Body: base64data,
                ContentType: 'application/json'
            }).promise();
            return created(event.body);
        }

        // if (method === 'PUT') {}

        if (method === 'DELETE') {
            if (!widgetName) return badRequest;
            const data = await s3.getObject({Bucket: bucketName!, Key: widgetName}).promise();
            if (!data) return notFound;
            await s3.deleteObject({Bucket: bucketName!, Key: widgetName}).promise();
            return noContent;
        }

        return badRequest;
    } catch (error) {
        return serverError(error);
    }
}