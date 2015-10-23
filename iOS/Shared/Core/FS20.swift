//
//  FS20.swift
//  FS20
//
//  Created by Manuel Stampfl on 27.07.15.
//  Copyright (c) 2015 Mani. All rights reserved.
//

import Foundation

public class FS20 {
    public struct Room {
        var id: Int
        var name: String
        var code1: Int
        var code2: Int
        var devices: [Device]
        
        private init(fromJSON: [String: AnyObject]) throws {
            self.id = try fromJSON.cast("id")
            self.name = try fromJSON.cast("name")
            self.code1 = try fromJSON.cast("code1")
            self.code2 = try fromJSON.cast("code2")
         
            self.devices = []
            let jsonDevices: [[String: AnyObject]] = try fromJSON.cast("devices")
            for device in jsonDevices {
                self.devices += [try Device(room: self, fromJSON: device)]
            }
        }
    }
    
    public struct Device {
        var id: Int
        var room: Room
        var name: String
        var code: Int
        var roomId: Int
        
        private init(room: Room, fromJSON: [String: AnyObject]) throws {
            self.room = room
            self.id = try fromJSON.cast("id")
            self.name = try fromJSON.cast("name")
            self.code = try fromJSON.cast("code")
            self.roomId = try fromJSON.cast("roomId")
        }
    }
    
    var url: NSURL
    private var sharedSession: NSURLSession
    
    init(url: NSURL) {
        self.url = url
        self.sharedSession = NSURLSession.sharedSession()
    }
    
    func rooms(completion: [Room]? -> Void) {
        self.dataTask("/api/rooms") { data, response, error in
            if data == nil || error != nil {
                return completion(nil)
            }
            
            do {
                if let json = try NSJSONSerialization.JSONObjectWithData(data!, options: []) as? [[String: AnyObject]] {
                    var rooms: [Room] = []
                    for entry in json {
                        rooms += [
                            try Room(fromJSON: entry)
                        ]
                    }
                    
                    return completion(rooms)
                }
            }
            catch DictionaryCastError.TypeError(let message) {
                NSLog("JSON cast error: \(message)")
            }
            catch {
                NSLog("Deserialization error \(error)")
            }
        
            return completion(nil)
        }
    }
    
    func setDeviceState(device: Device, state: Bool, completion: Int? -> Void) {
        let stateText = state ? "enable" : "disable"
        let relPath = "/api/device/\(device.id)/\(stateText)"
        
        self.dataTask(relPath) { data, response, error in
            if(error != nil) {
                NSLog("DataTask-Error: \(error)")
                return completion(nil)
            }
            
            if(data == nil) {
                NSLog("Unknown error (data is nil, but no error occured)")
                return completion(nil)
            }
            
          
            guard let decoder = try? NSJSONSerialization.JSONObjectWithData(data!, options: []) as? [String: AnyObject] else {
                NSLog("Deserialization error @ data (\(data))")
                return completion(nil)
            }
            
            return completion(decoder?["code"] as? Int)
        }
    }
    
    private func dataTask(path: String, completion: (NSData?, NSURLResponse?, NSError?) -> Void) {
        self.sharedSession.dataTaskWithURL(NSURL(string: path, relativeToURL: self.url)!, completionHandler: completion).resume()
    }
}