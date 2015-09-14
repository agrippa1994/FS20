//
//  FS20.swift
//  FS20
//
//  Created by Manuel Stampfl on 27.07.15.
//  Copyright (c) 2015 Mani. All rights reserved.
//

import Foundation

class FS20 {
    struct House {
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
    
    struct Device {
        //var house: House
        var id: Int
        var name: String
        var code: Int
        
        private init(fromJSON: [String: AnyObject]) {
            self.id = fromJSON.cast("id", def: 0)
            self.name = fromJSON.cast("name", def: "")
            self.code = fromJSON.cast("code", def: 0)
        }
    }
    
    var host: String
    var sharedSession: NSURLSession
    
    init(host: String) {
        self.host = host
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
        self.sharedSession.dataTaskWithURL(NSURL(scheme: "http", host: self.host, path: path)!, completionHandler: completion).resume()
    }
}