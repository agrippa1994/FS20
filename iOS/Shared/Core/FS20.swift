//
//  FS20.swift
//  FS20
//
//  Created by Manuel Stampfl on 27.07.15.
//  Copyright (c) 2015 Mani. All rights reserved.
//

import Foundation

public class FS20 {
    public struct House {
        var name: String
        var code1: Int
        var code2: Int
        var devices: [Device]
        
        private init(fromJSON: [String: AnyObject]) {
            self.name = fromJSON.cast("name", def: "")
            self.code1 = fromJSON.cast("code1", def: 0x00)
            self.code2 = fromJSON.cast("code2", def: 0x00)
            
            self.devices = []
            for device in fromJSON.cast("devices", def: [[String: AnyObject]]()) {
                self.devices += [Device(house: self, fromJSON: device)]
            }
        }
    }
    
    public struct Device {
        var house: House?
        var name: String
        var code: Int
        
        private init(house: House, fromJSON: [String: AnyObject]) {
            self.house = house
            self.name = fromJSON.cast("name", def: "")
            self.code = fromJSON.cast("code", def: 0x00)
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
    
    func houses(completion: [House]? -> Void) {
        self.dataTask("/api") { data, response, error in
            if data == nil || error != nil {
                return completion(nil)
            }
            
            do {
                if let json = try NSJSONSerialization.JSONObjectWithData(data!, options: []) as? [[String: AnyObject]] {
                    var houses: [House] = []
                    for entry in json {
                        houses += [
                            House(fromJSON: entry)
                        ]
                    }
                    
                    return completion(houses)
                }
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