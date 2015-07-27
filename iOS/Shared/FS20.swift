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
    }
    
    struct Device {
        var house: House
        var id: Int
        var name: String
        var code: Int
    }
    
    var host: String
    var sharedSession: NSURLSession
    
    init(host: String) {
        self.host = host
        self.sharedSession = NSURLSession.sharedSession()
    }
    
    func houses(completion: [House]? -> Void) {
        self.dataTask("/house") { data, response, error in
            if data == nil || error != nil {
                return completion(nil)
            }
            
            if let json = NSJSONSerialization.JSONObjectWithData(data!, options: .allZeros, error: nil) as? [[String: AnyObject]] {
                var houses: [House] = []
                for entry in json {
                    houses += [
                        House(
                            id: entry.cast("id", def: 0),
                            name: entry.cast("name", def: ""),
                            code1: entry.cast("house_code_1", def: 1111),
                            code2: entry.cast("house_code_2", def: 1111)
                        )
                    ]
                }
                
                return completion(houses)
            }
            
            return completion(nil)
        }
    }
    
    func devicesForHouse(house: House, completion: [Device]? -> Void) {
        self.dataTask("/house/\(house.id)/device") { data, response, error in
            if data == nil || error != nil {
                return completion(nil)
            }
            
            if let json = NSJSONSerialization.JSONObjectWithData(data!, options: .allZeros, error: nil) as? [[String: AnyObject]] {
                var devices: [Device] = []
                for entry in json {
                    devices += [
                        Device(
                            house: house,
                            id: entry.cast("id", def: 0),
                            name: entry.cast("name", def: ""),
                            code: entry.cast("code", def: 0)
                        )
                    ]
                }
                
                return completion(devices)
            }
            
            return completion(nil)
        }
    }
    
    private func dataTask(path: String, completion: (NSData?, NSURLResponse?, NSError?) -> Void) {
        self.sharedSession.dataTaskWithURL(NSURL(scheme: "http", host: self.host, path: path)!, completionHandler: completion).resume()
    }
}