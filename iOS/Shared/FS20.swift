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
        var id: Int
        var name: String
        var code1: Int
        var code2: Int
        var devices: [Device]
        
        private init(fromJSON: [String: AnyObject]) {
            self.id = fromJSON.cast("id", def: 0)
            self.name = fromJSON.cast("name", def: "")
            self.code1 = fromJSON.cast("code1", def: 1111)
            self.code2 = fromJSON.cast("code2", def: 1111)
            
            self.devices = []
            for device in fromJSON.cast("devices", def: [[String: AnyObject]]()) {
                self.devices += [Device(fromJSON: device)]
            }
        }
    }
    
    public struct Device {
        //var house: House
        var id: Int
        var name: String
        var code: Int
        
        private init(fromJSON: [String: AnyObject]) {
            self.id = fromJSON.cast("id", def: 0)
            self.name = fromJSON.cast("name", def: "")
            self.code = fromJSON.cast("code", def: 0)
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
            
            if let json = (try? NSJSONSerialization.JSONObjectWithData(data!, options: [])) as? [[String: AnyObject]] {
                var houses: [House] = []
                for entry in json {
                    houses += [
                        House(fromJSON: entry)
                    ]
                }
                
                return completion(houses)
            }
            
            return completion(nil)
        }
    }
    
    private func dataTask(path: String, completion: (NSData?, NSURLResponse?, NSError?) -> Void) {
        self.sharedSession.dataTaskWithURL(self.url, completionHandler: completion).resume()
    }
}