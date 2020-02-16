import _ from 'lodash'
import DeviceMap from "./deviceMap"

// const TAG = 'DeviceManager'

export default class DeviceManager {

    deviceMap: DeviceMap

    constructor(jsonText: string | undefined) {
        this.deviceMap = new DeviceMap(jsonText)
    }

    /**
     * map a device to a user
     * @param user
     * @param device
     * return a cloned copy of the DeviceMap
     * throws if input is undefined or DeviceManage isn't initialized
     */
    takeDevice(user: string, device: string): DeviceMap {
        this.asseretUser(user)
        this.assertDevice(device)

        if (this.deviceMap.devices.has(device)) {
            throw new DeviceAlreadyTakenError()
        }

        //Adding user to the device map
        // console.log(`takeDevice->adding device: ${device}`)
        this.deviceMap.devices.set(device, user)
        // console.log(`takeDevice-> device ${device} mapped  to: ${JSON.stringify(this.deviceMap.devices.get(device))}`)

        //Adding Device to the user map
        let userDeviceSet = this.deviceMap.users.get(user)
        if (userDeviceSet === undefined) {
            userDeviceSet = new Set<string>()
            this.deviceMap.users.set(user, userDeviceSet)
            // console.log(`takeDevice->adding user: ${user}`)
        }
        userDeviceSet.add(device)
        // console.log(`takeDevice-> user ${user} mapped  to: ' + ${JSON.stringify(userDeviceSet)}`)

        return _.cloneDeep(this.deviceMap)
    }

    /**
     * remove the mapping between a device to a user
     * @param user
     * @param device
     * return a cloned copy of the DeviceMap
     * throws if input is undefined or DeviceManage isn't initialized
     */
    returnDevice(user: string, device: string): DeviceMap {
        this.asseretUser(user)
        this.assertDevice(device)

        if (!this.deviceMap.devices.has(device)) {
            throw new DeviceNotFoundError()
        }

        //Delete device from the user's set
        let userDeviceSet = this.deviceMap.users.get(user)
        if (userDeviceSet === undefined) {
            throw new UserNotFoundError()
        }

        if (!userDeviceSet.has(device)) {
            throw new DeviceNotFoundError(`no such device for user ${user}`)
        }

        //Delete user from the device's map
        this.deviceMap.devices.delete(device)
        // console.log(`returnDevice-> device ${device} was removed from device map`)

        //Delete user from the device set
        userDeviceSet.delete(device)
        // console.log(`returnDevice-> device ${device} was removed from ${user} map, current devices for ${user} are: ${this.deviceMap.devices.get(device)}`)
        return _.cloneDeep(this.deviceMap)
    }

    /**
     * search for a device and return the users who has it
     * @param device
     * throws if input is undefined or DeviceManage isn't initialized
     */
    findDevice(device: string): string {
        this.assertDevice(device)

        if (this.deviceMap === undefined || this.deviceMap.devices === undefined) {
            throw new EmptyStateError()
        }

        const user = this.deviceMap.devices.get(device)

        if (user === undefined) {
            throw new DeviceNotFoundError('I have no records for ' + device)
        }

        return user
    }

    //------------------------------------------------------------------------------------------------------------------
    //                                                  Assertion
    //------------------------------------------------------------------------------------------------------------------

    asseretUser(user: string) {
        if (user === undefined) {
            throw new InputError('user cant be null')
        }
    }

    assertDevice(device: string) {
        if (device === undefined) {
            throw new InputError('device cant be null')
        }
    }

    getDeviceMap() {
        return _.cloneDeep(this.deviceMap)
    }

}

//----------------------------------------------------------------------------------------------------------------------
//                                                  Errors
//----------------------------------------------------------------------------------------------------------------------


export class UserNotFoundError extends Error {
}

export class InputError extends Error {
}

export class InitError extends Error {
}

export class DeviceAlreadyTakenError extends Error {
    constructor() {
        super("This device is already taken, just try a different name if more than one is available")
        this.name = this.constructor.name
        Error.captureStackTrace(this, this.constructor)
    }
}

export class EmptyStateError extends Error {
    constructor() {
        super("My records are empty..")
        this.name = this.constructor.name
        Error.captureStackTrace(this, this.constructor)
    }
}

export class DeviceNotFoundError extends Error {
    constructor(msg?: string) {
        super(msg)
        this.name = this.constructor.name
        Error.captureStackTrace(this, this.constructor)
    }
}


