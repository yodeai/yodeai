import { NextRequest, NextResponse } from "next/server";

const AWS = require('aws-sdk');

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
    Bucket: process.env.AWS_S3_BUCKET_NAME,
});

const s3 = new AWS.S3();

export async function POST(request: NextRequest) {
    // Reading and parsing the request body from the stream
    const requestBody = await request.text();
    const parsedBody = JSON.parse(requestBody);

    if (!parsedBody.file) {
        return new NextResponse(
            JSON.stringify({ error: 'No file provided.' }),
            { status: 400 }
        );
    }

    const decodedFile = Buffer.from(parsedBody.file, 'base64');

    const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: `${Date.now()}.pdf`,
        Body: decodedFile,
        ContentType: 'application/pdf'
    };

    try {
        const response = await s3.upload(params).promise();
        return new NextResponse(
            JSON.stringify({ success: true, data: response }),
            { status: 200 }
        );

    } catch (error) {
        console.error("Error:", error);
        return new NextResponse(
            JSON.stringify({ error: 'Failed to process request.' }),
            { status: 500 }
        );
    }
};
