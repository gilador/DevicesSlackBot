import * as restify from "restify"
import {Server} from "restify"
import {InvalidContentError} from "restify-errors"
import {createBucket, readFile, uploadFile} from "./dataProvider"
import DeviceManager from "./deviceManager"

const TAG = "BotServer"

export default class BotServer {
    deviceManager: DeviceManager | undefined
    server: Server | undefined

    async init() {
        console.log("BotServer-> creating server")

        this.server = restify.createServer() // create an HTTP server.
        this.server.use(restify.plugins.urlEncodedBodyParser({mapParams: false}))

        try {
            let deviceMapFromS3 = await readFile()
            this.deviceManager = new DeviceManager(deviceMapFromS3)
        } catch (e) {
            this.deviceManager = new DeviceManager(undefined)
            await createBucket(this.deviceManager.deviceMap)
        }

        const deviceManager = this.deviceManager
        this.server.post('/device', function (req: restify.Request, res: restify.Response, cb: restify.Next) {
            validate(req, res, cb)

            console.log("BotServer-> incoming Post request:" + JSON.stringify(req.body))

            let retObj

            const user = req.body['user_name']
            const text = req.body['text']
            const device = getdevice(text)
            const command = getCommand(text)

            console.log(`${TAG} -> user: ${user}, text: ${text}, device: ${device}, command: ${command} `)

            try {
                switch (command) {
                    case '+':
                    case 'taking': {
                        let newDeviceMap = deviceManager.takeDevice(user, device)
                        uploadFile(newDeviceMap.toJSON())
                        retObj = createChanelRepose(`${user} took ${device}`)
                        break
                    }
                    case '-':
                    case 'returning': {
                        let newDeviceMap = deviceManager.returnDevice(user, device)
                        uploadFile(newDeviceMap.toJSON())
                        retObj = createChanelRepose(`${user} returned ${device}`)
                        break
                    }
                    case '?':
                    case 'where': {
                        let ret = deviceManager.findDevice(device)
                        retObj = createPrivateRepose(`${ret} has ${device}`)
                        break
                    }
                    case '??':
                    case 'all': {
                        retObj = createPrivateRepose("```" + deviceManager.deviceMap.toJSON() + "```")
                        break
                    }
                    default: {
                        retObj = createPrivateRepose(`what? try again`)
                    }
                }
            } catch (e) {
                console.error(`error was thrown ${e}`)
                retObj = createPrivateRepose(e.toString())
            }

            console.log(`responding to user ${user} with ${JSON.stringify(retObj)}`)

            res.header('Content-type', "application/json")
            res.send(200, retObj)

            return cb()
        })

        let name = this.server.name
        let url = this.server.url

        this.server.listen(process.env.PORT || 5000, function () { // bind server to port 5000.
            console.log('------------------------------------------------------------------------------')
            console.log('% s listening at % s', name, url)
        })

        function validate(req: restify.Request, res: restify.Response, next: restify.Next) {
            if (!req.is('application/json')) {
                next(new InvalidContentError())
                return
            }
            if (req.body["user_name"] !== undefined || req.body['text'] !== undefined) {
                next(new InvalidContentError()) //TODO  return more relevant err
            }
        }

        function getdevice(text: string): string {
            const slitted = text.split(' ')
            return slitted[1]
        }

        function getCommand(text: string): string {
            const splitted = text.split(' ')
            console.log("getCommand->" + splitted[0])
            return splitted[0]
        }

        const createPrivateRepose = (data: string | {}): {} => {
            return {
                text: data,
            }
        }

        const createChanelRepose = (data: string | {}): {} => {
            return {
                text: data,
                response_type: 'in_channel',
                replace_original: 'true'
            }
        }
    }
}
