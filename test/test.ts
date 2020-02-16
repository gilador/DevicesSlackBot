import DeviceManager, {DeviceAlreadyTakenError, DeviceNotFoundError} from "../src/deviceManager"

const chai = require("chai")
const deepEqualInAnyOrder = require('deep-equal-in-any-order')

chai.use(deepEqualInAnyOrder)


const PRE_DEFINED_DEVICE_MAP_EMPTY = {
    "devices": {
        "_keys": [],
        "_values": [],
        "length": 0
    },
    "users": {
        "_keys": [],
        "_values": [],
        "length": 0
    }

}
const PRE_DEFINED_DEVICE_MAP_JSON = {
    "devices": {
        "pixel3a": "userA",
        "pixel3b": "userA",
        "a": "userA",
        "b": "userA",
        "c": "userA"
    },
    "users": {
        "userA": [
            "pixel3a",
            "pixel3b",
            "a",
            "b",
            "c"
        ]
    }
}

const userA = "userA"
const userB = "a"
const pixel = "pixel"
// const onePlus7t = "onePlus7t"

describe('testing DeviceManager ', function () {
    describe('Init ', function () {
        describe('First Init ', function () {
            it('should init from undefined', function () {
                const deviceMap = new DeviceManager(undefined)
                chai.expect(deviceMap.getDeviceMap()).to.deep.equalInAnyOrder(PRE_DEFINED_DEVICE_MAP_EMPTY)
            })
        })
        describe('Init From S3 ', function () {
            it('Should init from valid json', function () {
                let deviceMap
                chai.expect(deviceMap = new DeviceManager(JSON.stringify(PRE_DEFINED_DEVICE_MAP_JSON))).not.to.throw
                //TODO evaluate the objects as it is and test equality
                chai.expect(deviceMap.getDeviceMap().users.has("userA")).not.to.throw
            })
            it('Should fail init from invalid json - missing devices', function () {
                chai.expect(() => {
                    new DeviceManager('{\n' +
                        '\t"device": {\n' +
                        '\t\t"pixel": ["gilad"],\n' +
                        '\t\t"7t": ["gilad"]\n' +
                        '\t},\n' +
                        '\t"users": {\n' +
                        '\t\t"gilad": ["pixel", "7t"]\n' +
                        '\t}\n' +
                        '}')
                }).to.throw("devices undefined")
            })
            it('Should fail init from invalid json - missing users', function () {
                chai.expect(() => {
                    new DeviceManager('{\n' +
                        '\t"devices": {\n' +
                        '\t\t"pixel": ["gilad"],\n' +
                        '\t\t"7t": ["gilad"]\n' +
                        '\t},\n' +
                        '\t"user": {\n' +
                        '\t\t"gilad": ["pixel", "7t"]\n' +
                        '\t}\n' +
                        '}')
                }).to.throw("users undefined")
            })
        })
    })
    describe('Taking', function () {
        var deviceManager = new DeviceManager(undefined)

        beforeEach(() => {
            deviceManager = new DeviceManager(undefined)
        })

        it('should take device', function () {
            var deviceMap
            chai.expect(deviceMap = deviceManager.takeDevice(userA, pixel)).not.throw
            chai.expect(deviceMap.devices.get(pixel)).to.be.equal(userA)
        })

        it(`should fail take twice same device by the same user`, function () {
            chai.expect(deviceManager.takeDevice(userA, pixel)).not.throw
            chai.expect(() => {
                deviceManager.takeDevice(userA, pixel)
            }).to.throw(DeviceAlreadyTakenError)
        })

        it('should not let user take same device', function () {
            chai.expect(deviceManager.takeDevice(userA, pixel)).not.throw
            chai.expect(() => {
                deviceManager.takeDevice(userB, pixel)
            }).to.throw(DeviceAlreadyTakenError)
        })
    })

    describe('Returning', function () {
        let deviceManager = new DeviceManager(undefined)

        beforeEach(() => {
            deviceManager = new DeviceManager(undefined)
        })

        it('should take device and return', function () {
            chai.expect(deviceManager.takeDevice(userA, pixel)).not.throw
            chai.expect(deviceManager.returnDevice(userA, pixel)).not.throw
        })

        it('should fail return device without taking it before', function () {
            chai.expect(() => {
                deviceManager.returnDevice(userA, pixel)
            }).to.throw(DeviceNotFoundError)
        })

        it('should fail return twice the same device', function () {
            chai.expect(deviceManager.takeDevice(userA, pixel)).not.throw

            chai.expect(
                deviceManager.returnDevice(userA, pixel)
            ).to.not.throw

            chai.expect(() => {
                deviceManager.returnDevice(userA, pixel)
            }).to.throw(DeviceNotFoundError)
        })
    })

    describe('Finding', function () {
        let deviceManager = new DeviceManager(undefined)

        beforeEach(() => {
            deviceManager = new DeviceManager(undefined)
        })

        it('should take than find pixel', function () {
            let deviceMap
            chai.expect(deviceMap = deviceManager.takeDevice(userA, pixel)).not.throw
            chai.expect(deviceMap.devices.get(pixel)).to.not.be.undefined

            chai.expect(deviceManager.findDevice(pixel)).to.be.equal(userA)

        })
    })
})

