import {TSMap} from "typescript-map"
import {InitError} from "./deviceManager"

export default class DeviceMap {

    devices: TSMap<string, string>
    users: TSMap<string, Set<string>>

    constructor(json: string | undefined) {
        if (json === undefined) {
            this.devices = new TSMap<string, string>()
            this.users = new TSMap<string, Set<string>>()
        } else {
            let  jsonObj = JSON.parse(json)
            if (jsonObj.devices === undefined) {
                throw new InitError("devices undefined")
            }
            if (jsonObj.users === undefined) {
                throw new InitError("users undefined")
            }

            this.devices = this.objToStrMap(jsonObj.devices)
            this.users = this.objToStrMapofSets(jsonObj.users)
        }
    }


    private mapToJSON(map: TSMap<string, string>): { [key: string]: any } {
        let obj: { [key: string]: any } = {}

        const getValue = (value: any): any => {
            if (value instanceof TSMap) {
                return value.toJSON()
            } else if (Array.isArray(value)) {
                return value.map(v => getValue(v))
            } else if (value instanceof Set) {
                return Array.from(value).map(v => getValue(v))
            } else {
                return value
            }
        }

        map.keys().forEach((k) => {
            obj[String(k)] = getValue(map.get(k))
        })
        return obj
    }

    public toJSON(): {} {
        let retDeviceMap = {}
        // @ts-ignore
        retDeviceMap['devices'] = this.mapToJSON(this.devices)
        // @ts-ignore
        retDeviceMap['users'] = this.mapToJSON(this.users)
        return JSON.stringify(retDeviceMap)

    }

    private objToStrMap(obj: any): TSMap<string, string> {
        let strMap = new TSMap<string, string>()
        for (let k of Object.keys(obj)) {
            strMap.set(k, obj[k])
        }
        return strMap
    }

    private objToStrMapofSets(obj: any): TSMap<string, Set<string>> {
        let strMap = new TSMap<string, Set<string>>()
        for (let k of Object.keys(obj)) {
            let set = new Set<string>()
            for (let val of Object.values(obj[k])) {
                set.add(val as string)
            }
            strMap.set(k, set)

        }
        return strMap
    }
}
