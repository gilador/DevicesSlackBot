// const restify = require('restify') // require the restify library.
// const AWS = require('aws-sdk')
//
// // Enter copied or downloaded access ID and secret key here
// const ID = 'AKIAJTY4RMBW5XETOVRA'
// const SECRET_KEY = '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'
//
// // The name of the bucket that you have created
// const BUCKET_NAME = 'devicebot-devices'
// const FILE_NAME = 'devicesMap.json'
//
// const DEVICES_ARR_KEY = 'DEVICES'
// const USERS_ARR_KEY = 'USERS'
//
// const s3 = new AWS.S3({
//     accessKeyId: ID,
//     secretAccessKey: SECRET_KEY
// })
//
// var devicesMap = undefined
// var channel_id = undefined
//
// //----------------------------------------------------------------------------------------------------------------------
// //----------------------------------------------------------------------------------------------------------------------
//
// initServer()
//
// //----------------------------------------------------------------------------------------------------------------------
// //----------------------------------------------------------------------------------------------------------------------
//
//
// function initServer() {
//     const server = restify.createServer() // create an HTTP server.
//     server.use(restify.plugins.urlEncodedBodyParser({mapParams: false}))
//
//
//     server.get('/', function (req, res, cb) {
//         return cb()
//     })
//
//     server.post('/device', function (req, res, cb) {
//         console.log("device->req: " + JSON.stringify(req.body))
//         console.log("device->req.body.text: " + JSON.stringify(req.body['text']))
//
//         let retText = ""
//         let ret = ""
//         if (req.body["user_name"] !== undefined && req.body['text'] !== undefined) {
//             let user = req.body['user_name']
//             let text = req.body['text']
//             channel_id = req.body['channel_id']
//
//             console.log('POST->device-> user: ' + user + " text: " + text)
//
//             const device = getdevice(text)
//             // ret = notifyAll(text) ? "<@channel> " : ""
//
//             const command = getCommand(text)
//
//             try {
//                 switch (command) {
//                     case '+':
//                     case 'taking': {
//                         if (device !== undefined && user !== undefined) {
//                             console.log('taking-> adding a device' + device + " user: " + user + ", devicesMap: " + JSON.stringify(devicesMap))
//
//                             let prevUser = takeDevice(user, device)
//                             uploadFile(devicesMap)
//
//                             if (prevUser !== undefined) {
//                                 ret = user + " took " + device + " (" + prevUser + " -> " + devicesMap[DEVICES_ARR_KEY][device] + ")"
//
//                             } else {
//                                 ret = user + " took " + device
//                             }
//                             retText = createChanelRepose(ret)
//                         } else {
//                             throw ("couldn't read device or user property: decive: " + device + ", user" + user)
//                         }
//                         break
//                     }
//                     case '-':
//                     case 'returning': {
//                         if (user !== undefined) {
//                             if (device !== undefined) {
//                                 console.log('returning-> remove a device' + device + ", devicesMap: " + JSON.stringify(devicesMap))
//
//                                 returnDevice(user, device)
//                                 uploadFile(devicesMap)
//
//                                 retText = createChanelRepose(user + " returned " + device)
//                             } else {
//                                 //add remove all devices from user feature
//                             }
//
//                         } else {
//                             throw ("couldn't read device or user property: decive: " + device + ", user" + user)
//                         }
//                         break
//                     }
//                     case '?':
//                     case 'where': {
//                         console.log('where-> device: ' + device)
//                         console.log('where-> devicesMap: ' + JSON.stringify(devicesMap))
//                         let userWithDevice = findDevice(device)
//                         retText = createChanelRepose(userWithDevice + " took " + device)
//                         break
//                     }
//                     case '??':
//                     case 'all': {
//                         if (devicesMap === undefined) {
//                             ret = +"My records are empty.."
//                         } else {
//                             ret = +"Device Inventory:\n" + JSON.stringify(devicesMap)
//                         }
//                         break
//                     }
//                     default: {
//                         ret = "dont know any command:\'" + command + "\'. please try again"
//                     }
//                 }
//             } catch (e) {
//                 //each
//                 retText = createPrivateRepose(e.toString())
//             }
//         } else {
//             retText = createPrivateRepose(e.toString())
//         }
//
//
//         console.log("response: " + retText)
//         res.header('Content-type', "application/json")
//         res.send(200, retText)
//
//         return cb()
//     })
//
//     server.listen(process.env.PORT || 5000, function () { // bind server to port 5000.
//         console.log('------------------------------------------------------------------------------')
//         console.log('% s listening at % s', server.name, server.url)
//         initPersistent()
//     })
// }
//
// async function initPersistent() {
//
//     const file = await readFile()
//     if (file !== undefined) {
//         devicesMap = JSON.parse(file)
//         console.log("initPersistent-> " + FILE_NAME + " was loaded successfully")
//     } else {
//         let json = "{\"" + DEVICES_ARR_KEY + "\": {}, \"" + USERS_ARR_KEY + "\": {}}"
//         console.log("initPersistent-> json:" + json)
//
//         devicesMap = JSON.parse(json)
//         console.log("initPersistent-> " + FILE_NAME + " could not be loaded ")
//         uploadFile(devicesMap)
//     }
//     console.log("initPersistent-> devicesMap:" + JSON.stringify(devicesMap))
// }
//
// function takeDevice(user, device) {
//     if (user === undefined || device === undefined) {
//         throw("user or device are undefined: user: " + user + " device: " + device)
//     }
//
//     //Device held by someone else:
//     let prevUser = undefined
//
//     if (devicesMap !== undefined && devicesMap[DEVICES_ARR_KEY] !== undefined && devicesMap[DEVICES_ARR_KEY][device] !== undefined) {
//         prevUser = devicesMap[DEVICES_ARR_KEY][user]
//     }
//
//     if (prevUser) {
//         if (devicesMap[USERS_ARR_KEY][prevUser] !== undefined) {
//             const indexOfDevice = devicesMap[USERS_ARR_KEY][prevUser].indexOf(device)
//             if (indexOfDevice !== undefined) {
//                 //removing the device from the previous user list
//                 devicesMap[USERS_ARR_KEY][prevUser][indexOfDevice] = undefined
//                 console.log("takeDevice-> taking device from prevUser: " + prevUser)
//
//             } else {
//                 console.warn("takeDevice->prevUser: " + prevUser + ", but i cant find the device in his list")
//             }
//         } else {
//             console.warn("takeDevice->prevUser: " + prevUser + ", but he doesnt hold any device")
//         }
//     }
//
//     //Adding Device to both Devices and Users maps
//     devicesMap[DEVICES_ARR_KEY][device] = user
//     if (devicesMap[USERS_ARR_KEY][user] === undefined) {
//         devicesMap[USERS_ARR_KEY][user] = []
//         console.log("takeDevice->adding user: " + user)
//     }
//
//     devicesMap[USERS_ARR_KEY][user].push(device)
//
//     console.log('taking-> device' + device + " by: " + devicesMap[DEVICES_ARR_KEY][device])
//     console.log('taking-> user' + user + " with: " + devicesMap[USERS_ARR_KEY][user])
//
//     return prevUser
// }
//
// function returnDevice(user, device) {
//     if (user === undefined || device === undefined) {
//         throw("user or device are undefined: user: " + user + " device: " + device)
//     }
//
//     //TODO test!!!
//     //remove from device map
//     devicesMap[DEVICES_ARR_KEY] = devicesMap[DEVICES_ARR_KEY].filter(function(ele){
//         return ele !== device;
//     });
//
//     //remove from user map( and nested list)
//     if (devicesMap[USERS_ARR_KEY][user] !== undefined && devicesMap[USERS_ARR_KEY][user]) {
//         devicesMap[USERS_ARR_KEY][user] = devicesMap[USERS_ARR_KEY][user].filter(function(ele){
//             return ele !== device;
//         });
//         console.log('returning-> device' + device + " was removed from user: " + user)
//     } else {
//         throw(device + " could not be removed from user: " + user)
//     }
// }
//
// function getCommand(text) {
//     const splitted = text.split(' ')
//     console.log("getCommand->" + splitted[0])
//     return splitted[0]
// }
//
// function notifyAll(text) {
//     const splitted = text.split(' ')
//     console.log("notifyAll->" + splitted[2])
//     return splitted[2] === "*"
// }
//
// function getdevice(text) {
//     const splitted = text.split(' ')
//     console.log("getdevice->" + splitted[1])
//     return splitted[1]
// }
//
// const findDevice = (device) => {
//     if (device === undefined) {
//         throw(device + " cant be undefined")
//     } else if (devicesMap === undefined) {
//         throw(device + " My records are empty..")
//     } else if (devicesMap[DEVICES_ARR_KEY] === undefined) {
//         throw(device + "I have no records for " + device)
//     }
//
//
// }
//
// const uploadFile = (contentObj) => {
//     let content = JSON.stringify(contentObj)
//     // Setting up S3 upload parameters
//     const params = {
//         Bucket: BUCKET_NAME,
//         Key: FILE_NAME, // File name you want to save as in S3
//         Body: content,
//         ContentType: "text/html",
//         ContentEncoding: "UTF-8"
//     }
//
//     // Uploading files to the bucket
//     s3.upload(params, function (err, data) {
//         if (err) {
//             console.log(`File upload failure. ${data.Location}`)
//             //TODO handle gracefully
//
//         }
//         console.log(`File uploaded successfully. ${data.Location}`)
//     })
// }
//
// const readFile = () => {
//     return new Promise((resolve, reject) => {
//         s3.getObject({Bucket: BUCKET_NAME, Key: FILE_NAME}, function (err, data) {
//             if (err) {
//                 console.log(err, err.stack)
//                 resolve(undefined)
//             } else {
//                 let jsonObj = data.Body.toString('utf-8')
//                 console.log(jsonObj)
//                 resolve(jsonObj)
//             }
//         })
//     })
// }
//
// const createChanelRepose = (text) => {
//     return {
//         "response_type": "in_channel",
//         "type": "section",
//         "text": {
//             "type": "mrkdwn",
//             "text": "<@channel> " + text
//         }
//     }
// }
//
// const createPrivateRepose = (text) => {
//     return {
//         "type": "section",
//         "text": {
//             "type": "mrkdwn",
//             "text": text
//         }
//     }
// }
