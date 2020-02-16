import S3 = require("aws-sdk/clients/s3")
import {ManagedUpload} from "aws-sdk/lib/s3/managed_upload"
import DeviceMap from "./deviceMap"

const TAG = "DataProvider"

// Enter copied or downloaded access ID and secret key here
const ID = ''//<S3 ID>
const SECRET_KEY = ''//<S3 Secret Key>

// The name of the bucket that you have created
const BUCKET_NAME = 'devicebot-devices'
const FILE_NAME = 'devicesMap.json'

const s3 = new S3({
    accessKeyId: ID,
    secretAccessKey: SECRET_KEY
})


export function uploadFile(content: Object) {
    // Setting up S3 upload parameters
    const params = {
        Bucket: BUCKET_NAME,
        Key: FILE_NAME,
        Body: content,
        ContentType: "application/json",
        ContentEncoding: "UTF-8"
    }

    // Uploading files to the bucket
    s3.upload(params, function (err: Error, data: ManagedUpload.SendData) {
        if (err) {
            console.log(`File upload failure. ${data.Location}`)
            //TODO handle gracefully

        }
        console.log(`File uploaded: ${content}  successfully. ${data.Location}`)
    })
}

export function readFile() {
    return new Promise<string | undefined>((resolve, reject) => {
        s3.getObject({Bucket: BUCKET_NAME, Key: FILE_NAME}, function (err, data) {
            if (err) {
                console.log(err, err.stack)
                reject()
            } else if (data !== undefined && data.Body !== undefined) {
                let file = data.Body.toString('utf-8')
                resolve(file)
            } else {
                resolve(undefined)
            }
        })
    })
}

export function createBucket(deviceMap: DeviceMap) {
    return new Promise<string | undefined>((resolve, reject) => {
        s3.createBucket(function() {
            let content = JSON.stringify(deviceMap)

            const params = {
                Bucket: BUCKET_NAME,
                Key: FILE_NAME,
                Body: content,
                ContentType: "application/json",
                ContentEncoding: "UTF-8"
            }
            s3.putObject(params, function(err, data) {
                if (err) {
                    console.log(`${TAG} -> Error creating bucket: ${err}`);
                    reject()
                } else {
                    console.log(`${TAG} -> Bucket was creates successfully`);
                    resolve()
                }
            });
        });
    })
}
