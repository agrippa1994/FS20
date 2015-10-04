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
        
        private init(fromJSON: [String: AnyObject], withID id: Int) throws {
            self.id = id
            self.name = try fromJSON.cast("name")
            self.code1 = try fromJSON.cast("code1")
            self.code2 = try fromJSON.cast("code2")
         
            self.devices = []
            let jsonDevices: [[String: AnyObject]] = try fromJSON.cast("devices")
            for (id, device) in jsonDevices.enumerate() {
                self.devices += [try Device(room: self, fromJSON: device, withID:id)]
            }
        }
    }
    
    public struct Device {
        var id: Int
        var room: Room?
        var name: String
        var code: Int
        
        private init(room: Room, fromJSON: [String: AnyObject], withID id: Int) throws {
            self.id = id
            self.room = room
            self.name = try fromJSON.cast("name")
            self.code = try fromJSON.cast("code")
        }
        
        public func enable() {
            
        }
        
        public func disable() {
            
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
                    for (id, entry) in json.enumerate() {
                        rooms += [
                            try Room(fromJSON: entry, withID:id)
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
    
    private func dataTask(path: String, completion: (NSData?, NSURLResponse?, NSError?) -> Void) {
        self.sharedSession.dataTaskWithURL(NSURL(string: path, relativeToURL: self.url)!, completionHandler: completion).resume()
    }
}