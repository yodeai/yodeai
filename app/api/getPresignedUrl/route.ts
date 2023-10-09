import { NextRequest, NextResponse } from "next/server";

const AWS = require('aws-sdk');
const s3 = new AWS.S3();

export async function GET(request: NextRequest) {

    const key = request.nextUrl.searchParams.get("key");
    console.log("CALLING API, key: " + key);
    const parsedUrl = new URL(key);
    const objectKey = parsedUrl.pathname.substring(1);  // Remove the leading slash
    const params = {
        Bucket: 'yodeai',
        Key: objectKey,
        Expires: 60 * 5,  // URL expires in 5 minutes
    };
    

    return new Promise((resolve) => {
        s3.getSignedUrl('getObject', params, (err, url) => {
            if (err) {
                console.log(err);
                resolve(new NextResponse(
                    JSON.stringify({ error: 'Failed to process request.' }),
                    { status: 500 }
                ));
            } else {
                console.log("SUCCESS!", url);
                resolve(new NextResponse(
                    JSON.stringify({ success: true, data: url }),
                    { status: 200 }
                ));
            }
        });
    });
}